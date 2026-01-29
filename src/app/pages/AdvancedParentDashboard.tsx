import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, GraduationCap, TrendingUp, Calendar, Bell, DollarSign, 
  BookOpen, Award, Clock, MessageSquare, FileText, BarChart3,
  CheckCircle, XCircle, AlertCircle, Phone, Mail, MapPin, User,
  Download, Upload, Video, Camera, Mic, Share2, Heart, Star,
  Target, Zap, Activity, PieChart, LineChart, Settings, Filter,
  Search, Plus, Edit, Trash2, Eye, Send, Paperclip, Image as ImageIcon,
  ChevronDown, ChevronUp, TrendingDown, AlertTriangle, Info
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

import ParentPaymentProofSubmission from '../components/ParentPaymentProofSubmission';

interface ParentDashboardProps {
  onNavigate: (page: string) => void;
}

const AdvancedParentDashboard: React.FC<ParentDashboardProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const [studentsRes, notificationsRes, messagesRes] = await Promise.all([
        fetch('http://localhost:5000/api/parent/students', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:5000/api/parent/notifications', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:5000/api/parent/messages', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const studentsData = await studentsRes.json();
      const notificationsData = await notificationsRes.json();
      const messagesData = await messagesRes.json();

      if (studentsData.success) setStudents(studentsData.students);
      if (notificationsData.success) setNotifications(notificationsData.notifications);
      if (messagesData.success) setMessages(messagesData.messages);
      
      if (studentsData.students?.length > 0) setSelectedStudent(studentsData.students[0]);
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  const stats = [
    { icon: Users, label: 'Abana Banjye', value: students.length, color: 'blue', trend: '+0%', bg: 'from-blue-500 to-blue-600' },
    { icon: BookOpen, label: 'Amasomo Yose', value: students.reduce((acc, s) => acc + (s.courses || 12), 0), color: 'green', trend: '+12%', bg: 'from-green-500 to-green-600' },
    { icon: Award, label: 'Ikigereranyo', value: `${(students.reduce((acc, s) => acc + (s.average_grade || 75), 0) / (students.length || 1)).toFixed(1)}%`, color: 'purple', trend: '+5%', bg: 'from-purple-500 to-purple-600' },
    { icon: DollarSign, label: 'Ideni', value: `${students.reduce((acc, s) => acc + (s.fees_balance || 0), 0).toLocaleString()} RWF`, color: 'orange', trend: '-8%', bg: 'from-orange-500 to-orange-600' },
    { icon: Calendar, label: 'Kwitabira', value: `${(students.reduce((acc, s) => acc + (s.attendance || 95), 0) / (students.length || 1)).toFixed(1)}%`, color: 'pink', trend: '+3%', bg: 'from-pink-500 to-pink-600' },
    { icon: MessageSquare, label: 'Ubutumwa', value: messages.filter(m => !m.read).length, color: 'indigo', trend: '+15', bg: 'from-indigo-500 to-indigo-600' },
    { icon: Bell, label: 'Inyandiko', value: notifications.filter(n => !n.read).length, color: 'red', trend: '+8', bg: 'from-red-500 to-red-600' },
    { icon: Target, label: 'Intego', value: '85%', color: 'teal', trend: '+10%', bg: 'from-teal-500 to-teal-600' }
  ];

  const tabs = [
    { id: 'overview', label: 'Ibanze', icon: BarChart3, color: 'blue' },
    { id: 'students', label: 'Abana', icon: Users, color: 'green' },
    { id: 'performance', label: 'Imikorere', icon: TrendingUp, color: 'purple' },
    { id: 'attendance', label: 'Kwitabira', icon: Calendar, color: 'orange' },
    { id: 'fees', label: 'Amafaranga', icon: DollarSign, color: 'pink' },
    { id: 'payment-proof', label: 'Icyemezo cy\'Kwishyura', icon: Upload, color: 'yellow' },
    { id: 'messages', label: 'Ubutumwa', icon: MessageSquare, color: 'indigo' },
    { id: 'schedule', label: 'Gahunda', icon: Clock, color: 'red' },
    { id: 'reports', label: 'Raporo', icon: FileText, color: 'teal' },
    { id: 'analytics', label: 'Isesengura', icon: PieChart, color: 'cyan' },
    { id: 'goals', label: 'Intego', icon: Target, color: 'amber' },
    { id: 'health', label: 'Ubuzima', icon: Heart, color: 'rose' },
    { id: 'behavior', label: 'Imyitwarire', icon: Star, color: 'violet' },
    { id: 'homework', label: 'Imikorere yo Murugo', icon: BookOpen, color: 'lime' },
    { id: 'events', label: 'Ibyabaye', icon: Calendar, color: 'sky' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-4 md:p-6">
      <div className="max-w-[1600px] mx-auto">
        {/* Advanced Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white rounded-2xl p-6 shadow-xl border-2 border-blue-100">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-2xl font-black shadow-lg">
                {user.first_name?.[0]}{user.last_name?.[0]}
              </div>
              <div>
                <h1 className="text-3xl font-black text-gray-900">
                  Murakaza neza, {user.first_name}! 👋
                </h1>
                <p className="text-gray-600">Gucunga amajyambere y'abana bawe mu buryo bwuzuye</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg">
                <Bell className="w-5 h-5 mr-2" />
                {notifications.filter(n => !n.read).length} Inyandiko
              </Button>
              <Button variant="outline" className="border-2">
                <Settings className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Advanced Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="border-2 hover:shadow-2xl transition-all hover:-translate-y-1 cursor-pointer">
                <CardContent className="p-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.bg} flex items-center justify-center mb-3 shadow-lg`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-xs text-gray-600 font-bold mb-1">{stat.label}</p>
                  <p className="text-2xl font-black text-gray-900">{stat.value}</p>
                  <p className={`text-xs font-bold mt-1 ${stat.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.trend}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-2xl p-4 shadow-xl border-2 border-blue-100 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Shakisha abana, amasomo, raporo..."
                className="pl-10 h-12 border-2"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="h-12 px-4 border-2 rounded-lg font-bold"
            >
              <option value="all">Byose</option>
              <option value="grades">Amanota</option>
              <option value="attendance">Kwitabira</option>
              <option value="fees">Amafaranga</option>
              <option value="behavior">Imyitwarire</option>
            </select>
            <Button className="h-12 bg-gradient-to-r from-blue-600 to-purple-600">
              <Filter className="w-5 h-5 mr-2" />
              Kuyungurura
            </Button>
          </div>
        </div>

        {/* Modern Tabs */}
        <div className="mb-6 overflow-x-auto">
          <div className="flex gap-2 min-w-max pb-2">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg ${
                  activeTab === tab.id
                    ? `bg-gradient-to-r from-${tab.color}-600 to-${tab.color}-700 text-white`
                    : 'bg-white text-gray-600 hover:bg-gray-50 border-2'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Quick Actions */}
                <Card className="border-2 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-yellow-600" />
                      Ibikorwa Byihuse
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      { icon: MessageSquare, label: 'Ohereza Ubutumwa', color: 'blue' },
                      { icon: Download, label: 'Pakurura Raporo', color: 'green' },
                      { icon: Video, label: 'Inama ya Video', color: 'purple' },
                      { icon: Calendar, label: 'Gena Gahunda', color: 'orange' },
                      { icon: DollarSign, label: 'Kwishyura Amafaranga', color: 'pink' },
                      { icon: FileText, label: 'Reba Raporo', color: 'indigo' }
                    ].map((action, i) => (
                      <Button
                        key={i}
                        className={`w-full justify-start bg-gradient-to-r from-${action.color}-500 to-${action.color}-600 shadow-lg hover:shadow-xl`}
                      >
                        <action.icon className="w-5 h-5 mr-3" />
                        {action.label}
                      </Button>
                    ))}
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card className="border-2 shadow-xl lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-blue-600" />
                      Ibikorwa Biheruka
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {[...Array(8)].map((_, i) => (
                        <div key={i} className="flex items-start gap-3 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border-2 hover:shadow-lg transition-all">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-black">
                            {i + 1}
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-gray-900">Ikizamini cya Mathematics - Marie UWASE</p>
                            <p className="text-sm text-gray-600">Amanota: 85/100 (A)</p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                                Byagenze Neza
                              </span>
                              <span className="text-xs text-gray-500">2 amasaha ashize</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'students' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {students.map((student, i) => (
                  <motion.div
                    key={student.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Card className="border-2 hover:shadow-2xl transition-all hover:-translate-y-2 cursor-pointer">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-3xl font-black shadow-lg">
                            {student.first_name?.[0]}{student.last_name?.[0]}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-black text-xl text-gray-900">{student.first_name} {student.last_name}</h3>
                            <p className="text-sm text-gray-600 font-bold">{student.trade_name}</p>
                            <p className="text-xs text-gray-500">{student.level}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                            <span className="text-sm font-bold text-gray-700">Amanota</span>
                            <span className="text-lg font-black text-green-600">{student.average_grade || 75}%</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                            <span className="text-sm font-bold text-gray-700">Kwitabira</span>
                            <span className="text-lg font-black text-blue-600">{student.attendance || 95}%</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                            <span className="text-sm font-bold text-gray-700">Ideni</span>
                            <span className="text-lg font-black text-orange-600">{student.fees_balance || 0} RWF</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mt-4">
                          <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                            <Eye className="w-4 h-4 mr-2" />
                            Reba
                          </Button>
                          <Button variant="outline" className="border-2">
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Andika
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}

            {activeTab === 'payment-proof' && (
              <ParentPaymentProofSubmission />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdvancedParentDashboard;
