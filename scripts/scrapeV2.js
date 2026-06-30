#!/usr/bin/env node
/**
 * Scraper - Mundial 2026 (FIFA, fuente oficial)
 * ================================================
 *
 * Sustituye al antiguo scraper basado en TheSportsDB. Usa la API JSON
 * "no oficial" de FIFA (la misma que alimenta la web fifa.com y sus apps),
 * que es la misma que está detrás de:
 *
 *   https://www.fifa.com/es/match-centre/match/17/285023/289273/400021458
 *
 * Endpoints usados:
 *  - Calendario completo:
 *    https://api.fifa.com/api/v3/calendar/matches?idCompetition=17&idSeason=285023&count=500&language=es-ES
 *
 *  - Eventos (goles, autogoles, asistencias, tarjetas...) de un partido:
 *    https://api.fifa.com/api/v3/timelines/17/285023/{idStage}/{idMatch}?language=es-ES
 *
 *  - Nombre de un jugador a partir de su id:
 *    https://api.fifa.com/api/v3/players/{idPlayer}?language=es-ES
 *
 * Salidas (se sobrescriben cada ejecución):
 *  - data/matches.json         -> calendario + resultados + goleadores por partido
 *  - data/scorers.json         -> goleadores y asistencias acumuladas de TODO el torneo
 *  - data/actual_results.json  -> clasificaciones de grupo, posiciones finales, podio y pichichi
 *  - data/players_cache.json   -> caché de nombres de jugadores (para no repetir llamadas)
 *
 * Ficheros opcionales de configuración manual (si no existen, se ignoran):
 *  - data/player_name_overrides.json
 *      { "IDJUGADOR": "Nombre exacto que quieres que aparezca" }
 *      Útil para que el nombre coincida EXACTAMENTE con el de players.json
 *      (p.ej. para que el pichichi real case con un jugador de los bombos).
 *
 *  - data/manual_overrides.json
 *      {
 *        "actual_positions": { "A": ["México", "Corea del Sur", ...] },
 *        "actual_podium": { "P1": "...", "P2": "...", "P3": "...", "P4": "..." },
 *        "actual_pichichi": ["País:Jugador"]
 *      }
 *      Por si algún criterio de desempate especial (head-to-head, fair play...)
 *      no coincide con el cálculo automático (puntos / dif. goles / goles a favor).
 */

'use strict';

const fs = require('fs');
const path = require('path');

// --------------------------------------------------------------------------
// Configuración
// --------------------------------------------------------------------------

const ID_COMPETITION = 17;
const ID_SEASON = 285023;
const API_BASE = 'https://api.fifa.com/api/v3';
const LANGUAGE = 'es-ES';

const DATA_DIR = path.join(__dirname, '..', 'data');
const MATCHES_FILE = path.join(DATA_DIR, 'matches.json');
const SCORERS_FILE = path.join(DATA_DIR, 'scorers.json');
const RESULTS_FILE = path.join(DATA_DIR, 'actual_results.json');
const TEAMS_FILE = path.join(DATA_DIR, 'teams.json');
const PLAYERS_CACHE_FILE = path.join(DATA_DIR, 'players_cache.json');
const NAME_OVERRIDES_FILE = path.join(DATA_DIR, 'player_name_overrides.json');
const MANUAL_OVERRIDES_FILE = path.join(DATA_DIR, 'manual_overrides.json');

const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
  Accept: 'application/json',
  Origin: 'https://www.fifa.com',
  Referer: 'https://www.fifa.com/',
};

// Códigos de tipo de evento de la API de FIFA
const EVENT_TYPES = {
  GOAL: 0,
  ASSIST: 1,
  YELLOW_CARD: 2,
  RED_CARD: 3,
  SUBSTITUTION: 5,
  OWN_GOAL: 34,
  FREE_KICK_GOAL: 39,
  PENALTY_GOAL: 41,
};
const GOAL_EVENT_TYPES = new Set([
  EVENT_TYPES.GOAL,
  EVENT_TYPES.FREE_KICK_GOAL,
  EVENT_TYPES.PENALTY_GOAL,
]);

