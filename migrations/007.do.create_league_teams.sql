CREATE TABLE league_teams (
  league_id INTEGER NOT NULL,
  FOREIGN KEY (league_id) REFERENCES leagues (league_id),
  team_id INTEGER NOT NULL,
  FOREIGN KEY (team_id) REFERENCES teams (team_id)
);
