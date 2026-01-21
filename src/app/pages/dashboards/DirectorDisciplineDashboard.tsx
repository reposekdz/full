import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, BookOpen, Layers, Wrench, GraduationCap, AlertCircle, Plus, Search, Filter, BarChart3, TrendingUp } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Badge } from '@/app/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import AdvancedLeftSidebar from '@/app/components/AdvancedLeftSidebar';

interface DOSDashboardProps {
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

const DOSDashboard: React.FC<DOSDashboardProps> = ({ onNavigate, onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [levels, setLevels] = useState([]);
  const [trades, setTrades] = useState([]);
  const [conductRecords, setConductRecords] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [formData, setFormData] = useState({});

  const API_BASE = 'http://localhost:5000/api/dos';
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [studentsRes, teachersRes, classesRes, levelsRes, tradesRes, analyticsRes] = await Promise.all([
        fetch(`${API_BASE}/students`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE}/teachers`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE}/classes`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE}/levels`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE}/trades`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE}/analytics/overview`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      const [studentsData, teachersData, classesData, levelsData, tradesData, analyticsData] = await Promise.all([
        studentsRes.json(),
        teachersRes.json(),
        classesRes.json(),
        levelsRes.json(),
        tradesRes.json(),
        analyticsRes.json()
      ]);

      if (studentsData.success) setStudents(studentsData.students);
      if (teachersData.success) setTeachers(teachersData.teachers);
      if (classesData.success) setClasses(classesData.classes);
      if (levelsData.success) setLevels(levelsData.levels);
      if (tradesData.success) setTrades(tradesData.trades);
      if (analyticsData.success) setAnalytics(analyticsData.analytics);
    } catch (error) {
      console.error('Fetch error:', error);
    }
    setLoading(false);
  };

  const handleAddItem = async () => {
    try {
      const endpoint = modalType === 'class' ? 'classes' : modalType === 'level' ? 'levels' : 'trades';
      const response = await fetch(`${API_BASE}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setShowAddModal(false);
        setFormData({});
        fetchData();
      }
    } catch (error) {
      console.error('Add error:', error);
    }
  };

  const StatCard = ({ icon: Icon, title, value, color }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg border-2 border-yellow-200 p-6"
    >
      <div className={`bg-gradient-to-br ${color} p-3 rounded-lg w-fit mb-4`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <p className="text-gray-600 text-sm font-medium">{title}</p>
      <p className="text-3xl font-black text-gray-900 mt-2">{value}</p>
    </motion.div>
  );

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <AdvancedLeftSidebar currentPage="dashboard-director-discipline" onNavigate={onNavigate} onLogout={onLogout} />

      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-white border-b sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-black text-gray-900">Director of Discipline</h1>
                <p className="text-gray-600 text-sm">Manage students, conduct, and discipline</p>
              </div>
              <div className="flex items-center space-x-3">
                <Button variant="outline" onClick={() => fetchData()}>Refresh</Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 bg-white border-2 border-yellow-200">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="students">Students</TabsTrigger>
              <TabsTrigger value="classes">Classes</TabsTrigger>
              <TabsTrigger value="teachers">Teachers</TabsTrigger>
              <TabsTrigger value="conduct">Conduct</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={Users} title="Total Students" value={analytics?.totalStudents || 0} color="from-blue-500 to-blue-600" />
                <StatCard icon={GraduationCap} title="Total Teachers" value={analytics?.totalTeachers || 0} color="from-green-500 to-green-600" />
                <StatCard icon={BookOpen} title="Total Classes" value={analytics?.totalClasses || 0} color="from-purple-500 to-purple-600" />
                <StatCard icon={AlertCircle} title="Open Issues" value={analytics?.openConductIssues || 0} color="from-red-500 to-red-600" />
              </div>
            </TabsContent>

            {/* Students Tab */}
            <TabsContent value="students" className="space-y-6">
              <Card className="border-2 border-yellow-200">
                <CardHeader className="bg-gradient-to-r from-yellow-500 to-green-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white">Student Management</CardTitle>
                      <CardDescription className="text-white/80">Manage all students</CardDescription>
                    </div>
                    <Button onClick={() => { setModalType('student'); setShowAddModal(true); }} className="bg-white text-yellow-600 hover:bg-gray-100">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Student
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="flex space-x-2 mb-6">
                    <Input placeholder="Search students..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="flex-1 border-yellow-200" />
                    <Button variant="outline" className="border-yellow-200"><Filter className="w-4 h-4" /></Button>
                  </div>
                  <div className="space-y-3">
                    {students.filter(s => s.first_name.toLowerCase().includes(searchQuery.toLowerCase())).map(student => (
                      <motion.div key={student.id} className="p-4 bg-gradient-to-r from-yellow-50 to-green-50 rounded-lg border-2 border-yellow-200 hover:shadow-lg transition-all">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-bold text-gray-900">{student.first_name} {student.last_name}</p>
                            <p className="text-sm text-gray-600">ID: {student.student_id}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className="bg-blue-500">{student.class_name || 'N/A'}</Badge>
                            <Badge className="bg-green-500">{student.trade_name || 'N/A'}</Badge>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Classes Tab */}
            <TabsContent value="classes" className="space-y-6">
              <Card className="border-2 border-yellow-200">
                <CardHeader className="bg-gradient-to-r from-purple-500 to-indigo-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white">Class Management</CardTitle>
                      <CardDescription className="text-white/80">Manage classes and levels</CardDescription>
                    </div>
                    <Button onClick={() => { setModalType('class'); setShowAddModal(true); }} className="bg-white text-purple-600 hover:bg-gray-100">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Class
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {classes.map(cls => (
                      <motion.div key={cls.id} className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border-2 border-purple-200">
                        <p className="font-bold text-gray-900">{cls.name}</p>
                        <p className="text-sm text-gray-600">Capacity: {cls.capacity}</p>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Teachers Tab */}
            <TabsContent value="teachers" className="space-y-6">
              <Card className="border-2 border-yellow-200">
                <CardHeader className="bg-gradient-to-r from-green-500 to-teal-500">
                  <CardTitle className="text-white">Teacher Management</CardTitle>
                  <CardDescription className="text-white/80">Manage teachers and assignments</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    {teachers.map(teacher => (
                      <motion.div key={teacher.id} className="p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-lg border-2 border-green-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-bold text-gray-900">{teacher.first_name} {teacher.last_name}</p>
                            <p className="text-sm text-gray-600">Classes: {teacher.classes || 'None'}</p>
                          </div>
                          <Badge className="bg-green-500">Active</Badge>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Conduct Tab */}
            <TabsContent value="conduct" className="space-y-6">
              <Card className="border-2 border-yellow-200">
                <CardHeader className="bg-gradient-to-r from-red-500 to-orange-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white">Conduct Records</CardTitle>
                      <CardDescription className="text-white/80">Manage student conduct and discipline</CardDescription>
                    </div>
                    <Button onClick={() => { setModalType('conduct'); setShowAddModal(true); }} className="bg-white text-red-600 hover:bg-gray-100">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Record
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    {conductRecords.map(record => (
                      <motion.div key={record.id} className="p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border-2 border-red-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-bold text-gray-900">{record.first_name} {record.last_name}</p>
                            <p className="text-sm text-gray-600">{record.description}</p>
                          </div>
                          <Badge className={record.severity === 'high' ? 'bg-red-500' : record.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'}>
                            {record.severity}
                          </Badge>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Add Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-md bg-gradient-to-br from-white to-yellow-50 border-2 border-yellow-200">
          <DialogHeader className="bg-gradient-to-r from-yellow-500 to-green-500 -m-6 mb-6 p-6 rounded-t-lg">
            <DialogTitle className="text-white">Add {modalType}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 px-6 pb-6">
            {modalType === 'class' && (
              <>
                <div>
                  <Label>Class Name</Label>
                  <Input value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="mt-1 border-yellow-200" />
                </div>
                <div>
                  <Label>Level</Label>
                  <Select value={formData.level_id || ''} onValueChange={(val) => setFormData({ ...formData, level_id: val })}>
                    <SelectTrigger className="border-yellow-200">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      {levels.map(level => (
                        <SelectItem key={level.id} value={level.id.toString()}>{level.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {modalType === 'conduct' && (
              <>
                <div>
                  <Label>Student</Label>
                  <Select value={formData.student_id || ''} onValueChange={(val) => setFormData({ ...formData, student_id: val })}>
                    <SelectTrigger className="border-yellow-200">
                      <SelectValue placeholder="Select student" />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map(student => (
                        <SelectItem key={student.id} value={student.id.toString()}>{student.first_name} {student.last_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Type</Label>
                  <Select value={formData.type || ''} onValueChange={(val) => setFormData({ ...formData, type: val })}>
                    <SelectTrigger className="border-yellow-200">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="suspension">Suspension</SelectItem>
                      <SelectItem value="expulsion">Expulsion</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="mt-1 border-yellow-200" />
                </div>
              </>
            )}

            <Button onClick={handleAddItem} className="w-full bg-gradient-to-r from-yellow-500 to-green-500 hover:from-yellow-600 hover:to-green-600 text-white">
              Add {modalType}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DOSDashboard;
