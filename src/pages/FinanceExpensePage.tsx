// FinanceExpensePage: Main page for managing and viewing expense records in the Finance module
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { ExpenseList, ExpenseForm } from '@/components/finance';
import { useToast } from '@/hooks/use-toast';

type Expense = Database['public']['Tables']['expenses']['Row'];
type ExpenseInsert = Database['public']['Tables']['expenses']['Insert'];

const FinanceExpensePage: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const { toast } = useToast();

  const fetchExpenses = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .order('expense_date', { ascending: false });
    if (!error && data) {
      setExpenses(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleAddExpense = async (expense: ExpenseInsert) => {
    setFormLoading(true);
    const { error } = await supabase.from('expenses').insert([expense]);
    setFormLoading(false);
    if (!error) {
      toast({ title: 'Expense added', description: 'The expense record was added successfully.' });
      fetchExpenses();
    } else {
      toast({ title: 'Failed to add expense', description: error.message, variant: 'destructive' });
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Finance &gt; Expense Tracking</h1>
      <div className="mb-6">
        <ExpenseForm onSubmit={handleAddExpense} loading={formLoading} />
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <ExpenseList expenses={expenses} />
      )}
    </div>
  );
};

export default FinanceExpensePage; 