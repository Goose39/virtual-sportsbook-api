const express = require('express');
const MatchesServices = require('./matches-service');

const matchesRouter = express.Router();

matchesRouter 
  .get('/', (req, res, next) => {
    return MatchesServices.getMatches(req.app.get('db'))
      .then(matches => {
        return MatchesServices.serializeMatches(req.app.get('db'), matches)
          .then(response => {
            const matchesObj = MatchesServices.matchesApiFormat(response)
            res
            .status(200)
            .json(matchesObj)
            .end()
          });
      })
      .catch(next)
    });

    matchesRouter 
  .get('/upcoming', (req, res, next) => {
    return MatchesServices.getMatchesSorted(req.app.get('db'))
      .then(matches => {
        console.log(matches)
        res
        .status(200)
        .json(matches)
        .end()
      })
      .catch(next)
    });
module.exports = matchesRouter;