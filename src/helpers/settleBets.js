const BetSettlementServices = {
  getUserBalance(db, user_id) {
    return db
    .from('users')
    .select('user_balance')
    .where({user_id})
    .then(balance => balance[0].user_balance)
  },
  getUnsettledBets(db) {
    return db
    .from('bets')
    .select('*')
    .where('bet_status', '=', 'Open')
    .join('matches', 'matches.match_id', '=', 'bets.match_id')
    .whereNotNull('matches.match_winner')
    .then(unsettledBets => unsettledBets)
  },
  payoutWinningBet(db, bet) {
    return this.getUserBalance(db, bet.user_id)
    .then(balance => {
      let newBalance = (balance+(bet.price*bet.bet_stake)).toFixed(2);
      return db
      .select('*')
      .from('users')
      .where({'user_id': bet.user_id})
      .update({'user_balance': newBalance})
    })
  }, 
  insertBetResult(db, bet, bet_status) {
    return db
    .into('bets')
    .where({"bet_id": bet.bet_id})
    .update({bet_status})
    .then(bets => {
      if (bet_status = 'win') {
        return this.payoutWinningBet(db, bet)
        .then(bet => {
          console.log(`Bet id: ${bet.bet_id} settled`)
        }) 
      } else {
        return
      }
    })  
  },
}

settleOpenBets = (db) => {

  return BetSettlementServices.getUnsettledBets(db)
  .then( bets => {
    console.log(bets)
    let promises = bets.map(bet => {
      if (bet.team_id === bet.match_winner) {
        return BetSettlementServices.insertBetResult(db, bet, 'win')
        .then(bet => bet)
      }
      else {
        return BetSettlementServices.insertBetResult(db, bet, 'lose')
        .then(bet => bet)
      }
    })
  
    return Promise.all(promises)
    .then(bet => bet)
    
  })
  .catch(error => console.log("error resulting matches: ", error))
}

module.exports = settleOpenBets;