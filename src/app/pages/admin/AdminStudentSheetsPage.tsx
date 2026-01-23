import React, { useState, useEffect } from 'react';
import { Users, BookOpen, Shield, DollarSign, TrendingUp, Download, Eye, Filter, Search } from 'lucide-react';

interface ClassSheet {
  id: number;
  class_name: string;
  trade: string;
  level: string;
  section: string;
  total_students: number;
  present_today: number;
  avg_performance: number;
  paid_students: number;
  unpaid_students: number;
}

interface StudentSheet {
  id: number;
  student_code: string;
  student_name: string;
  average_marks: number;
  overall_grade: string;
  gpa: number;
  attendance_percentage: number;
  conduct_score: number;
  conduct_grade: string;
  payment_status: string;
  balance: number;
}

const AdminStudentSheetsPage: React.FC = () => {
  const [classes, setClasses] = useState<ClassSheet[]>([]);
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [students, setStudents] = useState<StudentSheet[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({ trade: '', level: '', search: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, [filters]);

  useEffect(() => {
    if (selectedClass) fetchStudents();
  }, [selectedClass]);

  const fetchClasses = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const params = new URLSearchParams();
      if (filters.trade) params.append('trade', filters.trade);
      if (filters.level) params.append('level', filters.level);
      
      const res = await fetch(`http://localhost:5000/api/class-sheets/sheets?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setClasses(data.sheets);
    } catch (error) {
      console.error('Fetch error:', error);
    }
    setLoading(false);
  };

  const fetchStudents = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch(`http://localhost:5000/api/student-sheets/class/${selectedClass}/all`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (data.success) {
      let filtered = data.sheets;
      if (filters.search) {
        filtered = filtered.filter((s: StudentSheet) => 
          s.student_name.toLowerCase().includes(filters.search.toLowerCase()) ||
          s.student_code.toLowerCase().includes(filters.search.toLowerCase())
        );
      }
      setStudents(filtered);
    }
  };

  const viewStudentDetails = async (studentId: number) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`http://localhost:5000/api/student-sheets/${studentId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (data.success) {
      setSelectedStudent(data);
      setShowModal(true);
    }
  };

  const getGradeColor = (grade: string) => {
    const colors: any = {
      'A': 'bg-green-100 text-green-700 border-green-300',
      'B': 'bg-blue-100 text-blue-700 border-blue-300',
      'C': 'bg-yellow-100 text-yellow-700 border-yellow-300',
      'D': 'bg-orange-100 text-orange-700 border-orange-300',
      'F': 'bg-red-100 text-red-700 border-red-300'
    };
    return colors[grade] || colors['F'];
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('rw-RW', { style: 'currency', currency: 'RWF', minimumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Users className="w-10 h-10 text-indigo-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Student Sheets - Admin View</h1>
                <p className="text-gray-600">Complete overview of all classes and students</p>
              </div>
            </div>
            <button className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition">
              <Download className="w-5 h-5" />
              Export All Data
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <select
              value={filters.trade}
              onChange={(e) => setFilters({ ...filters, trade: e.target.value })}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Trades</option>
              <option value="SOD">SOD - Software Development</option>
              <option value="AUT">AUT - Automotive</option>
              <option value="BDC">BDC - Building Construction</option>
            </select>
            <select
              value={filters.level}
              onChange={(e) => setFilters({ ...filters, level: e.target.value })}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Levels</option>
              <option value="Level 3">Level 3</option>
              <option value="Level 4">Level 4</option>
              <option value="Level 5">Level 5</option>
            </select>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search students..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-1 bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-indigo-600" />
              Classes
            </h2>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {loading ? (
                <p className="text-center text-gray-500 py-4">Loading...</p>
              ) : classes.length === 0 ? (
                <p className="text-center text-gray-500 py-4">No classes found</p>
              ) : (
                classes.map((cls) => (
                  <div
                    key={cls.id}
                    onClick={() => setSelectedClass(cls.id)}
                    className={`p-4 rounded-lg cursor-pointer transition ${
                      selectedClass === cls.id
                        ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <h3 className="font-bold text-lg mb-2">{cls.class_name}</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className={selectedClass === cls.id ? 'text-white/80' : 'text-gray-600'}>Students</p>
                        <p className="font-bold">{cls.total_students || 0}</p>
                      </div>
                      <div>
                        <p className={selectedClass === cls.id ? 'text-white/80' : 'text-gray-600'}>Present</p>
                        <p className="font-bold">{cls.present_today || 0}</p>
                      </div>
                      <div>
                        <p className={selectedClass === cls.id ? 'text-white/80' : 'text-gray-600'}>Avg Score</p>
                        <p className="font-bold">{cls.avg_performance?.toFixed(1) || '0.0'}%</p>
                      </div>
                      <div>
                        <p className={selectedClass === cls.id ? 'text-white/80' : 'text-gray-600'}>Paid</p>
                        <p className="font-bold">{cls.paid_students || 0}/{cls.total_students || 0}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl overflow-hidden">
            {!selectedClass ? (
              <div className="p-12 text-center text-gray-500">
                <Users className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p className="text-lg">Select a class to view students</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Code</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Academic</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Attendance</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Conduct</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Payment</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {students.length === 0 ? (
                      <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">No students in this class</td></tr>
                    ) : (
                      students.map((student) => (
                        <tr key={student.id} className="hover:bg-gray-50 transition">
                          <td className="px-4 py-3">
                            <span className="font-mono text-sm font-semibold text-indigo-600">{student.student_code}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-medium text-gray-900">{student.student_name}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="font-bold">{student.average_marks?.toFixed(1) || '0.0'}%</span>
                              <span className={`px-2 py-1 rounded text-xs font-bold border ${getGradeColor(student.overall_grade || 'F')}`}>
                                {student.overall_grade || 'N/A'}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-12 bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${student.attendance_percentage >= 80 ? 'bg-green-500' : student.attendance_percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                  style={{ width: `${student.attendance_percentage || 0}%` }}
                                />
                              </div>
                              <span className="text-sm font-semibold">{student.attendance_percentage?.toFixed(0) || 0}%</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded text-sm font-bold border ${getGradeColor(student.conduct_grade || 'F')}`}>
                              {student.conduct_score || 0}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div>
                              <span className={`px-2 py-1 rounded text-xs font-bold ${
                                student.payment_status === 'paid' ? 'bg-green-100 text-green-700' :
                                student.payment_status === 'partial' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {student.payment_status || 'unpaid'}
                              </span>
                              {student.balance > 0 && (
                                <p className="text-xs text-red-600 mt-1">{formatCurrency(student.balance)}</p>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => viewStudentDetails(student.id)}
                              className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {showModal && selectedStudent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Complete Student Sheet</h2>
                <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                  <span className="text-2xl">&times;</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="w-5 h-5 text-indigo-600" />
                    <h3 className="font-bold text-gray-900">Academic</h3>
                  </div>
                  <p className="text-2xl font-bold text-indigo-600">{selectedStudent.sheet.average_marks?.toFixed(1)}%</p>
                  <p className="text-sm text-gray-600">Grade: {selectedStudent.sheet.overall_grade} | GPA: {selectedStudent.sheet.gpa?.toFixed(2)}</p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <h3 className="font-bold text-gray-900">Attendance</h3>
                  </div>
                  <p className="text-2xl font-bold text-green-600">{selectedStudent.sheet.attendance_percentage?.toFixed(0)}%</p>
                  <p className="text-sm text-gray-600">Present: {selectedStudent.sheet.days_present} | Absent: {selectedStudent.sheet.days_absent}</p>
                </div>

                <div className="bg-gradient-to-br from-red-50 to-orange-50 p-4 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-5 h-5 text-red-600" />
                    <h3 className="font-bold text-gray-900">Conduct</h3>
                  </div>
                  <p className="text-2xl font-bold text-red-600">{selectedStudent.sheet.conduct_score}/100</p>
                  <p className="text-sm text-gray-600">Grade: {selectedStudent.sheet.conduct_grade} | Incidents: {selectedStudent.sheet.total_incidents}</p>
                </div>

                <div className="bg-gradient-to-br from-yellow-50 to-amber-50 p-4 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-5 h-5 text-yellow-600" />
                    <h3 className="font-bold text-gray-900">Payment</h3>
                  </div>
                  <p className="text-2xl font-bold text-yellow-600">{selectedStudent.sheet.payment_status}</p>
                  <p className="text-sm text-gray-600">Balance: {formatCurrency(selectedStudent.sheet.balance || 0)}</p>
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-xl">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Subject Performance</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedStudent.subjects?.map((subj: any) => (
                    <div key={subj.id} className="bg-white p-4 rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-gray-900">{subj.subject}</span>
                        <span className={`px-2 py-1 rounded text-sm font-bold border ${getGradeColor(subj.grade)}`}>
                          {subj.grade}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm text-gray-600">
                        <div>Quiz: {subj.quiz_marks}/{subj.quiz_max}</div>
                        <div>Mid: {subj.midterm_marks}/{subj.midterm_max}</div>
                        <div>Final: {subj.final_marks}/{subj.final_max}</div>
                      </div>
                      <p className="text-sm font-bold text-gray-900 mt-2">Total: {subj.total_marks}/100 ({subj.percentage?.toFixed(1)}%)</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminStudentSheetsPage;
