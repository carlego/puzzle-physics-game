import { Navbar } from "./components/Navbar";
import { Toolbox } from "./components/Toolbox";
import { SimulationFrame } from "./components/SimulationFrame";
import "./styles.css";

const navbarContainer = document.getElementById("navbar")!;
new Navbar(navbarContainer);

const simContainer = document.getElementById("simulation")!;
const sim = new SimulationFrame(simContainer);

const toolboxContainer = document.getElementById("toolbox")!;
new Toolbox(toolboxContainer, {
  onReset: () => sim.reset()
});
