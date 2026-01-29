import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { School, Users, TrendingUp, DollarSign, BookOpen, Shield, Calendar, BarChart3, Plus, Search, Filter, Download, Eye, CheckCircle2, AlertCircle, Target, Activity, GraduationCap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import apiService from '@/app/services/apiService';

export default function ModernHeadmasterDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [overview, setOverview] = useState<any>(null);
  const [reports, setReports] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [reportType, setReportType] = useState('academic');
  const [startDate, setStartDate] = useState('2024-01-01');
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [overviewData] = await Promise.all([
        apiService.getHeadmasterOverview()
      ]);
      setOverview(overviewData.data);
    } catch (error) {
      console.error('Failed to fetch headmaster data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    try {
      const params: any = { report_type: reportType };
      if (reportType === 'financial') {
        params.start_date = startDate;
        params.end_date = endDate;
      }
      const reportData = await apiService.getComprehensiveReport(params);
      setReports(reportData.report);
      alert('Report generated successfully!');
    } catch (error: any) {
      alert('Failed to generate report: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-purple-100 p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Headmaster Dashboard
            </h1>
            <p className="text-gray-600 mt-2">School-wide overview and management</p>
          </div>
          <div className="flex space-x-3">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white">
                  <Download className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Generate Comprehensive Report</DialogTitle>
                  <DialogDescription>Select report type and parameters</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Report Type</label>
                    <Select value={reportType} onValueChange={setReportType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="academic">Academic Performance</SelectItem>
                        <SelectItem value="financial">Financial Summary</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {reportType === 'financial' && (
                    <>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Start Date</label>
                        <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">End Date</label>
                        <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                      </div>
                    </>
                  )}
                </div>
                <DialogFooter>
                  <Button onClick={handleGenerateReport} className="bg-purple-600 hover:bg-purple-700">
                    Generate Report
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { title: 'Total Students', value: overview?.total_students || 0, icon: Users, color: 'from-blue-500 to-indigo-500', bg: 'bg-blue-50' },
            { title: 'Total Teachers', value: overview?.total_teachers || 0, icon: GraduationCap, color: 'from-green-500 to-teal-500', bg: 'bg-green-50' },
            { title: 'Total Staff', value: overview?.total_staff || 0, icon: Users, color: 'from-orange-500 to-red-500', bg: 'bg-orange-50' },
            { title: 'Academic Average', value: `${(overview?.academic_avg || 0).toFixed(1)}%`, icon: TrendingUp, color: 'from-purple-500 to-pink-500', bg: 'bg-purple-50' }
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <Card className={`${stat.bg} border-2 border-purple-200 hover:shadow-xl transition-all`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div className="text-3xl font-black text-gray-900">{stat.value}</div>
                    <div className="text-sm text-gray-600 mt-1">{stat.title}</div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <div className="mb-6">
          <div className="flex space-x-2 border-b border-purple-200">
            {['overview', 'financial', 'discipline', 'attendance'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 font-semibold capitalize transition-colors ${
                  activeTab === tab
                    ? 'border-b-2 border-purple-600 text-purple-600'
                    : 'text-gray-600 hover:text-purple-600'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <Card className="border-2 border-purple-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <School className="h-5 w-5 text-purple-600" />
                    School Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Students</span>
                      <span className="font-bold text-lg">{overview?.total_students || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Teachers</span>
                      <span className="font-bold text-lg">{overview?.total_teachers || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Support Staff</span>
                      <span className="font-bold text-lg">{overview?.total_staff || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Academic Performance</span>
                      <Badge className="bg-green-100 text-green-700">
                        {(overview?.academic_avg || 0).toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <Card className="border-2 border-purple-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-purple-600" />
                    Key Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Student-Teacher Ratio</span>
                      <span className="font-bold text-lg">
                        {overview?.total_teachers > 0 ? (overview.total_students / overview.total_teachers).toFixed(1) : 0}:1
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Staff Per Student</span>
                      <span className="font-bold text-lg">
                        {overview?.total_students > 0 ? (overview.total_staff / overview.total_students * 100).toFixed(1) : 0}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Personnel</span>
                      <span className="font-bold text-lg">
                        {(overview?.total_teachers || 0) + (overview?.total_staff || 0)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}

        {activeTab === 'financial' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border-2 border-purple-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-purple-600" />
                  Financial Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-green-50 p-6 rounded-lg border-2 border-green-200">
                    <div className="text-sm text-gray-600 mb-2">Expected Revenue</div>
                    <div className="text-3xl font-black text-green-600">
                      RWF {(overview?.financial?.expected || 0).toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
                    <div className="text-sm text-gray-600 mb-2">Collected Amount</div>
                    <div className="text-3xl font-black text-blue-600">
                      RWF {(overview?.financial?.collected || 0).toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-red-50 p-6 rounded-lg border-2 border-red-200">
                    <div className="text-sm text-gray-600 mb-2">Outstanding Balance</div>
                    <div className="text-3xl font-black text-red-600">
                      RWF {(overview?.financial?.outstanding || 0).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="mt-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Collection Rate</span>
                    <span className="font-bold">
                      {overview?.financial?.expected > 0 
                        ? ((overview.financial.collected / overview.financial.expected) * 100).toFixed(1)
                        : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-green-500 to-teal-500 h-3 rounded-full transition-all"
                      style={{
                        width: `${overview?.financial?.expected > 0 
                          ? ((overview.financial.collected / overview.financial.expected) * 100)
                          : 0}%`
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {activeTab === 'discipline' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border-2 border-purple-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-purple-600" />
                  Discipline Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-orange-50 p-6 rounded-lg border-2 border-orange-200">
                    <div className="text-sm text-gray-600 mb-2">Total Incidents (30 Days)</div>
                    <div className="text-4xl font-black text-orange-600">{overview?.discipline_incidents || 0}</div>
                  </div>
                  <div className="bg-green-50 p-6 rounded-lg border-2 border-green-200">
                    <div className="text-sm text-gray-600 mb-2">Incident Rate</div>
                    <div className="text-4xl font-black text-green-600">
                      {overview?.total_students > 0 
                        ? ((overview.discipline_incidents / overview.total_students) * 100).toFixed(1)
                        : 0}%
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {activeTab === 'attendance' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border-2 border-purple-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-purple-600" />
                  Attendance Overview (30 Days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-green-50 p-6 rounded-lg border-2 border-green-200">
                    <div className="text-sm text-gray-600 mb-2">Present</div>
                    <div className="text-4xl font-black text-green-600">{overview?.attendance?.present || 0}</div>
                  </div>
                  <div className="bg-red-50 p-6 rounded-lg border-2 border-red-200">
                    <div className="text-sm text-gray-600 mb-2">Absent</div>
                    <div className="text-4xl font-black text-red-600">{overview?.attendance?.absent || 0}</div>
                  </div>
                  <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
                    <div className="text-sm text-gray-600 mb-2">Attendance Rate</div>
                    <div className="text-4xl font-black text-blue-600">
                      {overview?.attendance?.total_records > 0 
                        ? ((overview.attendance.present / overview.attendance.total_records) * 100).toFixed(1)
                        : 0}%
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {reports && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8"
          >
            <Card className="border-2 border-purple-200">
              <CardHeader>
                <CardTitle>Generated Report - {reportType}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-auto max-h-96">
                  <pre className="text-sm bg-gray-50 p-4 rounded">{JSON.stringify(reports, null, 2)}</pre>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
