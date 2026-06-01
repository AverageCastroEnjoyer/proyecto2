import { MMU } from "./mmu.js";
import { PAGE_SIZE, RAM_KB } from "./constants.js";

/* Coordina y compara la ejecucion de ambos algoritmos
| (OPT y Selec.) y los muestra en pantalla.
| @metodo: step() - avanza a la siguiente instruccion en ambos algoritmos.
| @metodo: play() - ejecuta steps cada 600ms
| @metodo: pause() - detiene el intervalo de ejecucion
| @metodo: snapshot() - toma una foto del estado actual de la simulacion.
*/
export class Simulator {
  constructor(operations, selectedAlgorithm, render) {
    this.i = 0; this.ops = operations; this.render = render; this.timer = null;
    this.opt = new MMU("OPT", "OPT", operations);
    this.sel = new MMU(selectedAlgorithm, selectedAlgorithm, operations);
  }

  step() {
    if (this.i >= this.ops.length) return this.pause();
    const op = this.ops[this.i];
    this.opt.execute(op, this.i); this.sel.execute(op, this.i);
    this.i++; this.render(this.snapshot());
  }

  play(ms = 600) { 
    this.pause(); 
    this.timer = setInterval(() => this.step(), ms);
  }

  pause() { 
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }

  snapshot() { 
    return { 
      index: this.i,  
      op: this.ops[this.i - 1], 
      opt: metrics(this.opt), 
      selected: metrics(this.sel) 
    };
  }
}

/*Muestra y calcula los datos de la simulacion
| @returns: Un objeto con las métricas actuales de la MMU, incluyendo:
| - ram: El estado actual de la RAM.
| - pointers: Los punteros de página actuales.
| - processes: La cantidad de procesos en ejecución.
| - clock: El reloj actual de la MMU.
| - ramKB: La cantidad de RAM utilizada en KB.
| - ramPct: El porcentaje de RAM utilizada.
| - vramKB: La cantidad de VRAM utilizada en KB.
| - vramPctOfRam: El porcentaje de VRAM utilizada respecto a la RAM total.
| - thrashing: La cantidad de eventos de thrashing ocurridos.
| - thrashingPct: El porcentaje de tiempo que la MMU ha estado en thrashing.
| - internalWasteKB: La cantidad de desperdicio interno en KB.  
| (Este comentario lo hizo la IA, yo solo le di Enter JAJAAJ)
*/
function metrics(mmu) {
  const ramPages = mmu.ram.filter(Boolean).length,
        vPages = mmu.vram.size;
  return {
    ram: mmu.ram,
    pointers: [...mmu.pointers.values()],
    processes: mmu.runningPids.size,
    clock: mmu.clock,
    ramKB: ramPages * 4,
    ramPct: ramPages,
    vramKB: vPages * 4,
    vramPctOfRam: ((vPages * 4) / RAM_KB) * 100,
    thrashing: mmu.thrashing,
    thrashingPct: mmu.clock ? (mmu.thrashing / mmu.clock) * 100 : 0,
    internalWasteKB: mmu.internalWaste / 1024
  };
}