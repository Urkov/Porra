// Variables globales para contener el estado de la porra
let rules = {};
let teams = {};
let players = {};
let participants = [];
let matches = [];
let scorers = {};
let actualResults = {};
let areAllSelectionsVisible = false;

// Mapeo detallado de selecciones de fútbol a sus respectivas banderas codes
const TEAM_CODES = {
  "Francia": "fr",
  "España": "es",
  "Argentina": "ar",
  "Brasil": "br",
  "Inglaterra": "gb-eng",
  "Portugal": "pt",
  "Alemania": "de",
  "Países Bajos": "nl",
  "Colombia": "co",
  "Senegal": "sn",
  "Croacia": "hr",
  "Uruguay": "uy",
  "Bélgica": "be",
  "Marruecos": "ma",
  "Estados Unidos": "us",
  "México": "mx",
  "Noruega": "no",
  "Ecuador": "ec",
  "Japón": "jp",
  "Suiza": "ch",
  "Turquía": "tr",
  "Egipto": "eg",
  "Corea del Sur": "kr",
  "Suecia": "se",
  "Canadá": "ca",
  "Austria": "at",
  "Sudáfrica": "za",
  "Paraguay": "py",
  "Escocia": "gb-sct",
  "Ghana": "gh",
  "República Checa": "cz",
  "Argelia": "dz",
  "Irán": "ir",
  "Arabia Saudita": "sa",
  "Jordania": "jo",
  "Bosnia y Herzegovina": "ba",
  "Costa de Marfil": "ci",
  "Australia": "au",
  "Túnez": "tn",
  "RD Congo": "cd",
  "Uzbekistán": "uz",
  "Catar": "qa",
  "Irak": "iq",
  "Nueva Zelanda": "nz",
  "Cabo Verde": "cv",
  "Panamá": "pa",
  "Curazao": "cw",
  "Haití": "ht"
};

// Banderas emojis nativas para selects
const TEAM_EMOJIS = {
  "Francia": "🇫🇷",
  "España": "🇪🇸",
  "Argentina": "🇦🇷",
  "Brasil": "🇧🇷",
  "Inglaterra": "🏴\u200D󠁢󠁥󠁮󠁧󠁿",
  "Portugal": "🇵🇹",
  "Alemania": "🇩🇪",
  "Países Bajos": "🇳🇱",
  "Colombia": "🇨🇴",
  "Senegal": "🇸🇳",
  "Croacia": "🇭🇷",
  "Uruguay": "🇺🇾",
  "Bélgica": "🇧🇪",
  "Marruecos": "🇲🇦",
  "Estados Unidos": "🇺🇸",
  "México": "🇲🇽",
  "Noruega": "🇳🇴",
  "Ecuador": "🇪🇨",
  "Japón": "🇯🇵",
  "Suiza": "🇨🇭",
  "Turquía": "🇹🇷",
  "Egipto": "🇪🇬",
  "Corea del Sur": "🇰🇷",
  "Suecia": "🇸🇪",
  "Canadá": "🇨🇦",
  "Austria": "🇦🇹",
  "Sudáfrica": "🇿🇦",
  "Paraguay": "🇵🇾",
  "Escocia": "🏴\u200D󠁢󠁳󠁣󠁴󠁿",
  "Ghana": "🇬🇭",
  "República Checa": "🇨🇿",
  "Argelia": "🇩🇿",
  "Irán": "🇮🇷",
  "Arabia Saudita": "🇸🇦",
  "Jordania": "🇯🇴",
  "Bosnia y Herzegovina": "🇧🇦",
  "Costa de Marfil": "🇨🇮",
  "Australia": "🇦🇺",
  "Túnez": "🇹🇳",
  "RD Congo": "🇨🇩",
  "Uzbekistán": "🇺🇿",
  "Catar": "🇶🇦",
  "Irak": "🇮🇶",
  "Nueva Zelanda": "🇳🇿",
  "Cabo Verde": "🇨🇻",
  "Panamá": "🇵🇦",
  "Curazao": "🇨🇼",
  "Haití": "🇭🇹"
};

const WEEKDAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
function getWeekday(dateStr) {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr + "T00:00:00");
    return WEEKDAYS[date.getDay()] || "";
  } catch (e) {
    return "";
  }
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length !== 3) return dateStr;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function getTeamFlag(teamName, isLarge = false) {
  if (!teamName) return "";
  const code = TEAM_CODES[teamName];
  if (!code) {
    const iconClass = isLarge ? "text-2xl text-slate-500 mr-2" : "text-sm text-slate-600 mr-1.5";
    return `<i class="fa-solid fa-shield-halved ${iconClass} align-middle"></i>`;
  }
  const imgClass = isLarge 
    ? "inline-block w-9 h-6 rounded border border-slate-800 shadow-md align-middle" 
    : "inline-block w-5 h-3.5 rounded-sm border border-slate-900/60 shadow-sm align-middle mr-1.5";
  return `<img src="https://flagcdn.com/w40/${code}.png" alt="${teamName}" class="${imgClass}" />`;
}

function getTeamFlagEmoji(teamName) {
  if (!teamName) return "";
  return TEAM_EMOJIS[teamName] || "";
}

