import React, { useState, useEffect } from 'react';
import { Calendar, Users, BookOpen, FileText, Download, Send, BarChart3, Clock, CheckCircle, AlertCircle, Plus, Search, Filter, Eye, Trash2, Edit, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import apiService from '@/app/services/apiService';
import { API_BASE_URL } from '@/app/config/apiBase';

const API_BASE = API_BASE_URL;

function authHeaders() {
  return { Authorization: `Bearer ${localStorage.getItem('token')}` };
}

const DOSManagementDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [trades, setTrades] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [tradesRes, teachersRes, statsRes] = await Promise.all([
        apiService.getTradesWithLevels(),
        apiService.getTeachers().catch(() => ({ success: false })),
        fetch(`${API_BASE}/dos-management/trades-levels`, { headers: authHeaders() }).then(r => r.json()).catch(() => ({}))
      ]);
      const tradeList = tradesRes?.trades || tradesRes?.data || (Array.isArray(tradesRes) ? tradesRes : []);
      const normalized = (tradeList.length ? tradeList : (statsRes.trades || [])).map((t: any) => ({
        code: t.trade_code || t.code,
        name: t.trade_name || t.name,
        trade_code: t.trade_code || t.code,
        trade_name: t.trade_name || t.name,
        levels: t.levels || []
      }));
      setTrades(normalized);
      if (teachersRes?.success && teachersRes?.teachers) setTeachers(teachersRes.teachers);
      else if (teachersRes?.users) setTeachers(teachersRes.users);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load trades and teachers');
    }
  };

  const loadAnalytics = async () => {
    if (!selectedTrade || !selectedLevel) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/dos-management/dashboard-stats`, { headers: authHeaders() });
      const data = await res.json();
      if (data.success) setAnalytics(data.stats);
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
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-indigo-600" />
              DOS Management System
            </h1>
            <p className="text-gray-600 mt-2">Comprehensive academic management and reporting</p>
          </div>
          <button
            type="button"
            onClick={loadInitialData}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-100 text-indigo-700 hover:bg-indigo-200 font-medium transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            Refresh
          </button>
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
      const res = await fetch(`${API_BASE}/dos-management/dashboard-stats`, { headers: authHeaders() });
      const data = await res.json();
      if (data.success && data.stats) {
        setStats({
          totalStudents: data.stats.total_students ?? 0,
          totalTeachers: data.stats.total_teachers ?? 0,
          activeTimetables: data.stats.active_timetables ?? 0,
          reportsGenerated: data.stats.reports_generated ?? 0
        });
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const colorMap: Record<string, string> = { blue: 'bg-blue-100 text-blue-600', green: 'bg-green-100 text-green-600', purple: 'bg-purple-100 text-purple-600', orange: 'bg-orange-100 text-orange-600' };
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[
        { label: 'Total Students', value: stats.totalStudents, icon: Users, color: 'blue' },
        { label: 'Total Teachers', value: stats.totalTeachers, icon: Users, color: 'green' },
        { label: 'Active Timetables', value: stats.activeTimetables, icon: Calendar, color: 'purple' },
        { label: 'Reports Generated', value: stats.reportsGenerated, icon: FileText, color: 'orange' }
      ].map((stat, idx) => (
        <div key={idx} className="bg-white rounded-xl shadow-lg p-6">
          <div className={`w-12 h-12 ${colorMap[stat.color] || 'bg-gray-100'} rounded-lg flex items-center justify-center mb-4`}>
            <stat.icon className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
          <p className="text-gray-600">{stat.label}</p>
        </div>
      ))}
    </div>
  );
};

// Teacher Assignments Tab - assign teacher to class/course (courses from database)
const TeacherAssignmentsTab = ({ trades, teachers }) => {
  const [selectedTrade, setSelectedTrade] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [courses, setCourses] = useState<any[]>([]);
  const [assignments, setAssignments] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);

  const loadCourses = async () => {
    if (!selectedTrade) return;
    setLoadingCourses(true);
    try {
      const levelNum = selectedLevel ? parseInt(selectedLevel.replace(/\D/g, ''), 10) : undefined;
      const res = await apiService.getCoursesByTradeLevel(selectedTrade, levelNum);
      const list = (res as any)?.courses ?? (res as any)?.data ?? (Array.isArray(res) ? res : []);
      setCourses(list);
    } catch {
      const r = await fetch(`${API_BASE}/academics/courses?trade_code=${encodeURIComponent(selectedTrade)}`, { headers: authHeaders() }).then(x => x.json());
      setCourses(r.courses ?? r.data ?? []);
    } finally {
      setLoadingCourses(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, [selectedTrade, selectedLevel]);

  const assignTeacher = async () => {
    if (!selectedTeacher || !selectedCourse || !selectedTrade || !selectedLevel) {
      toast.error('Please select trade, level, teacher and course');
      return;
    }
    try {
      const teacher = teachers.find((t: any) => String(t.id) === selectedTeacher);
      if (!teacher) { toast.error('Teacher not found'); return; }
      const course = courses.find((c: any) => String(c.id || c.course_id) === selectedCourse) || { name: selectedCourse, code: selectedCourse };
      const res = await fetch(`${API_BASE}/dos-management/assign-teacher-course`, {
        method: 'POST',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacher_id: teacher.id,
          teacher_name: `${teacher.first_name || ''} ${teacher.last_name || ''}`.trim(),
          course_id: course.id || course.course_id,
          subject_code: course.code || course.course_code || selectedCourse,
          subject_name: course.name || course.course_name || selectedCourse,
          trade_code: selectedTrade,
          level_number: parseInt(selectedLevel.replace(/\D/g, ''), 10) || 3,
          level_suffix: (selectedLevel.match(/[AB]$/i) && selectedLevel.length > 1) ? selectedLevel.slice(-1).toUpperCase() : undefined,
          academic_year: new Date().getFullYear().toString()
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Teacher assigned to course successfully');
        loadAssignments();
      } else toast.error(data.message || 'Failed to assign');
    } catch (error) {
      toast.error('Failed to assign teacher');
    }
  };

  const loadAssignments = async () => {
    if (!selectedTrade || !selectedLevel) return;
    try {
      const res = await fetch(`${API_BASE}/dos-management/class-assignments/${selectedTrade}/${selectedLevel}`, { headers: authHeaders() });
      const data = await res.json();
      if (data.success) setAssignments(data.courses ?? data.assignments ?? []);
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
        <h2 className="text-xl font-bold mb-4">Assign Teacher to Class & Course (all courses from database)</h2>
        <p className="text-gray-600 text-sm mb-4">Select trade, level, teacher and course. Data is stored in the database.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <select value={selectedTrade} onChange={(e) => { setSelectedTrade(e.target.value); setSelectedLevel(''); setSelectedCourse(''); }} className="px-4 py-2 border rounded-lg">
            <option value="">Select Trade</option>
            {trades.map((t: any) => <option key={t.code || t.trade_code} value={t.code || t.trade_code}>{t.name || t.trade_name}</option>)}
          </select>
          <select value={selectedLevel} onChange={(e) => { setSelectedLevel(e.target.value); setSelectedCourse(''); }} className="px-4 py-2 border rounded-lg">
            <option value="">Select Level</option>
            {selectedTrade && (trades.find((t: any) => (t.code || t.trade_code) === selectedTrade)?.levels || []).map((l: any) => (
              <option key={String(l.level_number) + (l.level_suffix || '')} value={String(l.level_number) + (l.level_suffix || '')}>Level {l.level_number}{l.level_suffix || ''}</option>
            ))}
          </select>
          <select value={selectedTeacher} onChange={(e) => setSelectedTeacher(e.target.value)} className="px-4 py-2 border rounded-lg">
            <option value="">Select Teacher</option>
            {teachers.map((t: any) => <option key={t.id} value={t.id}>{t.first_name} {t.last_name}</option>)}
          </select>
          <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)} className="px-4 py-2 border rounded-lg" disabled={loadingCourses}>
            <option value="">{loadingCourses ? 'Loading...' : 'Select Course'}</option>
            {courses.map((c: any) => (
              <option key={c.id || c.course_id} value={c.id ?? c.course_id}>{c.name || c.course_name || c.code || c.course_code}</option>
            ))}
          </select>
          <button onClick={assignTeacher} className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2 disabled:opacity-50">
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
      toast.error('Please select trade and level');
      return;
    }
    const levelNum = parseInt(selectedLevel, 10);
    const levelSuffix = (selectedLevel.match(/[AB]$/i) && selectedLevel.length > 1) ? selectedLevel.slice(-1).toUpperCase() : '';
    try {
      const res = await fetch(`${API_BASE}/dos-management/timetables/auto-generate`, {
        method: 'POST',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trade_code: selectedTrade,
          level_number: isNaN(levelNum) ? parseInt(selectedLevel.replace(/\D/g, ''), 10) || 3 : levelNum,
          level_suffix: levelSuffix || undefined,
          academic_year: new Date().getFullYear().toString(),
          term: 'Term 1',
          periods_count: 12,
          period_duration_minutes: 40,
          use_courses_from_database: true
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Timetable generated! ${data.total_slots || 0} slots created (12 periods × 40 min, courses from DB)`);
        loadTimetables();
      } else toast.error(data.message || 'Failed to generate');
    } catch (error) {
      toast.error('Failed to generate timetable');
    }
  };

  const generateTimetableAllLevels = async () => {
    if (!selectedTrade) {
      toast.error('Please select trade first');
      return;
    }
    const tradeObj = trades.find((t: any) => (t.code || t.trade_code) === selectedTrade);
    const levels = tradeObj?.levels || [];
    if (levels.length === 0) {
      toast.error('No levels found for this trade');
      return;
    }
    let done = 0;
    let failed = 0;
    for (const l of levels) {
      const levelNumber = typeof l === 'number' ? l : (l.level_number ?? l);
      const levelSuffix = l.level_suffix || '';
      try {
        const res = await fetch(`${API_BASE}/dos-management/timetables/auto-generate`, {
          method: 'POST',
          headers: { ...authHeaders(), 'Content-Type': 'application/json' },
          body: JSON.stringify({
            trade_code: selectedTrade,
            level_number: levelNumber,
            level_suffix: levelSuffix || undefined,
            academic_year: new Date().getFullYear().toString(),
            term: 'Term 1',
            periods_count: 12,
            period_duration_minutes: 40,
            use_courses_from_database: true
          })
        });
        const data = await res.json();
        if (data.success) done++;
        else failed++;
      } catch {
        failed++;
      }
    }
    toast.success(`Timetables: ${done} generated, ${failed} failed.`);
    loadTimetables();
  };

  const loadTimetables = async () => {
    if (!selectedTrade || !selectedLevel) return;
    try {
      const res = await fetch(`${API_BASE}/dos-management/timetables/class/${selectedTrade}/${selectedLevel}`, { headers: authHeaders() });
      const data = await res.json();
      if (data.success) setTimetables(data.timetables || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const viewTimetableDetails = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE}/dos-management/timetables/${id}`, { headers: authHeaders() });
      const data = await res.json();
      if (data.success) setViewTimetable({ timetable: data.timetable, slots: data.slots || [] });
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
          Generate Timetable — 12 periods × 40 minutes, all courses from database
        </h2>
        <p className="text-gray-600 text-sm mb-4">Uses real courses for the selected trade/level from the database. No placeholders.</p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select value={selectedTrade} onChange={(e) => { setSelectedTrade(e.target.value); setSelectedLevel(''); }} className="px-4 py-2 border rounded-lg">
            <option value="">Select Trade</option>
            {trades.map((t: any) => <option key={t.code || t.trade_code} value={t.code || t.trade_code}>{t.name || t.trade_name}</option>)}
          </select>
          <select value={selectedLevel} onChange={(e) => setSelectedLevel(e.target.value)} className="px-4 py-2 border rounded-lg">
            <option value="">Select Level</option>
            {selectedTrade && (trades.find((t: any) => (t.code || t.trade_code) === selectedTrade)?.levels || []).map((l: any) => {
              const num = typeof l === 'number' ? l : (l.level_number ?? l);
              const suffix = l.level_suffix || '';
              const display = suffix ? `Level ${num}${suffix}` : `Level ${num}`;
              return <option key={display} value={String(num) + suffix}>{display}</option>;
            })}
          </select>
          <button onClick={generateTimetable} disabled={!selectedTrade || !selectedLevel} className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2">
            <Calendar className="w-5 h-5" />
            Generate for this level
          </button>
          <button onClick={generateTimetableAllLevels} disabled={!selectedTrade} className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2">
            <Calendar className="w-5 h-5" />
            Generate for all levels
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">{viewTimetable.timetable?.timetable_name || 'Timetable'}</h2>
              <button onClick={() => setViewTimetable(null)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border">
                <thead className="bg-indigo-600 text-white">
                  <tr>
                    <th className="border px-4 py-2">Period</th>
                    <th className="border px-4 py-2">Time</th>
                    {['Monday','Tuesday','Wednesday','Thursday','Friday'].map(day => <th key={day} className="border px-4 py-2">{day}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {[1,2,3,4,5,6,7,8,9,10,11,12].map(period => {
                    const periodSlots = (viewTimetable.slots || []).filter((s: any) => s.period_number === period);
                    const timeSlot = periodSlots[0];
                    return (
                      <tr key={period}>
                        <td className="border px-4 py-2 font-bold text-center">{period}</td>
                        <td className="border px-4 py-2 text-sm text-center">{timeSlot ? `${timeSlot.start_time}-${timeSlot.end_time}` : '-'}</td>
                        {['Monday','Tuesday','Wednesday','Thursday','Friday'].map(day => {
                          const slot = periodSlots.find((s: any) => s.day_of_week === day);
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
      toast.error('Please select trade and level');
      return;
    }
    const levelNum = parseInt(selectedLevel.replace(/\D/g, ''), 10) || parseInt(selectedLevel, 10);
    setGenerating(true);
    try {
      const res = await fetch(`${API_BASE}/dos-management/report-cards/auto-generate-class`, {
        method: 'POST',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trade_code: selectedTrade,
          level_number: levelNum,
          level_suffix: (selectedLevel.match(/[AB]$/i) && selectedLevel.length > 1) ? selectedLevel.slice(-1).toUpperCase() : undefined,
          term,
          academic_year: new Date().getFullYear().toString(),
          use_teacher_marks_from_database: true
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Report cards generated from teacher marks. Processed: ${data.processed ?? data.count ?? 0}, Failed: ${data.failed ?? 0}`);
        loadReports();
      } else toast.error(data.message || 'Failed to generate reports');
    } catch (error) {
      toast.error('Failed to generate reports');
    } finally {
      setGenerating(false);
    }
  };

  const autoGenerateReportsAllLevels = async () => {
    if (!selectedTrade) {
      toast.error('Please select trade first');
      return;
    }
    const tradeObj = trades.find((t: any) => (t.code || t.trade_code) === selectedTrade);
    const levels = tradeObj?.levels || [];
    if (levels.length === 0) {
      toast.error('No levels found for this trade');
      return;
    }
    let processed = 0;
    let failed = 0;
    for (const l of levels) {
      const levelNumber = typeof l === 'number' ? l : (l.level_number ?? l);
      const levelSuffix = l.level_suffix || '';
      try {
        const res = await fetch(`${API_BASE}/dos-management/report-cards/auto-generate-class`, {
          method: 'POST',
          headers: { ...authHeaders(), 'Content-Type': 'application/json' },
          body: JSON.stringify({
            trade_code: selectedTrade,
            level_number: levelNumber,
            level_suffix: levelSuffix || undefined,
            term,
            academic_year: new Date().getFullYear().toString(),
            use_teacher_marks_from_database: true
          })
        });
        const data = await res.json();
        if (data.success) { processed += (data.processed ?? data.count ?? 1); }
        else failed++;
      } catch {
        failed++;
      }
    }
    toast.success(`Report cards: ${processed} generated, ${failed} levels failed.`);
    loadReports();
  };

  const loadReports = async () => {
    if (!selectedTrade || !selectedLevel) return;
    try {
      const res = await fetch(`${API_BASE}/dos-management/report-cards/class/${selectedTrade}/${selectedLevel}?term=${term}&academic_year=${new Date().getFullYear()}`, { headers: authHeaders() });
      const data = await res.json();
      if (data.success) setReports(data.reports || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const academicYear = new Date().getFullYear().toString();
  const downloadPDF = async (studentId) => {
    try {
      const res = await fetch(`${API_BASE}/dos-management/report-cards/${studentId}/pdf?term=${encodeURIComponent(term)}&academic_year=${academicYear}`, {
        headers: authHeaders()
      });
      if (!res.ok) {
        toast.error('PDF not available for this report');
        return;
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report_${studentId}_${term.replace(/\s/g, '_')}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Download started');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to download PDF');
    }
  };

  const sendSMSToParents = async () => {
    if (!selectedTrade || !selectedLevel) return;
    try {
      const res = await fetch(`${API_BASE}/dos-management/report-cards/send-sms-bulk`, {
        method: 'POST',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trade_code: selectedTrade,
          level_number: parseInt(selectedLevel),
          term,
          academic_year: academicYear
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`SMS sent to ${data.sent ?? 0} parents`);
      } else {
        toast.error(data.message || 'Failed to send SMS');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to send SMS');
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
          Auto-Generate Report Cards (from teacher marks)
        </h2>
        <p className="text-gray-600 mb-4">Generates one report card per student in the level using marks inserted by teachers in Student Sheets. Real APIs and database.</p>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <select value={selectedTrade} onChange={(e) => { setSelectedTrade(e.target.value); setSelectedLevel(''); }} className="px-4 py-2 border rounded-lg">
            <option value="">Select Trade</option>
            {trades.map((t: any) => <option key={t.code || t.trade_code} value={t.code || t.trade_code}>{t.name || t.trade_name}</option>)}
          </select>
          <select value={selectedLevel} onChange={(e) => setSelectedLevel(e.target.value)} className="px-4 py-2 border rounded-lg">
            <option value="">Select Level</option>
            {selectedTrade && (trades.find((t: any) => (t.code || t.trade_code) === selectedTrade)?.levels || []).map((l: any) => {
              const num = typeof l === 'number' ? l : (l?.level_number ?? l);
              const suffix = l?.level_suffix || '';
              return <option key={String(num) + suffix} value={String(num) + suffix}>Level {num}{suffix}</option>;
            })}
          </select>
          <select value={term} onChange={(e) => setTerm(e.target.value)} className="px-4 py-2 border rounded-lg">
            <option value="Term 1">Term 1</option>
            <option value="Term 2">Term 2</option>
            <option value="Term 3">Term 3</option>
          </select>
          <button 
            onClick={autoGenerateReports} 
            disabled={generating || !selectedTrade || !selectedLevel}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {generating ? (
              <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> Generating...</>
            ) : (
              <><CheckCircle className="w-5 h-5" /> Generate for this level</>
            )}
          </button>
          <button 
            onClick={autoGenerateReportsAllLevels} 
            disabled={generating || !selectedTrade}
            className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <FileText className="w-5 h-5" /> Generate for all levels
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
