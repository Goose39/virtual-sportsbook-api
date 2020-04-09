CREATE TABLE leagues (
  league_id SERIAL PRIMARY KEY,
  sport_id INTEGER NOT NULL,
  league_name TEXT NOT NULL UNIQUE,
  FOREIGN KEY (sport_id) REFERENCES sports (sport_id)
);