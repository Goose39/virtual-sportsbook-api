const OddsServices = {
  getOddsPairs(db) {
    return db
      .select('*')
      .from('odds_pairs')
      .then(oddsPairs => oddsPairs)
  },
}


const generateOdds = function(home, away, db) {
  let odds = {
    "home_odd": null,
    "away_odd": null
  }

  //Get home and away rankings
  const homeRank = home.team_ranking;
  const awayRank = away.team_ranking;

  //Calc difference in rankings/strength
  // Option 1: for data sets with more than 30 ranking spots [e.g.Golf, Cycling]
  //let teamDiff = Math.abs(Math.floor((homeRank - awayRank)));
   // Option 2: for limited/test data sets with less than 30 ranking spots
  let teamDiff = Math.ceil(Math.pow((homeRank - 1 - awayRank), 2)*0.75);

  //Get odds pair for stregth difference
  return OddsServices.getOddsPairs(db)
  .then(res => {

    // If differences between teams is higher than highest odd pair value, then diff = hioghest value of odds
    if (teamDiff > res.length-1) {
      teamDiff = res.length-1
    }

    let pair = res[teamDiff]

    //Allocate correct odd to strongest team 
    if (homeRank < awayRank) {
      odds.home_odd = pair.fav;
      odds.away_odd = pair.non_fav;
    } else {
      odds.home_odd = pair.non_fav;
      odds.away_odd = pair.fav;
    }
    //Return home and away odds
    return odds
  })
  .catch(error => console.log('error generating match odds: ', error))
}

module.exports = generateOdds;