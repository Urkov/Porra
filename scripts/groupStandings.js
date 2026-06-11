function buildOfficialGroupsFromMatches(matches) {
  const groups = {};
  matches
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

function computeOfficialGroupStandings(matches) {
  const standings = {};
  const officialGroups = buildOfficialGroupsFromMatches(matches);

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

    matches
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

module.exports = {
  buildOfficialGroupsFromMatches,
  computeOfficialGroupStandings
};
