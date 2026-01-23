import React, { useState } from 'react';
import { FileText, Download, Calendar, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';

const ReportsPage: React.FC = () => {
  const [reportType, setReportType] = useState('users');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/admin/reports/${reportType}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${reportType}_report_${new Date().toISOString()}.json`;
        a.click();
      }
    } catch (error) {
      console.error('Generate error:', error);
    }
    setLoading(false);
  };

  const reports = [
    { id: 'users', name: 'Raporo y\'Abakoresha / Users Report', desc: 'All users data' },
    { id: 'students', name: 'Raporo y\'Abanyeshuri / Students Report', desc: 'Student records' },
    { id: 'attendance', name: 'Raporo y\'Kwitabira / Attendance Report', desc: 'Attendance records' },
    { id: 'financial', name: 'Raporo y\'Amafaranga / Financial Report', desc: 'Financial data' }
  ];

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <FileText className="w-10 h-10 text-blue-600" />
        <div>
          <h1 className="text-3xl font-black">Raporo / Reports</h1>
          <p className="text-gray-600">Kora no gukuramo raporo / Generate and download reports</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Hitamo Ubwoko bwa Raporo / Select Report Type</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {reports.map(r => (
                <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleGenerate} disabled={loading} className="w-full">
            <Download className="w-4 h-4 mr-2" />
            {loading ? 'Gukora...' : 'Kora Raporo / Generate Report'}
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.map(report => (
          <Card key={report.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setReportType(report.id)}>
            <CardContent className="pt-6">
              <FileText className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="font-bold text-lg mb-2">{report.name}</h3>
              <p className="text-gray-600 text-sm">{report.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ReportsPage;
