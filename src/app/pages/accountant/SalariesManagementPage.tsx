import React, { useState, useEffect } from 'react';
import { Users, DollarSign, Calendar, CheckCircle, Clock, Download } from 'lucide-react';
import AccountantSidebar from '@/app/components/AccountantSidebar';

const SalariesManagement: React.FC<{ onNavigate?: (page: string) => void }> = ({ onNavigate }) => {
  const [salaries, setSalaries] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ staff_id: '', amount: '', month: '', year: '2024', status: 'pending' });

  useEffect(() => {
    fetchSalaries();
    fetchStaff();
  }, []);

  const fetchSalaries = async () => {
    const res = await fetch('http://localhost:5000/api/accountant/salaries');
    const data = await res.json();
    if (data.success) setSalaries(data.salaries);
  };

  const fetchStaff = async () => {
    const res = await fetch('http://localhost:5000/api/staff');
    const data = await res.json();
    setStaff(data);
  };

  const handlePaySalary = async () => {
    const res = await fetch('http://localhost:5000/api/accountant/salaries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    if (res.ok) {
      alert('Umushahara wanditswe!');
      setShowModal(false);
      fetchSalaries();
    }
  };

  const stats = {
    totalPaid: salaries.filter(s => s.status === 'paid').reduce((sum, s) => sum + parseFloat(s.amount), 0),
    totalPending: salaries.filter(s => s.status === 'pending').reduce((sum, s) => sum + parseFloat(s.amount), 0),
    staffCount: new Set(salaries.map(s => s.staff_id)).size
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <AccountantSidebar currentPage="salaries-management" onNavigate={onNavigate} />
      <div className="flex-1 overflow-auto p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Imishahara</h1>
          <p className="text-gray-600">Gucunga imishahara y'abakozi</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Imishahara Yishyuwe</p>
                <p className="text-2xl font-bold text-green-600">{stats.totalPaid.toLocaleString()} RWF</p>
              </div>
              <CheckCircle className="text-green-500" size={40} />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Imishahara Itegerejwe</p>
                <p className="text-2xl font-bold text-orange-600">{stats.totalPending.toLocaleString()} RWF</p>
              </div>
              <Clock className="text-orange-500" size={40} />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Abakozi</p>
                <p className="text-2xl font-bold text-blue-600">{stats.staffCount}</p>
              </div>
              <Users className="text-blue-500" size={40} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Imishahara Yose</h2>
            <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-lg hover:shadow-lg flex items-center gap-2">
              <DollarSign size={20} />
              Kwishyura Umushahara
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left">Umukozi</th>
                  <th className="px-6 py-4 text-left">Umwanya</th>
                  <th className="px-6 py-4 text-right">Amafaranga</th>
                  <th className="px-6 py-4 text-center">Ukwezi</th>
                  <th className="px-6 py-4 text-center">Imiterere</th>
                  <th className="px-6 py-4 text-center">Itariki</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {salaries.map((salary) => (
                  <tr key={salary.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{salary.staff_name}</td>
                    <td className="px-6 py-4 text-gray-600">{salary.position}</td>
                    <td className="px-6 py-4 text-right font-semibold text-gray-900">{parseFloat(salary.amount).toLocaleString()} RWF</td>
                    <td className="px-6 py-4 text-center text-gray-600">{salary.month}/{salary.year}</td>
                    <td className="px-6 py-4 text-center">
                      {salary.status === 'paid' ? (
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">Yishyuwe</span>
                      ) : (
                        <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">Itegerejwe</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center text-gray-600">{new Date(salary.payment_date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Kwishyura Umushahara</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Umukozi</label>
                <select value={formData.staff_id} onChange={(e) => setFormData({ ...formData, staff_id: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500">
                  <option value="">Hitamo umukozi</option>
                  {staff.map(s => <option key={s.id} value={s.id}>{s.first_name} {s.last_name} - {s.position}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Amafaranga</label>
                <input type="number" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Ukwezi</label>
                  <select value={formData.month} onChange={(e) => setFormData({ ...formData, month: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500">
                    <option value="">Hitamo</option>
                    {['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'].map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Umwaka</label>
                  <input type="text" value={formData.year} onChange={(e) => setFormData({ ...formData, year: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={handlePaySalary} className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Bika</button>
                <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">Guhagarika</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalariesManagement;
