import React, { useState, useEffect } from 'react';
import { Bell, Calendar, AlertTriangle, Activity, Users, FileText, TrendingUp, Shield, Home, User, Scale, Mail, FileSpreadsheet, BarChart3, Menu, X } from 'lucide-react';
import { apiService } from '@/app/services/apiService';

interface Stats {
  ubutumwa_bushya: number;
  ibizamini_bitegerejwe: number;
  ibimenyetso_bya_sisiteme: number;
  amakosa_mashya: number;
  abanyeshuri_bose: number;
}

interface Activity {
  id: number;
  action: string;
  module: string;
  created_at: string;
}

interface Notification {
  id: number;
  title: string;
  message: string;
  notification_type: string;
  priority: string;
  is_read: boolean;
  created_at: string;
}

interface SystemHealth {
  status: string;
  total_students: number;
  active_cases: number;
  upcoming_exams: number;
}

const DODDashboard: React.FC<{ onNavigate: (page: string) => void; onLogout: () => void }> = ({ onNavigate, onLogout }) => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const [statsRes, activitiesRes, notificationsRes, healthRes] = await Promise.all([
        apiService.getDODStats(),
        apiService.getDODRecentActivities(),
        apiService.getDODNotifications({ is_read: 'false' }),
        apiService.getDODSystemHealth()
      ]);

      setStats(statsRes.stats);
      setActivities(activitiesRes.activities);
      setNotifications(notificationsRes.notifications);
      setSystemHealth(healthRes.health);
    } catch (error) {
      console.error('Ikosa mu gufata amakuru:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await apiService.markDODNotificationRead(id);
      loadDashboardData();
    } catch (error) {
      console.error('Ikosa mu gusoma ubutumwa:', error);
    }
  };

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins} iminota ishize`;
    if (diffHours < 24) return `${diffHours} amasaha ashize`;
    return `${diffDays} iminsi ishize`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-green-100">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-20 left-4 z-50 p-2 bg-green-600 text-white rounded-lg shadow-lg"
      >
        {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 w-64 transition-transform duration-300 ease-in-out mt-16`}>
        <div className="h-full bg-gradient-to-b from-green-600 via-yellow-500 to-green-600 overflow-y-auto shadow-2xl">
          <nav className="flex-1 px-3 py-4 space-y-2">
            {[
              { id: 'director-discipline-dashboard', label: 'Dashboard', Icon: Home, active: true },
              { id: 'dod-profile', label: 'Profil', Icon: User },
              { id: 'dod-discipline', label: 'Amakosa', Icon: FileText },
              { id: 'dod-exams', label: 'Ibizamini', Icon: Calendar },
              { id: 'dod-students', label: 'Abanyeshuri', Icon: Users },
              { id: 'dod-reports', label: 'Raporo', Icon: BarChart3 },
              { id: 'dod-punishments', label: 'Ibihano', Icon: Scale },
              { id: 'dod-parent-notifications', label: 'Ababyeyi', Icon: Mail },
              { id: 'dod-student-sheets', label: 'Imbonerahamwe', Icon: FileSpreadsheet }
            ].map(item => (
              <button key={item.id} onClick={() => onNavigate(item.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${item.active ? 'bg-white text-green-700 shadow-lg scale-105 font-bold' : 'text-white hover:bg-white/20 hover:scale-105'}`}>
                <item.Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>
      <div className="lg:pl-64 flex-1 pt-16">
        <div className="p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-gray-900">Ubuyobozi</h1>
          <button
            onClick={onLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Gusohoka
          </button>
        </div>
        <p className="text-gray-600">Umuyobozi w'Indero - Dashboard</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <Bell className="w-8 h-8" />
            <span className="text-3xl font-bold">{stats?.ubutumwa_bushya || 0}</span>
          </div>
          <p className="text-blue-100">Ubutumwa bushya</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="w-8 h-8" />
            <span className="text-3xl font-bold">{stats?.ibizamini_bitegerejwe || 0}</span>
          </div>
          <p className="text-purple-100">Ibizamini bitegerejwe</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="w-8 h-8" />
            <span className="text-3xl font-bold">{stats?.ibimenyetso_bya_sisiteme || 0}</span>
          </div>
          <p className="text-orange-100">Ibimenyetso bya sisiteme</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-8 h-8" />
            <span className="text-3xl font-bold">{stats?.abanyeshuri_bose || 0}</span>
          </div>
          <p className="text-green-100">Abanyeshuri bose</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Notifications */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Bell className="w-6 h-6 text-blue-600" />
              Amamenyo
            </h2>
            <button
              onClick={() => onNavigate('dod-notifications')}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Reba byose
            </button>
          </div>
          
          <div className="space-y-3">
            {notifications.slice(0, 5).map((notif) => (
              <div
                key={notif.id}
                className={`p-4 rounded-lg border-l-4 cursor-pointer transition ${
                  notif.priority === 'bihutirwa'
                    ? 'border-red-500 bg-red-50 hover:bg-red-100'
                    : notif.priority === 'byingenzi'
                    ? 'border-orange-500 bg-orange-50 hover:bg-orange-100'
                    : 'border-blue-500 bg-blue-50 hover:bg-blue-100'
                }`}
                onClick={() => markAsRead(notif.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{notif.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
                    <p className="text-xs text-gray-500 mt-2">{getTimeAgo(notif.created_at)}</p>
                  </div>
                  {!notif.is_read && (
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="w-6 h-6 text-green-600" />
            Ibikorwa Bya Vuba
          </h2>
          
          <div className="space-y-3">
            {activities.slice(0, 5).map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-xs text-gray-500">{getTimeAgo(activity.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Health */}
      <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Shield className="w-6 h-6 text-green-600" />
          Uko Sisiteme Imeze
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <div>
              <p className="text-sm text-gray-600">Imiterere</p>
              <p className="font-bold text-green-700">{systemHealth?.status || 'Birakora'}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
            <Users className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Abanyeshuri</p>
              <p className="font-bold text-blue-700">{systemHealth?.total_students || 0}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
            <Calendar className="w-5 h-5 text-purple-600" />
            <div>
              <p className="text-sm text-gray-600">Ibizamini bitegerejwe</p>
              <p className="font-bold text-purple-700">{systemHealth?.upcoming_exams || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <button onClick={() => onNavigate('dod-profile')} className="p-4 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-xl shadow-lg hover:shadow-xl transition">
          <Users className="w-8 h-8 mx-auto mb-2" />
          <p className="font-semibold text-sm">Profil</p>
        </button>
        <button onClick={() => onNavigate('dod-discipline')} className="p-4 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-xl shadow-lg hover:shadow-xl transition">
          <FileText className="w-8 h-8 mx-auto mb-2" />
          <p className="font-semibold text-sm">Amakosa</p>
        </button>
        <button onClick={() => onNavigate('dod-exams')} className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl shadow-lg hover:shadow-xl transition">
          <Calendar className="w-8 h-8 mx-auto mb-2" />
          <p className="font-semibold text-sm">Ibizamini</p>
        </button>
        <button onClick={() => onNavigate('dod-students')} className="p-4 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl shadow-lg hover:shadow-xl transition">
          <Users className="w-8 h-8 mx-auto mb-2" />
          <p className="font-semibold text-sm">Abanyeshuri</p>
        </button>
        <button onClick={() => onNavigate('dod-reports')} className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transition">
          <TrendingUp className="w-8 h-8 mx-auto mb-2" />
          <p className="font-semibold text-sm">Raporo</p>
        </button>
        <button onClick={() => onNavigate('dod-punishments')} className="p-4 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl shadow-lg hover:shadow-xl transition">
          <Shield className="w-8 h-8 mx-auto mb-2" />
          <p className="font-semibold text-sm">Ibihano</p>
        </button>
        <button onClick={() => onNavigate('dod-parent-notifications')} className="p-4 bg-gradient-to-br from-teal-500 to-teal-600 text-white rounded-xl shadow-lg hover:shadow-xl transition">
          <Bell className="w-8 h-8 mx-auto mb-2" />
          <p className="font-semibold text-sm">Ababyeyi</p>
        </button>
        <button onClick={() => onNavigate('dod-student-sheets')} className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transition">
          <FileText className="w-8 h-8 mx-auto mb-2" />
          <p className="font-semibold text-sm">Imbonerahamwe</p>
        </button>
      </div>
        </div>
      </div>
    </div>
  );
};

export default DODDashboard;
