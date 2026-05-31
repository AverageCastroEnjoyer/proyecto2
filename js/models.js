/*Pues es una pagina con informacion de
cosas de pagina, no muy complicado tampoco */
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

/*Como su nombre indica: registro de asignacion de
los punteros
@ptr: id del puntero
@pid: id del duenho
@sizedBytes: tamano de solicitud de memoria
@pages: paginas asignadas al proceso */
export class PointerRecord {
  constructor(ptr, pid, sizeBytes, pages) {
    Object.assign(this, { ptr, pid, sizeBytes, pages });
  }
}