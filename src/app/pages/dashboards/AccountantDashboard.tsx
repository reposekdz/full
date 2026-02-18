import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  TrendingUp,
  DollarSign,
  PieChart as PieChartIcon,
  Calendar,
  Search,
  Download,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical,
  Briefcase,
  Layers,
  FileText,
  Activity,
  Plus,
  RefreshCw,
  Grid,
  Edit
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Badge } from '@/app/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/app/components/ui/dropdown-menu';

import { apiService } from '@/app/services/apiService';
import GlobalStudentSheets from '../../components/GlobalStudentSheets';



interface AccountantDashboardProps {
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const AccountantDashboard: React.FC<AccountantDashboardProps> = ({ onNavigate, onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<any>(null);
  const [trends, setTrends] = useState<any[]>([]);
  const [methods, setMethods] = useState<any[]>([]);
  const [recentPayments, setRecentPayments] = useState<any[]>([]);
  const [parents, setParents] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, trendsRes, methodsRes, recentRes, parentsRes, studentsRes] = await Promise.all([
        apiService.request('global-student-sheets/statistics'),
        apiService.request('payments/statistics/trends').catch(() => ({ success: true, trends: [] })),
        apiService.request('payments/statistics/methods').catch(() => ({ success: true, methods: [] })),
        apiService.request('payments/history/recent').catch(() => ({ success: true, payments: [] })),
        apiService.request('parent-registration/all').catch(() => ({ success: true, parents: [] })),
        apiService.request('comprehensive-admin/students?limit=100').catch(() => ({ success: true, students: [] }))
      ]);

      if (statsRes.success) setStats(statsRes.statistics);
      if (trendsRes.success) setTrends(trendsRes.trends || []);
      if (methodsRes.success) setMethods(methodsRes.methods || []);
      if (recentRes.success) setRecentPayments(recentRes.payments || []);
      if (parentsRes.success) setParents(parentsRes.parents || []);
      if (studentsRes.success) setStudents(studentsRes.students || []);

    } catch (error) {
      console.error('Dashboard Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF', maximumFractionDigits: 0 }).format(amount || 0);
  };

  const StatCard = ({ title, value, icon: Icon, color, trend, trendValue }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className={`relative overflow-hidden bg-white p-6 rounded-2xl shadow-sm border border-gray-100/50 flex flex-col justify-between`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl bg-${color}-50 text-${color}-600`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <Badge variant="outline" className={trend === 'up' ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : 'text-rose-600 bg-rose-50 border-rose-100'}>
            {trend === 'up' ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
            {trendValue}
          </Badge>
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <h3 className="text-2xl font-black text-gray-900 leading-tight">
          {typeof value === 'number' && title.includes('Fee') ? formatCurrency(value) : value}
        </h3>
      </div>
      <div className={`absolute bottom-0 left-0 w-full h-1 bg-${color}-500 opacity-20`} />
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm font-medium text-blue-600 mb-1">
            <LayoutDashboard className="w-4 h-4" />
            <span>Accountant Portal (Ibiro by'Umuhuzabikorwa)</span>
            <span className="text-gray-300">/</span>
            <span className="text-gray-500">Dashboard (Imbonerahamwe)</span>
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Financial Intelligence (Ikigega cy'Ishuri)</h1>
          <p className="text-gray-500 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {new Date().toLocaleDateString('rw-RW', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="bg-white border-gray-200 shadow-sm" onClick={() => fetchDashboardData()}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Sync Data
          </Button>
          <Button size="sm" className="bg-gray-900 hover:bg-black text-white shadow-xl shadow-gray-200">
            <Download className="w-4 h-4 mr-2" /> Financial Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        <div className="xl:col-span-3 space-y-8">
          {/* Statistics Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard title="Amafaranga ategerejwe (Total Expected)" value={stats?.total_fees || 0} icon={DollarSign} color="blue" trend="up" trendValue="+12.5%" />
            <StatCard title="Ayabonetse (Actual Collected)" value={stats?.total_paid || 0} icon={CreditCard} color="emerald" trend="up" trendValue="+8.4%" />
            <StatCard title="Ibirarane (Outstanding Balance)" value={stats?.total_balance || 0} icon={TrendingUp} color="amber" trend="down" trendValue="-3.2%" />
          </div>

          {/* Main Tabs Container */}
          <Tabs defaultValue="overview" className="space-y-8" onValueChange={setActiveTab}>
            <div className="flex justify-between items-center bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100 overflow-x-auto scrollbar-hide">
              <TabsList className="bg-transparent border-0">
                <TabsTrigger value="overview" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-blue-600 data-[state=active]:text-white shadow-none data-[state=active]:shadow-lg data-[state=active]:shadow-blue-200 transition-all font-bold text-gray-500">
                  <LayoutDashboard className="w-4 h-4 mr-2" /> Overview
                </TabsTrigger>
                <TabsTrigger value="management" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-blue-600 data-[state=active]:text-white shadow-none data-[state=active]:shadow-lg data-[state=active]:shadow-blue-200 transition-all font-bold text-gray-500">
                  <Grid className="w-4 h-4 mr-2" /> Global Sheets (Excel)
                </TabsTrigger>
                <TabsTrigger value="ledger" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-blue-600 data-[state=active]:text-white shadow-none data-[state=active]:shadow-lg data-[state=active]:shadow-blue-200 transition-all font-bold text-gray-500">
                  <FileText className="w-4 h-4 mr-2" /> Payments Ledger
                </TabsTrigger>
                <TabsTrigger value="analytics" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-blue-600 data-[state=active]:text-white shadow-none data-[state=active]:shadow-lg data-[state=active]:shadow-blue-200 transition-all font-bold text-gray-500">
                  <Activity className="w-4 h-4 mr-2" /> Advanced Analytics
                </TabsTrigger>
                <TabsTrigger value="parents" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-green-600 data-[state=active]:text-white shadow-none data-[state=active]:shadow-lg data-[state=active]:shadow-green-200 transition-all font-bold text-gray-500">
                  <Users className="w-4 h-4 mr-2" /> Parents
                </TabsTrigger>
                <TabsTrigger value="fees" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-amber-600 data-[state=active]:text-white shadow-none data-[state=active]:shadow-lg data-[state=active]:shadow-amber-200 transition-all font-bold text-gray-500">
                  <DollarSign className="w-4 h-4 mr-2" /> Fees
                </TabsTrigger>
              </TabsList>
            </div>

            <AnimatePresence mode="wait">
              <TabsContent value="overview">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Revenue Chart */}
                  <Card className="lg:col-span-2 rounded-2xl border-0 shadow-sm overflow-hidden bg-white">
                    <CardHeader className="border-b border-gray-50 pb-6">
                      <div className="flex justify-between items-end">
                        <div>
                          <CardTitle className="text-xl font-bold">Revenue Collection Trends</CardTitle>
                          <CardDescription>Monthly growth and comparison with last period</CardDescription>
                        </div>
                        <Badge variant="outline">6 Months View</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={trends}>
                            <defs>
                              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(value) => `RWF ${value / 1000}k`} />
                            <RechartsTooltip
                              contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', shadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                            />
                            <Area type="monotone" dataKey="collected" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Transactions List */}
                  <Card className="rounded-2xl border-0 shadow-sm bg-white">
                    <CardHeader className="border-b border-gray-50">
                      <CardTitle className="text-xl font-bold">Recent Transactions</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 px-0">
                      <div className="space-y-1">
                        {recentPayments.map((payment, idx) => (
                          <div key={payment.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white bg-gradient-to-br ${idx % 2 === 0 ? 'from-blue-500 to-indigo-600' : 'from-emerald-500 to-teal-600'}`}>
                                {payment.student_name?.[0]}
                              </div>
                              <div>
                                <p className="font-bold text-gray-900 leading-none mb-1">{payment.student_name}</p>
                                <p className="text-xs text-gray-500 uppercase font-mono">{payment.reference_number}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-black text-gray-900">{formatCurrency(payment.amount)}</p>
                              <p className={`text-[10px] font-bold uppercase transition-colors ${payment.status === 'completed' ? 'text-emerald-600' : 'text-amber-500'}`}>
                                {payment.status}
                              </p>
                            </div>
                          </div>
                        ))}
                        <div className="p-4 pt-6">
                          <Button variant="outline" className="w-full text-blue-600 border-blue-100 hover:bg-blue-50" onClick={() => setActiveTab('ledger')}>
                            View Transaction History
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="management" className="m-0">
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-3xl shadow-xl border border-gray-100/50 overflow-hidden min-h-[700px]"
                >
                  <GlobalStudentSheets userRole="accountant" userId={0} onNavigate={onNavigate} />
                </motion.div>
              </TabsContent>

              <TabsContent value="ledger">
                <Card className="border-0 shadow-sm rounded-3xl overflow-hidden bg-white">
                  <CardHeader className="pb-6">
                    <div className="flex justify-between items-center">
                      <CardTitle>Comprehensive Ledger</CardTitle>
                      <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-2" /> Export PDF</Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-bold">
                          <tr>
                            <th className="px-6 py-4">Transaction ID</th>
                            <th className="px-6 py-4">Student</th>
                            <th className="px-6 py-4">Method</th>
                            <th className="px-6 py-4">Amount</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {recentPayments.map(p => (
                            <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 font-mono text-sm">{p.reference_number}</td>
                              <td className="px-6 py-4 font-medium">{p.student_name}</td>
                              <td className="px-6 py-4 uppercase text-xs">{p.payment_method}</td>
                              <td className="px-6 py-4 font-black">{formatCurrency(p.amount)}</td>
                              <td className="px-6 py-4">
                                <Badge className={p.status === 'completed' ? 'bg-emerald-100 text-emerald-800 border-0' : 'bg-amber-100 text-amber-800 border-0'}>
                                  {p.status}
                                </Badge>
                              </td>
                              <td className="px-6 py-4 text-gray-500 text-sm">{new Date(p.created_at).toLocaleDateString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analytics">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Card className="rounded-3xl border-0 shadow-sm bg-white">
                    <CardHeader>
                      <CardTitle>Payment Methods Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={methods}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={100}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {methods.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <RechartsTooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        {methods.map((m, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                            <span className="text-sm font-medium text-gray-600">{m.name}</span>
                            <span className="text-sm font-bold text-gray-900 ml-auto">{m.count}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-3xl border-0 shadow-sm bg-white">
                    <CardHeader>
                      <CardTitle>Collection Efficiency</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col justify-center items-center h-[300px]">
                      <div className="relative w-48 h-48 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle
                            cx="96"
                            cy="96"
                            r="88"
                            stroke="currentColor"
                            strokeWidth="16"
                            fill="transparent"
                            className="text-gray-100"
                          />
                          <circle
                            cx="96"
                            cy="96"
                            r="88"
                            stroke="currentColor"
                            strokeWidth="16"
                            fill="transparent"
                            strokeDasharray={552.92}
                            strokeDashoffset={552.92 * (1 - (stats?.total_paid / stats?.total_fees || 0))}
                            className="text-blue-600 transition-all duration-1000 ease-out"
                          />
                        </svg>
                        <div className="absolute flex flex-col items-center">
                          <span className="text-4xl font-black text-gray-900">
                            {stats?.total_fees > 0 ? Math.round((stats?.total_paid / stats?.total_fees) * 100) : 0}%
                          </span>
                          <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Yishyuwe</span>
                        </div>
                      </div>
                      <div className="mt-8 text-center">
                        <p className="text-gray-500 text-sm">Target Remaining</p>
                        <p className="text-2xl font-black text-gray-900">{formatCurrency(stats?.total_balance)}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Parents Management Tab */}
              <TabsContent value="parents">
                <Card className="rounded-2xl border-0 shadow-sm bg-white">
                  <CardHeader className="border-b">
                    <div className="flex justify-between items-center">
                      <CardTitle>Parent Accounts Management</CardTitle>
                      <div className="flex gap-2">
                        <Input 
                          placeholder="Search parents..." 
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-64"
                        />
                        <Button><Plus className="w-4 h-4 mr-2" />Add Parent</Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-bold">
                          <tr>
                            <th className="px-6 py-4">Parent Name</th>
                            <th className="px-6 py-4">Phone</th>
                            <th className="px-6 py-4">Email</th>
                            <th className="px-6 py-4">Linked Students</th>
                            <th className="px-6 py-4">Total Paid</th>
                            <th className="px-6 py-4">Balance</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {parents.filter(p => 
                            p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            p.phone?.includes(searchQuery)
                          ).map((parent) => {
                            const parentStudents = students.filter((s: any) => s.parent_id === parent.id);
                            const totalPaid = parentStudents.reduce((sum: number, s: any) => sum + (s.total_paid || 0), 0);
                            const totalFees = parentStudents.reduce((sum: number, s: any) => sum + (s.total_fees || 0), 0);
                            return (
                              <tr key={parent.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium">{parent.name}</td>
                                <td className="px-6 py-4">{parent.phone}</td>
                                <td className="px-6 py-4">{parent.email || '-'}</td>
                                <td className="px-6 py-4">{parentStudents.length}</td>
                                <td className="px-6 py-4 font-medium text-green-600">{formatCurrency(totalPaid)}</td>
                                <td className="px-6 py-4 font-medium text-amber-600">{formatCurrency(totalFees - totalPaid)}</td>
                                <td className="px-6 py-4">
                                  <Badge className={parent.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                    {parent.is_active ? 'Active' : 'Inactive'}
                                  </Badge>
                                </td>
                                <td className="px-6 py-4">
                                  <Button variant="ghost" size="sm"><Edit className="w-4 h-4" /></Button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Fees Management Tab */}
              <TabsContent value="fees">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <Card className="bg-gradient-to-br from-blue-500 to-blue-700 text-white">
                    <CardContent className="p-6">
                      <p className="text-blue-100">Total Expected</p>
                      <p className="text-3xl font-bold">{formatCurrency(stats?.total_fees || 0)}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-green-500 to-green-700 text-white">
                    <CardContent className="p-6">
                      <p className="text-green-100">Total Collected</p>
                      <p className="text-3xl font-bold">{formatCurrency(stats?.total_paid || 0)}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-amber-500 to-amber-700 text-white">
                    <CardContent className="p-6">
                      <p className="text-amber-100">Outstanding Balance</p>
                      <p className="text-3xl font-bold">{formatCurrency(stats?.total_balance || 0)}</p>
                    </CardContent>
                  </Card>
                </div>
                <Card className="rounded-2xl border-0 shadow-sm bg-white">
                  <CardHeader className="border-b">
                    <div className="flex justify-between items-center">
                      <CardTitle>Fee Management</CardTitle>
                      <div className="flex gap-2">
                        <Button variant="outline"><Download className="w-4 h-4 mr-2" />Export</Button>
                        <Button><Plus className="w-4 h-4 mr-2" />Create Fee</Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-bold">
                          <tr>
                            <th className="px-6 py-4">Student</th>
                            <th className="px-6 py-4">Level</th>
                            <th className="px-6 py-4">Trade</th>
                            <th className="px-6 py-4">Total Fees</th>
                            <th className="px-6 py-4">Amount Paid</th>
                            <th className="px-6 py-4">Balance</th>
                            <th className="px-6 py-4">Payment Status</th>
                            <th className="px-6 py-4">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {students.slice(0, 20).map((student: any) => {
                            const balance = (student.total_fees || 0) - (student.total_paid || 0);
                            const paymentStatus = balance <= 0 ? 'paid' : balance < (student.total_fees || 0) * 0.5 ? 'partial' : 'unpaid';
                            return (
                              <tr key={student.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium">{student.first_name} {student.last_name}</td>
                                <td className="px-6 py-4">{student.level_number || student.level || '-'}</td>
                                <td className="px-6 py-4">{student.trade_name || student.trade || '-'}</td>
                                <td className="px-6 py-4">{formatCurrency(student.total_fees || 0)}</td>
                                <td className="px-6 py-4 text-green-600">{formatCurrency(student.total_paid || 0)}</td>
                                <td className="px-6 py-4 text-amber-600">{formatCurrency(balance)}</td>
                                <td className="px-6 py-4">
                                  <Badge className={
                                    paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                                    paymentStatus === 'partial' ? 'bg-amber-100 text-amber-800' :
                                    'bg-red-100 text-red-800'
                                  }>
                                    {paymentStatus.toUpperCase()}
                                  </Badge>
                                </td>
                                <td className="px-6 py-4">
                                  <Button variant="ghost" size="sm"><Plus className="w-4 h-4" />Record Payment</Button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </AnimatePresence>
          </Tabs>
        </div>

        {/* Right Sidebar - Quick Actions */}
        <div className="hidden xl:flex flex-col gap-8 w-80">
          <Card className="rounded-3xl border-0 shadow-lg bg-gray-900 text-white overflow-hidden">
            <CardHeader className="p-6 pb-2">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-400" /> Quick Management
              </CardTitle>
              <CardDescription className="text-gray-400 text-xs">Direct access to core functions</CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <Button variant="ghost" className="w-full justify-start gap-4 h-14 bg-gray-800/50 hover:bg-blue-600 hover:text-white border-0 text-gray-300 transition-all rounded-2xl" onClick={() => onNavigate('payments-management')}>
                <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center font-bold text-blue-400 group-hover:bg-blue-500">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold">Record Payment</p>
                  <p className="text-[10px] opacity-50">Parent fee collection</p>
                </div>
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-4 h-14 bg-gray-800/50 hover:bg-emerald-600 hover:text-white border-0 text-gray-300 transition-all rounded-2xl" onClick={() => onNavigate('invoices-management')}>
                <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center font-bold text-emerald-400">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold">Issue Invoice</p>
                  <p className="text-[10px] opacity-50">Generate student bills</p>
                </div>
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-4 h-14 bg-gray-800/50 hover:bg-amber-600 hover:text-white border-0 text-gray-300 transition-all rounded-2xl" onClick={() => onNavigate('budgets-management')}>
                <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center font-bold text-amber-400">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold">Annual Budget</p>
                  <p className="text-[10px] opacity-50">Allocations & forecasting</p>
                </div>
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-0 shadow-sm bg-white overflow-hidden">
            <CardHeader className="p-6">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-600" /> School Status
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <span className="text-sm font-bold text-gray-500">Fee Collection</span>
                  <span className="text-lg font-black text-gray-900">{Math.round((stats?.total_paid / stats?.total_fees) * 100 || 0)}%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(stats?.total_paid / stats?.total_fees) * 100 || 0}%` }}
                    className="h-full bg-blue-600 rounded-full"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-50 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center">
                  <Users className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{stats?.active_students || 0} Students</p>
                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Across 3 Trades</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AccountantDashboard;
