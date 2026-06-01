export function seededRandom(seed) {
  let x = [...String(seed)].reduce((a, c) => ((a << 5) - a + c.charCodeAt(0)) >>> 0, 2166136261);
  return () => ((x = (x * 1664525 + 1013904223) >>> 0) / 2 ** 32);
}

export function createSeed() {
  return `seed-${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
}

export function parseOperations(text) {
  return text
    .split(/\r?\n/)
    .map(line => line.replace(/\/\/.*$/, "").trim())
    .filter(Boolean)
    .map(line => {
      const m = line.match(/(?:^\d+\s*,?\s*)?(new|use|delete|kill)\s*\(([^)]*)\)/i);
      if (!m) throw new Error(`Instruccion invalida: ${line}`);

      const command = m[1].toLowerCase();
      const args = m[2].split(",").map(n => Number(n.trim()));

      if (command === "new") return { type: "new", pid: args[0], size: args[1] };
      if (command === "kill") return { type: "kill", pid: args[0] };
      return { type: command, ptr: args[0] };
    });
}

export function serializeOperations(operations) {
  return operations.map((op, index) => `${index + 1},${serializeOperation(op)}`).join("\n");
}

export function serializeOperation(op) {
  if (op.type === "new") return `new(${op.pid},${op.size})`;
  if (op.type === "kill") return `kill(${op.pid})`;
  return `${op.type}(${op.ptr})`;
}

export function generateOperations({ processCount, operationCount, seed }) {
  const p = Number(processCount);
  const n = Number(operationCount);

  if (!Number.isInteger(p) || p <= 0) throw new Error("P debe ser un entero positivo.");
  if (!Number.isInteger(n) || n < p) throw new Error("N debe ser mayor o igual a P para poder incluir kill(pid) por proceso.");

  const rng = seededRandom(seed);
  const processes = Array.from({ length: p }, (_, i) => ({
    pid: i + 1,
    ptrs: []
  }));

  const operations = [];
  let nextPtr = 1;
  const bodyLimit = n - p;

  for (let i = 0; i < bodyLimit; i++) {
    const proc = processes[randomInt(rng, 0, processes.length - 1)];
    const command = chooseCommand(rng, proc.ptrs.length);

    if (command === "new") {
      const size = randomSize(rng);
      operations.push({ type: "new", pid: proc.pid, size });
      proc.ptrs.push(nextPtr++);
      continue;
    }

    const ptr = proc.ptrs[randomInt(rng, 0, proc.ptrs.length - 1)];
    operations.push({ type: command, ptr });

    if (command === "delete") {
      proc.ptrs = proc.ptrs.filter(current => current !== ptr);
    }
  }

  const killOrder = shuffle([...processes], rng);
  for (const proc of killOrder) {
    operations.push({ type: "kill", pid: proc.pid });
  }

  return operations;
}

function chooseCommand(rng, ptrCount) {
  if (ptrCount === 0) return "new";

  const roll = rng();
  if (roll < 0.45) return "new";
  if (roll < 0.85) return "use";
  return "delete";
}

function randomSize(rng) {
  const options = [64, 128, 250, 500, 1000, 2048, 4096, 5320, 8192, 16384, 32768, 65536];
  return options[randomInt(rng, 0, options.length - 1)];
}

function randomInt(rng, min, max) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function shuffle(items, rng) {
  for (let i = items.length - 1; i > 0; i--) {
    const j = randomInt(rng, 0, i);
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}