// Código de "Period" que la API de FIFA usa para marcar la tanda de
// penaltis tras la prórroga. Los goles marcados durante la tanda (Type 41,
// PENALTY_GOAL) NO deben contar como goles del partido ni sumar al
// pichichi/estadísticas de goleadores: solo sirven para resolver el
// ganador (ya cubierto por m.Home.PenaltyScore / m.Away.PenaltyScore).
// Si en algún momento se detecta que este valor no es correcto (p.ej. un
// partido decidido en penaltis sigue arrastrando goles de la tanda en
// match.scorers), revisar el log de aviso de abajo y ajustar este valor
// comprobando el campo "Period" real de los eventos de tipo 41 de ese
// partido en la respuesta de /timelines.
const PENALTY_SHOOTOUT_PERIOD = 11;

// Algunos nombres de selección pueden variar entre la API de FIFA y los
// nombres usados en teams.json / actual_results.json. Si ves un aviso de
// "selección no reconocida" en los logs, añade aquí el alias correspondiente.
const TEAM_NAME_MAP = {
  Qatar: 'Catar',
  'Estados Unidos de América': 'Estados Unidos',
  USA: 'Estados Unidos',
  Holanda: 'Países Bajos',
  'Países Bajos': 'Países Bajos',
  'Bosnia-Herzegovina': 'Bosnia y Herzegovina',
  'Bosnia Herzegovina': 'Bosnia y Herzegovina',
  'República Popular Democrática de Corea': 'Corea del Sur',
  'República de Corea': 'Corea del Sur',
  'Côte d’Ivoire': 'Costa de Marfil',
  "Côte d'Ivoire": 'Costa de Marfil',
  'República Democrática del Congo': 'RD Congo',
  // Nombres con variante ortográfica detectados en la ejecución
  'Chequia': 'República Checa',
  'Islas de Cabo Verde': 'Cabo Verde',
  'Arabia Saudí': 'Arabia Saudita',
  'RI de Irán': 'Irán',
  'EE. UU.': 'Estados Unidos',
  'EE.UU.': 'Estados Unidos',
};

/**
 * Normalización de nombres FIFA → nombre canónico de players.json.
 * Se construye automáticamente al inicio de main() leyendo players.json,
 * por lo que no requiere mantenimiento manual cuando se añadan jugadores.
 *
 * PLAYER_KNOWN_ALIASES: mapa estático para jugadores cuyo nombre en la API
 * de FIFA difiere estructuralmente del canónico de players.json y no puede
 * resolverse automáticamente por diferencia de caso.
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

let playerCanonicalMap = {};

function buildPlayerCanonicalMap(porraPlayers) {
  const map = {};

  // Fase 1: volcar aliases estáticos (menor precedencia).
  Object.entries(PLAYER_KNOWN_ALIASES).forEach(([alias, canonical]) => {
    map[alias] = canonical;
  });

  // Fase 2: nombres canónicos de players.json (siempre sobreescriben aliases).
  Object.values(porraPlayers).forEach(list => {
    list.forEach(canonicalName => {
      // Índice por nombre completo en minúsculas
      map[canonicalName.toLowerCase()] = canonicalName;
      // Índice por versión Title Case en minúsculas
      const titleCase = canonicalName.replace(/\b\w/g, c => c.toUpperCase());
      map[titleCase.toLowerCase()] = canonicalName;
      // Nota: NO indexamos por apellido solo, para evitar colisiones
      // (p.ej. "Promise DAVID" → "Jonathan David" si solo se busca por "david")
    });
  });
  return map;
}

function normalizePlayerName(name) {
  if (!name) return name;
  // Unificar representaciones Unicode (NFD de la API → NFC de players.json)
  name = name.normalize('NFC');

  // 1. Nombre completo en minúsculas ("jonathan david", "erling haaland")
  const lower = name.toLowerCase();
  if (playerCanonicalMap[lower]) return playerCanonicalMap[lower];

  // 2. Title Case en minúsculas: cubre "Jonathan DAVID" → "jonathan david"
  const titleLower = name
    .replace(/\b\w+/g, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .toLowerCase();
  if (playerCanonicalMap[titleLower]) return playerCanonicalMap[titleLower];

  // 3. Solo apellido (último token): cubre "HAALAND" → "haaland"
  const lastToken = name.trim().split(/\s+/).pop().toLowerCase();
  if (playerCanonicalMap[lastToken]) return playerCanonicalMap[lastToken];

  return name; // sin match → devolver original para no perder datos
}



function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
}

async function fetchJson(url) {
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} al consultar ${url}`);
  }
  return res.json();
}

/** Extrae la descripción localizada (es-ES si existe) de los arrays típicos de la API de FIFA. */
function desc(arr, fallback = '') {
  if (!Array.isArray(arr) || arr.length === 0) return fallback;
  const found =
    arr.find((x) => x.Locale === LANGUAGE) ||
    arr.find((x) => (x.Locale || '').toLowerCase().startsWith('es')) ||
    arr[0];
  return (found && found.Description) || fallback;
}

