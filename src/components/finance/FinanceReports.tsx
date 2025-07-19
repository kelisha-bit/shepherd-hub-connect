import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { BarChart2, FileText, Download, Calendar, TrendingUp, TrendingDown } from 'lucide-react';

interface FinanceReportsProps {
  totalIncome: number;
  totalExpense: number;
  netCashFlow: number;
  incomes?: any[];
  expenses?: any[];
}

const FinanceReports: React.FC<FinanceReportsProps> = ({ 
  totalIncome, 
  totalExpense, 
  netCashFlow,
  incomes = [],
  expenses = []
 }) => {
  const [activeTab, setActiveTab] = useState('summary');
  const [timeframe, setTimeframe] = useState('monthly');
  
  // Calculate financial health indicators
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome * 100).toFixed(1) : '0';
  const expenseRatio = totalIncome > 0 ? ((totalExpense / totalIncome) * 100).toFixed(1) : '0';
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return `Ghc${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="summary" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="summary" className="flex items-center gap-1">
              <BarChart2 className="h-4 w-4" />
              Summary
            </TabsTrigger>
            <TabsTrigger value="detailed" className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              Detailed Reports
            </TabsTrigger>
          </TabsList>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setTimeframe('monthly')} 
              className={timeframe === 'monthly' ? 'bg-primary text-primary-foreground' : ''}>
              Monthly
            </Button>
            <Button variant="outline" size="sm" onClick={() => setTimeframe('quarterly')}
              className={timeframe === 'quarterly' ? 'bg-primary text-primary-foreground' : ''}>
              Quarterly
            </Button>
            <Button variant="outline" size="sm" onClick={() => setTimeframe('yearly')}
              className={timeframe === 'yearly' ? 'bg-primary text-primary-foreground' : ''}>
              Yearly
            </Button>
          </div>
        </div>
        
        <TabsContent value="summary" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-green-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Total Income
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-700">{formatCurrency(totalIncome)}</div>
              </CardContent>
            </Card>
            
            <Card className="bg-red-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-red-600" />
                  Total Expenses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-700">{formatCurrency(totalExpense)}</div>
              </CardContent>
            </Card>
            
            <Card className="bg-blue-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <BarChart2 className="h-5 w-5 text-blue-600" />
                  Net Cash Flow
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-700">{formatCurrency(netCashFlow)}</div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Financial Health Indicators</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Savings Rate</span>
                      <span className="text-sm font-medium">{savingsRate}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${Math.min(100, parseFloat(savingsRate))}%` }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Expense Ratio</span>
                      <span className="text-sm font-medium">{expenseRatio}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-red-600 h-2.5 rounded-full" style={{ width: `${Math.min(100, parseFloat(expenseRatio))}%` }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Charts (Coming Soon)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48 bg-gray-100 flex items-center justify-center rounded">
                  <BarChart2 className="h-8 w-8 text-gray-400 mr-2" />
                  <span className="text-gray-500">Income vs Expense Visualization</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="detailed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Financial Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-500">Select a report type and timeframe to generate detailed financial reports.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2">
                    <Calendar className="h-6 w-6" />
                    <span>Income Statement</span>
                  </Button>
                  
                  <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2">
                    <BarChart2 className="h-6 w-6" />
                    <span>Expense Analysis</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-end gap-2">
        <Button variant="outline" className="flex items-center gap-1">
          <Download className="h-4 w-4" />
          Download PDF
        </Button>
        <Button variant="outline" className="flex items-center gap-1">
          <Download className="h-4 w-4" />
          Download CSV
        </Button>
      </div>
    </div>
  );
};

export default FinanceReports;