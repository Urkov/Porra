// Variables globales para contener el estado de la porra
let rules = {};
let teams = {};
let players = {};
let participants = [];
let matches = [];
let scorers = {};
let actualResults = {};

// Almacena variables filtradas o simuladas por previsualización de admin
let currentMatches = [];
let currentActualResults = [];

// Inicialización de la pantalla al cargar la página
document.addEventListener('DOMContentLoaded', async () => {
  await loadDatabase();
  computeScores();
  renderLeaderboard();
  renderMatches();
  renderScorers();
});

// Desplazamiento dinámico suave
function scrollToSection(id) {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
}

// Carga simultánea de todas las fuentes de datos estáticas
async function loadDatabase() {
  try {
    const [rulesRes, teamsRes, playersRes, participantsRes, matchesRes, scorersRes, actualResultsRes] = await Promise.all([
      fetch('data/rules.json').then(r => r.json()),
      fetch('data/teams.json').then(r => r.json()),
      fetch('data/players.json').then(r => r.json()),
      fetch('data/participants.json').then(r => r.json()),
      fetch('data/matches.json').then(r => r.json()),
      fetch('data/scorers.json').then(r => r.json()),
      fetch('data/actual_results.json').then(r => r.json())
    ]);

    rules = rulesRes;
    teams = teamsRes;
    players = playersRes;
    participants = participantsRes;
    matches = matchesRes;
    scorers = scorersRes;
    actualResults = actualResultsRes;

    // Inicializar previsualización local
    currentMatches = JSON.parse(JSON.stringify(matches));
    currentActualResults = JSON.parse(JSON.stringify(actualResults));
  } catch (error) {
    console.error('Error cargando los ficheros JSON estáticos de la porra:', error);
  }
}

// Retorna el ID de grupo al que pertenece una selección
function getTeamGroup(team) {
  for (const [groupName, teamList] of Object.entries(teams)) {
    if (teamList.includes(team)) return groupName;
  }
  return null;
}

// ALGORITMO INTEGRAL DEL MOTOR DE CÁLCULO DE LA PORRA
function computeScores() {
  participants.forEach(participant => {
    let scoreGoles = 0;
    let scoreMatches = 0;
    let scoreGroups = 0;
    let scoreExact = 0;
    let scoreRounds = 0;
    let scorePodium = 0;
    let scorePichichi = 0;

    // 1. CÁLCULO DE GOLES (2 PUNTOS POR GOL INDEPENDIENTEMENTE DE GRUPO)
    // Se recorre cada uno de sus 6 jugadores elegidos
    const participantPlayers = Object.values(participant.scorers);
    participantPlayers.forEach(pName => {
      if (scorers.players && scorers.players[pName]) {
        scoreGoles += scorers.players[pName] * rules.points.goal_pts;
      }
    });

    // 2. EXTRA POR PICHICHI (+6 PUNTOS)
    // El Pichichi del mundial real se encuentra en actualResults.actual_pichichi (puede haber varios compartidos)
    if (currentActualResults.actual_pichichi) {
      const hitPichichi = participantPlayers.some(pName => currentActualResults.actual_pichichi.includes(pName));
      if (hitPichichi) {
        scorePichichi = rules.points.pichichi_bonus;
      }
    }

    // 3. CÁLCULO POR PARTIDO DE TUS SELECCIONES ELEGIDAS
    // Los equipos seleccionados de cada grupo se encuentran en participant.predictions
    // Un participante elige 3 selecciones de cada grupo. Almacenamos todos sus equipos en un Set veloz.
    const chosenTeams = new Set();
    Object.values(participant.predictions).forEach(tList => {
      tList.forEach(t => chosenTeams.add(t));
    });

    // Registra qué equipos han participado en qué rondas para evitar duplicar pases
    const roundsPassedByTeamsByPhase = {};

    currentMatches.forEach(match => {
      if (match.status !== 'finished') return;

      const isHomeChosen = chosenTeams.has(match.team_home);
      const isAwayChosen = chosenTeams.has(match.team_away);

      if (!isHomeChosen && !isAwayChosen) return;

      // Calcular puntos por marcador/resultado del partido
      // Si el partido terminó en tanda de penaltis se considera técnicamente un empate para ambos selecciones
      const isDraw = match.decided_by === 'penalties' || match.score_home === match.score_away;
      const isWinHome = !isDraw && (match.score_home > match.score_away);
      const isWinAway = !isDraw && (match.score_away > match.score_home);

      // Evaluar Home si fue elegido
      if (isHomeChosen) {
        const gp = getTeamGroup(match.team_home);
        if (isDraw) {
          let pts = rules.points.draw_base;
          if (gp === 'C' || gp === 'D') pts += rules.points.group_cd_extra.draw;
          if (gp === 'E' || gp === 'F') pts += rules.points.group_ef_extra.draw;
          scoreMatches += pts;
        } else if (isWinHome) {
          let pts = rules.points.win_base;
          if (gp === 'C' || gp === 'D') pts += rules.points.group_cd_extra.win;
          if (gp === 'E' || gp === 'F') pts += rules.points.group_ef_extra.win;
          scoreMatches += pts;
        }
      }

      // Evaluar Away si fue elegido
      if (isAwayChosen) {
        const gp = getTeamGroup(match.team_away);
        if (isDraw) {
          let pts = rules.points.draw_base;
          if (gp === 'C' || gp === 'D') pts += rules.points.group_cd_extra.draw;
          if (gp === 'E' || gp === 'F') pts += rules.points.group_ef_extra.draw;
          scoreMatches += pts;
        } else if (isWinAway) {
          let pts = rules.points.win_base;
          if (gp === 'C' || gp === 'D') pts += rules.points.group_cd_extra.win;
          if (gp === 'E' || gp === 'F') pts += rules.points.group_ef_extra.win;
          scoreMatches += pts;
        }
      }

      // Evaluar si es ronda de eliminatoria y hay clasificado
      if (match.phase !== 'groups') {
        const winner = match.decided_by === 'penalties' ? match.winner_passed : (match.score_home > match.score_away ? match.team_home : match.team_away);
        
        if (winner && chosenTeams.has(winner)) {
          if (!roundsPassedByTeamsByPhase[match.phase]) {
            roundsPassedByTeamsByPhase[match.phase] = new Set();
          }

          if (!roundsPassedByTeamsByPhase[match.phase].has(winner)) {
            roundsPassedByTeamsByPhase[match.phase].add(winner);

            // Sumamos puntos de ronda clasificados
            const gp = getTeamGroup(winner);
            let pts = rules.points.round_passed_base;
            if (gp === 'C' || gp === 'D') pts += rules.points.group_cd_extra.round_passed;
            if (gp === 'E' || gp === 'F') pts += rules.points.group_ef_extra.round_passed;
            scoreRounds += pts;
          }
        }
      }
    });

    // 4. CLASIFICACIÓN FASE DE GRUPOS (10, 6, 2 PTS SEGÚN POSICIÓN REAL)
    // El orden de cada grupo real en la tabla está en currentActualResults.actual_positions
    Object.entries(participant.predictions).forEach(([grpName, predictedList]) => {
      const realOrder = currentActualResults.actual_positions[grpName] || [];

      // Evaluación del puesto de grupo de los 3 elegidos
      predictedList.forEach((team_pred, index) => {
        const realIdx = realOrder.indexOf(team_pred);
        if (realIdx !== -1) {
          const realPosNumber = realIdx + 1;
          
          // Clasificación fase de grupos
          if (realPosNumber === 1) scoreGroups += rules.points.group_position["1"];
          else if (realPosNumber === 2) scoreGroups += rules.points.group_position["2"];
          else if (realPosNumber === 3) scoreGroups += rules.points.group_position["3"];

          // Coincidencia exacta de posición de predicción (primer equipo de tu porra queda 1ro, segundo queda 2do, etc.)
          const predIndexNumber = index + 1;
          if (predIndexNumber === realPosNumber) {
            if (realPosNumber === 1) scoreExact += rules.points.prediction_match["1"];
            else if (realPosNumber === 2) scoreExact += rules.points.prediction_match["2"];
            else if (realPosNumber === 3) scoreExact += rules.points.prediction_match["3"];
          }
        }
      });
    });

    // 5. CLASIFICACIÓN DEL PODIO FINAL (CAMP, SUBC, 3º, 4º)
    if (participant.podium && currentActualResults.actual_podium) {
      if (participant.podium.P1 === currentActualResults.actual_podium.P1) scorePodium += rules.points.final_classification.P1;
      if (participant.podium.P2 === currentActualResults.actual_podium.P2) scorePodium += rules.points.final_classification.P2;
      if (participant.podium.P3 === currentActualResults.actual_podium.P3) scorePodium += rules.points.final_classification.P3;
      if (participant.podium.P4 === currentActualResults.actual_podium.P4) scorePodium += rules.points.final_classification.P4;
    }

    // Total de puntos para este participante
    participant.score_details = {
      scorers: scoreGoles,
      matches: scoreMatches,
      groups: scoreGroups,
      exact: scoreExact,
      rounds: scoreRounds,
      podium: scorePodium,
      pichichi: scorePichichi,
      total: scoreGoles + scoreMatches + scoreGroups + scoreExact + scoreRounds + scorePodium + scorePichichi
    };
  });
}

// RENDER DE LA TABLA GENERAL DE PARTICIPANTES (LEADERBOARD)
function renderLeaderboard() {
  const tbody = document.getElementById('leaderboardBody');
  if (!tbody) return;

  // Ordenar participantes por puntos de mayor a menor
  const sorted = [...participants].sort((a, b) => b.score_details.total - a.score_details.total);

  tbody.innerHTML = '';
  
  sorted.forEach((participant, idx) => {
    const isFirst = idx === 0;
    const isSecond = idx === 1;
    const isThird = idx === 2;
    const isLast = idx === sorted.length - 1;

    let badgeClass = "bg-slate-800 text-slate-300";
    let icon = `${idx + 1}`;
    let highlightClass = "";

    if (isFirst) {
      badgeClass = "bg-amber-500 text-slate-950 font-black";
      icon = "🥇";
      highlightClass = "border-l-4 border-amber-500 bg-amber-500/5";
    } else if (isSecond) {
      badgeClass = "bg-slate-300 text-slate-950 font-black";
      icon = "🥈";
      highlightClass = "border-l-4 border-slate-300 bg-slate-100/5";
    } else if (isThird) {
      badgeClass = "bg-amber-700 text-slate-50 font-black";
      icon = "🥉";
      highlightClass = "border-l-4 border-amber-700 bg-amber-950/5";
    } else if (isLast) {
      badgeClass = "bg-red-500 text-slate-950 font-bold";
      icon = "💀";
      highlightClass = "bg-rose-950/5 border-l-4 border-rose-500";
    }

    const tr = document.createElement('tr');
    tr.className = `hover:bg-slate-900 border-b border-slate-900/60 cursor-pointer transition ${highlightClass}`;
    tr.onclick = () => showParticipantDetail(participant.id);
    
    tr.innerHTML = `
      <td class="text-center font-bold text-sm w-16">
        <span class="badge ${badgeClass} badge-sm md:badge-md p-2">${icon}</span>
      </td>
      <td class="font-bold text-white text-sm md:text-base">
        ${participant.name} ${isLast ? '<span class="text-[10px] text-rose-500 block font-normal">Sótano (10% premio)</span>' : ''}
        ${isFirst ? '<span class="text-[10px] text-amber-400 block font-normal">Líder Provisional (50% premio)</span>' : ''}
      </td>
      <td class="text-center text-xs text-slate-300 font-medium">${participant.score_details.scorers} pts</td>
      <td class="text-center text-xs text-slate-300 font-medium">${participant.score_details.matches} pts</td>
      <td class="text-center text-xs text-slate-300 font-medium">${participant.score_details.groups} pts</td>
      <td class="text-center text-xs text-slate-300 font-medium">${participant.score_details.podium} pts</td>
      <td class="bg-rose-950/20 text-rose-300 text-center font-black text-sm md:text-lg rounded-r-xl">${participant.score_details.total}</td>
    `;
    tbody.appendChild(tr);
  });
}

// Búsqueda de participantes
function filterLeaderboard() {
  const query = document.getElementById('leaderboardSearch').value.toLowerCase();
  const rows = document.getElementById('leaderboardBody').getElementsByTagName('tr');

  Array.from(rows).forEach(row => {
    const text = row.innerText.toLowerCase();
    row.style.display = text.includes(query) ? '' : 'none';
  });
}

