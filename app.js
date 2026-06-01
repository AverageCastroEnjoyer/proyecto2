/* Almacena clases CSS asignadas a procesos para visualización.
| @PROCESS_COLORS: configuración del mapeo de colores para los procesos
*/
const PROCESS_COLORS = [
  "p1", "p2", "p3", "p4", "p5", "p6", "p7", "p8"
];

/*Determinar de forma cíclica la clase de color  
 | a un proceso según su identificador único.
 | @param: 'pid' (un número entero que representa el ID del proceso).
 | @output: Una cadena de texto con el nombre de la clase CSS correspondiente.
 */
function processClass(pid) {
  return PROCESS_COLORS[(pid - 1) % PROCESS_COLORS.length];
}

/* Renderiza la barra de RAM en el DOM.
 | Dibuja un mapa visual de la memoria RAM, como una matriz de celdas.
 | @param {string} containerId: ID donde se insertará la representación de la RAM.
 | @param {array} ramFrames: frames de la RAM, cada elemento es pág. o null.
 | @output: No return, actualiza 'containerId' para mostrar el estado de la RAM.
 */
function renderRam(containerId, ramFrames) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";

  for (let i = 0; i < 100; i++) { //asume RAM fija a 100 frames
    const page = ramFrames[i];
    const cell = document.createElement("span");

    if (page) {
      cell.className = `page ${processClass(page.pid)}`;
      cell.title = `Frame ${i} | PID ${page.pid} | Page ${page.id} | PTR ${page.ptr}`;
    } else {
      cell.className = "page free";
      cell.title = `Frame ${i} libre`;
    }

    container.appendChild(cell);
  }
}

/* Crea las tablas HTML de la simulación con la info de la RAMy stuff.
| @param {number} bodyId: ID del elemento tbody donde se insertarán las filas.
| @param {object[]} pages: array de objetos que representan las páginas de memoria.
| @output: No retorna nada, solo actualiza el contenido del tbody
*/
function renderMmuTable(bodyId, pages) {
  const tbody = document.getElementById(bodyId);
  tbody.innerHTML = "";

  for (const page of pages) {
    const tr = document.createElement("tr");
    tr.className = `process-${processClass(page.pid)}`;

    tr.innerHTML = `
      <td>${page.id}</td>
      <td>${page.pid}</td>
      <td>${page.inRam ? "x" : ""}</td>
      <td>${page.ptr}</td>
      <td>${page.frame ?? ""}</td>
      <td>${page.inRam ? "" : page.diskAddress ?? ""}</td>
      <td>${page.loadedAt ?? ""}</td>
      <td>${page.mark ?? ""}</td>
    `;

    tbody.appendChild(tr);
  }
}

/* Renderiza las métricas de la simulación del algoritmo.
 | @param {string} containerId: ID del elemento donde se insertarán las métricas.
 | @param {object} metrics: objeto que contiene las métricas de la simulación.
 | @output: No retorna nada, solo actualiza el contenido del elemento con ID 'containerId'.
 */
function renderMetrics(containerId, metrics) {
  const container = document.getElementById(containerId);
  const thrashingDanger = metrics.thrashingPct > 50 ? "danger" : "";

  container.innerHTML = `
    <table>
      <tbody>
        <tr>
          <th>Processes</th>
          <th>Sim-Time</th>
        </tr>
        <tr>
          <td>${metrics.processes}</td>
          <td>${metrics.simTime}s</td>
        </tr>
      </tbody>
    </table>

    <table>
      <tbody>
        <tr>
          <th>RAM KB</th>
          <th>RAM %</th>
          <th>V-RAM KB</th>
          <th>V-RAM %</th>
        </tr>
        <tr>
          <td>${metrics.ramKb}</td>
          <td>${metrics.ramPct}%</td>
          <td>${metrics.vramKb}</td>
          <td>${metrics.vramPct}%</td>
        </tr>
      </tbody>
    </table>

    <table>
      <tbody>
        <tr>
          <th>Pages</th>
          <th>Thrashing</th>
          <th>Thrashing %</th>
          <th>Fragmentation</th>
        </tr>
        <tr>
          <td>${metrics.pages}</td>
          <td>${metrics.thrashing}s</td>
          <td class="${thrashingDanger}">${metrics.thrashingPct}%</td>
          <td>${metrics.fragmentation}B</td>
        </tr>
      </tbody>
    </table>
  `;
}

/* Coordina el redibujado en cada paso de la simulación.
 | Dibuja las dos memorias RAM, las páginas en la MMU y las métricas de cada algoritmo.
 | @param {object} optState: estado actual del algoritmo óptimo.
 | @param {object} algState: estado actual del algoritmo de reemplazo.
 | @output: No retorna nada, solo actualiza el DOM con la información de ambos estados.
 */
function renderSimulation(optState, algState) {
  renderRam("ram-opt", optState.ram);
  renderRam("ram-alg", algState.ram);

  renderMmuTable("mmu-opt-body", optState.pages);
  renderMmuTable("mmu-alg-body", algState.pages);

  renderMetrics("metrics-opt", optState.metrics);
  renderMetrics("metrics-alg", algState.metrics);
}