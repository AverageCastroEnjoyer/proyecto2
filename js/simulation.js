import { MMU } from "./mmu.js";
import { PAGE_SIZE, RAM_KB } from "./constants.js";

/*
Coordina y compara la ejecucion de ambos algoritmos (OPT y Selec.)
y los muestra en pantalla.
@step() avanza a la siguiente instruccion en ambos algoritmos.
@play() ejecuta steps cada 600ms
@pause() detiene el intervalo de ejecucion
@snapshot() toma una foto del estado actual de la simulacion.
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

/*Muestra y calcula los datos de la simulacion*/
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