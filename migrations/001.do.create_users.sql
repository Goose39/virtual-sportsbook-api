CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  user_name TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  password TEXT NOT NULL,
  user_balance INTEGER DEFAULT 1000,
  date_created TIMESTAMP DEFAULT NOW()
);