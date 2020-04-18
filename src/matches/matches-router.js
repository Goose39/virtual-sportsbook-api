const express = require('express');
const MatchesServices = require('./matches-service');

const matchesRouter = express.Router();
// Returns list of all matches that have not yet started
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
// Returns match data of given match_id
matchesRouter 
  .get('/match/:match_id', (req, res, next) => {
    const match_id = req.params.match_id;
    return MatchesServices.getMatchById(req.app.get('db'), match_id)
      .then(match => {
        res
        .status(200)
        .json(match)
        .end()
      })
      .catch(next)
    });
    // Responds with list of 10 matches ending the soonest
matchesRouter 
  .get('/upcoming', (req, res, next) => {
    return MatchesServices.getMatchesSorted(req.app.get('db'))
      .then(matches => {
        res
        .status(200)
        .json(matches)
        .end()
      })
      .catch(next)
    });

    
module.exports = matchesRouter;