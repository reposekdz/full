import React, { useState, useEffect } from 'react';
import { AlertTriangle, Plus, Search, Filter, Eye, Edit, Check, Home, User, FileText, Calendar, Users, BarChart3, Scale, Mail, FileSpreadsheet, Menu, X } from 'lucide-react';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

interface DisciplineCase {
  id: number;
  student_id: number;
  student_name: string;
  student_number: string;
  case_type: string;
  description: string;
  action_taken: string;
  status: string;
  severity: number;
  created_at: string;
}

const DODDisciplinePage: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const [cases, setCases] = useState<DisciplineCase[]>([]);
  const [filteredCases, setFilteredCases] = useState<DisciplineCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    loadCases();
  }, []);

  useEffect(() => {
    filterCases();
  }, [searchTerm, statusFilter, cases]);

  const loadCases = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/dod-comprehensive/discipline/cases`);
      setCases(response.data.cases);
    } catch (error) {
      console.error('Ikosa:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterCases = () => {
    let filtered = [...cases];
    if (searchTerm) {
      filtered = filtered.filter(c =>
        c.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (statusFilter) filtered = filtered.filter(c => c.status === statusFilter);
    setFilteredCases(filtered);
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      await axios.put(`${API_BASE}/dod-comprehensive/discipline/cases/${id}`, { status });
      loadCases();
    } catch (error) {
      console.error('Ikosa:', error);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      gishya: 'bg-yellow-100 text-yellow-800',
      girakurikiranwa: 'bg-blue-100 text-blue-800',
      byakemuwe: 'bg-green-100 text-green-800',
      byahagaritswe: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>;
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-green-100">
      <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden fixed top-20 left-4 z-50 p-2 bg-green-600 text-white rounded-lg shadow-lg">
        {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>
      {sidebarOpen && <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30 mt-16" onClick={() => setSidebarOpen(false)} />}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 w-64 transition-transform duration-300 ease-in-out mt-16`}>
        <div className="h-full bg-gradient-to-b from-green-600 via-yellow-500 to-green-600 overflow-y-auto shadow-2xl">
          <nav className="flex-1 px-3 py-4 space-y-2">
            {[
              { id: 'director-discipline-dashboard', label: 'Dashboard', Icon: Home },
              { id: 'dod-profile', label: 'Profil', Icon: User },
              { id: 'dod-discipline', label: 'Amakosa', Icon: FileText, active: true },
              { id: 'dod-exams', label: 'Ibizamini', Icon: Calendar },
              { id: 'dod-students', label: 'Abanyeshuri', Icon: Users },
              { id: 'dod-reports', label: 'Raporo', Icon: BarChart3 },
              { id: 'dod-punishments', label: 'Ibihano', Icon: Scale },
              { id: 'dod-parent-notifications', label: 'Ababyeyi', Icon: Mail },
              { id: 'dod-student-sheets', label: 'Imbonerahamwe', Icon: FileSpreadsheet }
            ].map(item => (
              <button key={item.id} onClick={() => { onNavigate(item.id); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${item.active ? 'bg-white text-green-700 shadow-lg scale-105 font-bold' : 'text-white hover:bg-white/20 hover:scale-105'}`}>
                <item.Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>
      <div className="lg:pl-64 flex-1 pt-16">
        <div className="p-4 md:p-6">
      <div className="mb-6">
        <button onClick={() => onNavigate('director-discipline-dashboard')} className="mb-4 text-blue-600 hover:text-blue-700">
          ← Gusubira
        </button>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <AlertTriangle className="w-8 h-8 text-red-600" />
          Gucunga Amakosa
        </h1>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Shakisha..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
            />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500">
            <option value="">Imiterere yose</option>
            <option value="gishya">Gishya</option>
            <option value="girakurikiranwa">Girakurikiranwa</option>
            <option value="byakemuwe">Byakemuwe</option>
          </select>
          <div className="flex items-center gap-2 text-gray-600">
            <Filter className="w-5 h-5" />
            <span className="font-medium">{filteredCases.length} amakosa</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredCases.map((c) => (
          <div key={c.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-gray-900">{c.student_name}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(c.status)}`}>
                    {c.status}
                  </span>
                </div>
                <p className="text-gray-700 mb-2">{c.description}</p>
                <p className="text-sm text-gray-500">
                  {new Date(c.created_at).toLocaleDateString('rw-RW')}
                </p>
              </div>
              <div className="flex flex-col gap-2 ml-4">
                {c.status === 'gishya' && (
                  <button onClick={() => updateStatus(c.id, 'girakurikiranwa')}
                    className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200">
                    <Eye className="w-5 h-5" />
                  </button>
                )}
                {c.status === 'girakurikiranwa' && (
                  <button onClick={() => updateStatus(c.id, 'byakemuwe')}
                    className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200">
                    <Check className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
        </div>
      </div>
    </div>
  );
};

export default DODDisciplinePage;
