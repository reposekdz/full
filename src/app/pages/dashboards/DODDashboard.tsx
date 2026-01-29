import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { AlertTriangle, TrendingDown, Users, BarChart3, Plus, Search, Filter, Shield, FileText, Calendar, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import { Badge } from '@/app/components/ui/badge';
import apiService from '@/app/services/apiService';

export default function DODDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [overview, setOverview] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [newIncident, setNewIncident] = useState({
    student_id: '',
    incident_type: '',
    description: '',
    severity: 'moderate',
    action_taken: '',
    reported_by: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [overviewData, studentsData, statsData] = await Promise.all([
        apiService.getDODOverview(),
        apiService.getDODStudents(),
        apiService.getDisciplineStatistics()
      ]);
      setOverview(overviewData.data);
      setStudents(studentsData.students || []);
      setStatistics(statsData.statistics);
    } catch (error) {
      console.error('Failed to fetch DOD data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateIncident = async () => {
    try {
      await apiService.createIncident(newIncident);
      alert('Incident recorded successfully!');
      setNewIncident({
        student_id: '',
        incident_type: '',
        description: '',
        severity: 'moderate',
        action_taken: '',
        reported_by: ''
      });
      fetchData();
    } catch (error: any) {
      alert('Failed to create incident: ' + error.message);
    }
  };

  const filteredStudents = students.filter(s =>
    `${s.first_name} ${s.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.student_id?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-orange-100">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-5xl font-black bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              Director of Discipline Dashboard
            </h1>
            <p className="text-gray-600 mt-2">Student discipline and behavior management</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-red-600 to-orange-600 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Record Incident
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Record Discipline Incident</DialogTitle>
                <DialogDescription>Document a discipline incident for proper tracking</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Student</Label>
                  <Select value={newIncident.student_id} onValueChange={(v) => setNewIncident({ ...newIncident, student_id: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select student" />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map(s => (
                        <SelectItem key={s.id} value={s.id.toString()}>
                          {s.first_name} {s.last_name} ({s.student_id}) - {s.total_incidents} incidents
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Incident Type</Label>
                  <Select value={newIncident.incident_type} onValueChange={(v) => setNewIncident({ ...newIncident, incident_type: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Late Arrival">Late Arrival</SelectItem>
                      <SelectItem value="Absence">Unauthorized Absence</SelectItem>
                      <SelectItem value="Disruptive Behavior">Disruptive Behavior</SelectItem>
                      <SelectItem value="Fighting">Fighting</SelectItem>
                      <SelectItem value="Disrespect">Disrespect to Staff</SelectItem>
                      <SelectItem value="Cheating">Academic Dishonesty</SelectItem>
                      <SelectItem value="Vandalism">Vandalism</SelectItem>
                      <SelectItem value="Dress Code">Dress Code Violation</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Severity</Label>
                  <Select value={newIncident.severity} onValueChange={(v) => setNewIncident({ ...newIncident, severity: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minor">Minor</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="major">Major</SelectItem>
                      <SelectItem value="severe">Severe</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Description</Label>
                  <Textarea
                    value={newIncident.description}
                    onChange={(e) => setNewIncident({ ...newIncident, description: e.target.value })}
                    placeholder="Detailed description of the incident"
                    rows={4}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Action Taken</Label>
                  <Input
                    value={newIncident.action_taken}
                    onChange={(e) => setNewIncident({ ...newIncident, action_taken: e.target.value })}
                    placeholder="e.g., Warning, Detention, Suspension"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Reported By</Label>
                  <Input
                    value={newIncident.reported_by}
                    onChange={(e) => setNewIncident({ ...newIncident, reported_by: e.target.value })}
                    placeholder="Name of staff member reporting"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreateIncident} className="bg-gradient-to-r from-red-600 to-orange-600 text-white">
                  Record Incident
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          <Card className="border-2 border-red-100 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6 text-center">
              <AlertTriangle className="w-12 h-12 mx-auto text-red-600 mb-2" />
              <p className="text-4xl font-black text-red-900">{overview?.total_incidents_30days || 0}</p>
              <p className="text-sm text-gray-600">Incidents (30 days)</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-yellow-100 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6 text-center">
              <Shield className="w-12 h-12 mx-auto text-yellow-600 mb-2" />
              <p className="text-4xl font-black text-yellow-900">{overview?.active_warnings || 0}</p>
              <p className="text-sm text-gray-600">Active Warnings</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-orange-100 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6 text-center">
              <XCircle className="w-12 h-12 mx-auto text-orange-600 mb-2" />
              <p className="text-4xl font-black text-orange-900">{overview?.recent_suspensions || 0}</p>
              <p className="text-sm text-gray-600">Suspensions (30 days)</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-100 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6 text-center">
              <Users className="w-12 h-12 mx-auto text-blue-600 mb-2" />
              <p className="text-4xl font-black text-blue-900">{students.length}</p>
              <p className="text-sm text-gray-600">Students with Records</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-2 border-b-2 border-gray-200">
          {['overview', 'students', 'statistics'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-semibold capitalize transition-all ${
                activeTab === tab
                  ? 'border-b-4 border-red-600 text-red-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <Card className="border-2 border-red-100 shadow-xl">
            <CardHeader>
              <CardTitle>Recent Incidents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {overview?.recent_incidents?.map((incident: any, index: number) => (
                  <motion.div
                    key={incident.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start justify-between p-4 bg-gray-50 rounded-lg border-l-4 border-red-500"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <p className="font-bold text-lg">
                          {incident.first_name} {incident.last_name}
                        </p>
                        <Badge className="bg-blue-100 text-blue-700">{incident.student_id}</Badge>
                        <Badge className={
                          incident.severity === 'severe' ? 'bg-red-100 text-red-700' :
                          incident.severity === 'major' ? 'bg-orange-100 text-orange-700' :
                          incident.severity === 'moderate' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }>
                          {incident.severity}
                        </Badge>
                      </div>
                      <p className="text-sm font-semibold text-red-700 mb-1">{incident.incident_type}</p>
                      <p className="text-sm text-gray-600 mb-2">{incident.description}</p>
                      <div className="flex gap-4 text-xs text-gray-500">
                        <span>📅 {new Date(incident.incident_date).toLocaleDateString()}</span>
                        <span>👤 Reported by: {incident.reported_by}</span>
                        <span>⚡ Action: {incident.action_taken}</span>
                      </div>
                      {incident.class_name && (
                        <p className="text-xs text-gray-500 mt-1">Class: {incident.class_name}</p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'students' && (
          <Card className="border-2 border-red-100 shadow-xl">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Students with Discipline Records</CardTitle>
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
                      <th className="text-center py-3 px-4">Total Incidents</th>
                      <th className="text-center py-3 px-4">Recent (30d)</th>
                      <th className="text-left py-3 px-4">Last Incident</th>
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
                        className="border-b hover:bg-red-50"
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
                        <td className="py-3 px-4 text-center">
                          <Badge className="bg-red-100 text-red-700">
                            {student.total_incidents}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge className={
                            student.recent_incidents > 3 ? 'bg-red-100 text-red-700' :
                            student.recent_incidents > 0 ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }>
                            {student.recent_incidents}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-xs text-gray-600">
                            {student.last_incident ? new Date(student.last_incident).toLocaleDateString() : 'N/A'}
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          {student.recent_incidents > 3 ? (
                            <Badge className="bg-red-100 text-red-700">High Risk</Badge>
                          ) : student.recent_incidents > 1 ? (
                            <Badge className="bg-yellow-100 text-yellow-700">Monitor</Badge>
                          ) : (
                            <Badge className="bg-green-100 text-green-700">Good</Badge>
                          )}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'statistics' && (
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-2 border-red-100 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Incidents by Type
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {statistics?.by_type?.map((item: any, index: number) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <span className="font-medium">{item.incident_type}</span>
                      <Badge className="bg-red-100 text-red-700">{item.count}</Badge>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-orange-100 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Incidents by Severity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {statistics?.by_severity?.map((item: any, index: number) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <span className="font-medium capitalize">{item.severity}</span>
                      <Badge className={
                        item.severity === 'severe' ? 'bg-red-100 text-red-700' :
                        item.severity === 'major' ? 'bg-orange-100 text-orange-700' :
                        item.severity === 'moderate' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }>
                        {item.count}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-100 shadow-xl md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Monthly Trend (Last 6 Months)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {statistics?.by_month?.map((item: any, index: number) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-4"
                    >
                      <span className="font-medium w-24">{item.month}</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(item.count / (statistics?.by_month?.[0]?.count || 1)) * 100}%` }}
                          transition={{ delay: index * 0.1 + 0.3, duration: 0.5 }}
                          className="bg-gradient-to-r from-red-500 to-orange-500 h-full flex items-center justify-end pr-2"
                        >
                          <span className="text-white text-xs font-bold">{item.count}</span>
                        </motion.div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
