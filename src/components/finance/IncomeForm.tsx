import React, { useState, useEffect } from 'react';
import { Database } from '@/integrations/supabase/types';
import { supabase } from '@/integrations/supabase/client';

export type IncomeInsert = Database['public']['Tables']['incomes']['Insert'];
export type IncomeCategory = Database['public']['Tables']['income_categories']['Row'];
export type Member = Database['public']['Tables']['members']['Row'];
export type Donation = Database['public']['Tables']['donations']['Row'];

interface IncomeFormProps {
  onSubmit: (income: IncomeInsert) => void;
  loading?: boolean;
}

const IncomeForm: React.FC<IncomeFormProps> = ({ onSubmit, loading }) => {
  const [form, setForm] = useState<IncomeInsert>({
    amount: 0,
    income_date: '',
    category_id: undefined,
    member_id: undefined,
    donation_id: undefined,
    description: '',
    source: '',
  });
  const [categories, setCategories] = useState<IncomeCategory[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase.from('income_categories').select('*').order('name');
      setCategories(data || []);
    };
    const fetchMembers = async () => {
      const { data } = await supabase.from('members').select('*').order('first_name');
      setMembers(data || []);
    };
    const fetchDonations = async () => {
      const { data } = await supabase.from('donations').select('*').order('created_at', { ascending: false });
      setDonations(data || []);
    };
    fetchCategories();
    fetchMembers();
    fetchDonations();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
          name="income_date"
          value={form.income_date}
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
        <label className="block font-medium">Member (optional)</label>
        <select
          name="member_id"
          value={form.member_id || ''}
          onChange={handleChange}
          className="input input-bordered w-full"
        >
          <option value="">Unlinked</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>{m.first_name} {m.last_name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block font-medium">Donation (optional)</label>
        <select
          name="donation_id"
          value={form.donation_id || ''}
          onChange={handleChange}
          className="input input-bordered w-full"
        >
          <option value="">Unlinked</option>
          {donations.map((d) => (
            <option key={d.id} value={d.id}>{d.donor_name} (₦{d.amount})</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block font-medium">Source</label>
        <input
          type="text"
          name="source"
          value={form.source}
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
        {loading ? 'Saving...' : 'Add Income'}
      </button>
    </form>
  );
};

export default IncomeForm; 