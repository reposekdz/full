import React, { useState, useEffect } from 'react';
import { Shield, Plus, Clock, CheckCircle, Home, User, FileText, Calendar, Users, BarChart3, Mail, FileSpreadsheet } from 'lucide-react';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

const DODPunishmentsPage: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const [punishments, setPunishments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPunishments();
  }, []);

  const loadPunishments = async () => {
    try {
      const res = await axios.get(`${API_BASE}/dod-comprehensive/punishments`);
      setPunishments(res.data.punishments);
    } catch (error) {
      console.error('Ikosa:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      iburira: 'Iburira',
      guhagarikwa_iminsi: 'Guhagarikwa iminsi',
      guhagarikwa_byimazeyo: 'Guhagarikwa byimazeyo',
      kwirukana: 'Kwirukana'
    };
    return types[type] || type;
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

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
              { id: 'dod-punishments', label: 'Ibihano', Icon: Shield, active: true },
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
      <button onClick={() => onNavigate('director-discipline-dashboard')} className="mb-4 text-blue-600 hover:text-blue-700">← Gusubira</button>
      
      <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3 mb-6">
        <Shield className="w-8 h-8 text-orange-600" />
        Ibihano
      </h1>

      <div className="grid grid-cols-1 gap-4">
        {punishments.map((p) => (
          <div key={p.id} className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{getTypeLabel(p.punishment_type)}</h3>
                <p className="text-gray-700 mb-3">{p.description}</p>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {new Date(p.start_date).toLocaleDateString('rw-RW')}</span>
                  {p.end_date && <span>→ {new Date(p.end_date).toLocaleDateString('rw-RW')}</span>}
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${p.status === 'birakora' ? 'bg-yellow-100 text-yellow-800' : p.status === 'byarangiye' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                {p.status}
              </span>
            </div>
          </div>
        ))}
      </div>
        </div>
      </div>
    </div>
  );
};

export default DODPunishmentsPage;
