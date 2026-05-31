/*Ejecutador(?) de Algoritmos
Selecciona una pagina para enviarla a VRAM, segun
el algoritmo indicado. 
*/
export function pickVictim(mmu, opIndex) {
  const pages = mmu.ram;
  if (mmu.algorithm === "FIFO") return minIndex(pages, p => p.loadedAt);
  if (mmu.algorithm === "LRU") return minIndex(pages, p => p.lastUsed);
  if (mmu.algorithm === "LFU") return minIndex(pages, p => p.freq);
  if (mmu.algorithm === "SC") return secondChance(mmu);
  return optimal(mmu, opIndex);
}

const minIndex = (arr, score) => arr.reduce((best, p, i) => score(p) < score(arr[best]) ? i : best, 0);

/*Funcion dedicada al cakculo del algoritmo
SecondChance 
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

/*Funcion dedicada al cakculo del algoritmo
optimo 
*/
function optimal(mmu, opIndex) {
  return minIndex(mmu.ram, page => {
    const next = mmu.operations.findIndex((op, i) => i > opIndex && op.type === "use" && op.ptr === page.ptr);
    return next === -1 ? Infinity : -next;
  });
}