import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users, Phone, Calendar, MessageSquare, TrendingUp, BarChart3, PieChart, LineChart,
  BookOpen, Award, Target, Activity, Bell, AlertCircle, CheckCircle, Clock, Eye,
  Download, Upload, Search, Filter, Plus, Edit, Trash2, Save, X, Send, Mail,
  FileText, Clipboard, ThumbsUp, ThumbsDown, AlertTriangle, Info, RefreshCw,
  GraduationCap, School, Heart, Star, Briefcase, MapPin, Globe, Zap, TrendingDown,
  ArrowUpRight, ArrowDownRight, Home, Settings, UserCheck, Package, DollarSign
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Label } from '@/app/components/ui/label';
import { Progress } from '@/app/components/ui/progress';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';
import LeftSidebar from '@/app/components/LeftSidebar';
import UniversalMessagingWidget from '@/app/components/UniversalMessagingWidget';

const API_BASE = 'http://localhost:5000/api';

interface AdvisorDashboardProps {
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

interface ComprehensiveOverview {
  summary: {
    total_students: number;
    total_trades: number;
    active_messages: number;
    pending_contacts: number;
    open_tickets: number;
    recent_grades: number;
    attendance_records: number;
  };
  students: {
    all_students: any[];
    by_trade: Record<string, any[]>;
    by_level: Record<string, any[]>;
    performance_overview: any;
    attendance_overview: any;
    at_risk: any[];
  };
  trades: {
    all_trades: any[];
    enrollment_stats: any[];
    performance_by_trade: any[];
  };
  communications: {
    recent_messages: any[];
    message_stats: any;
    urgent_contacts: any[];
    contact_stats: any;
  };
  support: {
    active_tickets: any[];
    ticket_stats: any;
  };
  academics: {
    recent_grades: any[];
    grade_distribution: any;
    average_performance: any;
    top_performers: any[];
    struggling_students: any[];
  };
  attendance: {
    weekly_summary: any[];
    attendance_rate: string;
    by_day: any;
    chronic_absentees: any[];
  };
  insights: {
    key_metrics: any[];
    trends: any;
    recommendations: any[];
    alerts: any[];
  };
}

const ComprehensiveAdvisorPortal: React.FC<AdvisorDashboardProps> = ({ onNavigate, onLogout }) => {
  const [activeModule, setActiveModule] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTrade, setFilterTrade] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  
  const [comprehensiveData, setComprehensiveData] = useState<ComprehensiveOverview | null>(null);
  const [studentSheets, setStudentSheets] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [contacts, setContacts] = useState<any[]>([]);
  const [initiatives, setInitiatives] = useState<any[]>([]);
  const [consultations, setConsultations] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  
  const [showStudentDialog, setShowStudentDialog] = useState(false);
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [showInitiativeDialog, setShowInitiativeDialog] = useState(false);
  const [showConsultationDialog, setShowConsultationDialog] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const [overviewRes, contactsRes, initiativesRes, consultationsRes, reportsRes] = await Promise.all([
        fetch(`${API_BASE}/advisor-comprehensive/comprehensive/overview`, { headers }),
        fetch(`${API_BASE}/advisor-comprehensive/contacts`, { headers }),
        fetch(`${API_BASE}/advisor-comprehensive/initiatives`, { headers }),
        fetch(`${API_BASE}/advisor-comprehensive/consultations`, { headers }),
        fetch(`${API_BASE}/advisor-comprehensive/reports`, { headers })
      ]);

      const [overview, contactsData, initiativesData, consultationsData, reportsData] = await Promise.all([
        overviewRes.json(),
        contactsRes.json(),
        initiativesRes.json(),
        consultationsRes.json(),
        reportsRes.json()
      ]);

