import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Search, Filter, Plus, Edit, Trash2, Eye, RefreshCw,
  Mail, Phone, Calendar, CheckCircle, XCircle, UserPlus,
  Briefcase, GraduationCap, DollarSign, Shield, BookOpen,
  Heart, Clipboard, Package, Send, Download, MoreVertical,
  ChevronDown, ChevronUp, X, Save, UserCheck, AlertCircle,
  Building, Clock, Award, TrendingUp, BarChart3, MessageSquare
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import { Progress } from '@/app/components/ui/progress';
import { toast } from 'sonner';
import { API_BASE_URL } from '@/app/config/apiBase';
import RwandaLocationSelector from '@/app/components/RwandaLocationSelector';

// Role configurations with colors and labels
const ROLE_CONFIGS = {
  school_owner: {
    label: 'School Owner',
    label_rw: 'Umuyobozi w\'Ishuri',
    color: 'bg-yellow-500',
    icon: Building,
    permissions: ['all']
  },
  admin: {
    label: 'Administrator',
    label_rw: 'Umuyobozi Mukuru',
    color: 'bg-blue-500',
    icon: Briefcase,
    permissions: ['staff', 'students', 'finance', 'reports']
  },
  headmaster: {
    label: 'Headmaster',
    label_rw: 'Umuyobozi w\'Ishuri',
    color: 'bg-purple-500',
    icon: GraduationCap,
    permissions: ['students', 'teachers', 'academic', 'reports']
  },
  director_study: {
    label: 'Director of Studies (DOS)',
    label_rw: 'Umuyobozi w\'Amasomo',
    color: 'bg-indigo-500',
    icon: BookOpen,
    permissions: ['teachers', 'subjects', 'timetable', 'performance']
  },
  director_discipline: {
    label: 'Director of Discipline (DOD)',
    label_rw: 'Umuyobozi w\'Imyitwarire',
    color: 'bg-red-500',
    icon: Shield,
    permissions: ['students', 'discipline', 'attendance', 'counseling']
  },
  accountant: {
    label: 'Accountant',
    label_rw: 'Umubare',
    color: 'bg-green-500',
    icon: DollarSign,
    permissions: ['finance', 'payments', 'reports', 'salaries']
  },
  stock_manager: {
    label: 'Stock Manager',
    label_rw: 'Umuyobozi w\'Ibikoresho',
    color: 'bg-orange-500',
    icon: Package,
    permissions: ['inventory', 'orders', 'suppliers', 'reports']
  },
  advisor: {
    label: 'Advisor/Counselor',
    label_rw: 'Umujyanama',
    color: 'bg-pink-500',
    icon: Heart,
    permissions: ['students', 'counseling', 'meetings']
  },
  patron: {
    label: 'Patron',
    label_rw: 'Patron',
    color: 'bg-teal-500',
    icon: UserCheck,
    permissions: ['students', 'activities']
  },
  matron: {
    label: 'Matron',
    label_rw: 'Matron',
    color: 'bg-cyan-500',
    icon: UserCheck,
    permissions: ['students', 'health', 'accommodation']
  },
  teacher: {
    label: 'Teacher',
    label_rw: 'Umwarimu',
    color: 'bg-cyan-500',
    icon: GraduationCap,
    permissions: ['classes', 'marks', 'attendance', 'resources']
  }
};

// API Service class for staff management
class StaffApiService {
  private baseUrl: string;
  private token: string | null;

  constructor() {
    this.baseUrl = API_BASE_URL;
    this.token = localStorage.getItem('token');
  }

