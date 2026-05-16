DROP INDEX IF EXISTS idx_assistants_trgm_search;

CREATE INDEX idx_assistants_search ON assistants 
    USING gin(to_tsvector('russian', name || ' ' || description));