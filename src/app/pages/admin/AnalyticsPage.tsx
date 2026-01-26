import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { BarChart3, Users, BookOpen, DollarSign, TrendingUp, TrendingDown, Activity, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Progress } from '@/app/components/ui/progress';

interface Analytics {
  students: number;
  teachers: number;
  parents: number;
  staff: number;
  courses: number;
  revenue: number;
  stock: number;
  enrollments_this_month: number;
  attendance_rate: number;
  payment_collection_rate: number;
  active_classes: number;
  pending_assignments: number;
}

const AnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/admin/analytics?range=${timeRange}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setAnalytics(data.analytics);
    } catch (error) {
      console.error('Fetch analytics error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('rw-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const statCards = analytics ? [
    { title: 'Abanyeshuri / Students', value: analytics.students, icon: Users, color: 'from-blue-500 to-cyan-500', change: '+12%' },
    { title: 'Abarimu / Teachers', value: analytics.teachers, icon: BookOpen, color: 'from-green-500 to-emerald-500', change: '+5%' },
    { title: 'Ababyeyi / Parents', value: analytics.parents, icon: Users, color: 'from-purple-500 to-violet-500', change: '+8%' },
    { title: 'Abakozi / Staff', value: analytics.staff, icon: Users, color: 'from-orange-500 to-red-500', change: '+3%' },
    { title: 'Amasomo / Courses', value: analytics.courses, icon: BookOpen, color: 'from-indigo-500 to-blue-500', change: '+2%' },
    { title: 'Amafaranga / Revenue', value: formatCurrency(analytics.revenue), icon: DollarSign, color: 'from-yellow-500 to-orange-500', change: '+15%' },
  ] : [];

  const performanceMetrics = analytics ? [
    { label: 'Kwitabira / Attendance Rate', value: analytics.attendance_rate || 85, color: 'bg-green-500' },
    { label: 'Kwishyura / Payment Collection', value: analytics.payment_collection_rate || 78, color: 'bg-blue-500' },
    { label: 'Ibyiciro Bikora / Active Classes', value: (analytics.active_classes / 50) * 100, color: 'bg-purple-500' },
  ] : [];

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-xl">
            <BarChart3 className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Imibare / Analytics
            </h1>
            <p className="text-gray-600">Imibare n'ibarurisho / Statistics and insights</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setTimeRange('week')}
            className={`px-4 py-2 rounded-lg ${timeRange === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
          >
            Icyumweru / Week
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`px-4 py-2 rounded-lg ${timeRange === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
          >
            Ukwezi / Month
          </button>
          <button
            onClick={() => setTimeRange('year')}
            className={`px-4 py-2 rounded-lg ${timeRange === 'year' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
          >
            Umwaka / Year
          </button>
        </div>
      </div>

      {loading ? (
        <Card><CardContent className="p-8 text-center">Loading analytics...</CardContent></Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {statCards.map((stat, index) => (
              <motion.div key={stat.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                <Card className="border-2 border-blue-100 hover:shadow-xl transition">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`bg-gradient-to-br ${stat.color} p-3 rounded-xl`}>
                        <stat.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex items-center gap-1 text-green-600 text-sm font-bold">
                        <TrendingUp className="w-4 h-4" />
                        {stat.change}
                      </div>
                    </div>
                    <h3 className="text-sm font-medium text-gray-600 mb-1">{stat.title}</h3>
                    <p className="text-3xl font-black text-gray-900">{stat.value}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <Card className="border-2 border-blue-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                Imikorere / Performance Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {performanceMetrics.map((metric, index) => (
                <div key={index}>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{metric.label}</span>
                    <span className="text-sm font-bold text-gray-900">{metric.value.toFixed(1)}%</span>
                  </div>
                  <Progress value={metric.value} className={`h-3 ${metric.color}`} />
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-2 border-green-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Kwiyandikisha / Enrollments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-5xl font-black text-green-600">{analytics?.enrollments_this_month || 0}</p>
                  <p className="text-gray-600 mt-2">Abanyeshuri bashya muri uyu kwezi / New students this month</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-purple-600" />
                  Ibikorwa / Activities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                    <span className="font-medium">Ibyiciro Bikora / Active Classes</span>
                    <span className="text-2xl font-bold text-purple-600">{analytics?.active_classes || 0}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                    <span className="font-medium">Ibikorwa Bitegerejwe / Pending Assignments</span>
                    <span className="text-2xl font-bold text-orange-600">{analytics?.pending_assignments || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default AnalyticsPage;
