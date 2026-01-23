import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, Upload, Send, CheckCircle, Clock, AlertCircle, Download, Eye, Award, TrendingUp, Target, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Textarea } from '@/app/components/ui/textarea';

interface StudentAssignmentsPageProps {
  studentId: number;
}

const StudentAssignmentsPage: React.FC<StudentAssignmentsPageProps> = ({ studentId }) => {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [submissionText, setSubmissionText] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [performance, setPerformance] = useState<any>(null);

  useEffect(() => {
    fetchAssignments();
    fetchPerformance();
  }, []);

  const fetchAssignments = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/assignments/assignments/student/${studentId}`);
      const data = await response.json();
      setAssignments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPerformance = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/assignments/analytics/student/${studentId}`);
      const data = await response.json();
      setPerformance(data);
    } catch (error) {
      console.error('Error fetching performance:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async () => {
    if (!selectedAssignment || (!submissionText && files.length === 0)) {
      alert('Andika igisubizo cyangwa ushyire dosiye');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('assignment_id', selectedAssignment.id);
      formData.append('student_id', studentId.toString());
      formData.append('submission_text', submissionText);
      
      files.forEach(file => {
        formData.append('files', file);
      });

      const response = await fetch('http://localhost:5000/api/assignments/submissions', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        alert('Igisubizo cyoherejwe neza!');
        setSubmissionText('');
        setFiles([]);
        setSelectedAssignment(null);
        fetchAssignments();
        fetchPerformance();
      } else {
        alert('Ikosa ryabaye. Gerageza ukundi.');
      }
    } catch (error) {
      console.error('Error submitting:', error);
      alert('Ikosa ryabaye. Gerageza ukundi.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (assignment: any) => {
    if (assignment.submission_status === 'graded') {
      return <Badge className="bg-green-600 text-white">Byakosorowe</Badge>;
    } else if (assignment.submission_id) {
      return <Badge className="bg-blue-600 text-white">Byoherejwe</Badge>;
    } else if (new Date(assignment.due_date) < new Date()) {
      return <Badge className="bg-red-600 text-white">Byarenze</Badge>;
    }
    return <Badge className="bg-yellow-600 text-white">Ntibikora</Badge>;
  };

  const stats = [
    { label: 'Ibikorwa Byose', value: performance?.performance?.[0]?.total_assignments || 0, icon: FileText, color: 'from-blue-600 to-indigo-600' },
    { label: 'Byakozwe', value: performance?.performance?.[0]?.completed_assignments || 0, icon: CheckCircle, color: 'from-green-600 to-emerald-600' },
    { label: 'Ikigereranyo', value: `${performance?.performance?.[0]?.average_percentage?.toFixed(1) || 0}%`, icon: TrendingUp, color: 'from-purple-600 to-pink-600' },
    { label: 'Amanota', value: performance?.performance?.[0]?.total_marks_obtained?.toFixed(0) || 0, icon: Award, color: 'from-yellow-600 to-orange-600' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <Loader2 className="w-16 h-16 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-black text-gray-900 mb-2">Ibikorwa by'Ishuri</h1>
          <p className="text-lg text-gray-600 font-semibold">Homework, Quizzes & Assignments</p>
        </motion.div>

        {/* Performance Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <motion.div key={index} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.1 }}>
              <Card className="border-2 border-gray-100 hover:shadow-xl transition-all">
                <CardContent className="p-6">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center mx-auto mb-3`}>
                    <stat.icon className="w-7 h-7 text-white" />
                  </div>
                  <p className="text-3xl font-black text-gray-900 mb-1 text-center">{stat.value}</p>
                  <p className="text-sm font-bold text-gray-600 text-center">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Recent Grades */}
        {performance?.recentGrades && performance.recentGrades.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <Card className="border-2 border-gray-100">
              <CardContent className="p-6">
                <h2 className="text-2xl font-black text-gray-900 mb-4">Amanota Yaheruka</h2>
                <div className="space-y-3">
                  {performance.recentGrades.slice(0, 5).map((grade: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex-1">
                        <p className="font-bold text-gray-900">{grade.assignment_title}</p>
                        <p className="text-sm text-gray-600">{grade.type}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-black text-blue-600">{grade.percentage.toFixed(1)}%</p>
                        <Badge className={`${grade.grade === 'A+' || grade.grade === 'A' ? 'bg-green-600' : grade.grade === 'F' ? 'bg-red-600' : 'bg-yellow-600'} text-white`}>
                          {grade.grade}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Assignments List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {assignments.map((assignment, index) => (
            <motion.div key={assignment.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
              <Card className="border-2 border-gray-200 hover:border-blue-400 hover:shadow-xl transition-all">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">{assignment.type}</Badge>
                        {getStatusBadge(assignment)}
                      </div>
                      <h3 className="text-xl font-black text-gray-900 mb-2">{assignment.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">{assignment.course_name}</p>
                      <p className="text-sm text-gray-700 line-clamp-2">{assignment.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4 text-sm">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{new Date(assignment.due_date).toLocaleDateString('rw-RW')}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Target className="w-4 h-4" />
                      <span>{assignment.total_marks} Amanota</span>
                    </div>
                  </div>

                  {assignment.submission_status === 'graded' && (
                    <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-gray-900">Amanota Yawe:</span>
                        <span className="text-3xl font-black text-green-600">{assignment.percentage.toFixed(1)}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Amanota: {assignment.marks_obtained}/{assignment.total_marks}</span>
                        <Badge className={`${assignment.grade === 'A+' || assignment.grade === 'A' ? 'bg-green-600' : assignment.grade === 'F' ? 'bg-red-600' : 'bg-yellow-600'} text-white text-lg px-3 py-1`}>
                          {assignment.grade}
                        </Badge>
                      </div>
                      {assignment.feedback && (
                        <div className="mt-3 pt-3 border-t border-green-200">
                          <p className="text-sm font-semibold text-gray-700">Icyiyumviro: {assignment.feedback}</p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button onClick={() => setSelectedAssignment(assignment)} className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold">
                      {assignment.submission_id ? 'Reba Igisubizo' : 'Subiza'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Submission Modal */}
      <AnimatePresence>
        {selectedAssignment && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedAssignment(null)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()} className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              
              <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-3xl">
                <h2 className="text-3xl font-black mb-2">{selectedAssignment.title}</h2>
                <p className="text-white/90">{selectedAssignment.course_name}</p>
              </div>

              <div className="p-6">
                {/* Assignment Details */}
                <div className="mb-6">
                  <h3 className="text-xl font-black text-gray-900 mb-3">Ibisobanuro</h3>
                  <div className="bg-gray-50 rounded-xl p-4">
                    {selectedAssignment.rich_text_content ? (
                      <div dangerouslySetInnerHTML={{ __html: selectedAssignment.rich_text_content }} className="prose max-w-none" />
                    ) : (
                      <p className="text-gray-700">{selectedAssignment.description}</p>
                    )}
                  </div>
                </div>

                {/* Submission Form */}
                {!selectedAssignment.submission_id && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-lg font-black text-gray-900 mb-3">Igisubizo Cyawe</label>
                      <Textarea
                        value={submissionText}
                        onChange={(e) => setSubmissionText(e.target.value)}
                        placeholder="Andika igisubizo cyawe hano..."
                        className="min-h-[200px] text-base border-2 border-gray-200 focus:border-blue-500"
                        disabled={submitting}
                      />
                    </div>

                    <div>
                      <label className="block text-lg font-black text-gray-900 mb-3">Shyira Dosiye (PDF, DOCX, TXT, Amafoto)</label>
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-500 transition-colors">
                        <input
                          type="file"
                          multiple
                          accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
                          onChange={handleFileChange}
                          className="hidden"
                          id="file-upload"
                          disabled={submitting}
                        />
                        <label htmlFor="file-upload" className="cursor-pointer">
                          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                          <p className="text-gray-600 font-semibold">Kanda hano ushyire dosiye</p>
                          <p className="text-sm text-gray-500 mt-2">PDF, DOCX, TXT, JPG, PNG (Max 50MB)</p>
                        </label>
                      </div>
                      {files.length > 0 && (
                        <div className="mt-4 space-y-2">
                          {files.map((file, index) => (
                            <div key={index} className="flex items-center justify-between bg-blue-50 rounded-lg p-3">
                              <span className="text-sm font-semibold text-gray-900">{file.name}</span>
                              <span className="text-xs text-gray-600">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <Button
                      onClick={handleSubmit}
                      disabled={submitting || (!submissionText && files.length === 0)}
                      className="w-full h-14 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-lg font-black"
                    >
                      {submitting ? (
                        <span className="flex items-center justify-center">
                          <Loader2 className="w-5 h-5 animate-spin mr-2" />
                          Tegereza...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center">
                          <Send className="w-5 h-5 mr-2" />
                          Ohereza Igisubizo
                        </span>
                      )}
                    </Button>
                  </div>
                )}

                {/* View Submission */}
                {selectedAssignment.submission_id && (
                  <div className="space-y-6">
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
                      <h3 className="text-xl font-black text-gray-900 mb-3">Igisubizo Cyawe</h3>
                      <p className="text-gray-700 whitespace-pre-wrap">{selectedAssignment.submission_text || 'Nta gisubizo cy\'inyandiko'}</p>
                    </div>

                    {selectedAssignment.submission_status === 'graded' && (
                      <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
                        <h3 className="text-xl font-black text-gray-900 mb-4">Amanota</h3>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="text-center">
                            <p className="text-4xl font-black text-green-600">{selectedAssignment.percentage.toFixed(1)}%</p>
                            <p className="text-sm text-gray-600">Ijanisha</p>
                          </div>
                          <div className="text-center">
                            <p className="text-4xl font-black text-blue-600">{selectedAssignment.grade}</p>
                            <p className="text-sm text-gray-600">Icyiciro</p>
                          </div>
                        </div>
                        {selectedAssignment.feedback && (
                          <div className="pt-4 border-t border-green-200">
                            <p className="font-bold text-gray-900 mb-2">Icyiyumviro cy'Umwarimu:</p>
                            <p className="text-gray-700">{selectedAssignment.feedback}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <Button onClick={() => setSelectedAssignment(null)} variant="outline" className="w-full mt-6 h-12 border-2 font-bold">
                  Funga
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudentAssignmentsPage;
