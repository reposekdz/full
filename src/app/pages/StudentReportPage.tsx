import React, { useState, useEffect } from 'react';
import {
  Assessment,
  TrendingUp,
  TrendingDown,
  School,
  EmojiEvents,
  Download,
  Print,
  Visibility,
  Person,
  CalendarToday,
  BarChart
} from '@mui/icons-material';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

interface SubjectDetail {
  id: number;
  subject_id: number;
  subject_name: string;
  subject_code: string;
  max_marks: number;
  obtained_marks: number;
  percentage: number;
  grade_letter: string;
  class_average: number;
  highest_in_class: number;
  position_in_subject: number;
  teacher_comment: string;
  teacher_first_name: string;
  teacher_last_name: string;
}

interface StudentReport {
  id: number;
  student_id: number;
  first_name: string;
  last_name: string;
  student_number: string;
  class_name: string;
  trade_level: string;
  academic_year_name: string;
  report_type: string;
  total_subjects: number;
  total_marks_obtained: number;
  total_max_marks: number;
  overall_percentage: number;
  overall_grade: string;
  class_rank: number;
  level_rank: number;
  total_students_in_class: number;
  attendance_percentage: number;
  days_present: number;
  days_absent: number;
  conduct_grade: string;
  principal_comment: string;
  class_teacher_comment: string;
  dos_comment: string;
  report_generated_at: string;
  subjects: SubjectDetail[];
}

