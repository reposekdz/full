import React, { useState, useEffect } from 'react';
import { 
  Users, DollarSign, BookOpen, TrendingUp, TrendingDown,
  RefreshCw, Download, Plus, Search, Filter, Eye, Edit, Trash2,
  Menu, X, Bell, Settings, LogOut, ChevronDown, CheckCircle,
  AlertCircle, Clock, User, FileText, Activity, GraduationCap, UserCheck,
  Key, Lock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';

interface DashboardStats {
  students: {
    total_students: number;
    active_students: number;
    inactive_students: number;
    male_students: number;
    female_students: number;
  };
  staff: {
    total_staff: number;
    active_staff: number;
  };
  financial: {
    total_income: number;
    total_expenses: number;
    expected_fees: number;
    balance: number;
  };
  recent_payments: any[];
  trade_distribution: { trade: string; count: number }[];
  level_distribution: { level: string; count: number }[];
}

interface Student {
  id: number;
  student_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  gender: string;
  trade: string;
  level: string;
  status: string;
  total_fees: number;
  total_paid: number;
}

const ComprehensiveAdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [sodLevel4Students, setSodLevel4Students] = useState<any[]>([]);
  const [sodLevel4Summary, setSodLevel4Summary] = useState<any>(null);
  const [parents, setParents] = useState<any[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'students') {
      fetchStudents();
    } else if (activeTab === 'sod-level4') {
      fetchSodLevel4();
    } else if (activeTab === 'parents') {
      fetchParents();
    } else if (activeTab === 'staff') {
      fetchStaffPasswordStatus();
    }
  }, [activeTab, currentPage, searchQuery]);

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/comprehensive-admin/dashboard/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:5000/api/comprehensive-admin/students?page=${currentPage}&limit=20&search=${searchQuery}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await response.json();
      if (data.success) {
        setStudents(data.students);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchSodLevel4 = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        'http://localhost:5000/api/comprehensive-admin/dashboard/sod-level4',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await response.json();
      if (data.success) {
        setSodLevel4Students(data.students);
        setSodLevel4Summary(data.summary);
      }
    } catch (error) {
      console.error('Error fetching SOD Level 4:', error);
    }
  };

  const fetchParents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:5000/api/comprehensive-admin/parents?search=${searchQuery}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await response.json();
      if (data.success) {
        setParents(data.parents || []);
      }
    } catch (error) {
      console.error('Error fetching parents:', error);
    }
  };

  const fetchStaffPasswordStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        'http://localhost:5000/api/comprehensive-admin/staff/password-status',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await response.json();
      if (data.success) {
        setStaffList(data.staff || []);
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
    }
  };

  const forcePasswordChange = async (staffId: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        'http://localhost:5000/api/comprehensive-admin/staff/force-password-change',
        {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}` 
          },
          body: JSON.stringify({ staffId })
        }
      );
      const data = await response.json();
      if (data.success) {
        alert('Password change forced successfully');
        fetchStaffPasswordStatus();
      } else {
        alert(data.message || 'Failed to force password change');
      }
    } catch (error) {
      console.error('Error forcing password change:', error);
      alert('Failed to force password change');
    }
  };

  const resetPassword = async (staffId: number) => {
    const newPassword = prompt('Enter new password:');
    if (!newPassword) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        'http://localhost:5000/api/comprehensive-admin/staff/reset-password',
        {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}` 
          },
          body: JSON.stringify({ staffId, newPassword })
        }
      );
      const data = await response.json();
      if (data.success) {
        alert('Password reset successfully');
        fetchStaffPasswordStatus();
      } else {
        alert(data.message || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      alert('Failed to reset password');
    }
  };

  const exportToExcel = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/comprehensive-admin/export/students', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success && data.data) {
        const XLSX = await import('xlsx');
        const worksheet = XLSX.utils.json_to_sheet(data.data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');
        const date = new Date().toISOString().split('T')[0];
        XLSX.writeFile(workbook, `students_export_${date}.xlsx`);
      }
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  const handleViewStudent = (student: Student) => {
    setSelectedItem(student);
    setModalType('view');
    setShowModal(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-700 text-white">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-blue-100">Total Students</p>
                <p className="text-3xl font-bold">{stats?.students?.total_students || 0}</p>
                <p className="text-blue-100 text-sm">
                  {stats?.students?.active_students || 0} active
                </p>
              </div>
              <Users className="w-12 h-12 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-700 text-white">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-green-100">Total Income</p>
                <p className="text-3xl font-bold">{formatCurrency(stats?.financial?.total_income || 0)}</p>
                <p className="text-green-100 text-sm">This year</p>
              </div>
              <TrendingUp className="w-12 h-12 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500 to-red-700 text-white">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-red-100">Total Expenses</p>
                <p className="text-3xl font-bold">{formatCurrency(stats?.financial?.total_expenses || 0)}</p>
                <p className="text-red-100 text-sm">This year</p>
              </div>
              <TrendingDown className="w-12 h-12 text-red-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-700 text-white">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-purple-100">Expected Fees</p>
                <p className="text-3xl font-bold">{formatCurrency(stats?.financial?.expected_fees || 0)}</p>
                <p className="text-purple-100 text-sm">
                  Balance: {formatCurrency(stats?.financial?.balance || 0)}
                </p>
              </div>
              <DollarSign className="w-12 h-12 text-purple-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Student Distribution by Trade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.trade_distribution?.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="font-medium">{item.trade}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${(item.count / (stats?.students?.total_students || 1)) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600">{item.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.recent_payments?.slice(0, 5).map((payment: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium">{payment.first_name} {payment.last_name}</p>
                    <p className="text-sm text-gray-500">{payment.payment_date}</p>
                  </div>
                  <span className="text-green-600 font-bold">{formatCurrency(payment.amount)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderStudents = () => (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" onClick={fetchStudents}>
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
          </Button>
        </div>
        <Button onClick={exportToExcel}>
          <Download className="w-4 h-4 mr-2" /> Export Excel
        </Button>
      </div>

      {/* Students Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Contact</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Trade/Level</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Fees</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Paid</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Balance</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-mono text-blue-600">{student.student_id}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{student.first_name} {student.last_name}</div>
                      <div className="text-xs text-gray-500">{student.gender}</div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div>{student.email}</div>
                      <div className="text-gray-500">{student.phone}</div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline">{student.trade}</Badge>
                      <span className="ml-1 text-gray-600">{student.level}</span>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">{formatCurrency(student.total_fees)}</td>
                    <td className="px-4 py-3 text-sm text-green-600">{formatCurrency(student.total_paid)}</td>
                    <td className={`px-4 py-3 text-sm font-bold ${(student.total_fees - student.total_paid) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {formatCurrency(student.total_fees - student.total_paid)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={student.status === 'active' ? 'default' : 'secondary'}>
                        {student.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Button variant="ghost" size="sm" onClick={() => handleViewStudent(student)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-4 py-3 border-t flex justify-between items-center">
            <Button
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSodLevel4Tab = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Level 4 SOD Students</h2>
        <Button onClick={async () => {
          try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/comprehensive-admin/export/sod-level4', {
              headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success && data.data) {
              const XLSX = await import('xlsx');
              const worksheet = XLSX.utils.json_to_sheet(data.data);
              const workbook = XLSX.utils.book_new();
              XLSX.utils.book_append_sheet(workbook, worksheet, 'Level4SOD');
              XLSX.writeFile(workbook, 'level4_sod_students.xlsx');
            }
          } catch (error) {
            console.error('Export error:', error);
          }
        }}>
          <Download className="w-4 h-4 mr-2" /> Export Excel
        </Button>
      </div>

      {sodLevel4Summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-700 text-white">
            <CardContent className="p-4">
              <p className="text-blue-100">Total Students</p>
              <p className="text-2xl font-bold">{sodLevel4Summary.total_students}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-500 to-green-700 text-white">
            <CardContent className="p-4">
              <p className="text-green-100">Fully Paid</p>
              <p className="text-2xl font-bold">{sodLevel4Summary.paid_students}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-yellow-500 to-yellow-700 text-white">
            <CardContent className="p-4">
              <p className="text-yellow-100">Partial</p>
              <p className="text-2xl font-bold">{sodLevel4Summary.partial_students}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-red-500 to-red-700 text-white">
            <CardContent className="p-4">
              <p className="text-red-100">Unpaid</p>
              <p className="text-2xl font-bold">{sodLevel4Summary.unpaid_students}</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">#</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Student ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Gender</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Total Fees</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Paid</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Balance</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sodLevel4Students.map((student, index) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500">{index + 1}</td>
                    <td className="px-4 py-3 font-mono text-blue-600">{student.student_id}</td>
                    <td className="px-4 py-3 font-medium">{student.first_name} {student.last_name}</td>
                    <td className="px-4 py-3">{student.gender}</td>
                    <td className="px-4 py-3 font-medium">{formatCurrency(student.total_fees || 0)}</td>
                    <td className="px-4 py-3 text-green-600 font-medium">{formatCurrency(student.total_paid || 0)}</td>
                    <td className={`px-4 py-3 font-bold ${student.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {formatCurrency(student.balance || 0)}
                    </td>
                    <td className="px-4 py-3">
                      {student.payment_status === 'paid' ? (
                        <Badge variant="default" className="bg-green-600">PAID</Badge>
                      ) : student.payment_status === 'partial' ? (
                        <Badge variant="default" className="bg-yellow-600">PARTIAL</Badge>
                      ) : (
                        <Badge variant="default" className="bg-red-600">UNPAID</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderParentsTab = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Parents Management</h2>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Phone</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Linked Students</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {parents.map((parent) => (
                  <tr key={parent.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{parent.first_name} {parent.last_name}</td>
                    <td className="px-4 py-3">{parent.email}</td>
                    <td className="px-4 py-3">{parent.phone}</td>
                    <td className="px-4 py-3">
                      {parent.linked_students?.map((s: any) => (
                        <Badge key={s.id} variant="outline" className="mr-1">
                          {s.first_name} {s.last_name} ({s.trade} {s.level})
                        </Badge>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderStaffTab = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Staff Management</h2>
        <Button variant="outline" onClick={fetchStaffPasswordStatus}>
          <RefreshCw className="w-4 h-4 mr-2" /> Refresh
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Last Login</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Password Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {staffList.map((staff) => (
                  <tr key={staff.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{staff.first_name} {staff.last_name}</td>
                    <td className="px-4 py-3">{staff.email}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline">{staff.role}</Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {staff.last_login ? new Date(staff.last_login).toLocaleString() : 'Never'}
                    </td>
                    <td className="px-4 py-3">
                      {staff.force_password_change === 1 ? (
                        <Badge variant="default" className="bg-red-600">Must Change</Badge>
                      ) : (
                        <Badge variant="default" className="bg-green-600">OK</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => forcePasswordChange(staff.id)}
                          title="Force password change"
                        >
                          <Key className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => resetPassword(staff.id)}
                          title="Reset password"
                        >
                          <Lock className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={fetchDashboardStats}>
              <RefreshCw className="w-4 h-4 mr-2" /> Refresh
            </Button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="px-6 flex gap-6">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: Activity },
            { id: 'students', label: 'Students', icon: Users },
            { id: 'sod-level4', label: 'Level 4 SOD', icon: GraduationCap },
            { id: 'parents', label: 'Parents', icon: UserCheck },
            { id: 'staff', label: 'Staff', icon: User },
            { id: 'fees', label: 'Fees & Payments', icon: DollarSign },
            { id: 'reports', label: 'Reports', icon: FileText }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-4 px-2 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'students' && renderStudents()}
            {activeTab === 'sod-level4' && renderSodLevel4Tab()}
            {activeTab === 'parents' && renderParentsTab()}
            {activeTab === 'staff' && renderStaffTab()}
            {activeTab === 'fees' && <div className="text-center py-12 text-gray-500">Fees & Payments Coming Soon</div>}
            {activeTab === 'reports' && <div className="text-center py-12 text-gray-500">Reports Coming Soon</div>}
          </>
        )}
      </main>

      {/* Modal */}
      {showModal && modalType === 'view' && selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold">Student Details</h2>
                <Button variant="ghost" onClick={() => setShowModal(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500 text-sm">Student ID</p>
                  <p className="font-mono font-bold">{selectedItem.student_id}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Status</p>
                  <Badge variant={selectedItem.status === 'active' ? 'default' : 'secondary'}>
                    {selectedItem.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">First Name</p>
                  <p className="font-medium">{selectedItem.first_name}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Last Name</p>
                  <p className="font-medium">{selectedItem.last_name}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Email</p>
                  <p className="font-medium">{selectedItem.email}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Phone</p>
                  <p className="font-medium">{selectedItem.phone}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Gender</p>
                  <p className="font-medium">{selectedItem.gender}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Trade</p>
                  <p className="font-medium">{selectedItem.trade}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Level</p>
                  <p className="font-medium">{selectedItem.level}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Total Fees</p>
                  <p className="font-bold">{formatCurrency(selectedItem.total_fees)}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Total Paid</p>
                  <p className="font-bold text-green-600">{formatCurrency(selectedItem.total_paid)}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Balance</p>
                  <p className={`font-bold ${(selectedItem.total_fees - selectedItem.total_paid) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {formatCurrency(selectedItem.total_fees - selectedItem.total_paid)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComprehensiveAdminDashboard;
