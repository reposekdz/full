import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { FileText, Download, Filter, Calendar, Users, BookOpen, DollarSign, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';

interface ReportData {
  students: any[];
  teachers: any[];
  parents: any[];
  staff: any[];
  attendance: any[];
  payments: any[];
  grades: any[];
}

const ReportsPage: React.FC = () => {
  const [reportType, setReportType] = useState('students');
  const [timeRange, setTimeRange] = useState('month');
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReportData();
  }, [reportType, timeRange]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/admin/reports/${reportType}?range=${timeRange}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await res.json();
      if (result.success) setData(result.data);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (format: 'pdf' | 'csv') => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/admin/reports/export?type=${reportType}&format=${format}&range=${timeRange}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report_${reportType}_${Date.now()}.${format}`;
      a.click();
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  const reportTypes = [
    { value: 'students', label: 'Abanyeshuri / Students', icon: Users },
    { value: 'teachers', label: 'Abarimu / Teachers', icon: BookOpen },
    { value: 'parents', label: 'Ababyeyi / Parents', icon: Users },
    { value: 'staff', label: 'Abakozi / Staff', icon: Users },
    { value: 'attendance', label: 'Kwitabira / Attendance', icon: Calendar },
    { value: 'payments', label: 'Kwishyura / Payments', icon: DollarSign },
    { value: 'grades', label: 'Amanota / Grades', icon: TrendingUp }
  ];

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-3 rounded-xl">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Raporo / Reports
            </h1>
            <p className="text-gray-600">Kora no gukoresha raporo / Generate and export reports</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => exportReport('pdf')} className="bg-gradient-to-r from-red-600 to-pink-600">
            <Download className="w-4 h-4 mr-2" />
            PDF
          </Button>
          <Button onClick={() => exportReport('csv')} className="bg-gradient-to-r from-green-600 to-emerald-600">
            <Download className="w-4 h-4 mr-2" />
            CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-2 border-green-100">
          <CardContent className="pt-6">
            <Label className="mb-2 block">Ubwoko bwa Raporo / Report Type</Label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {reportTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-100">
          <CardContent className="pt-6">
            <Label className="mb-2 block">Igihe / Time Range</Label>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Icyumweru / Week</SelectItem>
                <SelectItem value="month">Ukwezi / Month</SelectItem>
                <SelectItem value="quarter">Igihembwe / Quarter</SelectItem>
                <SelectItem value="year">Umwaka / Year</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {reportTypes.map((type) => (
          <motion.div key={type.value} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Card 
              className={`border-2 cursor-pointer transition ${reportType === type.value ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}
              onClick={() => setReportType(type.value)}
            >
              <CardContent className="p-6 text-center">
                <div className={`bg-gradient-to-br from-green-500 to-emerald-600 w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center`}>
                  <type.icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm font-medium">{type.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="border-2 border-green-100">
        <CardHeader>
          <CardTitle>Ibisubizo / Report Results</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading report data...</div>
          ) : data ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-green-50">
                  <tr>
                    <th className="p-3 text-left">ID</th>
                    <th className="p-3 text-left">Name</th>
                    <th className="p-3 text-left">Details</th>
                    <th className="p-3 text-left">Status</th>
                    <th className="p-3 text-left">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {data[reportType as keyof ReportData]?.slice(0, 10).map((item: any, i: number) => (
                    <tr key={i} className="border-b hover:bg-gray-50">
                      <td className="p-3">{item.id}</td>
                      <td className="p-3">{item.name || item.title}</td>
                      <td className="p-3">{item.email || item.description}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${item.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {item.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="p-3">{new Date(item.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">Select a report type to view data</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsPage;
