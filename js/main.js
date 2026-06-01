import { renderSimulation } from "../app.js";
import { Simulator } from "./simulation.js";

const DEFAULT_OPERATIONS = [
  { type: "new", pid: 1, size: 500 },
  { type: "new", pid: 1, size: 1000 },
  { type: "new", pid: 2, size: 5320 },
  { type: "use", ptr: 1 },
  { type: "use", ptr: 2 },
  { type: "use", ptr: 3 },
  { type: "new", pid: 3, size: 4200 },
  { type: "new", pid: 4, size: 4 },
  { type: "use", ptr: 4 },
  { type: "delete", ptr: 1 },
  { type: "kill", pid: 1 },
  { type: "kill", pid: 2 },
  { type: "kill", pid: 3 }
];

const algorithmSelector = document.getElementById("algoritmoSelector");
const playBtn = document.getElementById("playBtn");
const pauseBtn = document.getElementById("pauseBtn");
const stepBtn = document.getElementById("stepBtn");
const selectedPanelTitle = document.getElementById("selected-panel-title");

let simulator = null;

function selectedAlgorithm() {
  return algorithmSelector.value;
}

function updateSelectedTitle() {
  if (selectedPanelTitle) selectedPanelTitle.textContent = `MMU - ${selectedAlgorithm()}`;
}

function createSimulator() {
  updateSelectedTitle();
  simulator = new Simulator(DEFAULT_OPERATIONS, selectedAlgorithm(), renderSimulation);
  renderSimulation(simulator.opt.snapshot(), simulator.sel.snapshot());
  return simulator;
}

function getSimulator() {
  return simulator ?? createSimulator();
}

playBtn.addEventListener("click", () => {
  getSimulator().play();
});

pauseBtn.addEventListener("click", () => {
  getSimulator().pause();
});

stepBtn.addEventListener("click", () => {
  getSimulator().step();
});

algorithmSelector.addEventListener("change", () => {
  getSimulator().reset(selectedAlgorithm());
  updateSelectedTitle();
});

createSimulator();
