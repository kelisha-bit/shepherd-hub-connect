import React from 'react';

interface FinanceReportsProps {
  totalIncome: number;
  totalExpense: number;
  netCashFlow: number;
}

const FinanceReports: React.FC<FinanceReportsProps> = ({ totalIncome, totalExpense, netCashFlow }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Financial Reports & Analytics</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-green-50 rounded border">
          <div className="text-lg font-semibold">Total Income</div>
          <div className="text-2xl font-bold text-green-700">₦{totalIncome.toLocaleString()}</div>
        </div>
        <div className="p-4 bg-red-50 rounded border">
          <div className="text-lg font-semibold">Total Expenses</div>
          <div className="text-2xl font-bold text-red-700">₦{totalExpense.toLocaleString()}</div>
        </div>
        <div className="p-4 bg-blue-50 rounded border">
          <div className="text-lg font-semibold">Net Cash Flow</div>
          <div className="text-2xl font-bold text-blue-700">₦{netCashFlow.toLocaleString()}</div>
        </div>
      </div>
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-2">Charts (Coming Soon)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-64 bg-gray-100 flex items-center justify-center rounded border">Bar/Line Chart Placeholder</div>
          <div className="h-64 bg-gray-100 flex items-center justify-center rounded border">Pie Chart Placeholder</div>
        </div>
      </div>
      <div className="mt-8">
        <button className="btn btn-outline mr-2">Download PDF</button>
        <button className="btn btn-outline">Download CSV</button>
      </div>
    </div>
  );
};

export default FinanceReports; 