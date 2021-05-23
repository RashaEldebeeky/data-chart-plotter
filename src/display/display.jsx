import React from 'react';
import './display.css';
import { DropTarget } from 'react-drag-drop-container';
import Chart from "react-apexcharts";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCog } from '@fortawesome/free-solid-svg-icons'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

export default class Display extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dimension: null,
      measures: [],
      drawChart: false,
      series: [],
      options: {},
      multipleYaxis: false,
      logarithmic: false,
      onChange: false,
      data: []
    };
  }

  dragged(e, functionType) {
    e.stopPropagation();
    if (functionType === 'measure') {
      var updatedMeasure = this.state.measures.concat(e.dragData);
      this.setState({ measures: updatedMeasure })
      if (this.state.dimension) {
        this.fetchData(this.state.dimension, updatedMeasure);
      }
    } else {
      if (this.state.dimension) {
        for (let col of document.querySelectorAll("#dimension .ddcontainer")) {
          col.style.visibility = "visible";
        }
      }
      this.setState({ dimension: e.dragData });
      if (this.state.measures.length > 0) {
        this.fetchData(e.dragData, this.state.measures);
      }
    }
    e.containerElem.style.visibility = "hidden";
  }

  clear(functionType) {
    this.setState({ drawChart: false })
    let selector = functionType === 'measure' ? "#measure .ddcontainer" : "#dimension .ddcontainer";
    var cols = document.querySelectorAll(selector);
    functionType === 'measure' ? this.setState({ measures: [] }) : this.setState({ dimension: null });
    for (let col of cols) {
      col.style.visibility = "visible";
    }
  }

  fetchData() {
    this.setState({ drawChart: false });
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        measures: this.state.measures.map((t) => t.name),
        dimension: this.state.dimension.name
      })
    };
    fetch('https://plotter-task.herokuapp.com/data', requestOptions)
      .then(res => res.json())
      .then(result => {
        this.setState({ data: result })
        this.configureChart(result, this.state.multipleYaxis, this.state.logarithmic)
      });
  }

  configureChart(data, multipleYaxis, logarithmic) {
    if (data.length > 0) {
      let series = [];
      let yAxis = [];
      let oppositeYaxis = false;
      for (var i = 1; i < data.length; i++) {
        series.push({
          name: data[i].name,
          data: data[i].values
        });
        if (multipleYaxis) {
          yAxis.push({
            opposite: oppositeYaxis,
            decimalsInFloat: 2,
            logarithmic: logarithmic,
            title: {
              text: data[i].name
            },
          })
          oppositeYaxis = !oppositeYaxis;
        } else {
          yAxis = {
            decimalsInFloat: 2,
            logarithmic: logarithmic,
            title: {
              text: data.length > 2 ? undefined: data[i].name
            },
          }
        }
      }
      this.setState({
        options: {
          chart: {
            id: "chart-id",
            foreColor: "#fff",
          },
          xaxis: {
            categories: data[0].values,
            labels: {
              hideOverlappingLabels: false,
              trim: true
            },
            title: {
              text: data[0].name,
            }
          },
          markers: {
            size: 2,
            hover: {
              size: 4,
            }
          },
          legend: {
            showForSingleSeries: true,
            position: "top",
          },
          yaxis: yAxis,
        },
        series: series,
        drawChart: true
      });
    }
  }
  render() {
    return (
      <div className="display">
        <div className="chart-input">
          <Row>
            <Col md={2}>
              <label>Dimension</label>
            </Col>
            <Col md={10}>
            <div className="input">
              <DropTarget targetKey="input" onHit={(e) => this.dragged(e, 'dimension')} >
                <div>
                  {
                    this.state.dimension && <div className="column display-input" key={this.state.dimension.name}>{this.state.dimension.name}</div>
                  }
                </div>
              </DropTarget>
              <button onClick={() => this.clear("dimension")}>Clear</button>
            </div>
            </Col>
          </Row>
        
          <Row>
            <Col md={2}>
              <label>Measure</label>
            </Col>
            <Col md={10}>
              <div className="input">
                <DropTarget targetKey="input" onHit={(e) => this.dragged(e, 'measure')} >
                  <div className="dropTarget">
                    {
                      this.state.measures.length > 0 &&

                      this.state.measures.map((measure) =>
                        <div className="column display-input" key={measure.name}>{measure.name}</div>
                      )

                    }
                  </div>
                </DropTarget>
                <button onClick={() => this.clear("measure")}>Clear</button>
              </div>
            </Col>
          </Row>
        </div>
        <div className="rightSidebar">
          <h5>Advanced Chart Options  <FontAwesomeIcon icon={faCog} /></h5>
          <div className="options">
            <Row>
              <Col md={8}><div>Multiple Y-axis</div></Col>
              <Col md={2}><label>
                <input type="checkbox" onChange={(e) => {
                  this.setState({ multipleYaxis: e.currentTarget.checked })
                  this.configureChart(this.state.data, e.currentTarget.checked, this.state.logarithmic)
                }}></input>
                <div className="slider"></div>
              </label>
              </Col>
            </Row>
            <Row>
              <Col md={8}><div>Logarithmic Scale </div></Col>
              <Col md={2}><label>
                <input type="checkbox" onChange={(e) => {
                  this.setState({ logarithmic: e.currentTarget.checked })
                  this.configureChart(this.state.data, this.state.multipleYaxis, e.currentTarget.checked)
                }}></input>
                <div className="slider"></div>
              </label>
              </Col>
            </Row>
          </div>
        </div>
        <div className="chart-container">
          {
            this.state.drawChart &&
            <div className="wrapper">
              <Chart
                options={this.state.options}
                series={this.state.series}
                width="100%"
                height="100%"
              />

            </div>
          }
        </div>
      </div>

    );
  }
}