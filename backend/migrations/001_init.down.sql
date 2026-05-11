DROP INDEX IF EXISTS idx_runs_status;
DROP INDEX IF EXISTS idx_runs_assistant_id;
DROP INDEX IF EXISTS idx_runs_user_id_created_at;
DROP INDEX IF EXISTS idx_assistants_search;
DROP INDEX IF EXISTS idx_assistants_is_active;
DROP INDEX IF EXISTS idx_assistants_category_id;

DROP TABLE IF EXISTS runs;
DROP TABLE IF EXISTS assistants;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;

DROP TYPE IF EXISTS run_status;
DROP TYPE IF EXISTS user_role;