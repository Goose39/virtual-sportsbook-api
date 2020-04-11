const knex = require('knex');
const app = require('../src/app');
const moment = require('moment');
const helpers = require('./test-helpers');

describe('Matches Endpoint', function() {
  let db

  const futureMatch = {
    match_id: 'b5c8d620-32cb-42e7-8ce5-aade64d828fc',
    match_start: "2020-05-10T00:00:00.00Z",
    sport_id: 1,
    league_id: 1,
    home_team_id: 1,
    home_team_price: 1.9,
    away_team_id: 2,
    away_team_price: 1.9,
  }

  const pastMatch = {
    match_start: "2020-04-10T00:00:00.00",
    sport_id: 1,
    league_id: 1,
    home_team_id: 1,
    home_team_price: 1.9,
    away_team_id: 2,
    away_team_price: 1.9,
  }

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL,
    });
    app.set('db', db);
  });

  before('cleanup', () => helpers.cleanTables(db));
  before('Seed Data', () => helpers.seedData(db));

  after('cleanup', () => helpers.cleanTables(db));
  after('disconnect from db', () => db.destroy());

  describe(`GET /api/matches`, () => {

    context(`Empty match table`, () => {

        it(`responds with 200 if no upcoming matches`, () => {
          return supertest(app)
            .get('/api/matches')
            .expect(200)
            .expect(res => expect(res.body).to.eql({}));
        });
    });

    context(`Old matches not returned`, () => {

      before('Add old match to match table', () => helpers.addMatch(db, pastMatch));

        it(`responds with 200 if all matches are already past`, () => {
          return supertest(app)
            .get('/api/matches')
            .expect(200)
            .expect(res => expect(res.body).to.eql({}));
        });
    });

    context(`Happy path, display upcoming matches`, () => {

      before('Add Match to match table', () => helpers.addMatch(db, futureMatch));

      it(`responds 200 and upcoming matches`, () => {
        return supertest(app)
          .get('/api/matches')
          .expect(200)
          .expect(res => {
            expect(res.body).to.eql(
              { 
                Soccer: { 
                  leagues: { 
                    'Premier League':  [
                      {
                        away_odd: 1.9,
                        away_team: "Man. City",
                        home_odd: 1.9,
                        home_team: "Liverpool",
                        league: "Premier League",
                        matchId: "b5c8d620-32cb-42e7-8ce5-aade64d828fc",
                        sport: "Soccer",
                        start_time: "2020-05-10T04:00:00.000Z",
                      }
                    ] 
                  } 
                } 
              });
          });
      });
    });
  });
});
