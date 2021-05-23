import './sidebar.css';
import React from 'react';
import Draggable from '../draggable/draggable';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChartLine } from '@fortawesome/free-solid-svg-icons'

export default class Sidebar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      columns: [],
      columnsMeasure: [],
      columnsDimension: [],
      open1: false,
      open2: false
    };
  }

  componentDidMount() {
    fetch(`https://plotter-task.herokuapp.com/columns`)
      .then(res => res.json())
      .then(result => {
        this.setState({
          columnsMeasure: result.filter(col => col.function === 'measure'),
          columnsDimension: result.filter(col => col.function === 'dimension')
        });
      });

  }
  toggle() {
    let open = this.state.open1;
    this.setState({ open1: !open });
  }

  render() {
    return (
      <div className="leftSidebar">
        <h4>Columns   <FontAwesomeIcon icon={faChartLine} /></h4>

        <h5>Dimensions</h5>
        <div id="dimension">
          { 
            this.state.columnsDimension.map((col) =>
              <Draggable targetKey="dimensionInput" column={col} key={col.name + col.function} />
            )
          }
        </div>
        <h5>Measures</h5>
        <div id="measure">
          {
            this.state.columnsMeasure.map((col) =>
              <Draggable targetKey="measuresInput" column={col} key={col.name + col.function} />
            )
          }
        </div>
      </div>
    );
  }
}