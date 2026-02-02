import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Users, TrendingUp, AlertTriangle, Calendar, Award, FileText, 
  BarChart3, Clock, CheckCircle, XCircle, Activity, Target,
  UserCheck, Heart, Shield, Bell, Download, Filter, Search
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';

const ComprehensiveDODManagement = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeIncidents: 0,
    pendingCases: 0,
    counselingSessions: 0,
    attendanceRate: 0,
    disciplineScore: 0
  });
  const [incidents, setIncidents] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, incidentsRes, studentsRes] = await Promise.all([
        fetch('http://localhost:5000/api/dod-comprehensive/stats'),
        fetch('http://localhost:5000/api/dod-comprehensive/incidents'),
        fetch('http://localhost:5000/api/dod-comprehensive/students')
      ]);
      
      const statsData = await statsRes.json();
      const incidentsData = await incidentsRes.json();
      const studentsData = await studentsRes.json();
      
      if (statsData.success) setStats(statsData.stats);
      if (incidentsData.success) setIncidents(incidentsData.incidents);
      if (studentsData.success) setStudents(studentsData.students);
    } catch (error) {
      console.error('Error:', error);
    }
    setLoading(false);
  };

  const statsCards = [
    { title: 'Total Students', value: stats.totalStudents, icon: Users, color: 'from-blue-500 to-indigo-500', change: '+5%' },
    { title: 'Active Incidents', value: stats.activeIncidents, icon: AlertTriangle, color: 'from-red-500 to-orange-500', change: '-12%' },
    { title: 'Pending Cases', value: stats.pendingCases, icon: FileText, color: 'from-yellow-500 to-amber-500', change: '+3%' },
    { title: 'Counseling Sessions', value: stats.counselingSessions, icon: Heart, color: 'from-pink-500 to-rose-500', change: '+8%' },
    { title: 'Attendance Rate', value: `${stats.attendanceRate}%`, icon: UserCheck, color: 'from-green-500 to-teal-500', change: '+2%' },
    { title: 'Discipline Score', value: `${stats.disciplineScore}%`, icon: Award, color: 'from-purple-500 to-violet-500', change: '+15%' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-orange-50 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-black text-gray-900">Comprehensive Management</h1>
              <p className="text-gray-600 mt-2">Director of Discipline Dashboard</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="gap-2">
                <Filter className="w-4 h-4" />
                Filter
              </Button>
              <Button className="gap-2 bg-gradient-to-r from-green-600 to-yellow-600">
                <Download className="w-4 h-4" />
                Export Report
              </Button>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {statsCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-green-300">
                <CardContent className="p-0">
                  <div className={`bg-gradient-to-br ${stat.color} p-6 text-white relative overflow-hidden`}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <p className="text-white/90 text-sm mb-2">{stat.title}</p>
                          <p className="text-4xl font-black">{stat.value}</p>
                        </div>
                        <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.5 }}>
                          <stat.icon className="w-12 h-12 opacity-90" />
                        </motion.div>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-sm font-medium">{stat.change} this month</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <Tabs defaultValue="incidents" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white shadow-lg rounded-xl p-2 border-2">
            <TabsTrigger value="incidents" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-orange-500 data-[state=active]:text-white">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Incidents
            </TabsTrigger>
            <TabsTrigger value="students" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white">
              <Users className="w-4 h-4 mr-2" />
              Students
            </TabsTrigger>
            <TabsTrigger value="counseling" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-rose-500 data-[state=active]:text-white">
              <Heart className="w-4 h-4 mr-2" />
              Counseling
            </TabsTrigger>
            <TabsTrigger value="attendance" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-teal-500 data-[state=active]:text-white">
              <UserCheck className="w-4 h-4 mr-2" />
              Attendance
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-violet-500 data-[state=active]:text-white">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="incidents">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Incidents</CardTitle>
                  <div className="flex gap-2">
                    <Input placeholder="Search incidents..." className="w-64" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    <Button size="sm">
                      <Search className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {incidents.slice(0, 10).map((incident) => (
                      <TableRow key={incident.id} className="hover:bg-gray-50">
                        <TableCell>{new Date(incident.date).toLocaleDateString()}</TableCell>
                        <TableCell className="font-medium">{incident.student_name}</TableCell>
                        <TableCell>{incident.type}</TableCell>
                        <TableCell>
                          <Badge className={
                            incident.severity === 'high' ? 'bg-red-500' :
                            incident.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                          }>
                            {incident.severity}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={incident.status === 'resolved' ? 'default' : 'secondary'}>
                            {incident.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline">View</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="students">
            <Card>
              <CardHeader>
                <CardTitle>Student Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {students.slice(0, 9).map((student) => (
                    <motion.div
                      key={student.id}
                      whileHover={{ scale: 1.02 }}
                      className="p-4 border-2 rounded-xl hover:border-green-300 hover:shadow-lg transition-all"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {student.first_name?.[0]}{student.last_name?.[0]}
                        </div>
                        <div>
                          <p className="font-bold">{student.first_name} {student.last_name}</p>
                          <p className="text-sm text-gray-500">{student.student_code}</p>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Trade:</span>
                          <span className="font-medium">{student.trade_code}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Level:</span>
                          <span className="font-medium">{student.level_number}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Status:</span>
                          <Badge className="bg-green-500">Active</Badge>
                        </div>
                      </div>
                      <Button size="sm" className="w-full mt-3" variant="outline">View Details</Button>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="counseling">
            <Card>
              <CardHeader>
                <CardTitle>Counseling Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center justify-between p-4 border-2 rounded-xl hover:border-pink-300 hover:shadow-lg transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center">
                          <Heart className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="font-bold">Student Name {i}</p>
                          <p className="text-sm text-gray-500">Scheduled for {new Date().toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge>Upcoming</Badge>
                        <Button size="sm">Manage</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="attendance">
            <Card>
              <CardHeader>
                <CardTitle>Attendance Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-6 bg-gradient-to-br from-green-100 to-teal-100 rounded-xl">
                    <div className="flex items-center justify-between mb-4">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                      <span className="text-3xl font-black text-green-600">95%</span>
                    </div>
                    <p className="font-bold text-gray-900">Present</p>
                    <p className="text-sm text-gray-600">1,425 students</p>
                  </div>
                  <div className="p-6 bg-gradient-to-br from-yellow-100 to-amber-100 rounded-xl">
                    <div className="flex items-center justify-between mb-4">
                      <Clock className="w-8 h-8 text-yellow-600" />
                      <span className="text-3xl font-black text-yellow-600">3%</span>
                    </div>
                    <p className="font-bold text-gray-900">Late</p>
                    <p className="text-sm text-gray-600">45 students</p>
                  </div>
                  <div className="p-6 bg-gradient-to-br from-red-100 to-orange-100 rounded-xl">
                    <div className="flex items-center justify-between mb-4">
                      <XCircle className="w-8 h-8 text-red-600" />
                      <span className="text-3xl font-black text-red-600">2%</span>
                    </div>
                    <p className="font-bold text-gray-900">Absent</p>
                    <p className="text-sm text-gray-600">30 students</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Performance Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 border-2 rounded-xl">
                    <h3 className="font-bold mb-4">Incident Trends</h3>
                    <div className="space-y-3">
                      {['Fighting', 'Late Arrival', 'Uniform Violation', 'Disrespect'].map((type, i) => (
                        <div key={type}>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm">{type}</span>
                            <span className="text-sm font-bold">{Math.floor(Math.random() * 50)}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-gradient-to-r from-green-500 to-yellow-500 h-2 rounded-full" style={{ width: `${Math.random() * 100}%` }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="p-6 border-2 rounded-xl">
                    <h3 className="font-bold mb-4">Monthly Summary</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span>Total Cases</span>
                        <span className="text-2xl font-black">127</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Resolved</span>
                        <span className="text-2xl font-black text-green-600">98</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Pending</span>
                        <span className="text-2xl font-black text-yellow-600">29</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Success Rate</span>
                        <span className="text-2xl font-black text-blue-600">77%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ComprehensiveDODManagement;
