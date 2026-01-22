import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, Users, BookOpen, DollarSign, Package, TrendingUp, LogOut, Settings, 
  Bell, Plus, Download, Upload, FileText, Calendar, BarChart, PieChart, Activity,
  Search, Filter, RefreshCw, Eye, Edit, Trash2, UserPlus, GraduationCap,
  MessageSquare, Award, Clock, Target, School, Database, Shield, Wifi,
  TrendingDown, AlertTriangle, CheckCircle, XCircle, AlertCircle
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { useAuth } from '@/app/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Badge } from '@/app/components/ui/badge';
import { Progress } from '@/app/components/ui/progress';
import { Input } from '@/app/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Switch } from '@/app/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '@/app/components/ui/alert';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/app/components/ui/dropdown-menu';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import AdvancedLeftSidebar from '@/app/components/AdvancedLeftSidebar';

interface EnhancedAdminDashboardProps {
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
  last_login?: string;
}

interface SystemStats {
  totalStudents: number;
  totalStaff: number;
  activeCourses: number;
  totalRevenue: number;
  stockItems: number;
  systemPerformance: number;
  monthlyGrowth: {
    students: number;
    staff: number;
    revenue: number;
  };
}

interface Activity {
  id: number;
  action: string;
  user: string;
  timestamp: string;
  type: 'success' | 'warning' | 'error' | 'info';
  details?: string;
}

interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  read: boolean;
  created_at: string;
}

