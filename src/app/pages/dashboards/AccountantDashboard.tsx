import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, CreditCard, FileText, PieChart, Users, Package } from 'lucide-react';

const AccountantDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:5000/api/accountant/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setStats(data.stats);
    } catch (error) {
      console.error('Fetch error:', error);
    }
    setLoading(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('rw-RW', { style: 'currency', currency: 'RWF', minimumFractionDigits: 0 }).format(amount);
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Financial Dashboard</h1>
          <p className="text-gray-600">Comprehensive financial management system</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Income</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(stats?.totalIncome || 0)}</p>
              </div>
              <TrendingUp className="w-12 h-12 text-green-600 opacity-20" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Expenses</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(stats?.totalExpenses || 0)}</p>
              </div>
              <TrendingDown className="w-12 h-12 text-red-600 opacity-20" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Net Balance</p>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(stats?.netBalance || 0)}</p>
              </div>
              <DollarSign className="w-12 h-12 text-blue-600 opacity-20" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Pending Payments</p>
                <p className="text-2xl font-bold text-orange-600">{stats?.pendingPayments || 0}</p>
              </div>
              <CreditCard className="w-12 h-12 text-orange-600 opacity-20" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold mb-4">Monthly Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Income</span>
                <span className="font-bold text-green-600">{formatCurrency(stats?.monthlyIncome || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Expenses</span>
                <span className="font-bold text-red-600">{formatCurrency(stats?.monthlyExpenses || 0)}</span>
              </div>
              <div className="flex justify-between pt-3 border-t">
                <span className="font-bold">Net</span>
                <span className="font-bold text-blue-600">{formatCurrency(stats?.monthlyNet || 0)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountantDashboard;
