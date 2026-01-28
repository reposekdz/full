import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users, Download, Upload, Plus, Edit, Trash2, Eye, Search, Filter,
  RefreshCw, FileText, BarChart3, TrendingUp, DollarSign, Calendar,
  CheckCircle, XCircle, AlertCircle, BookOpen, GraduationCap, Settings,
  Printer, Save, X, UserPlus, UserMinus, Columns, Table
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Label } from '@/app/components/ui/label';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { exportToCSV, exportToPDF, printTable, ExportColumn } from '@/app/utils/exportUtils';
import { notify } from '@/app/utils/notificationUtils';

const API_BASE = 'http://localhost:5000/api';

interface ClassLevelSheetsDashboardProps {
  userRole: string;
  userId: number;
}

const ClassLevelSheetsDashboard: React.FC<ClassLevelSheetsDashboardProps> = ({ userRole, userId }) => {
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [columns, setColumns] = useState<any[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddStudentDialog, setShowAddStudentDialog] = useState(false);
  const [showAddColumnDialog, setShowAddColumnDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  
  const [newStudent, setNewStudent] = useState({
    student_id: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    gender: 'M',
    address: '',
    parent_phone: '',
    parent_email: ''
  });
  
  const [newColumn, setNewColumn] = useState({
    column_name: '',
    column_type: 'text',
    is_calculated: false,
    calculation_formula: ''
  });

  const getRoleBasedColumns = () => {
    if (!columns || columns.length === 0) return [];
    
    const rolePermissions: { [key: string]: string[] } = {
      headmaster: ['all'],
      director_study: ['all'],
      dod: ['discipline', 'behavior', 'conduct', 'all'],
      accountant: ['fees', 'payment', 'financial', 'balance', 'all'],
      teacher: ['grades', 'attendance', 'assignment', 'performance', 'all'],
      admin: ['all'],
      patron: ['counseling', 'guidance', 'behavior', 'all']
    };
    
    const permissions = rolePermissions[userRole] || ['all'];
    
    if (permissions.includes('all')) {
      return columns;
    }
    
    return columns.filter(col => {
      const colName = col.column_name.toLowerCase();
      return permissions.some(perm => colName.includes(perm)) || col.added_by_role === userRole;
    });
  };

  const canAddStudents = () => {
    return ['headmaster', 'director_study', 'admin'].includes(userRole);
  };

  const canRemoveStudents = () => {
    return ['headmaster', 'director_study', 'admin'].includes(userRole);
  };

  const canAddColumns = () => {
    return ['headmaster', 'director_study', 'dod', 'accountant', 'teacher', 'admin', 'patron'].includes(userRole);
  };

  // Predefined classes for TVET
  const predefinedClasses = [
    { trade: 'SOD', levels: ['Level 3', 'Level 4', 'Level 5'] },
    { trade: 'BDC', levels: ['Level 3', 'Level 4', 'Level 5'] },
    { trade: 'AUT', levels: ['Level 3', 'Level 4 A', 'Level 4 B', 'Level 5 A', 'Level 5 B'] }
  ];

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchClassSheet();
      fetchStatistics();
    }
  }, [selectedClass]);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/class-level-sheets/classes`);
      const data = await response.json();
      if (data.success) {
        setClasses(data.classes || []);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
      notify.error('Failed to fetch classes');
    } finally {
      setLoading(false);
    }
  };

  const fetchClassSheet = async () => {
    if (!selectedClass) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/class-level-sheets/classes/${selectedClass.id}/sheet`);
      const data = await response.json();
      if (data.success) {
        setStudents(data.students || []);
        setColumns(data.columns || []);
      }
    } catch (error) {
      console.error('Error fetching class sheet:', error);
      notify.error('Failed to fetch class sheet');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    if (!selectedClass) return;
    
    try {
      const response = await fetch(`${API_BASE}/class-level-sheets/classes/${selectedClass.id}/statistics`);
      const data = await response.json();
      if (data.success) {
        setStatistics(data.statistics);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const handleAddStudent = async () => {
    if (!selectedClass) return;
    
    try {
      const response = await fetch(`${API_BASE}/class-level-sheets/classes/${selectedClass.id}/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStudent)
      });
      
      const data = await response.json();
      if (data.success) {
        notify.success('Student added successfully!');
        fetchClassSheet();
        fetchStatistics();
        setShowAddStudentDialog(false);
        resetNewStudent();
      }
    } catch (error) {
      console.error('Error adding student:', error);
      notify.error('Failed to add student');
    }
  };

  const handleRemoveStudent = async (studentId: number) => {
    if (!confirm('Are you sure you want to remove this student from the class?')) return;
    
    try {
      const response = await fetch(`${API_BASE}/class-level-sheets/classes/${selectedClass.id}/students/${studentId}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      if (data.success) {
        notify.success('Student removed successfully!');
        fetchClassSheet();
        fetchStatistics();
      }
    } catch (error) {
      console.error('Error removing student:', error);
      notify.error('Failed to remove student');
    }
  };

  const handleGraduateStudent = async (studentId: number) => {
    if (!confirm('Graduate this student? They will be moved to archived students.')) return;
    
    try {
      const response = await fetch(`${API_BASE}/class-level-sheets/classes/${selectedClass.id}/students/${studentId}/graduate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          graduation_date: new Date().toISOString(),
          archived_by_role: userRole,
          archived_by_id: userId
        })
      });
      
      const data = await response.json();
      if (data.success) {
        notify.success('Student graduated and archived successfully!');
        fetchClassSheet();
        fetchStatistics();
      }
    } catch (error) {
      console.error('Error graduating student:', error);
      notify.error('Failed to graduate student');
    }
  };

  const handleAddColumn = async () => {
    if (!selectedClass) return;
    
    try {
      const response = await fetch(`${API_BASE}/class-level-sheets/classes/${selectedClass.id}/columns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newColumn,
          added_by_role: userRole
        })
      });
      
      const data = await response.json();
      if (data.success) {
        notify.success('Column added successfully!');
        fetchClassSheet();
        setShowAddColumnDialog(false);
        resetNewColumn();
      }
    } catch (error) {
      console.error('Error adding column:', error);
      notify.error('Failed to add column');
    }
  };

  const handleUpdateStudentData = async (studentId: number, customData: any) => {
    try {
      const response = await fetch(`${API_BASE}/class-level-sheets/classes/${selectedClass.id}/students/${studentId}/data`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: customData })
      });
      
      const data = await response.json();
      if (data.success) {
        notify.success('Data updated successfully!');
        fetchClassSheet();
      }
    } catch (error) {
      console.error('Error updating data:', error);
      notify.error('Failed to update data');
    }
  };

  const handleExportCSV = () => {
    const cols: ExportColumn[] = [
      { key: 'student_id', label: 'Student ID' },
      { key: 'first_name', label: 'First Name' },
      { key: 'last_name', label: 'Last Name' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'average_score', label: 'Average Score' },
      ...columns.map(col => ({ key: col.column_name, label: col.column_name }))
    ];
    
    exportToCSV(students, cols, `${selectedClass?.class_name || 'class'}_sheet`);
  };

  const handleExportPDF = () => {
    const cols: ExportColumn[] = [
      { key: 'student_id', label: 'ID' },
      { key: 'first_name', label: 'First Name' },
      { key: 'last_name', label: 'Last Name' },
      { key: 'average_score', label: 'Score' }
    ];
    
    exportToPDF(students, cols, `${selectedClass?.class_name || 'class'}_sheet`, `${selectedClass?.class_name} - Student Sheet`);
  };

  const handlePrint = () => {
    const cols: ExportColumn[] = [
      { key: 'student_id', label: 'Student ID' },
      { key: 'first_name', label: 'First Name' },
      { key: 'last_name', label: 'Last Name' },
      { key: 'email', label: 'Email' },
      { key: 'average_score', label: 'Average Score' }
    ];
    
    printTable(students, cols, `${selectedClass?.class_name} - Student Sheet`);
  };

  const resetNewStudent = () => {
    setNewStudent({
      student_id: '',
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      date_of_birth: '',
      gender: 'M',
      address: '',
      parent_phone: '',
      parent_email: ''
    });
  };

  const resetNewColumn = () => {
    setNewColumn({
      column_name: '',
      column_type: 'text',
      is_calculated: false,
      calculation_formula: ''
    });
  };

  const filteredStudents = students.filter(student =>
    (student.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.student_id?.toLowerCase().includes(searchQuery.toLowerCase())) &&
    student.status !== 'graduated'
  );

  const visibleColumns = getRoleBasedColumns();

  const StatCard = ({ title, value, icon: Icon, color, subtitle }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-none shadow-lg overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-5`} />
        <CardContent className="p-6 relative">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
              <h3 className="text-3xl font-black bg-gradient-to-r from-green-600 to-yellow-600 bg-clip-text text-transparent">
                {value}
              </h3>
              {subtitle && (
                <p className="text-xs text-gray-500 mt-2">{subtitle}</p>
              )}
            </div>
            <div className={`p-4 rounded-2xl bg-gradient-to-br ${color}`}>
              <Icon className="w-8 h-8 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-yellow-50 via-white to-green-50 min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-green-600 to-yellow-600 bg-clip-text text-transparent">
            Class/Level Dynamic Sheets
          </h1>
          <p className="text-gray-600 mt-2">Manage students by class and level with custom data tracking</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={fetchClasses} disabled={loading} className="bg-gradient-to-r from-green-500 to-teal-500">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </motion.div>

      {/* Statistics Cards */}
      {statistics && selectedClass && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Students"
            value={statistics.total_students}
            icon={Users}
            color="from-blue-500 to-indigo-500"
            subtitle={`${statistics.male_students} Male, ${statistics.female_students} Female`}
          />
          <StatCard
            title="Average Performance"
            value={`${statistics.average_performance.toFixed(1)}%`}
            icon={TrendingUp}
            color="from-green-500 to-teal-500"
            subtitle={`${statistics.total_assessments} Assessments`}
          />
          <StatCard
            title="Fees Collected"
            value={`RWF ${statistics.total_fees_collected?.toLocaleString()}`}
            icon={DollarSign}
            color="from-yellow-500 to-orange-500"
            subtitle={`Pending: RWF ${statistics.total_fees_pending?.toLocaleString()}`}
          />
          <StatCard
            title="Attendance Rate"
            value={`${statistics.total_present > 0 ? ((statistics.total_present / (statistics.total_present + statistics.total_absent)) * 100).toFixed(1) : 0}%`}
            icon={CheckCircle}
            color="from-purple-500 to-pink-500"
            subtitle={`${statistics.total_present} Present, ${statistics.total_absent} Absent`}
          />
        </div>
      )}

      <Tabs defaultValue="sheets" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto bg-white border-2 border-yellow-200 p-1">
          <TabsTrigger value="sheets">Class Sheets</TabsTrigger>
          <TabsTrigger value="manage">Manage Students</TabsTrigger>
          <TabsTrigger value="columns">Custom Columns</TabsTrigger>
        </TabsList>

        {/* Class Sheets Tab */}
        <TabsContent value="sheets" className="space-y-6">
          <Card className="border-2 border-yellow-200">
            <CardHeader className="bg-gradient-to-r from-yellow-50 to-green-50">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Table className="h-5 w-5 text-green-600" />
                  Select Class/Level
                </CardTitle>
                {selectedClass && (
                  <div className="flex gap-2">
                    <Button onClick={handleExportCSV} variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      CSV
                    </Button>
                    <Button onClick={handleExportPDF} variant="outline" size="sm">
                      <FileText className="h-4 w-4 mr-2" />
                      PDF
                    </Button>
                    <Button onClick={handlePrint} variant="outline" size="sm">
                      <Printer className="h-4 w-4 mr-2" />
                      Print
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {predefinedClasses.map(trade => (
                  <div key={trade.trade} className="space-y-2">
                    <h3 className="font-bold text-lg text-gray-700 flex items-center gap-2">
                      <GraduationCap className="h-5 w-5 text-green-600" />
                      {trade.trade}
                    </h3>
                    <div className="space-y-2">
                      {trade.levels.map(level => {
                        const className = `${level} ${trade.trade}`;
                        const classData = classes.find(c => c.class_name === className);
                        return (
                          <Button
                            key={level}
                            onClick={() => setSelectedClass(classData || { class_name: className, trade_name: trade.trade, level })}
                            variant={selectedClass?.class_name === className ? 'default' : 'outline'}
                            className="w-full justify-between"
                          >
                            <span>{level}</span>
                            {classData && (
                              <Badge variant="secondary">{classData.total_students} students</Badge>
                            )}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {selectedClass && (
                <>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex-1">
                      <Input
                        placeholder="Search students..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="border-yellow-200"
                        icon={<Search className="h-4 w-4" />}
                      />
                    </div>
                  </div>

                  <ScrollArea className="h-[500px] border rounded-lg">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gradient-to-r from-green-500 to-yellow-500 text-white sticky top-0">
                          <tr>
                            <th className="p-3 text-left">Student ID</th>
                            <th className="p-3 text-left">Name</th>
                            <th className="p-3 text-left">Email</th>
                            <th className="p-3 text-left">Phone</th>
                            <th className="p-3 text-left">Avg Score</th>
                            {visibleColumns.map(col => (
                              <th key={col.id} className="p-3 text-left">{col.column_name}</th>
                            ))}
                            {(canRemoveStudents() || canAddStudents()) && (
                              <th className="p-3 text-left">Actions</th>
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {filteredStudents.map((student, idx) => (
                            <motion.tr
                              key={student.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.05 }}
                              className="border-b hover:bg-yellow-50"
                            >
                              <td className="p-3 font-medium">{student.student_id}</td>
                              <td className="p-3">{student.first_name} {student.last_name}</td>
                              <td className="p-3 text-sm text-gray-600">{student.email}</td>
                              <td className="p-3 text-sm">{student.phone}</td>
                              <td className="p-3">
                                <Badge variant={student.average_score >= 70 ? 'default' : 'destructive'}>
                                  {student.average_score?.toFixed(1) || 0}%
                                </Badge>
                              </td>
                              {visibleColumns.map(col => (
                                <td key={col.id} className="p-3 text-sm">
                                  {student.custom_data?.[col.column_name] || '-'}
                                </td>
                              ))}
                              {(canRemoveStudents() || canAddStudents()) && (
                                <td className="p-3">
                                  <div className="flex gap-2">
                                    <Button
                                      onClick={() => {
                                        setSelectedStudent(student);
                                        setShowEditDialog(true);
                                      }}
                                      variant="outline"
                                      size="sm"
                                      title="Edit"
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    {canAddStudents() && (
                                      <Button
                                        onClick={() => handleGraduateStudent(student.id)}
                                        variant="default"
                                        size="sm"
                                        className="bg-blue-600"
                                        title="Graduate Student"
                                      >
                                        <GraduationCap className="h-4 w-4" />
                                      </Button>
                                    )}
                                    {canRemoveStudents() && (
                                      <Button
                                        onClick={() => handleRemoveStudent(student.id)}
                                        variant="destructive"
                                        size="sm"
                                        title="Remove"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    )}
                                  </div>
                                </td>
                              )}
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </ScrollArea>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Manage Students Tab */}
        <TabsContent value="manage">
          {canAddStudents() && selectedClass ? (
            <Card className="border-2 border-yellow-200">
              <CardHeader className="bg-gradient-to-r from-yellow-50 to-green-50">
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-green-600" />
                  Add Student to {selectedClass.class_name}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <p className="text-gray-600">
                    Add new students to this class. Students can be graduated or removed when they complete their studies.
                  </p>
                  <Button onClick={() => setShowAddStudentDialog(true)} className="bg-gradient-to-r from-green-500 to-teal-500">
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Student
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-2 border-yellow-200">
              <CardContent className="p-6 text-center">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  You don't have permission to add students. Only Head Master, Director of Studies, and Admin can add students.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Custom Columns Tab */}
        <TabsContent value="columns">
          {selectedClass && (
            <Card className="border-2 border-yellow-200">
              <CardHeader className="bg-gradient-to-r from-yellow-50 to-green-50">
                <CardTitle className="flex items-center gap-2">
                  <Columns className="h-5 w-5 text-green-600" />
                  Custom Columns for {selectedClass.class_name}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {canAddColumns() && (
                  <>
                    <Button onClick={() => setShowAddColumnDialog(true)} className="bg-gradient-to-r from-green-500 to-teal-500 mb-4">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Custom Column
                    </Button>
                    <p className="text-sm text-gray-600 mb-4">
                      Role: <Badge variant="outline">{userRole}</Badge> - You can add columns relevant to your responsibilities
                    </p>
                  </>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {visibleColumns.map(col => (
                    <Card key={col.id} className="border border-gray-200">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-bold">{col.column_name}</h4>
                          <Badge>{col.column_type}</Badge>
                        </div>
                        {col.is_calculated && (
                          <p className="text-xs text-gray-500">Formula: {col.calculation_formula}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-2">Added by: {col.added_by_role}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                {visibleColumns.length === 0 && (
                  <div className="text-center py-8">
                    <Columns className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No custom columns available for your role yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Add Student Dialog */}
      <Dialog open={showAddStudentDialog} onOpenChange={setShowAddStudentDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Student to {selectedClass?.class_name}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Student ID</Label>
              <Input
                value={newStudent.student_id}
                onChange={(e) => setNewStudent({ ...newStudent, student_id: e.target.value })}
              />
            </div>
            <div>
              <Label>Gender</Label>
              <Select value={newStudent.gender} onValueChange={(value) => setNewStudent({ ...newStudent, gender: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="M">Male</SelectItem>
                  <SelectItem value="F">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>First Name</Label>
              <Input
                value={newStudent.first_name}
                onChange={(e) => setNewStudent({ ...newStudent, first_name: e.target.value })}
              />
            </div>
            <div>
              <Label>Last Name</Label>
              <Input
                value={newStudent.last_name}
                onChange={(e) => setNewStudent({ ...newStudent, last_name: e.target.value })}
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={newStudent.email}
                onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                value={newStudent.phone}
                onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
              />
            </div>
            <div>
              <Label>Date of Birth</Label>
              <Input
                type="date"
                value={newStudent.date_of_birth}
                onChange={(e) => setNewStudent({ ...newStudent, date_of_birth: e.target.value })}
              />
            </div>
            <div>
              <Label>Parent Phone</Label>
              <Input
                value={newStudent.parent_phone}
                onChange={(e) => setNewStudent({ ...newStudent, parent_phone: e.target.value })}
              />
            </div>
            <div className="col-span-2">
              <Label>Address</Label>
              <Input
                value={newStudent.address}
                onChange={(e) => setNewStudent({ ...newStudent, address: e.target.value })}
              />
            </div>
          </div>
          <div className="flex gap-3 justify-end mt-4">
            <Button variant="outline" onClick={() => setShowAddStudentDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddStudent} className="bg-gradient-to-r from-green-500 to-teal-500">
              Add Student
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Column Dialog */}
      <Dialog open={showAddColumnDialog} onOpenChange={setShowAddColumnDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Custom Column</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Column Name</Label>
              <Input
                value={newColumn.column_name}
                onChange={(e) => setNewColumn({ ...newColumn, column_name: e.target.value })}
                placeholder="e.g., Attendance Rate, Payment Status"
              />
            </div>
            <div>
              <Label>Column Type</Label>
              <Select value={newColumn.column_type} onValueChange={(value) => setNewColumn({ ...newColumn, column_type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="currency">Currency</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="boolean">Yes/No</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={newColumn.is_calculated}
                onChange={(e) => setNewColumn({ ...newColumn, is_calculated: e.target.checked })}
              />
              <Label>Is Calculated Field</Label>
            </div>
            {newColumn.is_calculated && (
              <div>
                <Label>Formula</Label>
                <Input
                  value={newColumn.calculation_formula}
                  onChange={(e) => setNewColumn({ ...newColumn, calculation_formula: e.target.value })}
                  placeholder="e.g., (total_paid / total_fees) * 100"
                />
              </div>
            )}
          </div>
          <div className="flex gap-3 justify-end mt-4">
            <Button variant="outline" onClick={() => setShowAddColumnDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddColumn} className="bg-gradient-to-r from-green-500 to-teal-500">
              Add Column
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClassLevelSheetsDashboard;
