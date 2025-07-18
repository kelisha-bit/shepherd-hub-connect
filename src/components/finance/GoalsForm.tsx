import React, { useState } from 'react';
import { Database } from '@/integrations/supabase/types';

export type FinancialGoalInsert = Database['public']['Tables']['financial_goals']['Insert'];

interface GoalsFormProps {
  onSubmit: (goal: FinancialGoalInsert) => void;
  loading?: boolean;
}

const GoalsForm: React.FC<GoalsFormProps> = ({ onSubmit, loading }) => {
  const [form, setForm] = useState<FinancialGoalInsert>({
    name: '',
    target_amount: 0,
    description: '',
    start_date: '',
    end_date: '',
    status: 'active',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-md bg-white">
      <div>
        <label className="block font-medium">Name</label>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          className="input input-bordered w-full"
          required
        />
      </div>
      <div>
        <label className="block font-medium">Target Amount (₦)</label>
        <input
          type="number"
          name="target_amount"
          value={form.target_amount}
          onChange={handleChange}
          className="input input-bordered w-full"
          required
        />
      </div>
      <div>
        <label className="block font-medium">Start Date</label>
        <input
          type="date"
          name="start_date"
          value={form.start_date || ''}
          onChange={handleChange}
          className="input input-bordered w-full"
        />
      </div>
      <div>
        <label className="block font-medium">End Date</label>
        <input
          type="date"
          name="end_date"
          value={form.end_date || ''}
          onChange={handleChange}
          className="input input-bordered w-full"
        />
      </div>
      <div>
        <label className="block font-medium">Description</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          className="input input-bordered w-full"
        />
      </div>
      <button
        type="submit"
        className="btn btn-primary"
        disabled={loading}
      >
        {loading ? 'Saving...' : 'Add Goal/Campaign'}
      </button>
    </form>
  );
};

export default GoalsForm; 