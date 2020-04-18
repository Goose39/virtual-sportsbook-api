
# Virtual Sportsbook API
API built to support the Virtual Sportsbook - React App.

Have a bet! Click to go to the [Live App](https://virtual-sportsbook.goose39dev.now.sh/)

## API Documentation
The api for used for authentication, match list retrieval and user bet placement. Namely user login and registration. 

### Endpoints

BASE URL: `https://aqueous-thicket-29253.herokuapp.com/api`

#### /auth <br />
auth endpoint supports user validation and thus only supports POST requests.

`fetch(https://aqueous-thicket-29253.herokuapp.com/api/auth/login, {`<br />
&nbsp;` method: 'POST',`<br />
&nbsp;&nbsp;` headers: {`<br />
&nbsp;&nbsp;&nbsp;`'content-type': 'application/json',`<br />
&nbsp;&nbsp;&nbsp;`'Authorization': `Bearer {Token}`,`<br />
&nbsp;&nbsp;`},`<br />
&nbsp;&nbsp;` body: JSON.stringify({`  <br />
&nbsp;&nbsp;&nbsp;        `user_name: user_name.value, `<br />
&nbsp;&nbsp;&nbsp;        `password: user_password.value`<br />
&nbsp;&nbsp; `}),`<br />
    `})`<br />

API will return AuthToken with payload of the user_name, and included in reponse will be user balance for initial balance on cleint side.

#### /users <br />
user endpoint supports creation of new users (POST), user balance queries (GET), balance rest queries (PATCH)  
<br />
- POST
<br />

`fetch(https://aqueous-thicket-29253.herokuapp.com/api/users, {`<br />
&nbsp;` method: 'POST',`<br />
&nbsp;&nbsp;` headers: {`<br />
&nbsp;&nbsp;&nbsp;`'content-type': 'application/json',`<br />
&nbsp;&nbsp;`},`<br />
&nbsp;&nbsp;` body: JSON.stringify({`  <br />
&nbsp;&nbsp;&nbsp;        `full_name: new_full_name, `<br />
&nbsp;&nbsp;&nbsp;        `user_name: user_name.value, `<br />
&nbsp;&nbsp;&nbsp;        `password: new_password.value`<br />
&nbsp;&nbsp; `}),`<br />
    `})`<br />

All key value pairs are required in the body to pass validation. In addition password must also contain one uppercase, one lowercase, one number and a special character, with a total password length > 8 characters
<br />
Username will be check against the current users and user will be created provide the user name is unique. Alternatively, relevant error will be returned.  
<br />
- GET
<br />
balance endpoint supports retrieval of user balances (GET), creation of initial user balance (POST) and updating of user balances (PATCH)<br />
 
`fetch(https://aqueous-thicket-29253.herokuapp.com/api/users/:user_id/balance, {`<br />
&nbsp;` method: 'GET',`<br />
&nbsp;&nbsp;` headers: {`<br />
&nbsp;&nbsp;&nbsp;`'content-type': 'application/json',`<br />
&nbsp;&nbsp;&nbsp;`'Authorization': `Bearer {Token}`,`<br />
&nbsp;&nbsp;`},`<br />
    `})`<br />
<br />
Valid authorized request will return user balance.<br />
<br />

- PATCH<br />
<br />
 
`fetch(https://aqueous-thicket-29253.herokuapp.com/api/users/:user_id/balance, {`<br />
&nbsp;` method: 'PATCH',`<br />
&nbsp;&nbsp;` headers: {`<br />
&nbsp;&nbsp;&nbsp;`'content-type': 'application/json',`<br />
&nbsp;&nbsp;&nbsp;`'Authorization': `Bearer {Token}`,`<br />
&nbsp;&nbsp;`},`<br />
    `})`<br />


#### /bets <br />
user endpoint supports creation of new bets (POST), user bet history queries (GET)  
<br />
- POST
<br />

`fetch(https://aqueous-thicket-29253.herokuapp.com/api/bets, {`<br />
&nbsp;` method: 'POST',`<br />
&nbsp;&nbsp;` headers: {`<br />
&nbsp;&nbsp;&nbsp;`'content-type': 'application/json',`<br />
&nbsp;&nbsp;`},`<br />
&nbsp;&nbsp;` body: JSON.stringify({`  <br />
&nbsp;&nbsp;&nbsp;        `user_id: user_id.value, `<br />
&nbsp;&nbsp;&nbsp;        `team_id: team_id.value, `<br />
&nbsp;&nbsp;&nbsp;        `price: price.value`<br />
&nbsp;&nbsp;&nbsp;        `bet_stake: bet_stake.value`<br />
&nbsp;&nbsp;&nbsp;        `match_desc: match_desc.value`<br />
&nbsp;&nbsp; `}),`<br />
    `})`<br />

All key value pairs are required in the body to pass validation.
<br />
Upon validation, the bet will be place and user balance reduced by bet stake. Bet Object as well as updated balance will be returned.  
<br />
- GET
<br />
 
`fetch(https://aqueous-thicket-29253.herokuapp.com/api/users/bets/:user_id/, {`<br />
&nbsp;` method: 'GET',`<br />
&nbsp;&nbsp;` headers: {`<br />
&nbsp;&nbsp;&nbsp;`'content-type': 'application/json',`<br />
&nbsp;&nbsp;&nbsp;`'Authorization': `Bearer {Token}`,`<br />
&nbsp;&nbsp;`},`<br />
    `})`<br />
<br />
Valid authorized request will return user bet history.<br />

#### /matches <br />
matches endpoint supports match queries (GET only) <br />
for full list of matches: api/matches<br />
for upcoming match list (10 matches) sorted by soonest start: api/matches/upcoming<br />
for individual match data: api/matches/match/:match_id<br />
<br />
- GET
<br />

`fetch(https://aqueous-thicket-29253.herokuapp.com/api/matches, {`<br />
&nbsp;` method: 'GET',`
    `})`<br />

Full match list returned in serialized format as one complete object<br /> 
`{sport_name:`<br />
 &nbsp; `{leagues: `<br />
  &nbsp; &nbsp;  `{league_name: [`<br />
  &nbsp;&nbsp;&nbsp;`{matchDataObj}`<br />
  &nbsp; &nbsp; &nbsp; `]`<br />
  &nbsp; &nbsp; `}`<br />
  &nbsp; `}`<br />
  `}`<br />
while upcoming and matches is an array of the individual match data objects<br />
`{`<br />
&nbsp; `"sport":"Baseball",`<br />
&nbsp; `"league":"MLB",`<br />
&nbsp; `matchId":"7816f853-03e8-43e8-a11f-8445cc86c79a",`<br />
&nbsp; `start_time":"2020-04-18T05:00:00.032Z"`<br />
&nbsp; `"home_team":"White Sox",`<br />
&nbsp; `"home_team_id":28,`<br />
&nbsp; `"away_team":"Royals"`<br />
&nbsp; `"away_team_id":29,`<br />
&nbsp; `"home_odd":1.67,`<br />
&nbsp; `"away_odd":2.1`<br />
&nbsp; `match_desc":"White Sox v Royals"`<br />
`}`<br />
<br />

## Technology
Built on NodeJS using Express (v4.17.1) web framework. The database selected for this project was PostgreSQL. 

The following supporting Node packages were also used:
- bcryptjs v2.4.3
- cors v2.8.5
- cron: v1.8.2 (for automated match creation, reulting and settlement)
- dotenv v8.2.0
- helmet v3.21.2
- jsonwebtoken v8.5.1
- knex v0.20.13
- moment: v2.24.0
- morgan v1.9.1
- pg v8.0.0
- xss v1.0.6