function normalizeTeamName(name) {
  if (!name) return name;
  return TEAM_NAME_MAP[name] || name;
}

function mapStatus(matchStatus) {
  // 0 = finalizado, 3 = en juego, resto = no empezado / aplazado
  switch (matchStatus) {
    case 0:
      return 'finished';
    case 3:
      return 'live';
    default:
      return 'scheduled';
  }
}

function mapPhase(stageDesc, hasGroup) {
  const s = (stageDesc || '').toLowerCase();

  // La descripción real del stage que da la API de FIFA es la fuente de
  // verdad: hay que mirarla SIEMPRE primero. Esto es importante porque, en
  // los partidos de Dieciseisavos de Final (Round of 32) en los que el
  // cabeza de grupo ya está fijado en el bracket (p.ej. "México vs Por
  // definir"), el rival todavía no se conoce, pero el equipo conocido SÍ
  // pertenece a un grupo real (A-L) ya resuelto. Si solo miráramos
  // "¿conozco el grupo de alguno de los dos equipos?" para decidir la fase,
  // ese partido de octavos se etiquetaría erróneamente como fase de grupos
  // (y aparecería en el calendario como "Grupo X" en vez de "Dieciseisavos
  // de Final").
  if (s.includes('grupo') || s.includes('group')) return 'groups';
  if (s.includes('32') || s.includes('dieciseisavo')) return 'Round of 32';
  if (s.includes('16') || s.includes('octavo')) return 'Round of 16';
  // OJO: "tercer y cuarto puesto" contiene "cuarto", por eso se comprueba antes
  if (s.includes('tercer') || s.includes('3er') || s.includes('3.º')) return '3rd_place';
  if (s.includes('cuarto')) return 'Quarter-finals';
  if (s.includes('semifinal')) return 'Semi-finals';
  if (s.includes('final')) return 'Final';

  // Si el texto del stage no es reconocible (caso raro, p.ej. la API
  // devuelve un nombre de fase inesperado), recurrimos como ÚLTIMO recurso
  // a si alguno de los dos equipos pertenece a un grupo real conocido.
  if (hasGroup) return 'groups';

  return stageDesc || '';
}

/** Convierte una fecha ISO (UTC) a fecha/hora locales de España. */
function toMadridDateTime(isoDate) {
  if (!isoDate) return { date: '', time: '' };
  const d = new Date(isoDate);

  // Usamos formatToParts para construir la fecha en formato YYYY-MM-DD
  // de forma independiente al locale del sistema operativo.
  // (En Windows, Intl.DateTimeFormat('en-CA') devuelve MM/DD/YYYY en vez de
  // YYYY-MM-DD, lo que causa inconsistencias entre GitHub Actions y local.)
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Madrid',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(d);

  const get = (type) => (parts.find((p) => p.type === type) || {}).value || '';
  const date = `${get('year')}-${get('month')}-${get('day')}`;
  const time = `${get('hour').replace('24', '00')}:${get('minute')}`;

  return { date, time };
}

// --------------------------------------------------------------------------
// Caché y overrides de nombres de jugadores
// --------------------------------------------------------------------------

const playersCache = readJson(PLAYERS_CACHE_FILE, {});
const nameOverrides = readJson(NAME_OVERRIDES_FILE, {});

async function resolvePlayerName(idPlayer) {
  if (!idPlayer) return 'Jugador desconocido';
  if (nameOverrides[idPlayer]) return nameOverrides[idPlayer];
  if (playersCache[idPlayer]) return playersCache[idPlayer];

  try {
    const data = await fetchJson(`${API_BASE}/players/${idPlayer}?language=${LANGUAGE}`);
    let name = desc(data.Name) || desc(data.Alias);
    if (!name) {
      const first = desc(data.FirstName);
      const last = desc(data.LastName);
      name = [first, last].filter(Boolean).join(' ').trim();
    }
    name = name || `Jugador ${idPlayer}`;
    playersCache[idPlayer] = name;
    return name;
  } catch (e) {
    console.warn(`  ! No se pudo resolver el jugador ${idPlayer}: ${e.message}`);
    return `Jugador ${idPlayer}`;
  }
}