  private getHeaders(): HeadersInit {
    return {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    };
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers
      }
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || 'Request failed');
    }
    
    return response.json();
  }

  // Staff CRUD operations
  async getAllStaff(params?: Record<string, string>): Promise<any[]> {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    const result = await this.request<any>(`/staff-management${query}`);
    return result.staff || result.data || result || [];
  }

  async getStaffById(id: number): Promise<any> {
    return this.request<any>(`/staff-management/${id}`);
  }

  async createStaff(staffData: any): Promise<any> {
    return this.request<any>('/staff-management', {
      method: 'POST',
      body: JSON.stringify(staffData)
    });
  }

  async updateStaff(id: number, staffData: any): Promise<any> {
    return this.request<any>(`/staff-management/${id}`, {
      method: 'PUT',
      body: JSON.stringify(staffData)
    });
  }

  async deleteStaff(id: number): Promise<any> {
    return this.request<any>(`/staff-management/${id}`, {
      method: 'DELETE'
    });
  }

  async updateStaffStatus(id: number, status: string): Promise<any> {
    return this.request<any>(`/staff-management/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  }

  // Role-specific endpoints
  async getTeachers(params?: Record<string, string>): Promise<any[]> {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    const result = await this.request<any>(`/teachers${query}`);
    return result.teachers || result.data || result || [];
  }

  async getAccountants(): Promise<any[]> {
    const result = await this.request<any>('/accountant');
    return result.accountants || result.data || result || [];
  }

  async getDODStaff(): Promise<any[]> {
    const result = await this.request<any>('/dod-comprehensive');
    return result.staff || result.data || result || [];
  }

  async getDOSStaff(): Promise<any[]> {
    const result = await this.request<any>('/dos-management');
    return result.staff || result.data || result || [];
  }

  async getStockManagers(): Promise<any[]> {
    const result = await this.request<any>('/stock');
    return result.managers || result.staff || result.data || result || [];
  }

  // Statistics and analytics
  async getStaffStatistics(): Promise<any> {
    const result = await this.request<any>('/staff-management/stats');
    return result.stats || result;
  }

  async getStaffByRole(role: string): Promise<any[]> {
    const result = await this.request<any>(`/staff-management?role=${role}`);
    return result.staff || result.data || result || [];
  }

  // Search
  async searchStaff(query: string): Promise<any[]> {
    const result = await this.request<any>(`/staff-management/search?q=${encodeURIComponent(query)}`);
    return result.staff || result.data || result || [];
  }

  // Salary and payroll
  async getStaffSalaries(staffId?: number): Promise<any[]> {
    const endpoint = staffId ? `/salaries?staff_id=${staffId}` : '/salaries';
    const result = await this.request<any>(endpoint);
    return result.salaries || result.data || result || [];
  }

  async updateSalary(staffId: number, salaryData: any): Promise<any> {
    return this.request<any>(`/salaries/${staffId}`, {
      method: 'PUT',
      body: JSON.stringify(salaryData)
    });
  }

  // Leave management
  async getStaffLeaves(staffId?: number): Promise<any[]> {
    const endpoint = staffId ? `/staff-leaves?staff_id=${staffId}` : '/staff-leaves';
    const result = await this.request<any>(endpoint);
    return result.leaves || result.data || result || [];
  }

  async requestLeave(leaveData: any): Promise<any> {
    return this.request<any>('/staff-leaves', {
      method: 'POST',
      body: JSON.stringify(leaveData)
    });
  }

  // Attendance
  async getStaffAttendance(staffId: number, params?: Record<string, string>): Promise<any[]> {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    const result = await this.request<any>(`/staff-attendance/${staffId}${query}`);
    return result.attendance || result.data || result || [];
  }

  async markStaffAttendance(staffId: number, attendanceData: any): Promise<any> {
    return this.request<any>(`/staff-attendance/${staffId}`, {
      method: 'POST',
      body: JSON.stringify(attendanceData)
    });
  }
}

const staffApi = new StaffApiService();

// Main Enhanced Staff Management Component
export default function EnhancedStaffManagement() {
  const [activeTab, setActiveTab] = useState('all');
  const [staff, setStaff] = useState<any[]>([]);
  const [filteredStaff, setFilteredStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [processing, setProcessing] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    role_name: '',
    department: '',
    specialization: '',
    hire_date: new Date().toISOString().split('T')[0],
    salary: '',
    status: 'active',
    address: '',
    emergency_contact: '',
    notes: ''
  });

  // Fetch all staff data
  const fetchStaffData = useCallback(async () => {
    try {
      setLoading(true);
      const [staffData, statsData] = await Promise.all([
        staffApi.getAllStaff(),
        staffApi.getStaffStatistics().catch(() => null)
      ]);
      
      setStaff(Array.isArray(staffData) ? staffData : []);
      setStats(statsData);
    } catch (error: any) {
      console.error('Error fetching staff:', error);
      toast.error(error.message || 'Failed to load staff data');
      setStaff([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaffData();
  }, [fetchStaffData]);

  // Filter and search staff
  useEffect(() => {
    let result = [...staff];

    // Filter by role tab
    if (activeTab !== 'all') {
      const roleMap: Record<string, string> = {
        'teachers': 'teacher',
        'admin': 'admin',
        'accountants': 'accountant',
        'dod': 'director_discipline',
        'dos': 'director_study',
        'stock': 'stock_manager',
        'advisors': 'advisor',
        'patrons': 'patron',
        'matrons': 'matron'
      };
      const role = roleMap[activeTab] || activeTab;
      if (role !== 'all') {
        result = result.filter(s => s.role_name === role);
      }
    }

    // Filter by role dropdown
    if (filterRole !== 'all') {
      result = result.filter(s => s.role_name === filterRole);
    }

    // Filter by status
    if (filterStatus !== 'all') {
      const statusMap: Record<string, string> = {
        'active': '1',
        'inactive': '0'
      };
      const isActive = statusMap[filterStatus] === '1';
      result = result.filter(s => s.is_active === isActive);
    }

    // Search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(s =>
        s.first_name?.toLowerCase().includes(query) ||
        s.last_name?.toLowerCase().includes(query) ||
        s.email?.toLowerCase().includes(query) ||
        s.phone?.toLowerCase().includes(query) ||
        s.role_name?.toLowerCase().includes(query) ||
        s.department?.toLowerCase().includes(query)
      );
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`);
          break;
        case 'role':
          comparison = (a.role_name || '').localeCompare(b.role_name || '');
          break;
        case 'department':
          comparison = (a.department || '').localeCompare(b.department || '');
          break;
        case 'hire_date':
          comparison = new Date(a.hire_date || 0).getTime() - new Date(b.hire_date || 0).getTime();
          break;
        default:
          comparison = 0;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredStaff(result);
  }, [staff, activeTab, filterRole, filterStatus, searchQuery, sortBy, sortOrder]);

  // Handle create staff
  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    
    try {
      await staffApi.createStaff(formData);
      toast.success('Staff member added successfully!');
      setShowAddModal(false);
      resetForm();
      fetchStaffData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to add staff member');
    } finally {
      setProcessing(false);
    }
  };

  // Handle update staff
  const handleUpdateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaff) return;
    
    setProcessing(true);
    
    try {
      await staffApi.updateStaff(selectedStaff.id, formData);
      toast.success('Staff member updated successfully!');
      setShowEditModal(false);
      resetForm();
      fetchStaffData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update staff member');
    } finally {
      setProcessing(false);
    }
  };

  // Handle delete staff
  const handleDeleteStaff = async () => {
    if (!selectedStaff) return;
    
    setProcessing(true);
    
    try {
      await staffApi.deleteStaff(selectedStaff.id);
      toast.success('Staff member deleted successfully!');
      setShowDeleteConfirm(false);
      setSelectedStaff(null);
      fetchStaffData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete staff member');
    } finally {
      setProcessing(false);
    }
  };

  // Handle status toggle
  const handleToggleStatus = async (member: any) => {
    try {
      const newStatus = member.is_active ? 'inactive' : 'active';
      await staffApi.updateStaffStatus(member.id, newStatus);
      toast.success(`Staff member marked as ${newStatus}`);
      fetchStaffData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update status');
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      role_name: '',
      department: '',
      specialization: '',
      hire_date: new Date().toISOString().split('T')[0],
      salary: '',
      status: 'active',
      address: '',
      emergency_contact: '',
      notes: ''
    });
  };

  // Open edit modal
  const openEditModal = (member: any) => {
    setSelectedStaff(member);
    setFormData({
      first_name: member.first_name || '',
      last_name: member.last_name || '',
      email: member.email || '',
      phone: member.phone || '',
      role_name: member.role_name || '',
      department: member.department || '',
      specialization: member.specialization || '',
      hire_date: member.hire_date?.split('T')[0] || new Date().toISOString().split('T')[0],
      salary: member.salary || '',
      status: member.is_active ? 'active' : 'inactive',
      address: member.address || '',
      emergency_contact: member.emergency_contact || '',
      notes: member.notes || ''
    });
    setShowEditModal(true);
  };

  // Open view modal
  const openViewModal = (member: any) => {
    setSelectedStaff(member);
    setShowViewModal(true);
  };

  // Get role configuration
  const getRoleConfig = (role: string) => {
    return ROLE_CONFIGS[role as keyof typeof ROLE_CONFIGS] || {
      label: role,
      label_rw: role,
      color: 'bg-gray-500',
      icon: Users
    };
  };

  // Calculate statistics
  const calculateStats = () => {
    const total = staff.length;
    const active = staff.filter(s => s.is_active).length;
    const byRole = staff.reduce((acc, s) => {
      const role = s.role_name || 'unknown';
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return { total, active, inactive: total - active, byRole };
  };

  const statsData = calculateStats();

  if (loading && staff.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Gutegura amakuru y'abakozi...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 text-white rounded-2xl shadow-2xl p-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">Staff Management</h1>
              <p className="text-blue-100 text-lg">Manage all school staff members</p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={fetchStaffData}
                variant="outline"
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button
                onClick={() => { resetForm(); setShowAddModal(true); }}
                className="bg-white text-indigo-600 hover:bg-blue-50"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Staff
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="border-2 border-indigo-100 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Staff</p>
                    <p className="text-3xl font-bold text-indigo-600">{statsData.total}</p>
                  </div>
                  <div className="bg-indigo-100 p-3 rounded-full">
                    <Users className="w-6 h-6 text-indigo-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="border-2 border-green-100 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active</p>
                    <p className="text-3xl font-bold text-green-600">{statsData.active}</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="border-2 border-red-100 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Inactive</p>
                    <p className="text-3xl font-bold text-red-600">{statsData.inactive}</p>
                  </div>
                  <div className="bg-red-100 p-3 rounded-full">
                    <XCircle className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="border-2 border-purple-100 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Roles</p>
                    <p className="text-3xl font-bold text-purple-600">{Object.keys(statsData.byRole).length}</p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-full">
                    <Briefcase className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Filters and Search */}
        <Card className="border-2 border-gray-200 shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search staff by name, email, phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-2 border-gray-200 focus:border-indigo-500"
                />
              </div>
              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger className="w-[180px] border-2 border-gray-200">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {Object.entries(ROLE_CONFIGS).map(([key, config]) => (
                    <SelectItem key={key} value={key}>{config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[150px] border-2 border-gray-200">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[150px] border-2 border-gray-200">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="role">Role</SelectItem>
                  <SelectItem value="department">Department</SelectItem>
                  <SelectItem value="hire_date">Hire Date</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="border-2 border-gray-200"
              >
                {sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Role Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5 lg:grid-cols-11 bg-white shadow-lg rounded-xl p-2 border-2 border-gray-200">
            <TabsTrigger value="all" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
              All
            </TabsTrigger>
            <TabsTrigger value="teachers" className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white">
              Teachers
            </TabsTrigger>
            <TabsTrigger value="admin" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Admin
            </TabsTrigger>
            <TabsTrigger value="accountants" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
              Finance
            </TabsTrigger>
            <TabsTrigger value="dod" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
              DOD
            </TabsTrigger>
            <TabsTrigger value="dos" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
              DOS
            </TabsTrigger>
            <TabsTrigger value="stock" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">
              Stock
            </TabsTrigger>
            <TabsTrigger value="advisors" className="data-[state=active]:bg-pink-600 data-[state=active]:text-white">
              Advisors
            </TabsTrigger>
            <TabsTrigger value="patrons" className="data-[state=active]:bg-teal-600 data-[state=active]:text-white">
              Patrons
            </TabsTrigger>
            <TabsTrigger value="matrons" className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white">
              Matrons
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {/* Staff Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {filteredStaff.map((member, index) => {
                  const roleConfig = getRoleConfig(member.role_name);
                  const RoleIcon = roleConfig.icon;

                  return (
                    <motion.div
                      key={member.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="border-2 border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-12 h-12 ${roleConfig.color} rounded-full flex items-center justify-center text-white`}>
                                <RoleIcon className="w-6 h-6" />
                              </div>
                              <div>
                                <h3 className="font-bold text-gray-900">{member.first_name} {member.last_name}</h3>
                                <p className="text-sm text-gray-500">{roleConfig.label}</p>
                              </div>
                            </div>
                            <Badge variant={member.is_active ? 'default' : 'destructive'}>
                              {member.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>

                          <div className="space-y-2 mb-4">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Mail className="w-4 h-4 text-gray-400" />
                              <span className="truncate">{member.email || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Phone className="w-4 h-4 text-gray-400" />
                              <span>{member.phone || 'N/A'}</span>
                            </div>
                            {member.department && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Briefcase className="w-4 h-4 text-gray-400" />
                                <span>{member.department}</span>
                              </div>
                            )}
                          </div>

                          <div className="flex gap-2 pt-4 border-t">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openViewModal(member)}
                              className="flex-1"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEditModal(member)}
                              className="flex-1"
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant={member.is_active ? 'destructive' : 'default'}
                              onClick={() => handleToggleStatus(member)}
                              className="flex-1"
                            >
                              {member.is_active ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {filteredStaff.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No Staff Found</h3>
                <p className="text-gray-500">Try adjusting your search or filters</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Staff Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Staff Member</DialogTitle>
            <DialogDescription>Fill in the details to add a new staff member</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateStaff}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div>
                <Label>First Name *</Label>
                <Input
                  value={formData.first_name}
                  onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label>Last Name *</Label>
                <Input
                  value={formData.last_name}
                  onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
              <div>
                <Label>Role *</Label>
                <Select
                  value={formData.role_name}
                  onValueChange={(value) => setFormData({...formData, role_name: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ROLE_CONFIGS).map(([key, config]) => (
                      <SelectItem key={key} value={key}>{config.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Department</Label>
                <Input
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                />
              </div>
              <div>
                <Label>Specialization</Label>
                <Input
                  value={formData.specialization}
                  onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                />
              </div>
              <div>
                <Label>Hire Date</Label>
                <Input
                  type="date"
                  value={formData.hire_date}
                  onChange={(e) => setFormData({...formData, hire_date: e.target.value})}
                />
              </div>
              <div>
                <Label>Salary</Label>
                <Input
                  type="number"
                  value={formData.salary}
                  onChange={(e) => setFormData({...formData, salary: e.target.value})}
                />
              </div>
              <div>
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({...formData, status: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <Label>Address</Label>
                <Textarea
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                />
              </div>
              <div className="md:col-span-2">
                <Label className="text-lg font-semibold text-indigo-700">Location (Rwanda) *</Label>
                <RwandaLocationSelector
                  onLocationChange={(location) => setFormData({...formData, ...location})}
                  required={true}
                />
              </div>
              <div className="md:col-span-2">
                <Label>Notes</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={processing}>
                {processing ? 'Adding...' : 'Add Staff'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Staff Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Staff Member</DialogTitle>
            <DialogDescription>Update the staff member information</DialogDescription>
          </DialogHeader>
          {selectedStaff && (
            <form onSubmit={handleUpdateStaff}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                <div>
                  <Label>First Name *</Label>
                  <Input
                    value={formData.first_name}
                    onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label>Last Name *</Label>
                  <Input
                    value={formData.last_name}
                    onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Role *</Label>
                  <Select
                    value={formData.role_name}
                    onValueChange={(value) => setFormData({...formData, role_name: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(ROLE_CONFIGS).map(([key, config]) => (
                        <SelectItem key={key} value={key}>{config.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Department</Label>
                  <Input
                    value={formData.department}
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Specialization</Label>
                  <Input
                    value={formData.specialization}
                    onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Hire Date</Label>
                  <Input
                    type="date"
                    value={formData.hire_date}
                    onChange={(e) => setFormData({...formData, hire_date: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Salary</Label>
                  <Input
                    type="number"
                    value={formData.salary}
                    onChange={(e) => setFormData({...formData, salary: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({...formData, status: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2">
                  <Label>Address</Label>
                  <Textarea
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Notes</Label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowEditModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={processing}>
                  {processing ? 'Saving...' : 'Save Changes'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* View Staff Modal */}
      <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Staff Details</DialogTitle>
          </DialogHeader>
          {selectedStaff && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className={`w-20 h-20 ${getRoleConfig(selectedStaff.role_name).color} rounded-full flex items-center justify-center text-white text-2xl font-bold`}>
                  {selectedStaff.first_name?.[0]}{selectedStaff.last_name?.[0]}
                </div>
                <div>
                  <h3 className="text-2xl font-bold">{selectedStaff.first_name} {selectedStaff.last_name}</h3>
                  <Badge className={getRoleConfig(selectedStaff.role_name).color}>
                    {getRoleConfig(selectedStaff.role_name).label}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <Label className="text-xs text-gray-500">Email</Label>
                  <p className="font-medium">{selectedStaff.email || 'N/A'}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <Label className="text-xs text-gray-500">Phone</Label>
                  <p className="font-medium">{selectedStaff.phone || 'N/A'}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <Label className="text-xs text-gray-500">Department</Label>
                  <p className="font-medium">{selectedStaff.department || 'N/A'}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <Label className="text-xs text-gray-500">Specialization</Label>
                  <p className="font-medium">{selectedStaff.specialization || 'N/A'}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <Label className="text-xs text-gray-500">Hire Date</Label>
                  <p className="font-medium">
                    {selectedStaff.hire_date ? new Date(selectedStaff.hire_date).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <Label className="text-xs text-gray-500">Status</Label>
                  <p className="font-medium">
                    <Badge variant={selectedStaff.is_active ? 'default' : 'destructive'}>
                      {selectedStaff.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <Button onClick={() => { setShowViewModal(false); openEditModal(selectedStaff); }} className="flex-1">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button variant="destructive" onClick={() => { setShowViewModal(false); setShowDeleteConfirm(true); }} className="flex-1">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedStaff?.first_name} {selectedStaff?.last_name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteStaff} disabled={processing}>
              {processing ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
