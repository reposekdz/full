import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  User,
  GraduationCap,
  BarChart,
  CheckCircle,
  DollarSign,
  FileText,
  MessageSquare,
  Heart,
  Home as HomeIcon,
  BookOpen,
  Trophy,
  Bell,
  FileCheck,
  Plus,
  X,
  Loader2,
  Search
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';

interface Student {
  id: number;
  name: string;
  trade: string;
  level: number;
  student_code?: string;
}

interface LinkedStudent {
  id: number;
  student_code: string;
  first_name: string;
  last_name: string;
  trade_name: string;
  level_number: number;
  gender: string;
}

interface LinkFormData {
  student_name: string;
  student_trade: string;
  student_level: string;
  student_gender: string;
}

export default function ParentDashboardWithLinking() {
  const [hasLinkedStudent, setHasLinkedStudent] = useState(false);
  const [linkedStudents, setLinkedStudents] = useState<LinkedStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [linkFormData, setLinkFormData] = useState<LinkFormData>({
    student_name: '',
    student_trade: '',
    student_level: '',
    student_gender: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    checkLinkedStudents();
    fetchNotifications();
  }, []);

  const checkLinkedStudents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/parent-dashboard/children', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();
      if (result.success && result.children && result.children.length > 0) {
        setLinkedStudents(result.children);
        setHasLinkedStudent(true);
      }
    } catch (error) {
      console.error('Error checking linked students:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/parent-links/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await response.json();
      if (result.success) {
        setNotifications(result.notifications || []);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const stats = {
    averageGrade: 0,
    attendanceRate: 0,
    pendingFees: 0,
    notifications: notifications.length
  };

  const subjects: any[] = [];

  const handleSubmitLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const token = localStorage.getItem('token');
      
      // Parse student name into first and last name
      const nameParts = linkFormData.student_name.trim().split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || nameParts[0];

      const response = await fetch('http://localhost:5000/api/parent-links/link-student', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          student_first_name: firstName,
          student_last_name: lastName,
          trade_code: linkFormData.student_trade,
          level: linkFormData.student_level,
          gender: linkFormData.student_gender,
          relationship: 'Parent'
        })
      });

      const result = await response.json();

      if (result.success) {
        setSuccessMessage(result.message || 'Student linked successfully!');
        setTimeout(() => {
          checkLinkedStudents();
        }, 2000);
      } else {
        setErrorMessage(result.message || 'Failed to link student');
      }
    } catch (error) {
      console.error('Error linking student:', error);
      setErrorMessage('Cannot connect to server. Please ensure the backend is running.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 via-yellow-400 to-green-500 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-white mx-auto mb-4" />
          <p className="text-white text-lg">Tegereza...</p>
        </div>
      </div>
    );
  }

  if (!hasLinkedStudent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 via-yellow-400 to-green-500 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full"
        >
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Huza n'Umwana Wawe</h2>
            <p className="text-gray-600">Shyiramo amakuru y'umwana wawe. Ntakwisho kwa nimero y'umunyeshuri!</p>
          </div>

          <form onSubmit={handleSubmitLink} className="space-y-4">
            <div>
              <Label htmlFor="studentName" className="text-gray-700 font-semibold">Izina ry'Umwana *</Label>
              <Input
                id="studentName"
                placeholder="Urugero: Jean Claude"
                value={linkFormData.student_name}
                onChange={(e) => setLinkFormData({ ...linkFormData, student_name: e.target.value })}
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="studentTrade" className="text-gray-700 font-semibold">Umwuga *</Label>
              <Select
                value={linkFormData.student_trade}
                onValueChange={(value) => setLinkFormData({ ...linkFormData, student_trade: value })}
                required
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Hitamo Umwuga" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BDC">BDC - Kubaka</SelectItem>
                  <SelectItem value="SOD">SOD - Ikoranabuhanga</SelectItem>
                  <SelectItem value="AUT">AUT - Imodoka</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="studentLevel" className="text-gray-700 font-semibold">Urwego *</Label>
              <Select
                value={linkFormData.student_level}
                onValueChange={(value) => setLinkFormData({ ...linkFormData, student_level: value })}
                required
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Hitamo Urwego" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Urwego 1</SelectItem>
                  <SelectItem value="2">Urwego 2</SelectItem>
                  <SelectItem value="3">Urwego 3</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="studentGender" className="text-gray-700 font-semibold">Igitsina *</Label>
              <Select
                value={linkFormData.student_gender}
                onValueChange={(value) => setLinkFormData({ ...linkFormData, student_gender: value })}
                required
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Hitamo Igitsina" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Gabo</SelectItem>
                  <SelectItem value="Female">Gore</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {errorMessage && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {errorMessage}
              </div>
            )}

            {successMessage && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                {successMessage}
              </div>
            )}

            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-green-500 to-yellow-500 hover:from-green-600 hover:to-yellow-600 text-white font-semibold py-6 text-lg"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Tegereza...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5 mr-2" />
                  Huza Umwana
                </>
              )}
            </Button>
          </form>
        </motion.div>
      </div>
    );
  }

  const navItems = [
    { id: 'overview', label: 'Overview', icon: HomeIcon },
    { id: 'children', label: 'My Children', icon: GraduationCap },
    { id: 'performance', label: 'Performance', icon: BarChart },
    { id: 'attendance', label: 'Attendance', icon: CheckCircle },
    { id: 'exams', label: 'Exams', icon: FileCheck },
    { id: 'timetable', label: 'Timetable', icon: BookOpen },
    { id: 'fees', label: 'Fees', icon: DollarSign },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'teachers', label: 'Teachers', icon: User },
    { id: 'trade', label: 'Trade Info', icon: Trophy },
    { id: 'link', label: 'Link Student', icon: Plus },
    { id: 'settings', label: 'Settings', icon: Bell }
  ];

  const dashboardCards = [
    {
      icon: Bell,
      title: 'Notifications',
      color: 'from-red-500 to-red-600',
      items: notifications.slice(0, 5).map(n => ({
        label: n.type === 'conduct' ? `Conduct: ${n.description}` : `Leave: ${n.reason}`,
        value: new Date(n.created_at).toLocaleDateString(),
        badge: true,
        badgeColor: n.type === 'conduct' ? 'bg-red-500' : 'bg-blue-500'
      })),
      action: 'View All'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-gradient-to-r from-green-500 via-yellow-500 to-green-600 text-white p-4 md:p-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <User className="w-6 h-6" />
            PORTAL Y'UMUBYEYI
          </div>
          <div className="flex items-center gap-4">
            <a href="/home" className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition">
              ← Ahabanza
            </a>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-red-600" />
              </div>
              <span className="hidden md:inline">Mukamana Marie</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-lg mb-6 p-2 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'link') {
                    setHasLinkedStudent(false);
                  } else {
                    setActiveTab(item.id);
                  }
                }}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all ${
                  activeTab === item.id
                    ? 'bg-gradient-to-r from-green-500 to-yellow-500 text-white shadow-md'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-8"
        >
          <h1 className="text-2xl md:text-3xl font-bold text-green-600 mb-2">
            Murakaza neza, Mukamana Marie!
          </h1>
          <p className="text-gray-600 mb-6">
            Hano ushobora gukurikirana iterambere ry'abana bawe mu ishuri
          </p>
          
          {/* Children Selector */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            {linkedStudents.map((child) => (
              <motion.div
                key={child.id}
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-r from-green-500 to-yellow-500 text-white p-4 rounded-xl cursor-pointer flex-1 text-center"
              >
                <GraduationCap className="w-6 h-6 inline-block mr-2" />
                {child.first_name} {child.last_name} - {child.trade_name} Level {child.level_number}
              </motion.div>
            ))}
          </div>

          {/* Link Another Student Button */}
          <Button
            onClick={() => setHasLinkedStudent(false)}
            className="bg-gradient-to-r from-green-500 to-yellow-500 hover:from-green-600 hover:to-yellow-600 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Iyandikishe
          </Button>
        </motion.div>

        {/* Alert - Show latest notification */}
        {notifications.length > 0 && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg mb-8">
            <div className="flex items-start">
              <Bell className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
              <div>
                <strong>🔔 Latest Update:</strong>
                {notifications[0].type === 'conduct' ? (
                  <span> {notifications[0].student_name} - Conduct removed: {notifications[0].description}</span>
                ) : (
                  <span> {notifications[0].student_name} - Leave approved: {notifications[0].reason}</span>
                )}
                <div className="text-xs text-gray-600 mt-1">
                  {new Date(notifications[0].created_at).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-r from-green-500 to-yellow-500 text-white p-6 rounded-xl text-center"
          >
            <div className="text-4xl font-bold">{linkedStudents.length}</div>
            <div className="text-sm mt-2 opacity-90">My Children</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-r from-green-500 to-yellow-500 text-white p-6 rounded-xl text-center"
          >
            <div className="text-4xl font-bold">{notifications.length}</div>
            <div className="text-sm mt-2 opacity-90">Notifications</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-r from-green-500 to-yellow-500 text-white p-6 rounded-xl text-center"
          >
            <div className="text-4xl font-bold">{notifications.filter(n => n.type === 'conduct').length}</div>
            <div className="text-sm mt-2 opacity-90">Conduct Updates</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-r from-green-500 to-yellow-500 text-white p-6 rounded-xl text-center"
          >
            <div className="text-4xl font-bold">{notifications.filter(n => n.type === 'leave').length}</div>
            <div className="text-sm mt-2 opacity-90">Leave Approvals</div>
          </motion.div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboardCards.map((card, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -5 }}
            >
              <Card className="h-full hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="bg-gradient-to-r from-green-500 to-yellow-500 p-3 rounded-lg">
                      <card.icon className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-lg">{card.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {card.items.map((item, idx) => (
                      <li key={idx} className="flex items-center justify-between py-2 border-b last:border-b-0">
                        <span className="text-sm text-gray-700">{item.label}</span>
                        {item.badge && item.value && (
                          <Badge className={item.badgeColor || 'bg-red-500'}>
                            {item.value}
                          </Badge>
                        )}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full mt-4 bg-gradient-to-r from-green-500 to-yellow-500 hover:from-green-600 hover:to-yellow-600"
                  >
                    {card.action}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Linking Modal (removed - now inline) */}
      <Dialog open={false} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-green-600 text-xl">Link with your student</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitLink} className="space-y-4">
            <div>
              <Label htmlFor="studentName">Student Name:</Label>
              <Input
                id="studentName"
                placeholder="Enter student's full name"
                value={linkFormData.student_name}
                onChange={(e) => setLinkFormData({ ...linkFormData, student_name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="studentTrade">Trade:</Label>
              <Select
                value={linkFormData.student_trade}
                onValueChange={(value) => setLinkFormData({ ...linkFormData, student_trade: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Trade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BDC">BDC - Building Construction</SelectItem>
                  <SelectItem value="SOD">SOD - Software Development</SelectItem>
                  <SelectItem value="AUT">AUT - Automotive Technology</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="studentLevel">Level:</Label>
              <Select
                value={linkFormData.student_level}
                onValueChange={(value) => setLinkFormData({ ...linkFormData, student_level: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Level 1</SelectItem>
                  <SelectItem value="2">Level 2</SelectItem>
                  <SelectItem value="3">Level 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="studentGender">Gender:</Label>
              <Select
                value={linkFormData.student_gender}
                onValueChange={(value) => setLinkFormData({ ...linkFormData, student_gender: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-gradient-to-r from-green-500 to-yellow-500 hover:from-green-600 hover:to-yellow-600"
              >
                {submitting ? 'Submitting...' : 'Submit'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsLinkingModalOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
