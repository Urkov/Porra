/**
 * Daily World Cup 2026 scraper for GitHub Actions.
 *
 * Source:
 * - Season page: https://www.thesportsdb.com/season/4429-fifa-world-cup/2026
 * - Event page/API: https://www.thesportsdb.com/event/<id>
 *
 * It updates:
 * - data/matches.json
 * - data/scorers.json
 * - data/actual_results.json
 */

const fs = require('fs');
const path = require('path');
const { computeOfficialGroupStandings } = require('./groupStandings');

const MATCHES_PATH = path.join(__dirname, '../data/matches.json');
const SCORERS_PATH = path.join(__dirname, '../data/scorers.json');
const ACTUAL_RESULTS_PATH = path.join(__dirname, '../data/actual_results.json');
const TEAMS_PATH = path.join(__dirname, '../data/teams.json');

const SEASON_URL = 'https://www.thesportsdb.com/season/4429-fifa-world-cup/2026';
const API_KEY = process.env.TSDB_API_KEY || '123';
const API_BASE = `https://www.thesportsdb.com/api/v1/json/${API_KEY}`;
const REQUEST_DELAY_MS = Number(process.env.TSDB_REQUEST_DELAY_MS || 1000);

const fetchFn = global.fetch;

const localTeams = JSON.parse(fs.readFileSync(TEAMS_PATH, 'utf8'));
const localTeamNames = new Set(Object.values(localTeams).flat());

const TEAM_ALIASES = {
  algeria: 'Argelia',
  argentina: 'Argentina',
  australia: 'Australia',
  austria: 'Austria',
  belgium: 'Belgica',
  belgica: 'Belgica',
  bosnia: 'Bosnia y Herzegovina',
  'bosnia and herzegovina': 'Bosnia y Herzegovina',
  brazil: 'Brasil',
  brasil: 'Brasil',
  canada: 'Canada',
  'cape verde': 'Cabo Verde',
  colombia: 'Colombia',
  croatia: 'Croacia',
  curacao: 'Curazao',
  curazao: 'Curazao',
  'czech republic': 'Republica Checa',
  czechia: 'Republica Checa',
  'dr congo': 'RD Congo',
  'democratic republic of the congo': 'RD Congo',
  'congo dr': 'RD Congo',
  ecuador: 'Ecuador',
  egypt: 'Egipto',
  england: 'Inglaterra',
  france: 'Francia',
  germany: 'Alemania',
  ghana: 'Ghana',
  haiti: 'Haiti',
  iran: 'Iran',
  iraq: 'Irak',
  'ivory coast': 'Costa de Marfil',
  'cote d ivoire': 'Costa de Marfil',
  japan: 'Japon',
  jordan: 'Jordania',
  mexico: 'Mexico',
  morocco: 'Marruecos',
  netherlands: 'Paises Bajos',
  'new zealand': 'Nueva Zelanda',
  norway: 'Noruega',
  panama: 'Panama',
  paraguay: 'Paraguay',
  portugal: 'Portugal',
  qatar: 'Catar',
  'saudi arabia': 'Arabia Saudita',
  scotland: 'Escocia',
  senegal: 'Senegal',
  'south africa': 'Sudafrica',
  'south korea': 'Corea del Sur',
  spain: 'Espana',
  sweden: 'Suecia',
  switzerland: 'Suiza',
  tunisia: 'Tunez',
  turkey: 'Turquia',
  turkiye: 'Turquia',
  usa: 'Estados Unidos',
  'united states': 'Estados Unidos',
  'united states of america': 'Estados Unidos',
  uruguay: 'Uruguay',
  uzbekistan: 'Uzbekistan'
};

