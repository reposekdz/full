import React, { useState, useEffect } from 'react';
import { Users, BookOpen, Award, TrendingUp, Calendar, FileText, Search, Plus, Download, Edit, Trash2, X, Mail, Phone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/app/components/ui/dialog';
import { Label } from '@/app/components/ui/label';
import GlobalStudentSheetsWithParents from '@/app/components/GlobalStudentSheetsWithParents';
import TimetableGenerator from '@/app/components/TimetableGenerator';

const API_BASE = 'http://localhost:5000/api';

const AdvancedDOSDashboard = () => {
  const [stats, setStats] = useState({ 
    total_students: 0, 
    total_teachers: 0, 
    total_courses: 0, 
    avg_attendance: 0 
  });
  const [activeTab, setActiveTab] = useState('students');
  const [searchQuery, setSearchQuery] = useState('');
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddTeacher, setShowAddTeacher] = useState(false);
  const [showEditTeacher, setShowEditTeacher] = useState(false);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [teacherForm, setTeacherForm] = useState({
    first_name: '',
    last_name: ''
  });
  const [studentForm, setStudentForm] = useState({
    first_name: '',
    last_name: '',
    student_code: '',
    trade_code: 'SOD',
    level_number: 4,
    gender: 'M',
    phone: ''
  });

  useEffect(() => {
    fetchStats();
    if (activeTab === 'students') fetchStudents();
    if (activeTab === 'teachers') fetchTeachers();
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE}/comprehensive-roles/students-summary`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) setStats(data.summary || stats);
    } catch (error) {
      console.error('Stats error:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/global-sheets/students?search=${searchQuery}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) setStudents(data.students || []);
    } catch (error) {
      console.error('Students error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/teachers/list`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) setTeachers(data.teachers || []);
    } catch (error) {
      console.error('Teachers error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async () => {
    if (!studentForm.first_name || !studentForm.last_name || !studentForm.student_code) {
      alert('Uzuza amazina n\'ikode!');
      return;
    }
    try {
      const response = await fetch(`${API_BASE}/global-student-sheets/students/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(studentForm)
      });
      const data = await response.json();
      if (data.success) {
        alert('Umunyeshuri yongeweho neza!');
        setShowAddStudent(false);
        setStudentForm({ first_name: '', last_name: '', student_code: '', trade_code: 'SOD', level_number: 4, gender: 'M', phone: '' });
        fetchStudents();
      } else {
        alert('Ikosa: ' + (data.error || 'Ikosa ryabaye'));
      }
    } catch (error) {
      console.error('Add student error:', error);
      alert('Ikosa ryabaye: ' + error.message);
    }
  };

  const handleAddTeacher = async () => {
    if (!teacherForm.first_name || !teacherForm.last_name) {
      alert('Uzuza amazina yombi!');
      return;
    }
    try {
      const email = `${teacherForm.first_name.toLowerCase()}.${teacherForm.last_name.toLowerCase()}@garden.rw`;
      const response = await fetch(`${API_BASE}/teachers/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ ...teacherForm, email })
      });
      const data = await response.json();
      if (data.success) {
        alert('Umwarimu yongeweho neza!');
        setShowAddTeacher(false);
        setTeacherForm({ first_name: '', last_name: '' });
        fetchTeachers();
      } else {
        alert('Ikosa: ' + (data.message || 'Ikosa ryabaye'));
        console.error('Error details:', data);
      }
    } catch (error) {
      console.error('Add teacher error:', error);
      alert('Ikosa ryabaye: ' + error.message);
    }
  };

  const handleEditTeacher = async () => {
    if (!teacherForm.first_name || !teacherForm.last_name) {
      alert('Uzuza amazina yombi!');
      return;
    }
    try {
      const response = await fetch(`${API_BASE}/teachers/update/${selectedTeacher.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(teacherForm)
      });
      const data = await response.json();
      if (data.success) {
        alert('Amakuru yahindutse neza!');
        setShowEditTeacher(false);
        setSelectedTeacher(null);
        setTeacherForm({ first_name: '', last_name: '' });
        fetchTeachers();
      } else {
        alert(data.message || 'Ikosa ryabaye');
      }
    } catch (error) {
      console.error('Edit teacher error:', error);
      alert('Ikosa ryabaye');
    }
  };

  const handleDeleteTeacher = async (id) => {
    if (!confirm('Urashaka gusiba uyu mwarimu?')) return;
    try {
      const response = await fetch(`${API_BASE}/teachers/delete/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) {
        alert('Umwarimu yasibwe neza!');
        fetchTeachers();
      } else {
        alert(data.message || 'Ikosa ryabaye');
      }
    } catch (error) {
      console.error('Delete teacher error:', error);
      alert('Ikosa ryabaye');
    }
  };

  const openEditDialog = (teacher) => {
    setSelectedTeacher(teacher);
    setTeacherForm({
      first_name: teacher.first_name,
      last_name: teacher.last_name
    });
    setShowEditTeacher(true);
  };

  const StatCard = ({ icon: Icon, title, value, color }) => (
    <Card className={`bg-gradient-to-br ${color} border-0 shadow-lg hover:shadow-xl transition-shadow`}>
      <CardContent className="p-6 text-white">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-white/80 text-sm mb-1">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
          </div>
          <Icon className="w-10 h-10 opacity-80" />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <>
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Ikibanza cy'Umuyobozi w'Amasomo
          </h1>
          <p className="text-gray-600">Gucunga abanyeshuri, amasomo, n'imyitwarire</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard icon={Users} title="Abanyeshuri" value={stats.total_students || 0} color="from-blue-500 to-blue-600" />
          <StatCard icon={BookOpen} title="Abarimu" value={stats.total_teachers || 0} color="from-purple-500 to-purple-600" />
          <StatCard icon={Award} title="Amasomo" value={stats.total_courses || 0} color="from-green-500 to-green-600" />
          <StatCard icon={TrendingUp} title="Kwitabira (%)" value={`${stats.avg_attendance || 0}%`} color="from-orange-500 to-orange-600" />
        </div>

        <Card className="shadow-xl">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
              <TabsTrigger value="students" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-blue-50 px-6 py-3">
                Abanyeshuri
              </TabsTrigger>
              <TabsTrigger value="teachers" className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:bg-purple-50 px-6 py-3">
                Abarimu
              </TabsTrigger>
              <TabsTrigger value="timetable" className="rounded-none border-b-2 border-transparent data-[state=active]:border-green-600 data-[state=active]:bg-green-50 px-6 py-3">
                Igihe cy'Amasomo
              </TabsTrigger>
              <TabsTrigger value="reports" className="rounded-none border-b-2 border-transparent data-[state=active]:border-orange-600 data-[state=active]:bg-orange-50 px-6 py-3">
                Raporo
              </TabsTrigger>
            </TabsList>

            <TabsContent value="students" className="p-6">
              <div className="mb-4 flex justify-between">
                <h3 className="text-xl font-bold">Abanyeshuri n'Ababyeyi</h3>
                <Button onClick={() => setShowAddStudent(true)} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Ongeraho Umunyeshuri
                </Button>
              </div>
              <GlobalStudentSheetsWithParents />
            </TabsContent>

            <TabsContent value="teachers" className="p-6">
              <div className="mb-4 flex justify-between">
                <h3 className="text-xl font-bold">Abarimu ({teachers.length})</h3>
                <Button onClick={() => setShowAddTeacher(true)} className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Ongeraho Umwarimu
                </Button>
              </div>
              {loading ? (
                <div className="text-center py-12">Gukurura amakuru...</div>
              ) : teachers.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p>Nta barimu babonetse</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {teachers.map((teacher) => (
                    <Card key={teacher.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h4 className="font-bold text-lg">{teacher.first_name} {teacher.last_name}</h4>
                            <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                              <Mail className="w-3 h-3" />
                              <span>{teacher.email}</span>
                            </div>
                            {teacher.phone && (
                              <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                                <Phone className="w-3 h-3" />
                                <span>{teacher.phone}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="ghost" onClick={() => openEditDialog(teacher)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => handleDeleteTeacher(teacher.id)} className="text-red-600 hover:text-red-700">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t">
                          <div className="text-center">
                            <p className="text-xs text-gray-500">Amasomo</p>
                            <p className="text-lg font-bold text-purple-600">{teacher.class_count || 0}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-gray-500">Abanyeshuri</p>
                            <p className="text-lg font-bold text-blue-600">{teacher.student_count || 0}</p>
                          </div>
                        </div>
                        <div className="mt-3">
                          <span className={`inline-block px-2 py-1 rounded text-xs ${teacher.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {teacher.is_active ? 'Akora' : 'Ntakora'}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="timetable" className="p-6">
              <TimetableGenerator />
            </TabsContent>

            <TabsContent value="reports" className="p-6">
              <div className="mb-4 flex justify-between">
                <h3 className="text-xl font-bold">Raporo z'Abanyeshuri</h3>
                <Button>
                  <Download className="w-4 h-4 mr-2" />
                  Kurura Raporo
                </Button>
              </div>
              <div className="text-center py-12 text-gray-500">
                <FileText className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p>Report card generation coming soon</p>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>

    {/* Add Teacher Dialog */}
    <Dialog open={showAddTeacher} onOpenChange={setShowAddTeacher}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Ongeraho Umwarimu Mushya</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label>Izina rya Mbere *</Label>
            <Input
              value={teacherForm.first_name}
              onChange={(e) => setTeacherForm({...teacherForm, first_name: e.target.value})}
              placeholder="Izina rya mbere"
            />
          </div>
          <div>
            <Label>Izina ry'Umuryango *</Label>
            <Input
              value={teacherForm.last_name}
              onChange={(e) => setTeacherForm({...teacherForm, last_name: e.target.value})}
              placeholder="Izina ry'umuryango"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowAddTeacher(false)}>Hagarika</Button>
          <Button onClick={handleAddTeacher} className="bg-purple-600 hover:bg-purple-700">Bika</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* Edit Teacher Dialog */}
    <Dialog open={showEditTeacher} onOpenChange={setShowEditTeacher}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Hindura Amakuru y'Umwarimu</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label>Izina rya Mbere *</Label>
            <Input
              value={teacherForm.first_name}
              onChange={(e) => setTeacherForm({...teacherForm, first_name: e.target.value})}
              placeholder="Izina rya mbere"
            />
          </div>
          <div>
            <Label>Izina ry'Umuryango *</Label>
            <Input
              value={teacherForm.last_name}
              onChange={(e) => setTeacherForm({...teacherForm, last_name: e.target.value})}
              placeholder="Izina ry'umuryango"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowEditTeacher(false)}>Hagarika</Button>
          <Button onClick={handleEditTeacher} className="bg-purple-600 hover:bg-purple-700">Bika Impinduka</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* Add Student Dialog */}
    <Dialog open={showAddStudent} onOpenChange={setShowAddStudent}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Ongeraho Umunyeshuri Mushya</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label>Izina rya Mbere *</Label>
            <Input
              value={studentForm.first_name}
              onChange={(e) => setStudentForm({...studentForm, first_name: e.target.value})}
              placeholder="Izina rya mbere"
            />
          </div>
          <div>
            <Label>Izina ry'Umuryango *</Label>
            <Input
              value={studentForm.last_name}
              onChange={(e) => setStudentForm({...studentForm, last_name: e.target.value})}
              placeholder="Izina ry'umuryango"
            />
          </div>
          <div>
            <Label>Ikode y'Umunyeshuri *</Label>
            <Input
              value={studentForm.student_code}
              onChange={(e) => setStudentForm({...studentForm, student_code: e.target.value})}
              placeholder="SOD/2024/001"
            />
          </div>
          <div>
            <Label>Umwuga (Trade)</Label>
            <select
              className="w-full border rounded px-3 py-2"
              value={studentForm.trade_code}
              onChange={(e) => setStudentForm({...studentForm, trade_code: e.target.value})}
            >
              <option value="SOD">SOD - Software Development</option>
              <option value="BDC">BDC - Building Construction</option>
              <option value="AUT">AUT - Automotive</option>
            </select>
          </div>
          <div>
            <Label>Urwego (Level)</Label>
            <select
              className="w-full border rounded px-3 py-2"
              value={studentForm.level_number}
              onChange={(e) => setStudentForm({...studentForm, level_number: parseInt(e.target.value)})}
            >
              <option value="3">Level 3</option>
              <option value="4">Level 4</option>
              <option value="5">Level 5</option>
            </select>
          </div>
          <div>
            <Label>Igitsina</Label>
            <select
              className="w-full border rounded px-3 py-2"
              value={studentForm.gender}
              onChange={(e) => setStudentForm({...studentForm, gender: e.target.value})}
            >
              <option value="M">Gabo</option>
              <option value="F">Gore</option>
            </select>
          </div>
          <div>
            <Label>Telefoni</Label>
            <Input
              value={studentForm.phone}
              onChange={(e) => setStudentForm({...studentForm, phone: e.target.value})}
              placeholder="078XXXXXXX"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowAddStudent(false)}>Hagarika</Button>
          <Button onClick={handleAddStudent} className="bg-blue-600 hover:bg-blue-700">Bika</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
};

export default AdvancedDOSDashboard;
