import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Brain, Plus, Clock, CheckCircle, XCircle, TrendingUp, Edit, Trash2, Eye } from 'lucide-react';
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
import { RadioGroup, RadioGroupItem } from '@/app/components/ui/radio-group';
import { Progress } from '@/app/components/ui/progress';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export default function QuizSystemPage() {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isQuestionOpen, setIsQuestionOpen] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<any>(null);
  const [quizForm, setQuizForm] = useState({
    title: '', description: '', subject_id: '', trade_class_id: '', duration_minutes: 30,
    total_marks: 100, passing_marks: 60, shuffle_questions: true, show_results: true, is_published: false
  });
  const [questionForm, setQuestionForm] = useState({
    question_text: '', question_type: 'multiple_choice', marks: 5, options: ['', '', '', ''], correct_answer: ''
  });

  useEffect(() => {
    fetchClasses();
    fetchSubjects();
    loadMockQuizzes();
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

  const loadMockQuizzes = () => {
    setQuizzes([
      { id: 1, title: 'Mathematics Quiz 1', subject: 'Mathematics', class: 'SOD L3', duration: 30, total_marks: 100, questions: 20, attempts: 45, avg_score: 78, is_published: true },
      { id: 2, title: 'Physics Midterm', subject: 'Physics', class: 'AUT L4A', duration: 60, total_marks: 150, questions: 30, attempts: 38, avg_score: 72, is_published: true },
      { id: 3, title: 'Chemistry Practice', subject: 'Chemistry', class: 'BDC L5', duration: 45, total_marks: 120, questions: 25, attempts: 0, avg_score: 0, is_published: false }
    ]);
  };

  const handleCreateQuiz = () => {
    const newQuiz = {
      id: quizzes.length + 1,
      ...quizForm,
      questions: 0,
      attempts: 0,
      avg_score: 0
    };
    setQuizzes([...quizzes, newQuiz]);
    setIsCreateOpen(false);
    setQuizForm({
      title: '', description: '', subject_id: '', trade_class_id: '', duration_minutes: 30,
      total_marks: 100, passing_marks: 60, shuffle_questions: true, show_results: true, is_published: false
    });
  };

  const handleAddQuestion = () => {
    setIsQuestionOpen(false);
    setQuestionForm({
      question_text: '', question_type: 'multiple_choice', marks: 5, options: ['', '', '', ''], correct_answer: ''
    });
  };

  const stats = [
    { title: 'Total Quizzes', value: quizzes.length, icon: Brain, color: 'from-purple-500 to-purple-600' },
    { title: 'Published', value: quizzes.filter(q => q.is_published).length, icon: CheckCircle, color: 'from-green-500 to-green-600' },
    { title: 'Total Attempts', value: quizzes.reduce((acc, q) => acc + q.attempts, 0), icon: TrendingUp, color: 'from-blue-500 to-blue-600' },
    { title: 'Avg Score', value: `${Math.round(quizzes.reduce((acc, q) => acc + q.avg_score, 0) / quizzes.length) || 0}%`, icon: TrendingUp, color: 'from-yellow-500 to-yellow-600' }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Quiz System</h1>
          <p className="text-gray-600">Create and manage quizzes with auto-grading</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600">
              <Plus className="w-4 h-4 mr-2" /> Create Quiz
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Quiz</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Quiz Title</Label>
                <Input value={quizForm.title} onChange={(e) => setQuizForm({...quizForm, title: e.target.value})} placeholder="e.g., Mathematics Quiz 1" />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={quizForm.description} onChange={(e) => setQuizForm({...quizForm, description: e.target.value})} rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Subject</Label>
                  <Select value={quizForm.subject_id} onValueChange={(v) => setQuizForm({...quizForm, subject_id: v})}>
                    <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                    <SelectContent>
                      {subjects.map(s => <SelectItem key={s.id} value={s.id.toString()}>{s.subject_name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Class</Label>
                  <Select value={quizForm.trade_class_id} onValueChange={(v) => setQuizForm({...quizForm, trade_class_id: v})}>
                    <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                    <SelectContent>
                      {classes.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.class_name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Duration (min)</Label>
                  <Input type="number" value={quizForm.duration_minutes} onChange={(e) => setQuizForm({...quizForm, duration_minutes: parseInt(e.target.value)})} />
                </div>
                <div>
                  <Label>Total Marks</Label>
                  <Input type="number" value={quizForm.total_marks} onChange={(e) => setQuizForm({...quizForm, total_marks: parseInt(e.target.value)})} />
                </div>
                <div>
                  <Label>Passing Marks</Label>
                  <Input type="number" value={quizForm.passing_marks} onChange={(e) => setQuizForm({...quizForm, passing_marks: parseInt(e.target.value)})} />
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Shuffle Questions</Label>
                  <Switch checked={quizForm.shuffle_questions} onCheckedChange={(v) => setQuizForm({...quizForm, shuffle_questions: v})} />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Show Results Immediately</Label>
                  <Switch checked={quizForm.show_results} onCheckedChange={(v) => setQuizForm({...quizForm, show_results: v})} />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Publish Quiz</Label>
                  <Switch checked={quizForm.is_published} onCheckedChange={(v) => setQuizForm({...quizForm, is_published: v})} />
                </div>
              </div>
              <Button onClick={handleCreateQuiz} className="w-full bg-gradient-to-r from-purple-600 to-pink-600">Create Quiz</Button>
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
          <CardTitle>Quizzes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Questions</TableHead>
                <TableHead>Attempts</TableHead>
                <TableHead>Avg Score</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quizzes.map(quiz => (
                <TableRow key={quiz.id}>
                  <TableCell className="font-medium">{quiz.title}</TableCell>
                  <TableCell>{quiz.subject}</TableCell>
                  <TableCell>{quiz.class}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span>{quiz.duration} min</span>
                    </div>
                  </TableCell>
                  <TableCell>{quiz.questions}</TableCell>
                  <TableCell>{quiz.attempts}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={quiz.avg_score} className="w-16 h-2" />
                      <span className="text-sm font-semibold">{quiz.avg_score}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={quiz.is_published ? 'bg-green-500' : 'bg-gray-500'}>
                      {quiz.is_published ? 'Published' : 'Draft'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => { setSelectedQuiz(quiz); setIsQuestionOpen(true); }}>
                        <Plus className="w-4 h-4" />
                      </Button>
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

      <Dialog open={isQuestionOpen} onOpenChange={setIsQuestionOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Question to {selectedQuiz?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Question Text</Label>
              <Textarea value={questionForm.question_text} onChange={(e) => setQuestionForm({...questionForm, question_text: e.target.value})} rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Question Type</Label>
                <Select value={questionForm.question_type} onValueChange={(v) => setQuestionForm({...questionForm, question_type: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                    <SelectItem value="true_false">True/False</SelectItem>
                    <SelectItem value="short_answer">Short Answer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Marks</Label>
                <Input type="number" value={questionForm.marks} onChange={(e) => setQuestionForm({...questionForm, marks: parseInt(e.target.value)})} />
              </div>
            </div>
            {questionForm.question_type === 'multiple_choice' && (
              <div className="space-y-3">
                <Label>Options</Label>
                {questionForm.options.map((opt, idx) => (
                  <Input key={idx} value={opt} onChange={(e) => {
                    const newOpts = [...questionForm.options];
                    newOpts[idx] = e.target.value;
                    setQuestionForm({...questionForm, options: newOpts});
                  }} placeholder={`Option ${idx + 1}`} />
                ))}
                <div>
                  <Label>Correct Answer</Label>
                  <RadioGroup value={questionForm.correct_answer} onValueChange={(v) => setQuestionForm({...questionForm, correct_answer: v})}>
                    {questionForm.options.map((opt, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <RadioGroupItem value={opt} id={`opt-${idx}`} />
                        <Label htmlFor={`opt-${idx}`}>{opt || `Option ${idx + 1}`}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </div>
            )}
            <Button onClick={handleAddQuestion} className="w-full bg-gradient-to-r from-purple-600 to-pink-600">Add Question</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
