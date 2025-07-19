import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";

type Expense = Database['public']['Tables']['expenses']['Row'];

interface ExpenseCategory {
  id: string;
  name: string;
}

interface ExpenseListProps {
  expenses: Expense[];
  onEdit?: (expense: Expense) => void;
  onDelete?: (expense: Expense) => void;
}

const ExpenseList: React.FC<ExpenseListProps> = ({ expenses, onEdit, onDelete }) => {
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const { toast } = useToast();

  // Fetch categories from database
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const { data, error } = await supabase
          .from('expense_categories')
          .select('id, name')
          .order('name');
        
        if (error) {
          console.error('Error fetching expense categories:', error);
          toast({
            title: 'Error',
            description: 'Failed to fetch expense categories',
            variant: 'destructive',
          });
        } else {
          setCategories(data || []);
        }
      } catch (error) {
        console.error('Unexpected error fetching expense categories:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch expense categories',
          variant: 'destructive',
        });
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, [toast]);

  // Category mapping to display names instead of UUIDs
  const getCategoryName = (categoryId: string) => {
    // First try to find in fetched categories
    const category = categories.find(cat => cat.id === categoryId);
    if (category) {
      return category.name;
    }
    
    // If not found in database, check if it's a fallback category
    const fallbackCategories = [
      { id: '550e8400-e29b-41d4-a716-446655440101', name: 'Utilities' },
      { id: '550e8400-e29b-41d4-a716-446655440102', name: 'Maintenance' },
      { id: '550e8400-e29b-41d4-a716-446655440103', name: 'Supplies' },
      { id: '550e8400-e29b-41d4-a716-446655440104', name: 'Events' },
      { id: '550e8400-e29b-41d4-a716-446655440105', name: 'Outreach' },
      { id: '550e8400-e29b-41d4-a716-446655440106', name: 'Technology' },
      { id: '550e8400-e29b-41d4-a716-446655440107', name: 'Transportation' },
      { id: '550e8400-e29b-41d4-a716-446655440108', name: 'Others' },
    ];
    
    const fallbackCategory = fallbackCategories.find(cat => cat.id === categoryId);
    if (fallbackCategory) {
      return fallbackCategory.name;
    }
    
    // If still not found, return the UUID as fallback
    return categoryId;
  };

  const currencyFormatter = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'GHS', currencyDisplay: 'code' });
  const dateFormatter = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <th>Date</th>
              <th>Amount</th>
              <th>Category</th>
              <th>Vendor</th>
              <th>Recurring</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((expense) => (
              <tr key={expense.id}>
                <td className="px-4 py-2 border-b">{expense.expense_date ? dateFormatter.format(new Date(expense.expense_date)) : ''}</td>
                <td className="px-4 py-2 border-b">{currencyFormatter.format(expense.amount).replace('GHS', 'Ghc')}</td>
                <td className="px-4 py-2 border-b">
                  {loadingCategories ? 'Loading...' : getCategoryName(expense.category_id)}
                </td>
                <td className="px-4 py-2 border-b">{expense.vendor}</td>
                <td className="px-4 py-2 border-b">{expense.is_recurring ? 'Yes' : 'No'}</td>
                <td className="px-4 py-2 border-b space-x-2">
                  {onEdit && <button type="button" className="text-blue-600 hover:underline" onClick={() => onEdit(expense)}>Edit</button>}
                  {onDelete && <button type="button" className="text-red-600 hover:underline" onClick={() => onDelete(expense)}>Delete</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExpenseList; 