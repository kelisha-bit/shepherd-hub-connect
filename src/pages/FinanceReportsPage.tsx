// FinanceReportsPage: Main page for financial reports and analytics in the Finance module
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { FinanceReports } from '@/components/finance';

type Income = Database['public']['Tables']['incomes']['Row'];
type Expense = Database['public']['Tables']['expenses']['Row'];

const FinanceReportsPage: React.FC = () => {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: incomeData } = await supabase.from('incomes').select('*');
      const { data: expenseData } = await supabase.from('expenses').select('*');
      setIncomes(incomeData || []);
      setExpenses(expenseData || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  const totalIncome = incomes.reduce((sum, i) => sum + (i.amount || 0), 0);
  const totalExpense = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const netCashFlow = totalIncome - totalExpense;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Finance &gt; Reports & Analytics</h1>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <FinanceReports
          totalIncome={totalIncome}
          totalExpense={totalExpense}
          netCashFlow={netCashFlow}
        />
      )}
    </div>
  );
};

export default FinanceReportsPage; 