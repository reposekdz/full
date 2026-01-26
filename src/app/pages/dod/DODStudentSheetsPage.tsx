import React, { useState, useEffect } from 'react';
import { FileText, Filter, Download, Home, User, Calendar, Users, BarChart3, Scale, Mail, FileSpreadsheet } from 'lucide-react';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

const DODStudentSheetsPage: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const [students, setStudents] = useState<any[]>([]);
  const [trades, setTrades] = useState<any[]>([]);
  const [selectedTrade, setSelectedTrade] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTrades();
  }, []);

  const loadTrades = async () => {
    try {
      const res = await axios.get(`${API_BASE}/trades`);
      setTrades(res.data.trades || []);
    } catch (error) {
      console.error('Ikosa:', error);
    }
  };

  const loadStudentSheets = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/dod-comprehensive/students/sheets`, {
        params: { trade_id: selectedTrade, level: selectedLevel }
      });
      setStudents(res.data.students);
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
              { id: 'dod-reports', label: 'Raporo', Icon: BarChart3 },
              { id: 'dod-punishments', label: 'Ibihano', Icon: Scale },
              { id: 'dod-parent-notifications', label: 'Ababyeyi', Icon: Mail },
              { id: 'dod-student-sheets', label: 'Imbonerahamwe', Icon: FileSpreadsheet, active: true }
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
        <FileText className="w-8 h-8 text-blue-600" />
        Imbonerahamwe z'Abanyeshuri
      </h1>

      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            value={selectedTrade}
            onChange={(e) => setSelectedTrade(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Hitamo umwuga</option>
            {trades.map((t) => (
              <option key={t.id} value={t.id}>{t.title}</option>
            ))}
          </select>

          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Hitamo urwego</option>
            <option value="S1">S1</option>
            <option value="S2">S2</option>
            <option value="S3">S3</option>
            <option value="S4">S4</option>
            <option value="S5">S5</option>
            <option value="S6">S6</option>
          </select>

          <button
            onClick={loadStudentSheets}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
          >
            <Filter className="w-5 h-5" />
            {loading ? 'Birakorwa...' : 'Shakisha'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
              <tr>
                <th className="px-4 py-3 text-left">Izina</th>
                <th className="px-4 py-3 text-left">Nimero</th>
                <th className="px-4 py-3 text-left">Umwuga</th>
                <th className="px-4 py-3 text-center">Amakosa</th>
                <th className="px-4 py-3 text-center">Amanota meza</th>
                <th className="px-4 py-3 text-center">Impano</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s, i) => (
                <tr key={s.id} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="px-4 py-3">{s.name}</td>
                  <td className="px-4 py-3">{s.student_id}</td>
                  <td className="px-4 py-3">{s.trade_name}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                      {s.total_cases || 0}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                      {s.good_points || 0}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      {s.avg_grade ? s.avg_grade.toFixed(1) : 'N/A'}
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
    </div>
  );
};

export default DODStudentSheetsPage;