function readJson(filePath, fallback) {
  if (!fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function normalizeName(name) {
  return String(name || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function localizeTeamName(name) {
  if (!name) return '';

  const exact = [...localTeamNames].find(team => normalizeName(team) === normalizeName(name));
  if (exact) return exact;

  const alias = TEAM_ALIASES[normalizeName(name)];
  if (!alias) return name.trim();

  return [...localTeamNames].find(team => normalizeName(team) === normalizeName(alias)) || alias;
}

function parseScore(value) {
  if (value === null || value === undefined || value === '') return null;
  const score = Number.parseInt(value, 10);
  return Number.isFinite(score) ? score : null;
}

function getEventDateTime(event) {
  const date = event.dateEventLocal || event.dateEvent || '';
  const rawTime = event.strTimeLocal || event.strTime || '';
  const time = rawTime ? rawTime.slice(0, 5) : '';
  return { date, time };
}

function cleanScorerName(rawDetail) {
  return String(rawDetail || '')
    .replace(/\([^)]*\)/g, ' ')
    .replace(/\b(?:pen|og|own goal)\b/gi, ' ')
    .replace(/\d+\s*(?:\+\s*\d+)?\s*['’`]?/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseGoalDetails(goalDetails, teamName) {
  if (!goalDetails) return [];

  return String(goalDetails)
    .split(/;|\r?\n/)
    .map(cleanScorerName)
    .filter(Boolean)
    .map(playerName => `${teamName}:${playerName}`);
}

function extractEventIdsFromHtml(html) {
  const ids = new Set();
  const regexes = [
    /\/event\/(\d+)(?:[-/"'?#\s<]|$)/g,
    /lookupevent\.php\?id=(\d+)/g,
    /data-id=["'](\d+)["']/g
  ];

  for (const regex of regexes) {
    let match;
    while ((match = regex.exec(html))) {
      ids.add(match[1]);
    }
  }

  return [...ids];
}

async function fetchJson(url) {
  const res = await fetchFn(url, { headers: { 'User-Agent': 'PorraBot/1.0 (+GitHub Actions)' } });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

async function fetchText(url) {
  const res = await fetchFn(url, { headers: { 'User-Agent': 'PorraBot/1.0 (+GitHub Actions)' } });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.text();
}

async function getSeasonEvents() {
  const eventsById = new Map();
  let seasonApiRateLimited = false;

  try {
    const html = await fetchText(SEASON_URL);
    extractEventIdsFromHtml(html).forEach(id => eventsById.set(id, { idEvent: id, htmlOnly: true }));
    console.log(`IDs found in season page: ${eventsById.size}`);
  } catch (error) {
    console.warn(`Could not read season page: ${error.message}`);
  }

  try {
    const seasonJson = await fetchJson(`${API_BASE}/eventsseason.php?id=4429&s=2026`);
    for (const event of seasonJson.events || []) {
      if (event.idEvent) eventsById.set(event.idEvent, event);
    }
    console.log(`Events after eventsseason API: ${eventsById.size}`);
  } catch (error) {
    seasonApiRateLimited = error.message.includes('429');
    console.warn(`Could not read eventsseason API: ${error.message}`);
  }

  const events = [...eventsById.values()];
  events.seasonApiRateLimited = seasonApiRateLimited;
  return events;
}

async function getEvent(id) {
  const json = await fetchJson(`${API_BASE}/lookupevent.php?id=${id}`);
  return json && json.events && json.events[0] ? json.events[0] : null;
}

function findLocalMatch(matches, event, eventId) {
  const home = localizeTeamName(event.strHomeTeam || event.strHome || '');
  const away = localizeTeamName(event.strAwayTeam || event.strAway || '');
  const eventDate = event.dateEventLocal || event.dateEvent || '';
  const homeNorm = normalizeName(home);
  const awayNorm = normalizeName(away);

  return matches.find(match => {
    if (String(match.idEvent || '') === String(eventId)) return true;

    const matchHomeNorm = normalizeName(match.team_home);
    const matchAwayNorm = normalizeName(match.team_away);
    const sameTeams =
      matchHomeNorm === homeNorm && matchAwayNorm === awayNorm;
    const reversedTeams =
      matchHomeNorm === awayNorm && matchAwayNorm === homeNorm;

    if (!sameTeams && !reversedTeams) return false;
    if (!eventDate || !match.date) return true;
    return match.date === eventDate;
  });
}

function updateMatchFromEvent(match, event, eventId) {
  const apiHome = localizeTeamName(event.strHomeTeam || event.strHome || '');
  const apiAway = localizeTeamName(event.strAwayTeam || event.strAway || '');
  const homeScore = parseScore(event.intHomeScore);
  const awayScore = parseScore(event.intAwayScore);
  //const { date, time } = getEventDateTime(event);

  const localIsReversed =
    normalizeName(match.team_home) === normalizeName(apiAway) &&
    normalizeName(match.team_away) === normalizeName(apiHome);

  const home = localIsReversed ? apiAway : apiHome;
  const away = localIsReversed ? apiHome : apiAway;
  const scoreHome = localIsReversed ? awayScore : homeScore;
  const scoreAway = localIsReversed ? homeScore : awayScore;

  const homeScorers = parseGoalDetails(event.strHomeGoalDetails, apiHome);
  const awayScorers = parseGoalDetails(event.strAwayGoalDetails, apiAway);
  const scorers = localIsReversed
    ? [...awayScorers, ...homeScorers]
    : [...homeScorers, ...awayScorers];

  match.idEvent = String(eventId);
  match.team_home = home || match.team_home;
  match.team_away = away || match.team_away;
  //if (date) match.date = date;
  //if (time) match.time = time;
  //if (event.strVenue) match.venue = event.strVenue;

  if (scoreHome !== null && scoreAway !== null) {
    match.score_home = scoreHome;
    match.score_away = scoreAway;
    match.status = 'finished';
    if (scorers.length > 0 || !Array.isArray(match.scorers)) {
      match.scorers = scorers;
    }
    match.lastUpdate = new Date().toISOString();
    return true;
  }

  if (match.status !== 'finished') {
    match.status = event.strStatus && /live|in play/i.test(event.strStatus) ? 'live' : 'upcoming';
  }

  return false;
}

function rebuildScorers(matches) {
  const players = {};

  for (const match of matches) {
    if (match.status !== 'finished' || !Array.isArray(match.scorers)) continue;

    for (const scorerSpec of match.scorers) {
      const [, ...nameParts] = String(scorerSpec).split(':');
      const playerName = nameParts.join(':').trim();
      if (playerName) players[playerName] = (players[playerName] || 0) + 1;
    }
  }

  const maxGoals = Math.max(0, ...Object.values(players));
  return { max_goals: maxGoals, players };
}

function updateActualResults(actualResults, matches, scorers, hasFreshSourceData) {
  actualResults.official_standings = computeOfficialGroupStandings(matches);
  actualResults.actual_pichichi = Object.entries(scorers.players)
    .filter(([, goals]) => goals === scorers.max_goals && goals > 0)
    .map(([playerName]) => playerName)
    .sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));

  actualResults.actual_positions = actualResults.actual_positions || {};
  for (const [group, rows] of Object.entries(actualResults.official_standings)) {
    const groupMatches = matches.filter(match => match.phase === 'groups' && match.group === group);
    const finishedGroupMatches = groupMatches.filter(match => match.status === 'finished');
    if (groupMatches.length > 0 && finishedGroupMatches.length === groupMatches.length) {
      actualResults.actual_positions[group] = rows.map(row => row.team);
    }
  }

  if (hasFreshSourceData) {
    actualResults.lastUpdate = new Date().toISOString();
  }

  return actualResults;
}

function isFinishedWithCachedData(match) {
  return match &&
    match.status === 'finished' &&
    match.score_home !== undefined &&
    match.score_away !== undefined &&
    Array.isArray(match.scorers) &&
    match.scorers.length > 0;
}

function shouldFetchHtmlOnlyEvent(seasonEvent, matches, seasonApiRateLimited) {
  if (!seasonEvent.htmlOnly) return true;
  if (!seasonApiRateLimited) return true;

  const linkedMatch = matches.find(match => String(match.idEvent || '') === String(seasonEvent.idEvent));
  if (!linkedMatch) return false;
  if (isFinishedWithCachedData(linkedMatch)) return false;

  const today = new Date().toISOString().slice(0, 10);
  return !linkedMatch.date || linkedMatch.date <= today;
}

function shouldFetchEventDetails(seasonEvent, matches) {
  const hasEnoughSeasonData = seasonEvent.strHomeTeam || seasonEvent.strAwayTeam || seasonEvent.strHome || seasonEvent.strAway;
  if (hasEnoughSeasonData) return true;

  const linkedMatch = matches.find(match => String(match.idEvent || '') === String(seasonEvent.idEvent));
  if (!linkedMatch) return false;
  if (isFinishedWithCachedData(linkedMatch)) return false;

  const today = new Date().toISOString().slice(0, 10);
  return !linkedMatch.date || linkedMatch.date <= today;
}

function shouldUpdateFromSeasonEvent(seasonEvent, matches) {
  const linkedMatch = matches.find(match => String(match.idEvent || '') === String(seasonEvent.idEvent));
  return !isFinishedWithCachedData(linkedMatch);
}

async function scrapeWorldCupData() {
  if (!fetchFn) {
    throw new Error('This script needs Node 18+ native fetch. GitHub Actions uses Node 20 in this repo.');
  }

  console.log('Starting World Cup 2026 daily scraper...');
  console.log(`TheSportsDB key: ${API_KEY === '123' ? 'public test key' : 'repository secret'}`);

  const matches = readJson(MATCHES_PATH, []);
  const actualResults = readJson(ACTUAL_RESULTS_PATH, {});
  const seasonEvents = await getSeasonEvents();
  const seasonApiRateLimited = Boolean(seasonEvents.seasonApiRateLimited);

  if (seasonEvents.length === 0) {
    throw new Error('No TheSportsDB event IDs were found.');
  }

  let matched = 0;
  let finishedUpdated = 0;
  let skipped = 0;
  let errors = 0;

  for (const seasonEvent of seasonEvents) {
    const eventId = seasonEvent.idEvent;
    if (!shouldUpdateFromSeasonEvent(seasonEvent, matches)) {
      skipped++;
      continue;
    }

    if (!shouldFetchHtmlOnlyEvent(seasonEvent, matches, seasonApiRateLimited)) {
      skipped++;
      continue;
    }

    if (!shouldFetchEventDetails(seasonEvent, matches)) {
      skipped++;
      continue;
    }

    try {
      const hasEnoughSeasonData = seasonEvent.strHomeTeam || seasonEvent.strAwayTeam || seasonEvent.strHome || seasonEvent.strAway;
      const event = hasEnoughSeasonData ? seasonEvent : await getEvent(eventId);
      if (!event) {
        skipped++;
        continue;
      }

      const match = findLocalMatch(matches, event, eventId);
      if (!match) {
        console.log(
          `[SKIP] No local match found for ${event.strHomeTeam} vs ${event.strAwayTeam}`
        );
        skipped++;
        continue;
      }

      matched++;
      if (updateMatchFromEvent(match, event, eventId)) {
        finishedUpdated++;
        console.log(`Finished: ${match.team_home} ${match.score_home}-${match.score_away} ${match.team_away}`);
      }
    } catch (error) {
      errors++;
      console.warn(`Could not update event ${eventId}: ${error.message}`);
    }

    if (!(seasonEvent.strHomeTeam || seasonEvent.strAwayTeam || seasonEvent.strHome || seasonEvent.strAway)) {
      await sleep(REQUEST_DELAY_MS);
    }
  }

  const scorers = rebuildScorers(matches);
  updateActualResults(actualResults, matches, scorers, matched > 0);

  writeJson(MATCHES_PATH, matches);
  writeJson(SCORERS_PATH, scorers);
  writeJson(ACTUAL_RESULTS_PATH, actualResults);

  console.log('Scraper finished.');
  console.log(`Events found: ${seasonEvents.length}`);
  console.log(`Matches linked: ${matched}`);
  console.log(`Finished matches updated: ${finishedUpdated}`);
  console.log(`Skipped events: ${skipped}`);
  console.log(`Errors: ${errors}`);
  console.log(`Scorers in table: ${Object.keys(scorers.players).length}`);
}

scrapeWorldCupData().catch(error => {
  console.error('Scraper failed:', error);
  process.exit(1);
});
