export class Page {
  constructor({ id, pid, ptr, sizeBytes, index }) {
    Object.assign(this, { id, pid, ptr, sizeBytes, index });
    this.frame = null;
    this.inRam = false;
    this.ref = 0;
    this.lastUsed = 0;
    this.freq = 0;
    this.loadedAt = 0;
  }
}

export class PointerRecord {
  constructor(ptr, pid, sizeBytes, pages) {
    Object.assign(this, { ptr, pid, sizeBytes, pages });
  }
}