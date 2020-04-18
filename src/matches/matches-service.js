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
  // Get match by Id and serialize match data with required at for client needs
  getMatchById(db, matchId) {
    return db
    .select('*')
    .from('matches')
    .where('match_id','=', matchId)
    .join('sports', 'matches.sport_id', '=' ,'sports.sport_id')
    .join('leagues', 'leagues.league_id', '=' ,'matches.league_id')
    .then( res => {
      let match = res[0];
      return db
      .select('team_name')
      .from('teams')
      .where('team_id','=', match.home_team_id)
      .then(homeTeam => {
        match.home_team_name = homeTeam[0].team_name;
        return db
        .select('team_name')
        .from('teams')
        .where('team_id','=', match.away_team_id)
        .then(awayTeam => {
          match.away_team_name = awayTeam[0].team_name;
          return match
        })
      })
    })
  },
  getTeamById(db, teamId) {
    return db
    .select('team_name')
    .from('teams')
    .where('team_id','=', teamId)
    .then(team => team[0].team_name)
  },
  // Format match data for client 
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
  // Create promise array of all matches to be serialized
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
  // Format match match list tree for client (Sports >> Leagues >> Matches)
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
  // Response with 10 matches from chronologically sorted matches 
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