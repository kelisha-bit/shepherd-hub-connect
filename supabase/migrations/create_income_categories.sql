-- Insert income categories
INSERT INTO income_categories (id, name, description, created_at, updated_at) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Tithes', 'Regular tithes from members', NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440002', 'General Offering', 'General offerings during services', NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440003', 'Prophetic seed', 'Prophetic seed offerings', NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440004', 'Thanksgiving', 'Thanksgiving offerings', NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440005', 'Pledge', 'Pledge payments', NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440006', 'Wednesday offering', 'Wednesday service offerings', NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440007', 'Others', 'Other income sources', NOW(), NOW()); 