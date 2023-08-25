CREATE TABLE users (
  username VARCHAR(25) PRIMARY KEY,
  password TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL
    CHECK (position('@' IN email) > 1),
  is_admin BOOLEAN NOT NULL DEFAULT FALSE
);


CREATE TABLE logs (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  serving_size varchar NOT NULL,
  calories FLOAT NOT NULL,
  protein FLOAT NOT NULL,
  carbohydrates FLOAT NOT NULL,
  fats FLOAT NOT NULL,
  username varchar NOT NULL,
  date date NOT NULL
);

ALTER TABLE "logs" ADD FOREIGN KEY ("username") REFERENCES "users" ("username") ON DELETE CASCADE;
