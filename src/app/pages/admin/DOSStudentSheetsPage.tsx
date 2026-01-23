import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, Award, Calendar, Search, Plus, Eye, Edit, Download, Filter } from 'lucide-react';

interface StudentSheet {
  id: number;
  student_code: string;
  student_name: string;
  trade: string;
  level: string;
  average_marks: number;
  overall_grade: string;
  gpa: number;
  attendance_percentage: number;
  conduct_score: number;
  conduct_grade: string;
  payment_status: string;
}

const DOSStudentSheetsPage: React.FC = () => {
  const [sheets, setSheets] = useState<StudentSheet[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'view' | 'marks' | 'attendance'>('view');
  const [filters, setFilters] = useState({ trade: '', level: '', search: '' });
  const [loading, setLoading] = useState(false);
  
  const [marksForm, setMarksForm] = useState({
    subject: '',
    term: 'Term 1',
    quiz_marks: '',
    midterm_marks: '',
    final_marks: '',
    remarks: ''
  });

  useEffect(() => {
    fetchSheets();
  }, [filters]);

  const fetchSheets = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const classSheetId = 1; // Get from context
      const res = await fetch(`http://localhost:5000/api/student-sheets/class/${classSheetId}/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        let filtered = data.sheets;
        if (filters.trade) filtered = filtered.filter((s: StudentSheet) => s.trade === filters.trade);
        if (filters.level) filtered = filtered.filter((s: StudentSheet) => s.level === filters.level);
        if (filters.search) filtered = filtered.filter((s: StudentSheet) => 
          s.student_name.toLowerCase().includes(filters.search.toLowerCase()) ||
          s.student_code.toLowerCase().includes(filters.search.toLowerCase())
        );
        setSheets(filtered);
      }
    } catch (error) {
      console.error('Fetch error:', error);
    }
    setLoading(false);
  };

  const viewStudentSheet = async (studentId: number) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`http://localhost:5000/api/student-sheets/${studentId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (data.success) {
      setSelectedSheet(data);
      setModalType('view');
      setShowModal(true);
    }
  };

  const submitMarks = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSheet) return;

    const token = localStorage.getItem('token');
    const res = await fetch(`http://localhost:5000/api/student-sheets/${selectedSheet.sheet.student_id}/marks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(marksForm)
    });
    const data = await res.json();
    if (data.success) {
      alert(`Marks recorded! Total: ${data.total_marks}/100, Grade: ${data.grade}`);
      setShowModal(false);
      fetchSheets();
    }
  };

  const getGradeColor = (grade: string) => {
    if (grade === 'A') return 'text-green-600 bg-green-100';
    if (grade === 'B') return 'text-blue-600 bg-blue-100';
    if (grade === 'C') return 'text-yellow-600 bg-yellow-100';
    if (grade === 'D') return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Users className="w-10 h-10 text-indigo-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Student Sheets Management</h1>
                <p className="text-gray-600">Comprehensive student performance tracking</p>
              </div>
            </div>
            <button className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition">
              <Download className="w-5 h-5" />
              Export All
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
            <select
              value={filters.trade}
              onChange={(e) => setFilters({ ...filters, trade: e.target.value })}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Trades</option>
              <option value="SOD">SOD</option>
              <option value="AUT">AUT</option>
              <option value="BDC">BDC</option>
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
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Student Code</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Trade/Level</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Average</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Grade</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">GPA</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Attendance</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Conduct</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr><td colSpan={9} className="px-6 py-8 text-center text-gray-500">Loading...</td></tr>
                ) : sheets.length === 0 ? (
                  <tr><td colSpan={9} className="px-6 py-8 text-center text-gray-500">No students found</td></tr>
                ) : (
                  sheets.map((sheet) => (
                    <tr key={sheet.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm font-semibold text-indigo-600">{sheet.student_code}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-gray-900">{sheet.student_name}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">{sheet.trade} {sheet.level}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-lg text-gray-900">{sheet.average_marks?.toFixed(1) || '0.0'}%</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${getGradeColor(sheet.overall_grade || 'F')}`}>
                          {sheet.overall_grade || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-gray-900">{sheet.gpa?.toFixed(2) || '0.00'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${sheet.attendance_percentage >= 80 ? 'bg-green-500' : sheet.attendance_percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                              style={{ width: `${sheet.attendance_percentage || 0}%` }}
                            />
                          </div>
                          <span className="text-sm font-semibold">{sheet.attendance_percentage?.toFixed(0) || 0}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${getGradeColor(sheet.conduct_grade || 'F')}`}>
                            {sheet.conduct_score || 0}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => viewStudentSheet(sheet.id)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="View Details"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedSheet({ sheet });
                              setModalType('marks');
                              setShowModal(true);
                            }}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                            title="Add Marks"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {showModal && selectedSheet && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {modalType === 'view' ? 'Student Sheet Details' : 'Add Marks'}
                  </h2>
                  <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                    <span className="text-2xl">&times;</span>
                  </button>
                </div>

                {modalType === 'view' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Academic Performance</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Average Marks:</span>
                            <span className="font-bold text-xl">{selectedSheet.sheet.average_marks?.toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Overall Grade:</span>
                            <span className={`px-3 py-1 rounded-full font-bold ${getGradeColor(selectedSheet.sheet.overall_grade)}`}>
                              {selectedSheet.sheet.overall_grade}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">GPA:</span>
                            <span className="font-bold">{selectedSheet.sheet.gpa?.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Attendance</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Attendance Rate:</span>
                            <span className="font-bold text-xl">{selectedSheet.sheet.attendance_percentage?.toFixed(0)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Days Present:</span>
                            <span className="font-bold">{selectedSheet.sheet.days_present}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Days Absent:</span>
                            <span className="font-bold text-red-600">{selectedSheet.sheet.days_absent}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Subject Performance</h3>
                      <div className="space-y-2">
                        {selectedSheet.subjects?.map((subj: any) => (
                          <div key={subj.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                            <span className="font-medium">{subj.subject}</span>
                            <div className="flex items-center gap-4">
                              <span className="text-sm text-gray-600">{subj.total_marks}/100</span>
                              <span className={`px-2 py-1 rounded text-sm font-bold ${getGradeColor(subj.grade)}`}>
                                {subj.grade}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {modalType === 'marks' && (
                  <form onSubmit={submitMarks} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold mb-2">Subject</label>
                        <input
                          type="text"
                          value={marksForm.subject}
                          onChange={(e) => setMarksForm({ ...marksForm, subject: e.target.value })}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2">Term</label>
                        <select
                          value={marksForm.term}
                          onChange={(e) => setMarksForm({ ...marksForm, term: e.target.value })}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="Term 1">Term 1</option>
                          <option value="Term 2">Term 2</option>
                          <option value="Term 3">Term 3</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-semibold mb-2">Quiz (Max: 20)</label>
                        <input
                          type="number"
                          step="0.01"
                          max="20"
                          value={marksForm.quiz_marks}
                          onChange={(e) => setMarksForm({ ...marksForm, quiz_marks: e.target.value })}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2">Midterm (Max: 30)</label>
                        <input
                          type="number"
                          step="0.01"
                          max="30"
                          value={marksForm.midterm_marks}
                          onChange={(e) => setMarksForm({ ...marksForm, midterm_marks: e.target.value })}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2">Final (Max: 50)</label>
                        <input
                          type="number"
                          step="0.01"
                          max="50"
                          value={marksForm.final_marks}
                          onChange={(e) => setMarksForm({ ...marksForm, final_marks: e.target.value })}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                          required
                        />
                      </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-700">
                        <strong>Auto-calculated Total:</strong> {
                          (parseFloat(marksForm.quiz_marks || '0') + 
                           parseFloat(marksForm.midterm_marks || '0') + 
                           parseFloat(marksForm.final_marks || '0')).toFixed(2)
                        } / 100
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">Remarks</label>
                      <textarea
                        value={marksForm.remarks}
                        onChange={(e) => setMarksForm({ ...marksForm, remarks: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                        rows={3}
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition font-semibold"
                    >
                      Submit Marks (Auto-calculate Grade)
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DOSStudentSheetsPage;
