import { MMU } from "./mmu.js";

export class Simulator {
  constructor(operations, selectedAlgorithm, render) {
    this.i = 0;
    this.ops = operations;
    this.render = render;
    this.timer = null;
    this.opt = new MMU("OPT", "OPT", operations);
    this.sel = new MMU(selectedAlgorithm, selectedAlgorithm, operations);
  }

  step() {
    if (this.i >= this.ops.length) {
      this.pause();
      return false;
    }

    const op = this.ops[this.i];
    this.opt.execute(op, this.i);
    this.sel.execute(op, this.i);
    this.i++;
    this.render(this.opt.snapshot(), this.sel.snapshot());
    return true;
  }

  play(ms = 600) {
    this.pause();
    this.timer = setInterval(() => this.step(), ms);
  }

  pause() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }

  reset(selectedAlgorithm) {
    this.pause();
    this.i = 0;
    this.opt = new MMU("OPT", "OPT", this.ops);
    this.sel = new MMU(selectedAlgorithm, selectedAlgorithm, this.ops);
    this.render(this.opt.snapshot(), this.sel.snapshot());
  }
}
