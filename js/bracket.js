/**
 * bracket.js — Cuadro de eliminatorias Mundial 2026
 */

(function () {
  'use strict';

  const FLAG_CODES = {
    "Francia":"fr","España":"es","Argentina":"ar","Brasil":"br",
    "Inglaterra":"gb-eng","Portugal":"pt","Alemania":"de","Países Bajos":"nl",
    "Colombia":"co","Senegal":"sn","Croacia":"hr","Uruguay":"uy",
    "Bélgica":"be","Marruecos":"ma","Estados Unidos":"us","México":"mx",
    "Noruega":"no","Ecuador":"ec","Japón":"jp","Suiza":"ch",
    "Turquía":"tr","Egipto":"eg","Corea del Sur":"kr","Suecia":"se",
    "Canadá":"ca","Austria":"at","Sudáfrica":"za","Paraguay":"py",
    "Escocia":"gb-sct","Ghana":"gh","República Checa":"cz","Argelia":"dz",
    "Irán":"ir","Arabia Saudita":"sa","Jordania":"jo",
    "Bosnia y Herzegovina":"ba","Costa de Marfil":"ci","Australia":"au",
    "Túnez":"tn","RD Congo":"cd","Uzbekistán":"uz","Catar":"qa",
    "Irak":"iq","Nueva Zelanda":"nz","Cabo Verde":"cv","Panamá":"pa",
    "Curazao":"cw","Haití":"ht"
  };

  // Etiqueta legible para cada código de plaza
  const CODE_LABELS = {
    "GER":"Alemania","CAN":"Canadá","USA":"Estados Unidos",
    "MEX":"México","ARG":"Argentina","SUI":"Suiza",
    "1A":"1º Grupo A","2A":"2º Grupo A",
    "1B":"1º Grupo B","2B":"2º Grupo B",
    "1C":"1º Grupo C","2C":"2º Grupo C",
    "1D":"1º Grupo D","2D":"2º Grupo D",
    "1E":"1º Grupo E","2E":"2º Grupo E",
    "1F":"1º Grupo F","2F":"2º Grupo F",
    "1G":"1º Grupo G","2G":"2º Grupo G",
    "1H":"1º Grupo H","2H":"2º Grupo H",
    "1I":"1º Grupo I","2I":"2º Grupo I",
    "1J":"1º Grupo J","2J":"2º Grupo J",
    "1K":"1º Grupo K","2K":"2º Grupo K",
    "1L":"1º Grupo L","2L":"2º Grupo L",
    "3ABCDF":"3º mejor A/B/C/D/F",
    "3CDFGH":"3º mejor C/D/F/G/H",
    "3BEFIJ":"3º mejor B/E/F/I/J",
    "3AEHIJ":"3º mejor A/E/H/I/J",
    "3CEFHI":"3º mejor C/E/F/H/I",
    "3EHIJK":"3º mejor E/H/I/J/K",
    "3EFGIJ":"3º mejor E/F/G/I/J",
    "3DEIJL":"3º mejor D/E/I/J/L"
  };

  // Alias fijos (nombre canónico del equipo)
  const TEAM_ALIAS = {
    "GER":"Alemania","CAN":"Canadá","USA":"Estados Unidos",
    "MEX":"México","ARG":"Argentina","SUI":"Suiza"
  };

  const BRACKET_STRUCTURE = {
    r32: {
      label: "Dieciseisavos",
      matches: [
        { id:"400021513", homeCode:"GER",     awayCode:"3ABCDF"  },
        { id:"400021523", homeCode:"1I",       awayCode:"3CDFGH"  },
        { id:"400021518", homeCode:"2A",       awayCode:"CAN"     },
        { id:"400021522", homeCode:"1F",       awayCode:"2C"      },
        { id:"400021526", homeCode:"2K",       awayCode:"2L"      },
        { id:"400021519", homeCode:"1H",       awayCode:"2J"      },
        { id:"400021524", homeCode:"USA",      awayCode:"3BEFIJ"  },
        { id:"400021525", homeCode:"1G",       awayCode:"3AEHIJ"  },
        { id:"400021516", homeCode:"1C",       awayCode:"2F"      },
        { id:"400021514", homeCode:"2E",       awayCode:"2I"      },
        { id:"400021520", homeCode:"MEX",      awayCode:"3CEFHI"  },
        { id:"400021512", homeCode:"1L",       awayCode:"3EHIJK"  },
        { id:"400021521", homeCode:"ARG",      awayCode:"2H"      },
        { id:"400021515", homeCode:"2D",       awayCode:"2G"      },
        { id:"400021527", homeCode:"SUI",      awayCode:"3EFGIJ"  },
        { id:"400021517", homeCode:"1K",       awayCode:"3DEIJL"  }
      ]
    },
    r16: {
      label: "Octavos",
      matches: [
        { id:"400021533", homeCode:"W74", awayCode:"W77" },
        { id:"400021530", homeCode:"W73", awayCode:"W75" },
        { id:"400021529", homeCode:"W83", awayCode:"W84" },
        { id:"400021534", homeCode:"W81", awayCode:"W82" },
        { id:"400021532", homeCode:"W76", awayCode:"W78" },
        { id:"400021531", homeCode:"W79", awayCode:"W80" },
        { id:"400021528", homeCode:"W86", awayCode:"W88" },
        { id:"400021535", homeCode:"W85", awayCode:"W87" }
      ]
    },
    qf: {
      label: "Cuartos",
      matches: [
        { id:"400021536", homeCode:"W89",  awayCode:"W90"  },
        { id:"400021538", homeCode:"W93",  awayCode:"W94"  },
        { id:"400021539", homeCode:"W91",  awayCode:"W92"  },
        { id:"400021537", homeCode:"W95",  awayCode:"W96"  }
      ]
    },
    sf: {
      label: "Semifinales",
      matches: [
        { id:"400021541", homeCode:"W97",  awayCode:"W98"  },
        { id:"400021540", homeCode:"W99",  awayCode:"W100" }
      ]
    },
    final: {
      label: "Final",
      matches: [
        { id:"400021542", homeCode:"RU101", awayCode:"RU102", label:"3er puesto" },
        { id:"400021543", homeCode:"W101",  awayCode:"W102",  label:"Final" }
      ]
    }
  };

  const MATCH_NUM = {
    "400021513":"P74","400021523":"P77","400021518":"P73","400021522":"P75",
    "400021526":"P83","400021519":"P84","400021524":"P81","400021525":"P82",
    "400021516":"P76","400021514":"P78","400021520":"P79","400021512":"P80",
    "400021521":"P86","400021515":"P88","400021527":"P85","400021517":"P87",
    "400021533":"P89","400021530":"P90","400021529":"P93","400021534":"P94",
    "400021532":"P91","400021531":"P92","400021528":"P95","400021535":"P96",
    "400021536":"P97","400021538":"P98","400021539":"P99","400021537":"P100",
    "400021541":"P101","400021540":"P102",
    "400021542":"P103","400021543":"P104"
  };

  // ─── Helpers ──────────────────────────────────────────────────────────────

  function flag(name) {
    if (!name) return '';
    const code = FLAG_CODES[name] || (typeof TEAM_CODES !== 'undefined' && TEAM_CODES[name]);
    if (!code) return '';
    return `<img src="https://flagcdn.com/w40/${code}.png" alt="${name}"
              style="width:20px;height:14px;border-radius:2px;border:1px solid rgba(0,0,0,.4);
                     object-fit:cover;flex-shrink:0;vertical-align:middle;">`;
  }

  /**
   * Devuelve el nombre del equipo si está confirmado, o null si no.
   * Solo usa: 1) actual_positions explícitas, 2) standings cuando el grupo ya terminó.
   * NO usa standings provisionales de grupos incompletos.
   */
  function resolveTeam(code, standings, actualPos, groupFinished) {
    if (!code) return null;
    if (TEAM_ALIAS[code]) return TEAM_ALIAS[code];

    const simple = code.match(/^(\d)([A-L])$/);
    if (simple) {
      const pos = parseInt(simple[1]) - 1;
      const grp = simple[2];
      // 1) Posición fijada explícitamente (grupo 100% terminado y confirmado)
      if (actualPos && actualPos[grp] && actualPos[grp][pos]) return actualPos[grp][pos];
      // 2) Grupo con todos los partidos jugados → standings ya son definitivos
      if (groupFinished && groupFinished[grp] && standings[grp] && standings[grp][pos]) {
        return standings[grp][pos].team || null;
      }
      return null;
    }
    // "3ABCDF" etc → no resolvible hasta que todos esos grupos cierren
    return null;
  }

  /**
   * Devuelve la etiqueta a mostrar cuando el equipo aún no está confirmado.
   * p.ej. "1º Grupo H", "3º mejor A/B/C/D/F", "Gan. P74"
   */
  function pendingLabel(code) {
    if (!code) return 'Por definir';
    if (CODE_LABELS[code]) return CODE_LABELS[code];
    const wm = code.match(/^W(\d+)$/);
    if (wm) return `Gan. P${wm[1]}`;
    const rm = code.match(/^RU(\d+)$/);
    if (rm) return `Sub. P${rm[1]}`;
    return code;
  }

  function winnerOf(m) {
    if (!m || m.status !== 'finished') return null;
    if (m.winner_passed) return m.winner_passed;
    if (m.score_home > m.score_away) return m.team_home;
    if (m.score_away > m.score_home) return m.team_away;
    return null;
  }

  function loserOf(m) {
    if (!m || m.status !== 'finished') return null;
    const w = winnerOf(m);
    if (!w) return null;
    return w === m.team_home ? m.team_away : m.team_home;
  }

  const PODIUM_LABELS = { P1: '🥇 1.º', P2: '🥈 2.º', P3: '🥉 3.º', P4: '4️⃣ 4.º' };
  const PODIUM_LABELS_SHORT = { P1: '1.º', P2: '2.º', P3: '3.º', P4: '4.º' };

  /**
   * Para un equipo dado, devuelve qué participantes lo eligieron, tanto en
   * sus predicciones de paso de ronda (grupos de la porra A-F) como en su
   * predicción de podio (P1-P4).
   * @param {string} teamName
   * @param {Array} participantsArr - array global `participants` de app.js
   * @returns {{ rounds: Array<{name:string, group:string}>, podium: Array<{name:string, pos:string}> }}
   */
  function getParticipantsForTeam(teamName, participantsArr) {
    const rounds = [];
    const podium = [];
    (participantsArr || []).forEach(p => {
      if (p.predictions) {
        Object.entries(p.predictions).forEach(([grp, teamList]) => {
          if ((teamList || []).includes(teamName)) {
            rounds.push({ name: p.name, group: grp });
          }
        });
      }
      if (p.podium) {
        Object.entries(p.podium).forEach(([pos, team]) => {
          if (team === teamName) {
            podium.push({ name: p.name, pos });
          }
        });
      }
    });
    return { rounds, podium };
  }

  function buildMatchMap(matchesArr) {
    const map = {};
    (matchesArr || []).forEach(m => { map[m.id] = m; });
    return map;
  }

  function resolveBracket(matchesArr, actualResults) {
    const matchMap  = buildMatchMap(matchesArr);
    const standings = (actualResults && actualResults.official_standings) || {};
    const actualPos = (actualResults && actualResults.actual_positions) || {};

    // Qué grupos han terminado todos sus partidos de fase de grupos
    const groupTotal = {}, groupDone = {}, groupFinished = {};
    matchesArr.forEach(m => {
      if (m.phase === 'groups' && m.group) {
        const g = m.group;
        groupTotal[g] = (groupTotal[g] || 0) + 1;
        if (m.status === 'finished') groupDone[g] = (groupDone[g] || 0) + 1;
      }
    });
    Object.keys(groupTotal).forEach(g => {
      groupFinished[g] = (groupDone[g] || 0) === groupTotal[g];
    });

    const winnerMap = {}, loserMap = {};
    const resolved  = {};

    ['r32','r16','qf','sf','final'].forEach(roundKey => {
      resolved[roundKey] = BRACKET_STRUCTURE[roundKey].matches.map(slot => {
        const m   = matchMap[slot.id];
        const num = MATCH_NUM[slot.id] || '';

        // ── Equipo local ──────────────────────────────────────────────────
        // Prioridad 1: el scraper ya lo tiene en matches.json
        let home = m && m.team_home && m.team_home !== 'Por definir' ? m.team_home : null;
        let homeCode = slot.homeCode; // guardamos el código para el label de pendiente

        // Prioridad 2: resolver por standings/posiciones confirmadas
        if (!home) home = resolveTeam(slot.homeCode, standings, actualPos, groupFinished);

        // Prioridad 3: ganador/perdedor de ronda anterior
        if (!home) {
          const wm = slot.homeCode && slot.homeCode.match(/^W(\d+)$/);
          if (wm) home = winnerMap['W' + wm[1]] || null;
          const rm = slot.homeCode && slot.homeCode.match(/^RU(\d+)$/);
          if (rm) home = loserMap['RU' + rm[1]] || null;
        }

        // ── Equipo visitante ──────────────────────────────────────────────
        let away = m && m.team_away && m.team_away !== 'Por definir' ? m.team_away : null;
        let awayCode = slot.awayCode;

        if (!away) away = resolveTeam(slot.awayCode, standings, actualPos, groupFinished);

        if (!away) {
          const wm = slot.awayCode && slot.awayCode.match(/^W(\d+)$/);
          if (wm) away = winnerMap['W' + wm[1]] || null;
          const rm = slot.awayCode && slot.awayCode.match(/^RU(\d+)$/);
          if (rm) away = loserMap['RU' + rm[1]] || null;
        }

        const finished  = m && m.status === 'finished';
        const scoreHome = finished ? m.score_home : null;
        const scoreAway = finished ? m.score_away : null;
        const winner    = finished ? winnerOf(m)  : null;
        const loser     = finished ? loserOf(m)   : null;
        const date      = m ? m.date : null;
        const extra     = m && m.decided_by ? m.decided_by : null;

        if (num) {
          if (winner) winnerMap['W' + num.replace('P','')] = winner;
          if (loser)  loserMap['RU' + num.replace('P','')] = loser;
        }

        const time = m ? m.time : null;
        return {
          id: slot.id, num,
          home, homeCode,
          away, awayCode,
          scoreHome, scoreAway,
          winner, finished, date, time, extra,
          label: slot.label || null
        };
      });
    });

    return resolved;
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('es-ES', { day:'numeric', month:'short' });
  }

  function formatTime(timeStr) {
    if (!timeStr) return '';
    return timeStr.substring(0, 5);
  }

  function teamDetailPanel(panelId, teamName) {
    const participantsArr = (typeof participants !== 'undefined') ? participants : [];
    const { rounds, podium } = getParticipantsForTeam(teamName, participantsArr);

    if (rounds.length === 0 && podium.length === 0) {
      return `<div id="${panelId}" class="bracket-team-panel" style="display:none;padding:6px 10px 8px;font-size:10.5px;color:#475569;">
                Nadie la eligió todavía.
              </div>`;
    }

    let sectionsHtml = '';

    // ── Sección: seleccionadores (predicciones de grupo) ─────────────────────
    if (rounds.length > 0) {
      const namesHtml = rounds.map(r =>
        `<span style="font-size:10.5px;font-weight:600;color:#e2e8f0;">${r.name}</span>`
      ).join('<span style="color:#475569;margin:0 2px">,</span> ');

      sectionsHtml += `
        <div style="margin-bottom:${podium.length > 0 ? '4px' : '0'};">
          <div style="line-height:1.3;font-size:10.5px;color:#e2e8f0;">${rounds.map(r => r.name).join(', ')}</div>
        </div>`;
    }

    // ── Separador ─────────────────────────────────────────────────────────────
    if (rounds.length > 0 && podium.length > 0) {
      sectionsHtml += `<div style="height:1px;background:#1e293b;margin:3px 0;"></div>`;
    }

    // ── Sección: apostadores de podio, compacto con iconos de medalla ────────
    if (podium.length > 0) {
      // Agrupar por posición
      const byPos = { P1: [], P2: [], P3: [], P4: [] };
      podium.forEach(p => { if (byPos[p.pos]) byPos[p.pos].push(p.name); });

      const ICONS = { P1: '🥇', P2: '🥈', P3: '🥉', P4: '4️⃣' };
      const podiumLines = ['P1','P2','P3','P4']
        .filter(pos => byPos[pos].length > 0)
        .map(pos => `
          <div style="line-height:1.3;font-size:10.5px;color:#cbd5e1;">
            <span style="margin-right:3px;">${ICONS[pos]}</span>${byPos[pos].join(', ')}
          </div>`).join('');

      sectionsHtml += `
        <div>
          <div style="font-size:8.5px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;
                      color:#64748b;margin-bottom:2px;">
            <i class="fa-solid fa-trophy" style="font-size:7px;margin-right:3px;"></i>Top4
          </div>
          <div style="display:flex;flex-direction:column;gap:0px;">${podiumLines}</div>
        </div>`;
    }

    return `
      <div id="${panelId}" class="bracket-team-panel" style="display:none;padding:6px 10px 8px;">
        ${sectionsHtml}
      </div>`;
  }

  function teamRow(name, code, score, isWinner, finished, chosenTeams, panelId) {
    const confirmed = !!name;
    const isChosen = confirmed && chosenTeams && chosenTeams.has(name);
    const isDimmed = confirmed && chosenTeams && !isChosen;

    // Comprobar si hay algo que mostrar en el panel antes de poner chevron
    const participantsArr = (typeof participants !== 'undefined') ? participants : [];
    const { rounds, podium } = confirmed ? getParticipantsForTeam(name, participantsArr) : { rounds: [], podium: [] };
    const hasPanel = rounds.length > 0 || podium.length > 0;

    const togglePanel = confirmed && panelId && hasPanel
      ? `onclick="window.toggleBracketTeamPanel('${panelId}', event)"`
      : '';
    const rowCursor = confirmed && hasPanel ? 'cursor:pointer;' : '';
    const rowHighlight = isChosen
      ? 'background:rgba(244,63,94,.12);box-shadow:inset 2px 0 0 #f43f5e;'
      : '';
    const rowOpacity = isDimmed ? 'opacity:.35;' : '';
    const caretIcon = confirmed && hasPanel
      ? `<i class="fa-solid fa-chevron-down" id="${panelId}_caret" style="font-size:8px;color:#fb7185;opacity:.7;flex-shrink:0;transition:transform .15s;"></i>`
      : '';
    const displayName = confirmed
      ? `<span style="text-decoration:underline;text-decoration-color:transparent;text-decoration-style:dotted;
                      transition:text-decoration-color .15s;"
               onmouseover="this.style.textDecorationColor='#f43f5e'"
               onmouseout="this.style.textDecorationColor='transparent'">${name}</span>`
      : `<span style="font-style:italic;color:#475569;font-size:10.5px">${pendingLabel(code)}</span>`;
    const flagHtml = confirmed ? flag(name) : '';
    const scoreHtml = finished && score !== null
      ? `<span style="font-size:13px;font-weight:700;min-width:16px;text-align:right;
                      color:${isWinner ? '#f0fdf4' : '#94a3b8'}">${score}</span>`
      : '';
    const boldStyle = isWinner
      ? 'font-weight:600;color:#f8fafc'
      : (confirmed ? 'color:#cbd5e1' : '');

    return `
      <div ${togglePanel} style="display:flex;align-items:center;gap:7px;padding:5px 10px;min-height:30px;
                  transition:opacity .15s,background .15s;${rowCursor}${rowHighlight}${rowOpacity}">
        <span style="width:20px;flex-shrink:0;">${flagHtml}</span>
        <span style="flex:1;font-size:11.5px;white-space:nowrap;overflow:hidden;
                     text-overflow:ellipsis;${boldStyle}">
          ${displayName}
        </span>
        ${scoreHtml}
        ${caretIcon}
      </div>`;
  }

  function matchCard(slot, chosenTeams) {
    const homeWon = slot.finished && slot.winner === slot.home;
    const awayWon = slot.finished && slot.winner === slot.away;
    const extraBadge = slot.extra === 'penalties'
      ? `<span style="font-size:9px;background:#1e293b;color:#94a3b8;
                      padding:1px 5px;border-radius:3px;margin-left:4px">PEN</span>`
      : (slot.extra === 'extra_time'
          ? `<span style="font-size:9px;background:#1e293b;color:#94a3b8;
                          padding:1px 5px;border-radius:3px;margin-left:4px">ET</span>`
          : '');

    const labelHtml = slot.label
      ? `<div style="font-size:9.5px;font-weight:700;text-align:center;
                     letter-spacing:.05em;color:#f43f5e;padding:3px 6px 0;
                     text-transform:uppercase">${slot.label}</div>`
      : '';
    const dateTime = [formatDate(slot.date), slot.time ? formatTime(slot.time) : '']
      .filter(Boolean).join(' · ');
    const metaHtml = `<div style="font-size:9px;color:#475569;padding:2px 10px 3px;
                                  display:flex;align-items:center;gap:5px;background:#0f172a;">
                        <span>${slot.num}${extraBadge}</span>
                        ${dateTime ? `<span style="color:#64748b">${dateTime}</span>` : ''}
                     </div>`;

    const homePanelId = slot.home ? `bp_${slot.id}_home` : null;
    const awayPanelId = slot.away ? `bp_${slot.id}_away` : null;

    return `
      <div style="background:#1e293b;border:1px solid #334155;border-radius:8px;
                  overflow:hidden;margin:0 3px;">
        ${labelHtml}
        ${metaHtml}
        <div style="border-top:1px solid #334155;">
          ${teamRow(slot.home, slot.homeCode, slot.scoreHome, homeWon, slot.finished, chosenTeams, homePanelId)}
          ${homePanelId ? teamDetailPanel(homePanelId, slot.home) : ''}
          <div style="height:1px;background:#334155;margin:0 10px;"></div>
          ${teamRow(slot.away, slot.awayCode, slot.scoreAway, awayWon, slot.finished, chosenTeams, awayPanelId)}
          ${awayPanelId ? teamDetailPanel(awayPanelId, slot.away) : ''}
        </div>
      </div>`;
  }

  function renderBracket(resolved, chosenTeams) {

    function makeRoundColumn(key, slots) {
      const round = BRACKET_STRUCTURE[key];

      // ── FINAL: 3er puesto y Final centrados y juntos ─────────────────────
      if (key === 'final') {
        const slot3rd   = slots.find(s => s.label === '3er puesto');
        const slotFinal = slots.find(s => s.label === 'Final');
        return `
          <div style="display:flex;flex-direction:column;min-width:148px;flex:1;">
            <div style="font-size:10px;font-weight:700;text-align:center;
                        text-transform:uppercase;letter-spacing:.06em;
                        color:#94a3b8;padding:0 4px 8px;">
              ${round.label}
            </div>
            <div style="display:flex;flex-direction:column;flex:1;justify-content:center;align-items:stretch;gap:12px;">
              ${slot3rd   ? matchCard(slot3rd,   chosenTeams) : ''}
              ${slotFinal ? matchCard(slotFinal, chosenTeams) : ''}
            </div>
          </div>`;
      }

      // ── R32 / R16 / QF / SF: partidos uniformes con divisores ────────────
      // Divisores (basados en posición 1-based dentro de R32):
      //   - múltiplo de 8  → divisor CENTRAL (rojo vivo, llega hasta QF)
      //   - múltiplo de 4 no de 8 → sub-divisor (gris, llega hasta R16)
      // R16: central tras 4, sub tras 2 y 6.  QF: central tras 2.  SF: central tras 1.
      const total = slots.length;
      let cards = '';
      slots.forEach((slot, i) => {
        cards += `
          <div style="display:flex;flex-direction:column;justify-content:center;flex:1;">
            ${matchCard(slot, chosenTeams)}
          </div>`;

        const pos    = i + 1;
        const isLast = i === total - 1;
        if (isLast) return;

        const isCentral =
          (key === 'r32' && pos % 8 === 0) ||
          (key === 'r16' && pos % 4 === 0) ||
          (key === 'qf'  && pos % 2 === 0) ||
          (key === 'sf'  && pos % 1 === 0);
        const isSub =
          (key === 'r32' && pos % 4 === 0 && pos % 8 !== 0) ||
          (key === 'r16' && pos % 2 === 0 && pos % 4 !== 0);

        if (isCentral) {
          cards += `<div style="height:3px;background:#f43f5e;margin:6px 4px;flex-shrink:0;border-radius:1px;opacity:.9;"></div>`;
        } else if (isSub) {
          cards += `<div style="height:2px;background:#ffffff;margin:5px 6px;flex-shrink:0;border-radius:1px;opacity:.9;"></div>`;
        }
      });

      return `
        <div style="display:flex;flex-direction:column;min-width:148px;flex:1;">
          <div style="font-size:10px;font-weight:700;text-align:center;
                      text-transform:uppercase;letter-spacing:.06em;
                      color:#94a3b8;padding:0 4px 8px;">
            ${round.label}
          </div>
          <div style="display:flex;flex-direction:column;flex:1;gap:4px;">
            ${cards}
          </div>
        </div>`;
    }

    const roundCols = ['r32','r16','qf','sf','final']
      .map(key => makeRoundColumn(key, resolved[key] || []))
      .join('');

    return `
      <div style="overflow-x:auto;-webkit-overflow-scrolling:touch;">
        <div style="display:flex;gap:2px;align-items:stretch;min-width:780px;padding-bottom:4px;">
          ${roundCols}
        </div>
      </div>`;
  }

  // ─── Desplegable inline: qué participantes eligieron este equipo ──────────

  window.toggleBracketTeamPanel = function (panelId, ev) {
    if (ev) ev.stopPropagation();
    const panel = document.getElementById(panelId);
    const caret = document.getElementById(panelId + '_caret');
    if (!panel) return;
    const isOpen = panel.style.display !== 'none';
    panel.style.display = isOpen ? 'none' : 'block';
    if (caret) caret.style.transform = isOpen ? '' : 'rotate(180deg)';
  };

  // ─── Punto de entrada público ─────────────────────────────────────────────

  function populateBracketParticipantFilter(participantsArr) {
    const select = document.getElementById('bracketParticipantFilter');
    if (!select || select.dataset.populated === '1') return;
    const current = select.value;
    select.innerHTML = '<option value="all">Vista general</option>';
    (participantsArr || []).forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = p.name;
      select.appendChild(opt);
    });
    if (current && current !== 'all') select.value = current;
    select.dataset.populated = '1';
  }

  window.renderKnockoutBracket = function () {
    const container = document.getElementById('knockout-bracket');
    if (!container) return;
    const matchesData      = (typeof matches      !== 'undefined') ? matches      : [];
    const resultsData      = (typeof actualResults !== 'undefined') ? actualResults : {};
    const participantsData = (typeof participants !== 'undefined') ? participants : [];
    if (!matchesData.length) {
      container.innerHTML = '<p style="color:#64748b;font-size:13px;padding:1rem">Cargando datos del cuadro…</p>';
      return;
    }

    if (participantsData.length) populateBracketParticipantFilter(participantsData);

    const filterEl = document.getElementById('bracketParticipantFilter');
    const filterId = filterEl ? filterEl.value : 'all';
    let chosenTeams = null; // null = sin filtro (vista general)
    if (filterId && filterId !== 'all') {
      const selPart = participantsData.find(p => String(p.id) === String(filterId));
      if (selPart) {
        chosenTeams = new Set();
        if (selPart.predictions) {
          Object.values(selPart.predictions).forEach(list => (list || []).forEach(t => chosenTeams.add(t)));
        }
        if (selPart.podium) {
          Object.values(selPart.podium).forEach(t => { if (t) chosenTeams.add(t); });
        }
      }
    }

    container.innerHTML = renderBracket(resolveBracket(matchesData, resultsData), chosenTeams);
  };

  function tryRender(attempts) {
    const container = document.getElementById('knockout-bracket');
    if (!container) return;
    const ready = typeof matches !== 'undefined' && Array.isArray(matches) && matches.length > 0;
    if (ready) {
      if (typeof participants !== 'undefined' && participants.length) {
        populateBracketParticipantFilter(participants);
      }
      if (!container.innerHTML.trim()) window.renderKnockoutBracket();
      return;
    }
    if (attempts > 0) setTimeout(() => tryRender(attempts - 1), 200);
    else container.innerHTML = '<p style="color:#64748b;font-size:13px;padding:1rem">No se pudieron cargar los datos del cuadro.</p>';
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => tryRender(20));
  } else {
    tryRender(20);
  }

})();