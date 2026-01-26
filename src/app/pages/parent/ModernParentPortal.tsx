import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Award, Calendar, DollarSign, MessageSquare, Bell, User, School, Mail, Star, Trash2, ChevronRight, TrendingUp, BookOpen, Target, Clock, CheckCircle, XCircle, AlertCircle, BarChart3, PieChart, Activity, Zap, Trophy, Medal, Gift, Heart, ThumbsUp, Download, Share2, Filter, Search, RefreshCw } from 'lucide-react';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');
const API_URL = 'http://localhost:5000/api';

interface ParentPortalProps {
  parentId: number;
  parentPhone: string;
  onNavigate: (page: string) => void;
}

export const ModernParentPortal: React.FC<ParentPortalProps> = ({ parentId, parentPhone, onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'academics' | 'attendance' | 'discipline' | 'fees' | 'messages'>('overview');
  const [children, setChildren] = useState<any[]>([]);
  const [selectedChild, setSelectedChild] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [childData, setChildData] = useState<any>(null);
  const [academics, setAcademics] = useState<any>(null);
  const [attendance, setAttendance] = useState<any>(null);
  const [discipline, setDiscipline] = useState<any>(null);
  const [fees, setFees] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchChildren();
    fetchMessages();

    socket.on('parent:message', (data: any) => {
      if (data.parentId === parentId) {
        setMessages(prev => [{ ...data, id: Date.now(), read: false, starred: false }, ...prev]);
        setUnreadCount(prev => prev + 1);
      }
    });

    socket.on('student:update', (data: any) => {
      if (selectedChild && data.studentId === selectedChild.id) {
        fetchChildData();
      }
    });

    return () => {
      socket.off('parent:message');
      socket.off('student:update');
    };
  }, [parentId, selectedChild]);

  useEffect(() => {
    if (selectedChild) fetchChildData();
  }, [selectedChild]);

  const fetchChildren = async () => {
    try {
      const res = await fetch(`${API_URL}/parents/${parentId}/children`);
      const data = await res.json();
      if (data.success) {
        setChildren(data.children || []);
        if (data.children?.length > 0) setSelectedChild(data.children[0]);
      }
    } catch (error) {}
  };

  const fetchMessages = async () => {
    try {
      const res = await fetch(`${API_URL}/parents/${parentId}/messages`);
      const data = await res.json();
      if (data.success) {
        setMessages(data.messages || []);
        setUnreadCount(data.messages?.filter((m: any) => !m.read).length || 0);
      }
    } catch (error) {}
  };

  const fetchChildData = async () => {
    if (!selectedChild) return;
    setLoading(true);
    try {
      const [dashRes, acadRes, attRes, discRes, feeRes] = await Promise.all([
        fetch(`${API_URL}/parent-dashboard/child/${selectedChild.id}/dashboard`),
        fetch(`${API_URL}/parent-dashboard/child/${selectedChild.id}/academics`),
        fetch(`${API_URL}/parent-dashboard/child/${selectedChild.id}/attendance`),
        fetch(`${API_URL}/parent-dashboard/child/${selectedChild.id}/discipline`),
        fetch(`${API_URL}/parent-dashboard/child/${selectedChild.id}/fees`)
      ]);

      const [dashData, acadData, attData, discData, feeData] = await Promise.all([
        dashRes.json(), acadRes.json(), attRes.json(), discRes.json(), feeRes.json()
      ]);

      if (dashData.success) setChildData(dashData.data);
      if (acadData.success) setAcademics(acadData.data);
      if (attData.success) setAttendance(attData.data);
      if (discData.success) setDiscipline(discData.data);
      if (feeData.success) setFees(feeData.data);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await fetchChildData();
    setRefreshing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-green-100">
      {/* Modern Header */}
      <div className="bg-gradient-to-r from-green-600 via-yellow-500 to-green-600 shadow-2xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white p-3 rounded-2xl shadow-lg">
                <School className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-white">GARDEN TSS</h1>
                <p className="text-green-100 font-medium">Parent Portal • {parentPhone}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={refreshData} disabled={refreshing} className="bg-white/20 hover:bg-white/30 text-white p-3 rounded-xl transition-all">
                <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              {unreadCount > 0 && (
                <div className="bg-red-500 text-white px-4 py-2 rounded-full font-bold shadow-lg animate-pulse">
                  {unreadCount} New
                </div>
              )}
            </div>
          </div>

          {/* Child Selector */}
          {children.length > 0 && (
            <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
              {children.map(child => (
                <button
                  key={child.id}
                  onClick={() => setSelectedChild(child)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap ${
                    selectedChild?.id === child.id
                      ? 'bg-white text-green-600 shadow-lg scale-105'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  <User className="w-4 h-4" />
                  {child.name}
                </button>
              ))}
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'academics', label: 'Academics', icon: BookOpen },
              { id: 'attendance', label: 'Attendance', icon: Calendar },
              { id: 'discipline', label: 'Conduct', icon: Trophy },
              { id: 'fees', label: 'Fees', icon: DollarSign },
              { id: 'messages', label: 'Messages', icon: MessageSquare, badge: unreadCount }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all relative whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-white text-green-600 shadow-lg'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {tab.badge && tab.badge > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {/* Overview Tab */}
          {activeTab === 'overview' && childData && (
            <motion.div key="overview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
              {/* Hero Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { title: 'Average Marks', value: `${childData.average_marks?.toFixed(1)}%`, icon: Award, gradient: 'from-green-400 to-green-600', trend: '+5%' },
                  { title: 'Attendance', value: `${childData.attendance_percentage}%`, icon: Calendar, gradient: 'from-yellow-400 to-yellow-600', trend: '+2%' },
                  { title: 'Conduct Score', value: childData.conduct_score, icon: Trophy, gradient: 'from-green-500 to-yellow-500', trend: 'Excellent' },
                  { title: 'Fee Balance', value: `${childData.fee_balance?.toLocaleString()} RWF`, icon: DollarSign, gradient: 'from-yellow-500 to-green-500', trend: '-10K' }
                ].map((stat, i) => (
                  <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}>
                    <div className={`bg-gradient-to-br ${stat.gradient} rounded-2xl p-6 text-white shadow-2xl hover:scale-105 transition-transform`}>
                      <div className="flex items-start justify-between mb-4">
                        <stat.icon className="w-12 h-12 opacity-80" />
                        <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-bold">{stat.trend}</span>
                      </div>
                      <p className="text-white/80 text-sm font-medium">{stat.title}</p>
                      <p className="text-4xl font-black mt-2">{stat.value}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Quick Info Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-6">
                  <h3 className="text-2xl font-black mb-6 bg-gradient-to-r from-green-600 to-yellow-600 bg-clip-text text-transparent">Student Profile</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'Student ID', value: childData.student_id, icon: User },
                      { label: 'Class', value: childData.class_name, icon: BookOpen },
                      { label: 'Grade', value: childData.grade, icon: Award },
                      { label: 'Class Teacher', value: childData.class_teacher, icon: Users },
                      { label: 'Total Subjects', value: childData.total_subjects, icon: Target },
                      { label: 'Class Rank', value: `#${childData.class_rank}`, icon: Trophy }
                    ].map((item, i) => (
                      <div key={i} className="bg-gradient-to-br from-green-50 to-yellow-50 rounded-xl p-4 border-2 border-green-200 hover:border-green-400 transition-all">
                        <div className="flex items-center gap-2 mb-2">
                          <item.icon className="w-5 h-5 text-green-600" />
                          <p className="text-sm text-gray-600 font-medium">{item.label}</p>
                        </div>
                        <p className="text-xl font-black text-gray-900">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-yellow-500 rounded-2xl shadow-xl p-6 text-white">
                  <h3 className="text-2xl font-black mb-6">Quick Actions</h3>
                  <div className="space-y-3">
                    {[
                      { label: 'View Full Report', icon: Download },
                      { label: 'Contact Teacher', icon: Mail },
                      { label: 'Share Progress', icon: Share2 },
                      { label: 'Set Reminders', icon: Bell }
                    ].map((action, i) => (
                      <button key={i} className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl p-4 flex items-center gap-3 transition-all">
                        <action.icon className="w-5 h-5" />
                        <span className="font-bold">{action.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Performance Overview */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl shadow-xl p-6">
                  <h3 className="text-xl font-black mb-4 flex items-center gap-2">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                    Academic Trend
                  </h3>
                  <div className="space-y-3">
                    {academics?.grades?.slice(0, 5).map((grade: any, i: number) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="flex-1">
                          <p className="font-bold text-gray-900">{grade.subject_name}</p>
                          <div className="bg-gray-200 rounded-full h-3 mt-2 overflow-hidden">
                            <div 
                              className="bg-gradient-to-r from-green-500 to-yellow-500 h-full transition-all"
                              style={{ width: `${grade.total_marks}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-2xl font-black text-green-600">{grade.total_marks}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-xl p-6">
                  <h3 className="text-xl font-black mb-4 flex items-center gap-2">
                    <Activity className="w-6 h-6 text-yellow-600" />
                    Recent Activity
                  </h3>
                  <div className="space-y-3">
                    {[
                      { text: 'Attended Math class', time: '2 hours ago', icon: CheckCircle, color: 'text-green-600' },
                      { text: 'Submitted assignment', time: '5 hours ago', icon: BookOpen, color: 'text-blue-600' },
                      { text: 'Received grade: 85%', time: '1 day ago', icon: Award, color: 'text-yellow-600' },
                      { text: 'Payment received', time: '2 days ago', icon: DollarSign, color: 'text-green-600' }
                    ].map((activity, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-yellow-50 rounded-xl">
                        <activity.icon className={`w-5 h-5 ${activity.color}`} />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{activity.text}</p>
                          <p className="text-xs text-gray-500">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {loading && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl p-8 shadow-2xl">
                <div className="animate-spin w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-700 font-bold text-lg">Loading data...</p>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
