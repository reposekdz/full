import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  DollarSign, 
  Users, 
  TrendingUp, 
  Wallet, 
  CreditCard,
  Receipt,
  FileText,
  BarChart3,
  PieChart,
  Calendar,
  Clock,
  Search,
  Filter,
  Download,
  Plus,
  Eye,
  Edit,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Briefcase,
  Building,
  UserCheck,
  Bell,
  TrendingDown,
  ClipboardList,
  Target,
  Percent
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import LeftSidebar from '@/app/components/LeftSidebar';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';

interface AccountantDashboardProps {
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

const AccountantDashboard: React.FC<AccountantDashboardProps> = ({ onNavigate, onLogout }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const stats = [
    {
      title: 'Amafaranga Yose',
      value: 'RWF 45.2M',
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
      color: 'from-green-500 to-teal-500',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Kwishyura',
      value: '94.8%',
      change: '+3.2%',
      trend: 'up',
      icon: Percent,
      color: 'from-yellow-500 to-amber-500',
      bgColor: 'bg-yellow-50'
    },
    {
      title: 'Bitarishyurwa',
      value: 'RWF 2.8M',
      change: '-8.5%',
      trend: 'down',
      icon: AlertCircle,
      color: 'from-red-500 to-orange-500',
      bgColor: 'bg-red-50'
    },
    {
      title: 'Amafaranga Yakoreshejwe',
      value: 'RWF 18.5M',
      change: '+5.2%',
      trend: 'up',
      icon: TrendingUp,
      color: 'from-blue-500 to-indigo-500',
      bgColor: 'bg-blue-50'
    },
  ];

  const recentTransactions = [
    {
      id: 'TRX001',
      student: 'Jean Mugisha',
      class: 'S3 A',
      amount: 'RWF 150,000',
      type: 'payment',
      method: 'Mobile Money',
      date: '2 amasaha ashize',
      status: 'completed'
    },
    {
      id: 'TRX002',
      student: 'Marie Uwase',
      class: 'S5 B',
      amount: 'RWF 200,000',
      type: 'payment',
      method: 'Bank Transfer',
      date: '4 amasaha ashize',
      status: 'completed'
    },
    {
      id: 'TRX003',
      department: 'IT Department',
      amount: 'RWF 500,000',
      type: 'expense',
      category: 'Equipment',
      date: '1 umunsi ushize',
      status: 'pending'
    },
    {
      id: 'TRX004',
      student: 'Patrick Nkusi',
      class: 'S4 A',
      amount: 'RWF 180,000',
      type: 'payment',
      method: 'Cash',
      date: '1 umunsi ushize',
      status: 'completed'
    },
  ];

  const feeCollectionByClass = [
    {
      class: 'S1 A',
      students: 45,
      total: 'RWF 6,750,000',
      collected: 'RWF 6,400,000',
      pending: 'RWF 350,000',
      percentage: 94.8,
      overdue: 2
    },
    {
      class: 'S2 B',
      students: 42,
      total: 'RWF 6,300,000',
      collected: 'RWF 6,100,000',
      pending: 'RWF 200,000',
      percentage: 96.8,
      overdue: 1
    },
    {
      class: 'S3 A',
      students: 38,
      total: 'RWF 6,080,000',
      collected: 'RWF 5,500,000',
      pending: 'RWF 580,000',
      percentage: 90.5,
      overdue: 4
    },
    {
      class: 'S4 C',
      students: 40,
      total: 'RWF 6,800,000',
      collected: 'RWF 6,500,000',
      pending: 'RWF 300,000',
      percentage: 95.6,
      overdue: 2
    },
    {
      class: 'S5 A',
      students: 35,
      total: 'RWF 6,300,000',
      collected: 'RWF 5,900,000',
      pending: 'RWF 400,000',
      percentage: 93.7,
      overdue: 3
    },
  ];

  const revenueStreams = [
    {
      source: 'Amafaranga y\'Ishuri',
      amount: 'RWF 35,000,000',
      percentage: 77.4,
      change: '+8.5%',
      trend: 'up',
      color: 'from-yellow-500 to-amber-500'
    },
    {
      source: 'Siporo & Ibikorwa',
      amount: 'RWF 4,500,000',
      percentage: 10.0,
      change: '+12.3%',
      trend: 'up',
      color: 'from-green-500 to-teal-500'
    },
    {
      source: 'Cafeteria',
      amount: 'RWF 3,200,000',
      percentage: 7.1,
      change: '+5.2%',
      trend: 'up',
      color: 'from-blue-500 to-indigo-500'
    },
    {
      source: 'Ibindi',
      amount: 'RWF 2,500,000',
      percentage: 5.5,
      change: '-2.1%',
      trend: 'down',
      color: 'from-orange-500 to-red-500'
    },
  ];

  const expenses = [
    {
      id: 'EXP001',
      category: 'Imishahara',
      amount: 'RWF 12,000,000',
      department: 'HR',
      date: '2025-01-15',
      status: 'approved',
      approvedBy: 'HeadMaster',
      priority: 'high'
    },
    {
      id: 'EXP002',
      category: 'Ibikoresho',
      amount: 'RWF 2,500,000',
      department: 'IT',
      date: '2025-01-18',
      status: 'pending',
      approvedBy: '-',
      priority: 'medium'
    },
    {
      id: 'EXP003',
      category: 'Gusana Inyubako',
      amount: 'RWF 1,800,000',
      department: 'Maintenance',
      date: '2025-01-16',
      status: 'approved',
      approvedBy: 'Director',
      priority: 'high'
    },
    {
      id: 'EXP004',
      category: 'Ibitabo',
      amount: 'RWF 800,000',
      department: 'Academics',
      date: '2025-01-19',
      status: 'pending',
      approvedBy: '-',
      priority: 'low'
    },
    {
      id: 'EXP005',
      category: 'Utilities',
      amount: 'RWF 1,200,000',
      department: 'Administration',
      date: '2025-01-14',
      status: 'approved',
      approvedBy: 'HeadMaster',
      priority: 'high'
    },
  ];

  const payrollRecords = [
    {
      name: 'Dr. Jean Mugabo',
      role: 'Senior Teacher',
      department: 'Mathematics',
      salary: 'RWF 450,000',
      bonus: 'RWF 50,000',
      deductions: 'RWF 45,000',
      net: 'RWF 455,000',
      status: 'paid',
      date: '2025-01-15'
    },
    {
      name: 'Prof. Marie Uwase',
      role: 'Head of Department',
      department: 'Sciences',
      salary: 'RWF 550,000',
      bonus: 'RWF 100,000',
      deductions: 'RWF 65,000',
      net: 'RWF 585,000',
      status: 'paid',
      date: '2025-01-15'
    },
    {
      name: 'Mr. Patrick Nkusi',
      role: 'Teacher',
      department: 'Languages',
      salary: 'RWF 380,000',
      bonus: 'RWF 30,000',
      deductions: 'RWF 38,000',
      net: 'RWF 372,000',
      status: 'paid',
      date: '2025-01-15'
    },
    {
      name: 'Ms. Alice Uwera',
      role: 'Teacher',
      department: 'Arts',
      salary: 'RWF 350,000',
      bonus: 'RWF 25,000',
      deductions: 'RWF 35,000',
      net: 'RWF 340,000',
      status: 'pending',
      date: '2025-01-20'
    },
    {
      name: 'Mr. David Habimana',
      role: 'Lab Technician',
      department: 'Sciences',
      salary: 'RWF 280,000',
      bonus: 'RWF 20,000',
      deductions: 'RWF 28,000',
      net: 'RWF 272,000',
      status: 'pending',
      date: '2025-01-20'
    },
  ];

  const financialSummary = [
    { label: 'Amafaranga Yinjiye', value: 'RWF 45.2M', color: 'text-green-600', icon: ArrowUpRight },
    { label: 'Amafaranga Yasohowe', value: 'RWF 18.5M', color: 'text-red-600', icon: ArrowDownRight },
    { label: 'Inyungu', value: 'RWF 26.7M', color: 'text-green-600', icon: TrendingUp },
    { label: 'Margin', value: '59.1%', color: 'text-yellow-600', icon: Target },
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-yellow-50 via-green-50 to-white overflow-hidden">
      <LeftSidebar currentPage="accountant-dashboard" onNavigate={onNavigate} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto">
          <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-black text-gray-900 mb-2">
                  Dashbord y'Umubare
                </h1>
                <p className="text-gray-600">Gukurikirana amafaranga n'ibikorwa by'imari</p>
              </div>
              <div className="flex items-center space-x-3">
                <Button className="bg-gradient-to-r from-yellow-500 to-green-500 text-white hover:from-yellow-600 hover:to-green-600 border-0">
                  <Plus className="h-4 w-4 mr-2" />
                  Ongeraho
                </Button>
                <Button variant="outline" className="border-2 border-yellow-200 hover:bg-yellow-50">
                  <Download className="h-4 w-4 mr-2" />
                  Raporo
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className={`border-2 border-yellow-200 hover:shadow-lg transition-all ${stat.bgColor}`}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.color}`}>
                            <Icon className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex items-center space-x-1">
                            {stat.trend === 'up' ? (
                              <TrendingUp className="h-4 w-4 text-green-600" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-red-600" />
                            )}
                            <span className={`text-sm font-bold ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                              {stat.change}
                            </span>
                          </div>
                        </div>
                        <h3 className="text-sm font-medium text-gray-600 mb-1">{stat.title}</h3>
                        <p className="text-3xl font-black text-gray-900">{stat.value}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-6 lg:w-auto bg-white border-2 border-yellow-200 p-1">
              <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-green-500 data-[state=active]:text-white">
                Incamake
              </TabsTrigger>
              <TabsTrigger value="fees" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-green-500 data-[state=active]:text-white">
                Amafaranga
              </TabsTrigger>
              <TabsTrigger value="revenue" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-green-500 data-[state=active]:text-white">
                Inyungu
              </TabsTrigger>
              <TabsTrigger value="expenses" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-green-500 data-[state=active]:text-white">
                Amafaranga Yakoreshejwe
              </TabsTrigger>
              <TabsTrigger value="payroll" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-green-500 data-[state=active]:text-white">
                Imishahara
              </TabsTrigger>
              <TabsTrigger value="reports" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-green-500 data-[state=active]:text-white">
                Raporo
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-2 border-yellow-200">
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                      <Receipt className="h-5 w-5 mr-2 text-yellow-600" />
                      Ibikorwa Biheruka
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-80">
                      <div className="space-y-3">
                        {recentTransactions.map((transaction, index) => (
                          <div key={index} className="p-4 rounded-lg border-2 border-yellow-100 hover:border-yellow-300 hover:shadow-md transition-all">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <Badge className="bg-gradient-to-r from-yellow-500 to-green-500 text-white border-0">
                                    {transaction.id}
                                  </Badge>
                                  <Badge className={
                                    transaction.type === 'payment' 
                                      ? 'bg-green-100 text-green-700' 
                                      : 'bg-red-100 text-red-700'
                                  }>
                                    {transaction.type === 'payment' ? 'Kwishyura' : 'Gukoresha'}
                                  </Badge>
                                </div>
                                <h4 className="font-bold text-gray-900">
                                  {transaction.student || transaction.department}
                                </h4>
                                {transaction.class && (
                                  <p className="text-xs text-gray-600">{transaction.class}</p>
                                )}
                                {transaction.category && (
                                  <p className="text-xs text-gray-600">{transaction.category}</p>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="font-black text-gray-900">{transaction.amount}</p>
                                {transaction.method && (
                                  <p className="text-xs text-gray-500">{transaction.method}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>{transaction.date}</span>
                              <Badge className={
                                transaction.status === 'completed' 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-orange-100 text-orange-700'
                              }>
                                {transaction.status === 'completed' ? 'Byarangiye' : 'Birategerezwa'}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                <Card className="border-2 border-yellow-200">
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                      <BarChart3 className="h-5 w-5 mr-2 text-yellow-600" />
                      Incamake y'Amafaranga
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {financialSummary.map((item, index) => {
                        const Icon = item.icon;
                        return (
                          <div key={index} className="p-4 rounded-lg border-2 border-yellow-100 bg-gradient-to-r from-yellow-50 to-green-50">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className={`p-2 rounded-lg bg-white`}>
                                  <Icon className={`h-5 w-5 ${item.color}`} />
                                </div>
                                <p className="text-sm text-gray-600">{item.label}</p>
                              </div>
                              <p className={`text-2xl font-black ${item.color}`}>{item.value}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-2 border-yellow-200">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <PieChart className="h-5 w-5 mr-2 text-yellow-600" />
                    Amafaranga Yinjiye Akurikije Inkomoko
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {revenueStreams.map((stream, index) => (
                      <div key={index} className={`p-6 rounded-lg bg-gradient-to-br ${stream.color} text-white`}>
                        <p className="text-sm opacity-90 mb-2">{stream.source}</p>
                        <p className="text-3xl font-black mb-2">{stream.amount}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm opacity-90">{stream.percentage}% ya Total</span>
                          <div className="flex items-center">
                            {stream.trend === 'up' ? (
                              <ArrowUpRight className="h-4 w-4 mr-1" />
                            ) : (
                              <ArrowDownRight className="h-4 w-4 mr-1" />
                            )}
                            <span className="text-sm font-bold">{stream.change}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="fees" className="space-y-6">
              <Card className="border-2 border-yellow-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center text-lg">
                      <CreditCard className="h-5 w-5 mr-2 text-yellow-600" />
                      Kwishyura Amafaranga y'Ishuri
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <Input
                        placeholder="Shakisha..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-64 border-2 border-yellow-200 focus:border-yellow-400"
                      />
                      <Button variant="outline" className="border-2 border-yellow-200">
                        <Filter className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-yellow-200 bg-gradient-to-r from-yellow-50 to-green-50">
                          <th className="text-left p-4 font-bold text-gray-900">Ikidasobwa</th>
                          <th className="text-left p-4 font-bold text-gray-900">Abanyeshuri</th>
                          <th className="text-left p-4 font-bold text-gray-900">Total</th>
                          <th className="text-left p-4 font-bold text-gray-900">Byishyuwe</th>
                          <th className="text-left p-4 font-bold text-gray-900">Bisigaye</th>
                          <th className="text-left p-4 font-bold text-gray-900">%</th>
                          <th className="text-left p-4 font-bold text-gray-900">Byarenze</th>
                          <th className="text-left p-4 font-bold text-gray-900">Ibikorwa</th>
                        </tr>
                      </thead>
                      <tbody>
                        {feeCollectionByClass.map((classData, index) => (
                          <tr key={index} className="border-b border-yellow-100 hover:bg-yellow-50 transition-colors">
                            <td className="p-4">
                              <Badge className="bg-gradient-to-r from-yellow-500 to-green-500 text-white border-0">
                                {classData.class}
                              </Badge>
                            </td>
                            <td className="p-4 font-medium text-gray-900">{classData.students}</td>
                            <td className="p-4 font-medium text-gray-900">{classData.total}</td>
                            <td className="p-4 font-medium text-green-600">{classData.collected}</td>
                            <td className="p-4 font-medium text-red-600">{classData.pending}</td>
                            <td className="p-4">
                              <div className="flex items-center space-x-2">
                                <div className="flex-1 bg-gray-200 rounded-full h-2 w-20">
                                  <div
                                    className="bg-gradient-to-r from-yellow-500 to-green-500 h-2 rounded-full"
                                    style={{ width: `${classData.percentage}%` }}
                                  />
                                </div>
                                <span className="font-bold text-gray-900">{classData.percentage}%</span>
                              </div>
                            </td>
                            <td className="p-4">
                              {classData.overdue > 0 ? (
                                <Badge className="bg-red-100 text-red-700">
                                  {classData.overdue}
                                </Badge>
                              ) : (
                                <Badge className="bg-green-100 text-green-700">0</Badge>
                              )}
                            </td>
                            <td className="p-4">
                              <div className="flex items-center space-x-2">
                                <Button size="sm" variant="outline" className="border-yellow-200">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="outline" className="border-yellow-200">
                                  <Download className="h-4 w-4" />
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
            </TabsContent>

            <TabsContent value="revenue" className="space-y-6">
              <Card className="border-2 border-yellow-200">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <TrendingUp className="h-5 w-5 mr-2 text-yellow-600" />
                    Amafaranga Yinjiye
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {revenueStreams.map((stream, index) => (
                      <div key={index} className="p-6 rounded-lg border-2 border-yellow-100 hover:border-yellow-300 transition-all">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h4 className="font-bold text-gray-900 text-lg">{stream.source}</h4>
                            <p className="text-sm text-gray-600">Yoherejwe ku nzego zose</p>
                          </div>
                          <div className="text-right">
                            <p className="text-3xl font-black text-gray-900">{stream.amount}</p>
                            <div className="flex items-center justify-end mt-1">
                              {stream.trend === 'up' ? (
                                <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                              ) : (
                                <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                              )}
                              <span className={`text-sm font-bold ${stream.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                                {stream.change}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Urugero rw'inyungu</span>
                            <span className="font-bold text-gray-900">{stream.percentage}%</span>
                          </div>
                          <div className="bg-gray-200 rounded-full h-3">
                            <div
                              className={`bg-gradient-to-r ${stream.color} h-3 rounded-full`}
                              style={{ width: `${stream.percentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="expenses" className="space-y-6">
              <Card className="border-2 border-yellow-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center text-lg">
                      <Wallet className="h-5 w-5 mr-2 text-yellow-600" />
                      Amafaranga Yakoreshejwe
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <Input
                        placeholder="Shakisha..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-64 border-2 border-yellow-200 focus:border-yellow-400"
                      />
                      <Button variant="outline" className="border-2 border-yellow-200">
                        <Filter className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-yellow-200 bg-gradient-to-r from-yellow-50 to-green-50">
                          <th className="text-left p-4 font-bold text-gray-900">ID</th>
                          <th className="text-left p-4 font-bold text-gray-900">Icyiciro</th>
                          <th className="text-left p-4 font-bold text-gray-900">Amafaranga</th>
                          <th className="text-left p-4 font-bold text-gray-900">Ishami</th>
                          <th className="text-left p-4 font-bold text-gray-900">Itariki</th>
                          <th className="text-left p-4 font-bold text-gray-900">Uko Bimeze</th>
                          <th className="text-left p-4 font-bold text-gray-900">Byemejwe na</th>
                          <th className="text-left p-4 font-bold text-gray-900">Ibanze</th>
                          <th className="text-left p-4 font-bold text-gray-900">Ibikorwa</th>
                        </tr>
                      </thead>
                      <tbody>
                        {expenses.map((expense, index) => (
                          <tr key={index} className="border-b border-yellow-100 hover:bg-yellow-50 transition-colors">
                            <td className="p-4">
                              <Badge className="bg-gradient-to-r from-yellow-500 to-green-500 text-white border-0">
                                {expense.id}
                              </Badge>
                            </td>
                            <td className="p-4 font-medium text-gray-900">{expense.category}</td>
                            <td className="p-4 font-bold text-gray-900">{expense.amount}</td>
                            <td className="p-4 text-gray-700">{expense.department}</td>
                            <td className="p-4 text-gray-700">{expense.date}</td>
                            <td className="p-4">
                              <Badge className={
                                expense.status === 'approved'
                                  ? 'bg-green-100 text-green-700'
                                  : expense.status === 'pending'
                                  ? 'bg-orange-100 text-orange-700'
                                  : 'bg-red-100 text-red-700'
                              }>
                                {expense.status === 'approved' ? 'Byemejwe' : 
                                 expense.status === 'pending' ? 'Birategerezwa' : 'Byanze'}
                              </Badge>
                            </td>
                            <td className="p-4 text-gray-700">{expense.approvedBy}</td>
                            <td className="p-4">
                              <Badge className={
                                expense.priority === 'high' ? 'bg-red-100 text-red-700' :
                                expense.priority === 'medium' ? 'bg-orange-100 text-orange-700' :
                                'bg-blue-100 text-blue-700'
                              }>
                                {expense.priority === 'high' ? 'Ngombwa' : 
                                 expense.priority === 'medium' ? 'Byiciriritse' : 'Byoroshye'}
                              </Badge>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center space-x-2">
                                <Button size="sm" variant="outline" className="border-yellow-200">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="outline" className="border-yellow-200">
                                  <Edit className="h-4 w-4" />
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
            </TabsContent>

            <TabsContent value="payroll" className="space-y-6">
              <Card className="border-2 border-yellow-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center text-lg">
                      <UserCheck className="h-5 w-5 mr-2 text-yellow-600" />
                      Imishahara y'Abakozi
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <Input
                        placeholder="Shakisha..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-64 border-2 border-yellow-200 focus:border-yellow-400"
                      />
                      <Button className="bg-gradient-to-r from-yellow-500 to-green-500 text-white hover:from-yellow-600 hover:to-green-600 border-0">
                        <Plus className="h-4 w-4 mr-2" />
                        Ongeraho
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-yellow-200 bg-gradient-to-r from-yellow-50 to-green-50">
                          <th className="text-left p-4 font-bold text-gray-900">Izina</th>
                          <th className="text-left p-4 font-bold text-gray-900">Umwanya</th>
                          <th className="text-left p-4 font-bold text-gray-900">Ishami</th>
                          <th className="text-left p-4 font-bold text-gray-900">Umushahara</th>
                          <th className="text-left p-4 font-bold text-gray-900">Bonus</th>
                          <th className="text-left p-4 font-bold text-gray-900">Ibikurwaho</th>
                          <th className="text-left p-4 font-bold text-gray-900">Net</th>
                          <th className="text-left p-4 font-bold text-gray-900">Uko Bimeze</th>
                          <th className="text-left p-4 font-bold text-gray-900">Itariki</th>
                          <th className="text-left p-4 font-bold text-gray-900">Ibikorwa</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payrollRecords.map((record, index) => (
                          <tr key={index} className="border-b border-yellow-100 hover:bg-yellow-50 transition-colors">
                            <td className="p-4">
                              <div className="flex items-center space-x-3">
                                <Avatar className="h-10 w-10 border-2 border-yellow-400">
                                  <AvatarFallback className="bg-gradient-to-br from-yellow-500 to-green-500 text-white font-bold">
                                    {record.name.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="font-medium text-gray-900">{record.name}</span>
                              </div>
                            </td>
                            <td className="p-4 text-gray-700">{record.role}</td>
                            <td className="p-4 text-gray-700">{record.department}</td>
                            <td className="p-4 font-medium text-gray-900">{record.salary}</td>
                            <td className="p-4 font-medium text-green-600">{record.bonus}</td>
                            <td className="p-4 font-medium text-red-600">{record.deductions}</td>
                            <td className="p-4 font-black text-gray-900">{record.net}</td>
                            <td className="p-4">
                              <Badge className={
                                record.status === 'paid' 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-orange-100 text-orange-700'
                              }>
                                {record.status === 'paid' ? 'Byishyuwe' : 'Birategerezwa'}
                              </Badge>
                            </td>
                            <td className="p-4 text-gray-700">{record.date}</td>
                            <td className="p-4">
                              <div className="flex items-center space-x-2">
                                <Button size="sm" variant="outline" className="border-yellow-200">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="outline" className="border-yellow-200">
                                  <Download className="h-4 w-4" />
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
            </TabsContent>

            <TabsContent value="reports" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border-2 border-yellow-200 hover:shadow-lg transition-all cursor-pointer bg-gradient-to-br from-yellow-50 to-green-50">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className="p-4 rounded-full bg-gradient-to-br from-yellow-500 to-green-500">
                        <FileText className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 mb-1">Raporo Rusange</h3>
                        <p className="text-xs text-gray-600">Raporo y'amafaranga rusange</p>
                      </div>
                      <Button className="w-full bg-gradient-to-r from-yellow-500 to-green-500 text-white hover:from-yellow-600 hover:to-green-600 border-0">
                        <Download className="h-4 w-4 mr-2" />
                        Pakurura
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 border-yellow-200 hover:shadow-lg transition-all cursor-pointer bg-gradient-to-br from-green-50 to-blue-50">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className="p-4 rounded-full bg-gradient-to-br from-green-500 to-blue-500">
                        <BarChart3 className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 mb-1">Imibare</h3>
                        <p className="text-xs text-gray-600">Raporo y'imibare n'ibipimo</p>
                      </div>
                      <Button className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white hover:from-green-600 hover:to-blue-600 border-0">
                        <Download className="h-4 w-4 mr-2" />
                        Pakurura
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 border-yellow-200 hover:shadow-lg transition-all cursor-pointer bg-gradient-to-br from-blue-50 to-indigo-50">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className="p-4 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500">
                        <DollarSign className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 mb-1">Amafaranga</h3>
                        <p className="text-xs text-gray-600">Raporo y'amafaranga yose</p>
                      </div>
                      <Button className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 border-0">
                        <Download className="h-4 w-4 mr-2" />
                        Pakurura
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 border-yellow-200 hover:shadow-lg transition-all cursor-pointer bg-gradient-to-br from-orange-50 to-red-50">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className="p-4 rounded-full bg-gradient-to-br from-orange-500 to-red-500">
                        <ClipboardList className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 mb-1">Raporo Yihariye</h3>
                        <p className="text-xs text-gray-600">Kora raporo yihariye</p>
                      </div>
                      <Button className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 border-0">
                        <Plus className="h-4 w-4 mr-2" />
                        Kora
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
    </div>
  );
};

export default AccountantDashboard;
