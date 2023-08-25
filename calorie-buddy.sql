\echo 'Delete and recreate my-calorie-buddy db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE my_calorie_buddy;
CREATE DATABASE my_calorie_buddy;
\connect my_calorie_buddy

\i calorie-buddy-schema.sql
\i calorie-buddy-seed.sql


