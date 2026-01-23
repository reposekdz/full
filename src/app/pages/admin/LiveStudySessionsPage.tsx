import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Video, Users, Calendar, Clock, Plus, Play, Square, Mic, MicOff, Camera, CameraOff, MessageSquare } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Badge } from '@/app/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Switch } from '@/app/components/ui/switch';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export default function LiveStudySessionsPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '', description: '', session_type: 'lecture', subject_id: '', trade_class_id: '',
    max_participants: 50, scheduled_start: '', scheduled_end: '', recording_enabled: true
  });

  useEffect(() => {
    fetchSessions();
    fetchClasses();
    fetchSubjects();
    const interval = setInterval(fetchSessions, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchSessions = async () => {
    try {
      const res = await axios.get(`${API_URL}/liveStudy/sessions/active`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSessions(res.data || []);
    } catch (err) { console.error(err); }
  };

  const fetchClasses = async () => {
    try {
      const res = await axios.get(`${API_URL}/class-management/classes`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setClasses(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchSubjects = async () => {
    try {
      const res = await axios.get(`${API_URL}/dos/curriculum`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSubjects(res.data);
    } catch (err) { console.error(err); }
  };

  const handleCreate = async () => {
    try {
      await axios.post(`${API_URL}/liveStudy/sessions`, formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setIsCreateOpen(false);
      fetchSessions();
    } catch (err) { console.error(err); }
  };

  const joinSession = async (sessionId: number) => {
    try {
      await axios.post(`${API_URL}/liveStudy/sessions/${sessionId}/join`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchSessions();
    } catch (err) { console.error(err); }
  };

  const stats = [
    { title: 'Active Sessions', value: sessions.filter(s => s.status === 'active').length, icon: Video, color: 'from-red-500 to-red-600' },
    { title: 'Scheduled', value: sessions.filter(s => s.status === 'scheduled').length, icon: Calendar, color: 'from-blue-500 to-blue-600' },
    { title: 'Total Participants', value: sessions.reduce((acc, s) => acc + (s.current_participants || 0), 0), icon: Users, color: 'from-green-500 to-green-600' },
    { title: 'Avg Duration', value: '45 min', icon: Clock, color: 'from-purple-500 to-purple-600' }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Live Study Sessions</h1>
          <p className="text-gray-600">Virtual classrooms and real-time collaboration</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-red-600 to-pink-600">
              <Plus className="w-4 h-4 mr-2" /> Create Session
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Live Study Session</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Session Title</Label>
                <Input value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="e.g., Mathematics Review Session" />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Session Type</Label>
                  <Select value={formData.session_type} onValueChange={(v) => setFormData({...formData, session_type: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lecture">Lecture</SelectItem>
                      <SelectItem value="discussion">Discussion</SelectItem>
                      <SelectItem value="workshop">Workshop</SelectItem>
                      <SelectItem value="tutoring">Tutoring</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Max Participants</Label>
                  <Input type="number" value={formData.max_participants} onChange={(e) => setFormData({...formData, max_participants: parseInt(e.target.value)})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Subject</Label>
                  <Select value={formData.subject_id} onValueChange={(v) => setFormData({...formData, subject_id: v})}>
                    <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                    <SelectContent>
                      {subjects.map(s => <SelectItem key={s.id} value={s.id.toString()}>{s.subject_name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Class</Label>
                  <Select value={formData.trade_class_id} onValueChange={(v) => setFormData({...formData, trade_class_id: v})}>
                    <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                    <SelectContent>
                      {classes.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.class_name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Time</Label>
                  <Input type="datetime-local" value={formData.scheduled_start} onChange={(e) => setFormData({...formData, scheduled_start: e.target.value})} />
                </div>
                <div>
                  <Label>End Time</Label>
                  <Input type="datetime-local" value={formData.scheduled_end} onChange={(e) => setFormData({...formData, scheduled_end: e.target.value})} />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Label>Enable Recording</Label>
                <Switch checked={formData.recording_enabled} onCheckedChange={(v) => setFormData({...formData, recording_enabled: v})} />
              </div>
              <Button onClick={handleCreate} className="w-full bg-gradient-to-r from-red-600 to-pink-600">Create Session</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className={`bg-gradient-to-r ${stat.color} p-6 text-white`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-white/80 text-sm">{stat.title}</p>
                      <p className="text-3xl font-black mt-1">{stat.value}</p>
                    </div>
                    <stat.icon className="w-10 h-10 opacity-80" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Session</TableHead>
                <TableHead>Host</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead>Participants</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.map(session => (
                <TableRow key={session.id}>
                  <TableCell>
                    <div>
                      <p className="font-semibold">{session.title}</p>
                      <p className="text-xs text-gray-500">Code: {session.access_code}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-blue-600 text-white text-xs">
                          {session.host_name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{session.host_name}</span>
                    </div>
                  </TableCell>
                  <TableCell><Badge variant="outline">{session.session_type}</Badge></TableCell>
                  <TableCell>{session.subject_name}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>{new Date(session.scheduled_start).toLocaleString()}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span>{session.current_participants || 0}/{session.max_participants}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={
                      session.status === 'active' ? 'bg-green-500' :
                      session.status === 'scheduled' ? 'bg-blue-500' : 'bg-gray-500'
                    }>
                      {session.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button size="sm" onClick={() => joinSession(session.id)} className="bg-gradient-to-r from-red-600 to-pink-600">
                      <Play className="w-3 h-3 mr-1" /> Join
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
