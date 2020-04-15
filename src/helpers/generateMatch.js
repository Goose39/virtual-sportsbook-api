const generateOdds = require('./generateMatchOdds');
const uuidv4 = require('uuid').v4;
const moment = require('moment');

const MatchGenerationServices = {
  getSportByLeague(db, leagueId) {
    return db
    .select('sport_id')
    .from('leagues')
    .where('league_id', '=', leagueId)
    .then(sportId => sportId[0].sport_id)
  },
  getSportLeagues(db, sportId) {
    return db
      .select('league_id', 'league_name')
      .from('leagues')
      .where('sport_id', '=', sportId)
      .then(leagues => leagues)
  },
  getLeaguesWithTeams(db) {
    return db
      .distinct('league_id')
      .from('league_teams')
      .then(leaguesTeams => leaguesTeams)
  }, 
  getLeagueTeams(db, leagueId) {
    return db
    .select('team_id')
    .from('league_teams')
    .where('league_id', '=', leagueId)
    .then(leaguesTeams => leaguesTeams)
  },
  getTeamData(db, teamId) {
    return db
    .select('*')
    .from('teams')
    .where('team_id', '=', teamId)
    .then(teamData => teamData[0])
  },
  insertMatch(db, match) {
    return db
    .insert(match)
    .into('matches')
  },
  
}

generateMatch = (db) => {
  console.log("match creation start")
  let leagues = []

  return MatchGenerationServices.getLeaguesWithTeams(db)
  .then( res => {
    leagues = res 
    console.log("leagues", leagues)

    //Select Random League
    let randomNum = Math.floor(Math.random()*(leagues.length));
    let matchLeague = leagues[randomNum];
    console.log("matchLeague", matchLeague)
    // Select get team in league
    let teams = [];
    return MatchGenerationServices.getLeagueTeams(db, matchLeague.league_id)
    .then( res => {
      teams = res 
      console.log("teams", teams)
      // Select 2 Random Opponents
      randomNum = Math.floor(Math.random()*(leagues.length));
      let rand1 = 0; 
      let rand2 = 0;
      console.log("rand nos", rand1, rand2)
      while (rand1 === rand2) {
        rand1 = Math.floor(Math.random()*(teams.length));
        rand2 = Math.floor(Math.random()*(teams.length));
      } 
      console.log("rand nos", rand1, rand2)
      let home = teams[rand1];
      let away = teams[rand2];
      console.log("home", home)
      console.log("away", away)

      return MatchGenerationServices.getTeamData(db, home.team_id)
      .then( data => {
        let homeData = data;
        console.log("homeData", homeData)
        return MatchGenerationServices.getTeamData(db, away.team_id)
        .then( data => {
          let awayData = data;
          console.log("awayData", awayData)
          return generateOdds(homeData, awayData, db)
          .then(odds => {
            console.log("odds", odds)
            return MatchGenerationServices.getSportByLeague(db, matchLeague.league_id)
            .then(sportId => {
              const match_start_time = moment().add(5, 'm')
              const matchId = uuidv4();

              let match = {
                match_id: matchId,
                sport_id: sportId, 
                league_id: matchLeague.league_id,
                match_start: match_start_time,
                home_team_id: home.team_id,
                away_team_id: away.team_id,
                home_team_price: odds.home_odd,
                away_team_price: odds.away_odd
              }
    
              return MatchGenerationServices.insertMatch(db, match)
              .then(res => console.log(`match ${matchId} created`))
            })
          })
        })
      })
    })
  })
  .catch(error => console.log("error generating match: ", error))
}

module.exports = generateMatch;