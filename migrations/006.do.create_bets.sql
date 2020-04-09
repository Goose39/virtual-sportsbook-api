CREATE TABLE bets (
  bet_id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users (user_id),
  bet_stake REAL NOT NULL,
  match_id uuid NOT NULL, 
  FOREIGN KEY (match_id) REFERENCES matches (match_id),
  team_id INTEGER NOT NULL,
  FOREIGN KEY (team_id) REFERENCES teams (team_id),
  price REAL NOT NULL,
  date_created TIMESTAMP DEFAULT now() NOT NULL
);
