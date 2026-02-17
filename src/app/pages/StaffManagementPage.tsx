import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Search, Filter, Plus, MoreVertical, Mail, Phone, MapPin,
  Calendar, DollarSign, Briefcase, CheckCircle, XCircle, Trash2, Edit,
  FileText, Download, ChevronLeft, ChevronRight, Star, Shield,
  Award, Clock, Building, UserPlus, RefreshCw
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { toast } from 'sonner';
import { API_BASE_URL } from '@/app/config/apiBase';

// Types derived from backend structure
interface StaffMember {
  id: number;
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role_name: string;
  role_label: string;
  department: string;
  specialization: string;
  employment_status: 'active' | 'inactive' | 'suspended' | 'terminated';
  hire_date: string;
  salary: number;
  contract_type: 'permanent' | 'contract' | 'probation' | 'intern';
  profile_image?: string;
}

interface StaffStats {
  total_staff: number;
  active_staff: number;
  total_teachers: number;
  total_admin: number;
  avg_tenure_days: number;
}

const StaffManagementPage: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<StaffStats | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Initial fetch
  useEffect(() => {
    fetchStaff();
  }, [page, roleFilter, statusFilter]);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        role: roleFilter,
        status: statusFilter,
        search: searchQuery,
        analytics: 'true'
      });

      const response = await fetch(`${API_BASE_URL}/staff-advanced?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        setStaff(data.staff);
        setStats(data.analytics?.summary);
        setTotalPages(data.pagination.pages);
      } else {
        toast.error(data.message || 'Failed to fetch staff');
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
      toast.error('Failed to load staff data');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchStaff();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to deactivate this staff member?')) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/staff-advanced/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        toast.success('Staff member deactivated successfully');
        fetchStaff();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Failed to delete staff member');
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 border-red-200';
      case 'teacher': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'accountant': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-gray-400';
      case 'suspended': return 'bg-red-500';
      default: return 'bg-yellow-500';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Staff Management</h1>
          <p className="text-gray-500 mt-1">Manage employees, track performance, and handle payroll.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2" onClick={() => fetchStaff()}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
          <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setIsAddOpen(true)}>
            <UserPlus className="w-4 h-4" />
            Add New Staff
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-none shadow-sm bg-white">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Staff</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.total_staff}</h3>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-white">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Active Members</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.active_staff}</h3>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-white">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Teaching Staff</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.total_teachers}</h3>
              </div>
              <div className="p-3 bg-purple-50 rounded-full">
                <Briefcase className="w-6 h-6 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-white">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Admin Staff</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.total_admin}</h3>
              </div>
              <div className="p-3 bg-amber-50 rounded-full">
                <Shield className="w-6 h-6 text-amber-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filters */}
      <Card className="border-none shadow-sm bg-white">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by name, email, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full"
              />
            </form>
            <div className="flex gap-4">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="teacher">Teachers</SelectItem>
                  <SelectItem value="admin">Admins</SelectItem>
                  <SelectItem value="accountant">Accountants</SelectItem>
                  <SelectItem value="support_staff">Support Staff</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Staff List */}
      <Card className="border-none shadow-sm bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 font-medium">Employee</th>
                <th className="px-6 py-4 font-medium">Role & Dept</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Contact</th>
                <th className="px-6 py-4 font-medium">Joined</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex justify-center items-center gap-2 text-gray-500">
                      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      Loading staff data...
                    </div>
                  </td>
                </tr>
              ) : staff.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No staff members found matching your criteria.
                  </td>
                </tr>
              ) : (
                staff.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold overflow-hidden">
                          {member.profile_image ? (
                            <img src={member.profile_image} alt="" className="w-full h-full object-cover" />
                          ) : (
                            `${member.first_name[0]}${member.last_name[0]}`
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{member.first_name} {member.last_name}</div>
                          <div className="text-xs text-gray-500">{member.employee_id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <Badge variant="outline" className={`w-fit ${getRoleBadgeColor(member.role_name)}`}>
                          {member.role_label || member.role_name}
                        </Badge>
                        <span className="text-xs text-gray-500">{member.department}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${getStatusColor(member.employment_status)}`} />
                        <span className="capitalize text-gray-700">{member.employment_status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 text-gray-600">
                        <div className="flex items-center gap-2 text-xs">
                          <Mail className="w-3 h-3" />
                          {member.email}
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <Phone className="w-3 h-3" />
                          {member.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(member.hire_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" onClick={() => { setSelectedStaff(member); setIsEditOpen(true); }}>
                          <Edit className="w-4 h-4 text-gray-500 hover:text-blue-600" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(member.id)}>
                          <Trash2 className="w-4 h-4 text-gray-500 hover:text-red-600" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
      
      {/* Add/Edit Dialogs can be added here */}
    </div>
  );
};

export default StaffManagementPage;
