import React, { useState, useEffect } from 'react';
import { User, BookOpen, Calendar, DollarSign, Award, AlertCircle, TrendingUp, Phone } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

const ParentStudentDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/parent-student-dashboard/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      if (result.success) {
        setData(result);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!data || !data.student) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-700 mb-2">No Student Linked</h2>
          <p className="text-gray-500">Please link your child's account first</p>
        </div>
      </div>
    );
  }

  const { student, conduct, marks, attendance, fees } = data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {student.first_name[0]}{student.last_name[0]}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                {student.first_name} {student.last_name}
              </h1>
              <p className="text-gray-600">{student.trade_name} - Level {student.level_number}</p>
              <p className="text-sm text-gray-500">Student Code: {student.student_code}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">GPA</div>
            <div className="text-3xl font-bold text-blue-600">{student.gpa || 'N/A'}</div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Attendance</p>
              <p className="text-2xl font-bold text-green-600">
                {student.attendance_percentage || 0}%
              </p>
            </div>
            <Calendar className="w-12 h-12 text-green-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Conduct Score</p>
              <p className="text-2xl font-bold text-blue-600">
                {student.conduct_score || 40}/40
              </p>
            </div>
            <Award className="w-12 h-12 text-blue-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Marks</p>
              <p className="text-2xl font-bold text-purple-600">{marks.length}</p>
            </div>
            <BookOpen className="w-12 h-12 text-purple-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Balance</p>
              <p className="text-2xl font-bold text-red-600">
                {fees.balance || 0} RWF
              </p>
            </div>
            <DollarSign className="w-12 h-12 text-red-500 opacity-20" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-t-2xl shadow-xl">
        <div className="flex border-b">
          {['overview', 'marks', 'conduct', 'attendance'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-4 font-semibold capitalize ${
                activeTab === tab
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Attendance Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Days:</span>
                      <span className="font-bold">{attendance.total_days}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Present:</span>
                      <span className="font-bold text-green-600">{attendance.present_days}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Absent:</span>
                      <span className="font-bold text-red-600">{attendance.absent_days}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Fee Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Fees:</span>
                      <span className="font-bold">{fees.total_fees} RWF</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Paid:</span>
                      <span className="font-bold text-green-600">{fees.paid_amount} RWF</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Balance:</span>
                      <span className="font-bold text-red-600">{fees.balance} RWF</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Marks Tab */}
          {activeTab === 'marks' && (
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Academic Performance</h3>
              {marks.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No marks recorded yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Subject</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Marks</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Grade</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {marks.map((mark, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-800">{mark.subject_name || 'N/A'}</td>
                          <td className="px-4 py-3 text-sm font-semibold text-blue-600">{mark.marks}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              mark.marks >= 70 ? 'bg-green-100 text-green-800' :
                              mark.marks >= 50 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {mark.marks >= 70 ? 'A' : mark.marks >= 50 ? 'B' : 'C'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {new Date(mark.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Conduct Tab */}
          {activeTab === 'conduct' && (
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Discipline Records</h3>
              {conduct.length === 0 ? (
                <div className="text-center py-8">
                  <Award className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <p className="text-green-600 font-semibold">Excellent Behavior!</p>
                  <p className="text-gray-500">No discipline issues recorded</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {conduct.map((record, idx) => (
                    <div key={idx} className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-gray-800">{record.conduct_type}</h4>
                          <p className="text-sm text-gray-600 mt-1">{record.description}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            Points Deducted: {record.conduct_points_deducted}
                          </p>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(record.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Attendance Tab */}
          {activeTab === 'attendance' && (
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Attendance Details</h3>
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-3xl font-bold text-gray-800">{attendance.total_days}</p>
                    <p className="text-sm text-gray-600">Total Days</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-green-600">{attendance.present_days}</p>
                    <p className="text-sm text-gray-600">Present</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-red-600">{attendance.absent_days}</p>
                    <p className="text-sm text-gray-600">Absent</p>
                  </div>
                </div>
                <div className="mt-6">
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className="bg-gradient-to-r from-green-500 to-blue-500 h-4 rounded-full"
                      style={{ width: `${student.attendance_percentage || 0}%` }}
                    ></div>
                  </div>
                  <p className="text-center mt-2 text-sm text-gray-600">
                    {student.attendance_percentage || 0}% Attendance Rate
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParentStudentDashboard;
