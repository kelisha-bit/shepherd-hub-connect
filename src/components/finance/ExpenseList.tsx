import React from 'react';
import { Database } from '@/integrations/supabase/types';

// Define the type for an expense record
export type Expense = Database['public']['Tables']['expenses']['Row'];

interface ExpenseListProps {
  expenses: Expense[];
}

const dateFormatter = new Intl.DateTimeFormat('en-NG', { year: 'numeric', month: 'short', day: 'numeric' });
const currencyFormatter = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' });

const ExpenseList: React.FC<ExpenseListProps> = ({ expenses }) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Expense Records</h2>
      <table className="min-w-full bg-white border border-gray-200 rounded-md">
        <thead>
          <tr>
            <th className="px-4 py-2 border-b">Date</th>
            <th className="px-4 py-2 border-b">Amount</th>
            <th className="px-4 py-2 border-b">Category</th>
            <th className="px-4 py-2 border-b">Vendor</th>
            <th className="px-4 py-2 border-b">Recurring</th>
            <th className="px-4 py-2 border-b">Goal</th>
            <th className="px-4 py-2 border-b">Description</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((expense) => (
            <tr key={expense.id}>
              <td className="px-4 py-2 border-b">{expense.expense_date ? dateFormatter.format(new Date(expense.expense_date)) : ''}</td>
              <td className="px-4 py-2 border-b">{currencyFormatter.format(expense.amount)}</td>
              <td className="px-4 py-2 border-b">{expense.category_id}</td>
              <td className="px-4 py-2 border-b">{expense.vendor}</td>
              <td className="px-4 py-2 border-b">{expense.is_recurring ? 'Yes' : 'No'}</td>
              <td className="px-4 py-2 border-b">{expense.goal_id}</td>
              <td className="px-4 py-2 border-b">{expense.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ExpenseList; 