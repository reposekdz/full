import React, { useState, useEffect } from 'react';
import { ArrowUpDown, TrendingUp, TrendingDown, Filter, Calendar, Download } from 'lucide-react';
import AccountantSidebar from '@/app/components/AccountantSidebar';

const TransactionsManagement: React.FC<{ onNavigate?: (page: string) => void }> = ({ onNavigate }) => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  useEffect(() => {
    fetchTransactions();
  }, [filter, dateRange]);

  const fetchTransactions = async () => {
    const params = new URLSearchParams();
    if (filter !== 'all') params.append('type', filter);
    if (dateRange.start) params.append('start_date', dateRange.start);
    if (dateRange.end) params.append('end_date', dateRange.end);
    
    const res = await fetch(`http://localhost:5000/api/accountant/transactions?${params}`);
    const data = await res.json();
    if (data.success) setTransactions(data.transactions);
  };

  const stats = {
    totalIncome: transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + parseFloat(t.amount), 0),
    totalExpense: transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + parseFloat(t.amount), 0),
    netBalance: transactions.reduce((sum, t) => sum + (t.type === 'income' ? parseFloat(t.amount) : -parseFloat(t.amount)), 0)
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <AccountantSidebar currentPage="transactions-management" onNavigate={onNavigate} />
      <div className="flex-1 overflow-auto p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Ibyavuye n'Ibyinjiye</h1>
          <p className="text-gray-600">Amateka y'amafaranga yose</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Amafaranga Yinjiye</p>
                <p className="text-2xl font-bold text-green-600">{stats.totalIncome.toLocaleString()} RWF</p>
              </div>
              <TrendingUp className="text-green-500" size={40} />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Amafaranga Yasohotse</p>
                <p className="text-2xl font-bold text-red-600">{stats.totalExpense.toLocaleString()} RWF</p>
              </div>
              <TrendingDown className="text-red-500" size={40} />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Amafaranga Asigaye</p>
                <p className="text-2xl font-bold text-blue-600">{stats.netBalance.toLocaleString()} RWF</p>
              </div>
              <ArrowUpDown className="text-blue-500" size={40} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <select value={filter} onChange={(e) => setFilter(e.target.value)} className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
              <option value="all">Byose</option>
              <option value="income">Yinjiye</option>
              <option value="expense">Yasohotse</option>
            </select>
            <input type="date" value={dateRange.start} onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })} className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
            <input type="date" value={dateRange.end} onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })} className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
            <button onClick={fetchTransactions} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2">
              <Filter size={18} />
              Shakisha
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left">Itariki</th>
                  <th className="px-6 py-4 text-left">Ubwoko</th>
                  <th className="px-6 py-4 text-left">Icyiciro</th>
                  <th className="px-6 py-4 text-left">Ibisobanuro</th>
                  <th className="px-6 py-4 text-right">Amafaranga</th>
                  <th className="px-6 py-4 text-center">Imiterere</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {transactions.map((trans) => (
                  <tr key={trans.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-600">{new Date(trans.transaction_date).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      {trans.type === 'income' ? (
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium flex items-center gap-1 w-fit">
                          <TrendingUp size={14} />
                          Yinjiye
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium flex items-center gap-1 w-fit">
                          <TrendingDown size={14} />
                          Yasohotse
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-900 font-medium">{trans.category}</td>
                    <td className="px-6 py-4 text-gray-600">{trans.description}</td>
                    <td className="px-6 py-4 text-right font-bold" style={{ color: trans.type === 'income' ? '#10b981' : '#ef4444' }}>
                      {trans.type === 'income' ? '+' : '-'}{parseFloat(trans.amount).toLocaleString()} RWF
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${trans.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {trans.status === 'completed' ? 'Byarangiye' : 'Bitegerejwe'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionsManagement;
