// Funciones de Panel de Administrador e integración sin Base de Datos

// Función auxiliar para calcular el hash SHA-256 de un texto usando Web Crypto API
async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

// Sincroniza las banderas reales de imagen junto a los selectores en tiempo real
function synchronizeAdminSelectFlags() {
  const ids = [
    { select: 'admHome', flag: 'admHomeFlag', getter: getTeamFlag },
    { select: 'admAway', flag: 'admAwayFlag', getter: getTeamFlag },
    { select: 'admWinnerPassed', flag: 'admWinnerPassedFlag', getter: getTeamFlag },
    { select: 'admPlayer', flag: 'admPlayerFlag', getter: getPlayerFlag },
    { select: 'admPod1', flag: 'admPod1Flag', getter: getTeamFlag },
    { select: 'admPod2', flag: 'admPod2Flag', getter: getTeamFlag },
    { select: 'admPod3', flag: 'admPod3Flag', getter: getTeamFlag },
    { select: 'admPod4', flag: 'admPod4Flag', getter: getTeamFlag }
  ];

  ids.forEach(item => {
    const selEl = document.getElementById(item.select);
    const flagEl = document.getElementById(item.flag);
    if (selEl && flagEl) {
      flagEl.innerHTML = typeof item.getter === 'function' ? item.getter(selEl.value) : '';
    }
  });
}

// Abre el modal de administración rellenando los listados con información fresca
async function openAdmin() {
  // Protección por contraseña utilizando algoritmo criptográfico SHA-256
  // La contraseña en texto claro es "xurrut", su hash SHA-256 es "44a3c7b5ebf28b7cab1bddf7cf86010e1aaed556142e18c614656e5627329704"
  const pass = prompt('Introduce la contraseña de administrador para abrir el panel:');
  if (pass === null) return; // Canceló

  const hash = await sha256(pass);
  if (hash !== '44a3c7b5ebf28b7cab1bddf7cf86010e1aaed556142e18c614656e5627329704') {
    alert('Contraseña incorrecta.');
    return;
  }

  const modal = document.getElementById('adminModal');
  if (!modal) return;

  // Llenar selectores de selecciones
  const flatTeams = [];
  Object.values(teams).forEach(tList => flatTeams.push(...tList));
  flatTeams.sort();

  const homeSel = document.getElementById('admHome');
  const awaySel = document.getElementById('admAway');
  const winnerSel = document.getElementById('admWinnerPassed');
  const pod1 = document.getElementById('admPod1');
  const pod2 = document.getElementById('admPod2');
  const pod3 = document.getElementById('admPod3');
  const pod4 = document.getElementById('admPod4');

  [homeSel, awaySel, winnerSel, pod1, pod2, pod3, pod4].forEach(sel => {
    if (!sel) return;
    sel.innerHTML = '';
    
    // Agregar opción por defecto para winner
    if (sel === winnerSel) {
      const optDef = document.createElement('option');
      optDef.value = '';
      optDef.text = 'Seleccionar ganador...';
      sel.appendChild(optDef);
    }

    flatTeams.forEach(t => {
      const opt = document.createElement('option');
      opt.value = t;
      opt.text = t; // Texto plano limpio (sin abreviaciones de SO Windows 'DE/ES')
      sel.appendChild(opt);
    });
  });

  // Goleadores disponibles para el partido
  const flatPlayers = [];
  Object.values(players).forEach(pList => flatPlayers.push(...pList));
  flatPlayers.sort();

  const pSel = document.getElementById('admPlayer');
  if (pSel) {
    pSel.innerHTML = '';
    flatPlayers.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p;
      opt.text = p; // Texto plano limpio (sin abreviaciones de SO Windows)
      pSel.appendChild(opt);
    });
  }

  // Enlazar los eventos onchange para actualizar dinámicamente las banderas de imagen
  ['admHome', 'admAway', 'admWinnerPassed', 'admPlayer', 'admPod1', 'admPod2', 'admPod3', 'admPod4'].forEach(id => {
    const el = document.getElementById(id);
    if (el && !el.dataset.listenerAttached) {
      el.addEventListener('change', synchronizeAdminSelectFlags);
      el.dataset.listenerAttached = "true";
    }
  });

  // Inicializar posiciones de grupo
  onClassifGroupChange();

  // Rellenar podios actuales de previsualización
  if (currentActualResults.actual_podium) {
    if (pod1) pod1.value = currentActualResults.actual_podium.P1 || '';
    if (pod2) pod2.value = currentActualResults.actual_podium.P2 || '';
    if (pod3) pod3.value = currentActualResults.actual_podium.P3 || '';
    if (pod4) pod4.value = currentActualResults.actual_podium.P4 || '';
  }

  // Sincronizar indicadores visuales de banderas reales
  synchronizeAdminSelectFlags();

  modal.showModal();
}

