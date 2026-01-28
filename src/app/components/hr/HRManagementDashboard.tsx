import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users, DollarSign, Calendar, TrendingUp, Award, Briefcase,
  Clock, CheckCircle, XCircle, Eye, Edit, Trash2, Plus, Download,
  Upload, Filter, Search, RefreshCw, UserPlus, FileText, PieChart,
  Target, Star, AlertCircle, BookOpen, GraduationCap, Building
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';

const API_BASE = 'http://localhost:5000/api';

interface HRManagementDashboardProps {
  userRole: string;
  userId: number;
}

const HRManagementDashboard: React.FC<HRManagementDashboardProps> = ({ userRole, userId }) => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [payroll, setPayroll] = useState<any[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
  const [performanceReviews, setPerformanceReviews] = useState<any[]>([]);
  const [jobPostings, setJobPostings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('employees');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [employeesRes, payrollRes, leaveRes, reviewsRes, jobsRes] = await Promise.all([
        fetch(`${API_BASE}/hr-management/employees`).then(r => r.json()),
        fetch(`${API_BASE}/hr-management/payroll?month=${new Date().getMonth() + 1}&year=${new Date().getFullYear()}`).then(r => r.json()),
        fetch(`${API_BASE}/hr-management/leave-requests`).then(r => r.json()),
        fetch(`${API_BASE}/hr-management/performance-reviews`).then(r => r.json()),
        fetch(`${API_BASE}/hr-management/job-postings`).then(r => r.json())
      ]);

      setEmployees(employeesRes.employees || []);
      setPayroll(payrollRes.payroll || []);
      setLeaveRequests(leaveRes.requests || []);
      setPerformanceReviews(reviewsRes.reviews || []);
      setJobPostings(jobsRes.jobs || []);
    } catch (error) {
      console.error('Error fetching HR data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveLeave = async (id: number) => {
    try {
      const response = await fetch(`${API_BASE}/hr-management/leave-requests/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'approved',
          approved_by: userId,
          approval_notes: 'Approved by headmaster'
        })
      });
      const data = await response.json();
      if (data.success) {
        fetchAllData();
        alert('Leave request approved successfully!');
      }
    } catch (error) {
      console.error('Error approving leave:', error);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, change }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-none shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
              <h3 className="text-3xl font-black bg-gradient-to-r from-green-600 to-yellow-600 bg-clip-text text-transparent">
                {value}
              </h3>
              {change && (
                <p className={`text-xs font-bold mt-2 ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {change > 0 ? '+' : ''}{change}% this month
                </p>
              )}
            </div>
            <div className={`p-4 rounded-2xl bg-gradient-to-br ${color}`}>
              <Icon className="w-8 h-8 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const stats = [
    { title: 'Total Employees', value: employees.length, icon: Users, color: 'from-blue-500 to-blue-600', change: 5.2 },
    { title: 'Payroll This Month', value: `$${payroll.reduce((sum, p) => sum + parseFloat(p.net_salary || 0), 0).toLocaleString()}`, icon: DollarSign, color: 'from-green-500 to-green-600', change: 2.1 },
    { title: 'Pending Leaves', value: leaveRequests.filter(l => l.status === 'pending').length, icon: Calendar, color: 'from-yellow-500 to-yellow-600', change: -10 },
    { title: 'Active Jobs', value: jobPostings.filter(j => j.status === 'open').length, icon: Briefcase, color: 'from-purple-500 to-purple-600', change: 15 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-green-50 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-green-600 to-yellow-600 bg-clip-text text-transparent">
              HR Management
            </h1>
            <p className="text-gray-600 mt-2">Comprehensive human resource management system</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={fetchAllData}
              disabled={loading}
              className="bg-gradient-to-r from-green-600 to-yellow-600 hover:from-green-700 hover:to-yellow-700"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button className="bg-gradient-to-r from-yellow-600 to-green-600">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>
      </motion.div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-5 w-full max-w-4xl bg-gradient-to-r from-green-100 to-yellow-100 p-1 rounded-2xl">
          <TabsTrigger value="employees" className="font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-yellow-600 data-[state=active]:text-white">
            <Users className="w-4 h-4 mr-2" />
            Employees
          </TabsTrigger>
          <TabsTrigger value="payroll" className="font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-yellow-600 data-[state=active]:text-white">
            <DollarSign className="w-4 h-4 mr-2" />
            Payroll
          </TabsTrigger>
          <TabsTrigger value="leave" className="font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-yellow-600 data-[state=active]:text-white">
            <Calendar className="w-4 h-4 mr-2" />
            Leave
          </TabsTrigger>
          <TabsTrigger value="reviews" className="font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-yellow-600 data-[state=active]:text-white">
            <Star className="w-4 h-4 mr-2" />
            Reviews
          </TabsTrigger>
          <TabsTrigger value="jobs" className="font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-yellow-600 data-[state=active]:text-white">
            <Briefcase className="w-4 h-4 mr-2" />
            Jobs
          </TabsTrigger>
        </TabsList>

        {/* Employees Tab */}
        <TabsContent value="employees" className="space-y-4">
          <Card className="border-none shadow-xl">
            <CardHeader className="bg-gradient-to-r from-green-50 to-yellow-50">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 font-black">
                  <Users className="w-6 h-6 text-green-600" />
                  Employee Directory
                </CardTitle>
                <Button className="bg-gradient-to-r from-green-600 to-green-700">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Employee
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="mb-4 flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="Search employees..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </div>

              <div className="space-y-3">
                {employees.filter(emp => 
                  `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(searchQuery.toLowerCase())
                ).map((employee, index) => (
                  <motion.div
                    key={employee.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl hover:shadow-lg transition-shadow border border-gray-100"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-yellow-500 flex items-center justify-center text-white font-black text-lg">
                        {employee.first_name?.[0]}{employee.last_name?.[0]}
                      </div>
                      <div>
                        <h3 className="font-black text-gray-800">{employee.first_name} {employee.last_name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className="bg-gradient-to-r from-green-500 to-yellow-500 text-white">
                            {employee.role_name}
                          </Badge>
                          <span className="text-sm text-gray-600">{employee.email}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payroll Tab */}
        <TabsContent value="payroll" className="space-y-4">
          <Card className="border-none shadow-xl">
            <CardHeader className="bg-gradient-to-r from-green-50 to-yellow-50">
              <CardTitle className="flex items-center gap-2 font-black">
                <DollarSign className="w-6 h-6 text-green-600" />
                Payroll Management
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                {payroll.map((payment, index) => (
                  <motion.div
                    key={payment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 bg-gradient-to-r from-green-50 to-white rounded-xl border border-green-100"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-black text-gray-800">{payment.first_name} {payment.last_name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{payment.role_name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-black bg-gradient-to-r from-green-600 to-yellow-600 bg-clip-text text-transparent">
                          ${parseFloat(payment.net_salary).toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(payment.payment_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
                      <div>
                        <p className="text-xs text-gray-500">Basic Salary</p>
                        <p className="font-bold text-gray-800">${parseFloat(payment.basic_salary).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Allowances</p>
                        <p className="font-bold text-green-600">${parseFloat(payment.allowances).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Deductions</p>
                        <p className="font-bold text-red-600">-${parseFloat(payment.deductions).toLocaleString()}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Leave Requests Tab */}
        <TabsContent value="leave" className="space-y-4">
          <Card className="border-none shadow-xl">
            <CardHeader className="bg-gradient-to-r from-green-50 to-yellow-50">
              <CardTitle className="flex items-center gap-2 font-black">
                <Calendar className="w-6 h-6 text-yellow-600" />
                Leave Requests
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                {leaveRequests.map((leave, index) => (
                  <motion.div
                    key={leave.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 bg-gradient-to-r from-yellow-50 to-white rounded-xl border border-yellow-100"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-black text-gray-800">{leave.first_name} {leave.last_name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{leave.leave_type}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(leave.start_date).toLocaleDateString()} - {new Date(leave.end_date).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-700 mt-2">{leave.reason}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={
                          leave.status === 'approved' ? 'bg-green-500' :
                          leave.status === 'rejected' ? 'bg-red-500' :
                          'bg-yellow-500'
                        }>
                          {leave.status}
                        </Badge>
                        {leave.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleApproveLeave(leave.id)}
                              className="bg-gradient-to-r from-green-600 to-green-700"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Reviews Tab */}
        <TabsContent value="reviews" className="space-y-4">
          <Card className="border-none shadow-xl">
            <CardHeader className="bg-gradient-to-r from-green-50 to-yellow-50">
              <CardTitle className="flex items-center gap-2 font-black">
                <Star className="w-6 h-6 text-yellow-600" />
                Performance Reviews
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {performanceReviews.map((review, index) => (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 bg-gradient-to-br from-white to-yellow-50 rounded-xl border-2 border-yellow-100 shadow-lg"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-black text-gray-800">{review.first_name} {review.last_name}</h3>
                      <div className="flex items-center gap-2">
                        <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                        <span className="text-xl font-black text-yellow-600">{review.rating}/5</span>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div>
                        <p className="text-xs text-gray-500 font-bold">Strengths</p>
                        <p className="text-gray-700">{review.strengths}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-bold">Areas for Improvement</p>
                        <p className="text-gray-700">{review.weaknesses}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-bold">Goals</p>
                        <p className="text-gray-700">{review.goals}</p>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-xs text-gray-500">
                        Reviewed by {review.reviewer_first_name} {review.reviewer_last_name} on {new Date(review.review_date).toLocaleDateString()}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Job Postings Tab */}
        <TabsContent value="jobs" className="space-y-4">
          <Card className="border-none shadow-xl">
            <CardHeader className="bg-gradient-to-r from-green-50 to-yellow-50">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 font-black">
                  <Briefcase className="w-6 h-6 text-purple-600" />
                  Job Postings
                </CardTitle>
                <Button className="bg-gradient-to-r from-purple-600 to-purple-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Post New Job
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {jobPostings.map((job, index) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-6 bg-gradient-to-br from-purple-50 to-white rounded-xl border-2 border-purple-100 shadow-lg"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-black text-gray-800 mb-2">{job.title}</h3>
                        <Badge className={
                          job.status === 'open' ? 'bg-green-500' :
                          job.status === 'filled' ? 'bg-blue-500' :
                          'bg-gray-500'
                        }>
                          {job.status}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-purple-600">{job.salary_range}</p>
                        <p className="text-xs text-gray-500 mt-1">Deadline: {new Date(job.deadline).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-4">{job.description}</p>
                    <div className="flex gap-2">
                      <Button size="sm" className="bg-gradient-to-r from-purple-600 to-purple-700">
                        <Eye className="w-4 h-4 mr-2" />
                        View Applications
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HRManagementDashboard;