// DETALLES FLOTANTES (MODAL) TIPO PLANILLA ORIGINAL
function showParticipantDetail(id) {
  const p = participants.find(item => item.id === id);
  if (!p) return;

  document.getElementById('modalPartName').innerText = p.name;
  document.getElementById('modalPartRank').innerText = `${p.score_details.total} pts`;

  // Desglose
  document.getElementById('modalBreakdownScorers').innerText = `${p.score_details.scorers} pts`;
  document.getElementById('modalBreakdownMatches').innerText = `${p.score_details.matches} pts`;
  document.getElementById('modalBreakdownGroups').innerText = `${p.score_details.groups} pts`;
  document.getElementById('modalBreakdownExact').innerText = `${p.score_details.exact} pts`;
  document.getElementById('modalBreakdownRounds').innerText = `${p.score_details.rounds} pts`;
  document.getElementById('modalBreakdownPodium').innerText = `${p.score_details.podium} pts`;
  document.getElementById('modalBreakdownPichichi').innerText = `${p.score_details.pichichi} pts`;
  document.getElementById('modalBreakdownTotal').innerText = `${p.score_details.total} pts`;

  // Goleadores elegidos
  const gList = document.getElementById('modalGoleadoresList');
  gList.innerHTML = '';
  Object.entries(p.scorers).forEach(([jGrp, playerSelected]) => {
    const playerGoals = scorers.players && scorers.players[playerSelected] || 0;
    const isPichichiVal = currentActualResults.actual_pichichi && currentActualResults.actual_pichichi.includes(playerSelected);
    gList.innerHTML += `
      <div class="flex justify-between items-center bg-slate-900 px-3 py-1.5 rounded border border-slate-800">
        <span class="text-slate-400 font-bold">${jGrp}:</span>
        <span class="text-white ml-2 flex-1">${playerSelected}</span>
        <span class="badge ${playerGoals > 0 ? 'badge-rose' : 'bg-slate-800'} text-xs font-bold">${playerGoals} ⚽</span>
        ${isPichichiVal ? '<span class="badge badge-warning text-slate-950 font-extrabold text-[9px] ml-1">PICHICHI</span>' : ''}
      </div>
    `;
  });

  // Los 6 grupos de de selecciones en la maqueta
  const groupsContainer = document.getElementById('modalGroupsContainer');
  groupsContainer.innerHTML = '';

  Object.entries(p.predictions).forEach(([grpName, teamList]) => {
    const realOrder = currentActualResults.actual_positions[grpName] || [];
    
    let htmlGroup = `
      <div class="bg-slate-950 p-3 rounded-lg border border-slate-850 space-y-2">
        <h5 class="text-white text-xs font-black uppercase tracking-widest border-b border-rose-500/20 pb-1">Grupo ${grpName}</h5>
        <div class="space-y-1 text-[11px]">
    `;

    teamList.forEach((teamName, index) => {
      // Determinar si el equipo ya tiene posición real en fase de grupos
      const posRealIndex = realOrder.indexOf(teamName);
      let statusIndicator = '';
      let textClass = 'text-slate-300';

      if (posRealIndex !== -1) {
        const realPosNumber = posRealIndex + 1;
        const predPosNumber = index + 1;

        if (realPosNumber === predPosNumber) {
          statusIndicator = `<span class="badge badge-success text-slate-950 font-bold text-[9px]">Acierto Posición</span>`;
          textClass = 'text-emerald-400 font-black';
        } else if (realPosNumber <= 3) {
          statusIndicator = `<span class="badge badge-warning text-slate-950 font-bold text-[9px]">Pasa (puesto ${realPosNumber})</span>`;
          textClass = 'text-amber-400 font-semibold';
        } else {
          statusIndicator = `<span class="badge badge-error text-slate-950 font-bold text-[9px]">Eliminado</span>`;
          textClass = 'text-slate-500 line-through';
        }
      }

      htmlGroup += `
        <div class="flex flex-col gap-0.5 justify-between py-1 bg-slate-900/40 px-2 rounded border border-slate-900">
          <div class="flex justify-between items-center">
            <span class="${textClass}">${index + 1}.º ${teamName}</span>
          </div>
          ${statusIndicator ? `<div class="text-right mt-0.5">${statusIndicator}</div>` : ''}
        </div>
      `;
    });

    htmlGroup += `</div></div>`;
    groupsContainer.innerHTML += htmlGroup;
  });

  // Podium
  const podiumList = document.getElementById('modalPodiumList');
  podiumList.innerHTML = '';
  const orderList = ["P1", "P2", "P3", "P4"];
  const titles = { P1: "🥇 1.º", P2: "🥈 2.º", P3: "🥉 3.º", P4: "💀 4.º" };

  orderList.forEach(pos => {
    const selectedTeam = p.podium[pos];
    const isHit = currentActualResults.actual_podium && currentActualResults.actual_podium[pos] === selectedTeam;
    podiumList.innerHTML += `
      <div class="bg-slate-900 border ${isHit ? 'border-emerald-500/50' : 'border-slate-800'} p-2 rounded-lg">
        <span class="text-slate-400 text-[10px] block font-bold">${titles[pos]}</span>
        <span class="font-extrabold ${isHit ? 'text-emerald-400' : 'text-slate-200'}">${selectedTeam}</span>
      </div>
    `;
  });

  document.getElementById('participantModal').showModal();
}

