import React, { useState, useEffect, useMemo } from 'react';
import {
  Users, Search, Filter, Download, Upload, UserPlus, Eye, Edit, Trash2,
  Phone, Mail, MessageSquare, Link, Award, Calendar, DollarSign,
  AlertTriangle, CheckCircle, Clock, SortAsc, SortDesc, RefreshCw,
  FileText, Settings, MoreVertical, BookOpen, GraduationCap
} from 'lucide-react';
import { toast } from 'sonner';
import apiService from '@/app/services/apiService';
import { GLOBAL_TRADES, getLevelsForTrade } from '@/app/constants/tradesAndLevels';
import * as XLSX from 'xlsx';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Checkbox } from '@/app/components/ui/checkbox';
import smsIntegration from '@/utils/smsIntegration';
import parentNotificationHooks from '@/utils/parentNotificationHooks';

interface Student {
  id: number;
  student_code: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  gender: string;
  date_of_birth: string;
  trade_code: string;
  trade_name: string;
  level_number: number;
  level_suffix?: string;
  conduct_score: number;
  attendance_percentage: number;
  payment_status: string;
  total_fees: number;
  paid_fees: number;
  balance: number;
  enrollment_date: string;
  status: string;
  parent_linked: boolean;
  parent_count: number;
  last_login: string;
  profile_image?: string;
}

