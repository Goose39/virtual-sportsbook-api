const BetsServices = {
  getUserBets(db, user_id) {
    return db
      .select('*')
      .from('bets')
      .where({user_id})
  },
  insertBet(db, bet) {
    return db
    .into('bets')
    .insert(bet)
    .returning('bet_id')
    .then(id => {
      console.log(`new bet created. bet id: ${id[0]}`)
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
}

module.exports = BetsServices;