import React, { useState, useEffect } from 'react';
import { Users, Search, Award, AlertCircle, Home, User, FileText, Calendar, BarChart3, Scale, Mail, FileSpreadsheet, Menu, X, Filter } from 'lucide-react';
import apiService from '@/app/services/apiService';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';

interface Student {
  id: number;
  first_name: string;
  last_name: string;
  student_id: string;
  trade_code: string;
  trade_name?: string;
  level_number: number;
  level_suffix?: string;
  total_cases?: number;
  good_points?: number;
  bad_points?: number;
}

const DODStudentsPage: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [trades, setTrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTrade, setSelectedTrade] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [studentsRes, tradesRes] = await Promise.all([
        apiService.getDisciplineStudents(),
        apiService.getTradesWithLevels()
      ]);
      
      if (studentsRes.success) setStudents(studentsRes.students || []);
      if (tradesRes.success) setTrades(tradesRes.trades || []);
    } catch (error) {
      console.error('Ikosa:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(s => {
    const fullName = `${s.first_name} ${s.last_name}`.toLowerCase();
    const matchesSearch = !searchTerm || 
      fullName.includes(searchTerm.toLowerCase()) ||
      s.student_id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTrade = !selectedTrade || s.trade_code === selectedTrade;
    const matchesLevel = !selectedLevel || s.level_number?.toString() === selectedLevel;
    return matchesSearch && matchesTrade && matchesLevel;
  });

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
              { id: 'dod-exams', label: 'Ibizamini', Icon: Calendar },
              { id: 'dod-students', label: 'Abanyeshuri', Icon: Users, active: true },
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
          <Users className="w-8 h-8 text-green-600" />
          Abanyeshuri
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
          <Select value={selectedTrade} onValueChange={setSelectedTrade}>
            <SelectTrigger>
              <SelectValue placeholder="Hitamo Umwuga" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Imyuga Yose</SelectItem>
              {trades.map(trade => (
                <SelectItem key={trade.code} value={trade.code}>
                  {trade.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedLevel} onValueChange={setSelectedLevel}>
            <SelectTrigger>
              <SelectValue placeholder="Hitamo Urwego" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Inzego Zose</SelectItem>
              {selectedTrade && trades.find(t => t.code === selectedTrade)?.levels?.map((level: any) => (
                <SelectItem key={`${level.level_number}${level.level_suffix || ''}`} value={level.level_number.toString()}>
                  Level {level.level_number}{level.level_suffix || ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
          <Filter className="w-4 h-4" />
          <span>Abanyeshuri {filteredStudents.length} kuri {students.length}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents.map((student) => (
          <div key={student.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {student.first_name?.charAt(0)}{student.last_name?.charAt(0)}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900">{student.first_name} {student.last_name}</h3>
                <p className="text-sm text-gray-600">{student.student_id}</p>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="text-sm text-gray-600">
                <span className="font-medium">Umwuga:</span> {student.trade_code} - Level {student.level_number}{student.level_suffix || ''}
              </div>
              
              <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-gray-700">Amanota meza</span>
                </div>
                <span className="font-bold text-green-600">{student.good_points || 0}</span>
              </div>

              <div className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <span className="text-sm text-gray-700">Amakosa</span>
                </div>
                <span className="font-bold text-red-600">{student.total_cases || 0}</span>
              </div>
            </div>

            <button
              onClick={() => onNavigate(`student-detail/${student.id}`)}
              className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Reba byose
            </button>
          </div>
        ))}
      </div>
        </div>
      </div>
    </div>
  );
};

export default DODStudentsPage;
