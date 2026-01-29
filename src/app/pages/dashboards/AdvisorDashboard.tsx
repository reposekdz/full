import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Users, Calendar, AlertTriangle, TrendingUp, Plus, Search, Filter, Clock, CheckCircle, XCircle, UserCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import { Badge } from '@/app/components/ui/badge';
import apiService from '@/app/services/apiService';

export default function AdvisorDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [overview, setOverview] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [newCase, setNewCase] = useState({ student_id: '', case_type: '', title: '', description: '', priority: 'medium' });
  const [newMeeting, setNewMeeting] = useState({ student_id: '', meeting_date: '', meeting_time: '', purpose: '', location: 'Advisor Office' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [overviewData, studentsData, meetingsData] = await Promise.all([
        apiService.getAdvisorOverview(),
        apiService.getAdvisorStudents(),
        apiService.getAdvisorMeetings()
      ]);
      setOverview(overviewData.data);
      setStudents(studentsData.students || []);
      setMeetings(meetingsData.meetings || []);
    } catch (error) {
      console.error('Failed to fetch advisor data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCase = async () => {
    try {
      await apiService.createStudentCase(newCase);
      alert('Case created successfully!');
      setNewCase({ student_id: '', case_type: '', title: '', description: '', priority: 'medium' });
      fetchData();
    } catch (error: any) {
      alert('Failed to create case: ' + error.message);
    }
  };

  const handleScheduleMeeting = async () => {
    try {
      await apiService.scheduleMeeting(newMeeting);
      alert('Meeting scheduled successfully!');
      setNewMeeting({ student_id: '', meeting_date: '', meeting_time: '', purpose: '', location: 'Advisor Office' });
      fetchData();
    } catch (error: any) {
      alert('Failed to schedule meeting: ' + error.message);
    }
  };

  const filteredStudents = students.filter(s =>
    `${s.first_name} ${s.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.student_id?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-5xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Advisor Dashboard
            </h1>
            <p className="text-gray-600 mt-2">Manage student cases and advisory sessions</p>
          </div>
          <div className="flex gap-3">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  New Case
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Student Case</DialogTitle>
                  <DialogDescription>Create a new advisory case for student support</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label>Student</Label>
                    <Select value={newCase.student_id} onValueChange={(v) => setNewCase({ ...newCase, student_id: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select student" />
                      </SelectTrigger>
                      <SelectContent>
                        {students.map(s => (
                          <SelectItem key={s.id} value={s.id.toString()}>
                            {s.first_name} {s.last_name} ({s.student_id})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Case Type</Label>
                    <Select value={newCase.case_type} onValueChange={(v) => setNewCase({ ...newCase, case_type: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="academic">Academic Support</SelectItem>
                        <SelectItem value="personal">Personal Issues</SelectItem>
                        <SelectItem value="discipline">Discipline</SelectItem>
                        <SelectItem value="career">Career Guidance</SelectItem>
                        <SelectItem value="financial">Financial Aid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Title</Label>
                    <Input value={newCase.title} onChange={(e) => setNewCase({ ...newCase, title: e.target.value })} placeholder="Case title" />
                  </div>
                  <div className="grid gap-2">
                    <Label>Description</Label>
                    <Textarea value={newCase.description} onChange={(e) => setNewCase({ ...newCase, description: e.target.value })} placeholder="Detailed description" />
                  </div>
                  <div className="grid gap-2">
                    <Label>Priority</Label>
                    <Select value={newCase.priority} onValueChange={(v) => setNewCase({ ...newCase, priority: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleCreateCase} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                    Create Case
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-2">
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Meeting
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Schedule Meeting</DialogTitle>
                  <DialogDescription>Schedule an advisory meeting with a student</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label>Student</Label>
                    <Select value={newMeeting.student_id} onValueChange={(v) => setNewMeeting({ ...newMeeting, student_id: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select student" />
                      </SelectTrigger>
                      <SelectContent>
                        {students.map(s => (
                          <SelectItem key={s.id} value={s.id.toString()}>
                            {s.first_name} {s.last_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Date</Label>
                    <Input type="date" value={newMeeting.meeting_date} onChange={(e) => setNewMeeting({ ...newMeeting, meeting_date: e.target.value })} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Time</Label>
                    <Input type="time" value={newMeeting.meeting_time} onChange={(e) => setNewMeeting({ ...newMeeting, meeting_time: e.target.value })} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Purpose</Label>
                    <Input value={newMeeting.purpose} onChange={(e) => setNewMeeting({ ...newMeeting, purpose: e.target.value })} placeholder="Meeting purpose" />
                  </div>
                  <div className="grid gap-2">
                    <Label>Location</Label>
                    <Input value={newMeeting.location} onChange={(e) => setNewMeeting({ ...newMeeting, location: e.target.value })} />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleScheduleMeeting} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                    Schedule Meeting
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          <Card className="border-2 border-blue-100 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6 text-center">
              <Users className="w-12 h-12 mx-auto text-blue-600 mb-2" />
              <p className="text-4xl font-black text-blue-900">{overview?.total_students || 0}</p>
              <p className="text-sm text-gray-600">Advised Students</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-red-100 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6 text-center">
              <AlertTriangle className="w-12 h-12 mx-auto text-red-600 mb-2" />
              <p className="text-4xl font-black text-red-900">{overview?.active_cases || 0}</p>
              <p className="text-sm text-gray-600">Active Cases</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-100 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6 text-center">
              <Calendar className="w-12 h-12 mx-auto text-green-600 mb-2" />
              <p className="text-4xl font-black text-green-900">{overview?.pending_meetings || 0}</p>
              <p className="text-sm text-gray-600">Upcoming Meetings</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-100 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-12 h-12 mx-auto text-purple-600 mb-2" />
              <p className="text-4xl font-black text-purple-900">{overview?.recent_activity?.length || 0}</p>
              <p className="text-sm text-gray-600">Recent Activities</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-2 border-b-2 border-gray-200">
          {['overview', 'students', 'meetings'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-semibold capitalize transition-all ${
                activeTab === tab
                  ? 'border-b-4 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <Card className="border-2 border-blue-100 shadow-xl">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {overview?.recent_activity?.map((activity: any, index: number) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-semibold">
                        {activity.first_name} {activity.last_name} ({activity.student_id})
                      </p>
                      <p className="text-sm text-gray-600">{activity.title}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(activity.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge className={
                      activity.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                      activity.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                      'bg-blue-100 text-blue-700'
                    }>
                      {activity.priority}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'students' && (
          <Card className="border-2 border-blue-100 shadow-xl">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Advised Students</CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search students..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 border-2"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2">
                      <th className="text-left py-3 px-4">Student</th>
                      <th className="text-left py-3 px-4">Class</th>
                      <th className="text-left py-3 px-4">Avg Grade</th>
                      <th className="text-left py-3 px-4">Incidents</th>
                      <th className="text-left py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((student, index) => (
                      <motion.tr
                        key={student.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b hover:bg-blue-50"
                      >
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-semibold">{student.first_name} {student.last_name}</p>
                            <p className="text-xs text-gray-500">{student.student_id}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-sm">{student.trade_name}</p>
                          <p className="text-xs text-gray-500">Level {student.level_number}</p>
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={
                            student.avg_grade >= 80 ? 'bg-green-100 text-green-700' :
                            student.avg_grade >= 60 ? 'bg-blue-100 text-blue-700' :
                            'bg-red-100 text-red-700'
                          }>
                            {student.avg_grade ? student.avg_grade.toFixed(1) + '%' : 'N/A'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          {student.recent_incidents > 0 ? (
                            <Badge className="bg-red-100 text-red-700">{student.recent_incidents}</Badge>
                          ) : (
                            <Badge className="bg-green-100 text-green-700">None</Badge>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'meetings' && (
          <Card className="border-2 border-blue-100 shadow-xl">
            <CardHeader>
              <CardTitle>Scheduled Meetings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {meetings.map((meeting, index) => (
                  <motion.div
                    key={meeting.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <Calendar className="w-10 h-10 text-blue-600" />
                      <div>
                        <p className="font-semibold">
                          {meeting.first_name} {meeting.last_name}
                        </p>
                        <p className="text-sm text-gray-600">{meeting.purpose}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(meeting.meeting_date).toLocaleDateString()} at {meeting.meeting_time}
                        </p>
                        <p className="text-xs text-gray-400">Location: {meeting.location}</p>
                      </div>
                    </div>
                    <Badge className={
                      meeting.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                      meeting.status === 'completed' ? 'bg-green-100 text-green-700' :
                      'bg-gray-100 text-gray-700'
                    }>
                      {meeting.status}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
