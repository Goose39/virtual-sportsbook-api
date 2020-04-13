const BetsServices = {
  getUserBets(db, user_id) {
    return db
      .from('bets')
      .where({user_id})
      .join('matches', 'matches.match_id', '=', 'bets.match_id')
      .join('teams', 'matches.home_team_id', '=', 'teams.team_id')
      // .the({
      //   return db
      // })
      // .join('teams')
      // .select('bets.bet_id, matches.home_team, matches.away_team')
  },
  insertBet(db, bet) {
    return db
    .into('bets')
    .insert(bet)
    .returning('bet_id')
    .then(id => {
      return this.getBetById(db, id[0]);
    })
  }, 
  getBetById(db, bet_id) {
    return db
      .select('*')
      .from('bets')
      .where({bet_id})
      .then(res => res[0])
  },
  updateUserBalance(db, user_id, bet) {
    return this.getUserBalance(db, user_id)
    .then(balance => {
      let newBalance = (balance-bet).toFixed(2);
      return db
      .select('*')
      .from('users')
      .where({user_id})
      .update({'user_balance': newBalance})
      .then(res => res)
    })
  },
  getUserBalance(db, user_id) {
    return db
    .from('users')
    .select('user_balance')
    .where({user_id})
    .then(balance => balance[0].user_balance)
  },
}

module.exports = BetsServices;