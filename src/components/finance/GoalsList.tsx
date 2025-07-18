import React from 'react';
import { Database } from '@/integrations/supabase/types';

export type FinancialGoal = Database['public']['Tables']['financial_goals']['Row'];

interface GoalsListProps {
  goals: FinancialGoal[];
}

const GoalsList: React.FC<GoalsListProps> = ({ goals }) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Financial Goals & Campaigns</h2>
      <table className="min-w-full bg-white border border-gray-200 rounded-md">
        <thead>
          <tr>
            <th className="px-4 py-2 border-b">Name</th>
            <th className="px-4 py-2 border-b">Target Amount</th>
            <th className="px-4 py-2 border-b">Current Amount</th>
            <th className="px-4 py-2 border-b">Status</th>
            <th className="px-4 py-2 border-b">Start Date</th>
            <th className="px-4 py-2 border-b">End Date</th>
            <th className="px-4 py-2 border-b">Description</th>
          </tr>
        </thead>
        <tbody>
          {goals.map((goal) => (
            <tr key={goal.id}>
              <td className="px-4 py-2 border-b">{goal.name}</td>
              <td className="px-4 py-2 border-b">₦{goal.target_amount.toLocaleString()}</td>
              <td className="px-4 py-2 border-b">₦{goal.current_amount?.toLocaleString() ?? 0}</td>
              <td className="px-4 py-2 border-b">{goal.status}</td>
              <td className="px-4 py-2 border-b">{goal.start_date}</td>
              <td className="px-4 py-2 border-b">{goal.end_date}</td>
              <td className="px-4 py-2 border-b">{goal.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GoalsList; 