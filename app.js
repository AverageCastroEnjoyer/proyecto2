const PROCESS_COLORS = [
  "p1", "p2", "p3", "p4", "p5", "p6", "p7", "p8"
];

function processClass(pid) {
  return PROCESS_COLORS[(pid - 1) % PROCESS_COLORS.length];
}

function renderRam(containerId, ramFrames) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";

  for (let i = 0; i < 100; i++) {
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

function renderSimulation(optState, algState) {
  renderRam("ram-opt", optState.ram);
  renderRam("ram-alg", algState.ram);

  renderMmuTable("mmu-opt-body", optState.pages);
  renderMmuTable("mmu-alg-body", algState.pages);

  renderMetrics("metrics-opt", optState.metrics);
  renderMetrics("metrics-alg", algState.metrics);
}