import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  LayoutDashboard, Users, BookOpen, DollarSign, Package, TrendingUp, LogOut, Settings, 
  Bell, Plus, Download, Upload, FileText, Calendar, BarChart, PieChart, Activity, Edit, Trash2, RefreshCw 
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { useAuth } from '@/app/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Badge } from '@/app/components/ui/badge';
import { Progress } from '@/app/components/ui/progress';
import { Separator } from '@/app/components/ui/separator';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { Input } from '@/app/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Switch } from '@/app/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '@/app/components/ui/alert';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/app/components/ui/dropdown-menu';
import AdvancedLeftSidebar from '@/app/components/AdvancedLeftSidebar';
import { apiService } from '@/app/services/apiService';

interface AdminDashboardProps {
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate, onLogout }) => {
  const { user } = useAuth();
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>({});
  const [users, setUsers] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [formData, setFormData] = useState<any>({});
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [modalType, setModalType] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsData, usersData, coursesData, paymentsData, rolesData] = await Promise.all([
        apiService.getDashboardStats('admin'),
        apiService.getUsers({ limit: 50 }),
        apiService.getCourses(),
        apiService.getPayments({ limit: 20 }),
        apiService.getRoles()
      ]);

      setStats(statsData);
      setUsers(usersData.users || []);
      setCourses(coursesData.courses || []);
      setPayments(paymentsData.payments || []);
      setRoles(rolesData.roles || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (type: string, item?: any) => {
    setModalType(type);
    setSelectedItem(item);
    setFormData(item || {});
    setIsAddUserOpen(true);
  };

  const closeModal = () => {
    setIsAddUserOpen(false);
    setSelectedItem(null);
    setFormData({});
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const isEdit = selectedItem && selectedItem.id;
      let result;

      if (modalType === 'user') {
        result = isEdit 
          ? await apiService.updateUser(selectedItem.id, formData)
          : await apiService.createUser(formData);
      }

      if (result?.success) {
        await fetchDashboardData();
        closeModal();
      }
    } catch (error) {
      console.error('Error saving:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (type: string, id: number) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    setLoading(true);
    try {
      let result;
      if (type === 'user') {
        result = await apiService.deleteUser(id);
      }

      if (result?.success) {
        await fetchDashboardData();
      }
    } catch (error) {
      console.error('Error deleting:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = (user.first_name + ' ' + user.last_name + ' ' + user.email)
      .toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role_name === selectedRole;
    return matchesSearch && matchesRole;
  });

  const statsCards = [
    { title: 'Total Users', value: stats.totalUsers || 0, change: '+12%', icon: Users, color: 'from-blue-500 to-blue-600', trend: 'up' },
    { title: 'Total Courses', value: stats.totalCourses || 0, change: '+5%', icon: BookOpen, color: 'from-green-500 to-green-600', trend: 'up' },
    { title: 'Total Payments', value: stats.totalPayments || 0, change: '+18%', icon: DollarSign, color: 'from-yellow-500 to-yellow-600', trend: 'up' },
    { title: 'Stock Items', value: stats.totalStockItems || 0, change: '-3%', icon: Package, color: 'from-pink-500 to-pink-600', trend: 'down' },
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 overflow-hidden">
      <AdvancedLeftSidebar currentPage="dashboard" onNavigate={onNavigate} onLogout={onLogout} />
      
      <div className="flex-1 overflow-auto">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <LayoutDashboard className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-black text-gray-900">ADMIN DASHBOARD</h1>
                <p className="text-gray-600">Welcome back, {user?.first_name} {user?.last_name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500">
                  5
                </Badge>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-blue-600 text-white">
                        {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem>
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onLogout} className="text-red-600">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alert */}
        <Alert className="mb-6">
          <Activity className="h-4 w-4" />
          <AlertTitle>System Update</AlertTitle>
          <AlertDescription>
            Database connected successfully. All features are now fully functional.
          </AlertDescription>
        </Alert>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <div className={`bg-gradient-to-r ${stat.color} p-6 text-white`}>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-white/80 text-sm mb-1">{stat.title}</p>
                        <p className="text-3xl font-black">{stat.value}</p>
                      </div>
                      <stat.icon className="w-10 h-10 opacity-80" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={`${
                        stat.trend === 'up' ? 'bg-green-500' : 
                        stat.trend === 'down' ? 'bg-red-500' : 'bg-gray-500'
                      }`}>
                        {stat.change}
                      </Badge>
                      <span className="text-sm text-white/80">vs last month</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>Manage all system users and their roles</CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                    <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm" onClick={() => openModal('user')}>
                          <Plus className="w-4 h-4 mr-2" />
                          Add User
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{selectedItem ? 'Edit User' : 'Add New User'}</DialogTitle>
                          <DialogDescription>Create a new user account in the system</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>First Name</Label>
                              <Input 
                                value={formData.first_name || ''}
                                onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                                placeholder="John" 
                              />
                            </div>
                            <div>
                              <Label>Last Name</Label>
                              <Input 
                                value={formData.last_name || ''}
                                onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                                placeholder="Doe" 
                              />
                            </div>
                          </div>
                          <div>
                            <Label>Username</Label>
                            <Input 
                              value={formData.username || ''}
                              onChange={(e) => setFormData({...formData, username: e.target.value})}
                              placeholder="johndoe" 
                            />
                          </div>
                          <div>
                            <Label>Email</Label>
                            <Input 
                              type="email" 
                              value={formData.email || ''}
                              onChange={(e) => setFormData({...formData, email: e.target.value})}
                              placeholder="john@example.com" 
                            />
                          </div>
                          {!selectedItem && (
                            <div>
                              <Label>Password</Label>
                              <Input 
                                type="password" 
                                value={formData.password || ''}
                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                                placeholder="Enter password" 
                              />
                            </div>
                          )}
                          <div>
                            <Label>Role</Label>
                            <Select 
                              value={formData.role_id?.toString() || ''}
                              onValueChange={(value) => setFormData({...formData, role_id: parseInt(value)})}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select role" />
                              </SelectTrigger>
                              <SelectContent>
                                {roles.map((role: any) => (
                                  <SelectItem key={role.id} value={role.id.toString()}>
                                    {role.name.replace('_', ' ').toUpperCase()}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <Button className="w-full" onClick={handleSave} disabled={loading}>
                            {loading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : null}
                            {selectedItem ? 'Update User' : 'Create User'}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2 mb-4">
                  <Input 
                    placeholder="Search users..." 
                    className="flex-1" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      {roles.map((role: any) => (
                        <SelectItem key={role.id} value={role.name}>
                          {role.name.replace('_', ' ').toUpperCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <ScrollArea className="h-[400px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Added</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user: any) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.first_name} {user.last_name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{user.role_name?.replace('_', ' ').toUpperCase()}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={user.is_active ? 'bg-green-500' : 'bg-yellow-500'}>
                              {user.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-gray-500">{new Date(user.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline" onClick={() => openModal('user', user)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => handleDelete('user', user.id)}
                                disabled={loading}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart className="w-5 h-5 mr-2" />
                    Enrollment Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {courses.slice(0, 3).map((course: any, index: number) => (
                      <div key={course.id}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{course.code}</span>
                          <span className="text-gray-600">{course.student_count || 0} students</span>
                        </div>
                        <Progress value={Math.min((course.student_count || 0) / 10, 100)} />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PieChart className="w-5 h-5 mr-2" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {['Attendance Rate', 'Pass Rate', 'Satisfaction'].map((metric, index) => (
                      <div key={metric}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{metric}</span>
                          <span className="text-gray-600">{90 + index * 3}%</span>
                        </div>
                        <Progress value={90 + index * 3} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Generate Reports
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {['Student Report', 'Financial Report', 'Attendance Report', 'Performance Report'].map((report) => (
                    <Button key={report} variant="outline" className="justify-between h-auto py-4">
                      <span>{report}</span>
                      <Download className="w-4 h-4" />
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-gray-500">Receive email updates</p>
                    </div>
                    <Switch />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Auto Backup</p>
                      <p className="text-sm text-gray-500">Daily database backup</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Maintenance Mode</p>
                      <p className="text-sm text-gray-500">Disable system access</p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Activity Feed */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-4">
                {payments.slice(0, 5).map((payment: any, index: number) => (
                  <div key={payment.id} className="flex items-start space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="w-2 h-2 rounded-full mt-2 bg-green-500" />
                    <div className="flex-1">
                      <p className="font-medium">Payment received from {payment.student_name}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-sm text-gray-500">RWF {payment.amount_paid?.toLocaleString()}</span>
                        <span className="text-sm text-gray-400">•</span>
                        <span className="text-sm text-gray-500">{new Date(payment.payment_date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  );
};

export default AdminDashboard;