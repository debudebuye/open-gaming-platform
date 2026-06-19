-- =============================================================================
-- Open Gaming Platform — PostgreSQL initialisation
-- Runs once when the Docker container is first created.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Domain schemas
--    One schema per domain — logical isolation without multiple DB instances.
--    In V2 each schema can be moved to its own Postgres instance (config-only).
-- -----------------------------------------------------------------------------
CREATE SCHEMA IF NOT EXISTS identity;
CREATE SCHEMA IF NOT EXISTS wallet;
CREATE SCHEMA IF NOT EXISTS gaming;
CREATE SCHEMA IF NOT EXISTS trading;
CREATE SCHEMA IF NOT EXISTS admin;

-- -----------------------------------------------------------------------------
-- 2. Privileges for the application user (ogp_user)
--    ogp_user is also POSTGRES_USER so it owns the DB, but explicit grants
--    make the intent clear and support future least-privilege migration.
-- -----------------------------------------------------------------------------
GRANT ALL ON SCHEMA identity TO ogp_user;
GRANT ALL ON SCHEMA wallet   TO ogp_user;
GRANT ALL ON SCHEMA gaming   TO ogp_user;
GRANT ALL ON SCHEMA trading  TO ogp_user;
GRANT ALL ON SCHEMA admin    TO ogp_user;

-- Future tables & sequences created in each schema are also accessible
ALTER DEFAULT PRIVILEGES IN SCHEMA identity GRANT ALL ON TABLES    TO ogp_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA identity GRANT ALL ON SEQUENCES TO ogp_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA identity GRANT ALL ON FUNCTIONS TO ogp_user;

ALTER DEFAULT PRIVILEGES IN SCHEMA wallet   GRANT ALL ON TABLES    TO ogp_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA wallet   GRANT ALL ON SEQUENCES TO ogp_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA wallet   GRANT ALL ON FUNCTIONS TO ogp_user;

ALTER DEFAULT PRIVILEGES IN SCHEMA gaming   GRANT ALL ON TABLES    TO ogp_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA gaming   GRANT ALL ON SEQUENCES TO ogp_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA gaming   GRANT ALL ON FUNCTIONS TO ogp_user;

ALTER DEFAULT PRIVILEGES IN SCHEMA trading  GRANT ALL ON TABLES    TO ogp_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA trading  GRANT ALL ON SEQUENCES TO ogp_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA trading  GRANT ALL ON FUNCTIONS TO ogp_user;

ALTER DEFAULT PRIVILEGES IN SCHEMA admin    GRANT ALL ON TABLES    TO ogp_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA admin    GRANT ALL ON SEQUENCES TO ogp_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA admin    GRANT ALL ON FUNCTIONS TO ogp_user;

-- -----------------------------------------------------------------------------
-- 3. Enable UUID extension (needed for gen_random_uuid() used by TypeORM)
--    pgcrypto provides gen_random_uuid() — works without uuid-ossp.
-- -----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- -----------------------------------------------------------------------------
-- 4. Verify (shows in docker logs on first boot)
-- -----------------------------------------------------------------------------
DO $$
BEGIN
  RAISE NOTICE 'OGP schemas initialised: identity, wallet, gaming, trading, admin';
END $$;
