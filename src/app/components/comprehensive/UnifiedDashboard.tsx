import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, BookOpen, DollarSign, TrendingUp, Calendar, Award, Bell, FileText,
  GraduationCap, ClipboardList, BarChart3, MessageSquare, Settings, Home,
  Library, Building, Bus, Trophy, Heart, Briefcase, Shield, Zap, Target
} from 'lucide-react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

interface DashboardStats {
  students: { total: number; active: number };
  teachers: { total: number; active: number };
  attendance: { rate: number; today: number };
  finance: { revenue: number; pending: number };
  academics: { courses: number; assignments: number };
  library: { books: number; borrowed: number };
  hostel: { capacity: number; occupied: number };
  transport: { routes: number; students: number };
  sports: { teams: number; players: number };
}

export default function UnifiedDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeModule, setActiveModule] = useState('overview');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    
    try {
      const [statsRes, notifRes, eventsRes] = await Promise.all([
        axios.get(`${API_URL}/comprehensive-db/analytics/dashboard`, { headers }),
        axios.get(`${API_URL}/comprehensive-db/notifications?limit=5`, { headers }),
        axios.get(`${API_URL}/comprehensive-db/academic-calendar?upcoming=true&limit=5`, { headers })
      ]);
      
      setStats(statsRes.data.dashboard);
      setNotifications(notifRes.data.notifications || []);
      setEvents(eventsRes.data.events || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const modules = [
    { id: 'students', name: 'Abanyeshuri', icon: Users, color: 'blue', path: '/students' },
    { id: 'teachers', name: 'Abarimu', icon: GraduationCap, color: 'green', path: '/teachers' },
    { id: 'academics', name: 'Amasomo', icon: BookOpen, color: 'purple', path: '/academics' },
    { id: 'attendance', name: 'Kwitabira', icon: ClipboardList, color: 'orange', path: '/attendance' },
    { id: 'finance', name: 'Amafaranga', icon: DollarSign, color: 'emerald', path: '/finance' },
    { id: 'library', name: 'Isomero', icon: Library, color: 'indigo', path: '/library' },
    { id: 'hostel', name: 'Interineti', icon: Building, color: 'pink', path: '/hostel' },
    { id: 'transport', name: 'Transport', icon: Bus, color: 'cyan', path: '/transport' },
    { id: 'sports', name: 'Siporo', icon: Trophy, color: 'yellow', path: '/sports' },
    { id: 'exams', name: 'Ibizamini', icon: FileText, color: 'red', path: '/exams' },
    { id: 'analytics', name: 'Imibare', icon: BarChart3, color: 'violet', path: '/analytics' },
    { id: 'messages', name: 'Ubutumwa', icon: MessageSquare, color: 'teal', path: '/messages' },
    { id: 'leadership', name: 'Ubuyobozi', icon: Shield, color: 'amber', path: '/leadership' },
    { id: 'services', name: 'Serivisi', icon: Briefcase, color: 'lime', path: '/services' },
    { id: 'events', name: 'Ibirori', icon: Calendar, color: 'rose', path: '/events' },
    { id: 'settings', name: 'Igenamiterere', icon: Settings, color: 'gray', path: '/settings' }
  ];

  const statCards = [
    { title: 'Abanyeshuri', value: stats?.students?.total || 0, change: '+12%', icon: Users, color: 'blue' },
    { title: 'Abarimu', value: stats?.teachers?.total || 0, change: '+5%', icon: GraduationCap, color: 'green' },
    { title: 'Kwitabira', value: `${stats?.attendance?.rate || 0}%`, change: '+2%', icon: TrendingUp, color: 'purple' },
    { title: 'Amafaranga', value: `${(stats?.finance?.revenue || 0).toLocaleString()} RWF`, change: '+18%', icon: DollarSign, color: 'emerald' },
    { title: 'Amasomo', value: stats?.academics?.courses || 0, change: '+3', icon: BookOpen, color: 'orange' },
    { title: 'Ibitabo', value: stats?.library?.books || 0, change: '+45', icon: Library, color: 'indigo' },
    { title: 'Interineti', value: `${stats?.hostel?.occupied || 0}/${stats?.hostel?.capacity || 0}`, change: '85%', icon: Building, color: 'pink' },
    { title: 'Siporo', value: stats?.sports?.teams || 0, change: '+2', icon: Trophy, color: 'yellow' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Gutegura Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-green-500 to-blue-600 text-white py-6 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Home className="w-10 h-10" />
              <div>
                <h1 className="text-3xl font-black">Dashboard Nyamukuru</h1>
                <p className="text-blue-100">Garden TVET School Management System</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="relative p-2 hover:bg-white/20 rounded-full transition">
                <Bell className="w-6 h-6" />
                <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold">
                A
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-gradient-to-br from-${stat.color}-500 to-${stat.color}-600 rounded-2xl shadow-xl p-6 text-white`}
            >
              <div className="flex items-center justify-between mb-4">
                <stat.icon className="w-8 h-8" />
                <span className="text-sm bg-white/20 px-3 py-1 rounded-full">{stat.change}</span>
              </div>
              <h3 className="text-3xl font-black mb-1">{stat.value}</h3>
              <p className="text-white/80 text-sm">{stat.title}</p>
            </motion.div>
          ))}
        </div>

        {/* Modules Grid */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
            <Zap className="w-6 h-6 text-blue-600" />
            Ibice by'Isisteme
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {modules.map((module, index) => (
              <motion.button
                key={module.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.05, y: -5 }}
                onClick={() => setActiveModule(module.id)}
                className={`p-6 rounded-2xl bg-gradient-to-br from-${module.color}-50 to-${module.color}-100 hover:from-${module.color}-100 hover:to-${module.color}-200 transition-all shadow-lg hover:shadow-xl`}
              >
                <module.icon className={`w-8 h-8 text-${module.color}-600 mx-auto mb-3`} />
                <p className="text-sm font-bold text-gray-800">{module.name}</p>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Events & Notifications */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upcoming Events */}
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-green-600" />
              Ibirori Bizaza
            </h2>
            <div className="space-y-4">
              {events.map((event: any) => (
                <div key={event.id} className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl">
                  <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center text-white font-bold">
                    {new Date(event.event_date).getDate()}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900">{event.title}</h4>
                    <p className="text-sm text-gray-600">{event.event_type}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
              <Bell className="w-6 h-6 text-blue-600" />
              Amakuru Mashya
            </h2>
            <div className="space-y-4">
              {notifications.map((notif: any) => (
                <div key={notif.id} className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                  <h4 className="font-bold text-gray-900 mb-1">{notif.title}</h4>
                  <p className="text-sm text-gray-600">{notif.message}</p>
                  <p className="text-xs text-gray-400 mt-2">{new Date(notif.created_at).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-gradient-to-r from-blue-600 to-green-600 rounded-3xl shadow-xl p-8 text-white">
          <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
            <Target className="w-6 h-6" />
            Ibikorwa Byihuse
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <button className="bg-white/20 hover:bg-white/30 rounded-xl p-4 transition">
              <Users className="w-6 h-6 mx-auto mb-2" />
              <p className="text-sm font-bold">Ongeraho Umunyeshuri</p>
            </button>
            <button className="bg-white/20 hover:bg-white/30 rounded-xl p-4 transition">
              <FileText className="w-6 h-6 mx-auto mb-2" />
              <p className="text-sm font-bold">Tangaza Ikizamini</p>
            </button>
            <button className="bg-white/20 hover:bg-white/30 rounded-xl p-4 transition">
              <Calendar className="w-6 h-6 mx-auto mb-2" />
              <p className="text-sm font-bold">Shiraho Igikorwa</p>
            </button>
            <button className="bg-white/20 hover:bg-white/30 rounded-xl p-4 transition">
              <MessageSquare className="w-6 h-6 mx-auto mb-2" />
              <p className="text-sm font-bold">Ohereza Ubutumwa</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
