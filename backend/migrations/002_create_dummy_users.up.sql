INSERT INTO users (id, email, role, password_hash)
VALUES 
    ('00000000-0000-0000-0000-000000000001', 'admin@example.com', 'admin', 'dummy'),
    ('00000000-0000-0000-0000-000000000002', 'user@example.com',  'user',  'dummy')
ON CONFLICT (id) DO NOTHING;