-- Insert expense categories into the database
-- Check if categories already exist before inserting
DO $$
BEGIN
    -- Check if expense categories already exist
    IF NOT EXISTS (SELECT 1 FROM expense_categories WHERE id = '550e8400-e29b-41d4-a716-446655440101') THEN
        INSERT INTO expense_categories (id, name, description, created_at, updated_at) VALUES
            ('550e8400-e29b-41d4-a716-446655440101', 'Utilities', 'Electricity, water, gas, etc.', NOW(), NOW()),
            ('550e8400-e29b-41d4-a716-446655440102', 'Maintenance', 'Building and equipment maintenance', NOW(), NOW()),
            ('550e8400-e29b-41d4-a716-446655440103', 'Supplies', 'Office and church supplies', NOW(), NOW()),
            ('550e8400-e29b-41d4-a716-446655440104', 'Events', 'Event-related expenses', NOW(), NOW()),
            ('550e8400-e29b-41d4-a716-446655440105', 'Outreach', 'Community outreach programs', NOW(), NOW()),
            ('550e8400-e29b-41d4-a716-446655440106', 'Technology', 'IT equipment and services', NOW(), NOW()),
            ('550e8400-e29b-41d4-a716-446655440107', 'Transportation', 'Travel and vehicle expenses', NOW(), NOW()),
            ('550e8400-e29b-41d4-a716-446655440108', 'Others', 'Other miscellaneous expenses', NOW(), NOW());
        RAISE NOTICE 'Expense categories inserted successfully';
    ELSE
        RAISE NOTICE 'Expense categories already exist, skipping insertion';
    END IF;
END $$; 