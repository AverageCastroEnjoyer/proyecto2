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


/*Función auxiliar para encontrar el í­ndice de la página con la menor puntuaciÃ³n segÃºn un criterio dado.
| @param {Array} arr: Un array de pÃ¡ginas en RAM.
| @param {function} score: devuelve el valor de una pag. para ser seleccionada como vÃ­ctima.
| @return' {number} minIndex: Ã­ndice de la pÃ¡g. con la menor puntuaciÃ³n.
*/
const minIndex = (arr, score) => arr.reduce((best, p, i) => score(p) < score(arr[best]) ? i : best, 0);


/*Funcion dedicada al calculo del algoritmo SecondChance
| Avanza clockwise por las paginas en RAM revisando el rbit (ref) de cada una.
| Si el rbit es 0, se selecciona esa pagina como victima.
| Si el rbit es 1, se le pone a 0 y se sigue buscando.
| @param {MMU} mmu: contiene el estado actual de la RAM y las operaciones.
| @return {number}: indice de la pagina en RAM a ser reemplazada.
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
/*Funcion dedicada al calculo del algoritmo optimo
| Precalcula, una sola vez por MMU, en que indices futuros aparece cada use(ptr).
| Asi evita hacer findIndex sobre toda la lista cada vez que hay reemplazo de pagina.
| La victima optima es la pagina cuyo proximo uso esta mas lejos; si nunca se vuelve
| a usar, se selecciona inmediatamente.
| @param {MMU} mmu: contiene el estado actual de la RAM y las operaciones.
| @param {number} opIndex: indice de la operacion actual.
| @return {number}: indice de la pagina en RAM que debe reemplazarse.
*/
function optimal(mmu, opIndex) {
  ensureOptimalFutureUses(mmu);

  let victimIndex = 0;
  let farthestUse = -1;

  for (let i = 0; i < mmu.ram.length; i++) {
    const page = mmu.ram[i];
    const nextUse = nextUseOfPtr(mmu, page.ptr, opIndex);

    if (nextUse === Infinity) return i;

    if (nextUse > farthestUse) {
      farthestUse = nextUse;
      victimIndex = i;
    }
  }

  return victimIndex;
}

function ensureOptimalFutureUses(mmu) {
  if (mmu.optFutureUses) return;

  mmu.optFutureUses = new Map();
  mmu.optFutureUseCursor = new Map();

  for (let i = 0; i < mmu.operations.length; i++) {
    const op = mmu.operations[i];
    if (op.type !== "use") continue;

    if (!mmu.optFutureUses.has(op.ptr)) {
      mmu.optFutureUses.set(op.ptr, []);
      mmu.optFutureUseCursor.set(op.ptr, 0);
    }

    mmu.optFutureUses.get(op.ptr).push(i);
  }
}

function nextUseOfPtr(mmu, ptr, opIndex) {
  const uses = mmu.optFutureUses.get(ptr);
  if (!uses) return Infinity;

  let cursor = mmu.optFutureUseCursor.get(ptr) ?? 0;

  while (cursor < uses.length && uses[cursor] <= opIndex) {
    cursor++;
  }

  mmu.optFutureUseCursor.set(ptr, cursor);
  return cursor < uses.length ? uses[cursor] : Infinity;
}

