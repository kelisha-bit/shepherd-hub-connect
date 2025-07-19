import React, { useState, useEffect } from 'react';
import { Database } from '@/integrations/supabase/types';
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

export type ExpenseInsert = Database['public']['Tables']['expenses']['Insert'];

interface ExpenseCategory {
  id: string;
  name: string;
  description?: string;
}

interface ExpenseFormProps {
  onSubmit: (expense: ExpenseInsert) => void;
  loading?: boolean;
  initialValues?: Partial<ExpenseInsert>;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ onSubmit, loading, initialValues }) => {
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
    ...initialValues,
  });
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const { toast } = useToast();

  // Fetch categories from database
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        console.log('Fetching expense categories...');
        
        const { data, error } = await supabase
          .from('expense_categories')
          .select('id, name, description')
          .order('name');
        
        console.log('Expense categories fetch result:', { data, error });
        
        if (error) {
          console.error('Error fetching expense categories:', error);
          toast({
            title: 'Error',
            description: 'Failed to fetch expense categories: ' + error.message,
            variant: 'destructive',
          });
          
          // Fallback to default categories if fetch fails
          const defaultCategories = [
            { id: '550e8400-e29b-41d4-a716-446655440101', name: 'Utilities', description: 'Electricity, water, gas, etc.' },
            { id: '550e8400-e29b-41d4-a716-446655440102', name: 'Maintenance', description: 'Building and equipment maintenance' },
            { id: '550e8400-e29b-41d4-a716-446655440103', name: 'Supplies', description: 'Office and church supplies' },
            { id: '550e8400-e29b-41d4-a716-446655440104', name: 'Events', description: 'Event-related expenses' },
            { id: '550e8400-e29b-41d4-a716-446655440105', name: 'Outreach', description: 'Community outreach programs' },
            { id: '550e8400-e29b-41d4-a716-446655440106', name: 'Technology', description: 'IT equipment and services' },
            { id: '550e8400-e29b-41d4-a716-446655440107', name: 'Transportation', description: 'Travel and vehicle expenses' },
            { id: '550e8400-e29b-41d4-a716-446655440108', name: 'Others', description: 'Other miscellaneous expenses' },
          ];
          setCategories(defaultCategories);
          console.log('Using fallback expense categories:', defaultCategories);
        } else {
          if (data && data.length > 0) {
            setCategories(data);
            console.log('Successfully fetched expense categories:', data);
          } else {
            console.log('No expense categories found in database, using fallback');
            // Fallback to default categories if database is empty
            const defaultCategories = [
              { id: '550e8400-e29b-41d4-a716-446655440101', name: 'Utilities', description: 'Electricity, water, gas, etc.' },
              { id: '550e8400-e29b-41d4-a716-446655440102', name: 'Maintenance', description: 'Building and equipment maintenance' },
              { id: '550e8400-e29b-41d4-a716-446655440103', name: 'Supplies', description: 'Office and church supplies' },
              { id: '550e8400-e29b-41d4-a716-446655440104', name: 'Events', description: 'Event-related expenses' },
              { id: '550e8400-e29b-41d4-a716-446655440105', name: 'Outreach', description: 'Community outreach programs' },
              { id: '550e8400-e29b-41d4-a716-446655440106', name: 'Technology', description: 'IT equipment and services' },
              { id: '550e8400-e29b-41d4-a716-446655440107', name: 'Transportation', description: 'Travel and vehicle expenses' },
              { id: '550e8400-e29b-41d4-a716-446655440108', name: 'Others', description: 'Other miscellaneous expenses' },
            ];
            setCategories(defaultCategories);
            toast({
              title: 'Info',
              description: 'No expense categories found in database, using default categories',
              variant: 'default',
            });
          }
        }
      } catch (error) {
        console.error('Unexpected error fetching expense categories:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch expense categories',
          variant: 'destructive',
        });
        
        // Fallback to default categories on unexpected error
        const defaultCategories = [
          { id: '550e8400-e29b-41d4-a716-446655440101', name: 'Utilities', description: 'Electricity, water, gas, etc.' },
          { id: '550e8400-e29b-41d4-a716-446655440102', name: 'Maintenance', description: 'Building and equipment maintenance' },
          { id: '550e8400-e29b-41d4-a716-446655440103', name: 'Supplies', description: 'Office and church supplies' },
          { id: '550e8400-e29b-41d4-a716-446655440104', name: 'Events', description: 'Event-related expenses' },
          { id: '550e8400-e29b-41d4-a716-446655440105', name: 'Outreach', description: 'Community outreach programs' },
          { id: '550e8400-e29b-41d4-a716-446655440106', name: 'Technology', description: 'IT equipment and services' },
          { id: '550e8400-e29b-41d4-a716-446655440107', name: 'Transportation', description: 'Travel and vehicle expenses' },
          { id: '550e8400-e29b-41d4-a716-446655440108', name: 'Others', description: 'Other miscellaneous expenses' },
        ];
        setCategories(defaultCategories);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, [toast]);

  useEffect(() => {
    if (initialValues) {
      setForm(prev => ({ ...prev, ...initialValues }));
    }
  }, [initialValues]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setForm((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setForm((prev) => ({ 
        ...prev, 
        [name]: name === 'amount' ? parseFloat(value) || 0 : value 
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Expense form submitted with data:', form);
    
    if (!form.amount || !form.expense_date || !form.category_id) {
      console.error('Validation failed:', { amount: form.amount, date: form.expense_date, category: form.category_id });
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }
    
    console.log('Validation passed, submitting expense...');
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
        <Label htmlFor="expense_date">Expense Date</Label>
        <Input
          id="expense_date"
          name="expense_date"
          type="date"
          value={form.expense_date || ''}
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
        <Label htmlFor="vendor">Vendor</Label>
        <Input
          id="vendor"
          name="vendor"
          type="text"
          value={form.vendor || ''}
          onChange={handleChange}
          className="input input-bordered w-full"
          placeholder="e.g., ABC Supplies, XYZ Services"
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
          placeholder="Additional details about this expense"
        />
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="is_recurring"
          name="is_recurring"
          checked={!!form.is_recurring}
          onChange={handleChange}
          className="rounded"
        />
        <Label htmlFor="is_recurring">Recurring Expense</Label>
      </div>

      {form.is_recurring && (
        <div>
          <Label htmlFor="recurrence_rule">Recurrence Rule</Label>
          <Input
            id="recurrence_rule"
            name="recurrence_rule"
            type="text"
            value={form.recurrence_rule || ''}
            onChange={handleChange}
            className="input input-bordered w-full"
            placeholder="e.g., Monthly, Weekly, Quarterly"
          />
        </div>
      )}

      <div className="flex gap-2">
        <Button type="submit" disabled={loading || loadingCategories} className="btn btn-primary">
          {loading ? 'Saving...' : 'Save Expense'}
        </Button>
        <Button type="button" variant="outline" className="btn btn-secondary">
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default ExpenseForm; 