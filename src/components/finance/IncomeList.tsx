import React from 'react';
import { Database } from '@/integrations/supabase/types';

// Define the type for an income record
export type Income = Database['public']['Tables']['incomes']['Row'];

interface IncomeListProps {
  incomes: Income[];
}

const dateFormatter = new Intl.DateTimeFormat('en-NG', { year: 'numeric', month: 'short', day: 'numeric' });
const currencyFormatter = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' });

const IncomeList: React.FC<IncomeListProps> = ({ incomes }) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Income Records</h2>
      <table className="min-w-full bg-white border border-gray-200 rounded-md">
        <thead>
          <tr>
            <th className="px-4 py-2 border-b">Date</th>
            <th className="px-4 py-2 border-b">Amount</th>
            <th className="px-4 py-2 border-b">Category</th>
            <th className="px-4 py-2 border-b">Source</th>
            <th className="px-4 py-2 border-b">Member</th>
            <th className="px-4 py-2 border-b">Donation</th>
            <th className="px-4 py-2 border-b">Description</th>
          </tr>
        </thead>
        <tbody>
          {incomes.map((income) => (
            <tr key={income.id}>
              <td className="px-4 py-2 border-b">{income.income_date ? dateFormatter.format(new Date(income.income_date)) : ''}</td>
              <td className="px-4 py-2 border-b">{currencyFormatter.format(income.amount)}</td>
              <td className="px-4 py-2 border-b">{income.category_id}</td>
              <td className="px-4 py-2 border-b">{income.source}</td>
              <td className="px-4 py-2 border-b">{income.member_id}</td>
              <td className="px-4 py-2 border-b">{income.donation_id}</td>
              <td className="px-4 py-2 border-b">{income.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default IncomeList; 