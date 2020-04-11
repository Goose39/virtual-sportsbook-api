const knex = require('knex');
const app = require('./app');
require('./helpers/generateMatch');
require('./helpers/settleBets');
const resultMatches = require('./helpers/resultMatches');

const { PORT, DATABASE_URL } = require('./config');

const db = knex({
  client: 'pg',
  connection: DATABASE_URL,
});

app.set('db', db);

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});

const CronJob = require('cron').CronJob;

const createNewMatch = new CronJob('0 0,15,30,45 * * * * ', function() {
	const d = new Date();
  console.log('new match created', d);
  generateMatch(db);
});

//0 1,16,31,46 * * * *
const resultMatchesCron = new CronJob('0 * * * * *', function() {
  const d = new Date();
  console.log('matches resulted', d);
  resultMatches(db);
});

const settleBets = new CronJob('0 2,17,32,47 * * * *', function() {
  const d = new Date();
  console.log('bets settled', d);
  // settleBets(db);
});

createNewMatch.start();
resultMatchesCron.start();
settleBets.start();