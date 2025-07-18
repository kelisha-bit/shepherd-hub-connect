// FinanceGoalsPage: Main page for managing and viewing financial goals/campaigns in the Finance module
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { GoalsList, GoalsForm } from '@/components/finance';

type FinancialGoal = Database['public']['Tables']['financial_goals']['Row'];
type FinancialGoalInsert = Database['public']['Tables']['financial_goals']['Insert'];

const FinanceGoalsPage: React.FC = () => {
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);

  const fetchGoals = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('financial_goals')
      .select('*')
      .order('start_date', { ascending: false });
    if (!error && data) {
      setGoals(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleAddGoal = async (goal: FinancialGoalInsert) => {
    setFormLoading(true);
    const { error } = await supabase.from('financial_goals').insert([goal]);
    setFormLoading(false);
    if (!error) {
      fetchGoals();
    } else {
      alert('Failed to add goal: ' + error.message);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Finance &gt; Financial Goals & Campaigns</h1>
      <div className="mb-6">
        <GoalsForm onSubmit={handleAddGoal} loading={formLoading} />
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <GoalsList goals={goals} />
      )}
    </div>
  );
};

export default FinanceGoalsPage; 