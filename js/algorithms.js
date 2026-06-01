/*Ejecutador(?) de Algoritmos
| Selecciona una pagina para enviarla a VRAM, segun
| el algoritmo indicado. 
*/
export function pickVictim(mmu, opIndex) {
  const pages = mmu.ram;
  if (mmu.algorithm === "FIFO") return minIndex(pages, p => p.loadedAt);
  if (mmu.algorithm === "LRU") return minIndex(pages, p => p.lastUsed);
  if (mmu.algorithm === "LFU") return minIndex(pages, p => p.freq);
  if (mmu.algorithm === "SC") return secondChance(mmu);
  return optimal(mmu, opIndex);
}


/*Función auxiliar para encontrar el índice de la página con la menor puntuación según un criterio dado.
| @param {Array} arr: Un array de páginas en RAM.
| @param {function} score: devuelve el valor de una pag. para ser seleccionada como víctima.
| @return' {number} minIndex: índice de la pág. con la menor puntuación.
*/
const minIndex = (arr, score) => arr.reduce((best, p, i) => score(p) < score(arr[best]) ? i : best, 0);


/*Funcion dedicada al cakculo del algoritmo SecondChance
| Avanza clockwise por las pág. en RAM revisando el rbit (ref) de cada una.
| Si el rbit es 0, se selecciona esa página como víctima (música dramática).
| Si el rbit es 1, se le perdona la vida, se le pone a 0 y se sigue buscando.
| @param {MMU} mmu: contiene el estado actual de la RAM y las operaciones.
| @return {number}: índice de la pág. en RAM a ser reemplazada.
*/
function secondChance(mmu) {
  while (true) {
    const p = mmu.ram[mmu.clockHand];
    if (p.ref === 0) {
      const out = mmu.clockHand; 
      mmu.clockHand = (out + 1) % mmu.ram.length;
      return out;
    }
    p.ref = 0;
     mmu.clockHand = (mmu.clockHand + 1) % mmu.ram.length;
  }
}

/*Funcion dedicada al cakculo del algoritmo optimo
| Evalúa una página y cuál será la próxima vez que se utilizará. 
| No se usa? Se asigna 'Infinity' para ser seleccionada como víctima. 
| Si se usa? Se asigna valor negativo del índice de la próx. op. para priorizar las que se usarán más tarde.
| @metodo: findIndex() - busca la próx. op. que use la página actual (comparando el puntero de la página con el puntero de las operaciones). 
| @param {MMU} mmu: contiene el estado actual de la RAM y las operaciones.
| @param {number} opIndex: el índice de la operación actual en la lista de operaciones.
| @return {number}: el índice de la página en RAM que debe ser reemplazada según el algoritmo óptimo.
*/
function optimal(mmu, opIndex) {
  return minIndex(mmu.ram, page => {
    const next = mmu.operations.findIndex((op, i) => i > opIndex && op.type === "use" && op.ptr === page.ptr);
    return next === -1 ? Infinity : -next;
  });
}