// RENDER DEL CALENDARIO DE PARTIDOS
function renderMatches() {
  const container = document.getElementById('matchesContainer');
  if (!container) return;

  const phaseFilter = document.getElementById('matchPhaseFilter').value;
  
  let filtered = currentMatches;
  if (phaseFilter === 'groups') {
    filtered = currentMatches.filter(m => m.phase === 'groups');
  } else if (phaseFilter === 'eliminatorias') {
    filtered = currentMatches.filter(m => m.phase !== 'groups');
  }

  container.innerHTML = '';

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="col-span-2 text-center py-12 text-slate-500 text-sm">
        No hay partidos registrados para esta fase.
      </div>
    `;
    return;
  }

  filtered.forEach(m => {
    const isFinished = m.status === 'finished';
    const isGroupMatch = m.phase === 'groups';

    const card = document.createElement('div');
    card.className = `card bg-slate-950 border ${isFinished ? 'border-slate-850' : 'border-rose-500/20'} p-4 rounded-xl flex flex-col justify-between shadow-lg space-y-3`;

    let scoreSection = `<span class="badge badge-sm bg-slate-900 text-slate-400 font-bold">Proximamente</span>`;
    if (isFinished) {
      if (m.decided_by === 'penalties') {
        scoreSection = `
          <div class="flex flex-col items-center gap-1">
            <span class="text-xs text-rose-400 font-bold">Empate (Ganó Pen. ${m.winner_passed})</span>
            <span class="text-xl font-black text-rose-500">${m.score_home} - ${m.score_away}</span>
          </div>
        `;
      } else {
        scoreSection = `
          <span class="text-2xl font-black text-white">${m.score_home} - ${m.score_away}</span>
        `;
      }
    }

    card.innerHTML = `
      <div class="flex justify-between text-[10px] text-slate-400 border-b border-slate-900 pb-1.5 uppercase font-bold tracking-wider">
        <span>${isGroupMatch ? `Grupo ${m.group}` : `${m.phase}`}</span>
        <span class="${isFinished ? 'text-slate-500' : 'text-emerald-400 animate-pulse'}">${isFinished ? 'Finalizado' : 'En Vivo'}</span>
      </div>
      
      <div class="grid grid-cols-3 items-center text-center">
        <!-- Home -->
        <div class="flex flex-col items-center">
          <span class="font-extrabold text-sm text-slate-100">${m.team_home}</span>
        </div>
        
        <!-- Score -->
        <div class="flex justify-center">
          ${scoreSection}
        </div>
        
        <!-- Away -->
        <div class="flex flex-col items-center font-extrabold text-sm text-slate-100">
          <span>${m.team_away}</span>
        </div>
      </div>

      ${isFinished && m.scorers && m.scorers.length > 0 ? `
        <div class="border-t border-slate-900/60 pt-2 text-[10px] text-slate-400 space-y-0.5">
          <div class="flex items-center gap-1.5">
            <span>⚽ Goles:</span>
            <span class="text-slate-300 font-medium">${m.scorers.map(s => s.split(':')[1]).join(', ')}</span>
          </div>
        </div>
      ` : ''}
    `;

    container.appendChild(card);
  });
}

// RENDER DE LA TABLA DE MÁXIMOS GOLEADORES (PICHICHI)
function renderScorers() {
  const container = document.getElementById('scorersList');
  if (!container) return;

  container.innerHTML = '';
  
  if (!scorers.players || Object.keys(scorers.players).length === 0) {
    container.innerHTML = `
      <div class="text-center py-6 text-slate-500 text-xs">
        No se registran goleadores hasta el momento.
      </div>
    `;
    return;
  }

  // Ordenar de mayor a menor número de goles
  const sortedPlayers = Object.entries(scorers.players)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10); // Ver los 10 primeros de mayor relevancia

  sortedPlayers.forEach(([playerName, goals], index) => {
    const isPichichi = index === 0;

    container.innerHTML += `
      <div class="flex justify-between items-center py-2.5 text-xs">
        <div class="flex items-center gap-2">
          <span class="font-bold text-slate-500 w-4">${index + 1}.</span>
          <span class="font-extrabold ${isPichichi ? 'text-amber-400 font-black' : 'text-slate-200'}">${playerName}</span>
          ${isPichichi ? '<span class="badge bg-amber-500 text-slate-950 font-black text-[9px] scale-90">PICHICHI</span>' : ''}
        </div>
        <span class="badge badge-sm badge-rose font-bold text-xs">${goals} goles</span>
      </div>
    `;
  });
}
