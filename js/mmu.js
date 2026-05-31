import { PAGE_SIZE, RAM_FRAMES, HIT_TIME, FAULT_TIME } from "./constants.js";
import { Page, PointerRecord } from "./models.js";
import { pickVictim } from "./algorithms.js";

export class MMU {
  constructor(name, algorithm, operations) {
    this.name = name; this.algorithm = algorithm; this.operations = operations;
    this.ram = Array(RAM_FRAMES).fill(null);
    this.vram = new Map(); this.pointers = new Map(); this.pages = new Map();
    this.nextPtr = 1; this.nextPage = 1; this.clock = 0; this.thrashing = 0;
    this.internalWaste = 0; this.runningPids = new Set(); this.clockHand = 0;
  }

  execute(op, opIndex) {
    if (op.type === "new") return this.new(op.pid, op.size, opIndex);
    if (op.type === "use") return this.use(op.ptr, opIndex);
    if (op.type === "delete") return this.delete(op.ptr);
    if (op.type === "kill") return this.kill(op.pid);
  }

  /* - - - - - - - - - INICIALIZACION CARAC. PROCESO - - - - - - - - - - - */
  new(pid, sizeBytes, opIndex) {
    const ptr = this.nextPtr++, pageCount = Math.ceil(sizeBytes / PAGE_SIZE);
    const pages = []; this.runningPids.add(pid);
    this.internalWaste += pageCount * PAGE_SIZE - sizeBytes;

    for (let i = 0; i < pageCount; i++) {
      const page = new Page({ id: this.nextPage++, pid, ptr, sizeBytes, index: i });
      this.pages.set(page.id, page); pages.push(page.id);
      this.placeInRam(page, opIndex);
      this.clock += FAULT_TIME; this.thrashing += FAULT_TIME;
    }
    this.pointers.set(ptr, new PointerRecord(ptr, pid, sizeBytes, pages));
    return { ptr, event: "new", pages };
  }

  use(ptr, opIndex) {
    const rec = this.pointers.get(ptr); if (!rec) return { event: "invalid-use", ptr };
    for (const id of rec.pages) {
      const page = this.pages.get(id);
      if (page.inRam) this.clock += HIT_TIME;
      else { this.placeInRam(page, opIndex); this.clock += FAULT_TIME; this.thrashing += FAULT_TIME; }
      page.ref = 1; page.lastUsed = this.clock; page.freq++;
    }
    return { event: "use", ptr };
  }

  delete(ptr) {
    const rec = this.pointers.get(ptr); if (!rec) return { event: "invalid-delete", ptr };
    this.internalWaste -= rec.pages.length * PAGE_SIZE - rec.sizeBytes;
    for (const id of rec.pages) this.freePage(id);
    this.pointers.delete(ptr);
    return { event: "delete", ptr };
  }

  kill(pid) {
    for (const [ptr, rec] of [...this.pointers]) if (rec.pid === pid) this.delete(ptr);
    this.runningPids.delete(pid);
    return { event: "kill", pid };
  }

  placeInRam(page, opIndex) {
    let frame = this.ram.findIndex(x => x === null);
    if (frame === -1) {
      frame = pickVictim(this, opIndex);
      const victim = this.ram[frame]; victim.inRam = false; victim.frame = null;
      this.vram.set(victim.id, victim);
    }
    this.vram.delete(page.id); page.inRam = true; page.frame = frame; page.loadedAt = this.clock;
    this.ram[frame] = page;
  }

  freePage(id) {
    const page = this.pages.get(id); if (!page) return;
    if (page.inRam) this.ram[page.frame] = null;
    this.vram.delete(id); this.pages.delete(id);
  }

  snapshot() {
    return {
      ram: this.ram,
      pages: Array.from(this.pages.values()),
      metrics: {
        processes: this.runningPids.size,
        simTime: this.clock,
        ramKb: this.ram.filter(Boolean).length * 4,
        ramPct: this.ram.filter(Boolean).length,
        vramKb: this.vram.size * 4,
        vramPct: Math.round((this.vram.size * 4 / 400) * 100),
        pages: this.pages.size,
        thrashing: this.thrashing,
        thrashingPct: this.clock === 0 ? 0 : Math.round((this.thrashing / this.clock) * 100),
        fragmentation: this.internalWaste
      }
    };
  }
}