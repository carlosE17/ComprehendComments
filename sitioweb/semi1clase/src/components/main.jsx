import React, { Component } from "react";
import Cajita from "./cajita";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGraduationCap } from "@fortawesome/free-solid-svg-icons";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { CanvasJSChart } from "canvasjs-react-charts";

class Ventana extends Component {
  state = {
    texto: "",
    positivo: 1,
    negativo: 1,
    neutral: 1,
    mixto: 1,
    entidades: [
      { y: 100, label: "Juan" },
      { y: 50, label: "Carlos" },
    ],
    analizado: false,
  };
  url = "";
  render() {
    return (
      <div className="card text-center bg-light">
        <nav className="navbar navbar-expand-sm navbar-dark bg-dark fixed-top">
          <h4>
            <FontAwesomeIcon icon={faGraduationCap} color="white" />
            <a className="text-light p-2" href={this.url}>
              Analizador de Comentarios
            </a>
          </h4>
        </nav>

        <div className="card-body p-5">
          <div className="row">
            <div className="col-md-4"></div>
            <div className="col-md-4 p-3">
              <Cajita
                titulo="Sobre esta aplicacion web..."
                color="bg-info"
                contenido={this.listaDatos()}
              />
            </div>
            <div className="col-md-4"></div>
          </div>
          <div className="row p-5">
            <div className="col-md-2"></div>
            <div className="col-md-8">
              <Cajita
                titulo="Ingrese el texto a Analizar"
                color="bg-primary text-white"
                contenido={this.CajaTexto()}
              />
            </div>
            <div className="col-md-2"></div>
          </div>

          <button
            onClick={this.ejecutar}
            style={this.styles}
            className="btn btn-outline-primary btn-lg"
          >
            Analizar
          </button>
          <ToastContainer />

          <div className="row p-4">
            <div className="col-md-6">
              {this.state.analizado && (
                <CanvasJSChart
                  options={{
                    animationEnabled: true,
                    title: {
                      text: "Analisis de Comentarios",
                    },
                    subtitles: [
                      {
                        text: "Opiniones",
                        verticalAlign: "center",
                        fontSize: 24,
                        dockInsidePlotArea: true,
                      },
                    ],
                    data: [
                      {
                        type: "doughnut",
                        showInLegend: true,
                        indexLabel: "{name}: {y}",
                        yValueFormatString: "#,###'%'",
                        dataPoints: [
                          { name: "Positivos", y: this.state.positivo },
                          { name: "Negativos", y: this.state.negativo },
                          { name: "Neutros", y: this.state.neutral },
                          { name: "Mixtos", y: this.state.mixto },
                        ],
                      },
                    ],
                  }}
                />
              )}
            </div>

            <div className="col-md-6">
              {this.state.analizado && (
                <CanvasJSChart
                  options={{
                    animationEnabled: true,
                    theme: "light2",
                    title: {
                      text: "Estudiantes mas activos",
                    },
                    axisX: {
                      title: "Estudiantes",
                      reversed: true,
                    },
                    axisY: {
                      title: "Cantidad de comentarios",
                      includeZero: true,
                      labelFormatter: this.addSymbols,
                    },
                    data: [
                      {
                        type: "bar",
                        dataPoints: this.state.entidades,
                      },
                    ],
                  }}
                />
              )}{" "}
            </div>
          </div>

          <footer className="bg-light my-5 pt-5 text-muted text-center text-small">
            <p className="mb-1">
              &copy; Carlos Rodrigo Estrada Najarro - 201700314
            </p>
            <p>
              Universidad de San Carlos de Guatemala, Ingenieria en Ciencias y
              Sistemas
            </p>
            <p> Seminario de Sistemas 1, 2do Sem. 2020</p>
          </footer>
        </div>
      </div>
    );
  }

  ejecutar = () => {
    if (this.state.texto !== "") {
      this.setState({ analizado: true });
      let respuesta = toast.success("Analisis Realizado!");
      fetch(
        "https://8onzlcqg25.execute-api.us-east-2.amazonaws.com/test/analizar",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            texto: this.state.texto,
          }),
        }
      )
        .then((result) => result.json())
        .then((result) => {
          result = result.body;
          if (result.estado === "ok") {
            let repitencias = [];
            let filtrados = result.entidades.filter(
              (v) => v.Type === "PERSON" && v.Text.includes(" ")
            );
            filtrados.forEach((x) => {
              repitencias.push({
                y: filtrados.filter((obj) => obj.Text === x.Text).length,
                label: x.Text,
              });
            });
            repitencias = repitencias.reduce((unique, o) => {
              if (
                !unique.some(
                  (obj) => obj.label === o.label && obj.value === o.value
                )
              ) {
                unique.push(o);
              }
              return unique;
            }, []);

            this.setState({
              texto: "",
              positivo: result.positivo * 100,
              negativo: result.negativo * 100,
              neutral: result.neutral * 100,
              mixto: result.mixto * 100,
              entidades: repitencias
                .sort((a, b) => (a.y < b.y ? 1 : -1))
                .slice(0, 5),
            });
            this.scrollToBottom();
          } else {
            respuesta = toast.error(result.estado);
          }
        });

      return respuesta;
    } else {
      return toast.error("Ingrese el texto a procesar");
    }
  };

  scrollToBottom = () => {
    window.scroll({
      top: document.body.offsetHeight,
      left: 0,
      behavior: "smooth",
    });
  };

  handleChange = (event) => {
    this.setState({ texto: event.target.value });
  };

  listaDatos() {
    return (
      <ul className="text-left">
        <li className="text-success">
          La aplicacion esta optimizada para eliminar saltos de linea repetidos
        </li>
        <li className="text-success">
          Procure que el texto ingresado sea en espanol
        </li>
        <li className="text-warning">
          Procure que el texto ingresado sea en espanol
        </li>
        <li className="text-danger">
          La capa gratuita posee un limite de 5000 caracteres
        </li>
      </ul>
    );
  }

  CajaTexto() {
    return (
      <textarea
        href="Texto"
        className="form-control rounded shadow"
        rows="10"
        type="textarea"
        name="textValue"
        onChange={this.handleChange}
      />
    );
  }
}

export default Ventana;
