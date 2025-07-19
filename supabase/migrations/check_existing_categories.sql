-- Check existing income categories
SELECT id, name, description, created_at 
FROM income_categories 
ORDER BY name;

-- Check if the specific UUIDs we're using exist
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM income_categories WHERE id = '550e8400-e29b-41d4-a716-446655440001') 
        THEN 'Tithes category exists' 
        ELSE 'Tithes category missing' 
    END as tithes_status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM income_categories WHERE id = '550e8400-e29b-41d4-a716-446655440002') 
        THEN 'General Offering category exists' 
        ELSE 'General Offering category missing' 
    END as general_offering_status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM income_categories WHERE id = '550e8400-e29b-41d4-a716-446655440003') 
        THEN 'Prophetic seed category exists' 
        ELSE 'Prophetic seed category missing' 
    END as prophetic_seed_status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM income_categories WHERE id = '550e8400-e29b-41d4-a716-446655440004') 
        THEN 'Thanksgiving category exists' 
        ELSE 'Thanksgiving category missing' 
    END as thanksgiving_status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM income_categories WHERE id = '550e8400-e29b-41d4-a716-446655440005') 
        THEN 'Pledge category exists' 
        ELSE 'Pledge category missing' 
    END as pledge_status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM income_categories WHERE id = '550e8400-e29b-41d4-a716-446655440006') 
        THEN 'Wednesday offering category exists' 
        ELSE 'Wednesday offering category missing' 
    END as wednesday_offering_status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM income_categories WHERE id = '550e8400-e29b-41d4-a716-446655440007') 
        THEN 'Others category exists' 
        ELSE 'Others category missing' 
    END as others_status; 