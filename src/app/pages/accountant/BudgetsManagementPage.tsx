import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, TrendingUp, DollarSign, Calendar, PieChart, Download } from 'lucide-react';
import AccountantSidebar from '@/app/components/AccountantSidebar';

const BudgetsManagement: React.FC<{ onNavigate?: (page: string) => void }> = ({ onNavigate }) => {
  const [budgets, setBudgets] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ category: '', allocated_amount: '', spent_amount: '', fiscal_year: '2024-2025', description: '' });

  useEffect(() => {
    fetchBudgets();
    fetchCategories();
  }, []);

  const fetchBudgets = async () => {
    const res = await fetch('http://localhost:5000/api/accountant/budgets');
    const data = await res.json();
    if (data.success) setBudgets(data.budgets);
  };

  const fetchCategories = async () => {
    const res = await fetch('http://localhost:5000/api/accountant/budget-categories');
    const data = await res.json();
    if (data.success) setCategories(data.categories);
  };

  const handleSubmit = async () => {
    const res = await fetch('http://localhost:5000/api/accountant/budgets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    if (res.ok) {
      alert('Ingengo y\'imari yongerewe!');
      setShowModal(false);
      setFormData({ category: '', allocated_amount: '', spent_amount: '', fiscal_year: '2024-2025', description: '' });
      fetchBudgets();
    }
  };

  const stats = {
    totalAllocated: budgets.reduce((sum, b) => sum + parseFloat(b.allocated_amount || 0), 0),
    totalSpent: budgets.reduce((sum, b) => sum + parseFloat(b.spent_amount || 0), 0),
    remaining: budgets.reduce((sum, b) => sum + (parseFloat(b.allocated_amount || 0) - parseFloat(b.spent_amount || 0)), 0)
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <AccountantSidebar currentPage="budgets-management" onNavigate={onNavigate} />
      <div className="flex-1 overflow-auto p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Ingengo y'Imari</h1>
          <p className="text-gray-600">Gucunga ingengo y'imari y'ishuri</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Amafaranga Yateganijwe</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalAllocated.toLocaleString()} RWF</p>
              </div>
              <DollarSign className="text-blue-500" size={40} />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Amafaranga Yakoreshejwe</p>
                <p className="text-2xl font-bold text-red-600">{stats.totalSpent.toLocaleString()} RWF</p>
              </div>
              <TrendingUp className="text-red-500" size={40} />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Amafaranga Asigaye</p>
                <p className="text-2xl font-bold text-green-600">{stats.remaining.toLocaleString()} RWF</p>
              </div>
              <PieChart className="text-green-500" size={40} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Ingengo y'Imari Zose</h2>
            <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg flex items-center gap-2">
              <Plus size={20} />
              Ongeramo
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left">Icyiciro</th>
                  <th className="px-6 py-4 text-right">Yateganijwe</th>
                  <th className="px-6 py-4 text-right">Yakoreshejwe</th>
                  <th className="px-6 py-4 text-right">Asigaye</th>
                  <th className="px-6 py-4 text-center">%</th>
                  <th className="px-6 py-4 text-left">Umwaka</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {budgets.map((budget) => {
                  const remaining = parseFloat(budget.allocated_amount) - parseFloat(budget.spent_amount);
                  const percentage = (parseFloat(budget.spent_amount) / parseFloat(budget.allocated_amount)) * 100;
                  return (
                    <tr key={budget.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{budget.category}</td>
                      <td className="px-6 py-4 text-right font-semibold text-blue-600">{parseFloat(budget.allocated_amount).toLocaleString()} RWF</td>
                      <td className="px-6 py-4 text-right font-semibold text-red-600">{parseFloat(budget.spent_amount).toLocaleString()} RWF</td>
                      <td className="px-6 py-4 text-right font-semibold text-green-600">{remaining.toLocaleString()} RWF</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center">
                          <div className="w-full bg-gray-200 rounded-full h-2 max-w-[100px]">
                            <div className={`h-2 rounded-full ${percentage > 90 ? 'bg-red-500' : percentage > 70 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${Math.min(percentage, 100)}%` }}></div>
                          </div>
                          <span className="ml-2 text-sm font-medium">{percentage.toFixed(0)}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{budget.fiscal_year}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Ongeramo Ingengo y'Imari</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Icyiciro</label>
                <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500">
                  <option value="">Hitamo icyiciro</option>
                  {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Amafaranga Yateganijwe</label>
                <input type="number" value={formData.allocated_amount} onChange={(e) => setFormData({ ...formData, allocated_amount: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Umwaka</label>
                <input type="text" value={formData.fiscal_year} onChange={(e) => setFormData({ ...formData, fiscal_year: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500" />
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={handleSubmit} className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">Bika</button>
                <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">Guhagarika</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetsManagement;
