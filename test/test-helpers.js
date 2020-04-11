const bcrypt = require('bcryptjs');
const config = require('../src/config');
const jwt = require('jsonwebtoken');

function makeUsersArray() {
  return [
    {
      user_name: 'test-user-1',
      full_name: 'Test user 1',
      password: 'P@55word',
      user_balance: 10000,
    },
    {
      user_name: 'test-user-2',
      full_name: 'Test user 2',
      password: 'P@55word',
      user_balance: 10000,
    },
    {
      user_name: 'test-user-3',
      full_name: 'Test user 3',
      password: 'P@55word',
      user_balance: 10000,
    },
  ]
};


function cleanTables(db) {
  return db.transaction(trx =>
    trx.raw(
      `TRUNCATE
        users,
        sports,
        leagues,
        matches,
        bets,
        teams,
        league_teams
      RESTART IDENTITY CASCADE;
      `
    )
  );
};

function seedUsers(db, users) {
  const preppedUsers = users.map(user => ({
    ...user,
    password: bcrypt.hashSync(user.password, 1)
  }));
  return db.into('users').insert(preppedUsers)
};

function makeAuthHeader(user, secret = config.JWT_SECRET) {
  const token = jwt.sign({ id: user.id }, secret, {
    subject: user.user_name,
    algorithm: 'HS256',
  });
  return `Bearer ${token}`;
};

function seedData(db) {
  return db.transaction(trx =>
    trx.raw(`
    BEGIN;
    TRUNCATE
    users,
    sports,
    leagues,
    matches,
    bets,
    teams
    RESTART IDENTITY CASCADE; 
    INSERT INTO sports (sport_name) VALUES ('Soccer');
    INSERT INTO leagues (league_name, sport_id) VALUES ('Premier League', 1);
    INSERT INTO teams (team_name, team_ranking) VALUES 
      ('Liverpool', 1),
      ('Man. City', 2)
    ;
    INSERT INTO league_teams (league_id, team_id) VALUES (1, 1);
    INSERT INTO league_teams (league_id, team_id) VALUES (1, 2);
  `)
  )
}

function addMatch(db, match) {
  return db.into('matches').insert(match);
}

module.exports = {
  makeUsersArray,
  cleanTables,
  makeAuthHeader,
  seedUsers,
  seedData,
  addMatch,
};
