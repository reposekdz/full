import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, CreditCard, FileText, PieChart, Users, Package, Bell, Receipt, Wallet, ArrowUpDown, BarChart3 } from 'lucide-react';
import UniversalMessagingWidget from '@/app/components/UniversalMessagingWidget';
import AccountantSidebar from '@/app/components/AccountantSidebar';

import apiService from '@/app/services/apiService';

interface AccountantDashboardProps {
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

const AccountantDashboard: React.FC<AccountantDashboardProps> = ({ onNavigate, onLogout }) => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [recentPayments, setRecentPayments] = useState<any[]>([]);
  const [recentExpenses, setRecentExpenses] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboard();
    fetchNotifications();
    fetchRecentTransactions();
  }, []);

  const fetchDashboard = async () => {
    try {
      const data = await apiService.getAccountantDashboard();
      if (data.success) setStats(data.stats);
    } catch (error) {
      console.error('Fetch error:', error);
    }
    setLoading(false);
  };

  const fetchNotifications = async () => {
    try {
      const data = await apiService.getNotifications();
      if (data.success) setNotifications(data.notifications.slice(0, 5));
    } catch (error) {
      console.error('Fetch notifications error:', error);
    }
  };

  const fetchRecentTransactions = async () => {
    try {
      const [paymentsData, expensesData] = await Promise.all([
        apiService.getAccountantPayments({ limit: 5 }),
        apiService.getAccountantExpenses({ limit: 5 })
      ]);
      if (paymentsData.success) setRecentPayments(paymentsData.payments);
      if (expensesData.success) setRecentExpenses(expensesData.expenses);
    } catch (error) {
      console.error('Fetch transactions error:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('rw-RW', { style: 'currency', currency: 'RWF', minimumFractionDigits: 0 }).format(amount);
  };

  if (loading) return (
    <div className="flex h-screen bg-gray-50">
      <AccountantSidebar currentPage="dashboard-accountant" onNavigate={onNavigate} />
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      <AccountantSidebar currentPage="dashboard-accountant" onNavigate={onNavigate} />
      
      <div className="flex-1 overflow-auto">
        <UniversalMessagingWidget />
        <div className="p-8">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl shadow-xl p-8 mb-8 text-white">
            <h1 className="text-4xl font-bold mb-2">Dashboard y'Umubare w'Imari</h1>
            <p className="text-emerald-100">Gucunga imari y'ishuri mu buryo bwuzuye</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Amafaranga Yinjiye</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(stats?.totalIncome || 0)}</p>
                </div>
                <TrendingUp className="w-12 h-12 text-green-600 opacity-20" />
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Amafaranga Yasohotse</p>
                  <p className="text-2xl font-bold text-red-600">{formatCurrency(stats?.totalExpenses || 0)}</p>
                </div>
                <TrendingDown className="w-12 h-12 text-red-600 opacity-20" />
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Amafaranga Asigaye</p>
                  <p className="text-2xl font-bold text-blue-600">{formatCurrency(stats?.netBalance || 0)}</p>
                </div>
                <DollarSign className="w-12 h-12 text-blue-600 opacity-20" />
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Kwishyura Gutegerejwe</p>
                  <p className="text-2xl font-bold text-orange-600">{stats?.pendingPayments || 0}</p>
                </div>
                <CreditCard className="w-12 h-12 text-orange-600 opacity-20" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <button onClick={() => onNavigate('student-payments-management')} className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl p-6 hover:shadow-lg transition-all transform hover:scale-105">
              <Users className="w-8 h-8 mb-2" />
              <p className="font-semibold">Kwishyura kw'Abanyeshuri</p>
            </button>
            <button onClick={() => onNavigate('payments-management')} className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl p-6 hover:shadow-lg transition-all transform hover:scale-105">
              <DollarSign className="w-8 h-8 mb-2" />
              <p className="font-semibold">Kwishyura</p>
            </button>
            <button onClick={() => onNavigate('expenses-management')} className="bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl p-6 hover:shadow-lg transition-all transform hover:scale-105">
              <CreditCard className="w-8 h-8 mb-2" />
              <p className="font-semibold">Amafaranga Yakoreshejwe</p>
            </button>
            <button onClick={() => onNavigate('invoices-management')} className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl p-6 hover:shadow-lg transition-all transform hover:scale-105">
              <Receipt className="w-8 h-8 mb-2" />
              <p className="font-semibold">Inyemezabuguzi</p>
            </button>
            <button onClick={() => onNavigate('financial-reports')} className="bg-gradient-to-r from-teal-500 to-green-500 text-white rounded-xl p-6 hover:shadow-lg transition-all transform hover:scale-105">
              <BarChart3 className="w-8 h-8 mb-2" />
              <p className="font-semibold">Raporo</p>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <PieChart className="text-emerald-600" size={24} />
                Incamake y'Ukwezi
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-gray-700 font-medium">Yinjiye</span>
                  <span className="font-bold text-green-600">{formatCurrency(stats?.monthlyIncome || 0)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                  <span className="text-gray-700 font-medium">Yasohotse</span>
                  <span className="font-bold text-red-600">{formatCurrency(stats?.monthlyExpenses || 0)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border-t-2 border-blue-200">
                  <span className="font-bold text-gray-900">Amafaranga Asigaye</span>
                  <span className="font-bold text-blue-600">{formatCurrency(stats?.monthlyNet || 0)}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <DollarSign className="text-green-600" size={24} />
                Kwishyura Kwa Vuba
              </h3>
              <div className="space-y-3">
                {recentPayments.length > 0 ? recentPayments.map((payment, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div>
                      <p className="font-medium text-gray-900">{payment.student_name}</p>
                      <p className="text-xs text-gray-500">{new Date(payment.payment_date).toLocaleDateString()}</p>
                    </div>
                    <span className="font-bold text-green-600">{formatCurrency(payment.amount)}</span>
                  </div>
                )) : (
                  <p className="text-gray-500 text-center py-4">Nta kwishyura</p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <CreditCard className="text-orange-600" size={24} />
                Amafaranga Yakoreshejwe Vuba
              </h3>
              <div className="space-y-3">
                {recentExpenses.length > 0 ? recentExpenses.map((expense, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div>
                      <p className="font-medium text-gray-900">{expense.category}</p>
                      <p className="text-xs text-gray-500">{new Date(expense.expense_date).toLocaleDateString()}</p>
                    </div>
                    <span className="font-bold text-red-600">{formatCurrency(expense.amount)}</span>
                  </div>
                )) : (
                  <p className="text-gray-500 text-center py-4">Nta mafaranga yakoreshejwe</p>
                )}
              </div>
            </div>
          </div>

          {notifications.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Bell className="text-blue-600" size={24} />
                Amakuru Mashya
              </h3>
              <div className="space-y-3">
                {notifications.map((notif, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                    <Bell className="text-blue-600 mt-1" size={18} />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{notif.title}</p>
                      <p className="text-sm text-gray-600">{notif.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{new Date(notif.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountantDashboard;
