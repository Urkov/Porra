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
  "Haití": "ht",
  "República Checa": "cz",
  "Arabia Saudita": "sa",
  "Irán": "ir"
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
  "Haití": "🇭🇹",
  "República Checa": "🇨🇿",
  "Arabia Saudita": "🇸🇦",
  "Irán": "🇮🇷"
};

const WEEKDAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
function getWeekday(dateStr) {
  if (!dateStr) return "";
  try {
    // Formato scraper: MM/DD/YYYY
    if (dateStr.includes('/')) {
      const [mo, d, y] = dateStr.split('/');
      return WEEKDAYS[new Date(`${y}-${mo}-${d}T00:00:00`).getDay()] || "";
    }
    // Formato ISO: YYYY-MM-DD
    return WEEKDAYS[new Date(dateStr + "T00:00:00").getDay()] || "";
  } catch (e) {
    return "";
  }
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  // MM/DD/YYYY → DD/MM
  if (dateStr.includes('/')) {
    const [mo, d] = dateStr.split('/');
    return `${d}/${mo}`;
  }
  // YYYY-MM-DD → DD/MM
  const parts = dateStr.split("-");
  if (parts.length !== 3) return dateStr;
  return `${parts[2]}/${parts[1]}`;
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

/**
 * Normalización de nombres de jugadores FIFA → nombre canónico de players.json.
 *
 * En lugar de mantener una lista manual de aliases, construimos un mapa
 * automático a partir de los propios datos de players.json (que se carga en
 * loadDatabase). El mapa se indexa en minúsculas para ser insensible a
 * mayúsculas, tildes y variantes ortográficas menores.
 *
 * Estrategia de búsqueda (en orden):
 *  1. Nombre completo en minúsculas           → "jonathan david"    ✓
 *  2. Todo en Title Case y luego minúsculas   → "Jonathan DAVID" → "jonathan david" ✓
 *  3. Solo el último token en minúsculas      → "HAALAND" → "haaland" (fallback apellido)
 *  4. Alias conocidos (PLAYER_KNOWN_ALIASES)  → "vinícius júnior" → "Vinícius Jr." ✓
 *  5. Sin match → devuelve el nombre original para no perder datos.
 *
 * PLAYER_KNOWN_ALIASES: mapa estático para jugadores cuyo nombre en la API
 * de FIFA difiere estructuralmente del canónico de players.json y no puede
 * resolverse con las estrategias anteriores.
 * Clave: forma FIFA en minúsculas. Valor: nombre exacto de players.json.
 *
 * RAZÓN de cada entrada:
 *  - Vinícius Jr.:    FIFA devuelve "Vinícius JÚNIOR" — "JÚNIOR" ≠ "Jr."
 *  - Rafael Leao:     FIFA puede devolver "Rafael LEÃO" (con acento en la o)
 *  - Julian Alvarez:  FIFA puede devolver "Julián ÁLVAREZ" (con tildes)
 */
const PLAYER_KNOWN_ALIASES = {
  // Vinícius Jr. — variantes posibles de la API FIFA en es-ES
  "vinícius júnior":  "Vinícius Jr.",
  "vinicius junior":  "Vinícius Jr.",
  "vinícius junior":  "Vinícius Jr.",
  "vinicius júnior":  "Vinícius Jr.",
  // Rafael Leão — FIFA puede devolver con tilde en la o
  "rafael leão":      "Rafael Leao",
  // Kylian Mbappé — FIFA en es-ES elimina el acento francés (é → e)
  "kylian mbappe":    "Kylian Mbappé",
  // Ousmane Dembélé — jugador francés, mismo patrón que Mbappé (é → e)
  "ousmane dembele":  "Ousmane Dembélé",
  // Leroy Sané — mismo carácter é, probable strip en es-ES
  "leroy sane":       "Leroy Sané",
  // Lautaro Martínez — FIFA puede devolver "MARTINEZ" sin tildes
  "lautaro martinez": "Lautaro Martínez",
  // Luis Díaz — probable "Luis DIAZ" en es-ES
  "luis diaz":        "Luis Díaz",
  // Darwin Núñez — la ñ es española y FIFA en es-ES suele conservarla,
  // pero la ú puede caer → "Darwin Nunez"
  "darwin nunez":     "Darwin Núñez",
  // Julián Álvarez — FIFA puede devolver con tildes (players.json va sin ellas)
  "julián álvarez":   "Julian Alvarez",
  "julian álvarez":   "Julian Alvarez",
  "julián alvarez":   "Julian Alvarez",
  // Viktor Gyökeres — FIFA en es-ES puede devolver sin diéresis (ö → o)
  // o en forma Unicode descompuesta (NFD), lo que impide el match automático
  "viktor gyokeres":  "Viktor Gyökeres",
  // Alexander Sørloth — la ø noruega (U+00F8) no existe en lenguas latinas;
  // FIFA en es-ES casi seguro la elimina → "Sorloth"
  "alexander sorloth": "Alexander Sørloth",
  // Arda Güler — la ü turca (U+00FC) no existe en español;
  // FIFA en es-ES puede eliminarla → "Guler"
  "arda guler":        "Arda Güler",
};

let _playerCanonicalMap = null;

function buildPlayerCanonicalMap() {
  if (_playerCanonicalMap) return _playerCanonicalMap;
  _playerCanonicalMap = {};

  // Fase 1: volcar aliases estáticos (menor precedencia; los nombres exactos
  // de players.json los sobreescriben a continuación si hay colisión).
  Object.entries(PLAYER_KNOWN_ALIASES).forEach(([alias, canonical]) => {
    _playerCanonicalMap[alias] = canonical;
  });

  // Fase 2: nombres canónicos de players.json (siempre tienen mayor prioridad)
  Object.values(players).forEach(list => {
    list.forEach(canonicalName => {
      // Índice por nombre completo en minúsculas (máxima precisión)
      _playerCanonicalMap[canonicalName.toLowerCase()] = canonicalName;
      // Índice por versión Title Case en minúsculas (cubre "Jonathan DAVID" → "jonathan david")
      const titleCase = canonicalName.replace(/\b\w/g, c => c.toUpperCase());
      _playerCanonicalMap[titleCase.toLowerCase()] = canonicalName;
      // Índice por último apellido en minúsculas (fallback: "HAALAND" → "haaland")
      const lastName = canonicalName.split(' ').pop().toLowerCase();
      // Solo lo añadimos si no hay colisión con otro jugador
      if (!_playerCanonicalMap[lastName]) {
        _playerCanonicalMap[lastName] = canonicalName;
      }
    });
  });
  return _playerCanonicalMap;
}

function normalizePlayerName(name) {
  if (!name) return name;
  // Unificar representaciones Unicode (NFD de la API → NFC de players.json)
  name = name.normalize('NFC');
  const map = buildPlayerCanonicalMap();

  // 1. Nombre tal cual en minúsculas
  const lower = name.toLowerCase();
  if (map[lower]) return map[lower];

  // 2. Convertir a Title Case (cada palabra con inicial mayúscula) y buscar en minúsculas
  //    Esto cubre el formato FIFA "Nombre APELLIDO" → "nombre apellido"
  const titleLower = name.replace(/\b\w+/g, w =>
    w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
  ).toLowerCase();
  if (map[titleLower]) return map[titleLower];

  // 3. Solo el último token (apellido), útil si la API devuelve solo apellido en mayúsculas
  const lastToken = name.trim().split(/\s+/).pop().toLowerCase();
  if (map[lastToken]) return map[lastToken];

  // Sin match: devolver el original para no perder datos en la visualización
  return name;
}

// Exponer globalmente para que admin.js u otros scripts también lo usen
window.normalizePlayerName = normalizePlayerName;
// Invalidar el mapa si players se recarga (p.ej. en previsualización admin)
function invalidatePlayerCanonicalMap() { _playerCanonicalMap = null; }
window.invalidatePlayerCanonicalMap = invalidatePlayerCanonicalMap;

function getPlayerFlag(playerName, isLarge = false) {
  if (!playerName) return "";
  const canonical = normalizePlayerName(playerName);
  const team = PLAYER_TEAMS[canonical];
  if (!team) return "";
  return getTeamFlag(team, isLarge);
}

function getPlayerFlagEmoji(playerName) {
  if (!playerName) return "";
  const canonical = normalizePlayerName(playerName);
  const team = PLAYER_TEAMS[canonical];
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
    participantPlayers.forEach(rawName => {
      const pName = normalizePlayerName(rawName);
      const team = PLAYER_TEAMS[pName];
      const key = team ? `${team}:${pName}` : pName;
      const goals = (scorers.players && (scorers.players[key] || scorers.players[pName])) || 0;
      if (goals > 0) {
        scoreGoles += goals * rules.points.goal_pts;
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
      const eligibleRealPichichis = currentActualResults.actual_pichichi.map(pKey => {
        const parts = pKey.split(':');
        return parts.length > 1 ? parts[1] : pKey;
      }).filter(p => eligibleSet.has(p));
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
      <td class="text-center font-bold text-sm w-12 md:w-16 px-1 md:px-4">
        <span class="badge ${badgeClass} badge-sm md:badge-md p-2">${icon}</span>
      </td>
      <td class="font-bold text-white text-sm md:text-base py-2 md:py-3">
        <div class="flex items-center justify-between gap-2">
          <div class="min-w-0">
            <div class="truncate">${participant.name}</div>
            ${isLast ? '<span class="text-[10px] text-rose-500 block font-normal">Sótano (10% premio)</span>' : ''}
            ${isFirst ? '<span class="text-[10px] text-amber-400 block font-normal">Líder Provisional (50% premio)</span>' : ''}
            <div class="flex md:hidden flex-wrap gap-x-2 gap-y-0.5 mt-1">
              <span class="text-[12px] text-slate-400">✌🏼 <span class="text-slate-300 font-semibold">${participant.score_details.matches}</span></span>
              <span class="text-[12px] text-slate-400">⚽ <span class="text-slate-300 font-semibold">${participant.score_details.scorers}</span></span>
              <span class="text-[12px] text-slate-400">📊 <span class="text-slate-300 font-semibold">${participant.score_details.groups}</span></span>
              <span class="text-[12px] text-slate-400">⏩ <span class="text-slate-300 font-semibold">${participant.score_details.rounds}</span></span>
              <span class="text-[12px] text-slate-400">4️⃣ <span class="text-slate-300 font-semibold">${participant.score_details.podium}</span></span>
              <span class="text-[12px] ${participant.score_details.pichichi > 0 ? 'text-amber-400' : 'text-slate-400'}">
                🌕 <span class="font-semibold">${participant.score_details.pichichi}</span>
              </span>            
            </div>
          </div>
          <!-- Botón siempre visible: texto en escritorio, icono en móvil -->
          <button onclick="toggleParticipantSelections(event, ${participant.id})" class="btn btn-ghost btn-xs text-slate-300 shrink-0">
            <span class="hidden md:inline">Selecciones</span>
            <i class="fa-solid fa-table-list md:hidden text-xs"></i>
          </button>
        </div>
      </td>
      <td class="hidden md:table-cell text-center text-xs text-slate-300 font-medium">${participant.score_details.matches} pts</td>
      <td class="hidden md:table-cell text-center text-xs text-slate-300 font-medium">${participant.score_details.scorers} pts</td>
      <td class="hidden md:table-cell text-center text-xs text-slate-300 font-medium">${participant.score_details.groups} pts</td>
      <td class="hidden md:table-cell text-center text-xs text-slate-300 font-medium">${participant.score_details.rounds} pts</td>
      <td class="hidden md:table-cell text-center text-xs text-slate-300 font-medium">${participant.score_details.podium} pts</td>
      <td class="hidden md:table-cell text-center text-xs font-medium ${participant.score_details.pichichi > 0 ? 'text-amber-400 font-bold' : 'text-slate-600'}">${participant.score_details.pichichi > 0 ? participant.score_details.pichichi + ' pts 🌟' : '-'}</td>
      <td class="bg-rose-950/20 text-rose-300 text-center font-black text-base md:text-lg rounded-r-xl px-2 md:px-4">${participant.score_details.total}</td>
    `;
    tbody.appendChild(tr);

    const detailRow = document.createElement('tr');
    detailRow.id = `participantSelections-${participant.id}`;
    detailRow.className = 'hidden bg-slate-950/70 border-b border-slate-900/60';
    detailRow.innerHTML = `
      <td colspan="8" class="px-2 md:px-4 py-3 md:py-4 text-[10px] text-slate-300">
        <div class="space-y-2">
          <div class="text-slate-400 uppercase tracking-wide text-[9px] font-semibold">Selecciones + Goleadores</div>

          <!-- Grupos: 3 columnas en móvil (2 filas de 3), 6 en escritorio (1 fila) -->
          <div class="grid grid-cols-3 sm:grid-cols-6 gap-1">
            ${Object.entries(participant.predictions).map(([grpName, teamList]) => `
              <div class="rounded-xl border-l-2 sm:border-l-4 p-1.5 ${getGroupBadgeClasses(grpName)} min-w-0">
                <div class="text-[9px] uppercase tracking-wider font-bold mb-0.5 text-slate-200">${grpName}</div>
                <div class="space-y-0.5">
                  ${teamList.map(team => `
                    <div class="flex items-center gap-0.5 min-w-0">
                      <span class="shrink-0">${getTeamFlag(team)}</span>
                      <span class="truncate text-[9px] leading-tight">${team}</span>
                    </div>
                  `).join('')}
                </div>
              </div>
            `).join('')}
          </div>

          <!-- Goleadores: 2 columnas en móvil, 3 en sm+ -->
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-1">
            ${Object.entries(participant.scorers).map(([jGrp, player]) => `
              <div class="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-950/80 px-1.5 py-1 min-w-0">
                <span class="text-[9px] text-slate-500 font-bold shrink-0">${jGrp}</span>
                <span class="shrink-0">${getPlayerFlag(player)}</span>
                <span class="truncate text-[9px]">${player}</span>
              </div>
            `).join('')}
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
  Object.entries(p.scorers).forEach(([jGrp, rawPlayerSelected]) => {
    const playerSelected = normalizePlayerName(rawPlayerSelected);
    const team = PLAYER_TEAMS[playerSelected];
    const key = team ? `${team}:${playerSelected}` : playerSelected;
    const playerGoals = (scorers.players && (scorers.players[key] || scorers.players[playerSelected])) || 0;
    const ptsEarned = playerGoals * (rules.points.goal_pts || 2);
    
    const isPichichiVal = currentActualResults.actual_pichichi && currentActualResults.actual_pichichi.some(pKey => {
      const parts = pKey.split(':');
      return (parts.length > 1 ? parts[1] : pKey) === playerSelected;
    });

    // Validación: el jugador seleccionado debe pertenecer al bombo correspondiente
    const bomPlayers = players[jGrp] || [];
    const isValidScorer = bomPlayers.includes(playerSelected);
    const invalidClass = isValidScorer ? '' : 'border border-rose-500 bg-rose-950/5';
    const invalidBadge = isValidScorer ? '' : '<span class="badge badge-error text-slate-950 font-bold text-[9px]">Inválido</span>';

    gList.innerHTML += `
      <div class="flex items-center gap-1.5 px-2 py-1.5 rounded ${invalidClass}">
        <span class="${isPichichiVal ? 'text-amber-400 font-black' : 'text-slate-400 font-bold'} w-4 shrink-0 text-xs">${jGrp}</span>
        <span class="text-white truncate flex-1 text-xs">${getPlayerFlag(playerSelected)} ${playerSelected}</span>
        <div class="flex items-center gap-1 shrink-0">
          <span class="badge ${playerGoals > 0 ? 'badge-rose' : 'bg-slate-800'} text-[10px] font-bold px-1.5 whitespace-nowrap">
            ${playerGoals} ⚽ ${playerGoals > 0 ? `<span class="ml-0.5 text-rose-200">(+${ptsEarned} pts)</span>` : ''}
          </span>
          ${invalidBadge}
        </div>
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
    const ptsEarned = isHit ? rules.points.final_classification[pos] : 0;

    podiumList.innerHTML += `
      <div class="bg-slate-900 border ${isHit ? 'border-emerald-500/50' : 'border-slate-800'} p-2 rounded-lg flex flex-col items-center justify-center text-center">
        <span class="text-slate-400 text-[10px] block font-bold">${titles[pos]}</span>
        <span class="font-extrabold ${isHit ? 'text-emerald-400' : 'text-slate-200'}">${getTeamFlag(selectedTeam)} ${selectedTeam}</span>
        <span class="text-[9px] font-bold mt-0.5 ${isHit ? 'text-emerald-400' : 'text-slate-500'}">+${ptsEarned} pts</span>
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
  button.innerHTML = hidden
    ? '<i class="fa-solid fa-eye text-emerald-400 mr-1"></i><span class="hidden sm:inline">Mostrar</span>calendario'
    : '<i class="fa-solid fa-eye-slash text-rose-400 mr-1"></i><span class="hidden sm:inline">Ocultar</span>calendario';
}

let hideFinishedMatches = false;

function toggleFinishedMatches() {
  hideFinishedMatches = !hideFinishedMatches;
  const button = document.getElementById('toggleFinishedBtn');
  if (button) {
    button.innerHTML = hideFinishedMatches
      ? '<i class="fa-solid fa-eye text-emerald-400 mr-1"></i><span class="hidden sm:inline">Mostrar</span>finalizados'
      : '<i class="fa-solid fa-eye-slash text-rose-400 mr-1"></i><span class="hidden sm:inline">Ocultar</span>finalizados';
  }
  renderMatches();
}

let showOnlyFreeToAir = false;

/**
 * Devuelve true si el canal se emite en abierto (La 1, PLAY, RTVE u otros
 * canales de libre acceso). DAZN y similares se excluyen.
 */
function isFreeToAirChannel(channelName) {
  const n = channelName.toLowerCase();
  return (
    n.includes('la 1') ||
    n.includes('la1') ||
    n.includes('play') ||
    n.includes('rtve') ||
    n.includes('tve') ||
    n.includes('rai') ||
    n.includes('zdf') ||
    n.includes('arv') ||
    n.includes('tlc') ||
    n.includes('m6') ||
    n.includes('tf1') ||
    n.includes('das erste')
  );
}

function toggleFreeToAirMatches() {
  showOnlyFreeToAir = !showOnlyFreeToAir;
  const button = document.getElementById('toggleFreeToAirBtn');
  if (button) {
    button.innerHTML = showOnlyFreeToAir
      ? '<i class="fa-solid fa-tv text-emerald-400 mr-1"></i><span class="hidden sm:inline">Partidos</span>en Abierto'
      : '<i class="fa-solid fa-tv text-slate-400 mr-1"></i><span class="hidden sm:inline">Partidos</span>en Abierto';
    button.classList.toggle('border-emerald-500/50', showOnlyFreeToAir);
    button.classList.toggle('text-emerald-300', showOnlyFreeToAir);
  }
  renderMatches();
}

// Caché de canales TV por partido (evita peticiones duplicadas)
const _matchChannelsCache = {};

/**
 * Obtiene los canales de TV disponibles para un partido desde la API de FIFA.
 * Devuelve un array de objetos { Name, Logo, Url } o [] si falla / no hay datos.
 */
async function fetchMatchChannels(matchId) {
  if (_matchChannelsCache[matchId] !== undefined) return _matchChannelsCache[matchId];
  try {
    const res = await fetch(
      `https://api.fifa.com/api/v3/watch/match/285023/${matchId}/ES?language=es`,
      { signal: AbortSignal.timeout(6000) }
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const sources = Array.isArray(data.Sources) ? data.Sources : [];
    // Deduplicar por IdChannel
    const seen = new Set();
    const channels = sources.filter(s => {
      if (seen.has(s.IdChannel)) return false;
      seen.add(s.IdChannel);
      return true;
    }).map(s => ({ Name: s.Name || '', Logo: s.Logo || '', Url: s.Url || s.TvChannelUrl || '' }));
    _matchChannelsCache[matchId] = channels;
    return channels;
  } catch (e) {
    _matchChannelsCache[matchId] = [];
    return [];
  }
}

/**
 * Renderiza el HTML de los canales de TV para un partido.
 * Solo muestra el logo (sin nombre). Fondo blanco para que logos oscuros sean visibles.
 * Si no hay canales devuelve cadena vacía (no ocupa espacio).
 */
function renderChannelsHtml(channels) {
  if (!channels || channels.length === 0) return '';
  const items = channels.map(ch => {
    if (!ch.Logo) return '';
    const nameLower = ch.Name.toLowerCase();
    const isDazn = nameLower.includes('dazn');
    const isRtve = nameLower.includes('rtve') || nameLower.includes('la 1') || nameLower.includes('play');
    const bgClass = isDazn ? 'bg-white/80' : 'bg-white/10';
    const hoverClass = isDazn ? 'hover:bg-white/90' : 'hover:bg-white/20';
    const sizeClass = (isDazn || isRtve) ? 'h-5 max-w-[40px]' : 'h-3.5 max-w-[32px]';
    const img = `<img src="${ch.Logo}" alt="${ch.Name}" title="${ch.Name}" class="${sizeClass} w-auto object-contain" onerror="this.parentElement.style.display='none'" />`;
    return ch.Url
      ? `<a href="${ch.Url}" target="_blank" rel="noopener noreferrer" title="Ver en ${ch.Name}" class="inline-flex items-center justify-center rounded px-1 py-px ${bgClass} ${hoverClass} transition-colors cursor-pointer">${img}</a>`
      : `<span class="inline-flex items-center justify-center rounded px-1 py-px ${bgClass}">${img}</span>`;
  }).filter(Boolean).join('');
  if (!items) return '';
  return `<div class="flex items-center gap-0.5 overflow-hidden">${items}</div>`;
}

// RENDER DEL CALENDARIO DE PARTIDOS
async function renderMatches() {
  const container = document.getElementById('matchesContainer');
  if (!container) return;

  const phaseFilter = document.getElementById('matchPhaseFilter').value;
  const groupFilter = document.getElementById('matchGroupFilter').value;
  const teamFilter = document.getElementById('matchTeamFilter').value;
  const dateFilter = document.getElementById('matchDateFilter').value;
  const venueFilter = document.getElementById('matchVenueFilter').value;

  let filtered = currentMatches.filter(m => {
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
    if (hideFinishedMatches && m.status === 'finished') return false;
    return true;
  });

  // Filtro Partidos en Abierto: pre-fetch de canales y filtrado asíncrono
  if (showOnlyFreeToAir && filtered.length > 0) {
    container.innerHTML = `
      <div class="col-span-2 text-center py-8 text-slate-400 text-sm">
        <i class="fa-solid fa-tv animate-pulse mr-2 text-emerald-400"></i>Buscando partidos en abierto...
      </div>
    `;
    const channelResults = await Promise.all(
      filtered.map(m => m.id ? fetchMatchChannels(m.id) : Promise.resolve([]))
    );
    filtered = filtered.filter((m, i) =>
      channelResults[i].some(ch => isFreeToAirChannel(ch.Name))
    );
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
      <div class="flex items-center text-[10px] text-slate-400 border-b border-slate-900 pb-1.5 uppercase font-bold tracking-wider">
        <span class="flex-1 truncate">${translatePhase(m.phase, m.group)}</span>
        <div id="channels-${m.id}" class="flex-1 flex justify-center"></div>
        <span class="flex-1 text-right ${statusClass}">${statusText}</span>
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
           <span class="shrink-0 flex items-center gap-1.5">
            <i class="fa-solid fa-calendar-day text-rose-500/80"></i>
            <span>${formatDate(m.date)}</span>
            <span class="font-semibold text-slate-300">${getWeekday(m.date)}</span>
            <span class="text-rose-400 font-bold">${m.time}</span>
          </span>
          <span class="truncate max-w-[130px] sm:max-w-[180px]" title="${m.venue || ''}"><i class="fa-solid fa-location-dot mr-1 text-rose-500/80"></i>${m.venue || 'Por definir'}</span>
        </div>
        ${isFinished && Array.isArray(m.scorers) && m.scorers.length > 0 ? `
          ${(() => {
          const selectedScorers = new Set(participants.flatMap(p => Object.values(p.scorers).map(name => normalizePlayerName(name.trim()))));
          const parsedScorers = m.scorers.map(sc => {
            const parts = sc.split(':');
            return {
              team: parts[0]?.trim() || '',
              player: parts.slice(1).join(':').trim() || ''
            };
          }).filter(sc => sc.team && sc.player);
         const homeScorers = parsedScorers.filter(sc => {
            const isOwnGoal = sc.player.endsWith('(p.p.)');
            return isOwnGoal ? sc.team === m.team_away : sc.team === m.team_home;
          });
          const awayScorers = parsedScorers.filter(sc => {
            const isOwnGoal = sc.player.endsWith('(p.p.)');
            return isOwnGoal ? sc.team === m.team_home : sc.team === m.team_away;
          });
          const renderScorer = sc => {
            const canonical = normalizePlayerName(sc.player);
            const picked = selectedScorers.has(canonical);
            const isOwnGoal = sc.player.endsWith('(p.p.)');
            const flagHtml = getPlayerFlag(canonical) || getTeamFlag(sc.team);
            return `
                <span class="inline-flex items-center gap-1 rounded-full px-2 py-1 ${picked ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-200' : 'bg-slate-900/80 border border-slate-800 text-slate-300'} text-[10px] truncate">
                  ${flagHtml}
                  <span class="truncate">${canonical}</span>
                </span>
              `;
          };
          return `
              <div class="grid gap-2 grid-cols-2 border-t border-slate-900/40 pt-2 mt-1">
                <div class="space-y-1">
                  <div class="flex flex-wrap gap-1 justify-start">${homeScorers.length > 0 ? homeScorers.map(renderScorer).join('') : '<span class="text-slate-600 text-[10px]">-</span>'}</div>
                </div>
                <div class="space-y-1">
                  <div class="flex flex-wrap gap-1 justify-end">${awayScorers.length > 0 ? awayScorers.map(renderScorer).join('') : '<span class="text-slate-600 text-[10px]">-</span>'}</div>
                </div>
              </div>
            `;
        })()}
        ` : ''}
      </div>
    `;

    container.appendChild(card);

    // Cargar canales de TV de forma asíncrona e inyectarlos en el placeholder
    if (m.id) {
      fetchMatchChannels(m.id).then(channels => {
        const placeholder = document.getElementById(`channels-${m.id}`);
        if (placeholder) placeholder.innerHTML = renderChannelsHtml(channels);
      });
    }
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

  // Construir conjunto de goleadores elegibles (bombos de la porra) — nombres canónicos
  const eligibleSet = new Set();
  Object.values(players).forEach(list => list.forEach(p => eligibleSet.add(p)));

  const onlyEligible = document.getElementById('scorersEligibleToggle')?.checked;

  // Ordenar de mayor a menor número de goles
  const sortedPlayers = Object.entries(scorers.players)
    .sort((a, b) => b[1] - a[1]);

  const realPichichiKey = sortedPlayers.length > 0 ? sortedPlayers[0][0] : null;
  let rank = 0;
  sortedPlayers.forEach(([key, goals]) => {
    const parts = key.split(':');
    const teamName = parts.length > 1 ? parts[0] : null;
    const rawPlayerName = parts.length > 1 ? parts[1] : key;
    // Normalizar al nombre canónico para detectar elegibilidad correctamente
    const playerName = normalizePlayerName(rawPlayerName);

    const isEligible = eligibleSet.has(playerName);

    // Si está el filtro activo y el jugador no es elegible, saltar
    if (onlyEligible && !isEligible) return;

    rank += 1;
    const isPichichi = key === realPichichiKey;

    const flagHtml = teamName ? getTeamFlag(teamName) : getPlayerFlag(playerName);

    const assistKey = teamName ? `${teamName}:${rawPlayerName}` : rawPlayerName;
    const assists = (scorers.assists && (scorers.assists[assistKey] || scorers.assists[rawPlayerName])) || 0;

    // Nombre en verde si es elegible de la porra
    const nameClass = isEligible
      ? (isPichichi ? 'text-amber-400 font-black' : 'text-emerald-300 font-bold')
      : (isPichichi ? 'text-amber-400 font-black' : 'text-slate-300');

    // Badge de goles: ancho fijo para que todos queden alineados
    const goalsHtml = `<span class="inline-block w-14 text-right font-black text-xs ${isPichichi ? 'text-amber-400' : isEligible ? 'text-emerald-300' : 'text-slate-200'}">${goals} ${isPichichi ? '🌕' : '⚽'}</span>`;

    // Asistencias: a la derecha de los goles, sólo si hay
    const assistsHtml = assists > 0
      ? `<span class="inline-block w-12 text-right text-[10px] text-slate-400 font-normal">${assists} ➡ </span>`
      : `<span class="inline-block w-12"></span>`;

    container.innerHTML += `
      <div class="flex items-center py-2 text-xs gap-1.5">
        <span class="font-bold text-slate-500 w-5 shrink-0 text-right">${rank}.</span>
        <span class="shrink-0">${flagHtml}</span>
        <span class="truncate flex-1 ${nameClass}">${playerName}</span>
        ${goalsHtml}${assistsHtml}
      </div>
    `;
  });
}