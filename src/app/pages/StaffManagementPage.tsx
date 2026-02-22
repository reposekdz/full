import React, { useState, useEffect, useMemo } from 'react';
import {
  Users, Search, Filter, Download, Upload, UserPlus, Eye, Edit, Trash2,
  Phone, Mail, MessageSquare, Calendar, Award, Clock, SortAsc, SortDesc,
  RefreshCw, FileText, Settings, MoreVertical, Briefcase, GraduationCap,
  MapPin, Star, CheckCircle, AlertTriangle, Building, UserCheck
} from 'lucide-react';
import { toast } from 'sonner';
import apiService from '@/app/services/apiService';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Checkbox } from '@/app/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';

interface Staff {
  id: number;
  staff_code: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  gender: string;
  date_of_birth: string;
  role: string;
  department: string;
  position: string;
  hire_date: string;
  salary: number;
  status: string;
  qualification: string;
  experience_years: number;
  address: string;
  emergency_contact: string;
  emergency_phone: string;
  contract_type: string;
  contract_end_date?: string;
  performance_rating: number;
  last_evaluation: string;
  subjects_taught?: string[];
  classes_assigned?: string[];
  profile_image?: string;
}

const StaffManagementPage: React.FC = () => {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedContractType, setSelectedContractType] = useState<string>('all');
  const [selectedStaff, setSelectedStaff] = useState<number[]>([]);
  const [sortConfig, setSortConfig] = useState<{key: string, direction: 'asc' | 'desc'} | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    teachers: 0,
    admin: 0,
    support: 0,
    avgSalary: 0,
    avgExperience: 0,
    avgRating: 0
  });

  const [newStaff, setNewStaff] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    gender: 'Male',
    date_of_birth: '',
    role: 'Teacher',
    department: 'Academic',
    position: '',
    hire_date: '',
    salary: 0,
    qualification: '',
    experience_years: 0,
    address: '',
    emergency_contact: '',
    emergency_phone: '',
    contract_type: 'Permanent'
  });

  const roles = ['Teacher', 'DOS', 'DOD', 'Headmaster', 'Admin', 'Accountant', 'Librarian', 'Security', 'Maintenance'];
  const departments = ['Academic', 'Administration', 'Finance', 'IT', 'Security', 'Maintenance', 'Library'];
  const contractTypes = ['Permanent', 'Contract', 'Part-time', 'Temporary'];

  useEffect(() => {
    fetchStaff();
    fetchStats();
  }, []);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const response = await apiService.request('/staff/all', {
        method: 'GET'
      });
      
      if (response.success) {
        setStaff(response.staff || []);
      } else {
        toast.error('Failed to fetch staff');
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
      toast.error('Error loading staff');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await apiService.request('/staff/statistics');
      if (response.success) {
        setStats(response.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const filteredStaff = useMemo(() => {
    let filtered = staff;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(member => 
        `${member.first_name} ${member.last_name}`.toLowerCase().includes(query) ||
        member.staff_code.toLowerCase().includes(query) ||
        member.email.toLowerCase().includes(query) ||
        member.phone.includes(query) ||
        member.position.toLowerCase().includes(query)
      );
    }

    // Role filter
    if (selectedRole !== 'all') {
      filtered = filtered.filter(member => member.role === selectedRole);
    }

    // Department filter
    if (selectedDepartment !== 'all') {
      filtered = filtered.filter(member => member.department === selectedDepartment);
    }

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(member => member.status === selectedStatus);
    }

    // Contract type filter
    if (selectedContractType !== 'all') {
      filtered = filtered.filter(member => member.contract_type === selectedContractType);
    }

    // Sorting
    if (sortConfig) {
      filtered.sort((a, b) => {
        let aVal = a[sortConfig.key as keyof Staff];
        let bVal = b[sortConfig.key as keyof Staff];

        if (sortConfig.key === 'full_name') {
          aVal = `${a.first_name} ${a.last_name}`;
          bVal = `${b.first_name} ${b.last_name}`;
        }

        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return sortConfig.direction === 'asc' 
            ? aVal.localeCompare(bVal) 
            : bVal.localeCompare(aVal);
        }

        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
        }

        return 0;
      });
    }

    return filtered;
  }, [staff, searchQuery, selectedRole, selectedDepartment, selectedStatus, selectedContractType, sortConfig]);

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev?.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleSelectStaff = (staffId: number) => {
    setSelectedStaff(prev => 
      prev.includes(staffId)
        ? prev.filter(id => id !== staffId)
        : [...prev, staffId]
    );
  };

  const handleSelectAll = () => {
    setSelectedStaff(prev => 
      prev.length === filteredStaff.length 
        ? [] 
        : filteredStaff.map(s => s.id)
    );
  };

  const handleAddStaff = async () => {
    try {
      const response = await apiService.request('/staff/create', {
        method: 'POST',
        body: JSON.stringify(newStaff)
      });

      if (response.success) {
        toast.success('Staff member added successfully');
        setShowAddDialog(false);
        setNewStaff({
          first_name: '',
          last_name: '',
          email: '',
          phone: '',
          gender: 'Male',
          date_of_birth: '',
          role: 'Teacher',
          department: 'Academic',
          position: '',
          hire_date: '',
          salary: 0,
          qualification: '',
          experience_years: 0,
          address: '',
          emergency_contact: '',
          emergency_phone: '',
          contract_type: 'Permanent'
        });
        await fetchStaff();
      } else {
        toast.error('Failed to add staff member');
      }
    } catch (error) {
      toast.error('Error adding staff member');
    }
  };

  const handleEditStaff = async () => {
    if (!editingStaff) return;

    try {
      const response = await apiService.request(`/staff/${editingStaff.id}`, {
        method: 'PUT',
        body: JSON.stringify(editingStaff)
      });

      if (response.success) {
        toast.success('Staff member updated successfully');
        setShowEditDialog(false);
        setEditingStaff(null);
        await fetchStaff();
      } else {
        toast.error('Failed to update staff member');
      }
    } catch (error) {
      toast.error('Error updating staff member');
    }
  };

  const handleDeleteStaff = async (staffId: number) => {
    const member = staff.find(s => s.id === staffId);
    if (!member) return;

    if (confirm(`Are you sure you want to delete ${member.first_name} ${member.last_name}?`)) {
      try {
        await apiService.request(`/staff/${staffId}`, {
          method: 'DELETE'
        });
        toast.success('Staff member deleted successfully');
        await fetchStaff();
      } catch (error) {
        toast.error('Failed to delete staff member');
      }
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedStaff.length === 0) {
      toast.error('Please select staff members first');
      return;
    }

    try {
      switch (action) {
        case 'export':
          const selectedData = staff.filter(s => selectedStaff.includes(s.id));
          const XLSXModule = await import('xlsx');
          const worksheet = XLSXModule.utils.json_to_sheet(selectedData);
          const workbook = XLSXModule.utils.book_new();
          XLSXModule.utils.book_append_sheet(workbook, worksheet, 'Staff');
          XLSXModule.writeFile(workbook, `Staff_${new Date().toISOString().split('T')[0]}.xlsx`);
          toast.success(`Exported ${selectedStaff.length} staff members`);
          break;

        case 'activate':
          await apiService.request('/staff/bulk-update', {
            method: 'PUT',
            body: JSON.stringify({
              staff_ids: selectedStaff,
              status: 'active'
            })
          });
          await fetchStaff();
          toast.success(`Activated ${selectedStaff.length} staff members`);
          break;

        case 'deactivate':
          await apiService.request('/staff/bulk-update', {
            method: 'PUT',
            body: JSON.stringify({
              staff_ids: selectedStaff,
              status: 'inactive'
            })
          });
          await fetchStaff();
          toast.success(`Deactivated ${selectedStaff.length} staff members`);
          break;
      }
      setSelectedStaff([]);
    } catch (error) {
      toast.error('Bulk action failed');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-red-100 text-red-800',
      suspended: 'bg-yellow-100 text-yellow-800',
      terminated: 'bg-gray-100 text-gray-800'
    };
    return variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800';
  };

  const getRoleBadge = (role: string) => {
    const variants = {
      Teacher: 'bg-blue-100 text-blue-800',
      DOS: 'bg-purple-100 text-purple-800',
      DOD: 'bg-indigo-100 text-indigo-800',
      Headmaster: 'bg-red-100 text-red-800',
      Admin: 'bg-green-100 text-green-800',
      Accountant: 'bg-yellow-100 text-yellow-800',
      Librarian: 'bg-pink-100 text-pink-800',
      Security: 'bg-orange-100 text-orange-800',
      Maintenance: 'bg-gray-100 text-gray-800'
    };
    return variants[role as keyof typeof variants] || 'bg-gray-100 text-gray-800';
  };

  const getPerformanceStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Staff Management
            </h1>
            <p className="text-gray-600 mt-1">Manage all staff members with advanced features</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setViewMode(viewMode === 'table' ? 'grid' : 'table')}
              variant="outline"
              size="sm"
            >
              {viewMode === 'table' ? <Users className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
              {viewMode === 'table' ? 'Grid View' : 'Table View'}
            </Button>
            
            <Button onClick={fetchStaff} variant="outline" size="sm" disabled={loading}>
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Staff
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Staff Member</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="first_name">First Name</Label>
                    <Input
                      id="first_name"
                      value={newStaff.first_name}
                      onChange={(e) => setNewStaff({...newStaff, first_name: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="last_name">Last Name</Label>
                    <Input
                      id="last_name"
                      value={newStaff.last_name}
                      onChange={(e) => setNewStaff({...newStaff, last_name: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newStaff.email}
                      onChange={(e) => setNewStaff({...newStaff, email: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={newStaff.phone}
                      onChange={(e) => setNewStaff({...newStaff, phone: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="gender">Gender</Label>
                    <Select value={newStaff.gender} onValueChange={(value) => setNewStaff({...newStaff, gender: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="date_of_birth">Date of Birth</Label>
                    <Input
                      id="date_of_birth"
                      type="date"
                      value={newStaff.date_of_birth}
                      onChange={(e) => setNewStaff({...newStaff, date_of_birth: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="role">Role</Label>
                    <Select value={newStaff.role} onValueChange={(value) => setNewStaff({...newStaff, role: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map(role => (
                          <SelectItem key={role} value={role}>{role}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="department">Department</Label>
                    <Select value={newStaff.department} onValueChange={(value) => setNewStaff({...newStaff, department: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map(dept => (
                          <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="position">Position</Label>
                    <Input
                      id="position"
                      value={newStaff.position}
                      onChange={(e) => setNewStaff({...newStaff, position: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="hire_date">Hire Date</Label>
                    <Input
                      id="hire_date"
                      type="date"
                      value={newStaff.hire_date}
                      onChange={(e) => setNewStaff({...newStaff, hire_date: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="salary">Salary (RWF)</Label>
                    <Input
                      id="salary"
                      type="number"
                      value={newStaff.salary}
                      onChange={(e) => setNewStaff({...newStaff, salary: Number(e.target.value)})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="contract_type">Contract Type</Label>
                    <Select value={newStaff.contract_type} onValueChange={(value) => setNewStaff({...newStaff, contract_type: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {contractTypes.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="qualification">Qualification</Label>
                    <Input
                      id="qualification"
                      value={newStaff.qualification}
                      onChange={(e) => setNewStaff({...newStaff, qualification: e.target.value})}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      value={newStaff.address}
                      onChange={(e) => setNewStaff({...newStaff, address: e.target.value})}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddStaff}>
                    Add Staff Member
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Staff</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Staff</p>
                  <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Teachers</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.teachers}</p>
                </div>
                <GraduationCap className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Rating</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.avgRating}/5</p>
                </div>
                <Star className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by name, code, email, phone, or position..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Filters
                {(selectedRole !== 'all' || selectedDepartment !== 'all' || selectedStatus !== 'all' || selectedContractType !== 'all') && (
                  <Badge variant="secondary" className="ml-1">Active</Badge>
                )}
              </Button>
            </div>

            {showFilters && (
              <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    {roles.map(role => (
                      <SelectItem key={role} value={role}>{role}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Departments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments.map(dept => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="terminated">Terminated</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedContractType} onValueChange={setSelectedContractType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Contract Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Contracts</SelectItem>
                    {contractTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bulk Actions */}
        {selectedStaff.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {selectedStaff.length} staff member(s) selected
                </span>
                <div className="flex items-center gap-2">
                  <Button onClick={() => handleBulkAction('export')} variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                  <Button onClick={() => handleBulkAction('activate')} variant="outline" size="sm">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Activate
                  </Button>
                  <Button onClick={() => handleBulkAction('deactivate')} variant="outline" size="sm">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Deactivate
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Staff Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Staff Members ({filteredStaff.length})</span>
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedStaff.length === filteredStaff.length && filteredStaff.length > 0}
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm text-gray-600">Select All</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">Loading staff...</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left">
                        <Checkbox
                          checked={selectedStaff.length === filteredStaff.length && filteredStaff.length > 0}
                          onCheckedChange={handleSelectAll}
                        />
                      </th>
                      <th className="px-4 py-3 text-left cursor-pointer hover:bg-gray-100" onClick={() => handleSort('staff_code')}>
                        <div className="flex items-center gap-2">
                          Code
                          {sortConfig?.key === 'staff_code' && (
                            sortConfig.direction === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
                          )}
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left cursor-pointer hover:bg-gray-100" onClick={() => handleSort('full_name')}>
                        <div className="flex items-center gap-2">
                          Name
                          {sortConfig?.key === 'full_name' && (
                            sortConfig.direction === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
                          )}
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left">Role & Department</th>
                      <th className="px-4 py-3 text-left">Contact</th>
                      <th className="px-4 py-3 text-left cursor-pointer hover:bg-gray-100" onClick={() => handleSort('salary')}>
                        <div className="flex items-center gap-2">
                          Salary
                          {sortConfig?.key === 'salary' && (
                            sortConfig.direction === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
                          )}
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left">Performance</th>
                      <th className="px-4 py-3 text-left">Status</th>
                      <th className="px-4 py-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredStaff.map((member) => (
                      <tr key={member.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <Checkbox
                            checked={selectedStaff.includes(member.id)}
                            onCheckedChange={() => handleSelectStaff(member.id)}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-mono text-sm">{member.staff_code}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                              {member.first_name[0]}{member.last_name[0]}
                            </div>
                            <div>
                              <div className="font-medium">{member.first_name} {member.last_name}</div>
                              <div className="text-sm text-gray-500">{member.position}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <Badge className={getRoleBadge(member.role)}>
                              {member.role}
                            </Badge>
                            <div className="text-sm text-gray-500 mt-1">{member.department}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="space-y-1">
                            <div className="text-sm">{member.email}</div>
                            <div className="text-sm text-gray-500">{member.phone}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <div className="font-medium">{member.salary.toLocaleString()} RWF</div>
                            <div className="text-sm text-gray-500">{member.contract_type}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            {getPerformanceStars(member.performance_rating)}
                          </div>
                          <div className="text-sm text-gray-500">{member.experience_years} years exp.</div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={getStatusBadge(member.status)}>
                            {member.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <Button
                              onClick={() => {
                                setEditingStaff(member);
                                setShowEditDialog(true);
                              }}
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => window.open(`tel:${member.phone}`)}
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <Phone className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => window.open(`mailto:${member.email}`)}
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <Mail className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => handleDeleteStaff(member.id)}
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Staff Member</DialogTitle>
            </DialogHeader>
            {editingStaff && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit_first_name">First Name</Label>
                  <Input
                    id="edit_first_name"
                    value={editingStaff.first_name}
                    onChange={(e) => setEditingStaff({...editingStaff, first_name: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="edit_last_name">Last Name</Label>
                  <Input
                    id="edit_last_name"
                    value={editingStaff.last_name}
                    onChange={(e) => setEditingStaff({...editingStaff, last_name: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="edit_email">Email</Label>
                  <Input
                    id="edit_email"
                    type="email"
                    value={editingStaff.email}
                    onChange={(e) => setEditingStaff({...editingStaff, email: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="edit_phone">Phone</Label>
                  <Input
                    id="edit_phone"
                    value={editingStaff.phone}
                    onChange={(e) => setEditingStaff({...editingStaff, phone: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="edit_position">Position</Label>
                  <Input
                    id="edit_position"
                    value={editingStaff.position}
                    onChange={(e) => setEditingStaff({...editingStaff, position: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="edit_salary">Salary (RWF)</Label>
                  <Input
                    id="edit_salary"
                    type="number"
                    value={editingStaff.salary}
                    onChange={(e) => setEditingStaff({...editingStaff, salary: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="edit_status">Status</Label>
                  <Select value={editingStaff.status} onValueChange={(value) => setEditingStaff({...editingStaff, status: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                      <SelectItem value="terminated">Terminated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit_performance_rating">Performance Rating</Label>
                  <Select 
                    value={editingStaff.performance_rating.toString()} 
                    onValueChange={(value) => setEditingStaff({...editingStaff, performance_rating: Number(value)})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Star</SelectItem>
                      <SelectItem value="2">2 Stars</SelectItem>
                      <SelectItem value="3">3 Stars</SelectItem>
                      <SelectItem value="4">4 Stars</SelectItem>
                      <SelectItem value="5">5 Stars</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditStaff}>
                Update Staff Member
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default StaffManagementPage;