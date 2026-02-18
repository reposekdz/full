import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserPlus, Users, GraduationCap, BookOpen, DollarSign, Calendar,
  CheckCircle, AlertCircle, Loader2, User, Briefcase, Shield,
  Phone, Mail, MapPin, Clock, ArrowRight, RefreshCw, Send,
  Book, FileText, MessageSquare, Bell, Settings, LogOut, Home,
  TrendingUp, Award, Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/app/components/ui/select';
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle, DialogTrigger 
} from '@/app/components/ui/dialog';
import { toast } from 'sonner';
import apiService from '@/app/services/apiService';

interface ParentStudentLinkDashboardProps {
  user?: any;
  onNavigate?: (page: string) => void;
  onLogout?: () => void;
}

interface LinkedStudent {
  id: number;
  first_name: string;
  last_name: string;
  trade_name: string;
  level_number: number;
  gender: string;
  student_code: string;
  status: string;
}

interface ParentStudentLinkDashboardProps {
  user?: any;
  onNavigate?: (page: string) => void;
  onLogout?: () => void;
}

const ParentStudentLinkDashboard: React.FC<ParentStudentLinkDashboardProps> = ({ 
  user, 
  onNavigate, 
  onLogout 
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [linkedStudents, setLinkedStudents] = useState<LinkedStudent[]>([]);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkingStudent, setLinkingStudent] = useState(false);
  
  // Link Student Form State
  const [linkForm, setLinkForm] = useState({
    studentFirstName: '',
    studentLastName: '',
    studentTrade: '',
    studentLevel: '',
    studentGender: '',
    studentId: '',
    relationship: ''
  });
  
  const [availableTrades, setAvailableTrades] = useState<string[]>([
    'SOD', 'BDC', 'AUT', 'ELT', 'CIV', 'MEC', 'QMS', 'HIS', 'BAM'
  ]);
  const [levels] = useState(['Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5', 'Level 6']);

  useEffect(() => {
    fetchLinkedStudents();
  }, []);

  const fetchLinkedStudents = async () => {
    try {
      setLoading(true);
      // Fetch linked students for this parent
      const response = await fetch('/api/parent-links/students', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setLinkedStudents(data.students || []);
      }
    } catch (error) {
      console.error('Error fetching linked students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLinkStudent = async () => {
    if (!linkForm.studentFirstName || !linkForm.studentLastName || 
        !linkForm.studentTrade || !linkForm.studentLevel || !linkForm.relationship) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLinkingStudent(true);
      
      const response = await fetch('/api/parent-links/link-student', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          student_first_name: linkForm.studentFirstName,
          student_last_name: linkForm.studentLastName,
          trade_code: linkForm.studentTrade,
          level: linkForm.studentLevel,
          gender: linkForm.studentGender,
          student_id: linkForm.studentId,
          relationship: linkForm.relationship
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Student linked successfully! 🎉');
        setShowLinkDialog(false);
        setLinkForm({
          studentFirstName: '',
          studentLastName: '',
          studentTrade: '',
          studentLevel: '',
          studentGender: '',
          studentId: '',
          relationship: ''
        });
        fetchLinkedStudents();
      } else {
        toast.error(data.message || 'Failed to link student');
      }
    } catch (error) {
      console.error('Error linking student:', error);
      toast.error('Failed to link student');
    } finally {
      setLinkingStudent(false);
    }
  };

  const stats = [
    { 
      title: 'Abana Bakunze', 
      value: linkedStudents.length, 
      icon: Users, 
      color: 'from-blue-500 to-indigo-500',
      bg: 'bg-gradient-to-br from-blue-50 to-indigo-50'
    },
    { 
      title: 'Amasomo', 
      value: linkedStudents.length > 0 ? 'Active' : '-', 
      icon: BookOpen, 
      color: 'from-green-500 to-emerald-500',
      bg: 'bg-gradient-to-br from-green-50 to-emerald-50'
    },
    { 
      title: 'Amakuru', 
      value: '12', 
      icon: Bell, 
      color: 'from-purple-500 to-pink-500',
      bg: 'bg-gradient-to-br from-purple-50 to-pink-50'
    },
    { 
      title: 'Status', 
      value: linkedStudents.length > 0 ? 'Active' : 'Empty', 
      icon: Activity, 
      color: 'from-orange-500 to-red-500',
      bg: 'bg-gradient-to-br from-orange-50 to-red-50'
    },
  ];

  const tabs = [
    { id: 'overview', icon: Home, label: 'Overview' },
    { id: 'my-children', icon: Users, label: 'Abana Bawe' },
    { id: 'messages', icon: MessageSquare, label: 'Message' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
          <div className="flex-1">
            <motion.h1
              initial={{ x: -50 }}
              animate={{ x: 0 }}
              className="text-4xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent"
            >
              Parent Dashboard
            </motion.h1>
            <p className="text-gray-600 flex items-center gap-2 mt-1">
              <Activity className="h-4 w-4 text-purple-500 animate-pulse" />
              Murakaza neza • Welcome {user?.first_name || 'Parent'}
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={() => setShowLinkDialog(true)}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Fungisha Umwana
            </Button>
            {onLogout && (
              <Button variant="outline" onClick={onLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Exit
              </Button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className={`${stat.bg} border-0 shadow-lg`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 font-medium">{stat.title}</p>
                      <p className="text-2xl font-black text-gray-800">{stat.value}</p>
                    </div>
                    <div className={`h-12 w-12 rounded-full bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-md`}>
                      <stat.icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'outline'}
              onClick={() => setActiveTab(tab.id)}
              className={`${activeTab === tab.id 
                ? 'bg-gradient-to-r from-purple-500 to-pink-500' 
                : 'border-purple-200 text-purple-700 hover:bg-purple-50'} whitespace-nowrap`}
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Welcome Card */}
                <Card className="bg-white border-purple-200 shadow-lg">
                  <CardHeader className="border-b border-purple-100">
                    <CardTitle className="flex items-center gap-2 text-purple-800">
                      <Award className="h-5 w-5 text-purple-600" />
                      Murakaza neza
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="text-center py-6">
                      <div className="h-24 w-24 mx-auto rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center mb-4 shadow-xl">
                        <User className="h-12 w-12 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-2">
                        {user?.first_name} {user?.last_name}
                      </h3>
                      <p className="text-gray-600 mb-4">Umubyeyi wa Garden TVET</p>
                      <p className="text-sm text-gray-500">
                        Uzajya ubona amakuru y'amasomo, amafaranga, n'ibindi bijyanye n'abana bawe
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="bg-white border-purple-200 shadow-lg">
                  <CardHeader className="border-b border-purple-100">
                    <CardTitle className="flex items-center gap-2 text-purple-800">
                      <TrendingUp className="h-5 w-5 text-purple-600" />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <Button
                        onClick={() => setShowLinkDialog(true)}
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 justify-start"
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Fungisha Umwana (Link Child)
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full border-purple-200 text-purple-700 justify-start hover:bg-purple-50"
                        onClick={() => setActiveTab('my-children')}
                      >
                        <Users className="h-4 w-4 mr-2" />
                        Reba Abana (View Children)
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full border-purple-200 text-purple-700 justify-start hover:bg-purple-50"
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Ohereza Message
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full border-purple-200 text-purple-700 justify-start hover:bg-purple-50"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Reba Raporo
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}

          {activeTab === 'my-children' && (
            <motion.div
              key="my-children"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="bg-white border-purple-200 shadow-lg">
                <CardHeader className="border-b border-purple-100">
                  <CardTitle className="flex items-center justify-between text-purple-800">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-purple-600" />
                      Abana Bakunze (Linked Children)
                    </div>
                    <Button
                      size="sm"
                      onClick={() => setShowLinkDialog(true)}
                      className="bg-gradient-to-r from-purple-500 to-pink-500"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Fungisha
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {linkedStudents.length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                      <h3 className="text-xl font-bold text-gray-600 mb-2">
                        Nta mwana ufite
                      </h3>
                      <p className="text-gray-500 mb-4">
                        Fungaisha umwana wawe kugira ngo ubone amakuru yawe
                      </p>
                      <Button
                        onClick={() => setShowLinkDialog(true)}
                        className="bg-gradient-to-r from-purple-500 to-pink-500"
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Fungisha Umwana
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {linkedStudents.map((student, idx) => (
                        <motion.div
                          key={student.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.1 }}
                        >
                          <Card className="border-2 border-purple-100 hover:border-purple-300 transition-all">
                            <CardContent className="p-4">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold">
                                  {student.first_name[0]}{student.last_name[0]}
                                </div>
                                <div>
                                  <p className="font-bold text-gray-800">
                                    {student.first_name} {student.last_name}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {student.student_code}
                                  </p>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-gray-500">Umwuga:</span>
                                  <Badge className="bg-purple-100 text-purple-700">
                                    {student.trade_name}
                                  </Badge>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-gray-500">Level:</span>
                                  <Badge className="bg-blue-100 text-blue-700">
                                    {student.level_number}
                                  </Badge>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-gray-500">Status:</span>
                                  <Badge className="bg-green-100 text-green-700">
                                    {student.status}
                                  </Badge>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === 'messages' && (
            <motion.div
              key="messages"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="bg-white border-purple-200 shadow-lg">
                <CardHeader className="border-b border-purple-100">
                  <CardTitle className="flex items-center gap-2 text-purple-800">
                    <MessageSquare className="h-5 w-5 text-purple-600" />
                    Messages from School
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="text-center py-12">
                    <MessageSquare className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-xl font-bold text-gray-600 mb-2">
                      No messages yet
                    </h3>
                    <p className="text-gray-500">
                      Amakuru anyu ajya here
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="bg-white border-purple-200 shadow-lg">
                <CardHeader className="border-b border-purple-100">
                  <CardTitle className="flex items-center gap-2 text-purple-800">
                    <Settings className="h-5 w-5 text-purple-600" />
                    Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <Bell className="h-5 w-5 text-purple-600" />
                        <span className="font-medium">Notifications</span>
                      </div>
                      <Badge className="bg-green-100 text-green-700">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5 text-purple-600" />
                        <span className="font-medium">SMS Alerts</span>
                      </div>
                      <Badge className="bg-green-100 text-green-700">Active</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Link Student Dialog */}
        <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-purple-800 flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <UserPlus className="h-6 w-6 text-white" />
                </div>
                <div>
                  <span>Fungisha Umwana wawe</span>
                  <p className="text-sm font-normal text-gray-500">Link with your student</p>
                </div>
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                Fillsha amakuru y'umwana uri kuganira kugira ngo abone ibitekerezo bijyanye n'amasomo, amafaranga, n'ibindi.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Student Name */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <User className="h-4 w-4 text-purple-500" />
                    Izina ry'Umwana
                  </label>
                  <Input
                    value={linkForm.studentFirstName}
                    onChange={(e) => setLinkForm({...linkForm, studentFirstName: e.target.value})}
                    placeholder="Jean"
                    className="h-12 border-purple-200 focus:border-purple-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <User className="h-4 w-4 text-purple-500" />
                    Izina Ryukuri
                  </label>
                  <Input
                    value={linkForm.studentLastName}
                    onChange={(e) => setLinkForm({...linkForm, studentLastName: e.target.value})}
                    placeholder="UWERA"
                    className="h-12 border-purple-200 focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Trade & Level */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-purple-500" />
                    Umwuga w'Umwana
                  </label>
                  <Select 
                    value={linkForm.studentTrade} 
                    onValueChange={(v) => setLinkForm({...linkForm, studentTrade: v})}
                  >
                    <SelectTrigger className="h-12 border-purple-200">
                      <SelectValue placeholder="Hitamo umwuga" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTrades.map(trade => (
                        <SelectItem key={trade} value={trade}>{trade}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-purple-500" />
                    Urwego
                  </label>
                  <Select 
                    value={linkForm.studentLevel} 
                    onValueChange={(v) => setLinkForm({...linkForm, studentLevel: v})}
                  >
                    <SelectTrigger className="h-12 border-purple-200">
                      <SelectValue placeholder="Hitamo urwego" />
                    </SelectTrigger>
                    <SelectContent>
                      {levels.map(level => (
                        <SelectItem key={level} value={level}>{level}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-purple-500" />
                  Igitsina (Gender)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className={`flex items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all font-bold ${
                    linkForm.studentGender === 'Male' 
                      ? 'border-purple-500 bg-purple-100 text-purple-800' 
                      : 'border-gray-200 bg-white text-gray-600 hover:border-purple-300'
                  }`}>
                    <input
                      type="radio"
                      name="studentGender"
                      value="Male"
                      checked={linkForm.studentGender === 'Male'}
                      onChange={(e) => setLinkForm({...linkForm, studentGender: e.target.value})}
                      className="sr-only"
                    />
                    🔵 Gabo (Male)
                  </label>
                  <label className={`flex items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all font-bold ${
                    linkForm.studentGender === 'Female' 
                      ? 'border-pink-500 bg-pink-100 text-pink-800' 
                      : 'border-gray-200 bg-white text-gray-600 hover:border-pink-300'
                  }`}>
                    <input
                      type="radio"
                      name="studentGender"
                      value="Female"
                      checked={linkForm.studentGender === 'Female'}
                      onChange={(e) => setLinkForm({...linkForm, studentGender: e.target.value})}
                      className="sr-only"
                    />
                    🔴 Gore (Female)
                  </label>
                </div>
              </div>

              {/* Student ID & Relationship */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-purple-500" />
                    Nimero y'Umwana (Optional)
                  </label>
                  <Input
                    value={linkForm.studentId}
                    onChange={(e) => setLinkForm({...linkForm, studentId: e.target.value})}
                    placeholder="SWD0012026"
                    className="h-12 border-purple-200 focus:border-purple-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <Users className="h-4 w-4 text-purple-500" />
                    Isano
                  </label>
                  <Select 
                    value={linkForm.relationship} 
                    onValueChange={(v) => setLinkForm({...linkForm, relationship: v})}
                  >
                    <SelectTrigger className="h-12 border-purple-200">
                      <SelectValue placeholder="Hitamo isano" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="father">👨 Data (Father)</SelectItem>
                      <SelectItem value="mother">👩 Mama (Mother)</SelectItem>
                      <SelectItem value="guardian">👤 Umurezi (Guardian)</SelectItem>
                      <SelectItem value="other">👥 Ikindi (Other)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Info Box */}
              <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-purple-800">Ibyatanze</h4>
                    <p className="text-sm text-gray-600">
                      Iyi nimero izafashanya amakuru n'umwana mu bihe byose. 
                      Uzajya ubona amakuru y'amasomo, amafaranga, imyitwarire, n'ibindi bijyanye n'umwana wawe.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowLinkDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleLinkStudent}
                disabled={linkingStudent}
                className="bg-gradient-to-r from-purple-500 to-pink-500"
              >
                {linkingStudent ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Fungisha Umwana
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>
    </div>
  );
};

export default ParentStudentLinkDashboard;
