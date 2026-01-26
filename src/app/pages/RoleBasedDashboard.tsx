import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Users, GraduationCap, DollarSign, Package, FileText, BarChart3,
  Calendar, BookOpen, ClipboardList, TrendingUp, UserCheck, CreditCard,
  Bell, Mail, Settings, LogOut, Plus, Edit, Trash2, Eye, Search,
  Filter, Download, Upload, Save, X, RefreshCw, CheckCircle, AlertCircle
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Badge } from '@/app/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Label } from '@/app/components/ui/label';
import { Select, SelecbatContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Switch } from '@/app/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { useAuth } from '@/app/contexts/AuthContext';

const API_BASE = 'http://localhost:5000/api';

interface DashboardData {
  users: any[];
  courses: any[];
  classes: any[];
  students: any[];
  teachers: any[];
  payments: any[];
  stockItems: any[];
  grades: any[];
  attendance: any[];
  enrollments: any[];
  roles: any[];
  stats: any;
}

const RoleBasedDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<DashboardData>({
    users: [], courses: [], classes: [], students: [], teachers: [],
    payments: [], stockItems: [], grades: [], attendance: [], enrollments: [],
    roles: [], stats: {}
  });
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [modalType, setModalType] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');

  // API calls with authentication
  const apiCall = async (endpoint: string, options: any = {}) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
      }
    });
    return response.json();
  };

  // Fetch all data based on user role
  const fetchData = async () => {
    setLoading(true);
    try {
      const promises = [];
      
      // Common data for all roles
      promises.push(apiCall('/users?limit=100'));
      promises.push(apiCall('/academics/courses'));
      promises.push(apiCall('/academics/classes'));
      promises.push(apiCall('/users/roles/list'));
      
      // Role-specific data
      if (['super_admin', 'admin', 'headmaster'].includes(user?.role)) {
        promises.push(apiCall('/finance/payments?limit=50'));
        promises.push(apiCall('/stock/items?limit=50'));
        promises.push(apiCall('/academics/grades?limit=50'));
        promises.push(apiCall('/academics/attendance?limit=50'));
        promises.push(apiCall('/academics/enrollments?limit=50'));
      }
      
      if (['teacher'].includes(user?.role)) {
        promises.push(apiCall(`/academics/grades?teacher_id=${user.id}`));
        promises.push(apiCall(`/academics/attendance?teacher_id=${user.id}`));
      }
      
      if (['student'].includes(user?.role)) {
        promises.push(apiCall(`/academics/grades?student_id=${user.id}`));
        promises.push(apiCall(`/academics/attendance?student_id=${user.id}`));
        promises.push(apiCall(`/finance/students/${user.id}/fee-summary`));
      }

      const results = await Promise.all(promises);
      
      setData({
        users: results[0]?.users || [],
        courses: results[1]?.courses || [],
        classes: results[2]?.classes || [],
        roles: results[3]?.roles || [],
        payments: results[4]?.payments || [],
        stockItems: results[5]?.items || [],
        grades: results[6]?.grades || [],
        attendance: results[7]?.attendance || [],
        enrollments: results[8]?.enrollments || [],
        students: results[0]?.users?.filter((u: any) => u.role_name === 'student') || [],
        teachers: results[0]?.users?.filter((u: any) => ['teacher', 'headmaster', 'director_study'].includes(u.role_name)) || [],
        stats: {
          totalUsers: results[0]?.pagination?.total || results[0]?.users?.length || 0,
          totalCourses: results[1]?.courses?.length || 0,
          totalClasses: results[2]?.classes?.length || 0,
          totalStudents: results[0]?.users?.filter((u: any) => u.role_name === 'student')?.length || 0
        }
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  // CRUD Operations
  const handleCreate = async (type: string, formData: any) => {
    try {
      let endpoint = '';
      switch (type) {
        case 'user': endpoint = '/users'; break;
        case 'course': endpoint = '/academics/courses'; break;
        case 'class': endpoint = '/academics/classes'; break;
        case 'subject': endpoint = '/academics/subjects'; break;
        case 'enrollment': endpoint = '/academics/enrollments'; break;
        case 'grade': endpoint = '/academics/grades'; break;
        case 'payment': endpoint = '/finance/payments'; break;
        case 'stock': endpoint = '/stock/items'; break;
        default: throw new Error('Unknown type');
      }

      const result = await apiCall(endpoint, {
        method: 'POST',
        body: JSON.stringify(formData)
      });

      if (result.success) {
        await fetchData();
        closeModal();
      } else {
        alert(result.message || 'Error creating item');
      }
    } catch (error) {
      console.error('Create error:', error);
      alert('Error creating item');
    }
  };

  const handleUpdate = async (type: string, id: number, formData: any) => {
    try {
      let endpoint = '';
      switch (type) {
        case 'user': endpoint = `/users/${id}`; break;
        case 'course': endpoint = `/academics/courses/${id}`; break;
        case 'class': endpoint = `/academics/classes/${id}`; break;
        case 'grade': endpoint = `/academics/grades/${id}`; break;
        case 'payment': endpoint = `/finance/payments/${id}`; break;
        case 'stock': endpoint = `/stock/items/${id}`; break;
        default: throw new Error('Unknown type');
      }

      const result = await apiCall(endpoint, {
        method: 'PUT',
        body: JSON.stringify(formData)
      });

      if (result.success) {
        await fetchData();
        closeModal();
      } else {
        alert(result.message || 'Error updating item');
      }
    } catch (error) {
      console.error('Update error:', error);
      alert('Error updating item');
    }
  };

  const handleDelete = async (type: string, id: number) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
      let endpoint = '';
      switch (type) {
        case 'user': endpoint = `/users/${id}`; break;
        case 'course': endpoint = `/academics/courses/${id}`; break;
        case 'class': endpoint = `/academics/classes/${id}`; break;
        default: throw new Error('Unknown type');
      }

      const result = await apiCall(endpoint, { method: 'DELETE' });

      if (result.success) {
        await fetchData();
      } else {
        alert(result.message || 'Error deleting item');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Error deleting item');
    }
  };

  // Modal handlers
  const openModal = (type: string, item?: any) => {
    setModalType(type);
    setSelectedItem(item);
    setFormData(item || {});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
    setFormData({});
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      if (selectedItem && selectedItem.id) {
        await handleUpdate(modalType, selectedItem.id, formData);
      } else {
        await handleCreate(modalType, formData);
      }
    } finally {
      setLoading(false);
    }
  };

  // Role-based sidebar items
  const getSidebarItems = () => {
    const baseItems = [
      { id: 'dashboard', label: 'Dashboard', icon: BarChart3, roles: ['all'] }
    ];

    const roleItems = [
      { id: 'users', label: 'User Management', icon: Users, roles: ['super_admin', 'admin', 'headmaster'] },
      { id: 'academics', label: 'Academic Management', icon: GraduationCap, roles: ['super_admin', 'admin', 'headmaster', 'director_study', 'teacher'] },
      { id: 'students', label: 'Students', icon: UserCheck, roles: ['super_admin', 'admin', 'headmaster', 'director_study', 'teacher'] },
      { id: 'classes', label: 'Classes', icon: BookOpen, roles: ['super_admin', 'admin', 'headmaster', 'director_study', 'teacher'] },
      { id: 'grades', label: 'Grades', icon: ClipboardList, roles: ['super_admin', 'admin', 'headmaster', 'director_study', 'teacher', 'student'] },
      { id: 'attendance', label: 'Attendance', icon: Calendar, roles: ['super_admin', 'admin', 'headmaster', 'director_study', 'teacher', 'student'] },
      { id: 'finance', label: 'Finance', icon: DollarSign, roles: ['super_admin', 'admin', 'headmaster', 'accountant', 'student', 'parent'] },
      { id: 'stock', label: 'Stock Management', icon: Package, roles: ['super_admin', 'admin', 'stock_manager'] },
      { id: 'parent-linking', label: 'Parent Linking', icon: Link, roles: ['super_admin', 'admin', 'headmaster', 'director_discipline', 'parent'] },
      { id: 'excel-import', label: 'Excel Import', icon: FileSpreadsheet, roles: ['super_admin', 'admin', 'director_discipline'] },
      { id: 'reports', label: 'Reports', icon: TrendingUp, roles: ['super_admin', 'admin', 'headmaster', 'director_study', 'accountant'] },
      { id: 'settings', label: 'Settings', icon: Settings, roles: ['super_admin', 'admin'] }
    ];

    return [...baseItems, ...roleItems.filter(item =>
      item.roles.includes('all') || item.roles.includes(user?.role)
    )];
  };

  // Render modal based on type
  const renderModal = () => {
    if (!isModalOpen) return null;

    const modalTitles = {
      user: selectedItem ? 'Edit User' : 'Add New User',
      course: selectedItem ? 'Edit Course' : 'Add New Course',
      class: selectedItem ? 'Edit Class' : 'Add New Class',
      grade: selectedItem ? 'Edit Grade' : 'Add New Grade',
      payment: selectedItem ? 'Edit Payment' : 'Record Payment',
      stock: selectedItem ? 'Edit Stock Item' : 'Add Stock Item',
      enrollment: 'Enroll Student'
    };

    return (
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{modalTitles[modalType as keyof typeof modalTitles]}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {modalType === 'user' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>First Name *</Label>
                    <Input
                      value={formData.first_name || ''}
                      onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                      placeholder="Enter first name"
                    />
                  </div>
                  <div>
                    <Label>Last Name *</Label>
                    <Input
                      value={formData.last_name || ''}
                      onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                      placeholder="Enter last name"
                    />
                  </div>
                </div>
                <div>
                  <Label>Username *</Label>
                  <Input
                    value={formData.username || ''}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    placeholder="Enter username"
                  />
                </div>
                <div>
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="Enter email"
                  />
                </div>
                {!selectedItem && (
                  <div>
                    <Label>Password *</Label>
                    <Input
                      type="password"
                      value={formData.password || ''}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      placeholder="Enter password"
                    />
                  </div>
                )}
                <div>
                  <Label>Role *</Label>
                  <Select
                    value={formData.role_id?.toString() || ''}
                    onValueChange={(value) => setFormData({...formData, role_id: parseInt(value)})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {data.roles.map((role: any) => (
                        <SelectItem key={role.id} value={role.id.toString()}>
                          {role.name.replace('_', ' ').toUpperCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Phone</Label>
                    <Input
                      value={formData.phone || ''}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div>
                    <Label>Date of Birth</Label>
                    <Input
                      type="date"
                      value={formData.date_of_birth || ''}
                      onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})}
                    />
                  </div>
                </div>
              </>
            )}

            {modalType === 'course' && (
              <>
                <div>
                  <Label>Course Name *</Label>
                  <Input
                    value={formData.name || ''}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Enter course name"
                  />
                </div>
                <div>
                  <Label>Course Code *</Label>
                  <Input
                    value={formData.code || ''}
                    onChange={(e) => setFormData({...formData, code: e.target.value})}
                    placeholder="Enter course code"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description || ''}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Enter course description"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Duration (Months) *</Label>
                    <Input
                      type="number"
                      value={formData.duration_months || ''}
                      onChange={(e) => setFormData({...formData, duration_months: parseInt(e.target.value)})}
                      placeholder="Enter duration"
                    />
                  </div>
                  <div>
                    <Label>Fee Amount</Label>
                    <Input
                      type="number"
                      value={formData.fee_amount || ''}
                      onChange={(e) => setFormData({...formData, fee_amount: parseFloat(e.target.value)})}
                      placeholder="Enter fee amount"
                    />
                  </div>
                </div>
              </>
            )}

            {modalType === 'grade' && (
              <>
                <div>
                  <Label>Student *</Label>
                  <Select
                    value={formData.student_id?.toString() || ''}
                    onValueChange={(value) => setFormData({...formData, student_id: parseInt(value)})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select student" />
                    </SelectTrigger>
                    <SelectContent>
                      {data.students.map((student: any) => (
                        <SelectItem key={student.id} value={student.id.toString()}>
                          {student.first_name} {student.last_name} ({student.student_id})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Assessment Name *</Label>
                  <Input
                    value={formData.assessment_name || ''}
                    onChange={(e) => setFormData({...formData, assessment_name: e.target.value})}
                    placeholder="Enter assessment name"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Max Marks *</Label>
                    <Input
                      type="number"
                      value={formData.max_marks || ''}
                      onChange={(e) => setFormData({...formData, max_marks: parseFloat(e.target.value)})}
                      placeholder="Enter max marks"
                    />
                  </div>
                  <div>
                    <Label>Obtained Marks *</Label>
                    <Input
                      type="number"
                      value={formData.obtained_marks || ''}
                      onChange={(e) => setFormData({...formData, obtained_marks: parseFloat(e.target.value)})}
                      placeholder="Enter obtained marks"
                    />
                  </div>
                </div>
                <div>
                  <Label>Assessment Type</Label>
                  <Select
                    value={formData.assessment_type || ''}
                    onValueChange={(value) => setFormData({...formData, assessment_type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="quiz">Quiz</SelectItem>
                      <SelectItem value="exam">Exam</SelectItem>
                      <SelectItem value="assignment">Assignment</SelectItem>
                      <SelectItem value="project">Project</SelectItem>
                      <SelectItem value="final">Final</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={closeModal}>Cancel</Button>
              <Button onClick={handleSave} disabled={loading}>
                {loading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  // Render content based on active tab and user role
  const renderContent = () => {
    const filteredUsers = data.users.filter(user => 
      (user.first_name + ' ' + user.last_name + ' ' + user.email + ' ' + user.username)
        .toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filterRole === '' || user.role_name === filterRole)
    );

    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Users</p>
                      <p className="text-2xl font-bold">{data.stats.totalUsers}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <GraduationCap className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Courses</p>
                      <p className="text-2xl font-bold">{data.stats.totalCourses}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <BookOpen className="h-8 w-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Classes</p>
                      <p className="text-2xl font-bold">{data.stats.totalClasses}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <UserCheck className="h-8 w-8 text-yellow-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Students</p>
                      <p className="text-2xl font-bold">{data.stats.totalStudents}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Role-specific dashboard content */}
            {user?.role === 'student' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>My Grades</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {data.grades.slice(0, 5).map((grade: any) => (
                        <div key={grade.id} className="flex justify-between items-center">
                          <span className="text-sm">{grade.subject_name}</span>
                          <Badge variant={parseFloat(grade.obtained_marks) / parseFloat(grade.max_marks) >= 0.7 ? 'default' : 'secondary'}>
                            {grade.obtained_marks}/{grade.max_marks}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Attendance Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {data.attendance.slice(0, 5).map((att: any) => (
                        <div key={att.id} className="flex justify-between items-center">
                          <span className="text-sm">{att.subject_name}</span>
                          <Badge variant={att.status === 'present' ? 'default' : 'destructive'}>
                            {att.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        );

      case 'users':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">User Management</h2>
              <Button onClick={() => openModal('user')}>
                <Plus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            </div>

            <div className="flex gap-4 mb-4">
              <div className="flex-1">
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>
              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Roles</SelectItem>
                  {data.roles.map((role: any) => (
                    <SelectItem key={role.id} value={role.name}>
                      {role.name.replace('_', ' ').toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user: any) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.first_name} {user.last_name}</TableCell>
                        <TableCell>{user.username}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {user.role_name?.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.is_active ? 'default' : 'secondary'}>
                            {user.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline" onClick={() => openModal('user', user)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleDelete('user', user.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        );

      case 'academics':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Academic Management</h2>
            
            <Tabs defaultValue="courses">
              <TabsList>
                <TabsTrigger value="courses">Courses</TabsTrigger>
                <TabsTrigger value="classes">Classes</TabsTrigger>
                <TabsTrigger value="subjects">Subjects</TabsTrigger>
              </TabsList>
              
              <TabsContent value="courses" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Courses</h3>
                  <Button onClick={() => openModal('course')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Course
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data.courses.map((course: any) => (
                    <Card key={course.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold">{course.name}</h4>
                          <Badge variant="outline">{course.code}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{course.description}</p>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Duration:</span>
                            <span>{course.duration_months} months</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Fee:</span>
                            <span>RWF {course.fee_amount?.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Classes:</span>
                            <span>{course.class_count || 0}</span>
                          </div>
                        </div>
                        <div className="flex justify-end space-x-2 mt-4">
                          <Button size="sm" variant="outline" onClick={() => openModal('course', course)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleDelete('course', course.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        );

      case 'grades':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Grades Management</h2>
              {['super_admin', 'admin', 'headmaster', 'teacher'].includes(user?.role) && (
                <Button onClick={() => openModal('grade')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Grade
                </Button>
              )}
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Assessment</TableHead>
                      <TableHead>Marks</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Date</TableHead>
                      {['super_admin', 'admin', 'headmaster', 'teacher'].includes(user?.role) && (
                        <TableHead>Actions</TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.grades.map((grade: any) => (
                      <TableRow key={grade.id}>
                        <TableCell>{grade.student_name}</TableCell>
                        <TableCell>{grade.subject_name}</TableCell>
                        <TableCell>{grade.assessment_name}</TableCell>
                        <TableCell>{grade.obtained_marks}/{grade.max_marks}</TableCell>
                        <TableCell>
                          <Badge variant={grade.grade_letter === 'A' ? 'default' : 'secondary'}>
                            {grade.grade_letter}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(grade.assessment_date).toLocaleDateString()}</TableCell>
                        {['super_admin', 'admin', 'headmaster', 'teacher'].includes(user?.role) && (
                          <TableCell>
                            <Button size="sm" variant="outline" onClick={() => openModal('grade', grade)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        );

      case 'parent-linking':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Parent-Student Linking</h2>
            <ParentStudentLink onNavigate={(page) => setActiveTab(page)} />
          </div>
        );

      case 'excel-import':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Excel Student Import</h2>
            <ExcelStudentImport />
          </div>
        );

      default:
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Feature Coming Soon</h2>
            <p className="text-gray-600">This section is under development.</p>
          </div>
        );
    }
  };

  if (loading && !data.users.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg">
          <div className="p-6">
            <h1 className="text-xl font-bold text-gray-900">School Portal</h1>
            <p className="text-sm text-gray-600 mt-1">
              {user?.first_name} {user?.last_name}
            </p>
            <Badge variant="outline" className="mt-2">
              {user?.role?.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
          <nav className="mt-6">
            {getSidebarItems().map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center px-6 py-3 text-left hover:bg-gray-100 ${
                  activeTab === item.id ? 'bg-blue-50 border-r-2 border-blue-500 text-blue-700' : 'text-gray-700'
                }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-8">
            {renderContent()}
          </div>
        </div>
      </div>

      {renderModal()}
    </div>
  );
};

export default RoleBasedDashboard;