function closeAdmin() {
  document.getElementById('adminModal').close();
}

// Control de campos dinámicos de eliminatorias
function onPhaseChange() {
  const phase = document.getElementById('admPhase').value;
  const grpBlock = document.getElementById('admGroup');
  if (phase === 'groups') {
    grpBlock.value = 'A';
    grpBlock.disabled = false;
  } else {
    grpBlock.value = 'null';
    grpBlock.disabled = true;
  }
}

// Activa campo de ganador de penaltis si es requerido
function onDecidedChange() {
  const isPen = document.getElementById('admDecided').value === 'penalties';
  const block = document.getElementById('admWinnerBlock');
  const home = document.getElementById('admHome').value;
  const away = document.getElementById('admAway').value;

  if (isPen) {
    block.classList.remove('hidden');
    const sel = document.getElementById('admWinnerPassed');
    sel.innerHTML = `
      <option value="${home}">${home}</option>
      <option value="${away}">${away}</option>
    `;
  } else {
    block.classList.add('hidden');
  }
  
  // Sincronizar banderas
  synchronizeAdminSelectFlags();
}

// Listado temporal de goleadores agregados al partido en curso
let tempMatchScorers = [];

function addScorerToMatch() {
  const player = document.getElementById('admPlayer').value;
  const home = document.getElementById('admHome').value;
  const away = document.getElementById('admAway').value;
  
  // Preguntar de qué equipo procede el gol
  const teamSource = getTeamGroup(home) ? home : (getTeamGroup(away) ? away : home);

  tempMatchScorers.push(`${teamSource}:${player}`);
  renderTempScorers();
}

function removeTempScorer(idx) {
  tempMatchScorers.splice(idx, 1);
  renderTempScorers();
}

function renderTempScorers() {
  const container = document.getElementById('admMatchScorersList');
  if (!container) return;

  container.innerHTML = '';
  tempMatchScorers.forEach((sc, idx) => {
    const parts = sc.split(':');
    const flag = typeof getPlayerFlag === 'function' ? getPlayerFlag(parts[1]) : '';
    container.innerHTML += `
      <span class="badge badge-rose text-white text-[10px] gap-1 font-bold pl-2 pr-1.5 py-2">
        <span>${flag} ${parts[1]} (${parts[0]})</span>
        <button onclick="removeTempScorer(${idx})" class="hover:text-black font-extrabold focus:outline-none ml-1">✕</button>
      </span>
    `;
  });
}

// Guarda un partido en el estado volante de previsualización
function saveMatchAdmin() {
  const home = document.getElementById('admHome').value;
  const away = document.getElementById('admAway').value;
  const phase = document.getElementById('admPhase').value;
  const grp = document.getElementById('admGroup').value === 'null' ? null : document.getElementById('admGroup').value;
  const sh = parseInt(document.getElementById('admScoreHome').value) || 0;
  const sa = parseInt(document.getElementById('admScoreAway').value) || 0;
  const decided = document.getElementById('admDecided').value;
  const winner = decided === 'penalties' ? document.getElementById('admWinnerPassed').value : null;

  const newMatch = {
    id: `custom_${Date.now()}`,
    phase: phase,
    group: grp,
    team_home: home,
    team_away: away,
    score_home: sh,
    score_away: sa,
    status: "finished",
    decided_by: decided,
    winner_passed: winner,
    scorers: [...tempMatchScorers]
  };

  currentMatches.push(newMatch);
  
  // Limpiar campos
  tempMatchScorers = [];
  renderTempScorers();
  alert(`Partido ${home} vs ${away} guardado en el buffer temporal.`);
}

