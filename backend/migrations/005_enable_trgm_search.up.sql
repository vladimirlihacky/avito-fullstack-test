CREATE EXTENSION IF NOT EXISTS pg_trgm;

DROP INDEX IF EXISTS idx_assistants_search;

CREATE INDEX idx_assistants_trgm_search ON assistants 
    USING gin ((coalesce(name, '') || ' ' || coalesce(description, '')) gin_trgm_ops);