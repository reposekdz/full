import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Download, Printer, Search, Users, TrendingUp, Edit, RefreshCw } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

const ClassSheetViewer = ({ classId }) => {
  const [sheet, setSheet] = useState([]);
  const [classInfo, setClassInfo] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (classId) {
      fetchSheet();
      fetchStats();
    }
  }, [classId]);

  const fetchSheet = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/class-sheets-api/class/${classId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setSheet(data.sheet);
        setClassInfo(data.classInfo);
      }
    } catch (error) {
      console.error('Error fetching sheet:', error);
    }
    setLoading(false);
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE}/class-sheets-api/class/${classId}/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setStats(data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const exportToCSV = async () => {
    try {
      const response = await fetch(`${API_BASE}/class-sheets-api/class/${classId}/export`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        const csv = [
          ['No.', 'Serial Code', 'First Name', 'Last Name', 'Parent Phone', 'Location', 'DOB', 'Gender', 'Enrollment Date', 'Status'],
          ...data.data.map(s => [
            s.sheet_number,
            s.serial_code,
            s.first_name,
            s.last_name,
            s.parent_phone,
            s.location,
            s.date_of_birth || 'N/A',
            s.gender || 'N/A',
            new Date(s.enrollment_date).toLocaleDateString(),
            s.status
          ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `class_sheet_${classInfo?.class_name}_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
      }
    } catch (error) {
      alert('Failed to export');
    }
  };

  const printSheet = () => {
    window.print();
  };

  const filteredSheet = sheet.filter(student =>
    student.serial_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.parent_phone?.includes(searchTerm)
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Card className="shadow-xl">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-3xl font-bold flex items-center gap-2">
                <Users className="w-8 h-8" />
                Class Sheet: {classInfo?.class_name}
              </CardTitle>
              <p className="text-gray-600 mt-2">
                {classInfo?.course_name} ({classInfo?.trade_code})
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={fetchSheet}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" onClick={exportToCSV}>
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
              <Button variant="outline" onClick={printSheet}>
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Statistics */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <Card className="border-2 border-blue-200">
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-blue-600">{stats.total_students}</div>
                  <div className="text-sm text-gray-600">Total Students</div>
                </CardContent>
              </Card>
              <Card className="border-2 border-green-200">
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-green-600">{stats.active_count}</div>
                  <div className="text-sm text-gray-600">Active</div>
                </CardContent>
              </Card>
              <Card className="border-2 border-purple-200">
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-purple-600">{stats.male_count}</div>
                  <div className="text-sm text-gray-600">Male</div>
                </CardContent>
              </Card>
              <Card className="border-2 border-pink-200">
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-pink-600">{stats.female_count}</div>
                  <div className="text-sm text-gray-600">Female</div>
                </CardContent>
              </Card>
              <Card className="border-2 border-gray-200">
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-gray-600">{stats.removed_count}</div>
                  <div className="text-sm text-gray-600">Removed</div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Search */}
          <div className="mb-6">
            <Input
              placeholder="Search by serial code, name, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
              icon={<Search className="w-4 h-4" />}
            />
          </div>

          {/* Sheet Table */}
          <div className="overflow-x-auto border rounded-lg">
            <table className="w-full border-collapse">
              <thead className="bg-gradient-to-r from-blue-600 to-green-600 text-white">
                <tr>
                  <th className="p-3 text-left">No.</th>
                  <th className="p-3 text-left">Serial Code</th>
                  <th className="p-3 text-left">First Name</th>
                  <th className="p-3 text-left">Last Name</th>
                  <th className="p-3 text-left">Parent Phone</th>
                  <th className="p-3 text-left">Location</th>
                  <th className="p-3 text-left">DOB</th>
                  <th className="p-3 text-left">Gender</th>
                  <th className="p-3 text-left">Enrollment</th>
                  <th className="p-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredSheet.map((student, index) => (
                  <tr key={student.id} className={`border-b hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="p-3 font-bold">{student.sheet_number}</td>
                    <td className="p-3">
                      <code className="font-mono text-blue-600 font-bold">{student.serial_code}</code>
                    </td>
                    <td className="p-3 font-semibold">{student.first_name}</td>
                    <td className="p-3 font-semibold">{student.last_name}</td>
                    <td className="p-3">{student.parent_phone}</td>
                    <td className="p-3">{student.location}</td>
                    <td className="p-3">{student.date_of_birth ? new Date(student.date_of_birth).toLocaleDateString() : 'N/A'}</td>
                    <td className="p-3 capitalize">{student.gender || 'N/A'}</td>
                    <td className="p-3">{new Date(student.enrollment_date).toLocaleDateString()}</td>
                    <td className="p-3">
                      {student.status === 'active' ? (
                        <Badge className="bg-green-500">Active</Badge>
                      ) : (
                        <Badge className="bg-gray-500">{student.status}</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredSheet.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                {loading ? 'Loading...' : 'No students found'}
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <span className="font-semibold">Total Students in Sheet:</span> {filteredSheet.length}
              </div>
              <div>
                <span className="font-semibold">Class Capacity:</span> {classInfo?.capacity || 'N/A'}
              </div>
              <div>
                <span className="font-semibold">Generated:</span> {new Date().toLocaleString()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClassSheetViewer;
