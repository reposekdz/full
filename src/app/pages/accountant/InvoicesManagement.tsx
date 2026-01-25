import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Download, FileText, Send, Eye, CheckCircle, XCircle, Clock } from 'lucide-react';
import AccountantSidebar from '@/app/components/AccountantSidebar';

interface InvoicesManagementProps {
  onNavigate: (page: string) => void;
}

const InvoicesManagement: React.FC<InvoicesManagementProps> = ({ onNavigate }) => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [stats, setStats] = useState({ total: 0, paid: 0, pending: 0, overdue: 0 });

  const [formData, setFormData] = useState({
    invoice_number: '',
    client_name: '',
    client_email: '',
    client_phone: '',
    description: '',
    amount: '',
    tax_amount: '',
    total_amount: '',
    issue_date: new Date().toISOString().split('T')[0],
    due_date: '',
    status: 'pending',
    payment_terms: '',
    notes: ''
  });

  useEffect(() => {
    fetchInvoices();
    fetchStats();
  }, []);

  useEffect(() => {
    const amount = parseFloat(formData.amount) || 0;
    const tax = parseFloat(formData.tax_amount) || 0;
    setFormData(prev => ({ ...prev, total_amount: (amount + tax).toString() }));
  }, [formData.amount, formData.tax_amount]);

  const fetchInvoices = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:5000/api/accountant/invoices', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setInvoices(data.invoices);
    } catch (error) {
      console.error('Fetch error:', error);
    }
    setLoading(false);
  };

  const fetchStats = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:5000/api/accountant/invoices/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setStats(data.stats);
    } catch (error) {
      console.error('Stats error:', error);
    }
  };

  const generateInvoiceNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `INV-${year}${month}-${random}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const url = editingInvoice 
      ? `http://localhost:5000/api/accountant/invoices/${editingInvoice.id}`
      : 'http://localhost:5000/api/accountant/invoices';
    
    const submitData = {
      ...formData,
      invoice_number: formData.invoice_number || generateInvoiceNumber()
    };
    
    try {
      const res = await fetch(url, {
        method: editingInvoice ? 'PUT' : 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(submitData)
      });
      const data = await res.json();
      if (data.success) {
        fetchInvoices();
        fetchStats();
        resetForm();
      }
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Urashaka gusiba iyi nyemezabuguzi?')) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5000/api/accountant/invoices/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        fetchInvoices();
        fetchStats();
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const handleEdit = (invoice: any) => {
    setEditingInvoice(invoice);
    setFormData({
      invoice_number: invoice.invoice_number,
      client_name: invoice.client_name,
      client_email: invoice.client_email || '',
      client_phone: invoice.client_phone || '',
      description: invoice.description,
      amount: invoice.amount,
      tax_amount: invoice.tax_amount || '0',
      total_amount: invoice.total_amount,
      issue_date: invoice.issue_date.split('T')[0],
      due_date: invoice.due_date.split('T')[0],
      status: invoice.status,
      payment_terms: invoice.payment_terms || '',
      notes: invoice.notes || ''
    });
    setShowForm(true);
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5000/api/accountant/invoices/${id}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        fetchInvoices();
        fetchStats();
      }
    } catch (error) {
      console.error('Status update error:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      invoice_number: '',
      client_name: '',
      client_email: '',
      client_phone: '',
      description: '',
      amount: '',
      tax_amount: '',
      total_amount: '',
      issue_date: new Date().toISOString().split('T')[0],
      due_date: '',
      status: 'pending',
      payment_terms: '',
      notes: ''
    });
    setEditingInvoice(null);
    setShowForm(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('rw-RW', { style: 'currency', currency: 'RWF', minimumFractionDigits: 0 }).format(amount);
  };

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inv.invoice_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || inv.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) return (
    <div className="flex h-screen bg-gray-50">
      <AccountantSidebar currentPage="invoices-management" onNavigate={onNavigate} />
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      <AccountantSidebar currentPage="invoices-management" onNavigate={onNavigate} />
      
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl shadow-xl p-8 mb-8 text-white">
            <h1 className="text-4xl font-bold mb-2">Gucunga Inyemezabuguzi</h1>
            <p className="text-cyan-100">Gukora no gukurikirana inyemezabuguzi zose</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Inyemezabuguzi Zose</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
                </div>
                <FileText className="w-12 h-12 text-blue-600 opacity-20" />
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Zishyuwe</p>
                  <p className="text-2xl font-bold text-green-600">{stats.paid}</p>
                </div>
                <CheckCircle className="w-12 h-12 text-green-600 opacity-20" />
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Zitegerejwe</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <Clock className="w-12 h-12 text-yellow-600 opacity-20" />
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Zarenga Igihe</p>
                  <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
                </div>
                <XCircle className="w-12 h-12 text-red-600 opacity-20" />
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
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="all">Byose</option>
                  <option value="pending">Bitegerejwe</option>
                  <option value="paid">Byishyuwe</option>
                  <option value="overdue">Byarenga Igihe</option>
                  <option value="cancelled">Byahagaritswe</option>
                </select>
              </div>
              
              <button
                onClick={() => setShowForm(!showForm)}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
              >
                <Plus size={20} />
                Kora Inyemezabuguzi
              </button>
            </div>

            {showForm && (
              <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-bold mb-4">{editingInvoice ? 'Hindura' : 'Kora'} Inyemezabuguzi</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Nimero y'Inyemezabuguzi</label>
                    <input
                      type="text"
                      value={formData.invoice_number}
                      onChange={(e) => setFormData({...formData, invoice_number: e.target.value})}
                      placeholder="Izakorerwa otomatiki"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Izina ry'Umukiriya</label>
                    <input
                      type="text"
                      value={formData.client_name}
                      onChange={(e) => setFormData({...formData, client_name: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <input
                      type="email"
                      value={formData.client_email}
                      onChange={(e) => setFormData({...formData, client_email: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Telefoni</label>
                    <input
                      type="tel"
                      value={formData.client_phone}
                      onChange={(e) => setFormData({...formData, client_phone: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Ibisobanuro</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                      rows={2}
                      required
                    />
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
                    <label className="block text-sm font-medium mb-2">Umusoro</label>
                    <input
                      type="number"
                      value={formData.tax_amount}
                      onChange={(e) => setFormData({...formData, tax_amount: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Amafaranga Yose</label>
                    <input
                      type="number"
                      value={formData.total_amount}
                      readOnly
                      className="w-full px-4 py-2 border rounded-lg bg-gray-100"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Itariki yo Gutanga</label>
                    <input
                      type="date"
                      value={formData.issue_date}
                      onChange={(e) => setFormData({...formData, issue_date: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Itariki yo Kwishyura</label>
                    <input
                      type="date"
                      value={formData.due_date}
                      onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Amabwiriza yo Kwishyura</label>
                    <input
                      type="text"
                      value={formData.payment_terms}
                      onChange={(e) => setFormData({...formData, payment_terms: e.target.value})}
                      placeholder="Urugero: Kwishyura mu minsi 30"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Andi Makuru</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                      rows={2}
                    />
                  </div>
                </div>
                
                <div className="flex gap-4 mt-6">
                  <button type="submit" className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700">
                    {editingInvoice ? 'Bika Impinduka' : 'Kora Inyemezabuguzi'}
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
                    <th className="px-4 py-3 text-left text-sm font-semibold">Nimero</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Umukiriya</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Ibisobanuro</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Amafaranga</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Itariki</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Uko Bimeze</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Ibikorwa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredInvoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-blue-600">{invoice.invoice_number}</td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium">{invoice.client_name}</p>
                          {invoice.client_email && <p className="text-xs text-gray-500">{invoice.client_email}</p>}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{invoice.description}</td>
                      <td className="px-4 py-3 font-bold text-emerald-600">{formatCurrency(invoice.total_amount)}</td>
                      <td className="px-4 py-3 text-sm">
                        <div>
                          <p>Yatanzwe: {new Date(invoice.issue_date).toLocaleDateString()}</p>
                          <p className="text-xs text-gray-500">Kwishyura: {new Date(invoice.due_date).toLocaleDateString()}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={invoice.status}
                          onChange={(e) => handleStatusChange(invoice.id, e.target.value)}
                          className={`px-3 py-1 rounded-full text-xs font-semibold border-0 ${
                            invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                            invoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
                            invoice.status === 'cancelled' ? 'bg-gray-100 text-gray-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          <option value="pending">Bitegerejwe</option>
                          <option value="paid">Byishyuwe</option>
                          <option value="overdue">Byarenga</option>
                          <option value="cancelled">Byahagaritswe</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => handleEdit(invoice)} className="text-blue-600 hover:text-blue-800" title="Hindura">
                            <Edit2 size={18} />
                          </button>
                          <button className="text-green-600 hover:text-green-800" title="Kuramo PDF">
                            <Download size={18} />
                          </button>
                          <button onClick={() => handleDelete(invoice.id)} className="text-red-600 hover:text-red-800" title="Siba">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredInvoices.length === 0 && (
                <div className="text-center py-8 text-gray-500">Nta nyemezabuguzi</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicesManagement;
