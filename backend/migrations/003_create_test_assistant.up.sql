INSERT INTO categories (id, name)
VALUES ('00000000-0000-0000-0000-000000000003', 'Test')
ON CONFLICT (id) DO NOTHING;

INSERT INTO assistants (id, name, description, category_id, model, system_prompt)
VALUES (
    '00000000-0000-0000-0000-000000000004', 
    'LoadTestBot', 
    'A bot used for load testing',
    '00000000-0000-0000-0000-000000000003',
    'gpt-4o', 
    'You are a test bot'
    )
ON CONFLICT (id) DO NOTHING;