      if (overview.success) {
        setComprehensiveData(overview.overview);
      }
      if (contactsData.success) {
        setContacts(contactsData.contacts || []);
      }
      if (initiativesData.success) {
        setInitiatives(initiativesData.initiatives || []);
      }
      if (consultationsData.success) {
        setConsultations(consultationsData.consultations || []);
      }
      if (reportsData.success) {
        setReports(reportsData.reports || []);
      }

    } catch (error) {
      console.error('Error fetching advisor data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentSheets = async (filters: { trade?: string; level?: string; search?: string } = {}) => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (filters.trade) params.append('trade', filters.trade);
      if (filters.level) params.append('level', filters.level);
      if (filters.search) params.append('search', filters.search);

      const response = await fetch(
        `${API_BASE}/advisor-comprehensive/students/comprehensive?${params.toString()}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      const data = await response.json();
      
      if (data.success) {
        setStudentSheets(data.students || []);
      }
    } catch (error) {
      console.error('Error fetching student sheets:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAllData();
    if (activeModule === 'students') {
      await fetchStudentSheets({ trade: filterTrade, level: filterLevel, search: searchQuery });
    }
    setRefreshing(false);
  };

  const modules = [
    { id: 'overview', name: 'Ibanze / Overview', icon: TrendingUp, color: 'from-blue-600 to-indigo-600' },
    { id: 'analytics', name: 'Isesengura / Analytics', icon: BarChart3, color: 'from-purple-600 to-pink-600' },
    { id: 'students', name: 'Abanyeshuri / Students', icon: GraduationCap, color: 'from-green-600 to-teal-600' },
    { id: 'contacts', name: 'Itumanaho / Contacts', icon: Phone, color: 'from-yellow-600 to-orange-600' },
    { id: 'consultations', name: 'Ubujyanama / Consultations', icon: MessageSquare, color: 'from-teal-600 to-cyan-600' },
    { id: 'initiatives', name: 'Imigambi / Initiatives', icon: Target, color: 'from-indigo-600 to-purple-600' },
    { id: 'reports', name: 'Raporo / Reports', icon: FileText, color: 'from-red-600 to-rose-600' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="mx-auto mb-6"
          >
            <Users className="w-20 h-20 text-indigo-600" />
          </motion.div>
          <p className="text-3xl font-black text-gray-900">Gutangiza Dashboard...</p>
          <p className="text-gray-600 mt-2">Loading Comprehensive Advisor Portal</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <LeftSidebar onNavigate={onNavigate} onLogout={onLogout} />
      
      <div className="flex-1 ml-64">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="sticky top-0 z-30 bg-white/90 backdrop-blur-lg border-b border-gray-200 px-8 py-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Umujyanama Dashboard
              </h1>
              <p className="text-gray-600 mt-1">Comprehensive School Advisor Portal - Manage, Analyze & Advise</p>
            </div>
            <div className="flex items-center gap-4">
              <Button
                onClick={handleRefresh}
                disabled={refreshing}
                variant="outline"
                className="gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-lg px-4 py-2">
                <Users className="w-5 h-5 mr-2" />
                Advisor Portal
              </Badge>
            </div>
          </div>
        </motion.div>

        <div className="p-8">
          <Tabs value={activeModule} onValueChange={setActiveModule} className="space-y-6">
            <TabsList className="grid grid-cols-7 w-full h-auto gap-2 bg-transparent">
              {modules.map((module) => (
                <TabsTrigger
                  key={module.id}
                  value={module.id}
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600 data-[state=active]:text-white h-16 flex-col gap-2"
                >
                  <module.icon className="w-5 h-5" />
                  <span className="text-xs font-semibold">{module.name.split('/')[0].trim()}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <OverviewModule data={comprehensiveData} />
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <AnalyticsModule data={comprehensiveData} />
            </TabsContent>

            <TabsContent value="students" className="space-y-6">
              <StudentsModule
                students={studentSheets}
                trades={comprehensiveData?.trades.all_trades || []}
                onFetchStudents={fetchStudentSheets}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                filterTrade={filterTrade}
                setFilterTrade={setFilterTrade}
                filterLevel={filterLevel}
                setFilterLevel={setFilterLevel}
                onSelectStudent={(student) => {
                  setSelectedStudent(student);
                  setShowStudentDialog(true);
                }}
              />
            </TabsContent>

            <TabsContent value="contacts" className="space-y-6">
              <ContactsModule
                contacts={contacts}
                onAddContact={() => setShowContactDialog(true)}
                onRefresh={fetchAllData}
              />
            </TabsContent>

            <TabsContent value="consultations" className="space-y-6">
              <ConsultationsModule
                consultations={consultations}
                onAddConsultation={() => setShowConsultationDialog(true)}
                onRefresh={fetchAllData}
              />
            </TabsContent>

            <TabsContent value="initiatives" className="space-y-6">
              <InitiativesModule
                initiatives={initiatives}
                onAddInitiative={() => setShowInitiativeDialog(true)}
                onRefresh={fetchAllData}
              />
            </TabsContent>

            <TabsContent value="reports" className="space-y-6">
              <ReportsModule reports={reports} onRefresh={fetchAllData} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <UniversalMessagingWidget />

      <StudentDetailsDialog
        student={selectedStudent}
        open={showStudentDialog}
        onClose={() => {
          setShowStudentDialog(false);
          setSelectedStudent(null);
        }}
      />
    </div>
  );
};

const OverviewModule: React.FC<{ data: ComprehensiveOverview | null }> = ({ data }) => {
  if (!data) return null;

  const stats = [
    { label: 'Total Students', value: data.summary.total_students, icon: Users, color: 'blue', trend: '+5.2%' },
    { label: 'Active Trades', value: data.summary.total_trades, icon: Briefcase, color: 'green', trend: '+2.1%' },
    { label: 'Pending Messages', value: data.summary.active_messages, icon: MessageSquare, color: 'yellow', trend: '-3.5%' },
    { label: 'Open Tickets', value: data.summary.open_tickets, icon: AlertCircle, color: 'red', trend: '-8.3%' },
    { label: 'Attendance Rate', value: data.attendance.attendance_rate, icon: CheckCircle, color: 'teal', trend: '+1.2%' },
    { label: 'At Risk Students', value: data.students.at_risk.length, icon: AlertTriangle, color: 'orange', trend: '-4.1%' }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">{stat.label}</p>
                    <p className="text-3xl font-black mt-2">{stat.value}</p>
                    <Badge className={`mt-2 bg-${stat.color}-100 text-${stat.color}-700`}>
                      {stat.trend}
                    </Badge>
                  </div>
                  <div className={`p-4 bg-${stat.color}-100 rounded-xl`}>
                    <stat.icon className={`w-8 h-8 text-${stat.color}-600`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              At Risk Students
            </CardTitle>
            <CardDescription>Students requiring immediate attention</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-80">
              <div className="space-y-3">
                {data.students.at_risk.slice(0, 10).map((student: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-orange-200">
                          {student.first_name?.[0]}{student.last_name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{student.first_name} {student.last_name}</p>
                        <p className="text-sm text-gray-600">{student.trade_name} - Level {student.level_number}</p>
                      </div>
                    </div>
                    <Badge className="bg-orange-500 text-white">{student.risk_level}</Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-green-500" />
              Top Performers
            </CardTitle>
            <CardDescription>Excellent academic achievement</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-80">
              <div className="space-y-3">
                {data.academics.top_performers.slice(0, 10).map((student: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-green-200">
                          {student.first_name?.[0]}{student.last_name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{student.first_name} {student.last_name}</p>
                        <p className="text-sm text-gray-600">{student.trade_name}</p>
                      </div>
                    </div>
                    <Badge className="bg-green-500 text-white">{student.average_grade}%</Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-purple-500" />
            Key Insights & Recommendations
          </CardTitle>
          <CardDescription>AI-generated insights based on school data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.insights.recommendations.map((rec: any, index: number) => (
              <div key={index} className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                <h4 className="font-semibold text-purple-900 mb-2">{rec.title}</h4>
                <p className="text-gray-700">{rec.description}</p>
                <div className="flex gap-2 mt-3">
                  <Badge className="bg-purple-100 text-purple-700">{rec.category}</Badge>
                  <Badge className="bg-gray-100 text-gray-700">{rec.priority}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const AnalyticsModule: React.FC<{ data: ComprehensiveOverview | null }> = ({ data }) => {
  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-blue-500" />
              Grade Distribution
            </CardTitle>
            <CardDescription>Overall student performance breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(data.academics.grade_distribution).map(([grade, count]: [string, any], index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-20 font-semibold">{grade}</div>
                  <Progress value={(count / data.summary.total_students) * 100} className="flex-1" />
                  <div className="w-16 text-right font-semibold">{count}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-green-500" />
              Trade Performance
            </CardTitle>
            <CardDescription>Average grades by trade program</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.trades.performance_by_trade.map((trade: any, index: number) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-24 font-semibold text-sm">{trade.trade_code}</div>
                  <Progress value={trade.average_grade} className="flex-1" />
                  <div className="w-16 text-right font-semibold">{trade.average_grade}%</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-500" />
            Attendance Trends
          </CardTitle>
          <CardDescription>Weekly attendance patterns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(data.attendance.by_day).map(([day, stats]: [string, any], index) => (
              <div key={index} className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">{day}</h4>
                  <Badge className="bg-indigo-500 text-white">{stats.rate}%</Badge>
                </div>
                <Progress value={stats.rate} className="h-2" />
                <div className="flex justify-between text-sm text-gray-600 mt-2">
                  <span>Present: {stats.present}</span>
                  <span>Absent: {stats.absent}</span>
                  <span>Late: {stats.late}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-red-500" />
            Key Metrics Overview
          </CardTitle>
          <CardDescription>Comprehensive school performance indicators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {data.insights.key_metrics.map((metric: any, index: number) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg text-center">
                <p className="text-2xl font-black text-gray-900">{metric.value}</p>
                <p className="text-sm text-gray-600 mt-1">{metric.label}</p>
                {metric.trend && (
                  <Badge className={`mt-2 ${metric.trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {metric.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {metric.change}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

interface StudentsModuleProps {
  students: any[];
  trades: any[];
  onFetchStudents: (filters: any) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterTrade: string;
  setFilterTrade: (trade: string) => void;
  filterLevel: string;
  setFilterLevel: (level: string) => void;
  onSelectStudent: (student: any) => void;
}

const StudentsModule: React.FC<StudentsModuleProps> = ({
  students,
  trades,
  onFetchStudents,
  searchQuery,
  setSearchQuery,
  filterTrade,
  setFilterTrade,
  filterLevel,
  setFilterLevel,
  onSelectStudent
}) => {
  useEffect(() => {
    onFetchStudents({ trade: filterTrade, level: filterLevel, search: searchQuery });
  }, [filterTrade, filterLevel]);

  const handleSearch = () => {
    onFetchStudents({ trade: filterTrade, level: filterLevel, search: searchQuery });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Search & Filter Students
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <Label>Search Students</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  placeholder="Search by name or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch}>
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div>
              <Label>Trade</Label>
              <Select value={filterTrade} onValueChange={setFilterTrade}>
                <SelectTrigger>
                  <SelectValue placeholder="All Trades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Trades</SelectItem>
                  {trades.map((trade) => (
                    <SelectItem key={trade.trade_code} value={trade.trade_code}>
                      {trade.trade_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Level</Label>
              <Select value={filterLevel} onValueChange={setFilterLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="All Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="1">Level 1</SelectItem>
                  <SelectItem value="2">Level 2</SelectItem>
                  <SelectItem value="3">Level 3</SelectItem>
                  <SelectItem value="4A">Level 4A</SelectItem>
                  <SelectItem value="4B">Level 4B</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {students.map((student, index) => (
          <motion.div
            key={student.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="hover:shadow-lg transition-all cursor-pointer" onClick={() => onSelectStudent(student)}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarFallback className="text-lg font-bold bg-gradient-to-br from-indigo-500 to-purple-500 text-white">
                      {student.first_name?.[0]}{student.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{student.first_name} {student.last_name}</h3>
                    <p className="text-sm text-gray-600">{student.student_id}</p>
                    <div className="flex gap-2 mt-2">
                      <Badge className="bg-blue-100 text-blue-700">{student.trade_code}</Badge>
                      <Badge className="bg-green-100 text-green-700">L{student.level_number}</Badge>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Avg Grade:</span>
                    <span className="font-semibold">{student.academic_record?.average_grade || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Attendance:</span>
                    <span className="font-semibold">{student.attendance_record?.attendance_rate || 'N/A'}</span>
                  </div>
                  {student.risk_assessment?.overall_risk !== 'low' && (
                    <Badge className="w-full justify-center bg-orange-500 text-white">
                      Risk: {student.risk_assessment?.overall_risk}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {students.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No students found. Try adjusting your filters.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const ContactsModule: React.FC<{ contacts: any[]; onAddContact: () => void; onRefresh: () => void }> = ({ contacts, onAddContact, onRefresh }) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Contact Management</CardTitle>
            <CardDescription>Manage all school contacts and interactions</CardDescription>
          </div>
          <Button onClick={onAddContact} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Contact
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {contacts.map((contact, index) => (
              <div key={contact.id || index} className="p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">{contact.contact_name}</h4>
                    <p className="text-sm text-gray-600">{contact.organization || contact.position}</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={`${contact.priority === 'urgent' ? 'bg-red-500' : contact.priority === 'high' ? 'bg-orange-500' : 'bg-gray-500'} text-white`}>
                      {contact.priority}
                    </Badge>
                    <Badge className={`${contact.contact_type === 'parent' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                      {contact.contact_type}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-4 mt-3 text-sm text-gray-600">
                  {contact.contact_email && (
                    <div className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      {contact.contact_email}
                    </div>
                  )}
                  {contact.contact_phone && (
                    <div className="flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      {contact.contact_phone}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const ConsultationsModule: React.FC<{ consultations: any[]; onAddConsultation: () => void; onRefresh: () => void }> = ({ consultations, onAddConsultation, onRefresh }) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Student Consultations</CardTitle>
            <CardDescription>Track and manage counseling sessions</CardDescription>
          </div>
          <Button onClick={onAddConsultation} className="gap-2">
            <Plus className="w-4 h-4" />
            Schedule Consultation
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {consultations.map((consultation, index) => (
              <div key={consultation.id || index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">{consultation.subject}</h4>
                  <Badge className={`${consultation.status === 'completed' ? 'bg-green-500' : consultation.status === 'scheduled' ? 'bg-blue-500' : 'bg-gray-500'} text-white`}>
                    {consultation.status}
                  </Badge>
                </div>
                <div className="flex gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(consultation.session_date).toLocaleString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {consultation.duration_minutes} min
                  </div>
                  <Badge className="bg-purple-100 text-purple-700">{consultation.consultation_type}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const InitiativesModule: React.FC<{ initiatives: any[]; onAddInitiative: () => void; onRefresh: () => void }> = ({ initiatives, onAddInitiative, onRefresh }) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>School Development Initiatives</CardTitle>
            <CardDescription>Track school improvement projects and programs</CardDescription>
          </div>
          <Button onClick={onAddInitiative} className="gap-2">
            <Plus className="w-4 h-4" />
            New Initiative
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {initiatives.map((initiative, index) => (
              <Card key={initiative.id || index} className="border-l-4 border-l-indigo-500">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-bold text-lg">{initiative.initiative_name}</h4>
                      <Badge className="mt-2 bg-indigo-100 text-indigo-700">{initiative.category}</Badge>
                    </div>
                    <Badge className={`${initiative.status === 'completed' ? 'bg-green-500' : initiative.status === 'in_progress' ? 'bg-blue-500' : 'bg-gray-500'} text-white`}>
                      {initiative.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">{initiative.description}</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Progress:</span>
                      <span className="font-semibold">{initiative.progress_percentage}%</span>
                    </div>
                    <Progress value={initiative.progress_percentage} />
                    {initiative.budget && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Budget:</span>
                        <span className="font-semibold">RWF {initiative.budget.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const ReportsModule: React.FC<{ reports: any[]; onRefresh: () => void }> = ({ reports, onRefresh }) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Advisor Reports</CardTitle>
          <CardDescription>View and generate comprehensive reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {reports.map((report, index) => (
              <div key={report.id || index} className="p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">{report.report_title}</h4>
                    <p className="text-sm text-gray-600">{report.report_type} Report</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={`${report.status === 'published' ? 'bg-green-500' : report.status === 'approved' ? 'bg-blue-500' : 'bg-gray-500'} text-white`}>
                      {report.status}
                    </Badge>
                    <Button size="sm" variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
                <div className="flex gap-4 mt-3 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(report.created_at).toLocaleDateString()}
                  </div>
                  {report.submitted_to && (
                    <div className="flex items-center gap-1">
                      <Send className="w-4 h-4" />
                      Submitted to: {report.submitted_to}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const StudentDetailsDialog: React.FC<{ student: any; open: boolean; onClose: () => void }> = ({ student, open, onClose }) => {
  if (!student) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-3">
            <Avatar className="w-12 h-12">
              <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white">
                {student.first_name?.[0]}{student.last_name?.[0]}
              </AvatarFallback>
            </Avatar>
            {student.first_name} {student.last_name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Student ID</Label>
              <p className="font-semibold">{student.student_id}</p>
            </div>
            <div>
              <Label>Trade & Level</Label>
              <p className="font-semibold">{student.trade_name} - Level {student.level_number}</p>
            </div>
            <div>
              <Label>Email</Label>
              <p className="font-semibold">{student.email}</p>
            </div>
            <div>
              <Label>Phone</Label>
              <p className="font-semibold">{student.phone || 'N/A'}</p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Academic Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Average Grade</Label>
                  <p className="text-2xl font-bold text-blue-600">{student.academic_record?.average_grade || 'N/A'}</p>
                </div>
                <div>
                  <Label>Passing Grades</Label>
                  <p className="text-2xl font-bold text-green-600">
                    {student.academic_record?.passing_grades}/{student.academic_record?.total_grades}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Attendance Record</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Attendance Rate</Label>
                  <p className="text-2xl font-bold text-teal-600">{student.attendance_record?.attendance_rate || 'N/A'}</p>
                </div>
                <div>
                  <Label>Present Days</Label>
                  <p className="text-2xl font-bold text-green-600">{student.attendance_record?.present_days || 0}</p>
                </div>
                <div>
                  <Label>Absent Days</Label>
                  <p className="text-2xl font-bold text-red-600">{student.attendance_record?.absent_days || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {student.risk_assessment && (
            <Card>
              <CardHeader>
                <CardTitle>Risk Assessment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Overall Risk Level:</span>
                    <Badge className={`${student.risk_assessment.overall_risk === 'high' ? 'bg-red-500' : student.risk_assessment.overall_risk === 'medium' ? 'bg-orange-500' : 'bg-green-500'} text-white text-lg px-4 py-1`}>
                      {student.risk_assessment.overall_risk}
                    </Badge>
                  </div>
                  {student.risk_assessment.intervention_needed && (
                    <Badge className="bg-red-100 text-red-700 w-full justify-center py-2">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Intervention Required
                    </Badge>
                  )}
                  {student.risk_assessment.recommended_actions && (
                    <div className="mt-4">
                      <Label>Recommended Actions:</Label>
                      <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                        {student.risk_assessment.recommended_actions.map((action: string, index: number) => (
                          <li key={index}>{action}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ComprehensiveAdvisorPortal;
