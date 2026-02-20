import React, { useState, useEffect } from 'react';
import { Users, BookOpen, CheckCircle, XCircle, Search, Download, Calendar, Send, RefreshCw, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/app/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { toast } from 'sonner';

const API_BASE = 'http://localhost:5000/api';

const AdvancedTeacherDashboard = () => {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [grades, setGrades] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTrade, setSelectedTrade] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [trades, setTrades] = useState([]);
  const [levels, setLevels] = useState([]);
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [gradeForm, setGradeForm] = useState({ student_id: '', course_id: '', grade: '' });

  const authHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch students
      try {
        const studentsResponse = await fetch(`${API_BASE}/global-sheets/students`, { 
          headers: authHeaders() 
        });
        
        if (studentsResponse.ok) {
          const studentsData = await studentsResponse.json();
          if (studentsData.success && studentsData.students) {
            setStudents(studentsData.students);
            
            // Extract unique trades and levels from real data
            const uniqueTrades = [...new Set(studentsData.students.map(s => s.trade_code).filter(Boolean))];
            const uniqueLevels = [...new Set(studentsData.students.map(s => s.level_number).filter(Boolean))].sort((a, b) => a - b);
            
            setTrades(uniqueTrades);
            setLevels(uniqueLevels);
          }
        } else {
          console.warn('Students API failed:', studentsResponse.status);
        }
      } catch (err) {
        console.warn('Students fetch error:', err);
      }

      // Fetch courses
      try {
        const coursesResponse = await fetch(`${API_BASE}/teacher/courses`, { 
          headers: authHeaders() 
        });
        if (coursesResponse.ok) {
          const coursesData = await coursesResponse.json();
          if (coursesData.success && coursesData.courses) {
            setCourses(coursesData.courses);
          }
        }
      } catch (err) {
        console.warn('Courses fetch error:', err);
      }

      // Fetch grades
      try {
        const gradesResponse = await fetch(`${API_BASE}/teacher/grades`, { 
          headers: authHeaders() 
        });
        if (gradesResponse.ok) {
          const gradesData = await gradesResponse.json();
          if (gradesData.success && gradesData.grades) {
            setGrades(gradesData.grades);
          }
        }
      } catch (err) {
        console.warn('Grades fetch error:', err);
      }

      // Fetch attendance
      try {
        const attendanceResponse = await fetch(`${API_BASE}/teacher/attendance`, { 
          headers: authHeaders() 
        });
        if (attendanceResponse.ok) {
          const attendanceData = await attendanceResponse.json();
          if (attendanceData.success && attendanceData.attendance) {
            setAttendance(attendanceData.attendance);
          }
        }
      } catch (err) {
        console.warn('Attendance fetch error:', err);
      }

    } catch (err) {
      console.error('Fetch error:', err);
      setError('Ikibazo cyo gukuramo amakuru');
    } finally {
      setLoading(false);
    }
  };

  const markAttendance = async (studentId, status) => {
    try {
      const response = await fetch(`${API_BASE}/teacher/attendance/mark`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ 
          student_id: studentId, 
          date: attendanceDate, 
          status,
          course_id: courses.length > 0 ? courses[0].course_id : null
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          toast.success('Kwitabira byanditswe neza');
          // Add to local state immediately
          setAttendance(prev => [...prev, { 
            student_id: studentId, 
            date: attendanceDate, 
            status,
            created_at: new Date().toISOString()
          }]);
        } else {
          toast.error(data.message || 'Byanze');
        }
      } else {
        toast.error('Byanze kwandika');
      }
    } catch (error) {
      console.error('Attendance error:', error);
      toast.error('Ikibazo');
    }
  };

  const submitGrade = async () => {
    if (!gradeForm.student_id || !gradeForm.course_id || !gradeForm.grade) {
      toast.error('Uzuza byose');
      return;
    }

    if (gradeForm.grade < 0 || gradeForm.grade > 100) {
      toast.error('Amanota agomba kuba hagati ya 0 na 100');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/teacher/grades/submit`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          student_id: parseInt(gradeForm.student_id),
          course_id: parseInt(gradeForm.course_id),
          grade: parseFloat(gradeForm.grade)
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          toast.success('Amanota yanditswe neza');
          // Add to local state immediately
          setGrades(prev => [...prev, {
            student_id: parseInt(gradeForm.student_id),
            course_id: parseInt(gradeForm.course_id),
            grade: parseFloat(gradeForm.grade),
            created_at: new Date().toISOString()
          }]);
          setGradeForm({ student_id: '', course_id: '', grade: '' });
        } else {
          toast.error(data.message || 'Byanze');
        }
      } else {
        toast.error('Byanze kwandika');
      }
    } catch (error) {
      console.error('Grade error:', error);
      toast.error('Ikibazo');
    }
  };

  const exportData = () => {
    try {
      const csv = [
        ['Code', 'Izina', 'Umwuga', 'Urwego', 'Kwitabira', 'Amanota'],
        ...filteredStudents.map(s => [
          s.student_code || 'N/A',
          `${s.first_name || ''} ${s.last_name || ''}`.trim(),
          s.trade_code || 'N/A',
          s.level_number || 'N/A',
          getAttendanceRate(s.student_id) + '%',
          getAvgGrade(s.student_id) + '%'
        ])
      ].map(row => row.join(',')).join('\n');
      
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `abanyeshuri_${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Byakuwe neza');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Byanze gukuramo');
    }
  };

  const getAttendanceRate = (studentId) => {
    const records = attendance.filter(a => a.student_id === studentId);
    if (records.length === 0) return 0;
    const present = records.filter(a => a.status === 'present').length;
    return Math.round((present / records.length) * 100);
  };

  const getAvgGrade = (studentId) => {
    const studentGrades = grades.filter(g => g.student_id === studentId);
    if (studentGrades.length === 0) return 0;
    return Math.round(studentGrades.reduce((sum, g) => sum + (g.grade || 0), 0) / studentGrades.length);
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch = (s.first_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (s.last_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (s.student_code?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesTrade = selectedTrade === 'all' || s.trade_code === selectedTrade;
    const matchesLevel = selectedLevel === 'all' || s.level_number == selectedLevel;
    return matchesSearch && matchesTrade && matchesLevel;
  });

  const StatCard = ({ icon: Icon, title, value, color }) => (
    <Card className={`bg-gradient-to-br ${color} border-0 shadow-lg hover:shadow-xl transition-all`}>
      <CardContent className="p-6 text-white">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-white/80 text-sm mb-1">{title}</p>
            <p className="text-4xl font-bold">{value}</p>
          </div>
          <Icon className="w-12 h-12 opacity-80" />
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Tegereza...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Ikibanza cy'Umwarimu
          </h1>
          <p className="text-gray-600">Gucunga abanyeshuri n'amanota</p>
        </div>

        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-600">{error}</p>
              <Button size="sm" variant="outline" onClick={fetchData} className="ml-auto">
                <RefreshCw className="w-4 h-4 mr-2" /> Ongera ugerageze
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
          <StatCard icon={Users} title="Abanyeshuri" value={students.length} color="from-blue-500 to-blue-600" />
          <StatCard icon={BookOpen} title="Amasomo" value={courses.length} color="from-green-500 to-green-600" />
          <StatCard 
            icon={CheckCircle} 
            title="Kwitabira" 
            value={`${students.length > 0 ? Math.round(students.reduce((sum, s) => sum + getAttendanceRate(s.student_id), 0) / students.length) : 0}%`} 
            color="from-orange-500 to-orange-600" 
          />
          <StatCard 
            icon={BookOpen} 
            title="Impera" 
            value={`${students.length > 0 ? Math.round(students.reduce((sum, s) => sum + getAvgGrade(s.student_id), 0) / students.length) : 0}%`} 
            color="from-purple-500 to-purple-600" 
          />
        </div>

        <Card className="shadow-xl">
          <Tabs defaultValue="students" className="w-full">
            <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent flex-wrap">
              <TabsTrigger value="students" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-blue-50 px-4 md:px-6 py-3">
                Abanyeshuri ({filteredStudents.length})
              </TabsTrigger>
              <TabsTrigger value="grades" className="rounded-none border-b-2 border-transparent data-[state=active]:border-green-600 data-[state=active]:bg-green-50 px-4 md:px-6 py-3">
                Amanota ({grades.length})
              </TabsTrigger>
              <TabsTrigger value="attendance" className="rounded-none border-b-2 border-transparent data-[state=active]:border-orange-600 data-[state=active]:bg-orange-50 px-4 md:px-6 py-3">
                Kwitabira
              </TabsTrigger>
            </TabsList>

            <TabsContent value="students" className="p-4 md:p-6">
              <div className="mb-4 flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input placeholder="Shakisha izina cyangwa code..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <select className="px-4 py-2 border rounded-lg bg-white" value={selectedTrade} onChange={(e) => setSelectedTrade(e.target.value)}>
                  <option value="all">Imyuga yose ({students.length})</option>
                  {trades.map(trade => {
                    const count = students.filter(s => s.trade_code === trade).length;
                    return <option key={trade} value={trade}>{trade} ({count})</option>;
                  })}
                </select>
                <select className="px-4 py-2 border rounded-lg bg-white" value={selectedLevel} onChange={(e) => setSelectedLevel(e.target.value)}>
                  <option value="all">Inzego zose ({students.length})</option>
                  {levels.map(level => {
                    const count = students.filter(s => s.level_number == level).length;
                    return <option key={level} value={level}>Urwego {level} ({count})</option>;
                  })}
                </select>
                <Button variant="outline" onClick={exportData} disabled={filteredStudents.length === 0}>
                  <Download className="w-4 h-4 mr-2" /> CSV
                </Button>
              </div>

              {filteredStudents.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">Nta banyeshuri babonetse</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left p-3 font-semibold">Umwanyeshuri</th>
                        <th className="text-left p-3 font-semibold">Umwuga</th>
                        <th className="text-left p-3 font-semibold">Urwego</th>
                        <th className="text-left p-3 font-semibold">Kwitabira</th>
                        <th className="text-left p-3 font-semibold">Amanota</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.map((student) => {
                        const attendanceRate = getAttendanceRate(student.student_id);
                        const avgGrade = getAvgGrade(student.student_id);
                        return (
                          <tr key={student.student_id} className="border-b hover:bg-gray-50 transition-colors">
                            <td className="p-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white font-bold text-sm">
                                  {(student.first_name?.[0] || '?')}{(student.last_name?.[0] || '')}
                                </div>
                                <div>
                                  <p className="font-medium">{student.first_name} {student.last_name}</p>
                                  <p className="text-sm text-gray-500">{student.student_code}</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-3"><Badge variant="outline">{student.trade_code || 'N/A'}</Badge></td>
                            <td className="p-3">L{student.level_number || '?'}</td>
                            <td className="p-3">
                              <Badge className={attendanceRate >= 80 ? 'bg-green-500' : attendanceRate >= 60 ? 'bg-yellow-500' : 'bg-red-500'}>
                                {attendanceRate}%
                              </Badge>
                            </td>
                            <td className="p-3">
                              <Badge className={avgGrade >= 80 ? 'bg-green-500' : avgGrade >= 60 ? 'bg-yellow-500' : 'bg-red-500'}>
                                {avgGrade}%
                              </Badge>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </TabsContent>

            <TabsContent value="grades" className="p-4 md:p-6">
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold mb-3 text-blue-900">Andika Amanota Mashya</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <select 
                    className="px-4 py-2 border rounded-lg bg-white" 
                    value={gradeForm.course_id} 
                    onChange={(e) => setGradeForm({...gradeForm, course_id: e.target.value})}
                  >
                    <option value="">Hitamo isomo</option>
                    {courses.map(c => <option key={c.course_id} value={c.course_id}>{c.course_name}</option>)}
                  </select>
                  <select 
                    className="px-4 py-2 border rounded-lg bg-white" 
                    value={gradeForm.student_id} 
                    onChange={(e) => setGradeForm({...gradeForm, student_id: e.target.value})}
                  >
                    <option value="">Hitamo umwanyeshuri</option>
                    {students.map(s => (
                      <option key={s.student_id} value={s.student_id}>
                        {s.first_name} {s.last_name} ({s.student_code})
                      </option>
                    ))}
                  </select>
                  <Input 
                    type="number" 
                    placeholder="Amanota (0-100)" 
                    min="0" 
                    max="100" 
                    value={gradeForm.grade} 
                    onChange={(e) => setGradeForm({...gradeForm, grade: e.target.value})} 
                  />
                  <Button onClick={submitGrade} className="bg-green-500 hover:bg-green-600">
                    <Send className="w-4 h-4 mr-2" /> Ohereza
                  </Button>
                </div>
              </div>

              {grades.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">Nta manota yanditswe</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left p-3 font-semibold">Umwanyeshuri</th>
                        <th className="text-left p-3 font-semibold">Isomo</th>
                        <th className="text-left p-3 font-semibold">Amanota</th>
                        <th className="text-left p-3 font-semibold">Icyiciro</th>
                        <th className="text-left p-3 font-semibold">Itariki</th>
                      </tr>
                    </thead>
                    <tbody>
                      {grades.map((grade, idx) => {
                        const student = students.find(s => s.student_id === grade.student_id);
                        const course = courses.find(c => c.course_id === grade.course_id);
                        const gradeLevel = grade.grade >= 90 ? 'A' : grade.grade >= 80 ? 'B' : grade.grade >= 70 ? 'C' : grade.grade >= 60 ? 'D' : 'F';
                        return (
                          <tr key={idx} className="border-b hover:bg-gray-50">
                            <td className="p-3">{student ? `${student.first_name} ${student.last_name}` : 'Unknown'}</td>
                            <td className="p-3">{course?.course_name || 'Unknown'}</td>
                            <td className="p-3">
                              <Badge className={grade.grade >= 80 ? 'bg-green-500' : grade.grade >= 60 ? 'bg-yellow-500' : 'bg-red-500'}>
                                {grade.grade}%
                              </Badge>
                            </td>
                            <td className="p-3"><Badge variant="outline">{gradeLevel}</Badge></td>
                            <td className="p-3 text-sm text-gray-600">{new Date(grade.created_at).toLocaleDateString('rw-RW')}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </TabsContent>

            <TabsContent value="attendance" className="p-4 md:p-6">
              <div className="mb-4 flex gap-3 items-center">
                <Input 
                  type="date" 
                  value={attendanceDate} 
                  onChange={(e) => setAttendanceDate(e.target.value)} 
                  className="max-w-xs" 
                />
                <Button onClick={fetchData} variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" /> Kuvugurura
                </Button>
              </div>

              {filteredStudents.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">Nta banyeshuri babonetse</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredStudents.map((student) => (
                    <Card key={student.student_id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white font-bold text-sm">
                            {(student.first_name?.[0] || '?')}{(student.last_name?.[0] || '')}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{student.first_name} {student.last_name}</p>
                            <p className="text-xs text-gray-500">{student.student_code}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            className="flex-1 bg-green-500 hover:bg-green-600" 
                            onClick={() => markAttendance(student.student_id, 'present')}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" /> Yaje
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive" 
                            className="flex-1" 
                            onClick={() => markAttendance(student.student_id, 'absent')}
                          >
                            <XCircle className="w-4 h-4 mr-1" /> Ntiyaje
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default AdvancedTeacherDashboard;
