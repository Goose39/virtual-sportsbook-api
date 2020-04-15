const MatchResultServices = {
  getUnresultedMatches(db) {
    return db
    .select('*')
    .from('matches')
    .where('match_winner', 'is', null)
    .andWhere('match_start','<', db.fn.now())
    .then(matches => matches)
  },
  getMatchTeams(db, matchId) {
    return db
    .select('away_team_id', 'away_team_price', 'home_team_id', 'home_team_price')
    .from('matches')
    .where('match_id', '=', matchId)
    .then(matchTeams => matchTeams)
  },
  getTeamData(db, team_id) {
    return db
    .select('*')
    .from('teams')
    .where({team_id})
    .then(teamData => teamData[0])
  },
  insertMatchResult(db, match_winner, match_id) {
    return db
    .into('matches')
    .where({match_id})
    .update({match_winner})
  },
}

trueProbability = (priceHome, priceAway) => {
  // Calc to get implied probabilites
  let overRound = (1/priceHome + 1/priceAway) - 1
  // removed over round from implied odd to get true probability (Home Team)
  return  (1/priceHome)-((1/priceHome)*overRound)

}

resultMatch = (db, match) => {

  let matchWinner = null;
  //Select Random Winner
  let randomNum = Math.random();
  let trueHomeProb = trueProbability(match.home_team_price, match.away_team_price)

  if (randomNum <= trueHomeProb ) {
    matchWinner = match.home_team_id
  } else matchWinner = match.away_team_id 

  return MatchResultServices.insertMatchResult(db, matchWinner, match.match_id)
}

resultMatches = (db) => {

  return MatchResultServices.getUnresultedMatches(db)
  .then( matches => {
    
    let promises = matches.map(match => {
      return resultMatch(db, match)
      .then(match => console.log(`Match ${match.match_id} resulted`))
      .catch(error => console.log(error))
    })
  
    return Promise.all(promises)
    .then(matches => matches)
    
  })
  .catch(error => console.log("error resulting matches: ", error))
}

module.exports = resultMatches;