// --------------------------------------------------------------------------
// Programa principal
// --------------------------------------------------------------------------

async function main() {
  const teams = readJson(TEAMS_FILE, {});
  const previousResults = readJson(RESULTS_FILE, {});
  const manualOverrides = readJson(MANUAL_OVERRIDES_FILE, {});

  // Construir mapa de normalización a partir de players.json (fuente de verdad)
  const porraPlayers = readJson(path.join(DATA_DIR, 'players.json'), {});
  playerCanonicalMap = buildPlayerCanonicalMap(porraPlayers);
  console.log(`-> Mapa de normalización construido con ${Object.keys(playerCanonicalMap).length} entradas.`);

  // Mapa "selección -> grupo real del Mundial (A-L)" a partir de los grupos
  // ya definidos en actual_results.json (12 grupos x 4 selecciones).
  const realGroupTeams = {};
  Object.entries(previousResults.official_standings || {}).forEach(([group, list]) => {
    (list || []).forEach((row) => {
      realGroupTeams[row.team] = group;
    });
  });

  console.log('Descargando calendario del Mundial 2026 desde la API de FIFA...');
  const calendar = await fetchJson(
    `${API_BASE}/calendar/matches?idCompetition=${ID_COMPETITION}&idSeason=${ID_SEASON}&count=500&language=${LANGUAGE}`
  );
  const allMatches = calendar.Results || [];
  console.log(`-> ${allMatches.length} partidos encontrados en el calendario.`);

  const matchesOut = [];
  const scorersAgg = {};
  const assistsAgg = {};
  const unknownTeams = new Set();

  for (const m of allMatches) {
    const homeName = normalizeTeamName(desc(m.Home && m.Home.TeamName, 'Por definir'));
    const awayName = normalizeTeamName(desc(m.Away && m.Away.TeamName, 'Por definir'));
    const homeId = m.Home && m.Home.IdTeam;
    const awayId = m.Away && m.Away.IdTeam;

    const status = mapStatus(m.MatchStatus);
    const { date, time } = toMadridDateTime(m.Date);
    const venue =
      desc(m.Stadium && m.Stadium.Name) || desc(m.Stadium && m.Stadium.CityName) || '';

    const group = realGroupTeams[homeName] || realGroupTeams[awayName] || null;
    const phase = mapPhase(desc(m.StageName), Boolean(group));

    if (homeName !== 'Por definir' && !realGroupTeams[homeName] && phase === 'groups') {
      unknownTeams.add(homeName);
    }
    if (awayName !== 'Por definir' && !realGroupTeams[awayName] && phase === 'groups') {
      unknownTeams.add(awayName);
    }

    const match = {
      id: m.IdMatch,
      idStage: m.IdStage || null,
      phase,
      team_home: homeName,
      team_away: awayName,
      date,
      time,
      venue,
      status,
      score_home: (m.Home && m.Home.Score) || 0,
      score_away: (m.Away && m.Away.Score) || 0,
    };
    // OJO: el campo "group" SOLO tiene sentido para partidos de fase de
    // grupos. Un partido de Dieciseisavos de Final (Round of 32) donde el
    // cabeza de grupo ya está fijado (p.ej. "México vs Por definir") tiene
    // `group` resuelto a "A" por venir de realGroupTeams, pero su `phase`
    // ya es 'Round of 32' gracias al fix de mapPhase. Si igualmente le
    // asignáramos match.group aquí, el frontend lo mostraría en el
    // calendario como "Grupo A" en vez de "Dieciseisavos de Final".
    if (group && phase === 'groups') match.group = group;

    // Tanda de penaltis: detección preliminar a partir del calendario (puede
    // venir vacía si la API de calendario no rellena PenaltyScore; en ese
    // caso se completa más abajo con el evento Type=8 de la timeline, que
    // es la fuente fiable observada).
    const penHomeCal = m.Home && m.Home.PenaltyScore;
    const penAwayCal = m.Away && m.Away.PenaltyScore;
    if (
      status === 'finished' &&
      penHomeCal != null &&
      penAwayCal != null &&
      (penHomeCal > 0 || penAwayCal > 0)
    ) {
      match.decided_by = 'penalties';
      match.score_home_penalties = penHomeCal;
      match.score_away_penalties = penAwayCal;
      match.winner_passed = penHomeCal > penAwayCal ? homeName : awayName;
    }

    // Goles / autogoles / asistencias (solo partidos jugados o en juego)
    if ((status === 'finished' || status === 'live') && m.IdStage && m.IdMatch) {
      try {
        const timeline = await fetchJson(
          `${API_BASE}/timelines/${ID_COMPETITION}/${ID_SEASON}/${m.IdStage}/${m.IdMatch}?language=${LANGUAGE}`
        );
        const events = timeline.Event || [];
        const teamNameById = { [homeId]: homeName, [awayId]: awayName };
        const otherTeamId = (id) => (id === homeId ? awayId : homeId);

        // Fuente fiable de la tanda de penaltis: evento Type=8
        // ("Hora de finalización" de la tanda), Period=11, con
        // HomePenaltyGoals/AwayPenaltyGoals ya totalizados por la API.
        // Si por lo que sea hay varios eventos así (no debería), nos
        // quedamos con el último cronológicamente.
        const PENALTY_SHOOTOUT_END_TYPE = 8;
        const shootoutEndEvents = events.filter(
          (ev) => ev.Period === PENALTY_SHOOTOUT_PERIOD && ev.Type === PENALTY_SHOOTOUT_END_TYPE
        );
        if (shootoutEndEvents.length > 0) {
          const last = shootoutEndEvents[shootoutEndEvents.length - 1];
          const penHome = last.HomePenaltyGoals;
          const penAway = last.AwayPenaltyGoals;
          if (penHome != null && penAway != null) {
            match.decided_by = 'penalties';
            match.score_home_penalties = penHome;
            match.score_away_penalties = penAway;
            match.winner_passed = penHome > penAway ? homeName : awayName;
          }
        }

        const scorers = [];
        for (const ev of events) {
          // Excluir eventos ocurridos en la tanda de penaltis: no cuentan
          // como goles del partido ni para el cómputo de goleadores/asistencias.
          const isShootoutEvent = ev.Period === PENALTY_SHOOTOUT_PERIOD;
          if (isShootoutEvent && GOAL_EVENT_TYPES.has(ev.Type)) {
            console.log(
              `  (info) Penalti de la tanda excluido del cómputo: partido ${m.IdMatch}, jugador ${ev.IdPlayer}, Period=${ev.Period}, Type=${ev.Type}`
            );
            continue;
          }
          if (GOAL_EVENT_TYPES.has(ev.Type)) {
            // Gol normal / falta directa / penalti -> cuenta para el equipo de IdTeam
            const team = teamNameById[ev.IdTeam] || '';
            const rawPlayer = await resolvePlayerName(ev.IdPlayer);
            const player = normalizePlayerName(rawPlayer);
            scorers.push(`${team}:${player}`);
            const key = `${team}:${player}`;
            scorersAgg[key] = (scorersAgg[key] || 0) + 1;
          } else if (ev.Type === EVENT_TYPES.OWN_GOAL) {
            // Autogol -> IdTeam es el equipo del jugador que lo marcó (el que lo sufrió).
            // El gol beneficia al equipo contrario; en el frontend se muestra bajo el equipo beneficiado.
            const realTeamId = ev.IdTeam;
            const team = teamNameById[realTeamId] || '';
            const rawPlayer = await resolvePlayerName(ev.IdPlayer);
            const player = normalizePlayerName(rawPlayer);
            scorers.push(`${team}:${player} (p.p.)`);
            // No se contabiliza en scorers.json: un autogol no cuenta para el pichichi
          } else if (ev.Type === EVENT_TYPES.ASSIST) {
            if (isShootoutEvent) continue; // por si acaso la API marcase asistencias en la tanda
            const team = teamNameById[ev.IdTeam] || '';
            const rawPlayer = await resolvePlayerName(ev.IdPlayer);
            const player = normalizePlayerName(rawPlayer);
            const key = `${team}:${player}`;
            assistsAgg[key] = (assistsAgg[key] || 0) + 1;
          }
        }
        if (scorers.length > 0) match.scorers = scorers;
      } catch (e) {
        console.warn(`  ! No se pudieron obtener los eventos del partido ${m.IdMatch}: ${e.message}`);
      }
    }

    matchesOut.push(match);
  }

  if (unknownTeams.size > 0) {
    console.warn(
      `Aviso: las siguientes selecciones de fase de grupos no se han podido asignar a un grupo real (A-L). Revisa TEAM_NAME_MAP: ${[...unknownTeams].join(', ')}`
    );
  }

  // Orden cronológico
  matchesOut.sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));

  // --------------------------------------------------------------------
  // Clasificaciones oficiales de grupo (A-L)
  // --------------------------------------------------------------------
  //
  // Desempate FIFA real (Mundial 2026) cuando 2+ equipos empatan a puntos:
  //   Paso 1 (solo entre los equipos empatados, head-to-head):
  //     1a. puntos en los enfrentamientos directos entre ellos
  //     1b. diferencia de goles en esos enfrentamientos directos
  //     1c. goles marcados en esos enfrentamientos directos
  //   Paso 2 (si el paso 1 no desempata a todos, estadísticas globales):
  //     2a. diferencia de goles en TODOS los partidos de grupo
  //     2b. goles marcados en TODOS los partidos de grupo
  //     2c. fair play (no disponible en estos datos, se omite)
  //   Paso 3: ranking FIFA (no disponible en estos datos, se omite)
  //
  // El mini-table del paso 1 se construye, para cada subconjunto de
  // equipos empatados a puntos, usando SOLO los partidos ya jugados ENTRE
  // ESOS EQUIPOS. Un equipo que no haya jugado contra ninguno de sus
  // rivales empatados arrastra un mini-table neutro (0 pts/0 gd/0 gf) en
  // el paso 1, tal y como dicta el reglamento.
  //
  // Si ni el paso 1 ni el paso 2a/2b desempatan (fair play/ranking FIFA no
  // disponibles aquí), se mantiene el orden alfabético como último
  // recurso estable; en ese caso excepcional conviene revisar
  // manual_overrides.json y fijar el orden real a mano.
  function headToHeadStats(teamNames, playedMatches) {
    const h2h = {};
    teamNames.forEach((t) => { h2h[t] = { pts: 0, gf: 0, ga: 0 }; });
    playedMatches.forEach((m) => {
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

  function rankTiedTeams(tiedRows, playedMatches) {
    if (tiedRows.length === 1) return tiedRows;

    const names = tiedRows.map((r) => r.team);
    const h2h = headToHeadStats(names, playedMatches);

    const withH2H = tiedRows.map((r) => ({
      row: r,
      h2hPts: h2h[r.team].pts,
      h2hGd: h2h[r.team].gf - h2h[r.team].ga,
      h2hGf: h2h[r.team].gf,
      globalGd: r.gf - r.ga,
      globalGf: r.gf,
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

    return withH2H.map((t) => t.row);
  }

  /**
   * Ordena las filas de un grupo aplicando el desempate FIFA de dos pasos.
   * @param {Array} statsArray - [{team, points, gf, ga, ...}] de un grupo
   * @param {Array} playedMatches - partidos ya jugados de ese mismo grupo
   * @returns {Array} mismo array, con position (1..n) añadido, ordenado
   */
  function sortStandingsFIFA(statsArray, playedMatches) {
    const byPoints = {};
    statsArray.forEach((r) => {
      if (!byPoints[r.points]) byPoints[r.points] = [];
      byPoints[r.points].push(r);
    });

    const sorted = Object.keys(byPoints)
      .map(Number)
      .sort((a, b) => b - a)
      .flatMap((pts) => rankTiedTeams(byPoints[pts], playedMatches));

    return sorted.map((r, index) => ({ ...r, position: index + 1 }));
  }

  const officialStandings = {};
  const actualPositions = { ...(previousResults.actual_positions || {}) };

  // Construir la lista de selecciones de cada grupo real a partir de la
  // estructura previa (ya tiene los 12 grupos x 4 selecciones).
  const groupTeamLists = {};
  Object.entries(previousResults.official_standings || {}).forEach(([group, list]) => {
    groupTeamLists[group] = (list || []).map((row) => row.team);
  });

  Object.entries(groupTeamLists).forEach(([group, teamList]) => {
    const stats = {};
    teamList.forEach((team) => {
      stats[team] = { team, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, points: 0 };
    });

    const playedGroupMatches = matchesOut
      .filter((m) => m.phase === 'groups' && m.group === group && m.status === 'finished');

    playedGroupMatches.forEach((m) => {
        const home = stats[m.team_home];
        const away = stats[m.team_away];
        if (!home || !away) return;

        home.played++;
        away.played++;
        home.gf += m.score_home;
        home.ga += m.score_away;
        away.gf += m.score_away;
        away.ga += m.score_home;

        if (m.score_home > m.score_away) {
          home.won++;
          away.lost++;
          home.points += 3;
        } else if (m.score_home < m.score_away) {
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

    const statsWithGd = Object.values(stats).map((s) => ({ ...s, gd: s.gf - s.ga }));
    const sorted = sortStandingsFIFA(statsWithGd, playedGroupMatches);

    officialStandings[group] = sorted;

    // Si el grupo ya ha terminado (todas las selecciones han jugado sus 3
    // partidos) y no hay un override manual, fijar el orden final del grupo.
    const groupFinished = sorted.every((s) => s.played === teamList.length - 1);
    if (manualOverrides.actual_positions && manualOverrides.actual_positions[group]) {
      actualPositions[group] = manualOverrides.actual_positions[group];
    } else if (groupFinished) {
      actualPositions[group] = sorted.map((s) => s.team);
    } else if (!actualPositions[group]) {
      actualPositions[group] = [];
    }
  });

  // --------------------------------------------------------------------
  // Pichichi (máximo goleador real del torneo)
  // --------------------------------------------------------------------
  const maxGoals = Object.values(scorersAgg).reduce((max, v) => Math.max(max, v), 0);
  let actualPichichi = [];
  if (maxGoals > 0) {
    actualPichichi = Object.entries(scorersAgg)
      .filter(([, goals]) => goals === maxGoals)
      .map(([key]) => key);
  }
  if (manualOverrides.actual_pichichi) {
    actualPichichi = manualOverrides.actual_pichichi;
  }

  // --------------------------------------------------------------------
  // Podio final (campeón, subcampeón, 3º y 4º puesto)
  // --------------------------------------------------------------------
  let actualPodium = { ...(previousResults.actual_podium || { P1: '', P2: '', P3: '', P4: '' }) };

  const winnerOf = (m) => {
    if (!m) return null;
    if (m.decided_by === 'penalties') return m.winner_passed;
    return m.score_home > m.score_away ? m.team_home : m.team_away;
  };
  const loserOf = (m) => {
    if (!m) return null;
    const w = winnerOf(m);
    return w === m.team_home ? m.team_away : m.team_home;
  };

  const finalMatch = matchesOut.find((m) => m.phase === 'Final' && m.status === 'finished');
  const thirdPlaceMatch = matchesOut.find((m) => m.phase === '3rd_place' && m.status === 'finished');

  if (finalMatch) {
    actualPodium.P1 = winnerOf(finalMatch);
    actualPodium.P2 = loserOf(finalMatch);
  }
  if (thirdPlaceMatch) {
    actualPodium.P3 = winnerOf(thirdPlaceMatch);
    actualPodium.P4 = loserOf(thirdPlaceMatch);
  }
  if (manualOverrides.actual_podium) {
    actualPodium = { ...actualPodium, ...manualOverrides.actual_podium };
  }

  // --------------------------------------------------------------------
  // Guardar resultados
  // --------------------------------------------------------------------
  const actualResults = {
    actual_positions: actualPositions,
    actual_podium: actualPodium,
    actual_pichichi: actualPichichi,
    official_standings: officialStandings,
    lastUpdate: new Date().toISOString(),
  };

  const maxAssists = Object.values(assistsAgg).reduce((max, v) => Math.max(max, v), 0);
  const scorersOut = {
    max_goals: maxGoals,
    players: scorersAgg,
    max_assists: maxAssists,
    assists: assistsAgg,
  };

  fs.mkdirSync(DATA_DIR, { recursive: true });
  writeJson(MATCHES_FILE, matchesOut);
  writeJson(SCORERS_FILE, scorersOut);
  writeJson(RESULTS_FILE, actualResults);
  writeJson(PLAYERS_CACHE_FILE, playersCache);

  console.log(`-> ${matchesOut.length} partidos guardados en ${path.relative(process.cwd(), MATCHES_FILE)}`);
  console.log(`-> ${Object.keys(scorersAgg).length} goleadores distintos (máx. ${maxGoals} goles).`);
  console.log(`-> ${Object.keys(assistsAgg).length} asistentes distintos (máx. ${maxAssists} asistencias).`);
  console.log('Listo.');
}

main().catch((err) => {
  console.error('Error en el scraper:', err);
  process.exit(1);
});