import React, { useState, useEffect } from 'react';
import { Users, Search, UserPlus, BookOpen, Calendar, Bell, LogOut, Phone } from 'lucide-react';
import axios from 'axios';

interface ParentDashboardProps {
  onNavigate: (page: string) => void;
}

const ParentDashboardSimple: React.FC<ParentDashboardProps> = ({ onNavigate }) => {
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [linkMode, setLinkMode] = useState<'none' | 'auto' | 'manual'>('none');
  
  // Auto link form
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  
  // Manual link form
  const [manualForm, setManualForm] = useState({
    student_name: '',
    trade: '',
    level: '',
    message: ''
  });

  useEffect(() => {
    fetchChildren();
  }, []);

  const fetchChildren = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/parent-links/students', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setChildren(response.data.students || []);
        setStats(response.data.stats || {});
      }
    } catch (error) {
      console.error('Error fetching children:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAutoSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setSearching(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:5000/api/parent-registration/search-students?query=${searchQuery}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        setSearchResults(response.data.students || []);
      }
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleAutoLink = async (student: any) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/parent-links/auto-link',
        {
          student_first_name: student.first_name,
          student_last_name: student.last_name,
          trade_code: student.trade_code,
          level: student.level
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        alert('✅ ' + response.data.message);
        setLinkMode('none');
        setSearchQuery('');
        setSearchResults([]);
        fetchChildren();
      }
    } catch (error: any) {
      alert('❌ ' + (error.response?.data?.message || 'Error linking child'));
    }
  };

  const handleManualRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      // Send request to staff for manual linking
      const response = await axios.post(
        'http://localhost:5000/api/parent-links/request-manual-link',
        manualForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        alert('✅ Request sent to staff! You will be notified when approved.');
        setLinkMode('none');
        setManualForm({ student_name: '', trade: '', level: '', message: '' });
      }
    } catch (error: any) {
      alert('❌ ' + (error.response?.data?.message || 'Error sending request'));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    onNavigate('login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Tegereza...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Ikaze! (Welcome)</h1>
              <p className="text-gray-600">Parent Dashboard</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              <LogOut className="w-5 h-5" />
              Sohoka
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Abana</p>
                <p className="text-2xl font-bold">{children.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg GPA</p>
                <p className="text-2xl font-bold">{stats.avg_gpa?.toFixed(1) || '0.0'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Attendance</p>
                <p className="text-2xl font-bold">{stats.avg_attendance?.toFixed(0) || '0'}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Bell className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Conduct</p>
                <p className="text-2xl font-bold">{stats.avg_conduct?.toFixed(0) || '40'}/40</p>
              </div>
            </div>
          </div>
        </div>

        {/* Link Options - Only show if no mode selected */}
        {linkMode === 'none' && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            <h2 className="text-2xl font-bold text-center mb-6">Huza n'Umwana (Link with Child)</h2>
            <p className="text-center text-gray-600 mb-8">Hitamo uburyo bwo guhuza n'umwana wawe</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Auto Connect Option */}
              <div 
                onClick={() => setLinkMode('auto')}
                className="border-2 border-green-200 rounded-xl p-6 hover:border-green-500 hover:shadow-lg cursor-pointer transition-all"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-center mb-2">Auto Connect</h3>
                <p className="text-center text-gray-600 mb-4">Shakisha umwana wawe wenyine</p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>✅ Byihuse (Fast)</li>
                  <li>✅ Shakisha amazina (Search by name)</li>
                  <li>✅ Huza ako kanya (Instant link)</li>
                </ul>
              </div>

              {/* Manual Connect Option */}
              <div 
                onClick={() => setLinkMode('manual')}
                className="border-2 border-blue-200 rounded-xl p-6 hover:border-blue-500 hover:shadow-lg cursor-pointer transition-all"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserPlus className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-center mb-2">Manual Connect</h3>
                <p className="text-center text-gray-600 mb-4">Saba ubufasha bw'abakozi</p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>✅ Ubufasha bw'abakozi (Staff help)</li>
                  <li>✅ Emeza neza (Verified)</li>
                  <li>✅ Uhabwa ubutumwa (Get notified)</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Auto Connect Form */}
        {linkMode === 'auto' && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Auto Connect - Shakisha Umwana</h2>
              <button
                onClick={() => {
                  setLinkMode('none');
                  setSearchQuery('');
                  setSearchResults([]);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                ✕ Funga
              </button>
            </div>

            <div className="flex gap-2 mb-6">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAutoSearch()}
                placeholder="Andika amazina y'umwana (First or Last Name)..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
              <button
                onClick={handleAutoSearch}
                disabled={searching}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 disabled:opacity-50"
              >
                {searching ? 'Tegereza...' : 'Shakisha'}
              </button>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm text-gray-600">Byabonetse: {searchResults.length} student(s)</p>
                {searchResults.map((student, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-green-500 transition-all">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-lg">{student.first_name} {student.last_name}</p>
                        <p className="text-sm text-gray-600">
                          {student.trade_code} - Level {student.level} | GPA: {student.gpa || 'N/A'}
                        </p>
                      </div>
                      <button
                        onClick={() => handleAutoLink(student)}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                      >
                        Huza (Link)
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {searchResults.length === 0 && searchQuery && !searching && (
              <div className="text-center py-8 text-gray-500">
                <p>Nta mwana wabonetse. Gerageza izindi amazina.</p>
              </div>
            )}
          </div>
        )}

        {/* Manual Connect Form */}
        {linkMode === 'manual' && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Manual Connect - Saba Ubufasha</h2>
              <button
                onClick={() => {
                  setLinkMode('none');
                  setManualForm({ student_name: '', trade: '', level: '', message: '' });
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                ✕ Funga
              </button>
            </div>

            <form onSubmit={handleManualRequest} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amazina y'Umwana (Student Name) *
                </label>
                <input
                  type="text"
                  value={manualForm.student_name}
                  onChange={(e) => setManualForm({ ...manualForm, student_name: e.target.value })}
                  placeholder="Ex: Jean Paul Mugabo"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Umwuga (Trade)
                  </label>
                  <select
                    value={manualForm.trade}
                    onChange={(e) => setManualForm({ ...manualForm, trade: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Hitamo...</option>
                    <option value="SOD">SOD - Software Development</option>
                    <option value="BDC">BDC - Building & Construction</option>
                    <option value="AUTO">AUTO - Automobile Technology</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Umwaka (Level)
                  </label>
                  <select
                    value={manualForm.level}
                    onChange={(e) => setManualForm({ ...manualForm, level: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Hitamo...</option>
                    <option value="1">Level 1</option>
                    <option value="2">Level 2</option>
                    <option value="3">Level 3</option>
                    <option value="4">Level 4</option>
                    <option value="5">Level 5</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ubutumwa (Message - Optional)
                </label>
                <textarea
                  value={manualForm.message}
                  onChange={(e) => setManualForm({ ...manualForm, message: e.target.value })}
                  placeholder="Andika ubutumwa bw'inyongera..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Abakozi bazaguhamagara kugirango bemeze ko ari umwana wawe.
                </p>
              </div>

              <button
                type="submit"
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 font-semibold"
              >
                Ohereza Icyifuzo (Send Request)
              </button>
            </form>
          </div>
        )}

        {/* Linked Children */}
        {children.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Abana Bawe (Your Children)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {children.map((child, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-bold text-lg">{child.first_name} {child.last_name}</h3>
                  <p className="text-sm text-gray-600">{child.trade_code} - Level {child.level}</p>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <p className="text-gray-500">GPA</p>
                      <p className="font-bold">{child.gpa || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Attendance</p>
                      <p className="font-bold">{child.attendance_percentage || '0'}%</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Conduct</p>
                      <p className="font-bold">{child.conduct_score || '40'}/40</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParentDashboardSimple;
