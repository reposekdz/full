import React, { useState, useEffect } from 'react';
import { TrendingUp, Download, Calendar, BarChart3, PieChart, Home, User, FileText, Users, Scale, Mail, FileSpreadsheet } from 'lucide-react';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

const DODReportsPage: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const [reports, setReports] = useState<any>({ discipline: [], behavior: [], exams: [] });
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const today = new Date();
    const lastMonth = new Date(today.setMonth(today.getMonth() - 1));
    setDateRange({
      start: lastMonth.toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    });
  }, []);

  const generateReport = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/dod-comprehensive/reports/generate`, {
        params: { start_date: dateRange.start, end_date: dateRange.end }
      });
      setReports(res.data.reports);
    } catch (error) {
      console.error('Ikosa:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-green-100">
      <div className="hidden lg:flex lg:w-64 lg:flex-col fixed inset-y-0 z-40 mt-16">
        <div className="flex flex-col flex-grow bg-gradient-to-b from-green-600 via-yellow-500 to-green-600 overflow-y-auto shadow-2xl">
          <nav className="flex-1 px-3 py-4 space-y-2">
            {[
              { id: 'director-discipline-dashboard', label: 'Dashboard', Icon: Home },
              { id: 'dod-profile', label: 'Profil', Icon: User },
              { id: 'dod-discipline', label: 'Amakosa', Icon: FileText },
              { id: 'dod-exams', label: 'Ibizamini', Icon: Calendar },
              { id: 'dod-students', label: 'Abanyeshuri', Icon: Users },
              { id: 'dod-reports', label: 'Raporo', Icon: BarChart3, active: true },
              { id: 'dod-punishments', label: 'Ibihano', Icon: Scale },
              { id: 'dod-parent-notifications', label: 'Ababyeyi', Icon: Mail },
              { id: 'dod-student-sheets', label: 'Imbonerahamwe', Icon: FileSpreadsheet }
            ].map(item => (
              <button key={item.id} onClick={() => onNavigate(item.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${item.active ? 'bg-white text-green-700 shadow-lg scale-105 font-bold' : 'text-white hover:bg-white/20 hover:scale-105'}`}>
                <item.Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>
      <div className="lg:pl-64 flex-1 pt-16">
        <div className="p-4 md:p-6">
      <button onClick={() => onNavigate('director-discipline-dashboard')} className="mb-4 text-blue-600 hover:text-blue-700">
        ← Gusubira
      </button>

      <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3 mb-6">
        <TrendingUp className="w-8 h-8 text-purple-600" />
        Raporo z'Indero
      </h1>

      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Itariki yo gutangira</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Itariki yo kurangiza</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={generateReport}
              disabled={loading}
              className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2"
            >
              <BarChart3 className="w-5 h-5" />
              {loading ? 'Birakorwa...' : 'Kora raporo'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">Amakosa</h3>
            <span className="text-2xl font-bold text-red-600">{reports.discipline?.length || 0}</span>
          </div>
          <div className="h-32 bg-gradient-to-br from-red-100 to-red-200 rounded-lg flex items-center justify-center">
            <PieChart className="w-16 h-16 text-red-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">Amanota</h3>
            <span className="text-2xl font-bold text-green-600">{reports.behavior?.length || 0}</span>
          </div>
          <div className="h-32 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-16 h-16 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">Ibizamini</h3>
            <span className="text-2xl font-bold text-blue-600">{reports.exams?.length || 0}</span>
          </div>
          <div className="h-32 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
            <Calendar className="w-16 h-16 text-blue-600" />
          </div>
        </div>
      </div>
        </div>
      </div>
    </div>
  );
};

export default DODReportsPage;
