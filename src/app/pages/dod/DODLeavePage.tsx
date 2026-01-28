import React, { useState, useEffect } from 'react';
import { Plane, Plus, Search, Filter, Eye, Edit, Check, Home, User, FileText, Calendar, Users, BarChart3, Scale, Mail, FileSpreadsheet, Menu, X, Clock, CheckCircle, XCircle } from 'lucide-react';
import apiService from '@/app/services/apiService';

const DODLeavePage: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const [leaves, setLeaves] = useState<any[]>([]);
  const [filteredLeaves, setFilteredLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    loadLeaves();
  }, []);

  useEffect(() => {
    filterLeaves();
  }, [searchTerm, statusFilter, leaves]);

  const loadLeaves = async () => {
    try {
      setLoading(true);
      const data = await apiService.getLeaveHistory();
      setLeaves(Array.isArray(data) ? data : (data.leaves || []));
    } catch (error) {
      console.error('Ikosa:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterLeaves = () => {
    let filtered = [...leaves];
    if (searchTerm) {
      filtered = filtered.filter(l =>
        (l.student_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (l.reason || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (statusFilter !== 'all') filtered = filtered.filter(l => l.status === statusFilter);
    setFilteredLeaves(filtered);
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      const res = await apiService.updateLeaveStatus(id, status);
      if (res.success) {
        loadLeaves();
      }
    } catch (error) {
      console.error('Ikosa:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
    </div>;
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-green-100">
      <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden fixed top-20 left-4 z-50 p-2 bg-green-600 text-white rounded-lg shadow-lg">
        {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 w-64 transition-transform duration-300 ease-in-out mt-16`}>
        <div className="h-full bg-gradient-to-b from-green-600 via-yellow-500 to-green-600 overflow-y-auto shadow-2xl">
          <nav className="flex-1 px-3 py-4 space-y-2">
            {[
              { id: 'director-discipline-dashboard', label: 'Dashboard', Icon: Home },
              { id: 'dod-profile', label: 'Profil', Icon: User },
              { id: 'dod-discipline', label: 'Amakosa', Icon: FileText },
              { id: 'dod-leave', label: 'Uruhushya', Icon: Plane, active: true },
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
            <button onClick={() => onNavigate('director-discipline-dashboard')} className="mb-4 text-green-600 hover:text-green-700">
              ← Gusubira
            </button>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Plane className="w-8 h-8 text-green-600" />
              Gucunga Impushya
            </h1>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Shakisha umunyeshuri..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                <option value="all">Imiterere yose</option>
                <option value="pending">Iritegerejwe</option>
                <option value="approved">Byemejwe</option>
                <option value="rejected">Byanzwe</option>
              </select>
              <div className="flex items-center gap-2 text-gray-600">
                <Filter className="w-5 h-5" />
                <span className="font-medium">{filteredLeaves.length} impushya</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-green-600 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left">Umunyeshuri</th>
                    <th className="px-6 py-4 text-left">Impamvu</th>
                    <th className="px-6 py-4 text-left">Itariki</th>
                    <th className="px-6 py-4 text-center">Imiterere</th>
                    <th className="px-6 py-4 text-center">Ibikorwa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredLeaves.map((leave) => (
                    <tr key={leave.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">{leave.student_name}</div>
                        <div className="text-xs text-gray-500">{leave.student_number}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-700">{leave.reason}</td>
                      <td className="px-6 py-4">
                        <div className="text-sm">Kuva: {new Date(leave.start_date).toLocaleDateString()}</div>
                        <div className="text-sm text-gray-500">Kugeza: {new Date(leave.end_date).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusColor(leave.status)}`}>
                          {leave.status === 'pending' ? 'Iritegerejwe' : leave.status === 'approved' ? 'Byemejwe' : 'Byanzwe'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          {leave.status === 'pending' && (
                            <>
                              <button onClick={() => updateStatus(leave.id, 'approved')} className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200" title="Kwemera">
                                <CheckCircle size={20} />
                              </button>
                              <button onClick={() => updateStatus(leave.id, 'rejected')} className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200" title="Kwanga">
                                <XCircle size={20} />
                              </button>
                            </>
                          )}
                          <button className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200" title="Reba">
                            <Eye size={20} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredLeaves.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                        Nta mpushya zabonetse.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DODLeavePage;
