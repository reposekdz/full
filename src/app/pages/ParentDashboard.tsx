import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, GraduationCap, TrendingUp, Calendar, Bell, DollarSign, 
  BookOpen, Award, Clock, MessageSquare, FileText, BarChart3,
  CheckCircle, XCircle, AlertCircle, Phone, Mail, MapPin, User
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';

interface ParentDashboardProps {
  onNavigate: (page: string) => void;
}

const ParentDashboard: React.FC<ParentDashboardProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [students, setStudents] = useState<any[]>([]);
  const [connectionRequests, setConnectionRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch connected students
      const studentsRes = await fetch('http://localhost:5000/api/parent/students', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const studentsData = await studentsRes.json();
      if (studentsData.success) setStudents(studentsData.students);

      // Fetch connection requests
      const requestsRes = await fetch('http://localhost:5000/api/parent/connection-requests', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const requestsData = await requestsRes.json();
      if (requestsData.success) setConnectionRequests(requestsData.requests);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const stats = [
    { icon: Users, label: 'Abana', value: students.length, color: 'blue', trend: '+0%' },
    { icon: BookOpen, label: 'Amasomo', value: students.reduce((acc, s) => acc + (s.courses || 0), 0), color: 'green', trend: '+12%' },
    { icon: Award, label: 'Amanota', value: students.reduce((acc, s) => acc + (s.average_grade || 0), 0) / (students.length || 1), color: 'purple', trend: '+5%' },
    { icon: DollarSign, label: 'Amafaranga', value: `${students.reduce((acc, s) => acc + (s.fees_balance || 0), 0).toLocaleString()} RWF`, color: 'orange', trend: '-8%' }
  ];

  const tabs = [
    { id: 'overview', label: 'Ibanze', icon: BarChart3 },
    { id: 'students', label: 'Abana', icon: Users },
    { id: 'performance', label: 'Imikorere', icon: TrendingUp },
    { id: 'attendance', label: 'Kwitabira', icon: Calendar },
    { id: 'fees', label: 'Amafaranga', icon: DollarSign },
    { id: 'messages', label: 'Ubutumwa', icon: MessageSquare },
    { id: 'requests', label: 'Ibisabwa', icon: AlertCircle }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-black text-gray-900">
                Murakaza neza, {user.first_name}! 👋
              </h1>
              <p className="text-gray-600 mt-2">Reba amajyambere y'abana bawe</p>
            </div>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
              <Bell className="w-5 h-5 mr-2" />
              Inyandiko {connectionRequests.filter(r => r.status === 'pending').length}
            </Button>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border-2 hover:shadow-xl transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 font-semibold">{stat.label}</p>
                      <p className="text-3xl font-black text-gray-900 mt-2">{stat.value}</p>
                      <p className={`text-sm font-bold mt-2 ${stat.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                        {stat.trend} vs last month
                      </p>
                    </div>
                    <div className={`w-16 h-16 rounded-full bg-${stat.color}-100 flex items-center justify-center`}>
                      <stat.icon className={`w-8 h-8 text-${stat.color}-600`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="mb-6 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    Ibikorwa Biheruka
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <p className="font-bold text-gray-900">Ikizamini cya Mathematics</p>
                          <p className="text-sm text-gray-600">Marie UWASE - 85/100</p>
                          <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Upcoming Events */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-purple-600" />
                    Ibyabaye Bizaza
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-4 p-3 bg-purple-50 rounded-lg">
                        <div className="text-center">
                          <p className="text-2xl font-black text-purple-600">15</p>
                          <p className="text-xs text-purple-600">FEB</p>
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-gray-900">Parent-Teacher Meeting</p>
                          <p className="text-sm text-gray-600">10:00 AM - Room 205</p>
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
              {students.map((student) => (
                <Card key={student.id} className="hover:shadow-xl transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-2xl font-black">
                        {student.first_name[0]}{student.last_name[0]}
                      </div>
                      <div>
                        <h3 className="font-black text-gray-900">{student.first_name} {student.last_name}</h3>
                        <p className="text-sm text-gray-600">{student.trade_name}</p>
                        <p className="text-xs text-gray-500">{student.level}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Amanota:</span>
                        <span className="font-bold text-green-600">{student.average_grade || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Kwitabira:</span>
                        <span className="font-bold text-blue-600">{student.attendance || 'N/A'}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Amafaranga:</span>
                        <span className="font-bold text-orange-600">{student.fees_balance || 0} RWF</span>
                      </div>
                    </div>
                    <Button className="w-full mt-4 bg-gradient-to-r from-blue-600 to-purple-600">
                      Reba Byose
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {activeTab === 'requests' && (
            <Card>
              <CardHeader>
                <CardTitle>Ibisabwa byo Guhuza n'Abana</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {connectionRequests.map((request) => (
                    <div key={request.id} className="p-4 border-2 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                            <User className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900">
                              {request.student_first_name} {request.student_last_name}
                            </h4>
                            <p className="text-sm text-gray-600">{request.student_trade} - {request.student_level}</p>
                            <p className="text-xs text-gray-500">Isano: {request.relationship_type}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {request.status === 'pending' && (
                            <>
                              <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">
                                Gutegereza
                              </span>
                            </>
                          )}
                          {request.status === 'approved' && (
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold flex items-center gap-1">
                              <CheckCircle className="w-4 h-4" />
                              Byemewe
                            </span>
                          )}
                          {request.status === 'rejected' && (
                            <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold flex items-center gap-1">
                              <XCircle className="w-4 h-4" />
                              Byanze
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {connectionRequests.length === 0 && (
                    <div className="text-center py-12">
                      <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Nta bisabwa bihari</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParentDashboard;