// Administrar clasificaciones reales de la fase de grupos
function onClassifGroupChange() {
  const grp = document.getElementById('admClassifGroup').value;
  const listContainer = document.getElementById('admClassifList');
  if (!listContainer) return;

  listContainer.innerHTML = '';

  const activeTeams = teams[grp] || [];
  const realOrder = currentActualResults.actual_positions[grp] || [...activeTeams];

  realOrder.forEach((t, idx) => {
    const flagImg = typeof getTeamFlag === 'function' ? getTeamFlag(t) : '';
    listContainer.innerHTML += `
      <div class="flex items-center gap-1.5 py-0.5">
        <span class="text-slate-400 font-bold w-4">${idx + 1}.º</span>
        <span class="shrink-0 w-6 flex justify-center">${flagImg}</span>
        <select data-idx="${idx}" class="select select-bordered select-xs w-full bg-slate-900 mx-1 border-slate-800" onchange="updateClassifOrder('${grp}')">
          ${realOrder.map(oth => {
            const optFlag = typeof getTeamFlagEmoji === 'function' ? getTeamFlagEmoji(oth) : '';
            return `<option value="${oth}" ${oth === t ? 'selected' : ''}>${optFlag} ${oth}</option>`;
          }).join('')}
        </select>
      </div>
    `;
  });
}

function updateClassifOrder(grp) {
  const listContainer = document.getElementById('admClassifList');
  const selects = listContainer.getElementsByTagName('select');
  const newOrder = [];

  Array.from(selects).forEach(sel => {
    newOrder.push(sel.value);
  });

  currentActualResults.actual_positions[grp] = newOrder;
  
  // Re-renderizar la clasificación para que las banderas de imágenes junto a los puestos se actualicen al vuelo
  onClassifGroupChange();
}

// Aplica todos los cálculos locales y recarga el dashboard al instante como previsualización
function applyPrevisualization() {
  // Sincronizar podio
  currentActualResults.actual_podium = {
    P1: document.getElementById('admPod1').value,
    P2: document.getElementById('admPod2').value,
    P3: document.getElementById('admPod3').value,
    P4: document.getElementById('admPod4').value
  };

  // Recalcular goleadores basado en los partidos temporales
  const newScRep = {};
  currentMatches.forEach(m => {
    if (m.status === 'finished' && m.scorers) {
      m.scorers.forEach(scSpec => {
        const parts = scSpec.split(':');
        if (parts.length === 2) {
          const playerName = parts[1].trim();
          newScRep[playerName] = (newScRep[playerName] || 0) + 1;
        }
      });
    }
  });

  let maxGoals = 0;
  for (const gls of Object.values(newScRep)) {
    if (gls > maxGoals) maxGoals = gls;
  }

  // Sincronizar tabla de goleadores
  scorers.max_goals = maxGoals;
  scorers.players = newScRep;

  // Calcular Pichichis reales
  const pichichis = [];
  Object.entries(newScRep).forEach(([pName, gls]) => {
    if (gls === maxGoals && maxGoals > 0) pichichis.push(pName);
  });
  currentActualResults.actual_pichichi = pichichis;

  // Inyectar datos volantes
  matches = currentMatches;
  actualResults = currentActualResults;

  // Recalcular puntuaciones virtuales de los participantes
  computeScores();
  renderLeaderboard();
  renderMatches();
  renderScorers();

  closeAdmin();
  alert('Se ha aplicado la previsualización de datos en el cliente. Para consolidarlos de forma definitiva, descargue los JSON y subalos a su repositorio.');
}

// Permite descargar los archivos actualizados listos para subir a GitHub
function exportDataFile(type) {
  let fileContent = '';
  let filename = '';

  if (type === 'matches') {
    fileContent = JSON.stringify(currentMatches, null, 2);
    filename = 'matches.json';
  } else if (type === 'actual_results') {
    fileContent = JSON.stringify(currentActualResults, null, 2);
    filename = 'actual_results.json';
  }

  const blob = new Blob([fileContent], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