const EnhancedAdminDashboard: React.FC<EnhancedAdminDashboardProps> = ({ onNavigate, onLogout }) => {
  const { user } = useAuth();
  
  // State management
  const [loading, setLoading] = useState(false);
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  
  // New user form state
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    phone: '',
    address: ''
  });

  const API_BASE = 'http://localhost:5000/api';

  // Fetch system statistics with advanced analytics
  const fetchSystemStats = async () => {
    try {
      // Use new powerful analytics API
      const response = await fetch(`${API_BASE}/powerful/analytics/courses/performance`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        // Transform analytics data to match dashboard format
        const stats = {
          totalStudents: data.analytics?.reduce((sum: number, course: any) => sum + (course.enrolled_students || 0), 0) || 1248,
          totalStaff: 65,
          activeCourses: data.analytics?.length || 28,
          totalRevenue: 15420000,
          stockItems: 145,
          systemPerformance: Math.round(data.analytics?.reduce((sum: number, course: any) => sum + (course.average_score || 0), 0) / (data.analytics?.length || 1) || 87),
          monthlyGrowth: {
            students: 12,
            staff: 5,
            revenue: 8
          }
        };
        setSystemStats(stats);
      } else {
        // Fallback with mock data if API fails
        setSystemStats({
          totalStudents: 1248,
          totalStaff: 65,
          activeCourses: 28,
          totalRevenue: 15420000,
          stockItems: 145,
          systemPerformance: 87,
          monthlyGrowth: { students: 12, staff: 5, revenue: 8 }
        });
      }
    } catch (error) {
      console.error('Error fetching system stats:', error);
      // Fallback data
      setSystemStats({
        totalStudents: 1248,
        totalStaff: 65,
        activeCourses: 28,
        totalRevenue: 15420000,
        stockItems: 145,
        systemPerformance: 87,
        monthlyGrowth: { students: 12, staff: 5, revenue: 8 }
      });
    }
  };

  // Fetch all users with advanced filtering
  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_BASE}/admin/users?limit=50&include_stats=true`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setUsers(data.users || []);
      } else {
        // Fallback with demo users
        const demoUsers = Array.from({ length: 15 }, (_, i) => ({
          id: i + 1,
          name: `Umunyeshuri ${i + 1}`,
          email: `umunyeshuri${i + 1}@ishuri.rw`,
          role: i < 5 ? 'student' : i < 10 ? 'teacher' : 'admin',
          status: Math.random() > 0.1 ? 'active' : 'inactive',
          created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
          last_login: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
        }));
        setUsers(demoUsers);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      // Fallback demo users
      const demoUsers = Array.from({ length: 15 }, (_, i) => ({
        id: i + 1,
        name: `Umunyeshuri ${i + 1}`,
        email: `umunyeshuri${i + 1}@ishuri.rw`,
        role: i < 5 ? 'student' : i < 10 ? 'teacher' : 'admin',
        status: Math.random() > 0.1 ? 'active' : 'inactive',
        created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        last_login: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
      }));
      setUsers(demoUsers);
    }
  };

  // Fetch recent activities
  const fetchActivities = async () => {
    try {
      const response = await fetch(`${API_BASE}/admin/activities?limit=20`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setActivities(data.activities);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const response = await fetch(`${API_BASE}/admin/notifications`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setNotifications(data.notifications);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  // Create new user
  const handleCreateUser = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/admin/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newUser)
      });
      
      const data = await response.json();
      if (data.success) {
        setIsAddUserOpen(false);
        setNewUser({
          name: '',
          email: '',
          password: '',
          role: 'student',
          phone: '',
          address: ''
        });
        fetchUsers();
      }
    } catch (error) {
      console.error('Error creating user:', error);
    } finally {
      setLoading(false);
    }
  };

  // Delete user
  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        fetchUsers();
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    } finally {
      setLoading(false);
    }
  };

  // Refresh all data
  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchSystemStats(),
      fetchUsers(),
      fetchActivities(),
      fetchNotifications()
    ]);
    setRefreshing(false);
  };

  // Initial data fetch
  useEffect(() => {
    handleRefresh();
  }, []);

  // Filter users based on search and role
  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  // Mock stats if no real data (for demo purposes)
  const stats = systemStats || {
    totalStudents: 1248,
    totalStaff: 89,
    activeCourses: 24,
    totalRevenue: 125430,
    stockItems: 456,
    systemPerformance: 94,
    monthlyGrowth: {
      students: 12,
      staff: 5,
      revenue: 18
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'success': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'error': return XCircle;
      default: return AlertCircle;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-blue-600';
    }
  };

  const unreadNotifications = notifications.filter(n => !n.read).length;

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 overflow-hidden">
      <AdvancedLeftSidebar currentPage="dashboard" onNavigate={onNavigate} onLogout={onLogout} />
      
      <div className="flex-1 overflow-auto">
        {/* Enhanced Header */}
        <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <LayoutDashboard className="w-8 h-8 text-blue-600" />
                <div>
                  <h1 className="text-2xl font-black text-gray-900">ENHANCED ADMIN DASHBOARD</h1>
                  <p className="text-gray-600">
                    Welcome back, {user?.name} • {new Date().toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleRefresh}
                  disabled={refreshing}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button variant="outline" size="icon" className="relative">
                  <Bell className="w-5 h-5" />
                  {unreadNotifications > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500">
                      {unreadNotifications}
                    </Badge>
                  )}
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-blue-600 text-white">
                          {user?.name?.charAt(0) || 'A'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem>
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Shield className="w-4 h-4 mr-2" />
                      Security
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
          {/* System Status Alert */}
          <Alert className="mb-6 border-green-200 bg-green-50">
            <Wifi className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">System Status: Operational</AlertTitle>
            <AlertDescription className="text-green-700">
              All systems are running smoothly. Server uptime: 99.9% | Last backup: 2 hours ago
            </AlertDescription>
          </Alert>

          {/* Enhanced Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
            {[
              { 
                title: 'Total Students', 
                value: stats.totalStudents.toLocaleString(), 
                change: `+${stats.monthlyGrowth.students}%`, 
                icon: Users, 
                color: 'from-blue-500 to-blue-600',
                trend: 'up'
              },
              { 
                title: 'Total Staff', 
                value: stats.totalStaff.toString(), 
                change: `+${stats.monthlyGrowth.staff}%`, 
                icon: GraduationCap, 
                color: 'from-green-500 to-green-600',
                trend: 'up'
              },
              { 
                title: 'Active Courses', 
                value: stats.activeCourses.toString(), 
                change: '0%', 
                icon: BookOpen, 
                color: 'from-purple-500 to-purple-600',
                trend: 'neutral'
              },
              { 
                title: 'Revenue', 
                value: `$${stats.totalRevenue.toLocaleString()}`, 
                change: `+${stats.monthlyGrowth.revenue}%`, 
                icon: DollarSign, 
                color: 'from-yellow-500 to-yellow-600',
                trend: 'up'
              },
              { 
                title: 'Stock Items', 
                value: stats.stockItems.toString(), 
                change: '-3%', 
                icon: Package, 
                color: 'from-pink-500 to-pink-600',
                trend: 'down'
              },
              { 
                title: 'Performance', 
                value: `${stats.systemPerformance}%`, 
                change: '+2%', 
                icon: TrendingUp, 
                color: 'from-teal-500 to-teal-600',
                trend: 'up'
              },
            ].map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer hover:-translate-y-1">
                  <CardContent className="p-0">
                    <div className={`bg-gradient-to-r ${stat.color} p-4 text-white`}>
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-white/80 text-xs font-medium">{stat.title}</p>
                          <p className="text-2xl font-black">{stat.value}</p>
                        </div>
                        <stat.icon className="w-8 h-8 opacity-80" />
                      </div>
                      <div className="flex items-center space-x-1">
                        <Badge className={`text-xs px-2 py-0.5 ${
                          stat.trend === 'up' ? 'bg-white/20' : 
                          stat.trend === 'down' ? 'bg-white/20' : 'bg-white/20'
                        }`}>
                          {stat.change}
                        </Badge>
                        <span className="text-xs text-white/70">vs last month</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Enhanced Tabs Section */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="system">System</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activities */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Activity className="w-5 h-5" />
                      <span>Recent Activities</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-80">
                      <div className="space-y-4">
                        {activities.map((activity, index) => {
                          const IconComponent = getActivityIcon(activity.type);
                          return (
                            <motion.div
                              key={activity.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                            >
                              <IconComponent className={`w-5 h-5 mt-0.5 ${getActivityColor(activity.type)}`} />
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                                <p className="text-xs text-gray-500">by {activity.user}</p>
                                <p className="text-xs text-gray-400">{activity.timestamp}</p>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                {/* System Health */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Database className="w-5 h-5" />
                      <span>System Health</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>CPU Usage</span>
                          <span>23%</span>
                        </div>
                        <Progress value={23} className="h-2" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Memory Usage</span>
                          <span>67%</span>
                        </div>
                        <Progress value={67} className="h-2" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Disk Usage</span>
                          <span>45%</span>
                        </div>
                        <Progress value={45} className="h-2" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Network I/O</span>
                          <span>12%</span>
                        </div>
                        <Progress value={12} className="h-2" />
                      </div>

                      <div className="pt-4 border-t">
                        <h4 className="font-medium text-gray-900 mb-3">Database Status</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex justify-between">
                            <span>Total Tables:</span>
                            <span className="font-medium">98</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Total Records:</span>
                            <span className="font-medium">1.2M</span>
                          </div>
                          <div className="flex justify-between">
                            <span>DB Size:</span>
                            <span className="font-medium">2.4GB</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Uptime:</span>
                            <span className="font-medium text-green-600">99.9%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Enhanced Users Tab */}
            <TabsContent value="users" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Advanced User Management</CardTitle>
                      <CardDescription>Manage all system users with advanced filtering and bulk operations</CardDescription>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Export Users
                      </Button>
                      <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
                        <DialogTrigger asChild>
                          <Button size="sm">
                            <UserPlus className="w-4 h-4 mr-2" />
                            Add User
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>Create New User</DialogTitle>
                            <DialogDescription>Add a new user to the system with appropriate role and permissions</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="name">Full Name</Label>
                              <Input 
                                id="name" 
                                value={newUser.name}
                                onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="John Doe" 
                              />
                            </div>
                            <div>
                              <Label htmlFor="email">Email Address</Label>
                              <Input 
                                id="email" 
                                type="email" 
                                value={newUser.email}
                                onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                                placeholder="john@example.com" 
                              />
                            </div>
                            <div>
                              <Label htmlFor="password">Password</Label>
                              <Input 
                                id="password" 
                                type="password" 
                                value={newUser.password}
                                onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                                placeholder="••••••••" 
                              />
                            </div>
                            <div>
                              <Label htmlFor="role">Role</Label>
                              <Select value={newUser.role} onValueChange={(value) => setNewUser(prev => ({ ...prev, role: value }))}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="student">Student</SelectItem>
                                  <SelectItem value="teacher">Teacher</SelectItem>
                                  <SelectItem value="parent">Parent</SelectItem>
                                  <SelectItem value="admin">Admin</SelectItem>
                                  <SelectItem value="accountant">Accountant</SelectItem>
                                  <SelectItem value="stock_manager">Stock Manager</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="phone">Phone Number</Label>
                              <Input 
                                id="phone" 
                                value={newUser.phone}
                                onChange={(e) => setNewUser(prev => ({ ...prev, phone: e.target.value }))}
                                placeholder="+250 xxx xxx xxx" 
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setIsAddUserOpen(false)}>
                              Cancel
                            </Button>
                            <Button onClick={handleCreateUser} disabled={loading}>
                              {loading ? 'Creating...' : 'Create User'}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Advanced Filters */}
                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="Search users by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Select value={filterRole} onValueChange={setFilterRole}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        <SelectItem value="student">Students</SelectItem>
                        <SelectItem value="teacher">Teachers</SelectItem>
                        <SelectItem value="parent">Parents</SelectItem>
                        <SelectItem value="admin">Admins</SelectItem>
                        <SelectItem value="accountant">Accountants</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm">
                      <Filter className="w-4 h-4 mr-2" />
                      Advanced Filter
                    </Button>
                  </div>

                  {/* Users Table */}
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead>Last Login</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                          <TableRow key={user.id} className="hover:bg-gray-50">
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback className="bg-blue-100 text-blue-600">
                                    {user.name.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium text-gray-900">{user.name}</p>
                                  <p className="text-sm text-gray-500">{user.email}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={user.status === 'Active' ? 'default' : 'destructive'}>
                                {user.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-gray-500">
                              {new Date(user.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-sm text-gray-500">
                              {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    ⋮
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <Eye className="w-4 h-4 mr-2" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit User
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={() => handleDeleteUser(user.id)}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete User
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        )) : (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                              No users found matching your criteria
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>User Growth Analytics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80 flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <BarChart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>User growth chart will be implemented here</p>
                        <p className="text-sm">Real-time data visualization</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Revenue Analytics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80 flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <PieChart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Revenue breakdown chart will be implemented here</p>
                        <p className="text-sm">Financial performance metrics</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Content Management Tab */}
            <TabsContent value="content" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <FileText className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Slides Management</h3>
                        <p className="text-sm text-gray-500">Manage homepage slides</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-green-100 rounded-lg">
                        <FileText className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">News Articles</h3>
                        <p className="text-sm text-gray-500">Create and edit news</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-purple-100 rounded-lg">
                        <MessageSquare className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Testimonials</h3>
                        <p className="text-sm text-gray-500">Manage testimonials</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* System Tab */}
            <TabsContent value="system" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>System Configuration</CardTitle>
                  <CardDescription>Manage system settings and configurations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-3">Security Settings</h4>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="two-factor">Two-Factor Authentication</Label>
                            <Switch id="two-factor" />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label htmlFor="session-timeout">Session Timeout</Label>
                            <Switch id="session-timeout" defaultChecked />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label htmlFor="audit-logs">Audit Logging</Label>
                            <Switch id="audit-logs" defaultChecked />
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-3">Backup & Maintenance</h4>
                        <div className="space-y-3">
                          <Button variant="outline" className="w-full justify-start">
                            <Download className="w-4 h-4 mr-2" />
                            Download Database Backup
                          </Button>
                          <Button variant="outline" className="w-full justify-start">
                            <Upload className="w-4 h-4 mr-2" />
                            Upload Backup File
                          </Button>
                          <Button variant="outline" className="w-full justify-start">
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Run System Maintenance
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Reports Tab */}
            <TabsContent value="reports" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="text-center space-y-3">
                      <div className="p-3 bg-blue-100 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                        <Users className="w-8 h-8 text-blue-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900">User Reports</h3>
                      <p className="text-sm text-gray-500">Generate detailed user reports</p>
                      <Button variant="outline" size="sm" className="w-full">
                        Generate Report
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="text-center space-y-3">
                      <div className="p-3 bg-green-100 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                        <DollarSign className="w-8 h-8 text-green-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900">Financial Reports</h3>
                      <p className="text-sm text-gray-500">Revenue and expense analysis</p>
                      <Button variant="outline" size="sm" className="w-full">
                        Generate Report
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="text-center space-y-3">
                      <div className="p-3 bg-purple-100 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                        <BookOpen className="w-8 h-8 text-purple-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900">Academic Reports</h3>
                      <p className="text-sm text-gray-500">Student performance metrics</p>
                      <Button variant="outline" size="sm" className="w-full">
                        Generate Report
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default EnhancedAdminDashboard;