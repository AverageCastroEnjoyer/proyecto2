import { MMU } from "./mmu.js";
import { renderSimulation } from "./app.js";

//ejemplo x para simulacion
const operations = [
  { type: "new", pid: 1, size: 500 },
  { type: "use", ptr: 1 },
  { type: "new", pid: 2, size: 1000 }
];

const optMmu = new MMU("OPT", "OPT", operations);
const algMmu = new MMU("LRU", "LRU", operations);

let currentOperation = 0;

function stepSimulation() {
  if (currentOperation >= operations.length) return;

  const operation = operations[currentOperation];

  optMmu.execute(operation, currentOperation);
  algMmu.execute(operation, currentOperation);

  renderSimulation(optMmu.snapshot(), algMmu.snapshot());

  currentOperation++;
}