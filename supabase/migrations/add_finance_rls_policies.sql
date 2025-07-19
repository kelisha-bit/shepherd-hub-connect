-- Add RLS policies for finance tables

-- Enable RLS on finance tables
ALTER TABLE public.income_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Income Categories policies
CREATE POLICY "Users can view all income categories" ON public.income_categories FOR SELECT USING (true);
CREATE POLICY "Users can insert income categories" ON public.income_categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update income categories" ON public.income_categories FOR UPDATE USING (true);
CREATE POLICY "Users can delete income categories" ON public.income_categories FOR DELETE USING (true);

-- Incomes policies
CREATE POLICY "Users can view all incomes" ON public.incomes FOR SELECT USING (true);
CREATE POLICY "Users can insert incomes" ON public.incomes FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update incomes" ON public.incomes FOR UPDATE USING (true);
CREATE POLICY "Users can delete incomes" ON public.incomes FOR DELETE USING (true);

-- Expense Categories policies
CREATE POLICY "Users can view all expense categories" ON public.expense_categories FOR SELECT USING (true);
CREATE POLICY "Users can insert expense categories" ON public.expense_categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update expense categories" ON public.expense_categories FOR UPDATE USING (true);
CREATE POLICY "Users can delete expense categories" ON public.expense_categories FOR DELETE USING (true);

-- Expenses policies
CREATE POLICY "Users can view all expenses" ON public.expenses FOR SELECT USING (true);
CREATE POLICY "Users can insert expenses" ON public.expenses FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update expenses" ON public.expenses FOR UPDATE USING (true);
CREATE POLICY "Users can delete expenses" ON public.expenses FOR DELETE USING (true);

-- Financial Goals policies
CREATE POLICY "Users can view all financial goals" ON public.financial_goals FOR SELECT USING (true);
CREATE POLICY "Users can insert financial goals" ON public.financial_goals FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update financial goals" ON public.financial_goals FOR UPDATE USING (true);
CREATE POLICY "Users can delete financial goals" ON public.financial_goals FOR DELETE USING (true);

-- Receipts policies
CREATE POLICY "Users can view all receipts" ON public.receipts FOR SELECT USING (true);
CREATE POLICY "Users can insert receipts" ON public.receipts FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update receipts" ON public.receipts FOR UPDATE USING (true);
CREATE POLICY "Users can delete receipts" ON public.receipts FOR DELETE USING (true);

-- Audit Logs policies
CREATE POLICY "Users can view all audit logs" ON public.audit_logs FOR SELECT USING (true);
CREATE POLICY "Users can insert audit logs" ON public.audit_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update audit logs" ON public.audit_logs FOR UPDATE USING (true);
CREATE POLICY "Users can delete audit logs" ON public.audit_logs FOR DELETE USING (true); 