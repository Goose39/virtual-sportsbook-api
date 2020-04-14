const MatchesServices = {
  getMatches(db) {
    return db
      .select('*')
      .from('matches')
      .where('match_start','>', db.fn.now())
  },
  getSportById(db, sportId) {
    return db
      .select('sport_name')
      .from('sports')
      .where({'sport_id': sportId})  
      .first()
      .then(sport => sport.sport_name)
  },
  getLeagueById(db, leagueId) {
    return db
    .select('league_name')
    .from('leagues')
    .where('league_id','=', leagueId)
    .then(league => league[0].league_name)
  },
  getMatchById(db, matchId) {
    return db
    .select('*')
    .from('matches')
    .where('macth_id','=', matchId)
  },
  getTeamById(db, teamId) {
    return db
    .select('team_name')
    .from('teams')
    .where('team_id','=', teamId)
    .then(team => team[0].team_name)
  },
  serializeMatch(db, match) {
    let sportName, leagueName, homeTeam, awayTeam;

      return this.getSportById(db, match.sport_id)
      .then(sport_name => {
        sportName = sport_name;

        return this.getLeagueById(db, match.league_id)
        .then(league_name => {
          leagueName = league_name;

          return this.getTeamById(db, match.home_team_id)
          .then(homeTeamName => {
            homeTeam = homeTeamName;

            return this.getTeamById(db, match.away_team_id)
            .then(awayTeamName => {
              awayTeam = awayTeamName;

              const serializedMatch =  {
                sport: sportName,
                league: leagueName,
                matchId: match.match_id,
                start_time: match.match_start,
                home_team: homeTeam,
                home_team_id: match.home_team_id,
                away_team: awayTeam, 
                away_team_id: match.away_team_id,
                home_odd: match.home_team_price,
                away_odd: match.away_team_price, 
                match_desc: `${homeTeam} v ${awayTeam}`
              };
              return serializedMatch;
            })
          })
        })
      })
      
  },
  serializeMatches(db, matches) {
    
    let promises = matches.map(match => {
      return this.serializeMatch(db, match)
      .then(match => match)
      .catch(error => console.log(error))
    })

    return Promise.all(promises)
    .then(matches => matches)
    .catch (error => console.log(error))
  },
  matchesApiFormat(serializedMatches) {
    let apiFormatedMatches = {};
    
    serializedMatches.forEach(match => {
      const sportName = match.sport;
      const leagueName = match.league;

      if (!apiFormatedMatches[sportName]) {
        apiFormatedMatches[sportName] = {leagues: {}}
      };
      if (!apiFormatedMatches[sportName].leagues[leagueName]) {
        apiFormatedMatches[sportName].leagues[leagueName] = []
      };
      apiFormatedMatches[sportName].leagues[leagueName].push(match);
    });
    return apiFormatedMatches;
  },
  getMatchesSorted(db) {
    return db
      .select('*')
      .from('matches')
      .where('match_start','>', db.fn.now())
      .then(res => {
        let matches = res.slice(0,10);
        return this.serializeMatches(db, matches)
        .then(res => res)
      })
  },
}

module.exports = MatchesServices;