import React, { useState, useMemo } from 'react';
import { Download, Upload, Search, Edit, Trash2, Save, X, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';

interface Student {
  id: string;
  name: string;
  grade: string;
  class: string;
  age: number;
  gender: string;
  guardianName: string;
  guardianPhone: string;
  fees: number;
  feesPaid: number;
  feesBalance: number;
  attendance: number;
  behavior: string;
  academicPerformance: number;
  subjects: string[];
  enrollmentDate: string;
  status: 'active' | 'suspended' | 'graduated';
}

interface GlobalStudentSheetProps {
  role: 'accountant' | 'dod' | 'dos' | 'teacher';
  students: Student[];
  onUpdate?: (students: Student[]) => void;
}

export const GlobalStudentSheet: React.FC<GlobalStudentSheetProps> = ({ role, students: initialStudents, onUpdate }) => {
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGrade, setFilterGrade] = useState('all');
  const [filterClass, setFilterClass] = useState('all');
  const [sortField, setSortField] = useState<keyof Student>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Student>>({});
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  const getColumns = () => {
    const baseColumns = ['name', 'grade', 'class', 'age', 'gender'];
    
    switch (role) {
      case 'accountant':
        return [...baseColumns, 'guardianName', 'guardianPhone', 'fees', 'feesPaid', 'feesBalance', 'status'];
      case 'dod':
        return [...baseColumns, 'attendance', 'behavior', 'guardianPhone', 'status'];
      case 'dos':
        return [...baseColumns, 'academicPerformance', 'subjects', 'attendance', 'status'];
      case 'teacher':
        return [...baseColumns, 'academicPerformance', 'attendance', 'behavior', 'subjects'];
      default:
        return baseColumns;
    }
  };

  const columns = getColumns();

  const filteredAndSortedStudents = useMemo(() => {
    let filtered = students.filter(student => {
      const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           student.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGrade = filterGrade === 'all' || student.grade === filterGrade;
      const matchesClass = filterClass === 'all' || student.class === filterClass;
      return matchesSearch && matchesGrade && matchesClass;
    });

    filtered.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      const direction = sortDirection === 'asc' ? 1 : -1;
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return aVal.localeCompare(bVal) * direction;
      }
      return ((aVal as number) - (bVal as number)) * direction;
    });

    return filtered;
  }, [students, searchTerm, filterGrade, filterClass, sortField, sortDirection]);

  const handleSort = (field: keyof Student) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleEdit = (student: Student) => {
    setEditingId(student.id);
    setEditData(student);
  };

  const handleSave = () => {
    if (editingId) {
      const updated = students.map(s => s.id === editingId ? { ...s, ...editData } : s);
      setStudents(updated);
      onUpdate?.(updated);
      setEditingId(null);
      setEditData({});
    }
  };

  const handleDelete = (id: string) => {
    const updated = students.filter(s => s.id !== id);
    setStudents(updated);
    onUpdate?.(updated);
  };

  const handleExport = () => {
    const csv = [
      columns.join(','),
      ...filteredAndSortedStudents.map(s => columns.map(col => s[col as keyof Student]).join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `students_${role}_${new Date().toISOString()}.csv`;
    a.click();
  };

  const toggleRowSelection = (id: string) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRows(newSelected);
  };

  const toggleAllRows = () => {
    if (selectedRows.size === filteredAndSortedStudents.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(filteredAndSortedStudents.map(s => s.id)));
    }
  };

  const renderCell = (student: Student, column: string) => {
    const isEditing = editingId === student.id;
    const value = student[column as keyof Student];

    if (isEditing) {
      return (
        <Input
          value={editData[column as keyof Student] as string || ''}
          onChange={(e) => setEditData({ ...editData, [column]: e.target.value })}
          className="h-8 text-sm"
        />
      );
    }

    switch (column) {
      case 'status':
        return (
          <Badge variant={value === 'active' ? 'default' : value === 'suspended' ? 'destructive' : 'secondary'}>
            {value as string}
          </Badge>
        );
      case 'behavior':
        return (
          <Badge variant={value === 'excellent' ? 'default' : value === 'good' ? 'secondary' : 'destructive'}>
            {value as string}
          </Badge>
        );
      case 'fees':
      case 'feesPaid':
      case 'feesBalance':
        return <span className="font-mono">${(value as number).toLocaleString()}</span>;
      case 'attendance':
      case 'academicPerformance':
        return <span className="font-semibold">{value}%</span>;
      case 'subjects':
        return <span className="text-xs">{(value as string[]).join(', ')}</span>;
      default:
        return <span>{value as string}</span>;
    }
  };

  const getColumnLabel = (column: string) => {
    return column.charAt(0).toUpperCase() + column.slice(1).replace(/([A-Z])/g, ' $1');
  };

  return (
    <div className="w-full h-full flex flex-col bg-white rounded-lg shadow-lg">
      <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="flex gap-2 items-center flex-1 min-w-[300px]">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={filterGrade}
              onChange={(e) => setFilterGrade(e.target.value)}
              className="px-3 py-2 border rounded-md bg-white"
            >
              <option value="all">All Grades</option>
              <option value="S1">S1</option>
              <option value="S2">S2</option>
              <option value="S3">S3</option>
              <option value="S4">S4</option>
              <option value="S5">S5</option>
              <option value="S6">S6</option>
            </select>
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="px-3 py-2 border rounded-md bg-white"
            >
              <option value="all">All Classes</option>
              <option value="A">Class A</option>
              <option value="B">Class B</option>
              <option value="C">Class C</option>
            </select>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
            <Button variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
        
        {selectedRows.size > 0 && (
          <div className="mt-3 p-2 bg-blue-100 rounded-md flex items-center justify-between">
            <span className="text-sm font-medium">{selectedRows.size} rows selected</span>
            <div className="flex gap-2">
              <Button variant="destructive" size="sm">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Selected
              </Button>
              <Button variant="outline" size="sm" onClick={() => setSelectedRows(new Set())}>
                Clear Selection
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 bg-gray-50 z-10">
            <tr>
              <th className="p-3 text-left border-b">
                <input
                  type="checkbox"
                  checked={selectedRows.size === filteredAndSortedStudents.length}
                  onChange={toggleAllRows}
                  className="w-4 h-4"
                />
              </th>
              {columns.map(column => (
                <th
                  key={column}
                  className="p-3 text-left border-b cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort(column as keyof Student)}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{getColumnLabel(column)}</span>
                    {sortField === column && (
                      sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </th>
              ))}
              <th className="p-3 text-left border-b font-semibold text-sm">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedStudents.map((student, index) => (
              <tr
                key={student.id}
                className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'} ${
                  selectedRows.has(student.id) ? 'bg-blue-50' : ''
                }`}
              >
                <td className="p-3 border-b">
                  <input
                    type="checkbox"
                    checked={selectedRows.has(student.id)}
                    onChange={() => toggleRowSelection(student.id)}
                    className="w-4 h-4"
                  />
                </td>
                {columns.map(column => (
                  <td key={column} className="p-3 border-b text-sm">
                    {renderCell(student, column)}
                  </td>
                ))}
                <td className="p-3 border-b">
                  <div className="flex gap-2">
                    {editingId === student.id ? (
                      <>
                        <Button size="sm" variant="default" onClick={handleSave}>
                          <Save className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                          <X className="w-4 h-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button size="sm" variant="outline" onClick={() => handleEdit(student)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(student.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-4 border-t bg-gray-50 flex items-center justify-between">
        <span className="text-sm text-gray-600">
          Showing {filteredAndSortedStudents.length} of {students.length} students
        </span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">Previous</Button>
          <Button variant="outline" size="sm">Next</Button>
        </div>
      </div>
    </div>
  );
};
