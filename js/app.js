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
  populateOfficialGroupsFilter();
  computeScores();
  renderLeaderboard();
  renderOfficialGroups();
  renderMatches();
  renderScorers();
  renderRulesCatalog();
  updateScoresToggleUI();
  if (typeof renderKnockoutBracket === 'function') renderKnockoutBracket();
});

/**
 * Rellena el desplegable de filtro de participante en la sección de grupos oficiales.
 * Se llama tras loadDatabase() para tener la lista de participantes disponible.
 */
function populateOfficialGroupsFilter() {
  const select = document.getElementById('officialGroupsParticipantFilter');
  if (!select) return;
  // Preservar la selección actual si ya tenía opciones
  const current = select.value;
  select.innerHTML = '<option value="all">Vista general</option>';
  participants.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.id;
    opt.textContent = p.name;
    select.appendChild(opt);
  });
  if (current && current !== 'all') select.value = current;
}

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
    const dataFiles = [
      'data/rules.json',
      'data/teams.json',
      'data/players.json',
      'data/participants.json',
      'data/matches.json',
      'data/scorers.json',
      'data/actual_results.json'
    ];

    const responses = await Promise.all(dataFiles.map(url => fetch(url)));
    updateLastUpdatedFromResponses(responses);

    const [rulesRes, teamsRes, playersRes, participantsRes, matchesRes, scorersRes, actualResultsRes] = await Promise.all(
      responses.map(r => r.json())
    );

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

