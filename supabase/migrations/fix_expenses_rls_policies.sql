-- Fix RLS policies for expenses table
-- First, drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view all expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can insert expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can update expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can delete expenses" ON public.expenses;

-- Create new policies that allow authenticated users to manage expenses
CREATE POLICY "Users can view all expenses" ON public.expenses FOR SELECT USING (true);
CREATE POLICY "Users can insert expenses" ON public.expenses FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update expenses" ON public.expenses FOR UPDATE USING (true);
CREATE POLICY "Users can delete expenses" ON public.expenses FOR DELETE USING (true);

-- Also ensure RLS is enabled
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Check if expense_categories table has proper policies
DROP POLICY IF EXISTS "Users can view all expense categories" ON public.expense_categories;
DROP POLICY IF EXISTS "Users can insert expense categories" ON public.expense_categories;
DROP POLICY IF EXISTS "Users can update expense categories" ON public.expense_categories;
DROP POLICY IF EXISTS "Users can delete expense categories" ON public.expense_categories;

-- Create policies for expense_categories
CREATE POLICY "Users can view all expense categories" ON public.expense_categories FOR SELECT USING (true);
CREATE POLICY "Users can insert expense categories" ON public.expense_categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update expense categories" ON public.expense_categories FOR UPDATE USING (true);
CREATE POLICY "Users can delete expense categories" ON public.expense_categories FOR DELETE USING (true);

-- Ensure RLS is enabled on expense_categories
ALTER TABLE public.expense_categories ENABLE ROW LEVEL SECURITY; 