import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  User, BookOpen, Calendar, DollarSign, Award, AlertCircle,
  TrendingUp, Clock, FileText, MessageSquare, Bell, Activity,
  CheckCircle, XCircle, AlertTriangle, Phone, Mail, MapPin
} from 'lucide-react';

interface StudentData {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  student_code: string;
  trade_name: string;
  level_number: number;
  gender: string;
  phone: string;
  email: string;
  status: string;
}

interface DashboardData {
  student: StudentData;
  conduct: any;
  fees: any;
  performance: any;
  attendance: any;
  assignments: any;
  leaves: any[];
  messages: any;
  timetable: any[];
  reportCards: any[];
}

interface ParentChildDashboardProps {
  onNavigate?: (page: string) => void;
}

const ParentChildDashboard: React.FC<ParentChildDashboardProps> = ({ onNavigate }) => {
  // Extract studentId from URL path
  const studentId = window.location.pathname.split('/').pop();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, [studentId]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:5000/api/parent-child-dashboard/${studentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        setData(response.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Habaye ikosa');
    } finally {
      setLoading(false);
    }
  };

  const getConductGrade = (score: number) => {
    if (score >= 36) return { grade: 'A', color: 'text-green-600', bg: 'bg-green-100' };
    if (score >= 32) return { grade: 'B', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (score >= 28) return { grade: 'C', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    if (score >= 24) return { grade: 'D', color: 'text-orange-600', bg: 'bg-orange-100' };
    return { grade: 'F', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const getGradeColor = (grade: string) => {
    const colors: any = {
      'A': 'text-green-600 bg-green-100',
      'B': 'text-blue-600 bg-blue-100',
      'C': 'text-yellow-600 bg-yellow-100',
      'D': 'text-orange-600 bg-orange-100',
      'F': 'text-red-600 bg-red-100'
    };
    return colors[grade] || 'text-gray-600 bg-gray-100';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Gufungura amakuru...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Habaye Ikosa</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => onNavigate?.('dashboard-parent')}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
          >
            Subira Inyuma
          </button>
        </div>
      </div>
    );
  }

  const { student, conduct, fees, performance, attendance, assignments, leaves, messages, timetable, reportCards } = data;
  const conductGrade = getConductGrade(conduct.summary.current_score);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => onNavigate?.('dashboard-parent')}
              className="text-white hover:text-indigo-200 transition-colors"
            >
              ← Subira
            </button>
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              {messages.unread_count > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {messages.unread_count}
                </span>
              )}
            </div>
          </div>
          
          <div className="mt-6 flex items-center space-x-6">
            <div className="h-24 w-24 rounded-full bg-white/20 flex items-center justify-center text-4xl font-bold">
              {student.first_name[0]}{student.last_name[0]}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold">{student.full_name}</h1>
              <div className="mt-2 flex flex-wrap gap-4 text-sm">
                <span className="flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  {student.student_code}
                </span>
                <span className="flex items-center">
                  <BookOpen className="h-4 w-4 mr-1" />
                  {student.trade_name} - Urwego {student.level_number}
                </span>
                <span className="flex items-center">
                  <Award className="h-4 w-4 mr-1" />
                  {student.gender === 'M' ? 'Umuhungu' : 'Umukobwa'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Conduct Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between mb-4">
              <Award className="h-8 w-8 text-green-600" />
              <span className={`px-3 py-1 rounded-full text-sm font-bold ${conductGrade.bg} ${conductGrade.color}`}>
                {conductGrade.grade}
              </span>
            </div>
            <h3 className="text-gray-600 text-sm font-medium">Imyitwarire</h3>
            <p className="text-3xl font-bold text-gray-800 mt-2">
              {conduct.summary.current_score}/40
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Ibihano: {conduct.summary.total_incidents}
            </p>
          </div>

          {/* Fees Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="h-8 w-8 text-blue-600" />
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                fees.summary.total_balance === 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
              }`}>
                {fees.summary.total_balance === 0 ? 'Byishyuwe' : 'Ideni'}
              </span>
            </div>
            <h3 className="text-gray-600 text-sm font-medium">Amafaranga</h3>
            <p className="text-3xl font-bold text-gray-800 mt-2">
              {fees.summary.total_balance.toLocaleString()} Frw
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Byishyuwe: {fees.summary.total_paid.toLocaleString()} Frw
            </p>
          </div>

          {/* Performance Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                getGradeColor(performance.summary.average_percentage >= 80 ? 'A' : 
                             performance.summary.average_percentage >= 70 ? 'B' :
                             performance.summary.average_percentage >= 60 ? 'C' : 
                             performance.summary.average_percentage >= 50 ? 'D' : 'F')
              }`}>
                {performance.summary.average_percentage >= 80 ? 'A' : 
                 performance.summary.average_percentage >= 70 ? 'B' :
                 performance.summary.average_percentage >= 60 ? 'C' : 
                 performance.summary.average_percentage >= 50 ? 'D' : 'F'}
              </span>
            </div>
            <h3 className="text-gray-600 text-sm font-medium">Amanota</h3>
            <p className="text-3xl font-bold text-gray-800 mt-2">
              {performance.summary.average_percentage.toFixed(1)}%
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Ibizamini: {performance.summary.total_exams}
            </p>
          </div>

          {/* Attendance Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between mb-4">
              <Calendar className="h-8 w-8 text-yellow-600" />
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                attendance.summary.attendance_rate >= 90 ? 'bg-green-100 text-green-600' :
                attendance.summary.attendance_rate >= 75 ? 'bg-yellow-100 text-yellow-600' :
                'bg-red-100 text-red-600'
              }`}>
                {attendance.summary.attendance_rate >= 90 ? 'Nziza' : 
                 attendance.summary.attendance_rate >= 75 ? 'Nziza' : 'Nabi'}
              </span>
            </div>
            <h3 className="text-gray-600 text-sm font-medium">Kwitabira</h3>
            <p className="text-3xl font-bold text-gray-800 mt-2">
              {attendance.summary.attendance_rate.toFixed(1)}%
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Yitabye: {attendance.summary.present_days}/{attendance.summary.total_days}
            </p>
          </div>
        </div>
        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg mb-6 overflow-hidden">
          <div className="flex overflow-x-auto">
            {[
              { id: 'overview', label: 'Muri Rusange', icon: Activity },
              { id: 'conduct', label: 'Imyitwarire', icon: Award },
              { id: 'fees', label: 'Amafaranga', icon: DollarSign },
              { id: 'performance', label: 'Amanota', icon: TrendingUp },
              { id: 'attendance', label: 'Kwitabira', icon: Calendar },
              { id: 'assignments', label: 'Ibikorwa', icon: FileText },
              { id: 'messages', label: 'Ubutumwa', icon: MessageSquare }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Incamake y'Amakuru</h2>
              
              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                    <Activity className="h-5 w-5 mr-2 text-indigo-600" />
                    Ibikorwa Biheruka
                  </h3>
                  <div className="space-y-3">
                    {conduct.records.slice(0, 3).map((record: any) => (
                      <div key={record.id} className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg">
                        <AlertTriangle className="h-5 w-5 text-red-600 mt-1" />
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">{record.incident_type}</p>
                          <p className="text-sm text-gray-600">{record.description}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(record.created_at).toLocaleDateString('rw-RW')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-purple-600" />
                    Amanota Aheruka
                  </h3>
                  <div className="space-y-3">
                    {performance.grades.slice(0, 3).map((grade: any) => (
                      <div key={grade.id} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-800">{grade.course_name}</p>
                          <p className="text-sm text-gray-600">{grade.marks}/{grade.max_marks}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${getGradeColor(grade.grade)}`}>
                          {grade.grade}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'conduct' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Imyitwarire</h2>
              <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Amanota y'Imyitwarire</p>
                    <p className="text-4xl font-bold text-gray-800">
                      {conduct.summary.current_score}/40
                    </p>
                  </div>
                  <div className={`h-20 w-20 rounded-full ${conductGrade.bg} flex items-center justify-center`}>
                    <span className={`text-3xl font-bold ${conductGrade.color}`}>
                      {conductGrade.grade}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {conduct.records.map((record: any) => (
                  <div key={record.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <AlertCircle className={`h-5 w-5 ${
                          record.severity === 'severe' ? 'text-red-600' :
                          record.severity === 'major' ? 'text-orange-600' :
                          record.severity === 'moderate' ? 'text-yellow-600' :
                          'text-blue-600'
                        }`} />
                        <h3 className="font-semibold text-gray-800">{record.incident_type}</h3>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(record.created_at).toLocaleDateString('rw-RW')}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-2">{record.description}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Yakuweho: {record.conduct_points_deducted} amanota</span>
                      <span className="text-gray-500">Na: {record.removed_by_name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'fees' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Amafaranga</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Amafaranga Yose</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {fees.summary.total_fees.toLocaleString()} Frw
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Byishyuwe</p>
                  <p className="text-2xl font-bold text-green-600">
                    {fees.summary.total_paid.toLocaleString()} Frw
                  </p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Ideni</p>
                  <p className="text-2xl font-bold text-red-600">
                    {fees.summary.total_balance.toLocaleString()} Frw
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {fees.records.map((fee: any) => (
                  <div key={fee.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-800">{fee.fee_type}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        fee.status === 'paid' ? 'bg-green-100 text-green-600' :
                        fee.status === 'partial' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-red-100 text-red-600'
                      }`}>
                        {fee.status === 'paid' ? 'Byishyuwe' :
                         fee.status === 'partial' ? 'Igice' : 'Ntibwishyuwe'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Amafaranga: {fee.amount.toLocaleString()} Frw</p>
                        <p className="text-gray-600">Byishyuwe: {fee.amount_paid.toLocaleString()} Frw</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Ideni: {fee.balance.toLocaleString()} Frw</p>
                        <p className="text-gray-600">Itariki: {new Date(fee.due_date).toLocaleDateString('rw-RW')}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'performance' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Amanota</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Impuzandengo</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {performance.summary.average_percentage.toFixed(1)}%
                  </p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Ibizamini</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {performance.summary.total_exams}
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Yatsinze</p>
                  <p className="text-2xl font-bold text-green-600">
                    {performance.summary.passed_exams}
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Isomo</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Amanota</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">%</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Icyiciro</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Itariki</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {performance.grades.map((grade: any) => (
                      <tr key={grade.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-800">{grade.course_name}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{grade.marks}/{grade.max_marks}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{grade.percentage}%</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${getGradeColor(grade.grade)}`}>
                            {grade.grade}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {new Date(grade.recorded_at).toLocaleDateString('rw-RW')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'attendance' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Kwitabira</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Iminsi Yose</p>
                  <p className="text-2xl font-bold text-blue-600">{attendance.summary.total_days}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Yitabye</p>
                  <p className="text-2xl font-bold text-green-600">{attendance.summary.present_days}</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Yibagiwe</p>
                  <p className="text-2xl font-bold text-red-600">{attendance.summary.absent_days}</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Yatinze</p>
                  <p className="text-2xl font-bold text-yellow-600">{attendance.summary.late_days}</p>
                </div>
              </div>

              <div className="space-y-3">
                {attendance.records.map((record: any) => (
                  <div key={record.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {record.status === 'present' ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : record.status === 'absent' ? (
                        <XCircle className="h-5 w-5 text-red-600" />
                      ) : (
                        <Clock className="h-5 w-5 text-yellow-600" />
                      )}
                      <div>
                        <p className="font-medium text-gray-800">{record.course_name}</p>
                        <p className="text-sm text-gray-600">{new Date(record.date).toLocaleDateString('rw-RW')}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      record.status === 'present' ? 'bg-green-100 text-green-600' :
                      record.status === 'absent' ? 'bg-red-100 text-red-600' :
                      'bg-yellow-100 text-yellow-600'
                    }`}>
                      {record.status === 'present' ? 'Yitabye' :
                       record.status === 'absent' ? 'Yibagiwe' : 'Yatinze'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'assignments' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Ibikorwa</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Byose</p>
                  <p className="text-2xl font-bold text-blue-600">{assignments.summary.total_assignments}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Byoherejwe</p>
                  <p className="text-2xl font-bold text-green-600">{assignments.summary.submitted_assignments}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Byapimwe</p>
                  <p className="text-2xl font-bold text-purple-600">{assignments.summary.graded_assignments}</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Impuzandengo</p>
                  <p className="text-2xl font-bold text-yellow-600">{assignments.summary.average_marks.toFixed(1)}</p>
                </div>
              </div>

              <div className="space-y-4">
                {assignments.records.map((assignment: any) => (
                  <div key={assignment.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-800">{assignment.title}</h3>
                        <p className="text-sm text-gray-600">{assignment.course_name}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        assignment.submission_status === 'graded' ? 'bg-green-100 text-green-600' :
                        assignment.submission_status === 'submitted' ? 'bg-blue-100 text-blue-600' :
                        'bg-red-100 text-red-600'
                      }`}>
                        {assignment.submission_status === 'graded' ? 'Byapimwe' :
                         assignment.submission_status === 'submitted' ? 'Byoherejwe' : 'Ntibwoherejwe'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{assignment.description}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>Itariki: {new Date(assignment.due_date).toLocaleDateString('rw-RW')}</span>
                      {assignment.marks_obtained && (
                        <span className="font-medium">Amanota: {assignment.marks_obtained}/{assignment.max_marks}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'messages' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Ubutumwa</h2>
              <div className="space-y-4">
                {messages.records.map((message: any) => (
                  <div key={message.id} className={`border rounded-lg p-4 ${
                    message.read_status === 'unread' ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'
                  }`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <MessageSquare className="h-5 w-5 text-indigo-600" />
                        <h3 className="font-semibold text-gray-800">{message.title}</h3>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(message.sent_at).toLocaleDateString('rw-RW')}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-2">{message.message}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Yoherejwe na: {message.sent_by}</span>
                      {message.read_status === 'unread' && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded text-xs font-bold">
                          Nshya
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParentChildDashboard;
