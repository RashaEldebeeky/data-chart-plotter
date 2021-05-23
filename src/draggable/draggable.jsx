import './draggable.css';
import React from 'react';
import { DragDropContainer } from 'react-drag-drop-container';


export default class Draggable extends React.Component {
  render() {
    return (

      <DragDropContainer
        targetKey={this.props.targetKey}
        dragData={this.props.column}
        key={this.props.key}
      >
        <div className="column">
          {this.props.column.name}
        </div>
      </DragDropContainer>

    );
  }
}