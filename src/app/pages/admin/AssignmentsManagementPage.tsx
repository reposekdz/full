import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { FileText, Plus, Calendar, Users, TrendingUp, Download, Upload, CheckCircle2, XCircle, Clock } from 'lucide-react';
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
import { Progress } from '@/app/components/ui/progress';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export default function AssignmentsManagementPage() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isGradeOpen, setIsGradeOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '', description: '', subject_id: '', trade_class_id: '', assignment_type: 'individual',
    total_marks: 100, instructions: '', due_date: '', submission_deadline: '', allow_late_submission: true,
    late_submission_penalty: 10, is_published: true
  });
  const [gradeData, setGradeData] = useState({ marks_obtained: 0, grade_letter: '', teacher_feedback: '' });

  useEffect(() => {
    fetchClasses();
    fetchSubjects();
    fetchAssignments();
  }, []);

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

  const fetchAssignments = async () => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const res = await axios.get(`${API_URL}/assignments/teacher/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAssignments(res.data);
    } catch (err) { console.error(err); }
  };

  const handleCreate = async () => {
    try {
      await axios.post(`${API_URL}/assignments`, formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setIsCreateOpen(false);
      fetchAssignments();
    } catch (err) { console.error(err); }
  };

  const handleGrade = async () => {
    try {
      await axios.put(`${API_URL}/assignments/submissions/${selectedSubmission.id}/grade`, gradeData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setIsGradeOpen(false);
      fetchAssignments();
    } catch (err) { console.error(err); }
  };

  const stats = [
    { title: 'Total Assignments', value: assignments.length, icon: FileText, color: 'from-purple-500 to-purple-600' },
    { title: 'Published', value: assignments.filter(a => a.is_published).length, icon: CheckCircle2, color: 'from-green-500 to-green-600' },
    { title: 'Draft', value: assignments.filter(a => !a.is_published).length, icon: Clock, color: 'from-yellow-500 to-yellow-600' },
    { title: 'Avg Completion', value: '78%', icon: TrendingUp, color: 'from-blue-500 to-blue-600' }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Assignments Management</h1>
          <p className="text-gray-600">Create, manage and grade assignments</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-purple-600 to-indigo-600">
              <Plus className="w-4 h-4 mr-2" /> Create Assignment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Assignment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="Assignment title" />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={3} placeholder="Detailed description" />
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
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Type</Label>
                  <Select value={formData.assignment_type} onValueChange={(v) => setFormData({...formData, assignment_type: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual">Individual</SelectItem>
                      <SelectItem value="group">Group</SelectItem>
                      <SelectItem value="project">Project</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Total Marks</Label>
                  <Input type="number" value={formData.total_marks} onChange={(e) => setFormData({...formData, total_marks: parseInt(e.target.value)})} />
                </div>
                <div>
                  <Label>Late Penalty (%)</Label>
                  <Input type="number" value={formData.late_submission_penalty} onChange={(e) => setFormData({...formData, late_submission_penalty: parseInt(e.target.value)})} />
                </div>
              </div>
              <div>
                <Label>Instructions</Label>
                <Textarea value={formData.instructions} onChange={(e) => setFormData({...formData, instructions: e.target.value})} rows={4} placeholder="Detailed instructions for students" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Due Date</Label>
                  <Input type="datetime-local" value={formData.due_date} onChange={(e) => setFormData({...formData, due_date: e.target.value})} />
                </div>
                <div>
                  <Label>Submission Deadline</Label>
                  <Input type="datetime-local" value={formData.submission_deadline} onChange={(e) => setFormData({...formData, submission_deadline: e.target.value})} />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Label>Allow Late Submission</Label>
                <Switch checked={formData.allow_late_submission} onCheckedChange={(v) => setFormData({...formData, allow_late_submission: v})} />
              </div>
              <div className="flex items-center justify-between">
                <Label>Publish Immediately</Label>
                <Switch checked={formData.is_published} onCheckedChange={(v) => setFormData({...formData, is_published: v})} />
              </div>
              <Button onClick={handleCreate} className="w-full bg-gradient-to-r from-purple-600 to-indigo-600">Create Assignment</Button>
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
          <CardTitle>Assignments List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Marks</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submissions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignments.map(a => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{a.title}</TableCell>
                  <TableCell>{a.subject_name}</TableCell>
                  <TableCell>{a.class_name}</TableCell>
                  <TableCell><Badge variant="outline">{a.assignment_type}</Badge></TableCell>
                  <TableCell>{new Date(a.due_date).toLocaleDateString()}</TableCell>
                  <TableCell>{a.total_marks}</TableCell>
                  <TableCell>
                    <Badge className={a.is_published ? 'bg-green-500' : 'bg-gray-500'}>
                      {a.is_published ? 'Published' : 'Draft'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline">View (0)</Button>
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
