import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, CheckCircle, Clock, Award, Users, TrendingUp, Download, Eye, Edit, Save, Loader2, Medal } from 'lucide-react';
import { Card, CardContent } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { apiService } from '@/app/services/apiService';

interface TeacherGradingPageProps {
  teacherId: number;
  onNavigate: (page: string) => void;
}

const TeacherGradingPage: React.FC<TeacherGradingPageProps> = ({ teacherId, onNavigate }) => {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [marksObtained, setMarksObtained] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(true);
  const [grading, setGrading] = useState(false);
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const data = await apiService.getAssignmentsByTeacher(teacherId);
      setAssignments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateGrade = (percentage: number) => {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C';
    if (percentage >= 50) return 'D';
    return 'F';
  };

  const fetchSubmissions = async (assignmentId: number) => {
    try {
      const [submissionsData, analyticsData] = await Promise.all([
        apiService.getAssignmentSubmissions(assignmentId),
        apiService.getAssignmentAnalytics(assignmentId)
      ]);
      
      // Academic Automation: Auto-calculation of Rankings
      const graded = Array.isArray(submissionsData) ? submissionsData.filter(s => s.marks_obtained !== null) : [];
      const ungraded = Array.isArray(submissionsData) ? submissionsData.filter(s => s.marks_obtained === null) : [];
      
      const sortedGraded = [...graded].sort((a, b) => b.marks_obtained - a.marks_obtained);
      
      let currentRank = 1;
      const rankedGraded = sortedGraded.map((s, index, array) => {
        if (index > 0 && s.marks_obtained !== array[index - 1].marks_obtained) {
          currentRank = index + 1;
        }
        return { ...s, rank: currentRank };
      });

      setSubmissions([...rankedGraded, ...ungraded]);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      setSubmissions([]);
    }
  };

  const handleGrade = async () => {
    if (!selectedSubmission || !marksObtained) {
      alert('Shyiramo amanota');
      return;
    }

    const marks = parseFloat(marksObtained);
    if (isNaN(marks) || marks < 0 || marks > selectedAssignment.total_marks) {
      alert(`Amanota agomba kuba hagati ya 0 na ${selectedAssignment.total_marks}`);
      return;
    }

    setGrading(true);
    try {
      const percentage = (marks / selectedAssignment.total_marks) * 100;
      const autoGrade = calculateGrade(percentage);

      const response = await apiService.submitGrade({
        submission_id: selectedSubmission.id,
        marks_obtained: marks,
        total_marks: selectedAssignment.total_marks,
        feedback,
        grade: autoGrade,
        graded_by: teacherId
      });

      if (response.success || response.id) {
        alert('Byakosorejwe neza!');
        setSelectedSubmission(null);
        setMarksObtained('');
        setFeedback('');
        fetchSubmissions(selectedAssignment.id);
      } else {
        alert('Ikosa ryabaye');
      }
    } catch (error) {
      console.error('Error grading:', error);
      alert('Ikosa ryabaye');
    } finally {
      setGrading(false);
    }
  };

  const stats = selectedAssignment ? [
    { label: 'Byoherejwe', value: analytics?.submitted_count || 0, icon: FileText, color: 'from-blue-600 to-indigo-600' },
    { label: 'Byakosorejwe', value: analytics?.graded_count || 0, icon: CheckCircle, color: 'from-green-600 to-emerald-600' },
    { label: 'Ikigereranyo', value: `${analytics?.average_marks?.toFixed(1) || 0}/${selectedAssignment.total_marks}`, icon: TrendingUp, color: 'from-purple-600 to-pink-600' },
    { label: 'Ijanisha', value: `${analytics?.pass_rate?.toFixed(1) || 0}%`, icon: Award, color: 'from-yellow-600 to-orange-600' }
  ] : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center">
        <Loader2 className="w-16 h-16 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black text-gray-900 mb-2">Gukosora Ibikorwa</h1>
              <p className="text-lg text-gray-600 font-semibold">Review & Grade Student Submissions</p>
            </div>
            <Button onClick={() => onNavigate('teacher-dashboard')} variant="outline" className="font-bold border-2 border-green-200">
              ← Subira kuri Dashboard
            </Button>
          </div>
        </motion.div>

        {!selectedAssignment ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assignments.map((assignment, index) => (
              <motion.div key={assignment.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                <Card className="border-2 border-gray-200 hover:border-green-400 hover:shadow-xl transition-all cursor-pointer"
                  onClick={() => { setSelectedAssignment(assignment); fetchSubmissions(assignment.id); }}>
                  <CardContent className="p-6">
                    <Badge className="mb-3 bg-gradient-to-r from-green-600 to-blue-600 text-white">{assignment.type}</Badge>
                    <h3 className="text-xl font-black text-gray-900 mb-2">{assignment.title}</h3>
                    <p className="text-sm text-gray-600 mb-4">{assignment.class_name} - {assignment.course_name}</p>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-blue-50 rounded-lg p-3 text-center">
                        <p className="text-2xl font-black text-blue-600">{assignment.submission_count}</p>
                        <p className="text-xs text-gray-600 font-semibold">Byoherejwe</p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3 text-center">
                        <p className="text-2xl font-black text-green-600">{assignment.graded_count}</p>
                        <p className="text-xs text-gray-600 font-semibold">Byakosorejwe</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <div>
            <Button onClick={() => { 
              if (selectedAssignment) {
                setSelectedAssignment(null); 
                setSubmissions([]); 
              } else {
                onNavigate('teacher-dashboard');
              }
            }} variant="outline" className="mb-6 font-bold">
              ← Subira
            </Button>

            {/* Analytics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {stats.map((stat, index) => (
                <motion.div key={index} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.1 }}>
                  <Card className="border-2 border-gray-100">
                    <CardContent className="p-6">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center mx-auto mb-3`}>
                        <stat.icon className="w-7 h-7 text-white" />
                      </div>
                      <p className="text-2xl font-black text-gray-900 mb-1 text-center">{stat.value}</p>
                      <p className="text-sm font-bold text-gray-600 text-center">{stat.label}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Grade Distribution */}
            {analytics?.grade_distribution && analytics.grade_distribution.length > 0 && (
              <Card className="border-2 border-gray-100 mb-8">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-black text-gray-900 mb-4">Ikurikirana ry'Amanota</h2>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                    {analytics.grade_distribution.map((dist: any, index: number) => (
                      <div key={index} className="text-center">
                        <div className={`w-16 h-16 rounded-full ${dist.grade === 'A+' || dist.grade === 'A' ? 'bg-green-600' : dist.grade === 'F' ? 'bg-red-600' : 'bg-yellow-600'} flex items-center justify-center mx-auto mb-2`}>
                          <span className="text-2xl font-black text-white">{dist.count}</span>
                        </div>
                        <p className="font-bold text-gray-900">{dist.grade}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Submissions */}
            <div className="space-y-4">
              {submissions.map((submission, index) => (
                <motion.div key={submission.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }}>
                  <Card className={`border-2 ${submission.marks_obtained ? 'border-green-200 bg-green-50' : 'border-blue-200 bg-blue-50'} hover:shadow-xl transition-all`}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-black text-gray-900">{submission.student_name}</h3>
                            {submission.rank && (
                              <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white flex items-center gap-1">
                                <Medal className="w-3 h-3" />
                                Rank: #{submission.rank}
                              </Badge>
                            )}
                            {submission.marks_obtained !== null ? (
                              <Badge className="bg-green-600 text-white">Byakosorejwe</Badge>
                            ) : (
                              <Badge className="bg-blue-600 text-white">Ntibikora</Badge>
                            )}
                            {submission.is_late && <Badge className="bg-red-600 text-white">Byatinze</Badge>}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{submission.student_email}</p>
                          <p className="text-sm text-gray-700 line-clamp-2">{submission.submission_text}</p>
                          {submission.files && submission.files.length > 0 && (
                            <div className="mt-2 flex items-center space-x-2">
                              <FileText className="w-4 h-4 text-blue-600" />
                              <span className="text-sm font-semibold text-blue-600">{submission.files.length} Dosiye</span>
                            </div>
                          )}
                        </div>
                        <div className="text-right ml-4">
                          {submission.marks_obtained ? (
                            <div>
                              <p className="text-3xl font-black text-green-600">{submission.percentage.toFixed(1)}%</p>
                              <Badge className={`${submission.grade === 'A+' || submission.grade === 'A' ? 'bg-green-600' : submission.grade === 'F' ? 'bg-red-600' : 'bg-yellow-600'} text-white text-lg px-3 py-1 mt-2`}>
                                {submission.grade}
                              </Badge>
                            </div>
                          ) : (
                            <Button onClick={() => { setSelectedSubmission(submission); setMarksObtained(''); setFeedback(''); }}
                              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold">
                              <Edit className="w-4 h-4 mr-2" />
                              Kosora
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Grading Modal */}
      <AnimatePresence>
        {selectedSubmission && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedSubmission(null)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()} className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              
              <div className="sticky top-0 bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 rounded-t-3xl">
                <h2 className="text-3xl font-black mb-2">Kosora Igisubizo</h2>
                <p className="text-white/90">{selectedSubmission.student_name}</p>
              </div>

              <div className="p-6">
                <div className="mb-6">
                  <h3 className="text-xl font-black text-gray-900 mb-3">Igisubizo cy'Umunyeshuri</h3>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedSubmission.submission_text || 'Nta gisubizo cy\'inyandiko'}</p>
                  </div>
                  {selectedSubmission.files && selectedSubmission.files.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-bold text-gray-900 mb-2">Amadosiye Yoherejwe:</h4>
                      <div className="space-y-2">
                        {selectedSubmission.files.map((file: any, index: number) => (
                          <div key={index} className="flex items-center justify-between bg-blue-50 rounded-lg p-3">
                            <span className="text-sm font-semibold text-gray-900">{file.file_name}</span>
                            <Button size="sm" variant="outline" className="font-bold">
                              <Download className="w-4 h-4 mr-2" />
                              Kuramo
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-lg font-black text-gray-900 mb-3">
                      Amanota ({selectedAssignment.total_marks} Max)
                    </label>
                    <Input
                      type="number"
                      value={marksObtained}
                      onChange={(e) => setMarksObtained(e.target.value)}
                      placeholder="0"
                      min="0"
                      max={selectedAssignment.total_marks}
                      className="h-14 text-2xl font-bold border-2 border-gray-200 focus:border-green-500"
                      disabled={grading}
                    />
                    {marksObtained && (
                      <p className="mt-2 text-lg font-bold text-green-600">
                        Ijanisha: {((parseFloat(marksObtained) / selectedAssignment.total_marks) * 100).toFixed(1)}%
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-lg font-black text-gray-900 mb-3">Icyiyumviro</label>
                    <Textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Andika icyiyumviro cy'umunyeshuri..."
                      className="min-h-[150px] text-base border-2 border-gray-200 focus:border-green-500"
                      disabled={grading}
                    />
                  </div>

                  <Button
                    onClick={handleGrade}
                    disabled={grading || !marksObtained}
                    className="w-full h-14 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-lg font-black"
                  >
                    {grading ? (
                      <span className="flex items-center justify-center">
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        Tegereza...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        <Save className="w-5 h-5 mr-2" />
                        Bika Amanota
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TeacherGradingPage;
