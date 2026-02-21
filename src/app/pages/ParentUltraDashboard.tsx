import React, { useState, useEffect } from 'react';
import { Users, UserPlus, BookOpen, Calendar, Bell, LogOut, Search, Filter, CheckCircle, Clock, XCircle, TrendingUp, Award, MessageSquare, FileText } from 'lucide-react';
import axios from 'axios';

interface ParentUltraDashboardProps {
  onNavigate: (page: string) => void;
}

const ParentUltraDashboard: React.FC<ParentUltraDashboardProps> = ({ onNavigate }) => {
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [linkingStatus, setLinkingStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [linkMessage, setLinkMessage] = useState('');

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

  const searchStudents = async () => {
    if (!searchQuery || searchQuery.length < 2) return;
    
    setSearching(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/parent-registration/search-students',
        { query: searchQuery },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        setSearchResults(response.data.students || []);
      }
    } catch (error) {
      console.error('Error searching students:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleLinkStudent = async () => {
    if (!selectedStudent) return;
    
    setLinkingStatus('submitting');
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/parent-links/auto-link',
        {
          student_first_name: selectedStudent.firstName,
          student_last_name: selectedStudent.lastName,
          trade_code: selectedStudent.trade_code,
          level: selectedStudent.levelNumber,
          relationship_type: 'Parent'
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setLinkingStatus('success');
        setLinkMessage(response.data.message);
        setTimeout(() => {
          setShowLinkModal(false);
          setSelectedStudent(null);
          setSearchQuery('');
          setSearchResults([]);
          setLinkingStatus('idle');
          fetchChildren();
        }, 2000);
      }
    } catch (error: any) {
      setLinkingStatus('error');
      setLinkMessage(error.response?.data?.message || 'Ikibazo cyabaye');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    onNavigate('login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-semibold">Tegereza...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-green-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-yellow-600 rounded-2xl shadow-2xl p-8 mb-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black mb-2">Ikaze! 🎓</h1>
              <p className="text-green-100 text-lg">Parent Ultra Dashboard - Garden TVET School</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all font-semibold"
            >
              <LogOut className="w-5 h-5" />
              Sohoka
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center">
                <Users className="w-7 h-7 text-white" />
              </div>
              <TrendingUp className="w-6 h-6 text-green-500" />
            </div>
            <p className="text-gray-600 text-sm font-medium mb-1">Abana (Children)</p>
            <p className="text-3xl font-black text-gray-900">{children.length}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
                <BookOpen className="w-7 h-7 text-white" />
              </div>
              <Award className="w-6 h-6 text-blue-500" />
            </div>
            <p className="text-gray-600 text-sm font-medium mb-1">Average GPA</p>
            <p className="text-3xl font-black text-gray-900">{stats.avg_gpa?.toFixed(2) || '0.00'}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center">
                <Calendar className="w-7 h-7 text-white" />
              </div>
              <CheckCircle className="w-6 h-6 text-yellow-500" />
            </div>
            <p className="text-gray-600 text-sm font-medium mb-1">Attendance</p>
            <p className="text-3xl font-black text-gray-900">{stats.avg_attendance?.toFixed(0) || '0'}%</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center">
                <Bell className="w-7 h-7 text-white" />
              </div>
              <Award className="w-6 h-6 text-purple-500" />
            </div>
            <p className="text-gray-600 text-sm font-medium mb-1">Conduct Score</p>
            <p className="text-3xl font-black text-gray-900">{stats.avg_conduct?.toFixed(0) || '40'}/40</p>
          </div>
        </div>

        {/* Action Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowLinkModal(true)}
            className="w-full md:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-green-500 to-yellow-500 text-white rounded-2xl hover:from-green-600 hover:to-yellow-600 font-bold text-lg shadow-lg hover:shadow-xl transition-all"
          >
            <UserPlus className="w-6 h-6" />
            Ongeraho Umwana (Link New Child)
          </button>
        </div>

        {/* Children Grid */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-3xl font-black text-gray-900 mb-6 flex items-center gap-3">
            <Users className="w-8 h-8 text-green-600" />
            Abana Bawe (Your Children)
          </h2>
          
          {children.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-12 h-12 text-gray-400" />
              </div>
              <p className="text-gray-500 text-xl font-semibold mb-2">Nta mwana uhuye</p>
              <p className="text-gray-400">Kanda "Ongeraho Umwana" kugirango uhuze n'umwana wawe</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {children.map((child) => (
                <div key={child.id} className="border-2 border-gray-200 rounded-2xl p-6 hover:border-green-400 hover:shadow-xl transition-all bg-gradient-to-br from-white to-gray-50">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-yellow-400 rounded-2xl flex items-center justify-center text-white text-3xl font-black shadow-lg">
                      {child.first_name?.[0]}{child.last_name?.[0]}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-black text-xl text-gray-900">{child.full_name}</h3>
                      <p className="text-sm text-gray-600 font-semibold">{child.student_code}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <span className="text-gray-700 font-medium flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        Trade
                      </span>
                      <span className="font-bold text-blue-700">{child.trade_name}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span className="text-gray-700 font-medium flex items-center gap-2">
                        <Award className="w-4 h-4" />
                        Level
                      </span>
                      <span className="font-bold text-green-700">Level {child.level_number}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <span className="text-gray-700 font-medium">GPA</span>
                      <span className="font-bold text-purple-700">{child.gpa || '0.0'}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <span className="text-gray-700 font-medium">Attendance</span>
                      <span className="font-bold text-yellow-700">{child.attendance_percentage || '0'}%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <span className="text-gray-700 font-medium">Conduct</span>
                      <span className="font-bold text-red-700">{child.conduct_score || '40'}/40</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Link Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-green-600 to-yellow-600 p-6 rounded-t-3xl">
              <h2 className="text-3xl font-black text-white">Shakisha Umwana (Search Student)</h2>
              <p className="text-green-100">Auto-fetch from Global Student Sheets</p>
            </div>

            <div className="p-8">
              {/* Search Bar */}
              <div className="mb-6">
                <div className="flex gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && searchStudents()}
                      placeholder="Andika izina ry'umwana... (Type student name...)"
                      className="w-full pl-12 pr-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
                    />
                  </div>
                  <button
                    onClick={searchStudents}
                    disabled={searching}
                    className="px-8 py-4 bg-gradient-to-r from-green-500 to-yellow-500 text-white rounded-xl hover:from-green-600 hover:to-yellow-600 font-bold disabled:opacity-50"
                  >
                    {searching ? 'Tegereza...' : 'Shakisha'}
                  </button>
                </div>
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-bold mb-4">Ibisubizo (Results): {searchResults.length}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                    {searchResults.map((student) => (
                      <div
                        key={student.id}
                        onClick={() => setSelectedStudent(student)}
                        className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                          selectedStudent?.id === student.id
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-green-300'
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-yellow-400 rounded-lg flex items-center justify-center text-white font-bold">
                            {student.firstName?.[0]}{student.lastName?.[0]}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{student.firstName} {student.lastName}</p>
                            <p className="text-sm text-gray-600">{student.studentId}</p>
                          </div>
                        </div>
                        <div className="text-sm space-y-1">
                          <p><span className="font-semibold">Trade:</span> {student.trade}</p>
                          <p><span className="font-semibold">Level:</span> {student.level}</p>
                          <p><span className="font-semibold">Gender:</span> {student.gender}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Link Status */}
              {linkingStatus !== 'idle' && (
                <div className={`mb-6 p-4 rounded-xl ${
                  linkingStatus === 'success' ? 'bg-green-50 border-2 border-green-500' :
                  linkingStatus === 'error' ? 'bg-red-50 border-2 border-red-500' :
                  'bg-blue-50 border-2 border-blue-500'
                }`}>
                  <p className={`font-semibold ${
                    linkingStatus === 'success' ? 'text-green-700' :
                    linkingStatus === 'error' ? 'text-red-700' :
                    'text-blue-700'
                  }`}>
                    {linkMessage || (linkingStatus === 'submitting' ? 'Tegereza...' : '')}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-4">
                <button
                  onClick={handleLinkStudent}
                  disabled={!selectedStudent || linkingStatus === 'submitting'}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-green-500 to-yellow-500 text-white rounded-xl hover:from-green-600 hover:to-yellow-600 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {linkingStatus === 'submitting' ? 'Tegereza...' : 'Huza Umwana (Link Child)'}
                </button>
                <button
                  onClick={() => {
                    setShowLinkModal(false);
                    setSelectedStudent(null);
                    setSearchQuery('');
                    setSearchResults([]);
                    setLinkingStatus('idle');
                  }}
                  className="px-6 py-4 bg-gray-300 text-gray-700 rounded-xl hover:bg-gray-400 font-bold"
                >
                  Hagarika (Cancel)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParentUltraDashboard;
