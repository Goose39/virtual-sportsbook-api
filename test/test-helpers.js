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
        teams
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

module.exports = {
  makeUsersArray,
  cleanTables,
  makeAuthHeader,
  seedUsers,
};
