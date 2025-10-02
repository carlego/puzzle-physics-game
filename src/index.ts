import sceneData from "./components/Scene1.json";
import { SimulationFrame } from "./components/SimulationFrame";
import "./styles.css";

const simContainer = document.getElementById("simulation")!;
const sim = new SimulationFrame(simContainer, sceneData.toolbox);

// load static puzzle
sim.loadScene(sceneData);