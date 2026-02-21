import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Users, Clock, TrendingUp, AlertTriangle, CheckCircle, 
  RefreshCw, Eye, MessageSquare, Phone, Mail, Calendar, BarChart3, 
  PieChart, Activity, Settings, Bell, Star, Award, Shield, 
  BookOpen, GraduationCap, DollarSign, MapPin, Camera, Download,
  Edit, Share2, Heart, ThumbsUp, FileText, Printer, Send
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Progress } from '@/app/components/ui/progress';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import { API_BASE_URL } from '@/app/config/apiBase';

const ModernInteractiveParentDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [selectedChild, setSelectedChild] = useState(null);
  const [children, setChildren] = useState([]);
  const [childDetails, setChildDetails] = useState({});
  const [timeRange, setTimeRange] = useState('month');
  const [showSearch, setShowSearch] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [waitingList, setWaitingList] = useState([]);

  // Mock data for demonstration
  const mockChildren = [
    {
      id: 1,
      name: 'Jean Baptiste Uwimana',
      code: 'SOD2024001',
      trade: 'Software Development',
      level: 2,
      class: 'SOD L2 A',
      image: '/api/placeholder/150/150',
      attendance: { present: 85, total: 100, percentage: 85 },
      grades: { average: 78, subjects: 8, passed: 7 },
      conduct: { score: 38, total: 40, incidents: 2 },
      fees: { paid: 450000, total: 600000, balance: 150000 },
      recent_activity: [
        { type: 'grade', subject: 'Programming', score: 85, date: '2024-01-15' },
        { type: 'attendance', status: 'present', date: '2024-01-15' },
        { type: 'conduct', incident: 'Late arrival', points: -2, date: '2024-01-14' }
      ]
    },
    {
      id: 2,
      name: 'Marie Claire Mukamana',
      code: 'BDC2024002',
      trade: 'Building & Construction',
      level: 1,
      class: 'BDC L1 B',
      image: '/api/placeholder/150/150',
      attendance: { present: 92, total: 100, percentage: 92 },
      grades: { average: 82, subjects: 6, passed: 6 },
      conduct: { score: 40, total: 40, incidents: 0 },
      fees: { paid: 500000, total: 500000, balance: 0 },
      recent_activity: [
        { type: 'grade', subject: 'Mathematics', score: 88, date: '2024-01-15' },
        { type: 'attendance', status: 'present', date: '2024-01-15' },
        { type: 'achievement', title: 'Perfect Attendance', date: '2024-01-10' }
      ]
    }
  ];

  useEffect(() => {
    setChildren(mockChildren);
    if (mockChildren.length > 0) {
      setSelectedChild(mockChildren[0]);
    }
  }, []);

  const performSearch = async () => {
    // Mock search functionality
    setSearchResults([
      { id: 3, name: 'Paul Nkurunziza', code: 'AUTO2024003', trade: 'Automobile', level: 3 },
      { id: 4, name: 'Grace Uwimana', code: 'SOD2024004', trade: 'Software Development', level: 1 }
    ]);
  };

  const getGradeColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-green-500';
    if (percentage >= 80) return 'bg-blue-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white p-6 shadow-xl">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Users className="w-12 h-12" />
                <Heart className="w-4 h-4 absolute -top-1 -right-1 text-pink-300" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Parent Dashboard</h1>
                <p className="text-white/80">Monitor your children's progress in real-time</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" className="text-white hover:bg-white/20">
                <Bell className="w-5 h-5" />
              </Button>
              <Button variant="ghost" className="text-white hover:bg-white/20">
                <Settings className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Children Selector */}
          <div className="flex gap-4 overflow-x-auto pb-2">
            {children.map((child: any) => (
              <motion.div
                key={child.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex-shrink-0 p-4 rounded-xl cursor-pointer transition-all ${
                  selectedChild?.id === child.id 
                    ? 'bg-white/20 border-2 border-white' 
                    : 'bg-white/10 hover:bg-white/15'
                }`}
                onClick={() => setSelectedChild(child)}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12 border-2 border-white">
                    <AvatarImage src={child.image} />
                    <AvatarFallback className="bg-purple-200 text-purple-800">
                      {child.name.split(' ').map((n: string) => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-bold text-white">{child.name}</p>
                    <p className="text-white/80 text-sm">{child.trade} - Level {child.level}</p>
                  </div>
                </div>
              </motion.div>
            ))}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex-shrink-0 p-4 rounded-xl bg-white/10 hover:bg-white/15 cursor-pointer border-2 border-dashed border-white/50"
              onClick={() => setShowSearch(true)}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  <Search className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-bold text-white">Link Child</p>
                  <p className="text-white/80 text-sm">Search & Connect</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </header>

      {selectedChild && (
        <div className="max-w-7xl mx-auto p-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-green-100">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-600 font-medium">Attendance</p>
                      <p className="text-3xl font-bold text-green-800">{selectedChild.attendance.percentage}%</p>
                      <p className="text-xs text-green-600">{selectedChild.attendance.present}/{selectedChild.attendance.total} days</p>
                    </div>
                    <Calendar className="w-12 h-12 text-green-500" />
                  </div>
                  <Progress value={selectedChild.attendance.percentage} className="mt-3 h-2" />
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-600 font-medium">Average Grade</p>
                      <p className="text-3xl font-bold text-blue-800">{selectedChild.grades.average}%</p>
                      <p className="text-xs text-blue-600">{selectedChild.grades.passed}/{selectedChild.grades.subjects} subjects passed</p>
                    </div>
                    <GraduationCap className="w-12 h-12 text-blue-500" />
                  </div>
                  <Progress value={selectedChild.grades.average} className="mt-3 h-2" />
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-600 font-medium">Conduct Score</p>
                      <p className="text-3xl font-bold text-purple-800">{selectedChild.conduct.score}/{selectedChild.conduct.total}</p>
                      <p className="text-xs text-purple-600">{selectedChild.conduct.incidents} incidents</p>
                    </div>
                    <Shield className="w-12 h-12 text-purple-500" />
                  </div>
                  <Progress value={(selectedChild.conduct.score / selectedChild.conduct.total) * 100} className="mt-3 h-2" />
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-orange-600 font-medium">Fees Balance</p>
                      <p className="text-2xl font-bold text-orange-800">{(selectedChild.fees.balance / 1000).toFixed(0)}K</p>
                      <p className="text-xs text-orange-600">RWF {selectedChild.fees.paid.toLocaleString()} paid</p>
                    </div>
                    <DollarSign className="w-12 h-12 text-orange-500" />
                  </div>
                  <Progress value={(selectedChild.fees.paid / selectedChild.fees.total) * 100} className="mt-3 h-2" />
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-6 bg-white/80 backdrop-blur-sm border-2 border-purple-200 mb-6">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="academics" className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Academics
              </TabsTrigger>
              <TabsTrigger value="attendance" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Attendance
              </TabsTrigger>
              <TabsTrigger value="conduct" className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Conduct
              </TabsTrigger>
              <TabsTrigger value="fees" className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Fees
              </TabsTrigger>
              <TabsTrigger value="communication" className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Messages
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Student Profile */}
                <Card className="lg:col-span-1 border-2 border-blue-200">
                  <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Student Profile
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="text-center mb-6">
                      <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-blue-200">
                        <AvatarImage src={selectedChild.image} />
                        <AvatarFallback className="bg-blue-100 text-blue-800 text-2xl">
                          {selectedChild.name.split(' ').map((n: string) => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <h3 className="text-xl font-bold text-gray-800">{selectedChild.name}</h3>
                      <p className="text-gray-600">{selectedChild.code}</p>
                      <Badge className="mt-2 bg-blue-500">{selectedChild.class}</Badge>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Trade:</span>
                        <span className="font-medium">{selectedChild.trade}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Level:</span>
                        <span className="font-medium">Level {selectedChild.level}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Class:</span>
                        <span className="font-medium">{selectedChild.class}</span>
                      </div>
                    </div>
                    <div className="mt-6 space-y-2">
                      <Button className="w-full bg-blue-500 hover:bg-blue-600">
                        <Camera className="w-4 h-4 mr-2" />
                        View Photos
                      </Button>
                      <Button variant="outline" className="w-full">
                        <Download className="w-4 h-4 mr-2" />
                        Download Report
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card className="lg:col-span-2 border-2 border-green-200">
                  <CardHeader className="bg-gradient-to-r from-green-500 to-teal-500 text-white">
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {selectedChild.recent_activity.map((activity: any, idx: number) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                        >
                          <div className={`p-2 rounded-full ${
                            activity.type === 'grade' ? 'bg-blue-100 text-blue-600' :
                            activity.type === 'attendance' ? 'bg-green-100 text-green-600' :
                            activity.type === 'conduct' ? 'bg-red-100 text-red-600' :
                            'bg-purple-100 text-purple-600'
                          }`}>
                            {activity.type === 'grade' ? <BookOpen className="w-4 h-4" /> :
                             activity.type === 'attendance' ? <Calendar className="w-4 h-4" /> :
                             activity.type === 'conduct' ? <Shield className="w-4 h-4" /> :
                             <Award className="w-4 h-4" />}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-800">
                              {activity.type === 'grade' && `${activity.subject}: ${activity.score}%`}
                              {activity.type === 'attendance' && `Attendance: ${activity.status}`}
                              {activity.type === 'conduct' && `Conduct: ${activity.incident}`}
                              {activity.type === 'achievement' && `Achievement: ${activity.title}`}
                            </p>
                            <p className="text-sm text-gray-500">{new Date(activity.date).toLocaleDateString()}</p>
                          </div>
                          {activity.score && (
                            <Badge className={activity.score >= 70 ? 'bg-green-500' : 'bg-red-500'}>
                              {activity.score}%
                            </Badge>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Performance Charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-2 border-purple-200">
                  <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Academic Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {['Mathematics', 'English', 'Programming', 'Physics'].map((subject, idx) => {
                        const score = Math.floor(Math.random() * 30) + 60;
                        return (
                          <div key={idx}>
                            <div className="flex justify-between text-sm mb-1">
                              <span>{subject}</span>
                              <span className={getGradeColor(score)}>{score}%</span>
                            </div>
                            <Progress value={score} className="h-2" />
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 border-orange-200">
                  <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="w-5 h-5" />
                      Attendance Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-green-500 rounded"></div>
                          <span>Present</span>
                        </div>
                        <span className="font-bold">{selectedChild.attendance.present} days</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-red-500 rounded"></div>
                          <span>Absent</span>
                        </div>
                        <span className="font-bold">{selectedChild.attendance.total - selectedChild.attendance.present} days</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                          <span>Late</span>
                        </div>
                        <span className="font-bold">3 days</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Academics Tab */}
            <TabsContent value="academics" className="space-y-6">
              <Card className="border-2 border-blue-200">
                <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Academic Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { subject: 'Mathematics', score: 85, teacher: 'Mr. Nkurunziza' },
                      { subject: 'English', score: 78, teacher: 'Ms. Uwimana' },
                      { subject: 'Programming', score: 92, teacher: 'Mr. Habimana' },
                      { subject: 'Physics', score: 74, teacher: 'Dr. Mukamana' },
                      { subject: 'Chemistry', score: 81, teacher: 'Ms. Ingabire' },
                      { subject: 'Technical Drawing', score: 88, teacher: 'Mr. Bizimana' }
                    ].map((subject, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        className="p-4 rounded-lg border-2 border-gray-200 hover:border-blue-300 transition-colors"
                      >
                        <h3 className="font-bold text-lg">{subject.subject}</h3>
                        <p className="text-sm text-gray-600 mb-2">{subject.teacher}</p>
                        <div className="flex items-center justify-between">
                          <Progress value={subject.score} className="flex-1 mr-3" />
                          <span className={`font-bold text-lg ${getGradeColor(subject.score)}`}>
                            {subject.score}%
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Other tabs content would go here... */}
          </Tabs>
        </div>
      )}

      {/* Search Dialog */}
      <Dialog open={showSearch} onOpenChange={setShowSearch}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Search & Link Student
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input placeholder="Student name..." />
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Trade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SOD">Software Development</SelectItem>
                  <SelectItem value="BDC">Building & Construction</SelectItem>
                  <SelectItem value="AUTO">Automobile Technology</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={performSearch} className="bg-blue-500">
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>
            
            {searchResults.length > 0 && (
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {searchResults.map((student: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{student.name}</p>
                      <p className="text-sm text-gray-500">{student.code} - {student.trade} Level {student.level}</p>
                    </div>
                    <Button size="sm" className="bg-green-500">
                      <Send className="w-4 h-4 mr-1" />
                      Link
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ModernInteractiveParentDashboard;