import React, { Component } from "react";

class Cajita extends Component {
  state = {
    titulo: this.props.titulo,
    contenido: this.props.contenido,
    color: this.props.color,
  };
  render() {
    return (
      <div className="card text-center w-100">
        <div
          className={
            "card-header " +
            this.state.color +
            " text-black  d-flex justify-content-between align-items-center"
          }
        >
          {this.state.titulo}
        </div>
        <div className="card-body shadow">{this.state.contenido}</div>
      </div>
    );
  }
}

export default Cajita;
