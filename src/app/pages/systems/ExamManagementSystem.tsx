import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileText, Search, Filter, Plus, Edit, Trash2, Eye, Download, RefreshCw,
  Clock, Calendar, User, CheckCircle, XCircle, AlertCircle,
  TrendingUp, Users, Award, Target, Zap, Bell, Clipboard,
  BarChart3, PieChart, Activity, Save
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/app/components/ui/dialog';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Label } from '@/app/components/ui/label';
import { Progress } from '@/app/components/ui/progress';
import { toast } from 'sonner';
import { apiService } from '@/app/services/apiService';

interface Exam {
  id: number;
  code: string;
  title: string;
  subject_name?: string;
  trade: string;
  level: string;
  exam_type: string;
  exam_date: string;
  total_marks: number;
  passing_marks: number;
  status: string;
  students_enrolled: number;
}

interface ExamResult {
  student_id: number;
  first_name: string;
  last_name: string;
  student_code: string;
  obtained_marks: number | null;
  grade_letter: string | null;
  percentage: number | null;
  remarks: string | null;
}

const ExamManagementSystem: React.FC = () => {
  const [activeTab, setActiveTab] = useState('exams');
  const [loading, setLoading] = useState(true);
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [results, setResults] = useState<ExamResult[]>([]);
  const [showResultsDialog, setShowResultsDialog] = useState(false);
  const [showAddExamDialog, setShowAddExamDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [newExam, setNewExam] = useState({
    title: '',
    code: '',
    subject_id: '',
    exam_type: 'CAT',
    exam_date: '',
    total_marks: 100,
    passing_marks: 50,
    status: 'scheduled'
  });

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const data = await apiService.getExams();
      if (data.success) setExams(data.exams || []);
    } catch (error) {
      console.error('Fetch exams error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExam = async () => {
    try {
      setSubmitting(true);
      const response = await apiService.createExam(newExam);
      if (response.success) {
        toast.success('Exam created successfully!');
        setShowAddExamDialog(false);
        fetchExams();
      }
    } catch (error) {
      console.error('Create exam error:', error);
      toast.error('Failed to create exam');
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewResults = async (exam: Exam) => {
    setSelectedExam(exam);
    try {
      setLoading(true);
      // First get all students registered for this exam
      // For simplicity in this UI, we'll fetch results which should join with users
      const data = await apiService.getExamResults(exam.id);
      if (data.success) {
        setResults(data.results || []);
        setShowResultsDialog(true);
      }
    } catch (error) {
      console.error('Fetch results error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitResult = async (studentId: number, marks: number, remarks: string) => {
    if (!selectedExam) return;
    
    try {
      setSubmitting(true);
      const response = await apiService.submitExamResult(selectedExam.id, {
        student_id: studentId,
        obtained_marks: marks,
        remarks: remarks
      });

      if (response.success) {
        // Refresh results list
        const updatedData = await apiService.getExamResults(selectedExam.id);
        if (updatedData.success) setResults(updatedData.results || []);
        toast.success('Result submitted and parent notified!');
      } else {
        toast.error(response.message || 'Failed to submit result');
      }
    } catch (error) {
      console.error('Submit result error:', error);
      toast.error('Failed to submit result');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredExams = exams.filter(exam => 
    exam.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    exam.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && !exams.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-16 h-16 text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-xl text-purple-400">Loading Exam System...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto space-y-6"
      >
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Exam Management System
            </h1>
            <p className="text-gray-400 mt-2">Manage examinations and student results</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => setShowAddExamDialog(true)} className="bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              New Exam
            </Button>
            <Button onClick={fetchExams} variant="outline" className="border-purple-500/30 text-purple-400">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-gray-800/50 border border-purple-500/30 p-1 mb-8">
            <TabsTrigger value="exams" className="data-[state=active]:bg-purple-600">Active Exams</TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-purple-600">Performance Analytics</TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-purple-600">Exam History</TabsTrigger>
          </TabsList>

          <TabsContent value="exams" className="space-y-6">
            <div className="flex gap-4 mb-6">
              <div className="flex-1">
                <Input
                  placeholder="Search exams by title or code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-gray-800 border-purple-500/30 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredExams.map((exam) => (
                <Card key={exam.id} className="bg-gray-800/50 border-purple-500/20 hover:border-purple-500/50 transition-all group">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <Badge className="bg-purple-600">{exam.exam_type}</Badge>
                      <Badge variant="outline" className="border-purple-500/30 text-purple-400">{exam.status}</Badge>
                    </div>
                    <CardTitle className="text-xl text-white mt-2 group-hover:text-purple-400 transition-colors">
                      {exam.title}
                    </CardTitle>
                    <CardDescription className="text-gray-400">{exam.code} • {exam.subject_name}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-gray-400">
                        <Calendar className="w-4 h-4 mr-2 text-purple-400" />
                        {new Date(exam.exam_date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center text-sm text-gray-400">
                        <Users className="w-4 h-4 mr-2 text-purple-400" />
                        {exam.students_enrolled} Students Enrolled
                      </div>
                      <div className="flex items-center text-sm text-gray-400">
                        <Award className="w-4 h-4 mr-2 text-purple-400" />
                        Total Marks: {exam.total_marks} (Passing: {exam.passing_marks})
                      </div>
                      <Button 
                        className="w-full mt-4 bg-purple-600 hover:bg-purple-700"
                        onClick={() => handleViewResults(exam)}
                      >
                        <Clipboard className="w-4 h-4 mr-2" />
                        Enter / View Marks
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="bg-gray-800/50 border-purple-500/20 p-8 flex flex-col items-center justify-center text-center">
                <PieChart className="w-20 h-20 text-purple-400/20 mb-4" />
                <h3 className="text-xl font-bold text-white">Grade Distribution</h3>
                <p className="text-gray-400 mt-2">Visual representation of student performance across all exams</p>
              </Card>
              <Card className="bg-gray-800/50 border-purple-500/20 p-8 flex flex-col items-center justify-center text-center">
                <BarChart3 className="w-20 h-20 text-purple-400/20 mb-4" />
                <h3 className="text-xl font-bold text-white">Subject Wise Comparison</h3>
                <p className="text-gray-400 mt-2">Compare performance metrics between different subjects</p>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="history">
            <div className="bg-gray-800/50 border border-purple-500/20 rounded-lg p-12 text-center">
              <Clock className="w-16 h-16 text-purple-400/20 mx-auto mb-4" />
              <p className="text-gray-400">Past examinations and archived results will appear here</p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Add Exam Dialog */}
        <Dialog open={showAddExamDialog} onOpenChange={setShowAddExamDialog}>
          <DialogContent className="bg-gray-900 border-purple-500/30 text-white max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Examination</DialogTitle>
              <DialogDescription className="text-gray-400">
                Set up a new exam for students.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Exam Title</Label>
                  <Input 
                    placeholder="Midterm Exam" 
                    className="bg-gray-800 border-purple-500/30"
                    value={newExam.title}
                    onChange={(e) => setNewExam({...newExam, title: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Exam Code</Label>
                  <Input 
                    placeholder="EXM-2024-001" 
                    className="bg-gray-800 border-purple-500/30"
                    value={newExam.code}
                    onChange={(e) => setNewExam({...newExam, code: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select onValueChange={(v) => setNewExam({...newExam, exam_type: v})} defaultValue="CAT">
                    <SelectTrigger className="bg-gray-800 border-purple-500/30">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-purple-500/30 text-white">
                      <SelectItem value="CAT">CAT</SelectItem>
                      <SelectItem value="EXAM">Final Exam</SelectItem>
                      <SelectItem value="QUIZ">Quiz</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input 
                    type="date" 
                    className="bg-gray-800 border-purple-500/30"
                    value={newExam.exam_date}
                    onChange={(e) => setNewExam({...newExam, exam_date: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Total Marks</Label>
                  <Input 
                    type="number" 
                    className="bg-gray-800 border-purple-500/30"
                    value={newExam.total_marks}
                    onChange={(e) => setNewExam({...newExam, total_marks: parseInt(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Passing Marks</Label>
                  <Input 
                    type="number" 
                    className="bg-gray-800 border-purple-500/30"
                    value={newExam.passing_marks}
                    onChange={(e) => setNewExam({...newExam, passing_marks: parseInt(e.target.value)})}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setShowAddExamDialog(false)} variant="ghost" className="text-gray-400">Cancel</Button>
              <Button onClick={handleCreateExam} disabled={submitting} className="bg-purple-600 hover:bg-purple-700">
                {submitting ? 'Creating...' : 'Create Exam'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Results Dialog */}
        <Dialog open={showResultsDialog} onOpenChange={setShowResultsDialog}>
          <DialogContent className="bg-gray-900 border-purple-500/30 text-white max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>Exam Results: {selectedExam?.title}</DialogTitle>
              <DialogDescription className="text-gray-400">
                Enter marks for each student. Parents will be notified immediately upon saving.
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto pr-2 space-y-4 my-4">
              {results.length === 0 ? (
                <div className="text-center py-10 text-gray-500 italic">
                  No students registered for this exam or results not yet found.
                </div>
              ) : (
                results.map((result) => (
                  <ResultRow 
                    key={result.student_id} 
                    result={result} 
                    totalMarks={selectedExam?.total_marks || 100}
                    onSave={(marks, remarks) => handleSubmitResult(result.student_id, marks, remarks)}
                    submitting={submitting}
                  />
                ))
              )}
            </div>

            <DialogFooter>
              <Button onClick={() => setShowResultsDialog(false)} variant="outline" className="border-gray-600 text-gray-400">
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>
    </div>
  );
};

interface ResultRowProps {
  result: ExamResult;
  totalMarks: number;
  onSave: (marks: number, remarks: string) => void;
  submitting: boolean;
}

const ResultRow: React.FC<ResultRowProps> = ({ result, totalMarks, onSave, submitting }) => {
  const [marks, setMarks] = useState<string>(result.obtained_marks?.toString() || '');
  const [remarks, setRemarks] = useState<string>(result.remarks || '');
  const [isEditing, setIsEditing] = useState(!result.obtained_marks);

  const handleSave = () => {
    const numMarks = parseFloat(marks);
    if (isNaN(numMarks) || numMarks < 0 || numMarks > totalMarks) {
      toast.error(`Invalid marks. Must be between 0 and ${totalMarks}`);
      return;
    }
    onSave(numMarks, remarks);
    setIsEditing(false);
  };

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 flex-1">
        <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
          <User className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <p className="font-bold text-white">{result.first_name} {result.last_name}</p>
          <p className="text-xs text-gray-500">{result.student_code}</p>
        </div>
      </div>

      <div className="flex items-center gap-4 flex-[2]">
        {isEditing ? (
          <>
            <div className="w-24">
              <Label className="text-[10px] text-gray-500 uppercase">Marks</Label>
              <Input 
                type="number" 
                value={marks} 
                onChange={(e) => setMarks(e.target.value)}
                className="bg-gray-900 border-purple-500/30 h-8 text-sm"
              />
            </div>
            <div className="flex-1">
              <Label className="text-[10px] text-gray-500 uppercase">Remarks</Label>
              <Input 
                value={remarks} 
                onChange={(e) => setRemarks(e.target.value)}
                className="bg-gray-900 border-purple-500/30 h-8 text-sm"
                placeholder="Good effort, etc."
              />
            </div>
            <Button size="sm" onClick={handleSave} disabled={submitting} className="bg-green-600 hover:bg-green-700 mt-4">
              <Save className="w-3 h-3 mr-1" />
              Save
            </Button>
          </>
        ) : (
          <>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-bold text-purple-400">{marks} / {totalMarks}</span>
                <Badge className={result.grade_letter === 'F' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}>
                  {result.grade_letter || '-'}
                </Badge>
              </div>
              <Progress value={result.percentage || 0} className="h-1" />
              <p className="text-xs text-gray-400 mt-1 italic line-clamp-1">{remarks || 'No remarks'}</p>
            </div>
            <Button size="sm" variant="ghost" onClick={() => setIsEditing(true)} className="text-gray-400 hover:text-white">
              <Edit className="w-4 h-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default ExamManagementSystem;
