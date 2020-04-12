const express = require('express');
const BetsServices = require('./bets-service');
const { requireAuth } = require('../middleware/jwt-auth');

const betsRouter = express.Router();
const jsonBodyParser = express.json();

betsRouter 
  .get('/', jsonBodyParser, requireAuth, (req, res, next) => {
    const { user_id } = req.body;

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
      

betsRouter 
  .post('/', jsonBodyParser, requireAuth, (req, res, next) => {
    const { user_id, bet_stake, match_id, team_id, price} = req.body;

    for (const field of ['user_id', 'bet_stake', 'match_id', 'team_id', 'price']) 
      if (!req.body[field])
        return res.status(400).json({
          error: `Missing '${field}' in request body`
        })

    return BetsServices.insertBet(req.app.get('db'), req.body)
      .then(bet => {
        console.log("bet",bet)
        res
          .status(201)
          .json(bet)
          .end()
        })
      .catch(next)
    });

module.exports = betsRouter;