const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe('Bets Endpoints', function() {
  let db

  const testUsers = helpers.makeUsersArray();
  const testUser = testUsers[0];
  const validAuthHeader = helpers.makeAuthHeader(testUser);

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL,
    });
    app.set('db', db);
  });

  before('cleanup', () => helpers.cleanTables(db));
  before('Seed Data', () => helpers.seedData(db));
  before('insert users', () =>
  helpers.seedUsers(
    db,
    testUsers,
  )
);

beforeEach('insert user', () => {
  const dummyBet5 = {
    user_id: 1,
    bet_stake: 100,
    match_id: "9607943a-1780-4cda-891c-86b040a0573f",
    team_id: 2,
    price: 1.2
  }
  return db
  .into('bets')
  .insert(dummyBet5)
  .then(res => res)
});

  afterEach('clean bets table', () => helpers.cleanBets(db));
  after('cleanup', () => helpers.cleanTables(db));
  after('disconnect from db', () => db.destroy());

  describe(`POST /bets/`, () => {

    context(`Bet Validation`, () => {

      const requiredFields = ['user_id', 'bet_stake', 'match_id', 'team_id', 'price', 'match_desc'];

      requiredFields.forEach(field => {

        const dummyBet1 = {
          user_id: 1,
          bet_stake: 100,
          match_id: "9607943a-1780-4cda-891c-86b040a0573f",
          team_id: 2,
          price: 1.2,
         match_desc: "Liverpool v Man. City"
        }

        it(`responds with 400 required error when '${field}' is missing`, () => {
          delete dummyBet1[field]

          return supertest(app)
            .post('/api/bets')
            .set('Authorization',validAuthHeader)
            .send(dummyBet1)
            .expect(400, {
              error: `Missing '${field}' in request body`,
            })
        })
      });
    });

    context(`Happy path`, () => {

      const dummyBet = {
        user_id: 1,
        bet_stake: 100,
        match_id: "9607943a-1780-4cda-891c-86b040a0573f",
        team_id: 2,
        price: 1.2, 
        match_desc: "Liverpool v Man. City"
      }

      it(`responds 201, check db entry and balance update`, () => {
        return supertest(app)
        .post('/api/bets')
        .set('Authorization',validAuthHeader)
        .send(dummyBet)
        .expect(201)
        .then(res => {
          expect(res.body.bet.user_id).to.eql(dummyBet.user_id)
          expect(res.body.bet.bet_stake).to.eql(dummyBet.bet_stake)
          expect(res.body.bet.match_id).to.eql(dummyBet.match_id)
          expect(res.body.bet.team_id).to.eql(dummyBet.team_id)
          expect(res.body.bet.price).to.eql(dummyBet.price)
          expect(res.body.bet.match_desc).to.eql(dummyBet.match_desc)
          expect(res.body.bet.bet_status).to.eql("Open"),
          expect(res.body.balance).to.eql(9900)
        })
      })
    });
  });

  describe(`GET /bets/`, () => {

    context(`No bets`, () => {

      it('responds with empty array', () => {
        return supertest(app)
        .get('/api/bets/25')
        .set('Authorization',validAuthHeader)
        .send({'user_id':25})
        .expect(200)
        .then(res => {
          expect(res.body).to.eql([])
        })

      })
        
    })

    context(`Happy Path`, () => {

      it('responds with user bets', () => {

        return supertest(app)
        .get(`/api/bets/1`)
        .set('Authorization',validAuthHeader)
        .send({'user_id':1})
        .expect(200)
        .then(res => {
          expect(res.body[0].user_id).to.eql(1)
          expect(res.body[0].bet_stake).to.eql(100)
          expect(res.body[0].match_id).to.eql("9607943a-1780-4cda-891c-86b040a0573f")
          expect(res.body[0].team_id).to.eql(2)
          expect(res.body[0].team_name).to.eql('Man. City')
          expect(res.body[0].price).to.eql(1.2)
        })

      })

    })

  })

});