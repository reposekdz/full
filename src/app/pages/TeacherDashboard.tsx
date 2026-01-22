import React, { useState, useEffect } from 'react';
import {
  Person,
  Assignment,
  Schedule,
  Grade,
  Class,
  Assessment,
  Visibility,
  Edit,
  Save,
  CalendarToday,
  TrendingUp,
  Group,
  School
} from '@mui/icons-material';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

interface SubjectAssignment {
  id: number;
  subject_id: number;
  subject_name: string;
  subject_code: string;
  trade_class_id: number;
  class_name: string;
  trade_level: string;
  weekly_periods: number;
  assignment_type: string;
}

interface ClassTeacherAssignment {
  id: number;
  trade_class_id: number;
  class_name: string;
  trade_level: string;
  responsibilities: string;
}

interface TimetableEntry {
  id: number;
  day_of_week: string;
  period_number: number;
  start_time: string;
  end_time: string;
  subject_name: string;
  class_name: string;
  room: string;
  session_type: string;
}

interface Student {
  student_id: number;
  first_name: string;
  last_name: string;
  student_number: string;
  email: string;
  performance?: {
    total_assessments: number;
    average_percentage: number;
  };
}

const TeacherDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [subjectAssignments, setSubjectAssignments] = useState<SubjectAssignment[]>([]);
  const [classTeacherAssignments, setClassTeacherAssignments] = useState<ClassTeacherAssignment[]>([]);
  const [timetable, setTimetable] = useState<{ [key: string]: TimetableEntry[] }>({});
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [loading, setLoading] = useState(false);

  const [marksEntry, setMarksEntry] = useState({
    student_id: '',
    assessment_category_id: '1',
    assessment_name: '',
    max_marks: 100,
    obtained_marks: 0,
    assessment_date: new Date().toISOString().split('T')[0],
    source_type: 'exam',
    remarks: ''
  });

  const [bulkMarksMode, setBulkMarksMode] = useState(false);
  const [bulkMarks, setBulkMarks] = useState<{ [key: number]: number }>({});

  useEffect(() => {
    fetchTeacherData();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchClassStudents();
    }
  }, [selectedClass, selectedSubject]);

  const fetchTeacherData = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const [assignmentsRes, timetableRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/teacher-portal/my-assignments`, config),
        axios.get(`${API_BASE_URL}/teacher-portal/my-timetable`, config)
      ]);

      setSubjectAssignments(assignmentsRes.data.data.subject_assignments || []);
      setClassTeacherAssignments(assignmentsRes.data.data.class_teacher_assignments || []);
      setTimetable(timetableRes.data.data || {});
    } catch (error) {
      console.error('Error fetching teacher data:', error);
    }
  };

  const fetchClassStudents = async () => {
    if (!selectedClass) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const config = { 
        headers: { Authorization: `Bearer ${token}` },
        params: selectedSubject ? { subject_id: selectedSubject } : {}
      };

      const response = await axios.get(
        `${API_BASE_URL}/teacher-portal/class/${selectedClass}/students`,
        config
      );
      
      setStudents(response.data.data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMarks = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_BASE_URL}/teacher-portal/marks`,
        {
          ...marksEntry,
          subject_id: selectedSubject,
          trade_class_id: selectedClass,
          academic_year_id: 1
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert('Marks added successfully!');
      setMarksEntry({
        student_id: '',
        assessment_category_id: '1',
        assessment_name: '',
        max_marks: 100,
        obtained_marks: 0,
        assessment_date: new Date().toISOString().split('T')[0],
        source_type: 'exam',
        remarks: ''
      });
      fetchClassStudents();
    } catch (error: any) {
      alert(`Error: ${error.response?.data?.message || 'Failed to add marks'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkMarksSubmit = async () => {
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const marksArray = Object.entries(bulkMarks).map(([student_id, obtained_marks]) => ({
        student_id: parseInt(student_id),
        obtained_marks
      }));

      await axios.post(
        `${API_BASE_URL}/teacher-portal/marks/bulk`,
        {
          marks_array: marksArray,
          subject_id: selectedSubject,
          trade_class_id: selectedClass,
          academic_year_id: 1,
          assessment_category_id: marksEntry.assessment_category_id,
          assessment_name: marksEntry.assessment_name,
          max_marks: marksEntry.max_marks,
          assessment_date: marksEntry.assessment_date,
          source_type: marksEntry.source_type
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert(`Marks added for ${marksArray.length} students!`);
      setBulkMarks({});
      setBulkMarksMode(false);
      fetchClassStudents();
    } catch (error: any) {
      alert(`Error: ${error.response?.data?.message || 'Failed to add bulk marks'}`);
    } finally {
      setLoading(false);
    }
  };

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-600 rounded-lg">
                <Person className="text-white text-3xl" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Teacher Dashboard</h1>
                <p className="text-gray-600">Manage your classes, assignments, and student assessments</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">My Classes</p>
                <p className="text-3xl font-bold text-green-600">{subjectAssignments.length}</p>
              </div>
              <Class className="text-green-600 text-4xl" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Class Teacher</p>
                <p className="text-3xl font-bold text-blue-600">{classTeacherAssignments.length}</p>
              </div>
              <School className="text-blue-600 text-4xl" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Students</p>
                <p className="text-3xl font-bold text-orange-600">{students.length}</p>
              </div>
              <Group className="text-orange-600 text-4xl" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Avg Performance</p>
                <p className="text-3xl font-bold text-purple-600">85%</p>
              </div>
              <TrendingUp className="text-purple-600 text-4xl" />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-lg mb-6">
          <div className="flex border-b overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: <CalendarToday /> },
              { id: 'assignments', label: 'My Assignments', icon: <Assignment /> },
              { id: 'timetable', label: 'My Timetable', icon: <Schedule /> },
              { id: 'marks', label: 'Add Marks', icon: <Grade /> },
              { id: 'students', label: 'My Students', icon: <Group /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-4 font-semibold transition-colors ${
                  activeTab === tab.id
                    ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                    : 'text-gray-600 hover:text-green-600 hover:bg-gray-50'
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
                <h2 className="text-2xl font-bold mb-4">Welcome Back!</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-r from-green-500 to-teal-600 rounded-lg p-6 text-white">
                    <h3 className="text-xl font-bold mb-2">Quick Info</h3>
                    <ul className="space-y-2">
                      <li>✓ {subjectAssignments.length} Subject Assignments</li>
                      <li>✓ {classTeacherAssignments.length} Class Teacher Assignments</li>
                      <li>✓ View and manage student marks</li>
                      <li>✓ Track class performance</li>
                    </ul>
                  </div>
                  
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg p-6 text-white">
                    <h3 className="text-xl font-bold mb-2">Today's Classes</h3>
                    <p className="text-sm mb-2">Check your timetable for today's schedule</p>
                    <button 
                      onClick={() => setActiveTab('timetable')}
                      className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50"
                    >
                      View Timetable
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'assignments' && (
              <div>
                <h2 className="text-2xl font-bold mb-4">My Assignments</h2>
                
                {/* Subject Assignments */}
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-3">Subject Teaching</h3>
                  <div className="bg-white rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trade Level</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Weekly Periods</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {subjectAssignments.map((assignment) => (
                          <tr key={assignment.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{assignment.subject_name}</div>
                              <div className="text-sm text-gray-500">{assignment.subject_code}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{assignment.class_name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{assignment.trade_level}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{assignment.weekly_periods}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                {assignment.assignment_type}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Class Teacher Assignments */}
                {classTeacherAssignments.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold mb-3">Class Teacher</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {classTeacherAssignments.map((assignment) => (
                        <div key={assignment.id} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <h4 className="font-semibold text-lg">{assignment.class_name}</h4>
                          <p className="text-sm text-gray-600">{assignment.trade_level}</p>
                          <p className="text-sm mt-2">{assignment.responsibilities}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'timetable' && (
              <div>
                <h2 className="text-2xl font-bold mb-4">My Timetable</h2>
                
                <div className="overflow-x-auto">
                  <table className="w-full bg-white rounded-lg overflow-hidden">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                        {daysOfWeek.map((day) => (
                          <th key={day} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            {day}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((period) => (
                        <tr key={period} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap font-medium">Period {period}</td>
                          {daysOfWeek.map((day) => {
                            const entry = timetable[day]?.find((e) => e.period_number === period);
                            return (
                              <td key={day} className="px-6 py-4">
                                {entry ? (
                                  <div className="bg-green-100 rounded p-2">
                                    <div className="text-sm font-semibold">{entry.subject_name}</div>
                                    <div className="text-xs text-gray-600">{entry.class_name}</div>
                                    <div className="text-xs text-gray-500">{entry.start_time} - {entry.end_time}</div>
                                    {entry.room && <div className="text-xs text-gray-500">Room: {entry.room}</div>}
                                  </div>
                                ) : (
                                  <div className="text-gray-400 text-sm">-</div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'marks' && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Add Student Marks</h2>
                
                {/* Class and Subject Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="px-4 py-2 border rounded-lg"
                  >
                    <option value="">Select Class</option>
                    {subjectAssignments.map((assignment) => (
                      <option key={assignment.trade_class_id} value={assignment.trade_class_id}>
                        {assignment.class_name} - {assignment.trade_level}
                      </option>
                    ))}
                  </select>
                  
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="px-4 py-2 border rounded-lg"
                    disabled={!selectedClass}
                  >
                    <option value="">Select Subject</option>
                    {subjectAssignments
                      .filter((a) => a.trade_class_id.toString() === selectedClass)
                      .map((assignment) => (
                        <option key={assignment.subject_id} value={assignment.subject_id}>
                          {assignment.subject_name}
                        </option>
                      ))}
                  </select>
                </div>

                {selectedClass && selectedSubject && (
                  <div>
                    {/* Mode Toggle */}
                    <div className="flex space-x-4 mb-4">
                      <button
                        onClick={() => setBulkMarksMode(false)}
                        className={`px-4 py-2 rounded-lg ${
                          !bulkMarksMode ? 'bg-green-600 text-white' : 'bg-gray-200'
                        }`}
                      >
                        Individual Entry
                      </button>
                      <button
                        onClick={() => setBulkMarksMode(true)}
                        className={`px-4 py-2 rounded-lg ${
                          bulkMarksMode ? 'bg-green-600 text-white' : 'bg-gray-200'
                        }`}
                      >
                        Bulk Entry
                      </button>
                    </div>

                    {!bulkMarksMode ? (
                      <div className="bg-gray-50 rounded-lg p-6">
                        <h3 className="text-xl font-semibold mb-4">Add Individual Marks</h3>
                        <form onSubmit={handleAddMarks} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <select
                            value={marksEntry.student_id}
                            onChange={(e) => setMarksEntry({ ...marksEntry, student_id: e.target.value })}
                            className="px-4 py-2 border rounded-lg"
                            required
                          >
                            <option value="">Select Student</option>
                            {students.map((student) => (
                              <option key={student.student_id} value={student.student_id}>
                                {student.first_name} {student.last_name} ({student.student_number})
                              </option>
                            ))}
                          </select>
                          
                          <input
                            type="text"
                            placeholder="Assessment Name"
                            value={marksEntry.assessment_name}
                            onChange={(e) => setMarksEntry({ ...marksEntry, assessment_name: e.target.value })}
                            className="px-4 py-2 border rounded-lg"
                            required
                          />
                          
                          <select
                            value={marksEntry.source_type}
                            onChange={(e) => setMarksEntry({ ...marksEntry, source_type: e.target.value })}
                            className="px-4 py-2 border rounded-lg"
                          >
                            <option value="quiz">Quiz</option>
                            <option value="assignment">Assignment</option>
                            <option value="exam">Exam</option>
                            <option value="practical">Practical</option>
                            <option value="homework">Homework</option>
                          </select>
                          
                          <input
                            type="number"
                            placeholder="Max Marks"
                            value={marksEntry.max_marks}
                            onChange={(e) => setMarksEntry({ ...marksEntry, max_marks: parseFloat(e.target.value) })}
                            className="px-4 py-2 border rounded-lg"
                            required
                          />
                          
                          <input
                            type="number"
                            placeholder="Obtained Marks"
                            value={marksEntry.obtained_marks}
                            onChange={(e) => setMarksEntry({ ...marksEntry, obtained_marks: parseFloat(e.target.value) })}
                            className="px-4 py-2 border rounded-lg"
                            required
                          />
                          
                          <input
                            type="date"
                            value={marksEntry.assessment_date}
                            onChange={(e) => setMarksEntry({ ...marksEntry, assessment_date: e.target.value })}
                            className="px-4 py-2 border rounded-lg"
                            required
                          />
                          
                          <textarea
                            placeholder="Remarks (optional)"
                            value={marksEntry.remarks}
                            onChange={(e) => setMarksEntry({ ...marksEntry, remarks: e.target.value })}
                            className="px-4 py-2 border rounded-lg md:col-span-2"
                            rows={2}
                          />
                          
                          <button
                            type="submit"
                            disabled={loading}
                            className="md:col-span-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
                          >
                            {loading ? 'Adding...' : 'Add Marks'}
                          </button>
                        </form>
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-lg p-6">
                        <h3 className="text-xl font-semibold mb-4">Bulk Marks Entry</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <input
                            type="text"
                            placeholder="Assessment Name"
                            value={marksEntry.assessment_name}
                            onChange={(e) => setMarksEntry({ ...marksEntry, assessment_name: e.target.value })}
                            className="px-4 py-2 border rounded-lg"
                            required
                          />
                          
                          <input
                            type="number"
                            placeholder="Max Marks"
                            value={marksEntry.max_marks}
                            onChange={(e) => setMarksEntry({ ...marksEntry, max_marks: parseFloat(e.target.value) })}
                            className="px-4 py-2 border rounded-lg"
                            required
                          />
                          
                          <select
                            value={marksEntry.source_type}
                            onChange={(e) => setMarksEntry({ ...marksEntry, source_type: e.target.value })}
                            className="px-4 py-2 border rounded-lg"
                          >
                            <option value="quiz">Quiz</option>
                            <option value="assignment">Assignment</option>
                            <option value="exam">Exam</option>
                            <option value="practical">Practical</option>
                          </select>
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full bg-white rounded-lg">
                            <thead className="bg-gray-100">
                              <tr>
                                <th className="px-4 py-2 text-left">Student</th>
                                <th className="px-4 py-2 text-left">Obtained Marks</th>
                              </tr>
                            </thead>
                            <tbody>
                              {students.map((student) => (
                                <tr key={student.student_id} className="border-b">
                                  <td className="px-4 py-2">
                                    {student.first_name} {student.last_name}
                                  </td>
                                  <td className="px-4 py-2">
                                    <input
                                      type="number"
                                      min="0"
                                      max={marksEntry.max_marks}
                                      value={bulkMarks[student.student_id] || 0}
                                      onChange={(e) =>
                                        setBulkMarks({
                                          ...bulkMarks,
                                          [student.student_id]: parseFloat(e.target.value)
                                        })
                                      }
                                      className="px-4 py-2 border rounded-lg w-full"
                                    />
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        
                        <button
                          onClick={handleBulkMarksSubmit}
                          disabled={loading || Object.keys(bulkMarks).length === 0}
                          className="mt-4 w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                        >
                          {loading ? 'Submitting...' : `Submit Marks for ${Object.keys(bulkMarks).length} Students`}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'students' && (
              <div>
                <h2 className="text-2xl font-bold mb-4">My Students</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="px-4 py-2 border rounded-lg"
                  >
                    <option value="">Select Class</option>
                    {subjectAssignments.map((assignment) => (
                      <option key={assignment.trade_class_id} value={assignment.trade_class_id}>
                        {assignment.class_name} - {assignment.trade_level}
                      </option>
                    ))}
                  </select>
                  
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="px-4 py-2 border rounded-lg"
                    disabled={!selectedClass}
                  >
                    <option value="">Select Subject (Optional)</option>
                    {subjectAssignments
                      .filter((a) => a.trade_class_id.toString() === selectedClass)
                      .map((assignment) => (
                        <option key={assignment.subject_id} value={assignment.subject_id}>
                          {assignment.subject_name}
                        </option>
                      ))}
                  </select>
                </div>

                {selectedClass && students.length > 0 && (
                  <div className="bg-white rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student Number</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                          {selectedSubject && (
                            <>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assessments</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Average</th>
                            </>
                          )}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {students.map((student) => (
                          <tr key={student.student_id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{student.student_number}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {student.first_name} {student.last_name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.email}</td>
                            {selectedSubject && student.performance && (
                              <>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{student.performance.total_assessments}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                  <span className={`font-semibold ${
                                    student.performance.average_percentage >= 70 ? 'text-green-600' :
                                    student.performance.average_percentage >= 50 ? 'text-orange-600' :
                                    'text-red-600'
                                  }`}>
                                    {student.performance.average_percentage?.toFixed(1)}%
                                  </span>
                                </td>
                              </>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
