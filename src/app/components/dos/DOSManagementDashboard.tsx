import React, { useState, useEffect } from 'react';
import { Calendar, Users, BookOpen, FileText, Download, Send, BarChart3, Clock, CheckCircle, AlertCircle, Plus, Search, Filter, Eye, Trash2, Edit } from 'lucide-react';
import apiService from '@/app/services/apiService';

const DOSManagementDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [trades, setTrades] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [tradesRes, teachersRes] = await Promise.all([
        apiService.getTradesWithLevels(),
        apiService.getTeachers()
      ]);
      if (tradesRes.success) setTrades(tradesRes.trades || []);
      if (teachersRes.success) setTeachers(teachersRes.teachers || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const loadAnalytics = async () => {
    if (!selectedTrade || !selectedLevel) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/dos-management/analytics/comprehensive?trade_code=${selectedTrade}&level_number=${selectedLevel}&academic_year=2024`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (data.success) setAnalytics(data.analytics);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-indigo-600" />
            DOS Management System
          </h1>
          <p className="text-gray-600 mt-2">Comprehensive academic management and reporting</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-xl mb-6 overflow-hidden">
          <div className="flex overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'teachers', label: 'Teacher Assignments', icon: Users },
              { id: 'timetable', label: 'Timetables', icon: Calendar },
              { id: 'reports', label: 'Report Cards', icon: FileText },
              { id: 'sms', label: 'SMS Notifications', icon: Send },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {activeTab === 'overview' && <OverviewTab trades={trades} />}
          {activeTab === 'teachers' && <TeacherAssignmentsTab trades={trades} teachers={teachers} />}
          {activeTab === 'timetable' && <TimetableTab trades={trades} />}
          {activeTab === 'reports' && <ReportCardsTab trades={trades} />}
          {activeTab === 'sms' && <SMSTab />}
          {activeTab === 'analytics' && <AnalyticsTab trades={trades} analytics={analytics} onLoad={loadAnalytics} />}
        </div>
      </div>
    </div>
  );
};

// Overview Tab
const OverviewTab = ({ trades }) => {
  const [stats, setStats] = useState({ totalStudents: 0, totalTeachers: 0, activeTimetables: 0, reportsGenerated: 0 });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const res = await fetch('/api/global-sheets/analytics', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (data.success) {
        setStats({
          totalStudents: data.analytics.total || 0,
          totalTeachers: 0,
          activeTimetables: 0,
          reportsGenerated: 0
        });
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[
        { label: 'Total Students', value: stats.totalStudents, icon: Users, color: 'blue' },
        { label: 'Total Teachers', value: stats.totalTeachers, icon: Users, color: 'green' },
        { label: 'Active Timetables', value: stats.activeTimetables, icon: Calendar, color: 'purple' },
        { label: 'Reports Generated', value: stats.reportsGenerated, icon: FileText, color: 'orange' }
      ].map((stat, idx) => (
        <div key={idx} className="bg-white rounded-xl shadow-lg p-6">
          <div className={`w-12 h-12 bg-${stat.color}-100 rounded-lg flex items-center justify-center mb-4`}>
            <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
          <p className="text-gray-600">{stat.label}</p>
        </div>
      ))}
    </div>
  );
};

// Teacher Assignments Tab
const TeacherAssignmentsTab = ({ trades, teachers }) => {
  const [selectedTrade, setSelectedTrade] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [assignments, setAssignments] = useState([]);

  const assignTeacher = async () => {
    if (!selectedTeacher || !selectedSubject || !selectedTrade || !selectedLevel) {
      alert('Please fill all fields');
      return;
    }

    try {
      const teacher = teachers.find(t => t.id === parseInt(selectedTeacher));
      const res = await fetch('/api/dos-management/assign-teacher-course', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          teacher_id: teacher.id,
          teacher_name: `${teacher.first_name} ${teacher.last_name}`,
          subject_code: selectedSubject,
          subject_name: selectedSubject,
          trade_code: selectedTrade,
          level_number: parseInt(selectedLevel),
          academic_year: '2024'
        })
      });
      const data = await res.json();
      if (data.success) {
        alert('Teacher assigned successfully!');
        loadAssignments();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const loadAssignments = async () => {
    if (!selectedTrade || !selectedLevel) return;
    try {
      const res = await fetch(`/api/dos-management/class-assignments/${selectedTrade}/${selectedLevel}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (data.success) setAssignments(data.courses || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    loadAssignments();
  }, [selectedTrade, selectedLevel]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4">Assign Teacher to Course</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <select value={selectedTrade} onChange={(e) => setSelectedTrade(e.target.value)} className="px-4 py-2 border rounded-lg">
            <option value="">Select Trade</option>
            {trades.map(t => <option key={t.code} value={t.code}>{t.name}</option>)}
          </select>
          <select value={selectedLevel} onChange={(e) => setSelectedLevel(e.target.value)} className="px-4 py-2 border rounded-lg">
            <option value="">Select Level</option>
            {selectedTrade && trades.find(t => t.code === selectedTrade)?.levels?.map(l => (
              <option key={l.level_number} value={l.level_number}>Level {l.level_number}</option>
            ))}
          </select>
          <select value={selectedTeacher} onChange={(e) => setSelectedTeacher(e.target.value)} className="px-4 py-2 border rounded-lg">
            <option value="">Select Teacher</option>
            {teachers.map(t => <option key={t.id} value={t.id}>{t.first_name} {t.last_name}</option>)}
          </select>
          <input
            type="text"
            placeholder="Subject Code"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          />
          <button onClick={assignTeacher} className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2">
            <Plus className="w-5 h-5" />
            Assign
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4">Current Assignments</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">Teacher</th>
                <th className="px-4 py-3 text-left">Subject</th>
                <th className="px-4 py-3 text-left">Trade</th>
                <th className="px-4 py-3 text-left">Level</th>
                <th className="px-4 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((a, idx) => (
                <tr key={idx} className="border-t">
                  <td className="px-4 py-3">{a.teacher_name}</td>
                  <td className="px-4 py-3">{a.subject_name}</td>
                  <td className="px-4 py-3">{a.trade_code}</td>
                  <td className="px-4 py-3">Level {a.level_number}</td>
                  <td className="px-4 py-3">
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">Active</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Timetable Tab
const TimetableTab = ({ trades }) => {
  const [selectedTrade, setSelectedTrade] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [timetables, setTimetables] = useState([]);
  const [viewTimetable, setViewTimetable] = useState(null);

  const generateTimetable = async () => {
    if (!selectedTrade || !selectedLevel) {
      alert('Please select trade and level');
      return;
    }

    try {
      const res = await fetch('/api/dos-management/timetables/auto-generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          trade_code: selectedTrade,
          level_number: parseInt(selectedLevel),
          academic_year: '2024',
          term: 'Term 1'
        })
      });
      const data = await res.json();
      if (data.success) {
        alert(`Timetable generated! ${data.total_slots} slots created`);
        loadTimetables();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const loadTimetables = async () => {
    if (!selectedTrade || !selectedLevel) return;
    try {
      const res = await fetch(`/api/dos-management/timetables/class/${selectedTrade}/${selectedLevel}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (data.success) setTimetables(data.timetables || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const viewTimetableDetails = async (id) => {
    try {
      const res = await fetch(`/api/dos-management/timetables/${id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (data.success) setViewTimetable(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    loadTimetables();
  }, [selectedTrade, selectedLevel]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Clock className="w-6 h-6 text-indigo-600" />
          Generate Timetable (12 Periods: 7:30-17:00)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select value={selectedTrade} onChange={(e) => setSelectedTrade(e.target.value)} className="px-4 py-2 border rounded-lg">
            <option value="">Select Trade</option>
            {trades.map(t => <option key={t.code} value={t.code}>{t.name}</option>)}
          </select>
          <select value={selectedLevel} onChange={(e) => setSelectedLevel(e.target.value)} className="px-4 py-2 border rounded-lg">
            <option value="">Select Level</option>
            {selectedTrade && trades.find(t => t.code === selectedTrade)?.levels?.map(l => (
              <option key={l.level_number} value={l.level_number}>Level {l.level_number}</option>
            ))}
          </select>
          <button onClick={generateTimetable} className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2">
            <Calendar className="w-5 h-5" />
            Generate Timetable
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4">Timetables</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {timetables.map(tt => (
            <div key={tt.id} className="border rounded-lg p-4 hover:shadow-lg transition">
              <h3 className="font-bold text-lg">{tt.timetable_name}</h3>
              <p className="text-gray-600 text-sm">{tt.term} - {tt.academic_year}</p>
              <div className="mt-4 flex gap-2">
                <button onClick={() => viewTimetableDetails(tt.id)} className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2">
                  <Eye className="w-4 h-4" />
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {viewTimetable && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">{viewTimetable.timetable.timetable_name}</h2>
              <button onClick={() => setViewTimetable(null)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border">
                <thead className="bg-indigo-600 text-white">
                  <tr>
                    <th className="border px-4 py-2">Period</th>
                    <th className="border px-4 py-2">Time</th>
                    <th className="border px-4 py-2">Monday</th>
                    <th className="border px-4 py-2">Tuesday</th>
                    <th className="border px-4 py-2">Wednesday</th>
                    <th className="border px-4 py-2">Thursday</th>
                    <th className="border px-4 py-2">Friday</th>
                  </tr>
                </thead>
                <tbody>
                  {[1,2,3,4,5,6,7,8,9,10,11,12].map(period => {
                    const periodSlots = viewTimetable.slots.filter(s => s.period_number === period);
                    const timeSlot = periodSlots[0];
                    return (
                      <tr key={period}>
                        <td className="border px-4 py-2 font-bold text-center">{period}</td>
                        <td className="border px-4 py-2 text-sm text-center">{timeSlot?.start_time}-{timeSlot?.end_time}</td>
                        {['Monday','Tuesday','Wednesday','Thursday','Friday'].map(day => {
                          const slot = periodSlots.find(s => s.day_of_week === day);
                          return (
                            <td key={day} className="border px-4 py-2">
                              {slot ? (
                                <div className="text-sm">
                                  <div className="font-bold">{slot.subject_name}</div>
                                  <div className="text-gray-600">{slot.teacher_name}</div>
                                </div>
                              ) : '-'}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Report Cards Tab with Auto-Generation
const ReportCardsTab = ({ trades }) => {
  const [selectedTrade, setSelectedTrade] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [term, setTerm] = useState('Term 1');
  const [generating, setGenerating] = useState(false);
  const [reports, setReports] = useState([]);
  const [viewReport, setViewReport] = useState(null);

  const autoGenerateReports = async () => {
    if (!selectedTrade || !selectedLevel) {
      alert('Please select trade and level');
      return;
    }

    setGenerating(true);
    try {
      const res = await fetch('/api/dos-management/report-cards/auto-generate-class', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          trade_code: selectedTrade,
          level_number: parseInt(selectedLevel),
          term,
          academic_year: '2024'
        })
      });
      const data = await res.json();
      if (data.success) {
        alert(`✅ Reports generated!\n\nProcessed: ${data.processed}\nFailed: ${data.failed}\nAverage GPA: ${data.stats.avg_gpa}`);
        loadReports();
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to generate reports');
    } finally {
      setGenerating(false);
    }
  };

  const loadReports = async () => {
    if (!selectedTrade || !selectedLevel) return;
    try {
      const res = await fetch(`/api/dos-management/report-cards/class/${selectedTrade}/${selectedLevel}?term=${term}&academic_year=2024`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (data.success) setReports(data.reports || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const downloadPDF = async (studentId) => {
    try {
      const res = await fetch(`/api/dos-management/report-cards/${studentId}/pdf?term=${term}&academic_year=2024`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report_${studentId}_${term}.pdf`;
      a.click();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const sendSMSToParents = async () => {
    if (!selectedTrade || !selectedLevel) return;
    try {
      const res = await fetch('/api/dos-management/report-cards/send-sms-bulk', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          trade_code: selectedTrade,
          level_number: parseInt(selectedLevel),
          term,
          academic_year: '2024'
        })
      });
      const data = await res.json();
      if (data.success) {
        alert(`SMS sent to ${data.sent} parents!`);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    loadReports();
  }, [selectedTrade, selectedLevel, term]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <FileText className="w-6 h-6 text-green-600" />
          Auto-Generate Report Cards
        </h2>
        <p className="text-gray-600 mb-4">Automatically calculates marks from all teachers and generates comprehensive reports</p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select value={selectedTrade} onChange={(e) => setSelectedTrade(e.target.value)} className="px-4 py-2 border rounded-lg">
            <option value="">Select Trade</option>
            {trades.map(t => <option key={t.code} value={t.code}>{t.name}</option>)}
          </select>
          <select value={selectedLevel} onChange={(e) => setSelectedLevel(e.target.value)} className="px-4 py-2 border rounded-lg">
            <option value="">Select Level</option>
            {selectedTrade && trades.find(t => t.code === selectedTrade)?.levels?.map(l => (
              <option key={l.level_number} value={l.level_number}>Level {l.level_number}</option>
            ))}
          </select>
          <select value={term} onChange={(e) => setTerm(e.target.value)} className="px-4 py-2 border rounded-lg">
            <option value="Term 1">Term 1</option>
            <option value="Term 2">Term 2</option>
            <option value="Term 3">Term 3</option>
          </select>
          <button 
            onClick={autoGenerateReports} 
            disabled={generating}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {generating ? (
              <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> Generating...</>
            ) : (
              <><CheckCircle className="w-5 h-5" /> Auto-Generate</>  
            )}
          </button>
        </div>
        <div className="mt-4 flex gap-4">
          <button onClick={sendSMSToParents} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <Send className="w-5 h-5" />
            Send SMS to All Parents
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4">Generated Reports ({reports.length})</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">Rank</th>
                <th className="px-4 py-3 text-left">Student</th>
                <th className="px-4 py-3 text-left">Code</th>
                <th className="px-4 py-3 text-left">Subjects</th>
                <th className="px-4 py-3 text-left">Total</th>
                <th className="px-4 py-3 text-left">Average</th>
                <th className="px-4 py-3 text-left">GPA</th>
                <th className="px-4 py-3 text-left">Grade</th>
                <th className="px-4 py-3 text-left">Attendance</th>
                <th className="px-4 py-3 text-left">Conduct</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r, idx) => (
                <tr key={idx} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 font-bold">{r.class_rank}/{r.total_students}</td>
                  <td className="px-4 py-3">{r.student_name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{r.student_code}</td>
                  <td className="px-4 py-3">{r.total_subjects}</td>
                  <td className="px-4 py-3">{r.total_marks?.toFixed(1)}</td>
                  <td className="px-4 py-3">{r.average_marks?.toFixed(1)}</td>
                  <td className="px-4 py-3 font-bold">{r.gpa?.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                      r.overall_grade === 'A' ? 'bg-green-100 text-green-700' :
                      r.overall_grade === 'B' ? 'bg-blue-100 text-blue-700' :
                      r.overall_grade === 'C' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>{r.overall_grade}</span>
                  </td>
                  <td className="px-4 py-3">{r.attendance_rate?.toFixed(1)}%</td>
                  <td className="px-4 py-3">{r.conduct_score?.toFixed(0)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => setViewReport(r)} className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button onClick={() => downloadPDF(r.student_id)} className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {viewReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Report Card - {viewReport.student_name}</h2>
              <button onClick={() => setViewReport(null)} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><span className="font-bold">Student Code:</span> {viewReport.student_code}</div>
                <div><span className="font-bold">Trade:</span> {viewReport.trade_code} Level {viewReport.level_number}</div>
                <div><span className="font-bold">Term:</span> {viewReport.term}</div>
                <div><span className="font-bold">Academic Year:</span> {viewReport.academic_year}</div>
              </div>
              <div className="border-t pt-4">
                <h3 className="font-bold text-lg mb-2">Academic Performance</h3>
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600">Total Subjects</div>
                    <div className="text-2xl font-bold">{viewReport.total_subjects}</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600">Average Marks</div>
                    <div className="text-2xl font-bold">{viewReport.average_marks?.toFixed(1)}</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600">GPA</div>
                    <div className="text-2xl font-bold">{viewReport.gpa?.toFixed(2)}</div>
                  </div>
                  <div className="bg-indigo-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600">Grade</div>
                    <div className="text-2xl font-bold">{viewReport.overall_grade}</div>
                  </div>
                </div>
              </div>
              <div className="border-t pt-4">
                <h3 className="font-bold text-lg mb-2">Attendance & Conduct</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600">Attendance Rate</div>
                    <div className="text-2xl font-bold">{viewReport.attendance_rate?.toFixed(1)}%</div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600">Conduct Score</div>
                    <div className="text-2xl font-bold">{viewReport.conduct_score?.toFixed(0)}</div>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600">Class Rank</div>
                    <div className="text-2xl font-bold">{viewReport.class_rank}/{viewReport.total_students}</div>
                  </div>
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <button onClick={() => downloadPDF(viewReport.student_id)} className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2">
                  <Download className="w-5 h-5" />
                  Download PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// SMS Tab
const SMSTab = () => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-bold mb-4">SMS Notifications</h2>
      <p className="text-gray-600">SMS notification features will be displayed here</p>
    </div>
  );
};

// Analytics Tab
const AnalyticsTab = ({ trades, analytics, onLoad }) => {
  const [selectedTrade, setSelectedTrade] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4">Analytics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select value={selectedTrade} onChange={(e) => setSelectedTrade(e.target.value)} className="px-4 py-2 border rounded-lg">
            <option value="">Select Trade</option>
            {trades.map(t => <option key={t.code} value={t.code}>{t.name}</option>)}
          </select>
          <select value={selectedLevel} onChange={(e) => setSelectedLevel(e.target.value)} className="px-4 py-2 border rounded-lg">
            <option value="">Select Level</option>
            {selectedTrade && trades.find(t => t.code === selectedTrade)?.levels?.map(l => (
              <option key={l.level_number} value={l.level_number}>Level {l.level_number}</option>
            ))}
          </select>
          <button onClick={onLoad} className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700">
            Load Analytics
          </button>
        </div>
      </div>

      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="font-bold text-lg mb-2">Average GPA</h3>
            <p className="text-3xl font-bold text-indigo-600">{analytics.overall.avg_gpa?.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="font-bold text-lg mb-2">Attendance Rate</h3>
            <p className="text-3xl font-bold text-green-600">{analytics.overall.avg_attendance?.toFixed(1)}%</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="font-bold text-lg mb-2">Conduct Score</h3>
            <p className="text-3xl font-bold text-blue-600">{analytics.overall.avg_conduct?.toFixed(1)}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DOSManagementDashboard;
