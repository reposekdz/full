import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, AlertTriangle, Users, TrendingDown, Plus, Search, Filter, Download, Eye, Edit, Trash2, Calendar, Clock, FileText, BarChart3, Bell, CheckCircle, XCircle, UserCheck, UserX, Activity, Target, Award, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/app/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import LeftSidebar from '@/app/components/LeftSidebar';
import UniversalMessagingWidget from '@/app/components/UniversalMessagingWidget';

interface DODDashboardProps {
  onNavigate: (page: string) => void;
}

const DODDashboard: React.FC<DODDashboardProps> = ({ onNavigate }) => {
  const [students, setStudents] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showPatronShareModal, setShowPatronShareModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [filters, setFilters] = useState({ trade: '', level: '', search: '' });
  const [loading, setLoading] = useState(true);
  const [incidentForm, setIncidentForm] = useState({
    conduct_type: 'warning',
    severity: 'low',
    description: '',
    action_taken: '',
    lesson_missed: ''
  });
  const [leaveForm, setLeaveForm] = useState({
    leave_type: 'sick',
    reason: '',
    lesson_missed: '',
    start_time: '',
    end_time: ''
  });
  const [messageForm, setMessageForm] = useState({
    subject: '',
    message: '',
    priority: 'normal',
    recipient_type: 'student'
  });

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const [studentsRes, analyticsRes] = await Promise.all([
        fetch('http://localhost:5000/api/discipline/students', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('http://localhost:5000/api/discipline/analytics', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      const studentsData = await studentsRes.json();
      const analyticsData = await analyticsRes.json();
      if (studentsData.success) setStudents(studentsData.students);
      if (analyticsData.success) setAnalytics(analyticsData.analytics);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost:5000/api/discipline/conduct/remove', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ student_id: selectedStudent.id, ...incidentForm })
    });
    const data = await res.json();
    if (data.success) {
      alert('Incident recorded and parents notified!');
      setShowIncidentModal(false);
      loadData();
    }
  };

  const submitLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost:5000/api/discipline/leave/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ student_id: selectedStudent.id, ...leaveForm })
    });
    const data = await res.json();
    if (data.success) {
      alert('Leave recorded and parents notified!');
      setShowLeaveModal(false);
      loadData();
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost:5000/api/messaging/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ recipient_ids: [selectedStudent.id], ...messageForm })
    });
    const data = await res.json();
    if (data.success) {
      alert('Message sent successfully!');
      setShowMessageModal(false);
    }
  };

  const filteredStudents = students.filter(s => {
    const matchSearch = !filters.search || s.name?.toLowerCase().includes(filters.search.toLowerCase()) || s.student_code?.toLowerCase().includes(filters.search.toLowerCase());
    const matchTrade = !filters.trade || s.trade === filters.trade;
    const matchLevel = !filters.level || s.class_level === filters.level;
    return matchSearch && matchTrade && matchLevel;
  });

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
        <LeftSidebar currentPage="dashboard-dod" onNavigate={onNavigate} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Gukuramo amakuru...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
      <UniversalMessagingWidget />
      <LeftSidebar currentPage="dashboard-dod" onNavigate={onNavigate} />
      <div className="flex-1 overflow-auto p-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-black bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-2">
                DOD Dashboard - Imyitwarire n'Uruhushya
              </h1>
              <p className="text-gray-600">Gucunga imyitwarire y'abanyeshuri n'uruhushya</p>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => setShowPatronShareModal(true)} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                <Send className="w-4 h-4 mr-2" />
                Sangiza Patron
              </Button>
              <Button className="bg-gradient-to-r from-red-600 to-orange-600 text-white">
                <Download className="w-4 h-4 mr-2" />
                Pakurura Raporo
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="border-2 border-red-200 bg-gradient-to-br from-red-50 to-orange-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Ibyaha Byose</p>
                    <p className="text-3xl font-black text-red-600">{analytics?.overall?.total_incidents || 0}</p>
                  </div>
                  <Shield className="w-12 h-12 text-red-600 opacity-20" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Bikomeye</p>
                    <p className="text-3xl font-black text-orange-600">{analytics?.overall?.critical_severity || 0}</p>
                  </div>
                  <AlertTriangle className="w-12 h-12 text-orange-600 opacity-20" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-amber-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Uruhushya</p>
                    <p className="text-3xl font-black text-yellow-600">{analytics?.leaveStats?.total_leaves || 0}</p>
                  </div>
                  <UserCheck className="w-12 h-12 text-yellow-600 opacity-20" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-teal-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Abanyeshuri</p>
                    <p className="text-3xl font-black text-green-600">{students.length}</p>
                  </div>
                  <Users className="w-12 h-12 text-green-600 opacity-20" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Tabs defaultValue="students" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white border-2 border-red-200">
            <TabsTrigger value="students">Abanyeshuri</TabsTrigger>
            <TabsTrigger value="incidents">Ibyaha</TabsTrigger>
            <TabsTrigger value="leaves">Uruhushya</TabsTrigger>
            <TabsTrigger value="messages">Ubutumwa</TabsTrigger>
            <TabsTrigger value="history">Amateka</TabsTrigger>
          </TabsList>
            <TabsTrigger value="students">Abanyeshuri</TabsTrigger>
            <TabsTrigger value="incidents">Ibyaha</TabsTrigger>
            <TabsTrigger value="leaves">Uruhushya</TabsTrigger>
            <TabsTrigger value="analytics">Imibare</TabsTrigger>
          </TabsList>

          <TabsContent value="students">
            <Card className="border-2 border-red-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Abanyeshuri n'Imyitwarire</CardTitle>
                  <div className="flex gap-3">
                    <Input placeholder="Shakisha..." value={filters.search} onChange={(e) => setFilters({...filters, search: e.target.value})} className="w-64" />
                    <Select value={filters.trade} onValueChange={(v) => setFilters({...filters, trade: v})}>
                      <SelectTrigger className="w-32"><SelectValue placeholder="Umwuga" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Byose</SelectItem>
                        <SelectItem value="SOD">SOD</SelectItem>
                        <SelectItem value="BDC">BDC</SelectItem>
                        <SelectItem value="AUT">AUT</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredStudents.map((student) => (
                    <Card key={student.id} className="border-2 border-red-100 hover:border-red-300 transition-all">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-bold text-gray-900">{student.name}</h4>
                            <p className="text-sm text-gray-600">{student.student_code} - {student.trade} {student.class_level}</p>
                            <div className="flex gap-2 mt-2">
                              <Badge variant="outline">{student.total_incidents || 0} Ibyaha</Badge>
                              <Badge variant="outline">{student.total_leaves || 0} Uruhushya</Badge>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => { setSelectedStudent(student); setShowIncidentModal(true); }} className="bg-red-600 text-white">
                              <AlertTriangle className="w-4 h-4 mr-1" />
                              Ibyaha
                            </Button>
                            <Button size="sm" onClick={() => { setSelectedStudent(student); setShowLeaveModal(true); }} className="bg-yellow-600 text-white">
                              <UserCheck className="w-4 h-4 mr-1" />
                              Uruhushya
                            </Button>
                            <Button size="sm" onClick={() => { setSelectedStudent(student); setShowMessageModal(true); }} className="bg-blue-600 text-white">
                              <Send className="w-4 h-4 mr-1" />
                              Tuma
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="incidents">
            <Card className="border-2 border-red-200">
              <CardHeader><CardTitle>Ibyaha Byose</CardTitle></CardHeader>
              <CardContent><p className="text-gray-600">Ibyaha byanditswe bizagaragara hano...</p></CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leaves">
            <Card className="border-2 border-red-200">
              <CardHeader><CardTitle>Uruhushya Rwose</CardTitle></CardHeader>
              <CardContent><p className="text-gray-600">Uruhushya rwanditswe ruzagaragara hano...</p></CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages">
            <Card className="border-2 border-red-200">
              <CardHeader><CardTitle>Ubutumwa Bwoherejwe</CardTitle></CardHeader>
              <CardContent><p className="text-gray-600">Ubutumwa bwoherejwe buzagaragara hano...</p></CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card className="border-2 border-red-200">
              <CardHeader><CardTitle>Amateka y'Ibyakozwe</CardTitle></CardHeader>
              <CardContent><p className="text-gray-600">Amateka yose azagaragara hano...</p></CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={showMessageModal} onOpenChange={setShowMessageModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Ohereza Ubutumwa</DialogTitle>
              <DialogDescription>Ohereza ubutumwa kuri {selectedStudent?.name}</DialogDescription>
            </DialogHeader>
            <form onSubmit={sendMessage} className="space-y-4">
              <div>
                <Label>Kuri</Label>
                <Select value={messageForm.recipient_type} onValueChange={(v) => setMessageForm({...messageForm, recipient_type: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Umunyeshuri</SelectItem>
                    <SelectItem value="parent">Umubyeyi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Ingingo</Label>
                <Input value={messageForm.subject} onChange={(e) => setMessageForm({...messageForm, subject: e.target.value})} required />
              </div>
              <div>
                <Label>Ubutumwa</Label>
                <Textarea value={messageForm.message} onChange={(e) => setMessageForm({...messageForm, message: e.target.value})} rows={5} required />
              </div>
              <div>
                <Label>Ingenzi</Label>
                <Select value={messageForm.priority} onValueChange={(v) => setMessageForm({...messageForm, priority: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Bike</SelectItem>
                    <SelectItem value="normal">Bisanzwe</SelectItem>
                    <SelectItem value="high">Byinshi</SelectItem>
                    <SelectItem value="urgent">Byihutirwa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowMessageModal(false)}>Hagarika</Button>
                <Button type="submit" className="bg-blue-600 text-white">Ohereza</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={showIncidentModal} onOpenChange={setShowIncidentModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Ongeraho Icyaha</DialogTitle>
              <DialogDescription>Andika icyaha cy'umunyeshuri {selectedStudent?.name}</DialogDescription>
            </DialogHeader>
            <form onSubmit={submitIncident} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Ubwoko</Label>
                  <Select value={incidentForm.conduct_type} onValueChange={(v) => setIncidentForm({...incidentForm, conduct_type: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="warning">Iburira</SelectItem>
                      <SelectItem value="suspension">Guhagarikwa</SelectItem>
                      <SelectItem value="late">Gutinda</SelectItem>
                      <SelectItem value="absence">Kutaza</SelectItem>
                      <SelectItem value="misbehavior">Imyitwarire Mibi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Ukomeye</Label>
                  <Select value={incidentForm.severity} onValueChange={(v) => setIncidentForm({...incidentForm, severity: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Bike</SelectItem>
                      <SelectItem value="medium">Hagati</SelectItem>
                      <SelectItem value="high">Byinshi</SelectItem>
                      <SelectItem value="critical">Bikomeye</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Ibisobanuro</Label>
                <Textarea value={incidentForm.description} onChange={(e) => setIncidentForm({...incidentForm, description: e.target.value})} required />
              </div>
              <div>
                <Label>Icyakozwe</Label>
                <Textarea value={incidentForm.action_taken} onChange={(e) => setIncidentForm({...incidentForm, action_taken: e.target.value})} />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowIncidentModal(false)}>Hagarika</Button>
                <Button type="submit" className="bg-red-600 text-white">Bika & Menyesha Ababyeyi</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={showLeaveModal} onOpenChange={setShowLeaveModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Ongeraho Uruhushya</DialogTitle>
              <DialogDescription>Andika uruhushya rw'umunyeshuri {selectedStudent?.name}</DialogDescription>
            </DialogHeader>
            <form onSubmit={submitLeave} className="space-y-4">
              <div>
                <Label>Ubwoko</Label>
                <Select value={leaveForm.leave_type} onValueChange={(v) => setLeaveForm({...leaveForm, leave_type: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sick">Kurwara</SelectItem>
                    <SelectItem value="home">Kuja Murugo</SelectItem>
                    <SelectItem value="emergency">Ihutirwa</SelectItem>
                    <SelectItem value="other">Ikindi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Impamvu</Label>
                <Textarea value={leaveForm.reason} onChange={(e) => setLeaveForm({...leaveForm, reason: e.target.value})} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Igihe cyo Gutangira</Label>
                  <Input type="datetime-local" value={leaveForm.start_time} onChange={(e) => setLeaveForm({...leaveForm, start_time: e.target.value})} required />
                </div>
                <div>
                  <Label>Igihe cyo Kurangira</Label>
                  <Input type="datetime-local" value={leaveForm.end_time} onChange={(e) => setLeaveForm({...leaveForm, end_time: e.target.value})} />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowLeaveModal(false)}>Hagarika</Button>
                <Button type="submit" className="bg-yellow-600 text-white">Bika & Menyesha Ababyeyi</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={showPatronShareModal} onOpenChange={setShowPatronShareModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Sangiza Patron Akazi</DialogTitle>
              <DialogDescription>Hitamo akazi wifuza gusangiza na Patron</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Button className="w-full justify-start" variant="outline">
                <Shield className="w-4 h-4 mr-2" />
                Sangiza Raporo y'Imyitwarire
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Users className="w-4 h-4 mr-2" />
                Sangiza Lisiti y'Abanyeshuri
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                Sangiza Ibyaha Bikomeye
              </Button>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPatronShareModal(false)}>Siga</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default DODDashboard;
