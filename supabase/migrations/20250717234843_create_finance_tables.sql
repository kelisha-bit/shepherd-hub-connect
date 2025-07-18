-- Finance Management Module Migration

-- Income Categories
CREATE TABLE income_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Incomes
CREATE TABLE incomes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    amount NUMERIC(12,2) NOT NULL,
    income_date DATE NOT NULL,
    category_id UUID REFERENCES income_categories(id),
    member_id UUID REFERENCES members(id),
    donation_id UUID REFERENCES donations(id),
    description TEXT,
    source TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Financial Goals / Campaigns
CREATE TABLE financial_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    target_amount NUMERIC(12,2) NOT NULL,
    current_amount NUMERIC(12,2) DEFAULT 0,
    start_date DATE,
    end_date DATE,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Expense Categories
CREATE TABLE expense_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Expenses
CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    amount NUMERIC(12,2) NOT NULL,
    expense_date DATE NOT NULL,
    category_id UUID REFERENCES expense_categories(id),
    description TEXT,
    vendor TEXT,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_rule TEXT,
    goal_id UUID REFERENCES financial_goals(id),
    created_by UUID REFERENCES members(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Receipts (for expenses)
CREATE TABLE receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    expense_id UUID REFERENCES expenses(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    uploaded_by UUID REFERENCES members(id),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Audit Logs (optional, for large transactions)
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id UUID,
    performed_by UUID REFERENCES members(id),
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
); 