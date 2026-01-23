import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { BookOpen, Plus, Calendar, CheckCircle, Clock, AlertCircle, Download, Eye, Edit, Trash2, Filter, Search } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Badge } from '@/app/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export default function HomeworkManagementPage() {
  const [homework, setHomework] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedHomework, setSelectedHomework] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '', description: '', subject_id: '', trade_class_id: '', homework_type: 'assignment',
    total_marks: 100, instructions: '', due_date: '', submission_required: true, peer_review_required: false
  });

  useEffect(() => {
    fetchClasses();
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (selectedClass) fetchHomework();
  }, [selectedClass]);

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

  const fetchHomework = async () => {
    try {
      const res = await axios.get(`${API_URL}/homework/class/${selectedClass}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setHomework(res.data);
    } catch (err) { console.error(err); }
  };

  const handleCreate = async () => {
    try {
      await axios.post(`${API_URL}/homework`, formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setIsCreateOpen(false);
      fetchHomework();
      setFormData({
        title: '', description: '', subject_id: '', trade_class_id: '', homework_type: 'assignment',
        total_marks: 100, instructions: '', due_date: '', submission_required: true, peer_review_required: false
      });
    } catch (err) { console.error(err); }
  };

  const stats = [
    { title: 'Total Homework', value: homework.length, icon: BookOpen, color: 'from-blue-500 to-blue-600' },
    { title: 'Pending', value: homework.filter(h => new Date(h.due_date) > new Date()).length, icon: Clock, color: 'from-yellow-500 to-yellow-600' },
    { title: 'Completed', value: homework.filter(h => new Date(h.due_date) <= new Date()).length, icon: CheckCircle, color: 'from-green-500 to-green-600' },
    { title: 'Overdue', value: homework.filter(h => new Date(h.due_date) < new Date() && h.is_active).length, icon: AlertCircle, color: 'from-red-500 to-red-600' }
  ];

  const filteredHomework = homework.filter(h =>
    h.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.subject_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Homework Management</h1>
          <p className="text-gray-600">Create and manage homework assignments</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600">
              <Plus className="w-4 h-4 mr-2" /> Create Homework
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Homework</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={3} />
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
                  <Label>Type</Label>
                  <Select value={formData.homework_type} onValueChange={(v) => setFormData({...formData, homework_type: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="assignment">Assignment</SelectItem>
                      <SelectItem value="practice">Practice</SelectItem>
                      <SelectItem value="project">Project</SelectItem>
                      <SelectItem value="reading">Reading</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Total Marks</Label>
                  <Input type="number" value={formData.total_marks} onChange={(e) => setFormData({...formData, total_marks: parseInt(e.target.value)})} />
                </div>
              </div>
              <div>
                <Label>Instructions</Label>
                <Textarea value={formData.instructions} onChange={(e) => setFormData({...formData, instructions: e.target.value})} rows={3} />
              </div>
              <div>
                <Label>Due Date</Label>
                <Input type="datetime-local" value={formData.due_date} onChange={(e) => setFormData({...formData, due_date: e.target.value})} />
              </div>
              <Button onClick={handleCreate} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600">Create Homework</Button>
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
          <div className="flex items-center justify-between">
            <CardTitle>Homework List</CardTitle>
            <div className="flex gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 w-64" />
              </div>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.class_name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Marks</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredHomework.map(hw => (
                <TableRow key={hw.id}>
                  <TableCell className="font-medium">{hw.title}</TableCell>
                  <TableCell>{hw.subject_name}</TableCell>
                  <TableCell><Badge variant="outline">{hw.homework_type}</Badge></TableCell>
                  <TableCell>{new Date(hw.due_date).toLocaleDateString()}</TableCell>
                  <TableCell>{hw.total_marks}</TableCell>
                  <TableCell>
                    <Badge className={new Date(hw.due_date) > new Date() ? 'bg-green-500' : 'bg-red-500'}>
                      {new Date(hw.due_date) > new Date() ? 'Active' : 'Expired'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost"><Eye className="w-4 h-4" /></Button>
                      <Button size="sm" variant="ghost"><Edit className="w-4 h-4" /></Button>
                      <Button size="sm" variant="ghost"><Trash2 className="w-4 h-4 text-red-500" /></Button>
                    </div>
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
