import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Users, Plus, Edit, Save, Calculator, DollarSign, BookOpen, Shield,
  Star, FileText, TrendingUp, Award, Target, BarChart3, RefreshCw,
  Search, Filter, Download, Upload, Eye, Trash2, CheckCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';

const API_BASE = 'http://localhost:5000/api';

interface GlobalStudentSheetsProps {
  userRole: string;
  userId: number;
}

const GlobalStudentSheets: React.FC<GlobalStudentSheetsProps> = ({ userRole, userId }) => {
  const [students, setStudents] = useState<any[]>([]);
  const [columns, setColumns] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showAddColumnDialog, setShowAddColumnDialog] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [newColumn, setNewColumn] = useState({
    column_name: '',
    column_label: '',
    column_type: 'text',
    select_options: [],
    visible_to_roles: [userRole],
    editable_by_roles: [userRole]
  });

  useEffect(() => {
    fetchColumns();
    fetchStudents();
  }, [userRole]);

  const fetchColumns = async () => {
    try {
      const response = await fetch(`${API_BASE}/global-sheets/columns/${userRole}`);
      const data = await response.json();
      if (data.success) {
        setColumns(data.columns || []);
      }
    } catch (error) {
      console.error('Error fetching columns:', error);
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/global-sheets/sheets/${userRole}`);
      const data = await response.json();
      if (data.success) {
        setStudents(data.sheets || []);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStudent = async () => {
    try {
      const response = await fetch(`${API_BASE}/global-sheets/sheets/${selectedStudent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          column_values: editData,
          user_role: userRole
        })
      });
      const result = await response.json();
      if (result.success) {
        fetchStudents();
        setShowEditDialog(false);
        alert('Student data updated successfully!');
      }
    } catch (error) {
      console.error('Error updating student:', error);
    }
  };

  const handleAddColumn = async () => {
    try {
      const response = await fetch(`${API_BASE}/global-sheets/columns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newColumn,
          created_by_role: userRole,
          scope: 'global'
        })
      });
      const result = await response.json();
      if (result.success) {
        fetchColumns();
        setShowAddColumnDialog(false);
        setNewColumn({
          column_name: '',
          column_label: '',
          column_type: 'text',
          select_options: [],
          visible_to_roles: [userRole],
          editable_by_roles: [userRole]
        });
        alert('Column added successfully!');
      }
    } catch (error) {
      console.error('Error adding column:', error);
    }
  };

  const handleRecalculate = async (studentId: number) => {
    try {
      const response = await fetch(`${API_BASE}/global-sheets/recalculate/${studentId}`, {
        method: 'POST'
      });
      const result = await response.json();
      if (result.success) {
        fetchStudents();
        alert('Calculations updated successfully!');
      }
    } catch (error) {
      console.error('Error recalculating:', error);
    }
  };

  const openEditDialog = (student: any) => {
    setSelectedStudent(student);
    const customValues = {};
    if (student.custom_values) {
      student.custom_values.split('|').forEach((item: string) => {
        const [columnId, textValue, numberValue] = item.split(':');
        customValues[columnId] = textValue || numberValue || '';
      });
    }
    setEditData(customValues);
    setShowEditDialog(true);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'accountant': return DollarSign;
      case 'teacher': return BookOpen;
      case 'dos': return Award;
      case 'dod': return Shield;
      case 'headmaster': return Star;
      default: return Users;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'accountant': return 'from-green-500 to-emerald-500';
      case 'teacher': return 'from-blue-500 to-indigo-500';
      case 'dos': return 'from-yellow-500 to-orange-500';
      case 'dod': return 'from-red-500 to-pink-500';
      case 'headmaster': return 'from-purple-500 to-violet-500';
      default: return 'from-gray-500 to-slate-500';
    }
  };

  const getRoleColumns = () => {
    const roleColumnTemplates = {
      accountant: [
        { name: 'paid_amount', label: 'Paid Amount', type: 'number' },
        { name: 'unpaid_amount', label: 'Unpaid Amount', type: 'number' },
        { name: 'payment_status', label: 'Payment Status', type: 'select', options: ['Paid', 'Partial', 'Unpaid', 'Overdue'] },
        { name: 'payment_date', label: 'Last Payment Date', type: 'date' },
        { name: 'fee_category', label: 'Fee Category', type: 'select', options: ['Tuition', 'Exam', 'Uniform', 'Transport', 'Hostel'] }
      ],
      teacher: [
        { name: 'quiz_marks', label: 'Quiz Marks', type: 'number' },
        { name: 'midterm_marks', label: 'Midterm Marks', type: 'number' },
        { name: 'final_marks', label: 'Final Marks', type: 'number' },
        { name: 'subject_name', label: 'Subject Name', type: 'text' },
        { name: 'course_code', label: 'Course Code', type: 'text' }
      ],
      dos: [
        { name: 'academic_performance', label: 'Academic Performance', type: 'number' },
        { name: 'class_rank', label: 'Class Rank', type: 'number' },
        { name: 'study_plan', label: 'Study Plan', type: 'textarea' },
        { name: 'academic_status', label: 'Academic Status', type: 'select', options: ['Excellent', 'Good', 'Average', 'Poor'] }
      ],
      dod: [
        { name: 'behavior_score', label: 'Behavior Score', type: 'number' },
        { name: 'discipline_incidents', label: 'Discipline Incidents', type: 'number' },
        { name: 'conduct_grade', label: 'Conduct Grade', type: 'select', options: ['A', 'B', 'C', 'D', 'F'] }
      ],
      headmaster: [
        { name: 'recommendation', label: 'Principal Recommendation', type: 'textarea' },
        { name: 'awards', label: 'Awards & Recognition', type: 'text' },
        { name: 'leadership_potential', label: 'Leadership Potential', type: 'select', options: ['High', 'Medium', 'Low'] }
      ]
    };
    return roleColumnTemplates[userRole] || [];
  };

  const filteredStudents = students.filter(student =>
    student.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.student_code?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const RoleIcon = getRoleIcon(userRole);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className={`p-4 rounded-2xl bg-gradient-to-br ${getRoleColor(userRole)}`}>
              <RoleIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Student Management - {userRole.toUpperCase()}
              </h1>
              <p className="text-gray-600 mt-2">Manage student data with role-based access and auto-calculations</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => {
                fetchColumns();
                fetchStudents();
              }}
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-purple-600"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              onClick={() => setShowAddColumnDialog(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Column
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-none shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Students</p>
                  <p className="text-3xl font-bold text-gray-900">{filteredStudents.length}</p>
                </div>
                <Users className="w-12 h-12 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Available Columns</p>
                  <p className="text-3xl font-bold text-green-600">{columns.length}</p>
                </div>
                <BarChart3 className="w-12 h-12 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Role Access</p>
                  <p className="text-3xl font-bold text-purple-600">{userRole.toUpperCase()}</p>
                </div>
                <RoleIcon className="w-12 h-12 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Auto-Calculations</p>
                  <p className="text-3xl font-bold text-orange-600">ACTIVE</p>
                </div>
                <Calculator className="w-12 h-12 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      <Card className="border-none shadow-xl mb-6">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardTitle className="flex items-center gap-2 font-black">
              <Users className="w-6 h-6 text-blue-600" />
              Student Data Management
            </CardTitle>
            <div className="flex gap-3">
              <Input
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading students...</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No students found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredStudents.map((student) => (
                <motion.div
                  key={student.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.01 }}
                  className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg overflow-hidden border-2 border-gray-100"
                >
                  <div className={`h-2 bg-gradient-to-r ${getRoleColor(userRole)}`} />
                  
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${getRoleColor(userRole)} flex items-center justify-center`}>
                          <span className="text-white font-bold text-lg">
                            {student.first_name?.[0]}{student.last_name?.[0]}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-xl font-black text-gray-800">
                            {student.first_name} {student.last_name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            ID: {student.student_code} • {student.trade_name} Level {student.level_number}
                          </p>
                          <div className="flex gap-2 mt-2">
                            <Badge variant="outline">{student.class_name}</Badge>
                            <Badge variant={student.status === 'active' ? 'default' : 'destructive'}>
                              {student.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => openEditDialog(student)}
                          size="sm"
                          className="bg-gradient-to-r from-blue-600 to-blue-700"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => handleRecalculate(student.id)}
                          size="sm"
                          className="bg-gradient-to-r from-green-600 to-green-700"
                        >
                          <Calculator className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <p className="text-xs text-gray-500 mb-1">TOTAL MARKS</p>
                        <p className="text-lg font-black text-blue-600">{student.total_marks || 0}</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <p className="text-xs text-gray-500 mb-1">AVERAGE</p>
                        <p className="text-lg font-black text-green-600">{student.average_marks || 0}%</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <p className="text-xs text-gray-500 mb-1">ATTENDANCE</p>
                        <p className="text-lg font-black text-purple-600">{student.attendance_percentage || 100}%</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <p className="text-xs text-gray-500 mb-1">CONDUCT</p>
                        <p className="text-lg font-black text-orange-600">{student.conduct_score || 100}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Student Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Edit Student Data - {userRole.toUpperCase()}
            </DialogTitle>
            {selectedStudent && (
              <p className="text-gray-600">
                {selectedStudent.first_name} {selectedStudent.last_name} ({selectedStudent.student_code})
              </p>
            )}
          </DialogHeader>
          <div className="space-y-4">
            {columns.filter(col => col.column_type !== 'calculated').map((column, index) => (
              <div key={index}>
                <Label>{column.column_label}</Label>
                {column.column_type === 'select' ? (
                  <Select
                    value={editData[column.id] || ''}
                    onValueChange={(value) => setEditData({ ...editData, [column.id]: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={`Select ${column.column_label}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {(column.select_options ? JSON.parse(column.select_options) : []).map((option: string) => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : column.column_type === 'textarea' ? (
                  <Textarea
                    value={editData[column.id] || ''}
                    onChange={(e) => setEditData({ ...editData, [column.id]: e.target.value })}
                    placeholder={`Enter ${column.column_label}`}
                  />
                ) : (
                  <Input
                    type={column.column_type === 'number' ? 'number' : column.column_type === 'date' ? 'date' : 'text'}
                    value={editData[column.id] || ''}
                    onChange={(e) => setEditData({ ...editData, [column.id]: e.target.value })}
                    placeholder={`Enter ${column.column_label}`}
                  />
                )}
              </div>
            ))}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleUpdateStudent}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
              <Button
                onClick={() => setShowEditDialog(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Column Dialog */}
      <Dialog open={showAddColumnDialog} onOpenChange={setShowAddColumnDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Add Custom Column - {userRole.toUpperCase()}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Column Name</Label>
              <Input
                value={newColumn.column_name}
                onChange={(e) => setNewColumn({ ...newColumn, column_name: e.target.value })}
                placeholder="e.g., custom_field"
              />
            </div>
            <div>
              <Label>Column Label</Label>
              <Input
                value={newColumn.column_label}
                onChange={(e) => setNewColumn({ ...newColumn, column_label: e.target.value })}
                placeholder="e.g., Custom Field"
              />
            </div>
            <div>
              <Label>Column Type</Label>
              <Select
                value={newColumn.column_type}
                onValueChange={(value) => setNewColumn({ ...newColumn, column_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="select">Select</SelectItem>
                  <SelectItem value="textarea">Textarea</SelectItem>
                  <SelectItem value="boolean">Boolean</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {newColumn.column_type === 'select' && (
              <div>
                <Label>Options (comma-separated)</Label>
                <Input
                  placeholder="Option1, Option2, Option3"
                  onChange={(e) => setNewColumn({ 
                    ...newColumn, 
                    select_options: e.target.value.split(',').map(s => s.trim()) 
                  })}
                />
              </div>
            )}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleAddColumn}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Column
              </Button>
              <Button
                onClick={() => setShowAddColumnDialog(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GlobalStudentSheets;