CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE matches (
  match_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_start TIMESTAMP,
  sport_id INTEGER NOT NULL,
  FOREIGN KEY (sport_id) REFERENCES sports (sport_id),
  league_id INTEGER NOT NULL,
  FOREIGN KEY (league_id) REFERENCES leagues (league_id),
  home_team_id INTEGER NOT NULL,
  FOREIGN KEY (home_team_id) REFERENCES teams (team_id),
  home_team_price REAL NOT NULL,
  away_team_id INTEGER NOT NULL,
  FOREIGN KEY (away_team_id)  REFERENCES teams (team_id),
  away_team_price REAL NOT NULL,
  match_winner INTEGER DEFAULT NULL,
  FOREIGN KEY (match_winner) REFERENCES teams (team_id)
);

