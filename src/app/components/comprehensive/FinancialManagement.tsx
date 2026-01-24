import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { DollarSign, TrendingUp, FileText, Plus, Download } from 'lucide-react';

const API_URL = 'http://localhost:5000/api/comprehensive-db';

export default function FinancialManagement() {
  const [budgets, setBudgets] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFinancialData();
  }, []);

  const fetchFinancialData = async () => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    
    try {
      const [budgetsRes, invoicesRes, expensesRes, statsRes] = await Promise.all([
        axios.get(`${API_URL}/budgets?limit=10`, { headers }),
        axios.get(`${API_URL}/invoices?limit=10`, { headers }),
        axios.get(`${API_URL}/expenses?limit=10`, { headers }),
        axios.get(`${API_URL}/expenses/statistics`, { headers })
      ]);
      
      setBudgets(budgetsRes.data.budgets || []);
      setInvoices(invoicesRes.data.invoices || []);
      setExpenses(expensesRes.data.expenses || []);
      setStats(statsRes.data.statistics);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Financial Management</h1>
        <div className="flex gap-2">
          <Button><Plus className="w-4 h-4 mr-2" />New Budget</Button>
          <Button variant="outline"><Download className="w-4 h-4 mr-2" />Export</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats?.totals?.total_approved?.toLocaleString() || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Pending Approval</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats?.totals?.total_pending?.toLocaleString() || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totals?.total_expenses || 0}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Budgets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {budgets.map((budget: any) => (
                <div key={budget.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-semibold">{budget.name}</h4>
                    <p className="text-sm text-gray-600">{budget.fiscal_year} - {budget.department}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">${budget.total_amount?.toLocaleString()}</div>
                    <span className={`text-xs px-2 py-1 rounded ${budget.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {budget.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {invoices.map((invoice: any) => (
                <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-semibold">{invoice.invoice_number}</h4>
                    <p className="text-sm text-gray-600">{invoice.student_name}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">${invoice.total_amount?.toLocaleString()}</div>
                    <span className={`text-xs px-2 py-1 rounded ${invoice.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {invoice.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Code</th>
                  <th className="text-left p-3">Category</th>
                  <th className="text-left p-3">Description</th>
                  <th className="text-left p-3">Amount</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense: any) => (
                  <tr key={expense.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{expense.expense_code}</td>
                    <td className="p-3">{expense.category}</td>
                    <td className="p-3">{expense.description}</td>
                    <td className="p-3 font-semibold">${expense.amount?.toLocaleString()}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs ${expense.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {expense.status}
                      </span>
                    </td>
                    <td className="p-3">{new Date(expense.expense_date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
