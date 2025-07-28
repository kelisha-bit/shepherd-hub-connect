# Manual Database Migration Instructions

Since the automated migration scripts are experiencing network issues, please follow these steps to manually complete your database schema:

## Step 1: Access Your Supabase Dashboard

1. Go to: https://supabase.com/dashboard/project/wucdbfyyoorxzwnnnpgh/editor
2. Sign in to your Supabase account
3. Navigate to the SQL Editor

## Step 2: Run the Complete Migration

Copy and paste the entire contents of the file `supabase/migrations/20250729000000_complete_database_schema.sql` into the SQL Editor and click "Run".

## Step 3: Verify the Migration

After running the migration, you can verify it worked by running these test queries:

```sql
-- Check if key tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'profiles', 'events', 'donations', 'sermons', 'prayer_requests',
  'small_groups', 'communications', 'income_categories', 'incomes',
  'expense_categories', 'expenses', 'financial_goals', 'event_attendance_counts'
)
ORDER BY table_name;
```

## Step 4: Set Up Storage Buckets (Optional)

If you want to enable file uploads, you'll also need to create storage buckets. Go to:

1. Storage section in your Supabase dashboard
2. Create these buckets manually:
   - `profile-images` (public)
   - `event-images` (public)
   - `hero-images` (public)
   - `sermon-audio` (public)
   - `sermon-video` (public)
   - `documents` (private)

## What This Migration Creates

### Core Tables:
- **profiles** - User profiles with roles and permissions
- **events** - Church events and activities
- **donations** - Financial donations tracking
- **sermons** - Sermon library with audio/video support
- **prayer_requests** - Prayer request management
- **small_groups** - Small group management
- **communications** - Communication center
- **incomes** - Income tracking
- **expenses** - Expense tracking
- **financial_goals** - Financial goals and campaigns
- **event_attendance_counts** - Event attendance statistics

### File Management Tables:
- **profile_pictures** - Profile image metadata
- **event_images** - Event image metadata
- **hero_images** - Website banner images

### Security Features:
- Row Level Security (RLS) policies for all tables
- Role-based access control (admin, staff, member, visitor)
- Automatic user profile creation on signup
- Data synchronization between members and profiles

### Default Data:
- Income categories (Tithes, Offerings, etc.)
- Expense categories (Utilities, Maintenance, etc.)
- Message templates for communications

## After Migration

Once the migration is complete, your application should work without the "table doesn't exist" errors. All the features that were referencing missing tables will now have the proper database structure.

## Troubleshooting

If you encounter any issues:

1. **Permission Errors**: Make sure you're using the service role key or have admin access
2. **Duplicate Table Errors**: The migration uses `CREATE TABLE IF NOT EXISTS` so it's safe to run multiple times
3. **RLS Policy Errors**: Some policies might fail if the referenced tables don't exist yet, but the tables will still be created

## Next Steps

After completing the migration:

1. Restart your development server: `npm run dev`
2. Test the application features that were previously failing
3. Check that all tables are accessible in your application

The migration is designed to be idempotent, meaning you can run it multiple times safely without causing issues. 