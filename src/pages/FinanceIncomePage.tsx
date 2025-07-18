// FinanceIncomePage: Main page for managing and viewing income records in the Finance module
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { IncomeList, IncomeForm } from '@/components/finance';
import { useToast } from '@/hooks/use-toast';

type Income = Database['public']['Tables']['incomes']['Row'];
type IncomeInsert = Database['public']['Tables']['incomes']['Insert'];

const FinanceIncomePage: React.FC = () => {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const { toast } = useToast();

  const fetchIncomes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('incomes')
      .select('*')
      .order('income_date', { ascending: false });
    if (!error && data) {
      setIncomes(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchIncomes();
  }, []);

  const handleAddIncome = async (income: IncomeInsert) => {
    setFormLoading(true);
    const { error } = await supabase.from('incomes').insert([income]);
    setFormLoading(false);
    if (!error) {
      toast({ title: 'Income added', description: 'The income record was added successfully.' });
      fetchIncomes();
    } else {
      toast({ title: 'Failed to add income', description: error.message, variant: 'destructive' });
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Finance &gt; Income Management</h1>
      <div className="mb-6">
        <IncomeForm onSubmit={handleAddIncome} loading={formLoading} />
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <IncomeList incomes={incomes} />
      )}
    </div>
  );
};

export default FinanceIncomePage; 