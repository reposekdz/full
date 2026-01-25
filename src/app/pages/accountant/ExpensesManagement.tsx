import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Filter, Download, TrendingDown, Calendar, DollarSign } from 'lucide-react';
import AccountantSidebar from '@/app/components/AccountantSidebar';

interface ExpensesManagementProps {
  onNavigate: (page: string) => void;
}

const ExpensesManagement: React.FC<ExpensesManagementProps> = ({ onNavigate }) => {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [stats, setStats] = useState({ total: 0, thisMonth: 0, pending: 0 });

  const [formData, setFormData] = useState({
    category: '',
    description: '',
    amount: '',
    expense_date: new Date().toISOString().split('T')[0],
    payment_method: 'cash',
    reference_number: '',
    approved_by: '',
    status: 'pending'
  });

  const categories = ['Salaries', 'Utilities', 'Supplies', 'Maintenance', 'Transport', 'Food', 'Equipment', 'Other'];

  useEffect(() => {
    fetchExpenses();
    fetchStats();
  }, []);

  const fetchExpenses = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:5000/api/accountant/expenses', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setExpenses(data.expenses);
    } catch (error) {
      console.error('Fetch error:', error);
    }
    setLoading(false);
  };

  const fetchStats = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:5000/api/accountant/expenses/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setStats(data.stats);
    } catch (error) {
      console.error('Stats error:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const url = editingExpense 
      ? `http://localhost:5000/api/accountant/expenses/${editingExpense.id}`
      : 'http://localhost:5000/api/accountant/expenses';
    
    try {
      const res = await fetch(url, {
        method: editingExpense ? 'PUT' : 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        fetchExpenses();
        fetchStats();
        resetForm();
      }
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Urashaka gusiba iyi nkoresho?')) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5000/api/accountant/expenses/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        fetchExpenses();
        fetchStats();
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const handleEdit = (expense: any) => {
    setEditingExpense(expense);
    setFormData({
      category: expense.category,
      description: expense.description,
      amount: expense.amount,
      expense_date: expense.expense_date.split('T')[0],
      payment_method: expense.payment_method,
      reference_number: expense.reference_number || '',
      approved_by: expense.approved_by || '',
      status: expense.status
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      category: '',
      description: '',
      amount: '',
      expense_date: new Date().toISOString().split('T')[0],
      payment_method: 'cash',
      reference_number: '',
      approved_by: '',
      status: 'pending'
    });
    setEditingExpense(null);
    setShowForm(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('rw-RW', { style: 'currency', currency: 'RWF', minimumFractionDigits: 0 }).format(amount);
  };

  const filteredExpenses = expenses.filter(exp => {
    const matchesSearch = exp.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exp.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || exp.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) return (
    <div className="flex h-screen bg-gray-50">
      <AccountantSidebar currentPage="expenses-management" onNavigate={onNavigate} />
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      <AccountantSidebar currentPage="expenses-management" onNavigate={onNavigate} />
      
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl shadow-xl p-8 mb-8 text-white">
            <h1 className="text-4xl font-bold mb-2">Gucunga Amafaranga Yakoreshejwe</h1>
            <p className="text-red-100">Gukurikirana amafaranga yose yakoreshejwe n'ishuri</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Amafaranga Yose Yakoreshejwe</p>
                  <p className="text-2xl font-bold text-red-600">{formatCurrency(stats.total)}</p>
                </div>
                <TrendingDown className="w-12 h-12 text-red-600 opacity-20" />
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Uku Kwezi</p>
                  <p className="text-2xl font-bold text-orange-600">{formatCurrency(stats.thisMonth)}</p>
                </div>
                <Calendar className="w-12 h-12 text-orange-600 opacity-20" />
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Bitegerejwe</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <DollarSign className="w-12 h-12 text-yellow-600 opacity-20" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex flex-wrap gap-4 items-center justify-between mb-6">
              <div className="flex gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Shakisha..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
                
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="all">Byose</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              
              <button
                onClick={() => setShowForm(!showForm)}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
              >
                <Plus size={20} />
                Ongeraho Ikoresho
              </button>
            </div>

            {showForm && (
              <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-bold mb-4">{editingExpense ? 'Hindura' : 'Ongeraho'} Ikoresho</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Icyiciro</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                      required
                    >
                      <option value="">Hitamo...</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Amafaranga</label>
                    <input
                      type="number"
                      value={formData.amount}
                      onChange={(e) => setFormData({...formData, amount: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Itariki</label>
                    <input
                      type="date"
                      value={formData.expense_date}
                      onChange={(e) => setFormData({...formData, expense_date: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Uburyo bwo Kwishyura</label>
                    <select
                      value={formData.payment_method}
                      onChange={(e) => setFormData({...formData, payment_method: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="cash">Amafaranga</option>
                      <option value="bank_transfer">Banki</option>
                      <option value="mobile_money">Mobile Money</option>
                      <option value="cheque">Cheque</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Nimero y'Icyemezo</label>
                    <input
                      type="text"
                      value={formData.reference_number}
                      onChange={(e) => setFormData({...formData, reference_number: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Yemejwe na</label>
                    <input
                      type="text"
                      value={formData.approved_by}
                      onChange={(e) => setFormData({...formData, approved_by: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Ibisobanuro</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                      rows={3}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Uko Bimeze</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="pending">Bitegerejwe</option>
                      <option value="approved">Byemejwe</option>
                      <option value="rejected">Byanzwe</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex gap-4 mt-6">
                  <button type="submit" className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700">
                    {editingExpense ? 'Bika Impinduka' : 'Ongeraho'}
                  </button>
                  <button type="button" onClick={resetForm} className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400">
                    Hagarika
                  </button>
                </div>
              </form>
            )}

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Icyiciro</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Ibisobanuro</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Amafaranga</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Itariki</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Uburyo</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Uko Bimeze</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Ibikorwa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredExpenses.map((expense) => (
                    <tr key={expense.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{expense.category}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{expense.description}</td>
                      <td className="px-4 py-3 font-bold text-red-600">{formatCurrency(expense.amount)}</td>
                      <td className="px-4 py-3 text-sm">{new Date(expense.expense_date).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-sm">{expense.payment_method}</td>
                      <td className="px-4 py-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          expense.status === 'approved' ? 'bg-green-100 text-green-800' :
                          expense.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {expense.status === 'approved' ? 'Byemejwe' : expense.status === 'rejected' ? 'Byanzwe' : 'Bitegerejwe'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => handleEdit(expense)} className="text-blue-600 hover:text-blue-800">
                            <Edit2 size={18} />
                          </button>
                          <button onClick={() => handleDelete(expense.id)} className="text-red-600 hover:text-red-800">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredExpenses.length === 0 && (
                <div className="text-center py-8 text-gray-500">Nta mafaranga yakoreshejwe</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpensesManagement;
