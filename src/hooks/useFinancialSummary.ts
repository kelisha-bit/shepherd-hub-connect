import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

type FinancialPeriodData = {
  period: string;
  income: number;
  expenses: number;
  net: number;
};

type CategoryBreakdown = {
  name: string;
  value: number;
  percent: number;
};

export function useFinancialSummary(timeRange: string = '12m') {
  const [periodData, setPeriodData] = useState<FinancialPeriodData[]>([]);
  const [incomeByCategory, setIncomeByCategory] = useState<CategoryBreakdown[]>([]);
  const [expensesByCategory, setExpensesByCategory] = useState<CategoryBreakdown[]>([]);
  const [topDonors, setTopDonors] = useState<{name: string; amount: number}[]>([]);
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    netBalance: 0,
    averageMonthlyIncome: 0,
    averageMonthlyExpenses: 0,
    largestExpenseCategory: '',
    largestIncomeCategory: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFinancialData() {
      setLoading(true);
      setError(null);
      try {
        // Get current date and calculate start date based on timeRange
        const endDate = new Date();
        let startDate = new Date();
        const months = parseInt(timeRange.replace('m', ''));
        startDate.setMonth(startDate.getMonth() - months);
        
        // Fetch donations (income)
        const { data: donations, error: donationsError } = await supabase
          .from('donations')
          .select('amount, donation_date, category, donor_name, donor_email, member_id')
          .gte('donation_date', startDate.toISOString().slice(0, 10))
          .order('donation_date');

        if (donationsError) throw donationsError;

        // Fetch expenses
        const { data: expenses, error: expensesError } = await supabase
          .from('expenses')
          .select('amount, expense_date, category')
          .gte('expense_date', startDate.toISOString().slice(0, 10))
          .order('expense_date');

        if (expensesError) throw expensesError;

        // Process data by period (month)
        const monthlyData: Record<string, {income: number; expenses: number}> = {};
        
        // Initialize all months in the range
        for (let i = 0; i <= months; i++) {
          const date = new Date(startDate);
          date.setMonth(startDate.getMonth() + i);
          const monthKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
          monthlyData[monthKey] = { income: 0, expenses: 0 };
        }
        
        // Sum donations by month
        donations?.forEach(donation => {
          const date = new Date(donation.donation_date);
          const monthKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
          
          if (monthlyData[monthKey]) {
            monthlyData[monthKey].income += Number(donation.amount);
          }
        });
        
        // Sum expenses by month
        expenses?.forEach(expense => {
          const date = new Date(expense.expense_date);
          const monthKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
          
          if (monthlyData[monthKey]) {
            monthlyData[monthKey].expenses += Number(expense.amount);
          }
        });
        
        // Convert to array and calculate net values
        const sortedMonths = Object.keys(monthlyData).sort((a, b) => {
          return new Date(a).getTime() - new Date(b).getTime();
        });
        
        const financialData = sortedMonths.map(month => ({
          period: month,
          income: parseFloat(monthlyData[month].income.toFixed(2)),
          expenses: parseFloat(monthlyData[month].expenses.toFixed(2)),
          net: parseFloat((monthlyData[month].income - monthlyData[month].expenses).toFixed(2))
        }));
        
        setPeriodData(financialData);
        
        // Process income by category
        const incomeCategories: Record<string, number> = {};
        let totalIncome = 0;
        
        donations?.forEach(donation => {
          const category = donation.category || 'Uncategorized';
          incomeCategories[category] = (incomeCategories[category] || 0) + Number(donation.amount);
          totalIncome += Number(donation.amount);
        });
        
        // Process expenses by category
        const expenseCategories: Record<string, number> = {};
        let totalExpenses = 0;
        
        expenses?.forEach(expense => {
          const category = expense.category || 'Uncategorized';
          expenseCategories[category] = (expenseCategories[category] || 0) + Number(expense.amount);
          totalExpenses += Number(expense.amount);
        });
        
        // Calculate percentages and format category data
        const incomeByCategories = Object.entries(incomeCategories).map(([name, value]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1).replace('_', ' '),
          value: parseFloat(value.toFixed(2)),
          percent: parseFloat(((value / totalIncome) * 100).toFixed(2))
        })).sort((a, b) => b.value - a.value);
        
        const expensesByCategories = Object.entries(expenseCategories).map(([name, value]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1).replace('_', ' '),
          value: parseFloat(value.toFixed(2)),
          percent: parseFloat(((value / totalExpenses) * 100).toFixed(2))
        })).sort((a, b) => b.value - a.value);
        
        setIncomeByCategory(incomeByCategories);
        setExpensesByCategory(expensesByCategories);
        
        // Process top donors
        const donorMap: Record<string, number> = {};
        
        // First, get member names for member_ids
        const memberIds = donations
          ?.filter(d => d.member_id)
          .map(d => d.member_id);
        
        const { data: members } = await supabase
          .from('members')
          .select('id, first_name, last_name')
          .in('id', memberIds || []);
        
        const memberMap: Record<string, string> = {};
        members?.forEach(member => {
          memberMap[member.id] = `${member.first_name} ${member.last_name}`;
        });
        
        // Aggregate donations by donor
        donations?.forEach(donation => {
          let donorName = donation.donor_name;
          
          // If no donor name but has member_id, use member name
          if (!donorName && donation.member_id && memberMap[donation.member_id]) {
            donorName = memberMap[donation.member_id];
          }
          
          // If still no name but has email, use email
          if (!donorName && donation.donor_email) {
            donorName = donation.donor_email;
          }
          
          // If still no identifier, skip
          if (!donorName) return;
          
          donorMap[donorName] = (donorMap[donorName] || 0) + Number(donation.amount);
        });
        
        // Get top 5 donors
        const topDonorsList = Object.entries(donorMap)
          .map(([name, amount]) => ({ name, amount: parseFloat(amount.toFixed(2)) }))
          .sort((a, b) => b.amount - a.amount)
          .slice(0, 5);
        
        setTopDonors(topDonorsList);
        
        // Calculate summary statistics
        const netBalance = totalIncome - totalExpenses;
        const nonEmptyMonths = financialData.filter(m => m.income > 0 || m.expenses > 0).length || 1;
        const avgMonthlyIncome = totalIncome / nonEmptyMonths;
        const avgMonthlyExpenses = totalExpenses / nonEmptyMonths;
        
        const largestExpenseCat = expensesByCategories.length > 0 ? expensesByCategories[0].name : 'None';
        const largestIncomeCat = incomeByCategories.length > 0 ? incomeByCategories[0].name : 'None';
        
        setSummary({
          totalIncome: parseFloat(totalIncome.toFixed(2)),
          totalExpenses: parseFloat(totalExpenses.toFixed(2)),
          netBalance: parseFloat(netBalance.toFixed(2)),
          averageMonthlyIncome: parseFloat(avgMonthlyIncome.toFixed(2)),
          averageMonthlyExpenses: parseFloat(avgMonthlyExpenses.toFixed(2)),
          largestExpenseCategory: largestExpenseCat,
          largestIncomeCategory: largestIncomeCat
        });
        
      } catch (e: any) {
        setError(e.message || 'Failed to fetch financial data');
      } finally {
        setLoading(false);
      }
    }
    
    fetchFinancialData();
  }, [timeRange]);

  return { 
    periodData, 
    incomeByCategory, 
    expensesByCategory, 
    topDonors,
    summary,
    loading, 
    error 
  };
}