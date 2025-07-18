import React, { useState, useEffect } from 'react';
import { Database } from '@/integrations/supabase/types';
import { supabase } from '@/integrations/supabase/client';

export type ExpenseInsert = Database['public']['Tables']['expenses']['Insert'];
export type ExpenseCategory = Database['public']['Tables']['expense_categories']['Row'];

interface ExpenseFormProps {
  onSubmit: (expense: ExpenseInsert) => void;
  loading?: boolean;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ onSubmit, loading }) => {
  const [form, setForm] = useState<ExpenseInsert>({
    amount: 0,
    expense_date: '',
    category_id: undefined,
    description: '',
    vendor: '',
    is_recurring: false,
    recurrence_rule: '',
    goal_id: undefined,
    created_by: undefined,
  });
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase.from('expense_categories').select('*').order('name');
      setCategories(data || []);
    };
    fetchCategories();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setForm((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-md bg-white">
      <div>
        <label className="block font-medium">Amount (₦)</label>
        <input
          type="number"
          name="amount"
          value={form.amount}
          onChange={handleChange}
          className="input input-bordered w-full"
          required
        />
      </div>
      <div>
        <label className="block font-medium">Date</label>
        <input
          type="date"
          name="expense_date"
          value={form.expense_date}
          onChange={handleChange}
          className="input input-bordered w-full"
          required
        />
      </div>
      <div>
        <label className="block font-medium">Category</label>
        <select
          name="category_id"
          value={form.category_id || ''}
          onChange={handleChange}
          className="input input-bordered w-full"
          required
        >
          <option value="" disabled>Select category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block font-medium">Vendor</label>
        <input
          type="text"
          name="vendor"
          value={form.vendor}
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
      <div>
        <label className="inline-flex items-center">
          <input
            type="checkbox"
            name="is_recurring"
            checked={!!form.is_recurring}
            onChange={handleChange}
            className="mr-2"
          />
          Recurring Expense
        </label>
      </div>
      <div>
        <label className="block font-medium">Recurrence Rule</label>
        <input
          type="text"
          name="recurrence_rule"
          value={form.recurrence_rule || ''}
          onChange={handleChange}
          className="input input-bordered w-full"
          placeholder="e.g. Monthly, Weekly, etc."
        />
      </div>
      <button
        type="submit"
        className="btn btn-primary"
        disabled={loading}
      >
        {loading ? 'Saving...' : 'Add Expense'}
      </button>
    </form>
  );
};

export default ExpenseForm; 