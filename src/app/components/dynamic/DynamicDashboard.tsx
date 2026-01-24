import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export default function DynamicDashboard() {
  const [config, setConfig] = useState<any>({});
  const [widgets, setWidgets] = useState<any[]>([]);
  const [modules, setModules] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [metrics, setMetrics] = useState<any>({});
  const [theme, setTheme] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchDynamicData = useCallback(async () => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    
    try {
      const [configRes, widgetsRes, statsRes, metricsRes, themeRes] = await Promise.all([
        axios.get(`${API_URL}/dynamic-system/config`, { headers }),
        axios.get(`${API_URL}/dynamic-system/widgets`, { headers }),
        axios.get(`${API_URL}/dynamic-system/stats/realtime`, { headers }),
        axios.get(`${API_URL}/dynamic-system/metrics/calculated`, { headers }),
        axios.get(`${API_URL}/dynamic-system/theme`, { headers })
      ]);
      
      setConfig(configRes.data.config || {});
      setWidgets(widgetsRes.data.widgets || []);
      setStats(statsRes.data.stats || {});
      setMetrics(metricsRes.data.metrics || {});
      setTheme(themeRes.data.theme || {});
      setLastUpdate(new Date());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDynamicData();
    const interval = setInterval(fetchDynamicData, parseInt(config.dashboard_refresh_interval || '30000'));
    return () => clearInterval(interval);
  }, [config.dashboard_refresh_interval, fetchDynamicData]);

  const getIcon = (iconName: string) => {
    const Icon = (Icons as any)[iconName] || Icons.Circle;
    return Icon;
  };

  const renderStatWidget = (widget: any) => {
    const widgetConfig = typeof widget.config === 'string' ? JSON.parse(widget.config) : widget.config;
    const Icon = getIcon(widgetConfig.icon);
    
    let value = 0, subtitle = '', change = '+0%';
    
    if (widget.widget_key === 'students_stat') {
      value = stats.students?.total || 0;
      subtitle = `${stats.students?.active || 0} Bakora`;
      change = stats.students?.growth || '+0%';
    } else if (widget.widget_key === 'teachers_stat') {
      value = stats.teachers?.total || 0;
      subtitle = `${stats.teachers?.active || 0} Bakora`;
      change = stats.teachers?.growth || '+0%';
    } else if (widget.widget_key === 'attendance_stat') {
      value = `${stats.attendance?.rate || 0}%`;
      subtitle = `${stats.attendance?.today || 0} Uyu Munsi`;
      change = '+2%';
    } else if (widget.widget_key === 'finance_stat') {
      value = `${(stats.finance?.revenue || 0).toLocaleString()} ${config.currency || 'RWF'}`;
      subtitle = `${stats.finance?.payments || 0} Kwishyura`;
      change = stats.finance?.growth || '+0%';
    }
    
    return (
      <motion.div
        key={widget.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-gradient-to-br from-${widgetConfig.color}-500 to-${widgetConfig.color}-600 rounded-2xl shadow-xl p-6 text-white`}
      >
        <div className="flex items-center justify-between mb-4">
          <Icon className="w-8 h-8" />
          <span className="text-sm bg-white/20 px-3 py-1 rounded-full">{change}</span>
        </div>
        <h3 className="text-3xl font-black mb-1">{value}</h3>
        <p className="text-white/80 text-sm">{widget.title}</p>
        <p className="text-white/60 text-xs mt-1">{subtitle}</p>
      </motion.div>
    );
  };

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
      <div 
        className="text-white py-6 shadow-xl"
        style={{ background: `linear-gradient(to right, ${theme.primary_color || '#3B82F6'}, ${theme.secondary_color || '#10B981'})` }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Icons.Home className="w-10 h-10" />
              <div>
                <h1 className="text-3xl font-black">{theme.school_name || 'Garden TVET School'}</h1>
                <p className="text-blue-100">Umwaka: {config.academic_year} | Igihembwe: {config.semester}</p>
              </div>
            </div>
            <div className="text-right text-sm">
              <p className="text-white/80">Ivugururwa</p>
              <p className="font-bold">{lastUpdate.toLocaleTimeString('rw-RW')}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {widgets.filter(w => w.widget_type === 'stat').sort((a, b) => a.display_order - b.display_order).map(renderStatWidget)}
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
            <Icons.TrendingUp className="w-6 h-6 text-orange-600" />
            Ibipimo Bibariwemo
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
              <p className="text-sm text-gray-600 mb-1">Igipimo cy'Abanyeshuri</p>
              <p className="text-2xl font-black text-blue-600">{metrics.retentionRate}%</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
              <p className="text-sm text-gray-600 mb-1">Umwarimu/Umunyeshuri</p>
              <p className="text-2xl font-black text-green-600">1:{metrics.teacherStudentRatio}</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
              <p className="text-sm text-gray-600 mb-1">Amanota</p>
              <p className="text-2xl font-black text-purple-600">{metrics.averageGrade}%</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl">
              <p className="text-sm text-gray-600 mb-1">Kwishyura</p>
              <p className="text-2xl font-black text-orange-600">{metrics.feeCollectionRate}%</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl">
              <p className="text-sm text-gray-600 mb-1">Gutsinda</p>
              <p className="text-2xl font-black text-emerald-600">{metrics.examPassRate}%</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-white rounded-3xl shadow-xl p-6">
            <h3 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
              <Icons.Library className="w-5 h-5 text-indigo-600" />
              Isomero
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Ibitabo:</span>
                <span className="font-bold">{stats.library?.books || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Byagurijwe:</span>
                <span className="font-bold">{stats.library?.borrowed || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Bihari:</span>
                <span className="font-bold text-green-600">{stats.library?.available || 0}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-xl p-6">
            <h3 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
              <Icons.Building className="w-5 h-5 text-pink-600" />
              Interineti
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Ubushobozi:</span>
                <span className="font-bold">{stats.hostel?.capacity || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Byuzuye:</span>
                <span className="font-bold">{stats.hostel?.occupied || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Igipimo:</span>
                <span className="font-bold text-blue-600">{stats.hostel?.occupancy || 0}%</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-xl p-6">
            <h3 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
              <Icons.Trophy className="w-5 h-5 text-yellow-600" />
              Siporo
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Amakipe:</span>
                <span className="font-bold">{stats.sports?.teams || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Abakinnyi:</span>
                <span className="font-bold">{stats.sports?.players || 0}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center text-sm text-gray-500 mt-8">
          <Icons.RefreshCw className="w-4 h-4 inline mr-2" />
          Ivugururwa buri {parseInt(config.dashboard_refresh_interval || '30000') / 1000}s
        </div>
      </div>
    </div>
  );
}
