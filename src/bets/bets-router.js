const express = require('express');
const BetsServices = require('./bets-service');
const { requireAuth } = require('../middleware/jwt-auth');

const betsRouter = express.Router();
const jsonBodyParser = express.json();
// (GET) Player bet history 
betsRouter 
  .get('/:user_id', requireAuth, (req, res, next) => {
    const user_id = req.params.user_id;

    if (user_id == null )
        return res.status(400).json({
          error: `Missing 'user_id' in request body`
        });

    return BetsServices.getUserBets(req.app.get('db'), user_id)
      .then(bets => {
            res
            .status(200)
            .json(bets)
            .end()
        })
        .catch(next)
      });
      
// (POST) To place bets 
betsRouter 
  .post('/', jsonBodyParser, requireAuth, (req, res, next) => {
    const { user_id, bet_stake } = req.body;

    for (const field of ['user_id', 'bet_stake', 'match_id', 'team_id', 'price', 'match_desc']) 
      if (!req.body[field])
        return res.status(400).json({
          error: `Missing '${field}' in request body`
        })

    return BetsServices.insertBet(req.app.get('db'), req.body)
      .then(bet => {
        return BetsServices.updateUserBalance(req.app.get('db'), user_id, bet_stake)
        .then( balance => {
          res
          .status(201)
          .send({
            bet: bet,
            balance: balance[0]          
          })
          .end()
        })
      })
      .catch(next)
    });

module.exports = betsRouter;