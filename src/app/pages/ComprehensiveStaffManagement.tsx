import { API_BASE_URL } from '@/app/config/apiBase';
import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Filter, Edit, Trash2, Eye, Download, 
  Users, Mail, Phone, Calendar, CheckCircle, XCircle,
  RefreshCw, Upload, FileText, MoreVertical
} from 'lucide-react';
import StaffRoleSelection from '../components/StaffRoleSelection';

const ComprehensiveStaffManagement = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [selectedStaff, setSelectedStaff] = useState(null);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/staff-management`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setStaff(data.staff || []);
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  const filteredStaff = staff.filter(s => {
    const matchesSearch = s.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         s.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         s.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || s.role_name === filterRole;
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Gutegura amakuru...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 text-white rounded-2xl shadow-2xl p-8 mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2">Gucunga Abakozi</h1>
            <p className="text-blue-100 text-lg">Ongeraho, hindura, cyangwa usibe abakozi b'ishuri</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={fetchStaff}
              className="bg-white/20 hover:bg-white/30 px-6 py-3 rounded-xl flex items-center gap-2 transition-all"
            >
              <RefreshCw className="w-5 h-5" />
              Vugurura
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-white text-indigo-600 hover:bg-blue-50 px-6 py-3 rounded-xl flex items-center gap-2 font-semibold transition-all"
            >
              <Plus className="w-5 h-5" />
              Ongeraho Umukozi
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard title="Abakozi Bose" value={staff.length} icon={<Users />} color="blue" />
        <StatCard title="Abarimu" value={staff.filter(s => s.role_name === 'teacher').length} icon={<Users />} color="green" />
        <StatCard title="Abayobozi" value={staff.filter(s => ['admin', 'headmaster', 'school_owner'].includes(s.role_name)).length} icon={<Users />} color="purple" />
        <StatCard title="Abandi" value={staff.filter(s => !['teacher', 'admin', 'headmaster', 'school_owner'].includes(s.role_name)).length} icon={<Users />} color="orange" />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Shakisha umukozi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            />
          </div>
          
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          >
            <option value="all">Imyanya Yose</option>
            <option value="school_owner">Umuyobozi w'Ishuri (Owner)</option>
            <option value="admin">Umuyobozi Mukuru</option>
            <option value="headmaster">Umuyobozi w'Ishuri</option>
            <option value="teacher">Umwarimu</option>
            <option value="accountant">Umubare</option>
            <option value="stock_manager">Umuyobozi w'Ibikoresho</option>
            <option value="director_study">Umuyobozi w'Amasomo</option>
            <option value="director_discipline">Umuyobozi w'Imyitwarire</option>
            <option value="advisor">Umujyanama</option>
            <option value="patron">Patron</option>
            <option value="matron">Matron</option>
          </select>

          <button className="bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 flex items-center justify-center gap-2 font-semibold">
            <Download className="w-5 h-5" />
            Kuramo Raporo
          </button>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
              <tr>
                <th className="px-6 py-4 text-left font-semibold">Amazina</th>
                <th className="px-6 py-4 text-left font-semibold">Imeri</th>
                <th className="px-6 py-4 text-left font-semibold">Telefoni</th>
                <th className="px-6 py-4 text-left font-semibold">Umwanya</th>
                <th className="px-6 py-4 text-left font-semibold">Imimerere</th>
                <th className="px-6 py-4 text-center font-semibold">Ibikorwa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredStaff.map((member, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                        {member.first_name?.[0]}{member.last_name?.[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{member.first_name} {member.last_name}</p>
                        <p className="text-sm text-gray-500">ID: {member.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Mail className="w-4 h-4 text-gray-400" />
                      {member.email}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Phone className="w-4 h-4 text-gray-400" />
                      {member.phone || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <RoleBadge role={member.role_name} />
                  </td>
                  <td className="px-6 py-4">
                    {member.is_active ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                        <CheckCircle className="w-4 h-4" />
                        Akora
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-semibold">
                        <XCircle className="w-4 h-4" />
                        Ntakora
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Eye className="w-5 h-5" />
                      </button>
                      <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                        <Edit className="w-5 h-5" />
                      </button>
                      <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Staff Modal */}
      {showAddModal && (
        <AddStaffModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            fetchStaff();
          }}
        />
      )}
    </div>
  );
};

const StatCard = ({ title, value, icon, color }) => {
  const colors = {
    blue: 'from-blue-500 to-indigo-600',
    green: 'from-green-500 to-emerald-600',
    purple: 'from-purple-500 to-pink-600',
    orange: 'from-orange-500 to-red-600'
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className={`bg-gradient-to-br ${colors[color]} text-white p-3 rounded-xl`}>
          {icon}
        </div>
      </div>
      <h3 className="text-gray-600 text-sm font-medium mb-2">{title}</h3>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
};

const RoleBadge = ({ role }) => {
  const roleConfig = {
    school_owner: { label: 'Umuyobozi w\'Ishuri', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
    admin: { label: 'Umuyobozi Mukuru', color: 'bg-blue-100 text-blue-800 border-blue-300' },
    headmaster: { label: 'Umuyobozi', color: 'bg-purple-100 text-purple-800 border-purple-300' },
    teacher: { label: 'Umwarimu', color: 'bg-cyan-100 text-cyan-800 border-cyan-300' },
    accountant: { label: 'Umubare', color: 'bg-green-100 text-green-800 border-green-300' },
    stock_manager: { label: 'Ibikoresho', color: 'bg-orange-100 text-orange-800 border-orange-300' },
    director_study: { label: 'DOS', color: 'bg-indigo-100 text-indigo-800 border-indigo-300' },
    director_discipline: { label: 'DOD', color: 'bg-red-100 text-red-800 border-red-300' },
    advisor: { label: 'Umujyanama', color: 'bg-pink-100 text-pink-800 border-pink-300' },
    patron: { label: 'Patron', color: 'bg-teal-100 text-teal-800 border-teal-300' },
    matron: { label: 'Matron', color: 'bg-purple-100 text-purple-800 border-purple-300' }
  };

  const config = roleConfig[role] || { label: role, color: 'bg-gray-100 text-gray-800 border-gray-300' };

  return (
    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold border-2 ${config.color}`}>
      {config.label}
    </span>
  );
};

const AddStaffModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    role_name: '',
    department: '',
    specialization: '',
    hire_date: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/staff-management', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (data.success) {
        alert('Umukozi yongeweho neza!');
        onSuccess();
      } else {
        alert('Ikosa: ' + data.message);
      }
    } catch (error) {
      alert('Ikosa ryabaye: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-6 rounded-t-2xl">
          <h2 className="text-2xl font-bold">Ongeraho Umukozi Mushya</h2>
          <p className="text-blue-100 mt-1">Uzuza amakuru y'umukozi</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Personal Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Izina Rya Mbere *</label>
              <input
                type="text"
                required
                value={formData.first_name}
                onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Izina Rya Kabiri *</label>
              <input
                type="text"
                required
                value={formData.last_name}
                onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Imeri *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Telefoni</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              />
            </div>
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Hitamo Umwanya *</label>
            <StaffRoleSelection
              selectedRole={formData.role_name}
              onSelect={(role) => setFormData({...formData, role_name: role})}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Ishami</label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({...formData, department: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Ubumenyi Bwihariye</label>
              <input
                type="text"
                value={formData.specialization}
                onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Itariki yo Gutangira Akazi</label>
            <input
              type="date"
              value={formData.hire_date}
              onChange={(e) => setFormData({...formData, hire_date: e.target.value})}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition-all"
            >
              Hagarika
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl hover:from-indigo-700 hover:to-blue-700 font-semibold transition-all disabled:opacity-50"
            >
              {loading ? 'Urategereza...' : 'Bika Umukozi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ComprehensiveStaffManagement;
