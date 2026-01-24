import React, { useState, useEffect } from 'react';
import { FileText, Download, TrendingUp, Users, DollarSign, BookOpen, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

const ReportingPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState('student_performance');

  useEffect(() => {
    fetchAnalytics();
    fetchReports();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/reporting/analytics/dashboard');
      const data = await response.json();
      if (data.success) setAnalytics(data.analytics);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const fetchReports = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/reporting/list');
      const data = await response.json();
      if (data.success) setReports(data.reports);
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  const generateReport = async (reportType, filters) => {
    try {
      const response = await fetch('http://localhost:5000/api/reporting/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          report_type: reportType,
          filters,
          format: 'json',
          created_by: 1
        })
      });
      const data = await response.json();
      if (data.success) {
        alert('Report generated successfully!');
        fetchReports();
        return data;
      }
    } catch (error) {
      console.error('Error generating report:', error);
    }
  };

  const exportReport = async (reportId, format) => {
    try {
      window.open(`http://localhost:5000/api/reporting/${reportId}/export?format=${format}`, '_blank');
    } catch (error) {
      console.error('Error exporting report:', error);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Advanced Reporting & Analytics</h1>

      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-blue-500" />
                <div>
                  <div className="text-2xl font-bold">{analytics.students}</div>
                  <div className="text-sm text-gray-600">Students</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-green-500" />
                <div>
                  <div className="text-2xl font-bold">{analytics.teachers}</div>
                  <div className="text-sm text-gray-600">Teachers</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <BookOpen className="w-8 h-8 text-purple-500" />
                <div>
                  <div className="text-2xl font-bold">{analytics.classes}</div>
                  <div className="text-sm text-gray-600">Classes</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-orange-500" />
                <div>
                  <div className="text-2xl font-bold">{analytics.attendanceRate.toFixed(1)}%</div>
                  <div className="text-sm text-gray-600">Attendance</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-indigo-500" />
                <div>
                  <div className="text-2xl font-bold">{analytics.averageGrade.toFixed(1)}</div>
                  <div className="text-sm text-gray-600">Avg Grade</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="generate">
        <TabsList>
          <TabsTrigger value="generate">Generate Reports</TabsTrigger>
          <TabsTrigger value="saved">Saved Reports</TabsTrigger>
          <TabsTrigger value="custom">Custom Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Report Generator</CardTitle>
            </CardHeader>
            <CardContent>
              <ReportGenerator onGenerate={generateReport} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="saved" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {reports.map(report => (
              <Card key={report.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg capitalize">{report.report_type.replace('_', ' ')}</h3>
                      <p className="text-sm text-gray-600">
                        Generated on {new Date(report.created_at).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500">Format: {report.format}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => exportReport(report.id, 'json')}>
                        <FileText className="w-4 h-4 mr-1" /> JSON
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => exportReport(report.id, 'csv')}>
                        <Download className="w-4 h-4 mr-1" /> CSV
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => exportReport(report.id, 'excel')}>
                        <Download className="w-4 h-4 mr-1" /> Excel
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="custom">
          <Card>
            <CardHeader>
              <CardTitle>Custom Report Builder</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Build custom reports with advanced filters and data selection.</p>
              <Button className="mt-4">Create Custom Report</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const ReportGenerator = ({ onGenerate }) => {
  const [reportType, setReportType] = useState('student_performance');
  const [filters, setFilters] = useState({
    class_id: '',
    date_from: '',
    date_to: '',
    exam_id: ''
  });

  const handleGenerate = () => {
    onGenerate(reportType, filters);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Report Type</label>
        <select
          value={reportType}
          onChange={(e) => setReportType(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg"
        >
          <option value="student_performance">Student Performance</option>
          <option value="attendance_summary">Attendance Summary</option>
          <option value="financial_summary">Financial Summary</option>
          <option value="teacher_workload">Teacher Workload</option>
          <option value="exam_results">Exam Results</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Date From</label>
          <Input
            type="date"
            value={filters.date_from}
            onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Date To</label>
          <Input
            type="date"
            value={filters.date_to}
            onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
          />
        </div>
      </div>

      {reportType === 'student_performance' || reportType === 'attendance_summary' ? (
        <div>
          <label className="block text-sm font-medium mb-2">Class (Optional)</label>
          <Input
            type="number"
            placeholder="Class ID"
            value={filters.class_id}
            onChange={(e) => setFilters({ ...filters, class_id: e.target.value })}
          />
        </div>
      ) : null}

      {reportType === 'exam_results' ? (
        <div>
          <label className="block text-sm font-medium mb-2">Exam (Optional)</label>
          <Input
            type="number"
            placeholder="Exam ID"
            value={filters.exam_id}
            onChange={(e) => setFilters({ ...filters, exam_id: e.target.value })}
          />
        </div>
      ) : null}

      <Button onClick={handleGenerate} className="w-full">
        <FileText className="w-4 h-4 mr-2" /> Generate Report
      </Button>
    </div>
  );
};

export default ReportingPage;
