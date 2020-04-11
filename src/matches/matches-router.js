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

module.exports = matchesRouter;