const StudentsPage: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrade, setSelectedTrade] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedGender, setSelectedGender] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<string>('all');
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [sortConfig, setSortConfig] = useState<{key: string, direction: 'asc' | 'desc'} | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    maleCount: 0,
    femaleCount: 0,
    avgAttendance: 0,
    avgConduct: 0,
    totalFees: 0,
    paidFees: 0
  });

  useEffect(() => {
    fetchStudents();
    fetchStats();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await apiService.request('/students/all', {
        method: 'GET'
      });
      
      if (response.success) {
        setStudents(response.students || []);
      } else {
        toast.error('Failed to fetch students');
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Error loading students');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await apiService.request('/students/statistics');
      if (response.success) {
        setStats(response.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const filteredStudents = useMemo(() => {
    let filtered = students;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(student => 
        `${student.first_name} ${student.last_name}`.toLowerCase().includes(query) ||
        student.student_code.toLowerCase().includes(query) ||
        student.email.toLowerCase().includes(query) ||
        student.phone.includes(query)
      );
    }

    // Trade filter
    if (selectedTrade !== 'all') {
      filtered = filtered.filter(student => student.trade_code === selectedTrade);
    }

    // Level filter
    if (selectedLevel !== 'all') {
      filtered = filtered.filter(student => student.level_number.toString() === selectedLevel);
    }

    // Gender filter
    if (selectedGender !== 'all') {
      filtered = filtered.filter(student => student.gender === selectedGender);
    }

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(student => student.status === selectedStatus);
    }

    // Payment status filter
    if (selectedPaymentStatus !== 'all') {
      filtered = filtered.filter(student => student.payment_status === selectedPaymentStatus);
    }

    // Sorting
    if (sortConfig) {
      filtered.sort((a, b) => {
        let aVal = a[sortConfig.key as keyof Student];
        let bVal = b[sortConfig.key as keyof Student];

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
  }, [students, searchQuery, selectedTrade, selectedLevel, selectedGender, selectedStatus, selectedPaymentStatus, sortConfig]);

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev?.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleSelectStudent = (studentId: number) => {
    setSelectedStudents(prev => 
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSelectAll = () => {
    setSelectedStudents(prev => 
      prev.length === filteredStudents.length 
        ? [] 
        : filteredStudents.map(s => s.id)
    );
  };

  const handleBulkAction = async (action: string) => {
    if (selectedStudents.length === 0) {
      toast.error('Please select students first');
      return;
    }

    try {
      switch (action) {
        case 'export':
          const selectedData = students.filter(s => selectedStudents.includes(s.id));
          const worksheet = XLSX.utils.json_to_sheet(selectedData);
          const workbook = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');
          XLSX.writeFile(workbook, `Students_${new Date().toISOString().split('T')[0]}.xlsx`);
          toast.success(`Exported ${selectedStudents.length} students`);
          break;

        case 'sms':
          await smsIntegration.sendCustomBulkSMS(
            selectedStudents,
            'Bulk Message',
            'Mwiriwe! Amakuru mashya y\'ishuri. Murakoze.',
            'normal'
          );
          toast.success(`SMS sent to ${selectedStudents.length} students`);
          break;

        case 'activate':
          await apiService.request('/students/bulk-update', {
            method: 'PUT',
            body: JSON.stringify({
              student_ids: selectedStudents,
              status: 'active'
            })
          });
          await fetchStudents();
          toast.success(`Activated ${selectedStudents.length} students`);
          break;

        case 'deactivate':
          await apiService.request('/students/bulk-update', {
            method: 'PUT',
            body: JSON.stringify({
              student_ids: selectedStudents,
              status: 'inactive'
            })
          });
          await fetchStudents();
          toast.success(`Deactivated ${selectedStudents.length} students`);
          break;
      }
      setSelectedStudents([]);
    } catch (error) {
      toast.error('Bulk action failed');
    }
  };

  const handleStudentAction = async (action: string, studentId: number) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    try {
      switch (action) {
        case 'link_parent':
          const linkResponse = await apiService.request('/parent-child-linking/create-link', {
            method: 'POST',
            body: JSON.stringify({
              student_id: studentId,
              student_name: `${student.first_name} ${student.last_name}`,
              trade: student.trade_code,
              level: student.level_number
            })
          });
          if (linkResponse.success) {
            toast.success('Parent linking initiated');
            await parentNotificationHooks.onParentChildLinked({
              parentId: linkResponse.parentId,
              studentId: studentId,
              studentName: `${student.first_name} ${student.last_name}`
            });
          }
          break;

        case 'send_sms':
          await smsIntegration.sendCustomBulkSMS(
            [studentId],
            'Individual Message',
            `Mwiriwe! Amakuru ajyanye n'umwana wanyu ${student.first_name} ${student.last_name}. Murakoze.`,
            'normal'
          );
          toast.success('SMS sent to parent(s)');
          break;

        case 'call':
          if (student.phone) {
            window.open(`tel:${student.phone}`);
          } else {
            toast.error('No phone number available');
          }
          break;

        case 'email':
          if (student.email) {
            window.open(`mailto:${student.email}`);
          } else {
            toast.error('No email address available');
          }
          break;

        case 'view_profile':
          window.open(`/students/${studentId}`, '_blank');
          break;

        case 'edit':
          window.open(`/students/${studentId}/edit`, '_blank');
          break;

        case 'delete':
          if (confirm(`Are you sure you want to delete ${student.first_name} ${student.last_name}?`)) {
            await apiService.request(`/students/${studentId}`, {
              method: 'DELETE'
            });
            await fetchStudents();
            toast.success('Student deleted successfully');
          }
          break;
      }
    } catch (error) {
      toast.error(`Failed to ${action.replace('_', ' ')}`);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-red-100 text-red-800',
      suspended: 'bg-yellow-100 text-yellow-800',
      graduated: 'bg-blue-100 text-blue-800'
    };
    return variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentStatusBadge = (status: string) => {
    const variants = {
      paid: 'bg-green-100 text-green-800',
      partial: 'bg-yellow-100 text-yellow-800',
      pending: 'bg-red-100 text-red-800',
      overdue: 'bg-red-100 text-red-800'
    };
    return variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800';
  };

  const getConductGrade = (score: number) => {
    if (score >= 36) return { grade: 'A', color: 'text-green-600' };
    if (score >= 32) return { grade: 'B', color: 'text-blue-600' };
    if (score >= 28) return { grade: 'C', color: 'text-yellow-600' };
    if (score >= 24) return { grade: 'D', color: 'text-orange-600' };
    return { grade: 'F', color: 'text-red-600' };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Students Management
            </h1>
            <p className="text-gray-600 mt-1">Manage all students with advanced filtering and actions</p>
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
            
            <Button onClick={fetchStudents} variant="outline" size="sm" disabled={loading}>
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <UserPlus className="w-4 h-4 mr-2" />
              Add Student
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Students</p>
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
                  <p className="text-sm text-gray-600">Active Students</p>
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
                  <p className="text-sm text-gray-600">Avg Attendance</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.avgAttendance}%</p>
                </div>
                <Calendar className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Fees Collected</p>
                  <p className="text-2xl font-bold text-orange-600">{((stats.paidFees / stats.totalFees) * 100).toFixed(1)}%</p>
                </div>
                <DollarSign className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by name, code, email, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filter Toggle */}
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Filters
                {(selectedTrade !== 'all' || selectedLevel !== 'all' || selectedGender !== 'all' || selectedStatus !== 'all' || selectedPaymentStatus !== 'all') && (
                  <Badge variant="secondary" className="ml-1">Active</Badge>
                )}
              </Button>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <Select value={selectedTrade} onValueChange={setSelectedTrade}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Trades" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Trades</SelectItem>
                    {GLOBAL_TRADES.map(trade => (
                      <SelectItem key={trade.code} value={trade.code}>
                        {trade.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="1">Level 1</SelectItem>
                    <SelectItem value="2">Level 2</SelectItem>
                    <SelectItem value="3">Level 3</SelectItem>
                    <SelectItem value="4">Level 4</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedGender} onValueChange={setSelectedGender}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Genders" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Genders</SelectItem>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
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
                    <SelectItem value="graduated">Graduated</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedPaymentStatus} onValueChange={setSelectedPaymentStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Payment Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Payments</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="partial">Partial</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bulk Actions */}
        {selectedStudents.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {selectedStudents.length} student(s) selected
                </span>
                <div className="flex items-center gap-2">
                  <Button onClick={() => handleBulkAction('export')} variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                  <Button onClick={() => handleBulkAction('sms')} variant="outline" size="sm">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Send SMS
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

        {/* Students Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Students ({filteredStudents.length})</span>
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedStudents.length === filteredStudents.length && filteredStudents.length > 0}
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
                <span className="ml-2 text-gray-600">Loading students...</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left">
                        <Checkbox
                          checked={selectedStudents.length === filteredStudents.length && filteredStudents.length > 0}
                          onCheckedChange={handleSelectAll}
                        />
                      </th>
                      <th className="px-4 py-3 text-left cursor-pointer hover:bg-gray-100" onClick={() => handleSort('student_code')}>
                        <div className="flex items-center gap-2">
                          Code
                          {sortConfig?.key === 'student_code' && (
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
                      <th className="px-4 py-3 text-left">Trade & Level</th>
                      <th className="px-4 py-3 text-left">Contact</th>
                      <th className="px-4 py-3 text-left cursor-pointer hover:bg-gray-100" onClick={() => handleSort('conduct_score')}>
                        <div className="flex items-center gap-2">
                          Conduct
                          {sortConfig?.key === 'conduct_score' && (
                            sortConfig.direction === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
                          )}
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left cursor-pointer hover:bg-gray-100" onClick={() => handleSort('attendance_percentage')}>
                        <div className="flex items-center gap-2">
                          Attendance
                          {sortConfig?.key === 'attendance_percentage' && (
                            sortConfig.direction === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
                          )}
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left">Payment</th>
                      <th className="px-4 py-3 text-left">Status</th>
                      <th className="px-4 py-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredStudents.map((student) => {
                      const conductGrade = getConductGrade(student.conduct_score);
                      return (
                        <tr key={student.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <Checkbox
                              checked={selectedStudents.includes(student.id)}
                              onCheckedChange={() => handleSelectStudent(student.id)}
                            />
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-mono text-sm">{student.student_code}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                                {student.first_name[0]}{student.last_name[0]}
                              </div>
                              <div>
                                <div className="font-medium">{student.first_name} {student.last_name}</div>
                                <div className="text-sm text-gray-500">{student.gender}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div>
                              <div className="font-medium">{student.trade_name}</div>
                              <div className="text-sm text-gray-500">Level {student.level_number}{student.level_suffix}</div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="space-y-1">
                              <div className="text-sm">{student.email}</div>
                              <div className="text-sm text-gray-500">{student.phone}</div>
                              {student.parent_linked && (
                                <Badge variant="secondary" className="text-xs">
                                  {student.parent_count} Parent(s)
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className={`font-medium ${conductGrade.color}`}>
                                {student.conduct_score}/40
                              </span>
                              <Badge variant="secondary" className={conductGrade.color}>
                                {conductGrade.grade}
                              </Badge>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{student.attendance_percentage}%</span>
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full" 
                                  style={{ width: `${student.attendance_percentage}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div>
                              <Badge className={getPaymentStatusBadge(student.payment_status)}>
                                {student.payment_status}
                              </Badge>
                              <div className="text-sm text-gray-500 mt-1">
                                {student.paid_fees.toLocaleString()}/{student.total_fees.toLocaleString()} RWF
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <Badge className={getStatusBadge(student.status)}>
                              {student.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <Button
                                onClick={() => handleStudentAction('view_profile', student.id)}
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                onClick={() => handleStudentAction('edit', student.id)}
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                onClick={() => handleStudentAction('send_sms', student.id)}
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                              >
                                <MessageSquare className="w-4 h-4" />
                              </Button>
                              <Button
                                onClick={() => handleStudentAction('call', student.id)}
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                              >
                                <Phone className="w-4 h-4" />
                              </Button>
                              <Button
                                onClick={() => handleStudentAction('link_parent', student.id)}
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                              >
                                <Link className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentsPage;