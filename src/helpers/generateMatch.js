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
  // Leagues that have teams 
  getLeaguesWithTeams(db) {
    return db
      .distinct('league_id')
      .from('league_teams')
      .then(leaguesTeams => leaguesTeams)
  }, 
   // Teams in that league
  getLeagueTeams(db, leagueId) {
    return db
    .select('team_id')
    .from('league_teams')
    .where('league_id', '=', leagueId)
    .then(leaguesTeams => leaguesTeams)
  },
  // Teams data (for match creation incl, rank for odds calcs)
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
  let leagues = []

  return MatchGenerationServices.getLeaguesWithTeams(db)
  .then( res => {
    leagues = res 

    //Select Random League
    let randomNum = Math.floor(Math.random()*(leagues.length));
    let matchLeague = leagues[randomNum];
    // Select two teams in league
    let teams = [];
    return MatchGenerationServices.getLeagueTeams(db, matchLeague.league_id)
    .then( res => {
      teams = res 
 
      // Select 2 Random Opponents
      let rand1 = 0; 
      let rand2 = 0;

      while (rand1 === rand2) {
        rand1 = Math.floor(Math.random()*(teams.length));
        rand2 = Math.floor(Math.random()*(teams.length));
      } 

      let home = teams[rand1];
      let away = teams[rand2];

      return MatchGenerationServices.getTeamData(db, home.team_id)
      .then( data => {
        let homeData = data;
        return MatchGenerationServices.getTeamData(db, away.team_id)
        .then( data => {
          let awayData = data;
          return generateOdds(homeData, awayData, db)
          .then(odds => {
            return MatchGenerationServices.getSportByLeague(db, matchLeague.league_id)
            .then(sportId => {
              const match_start_time = moment().add(1, 'd')
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
              .then(res => `match ${matchId} created`)
            })
          })
        })
      })
    })
  })
  .catch(error => error)
}

module.exports = generateMatch;