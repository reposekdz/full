import React, { useState, useEffect } from 'react';
import {
  School,
  Person,
  Assignment,
  Schedule,
  Assessment,
  BarChart,
  Add,
  Edit,
  Delete,
  Visibility,
  Download,
  Settings,
  Group,
  Class,
  Subject,
  CalendarToday,
  TrendingUp
} from '@mui/icons-material';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

interface Trade {
  id: number;
  trade_code: string;
  trade_name: string;
  level_number: number;
  level_suffix: string;
  full_name: string;
  description: string;
  capacity: number;
}

interface Teacher {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
}

interface Subject {
  id: number;
  name: string;
  code: string;
}

interface TradeClass {
  id: number;
  class_name: string;
  trade_level_id: number;
  capacity: number;
}

const DOSDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [trades, setTrades] = useState<Trade[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [tradeClasses, setTradeClasses] = useState<TradeClass[]>([]);
  const [loading, setLoading] = useState(false);

  const [newTrade, setNewTrade] = useState({
    trade_code: '',
    trade_name: '',
    level_number: 1,
    level_suffix: '',
    description: '',
    duration_years: 1,
    capacity: 30
  });

  const [assignment, setAssignment] = useState({
    teacher_id: '',
    subject_id: '',
    trade_class_id: '',
    trade_level_id: '',
    academic_year_id: '1',
    weekly_periods: 5,
    assignment_type: 'primary',
    assignment_date: new Date().toISOString().split('T')[0]
  });

  const [classTeacherAssignment, setClassTeacherAssignment] = useState({
    teacher_id: '',
    trade_class_id: '',
    academic_year_id: '1',
    assignment_date: new Date().toISOString().split('T')[0],
    responsibilities: ''
  });

  const [timetableGeneration, setTimetableGeneration] = useState({
    trade_class_id: '',
    academic_year_id: '1',
    template_id: null
  });

  const [reportGeneration, setReportGeneration] = useState({
    trade_class_id: '',
    academic_year_id: '1',
    term_id: '1',
    report_type: 'end_term'
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const [tradesRes, teachersRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/dos-enhanced/trades`, config),
        axios.get(`${API_BASE_URL}/dos-enhanced/teachers`, config)
      ]);

      setTrades(tradesRes.data.data || []);
      setTeachers(teachersRes.data.data || []);
    } catch (error) {
      console.error('Error fetching initial data:', error);
    }
  };

  const handleCreateTrade = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE_URL}/dos-enhanced/trades`,
        newTrade,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert('Trade created successfully!');
      fetchInitialData();
      setNewTrade({
        trade_code: '',
        trade_name: '',
        level_number: 1,
        level_suffix: '',
        description: '',
        duration_years: 1,
        capacity: 30
      });
    } catch (error: any) {
      alert(`Error: ${error.response?.data?.message || 'Failed to create trade'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignSubjectTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_BASE_URL}/dos-enhanced/assign-subject-teacher`,
        assignment,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert('Subject teacher assigned successfully!');
      setAssignment({
        teacher_id: '',
        subject_id: '',
        trade_class_id: '',
        trade_level_id: '',
        academic_year_id: '1',
        weekly_periods: 5,
        assignment_type: 'primary',
        assignment_date: new Date().toISOString().split('T')[0]
      });
    } catch (error: any) {
      alert(`Error: ${error.response?.data?.message || 'Failed to assign teacher'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignClassTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_BASE_URL}/dos-enhanced/assign-class-teacher`,
        classTeacherAssignment,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert('Class teacher assigned successfully!');
      setClassTeacherAssignment({
        teacher_id: '',
        trade_class_id: '',
        academic_year_id: '1',
        assignment_date: new Date().toISOString().split('T')[0],
        responsibilities: ''
      });
    } catch (error: any) {
      alert(`Error: ${error.response?.data?.message || 'Failed to assign class teacher'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateTimetable = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE_URL}/dos-enhanced/timetable/generate`,
        timetableGeneration,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert(`Timetable generated successfully! ${response.data.data.entries_created} entries created.`);
    } catch (error: any) {
      alert(`Error: ${error.response?.data?.message || 'Failed to generate timetable'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReports = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE_URL}/dos-enhanced/reports/generate-class`,
        reportGeneration,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert(response.data.message);
    } catch (error: any) {
      alert(`Error: ${error.response?.data?.message || 'Failed to generate reports'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-indigo-600 rounded-lg">
                <School className="text-white text-3xl" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">DOS Dashboard</h1>
                <p className="text-gray-600">Director of Studies Management Portal</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                <Download />
                <span>Export Reports</span>
              </button>
              <button className="p-2 bg-gray-200 rounded-lg hover:bg-gray-300">
                <Settings />
              </button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Trades</p>
                <p className="text-3xl font-bold text-indigo-600">{trades.length}</p>
              </div>
              <School className="text-indigo-600 text-4xl" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Teachers</p>
                <p className="text-3xl font-bold text-green-600">{teachers.length}</p>
              </div>
              <Person className="text-green-600 text-4xl" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Active Classes</p>
                <p className="text-3xl font-bold text-orange-600">{tradeClasses.length}</p>
              </div>
              <Class className="text-orange-600 text-4xl" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Performance</p>
                <p className="text-3xl font-bold text-purple-600">98%</p>
              </div>
              <TrendingUp className="text-purple-600 text-4xl" />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-lg mb-6">
          <div className="flex border-b overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: <BarChart /> },
              { id: 'trades', label: 'Manage Trades', icon: <School /> },
              { id: 'assignments', label: 'Teacher Assignments', icon: <Assignment /> },
              { id: 'timetable', label: 'Timetable', icon: <Schedule /> },
              { id: 'reports', label: 'Student Reports', icon: <Assessment /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-4 font-semibold transition-colors ${
                  activeTab === tab.id
                    ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50'
                    : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <div>
                <h2 className="text-2xl font-bold mb-4">System Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg p-6 text-white">
                    <h3 className="text-xl font-bold mb-2">Quick Actions</h3>
                    <ul className="space-y-2">
                      <li>✓ Manage trades and levels</li>
                      <li>✓ Assign teachers to classes</li>
                      <li>✓ Generate timetables automatically</li>
                      <li>✓ Generate comprehensive reports</li>
                    </ul>
                  </div>
                  
                  <div className="bg-gradient-to-r from-green-500 to-teal-600 rounded-lg p-6 text-white">
                    <h3 className="text-xl font-bold mb-2">Features</h3>
                    <ul className="space-y-2">
                      <li>✓ Automated report generation</li>
                      <li>✓ Student ranking system</li>
                      <li>✓ Multi-source marks aggregation</li>
                      <li>✓ Teacher workload tracking</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'trades' && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Manage Trades</h2>
                
                {/* Create New Trade Form */}
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <h3 className="text-xl font-semibold mb-4">Create New Trade</h3>
                  <form onSubmit={handleCreateTrade} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Trade Code (e.g., SOD)"
                      value={newTrade.trade_code}
                      onChange={(e) => setNewTrade({ ...newTrade, trade_code: e.target.value })}
                      className="px-4 py-2 border rounded-lg"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Trade Name"
                      value={newTrade.trade_name}
                      onChange={(e) => setNewTrade({ ...newTrade, trade_name: e.target.value })}
                      className="px-4 py-2 border rounded-lg"
                      required
                    />
                    <input
                      type="number"
                      placeholder="Level Number"
                      value={newTrade.level_number}
                      onChange={(e) => setNewTrade({ ...newTrade, level_number: parseInt(e.target.value) })}
                      className="px-4 py-2 border rounded-lg"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Level Suffix (optional)"
                      value={newTrade.level_suffix}
                      onChange={(e) => setNewTrade({ ...newTrade, level_suffix: e.target.value })}
                      className="px-4 py-2 border rounded-lg"
                    />
                    <input
                      type="number"
                      placeholder="Capacity"
                      value={newTrade.capacity}
                      onChange={(e) => setNewTrade({ ...newTrade, capacity: parseInt(e.target.value) })}
                      className="px-4 py-2 border rounded-lg"
                    />
                    <input
                      type="number"
                      placeholder="Duration (years)"
                      value={newTrade.duration_years}
                      onChange={(e) => setNewTrade({ ...newTrade, duration_years: parseInt(e.target.value) })}
                      className="px-4 py-2 border rounded-lg"
                    />
                    <textarea
                      placeholder="Description"
                      value={newTrade.description}
                      onChange={(e) => setNewTrade({ ...newTrade, description: e.target.value })}
                      className="px-4 py-2 border rounded-lg md:col-span-2"
                      rows={3}
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      className="md:col-span-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400"
                    >
                      {loading ? 'Creating...' : 'Create Trade'}
                    </button>
                  </form>
                </div>

                {/* Trades List */}
                <div className="bg-white rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacity</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {trades.map((trade) => (
                        <tr key={trade.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{trade.trade_code}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{trade.full_name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{trade.capacity}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                            <button className="text-blue-600 hover:text-blue-900"><Edit /></button>
                            <button className="text-red-600 hover:text-red-900"><Delete /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'assignments' && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Teacher Assignments</h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Assign Subject Teacher */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-xl font-semibold mb-4">Assign Subject Teacher</h3>
                    <form onSubmit={handleAssignSubjectTeacher} className="space-y-4">
                      <select
                        value={assignment.teacher_id}
                        onChange={(e) => setAssignment({ ...assignment, teacher_id: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg"
                        required
                      >
                        <option value="">Select Teacher</option>
                        {teachers.map((teacher) => (
                          <option key={teacher.id} value={teacher.id}>
                            {teacher.first_name} {teacher.last_name}
                          </option>
                        ))}
                      </select>
                      
                      <input
                        type="number"
                        placeholder="Weekly Periods"
                        value={assignment.weekly_periods}
                        onChange={(e) => setAssignment({ ...assignment, weekly_periods: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 border rounded-lg"
                        required
                      />
                      
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700"
                      >
                        {loading ? 'Assigning...' : 'Assign Teacher'}
                      </button>
                    </form>
                  </div>

                  {/* Assign Class Teacher */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-xl font-semibold mb-4">Assign Class Teacher</h3>
                    <form onSubmit={handleAssignClassTeacher} className="space-y-4">
                      <select
                        value={classTeacherAssignment.teacher_id}
                        onChange={(e) => setClassTeacherAssignment({ ...classTeacherAssignment, teacher_id: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg"
                        required
                      >
                        <option value="">Select Teacher</option>
                        {teachers.map((teacher) => (
                          <option key={teacher.id} value={teacher.id}>
                            {teacher.first_name} {teacher.last_name}
                          </option>
                        ))}
                      </select>
                      
                      <textarea
                        placeholder="Responsibilities"
                        value={classTeacherAssignment.responsibilities}
                        onChange={(e) => setClassTeacherAssignment({ ...classTeacherAssignment, responsibilities: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg"
                        rows={3}
                      />
                      
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
                      >
                        {loading ? 'Assigning...' : 'Assign Class Teacher'}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'timetable' && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Timetable Generation</h2>
                
                <div className="bg-gray-50 rounded-lg p-6 max-w-2xl">
                  <h3 className="text-xl font-semibold mb-4">Auto-Generate Timetable</h3>
                  <form onSubmit={handleGenerateTimetable} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Class
                      </label>
                      <select
                        value={timetableGeneration.trade_class_id}
                        onChange={(e) => setTimetableGeneration({ ...timetableGeneration, trade_class_id: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg"
                        required
                      >
                        <option value="">Select Trade Class</option>
                        {/* Classes would be loaded here */}
                      </select>
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-800">
                        <strong>Note:</strong> The system will automatically generate a timetable based on:
                      </p>
                      <ul className="mt-2 space-y-1 text-sm text-blue-700">
                        <li>✓ Teacher-subject assignments</li>
                        <li>✓ Weekly period allocations</li>
                        <li>✓ Conflict detection (teacher/room/class)</li>
                        <li>✓ Break periods configuration</li>
                      </ul>
                    </div>
                    
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400"
                    >
                      {loading ? 'Generating...' : 'Generate Timetable'}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {activeTab === 'reports' && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Student Reports Generation</h2>
                
                <div className="bg-gray-50 rounded-lg p-6 max-w-2xl">
                  <h3 className="text-xl font-semibold mb-4">Generate Class Reports</h3>
                  <form onSubmit={handleGenerateReports} className="space-y-4">
                    <select
                      value={reportGeneration.report_type}
                      onChange={(e) => setReportGeneration({ ...reportGeneration, report_type: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                      required
                    >
                      <option value="mid_term">Mid-Term Report</option>
                      <option value="end_term">End-Term Report</option>
                      <option value="annual">Annual Report</option>
                      <option value="progress">Progress Report</option>
                    </select>
                    
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-sm text-green-800">
                        <strong>Report Features:</strong>
                      </p>
                      <ul className="mt-2 space-y-1 text-sm text-green-700">
                        <li>✓ Automatic marks aggregation from quizzes, assignments, exams</li>
                        <li>✓ Student ranking (class and level)</li>
                        <li>✓ Subject-wise performance breakdown</li>
                        <li>✓ Attendance tracking</li>
                        <li>✓ Grading and comments</li>
                      </ul>
                    </div>
                    
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400"
                    >
                      {loading ? 'Generating Reports...' : 'Generate All Student Reports'}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DOSDashboard;
