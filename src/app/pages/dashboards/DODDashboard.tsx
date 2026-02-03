import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, TrendingUp, AlertTriangle, Calendar, Award, FileText, 
  BarChart3, Clock, CheckCircle, XCircle, Activity, Target,
  UserCheck, Heart, Shield, Bell, Download, Filter, Search,
  Ban, Plane, Mail, MessageSquare, RefreshCw, Loader2, Plus, Eye, Edit, Trash2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { PowerfulStudentSelector } from '@/app/components/PowerfulStudentSelector';
import sodImage from '@/assets/image slides/SOD slides.png';
import bdcImage from '@/assets/image slides/BDC slides.jpg';
import autImage from '@/assets/image slides/AUT slides.png';

interface DODDashboardProps {
  onNavigate: (page: string) => void;
}

const DODDashboard: React.FC<DODDashboardProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeIncidents: 0,
    pendingCases: 0,
    counselingSessions: 0,
    attendanceRate: 0,
    disciplineScore: 0,
    activeLeaves: 0,
    conductRemoved: 0
  });
  const [incidents, setIncidents] = useState([]);
  const [students, setStudents] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [conducts, setConducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  const [showConductModal, setShowConductModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showCounselingModal, setShowCounselingModal] = useState(false);
  const [showRecognitionModal, setShowRecognitionModal] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  
  const [newConduct, setNewConduct] = useState({ student_id: '', conduct_type: 'warning', description: '', action_taken: '' });
  const [newLeave, setNewLeave] = useState({ student_id: '', leave_type: 'sick', reason: '', start_time: '', end_time: '', approved_by: 'dod', approved_by_name: '' });
  const [newIncident, setNewIncident] = useState({ student_id: '', incident_type: 'behavioral', description: '', severity: 'medium', location: '' });
  const [messageForm, setMessageForm] = useState({ subject: '', message: '', send_via: 'sms', student_ids: [] });
  const [newCounseling, setNewCounseling] = useState({ student_id: '', session_type: 'individual', notes: '', scheduled_date: '' });
  const [newRecognition, setNewRecognition] = useState({ student_id: '', award_type: 'excellence', description: '', date_awarded: '' });
  const [attendanceForm, setAttendanceForm] = useState({ student_id: '', attendance_date: new Date().toISOString().split('T')[0], status: 'present', subject: '', period: '', remarks: '' });

  const handleMarkAttendance = async () => {
    if (!attendanceForm.student_id || !attendanceForm.attendance_date) return alert('Uzuza ibisabwa byose');
    try {
      setProcessing(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/global-sheets/students/${attendanceForm.student_id}/attendance`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(attendanceForm)
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMessage('Kwitabira kwanditswe neza!');
        setShowAttendanceModal(false);
        setAttendanceForm({ student_id: '', attendance_date: new Date().toISOString().split('T')[0], status: 'present', subject: '', period: '', remarks: '' });
        fetchDashboardData();
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      alert('Byanze kwandika kwitabira');
    } finally {
      setProcessing(false);
    }
  };

  const fetchAttendanceData = async () => {
    // This will refresh the students data which includes attendance info
    await fetchDashboardData();
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const [statsRes, incidentsRes, studentsRes, leavesRes, conductsRes] = await Promise.all([
        fetch('http://localhost:5000/api/discipline-management/stats', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('http://localhost:5000/api/discipline-management/incidents/all', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('http://localhost:5000/api/global-sheets/students', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('http://localhost:5000/api/discipline-management/leave/all', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('http://localhost:5000/api/discipline-management/conduct/all', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      
      const statsData = await statsRes.json();
      const incidentsData = await incidentsRes.json();
      const studentsData = await studentsRes.json();
      const leavesData = await leavesRes.json();
      const conductsData = await conductsRes.json();
      
      if (statsData.success) setStats(statsData.stats);
      if (incidentsData.success) setIncidents(incidentsData.incidents || []);
      if (studentsData.success) setStudents(studentsData.students || []);
      if (leavesData.success) setLeaves(leavesData.leaves || []);
      if (conductsData.success) setConducts(conductsData.conducts || []);
    } catch (error) {
      console.error('Error:', error);
    }
    setLoading(false);
  };

  const handleRemoveConduct = async () => {
    if (!newConduct.student_id || !newConduct.description) return alert('Uzuza ibisabwa byose');
    try {
      setProcessing(true);
      const token = localStorage.getItem('token');
      // Add discipline record to global student sheets
      const disciplineData = {
        incident_date: new Date().toISOString().split('T')[0],
        incident_type: newConduct.conduct_type,
        severity: 'medium',
        category: 'conduct_removal',
        description: newConduct.description,
        action_taken: newConduct.action_taken,
        location: 'DOD Office'
      };
      const res = await fetch(`http://localhost:5000/api/global-sheets/students/${newConduct.student_id}/discipline`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(disciplineData)
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMessage('Imyitwarire yarakuweho neza!');
        setShowConductModal(false);
        setNewConduct({ student_id: '', conduct_type: 'warning', description: '', action_taken: '' });
        fetchDashboardData();
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      alert('Byanze gukuraho imyitwarire');
    } finally {
      setProcessing(false);
    }
  };

  const handleGrantLeave = async () => {
    if (!newLeave.student_id || !newLeave.start_time) return alert('Uzuza ibisabwa byose');
    try {
      setProcessing(true);
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/discipline-management/leave/grant', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(newLeave)
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMessage('Uruhushya rwatanzwe neza!');
        setShowLeaveModal(false);
        setNewLeave({ student_id: '', leave_type: 'sick', reason: '', start_time: '', end_time: '', approved_by: 'dod', approved_by_name: '' });
        fetchDashboardData();
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      alert('Byanze gutanga uruhushya');
    } finally {
      setProcessing(false);
    }
  };

  const handleCreateIncident = async () => {
    if (!newIncident.student_id || !newIncident.description) return alert('Uzuza ibisabwa byose');
    try {
      setProcessing(true);
      const token = localStorage.getItem('token');
      // Add incident to global student sheets
      const incidentData = {
        incident_date: new Date().toISOString().split('T')[0],
        incident_type: newIncident.incident_type,
        severity: newIncident.severity,
        category: 'incident',
        description: newIncident.description,
        location: newIncident.location,
        action_taken: 'Recorded by DOD'
      };
      const res = await fetch(`http://localhost:5000/api/global-sheets/students/${newIncident.student_id}/discipline`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(incidentData)
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMessage('Ikosa cyanditswe neza!');
        setShowIncidentModal(false);
        setNewIncident({ student_id: '', incident_type: 'behavioral', description: '', severity: 'medium', location: '' });
        fetchDashboardData();
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      alert('Byanze kwandika ikosa');
    } finally {
      setProcessing(false);
    }
  };

  const handleScheduleCounseling = async () => {
    if (!newCounseling.student_id || !newCounseling.notes) return alert('Uzuza ibisabwa byose');
    try {
      setProcessing(true);
      const token = localStorage.getItem('token');
      const counselingData = {
        session_date: newCounseling.scheduled_date || new Date().toISOString().split('T')[0],
        session_type: newCounseling.session_type,
        notes: newCounseling.notes,
        counselor: 'DOD',
        status: 'scheduled'
      };
      const res = await fetch(`http://localhost:5000/api/global-sheets/students/${newCounseling.student_id}/counseling`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(counselingData)
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMessage('Inama yateganijwe neza!');
        setShowCounselingModal(false);
        setNewCounseling({ student_id: '', session_type: 'individual', notes: '', scheduled_date: '' });
        fetchDashboardData();
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      alert('Byanze guteganya inama');
    } finally {
      setProcessing(false);
    }
  };

  const handleAwardRecognition = async () => {
    if (!newRecognition.student_id || !newRecognition.description) return alert('Uzuza ibisabwa byose');
    try {
      setProcessing(true);
      const token = localStorage.getItem('token');
      const recognitionData = {
        award_date: newRecognition.date_awarded || new Date().toISOString().split('T')[0],
        award_type: newRecognition.award_type,
        description: newRecognition.description,
        awarded_by: 'DOD',
        category: 'recognition'
      };
      const res = await fetch(`http://localhost:5000/api/global-sheets/students/${newRecognition.student_id}/recognition`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(recognitionData)
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMessage('Igihembo cyatanzwe neza!');
        setShowRecognitionModal(false);
        setNewRecognition({ student_id: '', award_type: 'excellence', description: '', date_awarded: '' });
        fetchDashboardData();
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      alert('Byanze gutanga igihembo');
    } finally {
      setProcessing(false);
    }
  };

  const handleSendMessage = async () => {
    if (!messageForm.subject || !messageForm.message) return alert('Uzuza ibisabwa byose');
    try {
      setProcessing(true);
      const token = localStorage.getItem('token');
      await fetch('http://localhost:5000/api/discipline-management/message-parents', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(messageForm)
      });
      setSuccessMessage('Ubutumwa bwoherejwe neza!');
      setShowMessageModal(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      alert('Byanze kohereza ubutumwa');
    } finally {
      setProcessing(false);
    }
  };

  const statsCards = [
    { title: 'Abanyeshuri Bose', value: stats.totalStudents || students.length, icon: Users, color: 'from-blue-500 to-indigo-500', change: '+5%' },
    { title: 'Ibyabaye Bikomeye', value: stats.activeIncidents || incidents.length, icon: AlertTriangle, color: 'from-red-500 to-orange-500', change: '-12%' },
    { title: 'Ibikorwa Bitegerejwe', value: stats.pendingCases || 0, icon: FileText, color: 'from-yellow-500 to-amber-500', change: '+3%' },
    { title: 'Inama Ubuzima', value: stats.counselingSessions || 0, icon: Heart, color: 'from-pink-500 to-rose-500', change: '+8%' },
    { title: 'Uruhushya Rugihari', value: stats.activeLeaves || leaves.length, icon: Plane, color: 'from-green-500 to-teal-500', change: '+2%' },
    { title: 'Imyitwarire Yakuwemo', value: stats.conductRemoved || conducts.length, icon: Award, color: 'from-purple-500 to-violet-500', change: '+15%' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-orange-50 p-6">
      <AnimatePresence>
        {successMessage && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3">
            <CheckCircle className="w-6 h-6" />
            {successMessage}
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-black text-gray-900">Ikibaho cy'Umuyobozi w'Imyitwarire</h1>
              <p className="text-gray-600 mt-2">Gucunga Imyitwarire n'Imyifatire y'Abanyeshuri (DOD/Matron/Patron)</p>
            </div>
            <div className="flex gap-3">
              <Button onClick={fetchDashboardData} variant="outline" className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Kuvugurura
              </Button>
              <Button className="gap-2 bg-gradient-to-r from-green-600 to-yellow-600">
                <Download className="w-4 h-4" />
                Gukuramo Raporo
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4 mb-8">
          <motion.div whileHover={{ scale: 1.05, y: -5 }} whileTap={{ scale: 0.95 }}>
            <Button onClick={() => setShowConductModal(true)} className="w-full h-32 bg-gradient-to-br from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white rounded-2xl shadow-xl flex flex-col items-center justify-center gap-3 text-lg font-bold">
              <Ban className="w-10 h-10" />
              Kuraho Imyitwarire
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05, y: -5 }} whileTap={{ scale: 0.95 }}>
            <Button onClick={() => setShowLeaveModal(true)} className="w-full h-32 bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-2xl shadow-xl flex flex-col items-center justify-center gap-3 text-lg font-bold">
              <Plane className="w-10 h-10" />
              Gutanga Uruhushya
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05, y: -5 }} whileTap={{ scale: 0.95 }}>
            <Button onClick={() => setShowIncidentModal(true)} className="w-full h-32 bg-gradient-to-br from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white rounded-2xl shadow-xl flex flex-col items-center justify-center gap-3 text-lg font-bold">
              <AlertTriangle className="w-10 h-10" />
              Kwandika Ikosa
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05, y: -5 }} whileTap={{ scale: 0.95 }}>
            <Button onClick={() => setShowAttendanceModal(true)} className="w-full h-32 bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-2xl shadow-xl flex flex-col items-center justify-center gap-3 text-lg font-bold">
              <UserCheck className="w-10 h-10" />
              Kwandika Kwitabira
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05, y: -5 }} whileTap={{ scale: 0.95 }}>
            <Button onClick={() => setShowMessageModal(true)} className="w-full h-32 bg-gradient-to-br from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white rounded-2xl shadow-xl flex flex-col items-center justify-center gap-3 text-lg font-bold">
              <Mail className="w-10 h-10" />
              Kohereza Ababyeyi
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05, y: -5 }} whileTap={{ scale: 0.95 }}>
            <Button onClick={() => setShowCounselingModal(true)} className="w-full h-32 bg-gradient-to-br from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white rounded-2xl shadow-xl flex flex-col items-center justify-center gap-3 text-lg font-bold">
              <MessageSquare className="w-10 h-10" />
              Inama
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05, y: -5 }} whileTap={{ scale: 0.95 }}>
            <Button onClick={() => setShowRecognitionModal(true)} className="w-full h-32 bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-2xl shadow-xl flex flex-col items-center justify-center gap-3 text-lg font-bold">
              <Award className="w-10 h-10" />
              Ibihembo
            </Button>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {statsCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-green-300">
                <CardContent className="p-0">
                  <div className={`bg-gradient-to-br ${stat.color} p-6 text-white relative overflow-hidden`}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <p className="text-white/90 text-sm mb-2">{stat.title}</p>
                          <p className="text-4xl font-black">{stat.value}</p>
                        </div>
                        <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.5 }}>
                          <stat.icon className="w-12 h-12 opacity-90" />
                        </motion.div>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-sm font-medium">{stat.change} this month</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <Tabs defaultValue="incidents" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white shadow-lg rounded-xl p-2 border-2">
            <TabsTrigger value="incidents" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-orange-500 data-[state=active]:text-white">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Incidents
            </TabsTrigger>
            <TabsTrigger value="students" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white">
              <Users className="w-4 h-4 mr-2" />
              Students
            </TabsTrigger>
            <TabsTrigger value="counseling" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-rose-500 data-[state=active]:text-white">
              <Heart className="w-4 h-4 mr-2" />
              Counseling
            </TabsTrigger>
            <TabsTrigger value="attendance" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-teal-500 data-[state=active]:text-white">
              <UserCheck className="w-4 h-4 mr-2" />
              Attendance
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-violet-500 data-[state=active]:text-white">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="incidents">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Ibyabaye Vuba Aha ({incidents.length})</CardTitle>
                  <div className="flex gap-2">
                    <Input placeholder="Shakisha..." className="w-64" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    <Button size="sm"><Search className="w-4 h-4" /></Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {incidents.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertTriangle className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 font-semibold">Nta kibazo cyabonetse</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Itariki</TableHead>
                        <TableHead>Umunyeshuri</TableHead>
                        <TableHead>Ubwoko</TableHead>
                        <TableHead>Urwego</TableHead>
                        <TableHead>Imiterere</TableHead>
                        <TableHead>Ibikorwa</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {incidents.slice(0, 10).map((incident, idx) => (
                        <motion.tr
                          key={incident.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="hover:bg-green-50 transition-colors"
                        >
                          <TableCell className="font-semibold">{new Date(incident.created_at || incident.date).toLocaleDateString('rw-RW')}</TableCell>
                          <TableCell>
                            <div>
                              <p className="font-bold text-gray-900">{incident.student_name || 'N/A'}</p>
                              <p className="text-xs text-gray-500">{incident.student_id}</p>
                            </div>
                          </TableCell>
                          <TableCell><Badge variant="outline">{incident.incident_type || incident.type}</Badge></TableCell>
                          <TableCell>
                            <Badge className={
                              incident.severity === 'high' ? 'bg-red-500 text-white' :
                              incident.severity === 'medium' ? 'bg-yellow-500 text-white' : 'bg-green-500 text-white'
                            }>
                              {incident.severity === 'high' ? 'Hejuru' : incident.severity === 'medium' ? 'Hagati' : 'Hasi'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={incident.status === 'resolved' ? 'bg-green-500 text-white' : 'bg-yellow-500 text-white'}>
                              {incident.status === 'resolved' ? 'Byakemuwe' : 'Bitegerejwe'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button size="sm" variant="outline"><Eye className="w-3 h-3 mr-1" />Reba</Button>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="students">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Abanyeshuri ({students.length})</CardTitle>
                  <div className="flex gap-2">
                    <Input placeholder="Shakisha umunyeshuri..." className="w-64" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    <Button size="sm"><Search className="w-4 h-4" /></Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Trades Overview with Real Images */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {[
                    { name: 'Software Development', code: 'SOD', image: sodImage, count: students.filter(s => s.trade_code === 'SOD').length, color: 'from-blue-500 to-indigo-500' },
                    { name: 'Building Construction', code: 'BDC', image: bdcImage, count: students.filter(s => s.trade_code === 'BDC').length, color: 'from-orange-500 to-red-500' },
                    { name: 'Automobile Technology', code: 'AUT', image: autImage, count: students.filter(s => s.trade_code === 'AUT' || s.trade_code === 'AUTO').length, color: 'from-green-500 to-teal-500' }
                  ].map((trade, idx) => (
                    <motion.div
                      key={trade.code}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="relative overflow-hidden rounded-xl shadow-lg group cursor-pointer"
                    >
                      <div className="aspect-video relative">
                        <img src={trade.image} alt={trade.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="text-white font-bold text-lg mb-1">{trade.name}</h3>
                        <div className="flex items-center justify-between">
                          <Badge className={`bg-gradient-to-r ${trade.color} text-white border-0`}>{trade.code}</Badge>
                          <span className="text-white font-bold">{trade.count} abanyeshuri</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {students.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 font-semibold">Nta munyeshuri uhari</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {students.slice(0, 12).map((student) => (
                      <motion.div
                        key={student.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.02, y: -5 }}
                        className="p-4 border-2 rounded-xl hover:border-green-400 hover:shadow-xl transition-all bg-gradient-to-br from-white to-green-50"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-yellow-500 rounded-full flex items-center justify-center text-white font-black text-xl shadow-lg">
                            {student.first_name?.[0] || 'S'}{student.last_name?.[0] || 'T'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-black text-gray-900 truncate">{student.first_name} {student.last_name}</p>
                            <p className="text-sm text-gray-600 font-semibold">{student.student_id || student.student_code}</p>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600 font-semibold">Umwuga:</span>
                            <Badge className="bg-blue-500 text-white">{student.trade_code || student.trade_name || 'N/A'}</Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600 font-semibold">Urwego:</span>
                            <Badge className="bg-purple-500 text-white">Level {student.level_number || 'N/A'}</Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600 font-semibold">Imiterere:</span>
                            <Badge className={`${student.status === 'active' ? 'bg-green-500' : student.status === 'suspended' ? 'bg-red-500' : 'bg-gray-500'} text-white`}>
                              {student.status === 'active' ? 'Akora' : student.status === 'suspended' ? 'Yahagaritswe' : student.status || 'Akora'}
                            </Badge>
                          </div>
                          {student.conduct_score && (
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600 font-semibold">Imyitwarire:</span>
                              <Badge className={`${student.conduct_score >= 90 ? 'bg-green-500' : student.conduct_score >= 70 ? 'bg-yellow-500' : 'bg-red-500'} text-white`}>
                                {student.conduct_grade || 'A'} ({student.conduct_score || 100}%)
                              </Badge>
                            </div>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-3">
                          <Button size="sm" variant="outline" className="text-xs" onClick={() => onNavigate(`student-sheet/${student.id}`)}><Eye className="w-3 h-3 mr-1" />Reba</Button>
                          <Button size="sm" className="bg-gradient-to-r from-green-500 to-yellow-500 text-white text-xs" onClick={() => onNavigate(`student-management/${student.id}`)}><Edit className="w-3 h-3 mr-1" />Hindura</Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="counseling">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Inama z'Ubuzima bw'Umutwe</CardTitle>
                  <Button onClick={() => setShowCounselingModal(true)} className="bg-gradient-to-r from-pink-500 to-rose-600 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Ongeraho Inama
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {leaves.filter(l => l.leave_type === 'medical' || l.leave_type === 'sick').slice(0, 5).map((item, i) => (
                    <motion.div 
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center justify-between p-4 border-2 rounded-xl hover:border-pink-400 hover:shadow-xl transition-all bg-gradient-to-r from-pink-50 to-rose-50"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center shadow-lg">
                          <Heart className="w-7 h-7 text-white" />
                        </div>
                        <div>
                          <p className="font-black text-gray-900">{item.student_name || 'Umunyeshuri'}</p>
                          <p className="text-sm text-gray-600 font-semibold">Yategekanijwe: {new Date(item.start_time).toLocaleDateString('rw-RW')}</p>
                          <p className="text-xs text-gray-500">{item.reason}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className="bg-pink-500 text-white">{item.status === 'active' ? 'Igitegerejwe' : 'Byarangiye'}</Badge>
                        <Button size="sm" className="bg-gradient-to-r from-pink-500 to-rose-600 text-white"><Edit className="w-3 h-3 mr-1" />Gucunga</Button>
                      </div>
                    </motion.div>
                  ))}
                  {leaves.filter(l => l.leave_type === 'medical' || l.leave_type === 'sick').length === 0 && (
                    <div className="text-center py-12">
                      <Heart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                      <p className="text-gray-500 font-semibold">Nta nama zabonetse</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="attendance">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Kwitabira Amasomo</CardTitle>
                  <div className="flex gap-2">
                    <Button onClick={() => fetchAttendanceData()} variant="outline" size="sm">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Kuvugurura
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="p-6 bg-gradient-to-br from-green-100 to-teal-100 rounded-xl">
                    <div className="flex items-center justify-between mb-4">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                      <span className="text-3xl font-black text-green-600">
                        {students.length > 0 ? Math.round((students.filter(s => s.attendance_percentage >= 90).length / students.length) * 100) : 95}%
                      </span>
                    </div>
                    <p className="font-bold text-gray-900">Bitabiriye Neza</p>
                    <p className="text-sm text-gray-600">{students.filter(s => s.attendance_percentage >= 90).length} abanyeshuri</p>
                  </div>
                  <div className="p-6 bg-gradient-to-br from-yellow-100 to-amber-100 rounded-xl">
                    <div className="flex items-center justify-between mb-4">
                      <Clock className="w-8 h-8 text-yellow-600" />
                      <span className="text-3xl font-black text-yellow-600">
                        {students.length > 0 ? Math.round((students.filter(s => s.attendance_percentage >= 70 && s.attendance_percentage < 90).length / students.length) * 100) : 3}%
                      </span>
                    </div>
                    <p className="font-bold text-gray-900">Batinze</p>
                    <p className="text-sm text-gray-600">{students.filter(s => s.attendance_percentage >= 70 && s.attendance_percentage < 90).length} abanyeshuri</p>
                  </div>
                  <div className="p-6 bg-gradient-to-br from-red-100 to-orange-100 rounded-xl">
                    <div className="flex items-center justify-between mb-4">
                      <XCircle className="w-8 h-8 text-red-600" />
                      <span className="text-3xl font-black text-red-600">
                        {students.length > 0 ? Math.round((students.filter(s => s.attendance_percentage < 70).length / students.length) * 100) : 2}%
                      </span>
                    </div>
                    <p className="font-bold text-gray-900">Ntibatitabira</p>
                    <p className="text-sm text-gray-600">{students.filter(s => s.attendance_percentage < 70).length} abanyeshuri</p>
                  </div>
                </div>
                
                {/* Students with Poor Attendance */}
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
                  <h3 className="font-bold text-lg mb-4 text-red-800 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Abanyeshuri Batitabira Nabi (&lt; 70%)
                  </h3>
                  {students.filter(s => s.attendance_percentage < 70).length === 0 ? (
                    <p className="text-gray-600">Abanyeshuri bose batitabira neza!</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {students.filter(s => s.attendance_percentage < 70).slice(0, 6).map((student) => (
                        <motion.div
                          key={student.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="p-4 bg-white border-2 border-red-300 rounded-lg hover:shadow-lg transition-all"
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                              {student.first_name?.[0]}{student.last_name?.[0]}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-gray-900 truncate text-sm">{student.first_name} {student.last_name}</p>
                              <p className="text-xs text-gray-600">{student.trade_code} - Level {student.level_number}</p>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-600">Kwitabira:</span>
                            <Badge className="bg-red-500 text-white text-xs">{student.attendance_percentage || 0}%</Badge>
                          </div>
                          <Button size="sm" className="w-full mt-2 bg-red-500 hover:bg-red-600 text-white text-xs">
                            <MessageSquare className="w-3 h-3 mr-1" />
                            Tumira Ababyeyi
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Isesengura ry'Imikorere</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="p-6 border-2 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50">
                    <h3 className="font-bold mb-4 text-lg">Ibyabaye ku Bwoko</h3>
                    <div className="space-y-3">
                      {[
                        { type: 'Imyitwarire', count: incidents.filter(i => i.incident_type === 'behavioral').length, color: 'from-red-500 to-orange-500' },
                        { type: 'Amasomo', count: incidents.filter(i => i.incident_type === 'academic').length, color: 'from-blue-500 to-indigo-500' },
                        { type: 'Kwitabira', count: incidents.filter(i => i.incident_type === 'attendance').length, color: 'from-yellow-500 to-amber-500' },
                        { type: 'Umutekano', count: incidents.filter(i => i.incident_type === 'safety').length, color: 'from-green-500 to-teal-500' }
                      ].map((item) => (
                        <div key={item.type}>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm font-semibold">{item.type}</span>
                            <span className="text-sm font-black text-gray-900">{item.count}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${incidents.length > 0 ? (item.count / incidents.length) * 100 : 0}%` }}
                              transition={{ duration: 1, delay: 0.2 }}
                              className={`bg-gradient-to-r ${item.color} h-3 rounded-full`}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="p-6 border-2 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50">
                    <h3 className="font-bold mb-4 text-lg">Incamake y'Ukwezi</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow">
                        <span className="font-semibold">Ibyabaye Byose</span>
                        <span className="text-3xl font-black text-blue-600">{incidents.length}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow">
                        <span className="font-semibold">Byakemuwe</span>
                        <span className="text-3xl font-black text-green-600">{incidents.filter(i => i.status === 'resolved').length}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow">
                        <span className="font-semibold">Bitegerejwe</span>
                        <span className="text-3xl font-black text-yellow-600">{incidents.filter(i => i.status === 'pending' || i.status === 'active').length}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow">
                        <span className="font-semibold">Igipimo cy'Intsinzi</span>
                        <span className="text-3xl font-black text-purple-600">
                          {incidents.length > 0 ? Math.round((incidents.filter(i => i.status === 'resolved').length / incidents.length) * 100) : 0}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Global Student Sheets Analytics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-6 border-2 rounded-xl bg-gradient-to-br from-purple-50 to-violet-50">
                    <h3 className="font-bold mb-4 text-lg flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Imyitwarire y'Abanyeshuri
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Imyitwarire Myiza (A)</span>
                        <Badge className="bg-green-500 text-white">
                          {students.filter(s => s.conduct_grade === 'A').length}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Imyitwarire Nziza (B)</span>
                        <Badge className="bg-blue-500 text-white">
                          {students.filter(s => s.conduct_grade === 'B').length}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Imyitwarire Isanzwe (C)</span>
                        <Badge className="bg-yellow-500 text-white">
                          {students.filter(s => s.conduct_grade === 'C').length}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Imyitwarire Mibi (D/F)</span>
                        <Badge className="bg-red-500 text-white">
                          {students.filter(s => s.conduct_grade === 'D' || s.conduct_grade === 'F').length}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6 border-2 rounded-xl bg-gradient-to-br from-orange-50 to-red-50">
                    <h3 className="font-bold mb-4 text-lg flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      Abanyeshuri Bakeneye Ubufasha
                    </h3>
                    <div className="space-y-3">
                      <div className="p-3 bg-white rounded-lg border-l-4 border-red-500">
                        <p className="text-sm font-semibold text-red-700">Imyitwarire Mibi</p>
                        <p className="text-2xl font-black text-red-600">
                          {students.filter(s => s.conduct_score < 60).length}
                        </p>
                      </div>
                      <div className="p-3 bg-white rounded-lg border-l-4 border-yellow-500">
                        <p className="text-sm font-semibold text-yellow-700">Kwitabira Nabi</p>
                        <p className="text-2xl font-black text-yellow-600">
                          {students.filter(s => s.attendance_percentage < 70).length}
                        </p>
                      </div>
                      <div className="p-3 bg-white rounded-lg border-l-4 border-blue-500">
                        <p className="text-sm font-semibold text-blue-700">Ibyabaye Byinshi</p>
                        <p className="text-2xl font-black text-blue-600">
                          {students.filter(s => s.total_incidents > 5).length}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6 border-2 rounded-xl bg-gradient-to-br from-green-50 to-teal-50">
                    <h3 className="font-bold mb-4 text-lg flex items-center gap-2">
                      <Award className="w-5 h-5" />
                      Imikorere Myiza
                    </h3>
                    <div className="space-y-3">
                      <div className="p-3 bg-white rounded-lg border-l-4 border-green-500">
                        <p className="text-sm font-semibold text-green-700">Kwitabira Neza (&gt;90%)</p>
                        <p className="text-2xl font-black text-green-600">
                          {students.filter(s => s.attendance_percentage >= 90).length}
                        </p>
                      </div>
                      <div className="p-3 bg-white rounded-lg border-l-4 border-blue-500">
                        <p className="text-sm font-semibold text-blue-700">Imyitwarire Myiza (A)</p>
                        <p className="text-2xl font-black text-blue-600">
                          {students.filter(s => s.conduct_grade === 'A').length}
                        </p>
                      </div>
                      <div className="p-3 bg-white rounded-lg border-l-4 border-purple-500">
                        <p className="text-sm font-semibold text-purple-700">Nta kibazo</p>
                        <p className="text-2xl font-black text-purple-600">
                          {students.filter(s => !s.total_incidents || s.total_incidents === 0).length}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Leave Modal */}
        <AnimatePresence>
          {showLeaveModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-green-600 to-emerald-700 p-6 text-white">
                  <h2 className="text-2xl font-black flex items-center gap-2"><Plane className="w-6 h-6" />Gutanga Uruhushya</h2>
                </div>
                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                  <PowerfulStudentSelector
                    value={newLeave.student_id}
                    onChange={(studentId) => setNewLeave({ ...newLeave, student_id: studentId })}
                    label="Hitamo Umunyeshuri"
                    placeholder="Andika izina, kode, umwuga cyangwa urwego..."
                    showAdvancedFilters={true}
                    showStudentStats={true}
                    enableVoiceSearch={true}
                    showFavorites={true}
                    required={true}
                  />
                  <div className="space-y-2">
                    <Label className="font-bold">Ubwoko bw'Uruhushya *</Label>
                    <select value={newLeave.leave_type} onChange={(e) => setNewLeave({ ...newLeave, leave_type: e.target.value })} className="w-full px-4 py-3 border-2 rounded-lg">
                      <option value="sick">🤒 Kurwara</option>
                      <option value="home">🏠 Kuja Murugo</option>
                      <option value="emergency">🚨 Ihutirwa</option>
                      <option value="family">👨👩👧 Ikibazo cy'Umuryango</option>
                      <option value="medical">🏥 Kwa Muganga</option>
                      <option value="other">📋 Ikindi</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold">Impamvu *</Label>
                    <Textarea value={newLeave.reason} onChange={(e) => setNewLeave({ ...newLeave, reason: e.target.value })} placeholder="Andika impamvu..." rows={4} className="w-full px-4 py-3 border-2 rounded-lg" />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="font-bold">Itariki yo Gutangira *</Label>
                      <Input type="datetime-local" value={newLeave.start_time} onChange={(e) => setNewLeave({ ...newLeave, start_time: e.target.value })} className="w-full px-4 py-3 border-2 rounded-lg" />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold">Itariki yo Kurangiza</Label>
                      <Input type="datetime-local" value={newLeave.end_time} onChange={(e) => setNewLeave({ ...newLeave, end_time: e.target.value })} className="w-full px-4 py-3 border-2 rounded-lg" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold">Byemejwe na *</Label>
                    <Input value={newLeave.approved_by_name} onChange={(e) => setNewLeave({ ...newLeave, approved_by_name: e.target.value })} placeholder="Amazina yawe" className="w-full px-4 py-3 border-2 rounded-lg" />
                  </div>
                </div>
                <div className="p-6 bg-gray-50 flex gap-3 justify-end">
                  <Button variant="outline" onClick={() => setShowLeaveModal(false)} disabled={processing}>Kureka</Button>
                  <Button onClick={handleGrantLeave} disabled={processing} className="bg-gradient-to-r from-green-600 to-emerald-700 text-white">
                    {processing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Tegereza...</> : <><CheckCircle className="w-4 h-4 mr-2" />Tanga Uruhushya</>}
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Conduct Modal */}
        <AnimatePresence>
          {showConductModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-yellow-600 to-amber-700 p-6 text-white">
                  <h2 className="text-2xl font-black flex items-center gap-2"><Ban className="w-6 h-6" />Kuraho Imyitwarire</h2>
                </div>
                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                  <PowerfulStudentSelector
                    value={newConduct.student_id}
                    onChange={(studentId) => setNewConduct({ ...newConduct, student_id: studentId })}
                    label="Hitamo Umunyeshuri"
                    placeholder="Andika izina, kode, umwuga cyangwa urwego..."
                    showAdvancedFilters={true}
                    showStudentStats={true}
                    enableVoiceSearch={true}
                    showFavorites={true}
                    required={true}
                  />
                  <div className="space-y-2">
                    <Label className="font-bold">Ubwoko bw'Imyitwarire *</Label>
                    <select value={newConduct.conduct_type} onChange={(e) => setNewConduct({ ...newConduct, conduct_type: e.target.value })} className="w-full px-4 py-3 border-2 rounded-lg">
                      <option value="warning">⚠️ Iburira</option>
                      <option value="suspension">🚫 Guhagarika</option>
                      <option value="expulsion">❌ Kwirukana</option>
                      <option value="probation">📋 Kugenzura</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold">Ibisobanuro *</Label>
                    <Textarea value={newConduct.description} onChange={(e) => setNewConduct({ ...newConduct, description: e.target.value })} placeholder="Sobanura..." rows={4} className="w-full px-4 py-3 border-2 rounded-lg" />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold">Igikorwa Cyafashwe</Label>
                    <Textarea value={newConduct.action_taken} onChange={(e) => setNewConduct({ ...newConduct, action_taken: e.target.value })} placeholder="Igikorwa..." rows={3} className="w-full px-4 py-3 border-2 rounded-lg" />
                  </div>
                </div>
                <div className="p-6 bg-gray-50 flex gap-3 justify-end">
                  <Button variant="outline" onClick={() => setShowConductModal(false)} disabled={processing}>Kureka</Button>
                  <Button onClick={handleRemoveConduct} disabled={processing} className="bg-gradient-to-r from-yellow-600 to-amber-700 text-white">
                    {processing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Tegereza...</> : <><CheckCircle className="w-4 h-4 mr-2" />Kuraho</>}
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Incident Modal */}
        <AnimatePresence>
          {showIncidentModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-red-600 to-rose-700 p-6 text-white">
                  <h2 className="text-2xl font-black flex items-center gap-2"><AlertTriangle className="w-6 h-6" />Kwandika Ikosa</h2>
                </div>
                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                  <PowerfulStudentSelector
                    value={newIncident.student_id}
                    onChange={(studentId) => setNewIncident({ ...newIncident, student_id: studentId })}
                    label="Hitamo Umunyeshuri"
                    placeholder="Andika izina, kode, umwuga cyangwa urwego..."
                    showAdvancedFilters={true}
                    showStudentStats={true}
                    enableVoiceSearch={true}
                    showFavorites={true}
                    required={true}
                  />
                  <div className="space-y-2">
                    <Label className="font-bold">Ubwoko bw'Ikosa *</Label>
                    <select value={newIncident.incident_type} onChange={(e) => setNewIncident({ ...newIncident, incident_type: e.target.value })} className="w-full px-4 py-3 border-2 rounded-lg">
                      <option value="behavioral">😠 Imyitwarire</option>
                      <option value="academic">📚 Amasomo</option>
                      <option value="attendance">📅 Kwitabira</option>
                      <option value="safety">🛡️ Umutekano</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold">Urwego *</Label>
                    <select value={newIncident.severity} onChange={(e) => setNewIncident({ ...newIncident, severity: e.target.value })} className="w-full px-4 py-3 border-2 rounded-lg">
                      <option value="low">🟢 Hasi</option>
                      <option value="medium">🟡 Hagati</option>
                      <option value="high">🔴 Hejuru</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold">Ibisobanuro *</Label>
                    <Textarea value={newIncident.description} onChange={(e) => setNewIncident({ ...newIncident, description: e.target.value })} placeholder="Sobanura ikosa..." rows={4} className="w-full px-4 py-3 border-2 rounded-lg" />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold">Ahantu</Label>
                    <Input value={newIncident.location} onChange={(e) => setNewIncident({ ...newIncident, location: e.target.value })} placeholder="Ahantu habayeho" className="w-full px-4 py-3 border-2 rounded-lg" />
                  </div>
                </div>
                <div className="p-6 bg-gray-50 flex gap-3 justify-end">
                  <Button variant="outline" onClick={() => setShowIncidentModal(false)} disabled={processing}>Kureka</Button>
                  <Button onClick={handleCreateIncident} disabled={processing} className="bg-gradient-to-r from-red-600 to-rose-700 text-white">
                    {processing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Tegereza...</> : <><CheckCircle className="w-4 h-4 mr-2" />Kwandika</>}
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
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-cyan-700 p-6 text-white">
                  <h2 className="text-2xl font-black flex items-center gap-2"><Mail className="w-6 h-6" />Kohereza Ababyeyi</h2>
                </div>
                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                  <div className="space-y-2">
                    <Label className="font-bold">Umutwe *</Label>
                    <Input value={messageForm.subject} onChange={(e) => setMessageForm({ ...messageForm, subject: e.target.value })} placeholder="Umutwe w'ubutumwa" className="w-full px-4 py-3 border-2 rounded-lg" />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold">Ubutumwa *</Label>
                    <Textarea value={messageForm.message} onChange={(e) => setMessageForm({ ...messageForm, message: e.target.value })} placeholder="Andika ubutumwa..." rows={6} className="w-full px-4 py-3 border-2 rounded-lg" />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold">Kohereza binyuze *</Label>
                    <select value={messageForm.send_via} onChange={(e) => setMessageForm({ ...messageForm, send_via: e.target.value })} className="w-full px-4 py-3 border-2 rounded-lg">
                      <option value="sms">📱 SMS</option>
                      <option value="whatsapp">💬 WhatsApp</option>
                      <option value="both">📲 Byombi</option>
                    </select>
                  </div>
                </div>
                <div className="p-6 bg-gray-50 flex gap-3 justify-end">
                  <Button variant="outline" onClick={() => setShowMessageModal(false)} disabled={processing}>Kureka</Button>
                  <Button onClick={handleSendMessage} disabled={processing} className="bg-gradient-to-r from-blue-600 to-cyan-700 text-white">
                    {processing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Tegereza...</> : <><CheckCircle className="w-4 h-4 mr-2" />Kohereza</>}
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Attendance Modal */}
        <AnimatePresence>
          {showAttendanceModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-700 p-6 text-white">
                  <h2 className="text-2xl font-black flex items-center gap-2"><UserCheck className="w-6 h-6" />Kwandika Kwitabira</h2>
                </div>
                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                  <PowerfulStudentSelector
                    value={attendanceForm.student_id}
                    onChange={(studentId) => setAttendanceForm({ ...attendanceForm, student_id: studentId })}
                    label="Hitamo Umunyeshuri"
                    placeholder="Andika izina, kode, umwuga cyangwa urwego..."
                    showAdvancedFilters={true}
                    showStudentStats={true}
                    enableVoiceSearch={true}
                    showFavorites={true}
                    required={true}
                  />
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="font-bold">Itariki *</Label>
                      <Input type="date" value={attendanceForm.attendance_date} onChange={(e) => setAttendanceForm({ ...attendanceForm, attendance_date: e.target.value })} className="w-full px-4 py-3 border-2 rounded-lg" />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold">Imiterere *</Label>
                      <select value={attendanceForm.status} onChange={(e) => setAttendanceForm({ ...attendanceForm, status: e.target.value })} className="w-full px-4 py-3 border-2 rounded-lg">
                        <option value="present">✅ Yaritabiriye</option>
                        <option value="absent">❌ Ntiyaritabiriye</option>
                        <option value="late">⏰ Yatinze</option>
                        <option value="excused">📋 Yemerewe</option>
                        <option value="sick">🤒 Yarwaye</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="font-bold">Isomo</Label>
                      <Input value={attendanceForm.subject} onChange={(e) => setAttendanceForm({ ...attendanceForm, subject: e.target.value })} placeholder="Isomo" className="w-full px-4 py-3 border-2 rounded-lg" />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold">Igihe</Label>
                      <Input value={attendanceForm.period} onChange={(e) => setAttendanceForm({ ...attendanceForm, period: e.target.value })} placeholder="Igihe (1-8)" className="w-full px-4 py-3 border-2 rounded-lg" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold">Ibisobanuro</Label>
                    <Textarea value={attendanceForm.remarks} onChange={(e) => setAttendanceForm({ ...attendanceForm, remarks: e.target.value })} placeholder="Ibisobanuro..." rows={3} className="w-full px-4 py-3 border-2 rounded-lg" />
                  </div>
                </div>
                <div className="p-6 bg-gray-50 flex gap-3 justify-end">
                  <Button variant="outline" onClick={() => setShowAttendanceModal(false)} disabled={processing}>Kureka</Button>
                  <Button onClick={handleMarkAttendance} disabled={processing} className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white">
                    {processing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Tegereza...</> : <><CheckCircle className="w-4 h-4 mr-2" />Kwandika</>}
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Counseling Modal */}
        <AnimatePresence>
          {showCounselingModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-pink-600 to-rose-700 p-6 text-white">
                  <h2 className="text-2xl font-black flex items-center gap-2"><MessageSquare className="w-6 h-6" />Guteganya Inama</h2>
                </div>
                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                  <PowerfulStudentSelector
                    value={newCounseling.student_id}
                    onChange={(studentId) => setNewCounseling({ ...newCounseling, student_id: studentId })}
                    label="Hitamo Umunyeshuri"
                    placeholder="Andika izina, kode, umwuga cyangwa urwego..."
                    showAdvancedFilters={true}
                    showStudentStats={true}
                    enableVoiceSearch={true}
                    showFavorites={true}
                    required={true}
                  />
                  <div className="space-y-2">
                    <Label className="font-bold">Ubwoko bw'Inama *</Label>
                    <select value={newCounseling.session_type} onChange={(e) => setNewCounseling({ ...newCounseling, session_type: e.target.value })} className="w-full px-4 py-3 border-2 rounded-lg">
                      <option value="individual">👤 Ku giti cye</option>
                      <option value="group">👥 Mu itsinda</option>
                      <option value="family">👨👩👧 N'umuryango</option>
                      <option value="academic">📚 Ku masomo</option>
                      <option value="behavioral">😊 Ku myitwarire</option>
                      <option value="career">🎯 Ku mwuga</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold">Itariki y'Inama</Label>
                    <Input type="date" value={newCounseling.scheduled_date} onChange={(e) => setNewCounseling({ ...newCounseling, scheduled_date: e.target.value })} className="w-full px-4 py-3 border-2 rounded-lg" />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold">Ibisobanuro n'Intego *</Label>
                    <Textarea value={newCounseling.notes} onChange={(e) => setNewCounseling({ ...newCounseling, notes: e.target.value })} placeholder="Sobanura intego z'inama n'ibibazo bigomba gukemurwa..." rows={5} className="w-full px-4 py-3 border-2 rounded-lg" />
                  </div>
                </div>
                <div className="p-6 bg-gray-50 flex gap-3 justify-end">
                  <Button variant="outline" onClick={() => setShowCounselingModal(false)} disabled={processing}>Kureka</Button>
                  <Button onClick={handleScheduleCounseling} disabled={processing} className="bg-gradient-to-r from-pink-600 to-rose-700 text-white">
                    {processing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Tegereza...</> : <><CheckCircle className="w-4 h-4 mr-2" />Teganya</>}
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Recognition Modal */}
        <AnimatePresence>
          {showRecognitionModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-amber-600 to-orange-700 p-6 text-white">
                  <h2 className="text-2xl font-black flex items-center gap-2"><Award className="w-6 h-6" />Gutanga Igihembo</h2>
                </div>
                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                  <PowerfulStudentSelector
                    value={newRecognition.student_id}
                    onChange={(studentId) => setNewRecognition({ ...newRecognition, student_id: studentId })}
                    label="Hitamo Umunyeshuri"
                    placeholder="Andika izina, kode, umwuga cyangwa urwego..."
                    showAdvancedFilters={true}
                    showStudentStats={true}
                    enableVoiceSearch={true}
                    showFavorites={true}
                    required={true}
                  />
                  <div className="space-y-2">
                    <Label className="font-bold">Ubwoko bw'Igihembo *</Label>
                    <select value={newRecognition.award_type} onChange={(e) => setNewRecognition({ ...newRecognition, award_type: e.target.value })} className="w-full px-4 py-3 border-2 rounded-lg">
                      <option value="excellence">🏆 Ubuhanga</option>
                      <option value="improvement">📈 Iterambere</option>
                      <option value="leadership">👑 Ubuyobozi</option>
                      <option value="service">🤝 Serivisi</option>
                      <option value="attendance">📅 Kwitabira</option>
                      <option value="behavior">😊 Imyitwarire</option>
                      <option value="academic">📚 Amasomo</option>
                      <option value="sports">⚽ Siporo</option>
                      <option value="arts">🎨 Ubuhanzi</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold">Itariki y'Igihembo</Label>
                    <Input type="date" value={newRecognition.date_awarded} onChange={(e) => setNewRecognition({ ...newRecognition, date_awarded: e.target.value })} className="w-full px-4 py-3 border-2 rounded-lg" />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold">Ibisobanuro by'Igihembo *</Label>
                    <Textarea value={newRecognition.description} onChange={(e) => setNewRecognition({ ...newRecognition, description: e.target.value })} placeholder="Sobanura impamvu yo gutanga iki gihembo n'ibyiza umunyeshuri yakoze..." rows={5} className="w-full px-4 py-3 border-2 rounded-lg" />
                  </div>
                </div>
                <div className="p-6 bg-gray-50 flex gap-3 justify-end">
                  <Button variant="outline" onClick={() => setShowRecognitionModal(false)} disabled={processing}>Kureka</Button>
                  <Button onClick={handleAwardRecognition} disabled={processing} className="bg-gradient-to-r from-amber-600 to-orange-700 text-white">
                    {processing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Tegereza...</> : <><CheckCircle className="w-4 h-4 mr-2" />Tanga Igihembo</>}
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

export default DODDashboard;
