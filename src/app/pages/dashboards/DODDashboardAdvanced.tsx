import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/app/config/apiBase';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, AlertTriangle, Ban, Mail, MessageSquare, UserCheck, 
  Search, Filter, Download, RefreshCw, CheckCircle, XCircle,
  Phone, Eye, Edit, Trash2, BarChart3, TrendingUp, Award,
  Calendar, Clock, FileText, Send, History, Bell, Star,
  Target, Activity, Zap, Shield, BookOpen, Briefcase
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';

interface Student {
  id: number;
  student_id: string;
  first_name: string;
  last_name: string;
  trade_code: string;
  level_number: number;
  phone?: string;
  parent_phone?: string;
  conduct_score?: number;
  conduct_grade?: string;
  attendance_percentage?: number;
  total_incidents?: number;
  status: string;
}

interface DODDashboardAdvancedProps {
  onNavigate: (page: string) => void;
}

interface Trade {
  trade_id: string;
  trade_code: string;
  trade_name: string;
  description: string;
}

interface Level {
  level_number: number;
  level_suffix: string;
  level_name: string;
}

const DODDashboardAdvanced: React.FC<DODDashboardAdvancedProps> = ({ onNavigate }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTrade, setFilterTrade] = useState('all');
  const [filterLevel, setFilterLevel] = useState('all');
  const [filterConduct, setFilterConduct] = useState('all');
  const [availableTrades, setAvailableTrades] = useState<Trade[]>([]);
  const [availableLevels, setAvailableLevels] = useState<Level[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [showConductModal, setShowConductModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showBulkActionsModal, setShowBulkActionsModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentHistory, setStudentHistory] = useState<any>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [processing, setProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const [conductForm, setConductForm] = useState({
    conduct_type: 'warning',
    severity: 'medium',
    description: '',
    action_taken: ''
  });

  const [leaveForm, setLeaveForm] = useState({
    leave_type: 'sick',
    reason: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    approved_by_name: ''
  });

  const [scheduleForm, setScheduleForm] = useState({
    meeting_type: 'counseling',
    date: '',
    time: '',
    location: '',
    notes: ''
  });

  const [bulkAction, setBulkAction] = useState({
    action_type: 'message',
    data: {}
  });

  const [messageForm, setMessageForm] = useState({
    subject: '',
    message: '',
    send_via: 'sms'
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    filterStudentsList();
  }, [students, searchQuery, filterTrade, filterLevel, filterConduct]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Fetch students, trades, and levels in parallel
      const [studentsRes, tradesRes, levelsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/global-student-management/students?limit=1000`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_BASE_URL}/trades`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_BASE_URL}/levels`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);
      
      const studentsData = await studentsRes.json();
      const tradesData = await tradesRes.json();
      const levelsData = await levelsRes.json();
      
      if (studentsData.success) {
        // Map the data to match expected format
        const mappedStudents = (studentsData.students || []).map(s => ({
          ...s,
          trade_code: s.current_trade || s.trade_code || '',
          level_number: s.current_level || s.level_number || 1,
          conduct_score: s.conduct_score || 40,
          attendance_percentage: s.overall_attendance_percentage || s.attendance_percentage || 100
        }));
        setStudents(mappedStudents);
      }
      
      if (tradesData.success) {
        setAvailableTrades(tradesData.trades || []);
      }
      
      if (levelsData.success) {
        setAvailableLevels(levelsData.levels || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };

  const filterStudentsList = () => {
    let filtered = [...students];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(s => 
        s.first_name?.toLowerCase().includes(query) ||
        s.last_name?.toLowerCase().includes(query) ||
        s.student_id?.toLowerCase().includes(query) ||
        s.trade_code?.toLowerCase().includes(query)
      );
    }

    if (filterTrade !== 'all') {
      filtered = filtered.filter(s => s.trade_code === filterTrade);
    }

    if (filterLevel !== 'all') {
      filtered = filtered.filter(s => s.level_number === parseInt(filterLevel));
    }

    if (filterConduct !== 'all') {
      if (filterConduct === 'poor') {
        filtered = filtered.filter(s => (s.conduct_score || 40) < 24);
      } else if (filterConduct === 'average') {
        filtered = filtered.filter(s => (s.conduct_score || 40) >= 24 && (s.conduct_score || 40) < 32);
      } else if (filterConduct === 'good') {
        filtered = filtered.filter(s => (s.conduct_score || 40) >= 32);
      }
    }

    setFilteredStudents(filtered);
  };

  const handleRemoveConduct = async () => {
    if (!selectedStudent || !conductForm.description) {
      alert('Uzuza ibisabwa byose');
      return;
    }

    try {
      setProcessing(true);
      const token = localStorage.getItem('token');
      const pointsDeducted = conductForm.severity === 'high' ? 10 : conductForm.severity === 'medium' ? 5 : 2;
      const newScore = Math.max(0, (selectedStudent.conduct_score || 40) - pointsDeducted);
      
      const res = await fetch(`${API_BASE_URL}/dod-advanced/conduct/remove`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          student_id: selectedStudent.id,
          conduct_type: conductForm.conduct_type,
          severity: conductForm.severity,
          description: conductForm.description,
          action_taken: conductForm.action_taken,
          conduct_points_deducted: pointsDeducted,
          new_conduct_score: newScore,
          removed_by_name: localStorage.getItem('userName') || 'DOD'
        })
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMessage('Imyitwarire yarakuweho neza! Ababyeyi baramenyeshejwe.');
        setShowConductModal(false);
        setConductForm({ conduct_type: 'warning', severity: 'medium', description: '', action_taken: '' });
        setSelectedStudent(null);
        fetchStudents();
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        alert(data.message || 'Byanze gukuraho imyitwarire');
      }
    } catch (error) {
      alert('Byanze gukuraho imyitwarire');
    } finally {
      setProcessing(false);
    }
  };

  const handleGrantLeave = async () => {
    if (!selectedStudent || !leaveForm.reason) {
      alert('Uzuza ibisabwa byose');
      return;
    }

    try {
      setProcessing(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/dod-advanced/leave/add`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          student_id: selectedStudent.id,
          leave_type: leaveForm.leave_type,
          reason: leaveForm.reason,
          start_time: leaveForm.start_date,
          end_time: leaveForm.end_date || leaveForm.start_date,
          approved_by_name: leaveForm.approved_by_name || localStorage.getItem('userName') || 'DOD'
        })
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMessage('Uruhushya rwatanzwe neza! Ababyeyi baramenyeshejwe.');
        setShowLeaveModal(false);
        setLeaveForm({ leave_type: 'sick', reason: '', start_date: new Date().toISOString().split('T')[0], end_date: '', approved_by_name: '' });
        setSelectedStudent(null);
        fetchStudents();
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        alert(data.message || 'Byanze gutanga uruhushya');
      }
    } catch (error) {
      alert('Byanze gutanga uruhushya');
    } finally {
      setProcessing(false);
    }
  };

  const handleSendMessage = async () => {
    if (!messageForm.subject || !messageForm.message) {
      alert('Uzuza ibisabwa byose');
      return;
    }

    const studentIds = selectedStudent ? [selectedStudent.id] : selectedStudents;
    if (studentIds.length === 0) {
      alert('Hitamo abanyeshuri');
      return;
    }

    try {
      setProcessing(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/dod-advanced/message-parents`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subject: messageForm.subject,
          message: messageForm.message,
          send_via: messageForm.send_via,
          student_ids: studentIds
        })
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMessage(`Ubutumwa bwoherejwe ku banyeshuri ${data.count}!`);
        setShowMessageModal(false);
        setMessageForm({ subject: '', message: '', send_via: 'sms' });
        setSelectedStudent(null);
        setSelectedStudents([]);
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        alert(data.message || 'Byanze kohereza ubutumwa');
      }
    } catch (error) {
      alert('Byanze kohereza ubutumwa');
    } finally {
      setProcessing(false);
    }
  };

  const fetchStudentHistory = async (studentId: number) => {
    try {
      setProcessing(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/dod-advanced/student/${studentId}/history`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setStudentHistory(data);
        setShowHistoryModal(true);
      } else {
        alert('Failed to fetch history');
      }
    } catch (error) {
      alert('Failed to fetch history');
    } finally {
      setProcessing(false);
    }
  };

  const handleScheduleMeeting = async () => {
    if (!selectedStudent || !scheduleForm.date || !scheduleForm.time) {
      alert('Fill all required fields');
      return;
    }

    try {
      setProcessing(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/dod-advanced/schedule-meeting`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          student_id: selectedStudent.id,
          ...scheduleForm
        })
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMessage('Meeting scheduled and parent notified!');
        setShowScheduleModal(false);
        setScheduleForm({ meeting_type: 'counseling', date: '', time: '', location: '', notes: '' });
        setSelectedStudent(null);
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        alert(data.message || 'Failed to schedule meeting');
      }
    } catch (error) {
      alert('Failed to schedule meeting');
    } finally {
      setProcessing(false);
    }
  };

  const handleBulkAction = async () => {
    if (selectedStudents.length === 0) {
      alert('Select students first');
      return;
    }

    try {
      setProcessing(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/dod-advanced/bulk-action`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          student_ids: selectedStudents,
          action_type: bulkAction.action_type,
          data: bulkAction.data
        })
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMessage(`Bulk action completed for ${data.count} students!`);
        setShowBulkActionsModal(false);
        setSelectedStudents([]);
        fetchStudents();
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        alert(data.message || 'Bulk action failed');
      }
    } catch (error) {
      alert('Bulk action failed');
    } finally {
      setProcessing(false);
    }
  };

  const generateCSV = (data: Student[]) => {
    const headers = ['ID', 'Name', 'Trade', 'Level', 'Conduct', 'Attendance', 'Status'];
    const rows = data.map(s => [
      s.student_id,
      `${s.first_name} ${s.last_name}`,
      s.trade_code,
      s.level_number,
      `${s.conduct_score}/40`,
      `${s.attendance_percentage}%`,
      s.status
    ]);
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const downloadCSV = (csv: string, filename: string) => {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  };

  const toggleStudentSelection = (studentId: number) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const selectAllFiltered = () => {
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredStudents.map(s => s.id));
    }
  };

  const trades = [...new Set(students.map(s => s.trade_code).filter(Boolean))];
  const levels = [...new Set(students.map(s => s.level_number).filter(Boolean))];

  const stats = {
    total: students.length,
    poorConduct: students.filter(s => (s.conduct_score || 40) < 24).length,
    poorAttendance: students.filter(s => (s.attendance_percentage || 100) < 70).length,
    incidents: students.reduce((sum, s) => sum + (s.total_incidents || 0), 0)
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3"
          >
            <CheckCircle className="w-6 h-6" />
            {successMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black text-gray-900">DOD Dashboard</h1>
              <p className="text-gray-600 mt-2">Director of Discipline - Global Student Management</p>
            </div>
            <div className="flex gap-3">
              <Button onClick={fetchStudents} variant="outline" className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
              <Button className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600">
                <Download className="w-4 h-4" />
                Export
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { title: 'Total Students', value: stats.total, icon: Users, color: 'from-blue-500 to-indigo-500' },
            { title: 'Poor Conduct', value: stats.poorConduct, icon: AlertTriangle, color: 'from-red-500 to-orange-500' },
            { title: 'Poor Attendance', value: stats.poorAttendance, icon: XCircle, color: 'from-yellow-500 to-amber-500' },
            { title: 'Total Incidents', value: stats.incidents, icon: Ban, color: 'from-purple-500 to-pink-500' }
          ].map((stat, idx) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="overflow-hidden hover:shadow-xl transition-all">
                <CardContent className="p-0">
                  <div className={`bg-gradient-to-br ${stat.color} p-6 text-white`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-white/90 text-sm mb-2">{stat.title}</p>
                        <p className="text-4xl font-black">{stat.value}</p>
                      </div>
                      <stat.icon className="w-12 h-12 opacity-90" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Filters & Actions */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search students..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterTrade} onValueChange={setFilterTrade}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Trades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Trades</SelectItem>
                  {availableTrades.map((trade) => (
                    <SelectItem key={trade.trade_code} value={trade.trade_code}>
                      {trade.trade_name || trade.trade_code}
                    </SelectItem>
                  ))}
                  {/* Also add trades from students data as fallback */}
                  {[...new Set(students.map(s => s.trade_code).filter(Boolean))].map((tradeCode) => (
                    <SelectItem key={tradeCode} value={tradeCode}>
                      {tradeCode}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterLevel} onValueChange={setFilterLevel}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="All Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  {availableLevels.map((level) => (
                    <SelectItem key={level.level_number} value={level.level_number.toString()}>
                      {level.level_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterConduct} onValueChange={setFilterConduct}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="All Conduct" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Conduct</SelectItem>
                  <SelectItem value="good">Good (≥32/40)</SelectItem>
                  <SelectItem value="average">Average (24-31/40)</SelectItem>
                  <SelectItem value="poor">Poor (&lt;24/40)</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={() => {
                  setSearchQuery('');
                  setFilterTrade('all');
                  setFilterLevel('all');
                  setFilterConduct('all');
                }}
                variant="outline"
              >
                Clear Filters
              </Button>
            </div>

            {selectedStudents.length > 0 && (
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                <span className="font-semibold">{selectedStudents.length} selected</span>
                <Button
                  size="sm"
                  onClick={() => setShowMessageModal(true)}
                  className="bg-blue-600"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Message Parents
                </Button>
                <Button
                  size="sm"
                  onClick={() => setShowBulkActionsModal(true)}
                  className="bg-purple-600"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Bulk Actions
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    const csv = generateCSV(students.filter(s => selectedStudents.includes(s.id)));
                    downloadCSV(csv, 'selected-students.csv');
                  }}
                  className="bg-green-600"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
                <Button
                  size="sm"
                  onClick={() => setSelectedStudents([])}
                  variant="outline"
                >
                  Clear Selection
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Students Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Students ({filteredStudents.length})</CardTitle>
              <Button size="sm" onClick={selectAllFiltered} variant="outline">
                {selectedStudents.length === filteredStudents.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <RefreshCw className="w-12 h-12 mx-auto text-gray-400 animate-spin mb-4" />
                <p className="text-gray-500">Loading students...</p>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 font-semibold">No students found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <input
                          type="checkbox"
                          checked={selectedStudents.length === filteredStudents.length}
                          onChange={selectAllFiltered}
                          className="w-4 h-4"
                        />
                      </TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Trade</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Conduct</TableHead>
                      <TableHead>Attendance</TableHead>
                      <TableHead>Incidents</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow key={student.id} className="hover:bg-blue-50">
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedStudents.includes(student.id)}
                            onChange={() => toggleStudentSelection(student.id)}
                            className="w-4 h-4"
                          />
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-bold text-gray-900">
                              {student.first_name} {student.last_name}
                            </p>
                            <p className="text-xs text-gray-500">{student.student_id}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-blue-500 text-white">{student.trade_code}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-purple-500 text-white">Level {student.level_number}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              (student.conduct_score || 40) >= 32
                                ? 'bg-green-500 text-white'
                                : (student.conduct_score || 40) >= 24
                                ? 'bg-yellow-500 text-white'
                                : 'bg-red-500 text-white'
                            }
                          >
                            {student.conduct_score || 40}/40
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              (student.attendance_percentage || 100) >= 90
                                ? 'bg-green-500 text-white'
                                : (student.attendance_percentage || 100) >= 70
                                ? 'bg-yellow-500 text-white'
                                : 'bg-red-500 text-white'
                            }
                          >
                            {student.attendance_percentage || 100}%
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold">{student.total_incidents || 0}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(`/student-report/${student.id}`, '_blank')}
                              title="View Report"
                            >
                              <Eye className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              className="bg-orange-500 hover:bg-orange-600"
                              onClick={() => {
                                setSelectedStudent(student);
                                fetchStudentHistory(student.id);
                              }}
                              title="View History"
                            >
                              <History className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              className="bg-red-500 hover:bg-red-600"
                              onClick={() => {
                                setSelectedStudent(student);
                                setShowConductModal(true);
                              }}
                              title="Remove Conduct"
                            >
                              <Ban className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              className="bg-green-500 hover:bg-green-600"
                              onClick={() => {
                                setSelectedStudent(student);
                                setShowLeaveModal(true);
                              }}
                              title="Grant Leave"
                            >
                              <CheckCircle className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              className="bg-purple-500 hover:bg-purple-600"
                              onClick={() => {
                                setSelectedStudent(student);
                                setShowScheduleModal(true);
                              }}
                              title="Schedule Meeting"
                            >
                              <Calendar className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              className="bg-blue-500 hover:bg-blue-600"
                              onClick={() => {
                                setSelectedStudent(student);
                                setShowMessageModal(true);
                              }}
                              title="Contact Parent"
                            >
                              <Phone className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Leave Modal */}
        <AnimatePresence>
          {showLeaveModal && selectedStudent && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl"
              >
                <div className="bg-gradient-to-r from-green-600 to-emerald-700 p-6 text-white">
                  <h2 className="text-2xl font-black">Grant Leave</h2>
                  <p className="text-white/90">
                    {selectedStudent.first_name} {selectedStudent.last_name} - {selectedStudent.student_id}
                  </p>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block font-bold mb-2">Leave Type *</label>
                    <select
                      value={leaveForm.leave_type}
                      onChange={(e) => setLeaveForm({ ...leaveForm, leave_type: e.target.value })}
                      className="w-full px-4 py-3 border-2 rounded-lg"
                    >
                      <option value="sick">🤒 Sick Leave</option>
                      <option value="home">🏠 Home Visit</option>
                      <option value="emergency">🚨 Emergency</option>
                      <option value="family">👨‍👩‍👧 Family Matter</option>
                      <option value="medical">🏥 Medical Appointment</option>
                      <option value="other">📋 Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold mb-2">Reason *</label>
                    <textarea
                      value={leaveForm.reason}
                      onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                      placeholder="Enter reason for leave..."
                      rows={4}
                      className="w-full px-4 py-3 border-2 rounded-lg"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold mb-2">Start Date *</label>
                      <input
                        type="date"
                        value={leaveForm.start_date}
                        onChange={(e) => setLeaveForm({ ...leaveForm, start_date: e.target.value })}
                        className="w-full px-4 py-3 border-2 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block font-bold mb-2">End Date</label>
                      <input
                        type="date"
                        value={leaveForm.end_date}
                        onChange={(e) => setLeaveForm({ ...leaveForm, end_date: e.target.value })}
                        className="w-full px-4 py-3 border-2 rounded-lg"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-bold mb-2">Approved By</label>
                    <input
                      type="text"
                      value={leaveForm.approved_by_name}
                      onChange={(e) => setLeaveForm({ ...leaveForm, approved_by_name: e.target.value })}
                      placeholder="Your name"
                      className="w-full px-4 py-3 border-2 rounded-lg"
                    />
                  </div>
                </div>
                <div className="p-6 bg-gray-50 flex gap-3 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowLeaveModal(false);
                      setSelectedStudent(null);
                    }}
                    disabled={processing}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleGrantLeave}
                    disabled={processing}
                    className="bg-gradient-to-r from-green-600 to-emerald-700 text-white"
                  >
                    {processing ? 'Processing...' : 'Grant Leave'}
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Conduct Modal */}
        <AnimatePresence>
          {showConductModal && selectedStudent && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl"
              >
                <div className="bg-gradient-to-r from-red-600 to-orange-700 p-6 text-white">
                  <h2 className="text-2xl font-black">Remove Conduct</h2>
                  <p className="text-white/90">
                    {selectedStudent.first_name} {selectedStudent.last_name} - {selectedStudent.student_id}
                  </p>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block font-bold mb-2">Conduct Type</label>
                    <select
                      value={conductForm.conduct_type}
                      onChange={(e) => setConductForm({ ...conductForm, conduct_type: e.target.value })}
                      className="w-full px-4 py-3 border-2 rounded-lg"
                    >
                      <option value="warning">Warning</option>
                      <option value="suspension">Suspension</option>
                      <option value="expulsion">Expulsion</option>
                      <option value="probation">Probation</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold mb-2">Severity</label>
                    <select
                      value={conductForm.severity}
                      onChange={(e) => setConductForm({ ...conductForm, severity: e.target.value })}
                      className="w-full px-4 py-3 border-2 rounded-lg"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold mb-2">Description *</label>
                    <textarea
                      value={conductForm.description}
                      onChange={(e) => setConductForm({ ...conductForm, description: e.target.value })}
                      placeholder="Describe the incident..."
                      rows={4}
                      className="w-full px-4 py-3 border-2 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-2">Action Taken</label>
                    <textarea
                      value={conductForm.action_taken}
                      onChange={(e) => setConductForm({ ...conductForm, action_taken: e.target.value })}
                      placeholder="Action taken..."
                      rows={3}
                      className="w-full px-4 py-3 border-2 rounded-lg"
                    />
                  </div>
                </div>
                <div className="p-6 bg-gray-50 flex gap-3 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowConductModal(false);
                      setSelectedStudent(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleRemoveConduct}
                    className="bg-gradient-to-r from-red-600 to-orange-700 text-white"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Remove Conduct
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Message Modal */}
        <AnimatePresence>
          {showMessageModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl"
              >
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
                  <h2 className="text-2xl font-black">Message Parents</h2>
                  <p className="text-white/90">
                    {selectedStudent
                      ? `${selectedStudent.first_name} ${selectedStudent.last_name}`
                      : `${selectedStudents.length} students selected`}
                  </p>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block font-bold mb-2">Subject *</label>
                    <Input
                      value={messageForm.subject}
                      onChange={(e) => setMessageForm({ ...messageForm, subject: e.target.value })}
                      placeholder="Message subject"
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-2">Message *</label>
                    <textarea
                      value={messageForm.message}
                      onChange={(e) => setMessageForm({ ...messageForm, message: e.target.value })}
                      placeholder="Type your message..."
                      rows={6}
                      className="w-full px-4 py-3 border-2 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-2">Send Via</label>
                    <select
                      value={messageForm.send_via}
                      onChange={(e) => setMessageForm({ ...messageForm, send_via: e.target.value })}
                      className="w-full px-4 py-3 border-2 rounded-lg"
                    >
                      <option value="sms">SMS</option>
                      <option value="whatsapp">WhatsApp</option>
                      <option value="both">Both</option>
                    </select>
                  </div>
                </div>
                <div className="p-6 bg-gray-50 flex gap-3 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowMessageModal(false);
                      setSelectedStudent(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSendMessage}
                    className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Student History Modal */}
        <AnimatePresence>
          {showHistoryModal && studentHistory && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[80vh] overflow-y-auto"
              >
                <div className="bg-gradient-to-r from-orange-600 to-red-700 p-6 text-white sticky top-0">
                  <h2 className="text-2xl font-black flex items-center gap-2">
                    <History className="w-6 h-6" />
                    Student History
                  </h2>
                </div>
                <div className="p-6 space-y-6">
                  <div>
                    <h3 className="font-bold text-lg mb-3">Discipline Records</h3>
                    {studentHistory.records?.map((record: any, i: number) => (
                      <div key={i} className="p-4 border rounded-lg mb-2 bg-red-50">
                        <div className="flex justify-between">
                          <span className="font-bold">{record.conduct_type}</span>
                          <span className="text-sm text-gray-600">{new Date(record.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm mt-2">{record.description}</p>
                        <p className="text-xs text-red-600 mt-1">Points deducted: {record.conduct_points_deducted}</p>
                      </div>
                    ))}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-3">Leave Records</h3>
                    {studentHistory.leaves?.map((leave: any, i: number) => (
                      <div key={i} className="p-4 border rounded-lg mb-2 bg-green-50">
                        <div className="flex justify-between">
                          <span className="font-bold">{leave.leave_type}</span>
                          <span className="text-sm text-gray-600">{new Date(leave.start_time).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm mt-2">{leave.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-6 bg-gray-50 flex justify-end">
                  <Button onClick={() => setShowHistoryModal(false)}>Close</Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Schedule Meeting Modal */}
        <AnimatePresence>
          {showScheduleModal && selectedStudent && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl"
              >
                <div className="bg-gradient-to-r from-purple-600 to-indigo-700 p-6 text-white">
                  <h2 className="text-2xl font-black flex items-center gap-2">
                    <Calendar className="w-6 h-6" />
                    Schedule Meeting
                  </h2>
                  <p className="text-white/90">
                    {selectedStudent.first_name} {selectedStudent.last_name}
                  </p>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block font-bold mb-2">Meeting Type *</label>
                    <select
                      value={scheduleForm.meeting_type}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, meeting_type: e.target.value })}
                      className="w-full px-4 py-3 border-2 rounded-lg"
                    >
                      <option value="counseling">Counseling Session</option>
                      <option value="parent_meeting">Parent Meeting</option>
                      <option value="disciplinary">Disciplinary Hearing</option>
                      <option value="academic">Academic Review</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold mb-2">Date *</label>
                      <input
                        type="date"
                        value={scheduleForm.date}
                        onChange={(e) => setScheduleForm({ ...scheduleForm, date: e.target.value })}
                        className="w-full px-4 py-3 border-2 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block font-bold mb-2">Time *</label>
                      <input
                        type="time"
                        value={scheduleForm.time}
                        onChange={(e) => setScheduleForm({ ...scheduleForm, time: e.target.value })}
                        className="w-full px-4 py-3 border-2 rounded-lg"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-bold mb-2">Location</label>
                    <input
                      type="text"
                      value={scheduleForm.location}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, location: e.target.value })}
                      placeholder="Meeting location"
                      className="w-full px-4 py-3 border-2 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-2">Notes</label>
                    <textarea
                      value={scheduleForm.notes}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, notes: e.target.value })}
                      placeholder="Meeting notes..."
                      rows={3}
                      className="w-full px-4 py-3 border-2 rounded-lg"
                    />
                  </div>
                </div>
                <div className="p-6 bg-gray-50 flex gap-3 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setShowScheduleModal(false)}
                    disabled={processing}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleScheduleMeeting}
                    disabled={processing}
                    className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white"
                  >
                    {processing ? 'Scheduling...' : 'Schedule Meeting'}
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Bulk Actions Modal */}
        <AnimatePresence>
          {showBulkActionsModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl"
              >
                <div className="bg-gradient-to-r from-purple-600 to-pink-700 p-6 text-white">
                  <h2 className="text-2xl font-black flex items-center gap-2">
                    <Zap className="w-6 h-6" />
                    Bulk Actions
                  </h2>
                  <p className="text-white/90">{selectedStudents.length} students selected</p>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block font-bold mb-2">Action Type *</label>
                    <select
                      value={bulkAction.action_type}
                      onChange={(e) => setBulkAction({ ...bulkAction, action_type: e.target.value })}
                      className="w-full px-4 py-3 border-2 rounded-lg"
                    >
                      <option value="message">Send Message to Parents</option>
                      <option value="conduct_warning">Issue Conduct Warning</option>
                      <option value="schedule_meeting">Schedule Parent Meetings</option>
                      <option value="update_status">Update Student Status</option>
                      <option value="export_reports">Export Reports</option>
                    </select>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      This action will be applied to all {selectedStudents.length} selected students.
                    </p>
                  </div>
                </div>
                <div className="p-6 bg-gray-50 flex gap-3 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setShowBulkActionsModal(false)}
                    disabled={processing}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleBulkAction}
                    disabled={processing}
                    className="bg-gradient-to-r from-purple-600 to-pink-700 text-white"
                  >
                    {processing ? 'Processing...' : 'Execute Action'}
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DODDashboardAdvanced;
