import React, { useState, useEffect } from 'react';
import { Users, Search, Award, AlertCircle, Home, User, FileText, Calendar, BarChart3, Scale, Mail, FileSpreadsheet, Menu, X, Filter, Plus, Eye, TrendingUp, TrendingDown, Download, UserX, Clock, CheckCircle, XCircle, Send, Loader2, Phone, MapPin, UserCheck, Activity, Target, Zap, Shield, Star, BookOpen, GraduationCap, ChevronDown, ChevronUp, RefreshCw, Trash2, Edit, FileDown, Printer, Share2 } from 'lucide-react';
import apiService from '@/app/services/apiService';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { motion, AnimatePresence } from 'motion/react';

interface Student {
  id: number;
  first_name: string;
  last_name: string;
  student_id: string;
  trade_code: string;
  trade_name?: string;
  level_number: number;
  level_suffix?: string;
  total_cases?: number;
  good_points?: number;
  bad_points?: number;
  phone?: string;
  parent_phone?: string;
  address?: string;
  status?: string;
  attendance_rate?: number;
  exam_average?: number;
}

interface DisciplineRecord {
  id: number;
  conduct_type: string;
  severity: string;
  description: string;
  created_at: string;
  action_taken?: string;
  recorded_by?: string;
}

interface LeaveRecord {
  id: number;
  leave_type: string;
  reason: string;
  start_time: string;
  end_time: string;
  status: string;
  approved_by?: string;
}

interface ExamRecord {
  id: number;
  subject: string;
  score: number;
  max_score: number;
  exam_date: string;
  grade: string;
}

const DODStudentsPage: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [trades, setTrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTrade, setSelectedTrade] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [studentHistory, setStudentHistory] = useState<DisciplineRecord[]>([]);
  const [leaveHistory, setLeaveHistory] = useState<LeaveRecord[]>([]);
  const [examHistory, setExamHistory] = useState<ExamRecord[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<Set<number>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [stats, setStats] = useState({ 
    total: 0, 
    withCases: 0, 
    goodBehavior: 0, 
    critical: 0,
    excellent: 0,
    active: 0,
    avgAttendance: 0,
    avgExamScore: 0
  });
  const [detailTab, setDetailTab] = useState<'overview' | 'discipline' | 'leave' | 'exams'>('overview');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [students]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [studentsRes, tradesRes] = await Promise.all([
        apiService.request('/discipline/students'),
        apiService.request('/management/trades')
      ]);
      
      if (studentsRes.success || studentsRes.students) {
        setStudents(studentsRes.students || studentsRes.users || []);
      }
      if (tradesRes) {
        setTrades(tradesRes || []);
      }
    } catch (error) {
      console.error('Ikosa:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const total = students.length;
    const withCases = students.filter(s => (s.total_cases || 0) > 0).length;
    const goodBehavior = students.filter(s => (s.good_points || 0) > 10).length;
    const critical = students.filter(s => (s.total_cases || 0) > 5).length;
    const excellent = students.filter(s => (s.exam_average || 0) >= 80).length;
    const active = students.filter(s => s.status === 'active').length;
    const avgAttendance = students.reduce((sum, s) => sum + (s.attendance_rate || 0), 0) / (total || 1);
    const avgExamScore = students.reduce((sum, s) => sum + (s.exam_average || 0), 0) / (total || 1);
    setStats({ total, withCases, goodBehavior, critical, excellent, active, avgAttendance, avgExamScore });
  };

  const viewStudentDetail = async (student: Student) => {
    setSelectedStudent(student);
    setDetailTab('overview');
    try {
      const [disciplineRes, leaveRes, examRes] = await Promise.all([
        apiService.request(`/discipline/student/${student.id}/history`),
        apiService.request(`/discipline/student/${student.id}/leaves`),
        apiService.request(`/discipline/student/${student.id}/exams`)
      ]);
      setStudentHistory(disciplineRes.records || []);
      setLeaveHistory(leaveRes.leaves || []);
      setExamHistory(examRes.exams || []);
    } catch (error) {
      console.error('Ikosa:', error);
      setStudentHistory([]);
      setLeaveHistory([]);
      setExamHistory([]);
    }
    setIsDetailModalOpen(true);
  };

  const toggleStudentSelection = (studentId: number) => {
    const newSelection = new Set(selectedStudents);
    if (newSelection.has(studentId)) {
      newSelection.delete(studentId);
    } else {
      newSelection.add(studentId);
    }
    setSelectedStudents(newSelection);
  };

  const selectAllFiltered = () => {
    if (selectedStudents.size === filteredStudents.length) {
      setSelectedStudents(new Set());
    } else {
      setSelectedStudents(new Set(filteredStudents.map(s => s.id)));
    }
  };

  const handleBulkExport = () => {
    const selected = students.filter(s => selectedStudents.has(s.id));
    const csv = [
      ['ID Umunyeshuri', 'Amazina', 'Umwuga', 'Urwego', 'Amakosa', 'Amanota Meza', 'Amanota Mabi', 'Telefoni', 'Aderesi'],
      ...selected.map(s => [
        s.student_id,
        `${s.first_name} ${s.last_name}`,
        s.trade_code,
        `${s.level_number}${s.level_suffix || ''}`,
        s.total_cases || 0,
        s.good_points || 0,
        s.bad_points || 0,
        s.phone || '-',
        s.address || '-'
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `abanyeshuri-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrintSelected = () => {
    const selected = students.filter(s => selectedStudents.has(s.id));
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    printWindow.document.write(`
      <html><head><title>Raporo y'Abanyeshuri</title>
      <style>
        body { font-family: Arial; padding: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background: #16a34a; color: white; }
        h1 { color: #16a34a; }
      </style></head><body>
      <h1>Raporo y'Abanyeshuri</h1>
      <p>Itariki: ${new Date().toLocaleDateString('rw-RW')}</p>
      <table>
        <tr><th>ID</th><th>Amazina</th><th>Umwuga</th><th>Urwego</th><th>Amakosa</th><th>Amanota</th></tr>
        ${selected.map(s => `
          <tr>
            <td>${s.student_id}</td>
            <td>${s.first_name} ${s.last_name}</td>
            <td>${s.trade_code}</td>
            <td>${s.level_number}${s.level_suffix || ''}</td>
            <td>${s.total_cases || 0}</td>
            <td>${s.good_points || 0}</td>
          </tr>
        `).join('')}
      </table>
      </body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const exportData = () => {
    const csv = [
      ['ID Umunyeshuri', 'Amazina', 'Umwuga', 'Urwego', 'Amakosa', 'Amanota Meza', 'Amanota Mabi', 'Imyitwarire %', 'Amanota %'],
      ...filteredStudents.map(s => [
        s.student_id,
        `${s.first_name} ${s.last_name}`,
        s.trade_code,
        `${s.level_number}${s.level_suffix || ''}`,
        s.total_cases || 0,
        s.good_points || 0,
        s.bad_points || 0,
        s.attendance_rate || 0,
        s.exam_average || 0
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `abanyeshuri-raporo-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredStudents = students.filter(s => {
    const fullName = `${s.first_name} ${s.last_name}`.toLowerCase();
    const matchesSearch = !searchTerm || 
      fullName.includes(searchTerm.toLowerCase()) ||
      s.student_id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTrade = selectedTrade === 'all' || !selectedTrade || s.trade_code === selectedTrade;
    const matchesLevel = selectedLevel === 'all' || !selectedLevel || s.level_number?.toString() === selectedLevel;
    
    const matchesSeverity = severityFilter === 'all' || 
      (severityFilter === 'none' && (s.total_cases || 0) === 0) ||
      (severityFilter === 'low' && (s.total_cases || 0) >= 1 && (s.total_cases || 0) <= 2) ||
      (severityFilter === 'medium' && (s.total_cases || 0) >= 3 && (s.total_cases || 0) <= 5) ||
      (severityFilter === 'high' && (s.total_cases || 0) > 5);
    
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    
    return matchesSearch && matchesTrade && matchesLevel && matchesSeverity && matchesStatus;
  }).sort((a, b) => {
    switch(sortBy) {
      case 'name': return `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`);
      case 'cases': return (b.total_cases || 0) - (a.total_cases || 0);
      case 'points': return (b.good_points || 0) - (a.good_points || 0);
      case 'attendance': return (b.attendance_rate || 0) - (a.attendance_rate || 0);
      case 'exams': return (b.exam_average || 0) - (a.exam_average || 0);
      default: return 0;
    }
  });

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-green-100">
      <div className="text-center">
        <Loader2 className="w-16 h-16 animate-spin text-green-600 mx-auto mb-4" />
        <p className="text-gray-600 font-medium">Gufungura Abanyeshuri...</p>
      </div>
    </div>;
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-green-100">
      <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden fixed top-20 left-4 z-50 p-2 bg-green-600 text-white rounded-lg shadow-lg">
        {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>
      {sidebarOpen && <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30 mt-16" onClick={() => setSidebarOpen(false)} />}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 w-64 transition-transform duration-300 ease-in-out mt-16`}>
        <div className="h-full bg-gradient-to-b from-green-600 via-yellow-500 to-green-600 overflow-y-auto shadow-2xl">
          <nav className="flex-1 px-3 py-4 space-y-2">
            {[
              { id: 'director-discipline-dashboard', label: 'Ikibaho', Icon: Home },
              { id: 'dod-profile', label: 'Umwirondoro', Icon: User },
              { id: 'dod-discipline', label: 'Amakosa', Icon: FileText },
              { id: 'dod-exams', label: 'Ibizamini', Icon: Calendar },
              { id: 'dod-students', label: 'Abanyeshuri', Icon: Users, active: true },
              { id: 'student-sheets', label: 'Imbonerahamwe', Icon: FileSpreadsheet },
              { id: 'dod-reports', label: 'Raporo', Icon: BarChart3 },
              { id: 'dod-punishments', label: 'Ibihano', Icon: Scale },
              { id: 'dod-parent-notifications', label: 'Ababyeyi', Icon: Mail }
            ].map(item => (
              <button key={item.id} onClick={() => { onNavigate(item.id); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${item.active ? 'bg-white text-green-700 shadow-lg scale-105 font-bold' : 'text-white hover:bg-white/20 hover:scale-105'}`}>
                <item.Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>
      <div className="lg:pl-64 flex-1 pt-16">
        <div className="p-4 md:p-6">
          <div className="mb-6">
            <button onClick={() => onNavigate('director-discipline-dashboard')} className="mb-4 text-green-600 hover:text-green-700 font-medium flex items-center gap-2">
              ← Gusubira Ahabanza
            </button>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 flex items-center gap-3">
                <Users className="w-10 h-10 text-green-600" />
                Gucunga Abanyeshuri
              </h1>
              <Button onClick={loadData} className="bg-green-600 hover:bg-green-700">
                <RefreshCw className="w-4 h-4 mr-2" />
                Kuvugurura
              </Button>
            </div>
          </div>

          {/* Enhanced Statistics Dashboard */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4 mb-6">
            <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-4 text-white">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-7 h-7 opacity-80" />
                <TrendingUp className="w-4 h-4" />
              </div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs opacity-90">Abanyeshuri Bose</p>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-4 text-white">
              <div className="flex items-center justify-between mb-2">
                <UserCheck className="w-7 h-7 opacity-80" />
                <CheckCircle className="w-4 h-4" />
              </div>
              <p className="text-2xl font-bold">{stats.active}</p>
              <p className="text-xs opacity-90">Bakora Neza</p>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-4 text-white">
              <div className="flex items-center justify-between mb-2">
                <AlertCircle className="w-7 h-7 opacity-80" />
                <TrendingDown className="w-4 h-4" />
              </div>
              <p className="text-2xl font-bold">{stats.withCases}</p>
              <p className="text-xs opacity-90">Bafite Amakosa</p>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg p-4 text-white">
              <div className="flex items-center justify-between mb-2">
                <Award className="w-7 h-7 opacity-80" />
                <Star className="w-4 h-4" />
              </div>
              <p className="text-2xl font-bold">{stats.goodBehavior}</p>
              <p className="text-xs opacity-90">Imyitwarire Myiza</p>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-4 text-white">
              <div className="flex items-center justify-between mb-2">
                <XCircle className="w-7 h-7 opacity-80" />
                <Shield className="w-4 h-4" />
              </div>
              <p className="text-2xl font-bold">{stats.critical}</p>
              <p className="text-xs opacity-90">Amakosa Menshi</p>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-4 text-white">
              <div className="flex items-center justify-between mb-2">
                <GraduationCap className="w-7 h-7 opacity-80" />
                <Zap className="w-4 h-4" />
              </div>
              <p className="text-2xl font-bold">{stats.excellent}</p>
              <p className="text-xs opacity-90">Amanota Meza</p>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl shadow-lg p-4 text-white">
              <div className="flex items-center justify-between mb-2">
                <Activity className="w-7 h-7 opacity-80" />
                <Target className="w-4 h-4" />
              </div>
              <p className="text-2xl font-bold">{stats.avgAttendance.toFixed(0)}%</p>
              <p className="text-xs opacity-90">Kwitabira</p>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl shadow-lg p-4 text-white">
              <div className="flex items-center justify-between mb-2">
                <BookOpen className="w-7 h-7 opacity-80" />
                <Star className="w-4 h-4" />
              </div>
              <p className="text-2xl font-bold">{stats.avgExamScore.toFixed(0)}%</p>
              <p className="text-xs opacity-90">Amanota</p>
            </motion.div>
          </div>

          {/* Advanced Filters */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Filter className="w-5 h-5 text-green-600" />
                Gushakisha no Gushungura
              </h2>
              <div className="flex gap-2">
                <Button 
                  variant={viewMode === 'grid' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className={viewMode === 'grid' ? 'bg-green-600' : ''}
                >
                  Grid
                </Button>
                <Button 
                  variant={viewMode === 'list' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className={viewMode === 'list' ? 'bg-green-600' : ''}
                >
                  List
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Shakisha amazina, ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              
              <Select value={selectedTrade} onValueChange={setSelectedTrade}>
                <SelectTrigger>
                  <SelectValue placeholder="Hitamo Umwuga" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Imyuga Yose</SelectItem>
                  {trades.map(trade => (
                    <SelectItem key={trade.code} value={trade.code}>
                      {trade.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Hitamo Urwego" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Inzego Zose</SelectItem>
                  {[1, 2, 3, 4].map(level => (
                    <SelectItem key={level} value={level.toString()}>
                      Level {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Urwego rw'Amakosa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Byose</SelectItem>
                  <SelectItem value="none">Nta Makosa</SelectItem>
                  <SelectItem value="low">Byo Hasi (1-2)</SelectItem>
                  <SelectItem value="medium">Hagati (3-5)</SelectItem>
                  <SelectItem value="high">Hejuru (5+)</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Gushungura" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Amazina</SelectItem>
                  <SelectItem value="cases">Amakosa</SelectItem>
                  <SelectItem value="points">Amanota</SelectItem>
                  <SelectItem value="attendance">Kwitabira</SelectItem>
                  <SelectItem value="exams">Ibizamini</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="w-4 h-4" />
                  <span className="font-medium">{filteredStudents.length}</span> kuri <span className="font-medium">{students.length}</span> abanyeshuri
                </div>
                {selectedStudents.size > 0 && (
                  <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                    <CheckCircle className="w-4 h-4" />
                    {selectedStudents.size} byatoranijwe
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                {selectedStudents.size > 0 && (
                  <>
                    <Button onClick={handleBulkExport} size="sm" className="bg-blue-600 hover:bg-blue-700">
                      <Download className="w-4 h-4 mr-2" />
                      Export ({selectedStudents.size})
                    </Button>
                    <Button onClick={handlePrintSelected} size="sm" className="bg-purple-600 hover:bg-purple-700">
                      <Printer className="w-4 h-4 mr-2" />
                      Print
                    </Button>
                    <Button onClick={() => setSelectedStudents(new Set())} size="sm" variant="outline">
                      <X className="w-4 h-4 mr-2" />
                      Kureka
                    </Button>
                  </>
                )}
                <Button onClick={exportData} size="sm" className="bg-green-600 hover:bg-green-700">
                  <FileDown className="w-4 h-4 mr-2" />
                  Export Byose
                </Button>
              </div>
            </div>

            {filteredStudents.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <Button 
                  onClick={selectAllFiltered} 
                  size="sm" 
                  variant="outline"
                  className="text-green-600 border-green-600 hover:bg-green-50"
                >
                  {selectedStudents.size === filteredStudents.length ? (
                    <><XCircle className="w-4 h-4 mr-2" /> Kureka Byose</>
                  ) : (
                    <><CheckCircle className="w-4 h-4 mr-2" /> Guhitamo Byose</>
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Student Cards/List */}
          {filteredStudents.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Nta Banyeshuri Babonetse</h3>
              <p className="text-gray-600">Gerageza guhindura ibyo washakishije cyangwa filter</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredStudents.map((student) => (
                <motion.div 
                  key={student.id} 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -5 }}
                  className={`bg-white rounded-xl shadow-lg p-5 hover:shadow-2xl transition-all cursor-pointer border-2 ${
                    selectedStudents.has(student.id) ? 'border-green-500 bg-green-50' : 'border-transparent'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3 flex-1" onClick={() => viewStudentDetail(student)}>
                      <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                        {student.first_name?.charAt(0)}{student.last_name?.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 truncate">{student.first_name} {student.last_name}</h3>
                        <p className="text-sm text-gray-600">{student.student_id}</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={selectedStudents.has(student.id)}
                      onChange={() => toggleStudentSelection(student.id)}
                      className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                    />
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 flex items-center gap-1">
                        <GraduationCap className="w-4 h-4" />
                        Umwuga:
                      </span>
                      <span className="font-bold text-gray-900">{student.trade_code} L{student.level_number}</span>
                    </div>
                    
                    {student.phone && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          Telefoni:
                        </span>
                        <span className="font-medium text-gray-900">{student.phone}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <div className="bg-green-50 p-2 rounded-lg text-center">
                        <Award className="w-4 h-4 text-green-600 mx-auto mb-1" />
                        <p className="text-lg font-bold text-green-600">{student.good_points || 0}</p>
                        <p className="text-xs text-gray-600">Amanota</p>
                      </div>
                      <div className="bg-red-50 p-2 rounded-lg text-center">
                        <AlertCircle className="w-4 h-4 text-red-600 mx-auto mb-1" />
                        <p className="text-lg font-bold text-red-600">{student.total_cases || 0}</p>
                        <p className="text-xs text-gray-600">Amakosa</p>
                      </div>
                    </div>

                    {(student.attendance_rate || student.exam_average) && (
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {student.attendance_rate && (
                          <div className="bg-blue-50 p-2 rounded-lg text-center">
                            <Activity className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                            <p className="text-sm font-bold text-blue-600">{student.attendance_rate}%</p>
                            <p className="text-xs text-gray-600">Kwitabira</p>
                          </div>
                        )}
                        {student.exam_average && (
                          <div className="bg-purple-50 p-2 rounded-lg text-center">
                            <BookOpen className="w-4 h-4 text-purple-600 mx-auto mb-1" />
                            <p className="text-sm font-bold text-purple-600">{student.exam_average}%</p>
                            <p className="text-xs text-gray-600">Amanota</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={() => viewStudentDetail(student)}
                    className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Reba Byose
                  </Button>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
                    <tr>
                      <th className="px-4 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={selectedStudents.size === filteredStudents.length && filteredStudents.length > 0}
                          onChange={selectAllFiltered}
                          className="w-5 h-5 rounded"
                        />
                      </th>
                      <th className="px-4 py-3 text-left">ID</th>
                      <th className="px-4 py-3 text-left">Amazina</th>
                      <th className="px-4 py-3 text-left">Umwuga</th>
                      <th className="px-4 py-3 text-left">Urwego</th>
                      <th className="px-4 py-3 text-center">Amanota</th>
                      <th className="px-4 py-3 text-center">Amakosa</th>
                      <th className="px-4 py-3 text-center">Kwitabira</th>
                      <th className="px-4 py-3 text-center">Ibizamini</th>
                      <th className="px-4 py-3 text-center">Ibikorwa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredStudents.map((student, idx) => (
                      <motion.tr 
                        key={student.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.02 }}
                        className={`hover:bg-gray-50 transition ${
                          selectedStudents.has(student.id) ? 'bg-green-50' : ''
                        }`}
                      >
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedStudents.has(student.id)}
                            onChange={() => toggleStudentSelection(student.id)}
                            className="w-5 h-5 text-green-600 rounded"
                          />
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-900">{student.student_id}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                              {student.first_name?.charAt(0)}{student.last_name?.charAt(0)}
                            </div>
                            <span className="font-medium text-gray-900">{student.first_name} {student.last_name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-700">{student.trade_code}</td>
                        <td className="px-4 py-3 text-gray-700">Level {student.level_number}{student.level_suffix || ''}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold">
                            <Award className="w-3 h-3" />
                            {student.good_points || 0}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm font-bold ${
                            (student.total_cases || 0) === 0 ? 'bg-gray-100 text-gray-600' :
                            (student.total_cases || 0) <= 2 ? 'bg-yellow-100 text-yellow-700' :
                            (student.total_cases || 0) <= 5 ? 'bg-orange-100 text-orange-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            <AlertCircle className="w-3 h-3" />
                            {student.total_cases || 0}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {student.attendance_rate ? (
                            <span className="text-sm font-medium text-gray-700">{student.attendance_rate}%</span>
                          ) : '-'}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {student.exam_average ? (
                            <span className={`text-sm font-bold ${
                              student.exam_average >= 80 ? 'text-green-600' :
                              student.exam_average >= 60 ? 'text-blue-600' :
                              student.exam_average >= 40 ? 'text-orange-600' :
                              'text-red-600'
                            }`}>{student.exam_average}%</span>
                          ) : '-'}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Button
                            onClick={() => viewStudentDetail(student)}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

      {/* Enhanced Student Detail Modal */}
      <AnimatePresence>
        {isDetailModalOpen && selectedStudent && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsDetailModalOpen(false)} className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl relative z-10 max-h-[90vh] overflow-hidden flex flex-col">
              <div className="bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 p-6 text-white">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                      {selectedStudent.first_name?.charAt(0)}{selectedStudent.last_name?.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">{selectedStudent.first_name} {selectedStudent.last_name}</h2>
                      <p className="text-white/90">{selectedStudent.student_id} • {selectedStudent.trade_code} Level {selectedStudent.level_number}{selectedStudent.level_suffix}</p>
                      {selectedStudent.phone && (
                        <p className="text-white/80 text-sm flex items-center gap-1 mt-1">
                          <Phone className="w-3 h-3" /> {selectedStudent.phone}
                        </p>
                      )}
                    </div>
                  </div>
                  <button onClick={() => setIsDetailModalOpen(false)} className="text-white hover:bg-white/20 p-2 rounded-lg transition">
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="flex border-b bg-gray-50">
                {[
                  { id: 'overview', label: 'Incamake', icon: Eye },
                  { id: 'discipline', label: 'Amakosa', icon: AlertCircle },
                  { id: 'leave', label: 'Uruhushya', icon: Clock },
                  { id: 'exams', label: 'Ibizamini', icon: BookOpen }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setDetailTab(tab.id as any)}
                    className={`flex-1 px-4 py-3 font-medium transition flex items-center justify-center gap-2 ${
                      detailTab === tab.id ? 'bg-white text-green-600 border-b-2 border-green-600' : 'text-gray-600 hover:bg-white/50'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {detailTab === 'overview' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl text-center border border-green-200">
                        <Award className="w-8 h-8 text-green-600 mx-auto mb-2" />
                        <p className="text-3xl font-bold text-green-600">{selectedStudent.good_points || 0}</p>
                        <p className="text-xs text-gray-600 font-medium">Amanota Meza</p>
                      </div>
                      <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-xl text-center border border-red-200">
                        <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                        <p className="text-3xl font-bold text-red-600">{selectedStudent.total_cases || 0}</p>
                        <p className="text-xs text-gray-600 font-medium">Amakosa</p>
                      </div>
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl text-center border border-blue-200">
                        <Activity className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                        <p className="text-3xl font-bold text-blue-600">{selectedStudent.attendance_rate || 0}%</p>
                        <p className="text-xs text-gray-600 font-medium">Kwitabira</p>
                      </div>
                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl text-center border border-purple-200">
                        <BookOpen className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                        <p className="text-3xl font-bold text-purple-600">{selectedStudent.exam_average || 0}%</p>
                        <p className="text-xs text-gray-600 font-medium">Amanota</p>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl border border-green-200">
                      <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-gray-900">
                        <User className="w-5 h-5 text-green-600" />
                        Amakuru Yombi
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Amazina Yombi</p>
                          <p className="font-bold text-gray-900">{selectedStudent.first_name} {selectedStudent.last_name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">ID Umunyeshuri</p>
                          <p className="font-bold text-gray-900">{selectedStudent.student_id}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Umwuga</p>
                          <p className="font-bold text-gray-900">{selectedStudent.trade_code} - {selectedStudent.trade_name || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Urwego</p>
                          <p className="font-bold text-gray-900">Level {selectedStudent.level_number}{selectedStudent.level_suffix || ''}</p>
                        </div>
                        {selectedStudent.phone && (
                          <div>
                            <p className="text-sm text-gray-600 mb-1">Telefoni</p>
                            <p className="font-bold text-gray-900 flex items-center gap-2">
                              <Phone className="w-4 h-4 text-green-600" />
                              {selectedStudent.phone}
                            </p>
                          </div>
                        )}
                        {selectedStudent.parent_phone && (
                          <div>
                            <p className="text-sm text-gray-600 mb-1">Telefoni y'Umubyeyi</p>
                            <p className="font-bold text-gray-900 flex items-center gap-2">
                              <Phone className="w-4 h-4 text-blue-600" />
                              {selectedStudent.parent_phone}
                            </p>
                          </div>
                        )}
                        {selectedStudent.address && (
                          <div className="md:col-span-2">
                            <p className="text-sm text-gray-600 mb-1">Aderesi</p>
                            <p className="font-bold text-gray-900 flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-red-600" />
                              {selectedStudent.address}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                      <div className="flex items-center gap-3">
                        <Target className="w-6 h-6 text-yellow-600" />
                        <div>
                          <p className="font-bold text-gray-900">Imyitwarire Score</p>
                          <p className="text-2xl font-bold text-yellow-600">{Math.max(0, 100 - (selectedStudent.total_cases || 0) * 5)}%</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {detailTab === 'discipline' && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-lg flex items-center gap-2">
                        <FileText className="w-5 h-5 text-red-600" />
                        Amateka y'Amakosa ({studentHistory.length})
                      </h3>
                    </div>
                    <div className="space-y-3">
                      {studentHistory.length === 0 ? (
                        <div className="text-center py-12">
                          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                          <p className="text-gray-500 font-medium">Nta makosa yakoze!</p>
                          <p className="text-sm text-gray-400">Umunyeshuri afite imyitwarire myiza</p>
                        </div>
                      ) : (
                        studentHistory.map((record) => (
                          <motion.div 
                            key={record.id} 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-gradient-to-r from-red-50 to-orange-50 p-4 rounded-xl border-l-4 border-red-500"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-bold text-gray-900">{record.conduct_type}</span>
                                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                    record.severity === 'critical' ? 'bg-red-500 text-white' :
                                    record.severity === 'high' ? 'bg-orange-500 text-white' :
                                    record.severity === 'medium' ? 'bg-yellow-500 text-white' :
                                    'bg-blue-500 text-white'
                                  }`}>{record.severity}</span>
                                </div>
                                <p className="text-sm text-gray-700 mb-2">{record.description}</p>
                                {record.action_taken && (
                                  <p className="text-xs text-gray-600 bg-white/50 p-2 rounded">
                                    <strong>Igikorwa:</strong> {record.action_taken}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                              <span>{new Date(record.created_at).toLocaleDateString('rw-RW', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                              {record.recorded_by && <span>Na: {record.recorded_by}</span>}
                            </div>
                          </motion.div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {detailTab === 'leave' && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-lg flex items-center gap-2">
                        <Clock className="w-5 h-5 text-orange-600" />
                        Amateka y'Uruhushya ({leaveHistory.length})
                      </h3>
                    </div>
                    <div className="space-y-3">
                      {leaveHistory.length === 0 ? (
                        <div className="text-center py-12">
                          <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500 font-medium">Nta ruhushya</p>
                        </div>
                      ) : (
                        leaveHistory.map((leave) => (
                          <motion.div 
                            key={leave.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-gradient-to-r from-orange-50 to-yellow-50 p-4 rounded-xl border-l-4 border-orange-500"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-bold text-gray-900">{leave.leave_type}</span>
                                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                    leave.status === 'approved' ? 'bg-green-500 text-white' :
                                    leave.status === 'pending' ? 'bg-yellow-500 text-white' :
                                    'bg-red-500 text-white'
                                  }`}>{leave.status}</span>
                                </div>
                                <p className="text-sm text-gray-700 mb-2">{leave.reason}</p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                              <span>{new Date(leave.start_time).toLocaleDateString('rw-RW')} - {new Date(leave.end_time).toLocaleDateString('rw-RW')}</span>
                              {leave.approved_by && <span>Yemejwe na: {leave.approved_by}</span>}
                            </div>
                          </motion.div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {detailTab === 'exams' && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-lg flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-purple-600" />
                        Amateka y'Ibizamini ({examHistory.length})
                      </h3>
                    </div>
                    <div className="space-y-3">
                      {examHistory.length === 0 ? (
                        <div className="text-center py-12">
                          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500 font-medium">Nta bizamini</p>
                        </div>
                      ) : (
                        examHistory.map((exam) => (
                          <motion.div 
                            key={exam.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-xl border-l-4 border-purple-500"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <p className="font-bold text-gray-900 mb-1">{exam.subject}</p>
                                <p className="text-sm text-gray-600">{new Date(exam.exam_date).toLocaleDateString('rw-RW')}</p>
                              </div>
                              <div className="text-right">
                                <p className={`text-2xl font-bold ${
                                  (exam.score / exam.max_score * 100) >= 80 ? 'text-green-600' :
                                  (exam.score / exam.max_score * 100) >= 60 ? 'text-blue-600' :
                                  (exam.score / exam.max_score * 100) >= 40 ? 'text-orange-600' :
                                  'text-red-600'
                                }`}>{exam.score}/{exam.max_score}</p>
                                <p className="text-xs text-gray-600">{exam.grade}</p>
                              </div>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t p-4 bg-gray-50 flex gap-3">
                <Button onClick={() => setIsDetailModalOpen(false)} variant="outline" className="flex-1">
                  Funga
                </Button>
                <Button onClick={() => {
                  const data = {
                    student: selectedStudent,
                    discipline: studentHistory,
                    leave: leaveHistory,
                    exams: examHistory
                  };
                  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${selectedStudent.student_id}-raporo.json`;
                  a.click();
                }} className="flex-1 bg-green-600 hover:bg-green-700">
                  <Download className="w-4 h-4 mr-2" />
                  Export Raporo
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

        </div>
      </div>
    </div>
  );
};

export default DODStudentsPage;
