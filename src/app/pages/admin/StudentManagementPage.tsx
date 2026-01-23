import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Users, Plus, Download, Search, Filter, Eye, Edit, Trash2, UserPlus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Badge } from '@/app/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';

const StudentManagementPage: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [studentSheets, setStudentSheets] = useState<any[]>([]);
  const [parentSheets, setParentSheets] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isAddTeacherOpen, setIsAddTeacherOpen] = useState(false);

  const [newStudent, setNewStudent] = useState({
    name: '',
    trade: 'SOD',
    level: 'S1',
    year: new Date().getFullYear(),
    phone: '',
    password: ''
  });

  const [newTeacher, setNewTeacher] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    subject: '',
    qualification: '',
    experience_years: 0
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const [studentsRes, teachersRes, sheetsRes, parentSheetsRes, notifRes] = await Promise.all([
        fetch('http://localhost:5000/api/student-management/students', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('http://localhost:5000/api/student-management/teachers', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('http://localhost:5000/api/student-management/student-sheets', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('http://localhost:5000/api/student-management/parent-sheets', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('http://localhost:5000/api/student-management/notifications', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      const studentsData = await studentsRes.json();
      const teachersData = await teachersRes.json();
      const sheetsData = await sheetsRes.json();
      const parentSheetsData = await parentSheetsRes.json();
      const notifData = await notifRes.json();

      if (studentsData.success) setStudents(studentsData.students);
      if (teachersData.success) setTeachers(teachersData.teachers);
      if (sheetsData.success) setStudentSheets(sheetsData.sheets);
      if (parentSheetsData.success) setParentSheets(parentSheetsData.sheets);
      if (notifData.success) setNotifications(notifData.notifications);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/student-management/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newStudent)
      });

      const data = await response.json();
      if (data.success) {
        alert(`Student added successfully! Code: ${data.studentCode}`);
        setIsAddStudentOpen(false);
        setNewStudent({ name: '', trade: 'SOD', level: 'S1', year: new Date().getFullYear(), phone: '', password: '' });
        fetchAllData();
      }
    } catch (error) {
      console.error('Add student error:', error);
    }
  };

  const handleAddTeacher = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/student-management/teachers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newTeacher)
      });

      const data = await response.json();
      if (data.success) {
        alert('Teacher added successfully!');
        setIsAddTeacherOpen(false);
        setNewTeacher({ name: '', email: '', phone: '', password: '', subject: '', qualification: '', experience_years: 0 });
        fetchAllData();
      }
    } catch (error) {
      console.error('Add teacher error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Student & Staff Management</h1>
          <p className="text-gray-600">Manage students, teachers, and view all sheets</p>
        </div>

        {/* Notifications */}
        {notifications.length > 0 && (
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-900">New Registrations ({notifications.filter(n => !n.is_read).length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {notifications.slice(0, 5).map((notif) => (
                  <div key={notif.id} className={`p-3 rounded-lg ${notif.is_read ? 'bg-white' : 'bg-blue-100'}`}>
                    <p className="font-medium">{notif.message}</p>
                    <p className="text-xs text-gray-500">{new Date(notif.created_at).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="students" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="teachers">Teachers</TabsTrigger>
            <TabsTrigger value="student-sheets">Student Sheets</TabsTrigger>
            <TabsTrigger value="parent-sheets">Parent Sheets</TabsTrigger>
          </TabsList>

          <TabsContent value="students">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>All Students</CardTitle>
                  <Dialog open={isAddStudentOpen} onOpenChange={setIsAddStudentOpen}>
                    <DialogTrigger asChild>
                      <Button><Plus className="w-4 h-4 mr-2" />Add Student</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Student</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Full Name</Label>
                          <Input value={newStudent.name} onChange={(e) => setNewStudent({...newStudent, name: e.target.value})} />
                        </div>
                        <div>
                          <Label>Trade</Label>
                          <Select value={newStudent.trade} onValueChange={(v) => setNewStudent({...newStudent, trade: v})}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="SOD">SOD - Software Development</SelectItem>
                              <SelectItem value="BDC">BDC - Building Construction</SelectItem>
                              <SelectItem value="AUT">AUT - Automotive</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Level</Label>
                          <Select value={newStudent.level} onValueChange={(v) => setNewStudent({...newStudent, level: v})}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="S1">S1</SelectItem>
                              <SelectItem value="S2">S2</SelectItem>
                              <SelectItem value="S3">S3</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Year</Label>
                          <Input type="number" value={newStudent.year} onChange={(e) => setNewStudent({...newStudent, year: parseInt(e.target.value)})} />
                        </div>
                        <div>
                          <Label>Phone</Label>
                          <Input value={newStudent.phone} onChange={(e) => setNewStudent({...newStudent, phone: e.target.value})} />
                        </div>
                        <div>
                          <Label>Password (optional - code will be used if empty)</Label>
                          <Input type="password" value={newStudent.password} onChange={(e) => setNewStudent({...newStudent, password: e.target.value})} />
                        </div>
                        <Button onClick={handleAddStudent} className="w-full">Generate Code & Add Student</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Trade</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Year</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Added By</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-mono font-bold">{student.student_code}</TableCell>
                        <TableCell>{student.name}</TableCell>
                        <TableCell><Badge>{student.trade}</Badge></TableCell>
                        <TableCell>{student.level}</TableCell>
                        <TableCell>{student.year}</TableCell>
                        <TableCell><Badge variant={student.status === 'active' ? 'default' : 'secondary'}>{student.status}</Badge></TableCell>
                        <TableCell className="text-sm text-gray-500">{student.added_by_name}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="teachers">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>All Teachers</CardTitle>
                  <Dialog open={isAddTeacherOpen} onValueChange={setIsAddTeacherOpen}>
                    <DialogTrigger asChild>
                      <Button><UserPlus className="w-4 h-4 mr-2" />Add Teacher</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Teacher</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Full Name</Label>
                          <Input value={newTeacher.name} onChange={(e) => setNewTeacher({...newTeacher, name: e.target.value})} />
                        </div>
                        <div>
                          <Label>Email</Label>
                          <Input type="email" value={newTeacher.email} onChange={(e) => setNewTeacher({...newTeacher, email: e.target.value})} />
                        </div>
                        <div>
                          <Label>Phone</Label>
                          <Input value={newTeacher.phone} onChange={(e) => setNewTeacher({...newTeacher, phone: e.target.value})} />
                        </div>
                        <div>
                          <Label>Password</Label>
                          <Input type="password" value={newTeacher.password} onChange={(e) => setNewTeacher({...newTeacher, password: e.target.value})} />
                        </div>
                        <div>
                          <Label>Subject</Label>
                          <Input value={newTeacher.subject} onChange={(e) => setNewTeacher({...newTeacher, subject: e.target.value})} />
                        </div>
                        <div>
                          <Label>Qualification</Label>
                          <Input value={newTeacher.qualification} onChange={(e) => setNewTeacher({...newTeacher, qualification: e.target.value})} />
                        </div>
                        <div>
                          <Label>Experience (years)</Label>
                          <Input type="number" value={newTeacher.experience_years} onChange={(e) => setNewTeacher({...newTeacher, experience_years: parseInt(e.target.value)})} />
                        </div>
                        <Button onClick={handleAddTeacher} className="w-full">Add Teacher</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Qualification</TableHead>
                      <TableHead>Experience</TableHead>
                      <TableHead>Added By</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teachers.map((teacher) => (
                      <TableRow key={teacher.id}>
                        <TableCell className="font-medium">{teacher.name}</TableCell>
                        <TableCell>{teacher.email}</TableCell>
                        <TableCell><Badge>{teacher.subject}</Badge></TableCell>
                        <TableCell className="text-sm">{teacher.qualification}</TableCell>
                        <TableCell>{teacher.experience_years} years</TableCell>
                        <TableCell className="text-sm text-gray-500">{teacher.added_by_name}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="student-sheets">
            <Card>
              <CardHeader>
                <CardTitle>Student Sheets (Shared with DOS & Head Master)</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Trade</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Year</TableHead>
                      <TableHead>Created By</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {studentSheets.map((sheet) => (
                      <TableRow key={sheet.id}>
                        <TableCell className="font-mono font-bold">{sheet.student_code}</TableCell>
                        <TableCell>{sheet.name}</TableCell>
                        <TableCell><Badge>{sheet.trade}</Badge></TableCell>
                        <TableCell>{sheet.level}</TableCell>
                        <TableCell>{sheet.academic_year}</TableCell>
                        <TableCell className="text-sm text-gray-500">{sheet.created_by_name}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="parent-sheets">
            <Card>
              <CardHeader>
                <CardTitle>Parent Sheets</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Parent Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Student Code</TableHead>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Relationship</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parentSheets.map((sheet) => (
                      <TableRow key={sheet.id}>
                        <TableCell className="font-medium">{sheet.parent_name}</TableCell>
                        <TableCell>{sheet.email}</TableCell>
                        <TableCell>{sheet.phone}</TableCell>
                        <TableCell className="font-mono font-bold">{sheet.student_code}</TableCell>
                        <TableCell>{sheet.student_name}</TableCell>
                        <TableCell><Badge>{sheet.relationship}</Badge></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StudentManagementPage;
