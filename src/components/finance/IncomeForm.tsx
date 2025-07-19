import React, { useState, useEffect } from 'react';
import { Database } from '@/integrations/supabase/types';
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

export type IncomeInsert = Database['public']['Tables']['incomes']['Insert'];
export type Member = Database['public']['Tables']['members']['Row'];
export type Donation = Database['public']['Tables']['donations']['Row'];

interface IncomeCategory {
  id: string;
  name: string;
  description?: string;
}

interface IncomeFormProps {
  onSubmit: (income: IncomeInsert) => void;
  loading?: boolean;
  initialValues?: Partial<IncomeInsert>;
}

const IncomeForm: React.FC<IncomeFormProps> = ({ onSubmit, loading, initialValues }) => {
  const [form, setForm] = useState<IncomeInsert>({
    amount: 0,
    income_date: '',
    category_id: undefined,
    member_id: undefined,
    donation_id: undefined,
    description: '',
    source: '',
    ...initialValues,
  });

  const [members, setMembers] = useState<{ id: string; first_name: string; last_name: string }[]>([]);
  const [donations, setDonations] = useState<{ id: string; donor_name: string; amount: number; donation_date: string }[]>([]);
  const [categories, setCategories] = useState<IncomeCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const { toast } = useToast();

  // Fetch categories from database
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        console.log('Fetching income categories...');
        
        const { data, error } = await supabase
          .from('income_categories')
          .select('id, name, description')
          .order('name');
        
        console.log('Categories fetch result:', { data, error });
        
        if (error) {
          console.error('Error fetching categories:', error);
          toast({
            title: 'Error',
            description: 'Failed to fetch income categories: ' + error.message,
            variant: 'destructive',
          });
          
          // Fallback to default categories if fetch fails
          const defaultCategories = [
            { id: '550e8400-e29b-41d4-a716-446655440001', name: 'Tithes', description: 'Regular tithes from members' },
            { id: '550e8400-e29b-41d4-a716-446655440002', name: 'General Offering', description: 'General offerings during services' },
            { id: '550e8400-e29b-41d4-a716-446655440003', name: 'Prophetic seed', description: 'Prophetic seed offerings' },
            { id: '550e8400-e29b-41d4-a716-446655440004', name: 'Thanksgiving', description: 'Thanksgiving offerings' },
            { id: '550e8400-e29b-41d4-a716-446655440005', name: 'Pledge', description: 'Pledge payments' },
            { id: '550e8400-e29b-41d4-a716-446655440006', name: 'Wednesday offering', description: 'Wednesday service offerings' },
            { id: '550e8400-e29b-41d4-a716-446655440007', name: 'Others', description: 'Other income sources' },
          ];
          setCategories(defaultCategories);
          console.log('Using fallback categories:', defaultCategories);
        } else {
          if (data && data.length > 0) {
            setCategories(data);
            console.log('Successfully fetched categories:', data);
          } else {
            console.log('No categories found in database, using fallback');
            // Fallback to default categories if database is empty
            const defaultCategories = [
              { id: '550e8400-e29b-41d4-a716-446655440001', name: 'Tithes', description: 'Regular tithes from members' },
              { id: '550e8400-e29b-41d4-a716-446655440002', name: 'General Offering', description: 'General offerings during services' },
              { id: '550e8400-e29b-41d4-a716-446655440003', name: 'Prophetic seed', description: 'Prophetic seed offerings' },
              { id: '550e8400-e29b-41d4-a716-446655440004', name: 'Thanksgiving', description: 'Thanksgiving offerings' },
              { id: '550e8400-e29b-41d4-a716-446655440005', name: 'Pledge', description: 'Pledge payments' },
              { id: '550e8400-e29b-41d4-a716-446655440006', name: 'Wednesday offering', description: 'Wednesday service offerings' },
              { id: '550e8400-e29b-41d4-a716-446655440007', name: 'Others', description: 'Other income sources' },
            ];
            setCategories(defaultCategories);
            toast({
              title: 'Info',
              description: 'No categories found in database, using default categories',
              variant: 'default',
            });
          }
        }
      } catch (error) {
        console.error('Unexpected error fetching categories:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch income categories',
          variant: 'destructive',
        });
        
        // Fallback to default categories on unexpected error
        const defaultCategories = [
          { id: '550e8400-e29b-41d4-a716-446655440001', name: 'Tithes', description: 'Regular tithes from members' },
          { id: '550e8400-e29b-41d4-a716-446655440002', name: 'General Offering', description: 'General offerings during services' },
          { id: '550e8400-e29b-41d4-a716-446655440003', name: 'Prophetic seed', description: 'Prophetic seed offerings' },
          { id: '550e8400-e29b-41d4-a716-446655440004', name: 'Thanksgiving', description: 'Thanksgiving offerings' },
          { id: '550e8400-e29b-41d4-a716-446655440005', name: 'Pledge', description: 'Pledge payments' },
          { id: '550e8400-e29b-41d4-a716-446655440006', name: 'Wednesday offering', description: 'Wednesday service offerings' },
          { id: '550e8400-e29b-41d4-a716-446655440007', name: 'Others', description: 'Other income sources' },
        ];
        setCategories(defaultCategories);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, [toast]);

  // Fetch members and donations
  useEffect(() => {
    const fetchData = async () => {
      const [membersRes, donationsRes] = await Promise.all([
        supabase.from('members').select('id, first_name, last_name'),
        supabase.from('donations').select('id, donor_name, amount, donation_date')
      ]);
      
      setMembers(membersRes.data || []);
      setDonations(donationsRes.data || []);
    };
    
    fetchData();
  }, []);

  useEffect(() => {
    if (initialValues) {
      setForm(prev => ({ ...prev, ...initialValues }));
    }
  }, [initialValues]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.amount || !form.income_date || !form.category_id) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Debug Info */}
      <div className="p-2 bg-gray-100 rounded text-sm">
        <p><strong>Debug Info:</strong></p>
        <p>Loading Categories: {loadingCategories ? 'Yes' : 'No'}</p>
        <p>Categories Count: {categories.length}</p>
        <p>Categories: {categories.map(c => c.name).join(', ')}</p>
      </div>

      <div>
        <Label htmlFor="amount">Amount (Ghc)</Label>
        <Input
          id="amount"
          name="amount"
          type="number"
          step="0.01"
          value={form.amount || ''}
          onChange={handleChange}
          required
          className="input input-bordered w-full"
        />
      </div>

      <div>
        <Label htmlFor="income_date">Income Date</Label>
        <Input
          id="income_date"
          name="income_date"
          type="date"
          value={form.income_date || ''}
          onChange={handleChange}
          required
          className="input input-bordered w-full"
        />
      </div>

      <div>
        <Label htmlFor="category_id">Category</Label>
        <select
          name="category_id"
          value={form.category_id || ''}
          onChange={handleChange}
          className="input input-bordered w-full"
          required
          disabled={loadingCategories}
        >
          <option value="" disabled>
            {loadingCategories ? 'Loading categories...' : 'Select category'}
          </option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <Label htmlFor="source">Source</Label>
        <Input
          id="source"
          name="source"
          type="text"
          value={form.source || ''}
          onChange={handleChange}
          className="input input-bordered w-full"
          placeholder="e.g., Sunday Service, Special Offering"
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={form.description || ''}
          onChange={handleChange}
          className="input input-bordered w-full"
          placeholder="Additional notes about this income"
        />
      </div>

      <div>
        <Label htmlFor="member_id">Member (Optional)</Label>
        <select
          name="member_id"
          value={form.member_id || ''}
          onChange={handleChange}
          className="input input-bordered w-full"
        >
          <option value="">Select member (optional)</option>
          {members.map((member) => (
            <option key={member.id} value={member.id}>
              {member.first_name} {member.last_name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <Label htmlFor="donation_id">Donation (Optional)</Label>
        <select
          name="donation_id"
          value={form.donation_id || ''}
          onChange={handleChange}
          className="input input-bordered w-full"
        >
          <option value="">Select donation (optional)</option>
          {donations.map((donation) => (
            <option key={donation.id} value={donation.id}>
              {donation.donor_name} - Ghc{donation.amount} ({donation.donation_date})
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={loading || loadingCategories} className="btn btn-primary">
          {loading ? 'Saving...' : 'Save Income'}
        </Button>
        <Button type="button" variant="outline" className="btn btn-secondary">
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default IncomeForm; 