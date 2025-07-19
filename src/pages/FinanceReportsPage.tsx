// FinanceReportsPage: Main page for financial reports and analytics in the Finance module
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { FinanceReports } from '@/components/finance';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

type Income = Database['public']['Tables']['incomes']['Row'];
type Expense = Database['public']['Tables']['expenses']['Row'];

const FinanceReportsPage: React.FC = () => {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch income data with category information
        const { data: incomeData, error: incomeError } = await supabase
          .from('incomes')
          .select('*, income_categories(name)')
          .order('income_date', { ascending: false });
        
        if (incomeError) {
          throw new Error(`Error fetching income data: ${incomeError.message}`);
        }
        
        // Fetch expense data with category information
        const { data: expenseData, error: expenseError } = await supabase
          .from('expenses')
          .select('*, expense_categories(name)')
          .order('expense_date', { ascending: false });
        
        if (expenseError) {
          throw new Error(`Error fetching expense data: ${expenseError.message}`);
        }
        
        setIncomes(incomeData || []);
        setExpenses(expenseData || []);
      } catch (error) {
        console.error('Error fetching financial data:', error);
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to load financial data',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [toast]);

  // Calculate financial totals
  const totalIncome = incomes.reduce((sum, i) => sum + Number(i.amount || 0), 0);
  const totalExpense = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const netCashFlow = totalIncome - totalExpense;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Finance &gt; Reports & Analytics</h1>
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading financial data...</span>
        </div>
      ) : (
        <FinanceReports
          totalIncome={totalIncome}
          totalExpense={totalExpense}
          netCashFlow={netCashFlow}
          incomes={incomes}
          expenses={expenses}
        />
      )}
    </div>
  );
};

export default FinanceReportsPage;