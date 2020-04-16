const bcrypt = require('bcryptjs');
const config = require('../src/config');
const jwt = require('jsonwebtoken');

function makeUsersArray() {
  return [
    {
      user_id: 1,
      user_name: 'test-user-1',
      full_name: 'Test user 1',
      password: 'P@55word',
      user_balance: 10000,
    },
    {
      user_id: 2,
      user_name: 'test-user-2',
      full_name: 'Test user 2',
      password: 'P@55word',
      user_balance: 10000,
    },
    {
      user_id: 3,
      user_name: 'test-user-3',
      full_name: 'Test user 3',
      password: 'P@55word',
      user_balance: 10000,
    },
    {
      user_id: 10,
      user_name: 'test-user-10',
      full_name: 'Test user 1',
      password: 'P@55word',
      user_balance: 0,
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

function cleanBets(db) {
  return db.transaction(trx =>
    trx.raw(
      `TRUNCATE
        bets
        ;
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
  const token = jwt.sign({ user_id: user.user_id }, secret, {
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
    INSERT INTO matches (
      match_id,
      match_start,
      sport_id, 
      league_id, 
      home_team_id, 
      home_team_price, 
      away_team_id, 
      away_team_price) 
    VALUES ('9607943a-1780-4cda-891c-86b040a0573f','2020-04-11 12:00:00', 1, 1, 1, 1.9, 2, 1.9);
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
  cleanBets
};
