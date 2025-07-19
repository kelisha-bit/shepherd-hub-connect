// FinanceDashboardPage: Main page for managing and viewing income and expense records in the Finance module
import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { IncomeList, IncomeForm, ExpenseList, ExpenseForm } from '@/components/finance';
import FinanceReports from '@/components/finance/FinanceReports';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart2, ArrowDownCircle, ArrowUpCircle, DollarSign, FileText, Plus, Church } from 'lucide-react';
import { ChartContainer } from '@/components/ui/chart';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/auth/AuthContext';

// Types
type Income = Database['public']['Tables']['incomes']['Row'];
type IncomeInsert = Database['public']['Tables']['incomes']['Insert'];
type Expense = Database['public']['Tables']['expenses']['Row'];
type ExpenseInsert = Database['public']['Tables']['expenses']['Insert'];

const FinanceDashboardPage: React.FC = () => {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'income' | 'expense'>('income');
  const [showIncomeForm, setShowIncomeForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  // Summary
  const totalIncome = incomes.reduce((sum, i) => sum + Number(i.amount || 0), 0);
  const totalExpense = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const netBalance = totalIncome - totalExpense;
  const recentTransactions = [
    ...incomes.map(i => ({...i, type: 'income', date: i.income_date })),
    ...expenses.map(e => ({...e, type: 'expense', date: e.expense_date })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

  const { toast } = useToast();
  const { user, session } = useAuth();
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const [showEditIncomeForm, setShowEditIncomeForm] = useState(false);
  const [deletingIncome, setDeletingIncome] = useState<Income | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Fetch data
  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        console.log('Starting to fetch data...');
        
        // Check authentication first
        console.log('Checking authentication...');
        if (!user || !session) {
          console.error('User not authenticated');
          toast({ 
            title: 'Authentication Error', 
            description: 'Please log in to access finance data.', 
            variant: 'destructive' 
          });
          return;
        }
        console.log('User authenticated:', user.email);
        
        // Test basic network connectivity first
        console.log('Testing network connectivity...');
        try {
          const networkTest = await fetch('https://httpbin.org/get', { 
            method: 'GET',
            mode: 'cors'
          });
          if (!networkTest.ok) {
            throw new Error(`Network test failed: ${networkTest.status}`);
          }
          console.log('Network connectivity test successful');
        } catch (networkError) {
          console.error('Network connectivity test failed:', networkError);
          toast({ 
            title: 'Network Error', 
            description: 'Cannot connect to the internet. Please check your network connection.', 
            variant: 'destructive' 
          });
          return;
        }
        
        // Test Supabase connection
        console.log('Testing Supabase connection...');
        const { data: testData, error: testError } = await supabase.from('incomes').select('count');
        if (testError) {
          console.error('Supabase connection test failed:', testError);
          toast({ title: 'Database Error', description: 'Cannot connect to database: ' + testError.message, variant: 'destructive' });
          return;
        }
        console.log('Supabase connection successful');
        
        // Fetch incomes
        console.log('Fetching incomes...');
        const { data: incomeData, error: incomeError } = await supabase
          .from('incomes')
          .select('*')
          .order('income_date', { ascending: false });
        
        if (incomeError) {
          console.error('Error fetching incomes:', incomeError);
          toast({ title: 'Error', description: 'Failed to fetch income data: ' + incomeError.message, variant: 'destructive' });
        } else {
          console.log('Incomes fetched successfully:', incomeData?.length || 0, 'records');
        }
        
        // Fetch expenses
        console.log('Fetching expenses...');
        const { data: expenseData, error: expenseError } = await supabase
          .from('expenses')
          .select('*')
          .order('expense_date', { ascending: false });
        
        if (expenseError) {
          console.error('Error fetching expenses:', expenseError);
          toast({ title: 'Error', description: 'Failed to fetch expense data: ' + expenseError.message, variant: 'destructive' });
        } else {
          console.log('Expenses fetched successfully:', expenseData?.length || 0, 'records');
        }
        
        setIncomes(incomeData || []);
        setExpenses(expenseData || []);
        
        console.log('Data fetch completed successfully');
        console.log('Total incomes:', incomeData?.length || 0);
        console.log('Total expenses:', expenseData?.length || 0);
        
      } catch (error) {
        console.error('Unexpected error in fetchAll:', error);
        console.error('Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
        toast({ 
          title: 'Unexpected Error', 
          description: 'An unexpected error occurred: ' + (error.message || 'Unknown error'), 
          variant: 'destructive' 
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchAll();
  }, [user, session]);

  // Handlers
  const handleAddIncome = async (income: IncomeInsert) => {
    try {
      setShowIncomeForm(false);
      const { error } = await supabase.from('incomes').insert([income]);
      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
        return;
      }
      const { data: incomeData } = await supabase.from('incomes').select('*').order('income_date', { ascending: false });
      setIncomes(incomeData || []);
      toast({ title: 'Success', description: 'Income record added successfully.' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to add income record.', variant: 'destructive' });
    }
  };
  const handleAddExpense = async (expense: ExpenseInsert) => {
    try {
      setShowExpenseForm(false);
      console.log('Adding expense:', expense);
      
      const { error } = await supabase.from('expenses').insert([expense]);
      if (error) {
        console.error('Error adding expense:', error);
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
        return;
      }
      
      console.log('Expense added successfully');
      const { data: expenseData } = await supabase.from('expenses').select('*').order('expense_date', { ascending: false });
      setExpenses(expenseData || []);
      toast({ title: 'Success', description: 'Expense record added successfully.' });
    } catch (error) {
      console.error('Unexpected error adding expense:', error);
      toast({ title: 'Error', description: 'Failed to add expense record.', variant: 'destructive' });
    }
  };

  const handleEditIncome = (income: Income) => {
    setEditingIncome(income);
    setShowEditIncomeForm(true);
  };
  const handleUpdateIncome = async (updated: IncomeInsert) => {
    if (!editingIncome) return;
    await supabase.from('incomes').update(updated).eq('id', editingIncome.id);
    const { data: incomeData } = await supabase.from('incomes').select('*').order('income_date', { ascending: false });
    setIncomes(incomeData || []);
    setShowEditIncomeForm(false);
    setEditingIncome(null);
    toast({ title: 'Income updated', description: 'The income record was updated successfully.' });
  };
  const handleDeleteIncome = (income: Income) => {
    setDeletingIncome(income);
    setShowDeleteDialog(true);
  };
  const confirmDeleteIncome = async () => {
    if (!deletingIncome) return;
    await supabase.from('incomes').delete().eq('id', deletingIncome.id);
    const { data: incomeData } = await supabase.from('incomes').select('*').order('income_date', { ascending: false });
    setIncomes(incomeData || []);
    setShowDeleteDialog(false);
    setDeletingIncome(null);
    toast({ title: 'Income deleted', description: 'The income record was deleted.' });
  };

  // Prepare data for chart
  const chartData = [
    { month: 'Jan', income: 0, expense: 0 },
    { month: 'Feb', income: 0, expense: 0 },
    { month: 'Mar', income: 0, expense: 0 },
    { month: 'Apr', income: 0, expense: 0 },
    { month: 'May', income: 0, expense: 0 },
    { month: 'Jun', income: 0, expense: 0 },
    { month: 'Jul', income: 0, expense: 0 },
    { month: 'Aug', income: 0, expense: 0 },
    { month: 'Sep', income: 0, expense: 0 },
    { month: 'Oct', income: 0, expense: 0 },
    { month: 'Nov', income: 0, expense: 0 },
    { month: 'Dec', income: 0, expense: 0 },
  ];

  // Populate chart data with actual income and expense amounts
  incomes.forEach(income => {
    const month = new Date(income.income_date).toLocaleString('en-US', { month: 'short' });
    const index = chartData.findIndex(d => d.month === month);
    if (index !== -1) {
      chartData[index].income += Number(income.amount || 0);
    }
  });

  expenses.forEach(expense => {
    const month = new Date(expense.expense_date).toLocaleString('en-US', { month: 'short' });
    const index = chartData.findIndex(d => d.month === month);
    if (index !== -1) {
      chartData[index].expense += Number(expense.amount || 0);
    }
  });

  // Prepare income categories data for bar chart
  const incomeCategoriesData = useMemo(() => {
    const categoryTotals: Record<string, number> = {};
    
    // Initialize with all categories
    const allCategories = [
      { id: '550e8400-e29b-41d4-a716-446655440001', name: 'Tithes' },
      { id: '550e8400-e29b-41d4-a716-446655440002', name: 'General Offering' },
      { id: '550e8400-e29b-41d4-a716-446655440003', name: 'Prophetic seed' },
      { id: '550e8400-e29b-41d4-a716-446655440004', name: 'Thanksgiving' },
      { id: '550e8400-e29b-41d4-a716-446655440005', name: 'Pledge' },
      { id: '550e8400-e29b-41d4-a716-446655440006', name: 'Wednesday offering' },
      { id: '550e8400-e29b-41d4-a716-446655440007', name: 'Others' },
    ];

    // Initialize all categories with 0
    allCategories.forEach(cat => {
      categoryTotals[cat.name] = 0;
    });

    // Debug: Log income records and their category IDs
    console.log('Income records for chart:', incomes);
    console.log('Available category IDs:', allCategories.map(c => c.id));

    // Sum up amounts by category
    incomes.forEach(income => {
      console.log(`Processing income: ${income.id}, category_id: ${income.category_id}, amount: ${income.amount}`);
      const category = allCategories.find(cat => cat.id === income.category_id);
      if (category) {
        categoryTotals[category.name] += Number(income.amount || 0);
        console.log(`Found category: ${category.name}, new total: ${categoryTotals[category.name]}`);
      } else {
        console.log(`No matching category found for ID: ${income.category_id}`);
        // Add to "Others" if category not found
        categoryTotals['Others'] += Number(income.amount || 0);
      }
    });

    // Convert to chart data format
    const result = Object.entries(categoryTotals).map(([name, amount]) => ({
      category: name,
      amount: amount,
    })).filter(item => item.amount > 0); // Only show categories with data

    console.log('Final chart data:', result);
    return result;
  }, [incomes]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-2 sm:p-4 md:p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-primary rounded-full p-3 shadow">
          <Church className="h-8 w-8 text-primary-foreground" />
        </div>
        <h1 className="text-3xl font-bold text-foreground">Church Finance Dashboard</h1>
      </div>

      {/* Test Connection Button */}
      <div className="mb-4">
        <Button 
          onClick={async () => {
            console.log('Testing connection...');
            try {
              const { data, error } = await supabase.from('incomes').select('count');
              console.log('Test result:', { data, error });
              if (error) {
                toast({ title: 'Connection Test Failed', description: error.message, variant: 'destructive' });
              } else {
                toast({ title: 'Connection Test Success', description: 'Database connection working!', variant: 'default' });
              }
            } catch (err) {
              console.error('Test error:', err);
              toast({ title: 'Test Error', description: String(err), variant: 'destructive' });
            }
          }}
          variant="outline"
          className="mb-4"
        >
          Test Database Connection
        </Button>
      </div>

      {/* Authentication Status */}
      <div className="mb-4 p-4 bg-gray-100 rounded-lg">
        <h3 className="font-semibold mb-2">Authentication Status:</h3>
        <p>User: {user ? user.email : 'Not logged in'}</p>
        <p>Session: {session ? 'Active' : 'No session'}</p>
        <p>Role: {user ? 'Authenticated' : 'Guest'}</p>
      </div>

      {/* Debug Information */}
      <div className="mb-4 p-4 bg-blue-100 rounded-lg">
        <h3 className="font-semibold mb-2">Debug Information:</h3>
        <p>Total Income Records: {incomes.length}</p>
        <p>Income Categories Data Length: {incomeCategoriesData.length}</p>
        <p>Chart Data: {JSON.stringify(incomeCategoriesData, null, 2)}</p>
        <details className="mt-2">
          <summary className="cursor-pointer font-medium">Show Income Records</summary>
          <pre className="mt-2 text-xs bg-white p-2 rounded overflow-auto max-h-40">
            {JSON.stringify(incomes, null, 2)}
          </pre>
        </details>
      </div>

      {!user && (
        <div className="mb-4 p-4 bg-yellow-100 border border-yellow-400 rounded-lg">
          <h3 className="font-semibold text-yellow-800 mb-2">Authentication Required</h3>
          <p className="text-yellow-700">Please log in to access the finance dashboard.</p>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p>Loading finance data...</p>
          </div>
        </div>
      )}
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-white/80 shadow-lg backdrop-blur border-0">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <DollarSign className="h-6 w-6 text-green-600" />
            <CardTitle className="text-base font-medium">Total Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">Ghc{totalIncome.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="bg-white/80 shadow-lg backdrop-blur border-0">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <ArrowUpCircle className="h-6 w-6 text-red-600" />
            <CardTitle className="text-base font-medium">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700">Ghc{totalExpense.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="bg-white/80 shadow-lg backdrop-blur border-0">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <BarChart2 className="h-6 w-6 text-blue-600" />
            <CardTitle className="text-base font-medium">Current Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">Ghc{netBalance.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="bg-white/80 shadow-lg backdrop-blur border-0">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <FileText className="h-6 w-6 text-yellow-600" />
            <CardTitle className="text-base font-medium">Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm space-y-1">
              {recentTransactions.map((t, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  {t.type === 'income' ? (
                    <span className="text-green-600">+Ghc{t.amount?.toLocaleString()}</span>
                  ) : (
                    <span className="text-red-600">-Ghc{t.amount?.toLocaleString()}</span>
                  )}
                  <span className="text-muted-foreground">{t.date}</span>
                  <span className="capitalize">{t.type}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
      {/* Chart Placeholder or Chart Integration */}
      <div className="mb-6">
        <Card className="bg-white/80 shadow-lg backdrop-blur border-0">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <BarChart2 className="h-5 w-5 text-primary" />
            <CardTitle className="text-sm font-medium">Income vs. Expenses Over Time</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <ChartContainer config={{ income: { color: "#22c55e", label: "Income (Ghc)" }, expense: { color: "#ef4444", label: "Expense (Ghc)" } }}>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData}>
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={v => `Ghc${v.toLocaleString()}`} />
                  <Tooltip formatter={value => [`Ghc${Number(value).toLocaleString()}`, 'Amount']} />
                  <Legend formatter={value => value === 'income' ? 'Income (Ghc)' : 'Expense (Ghc)'} />
                  <Bar dataKey="income" fill="#22c55e" name="Income (Ghc)" />
                  <Bar dataKey="expense" fill="#ef4444" name="Expense (Ghc)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Income Categories Bar Chart */}
      {incomeCategoriesData.length > 0 && (
        <div className="mb-6">
          <Card className="bg-white/90 shadow-xl backdrop-blur border-0 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded p-1.5">
                    <BarChart2 className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-semibold text-gray-800">Income by Category</CardTitle>
                    <p className="text-xs text-gray-600">Revenue breakdown</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-700">
                    Ghc{incomeCategoriesData.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">Total</div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <ChartContainer config={{ amount: { color: "#10b981", label: "Amount (Ghc)" } }}>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart 
                    data={incomeCategoriesData} 
                    layout="horizontal"
                    margin={{ top: 10, right: 20, left: 15, bottom: 5 }}
                  >
                    <defs>
                      <linearGradient id="incomeGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#059669" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis 
                      type="number" 
                      tickFormatter={v => `Ghc${v.toLocaleString()}`}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: '#6b7280' }}
                    />
                    <YAxis 
                      type="category" 
                      dataKey="category" 
                      width={100}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: '#374151', fontWeight: 500 }}
                    />
                    <Tooltip 
                      formatter={value => [`Ghc${Number(value).toLocaleString()}`, 'Amount']}
                      labelStyle={{ color: '#374151', fontWeight: 600 }}
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Bar 
                      dataKey="amount" 
                      fill="url(#incomeGradient)"
                      radius={[0, 3, 3, 0]}
                      name="Amount (Ghc)"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
              
              {/* Compact Category Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mt-4">
                {incomeCategoriesData.map((item, index) => {
                  const percentage = ((item.amount / incomeCategoriesData.reduce((sum, i) => sum + i.amount, 0)) * 100).toFixed(1);
                  const colors = [
                    'from-green-500 to-emerald-600',
                    'from-blue-500 to-cyan-600', 
                    'from-purple-500 to-violet-600',
                    'from-orange-500 to-red-600',
                    'from-pink-500 to-rose-600',
                    'from-indigo-500 to-blue-600',
                    'from-yellow-500 to-orange-600'
                  ];
                  
                  return (
                    <div key={item.category} className="bg-gradient-to-r from-gray-50 to-gray-100 rounded p-2 border border-gray-200">
                      <div className="flex items-center gap-1.5 mb-1">
                        <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${colors[index % colors.length]}`}></div>
                        <span className="text-xs font-medium text-gray-700 truncate">{item.category}</span>
                      </div>
                      <div className="text-sm font-bold text-gray-900">Ghc{item.amount.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">{percentage}%</div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      {/* Tabs for Income/Expense Management */}
      <Tabs defaultValue={tab} onValueChange={v => setTab(v as 'income' | 'expense')} className="mb-8">
        <TabsList className="mb-4">
          <TabsTrigger value="income">Income</TabsTrigger>
          <TabsTrigger value="expense">Expenses</TabsTrigger>
        </TabsList>
        <TabsContent value="income">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Income Management</h2>
            <Button className="bg-gradient-to-r from-green-400 to-green-600 text-white shadow" onClick={() => setShowIncomeForm(true)}>
              <Plus className="h-4 w-4 mr-2" /> Add Income
            </Button>
          </div>
          {showIncomeForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
              <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md animate-fade-in">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold">Add Income</h3>
                  <Button variant="outline" onClick={() => setShowIncomeForm(false)}>Close</Button>
                </div>
                <IncomeForm onSubmit={handleAddIncome} />
              </div>
            </div>
          )}
          {showEditIncomeForm && editingIncome && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
              <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md animate-fade-in">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold">Edit Income</h3>
                  <Button variant="outline" onClick={() => setShowEditIncomeForm(false)}>Close</Button>
                </div>
                <IncomeForm onSubmit={handleUpdateIncome} loading={false} initialValues={editingIncome} />
              </div>
            </div>
          )}
          {showDeleteDialog && deletingIncome && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
              <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md animate-fade-in">
                <div className="mb-4 text-lg">Are you sure you want to delete this income record?</div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
                  <Button variant="destructive" onClick={confirmDeleteIncome}>Delete</Button>
                </div>
              </div>
            </div>
          )}
          <IncomeList incomes={incomes} onEdit={handleEditIncome} onDelete={handleDeleteIncome} />
          {loading && <div className="text-center py-4">Loading records...</div>}
          {!loading && incomes.length === 0 && <div className="text-center py-4 text-muted-foreground">No income records found.</div>}
        </TabsContent>
        <TabsContent value="expense">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Expense Management</h2>
            <Button className="bg-gradient-to-r from-red-400 to-red-600 text-white shadow" onClick={() => setShowExpenseForm(true)}>
              <Plus className="h-4 w-4 mr-2" /> Add Expense
            </Button>
          </div>
          {showExpenseForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
              <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md animate-fade-in">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold">Add Expense</h3>
                  <Button variant="outline" onClick={() => setShowExpenseForm(false)}>Close</Button>
                </div>
                <ExpenseForm onSubmit={handleAddExpense} />
              </div>
            </div>
          )}
          <ExpenseList expenses={expenses} />
        </TabsContent>
      </Tabs>
      {/* Reports Section */}
      <div className="mb-8">
        <FinanceReports totalIncome={totalIncome} totalExpense={totalExpense} netCashFlow={netBalance} />
      </div>
    </div>
  );
};

export default FinanceDashboardPage;
