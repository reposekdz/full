import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Upload, FileSpreadsheet, Download, Eye, Trash2, CheckCircle,
  AlertCircle, RefreshCw, Search, Filter, Table as TableIcon,
  FileText, Users, BarChart3
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Badge } from '@/app/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Progress } from '@/app/components/ui/progress';
import { useAuth } from '@/app/contexts/AuthContext';

const API_BASE = 'http://localhost:5000/api';

interface StudentData {
  id: number;
  first_name: string;
  last_name: string;
  student_id: string;
  email: string;
  phone?: string;
  address?: string;
  date_of_birth?: string;
  gender?: string;
  class_name: string;
  course_name: string;
  course_code: string;
  academic_year: string;
  average_grade: number;
  attendance_rate: number;
  conduct_rating: number;
  discipline_cases: number;
  risk_level: string;
  improvement_trend: string;
}

interface ImportHistory {
  id: number;
  filename: string;
  total_rows: number;
  successful_imports: number;
  failed_imports: number;
  import_errors: any;
  created_at: string;
  first_name: string;
  last_name: string;
  class_name?: string;
  academic_year?: string;
}

interface ExcelStudentImportProps {
  onNavigate?: (page: string) => void;
}

const ExcelStudentImport: React.FC<ExcelStudentImportProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('import');
  const [students, setStudents] = useState<StudentData[]>([]);
  const [importHistory, setImportHistory] = useState<ImportHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Filters
  const [classFilter, setClassFilter] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [academicYearFilter, setAcademicYearFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Import form
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importClass, setImportClass] = useState('');
  const [importAcademicYear, setImportAcademicYear] = useState('');

  // Fetch student data for Excel view
  const fetchStudents = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (classFilter && classFilter !== 'all') params.append('class_id', classFilter);
      if (courseFilter && courseFilter !== 'all') params.append('course_id', courseFilter);
      if (academicYearFilter && academicYearFilter !== 'all') params.append('academic_year_id', academicYearFilter);

      const response = await fetch(`${API_BASE}/advanced/excel-views/students?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setStudents(data.students);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch import history
  const fetchImportHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/advanced/admin/import-history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setImportHistory(data.imports);
      }
    } catch (error) {
      console.error('Error fetching import history:', error);
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchImportHistory();
  }, [classFilter, courseFilter, academicYearFilter]);

  const handleFileUpload = async () => {
    if (!selectedFile || !importClass || !importAcademicYear) {
      alert('Please select a file and specify class/academic year');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('class_id', importClass);
      formData.append('academic_year_id', importAcademicYear);

      const response = await fetch(`${API_BASE}/advanced/import/students`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      const data = await response.json();
      if (data.success) {
        alert(`Import completed!\nSuccessful: ${data.results.successful}\nFailed: ${data.results.failed}`);
        fetchStudents();
        fetchImportHistory();
        setSelectedFile(null);
        setImportClass('');
        setImportAcademicYear('');
      } else {
        alert(data.message || 'Import failed');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const downloadTemplate = () => {
    // Create a sample Excel template
    const headers = [
      'first_name', 'last_name', 'email', 'phone', 'address',
      'date_of_birth', 'gender'
    ];

    const sampleData = [
      ['John', 'Doe', 'john.doe@example.com', '+1234567890', '123 Main St', '2000-01-01', 'Male'],
      ['Jane', 'Smith', 'jane.smith@example.com', '+1234567891', '456 Oak Ave', '2000-02-02', 'Female']
    ];

    // This would normally create and download an Excel file
    alert('Template download feature would create an Excel file with headers: ' + headers.join(', '));
  };

  const filteredStudents = students.filter(student =>
    student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.student_id.includes(searchTerm) ||
    student.class_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.course_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRiskBadgeColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'low': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getGradeColor = (grade: number) => {
    if (grade >= 85) return 'text-green-600';
    if (grade >= 70) return 'text-blue-600';
    if (grade >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Data Management</h1>
          <p className="text-gray-600">Import Excel files and view student performance in modern spreadsheet format</p>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="import">Import Data</TabsTrigger>
            <TabsTrigger value="view">Excel View</TabsTrigger>
            <TabsTrigger value="history">Import History</TabsTrigger>
          </TabsList>

          {/* Import Tab */}
          <TabsContent value="import" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5 text-blue-600" />
                  Import Student Data from Excel
                </CardTitle>
                <CardDescription>
                  Upload an Excel file (.xlsx or .xls) containing student information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Template Download */}
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div>
                      <h4 className="font-semibold text-blue-900">Download Template</h4>
                      <p className="text-sm text-blue-700">Get the correct Excel template format</p>
                    </div>
                    <Button variant="outline" onClick={downloadTemplate}>
                      <Download className="w-4 h-4 mr-2" />
                      Download Template
                    </Button>
                  </div>

                  {/* File Upload */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="file-upload">Select Excel File</Label>
                      <Input
                        id="file-upload"
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                        className="cursor-pointer"
                      />
                      {selectedFile && (
                        <p className="text-sm text-gray-600 mt-1">
                          Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Class</Label>
                        <Select value={importClass} onValueChange={setImportClass}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select class" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">Class 1A</SelectItem>
                            <SelectItem value="2">Class 1B</SelectItem>
                            <SelectItem value="3">Class 2A</SelectItem>
                            <SelectItem value="4">Class 2B</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Academic Year</Label>
                        <Select value={importAcademicYear} onValueChange={setImportAcademicYear}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select academic year" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">2024-2025</SelectItem>
                            <SelectItem value="2">2025-2026</SelectItem>
                            <SelectItem value="3">2026-2027</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {uploading && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Uploading...</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <Progress value={uploadProgress} />
                      </div>
                    )}

                    <Button
                      onClick={handleFileUpload}
                      disabled={uploading || !selectedFile || !importClass || !importAcademicYear}
                      className="w-full"
                    >
                      {uploading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                          Importing...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Import Students
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Excel View Tab */}
          <TabsContent value="view" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-purple-600" />
                  Filters & Search
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div>
                    <Label>Search</Label>
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                      <Input
                        placeholder="Search students..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Class</Label>
                    <Select value={classFilter} onValueChange={setClassFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All classes" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All classes</SelectItem>
                        <SelectItem value="1">Class 1A</SelectItem>
                        <SelectItem value="2">Class 1B</SelectItem>
                        <SelectItem value="3">Class 2A</SelectItem>
                        <SelectItem value="4">Class 2B</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Course</Label>
                    <Select value={courseFilter} onValueChange={setCourseFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All courses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All courses</SelectItem>
                        <SelectItem value="1">Software Development</SelectItem>
                        <SelectItem value="2">Building Construction</SelectItem>
                        <SelectItem value="3">Electrical Installation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Academic Year</Label>
                    <Select value={academicYearFilter} onValueChange={setAcademicYearFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All years" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All years</SelectItem>
                        <SelectItem value="1">2024-2025</SelectItem>
                        <SelectItem value="2">2025-2026</SelectItem>
                        <SelectItem value="3">2026-2027</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-end">
                    <Button onClick={fetchStudents} variant="outline">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refresh
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Excel-like Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TableIcon className="w-5 h-5 text-green-600" />
                    Student Performance Data
                  </div>
                  <Badge variant="outline">
                    {filteredStudents.length} students
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Excel-style view of student data with performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="font-bold">Student ID</TableHead>
                        <TableHead className="font-bold">Name</TableHead>
                        <TableHead className="font-bold">Class</TableHead>
                        <TableHead className="font-bold">Course</TableHead>
                        <TableHead className="font-bold">Avg Grade</TableHead>
                        <TableHead className="font-bold">Attendance</TableHead>
                        <TableHead className="font-bold">Conduct</TableHead>
                        <TableHead className="font-bold">Discipline</TableHead>
                        <TableHead className="font-bold">Risk Level</TableHead>
                        <TableHead className="font-bold">Trend</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={10} className="text-center py-8">
                            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                            Loading student data...
                          </TableCell>
                        </TableRow>
                      ) : filteredStudents.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                            No students found matching the criteria
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredStudents.map((student) => (
                          <TableRow key={student.id} className="hover:bg-gray-50">
                            <TableCell className="font-mono font-semibold">
                              {student.student_id}
                            </TableCell>
                            <TableCell className="font-medium">
                              {student.first_name} {student.last_name}
                            </TableCell>
                            <TableCell>{student.class_name}</TableCell>
                            <TableCell>{student.course_name}</TableCell>
                            <TableCell>
                              <span className={`font-bold ${getGradeColor(student.average_grade)}`}>
                                {student.average_grade.toFixed(1)}%
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span>{student.attendance_rate.toFixed(1)}%</span>
                                <div className="w-16 bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-blue-600 h-2 rounded-full"
                                    style={{ width: `${student.attendance_rate}%` }}
                                  ></div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={student.conduct_rating >= 4 ? "default" : student.conduct_rating >= 3 ? "secondary" : "destructive"}>
                                {student.conduct_rating}/5
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <span className={student.discipline_cases > 0 ? 'text-red-600 font-semibold' : 'text-green-600'}>
                                {student.discipline_cases}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge className={getRiskBadgeColor(student.risk_level)}>
                                {student.risk_level}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={
                                student.improvement_trend === 'improving' ? 'default' :
                                student.improvement_trend === 'stable' ? 'secondary' : 'destructive'
                              }>
                                {student.improvement_trend}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-orange-600" />
                  Import History
                </CardTitle>
                <CardDescription>
                  View all previous data imports and their results
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {importHistory.map((item) => (
                    <div key={item.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold">{item.filename}</h4>
                          <p className="text-sm text-gray-600">
                            Imported by {item.first_name} {item.last_name} on {new Date(item.created_at).toLocaleDateString()}
                          </p>
                          {item.class_name && (
                            <p className="text-sm text-gray-500">Class: {item.class_name}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="flex gap-2 mb-2">
                            <Badge variant="default" className="bg-green-100 text-green-700">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              {item.successful_imports} Success
                            </Badge>
                            {item.failed_imports > 0 && (
                              <Badge variant="destructive">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                {item.failed_imports} Failed
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">
                            Total: {item.total_rows} rows
                          </p>
                        </div>
                      </div>

                      {item.import_errors && Object.keys(item.import_errors).length > 0 && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                          <h5 className="text-sm font-medium text-red-800 mb-2">Import Errors:</h5>
                          <div className="max-h-32 overflow-y-auto">
                            {item.import_errors.slice(0, 5).map((error: any, index: number) => (
                              <p key={index} className="text-xs text-red-700">
                                Row {error.row}: {error.error}
                              </p>
                            ))}
                            {item.import_errors.length > 5 && (
                              <p className="text-xs text-red-600 mt-1">
                                ... and {item.import_errors.length - 5} more errors
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {importHistory.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No import history found</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ExcelStudentImport;