// Calcula la fecha de modificación más reciente entre los ficheros de datos
// (a partir de la cabecera HTTP "Last-Modified") y la muestra en la cabecera
// de la web, formateada en hora española (Europe/Madrid).
function updateLastUpdatedFromResponses(responses) {
  try {
    let latest = null;
    responses.forEach(res => {
      const header = res.headers.get('last-modified');
      if (!header) return;
      const date = new Date(header);
      if (!isNaN(date.getTime()) && (!latest || date > latest)) {
        latest = date;
      }
    });

    const el = document.getElementById('lastUpdatedText');
    if (!el) return;

    if (!latest) {
      el.textContent = 'Actualizado: --';
      return;
    }

    const formatted = new Intl.DateTimeFormat('es-ES', {
      timeZone: 'Europe/Madrid',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(latest);

    el.textContent = `Actualizado: ${formatted}`;
  } catch (error) {
    console.error('Error calculando la fecha de última actualización:', error);
  }
}

// Retorna el ID de grupo al que pertenece una selección
function getTeamGroup(team) {
  for (const [groupName, teamList] of Object.entries(teams)) {
    if (teamList.includes(team)) return groupName;
  }
  return null;
}

/**
 * Devuelve el grupo REAL del Mundial (A-L) de un equipo buscando en actual_positions.
 * Necesario porque teams.json usa grupos de la porra (A-F, 8 equipos),
 * mientras actual_positions usa grupos del Mundial (A-L, 4 equipos).
 */
function getTeamWCGroup(team, actualPositions) {
  for (const [grp, list] of Object.entries(actualPositions || {})) {
    if (Array.isArray(list) && list.includes(team)) return grp;
  }
  return null;
}

/**
 * Devuelve la posición real (1-4) de un equipo en su grupo del Mundial,
 * buscando primero en actual_positions (definitivo) y luego en wcStandings (provisional).
 */
function getTeamRealPos(team, actualPositions, wcStandingsMap) {
  // 1) Buscar en actual_positions (definitivo)
  for (const list of Object.values(actualPositions || {})) {
    if (!Array.isArray(list) || list.length === 0) continue;
    const idx = list.indexOf(team);
    if (idx !== -1) return { pos: idx + 1, definitive: true };
  }
  // 2) Fallback: standings provisionales (played >= 3 = grupo terminado)
  for (const rows of Object.values(wcStandingsMap || {})) {
    const row = rows.find(r => r.team === team);
    if (row) return { pos: row.position, definitive: row.played >= 3 };
  }
  return { pos: null, definitive: false };
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

/**
 * Resuelve el podio final (P1-P4) derivándolo SIEMPRE de los resultados
 * reales de los partidos de Final y 3er Puesto registrados en matchList.
 *
 * - P3/P4 se extraen del partido '3rd_place' terminado.
 * - P1/P2 se extraen del partido 'Final' terminado.
 * - Si el partido correspondiente aún no ha terminado, la posición queda
 *   vacía (nunca se usan datos manuales de actual_podium para P1/P2 cuando
 *   la final no se ha jugado, para evitar que datos incorrectos otorguen
 *   puntos de podio prematuramente).
 * - Si no existe ningún partido con esa fase en matchList, se usa el dato
 *   manual de podiumData como fallback (para el caso extremo de que el
 *   partido no esté en matches.json pero sí en actual_results.json).
 */
function resolveActualPodium(podiumData, matchList) {
  const result = { P1: '', P2: '', P3: '', P4: '' };

  // ── P3 / P4: partido del 3er puesto ───────────────────────────────────
  const thirdMatch = (matchList || []).find(m => m.phase === '3rd_place');
  if (thirdMatch) {
    if (thirdMatch.status === 'finished') {
      const w3 = thirdMatch.decided_by === 'penalties'
        ? thirdMatch.winner_passed
        : (Number(thirdMatch.score_home) > Number(thirdMatch.score_away)
            ? thirdMatch.team_home : thirdMatch.team_away);
      result.P3 = w3 || '';
      result.P4 = (w3 === thirdMatch.team_home ? thirdMatch.team_away : thirdMatch.team_home) || '';
    }
    // partido no terminado → P3/P4 vacíos (no usamos dato manual)
  } else {
    // No hay partido de 3er puesto en matches.json → fallback manual
    result.P3 = (podiumData && podiumData.P3) || '';
    result.P4 = (podiumData && podiumData.P4) || '';
  }

  // ── P1 / P2: final ────────────────────────────────────────────────────
  const finalMatch = (matchList || []).find(m => m.phase === 'Final');
  if (finalMatch) {
    if (finalMatch.status === 'finished') {
      const champion = finalMatch.decided_by === 'penalties'
        ? finalMatch.winner_passed
        : (Number(finalMatch.score_home) > Number(finalMatch.score_away)
            ? finalMatch.team_home : finalMatch.team_away);
      result.P1 = champion || '';
      result.P2 = (champion === finalMatch.team_home ? finalMatch.team_away : finalMatch.team_home) || '';
    }
    // final no terminada → P1/P2 vacíos (no usamos dato manual para evitar
    // dar puntos prematuramente con datos incorrectos en actual_podium)
  } else {
    // No hay final en matches.json → fallback manual
    result.P1 = (podiumData && podiumData.P1) || '';
    result.P2 = (podiumData && podiumData.P2) || '';
  }

  return result;
}

// ALGORITMO INTEGRAL DEL MOTOR DE CÁLCULO DE LA PORRA
function computeScores() {
  // Precalcular standings y posición real (1º-4º) de cada equipo en su
  // propio grupo oficial del Mundial, una sola vez para todos.
  const wcStandings = computeOfficialGroupStandings(currentMatches);
  const teamRealPosition = buildTeamRealPositionMap(wcStandings);

  // Determinar qué puntos son ya definitivos (no provisionales):
  // - Puntos de posición de grupo: definitivos cuando el equipo ha jugado 3 partidos
  // - Pase 1º/2º: definitivo cuando su propio grupo ha cerrado los 3 partidos
  // - Pase 3º (mejor tercero): definitivo cuando los 12 grupos han cerrado todos sus partidos
  //   (solo entonces se conocen los 8 mejores terceros de forma definitiva)
  const allGroupsFinished = Object.keys(wcStandings).length >= 12 &&
    Object.values(wcStandings).every(rows => rows.every(r => r.played >= 3));

  // Función auxiliar: ¿ha terminado el grupo oficial de este equipo?
  function groupIsFinished(teamName) {
    const standing = Object.values(wcStandings).flatMap(r => r).find(r => r.team === teamName);
    return standing && standing.played >= 3;
  }

  participants.forEach(participant => {
    let scoreGoles = 0;
    let scoreMatches = 0;
    let scoreGroups = 0;
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

      // Evaluar si es ronda de eliminatoria y hay clasificado.
      // El partido por el 3er puesto (fase '3rd_place') queda excluido a
      // propósito: aunque cuenta como partido normal (puntos de
      // victoria/empate ya calculados arriba), NO da puntos de "pase de
      // ronda" a ninguno de los dos equipos, porque no hay ninguna fase
      // siguiente a la que clasificar desde ahí (ni para el que gana y
      // queda 3º, ni para el que pierde y queda 4º). La Final también queda
      // excluida: el campeón no avanza a ninguna ronda más, sus puntos de
      // victoria (+6) y de podio (+20) ya lo reflejan suficientemente.
      if (match.phase !== 'groups' && match.phase !== '3rd_place' && match.phase !== 'Final') {
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

    // 4. CLASIFICACIÓN FASE DE GRUPOS (10, 6, 2 PTS SEGÚN POSICIÓN REAL 1º-4º
    //    DE CADA EQUIPO EN SU PROPIO GRUPO OFICIAL DEL MUNDIAL, A-L)
    // Si actual_positions[grpName] tiene datos (fijados manualmente por el
    // admin al final de la fase de grupos, como lista ordenada de los 4
    // equipos de ESE grupo de porra) se usan directamente. Si está vacío,
    // se usa la posición real de cada equipo en su propio grupo oficial,
    // calculada en tiempo real desde los standings del Mundial
    // (teamRealPosition). Importante: la posición real es una propiedad de
    // cada equipo individual, NO un ranking dentro del grupo de porra —
    // varios equipos de un mismo grupo de porra pueden compartir la misma
    // posición real (p.ej. si el grupo de porra junta a varios cabezas de
    // grupo, todos están en posición 1 a la vez).
    Object.entries(participant.predictions).forEach(([grpName, predictedList]) => {
      predictedList.forEach((team_pred) => {
        const { pos: realPosNumber, definitive: isDefinitive } =
          getTeamRealPos(team_pred, currentActualResults.actual_positions, wcStandings);
        if (realPosNumber === null) return;
        if (!showProvisional && !isDefinitive) return;
        if (realPosNumber === 1) scoreGroups += rules.points.group_position["1"];
        else if (realPosNumber === 2) scoreGroups += rules.points.group_position["2"];
        else if (realPosNumber === 3) scoreGroups += rules.points.group_position["3"];
      });
    });

    // 4b. PASE DE RONDA: CLASIFICARSE A DIECISEISAVOS (1º o 2º en grupo terminado)
    // Un equipo pasa de ronda al terminar la fase de grupos si queda 1º o 2º.
    // Se detecta cuando su grupo oficial ha completado los 3 partidos por equipo.
    // Solo se suma si el participante lo tenía elegido y no se ha sumado ya
    // por un partido eliminatorio posterior.
    Object.entries(participant.predictions).forEach(([grpName, predictedList]) => {
      predictedList.forEach((team_pred) => {
        // Evitar doble conteo: solo saltar si ya se sumó este pase concreto (grupos → dieciseisavos).
        // No saltar si el equipo ya aparece en fases eliminatorias posteriores, porque esos son
        // pases de ronda distintos (dieciseisavos → octavos, etc.) que se suman por separado.
        const alreadyCounted = roundsPassedByTeamsByPhase['groups_to_r16']?.has(team_pred);
        if (alreadyCounted) return;

        const { pos: realPosNumber, definitive: groupFinished } =
          getTeamRealPos(team_pred, currentActualResults.actual_positions, wcStandings);

        // Pase 1º/2º: definitivo en cuanto su propio grupo cierra los 3 partidos.
        // No es necesario esperar al inicio de eliminatorias.
        if (groupFinished && (realPosNumber === 1 || realPosNumber === 2)) {
          if (!roundsPassedByTeamsByPhase['groups_to_r16']) roundsPassedByTeamsByPhase['groups_to_r16'] = new Set();
          roundsPassedByTeamsByPhase['groups_to_r16'].add(team_pred);
          const gp = getTeamGroup(team_pred);
          let pts = rules.points.round_passed_base;
          if (gp === 'C' || gp === 'D') pts += rules.points.group_cd_extra.round_passed;
          if (gp === 'E' || gp === 'F') pts += rules.points.group_ef_extra.round_passed;
          scoreRounds += pts;
        }

        // Pase 3º (mejores 8 terceros): provisional si ahora está en el top-8 de los grupos
        // ya terminados (puede cambiar); definitivo solo cuando los 12 grupos hayan cerrado.
        if (groupFinished && realPosNumber === 3) {
          const bestThirdsNow = getBestThirds(wcStandings);
          const isInBestThirds = bestThirdsNow.has(team_pred);
          // Definitivo cuando todos los 12 grupos han terminado sus 3 partidos
          const thirdR16Definitive = allGroupsFinished;
          if (isInBestThirds && (showProvisional || thirdR16Definitive)) {
            if (!roundsPassedByTeamsByPhase['groups_to_r16']) roundsPassedByTeamsByPhase['groups_to_r16'] = new Set();
            roundsPassedByTeamsByPhase['groups_to_r16'].add(team_pred);
            const gp = getTeamGroup(team_pred);
            let pts = rules.points.round_passed_base;
            if (gp === 'C' || gp === 'D') pts += rules.points.group_cd_extra.round_passed;
            if (gp === 'E' || gp === 'F') pts += rules.points.group_ef_extra.round_passed;
            scoreRounds += pts;
          }
        }
      });
    });

    // 5. CLASIFICACIÓN DEL PODIO FINAL (CAMP, SUBC, 3º, 4º)
    // Usamos resolveActualPodium para derivar P1-P4 desde los resultados
    // reales de los partidos (Final y 3er Puesto), no desde datos manuales
    // de actual_podium que pueden estar desactualizados o ser incorrectos.
    if (participant.podium) {
      const rp = resolveActualPodium(currentActualResults.actual_podium, currentMatches);
      if (rp.P1 && participant.podium.P1 === rp.P1) scorePodium += rules.points.final_classification.P1;
      if (rp.P2 && participant.podium.P2 === rp.P2) scorePodium += rules.points.final_classification.P2;
      if (rp.P3 && participant.podium.P3 === rp.P3) scorePodium += rules.points.final_classification.P3;
      if (rp.P4 && participant.podium.P4 === rp.P4) scorePodium += rules.points.final_classification.P4;
    }

    // Total de puntos para este participante
    participant.score_details = {
      scorers: scoreGoles,
      matches: scoreMatches,
      groups: scoreGroups,
      rounds: scoreRounds,
      podium: scorePodium,
      pichichi: scorePichichi,
      total: scoreGoles + scoreMatches + scoreGroups + scoreRounds + scorePodium + scorePichichi
    };
  });
}

// ── TOGGLE PUNTOS PROVISIONALES ──────────────────────────────────────────────
// showProvisional: true  → total incluye puntos provisionales (grupo + r16 prov.)
//                  false → total solo cuenta partidos + goles (puntos ya cerrados)
// Los puntos de grupo/ronda dejan de ser "provisionales" cuando el grupo oficial
// ha terminado (played>=3) o ya existen partidos eliminatorios respectivamente;
// en ese caso ambos modos muestran lo mismo automáticamente.
let showProvisional = localStorage.getItem('showProvisional') !== 'false'; // default: true

function toggleScoresVisibility() {
  showProvisional = !showProvisional;
  localStorage.setItem('showProvisional', showProvisional);
  updateScoresToggleUI();
  computeScores();
  renderLeaderboard();
  renderOfficialGroups();
}

function updateScoresToggleUI() {
  const label = document.getElementById('toggleScoresLabel');
  if (!label) return;
  if (showProvisional) {
    label.textContent = 'Con pts provisionales';
    label.className = 'text-emerald-400 text-xs';
  } else {
    label.textContent = 'Sin pts provisionales';
    label.className = 'text-slate-400 text-xs';
  }
}

// RENDER DE LA TABLA GENERAL DE PARTICIPANTES (LEADERBOARD)
function renderLeaderboard() {
  const tbody = document.getElementById('leaderboardBody');
  if (!tbody) return;

  const sorted = [...participants].sort((a, b) => b.score_details.total - a.score_details.total);

  tbody.innerHTML = '';

  // Precalcular equipos eliminados para el contador de selecciones vivas
  const wcStandingsLB = computeOfficialGroupStandings(currentMatches);
  const allGroupsFinishedLB = Object.keys(wcStandingsLB).length >= 12 &&
    Object.values(wcStandingsLB).every(rows => rows.every(r => r.played >= 3));
  const bestThirdsLB = getBestThirds(wcStandingsLB);
  const knockoutEliminatedLB = new Set();
  currentMatches.forEach(m => {
    if (m.status !== 'finished' || m.phase === 'groups') return;
    const winner = m.decided_by === 'penalties' ? m.winner_passed
                 : (m.score_home > m.score_away ? m.team_home : m.team_away);
    if (winner === m.team_home) knockoutEliminatedLB.add(m.team_away);
    else if (winner === m.team_away) knockoutEliminatedLB.add(m.team_home);
  });

  function isTeamAlive(teamName) {
    if (knockoutEliminatedLB.has(teamName)) return false;
    // Buscar su posición real en grupos
    for (const rows of Object.values(wcStandingsLB)) {
      const row = rows.find(r => r.team === teamName);
      if (!row) continue;
      if (row.played >= 3) {
        if (row.position === 4) return false;
        if (row.position === 3 && allGroupsFinishedLB && !bestThirdsLB.has(teamName)) return false;
      } else if (row.position === 4 && checkFourthMathematicallyOut(teamName, wcStandingsLB, currentMatches)) {
        return false;
      }
    }
    return true;
  }

  function countAliveSelections(participant) {
    const allTeams = Object.values(participant.predictions).flat();
    return allTeams.filter(t => isTeamAlive(t)).length;
  }

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

    const aliveCount = countAliveSelections(participant);
    const totalSelections = Object.values(participant.predictions).flat().length;
    const aliveColor = aliveCount === 0 ? 'text-rose-500' : aliveCount <= 3 ? 'text-amber-400' : 'text-emerald-400';
    const aliveHtml = `<span class="text-[10px] font-normal ${aliveColor} ml-1">(${aliveCount} de ${totalSelections})</span>`;

    const tr = document.createElement('tr');
    tr.className = `hover:bg-slate-900 border-b border-slate-900/60 cursor-pointer transition ${highlightClass}`;
    tr.onclick = () => showParticipantDetail(participant.id);

    tr.innerHTML = `
      <td class="w-[28px] text-center align-middle px-0 pl-1 pr-0">
        <span class="inline-flex items-center justify-center w-full">
          <span class="badge ${badgeClass} w-5 h-5 flex items-center justify-center p-0 text-[9px] leading-none">
            ${icon}
          </span>
        </span>
      </td>
      <td class="font-bold text-white text-sm md:text-base py-2 md:py-3">
        <div class="flex items-center justify-between gap-2">
          <div class="min-w-0">
            <div class="truncate">${participant.name}${aliveHtml}</div>
            ${isLast ? '<span class="text-[10px] text-rose-500 block font-normal">Sótano (10% premio)</span>' : ''}
            ${isFirst ? '<span class="text-[10px] text-amber-400 block font-normal">Líder Provisional (50% premio)</span>' : ''}
            <div class="flex lg:hidden flex-wrap gap-x-2 gap-y-0.5 mt-1">
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
            <span class="hidden lg:inline">Elecciones</span>
            <i class="fa-solid fa-table-list lg:hidden text-xs"></i>
          </button>
        </div>
      </td>
      <td class="hidden lg:table-cell text-center text-xs text-slate-300 font-medium">${participant.score_details.matches} pts</td>
      <td class="hidden lg:table-cell text-center text-xs text-slate-300 font-medium">${participant.score_details.scorers} pts</td>
      <td class="hidden lg:table-cell text-center text-xs text-slate-300 font-medium">${participant.score_details.groups} pts</td>
      <td class="hidden lg:table-cell text-center text-xs text-slate-300 font-medium">${participant.score_details.rounds} pts</td>
      <td class="hidden lg:table-cell text-center text-xs text-slate-300 font-medium">${participant.score_details.podium} pts</td>
      <td class="hidden lg:table-cell text-center text-xs font-medium ${participant.score_details.pichichi > 0 ? 'text-amber-400 font-bold' : 'text-slate-600'}">${participant.score_details.pichichi > 0 ? participant.score_details.pichichi + ' pts 🌟' : '-'}</td>
      <td class="bg-rose-950/20 text-rose-300 text-center font-black text-sm lg:text-lg rounded-r-xl px-0 w-12 lg:px-4 cursor-pointer hover:bg-rose-950/40 transition" onclick="event.stopPropagation(); showParticipantDetail(${participant.id})" title="Ver desglose completo">
        <div class="flex flex-col items-center gap-0.5">
          <span>${participant.score_details.total}</span>
          <span class="text-[8px] text-rose-500/60 font-normal hidden lg:block">ver desglose</span>
        </div>
      </td>
    `;
    tbody.appendChild(tr);

    const detailRow = document.createElement('tr');
    detailRow.id = `participantSelections-${participant.id}`;
    detailRow.className = 'hidden bg-slate-950/70 border-b border-slate-900/60';

    // Calcular puntos por equipo para el desglose inline
    const inlineTeamPoints = computeParticipantTeamPoints(participant);

    detailRow.innerHTML = `
      <td colspan="9" class="px-2 md:px-4 py-3 text-[10px] text-slate-300">
        <div class="space-y-2">
          <!-- Grupos: 2 columnas en móvil/tablet, 3 en escritorio amplio -->
          <div class="grid grid-cols-2 lg:grid-cols-3 gap-1.5">
            ${Object.entries(participant.predictions).map(([grpName, teamList]) => `
              <div class="rounded-xl border-l-2 lg:border-l-4 p-1.5 ${getGroupBadgeClasses(grpName)} min-w-0">
                <div class="text-[9px] uppercase tracking-wider font-bold mb-1 text-slate-200">${grpName}</div>
                <div class="space-y-1">
                  ${teamList.map(team => {
                    const tp = inlineTeamPoints[team];
                    const pts = tp ? tp.total : 0;
                    const ptsBadge = pts > 0
                      ? `<span class="shrink-0 text-[8px] font-black text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 rounded px-1">+${formatPointsLabel(pts)}</span>`
                      : `<span class="shrink-0 text-[8px] text-slate-600 bg-slate-900 border border-slate-800 rounded px-1">0</span>`;
                    return `
                      <div class="flex items-center justify-between gap-0.5 min-w-0">
                        <div class="flex items-center gap-0.5 min-w-0">
                          <span class="shrink-0">${getTeamFlag(team)}</span>
                          <span class="truncate text-[9px] leading-tight">${team}</span>
                        </div>
                        ${ptsBadge}
                      </div>
                    `;
                  }).join('')}
                </div>
              </div>
            `).join('')}
          </div>

          <!-- Goleadores: 2 columnas en móvil/tablet, 3 en escritorio amplio -->
          <div class="grid grid-cols-2 lg:grid-cols-3 gap-1">
            ${Object.entries(participant.scorers).map(([jGrp, player]) => {
              const pName = normalizePlayerName(player);
              const team = PLAYER_TEAMS[pName];
              const key = team ? `${team}:${pName}` : pName;
              const goals = (scorers.players && (scorers.players[key] || scorers.players[pName])) || 0;
              const pts = goals * (rules.points.goal_pts || 2);
              const ptsBadge = goals > 0
                ? `<span class="shrink-0 text-[8px] font-black text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 rounded px-1 whitespace-nowrap">+${pts} pts</span>`
                : '';
              return `
                <div class="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-950/80 px-1.5 py-1 min-w-0">
                  <span class="text-[9px] text-slate-500 font-bold shrink-0">${jGrp}</span>
                  <span class="shrink-0">${getPlayerFlag(player)}</span>
                  <span class="truncate text-[9px] flex-1">${player}</span>
                  ${ptsBadge}
                </div>
              `;
            }).join('')}
          </div>

          <!-- Resumen de puntos -->
          <div class="border-t border-slate-800 pt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[9px] text-slate-400">
            <span>✌🏼 Partidos: <strong class="text-slate-200">${participant.score_details.matches}</strong></span>
            <span>⚽ Goles: <strong class="text-slate-200">${participant.score_details.scorers}</strong></span>
            <span>📊 F.Grupo: <strong class="text-slate-200">${participant.score_details.groups}</strong></span>
            <span>⏩ Rondas: <strong class="text-slate-200">${participant.score_details.rounds}</strong></span>
            <span>🏆 Top4: <strong class="text-slate-200">${participant.score_details.podium}</strong></span>
            ${participant.score_details.pichichi > 0 ? `<span class="text-amber-400">🌕 Pichichi: <strong>${participant.score_details.pichichi}</strong></span>` : ''}
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
  btn.innerText = isAllSelectionRowsVisible() ? 'Ocultar elecciones' : 'Ver elecciones';
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

  // Mismo criterio que computeScores(): determinar qué puntos de
  // posición de grupo / pase de ronda son ya definitivos (no provisionales),
  // para respetar el toggle global showProvisional también en este desglose.
  const wcStandingsTP = computeOfficialGroupStandings(currentMatches);
  const allGroupsFinishedTP = Object.keys(wcStandingsTP).length >= 12 &&
    Object.values(wcStandingsTP).every(rows => rows.every(r => r.played >= 3));

  function groupIsFinishedTP(teamName) {
    const standing = Object.values(wcStandingsTP).flatMap(r => r).find(r => r.team === teamName);
    return standing && standing.played >= 3;
  }

  Object.values(participant.predictions).forEach(teamList => {
    teamList.forEach(teamName => {
      chosenTeams.add(teamName);
      if (!teamPoints[teamName]) {
        teamPoints[teamName] = {
          matches: 0,
          groups: 0,
          rounds: 0,
          top4: 0,
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

    // El partido por el 3er puesto (fase '3rd_place') queda excluido del
    // cálculo de "pase de ronda": cuenta como partido normal (puntos de
    // victoria/empate ya sumados arriba), pero no da puntos de pase de
    // ronda a ninguno de los dos equipos, ya que no hay fase siguiente.
    // Lo mismo aplica a la Final: el campeón no avanza a ninguna ronda más.
    if (match.phase !== 'groups' && match.phase !== '3rd_place' && match.phase !== 'Final') {
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

  // Mismo criterio que en computeScores: si el admin ha fijado manualmente
  // actual_positions[grpName] se usa eso; si no, se calcula la posición
  // real (1º-4º) de cada equipo en su propio grupo oficial del Mundial.
  const teamRealPosition = buildTeamRealPositionMap(wcStandingsTP);

  Object.entries(participant.predictions).forEach(([grpName, predictedList]) => {
    predictedList.forEach((teamName) => {
      const { pos: realPosNumber, definitive: isDefinitive } =
        getTeamRealPos(teamName, currentActualResults.actual_positions, wcStandingsTP);
      if (realPosNumber === null) return;
      if (!showProvisional && !isDefinitive) return;
      if (realPosNumber === 1) addTeamPoint(teamPoints, teamName, 'groups', rules.points.group_position["1"]);
      else if (realPosNumber === 2) addTeamPoint(teamPoints, teamName, 'groups', rules.points.group_position["2"]);
      else if (realPosNumber === 3) addTeamPoint(teamPoints, teamName, 'groups', rules.points.group_position["3"]);
    });
  });

  // 4b (modal). PASE DE RONDA: CLASIFICARSE A DIECISEISAVOS
  Object.entries(participant.predictions).forEach(([grpName, predictedList]) => {
    predictedList.forEach((teamName) => {
      const alreadyCounted = roundsPassedByTeamsByPhase['groups_to_r16']?.has(teamName);
      if (alreadyCounted) return;

      const { pos: realPosNumber, definitive: groupFinished } =
        getTeamRealPos(teamName, currentActualResults.actual_positions, wcStandingsTP);

      if (groupFinished && (realPosNumber === 1 || realPosNumber === 2)) {
        if (!roundsPassedByTeamsByPhase['groups_to_r16']) roundsPassedByTeamsByPhase['groups_to_r16'] = new Set();
        roundsPassedByTeamsByPhase['groups_to_r16'].add(teamName);
        const gp = getTeamGroup(teamName);
        let pts = rules.points.round_passed_base;
        if (gp === 'C' || gp === 'D') pts += rules.points.group_cd_extra.round_passed;
        if (gp === 'E' || gp === 'F') pts += rules.points.group_ef_extra.round_passed;
        addTeamPoint(teamPoints, teamName, 'rounds', pts);
      }

      // Pase 3º (mejores 8 terceros): provisional si ahora está en el top-8 de
      // los grupos ya terminados (puede cambiar); definitivo solo cuando los
      // 12 grupos hayan cerrado. Misma lógica que computeScores().
      if (groupFinished && realPosNumber === 3) {
        const bestThirdsNowTP = getBestThirds(wcStandingsTP);
        const isInBestThirdsTP = bestThirdsNowTP.has(teamName);
        if (isInBestThirdsTP && (showProvisional || allGroupsFinishedTP)) {
          if (!roundsPassedByTeamsByPhase['groups_to_r16']) roundsPassedByTeamsByPhase['groups_to_r16'] = new Set();
          roundsPassedByTeamsByPhase['groups_to_r16'].add(teamName);
          const gp = getTeamGroup(teamName);
          let pts = rules.points.round_passed_base;
          if (gp === 'C' || gp === 'D') pts += rules.points.group_cd_extra.round_passed;
          if (gp === 'E' || gp === 'F') pts += rules.points.group_ef_extra.round_passed;
          addTeamPoint(teamPoints, teamName, 'rounds', pts);
        }
      }
    });
  });

  // Puntos de "Top4" (podio final: Campeón, Subcampeón, 3º y 4º puesto).
  // Usamos resolveActualPodium para derivar P1-P4 desde los resultados
  // reales de los partidos, evitando datos manuales incorrectos.
  // Se muestra siempre en el tooltip (aunque sea 0) para que se entienda
  // que el equipo está apostado en el podio del participante.
  if (participant.podium) {
    const rpTP = resolveActualPodium(currentActualResults.actual_podium, currentMatches);
    ['P1', 'P2', 'P3', 'P4'].forEach(pos => {
      const predictedTeam = participant.podium[pos];
      if (!predictedTeam) return;
      // Si el equipo del podio no estaba ya en las selecciones de grupo,
      // lo añadimos a teamPoints para poder mostrar su badge Top4 también.
      if (!teamPoints[predictedTeam]) {
        teamPoints[predictedTeam] = { matches: 0, groups: 0, rounds: 0, top4: 0, total: 0 };
      }
      if (rpTP[pos] && predictedTeam === rpTP[pos]) {
        addTeamPoint(teamPoints, predictedTeam, 'top4', rules.points.final_classification[pos]);
      }
    });
  }

  return teamPoints;
}

function formatPointsLabel(points) {
  return Number.isInteger(points) ? String(points) : String(points).replace('.', ',');
}

/**
 * Genera un badge de puntos por equipo que, al tocarlo/clicarlo,
 * despliega un mini desglose inline por categoría.
 * Funciona igual en móvil y escritorio (no depende de hover).
 * Los puntos se acumulan dinámicamente: partidos, clasificación de grupos,
 * pases de ronda y acierto de posición final (Top4) se suman según ocurren.
 * @param {object} points  - { matches, groups, rounds, top4, total }
 * @param {string} teamId  - identificador único para el toggle DOM
 */
function renderTeamPointsBadge(points, teamId) {
  const value = points && points.total ? points.total : 0;
  const classes = value > 0
    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200 cursor-pointer hover:bg-emerald-500/25'
    : 'bg-slate-900 border-slate-800 text-slate-500';

  if (!points || value === 0) {
    return `<span class="shrink-0 rounded border px-1 py-0.5 text-[9px] font-black ${classes}">0</span>`;
  }

  const safeId = teamId ? teamId.replace(/[^a-zA-Z0-9]/g, '_') : Math.random().toString(36).slice(2);
  const panelId = `tpanel_${safeId}`;

  const rows = [
    { label: 'Partidos', val: points.matches },
    { label: 'Grupo',    val: points.groups },
    { label: 'Rondas',   val: points.rounds },
    { label: 'Top4',     val: points.top4 },
  ].filter(r => r.val > 0);

  const rowsHtml = rows.map(r =>
    `<div class="flex justify-between gap-3 text-[9px]">
      <span class="text-slate-400">${r.label}</span>
      <span class="font-bold text-emerald-300">+${formatPointsLabel(r.val)}</span>
    </div>`
  ).join('');

  return `
    <span class="shrink-0 relative">
      <span
        class="rounded border px-1 py-0.5 text-[9px] font-black ${classes} select-none block"
        onclick="event.stopPropagation(); document.getElementById('${panelId}').classList.toggle('hidden')"
        title="Toca para ver desglose"
      >+${formatPointsLabel(value)} ▾</span>
      <div id="${panelId}" class="hidden absolute right-0 top-full mt-0.5 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 space-y-0.5 shadow-xl z-20 min-w-[110px]">
        ${rowsHtml}
      </div>
    </span>
  `;
}

// DETALLES FLOTANTES (MODAL) TIPO PLANILLA ORIGINAL
/**
 * Navega al participante anterior o siguiente dentro del modal de detalle,
 * siguiendo el mismo orden que el ranking visible (renderLeaderboard): por
 * puntuación total descendente.
 * @param {number} direction - -1 para el anterior, +1 para el siguiente
 */
function navigateParticipantDetail(direction) {
  if (currentModalParticipantId === null) return;

  const ranked = [...participants].sort((a, b) => b.score_details.total - a.score_details.total);
  const currentIndex = ranked.findIndex(item => item.id === currentModalParticipantId);
  if (currentIndex === -1) return;

  const targetIndex = currentIndex + direction;
  if (targetIndex < 0 || targetIndex >= ranked.length) return;

  showParticipantDetail(ranked[targetIndex].id);
}

// Recuerda qué participante está abierto en el modal, para poder navegar
// con los botones de anterior/siguiente sin tener que volver a buscarlo.
let currentModalParticipantId = null;

function showParticipantDetail(id) {
  const p = participants.find(item => item.id === id);
  if (!p) return;

  currentModalParticipantId = id;

  // Mismo orden que el ranking visible (renderLeaderboard): por puntuación
  // total descendente. Así "siguiente" baja una posición en la tabla y
  // "anterior" sube una, de forma consistente con lo que el usuario ve.
  const ranked = [...participants].sort((a, b) => b.score_details.total - a.score_details.total);
  const currentIndex = ranked.findIndex(item => item.id === id);

  const prevBtn = document.getElementById('modalPartPrevBtn');
  const nextBtn = document.getElementById('modalPartNextBtn');
  if (prevBtn) prevBtn.disabled = currentIndex <= 0;
  if (nextBtn) nextBtn.disabled = currentIndex === -1 || currentIndex >= ranked.length - 1;

  document.getElementById('modalPartName').innerText = p.name;
  document.getElementById('modalPartRank').innerText = `${p.score_details.total} pts`;

  // Desglose
  document.getElementById('modalBreakdownScorers').innerText = `${p.score_details.scorers} pts`;
  document.getElementById('modalBreakdownMatches').innerText = `${p.score_details.matches} pts`;
  document.getElementById('modalBreakdownGroups').innerText = `${p.score_details.groups} pts`;
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

  // Mismo criterio que en computeScores/computeParticipantTeamPoints:
  // posición manual del admin si existe, si no la posición real 1º-4º de
  // cada equipo dentro de su propio grupo oficial del Mundial.
  const modalWcStandings = computeOfficialGroupStandings(currentMatches);
  const modalTeamRealPosition = buildTeamRealPositionMap(modalWcStandings);

  Object.entries(p.predictions).forEach(([grpName, teamList]) => {
    // Validación del número de selecciones por grupo (deberían ser 3)
    const expectedCount = 3;
    const groupInvalid = teamList.length !== expectedCount;
    const groupInvalidClass = groupInvalid ? 'border border-rose-500 bg-rose-950/5' : '';

    let htmlGroup = `
      <div class="bg-slate-950 p-3 rounded-lg ${groupInvalidClass} space-y-2">
        <h5 class="text-white text-xs font-black uppercase tracking-widest border-b border-rose-500/20 pb-1">Grupo ${grpName} ${groupInvalid ? '<span class="badge badge-error ml-2 text-[10px]">Selecciones inválidas</span>' : ''}</h5>
        <div class="space-y-1 text-[11px]">
    `;

    // ── Precalcular eliminaciones (calculado una vez fuera del forEach)
    // Se calcula aquí dentro para no contaminar el scope global, pero solo
    // la primera vez por llamada a showParticipantDetail.

    // 1. Todos los grupos terminados (para saber cuándo los 4 peores terceros están fijos)
    const modalAllGroupsFinished = Object.keys(modalWcStandings).length >= 12 &&
      Object.values(modalWcStandings).every(rows => rows.every(r => r.played >= 3));

    // 2. Mejores 8 terceros actuales
    const modalBestThirds = getBestThirds(modalWcStandings);

    // 3. Equipos eliminados en rondas eliminatorias (perdedores de partidos finalizados)
    const knockoutEliminated = new Set();
    currentMatches.forEach(m => {
      if (m.status !== 'finished' || m.phase === 'groups') return;
      const winner = m.decided_by === 'penalties' ? m.winner_passed
                   : (m.score_home > m.score_away ? m.team_home : m.team_away);
      if (winner === m.team_home) knockoutEliminated.add(m.team_away);
      else if (winner === m.team_away) knockoutEliminated.add(m.team_home);
    });

    teamList.forEach((teamName, index) => {
      // Usar getTeamRealPos para buscar en actual_positions por equipo (no por grupo de porra)
      const { pos: realPosNumber, definitive: isDefinitive } =
        getTeamRealPos(teamName, currentActualResults.actual_positions, modalWcStandings);
      let statusIndicator = '';
      let textClass = 'text-slate-300';

      // Validación: el equipo debe pertenecer al grupo oficial
      const isTeamOfficial = teams[grpName] && teams[grpName].includes(teamName);
      if (!isTeamOfficial) {
        textClass = 'text-rose-400 font-bold';
        statusIndicator = `<span class="badge badge-error text-slate-950 font-bold text-[9px]">Inválido</span>`;
      } else if (knockoutEliminated.has(teamName)) {
        // Eliminado en una ronda eliminatoria (octavos, cuartos, semis, etc.)
        textClass = 'text-slate-500 line-through';
      } else if (isDefinitive && realPosNumber === 4) {
        // Terminó definitivamente 4º en su grupo (ha jugado sus 3 partidos y quedó último)
        textClass = 'text-slate-500 line-through';
      } else if (!isDefinitive && realPosNumber === 4 && checkFourthMathematicallyOut(teamName, modalWcStandings, currentMatches)) {
        // Va 4º con partidos pendientes, pero ya no puede alcanzar al 3º
        // ni ganando todo lo que le queda (eliminación matemática anticipada,
        // considerando también los partidos pendientes entre sus rivales)
        textClass = 'text-slate-500 line-through';
      } else if (modalAllGroupsFinished && isDefinitive && realPosNumber === 3 && !modalBestThirds.has(teamName)) {
        // Todos los grupos terminados: es 3º pero no está entre los 8 mejores terceros
        textClass = 'text-slate-500 line-through';
      }

      htmlGroup += `
        <div class="flex items-center gap-1 py-1 bg-slate-900/40 px-2 rounded border border-slate-900 min-w-0">
          <span class="${textClass} truncate min-w-0 flex-1 text-[11px]">${index + 1}.º ${getTeamFlag(teamName)} ${teamName}</span>
          ${statusIndicator || ''}
          ${renderTeamPointsBadge(teamPoints[teamName], `modal_${p.id}_${teamName}`)}
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

  const resolvedPodiumModal = resolveActualPodium(currentActualResults.actual_podium, currentMatches);
  orderList.forEach(pos => {
    const selectedTeam = p.podium[pos];
    const isHit = resolvedPodiumModal[pos] && resolvedPodiumModal[pos] === selectedTeam;
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
  const isValidTeam = name => name && name.trim() !== '' && name !== 'Por definir';
  matchList
    .filter(m => m.phase === 'groups' && m.group)
    .forEach(m => {
      if (!groups[m.group]) groups[m.group] = new Set();
      if (isValidTeam(m.team_home)) groups[m.group].add(m.team_home);
      if (isValidTeam(m.team_away)) groups[m.group].add(m.team_away);
    });
  return Object.keys(groups)
    .sort()
    .map(grp => ({ group: grp, teams: [...groups[grp]].sort() }));
}

/**
 * Ordena un array de estadísticas de equipos (de UN mismo grupo) aplicando
 * el criterio de desempate REAL de la FIFA para el Mundial 2026:
 *
 *   Paso 1 (solo entre equipos empatados a puntos):
 *     1a. puntos en los enfrentamientos directos entre ellos
 *     1b. diferencia de goles en esos enfrentamientos directos
 *     1c. goles marcados en esos enfrentamientos directos
 *   Paso 2 (si el paso 1 no desempata a todos):
 *     2a. diferencia de goles en TODOS los partidos de grupo
 *     2b. goles marcados en TODOS los partidos de grupo
 *     2c. fair play (no disponible en los datos de la app, se omite)
 *   Paso 3: ranking FIFA (no disponible, se omite)
 *
 * El mini-table del paso 1 se construye, para cada subconjunto de equipos
 * empatados a puntos, usando SOLO los partidos ya jugados ENTRE ESOS
 * EQUIPOS (`playedMatches`, filtrados a la fase de grupos del grupo en
 * cuestión). Un equipo que no haya jugado contra ninguno de sus rivales
 * empatados arrastra un mini-table neutro (0 pts / 0 gd / 0 gf) en el
 * paso 1, tal y como dicta el reglamento (el head-to-head se computa
 * sobre los cruces disputados, no exige que todos hayan jugado contra
 * todos dentro del subgrupo).
 *
 * @param {Array} statsArray - [{team, points, gf, ga, ...}] de un grupo
 * @param {Array} playedMatches - partidos YA JUGADOS de ese mismo grupo,
 *        cada uno {team_home, team_away, score_home, score_away}
 * @returns {Array} mismo array, con position (1..n) añadido, ordenado
 */
function sortStandingsFIFA(statsArray, playedMatches) {
  const matches = playedMatches || [];

  // Head-to-head entre un subconjunto de equipos, basado solo en los
  // partidos ya jugados entre ellos.
  function headToHeadStats(teamNames) {
    const h2h = {};
    teamNames.forEach(t => { h2h[t] = { pts: 0, gf: 0, ga: 0 }; });
    matches.forEach(m => {
      if (!teamNames.includes(m.team_home) || !teamNames.includes(m.team_away)) return;
      const sh = Number(m.score_home) || 0;
      const sa = Number(m.score_away) || 0;
      h2h[m.team_home].gf += sh;
      h2h[m.team_home].ga += sa;
      h2h[m.team_away].gf += sa;
      h2h[m.team_away].ga += sh;
      if (sh > sa) h2h[m.team_home].pts += 3;
      else if (sh < sa) h2h[m.team_away].pts += 3;
      else { h2h[m.team_home].pts += 1; h2h[m.team_away].pts += 1; }
    });
    return h2h;
  }

  // Ordena un grupo de equipos empatados a puntos (mejor primero)
  function rankTiedTeams(tiedRows) {
    if (tiedRows.length === 1) return tiedRows;

    const names = tiedRows.map(r => r.team);
    const h2h = headToHeadStats(names);

    const withH2H = tiedRows.map(r => ({
      row: r,
      h2hPts: h2h[r.team].pts,
      h2hGd: h2h[r.team].gf - h2h[r.team].ga,
      h2hGf: h2h[r.team].gf,
      globalGd: r.gf - r.ga,
      globalGf: r.gf
    }));

    withH2H.sort((a, b) => {
      // Paso 1: head-to-head (solo entre los empatados)
      if (b.h2hPts !== a.h2hPts) return b.h2hPts - a.h2hPts;
      if (b.h2hGd !== a.h2hGd) return b.h2hGd - a.h2hGd;
      if (b.h2hGf !== a.h2hGf) return b.h2hGf - a.h2hGf;
      // Paso 2: estadísticas globales
      if (b.globalGd !== a.globalGd) return b.globalGd - a.globalGd;
      if (b.globalGf !== a.globalGf) return b.globalGf - a.globalGf;
      // Paso 3 (fair play / ranking FIFA): no disponible, desempate estable
      return a.row.team.localeCompare(b.row.team, 'es');
    });

    return withH2H.map(t => t.row);
  }

  // Agrupar por puntos y aplicar el desempate FIFA solo dentro de cada
  // grupo de empatados, preservando el orden relativo entre grupos.
  const byPoints = {};
  statsArray.forEach(r => {
    if (!byPoints[r.points]) byPoints[r.points] = [];
    byPoints[r.points].push(r);
  });

  const sorted = Object.keys(byPoints)
    .map(Number)
    .sort((a, b) => b - a)
    .flatMap(pts => rankTiedTeams(byPoints[pts]));

  return sorted.map((r, index) => ({ ...r, position: index + 1 }));
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

    const playedGroupMatches = matchList
      .filter(m => m.phase === 'groups' && m.group === group && m.status === 'finished'
        && m.team_home && m.team_home !== 'Por definir'
        && m.team_away && m.team_away !== 'Por definir');

    playedGroupMatches.forEach(m => {
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

    const statsWithGd = Object.values(stats).map(s => ({ ...s, gd: s.gf - s.ga }));
    standings[group] = sortStandingsFIFA(statsWithGd, playedGroupMatches);
  });

  return standings;
}


/**
 * Determina si un equipo que va 4º en su grupo oficial del Mundial está
 * MATEMÁTICAMENTE eliminado de poder alcanzar al 3º, considerando TODOS
 * los partidos de grupo aún pendientes (no solo los suyos), y aplicando
 * el criterio de desempate REAL de la FIFA cuando dos o más equipos
 * acaban empatados a puntos:
 *
 *   Paso 1 (solo entre los equipos empatados a puntos):
 *     1a. puntos obtenidos en los enfrentamientos directos entre ellos
 *     1b. diferencia de goles en esos enfrentamientos directos
 *     1c. goles marcados en esos enfrentamientos directos
 *   Paso 2 (si el paso 1 no desempata a todos):
 *     2a. diferencia de goles en TODOS los partidos de grupo
 *     2b. goles marcados en TODOS los partidos de grupo
 *     2c. fair play (no disponible aquí, se omite)
 *   Paso 3: ranking FIFA (no disponible aquí, se omite)
 *
 * Pasos 2c y 3 no están disponibles en los datos de la app, así que en el
 * remoto caso de que ni el paso 1 ni el 2a/2b desempaten, se asume que el
 * equipo SÍ podría alcanzar la posición (no se tacha) para no arriesgarse
 * a un falso positivo.
 *
 * Importante: un partido pendiente ENTRE OTROS DOS RIVALES del propio
 * grupo también afecta a la eliminación del 4º, porque reparte puntos
 * garantizados entre ellos. Ejemplo real (grupo D, Mundial 2026): Turquía
 * es 4ª con 0 pts (2 jugados, 1 pendiente vs EEUU). Su techo ganando ese
 * partido es 3 pts. El partido pendiente Paraguay-Australia (actuales 2º
 * y 3º) garantiza que el peor situado entre ambos se queda en mínimo 3
 * pts; y si empatan a 3 con Turquía, el desempate directo ya está resuelto
 * porque Turquía perdió 0-1 contra Paraguay en la fase de grupos.
 *
 * Algoritmo: se simulan TODAS las combinaciones posibles (victoria local,
 * empate, victoria visitante) de los partidos de grupo aún no jugados. En
 * los partidos del propio equipo siempre se le hace ganar (su mejor
 * escenario). Si en el PEOR de esos resultados el equipo no logra
 * terminar entre los 3 primeros (aplicando el desempate FIFA de dos
 * pasos), está matemáticamente eliminado.
 *
 * @param {string} team - equipo a comprobar (debe ir 4º con partidos pendientes)
 * @param {Array} groupRows - filas de standings de su grupo (computeOfficialGroupStandings)
 * @param {Array} pendingGroupMatches - partidos de ESE grupo con status !== 'finished'
 * @param {Array} playedGroupMatches - partidos de ESE grupo con status === 'finished'
 *        (necesarios para el head-to-head, que solo se basa en lo ya jugado)
 * @returns {boolean}
 */
function isFourthMathematicallyOut(team, groupRows, pendingGroupMatches, playedGroupMatches) {
  const teamRow = groupRows.find(r => r.team === team);
  if (!teamRow || teamRow.position !== 4 || teamRow.played >= 3) return false;
  if (!pendingGroupMatches || pendingGroupMatches.length === 0) return false;

  const playedMatches = playedGroupMatches || [];

  // Estado base de puntos/gf/ga por equipo, partiendo de los standings actuales
  const baseStats = {};
  groupRows.forEach(r => {
    baseStats[r.team] = { team: r.team, points: r.points, gf: r.gf, ga: r.ga };
  });

  const RESULTS = ['home', 'draw', 'away'];

  // Genera todas las combinaciones de resultados para los partidos pendientes
  function* combinations(matches, idx = 0) {
    if (idx === matches.length) {
      yield [];
      return;
    }
    for (const r of RESULTS) {
      for (const rest of combinations(matches, idx + 1)) {
        yield [r, ...rest];
      }
    }
  }

  let teamCanReachThird = false;

  outer:
  for (const combo of combinations(pendingGroupMatches)) {
    // Aplicar la combinación sobre una copia de las stats
    const stats = {};
    Object.entries(baseStats).forEach(([t, s]) => { stats[t] = { ...s }; });

    pendingGroupMatches.forEach((m, i) => {
      let outcome = combo[i];
      // Forzar el mejor resultado posible para "team" en sus propios partidos
      if (m.team_home === team) outcome = 'home';
      else if (m.team_away === team) outcome = 'away';

      if (outcome === 'home') {
        stats[m.team_home].points += 3;
      } else if (outcome === 'away') {
        stats[m.team_away].points += 3;
      } else {
        stats[m.team_home].points += 1;
        stats[m.team_away].points += 1;
      }
      // No se simulan goles concretos de los partidos pendientes (el
      // marcador exacto es indeterminado); gf/ga globales se mantienen
      // como están y el desempate de paso 2 (dentro de sortStandingsFIFA)
      // usa solo lo ya jugado. Esto es deliberadamente conservador: si con
      // esos goles ya no alcanza, con cualquier marcador real tampoco lo
      // hará salvo que el equipo controle también el resultado de los
      // demás, que no es el caso.
    });

    const finalOrder = sortStandingsFIFA(Object.values(stats), playedMatches);
    const teamFinalPos = finalOrder.findIndex(r => r.team === team) + 1;
    if (teamFinalPos <= 3) {
      teamCanReachThird = true;
      break outer;
    }
  }

  return !teamCanReachThird;
}

/**
 * Wrapper de isFourthMathematicallyOut: localiza automáticamente el grupo
 * oficial (A-L) al que pertenece `team` dentro de `wcStandings` y filtra de
 * `matchList` los partidos de ESE grupo que aún no han terminado (y los ya
 * jugados, para el head-to-head), para pasárselos a
 * isFourthMathematicallyOut. Pensado para usarse directamente desde el
 * render (modal de detalle, listados, etc.) sin repetir la lógica de
 * búsqueda de grupo/partidos en cada punto de llamada.
 */
function checkFourthMathematicallyOut(team, wcStandings, matchList) {
  for (const [groupName, rows] of Object.entries(wcStandings || {})) {
    if (!rows.some(r => r.team === team)) continue;
    const groupMatches = (matchList || []).filter(m =>
      m.phase === 'groups' && m.group === groupName
      && m.team_home && m.team_home !== 'Por definir'
      && m.team_away && m.team_away !== 'Por definir'
    );
    const pendingGroupMatches = groupMatches.filter(m => m.status !== 'finished');
    const playedGroupMatches = groupMatches.filter(m => m.status === 'finished');
    return isFourthMathematicallyOut(team, rows, pendingGroupMatches, playedGroupMatches);
  }
  return false;
}



/**
 * Calcula los 8 mejores terceros de entre los 12 grupos del Mundial (A-L).
 * Criterios FIFA: puntos → DG → GF → GA → nombre.
 */
function getBestThirds(standings) {
  const thirds = Object.values(standings)
    .map(rows => rows.find(r => r.position === 3))
    .filter(t => t && t.played > 0);

  const sorted = [...thirds].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.gd    !== a.gd)    return b.gd    - a.gd;
    if (b.gf    !== a.gf)    return b.gf    - a.gf;
    if (a.ga    !== b.ga)    return a.ga    - b.ga;
    return a.team.localeCompare(b.team, 'es');
  });

  return new Set(sorted.slice(0, 8).map(t => t.team));
}

/**
 * Construye posiciones provisionales por grupo-porra (A-F) a partir de
 * los standings actuales del Mundial (A-L).
 * Devuelve { porraGroup: [team1, team2, team3, ...] } con los equipos
 * que estarían clasificando ordenados por posición mundial, pts, DG, GF.
 *
 * NOTA: esta función se mantiene únicamente para pintar el bloque de
 * "grupos oficiales del Mundial" (renderOfficialGroups), donde sí interesa
 * saber quién clasificaría a octavos. NO debe usarse para calcular los
 * puntos de la porra 10/6/2, porque mezcla equipos de hasta 8 grupos
 * oficiales distintos dentro de un mismo grupo de porra y los reordena
 * según si clasifican o no, perdiendo la posición real 1º-4º de cada
 * equipo en su propio grupo oficial. Para eso usar
 * buildTeamRealPositionMap().
 */
function buildProvisionalPositions(wcStandings) {
  const bestThirds = getBestThirds(wcStandings);

  const teamWCInfo = {};
  Object.values(wcStandings).forEach(rows => {
    rows.forEach(row => {
      teamWCInfo[row.team] = {
        position: row.position,
        points:   row.points,
        gd:       row.gd,
        gf:       row.gf,
        ga:       row.ga,
        played:   row.played
      };
    });
  });

  const provisional = {};

  Object.entries(teams).forEach(([porraGroup, teamList]) => {
    const withInfo = teamList.map(team => ({
      team,
      ...(teamWCInfo[team] || { position: null, points: 0, gd: 0, gf: 0, ga: 0, played: 0 })
    }));

    const qualifying = withInfo.filter(t => {
      if (t.position === null || t.played === 0) return false;
      if (t.position <= 2) return true;
      if (t.position === 3 && bestThirds.has(t.team)) return true;
      return false;
    });

    qualifying.sort((a, b) => {
      if (a.position !== b.position) return a.position - b.position;
      if (b.points   !== a.points)   return b.points   - a.points;
      if (b.gd       !== a.gd)       return b.gd       - a.gd;
      if (b.gf       !== a.gf)       return b.gf       - a.gf;
      return a.team.localeCompare(b.team, 'es');
    });

    provisional[porraGroup] = qualifying.map(t => t.team);
  });

  return provisional;
}

/**
 * Devuelve un mapa { team: position } (1-4) con la posición REAL de cada
 * equipo dentro de SU PROPIO grupo oficial del Mundial (A-L), tal y como
 * está calculada en los standings (puntos → DG → GF → alfabético).
 *
 * OJO: esta es la única función que debe usarse para obtener la posición
 * real de un equipo de cara a los puntos de la porra (10/6/2/0). No intentes
 * "agrupar por grupo de porra" la posición real en una lista tipo
 * [equipo_1º, equipo_2º, equipo_3º]: un grupo de porra (A-F) puede contener
 * varios equipos que comparten la MISMA posición real porque pertenecen a
 * grupos oficiales distintos (por ejemplo, un grupo de porra formado por
 * varios cabezas de grupo tendría 8 equipos en posición 1 a la vez). La
 * posición real es una propiedad de cada equipo de forma independiente,
 * no un ranking dentro del grupo de porra.
 */
function buildTeamRealPositionMap(wcStandings) {
  const map = {};
  Object.values(wcStandings).forEach(rows => {
    rows.forEach(row => {
      map[row.team] = row.position;
    });
  });
  return map;
}

function getStandingsRowClass(position, hasPlayed, isBestThird = false) {
  if (!hasPlayed) return 'border-l-2 border-transparent';
  if (position <= 2) return 'border-l-2 border-emerald-500/80 bg-emerald-950/20';
  if (position === 3) {
    if (isBestThird) return 'border-l-2 border-emerald-500/80 bg-emerald-950/20';
    return 'border-l-2 border-amber-500/60 bg-amber-950/10';
  }
  return 'border-l-2 border-transparent';
}

function renderOfficialGroups() {
  const container = document.getElementById('officialGroupsContainer');
  if (!container) return;

  const standings = computeOfficialGroupStandings(currentMatches);
  const bestThirds = getBestThirds(standings);
  const provisionalPositions = buildProvisionalPositions(standings);
  const groupKeys = Object.keys(standings).sort();

  if (groupKeys.length === 0) {
    container.innerHTML = '';
    return;
  }

  // ── Precalcular eliminaciones para poder tachar selecciones en la tabla ──
  // Mismo criterio que en el modal de detalle de participante (showParticipantDetail):
  // 1. Todos los grupos terminados (para saber cuándo los 4 peores terceros están fijos)
  const ogAllGroupsFinished = Object.keys(standings).length >= 12 &&
    Object.values(standings).every(rows => rows.every(r => r.played >= 3));

  // 2. Equipos eliminados en rondas eliminatorias (perdedores de partidos finalizados)
  const ogKnockoutEliminated = new Set();
  currentMatches.forEach(m => {
    if (m.status !== 'finished' || m.phase === 'groups') return;
    const winner = m.decided_by === 'penalties' ? m.winner_passed
                 : (m.score_home > m.score_away ? m.team_home : m.team_away);
    if (winner === m.team_home) ogKnockoutEliminated.add(m.team_away);
    else if (winner === m.team_away) ogKnockoutEliminated.add(m.team_home);
  });

  // ── Puntos por equipo según su puesto REAL 1º-4º en su grupo oficial ──────
  // Importante: estos +10/+6/+2 son los puntos que ese equipo le da a quien
  // lo predijo en su grupo de la porra, y dependen ÚNICAMENTE de la posición
  // real del equipo dentro de su propio grupo oficial del Mundial (A-L), NO
  // de si ese equipo clasificaría o no a octavos dentro de su grupo de porra
  // (A-F). Por eso se usa buildTeamRealPositionMap aquí, y NO
  // provisionalPositions (esa última solo sirve para los indicadores de
  // "clasificado a octavos" que se pintan más abajo).
  const PTS_BY_POS = { 1: 10, 2: 6, 3: 2 };
  const teamRealPosition = buildTeamRealPositionMap(standings);
  const teamProvPts  = {};   // team → pts que da a la porra (0 si 4º puesto)
  const teamProvPos  = {};   // team → posición real en su grupo oficial (1-4)
  const teamPorraGrp = {};   // team → letra del grupo-porra (A-F)

  Object.entries(teams).forEach(([pg, teamList]) => {
    teamList.forEach(t => { teamPorraGrp[t] = pg; });
  });
  Object.values(teams).flat().forEach(t => {
    const pos = teamRealPosition[t] || null;
    const pg  = teamPorraGrp[t];
    const handicap = (pg === 'C' || pg === 'D') ? 2
                   : (pg === 'E' || pg === 'F') ? 4 : 0;
    teamProvPos[t] = pos;
    teamProvPts[t] = pos && PTS_BY_POS[pos] ? PTS_BY_POS[pos] + handicap : 0;
  });

  // ── Participante seleccionado ─────────────────────────────────────────────
  const filterEl = document.getElementById('officialGroupsParticipantFilter');
  const selId    = filterEl ? filterEl.value : 'all';
  const selPart  = selId !== 'all'
    ? participants.find(p => String(p.id) === selId)
    : null;

  // Equipos elegidos por el participante seleccionado y su posición de predicción
  const chosenTeams    = new Set();
  const chosenPredPos  = {};   // team → posición en la predicción (1, 2 o 3)
  if (selPart) {
    Object.entries(selPart.predictions).forEach(([pg, list]) => {
      list.forEach((t, idx) => {
        chosenTeams.add(t);
        chosenPredPos[t] = idx + 1;
      });
    });
  }

  // ── Mapa de puntos por participante por equipo (sin Top4) ───────────────
  // Precalculamos para todos los participantes de una vez para no repetir
  // el cálculo por cada equipo dentro del render.
  const allParticipantTeamPoints = {};
  participants.forEach(p => {
    allParticipantTeamPoints[p.id] = computeParticipantTeamPoints(p);
  });

  // ── Render ────────────────────────────────────────────────────────────────
  container.innerHTML = groupKeys.map(group => {
    const rows      = standings[group];
    const hasPlayed = rows.some(r => r.played > 0);

    const rowsHtml = rows.map(row => {
      const isChosen  = selPart ? chosenTeams.has(row.team) : false;
      const isBest3   = bestThirds.has(row.team);
      const baseClass = getStandingsRowClass(row.position, hasPlayed, isBest3);

      // Eliminación: mismo criterio que en el modal de detalle de participante.
      const isDefinitiveRow = row.played >= 3;
      const isEliminatedRow = ogKnockoutEliminated.has(row.team)
        || (isDefinitiveRow && row.position === 4)
        || (!isDefinitiveRow && row.position === 4 && checkFourthMathematicallyOut(row.team, standings, currentMatches))
        || (ogAllGroupsFinished && isDefinitiveRow && row.position === 3 && !isBest3);
      const teamNameClass = isEliminatedRow ? 'line-through text-slate-500' : 'text-slate-200';

      // Resaltar si el participante eligió este equipo
      const chosenClass = isChosen
        ? 'ring-1 ring-rose-400/60 bg-rose-500/10'
        : (selPart ? 'opacity-40' : '');

      // Puntos provisionales de la porra para este equipo
      const provPts = teamProvPts[row.team] ?? 0;
      const provPos = teamProvPos[row.team] ?? null;

      let ptsBadgeHtml = '';
      if (provPts > 0) {
        const badgeColor = provPos === 1
          ? 'border-amber-400/60 text-amber-300 bg-amber-950/40'
          : provPos === 2
            ? 'border-sky-500/50 text-sky-300 bg-sky-950/30'
            : 'border-amber-600/50 text-amber-600 bg-amber-950/20';
        const dimClass = selPart && !isChosen ? 'opacity-40' : '';
        ptsBadgeHtml = `<span class="md:hidden inline-flex border rounded px-1 text-[9px] font-black shrink-0 ${badgeColor} ${dimClass}">+${provPts}</span>`;
      } else if (selPart && isChosen) {
        ptsBadgeHtml = `<span class="md:hidden inline-flex border border-slate-700/60 rounded px-1 text-[9px] font-black text-slate-600 shrink-0">0</span>`;
      } else {
        ptsBadgeHtml = `<span class="w-6 shrink-0 inline-block md:hidden"></span>`;
      }

      // ── Panel de participantes que han elegido este equipo ───────────────
      const teamPanelId = `og_team_${group}_${row.team.replace(/[^a-zA-Z0-9]/g, '_')}`;

      // Participantes que lo tienen en sus selecciones de grupo
      const choosers = participants
        .filter(p => Object.values(p.predictions).flat().includes(row.team))
        .map(p => {
          const tp = allParticipantTeamPoints[p.id][row.team];
          return { name: p.name, tp };
        });

      // Hay algo que mostrar en el panel expandible
      const anyChosen = choosers.length > 0;
      const hasPanel = anyChosen;

      // Stats de partido + contador de participantes que lo eligieron (en todos los tamaños)
      const chooserBadge = anyChosen
        ? `<span class="text-slate-500 shrink-0 flex items-center gap-0.5"><i class="fa-solid fa-user text-[8px]"></i>${choosers.length}</span>`
        : '<span class="w-5 shrink-0"></span>';
      const statsHtml = hasPlayed ? `
        <div class="text-[9px] text-slate-500 pl-1.5 -mt-0.5 pb-0.5 flex items-center gap-1.5 ${selPart && !isChosen ? 'opacity-40' : ''}">
          ${chooserBadge}<span class="flex-1">${row.played}PJ · ${row.won}V ${row.drawn}E ${row.lost}D · ${row.gf}-${row.ga} (${row.gd >= 0 ? '+' : ''}${row.gd})</span>
          ${hasPanel ? `<i class="fa-solid fa-chevron-down text-[8px] text-rose-400/70 shrink-0 transition-transform" id="${teamPanelId}_caret"></i>` : ''}
        </div>` : '';

      // Puntos compartidos: todos los que eligen el mismo equipo acumulan
      // los mismos pts de partidos/grupos/rondas (Top4 excluido — es del podio)
      const refTp = choosers.length > 0 ? choosers[0].tp : null;
      const sharedMatches = refTp ? refTp.matches : 0;
      const sharedGroups  = refTp ? refTp.groups  : 0;
      const sharedRounds  = refTp ? refTp.rounds  : 0;

      let teamPanelHtml = '';
      if (hasPanel) {
        // Sección: participantes que lo seleccionaron en grupos
        let selectorsHtml = '';
        if (choosers.length > 0) {
          const namesHtml = choosers.map(c => c.name).join(', ');
          const breakdownParts = [];
          if (sharedMatches > 0) breakdownParts.push({ label: 'Partidos', val: sharedMatches, color: 'bg-sky-950/60 border-sky-700/50 text-sky-300' });
          if (sharedGroups  > 0) breakdownParts.push({ label: 'F.Grupo',  val: sharedGroups,  color: 'bg-violet-950/60 border-violet-700/50 text-violet-300' });
          if (sharedRounds  > 0) breakdownParts.push({ label: 'Rondas',   val: sharedRounds,  color: 'bg-emerald-950/60 border-emerald-700/50 text-emerald-300' });
          const breakdownHtml = breakdownParts.length > 0
            ? `<div class="flex flex-wrap gap-1 mt-0.5">${breakdownParts.map(b => `
                <span class="inline-flex items-center gap-0.5 border rounded px-1 py-px text-[8px] font-bold ${b.color}">
                  ${b.label} <span class="font-black">+${formatPointsLabel(b.val)}</span>
                </span>`).join('')}</div>`
            : `<span class="text-slate-600 text-[9px]">Sin puntos por ahora</span>`;
          selectorsHtml = `
            <div class="space-y-0.5">
              <span class="text-slate-200 text-[9px]">${namesHtml}</span>
              <div>${breakdownHtml}</div>
            </div>`;
        }

        teamPanelHtml = `
          <div id="${teamPanelId}" class="hidden mt-0.5 mb-0.5 bg-slate-900/60 border border-slate-800 rounded-lg px-2.5 py-1.5 space-y-1 text-[9px]">
            ${selectorsHtml}
          </div>`;
      }

      // Color tenue en la fila si alguien la eligió (sin filtro activo) o ya resaltada con filtro
      const noFilterChosenClass = (!selPart && anyChosen) ? 'bg-slate-800/20' : '';
      const clickable = hasPanel
        ? `onclick="event.stopPropagation(); document.getElementById('${teamPanelId}').classList.toggle('hidden'); document.getElementById('${teamPanelId}_caret').classList.toggle('rotate-180')" style="cursor:pointer"`
        : '';
      const hoverClass = hasPanel ? 'hover:bg-slate-800/40' : '';

      return `
        <div>
          <div class="flex items-center gap-1.5 rounded-md pl-1.5 pr-1 py-1 ${baseClass} ${chosenClass} ${noFilterChosenClass} ${hoverClass} transition-colors" ${clickable}>
            <span class="text-[10px] font-black text-slate-500 w-3 shrink-0 text-center">${hasPlayed ? row.position : '·'}</span>
            <span class="shrink-0">${getTeamFlag(row.team, true)}</span>
            <span class="truncate font-semibold ${teamNameClass} text-[11px] flex-1" title="${row.team}">${row.team}</span>
            <span class="font-black text-emerald-400 text-xs w-4 text-right shrink-0">${row.points}</span>
          </div>
          ${statsHtml}
          ${teamPanelHtml}
        </div>
      `;
    }).join('');

    // Puntos totales provisionales del participante en este grupo del Mundial
    let groupSummaryHtml = '';
    if (selPart && hasPlayed) {
      const chosenInGroup = rows.filter(r => chosenTeams.has(r.team));
      if (chosenInGroup.length > 0) {
        const totalPts = chosenInGroup.reduce((sum, r) => sum + (teamProvPts[r.team] || 0), 0);
        const qualifying = chosenInGroup.filter(r => (teamProvPts[r.team] || 0) > 0).length;
        groupSummaryHtml = `
          <div class="mt-1 pt-1 border-t border-slate-800/60 flex justify-between items-center text-[9px]">
            <span class="text-slate-500">${qualifying} clasif. de ${chosenInGroup.length} elegido${chosenInGroup.length > 1 ? 's' : ''}</span>
            <span class="font-black text-rose-400">+${totalPts} pts</span>
          </div>`;
      }
    }

    return `
      <div class="bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-1.5 shadow-sm">
        <h5 class="font-black text-emerald-400 border-b border-slate-900/60 pb-1 uppercase tracking-widest text-[10px]">Grupo ${group}</h5>
        <div class="space-y-1">
          ${rowsHtml}
        </div>
        ${groupSummaryHtml}
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
    const sizeClass = (isDazn || isRtve) ? 'h-4 max-w-[36px]' : 'h-3.5 max-w-[30px]';
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
        const penHome = m.score_home_penalties != null ? ` <span class="text-rose-400">(${m.score_home_penalties})</span>` : '';
        const penAway = m.score_away_penalties != null ? ` <span class="text-rose-400">(${m.score_away_penalties})</span>` : '';
        scoreSection = `
          <div class="flex flex-col items-center gap-1">
            <span class="text-[9px] text-rose-400 font-bold uppercase tracking-wider">Ganó Pen. ${m.winner_passed}</span>
            <span class="text-xl font-black text-rose-500">${m.score_home}${penHome} - ${m.score_away}${penAway}</span>
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
        ${isFinished && m.id ? `
        <div class="flex justify-center pb-1">
          <button onclick="openFifaSummary('${m.id}', '${m.idStage || ''}', '${m.team_home}', '${m.team_away}')"
            class="btn btn-xs btn-ghost text-slate-400 border border-slate-800 hover:border-rose-500/40 hover:text-rose-400 gap-1.5 h-auto py-1 transition-colors">
            <i class="fa-solid fa-chart-bar text-[10px]"></i>
            <span class="text-[10px]">Resumen del partido</span>
            <i class="fa-solid fa-arrow-up-right-from-square text-[9px] opacity-60"></i>
          </button>
        </div>
        ` : ''}
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

  // Mapa jugador (nombre canónico) → participantes que lo eligieron
  const pickersByPlayer = {};
  participants.forEach(p => {
    Object.values(p.scorers).forEach(rawName => {
      const canonical = normalizePlayerName(rawName.trim());
      if (!pickersByPlayer[canonical]) pickersByPlayer[canonical] = [];
      pickersByPlayer[canonical].push(p.name);
    });
  });

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

    // Chevron si alguien lo eligió en la porra; hueco vacío si no para mantener alineación
    const pickers = pickersByPlayer[playerName] || [];
    const panelId = `scorer_panel_${rank}`;
    const caretHtml = pickers.length > 0
      ? `<i id="${panelId}_caret" class="fa-solid fa-chevron-down"
            style="font-size:8px;color:#fb7185;opacity:.7;flex-shrink:0;transition:transform .15s;cursor:pointer;"></i>`
      : `<span style="display:inline-block;width:8px;flex-shrink:0;"></span>`;

    // Panel expandible con los participantes que lo eligieron
    const pickerPanel = pickers.length > 0 ? `
      <div id="${panelId}" style="display:none;">
        <div style="padding:4px 8px 6px 28px;display:flex;flex-wrap:wrap;gap:4px;">
          ${pickers.map(name => `<span style="font-size:10px;background:#1e293b;color:#94a3b8;padding:2px 7px;border-radius:9999px;white-space:nowrap;">${name}</span>`).join('')}
        </div>
      </div>` : '';

    container.innerHTML += `
      <div>
        <div class="flex items-center py-2 text-xs gap-1.5"
             ${pickers.length > 0 ? `style="cursor:pointer;" onclick="
               const panel = document.getElementById('${panelId}');
               const caret  = document.getElementById('${panelId}_caret');
               const open   = panel.style.display !== 'none';
               panel.style.display = open ? 'none' : 'block';
               caret.style.transform = open ? '' : 'rotate(180deg)';
             "` : ''}>
          <span class="font-bold text-slate-500 w-5 shrink-0 text-right">${rank}.</span>
          <span class="shrink-0">${flagHtml}</span>
          <span class="truncate flex-1 ${nameClass}">${playerName}</span>
          ${goalsHtml}${assistsHtml}${caretHtml}
        </div>
        ${pickerPanel}
      </div>
    `;
  });
}

/**
 * Abre una confirmación para ver el resumen del partido en FIFA.com
 */
function openFifaSummary(matchId, idStage, teamHome, teamAway) {
  const stage = idStage || '289273';
  const url = `https://www.fifa.com/es/match-centre/match/17/285023/${stage}/${matchId}`;
  const confirmed = window.confirm(`¿Abrir el resumen de ${teamHome} vs ${teamAway} en la web oficial de la FIFA?`);
  if (confirmed) {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}