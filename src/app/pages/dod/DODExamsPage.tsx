import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Search, CheckCircle, Clock, Home, User, FileText, Users, BarChart3, Scale, Mail, FileSpreadsheet, Menu, X } from 'lucide-react';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

interface Exam {
  id: number;
  exam_name: string;
  exam_date: string;
  location: string;
  status: string;
  students_count: number;
  issues_reported: number;
  notes: string;
}

const DODExamsPage: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    loadExams();
  }, []);

  const loadExams = async () => {
    try {
      const response = await axios.get(`${API_BASE}/dod-comprehensive/exams/monitoring`);
      setExams(response.data.exams);
    } catch (error) {
      console.error('Ikosa:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateExamStatus = async (id: number, status: string) => {
    try {
      await axios.put(`${API_BASE}/dod-comprehensive/exams/monitoring/${id}`, { status });
      loadExams();
    } catch (error) {
      console.error('Ikosa:', error);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      biteguwe: 'bg-blue-100 text-blue-800',
      biratangira: 'bg-yellow-100 text-yellow-800',
      byarangiye: 'bg-green-100 text-green-800',
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
              { id: 'dod-discipline', label: 'Amakosa', Icon: FileText },
              { id: 'dod-exams', label: 'Ibizamini', Icon: Calendar, active: true },
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

      {/* Main Content */}
      <div className="lg:pl-64 flex-1 pt-16">
        <div className="p-4 md:p-6">
      <div className="mb-6">
        <button onClick={() => onNavigate('director-discipline-dashboard')} className="mb-4 text-blue-600 hover:text-blue-700">
          ← Gusubira
        </button>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Calendar className="w-8 h-8 text-purple-600" />
          Gukurikirana Ibizamini
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exams.map((exam) => (
          <div key={exam.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
            <div className="flex items-start justify-between mb-4">
              <Calendar className="w-8 h-8 text-purple-600" />
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(exam.status)}`}>
                {exam.status}
              </span>
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-2">{exam.exam_name}</h3>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-4 h-4" />
                <span className="text-sm">{new Date(exam.exam_date).toLocaleDateString('rw-RW')}</span>
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-medium">Ahantu:</span> {exam.location}
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-medium">Abanyeshuri:</span> {exam.students_count}
              </div>
            </div>

            {exam.status === 'biteguwe' && (
              <button
                onClick={() => updateExamStatus(exam.id, 'biratangira')}
                className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
              >
                Tangira ikizamini
              </button>
            )}

            {exam.status === 'biratangira' && (
              <button
                onClick={() => updateExamStatus(exam.id, 'byarangiye')}
                className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                Rangiza
              </button>
            )}
          </div>
        ))}
      </div>
        </div>
      </div>
    </div>
  );
};

export default DODExamsPage;
