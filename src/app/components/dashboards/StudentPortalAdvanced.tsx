import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Award, 
  Calendar,
  FileText,
  DollarSign,
  User,
  TrendingUp,
  Clock,
  Upload,
  Download,
  MessageSquare,
  Trophy,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Progress } from '../ui/progress';
import apiService from '../../services/apiService';

export default function StudentPortalAdvanced() {
  const [dashboard, setDashboard] = useState<any>(null);
  const [marks, setMarks] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [feeStatement, setFeeStatement] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [conductRecords, setConductRecords] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSubmission, setShowSubmission] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [submissionText, setSubmissionText] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [
        dashboardData,
        marksData,
        attendanceData,
        assignmentsData,
        feesData,
        achievementsData,
        conductData
      ] = await Promise.all([
        apiService.getStudentDashboard(),
        apiService.getStudentMarks({}),
        apiService.getStudentAttendance({}),
        apiService.getStudentAssignments({}),
        apiService.getStudentFeeStatement({}),
        apiService.getStudentAchievements(),
        apiService.getStudentConduct()
      ]);

      if (dashboardData.success) setDashboard(dashboardData.dashboard);
      if (marksData.success) setMarks(marksData.marks || []);
      if (attendanceData.success) setAttendance(attendanceData.attendance || []);
      if (assignmentsData.success) setAssignments(assignmentsData.assignments || []);
      if (feesData.success) setFeeStatement(feesData.statement || []);
      if (achievementsData.success) setAchievements(achievementsData.achievements || []);
      if (conductData.success) setConductRecords(conductData.records || []);
    } catch (error) {
      console.error('Error fetching student data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAssignment = async () => {
    try {
      const result = await apiService.submitAssignment(selectedAssignment.id, {
        submission_text: submissionText,
        submission_date: new Date().toISOString()
      });

      if (result.success) {
        setShowSubmission(false);
        setSubmissionText('');
        setSelectedAssignment(null);
        fetchData();
        alert('Assignment submitted successfully!');
      }
    } catch (error: any) {
      alert('Failed to submit assignment: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const profile = dashboard?.profile;
  const academicStats = dashboard?.academicStats;
  const attendanceStats = dashboard?.attendanceStats;
  const feeBalance = dashboard?.feeBalance || 0;

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Student Portal</h1>
          <p className="text-gray-600">Welcome, {profile?.first_name} {profile?.last_name}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Download Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Award className="w-4 h-4" />
              Overall Average
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{academicStats?.overall_average || 0}%</div>
            <p className="text-xs opacity-90">{academicStats?.total_subjects || 0} subjects</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Calendar className="w-4 h-4" />
              Attendance Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{attendanceStats?.attendance_rate || 0}%</div>
            <p className="text-xs opacity-90">
              {attendanceStats?.present_days || 0} / {attendanceStats?.total_days || 0} days
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <FileText className="w-4 h-4" />
              Pending Assignments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {dashboard?.pendingAssignments?.length || 0}
            </div>
            <p className="text-xs opacity-90">Due soon</p>
          </CardContent>
        </Card>

        <Card className={`bg-gradient-to-br ${feeBalance > 0 ? 'from-red-500 to-red-600' : 'from-green-500 to-green-600'} text-white`}>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <DollarSign className="w-4 h-4" />
              Fee Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{feeBalance.toLocaleString()} RWF</div>
            <p className="text-xs opacity-90">{feeBalance > 0 ? 'Outstanding' : 'Paid'}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="academic">Academic</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="fees">Fees</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Student Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Student ID:</span>
                  <span className="font-medium">{profile?.student_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Trade:</span>
                  <span className="font-medium">{profile?.trade_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Level:</span>
                  <span className="font-medium">Level {profile?.level_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Academic Year:</span>
                  <span className="font-medium">{profile?.academic_year}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <Badge variant={profile?.status === 'active' ? 'default' : 'secondary'}>
                    {profile?.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Grades</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dashboard?.recentGrades?.map((grade: any, index: number) => (
                    <div key={index} className="flex justify-between items-center p-2 border rounded">
                      <div>
                        <div className="font-medium">{grade.subject}</div>
                        <div className="text-sm text-gray-600">{grade.exam_type}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">{grade.final_marks}%</div>
                      </div>
                    </div>
                  )) || <p className="text-center text-gray-500">No grades available</p>}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Pending Assignments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboard?.pendingAssignments?.map((assignment: any) => (
                  <div key={assignment.id} className="p-3 border rounded-lg flex justify-between items-center">
                    <div>
                      <div className="font-medium">{assignment.title}</div>
                      <div className="text-sm text-gray-600">{assignment.class_name}</div>
                    </div>
                    <div className="flex gap-2 items-center">
                      <div className="text-sm text-gray-600">
                        Due: {new Date(assignment.due_date).toLocaleDateString()}
                      </div>
                      <Button 
                        size="sm"
                        onClick={() => {
                          setSelectedAssignment(assignment);
                          setShowSubmission(true);
                        }}
                      >
                        Submit
                      </Button>
                    </div>
                  </div>
                )) || <p className="text-center text-gray-500">No pending assignments</p>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="academic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Academic Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Subject</th>
                      <th className="text-left p-2">Exam Type</th>
                      <th className="text-left p-2">Marks</th>
                      <th className="text-left p-2">Grade</th>
                      <th className="text-left p-2">Term</th>
                    </tr>
                  </thead>
                  <tbody>
                    {marks.map((mark: any, index: number) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="p-2">{mark.subject}</td>
                        <td className="p-2">{mark.exam_type}</td>
                        <td className="p-2 font-medium">{mark.final_marks}%</td>
                        <td className="p-2">
                          <Badge 
                            variant={
                              mark.final_marks >= 90 ? 'default' :
                              mark.final_marks >= 70 ? 'secondary' :
                              'destructive'
                            }
                          >
                            {mark.grade}
                          </Badge>
                        </td>
                        <td className="p-2">{mark.term}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Assignments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {assignments.map((assignment: any) => (
                  <div key={assignment.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-medium text-lg">{assignment.title}</div>
                        <div className="text-sm text-gray-600 mt-1">{assignment.description}</div>
                        <div className="flex gap-4 mt-2 text-xs text-gray-500">
                          <span>Due: {new Date(assignment.due_date).toLocaleDateString()}</span>
                          <span>Max Marks: {assignment.max_marks}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Badge 
                          variant={
                            assignment.submission_status === 'submitted' ? 'default' :
                            assignment.submission_status === 'graded' ? 'secondary' :
                            'destructive'
                          }
                        >
                          {assignment.submission_status || 'Not Submitted'}
                        </Badge>
                        {!assignment.submission_status && (
                          <Button 
                            size="sm"
                            onClick={() => {
                              setSelectedAssignment(assignment);
                              setShowSubmission(true);
                            }}
                          >
                            Submit
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Records</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Progress value={attendanceStats?.attendance_rate || 0} className="h-3" />
                <p className="text-sm text-gray-600 mt-2">
                  Attendance Rate: {attendanceStats?.attendance_rate || 0}%
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Date</th>
                      <th className="text-left p-2">Status</th>
                      <th className="text-left p-2">Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendance.map((record: any, index: number) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="p-2">{new Date(record.attendance_date).toLocaleDateString()}</td>
                        <td className="p-2">
                          <Badge 
                            variant={
                              record.status === 'present' ? 'default' :
                              record.status === 'late' ? 'secondary' :
                              'destructive'
                            }
                          >
                            {record.status}
                          </Badge>
                        </td>
                        <td className="p-2 text-sm text-gray-600">{record.remarks || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fees" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Fee Statement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-sm text-gray-600">Total Balance</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {feeBalance.toLocaleString()} RWF
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Fee Type</th>
                        <th className="text-left p-2">Amount</th>
                        <th className="text-left p-2">Status</th>
                        <th className="text-left p-2">Due Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {feeStatement.map((fee: any, index: number) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="p-2">{fee.fee_type}</td>
                          <td className="p-2 font-medium">{fee.amount} RWF</td>
                          <td className="p-2">
                            <Badge variant={fee.status === 'paid' ? 'default' : 'destructive'}>
                              {fee.status}
                            </Badge>
                          </td>
                          <td className="p-2">{new Date(fee.due_date).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-600" />
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {achievements.map((achievement: any) => (
                    <div key={achievement.id} className="p-3 border rounded-lg bg-yellow-50">
                      <div className="font-medium">{achievement.title}</div>
                      <div className="text-sm text-gray-600">{achievement.description}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(achievement.achievement_date).toLocaleDateString()}
                      </div>
                    </div>
                  )) || <p className="text-center text-gray-500">No achievements yet</p>}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                  Conduct Records
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {conductRecords.map((record: any) => (
                    <div key={record.id} className="p-3 border rounded-lg">
                      <div className="font-medium">{record.incident_type}</div>
                      <div className="text-sm text-gray-600">{record.description}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(record.incident_date).toLocaleDateString()}
                      </div>
                    </div>
                  )) || <p className="text-center text-gray-500">No conduct records</p>}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={showSubmission} onOpenChange={setShowSubmission}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Submit Assignment - {selectedAssignment?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Assignment Details</Label>
              <div className="p-3 bg-gray-50 rounded-lg mt-2">
                <div className="text-sm">{selectedAssignment?.description}</div>
                <div className="text-xs text-gray-600 mt-2">
                  Due: {selectedAssignment && new Date(selectedAssignment.due_date).toLocaleDateString()}
                </div>
              </div>
            </div>
            <div>
              <Label>Your Submission</Label>
              <Textarea 
                rows={8}
                value={submissionText}
                onChange={(e) => setSubmissionText(e.target.value)}
                placeholder="Enter your assignment submission here..."
              />
            </div>
            <div>
              <Label>Attach File (Optional)</Label>
              <Input type="file" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubmission(false)}>Cancel</Button>
            <Button onClick={handleSubmitAssignment}>Submit Assignment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