// Mapeo detallado de jugadores de la porra (goleadores) a sus selecciones correspondientes
const PLAYER_TEAMS = {
  "Kylian Mbappé": "Francia",
  "Erling Haaland": "Noruega",
  "Lionel Messi": "Argentina",
  "Harry Kane": "Inglaterra",
  "Mikel Oyarzabal": "España",
  "Cristiano Ronaldo": "Portugal",
  "Lamine Yamal": "España",
  "Jude Bellingham": "Inglaterra",
  "Vinícius Jr.": "Brasil",
  "Lautaro Martínez": "Argentina",
  "Luis Díaz": "Colombia",
  "Darwin Núñez": "Uruguay",
  "Ousmane Dembélé": "Francia",
  "Jonathan David": "Canadá",
  "Kai Havertz": "Alemania",
  "Raphinha": "Brasil",
  "Donyell Malen": "Países Bajos",
  "Bukayo Saka": "Inglaterra",
  "Leroy Sané": "Alemania",
  "Arda Güler": "Turquía",
  "Julian Alvarez": "Argentina",
  "Ferran Torres": "España",
  "Kevin De Bruyne": "Bélgica",
  "Romelu Lukaku": "Bélgica",
  "Rafael Leao": "Portugal",
  "Alexander Isak": "Suecia",
  "Viktor Gyökeres": "Suecia",
  "Alexander Sørloth": "Noruega",
  "Antoine Semenyo": "Ghana",
  "Mohamed Salah": "Egipto"
};

function getPlayerFlag(playerName, isLarge = false) {
  if (!playerName) return "";
  const team = PLAYER_TEAMS[playerName];
  if (!team) return "";
  return getTeamFlag(team, isLarge);
}

function getPlayerFlagEmoji(playerName) {
  if (!playerName) return "";
  const team = PLAYER_TEAMS[playerName];
  if (!team) return "";
  return getTeamFlagEmoji(team);
}

function getGroupBadgeClasses(groupName) {
  switch (groupName) {
    case 'A': return 'bg-amber-950/70 border-amber-400 text-amber-200';
    case 'B': return 'bg-sky-950/70 border-sky-400 text-sky-200';
    case 'C': return 'bg-emerald-950/70 border-emerald-400 text-emerald-200';
    case 'D': return 'bg-violet-950/70 border-violet-400 text-violet-200';
    case 'E': return 'bg-fuchsia-950/70 border-fuchsia-400 text-fuchsia-200';
    case 'F': return 'bg-lime-950/70 border-lime-400 text-lime-200';
    default: return 'bg-slate-950/70 border-slate-600 text-slate-200';
  }
}

// Exponer globalmente para acceso desde admin.js u otros scripts
window.getTeamFlag = getTeamFlag;
window.getTeamFlagEmoji = getTeamFlagEmoji;
window.getPlayerFlag = getPlayerFlag;
window.getPlayerFlagEmoji = getPlayerFlagEmoji;

// Catálogos dinámicos de consulta explicativa en la sección de reglas
function renderRulesCatalog() {
  const gContainer = document.getElementById('rulesGroupsContainer');
  const sContainer = document.getElementById('rulesScorersContainer');
  if (!gContainer || !sContainer) return;

  gContainer.innerHTML = '';
  sContainer.innerHTML = '';

  // Renderizar Grupos de Selecciones (A al F)
  Object.entries(teams).forEach(([grpName, teamList]) => {
    let grpHtml = `
      <div class="bg-slate-950/70 p-3 rounded-xl border border-slate-900 space-y-1.5 shadow-sm text-[11px]">
        <h5 class="font-black text-amber-400 border-b border-slate-900/60 pb-1 uppercase tracking-widest text-[10px]">Grupo ${grpName}</h5>
        <div class="space-y-1">
    `;
    teamList.forEach(t => {
      grpHtml += `
        <div class="flex items-center gap-1 text-slate-350 py-0.5">
          <span class="shrink-0 flex items-center justify-center">${getTeamFlag(t)}</span>
          <span class="truncate ml-1.5" title="${t}">${t}</span>
        </div>
      `;
    });
    grpHtml += `</div></div>`;
    gContainer.innerHTML += grpHtml;
  });

  // Renderizar Bombos de Goleadores (J1 al J6)
  Object.entries(players).forEach(([bomName, playerList]) => {
    let bomHtml = `
      <div class="bg-slate-950/70 p-3 rounded-xl border border-slate-900 space-y-1.5 shadow-sm text-[11px]">
        <h5 class="font-black text-rose-400 border-b border-slate-900/60 pb-1 uppercase tracking-widest text-[10px]">Bombo ${bomName}</h5>
        <div class="space-y-1">
    `;
    playerList.forEach(p => {
      bomHtml += `
        <div class="flex items-center gap-1 text-slate-350 py-0.5">
          <span class="shrink-0 flex items-center justify-center">${getPlayerFlag(p)}</span>
          <span class="truncate ml-1.5" title="${p}">${p}</span>
        </div>
      `;
    });
    bomHtml += `</div></div>`;
    sContainer.innerHTML += bomHtml;
  });
}

// Almacena variables filtradas o simuladas por previsualización de admin
let currentMatches = [];
let currentActualResults = [];

