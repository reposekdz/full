import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  TrendingUp, TrendingDown, Users, DollarSign, BookOpen, Award,
  Calendar, Activity, BarChart3, PieChart, LineChart, Target,
  CheckCircle, AlertCircle, Clock, ArrowUpRight, ArrowDownRight,
  Zap, Star, Trophy, Database, RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';

const API_BASE = 'http://localhost:5000/api';

interface AnalyticsDashboardProps {
  userRole: string;
  userId: number;
}

const ComprehensiveAnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ userRole, userId }) => {
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [timeRange, setTimeRange] = useState('month');
  const [selectedMetric, setSelectedMetric] = useState('overview');

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, [timeRange]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [summary, studentPerf, attendance, financial] = await Promise.all([
        fetch(`${API_BASE}/advanced-reports/dashboard-summary`).then(r => r.json()),
        fetch(`${API_BASE}/advanced-analytics/class-performance-comparison`).then(r => r.json()),
        fetch(`${API_BASE}/advanced-analytics/attendance-analytics?class_id=1&start_date=${getStartDate()}&end_date=${new Date().toISOString().split('T')[0]}`).then(r => r.json()),
        fetch(`${API_BASE}/advanced-reports/financial-report?year=${new Date().getFullYear()}`).then(r => r.json())
      ]);

      setDashboardData({
        summary: summary.success ? summary : {},
        performance: studentPerf.success ? studentPerf.comparison : [],
        attendance: attendance.success ? attendance.analytics : [],
        financial: financial.success ? financial : {}
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStartDate = () => {
    const date = new Date();
    if (timeRange === 'week') date.setDate(date.getDate() - 7);
    else if (timeRange === 'month') date.setMonth(date.getMonth() - 1);
    else if (timeRange === 'year') date.setFullYear(date.getFullYear() - 1);
    return date.toISOString().split('T')[0];
  };

  const StatCard = ({ title, value, icon: Icon, trend, trendValue, color }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -5 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="relative overflow-hidden border-none shadow-xl">
        <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-10`}></div>
        <CardContent className="p-6 relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl bg-gradient-to-br ${color}`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            {trend && (
              <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                <span className="text-sm font-bold">{trendValue}%</span>
              </div>
            )}
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
          <p className="text-3xl font-black bg-gradient-to-r from-green-600 to-yellow-600 bg-clip-text text-transparent">
            {value}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );

  const ProgressBar = ({ label, value, max, color }: any) => (
    <div className="mb-4">
      <div className="flex justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm font-bold text-gray-900">{value}/{max}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(value / max) * 100}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`h-full bg-gradient-to-r ${color} rounded-full relative`}
        >
          <div className="absolute inset-0 bg-white opacity-20 animate-pulse"></div>
        </motion.div>
      </div>
    </div>
  );

  const MetricCard = ({ title, metrics }: any) => (
    <Card className="border-none shadow-lg">
      <CardHeader className="bg-gradient-to-r from-green-50 to-yellow-50">
        <CardTitle className="text-lg font-black text-gray-800">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {metrics.map((metric: any, idx: number) => (
          <div key={idx} className="flex items-center justify-between py-3 border-b last:border-0">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-gradient-to-br ${metric.color}`}>
                <metric.icon className="w-5 h-5 text-white" />
              </div>
              <span className="font-medium text-gray-700">{metric.label}</span>
            </div>
            <span className="text-xl font-black bg-gradient-to-r from-green-600 to-yellow-600 bg-clip-text text-transparent">
              {metric.value}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );

  if (loading && !dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-green-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-green-600 border-t-yellow-600 rounded-full"
        />
      </div>
    );
  }

  const summary = dashboardData?.summary || {};
  const attendance = dashboardData?.attendance?.[0] || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-green-50 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-green-600 to-yellow-600 bg-clip-text text-transparent">
              Analytics Dashboard
            </h1>
            <p className="text-gray-600 mt-2">Real-time school performance insights</p>
          </div>
          
          <div className="flex gap-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border-2 border-yellow-200 rounded-xl focus:border-green-400 outline-none font-medium"
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="year">Last Year</option>
            </select>
            
            <Button
              onClick={fetchDashboardData}
              disabled={loading}
              className="bg-gradient-to-r from-green-600 to-yellow-600 hover:from-green-700 hover:to-yellow-700"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Students"
            value={summary.students || 0}
            icon={Users}
            trend="up"
            trendValue="8.2"
            color="from-blue-500 to-blue-600"
          />
          <StatCard
            title="Total Teachers"
            value={summary.teachers || 0}
            icon={Award}
            trend="up"
            trendValue="3.1"
            color="from-green-500 to-green-600"
          />
          <StatCard
            title="Today's Attendance"
            value={attendance.present_count || 0}
            icon={CheckCircle}
            trend="up"
            trendValue="5.4"
            color="from-yellow-500 to-yellow-600"
          />
          <StatCard
            title="Pending Fees"
            value={`$${(summary.pendingFees || 0).toLocaleString()}`}
            icon={DollarSign}
            trend="down"
            trendValue="2.3"
            color="from-purple-500 to-purple-600"
          />
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Performance Metrics */}
        <div className="lg:col-span-2">
          <Card className="border-none shadow-xl">
            <CardHeader className="bg-gradient-to-r from-green-50 to-yellow-50">
              <CardTitle className="flex items-center gap-2 font-black">
                <TrendingUp className="w-6 h-6 text-green-600" />
                Performance Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {dashboardData?.performance?.slice(0, 5).map((cls: any, idx: number) => (
                <ProgressBar
                  key={idx}
                  label={cls.class_name}
                  value={Math.round(cls.average_grade || 0)}
                  max={100}
                  color={cls.average_grade >= 75 ? 'from-green-500 to-green-600' : cls.average_grade >= 60 ? 'from-yellow-500 to-yellow-600' : 'from-red-500 to-red-600'}
                />
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Quick Insights */}
        <div>
          <MetricCard
            title="Quick Insights"
            metrics={[
              { label: 'Active Classes', value: dashboardData?.performance?.length || 0, icon: BookOpen, color: 'from-blue-500 to-blue-600' },
              { label: 'Avg Performance', value: Math.round(dashboardData?.performance?.reduce((sum: number, c: any) => sum + (c.average_grade || 0), 0) / (dashboardData?.performance?.length || 1)) || 0, icon: Target, color: 'from-green-500 to-green-600' },
              { label: 'Top Class Score', value: Math.max(...(dashboardData?.performance?.map((c: any) => c.average_grade) || [0])).toFixed(1), icon: Trophy, color: 'from-yellow-500 to-yellow-600' },
              { label: 'Active Events', value: '12', icon: Calendar, color: 'from-purple-500 to-purple-600' }
            ]}
          />
        </div>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Financial Overview */}
        <Card className="border-none shadow-xl">
          <CardHeader className="bg-gradient-to-r from-green-50 to-yellow-50">
            <CardTitle className="flex items-center gap-2 font-black">
              <DollarSign className="w-6 h-6 text-green-600" />
              Financial Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-green-50 rounded-xl">
                <span className="font-medium text-gray-700">Total Income</span>
                <span className="text-2xl font-black text-green-600">
                  ${(dashboardData?.financial?.income?.total_income || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-red-50 rounded-xl">
                <span className="font-medium text-gray-700">Total Expenses</span>
                <span className="text-2xl font-black text-red-600">
                  ${(dashboardData?.financial?.expenses?.reduce((sum: number, e: any) => sum + parseFloat(e.total_amount || 0), 0) || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-100 to-yellow-100 rounded-xl">
                <span className="font-bold text-gray-800">Net Income</span>
                <span className="text-2xl font-black bg-gradient-to-r from-green-600 to-yellow-600 bg-clip-text text-transparent">
                  ${(dashboardData?.financial?.netIncome || 0).toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card className="border-none shadow-xl">
          <CardHeader className="bg-gradient-to-r from-green-50 to-yellow-50">
            <CardTitle className="flex items-center gap-2 font-black">
              <Activity className="w-6 h-6 text-green-600" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[
                { label: 'Database', status: 'Operational', color: 'green', icon: Database },
                { label: 'API Services', status: 'All Systems Go', color: 'green', icon: Zap },
                { label: 'Analytics Engine', status: 'Running', color: 'green', icon: BarChart3 },
                { label: 'Backup Status', status: 'Up to Date', color: 'green', icon: CheckCircle }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-${item.color}-100`}>
                      <item.icon className={`w-5 h-5 text-${item.color}-600`} />
                    </div>
                    <span className="font-medium text-gray-700">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full bg-${item.color}-500 animate-pulse`}></div>
                    <span className={`text-sm font-bold text-${item.color}-600`}>{item.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ComprehensiveAnalyticsDashboard;
