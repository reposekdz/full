import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Settings, Users, ImageIcon, FileText, BarChart3, LogOut, Plus, Edit, Trash2,
  Upload, Save, X, Eye, Globe, Shield, Database, Server, RefreshCw, CheckCircle,
  AlertCircle, MessageSquare, Star, Target, Award, Calendar, DollarSign,
  Package, GraduationCap, BookOpen, ClipboardList, TrendingUp, UserCheck,
  CreditCard, Warehouse, ShoppingCart, Bell, Mail, Home, School, Building
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Badge } from '@/app/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Switch } from '@/app/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { useContent } from '@/app/contexts/ContentContext';

const API_BASE = 'http://localhost:5000/api';

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role_name: string;
  student_id?: string;
  is_active: boolean;
  created_at: string;
}

interface Course {
  id: number;
  name: string;
  code: string;
  description: string;
  duration_months: number;
  fee_amount: number;
  is_active: boolean;
  class_count: number;
  student_count: number;
}

interface Class {
  id: number;
  name: string;
  course_name: string;
  course_code: string;
  academic_year_name: string;
  teacher_name: string;
  enrolled_students: number;
  capacity: number;
}

interface FeePayment {
  id: number;
  student_name: string;
  student_number: string;
  course_name: string;
  fee_type_name: string;
  amount_paid: number;
  payment_date: string;
  payment_method: string;
  receipt_number: string;
  status: string;
}

interface StockItem {
  id: number;
  name: string;
  sku: string;
  category_name: string;
  current_quantity: number;
  minimum_quantity: number;
  unit_price: number;
  total_value: number;
  stock_status: string;
}

const ComprehensiveAdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [payments, setPayments] = useState<FeePayment[]>([]);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [dashboardStats, setDashboardStats] = useState<any>({});
  
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [modalType, setModalType] = useState('');\n  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<any>({});

  const { refreshSlides } = useContent();

  // Fetch functions
  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_BASE}/users?limit=50`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) setUsers(data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await fetch(`${API_BASE}/academics/courses`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) setCourses(data.courses);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await fetch(`${API_BASE}/academics/classes`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) setClasses(data.classes);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const fetchPayments = async () => {
    try {
      const response = await fetch(`${API_BASE}/finance/payments?limit=20`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) setPayments(data.payments);
    } catch (error) {
      console.error('Error fetching payments:', error);
    }
  };

  const fetchStockItems = async () => {
    try {
      const response = await fetch(`${API_BASE}/stock/items?limit=20`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) setStockItems(data.items);
    } catch (error) {
      console.error('Error fetching stock items:', error);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const [usersRes, coursesRes, paymentsRes, stockRes] = await Promise.all([
        fetch(`${API_BASE}/users?limit=1`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }),
        fetch(`${API_BASE}/academics/courses`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }),
        fetch(`${API_BASE}/finance/payments?limit=1`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }),
        fetch(`${API_BASE}/stock/items?limit=1`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } })
      ]);

      const [usersData, coursesData, paymentsData, stockData] = await Promise.all([
        usersRes.json(),
        coursesRes.json(),
        paymentsRes.json(),
        stockRes.json()
      ]);

      setDashboardStats({
        totalUsers: usersData.pagination?.total || 0,
        totalCourses: coursesData.courses?.length || 0,
        totalPayments: paymentsData.pagination?.total || 0,
        totalStockItems: stockData.pagination?.total || 0
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'academics') { fetchCourses(); fetchClasses(); }
    if (activeTab === 'finance') fetchPayments();
    if (activeTab === 'stock') fetchStockItems();
  }, [activeTab]);

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
      const isEdit = selectedItem && selectedItem.id;
      let endpoint = '';
      let method = isEdit ? 'PUT' : 'POST';

      switch (modalType) {
        case 'user':
          endpoint = isEdit ? `${API_BASE}/users/${selectedItem.id}` : `${API_BASE}/users`;
          break;
        case 'course':
          endpoint = isEdit ? `${API_BASE}/academics/courses/${selectedItem.id}` : `${API_BASE}/academics/courses`;
          break;
        case 'class':
          endpoint = isEdit ? `${API_BASE}/academics/classes/${selectedItem.id}` : `${API_BASE}/academics/classes`;
          break;
        default:
          throw new Error('Unknown modal type');
      }

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();
      
      if (result.success) {
        // Refresh data
        if (modalType === 'user') fetchUsers();
        if (modalType === 'course') fetchCourses();
        if (modalType === 'class') fetchClasses();
        closeModal();
      } else {
        alert(result.message || 'Error saving data');
      }
    } catch (error) {
      console.error('Error saving:', error);
      alert('Error saving data');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (type: string, id: number) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    setLoading(true);
    try {
      let endpoint = '';
      switch (type) {
        case 'user':
          endpoint = `${API_BASE}/users/${id}`;
          break;
        case 'course':
          endpoint = `${API_BASE}/academics/courses/${id}`;
          break;
        case 'class':
          endpoint = `${API_BASE}/academics/classes/${id}`;
          break;
        default:
          throw new Error('Unknown type');
      }

      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      const result = await response.json();
      
      if (result.success) {
        if (type === 'user') fetchUsers();
        if (type === 'course') fetchCourses();
        if (type === 'class') fetchClasses();
      } else {
        alert(result.message || 'Error deleting item');
      }
    } catch (error) {
      console.error('Error deleting:', error);
      alert('Error deleting item');
    } finally {
      setLoading(false);
    }
  };

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'academics', label: 'Academic Management', icon: GraduationCap },
    { id: 'finance', label: 'Financial Management', icon: DollarSign },
    { id: 'stock', label: 'Stock Management', icon: Package },
    { id: 'content', label: 'Content Management', icon: FileText },
    { id: 'reports', label: 'Reports & Analytics', icon: TrendingUp },
    { id: 'settings', label: 'System Settings', icon: Settings },
  ];

  const renderModal = () => {
    if (!isModalOpen) return null;

    const modalTitles = {
      user: selectedItem ? 'Edit User' : 'Add New User',
      course: selectedItem ? 'Edit Course' : 'Add New Course',
      class: selectedItem ? 'Edit Class' : 'Add New Class'
    };

    return (
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className=\"max-w-2xl max-h-[90vh] overflow-y-auto\">
          <DialogHeader>
            <DialogTitle>{modalTitles[modalType as keyof typeof modalTitles]}</DialogTitle>
          </DialogHeader>
          <div className=\"space-y-4\">
            {modalType === 'user' && (
              <>
                <div className=\"grid grid-cols-2 gap-4\">
                  <div>
                    <Label htmlFor=\"first_name\">First Name *</Label>
                    <Input
                      id=\"first_name\"
                      value={formData.first_name || ''}
                      onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                      placeholder=\"Enter first name\"
                    />
                  </div>
                  <div>
                    <Label htmlFor=\"last_name\">Last Name *</Label>
                    <Input
                      id=\"last_name\"
                      value={formData.last_name || ''}
                      onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                      placeholder=\"Enter last name\"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor=\"username\">Username *</Label>
                  <Input
                    id=\"username\"
                    value={formData.username || ''}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    placeholder=\"Enter username\"
                  />
                </div>
                <div>
                  <Label htmlFor=\"email\">Email *</Label>
                  <Input
                    id=\"email\"
                    type=\"email\"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder=\"Enter email\"
                  />
                </div>
                {!selectedItem && (
                  <div>
                    <Label htmlFor=\"password\">Password *</Label>
                    <Input
                      id=\"password\"
                      type=\"password\"
                      value={formData.password || ''}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      placeholder=\"Enter password\"
                    />
                  </div>
                )}
                <div>
                  <Label htmlFor=\"role_id\">Role *</Label>
                  <Select
                    value={formData.role_id?.toString() || ''}
                    onValueChange={(value) => setFormData({...formData, role_id: parseInt(value)})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder=\"Select role\" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value=\"1\">Super Admin</SelectItem>
                      <SelectItem value=\"2\">Admin</SelectItem>
                      <SelectItem value=\"3\">Head Master</SelectItem>
                      <SelectItem value=\"4\">Director of Studies</SelectItem>
                      <SelectItem value=\"5\">Director of Discipline</SelectItem>
                      <SelectItem value=\"6\">Teacher</SelectItem>
                      <SelectItem value=\"7\">Student</SelectItem>
                      <SelectItem value=\"8\">Parent</SelectItem>
                      <SelectItem value=\"9\">Accountant</SelectItem>
                      <SelectItem value=\"10\">Stock Manager</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className=\"grid grid-cols-2 gap-4\">
                  <div>
                    <Label htmlFor=\"phone\">Phone</Label>
                    <Input
                      id=\"phone\"
                      value={formData.phone || ''}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder=\"Enter phone number\"
                    />
                  </div>
                  <div>
                    <Label htmlFor=\"date_of_birth\">Date of Birth</Label>
                    <Input
                      id=\"date_of_birth\"
                      type=\"date\"
                      value={formData.date_of_birth || ''}
                      onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor=\"address\">Address</Label>
                  <Textarea
                    id=\"address\"
                    value={formData.address || ''}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    placeholder=\"Enter address\"
                    rows={2}
                  />
                </div>
              </>
            )}

            {modalType === 'course' && (
              <>
                <div>
                  <Label htmlFor=\"name\">Course Name *</Label>
                  <Input
                    id=\"name\"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder=\"Enter course name\"
                  />
                </div>
                <div>
                  <Label htmlFor=\"code\">Course Code *</Label>
                  <Input
                    id=\"code\"
                    value={formData.code || ''}
                    onChange={(e) => setFormData({...formData, code: e.target.value})}
                    placeholder=\"Enter course code\"
                  />
                </div>
                <div>
                  <Label htmlFor=\"description\">Description</Label>
                  <Textarea
                    id=\"description\"
                    value={formData.description || ''}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder=\"Enter course description\"
                    rows={3}
                  />
                </div>
                <div className=\"grid grid-cols-2 gap-4\">
                  <div>
                    <Label htmlFor=\"duration_months\">Duration (Months) *</Label>
                    <Input
                      id=\"duration_months\"
                      type=\"number\"
                      value={formData.duration_months || ''}
                      onChange={(e) => setFormData({...formData, duration_months: parseInt(e.target.value)})}
                      placeholder=\"Enter duration\"
                    />
                  </div>
                  <div>
                    <Label htmlFor=\"fee_amount\">Fee Amount</Label>
                    <Input
                      id=\"fee_amount\"
                      type=\"number\"
                      value={formData.fee_amount || ''}
                      onChange={(e) => setFormData({...formData, fee_amount: parseFloat(e.target.value)})}
                      placeholder=\"Enter fee amount\"
                    />
                  </div>
                </div>
              </>
            )}

            <div className=\"flex justify-end space-x-2 pt-4\">
              <Button variant=\"outline\" onClick={closeModal}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={loading}>
                {loading ? <RefreshCw className=\"w-4 h-4 animate-spin mr-2\" /> : <Save className=\"w-4 h-4 mr-2\" />}
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className=\"space-y-6\">
            <div className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4\">
              <Card>
                <CardContent className=\"p-6\">
                  <div className=\"flex items-center\">
                    <Users className=\"h-8 w-8 text-blue-600\" />
                    <div className=\"ml-4\">
                      <p className=\"text-sm font-medium text-gray-600\">Total Users</p>
                      <p className=\"text-2xl font-bold\">{dashboardStats.totalUsers}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className=\"p-6\">
                  <div className=\"flex items-center\">
                    <GraduationCap className=\"h-8 w-8 text-green-600\" />
                    <div className=\"ml-4\">
                      <p className=\"text-sm font-medium text-gray-600\">Courses</p>
                      <p className=\"text-2xl font-bold\">{dashboardStats.totalCourses}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className=\"p-6\">
                  <div className=\"flex items-center\">
                    <DollarSign className=\"h-8 w-8 text-yellow-600\" />
                    <div className=\"ml-4\">
                      <p className=\"text-sm font-medium text-gray-600\">Payments</p>
                      <p className=\"text-2xl font-bold\">{dashboardStats.totalPayments}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className=\"p-6\">
                  <div className=\"flex items-center\">
                    <Package className=\"h-8 w-8 text-purple-600\" />
                    <div className=\"ml-4\">
                      <p className=\"text-sm font-medium text-gray-600\">Stock Items</p>
                      <p className=\"text-2xl font-bold\">{dashboardStats.totalStockItems}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className=\"grid grid-cols-1 lg:grid-cols-2 gap-6\">
              <Card>
                <CardHeader>
                  <CardTitle>System Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className=\"space-y-4\">
                    <div className=\"flex items-center justify-between\">
                      <span className=\"text-sm\">Database Connection</span>
                      <Badge className=\"bg-green-100 text-green-800\">Online</Badge>
                    </div>
                    <div className=\"flex items-center justify-between\">
                      <span className=\"text-sm\">API Services</span>
                      <Badge className=\"bg-green-100 text-green-800\">Running</Badge>
                    </div>
                    <div className=\"flex items-center justify-between\">
                      <span className=\"text-sm\">File Upload System</span>
                      <Badge className=\"bg-green-100 text-green-800\">Active</Badge>
                    </div>
                    <div className=\"flex items-center justify-between\">
                      <span className=\"text-sm\">Authentication</span>
                      <Badge className=\"bg-green-100 text-green-800\">Secure</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className=\"grid grid-cols-2 gap-4\">
                    <Button onClick={() => openModal('user')} className=\"h-20 flex-col\">
                      <Users className=\"w-6 h-6 mb-2\" />
                      Add User
                    </Button>
                    <Button onClick={() => openModal('course')} className=\"h-20 flex-col\" variant=\"outline\">
                      <GraduationCap className=\"w-6 h-6 mb-2\" />
                      Add Course
                    </Button>
                    <Button onClick={() => setActiveTab('finance')} className=\"h-20 flex-col\" variant=\"outline\">
                      <DollarSign className=\"w-6 h-6 mb-2\" />
                      View Payments
                    </Button>
                    <Button onClick={() => setActiveTab('stock')} className=\"h-20 flex-col\" variant=\"outline\">
                      <Package className=\"w-6 h-6 mb-2\" />
                      Manage Stock
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'users':
        return (
          <div className=\"space-y-6\">
            <div className=\"flex justify-between items-center\">
              <h2 className=\"text-2xl font-bold\">User Management</h2>
              <Button onClick={() => openModal('user')}>
                <Plus className=\"w-4 h-4 mr-2\" />
                Add New User
              </Button>
            </div>

            <Card>
              <CardContent className=\"p-0\">
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
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{`${user.first_name} ${user.last_name}`}</TableCell>
                        <TableCell>{user.username}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant=\"outline\">{user.role_name}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.is_active ? 'default' : 'secondary'}>
                            {user.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className=\"flex space-x-2\">
                            <Button size=\"sm\" variant=\"outline\" onClick={() => openModal('user', user)}>
                              <Edit className=\"w-4 h-4\" />
                            </Button>
                            <Button 
                              size=\"sm\" 
                              variant=\"outline\" 
                              onClick={() => handleDelete('user', user.id)}
                              disabled={loading}
                            >
                              <Trash2 className=\"w-4 h-4\" />
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
          <div className=\"space-y-6\">
            <h2 className=\"text-2xl font-bold\">Academic Management</h2>
            
            <Tabs defaultValue=\"courses\" className=\"w-full\">
              <TabsList>
                <TabsTrigger value=\"courses\">Courses</TabsTrigger>
                <TabsTrigger value=\"classes\">Classes</TabsTrigger>
                <TabsTrigger value=\"subjects\">Subjects</TabsTrigger>
                <TabsTrigger value=\"enrollments\">Enrollments</TabsTrigger>
              </TabsList>
              
              <TabsContent value=\"courses\" className=\"space-y-4\">
                <div className=\"flex justify-between items-center\">
                  <h3 className=\"text-lg font-semibold\">Courses</h3>
                  <Button onClick={() => openModal('course')}>
                    <Plus className=\"w-4 h-4 mr-2\" />
                    Add Course
                  </Button>
                </div>
                
                <div className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4\">
                  {courses.map((course) => (
                    <Card key={course.id}>
                      <CardContent className=\"p-4\">
                        <div className=\"flex justify-between items-start mb-2\">
                          <h4 className=\"font-semibold\">{course.name}</h4>
                          <Badge variant=\"outline\">{course.code}</Badge>
                        </div>
                        <p className=\"text-sm text-gray-600 mb-3\">{course.description}</p>
                        <div className=\"space-y-1 text-sm\">
                          <div className=\"flex justify-between\">
                            <span>Duration:</span>
                            <span>{course.duration_months} months</span>
                          </div>
                          <div className=\"flex justify-between\">
                            <span>Fee:</span>
                            <span>RWF {course.fee_amount?.toLocaleString()}</span>
                          </div>
                          <div className=\"flex justify-between\">
                            <span>Classes:</span>
                            <span>{course.class_count}</span>
                          </div>
                          <div className=\"flex justify-between\">
                            <span>Students:</span>
                            <span>{course.student_count}</span>
                          </div>
                        </div>
                        <div className=\"flex justify-end space-x-2 mt-4\">
                          <Button size=\"sm\" variant=\"outline\" onClick={() => openModal('course', course)}>
                            <Edit className=\"w-4 h-4\" />
                          </Button>
                          <Button 
                            size=\"sm\" 
                            variant=\"outline\" 
                            onClick={() => handleDelete('course', course.id)}
                          >
                            <Trash2 className=\"w-4 h-4\" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value=\"classes\" className=\"space-y-4\">
                <div className=\"flex justify-between items-center\">
                  <h3 className=\"text-lg font-semibold\">Classes</h3>
                  <Button onClick={() => openModal('class')}>
                    <Plus className=\"w-4 h-4 mr-2\" />
                    Add Class
                  </Button>
                </div>
                
                <Card>
                  <CardContent className=\"p-0\">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Class Name</TableHead>
                          <TableHead>Course</TableHead>
                          <TableHead>Academic Year</TableHead>
                          <TableHead>Teacher</TableHead>
                          <TableHead>Enrollment</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {classes.map((classItem) => (
                          <TableRow key={classItem.id}>
                            <TableCell className=\"font-medium\">{classItem.name}</TableCell>
                            <TableCell>
                              <div>
                                <div className=\"font-medium\">{classItem.course_name}</div>
                                <div className=\"text-sm text-gray-500\">{classItem.course_code}</div>
                              </div>
                            </TableCell>
                            <TableCell>{classItem.academic_year_name}</TableCell>
                            <TableCell>{classItem.teacher_name || 'Not assigned'}</TableCell>
                            <TableCell>
                              <div className=\"text-sm\">
                                {classItem.enrolled_students}/{classItem.capacity}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className=\"flex space-x-2\">
                                <Button size=\"sm\" variant=\"outline\" onClick={() => openModal('class', classItem)}>
                                  <Edit className=\"w-4 h-4\" />
                                </Button>
                                <Button 
                                  size=\"sm\" 
                                  variant=\"outline\" 
                                  onClick={() => handleDelete('class', classItem.id)}
                                >
                                  <Trash2 className=\"w-4 h-4\" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        );

      case 'finance':
        return (
          <div className=\"space-y-6\">
            <h2 className=\"text-2xl font-bold\">Financial Management</h2>
            
            <div className=\"grid grid-cols-1 md:grid-cols-3 gap-4 mb-6\">
              <Card>
                <CardContent className=\"p-4\">
                  <div className=\"flex items-center\">
                    <CreditCard className=\"h-8 w-8 text-green-600\" />
                    <div className=\"ml-4\">
                      <p className=\"text-sm font-medium text-gray-600\">Total Payments</p>
                      <p className=\"text-xl font-bold\">{payments.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className=\"p-4\">
                  <div className=\"flex items-center\">
                    <DollarSign className=\"h-8 w-8 text-blue-600\" />
                    <div className=\"ml-4\">
                      <p className=\"text-sm font-medium text-gray-600\">Total Amount</p>
                      <p className=\"text-xl font-bold\">
                        RWF {payments.reduce((sum, p) => sum + p.amount_paid, 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className=\"p-4\">
                  <div className=\"flex items-center\">
                    <TrendingUp className=\"h-8 w-8 text-purple-600\" />
                    <div className=\"ml-4\">
                      <p className=\"text-sm font-medium text-gray-600\">This Month</p>
                      <p className=\"text-xl font-bold\">
                        {payments.filter(p => new Date(p.payment_date).getMonth() === new Date().getMonth()).length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Payments</CardTitle>
              </CardHeader>
              <CardContent className=\"p-0\">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Fee Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>
                          <div>
                            <div className=\"font-medium\">{payment.student_name}</div>
                            <div className=\"text-sm text-gray-500\">{payment.student_number}</div>
                          </div>
                        </TableCell>
                        <TableCell>{payment.course_name}</TableCell>
                        <TableCell>{payment.fee_type_name}</TableCell>
                        <TableCell>RWF {payment.amount_paid.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant=\"outline\">{payment.payment_method}</Badge>
                        </TableCell>
                        <TableCell>{new Date(payment.payment_date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant={payment.status === 'completed' ? 'default' : 'secondary'}>
                            {payment.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        );

      case 'stock':
        return (
          <div className=\"space-y-6\">
            <h2 className=\"text-2xl font-bold\">Stock Management</h2>
            
            <div className=\"grid grid-cols-1 md:grid-cols-4 gap-4 mb-6\">
              <Card>
                <CardContent className=\"p-4\">
                  <div className=\"flex items-center\">
                    <Package className=\"h-8 w-8 text-blue-600\" />
                    <div className=\"ml-4\">
                      <p className=\"text-sm font-medium text-gray-600\">Total Items</p>
                      <p className=\"text-xl font-bold\">{stockItems.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className=\"p-4\">
                  <div className=\"flex items-center\">
                    <DollarSign className=\"h-8 w-8 text-green-600\" />
                    <div className=\"ml-4\">
                      <p className=\"text-sm font-medium text-gray-600\">Total Value</p>
                      <p className=\"text-xl font-bold\">
                        RWF {stockItems.reduce((sum, item) => sum + item.total_value, 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className=\"p-4\">
                  <div className=\"flex items-center\">
                    <AlertCircle className=\"h-8 w-8 text-red-600\" />
                    <div className=\"ml-4\">
                      <p className=\"text-sm font-medium text-gray-600\">Low Stock</p>
                      <p className=\"text-xl font-bold\">
                        {stockItems.filter(item => item.stock_status === 'low').length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className=\"p-4\">
                  <div className=\"flex items-center\">
                    <Warehouse className=\"h-8 w-8 text-purple-600\" />
                    <div className=\"ml-4\">
                      <p className=\"text-sm font-medium text-gray-600\">Categories</p>
                      <p className=\"text-xl font-bold\">
                        {new Set(stockItems.map(item => item.category_name)).size}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Stock Items</CardTitle>
              </CardHeader>
              <CardContent className=\"p-0\">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead>Total Value</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stockItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div>
                            <div className=\"font-medium\">{item.name}</div>
                            <div className=\"text-sm text-gray-500\">{item.sku}</div>
                          </div>
                        </TableCell>
                        <TableCell>{item.category_name}</TableCell>
                        <TableCell>
                          <div className=\"text-sm\">
                            {item.current_quantity}
                            <span className=\"text-gray-500\"> (min: {item.minimum_quantity})</span>
                          </div>
                        </TableCell>
                        <TableCell>RWF {item.unit_price.toLocaleString()}</TableCell>
                        <TableCell>RWF {item.total_value.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              item.stock_status === 'low' ? 'destructive' : 
                              item.stock_status === 'high' ? 'secondary' : 'default'
                            }
                          >
                            {item.stock_status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return (
          <div className=\"text-center py-12\">
            <h2 className=\"text-2xl font-bold mb-4\">Feature Coming Soon</h2>
            <p className=\"text-gray-600\">This section is under development.</p>
          </div>
        );
    }
  };

  return (
    <div className=\"min-h-screen bg-gray-50\">
      <div className=\"flex\">
        {/* Sidebar */}
        <div className=\"w-64 bg-white shadow-lg\">
          <div className=\"p-6\">
            <h1 className=\"text-xl font-bold text-gray-900\">School Admin</h1>
          </div>
          <nav className=\"mt-6\">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center px-6 py-3 text-left hover:bg-gray-100 ${
                  activeTab === item.id ? 'bg-blue-50 border-r-2 border-blue-500 text-blue-700' : 'text-gray-700'
                }`}
              >
                <item.icon className=\"w-5 h-5 mr-3\" />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className=\"flex-1 overflow-auto\">
          <div className=\"p-8\">
            {renderContent()}
          </div>
        </div>
      </div>

      {renderModal()}
    </div>
  );
};

export default ComprehensiveAdminPage;