const StudentReportPage: React.FC = () => {
  const [report, setReport] = useState<StudentReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [rankings, setRankings] = useState<any[]>([]);
  const [showRankings, setShowRankings] = useState(false);

  useEffect(() => {
    fetchStudentReport();
  }, []);

  const fetchStudentReport = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const reportResponse = await axios.get(`${API_BASE_URL}/dos-enhanced/reports/my-report`, config);
      
      if (reportResponse.data.success) {
        setReport(reportResponse.data.data);
      }
    } catch (error) {
      console.error('Error fetching report:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClassRankings = async () => {
    if (!report) return;
    
    try {
      const token = localStorage.getItem('token');
      const config = { 
        headers: { Authorization: `Bearer ${token}` },
        params: {
          trade_class_id: report.class_rank,
          academic_year_id: 1,
          term_id: 1
        }
      };

      const response = await axios.get(`${API_BASE_URL}/dos-enhanced/reports/rankings`, config);
      setRankings(response.data.data || []);
      setShowRankings(true);
    } catch (error) {
      console.error('Error fetching rankings:', error);
    }
  };

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-yellow-600';
    if (percentage >= 60) return 'text-orange-600';
    if (percentage >= 50) return 'text-red-400';
    return 'text-red-600';
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your report...</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <Assessment className="text-gray-400 text-6xl mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No Report Available</h2>
          <p className="text-gray-600">Your academic report has not been generated yet.</p>
          <p className="text-sm text-gray-500 mt-2">Please contact your class teacher or DOS.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-600 rounded-lg">
                <Assessment className="text-white text-3xl" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Academic Report</h1>
                <p className="text-gray-600">{report.academic_year_name} - {report.report_type.replace('_', ' ').toUpperCase()}</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Print />
                <span>Print</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                <Download />
                <span>Download PDF</span>
              </button>
            </div>
          </div>

          {/* Student Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-6 text-white">
            <div>
              <p className="text-sm opacity-90">Student Name</p>
              <p className="text-xl font-bold">{report.first_name} {report.last_name}</p>
            </div>
            <div>
              <p className="text-sm opacity-90">Student Number</p>
              <p className="text-xl font-bold">{report.student_number}</p>
            </div>
            <div>
              <p className="text-sm opacity-90">Class</p>
              <p className="text-xl font-bold">{report.class_name} - {report.trade_level}</p>
            </div>
          </div>
        </div>

        {/* Performance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Overall Percentage</p>
                <p className={`text-4xl font-bold ${getGradeColor(report.overall_percentage)}`}>
                  {report.overall_percentage.toFixed(1)}%
                </p>
                <p className="text-sm text-gray-500 mt-1">Grade: {report.overall_grade}</p>
              </div>
              <TrendingUp className="text-green-600 text-4xl" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Class Rank</p>
                <p className="text-4xl font-bold text-purple-600">
                  {getRankBadge(report.class_rank)}
                </p>
                <p className="text-sm text-gray-500 mt-1">of {report.total_students_in_class} students</p>
              </div>
              <EmojiEvents className="text-yellow-500 text-4xl" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Attendance</p>
                <p className={`text-4xl font-bold ${report.attendance_percentage >= 90 ? 'text-green-600' : 'text-orange-600'}`}>
                  {report.attendance_percentage.toFixed(0)}%
                </p>
                <p className="text-sm text-gray-500 mt-1">{report.days_present} / {report.days_present + report.days_absent} days</p>
              </div>
              <CalendarToday className="text-blue-600 text-4xl" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Subjects</p>
                <p className="text-4xl font-bold text-indigo-600">{report.total_subjects}</p>
                <p className="text-sm text-gray-500 mt-1">Total Subjects</p>
              </div>
              <School className="text-indigo-600 text-4xl" />
            </div>
          </div>
        </div>

        {/* Subject Performance */}
        <div className="bg-white rounded-lg shadow-lg mb-6">
          <div className="p-6 border-b">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <BarChart className="mr-2" />
              Subject-wise Performance
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Marks</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Percentage</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Position</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class Avg</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teacher</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {report.subjects?.map((subject) => (
                  <tr key={subject.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{subject.subject_name}</div>
                      <div className="text-sm text-gray-500">{subject.subject_code}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-semibold">{subject.obtained_marks}</span> / {subject.max_marks}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-lg font-bold ${getGradeColor(subject.percentage)}`}>
                        {subject.percentage.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        subject.grade_letter === 'A+' || subject.grade_letter === 'A' ? 'bg-green-100 text-green-800' :
                        subject.grade_letter === 'B+' || subject.grade_letter === 'B' ? 'bg-blue-100 text-blue-800' :
                        subject.grade_letter === 'C' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {subject.grade_letter}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-semibold text-purple-600">{getRankBadge(subject.position_in_subject)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {subject.class_average?.toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {subject.teacher_first_name} {subject.teacher_last_name}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-100 font-bold">
                <tr>
                  <td className="px-6 py-4">TOTAL</td>
                  <td className="px-6 py-4">{report.total_marks_obtained} / {report.total_max_marks}</td>
                  <td className="px-6 py-4">
                    <span className={`text-lg ${getGradeColor(report.overall_percentage)}`}>
                      {report.overall_percentage.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-6 py-4">{report.overall_grade}</td>
                  <td className="px-6 py-4" colSpan={3}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Teacher Comments */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {report.subjects?.map((subject) => subject.teacher_comment && (
            <div key={subject.id} className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="font-semibold text-lg text-gray-800 mb-2">{subject.subject_name} - Teacher's Comment</h3>
              <p className="text-gray-600 italic">"{subject.teacher_comment}"</p>
              <p className="text-sm text-gray-500 mt-2">- {subject.teacher_first_name} {subject.teacher_last_name}</p>
            </div>
          ))}
        </div>

        {/* Overall Comments */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {report.class_teacher_comment && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold text-lg text-blue-900 mb-3">Class Teacher's Comment</h3>
              <p className="text-blue-800 italic">"{report.class_teacher_comment}"</p>
            </div>
          )}

          {report.dos_comment && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
              <h3 className="font-semibold text-lg text-purple-900 mb-3">DOS Comment</h3>
              <p className="text-purple-800 italic">"{report.dos_comment}"</p>
            </div>
          )}

          {report.principal_comment && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="font-semibold text-lg text-green-900 mb-3">Principal's Comment</h3>
              <p className="text-green-800 italic">"{report.principal_comment}"</p>
            </div>
          )}

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h3 className="font-semibold text-lg text-gray-900 mb-3">Conduct Grade</h3>
            <p className="text-4xl font-bold text-indigo-600">{report.conduct_grade || 'Not Graded'}</p>
          </div>
        </div>

        {/* Class Rankings Button */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <button
            onClick={fetchClassRankings}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 flex items-center justify-center space-x-2"
          >
            <Visibility />
            <span>View Class Rankings</span>
          </button>

          {showRankings && rankings.length > 0 && (
            <div className="mt-6">
              <h3 className="text-xl font-bold mb-4">Class Rankings - Top Performers</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Percentage</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subjects</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Attendance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {rankings.map((student, index) => (
                      <tr 
                        key={student.student_id} 
                        className={`${
                          student.student_id === report.student_id ? 'bg-purple-50 font-bold' : 'hover:bg-gray-50'
                        }`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-2xl">{getRankBadge(student.class_rank)}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {student.first_name} {student.last_name}
                          {student.student_id === report.student_id && (
                            <span className="ml-2 text-xs bg-purple-600 text-white px-2 py-1 rounded">You</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-lg font-bold ${getGradeColor(student.overall_percentage)}`}>
                            {student.overall_percentage.toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                          {student.total_subjects}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                          {student.attendance_percentage?.toFixed(0)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
          <div className="text-center text-sm text-gray-500">
            <p>Report Generated: {new Date(report.report_generated_at).toLocaleDateString()}</p>
            <p className="mt-2">This is an official academic report. For any queries, please contact the DOS office.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentReportPage;
