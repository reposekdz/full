import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Badge } from '@/app/components/ui/badge';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import { Calendar, Users, BookOpen, Clock, Plus, Edit, Trash2, Save, X } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

const DOSManagement = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [timetable, setTimetable] = useState([]);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [showTimetableForm, setShowTimetableForm] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchStats();
    fetchTeachers();
    fetchClasses();
    fetchSubjects();
    fetchAssignments();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE}/dos-management/dashboard-stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setStats(data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await fetch(`${API_BASE}/dos-management/teachers-overview`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setTeachers(data.teachers);
    } catch (error) {
      console.error('Error fetching teachers:', error);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await fetch(`${API_BASE}/classes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setClasses(data.classes || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await fetch(`${API_BASE}/subjects`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setSubjects(data.subjects || []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const fetchAssignments = async () => {
    try {
      const response = await fetch(`${API_BASE}/dos-management/teacher-assignments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setAssignments(data.assignments);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    }
  };

  const fetchTimetable = async (classId) => {
    try {
      const response = await fetch(`${API_BASE}/dos-management/timetable/${classId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setTimetable(data.timetable);
    } catch (error) {
      console.error('Error fetching timetable:', error);
    }
  };

  const handleAssignTeacher = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    try {
      const response = await fetch(`${API_BASE}/dos-management/assign-teacher`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          teacher_id: formData.get('teacher_id'),
          class_id: formData.get('class_id'),
          subject_id: formData.get('subject_id'),
          academic_year_id: 1 // Get from active academic year
        })
      });

      const data = await response.json();
      if (data.success) {
        setMessage({ type: 'success', text: data.message });
        setShowAssignForm(false);
        fetchAssignments();
        fetchTeachers();
        e.target.reset();
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to assign teacher' });
    }
  };

  const handleGenerateTimetable = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const schedule = [{
      day: formData.get('day'),
      start_time: formData.get('start_time'),
      end_time: formData.get('end_time'),
      subject_id: formData.get('subject_id'),
      teacher_id: formData.get('teacher_id'),
      room: formData.get('room')
    }];

    try {
      const response = await fetch(`${API_BASE}/dos-management/generate-timetable`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          class_id: selectedClass,
          academic_year_id: 1,
          schedule
        })
      });

      const data = await response.json();
      if (data.success) {
        setMessage({ type: 'success', text: data.message });
        setShowTimetableForm(false);
        fetchTimetable(selectedClass);
        e.target.reset();
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to generate timetable' });
    }
  };

  const handleRemoveAssignment = async (id) => {
    if (!confirm('Remove this assignment?')) return;

    try {
      const response = await fetch(`${API_BASE}/dos-management/teacher-assignments/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (data.success) {
        setMessage({ type: 'success', text: data.message });
        fetchAssignments();
        fetchTeachers();
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to remove assignment' });
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">DOS Management Dashboard</CardTitle>
          <p className="text-gray-600">Manage teachers, classes, timetables, and assignments</p>
        </CardHeader>

        <CardContent>
          {message.text && (
            <Alert className={`mb-4 ${message.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                {message.text}
              </AlertDescription>
            </Alert>
          )}

          {/* Statistics */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <Card className="border-2 border-blue-200">
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-blue-600">{stats.total_classes}</div>
                  <div className="text-sm text-gray-600">Classes</div>
                </CardContent>
              </Card>
              <Card className="border-2 border-green-200">
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-green-600">{stats.total_teachers}</div>
                  <div className="text-sm text-gray-600">Teachers</div>
                </CardContent>
              </Card>
              <Card className="border-2 border-purple-200">
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-purple-600">{stats.total_students}</div>
                  <div className="text-sm text-gray-600">Students</div>
                </CardContent>
              </Card>
              <Card className="border-2 border-orange-200">
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-orange-600">{stats.teacher_assignments}</div>
                  <div className="text-sm text-gray-600">Assignments</div>
                </CardContent>
              </Card>
              <Card className="border-2 border-pink-200">
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-pink-600">{stats.classes_with_timetable}</div>
                  <div className="text-sm text-gray-600">Timetables</div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b">
            {['overview', 'teachers', 'assignments', 'timetable'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 font-semibold capitalize ${
                  activeTab === tab
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Teachers Overview */}
          {activeTab === 'teachers' && (
            <div>
              <h3 className="text-xl font-bold mb-4">Teachers Overview</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-3 text-left">Name</th>
                      <th className="p-3 text-left">Email</th>
                      <th className="p-3 text-left">Phone</th>
                      <th className="p-3 text-left">Classes</th>
                      <th className="p-3 text-left">Subjects</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teachers.map(teacher => (
                      <tr key={teacher.id} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-semibold">{teacher.first_name} {teacher.last_name}</td>
                        <td className="p-3">{teacher.email}</td>
                        <td className="p-3">{teacher.phone}</td>
                        <td className="p-3">
                          <Badge>{teacher.classes_count} classes</Badge>
                        </td>
                        <td className="p-3">
                          <Badge variant="outline">{teacher.subjects_count} subjects</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Teacher Assignments */}
          {activeTab === 'assignments' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Teacher Assignments</h3>
                <Button onClick={() => setShowAssignForm(!showAssignForm)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Assign Teacher
                </Button>
              </div>

              {showAssignForm && (
                <Card className="mb-6 border-2 border-blue-200 bg-blue-50">
                  <CardContent className="pt-6">
                    <form onSubmit={handleAssignTeacher} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label>Teacher</Label>
                          <select name="teacher_id" required className="w-full p-2 border rounded">
                            <option value="">Select teacher...</option>
                            {teachers.map(t => (
                              <option key={t.id} value={t.id}>{t.first_name} {t.last_name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <Label>Class</Label>
                          <select name="class_id" required className="w-full p-2 border rounded">
                            <option value="">Select class...</option>
                            {classes.map(c => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <Label>Subject</Label>
                          <select name="subject_id" required className="w-full p-2 border rounded">
                            <option value="">Select subject...</option>
                            {subjects.map(s => (
                              <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button type="submit"><Save className="w-4 h-4 mr-2" />Assign</Button>
                        <Button type="button" variant="outline" onClick={() => setShowAssignForm(false)}>
                          <X className="w-4 h-4 mr-2" />Cancel
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-3 text-left">Teacher</th>
                      <th className="p-3 text-left">Class</th>
                      <th className="p-3 text-left">Subject</th>
                      <th className="p-3 text-left">Course</th>
                      <th className="p-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignments.map(assignment => (
                      <tr key={assignment.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">{assignment.first_name} {assignment.last_name}</td>
                        <td className="p-3">{assignment.class_name}</td>
                        <td className="p-3">{assignment.subject_name}</td>
                        <td className="p-3">{assignment.course_name}</td>
                        <td className="p-3">
                          <Button size="sm" variant="destructive" onClick={() => handleRemoveAssignment(assignment.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Timetable */}
          {activeTab === 'timetable' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Class Timetable</h3>
                <div className="flex gap-2">
                  <select
                    onChange={(e) => {
                      setSelectedClass(e.target.value);
                      if (e.target.value) fetchTimetable(e.target.value);
                    }}
                    className="p-2 border rounded"
                  >
                    <option value="">Select class...</option>
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  {selectedClass && (
                    <Button onClick={() => setShowTimetableForm(!showTimetableForm)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Entry
                    </Button>
                  )}
                </div>
              </div>

              {showTimetableForm && selectedClass && (
                <Card className="mb-6 border-2 border-blue-200 bg-blue-50">
                  <CardContent className="pt-6">
                    <form onSubmit={handleGenerateTimetable} className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                          <Label>Day</Label>
                          <select name="day" required className="w-full p-2 border rounded">
                            <option value="">Select day...</option>
                            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                              <option key={day} value={day}>{day}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <Label>Start Time</Label>
                          <Input type="time" name="start_time" required />
                        </div>
                        <div>
                          <Label>End Time</Label>
                          <Input type="time" name="end_time" required />
                        </div>
                        <div>
                          <Label>Subject</Label>
                          <select name="subject_id" required className="w-full p-2 border rounded">
                            <option value="">Select subject...</option>
                            {subjects.map(s => (
                              <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <Label>Teacher</Label>
                          <select name="teacher_id" required className="w-full p-2 border rounded">
                            <option value="">Select teacher...</option>
                            {teachers.map(t => (
                              <option key={t.id} value={t.id}>{t.first_name} {t.last_name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <Label>Room</Label>
                          <Input name="room" placeholder="Room 101" />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button type="submit"><Save className="w-4 h-4 mr-2" />Add to Timetable</Button>
                        <Button type="button" variant="outline" onClick={() => setShowTimetableForm(false)}>
                          <X className="w-4 h-4 mr-2" />Cancel
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              {timetable.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead className="bg-gradient-to-r from-blue-600 to-green-600 text-white">
                      <tr>
                        <th className="p-3 text-left">Day</th>
                        <th className="p-3 text-left">Time</th>
                        <th className="p-3 text-left">Subject</th>
                        <th className="p-3 text-left">Teacher</th>
                        <th className="p-3 text-left">Room</th>
                      </tr>
                    </thead>
                    <tbody>
                      {timetable.map(entry => (
                        <tr key={entry.id} className="border-b hover:bg-gray-50">
                          <td className="p-3 font-semibold">{entry.day_of_week}</td>
                          <td className="p-3">{entry.start_time} - {entry.end_time}</td>
                          <td className="p-3">{entry.subject_name}</td>
                          <td className="p-3">{entry.teacher_first_name} {entry.teacher_last_name}</td>
                          <td className="p-3">{entry.room || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DOSManagement;
