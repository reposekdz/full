import React, { useState, useEffect } from 'react';
import { TrendingUp, Download, Calendar, BarChart3, PieChart, Home, User, FileText, Users, Scale, Mail, FileSpreadsheet, Filter, Loader2, AlertTriangle, Award, Activity, Target, TrendingDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

const DODReportsPage: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const [reports, setReports] = useState<any>({ discipline: [], behavior: [], exams: [], trends: [], topOffenders: [], improvements: [] });
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState('all');

  useEffect(() => {
    const today = new Date();
    const lastMonth = new Date(today.setMonth(today.getMonth() - 1));
    setDateRange({
      start: lastMonth.toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    });
  }, []);

  const generateReport = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE}/dod-comprehensive/reports/generate`, {
        params: { start_date: dateRange.start, end_date: dateRange.end, type: reportType },
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setReports(res.data.reports || { discipline: [], behavior: [], exams: [], trends: [], topOffenders: [], improvements: [] });
    } catch (error) {
      console.error('Ikosa:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = (format: 'pdf' | 'excel' | 'csv') => {
    const data = format === 'csv' ? generateCSV() : format === 'excel' ? 'Excel data' : 'PDF data';
    const blob = new Blob([data], { type: format === 'csv' ? 'text/csv' : 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DOD-Report-${new Date().toISOString().split('T')[0]}.${format}`;
    a.click();
  };

  const generateCSV = () => {
    const headers = ['Type', 'Count', 'Date'];
    const rows = [...reports.discipline, ...reports.behavior, ...reports.exams].map((r: any) => [r.type, r.count, r.date]);
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-pink-50"><Loader2 className="w-12 h-12 animate-spin text-purple-600" /></div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 p-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto">
        <Button onClick={() => onNavigate('director-discipline-dashboard')} variant="ghost" className="mb-4 font-bold">← Gusubira</Button>
        
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-5xl font-black text-gray-900 flex items-center gap-4">
            <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-xl">
              <TrendingUp className="w-12 h-12 text-white" />
            </div>
            Raporo z'Indero - Advanced Analytics
          </h1>
          <div className="flex gap-2">
            <Button onClick={() => exportReport('pdf')} className="bg-red-600"><Download className="w-4 h-4 mr-2" />PDF</Button>
            <Button onClick={() => exportReport('excel')} className="bg-green-600"><Download className="w-4 h-4 mr-2" />Excel</Button>
            <Button onClick={() => exportReport('csv')} className="bg-blue-600"><Download className="w-4 h-4 mr-2" />CSV</Button>
          </div>
        </div>

        <Card className="mb-8 border-2 border-purple-200 shadow-2xl">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-black text-gray-700 mb-2 uppercase">Itariki yo gutangira</label>
                <input type="date" value={dateRange.start} onChange={(e) => setDateRange({...dateRange, start: e.target.value})} className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 font-bold" />
              </div>
              <div>
                <label className="block text-sm font-black text-gray-700 mb-2 uppercase">Itariki yo kurangiza</label>
                <input type="date" value={dateRange.end} onChange={(e) => setDateRange({...dateRange, end: e.target.value})} className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 font-bold" />
              </div>
              <div>
                <label className="block text-sm font-black text-gray-700 mb-2 uppercase">Ubwoko bwa Raporo</label>
                <select value={reportType} onChange={(e) => setReportType(e.target.value)} className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 font-bold">
                  <option value="all">Byose</option>
                  <option value="discipline">Amakosa</option>
                  <option value="behavior">Imyitwarire</option>
                  <option value="exams">Ibizamini</option>
                  <option value="trends">Trends</option>
                </select>
              </div>
              <div className="flex items-end">
                <Button onClick={generateReport} disabled={loading} className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black text-lg shadow-lg">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><BarChart3 className="w-5 h-5 mr-2" />Kora Raporo</> }
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Amakosa Yose', count: reports.discipline?.length || 0, icon: AlertTriangle, color: 'from-red-500 to-orange-500', bg: 'from-red-50 to-orange-50' },
            { label: 'Imyitwarire Myiza', count: reports.behavior?.length || 0, icon: Award, color: 'from-green-500 to-teal-500', bg: 'from-green-50 to-teal-50' },
            { label: 'Ibizamini', count: reports.exams?.length || 0, icon: Calendar, color: 'from-blue-500 to-purple-500', bg: 'from-blue-50 to-purple-50' },
            { label: 'Iterambere', count: reports.improvements?.length || 0, icon: TrendingUp, color: 'from-purple-500 to-pink-500', bg: 'from-purple-50 to-pink-50' }
          ].map((stat, idx) => (
            <motion.div key={idx} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.1 }}>
              <Card className={`border-0 shadow-xl bg-gradient-to-br ${stat.bg} hover:shadow-2xl transition-all`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-4 bg-gradient-to-br ${stat.color} rounded-2xl shadow-lg`}>
                      <stat.icon className="w-8 h-8 text-white" />
                    </div>
                    <span className="text-5xl font-black text-gray-900">{stat.count}</span>
                  </div>
                  <h3 className="text-lg font-black text-gray-700">{stat.label}</h3>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-2 border-red-200 shadow-xl">
            <CardHeader><CardTitle className="flex items-center gap-2"><Target className="w-6 h-6 text-red-600" />Top Offenders</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(reports.topOffenders || []).slice(0, 5).map((student: any, idx: number) => (
                  <motion.div key={idx} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }} className="flex items-center justify-between p-4 bg-red-50 rounded-xl border-2 border-red-100">
                    <div>
                      <p className="font-black text-gray-900">{student.name}</p>
                      <p className="text-sm text-gray-600">{student.trade}</p>
                    </div>
                    <Badge className="bg-red-600 text-white text-lg px-4 py-2">{student.incidents} incidents</Badge>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-200 shadow-xl">
            <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="w-6 h-6 text-green-600" />Most Improved</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(reports.improvements || []).slice(0, 5).map((student: any, idx: number) => (
                  <motion.div key={idx} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }} className="flex items-center justify-between p-4 bg-green-50 rounded-xl border-2 border-green-100">
                    <div>
                      <p className="font-black text-gray-900">{student.name}</p>
                      <p className="text-sm text-gray-600">{student.trade}</p>
                    </div>
                    <Badge className="bg-green-600 text-white text-lg px-4 py-2">+{student.improvement}%</Badge>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
};

export default DODReportsPage;
