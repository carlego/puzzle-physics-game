import { SimulationFrame } from "../components/SimulationFrame";

export function renderPuzzlePage(puzzleName: string) {
  const app = document.getElementById("app");
  if (!app) {
    throw new Error("App container not found"); 
  }

  // Clearing Page and setting up loading message
  console.log("Rendering puzzle page for:", puzzleName);
  const  loadingMessage = document.createElement("div");
  loadingMessage.innerHTML = "<h2>Loading Puzzle...</h2>";
  app.innerHTML = "";
  app.appendChild(loadingMessage);

  // Loading puzzle JSON and initializing puzzle containers
  const puzzleData = require(`../puzzles/${puzzleName}.json`);

  const simContainer = document.createElement("div");
  simContainer.id = "simulation-container";
  app.appendChild(simContainer)
  
  const simFrame = document.createElement("div");
  simFrame.id = "simulation-frame";
  simContainer.appendChild(simFrame);
  
  const sidePanel = document.createElement("div");
  sidePanel.id = "side-panel";
  simContainer.appendChild(sidePanel);

  const toolbox = document.createElement("div");
  toolbox.id = "toolbox";
  sidePanel.appendChild(toolbox);

  const resetButton = document.createElement("button");
  resetButton.id = "reset-btn";
  resetButton.textContent = "Reset Puzzle";

  sidePanel.appendChild(resetButton);

  const sim = new SimulationFrame({ container: simFrame, puzzleName, toolboxItems: puzzleData.toolbox, puzzleData});
  console.log("Loaded puzzle data:", puzzleData);

  // After loading, remove loading message and show puzzle title
  loadingMessage.remove();
  const header = document.createElement("h2");
  header.textContent = `Puzzle: ${puzzleName}`;
  app.insertBefore(header, simContainer);
}
