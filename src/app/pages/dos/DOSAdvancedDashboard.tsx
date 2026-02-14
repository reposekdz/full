import React, { useState, useEffect } from 'react';
import { 
  Users, BookOpen, Calendar, FileText, Send, TrendingUp, 
  Plus, Search, Filter, Download, RefreshCw, CheckCircle,
  AlertCircle, Clock, Award, Target, BarChart3, PieChart
} from 'lucide-react';
import axios from 'axios';

const DOSAdvancedDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [selectedTrade, setSelectedTrade] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [academicYear, setAcademicYear] = useState('2025');
  const [term, setTerm] = useState('Term 1');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');

  const trades = [
    { code: 'AUT', name: 'Automotive', levels: [4, 5] },
    { code: 'BDC', name: 'Building & Construction', levels: [3, 4, 5] },
    { code: 'SOD', name: 'Software Development', levels: [3, 4, 5] }
  ];

  useEffect(() => {
    fetchDashboardStats();
  }, [academicYear]);

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get(`http://localhost:5000/api/dos-advanced/dashboard/stats?academic_year=${academicYear}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    if (!selectedTrade || !selectedLevel) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get(
        `http://localhost:5000/api/dos-advanced/subjects/trade/${selectedTrade}/level/${selectedLevel}?academic_year=${academicYear}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSubjects(data.subjects);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get('http://localhost:5000/api/dos-advanced/teachers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTeachers(data.teachers);
    } catch (error) {
      console.error('Error fetching teachers:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateTimetable = async () => {
    if (!selectedTrade || !selectedLevel) {
      alert('Please select trade and level');
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.post(
        'http://localhost:5000/api/dos-advanced/timetable/generate',
        { trade_code: selectedTrade, level_number: selectedLevel, academic_year: academicYear, term },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`✓ Timetable generated! ${data.slots_created} slots created`);
      fetchDashboardStats();
    } catch (error) {
      alert('Error generating timetable: ' + error.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, color, trend }) => (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border-l-4" style={{ borderColor: color }}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg bg-opacity-10`} style={{ backgroundColor: color }}>
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
        {trend && (
          <div className="flex items-center text-green-600 text-sm font-semibold">
            <TrendingUp className="w-4 h-4 mr-1" />
            {trend}
          </div>
        )}
      </div>
      <h3 className="text-gray-600 text-sm font-medium mb-1">{title}</h3>
      <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
      {subtitle && <p className="text-gray-500 text-xs">{subtitle}</p>}
    </div>
  );

  const OverviewTab = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Users}
          title="Total Students"
          value={stats?.students?.total || 0}
          subtitle={`${stats?.students?.active || 0} active`}
          color="#3B82F6"
          trend="+12%"
        />
        <StatCard
          icon={BookOpen}
          title="Total Subjects"
          value={stats?.subjects?.total || 0}
          subtitle={`${stats?.subjects?.general || 0} general, ${stats?.subjects?.trade_specific || 0} trade`}
          color="#10B981"
        />
        <StatCard
          icon={Users}
          title="Total Teachers"
          value={stats?.teachers?.total_teachers || 0}
          subtitle={`${stats?.teachers?.total_assignments || 0} assignments`}
          color="#F59E0B"
        />
        <StatCard
          icon={Calendar}
          title="Active Timetables"
          value={stats?.trades?.length || 0}
          subtitle="All trades covered"
          color="#8B5CF6"
        />
      </div>

      {/* Trade Statistics */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Trade Overview</h2>
          <button onClick={fetchDashboardStats} className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats?.trades?.map((trade, idx) => (
            <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:border-blue-400 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-gray-900">{trade.trade_code} Level {trade.level_number}</h3>
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-semibold">Active</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Students:</span>
                  <span className="font-semibold text-gray-900">{trade.student_count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Subjects:</span>
                  <span className="font-semibold text-gray-900">{trade.subject_count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Teachers:</span>
                  <span className="font-semibold text-gray-900">{trade.teacher_count}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg p-6 text-white">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button onClick={() => { setActiveTab('subjects'); fetchSubjects(); }} className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-4 transition-all">
            <BookOpen className="w-6 h-6 mb-2 mx-auto" />
            <span className="text-sm font-medium">Manage Subjects</span>
          </button>
          <button onClick={() => { setActiveTab('teachers'); fetchTeachers(); }} className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-4 transition-all">
            <Users className="w-6 h-6 mb-2 mx-auto" />
            <span className="text-sm font-medium">Assign Teachers</span>
          </button>
          <button onClick={() => setActiveTab('timetables')} className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-4 transition-all">
            <Calendar className="w-6 h-6 mb-2 mx-auto" />
            <span className="text-sm font-medium">Timetables</span>
          </button>
          <button onClick={() => setActiveTab('analytics')} className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-4 transition-all">
            <BarChart3 className="w-6 h-6 mb-2 mx-auto" />
            <span className="text-sm font-medium">Analytics</span>
          </button>
        </div>
      </div>
    </div>
  );

  const SubjectsTab = () => {
    useEffect(() => {
      if (selectedTrade && selectedLevel) fetchSubjects();
    }, [selectedTrade, selectedLevel]);

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Trade</label>
              <select value={selectedTrade} onChange={(e) => setSelectedTrade(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                <option value="">Select Trade</option>
                {trades.map(t => <option key={t.code} value={t.code}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
              <select value={selectedLevel} onChange={(e) => setSelectedLevel(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" disabled={!selectedTrade}>
                <option value="">Select Level</option>
                {selectedTrade && trades.find(t => t.code === selectedTrade)?.levels.map(l => <option key={l} value={l}>Level {l}</option>)}
              </select>
            </div>
            <div className="flex items-end">
              <button onClick={() => { setModalType('add-subject'); setShowModal(true); }} className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                <Plus className="w-5 h-5" />
                Add Subject
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Credits</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teachers</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {subjects.map((subject, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{subject.subject_code}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{subject.subject_name}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${subject.subject_type === 'general_studies' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                          {subject.subject_type === 'general_studies' ? 'General' : 'Trade'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{subject.credit_hours}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{subject.assigned_teachers || 0}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${subject.is_mandatory ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                          {subject.is_mandatory ? 'Mandatory' : 'Elective'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button className="text-blue-600 hover:text-blue-800 font-medium">Assign Teacher</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  const TeachersTab = () => {
    useEffect(() => {
      fetchTeachers();
    }, []);

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Teacher Management</h2>
            <button onClick={fetchTeachers} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teachers.map((teacher, idx) => (
              <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{teacher.name}</h3>
                    <p className="text-sm text-gray-600">{teacher.email}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-medium">{teacher.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subjects:</span>
                    <span className="font-medium">{teacher.assigned_subjects}</span>
                  </div>
                </div>
                <button className="w-full px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium">
                  Assign Subjects
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const TimetablesTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Generate Timetable</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <select value={selectedTrade} onChange={(e) => setSelectedTrade(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg">
            <option value="">Select Trade</option>
            {trades.map(t => <option key={t.code} value={t.code}>{t.name}</option>)}
          </select>
          <select value={selectedLevel} onChange={(e) => setSelectedLevel(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg" disabled={!selectedTrade}>
            <option value="">Select Level</option>
            {selectedTrade && trades.find(t => t.code === selectedTrade)?.levels.map(l => <option key={l} value={l}>Level {l}</option>)}
          </select>
          <select value={term} onChange={(e) => setTerm(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg">
            <option value="Term 1">Term 1</option>
            <option value="Term 2">Term 2</option>
            <option value="Term 3">Term 3</option>
          </select>
          <button onClick={generateTimetable} disabled={loading || !selectedTrade || !selectedLevel} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4" />}
            Generate
          </button>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">12-Period Timetable</h3>
              <p className="text-sm text-blue-700">Generates 60 weekly slots (12 periods × 5 days) from 7:30 AM to 5:00 PM with breaks</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">DOS Management System</h1>
        <p className="text-gray-600">Comprehensive academic management and reporting</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg mb-6 overflow-hidden">
        <div className="flex overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', icon: Target },
            { id: 'subjects', label: 'Subjects', icon: BookOpen },
            { id: 'teachers', label: 'Teacher Assignments', icon: Users },
            { id: 'timetables', label: 'Timetables', icon: Calendar },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'subjects' && <SubjectsTab />}
        {activeTab === 'teachers' && <TeachersTab />}
        {activeTab === 'timetables' && <TimetablesTab />}
        {activeTab === 'analytics' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Analytics Dashboard</h2>
            <p className="text-gray-600">Comprehensive analytics and reports coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DOSAdvancedDashboard;Level) fetchSubjects();
    }, [selectedTrade, selectedLevel]);

    return (
      <div className="space-y-6">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Trade</label>
              <select value={selectedTrade} onChange={(e) => setSelectedTrade(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                <option value="">Select Trade</option>
                {trades.map(t => <option key={t.code} value={t.code}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
              <select value={selectedLevel} onChange={(e) => setSelectedLevel(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" disabled={!selectedTrade}>
                <option value="">Select Level</option>
                {selectedTrade && trades.find(t => t.code === selectedTrade)?.levels.map(l => <option key={l} value={l}>Level {l}</option>)}
              </select>
            </div>
            <div className="flex items-end">
              <button onClick={() => { setModalType('add-subject'); setShowModal(true); }} className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                <Plus className="w-5 h-5" />
                Add Subject
              </button>
            </div>
          </div>
        </div>

        {/* Subjects List */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Credits</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teachers</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {subjects.map((subject, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{subject.subject_code}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{subject.subject_name}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${subject.subject_type === 'general_studies' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                          {subject.subject_type === 'general_studies' ? 'General' : 'Trade'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{subject.credit_hours}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{subject.assigned_teachers || 0}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${subject.is_mandatory ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                          {subject.is_mandatory ? 'Mandatory' : 'Elective'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button className="text-blue-600 hover:text-blue-800 font-medium">Assign Teacher</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  const TeachersTab = () => {
    useEffect(() => {
      fetchTeachers();
    }, []);

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Teacher Management</h2>
            <button onClick={fetchTeachers} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teachers.map((teacher, idx) => (
              <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{teacher.name}</h3>
                    <p className="text-sm text-gray-600">{teacher.email}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-medium">{teacher.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subjects:</span>
                    <span className="font-medium">{teacher.assigned_subjects}</span>
                  </div>
                </div>
                <button className="w-full px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium">
                  Assign Subjects
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const TimetablesTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Generate Timetable</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <select value={selectedTrade} onChange={(e) => setSelectedTrade(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg">
            <option value="">Select Trade</option>
            {trades.map(t => <option key={t.code} value={t.code}>{t.name}</option>)}
          </select>
          <select value={selectedLevel} onChange={(e) => setSelectedLevel(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg" disabled={!selectedTrade}>
            <option value="">Select Level</option>
            {selectedTrade && trades.find(t => t.code === selectedTrade)?.levels.map(l => <option key={l} value={l}>Level {l}</option>)}
          </select>
          <select value={term} onChange={(e) => setTerm(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg">
            <option value="Term 1">Term 1</option>
            <option value="Term 2">Term 2</option>
            <option value="Term 3">Term 3</option>
          </select>
          <button onClick={generateTimetable} disabled={loading || !selectedTrade || !selectedLevel} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4" />}
            Generate
          </button>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">12-Period Timetable</h3>
              <p className="text-sm text-blue-700">Generates 60 weekly slots (12 periods × 5 days) from 7:30 AM to 5:00 PM with breaks</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">DOS Management System</h1>
        <p className="text-gray-600">Comprehensive academic management and reporting</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-lg mb-6 overflow-hidden">
        <div className="flex overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', icon: Target },
            { id: 'subjects', label: 'Subjects', icon: BookOpen },
            { id: 'teachers', label: 'Teacher Assignments', icon: Users },
            { id: 'timetables', label: 'Timetables', icon: Calendar },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div>
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'subjects' && <SubjectsTab />}
        {activeTab === 'teachers' && <TeachersTab />}
        {activeTab === 'timetables' && <TimetablesTab />}
        {activeTab === 'analytics' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Analytics Dashboard</h2>
            <p className="text-gray-600">Comprehensive analytics and reports coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DOSAdvancedDashboard;
