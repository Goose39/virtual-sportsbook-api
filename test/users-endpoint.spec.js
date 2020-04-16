const knex = require('knex');
const bcrypt = require('bcryptjs');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe('Users Endpoints', function() {
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
  before('insert users', () =>
    helpers.seedUsers(
      db,
      testUsers,
    )
  );
  after('cleanup', () => helpers.cleanTables(db));
  after('disconnect from db', () => db.destroy());
 

  describe(`POST /api/users`, () => {

    context(`User Validation`, () => {
      const requiredFields = ['user_name', 'password', 'full_name'];

      requiredFields.forEach(field => {
        const registerAttemptBody = {
          user_id: 5,
          user_name: 'test-user-5',
          full_name: 'Test user 5',
          password: 'P@55word',
        }

      it(`responds with 400 required error when '${field}' is missing`, () => {
        delete registerAttemptBody[field]

        return supertest(app)
          .post('/api/users')
          .send(registerAttemptBody)
          .expect(400, {
            error: `Missing '${field}' in request body`,
          })
        })
      });

      it(`responds 400 'Password must be at least 8 characters' when empty password`, () => {
        const userShortPassword = {
          user_name: 'test user_name',
          password: '1234567',
          full_name: 'test full_name',
        };
        return supertest(app)
          .post('/api/users')
          .send(userShortPassword)
          .expect(400, { error: `Password must be at least 8 characters` })
      });

      it(`responds 400 'Password must be less than 72 characters' when long password`, () => {
        const userLongPassword = {
          user_name: 'test user_name',
          password: '*'.repeat(73),
          full_name: 'test full_name',
        };
        return supertest(app)
          .post('/api/users')
          .send(userLongPassword)
          .expect(400, { error: `Password must be less than 72 characters` })
      });

      it(`responds 400 error when password starts with spaces`, () => {
        const userPasswordStartsSpaces = {
          user_name: 'test user_name',
          password: ' 1Aa!2Bb@',
          full_name: 'test full_name',
        };
        return supertest(app)
          .post('/api/users')
          .send(userPasswordStartsSpaces)
          .expect(400, { error: `Password cannot start or end with empty spaces` })
      });

      it(`responds 400 error when password ends with spaces`, () => {
        const userPasswordEndsSpaces = {
          user_name: 'test user_name',
          password: '1Aa!2Bb@ ',
          full_name: 'test full_name',
        };
        return supertest(app)
          .post('/api/users')
          .send(userPasswordEndsSpaces)
          .expect(400, { error: `Password cannot start or end with empty spaces` })
      });

      it(`responds 400 error when password isn't complex enough`, () => {
        const userPasswordNotComplex = {
          user_name: 'test user_name',
          password: '11AAaabb',
          full_name: 'test full_name',
        };
        return supertest(app)
          .post('/api/users')
          .send(userPasswordNotComplex)
          .expect(400, { error: `Password must contain one upper case, lower case, number and special character` })
      });

      it(`responds 400 'User name already taken' when user_name isn't unique`, () => {
        const duplicateUser = {
          user_name: testUser.user_name,
          password: '11AAaa!!',
          full_name: 'test full_name',
        };
        return supertest(app)
          .post('/api/users')
          .send(duplicateUser)
          .expect(400, { error: `Username already taken` })
      })
    });

    context(`Happy path`, () => {

      it(`responds 201, serialized user, storing bcryped password`, () => {
        helpers.cleanTables(db)
        const newUser = {
          user_name: 'testy_User',
          password: '11AAaa!!',
          full_name: 'test full_name',
        };
        return supertest(app)
          .post('/api/users')
          .send(newUser)
          .expect(201)
          .expect(res => {
            expect(res.body.user_name).to.eql(newUser.user_name)
            expect(res.body.full_name).to.eql(newUser.full_name)
          })
          .expect(res =>
            db
              .from('users')
              .select('*')
              .where({ user_name: res.body.user_name })
              .first()
              .then(row => {
                expect(row.user_name).to.eql(newUser.user_name)
                expect(row.full_name).to.eql(newUser.full_name)
                expect(row.user_balance).to.eql(1000)
                
                return bcrypt.compare(newUser.password, row.password)
              })
              .then(compareMatch => {
                expect(compareMatch).to.eql(true)
              })
          );
      });
    });
  });


  describe(`GET /api/users/:user_id/balance`, () => {

    context(`Happy path`, () => {

      before('cleanup', () => helpers.cleanTables(db));
      before('insert users', () =>
      helpers.seedUsers(
        db,
        testUsers,
        )
      );

      it(`get user balance`, () => {
  
        return supertest(app)
          .get('/api/users/1/balance')
          .set('Authorization',validAuthHeader)
          .expect(200)
          .expect(res => {
            expect(res.body.user_balance).to.eql(10000)
          })

      });
    });
  });

  describe(`PATCH /api/users/:user_id/balance`, () => {

    context(`Happy path`, () => {
      
      it(`if user already has a balance do not reset to 1000, just return balance to update client`, () => {
  
        return supertest(app)
          .patch('/api/users/1/balance')
          .set('Authorization',validAuthHeader)
          .expect(200)
          .expect(res => {
            expect(res.body).to.eql(10000)
          })
      });

      it(`if balance is 0, reset to 1000`, () => {
        // User 10 has 0 balance
      anotherValidAuthHeader = helpers.makeAuthHeader({
        user_id: 10,
        user_name: 'test-user-10',
      })

        return supertest(app)
          .patch('/api/users/10/balance')
          .set('Authorization',anotherValidAuthHeader)
          .expect(200)
          .expect(res => {
            expect(res.body).to.eql(1000)
          })
      });

    });
  });



});
