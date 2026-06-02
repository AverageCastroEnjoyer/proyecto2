/*Función principal: seleccionar la página víctima según el algoritmo.
| Para FIFO usa el momento de carga.
| Para LRU usa la última vez que se usó.
| Para LFU usa la frecuencia de uso.
| @param {MMU} mmu: contiene el estado actual de la RAM y el algoritmo seleccionado.
| @param {number} opIndex: índice de la operación actual (solo se usa en Ooptimal)
| @return {number}: índice de la página en RAM a ser reemplazada.
*/
export function pickVictim(mmu, opIndex) {
  const pages = mmu.ram;
  if (mmu.algorithm === "FIFO") return minIndex(pages, p => p.loadedAt);
  if (mmu.algorithm === "LRU") return minIndex(pages, p => p.lastUsed);
  if (mmu.algorithm === "LFU") return minIndex(pages, p => p.freq);
  if (mmu.algorithm === "SC") return secondChance(mmu);
  return optimal(mmu, opIndex);
}


/*Función auxiliar para encontrar el í­ndice de la página con la menor puntuacion segun un criterio dado.
| @param {Array} arr: Un array de paginas en RAM.
| @param {function} score: devuelve el valor de una pag. para ser seleccionada como vi­ctima.
| @return' {number} minIndex: í­ndice de la pág. con la menor puntuación.
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
| Precalcula, en que indices futuros aparece cada use(ptr) al inicio en lugar de
| hacerlo sobre toda la lista cada vez que hay reemplazo de pagina.
| La victima es la pagina cuyo proximo uso esta mas lejos; si nunca se vuelve
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


/*Función auxiliar: la que precalcula los índices.
| Itera sobre las operaciones de la MMU y construye un mapa donde la clave
| es un puntero (ptr) y su valor es un array con los índices de las operaciones "use".
| También inicializa un cursor por puntero para la búsqueda de la página óptima.
| @param {MMU} mmu: contiene la lista de operaciones y los mapas donde se almacenarán
|                   los índices futuros y cursores para cada puntero.
| @return {void}: no retorna ningún valor, pero modifica la MMU agregando
|                 los mapas optFutureUses y optFutureUseCursor.
*/
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

/*Función auxiliar: la que busca el próximo (o último) índice a usar
| Avanza el cursor correspondiente hasta encontrar un índice mayor al actual (opIndex).
| Si no hay usos futuros del puntero, retorna Infinity pa' que lo maten de una.
| @param {MMU} mmu: con los mapas optFutureUses y optFutureUseCursor.
| @param {number} ptr: puntero de la pág. a buscar.
| @param {number} opIndex: operación actual.
| @return {number}: índice de la próxima operación para ese puntero ptr,
|                   o Infinity si no hay usos futuros.
*/
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

