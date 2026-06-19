-- Open Gaming Platform — PostgreSQL schema initialization
-- Creates separate schemas for each domain (schema-per-domain strategy)

CREATE SCHEMA IF NOT EXISTS identity;
CREATE SCHEMA IF NOT EXISTS wallet;
CREATE SCHEMA IF NOT EXISTS gaming;
CREATE SCHEMA IF NOT EXISTS trading;

-- Grant all privileges to the application user on each schema
GRANT ALL ON SCHEMA identity TO ogp_user;
GRANT ALL ON SCHEMA wallet  TO ogp_user;
GRANT ALL ON SCHEMA gaming  TO ogp_user;
GRANT ALL ON SCHEMA trading TO ogp_user;

-- Allow future tables to be accessible
ALTER DEFAULT PRIVILEGES IN SCHEMA identity GRANT ALL ON TABLES TO ogp_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA wallet  GRANT ALL ON TABLES TO ogp_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA gaming  GRANT ALL ON TABLES TO ogp_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA trading GRANT ALL ON TABLES TO ogp_user;
