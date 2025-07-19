-- Insert all categories (income and expense) into the database
DO $$
BEGIN
    -- Insert income categories if they don't exist
    IF NOT EXISTS (SELECT 1 FROM income_categories WHERE id = '550e8400-e29b-41d4-a716-446655440001') THEN
        INSERT INTO income_categories (id, name, description, created_at, updated_at) VALUES
            ('550e8400-e29b-41d4-a716-446655440001', 'Tithes', 'Regular tithes from members', NOW(), NOW()),
            ('550e8400-e29b-41d4-a716-446655440002', 'General Offering', 'General offerings during services', NOW(), NOW()),
            ('550e8400-e29b-41d4-a716-446655440003', 'Prophetic seed', 'Prophetic seed offerings', NOW(), NOW()),
            ('550e8400-e29b-41d4-a716-446655440004', 'Thanksgiving', 'Thanksgiving offerings', NOW(), NOW()),
            ('550e8400-e29b-41d4-a716-446655440005', 'Pledge', 'Pledge payments', NOW(), NOW()),
            ('550e8400-e29b-41d4-a716-446655440006', 'Wednesday offering', 'Wednesday service offerings', NOW(), NOW()),
            ('550e8400-e29b-41d4-a716-446655440007', 'Others', 'Other income sources', NOW(), NOW());
        RAISE NOTICE 'Income categories inserted successfully';
    ELSE
        RAISE NOTICE 'Income categories already exist, skipping insertion';
    END IF;

    -- Insert expense categories if they don't exist
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