// Inicialización de la pantalla al cargar la página
document.addEventListener('DOMContentLoaded', async () => {
  await loadDatabase();
  populateMatchFilters();
  computeScores();
  renderLeaderboard();
  renderOfficialGroups();
  renderMatches();
  renderScorers();
  renderRulesCatalog();
});

// Desplazamiento dinámico suave
function scrollToSection(id) {
  const element = document.getElementById(id);
  if (element) {
    if (id === 'rules' && element.tagName === 'DETAILS') {
      element.open = true;
    }
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

function formatMatchDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(`${dateStr}T00:00:00`);
  return date.toLocaleDateString('es-ES', {
    weekday: 'short',
    day: '2-digit',
    month: 'short'
  });
}

function populateMatchFilters() {
  const groupSelect = document.getElementById('matchGroupFilter');
  const teamSelect = document.getElementById('matchTeamFilter');
  const dateSelect = document.getElementById('matchDateFilter');
  const venueSelect = document.getElementById('matchVenueFilter');
  if (!groupSelect || !teamSelect || !dateSelect || !venueSelect) return;

  const groups = [...new Set(matches.filter(m => m.group).map(m => m.group))].sort((a, b) => a.localeCompare(b, 'es', { numeric: true }));
  const teamsSet = new Set(Object.values(teams).flat());
  const dates = [...new Set(matches.map(m => m.date))].sort();
  const venues = [...new Set(matches.map(m => m.venue))].sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));

  groupSelect.innerHTML = `<option value="all">Todos los grupos</option>` + groups.map(group => `<option value="${group}">${group}</option>`).join('');
  teamSelect.innerHTML = `<option value="all">Todas las selecciones</option>` + [...teamsSet].sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' })).map(team => `<option value="${team}">${team}</option>`).join('');
  dateSelect.innerHTML = `<option value="all">Todos los días</option>` + dates.map(date => `<option value="${date}">${formatMatchDate(date)}</option>`).join('');
  venueSelect.innerHTML = `<option value="all">Todas las sedes</option>` + venues.map(venue => `<option value="${venue}">${venue}</option>`).join('');
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
    // El bono se otorga sólo si la Final ya se ha disputado y el (los) máximo(s) goleador(es) reales
    // pertenece(n) a la lista de goleadores elegibles de la porra. Si el máximo goleador no es elegible,
    // nadie recibe el bono.
    // Construir conjunto de elegibles a partir de los bombos
    const eligibleSet = new Set();
    Object.values(players).forEach(list => list.forEach(p => eligibleSet.add(p)));

    const finalPlayed = currentMatches.some(m => m.phase === 'Final' && m.status === 'finished');
    if (finalPlayed && currentActualResults.actual_pichichi && currentActualResults.actual_pichichi.length > 0) {
      // Filtrar los pichichis reales que además son elegibles en la porra
      const eligibleRealPichichis = currentActualResults.actual_pichichi.filter(p => eligibleSet.has(p));
      if (eligibleRealPichichis.length > 0) {
        // Otorgar bono a los participantes que hayan elegido alguno de los pichichis reales elegibles
        const hitPichichi = participantPlayers.some(pName => eligibleRealPichichis.includes(pName));
        if (hitPichichi) scorePichichi = rules.points.pichichi_bonus;
      } else {
        // Ningún pichichi real es elegible → nadie recibe el bonus
        scorePichichi = 0;
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
        <div class="flex items-center justify-between gap-2">
          <div>
            <div>${participant.name}</div>
            ${isLast ? '<span class="text-[10px] text-rose-500 block font-normal">Sótano (10% premio)</span>' : ''}
            ${isFirst ? '<span class="text-[10px] text-amber-400 block font-normal">Líder Provisional (50% premio)</span>' : ''}
          </div>
          <button onclick="toggleParticipantSelections(event, ${participant.id})" class="btn btn-ghost btn-xs text-slate-300">Selecciones</button>
        </div>
      </td>
      <td class="text-center text-xs text-slate-300 font-medium">${participant.score_details.matches} pts</td>
      <td class="text-center text-xs text-slate-300 font-medium">${participant.score_details.scorers} pts</td>
      <td class="text-center text-xs text-slate-300 font-medium">${participant.score_details.groups} pts</td>
      <td class="text-center text-xs text-slate-300 font-medium">${participant.score_details.rounds} pts</td>
      <td class="text-center text-xs text-slate-300 font-medium">${participant.score_details.podium} pts</td>
      <td class="bg-rose-950/20 text-rose-300 text-center font-black text-sm md:text-lg rounded-r-xl">${participant.score_details.total}</td>
    `;
    tbody.appendChild(tr);

    const detailRow = document.createElement('tr');
    detailRow.id = `participantSelections-${participant.id}`;
    detailRow.className = 'hidden bg-slate-950/70 border-b border-slate-900/60';
    detailRow.innerHTML = `
      <td colspan="8" class="px-4 py-4 text-[10px] text-slate-300">
        <div class="space-y-1">
          <div class="text-slate-400 uppercase tracking-wide text-[9px] font-semibold mb-2">Selecciones + Goleadores</div>
          <div class="grid gap-1 sm:grid-cols-8">
            ${Object.entries(participant.predictions).map(([grpName, teamList]) => `
              <div class="col-span-1 rounded-2xl border-l-4 p-2 ${getGroupBadgeClasses(grpName)} shadow-inner shadow-slate-950/20 min-w-0">
                <div class="text-[9px] uppercase tracking-[0.24em] font-bold mb-1 text-slate-200">${grpName}</div>
                <div class="text-slate-100 text-[12px] leading-4 space-y-0.5">
                  ${teamList.map(team => `<div class="flex items-center gap-1 truncate"><span class="shrink-0">${getTeamFlag(team)}</span><span class="truncate">${team}</span></div>`).join('')}
                </div>
              </div>
            `).join('')}
            <div class="col-span-2 rounded-2xl border border-slate-800 bg-slate-900/80 p-1.5 shadow-inner shadow-slate-950/20 min-w-0">
              <div class="grid grid-cols-2 gap-1 text-[10px] text-slate-100">
                ${Object.entries(participant.scorers).map(([jGrp, player]) => `
                  <div class="inline-flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-950/80 px-2 py-1 truncate">
                    <span class="shrink-0">${getPlayerFlag(player)}</span>
                    <span class="truncate">${player}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        </div>
      </td>
    `;
    tbody.appendChild(detailRow);
  });
  updateAllSelectionsButton();
}

function isAllSelectionRowsVisible() {
  const detailRows = document.querySelectorAll('[id^="participantSelections-"]');
  if (detailRows.length === 0) return false;
  return Array.from(detailRows).every(row => !row.classList.contains('hidden') && row.style.display !== 'none');
}

function updateAllSelectionsButton() {
  const btn = document.getElementById('toggleAllSelectionsBtn');
  if (!btn) return;
  btn.innerText = isAllSelectionRowsVisible() ? 'Ocultar selecciones de todos' : 'Ver selecciones de todos';
}

function toggleAllSelections() {
  const detailRows = document.querySelectorAll('[id^="participantSelections-"]');
  const show = !isAllSelectionRowsVisible();
  detailRows.forEach(row => {
    if (show) row.classList.remove('hidden');
    else row.classList.add('hidden');
  });
  areAllSelectionsVisible = show;
  updateAllSelectionsButton();
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

function toggleParticipantSelections(event, participantId) {
  event.stopPropagation();
  const detailRow = document.getElementById(`participantSelections-${participantId}`);
  if (!detailRow) return;
  detailRow.classList.toggle('hidden');
  areAllSelectionsVisible = isAllSelectionRowsVisible();
  updateAllSelectionsButton();
}

function addTeamPoint(teamPoints, teamName, category, points) {
  if (!teamName || !teamPoints[teamName] || !points) return;
  teamPoints[teamName][category] += points;
  teamPoints[teamName].total += points;
}

function computeParticipantTeamPoints(participant) {
  const teamPoints = {};
  const chosenTeams = new Set();

  Object.values(participant.predictions).forEach(teamList => {
    teamList.forEach(teamName => {
      chosenTeams.add(teamName);
      if (!teamPoints[teamName]) {
        teamPoints[teamName] = {
          matches: 0,
          groups: 0,
          exact: 0,
          rounds: 0,
          total: 0
        };
      }
    });
  });

  const roundsPassedByTeamsByPhase = {};

  currentMatches.forEach(match => {
    if (match.status !== 'finished') return;

    const isHomeChosen = chosenTeams.has(match.team_home);
    const isAwayChosen = chosenTeams.has(match.team_away);
    if (!isHomeChosen && !isAwayChosen) return;

    const isDraw = match.decided_by === 'penalties' || match.score_home === match.score_away;
    const isWinHome = !isDraw && (match.score_home > match.score_away);
    const isWinAway = !isDraw && (match.score_away > match.score_home);

    if (isHomeChosen) {
      const gp = getTeamGroup(match.team_home);
      let pts = 0;
      if (isDraw) {
        pts = rules.points.draw_base;
        if (gp === 'C' || gp === 'D') pts += rules.points.group_cd_extra.draw;
        if (gp === 'E' || gp === 'F') pts += rules.points.group_ef_extra.draw;
      } else if (isWinHome) {
        pts = rules.points.win_base;
        if (gp === 'C' || gp === 'D') pts += rules.points.group_cd_extra.win;
        if (gp === 'E' || gp === 'F') pts += rules.points.group_ef_extra.win;
      }
      addTeamPoint(teamPoints, match.team_home, 'matches', pts);
    }

    if (isAwayChosen) {
      const gp = getTeamGroup(match.team_away);
      let pts = 0;
      if (isDraw) {
        pts = rules.points.draw_base;
        if (gp === 'C' || gp === 'D') pts += rules.points.group_cd_extra.draw;
        if (gp === 'E' || gp === 'F') pts += rules.points.group_ef_extra.draw;
      } else if (isWinAway) {
        pts = rules.points.win_base;
        if (gp === 'C' || gp === 'D') pts += rules.points.group_cd_extra.win;
        if (gp === 'E' || gp === 'F') pts += rules.points.group_ef_extra.win;
      }
      addTeamPoint(teamPoints, match.team_away, 'matches', pts);
    }

    if (match.phase !== 'groups') {
      const winner = match.decided_by === 'penalties' ? match.winner_passed : (match.score_home > match.score_away ? match.team_home : match.team_away);
      if (winner && chosenTeams.has(winner)) {
        if (!roundsPassedByTeamsByPhase[match.phase]) {
          roundsPassedByTeamsByPhase[match.phase] = new Set();
        }

        if (!roundsPassedByTeamsByPhase[match.phase].has(winner)) {
          roundsPassedByTeamsByPhase[match.phase].add(winner);
          const gp = getTeamGroup(winner);
          let pts = rules.points.round_passed_base;
          if (gp === 'C' || gp === 'D') pts += rules.points.group_cd_extra.round_passed;
          if (gp === 'E' || gp === 'F') pts += rules.points.group_ef_extra.round_passed;
          addTeamPoint(teamPoints, winner, 'rounds', pts);
        }
      }
    }
  });

  Object.entries(participant.predictions).forEach(([grpName, predictedList]) => {
    const realOrder = currentActualResults.actual_positions[grpName] || [];

    predictedList.forEach((teamName, index) => {
      const realIdx = realOrder.indexOf(teamName);
      if (realIdx === -1) return;

      const realPosNumber = realIdx + 1;
      if (realPosNumber === 1) addTeamPoint(teamPoints, teamName, 'groups', rules.points.group_position["1"]);
      else if (realPosNumber === 2) addTeamPoint(teamPoints, teamName, 'groups', rules.points.group_position["2"]);
      else if (realPosNumber === 3) addTeamPoint(teamPoints, teamName, 'groups', rules.points.group_position["3"]);

      const predIndexNumber = index + 1;
      if (predIndexNumber === realPosNumber) {
        if (realPosNumber === 1) addTeamPoint(teamPoints, teamName, 'exact', rules.points.prediction_match["1"]);
        else if (realPosNumber === 2) addTeamPoint(teamPoints, teamName, 'exact', rules.points.prediction_match["2"]);
        else if (realPosNumber === 3) addTeamPoint(teamPoints, teamName, 'exact', rules.points.prediction_match["3"]);
      }
    });
  });

  return teamPoints;
}

function formatPointsLabel(points) {
  return Number.isInteger(points) ? String(points) : String(points).replace('.', ',');
}

function renderTeamPointsBadge(points) {
  const value = points && points.total ? points.total : 0;
  const title = points
    ? `Partidos: ${formatPointsLabel(points.matches)} | Grupos: ${formatPointsLabel(points.groups)} | Exacta: ${formatPointsLabel(points.exact)} | Rondas: ${formatPointsLabel(points.rounds)}`
    : '';
  const classes = value > 0
    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200'
    : 'bg-slate-900 border-slate-800 text-slate-500';

  return `<span class="order-2 ml-auto shrink-0 rounded-md border px-1.5 py-0.5 text-[10px] font-black ${classes}" title="${title}">${formatPointsLabel(value)} pts</span>`;
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
  const exactEl = document.getElementById('modalBreakdownExact');
  if (exactEl) exactEl.innerText = `${p.score_details.exact} pts`;
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
    // Validación: el jugador seleccionado debe pertenecer al bombo correspondiente
    const bomPlayers = players[jGrp] || [];
    const isValidScorer = bomPlayers.includes(playerSelected);
    const invalidClass = isValidScorer ? '' : 'border border-rose-500 bg-rose-950/5';
    const invalidBadge = isValidScorer ? '' : '<span class="badge badge-error text-slate-950 font-bold text-[9px] ml-1">Inválido</span>';

    gList.innerHTML += `
      <div class="flex justify-between items-center px-3 py-1.5 rounded ${invalidClass}">
        <span class="text-slate-400 font-bold">${jGrp}:</span>
        <span class="text-white ml-2 flex-1">${getPlayerFlag(playerSelected)} ${playerSelected}</span>
        <span class="badge ${playerGoals > 0 ? 'badge-rose' : 'bg-slate-800'} text-xs font-bold">${playerGoals} ⚽</span>
        ${isPichichiVal ? '<span class="badge badge-warning text-slate-950 font-extrabold text-[9px] ml-1">PICHICHI</span>' : ''}
        ${invalidBadge}
      </div>
    `;
  });

  // Los 6 grupos de de selecciones en la maqueta
  const groupsContainer = document.getElementById('modalGroupsContainer');
  groupsContainer.innerHTML = '';
  const teamPoints = computeParticipantTeamPoints(p);

  Object.entries(p.predictions).forEach(([grpName, teamList]) => {
    const realOrder = currentActualResults.actual_positions[grpName] || [];
    
    // Validación del número de selecciones por grupo (deberían ser 3)
    const expectedCount = 3;
    const groupInvalid = teamList.length !== expectedCount;
    const groupInvalidClass = groupInvalid ? 'border border-rose-500 bg-rose-950/5' : '';

    let htmlGroup = `
      <div class="bg-slate-950 p-3 rounded-lg ${groupInvalidClass} space-y-2">
        <h5 class="text-white text-xs font-black uppercase tracking-widest border-b border-rose-500/20 pb-1">Grupo ${grpName} ${groupInvalid ? '<span class="badge badge-error ml-2 text-[10px]">Selecciones inválidas</span>' : ''}</h5>
        <div class="space-y-1 text-[11px]">
    `;

    teamList.forEach((teamName, index) => {
      // Determinar si el equipo ya tiene posición real en fase de grupos
      const posRealIndex = realOrder.indexOf(teamName);
      let statusIndicator = '';
      let textClass = 'text-slate-300';

      // Validación: el equipo debe pertenecer al grupo oficial
      const isTeamOfficial = teams[grpName] && teams[grpName].includes(teamName);
      if (!isTeamOfficial) {
        textClass = 'text-rose-400 font-bold';
        statusIndicator = `<span class="badge badge-error text-slate-950 font-bold text-[9px]">Inválido</span>`;
      }

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
          <div class="flex justify-between items-center gap-2">
            ${renderTeamPointsBadge(teamPoints[teamName])}
            <span class="${textClass}">${index + 1}.º ${getTeamFlag(teamName)} ${teamName}</span>
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
  const titles = { P1: "🥇 1.º", P2: "🥈 2.º", P3: "🥉 3.º", P4: "4️⃣ 4.º" };

  orderList.forEach(pos => {
    const selectedTeam = p.podium[pos];
    const isHit = currentActualResults.actual_podium && currentActualResults.actual_podium[pos] === selectedTeam;
    podiumList.innerHTML += `
      <div class="bg-slate-900 border ${isHit ? 'border-emerald-500/50' : 'border-slate-800'} p-2 rounded-lg">
        <span class="text-slate-400 text-[10px] block font-bold">${titles[pos]}</span>
        <span class="font-extrabold ${isHit ? 'text-emerald-400' : 'text-slate-200'}">${getTeamFlag(selectedTeam)} ${selectedTeam}</span>
      </div>
    `;
  });

  document.getElementById('participantModal').showModal();
}

function translatePhase(phase, group) {
  if (!phase) return "";
  const ph = phase.toLowerCase().replace(/[-_]/g, " ");
  if (ph.includes("group")) {
    return group ? `Grupo ${group}` : "Fase de Grupos";
  }
  if (ph.includes("32")) return "Dieciseisavos de Final";
  if (ph.includes("16") || ph.includes("round of 16")) return "Octavos de Final";
  if (ph.includes("quarter") || ph.includes("cuartos")) return "Cuartos de Final";
  if (ph.includes("semi") || ph.includes("semifinales")) return "Semifinales";
  if (ph.includes("3rd") || ph.includes("third") || ph.includes("tercer")) return "Tercer Puesto";
  if (ph.includes("final")) return "Gran Final";
  return phase;
}

function buildOfficialGroupsFromMatches(matchList) {
  const groups = {};
  matchList
    .filter(m => m.phase === 'groups' && m.group)
    .forEach(m => {
      if (!groups[m.group]) groups[m.group] = new Set();
      groups[m.group].add(m.team_home);
      groups[m.group].add(m.team_away);
    });
  return Object.keys(groups)
    .sort()
    .map(grp => ({ group: grp, teams: [...groups[grp]].sort() }));
}

function computeOfficialGroupStandings(matchList) {
  const standings = {};
  const officialGroups = buildOfficialGroupsFromMatches(matchList);

  officialGroups.forEach(({ group, teams }) => {
    const stats = {};
    teams.forEach(team => {
      stats[team] = {
        team,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        gf: 0,
        ga: 0,
        gd: 0,
        points: 0
      };
    });

    matchList
      .filter(m => m.phase === 'groups' && m.group === group && m.status === 'finished')
      .forEach(m => {
        const home = stats[m.team_home];
        const away = stats[m.team_away];
        if (!home || !away) return;

        const scoreHome = Number(m.score_home) || 0;
        const scoreAway = Number(m.score_away) || 0;

        home.played++;
        away.played++;
        home.gf += scoreHome;
        home.ga += scoreAway;
        away.gf += scoreAway;
        away.ga += scoreHome;

        if (scoreHome > scoreAway) {
          home.won++;
          away.lost++;
          home.points += 3;
        } else if (scoreHome < scoreAway) {
          away.won++;
          home.lost++;
          away.points += 3;
        } else {
          home.drawn++;
          away.drawn++;
          home.points += 1;
          away.points += 1;
        }
      });

    const sorted = Object.values(stats)
      .map(s => ({ ...s, gd: s.gf - s.ga }))
      .sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.gd !== a.gd) return b.gd - a.gd;
        if (b.gf !== a.gf) return b.gf - a.gf;
        return a.team.localeCompare(b.team, 'es');
      })
      .map((s, index) => ({ ...s, position: index + 1 }));

    standings[group] = sorted;
  });

  return standings;
}

function getStandingsRowClass(position, hasPlayed) {
  if (!hasPlayed) return 'border-l-2 border-transparent';
  if (position <= 2) return 'border-l-2 border-emerald-500/80 bg-emerald-950/20';
  if (position === 3) return 'border-l-2 border-amber-500/60 bg-amber-950/10';
  return 'border-l-2 border-transparent';
}

function renderOfficialGroups() {
  const container = document.getElementById('officialGroupsContainer');
  if (!container) return;

  const standings = computeOfficialGroupStandings(currentMatches);
  const groupKeys = Object.keys(standings).sort();
  if (groupKeys.length === 0) {
    container.innerHTML = '';
    return;
  }

  container.innerHTML = groupKeys.map(group => {
    const rows = standings[group];
    const hasPlayed = rows.some(r => r.played > 0);

    return `
      <div class="bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-1.5 shadow-sm">
        <h5 class="font-black text-emerald-400 border-b border-slate-900/60 pb-1 uppercase tracking-widest text-[10px]">Grupo ${group}</h5>
        <div class="space-y-1">
          ${rows.map(row => `
            <div class="flex items-center gap-1.5 rounded-md pl-1.5 pr-1 py-1 ${getStandingsRowClass(row.position, hasPlayed)}">
              <span class="text-[10px] font-black text-slate-500 w-3 shrink-0">${hasPlayed ? row.position : '·'}</span>
              <span class="shrink-0">${getTeamFlag(row.team, true)}</span>
              <span class="truncate font-semibold text-slate-200 text-[11px] flex-1" title="${row.team}">${row.team}</span>
              <div class="text-right shrink-0">
                <span class="font-black text-emerald-400 text-xs">${row.points}</span>
                <span class="text-[9px] text-slate-500 ml-0.5">pts</span>
              </div>
            </div>
            ${hasPlayed ? `
              <div class="text-[9px] text-slate-500 pl-7 -mt-0.5 pb-0.5">
                ${row.played} PJ · ${row.won}V ${row.drawn}E ${row.lost}D · ${row.gf}-${row.ga} (${row.gd >= 0 ? '+' : ''}${row.gd})
              </div>
            ` : ''}
          `).join('')}
        </div>
      </div>
    `;
  }).join('');
}

function toggleOfficialGroups() {
  const section = document.getElementById('officialGroupsSection');
  const button = document.getElementById('toggleOfficialGroupsBtn');
  if (!section || !button) return;

  const hidden = section.classList.toggle('hidden');
  button.innerText = hidden ? 'Mostrar grupos oficiales' : 'Ocultar grupos oficiales';
}

function toggleCalendar() {
  const container = document.getElementById('matchesContainer');
  const filters = document.getElementById('matchFiltersSection');
  const button = document.getElementById('toggleCalendarBtn');
  if (!container || !button) return;

  const hidden = container.classList.toggle('hidden');
  if (filters) filters.classList.toggle('hidden', hidden);
  button.innerText = hidden ? 'Mostrar calendario' : 'Ocultar calendario';
}

// RENDER DEL CALENDARIO DE PARTIDOS
function renderMatches() {
  const container = document.getElementById('matchesContainer');
  if (!container) return;

  const phaseFilter = document.getElementById('matchPhaseFilter').value;
  const groupFilter = document.getElementById('matchGroupFilter').value;
  const teamFilter = document.getElementById('matchTeamFilter').value;
  const dateFilter = document.getElementById('matchDateFilter').value;
  const venueFilter = document.getElementById('matchVenueFilter').value;

  const filtered = currentMatches.filter(m => {
    if (phaseFilter === 'groups' && m.phase !== 'groups') return false;
    if (phaseFilter === 'eliminatorias' && m.phase === 'groups') return false;
    if (phaseFilter === 'dieciseisavos' && m.phase !== 'Round of 32') return false;
    if (phaseFilter === 'octavos' && m.phase !== 'Round of 16') return false;
    if (phaseFilter === 'cuartos' && m.phase !== 'Quarter-finals') return false;
    if (phaseFilter === 'semifinal' && m.phase !== 'Semi-finals') return false;
    if (phaseFilter === 'final' && m.phase !== 'Final' && m.phase !== '3rd_place') return false;
    if (groupFilter !== 'all' && m.group !== groupFilter) return false;
    if (teamFilter !== 'all' && m.team_home !== teamFilter && m.team_away !== teamFilter) return false;
    if (dateFilter !== 'all' && m.date !== dateFilter) return false;
    if (venueFilter !== 'all' && m.venue !== venueFilter) return false;
    return true;
  });

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

    const card = document.createElement('div');
    card.className = `card bg-slate-950 border ${isFinished ? 'border-slate-850' : 'border-rose-500/20'} p-4 rounded-xl flex flex-col justify-between shadow-lg space-y-3`;

    let scoreSection = `<span class="badge badge-sm bg-slate-900 border-slate-800 text-slate-400 font-bold px-2 py-0.5">VS</span>`;
    if (isFinished) {
      if (m.decided_by === 'penalties') {
        scoreSection = `
          <div class="flex flex-col items-center gap-1">
            <span class="text-[9px] text-rose-400 font-bold uppercase tracking-wider">Ganó Pen. ${m.winner_passed}</span>
            <span class="text-xl font-black text-rose-500">${m.score_home} - ${m.score_away}</span>
          </div>
        `;
      } else {
        scoreSection = `
          <span class="text-2xl font-black text-white">${m.score_home} - ${m.score_away}</span>
        `;
      }
    }

    let statusText = 'Próximamente';
    let statusClass = 'text-slate-400';
    if (m.status === 'finished') {
      statusText = 'Finalizado';
      statusClass = 'text-slate-500';
    } else if (m.status === 'live') {
      statusText = 'En Vivo';
      statusClass = 'text-emerald-400 animate-pulse font-bold';
    }

    card.innerHTML = `
      <div class="flex justify-between text-[10px] text-slate-400 border-b border-slate-900 pb-1.5 uppercase font-bold tracking-wider">
        <span>${translatePhase(m.phase, m.group)}</span>
        <span class="${statusClass}">${statusText}</span>
      </div>
      
      <div class="grid grid-cols-3 items-center text-center py-1">
        <!-- Home -->
        <div class="flex flex-col items-center">
          <span class="text-2xl mb-1">${getTeamFlag(m.team_home)}</span>
          <span class="font-extrabold text-xs text-slate-100 text-center leading-tight min-h-8 flex items-center justify-center">${m.team_home}</span>
        </div>
        
        <!-- Score -->
        <div class="flex justify-center items-center">
          ${scoreSection}
        </div>
        
        <!-- Away -->
        <div class="flex flex-col items-center">
          <span class="text-2xl mb-1">${getTeamFlag(m.team_away)}</span>
          <span class="font-extrabold text-xs text-slate-100 text-center leading-tight min-h-8 flex items-center justify-center">${m.team_away}</span>
        </div>
      </div>

      <div class="border-t border-slate-900/60 pt-2 text-[10px] text-slate-400 flex flex-col gap-1">
        <div class="flex justify-between items-center text-slate-450 gap-2">
          <span class="shrink-0"><i class="fa-solid fa-calendar-day mr-1.5 text-rose-500/80"></i>${getWeekday(m.date)}, ${formatDate(m.date)} - ${m.time}</span>
          <span class="truncate max-w-[130px] sm:max-w-[180px]" title="${m.venue || ''}"><i class="fa-solid fa-location-dot mr-1.5 text-rose-500/80"></i>${m.venue || 'Por definir'}</span>
        </div>
        ${isFinished && Array.isArray(m.scorers) && m.scorers.length > 0 ? `
          ${(() => {
            const selectedScorers = new Set(participants.flatMap(p => Object.values(p.scorers).map(name => name.trim())));
            const parsedScorers = m.scorers.map(sc => {
              const parts = sc.split(':');
              return {
                team: parts[0]?.trim() || '',
                player: parts.slice(1).join(':').trim() || ''
              };
            }).filter(sc => sc.team && sc.player);
            const homeScorers = parsedScorers.filter(sc => sc.team === m.team_home);
            const awayScorers = parsedScorers.filter(sc => sc.team === m.team_away);
            const renderScorer = sc => {
              const picked = selectedScorers.has(sc.player);
              return `
                <span class="inline-flex items-center gap-1 rounded-full px-2 py-1 ${picked ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-200' : 'bg-slate-900/80 border border-slate-800 text-slate-300'} text-[10px] truncate">
                  ${getPlayerFlag(sc.player)}
                  <span class="truncate">${sc.player}</span>
                </span>
              `;
            };
            return `
              <div class="grid gap-2 sm:grid-cols-2 border-t border-slate-900/40 pt-2">
                <div class="space-y-1">
                  <div class="uppercase tracking-[0.18em] text-[9px] text-slate-500 font-semibold">${m.team_home}</div>
                  <div class="flex flex-wrap gap-1">${homeScorers.length > 0 ? homeScorers.map(renderScorer).join('') : '<span class="text-slate-500">-</span>'}</div>
                </div>
                <div class="space-y-1">
                  <div class="uppercase tracking-[0.18em] text-[9px] text-slate-500 font-semibold">${m.team_away}</div>
                  <div class="flex flex-wrap gap-1">${awayScorers.length > 0 ? awayScorers.map(renderScorer).join('') : '<span class="text-slate-500">-</span>'}</div>
                </div>
              </div>
            `;
          })()}
        ` : ''}
      </div>
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

  // Construir conjunto de goleadores elegibles (bombos de la porra)
  const eligibleSet = new Set();
  Object.values(players).forEach(list => list.forEach(p => eligibleSet.add(p)));

  const onlyEligible = document.getElementById('scorersEligibleToggle')?.checked;

  // Ordenar de mayor a menor número de goles y mostrar todos los goleadores registrados
  const sortedPlayers = Object.entries(scorers.players)
    .sort((a, b) => b[1] - a[1]);

  let rank = 0;
  sortedPlayers.forEach(([playerName, goals]) => {
    // Si está el filtro activo y el jugador no es elegible, saltar
    if (onlyEligible && !eligibleSet.has(playerName)) return;

    rank += 1;
    const isPichichi = rank === 1;
    const isEligible = eligibleSet.has(playerName);

    container.innerHTML += `
      <div class="flex justify-between items-center py-2.5 text-xs">
        <div class="flex items-center gap-2">
          <span class="font-bold text-slate-500 w-4">${rank}.</span>
          <span class="font-extrabold ${isPichichi ? 'text-amber-400 font-black' : 'text-slate-200'}">${getPlayerFlag(playerName)} ${playerName}</span>
          ${isPichichi ? '<span class="badge bg-amber-500 text-slate-950 font-black text-[9px] scale-90">PICHICHI</span>' : ''}
          ${isEligible ? '<span class="badge badge-sm badge-success font-bold text-xs ml-2">Elegible</span>' : ''}
        </div>
        <span class="badge badge-sm badge-rose font-bold text-xs">${goals} goles</span>
      </div>
    `;
  });
}
