/*Generador de Semillas
| Toma una cadena de texto como semilla y devuelve
| una función que genera números aleatorios 
| reproducibles basados en esa semilla.
| @param {string} seed: La semilla para el generador de números aleatorios.
| @return {function}: Una función que genera números aleatorios entre 0 y 1.
*/
export function seededRandom(seed) {
  let x = [...String(seed)].reduce((a, c) => a + c.charCodeAt(0), 0) || 1;
  return () => ((x = (x * 1664525 + 1013904223) >>> 0) / 2 ** 32);
}


/* Parser de Operaciones
| Toma un bloque de texto con instrucciones de memoria y las convierte
| en un array de objetos de operación que pueden ser procesados por la MMU.
| @param {string} text: El texto que contiene las instrucciones, una por línea.
| @return {Array}: Un array de objetos de operación con tipo y argumentos.
*/
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