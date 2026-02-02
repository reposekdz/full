import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Crown, TrendingUp, DollarSign, Users, Package, BookOpen, 
  Activity, Download, RefreshCw, Eye, BarChart3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';

const SchoolOwnerDashboard = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/school-owner/dashboard', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const result = await res.json();
      setData(result.dashboard);
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
      </div>
    );
  }

  const { financial, academic, stock, staff, discipline } = data || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-500 via-orange-600 to-red-600 text-white rounded-2xl shadow-2xl p-8 mb-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-4 rounded-xl">
                <Crown className="w-10 h-10" />
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2">School Owner Dashboard</h1>
                <p className="text-yellow-100 text-lg">Supreme Access - Complete Control</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={fetchDashboard} variant="ghost" className="text-white hover:bg-white/20">
                <RefreshCw className="w-5 h-5 mr-2" />
                Refresh
              </Button>
              <Button variant="ghost" className="text-white hover:bg-white/20">
                <Download className="w-5 h-5 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Revenue Collected"
            value={`${(financial?.revenue?.collected || 0).toLocaleString()} RWF`}
            subtitle={`${financial?.revenue?.collection_rate || 0}% collection rate`}
            icon={<DollarSign className="w-8 h-8" />}
            gradient="from-green-500 to-emerald-600"
          />
          <StatCard
            title="Net Profit"
            value={`${(financial?.profit?.net || 0).toLocaleString()} RWF`}
            subtitle={`${financial?.profit?.margin || 0}% margin`}
            icon={<TrendingUp className="w-8 h-8" />}
            gradient="from-blue-500 to-indigo-600"
          />
          <StatCard
            title="Total Students"
            value={academic?.students?.total || 0}
            subtitle={`${academic?.students?.honors || 0} honors students`}
            icon={<Users className="w-8 h-8" />}
            gradient="from-purple-500 to-pink-600"
          />
          <StatCard
            title="Stock Value"
            value={`${(stock?.total_value || 0).toLocaleString()} RWF`}
            subtitle={`${stock?.low_stock || 0} items low`}
            icon={<Package className="w-8 h-8" />}
            gradient="from-orange-500 to-red-600"
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Financial Overview */}
          <Card className="border-2 border-green-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-6 h-6" />
                Financial Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <FinanceRow label="Expected Revenue" value={financial?.revenue?.expected || 0} />
                <FinanceRow label="Collected" value={financial?.revenue?.collected || 0} highlight />
                <FinanceRow label="Outstanding" value={financial?.revenue?.outstanding || 0} />
                <div className="border-t pt-4">
                  <FinanceRow label="Total Expenses" value={financial?.expenses?.total || 0} />
                  <FinanceRow label="Salaries" value={financial?.salaries?.total || 0} />
                  <FinanceRow label="Net Profit" value={financial?.profit?.net || 0} highlight />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Academic Performance */}
          <Card className="border-2 border-blue-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-6 h-6" />
                Academic Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <MetricRow label="Average GPA" value={academic?.performance?.avg_gpa || '0.00'} />
                <MetricRow label="Attendance Rate" value={`${academic?.performance?.avg_attendance || 0}%`} />
                <MetricRow label="Honors Students" value={academic?.students?.honors || 0} />
                <MetricRow label="At Risk Students" value={academic?.students?.at_risk || 0} />
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-700 mb-2">Top Trades</h4>
                  {academic?.by_trade?.slice(0, 3).map((trade: any, idx: number) => (
                    <div key={idx} className="flex justify-between text-sm py-1">
                      <span className="text-gray-600">{trade.trade_name}</span>
                      <span className="font-semibold text-blue-600">GPA: {parseFloat(trade.avg_gpa).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-2 border-orange-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-orange-500 to-red-600 text-white">
              <CardTitle className="flex items-center gap-2">
                <Package className="w-6 h-6" />
                Stock Management
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                <MetricRow label="Total Items" value={stock?.total_items || 0} />
                <MetricRow label="Total Value" value={`${(stock?.total_value || 0).toLocaleString()} RWF`} />
                <MetricRow label="Low Stock" value={stock?.low_stock || 0} alert />
                <MetricRow label="Out of Stock" value={stock?.out_of_stock || 0} alert />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-600 text-white">
              <CardTitle className="flex items-center gap-2">
                <Users className="w-6 h-6" />
                Staff Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-2">
                {staff?.slice(0, 5).map((role: any, idx: number) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-gray-600">{role.role}</span>
                    <span className="font-semibold text-purple-600">{role.count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-red-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-red-500 to-pink-600 text-white">
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-6 h-6" />
                Discipline
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                <MetricRow label="Total Incidents" value={discipline?.total_incidents || 0} />
                <MetricRow label="High Severity" value={discipline?.high_severity || 0} alert />
                <MetricRow label="Resolved" value={discipline?.resolved || 0} />
                <MetricRow label="Avg Conduct Score" value={discipline?.avg_conduct || '0.00'} />
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
};

const StatCard = ({ title, value, subtitle, icon, gradient }: any) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    whileHover={{ scale: 1.05 }}
  >
    <Card className="border-2 border-gray-200 shadow-lg hover:shadow-2xl transition-all">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className={`bg-gradient-to-br ${gradient} text-white p-3 rounded-xl`}>
            {icon}
          </div>
        </div>
        <h3 className="text-gray-600 text-sm font-medium mb-2">{title}</h3>
        <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
        <p className="text-sm text-gray-600">{subtitle}</p>
      </CardContent>
    </Card>
  </motion.div>
);

const FinanceRow = ({ label, value, highlight }: any) => (
  <div className="flex justify-between items-center">
    <span className={`${highlight ? 'font-bold' : 'font-medium'} text-gray-700`}>{label}</span>
    <span className={`${highlight ? 'text-xl font-bold text-green-600' : 'font-semibold text-gray-900'}`}>
      {value.toLocaleString()} RWF
    </span>
  </div>
);

const MetricRow = ({ label, value, alert }: any) => (
  <div className="flex justify-between items-center">
    <span className="text-gray-700 font-medium">{label}</span>
    <span className={`font-bold ${alert ? 'text-red-600' : 'text-gray-900'}`}>{value}</span>
  </div>
);

export default SchoolOwnerDashboard;
