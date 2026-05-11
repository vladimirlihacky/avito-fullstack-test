CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE user_role AS ENUM ('admin', 'user');
CREATE TYPE run_status AS ENUM ('pending', 'success', 'failed');

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    role user_role NOT NULL DEFAULT 'user',
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS assistants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    model VARCHAR(255) NOT NULL,
    system_prompt TEXT NOT NULL,
    example_user_prompt TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assistant_id UUID NOT NULL REFERENCES assistants(id),
    user_id UUID NOT NULL REFERENCES users(id),
    model VARCHAR(255) NOT NULL,
    user_prompt TEXT NOT NULL,
    output TEXT,
    status run_status NOT NULL DEFAULT 'pending',
    error TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_assistants_category_id ON assistants(category_id);
CREATE INDEX idx_assistants_is_active ON assistants(is_active);
CREATE INDEX idx_assistants_search ON assistants 
    USING gin(to_tsvector('russian', name || ' ' || description));
CREATE INDEX idx_runs_user_id_created_at ON runs(user_id, created_at DESC);
CREATE INDEX idx_runs_assistant_id ON runs(assistant_id);
CREATE INDEX idx_runs_status ON runs(status);