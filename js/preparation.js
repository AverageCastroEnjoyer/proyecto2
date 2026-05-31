export function seededRandom(seed) {
  let x = [...String(seed)].reduce((a, c) => a + c.charCodeAt(0), 0) || 1;
  return () => ((x = (x * 1664525 + 1013904223) >>> 0) / 2 ** 32);
}

export function parseOperations(text) {
  return text.split(/\r?\n/).map(x => x.trim()).filter(Boolean).map(line => {
    const m = line.match(/(?:^\d+\s*,?\s*)?(new|use|delete|kill)\s*\(([^)]*)\)/i);
    if (!m) throw new Error("Instrucción inválida: ${line}");
    
    const args = m[2].split(",").map(n => Number(n.trim()));
    return m[1] === "new" ? { type: "new", pid: args[0], size: args[1] }
      : m[1] === "kill" ? { type: "kill", pid: args[0] }
      : { type: m[1].toLowerCase(), ptr: args[0] };
  });
}