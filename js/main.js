import { renderSimulation } from "../app.js";
import { Simulator } from "./simulation.js";
import {
  createSeed,
  generateOperations,
  parseOperations,
  serializeOperations
} from "./preparation.js";

const algorithmSelector = document.getElementById("algoritmoSelector");
const processCountInput = document.getElementById("processCount");
const operationCountInput = document.getElementById("operationCount");
const seedInput = document.getElementById("seedInput");
const fileInput = document.getElementById("fileInput");
const generateBtn = document.getElementById("generateBtn");
const downloadBtn = document.getElementById("downloadBtn");
const scenarioStatus = document.getElementById("scenarioStatus");
const playBtn = document.getElementById("playBtn");
const pauseBtn = document.getElementById("pauseBtn");
const stepBtn = document.getElementById("stepBtn");
const selectedPanelTitle = document.getElementById("selected-panel-title");

let simulator = null;
let activeOperations = [];
let activeSeed = "";
let activeSource = "";

function selectedAlgorithm() {
  return algorithmSelector.value;
}

function updateSelectedTitle() {
  if (selectedPanelTitle) selectedPanelTitle.textContent = `MMU - ${selectedAlgorithm()}`;
}

function setStatus(message, isError = false) {
  scenarioStatus.textContent = message;
  scenarioStatus.classList.toggle("error", isError);
}

function setScenario(operations, seed, source) {
  activeOperations = operations;
  activeSeed = seed;
  activeSource = source;
  seedInput.value = seed;
  updateSelectedTitle();

  simulator?.pause();
  simulator = new Simulator(activeOperations, selectedAlgorithm(), renderSimulation);
  renderSimulation(simulator.opt.snapshot(), simulator.sel.snapshot());

  downloadBtn.disabled = activeOperations.length === 0;
  setStatus(`${source}: ${activeOperations.length} operaciones listas.`);
}

function generateScenario() {
  const seed = seedInput.value.trim() || createSeed();
  const operations = generateOperations({
    processCount: Number(processCountInput.value),
    operationCount: Number(operationCountInput.value),
    seed
  });

  setScenario(operations, seed, "Generado");
}

function ensureScenario() {
  if (activeOperations.length === 0) generateScenario();
  return simulator;
}

function downloadScenario() {
  ensureScenario();

  const blob = new Blob([serializeOperations(activeOperations)], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `operaciones-${activeSeed || activeSource || "simulacion"}.txt`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

async function loadScenarioFile(file) {
  if (!file) return;

  try {
    const text = await file.text();
    const operations = parseOperations(text);
    setScenario(operations, `archivo-${file.name}`, "Archivo cargado");
  } catch (error) {
    setStatus(error.message, true);
  }
}

generateBtn.addEventListener("click", () => {
  try {
    generateScenario();
  } catch (error) {
    setStatus(error.message, true);
  }
});

downloadBtn.addEventListener("click", downloadScenario);

fileInput.addEventListener("change", () => {
  loadScenarioFile(fileInput.files[0]);
});

processCountInput.addEventListener("change", () => {
  if (activeSource !== "Archivo cargado") generateScenario();
});

operationCountInput.addEventListener("change", () => {
  if (activeSource !== "Archivo cargado") generateScenario();
});

seedInput.addEventListener("change", () => {
  if (activeSource !== "Archivo cargado") generateScenario();
});

playBtn.addEventListener("click", () => {
  ensureScenario().play();
});

pauseBtn.addEventListener("click", () => {
  ensureScenario().pause();
});

stepBtn.addEventListener("click", () => {
  ensureScenario().step();
});

algorithmSelector.addEventListener("change", () => {
  updateSelectedTitle();
  ensureScenario().reset(selectedAlgorithm());
});

generateScenario();
