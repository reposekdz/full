import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Download, FileText, Filter, Plus, Search, Settings, Users, RefreshCw } from 'lucide-react';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { GLOBAL_LEVELS, GLOBAL_TRADES, getLevelsForTrade } from '@/app/constants/tradesAndLevels';
import apiService from '@/app/services/apiService';
import {
  DataGrid,
  GridColDef,
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
  GridActionsCellItem
} from '@mui/x-data-grid';
import { Edit, Trash2 } from 'lucide-react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Box } from '@mui/material';

const muiTheme = createTheme({
  palette: {
    primary: { main: '#2563eb' }, // blue-600
    secondary: { main: '#9333ea' }, // purple-600
  },
});

function CustomToolbar() {
  return (
    <GridToolbarContainer className="p-2 gap-2">
      <GridToolbarFilterButton />
      <GridToolbarDensitySelector />
      <GridToolbarExport />
    </GridToolbarContainer>
  );
}

type LevelDef = (typeof GLOBAL_LEVELS)[number];

interface Student {
  id: number;
  student_id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  gender: string;
  status: string;
  custom_values?: Record<number, string>;
  username?: string;
}

interface Column {
  id: number;
  column_name: string;
  column_type: string;
  is_required: boolean;
  default_value: string;
  display_order: number;
}

const canAddStudentRole = (role?: string) =>
  !!role && ['accountant', 'dod', 'dos', 'headmaster', 'admin', 'teacher', 'advisor'].includes(role.toLowerCase());

const canManageColumns = (role?: string) =>
  !!role && ['accountant', 'dod', 'dos', 'headmaster', 'admin', 'teacher', 'advisor'].includes(role.toLowerCase());

export default function GlobalStudentSheets() {
  const [selectedTrade, setSelectedTrade] = useState('');
  const [selectedLevelId, setSelectedLevelId] = useState('');
  const selectedLevel: LevelDef | null = selectedLevelId ? (GLOBAL_LEVELS.find((l) => l.id === selectedLevelId) || null) : null;

  const [students, setStudents] = useState<Student[]>([]);
  const [columns, setColumns] = useState<Column[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [showColumnModal, setShowColumnModal] = useState(false);
  const [editingColumn, setEditingColumn] = useState<any>(null);
  const [columnForm, setColumnForm] = useState({
    column_name: '',
    column_type: 'text',
    is_required: false,
    default_value: '',
    display_order: 0
  });

  const [showAddStudent, setShowAddStudent] = useState(false);
  const [createdSerial, setCreatedSerial] = useState<string | null>(null);
  const [studentForm, setStudentForm] = useState({
    student_id: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    gender: 'male',
    date_of_birth: ''
  });

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  }, []);

  const availableLevels = useMemo(
    () => (selectedTrade ? getLevelsForTrade(selectedTrade) : GLOBAL_LEVELS),
    [selectedTrade]
  );

  const fetchSheet = async () => {
    if (!selectedTrade || !selectedLevel) return;
    setLoading(true);
    try {
      const qs = new URLSearchParams({ level_suffix: selectedLevel.level_suffix || '' }).toString();
      const res = await apiService.request(`/student-management/sheets/${selectedTrade}/${selectedLevel.level_number}?${qs}`);
      if (res?.success) {
        setStudents(res.students || []);
        setColumns(res.columns || []);
      } else {
        setStudents([]);
        setColumns([]);
      }
    } catch (e) {
      console.error('Failed to fetch sheet:', e);
      setStudents([]);
      setColumns([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedTrade && selectedLevelId) fetchSheet();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTrade, selectedLevelId]);

  const filteredStudents = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return students;
    return (students || []).filter((s) => {
      const name = `${s.first_name || ''} ${s.last_name || ''}`.toLowerCase();
      const code = String(s.student_id || s.username || '').toLowerCase();
      return name.includes(q) || code.includes(q);
    });
  }, [students, searchQuery]);

  const exportToCSV = () => {
    if (!selectedTrade || !selectedLevel) return;
    const baseHeaders = ['Student ID', 'First Name', 'Last Name', 'Email', 'Phone', 'Trade', 'Level'];
    const customHeaders = (columns || []).map((c) => c.column_name);
    const headers = [...baseHeaders, ...customHeaders];

    const rows = (filteredStudents || []).map((s) => {
      const base = [
        s.student_id || s.username || '',
        s.first_name || '',
        s.last_name || '',
        s.email || '',
        s.phone || '',
        selectedTrade,
        `${selectedLevel.level_number}${selectedLevel.level_suffix || ''}`
      ];
      const custom = (columns || []).map((c) => (s.custom_values?.[c.id] ?? c.default_value ?? ''));
      return [...base, ...custom];
    });

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell ?? '').replaceAll('"', '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedTrade}_L${selectedLevel.level_number}${selectedLevel.level_suffix || ''}_students.csv`;
    a.click();
  };

  const handleUpdateValue = async (studentDbId: number, columnId: number, value: string) => {
    try {
      await apiService.request(`/student-management/students/${studentDbId}/columns/${columnId}`, {
        method: 'PUT',
        body: JSON.stringify({ column_value: value })
      });
    } catch (e) {
      console.error('Failed to update value:', e);
    }
  };

  const resetColumnForm = () => {
    setColumnForm({
      column_name: '',
      column_type: 'text',
      is_required: false,
      default_value: '',
      display_order: 0
    });
  };

  const openCreateColumn = () => {
    setEditingColumn(null);
    resetColumnForm();
    setShowColumnModal(true);
  };

  const openEditColumn = (col: any) => {
    setEditingColumn(col);
    setColumnForm({
      column_name: col.column_name,
      column_type: col.column_type,
      is_required: !!col.is_required,
      default_value: col.default_value || '',
      display_order: Number(col.display_order || 0)
    });
    setShowColumnModal(true);
  };

  const saveColumn = async () => {
    if (!selectedTrade || !selectedLevel) return;
    setLoading(true);
    try {
      if (editingColumn?.id) {
        await apiService.request(`/student-management/columns/${editingColumn.id}`, {
          method: 'PUT',
          body: JSON.stringify(columnForm)
        });
      } else {
        await apiService.request('/student-management/columns', {
          method: 'POST',
          body: JSON.stringify({
            ...columnForm,
            trade_code: selectedTrade,
            level_number: selectedLevel.level_number,
            level_suffix: selectedLevel.level_suffix || ''
          })
        });
      }
      setShowColumnModal(false);
      setEditingColumn(null);
      resetColumnForm();
      await fetchSheet();
    } catch (e: any) {
      alert(e?.message || 'Byanze kubika inkingi');
    } finally {
      setLoading(false);
    }
  };

  const addTemplateColumns = async (template: 'finance' | 'marks') => {
    if (!selectedTrade || !selectedLevel) return;
    const templates =
      template === 'finance'
        ? [
          { column_name: 'Paid', column_type: 'number', default_value: '0', is_required: false },
          { column_name: 'Unpaid', column_type: 'number', default_value: '0', is_required: false },
          { column_name: 'Balance', column_type: 'number', default_value: '0', is_required: false }
        ]
        : [
          { column_name: 'Quiz', column_type: 'number', default_value: '0', is_required: false },
          { column_name: 'Midterm', column_type: 'number', default_value: '0', is_required: false },
          { column_name: 'Final', column_type: 'number', default_value: '0', is_required: false }
        ];

    const existing = new Set((columns || []).map((c) => String(c.column_name || '').toLowerCase().trim()));
    setLoading(true);
    try {
      for (const c of templates) {
        if (existing.has(c.column_name.toLowerCase())) continue;
        await apiService.request('/student-management/columns', {
          method: 'POST',
          body: JSON.stringify({
            trade_code: selectedTrade,
            level_number: selectedLevel.level_number,
            level_suffix: selectedLevel.level_suffix || '',
            column_name: c.column_name,
            column_type: c.column_type,
            is_required: c.is_required,
            default_value: c.default_value,
            display_order: (columns?.length || 0) + 1
          })
        });
      }
      await fetchSheet();
    } catch (e: any) {
      alert(e?.message || 'Byanze kongeramo templates');
    } finally {
      setLoading(false);
    }
  };

  const addStudent = async () => {
    if (!selectedTrade || !selectedLevel) return;
    setLoading(true);
    setCreatedSerial(null);
    try {
      const res = await apiService.request('/student-management/students', {
        method: 'POST',
        body: JSON.stringify({
          ...studentForm,
          trade_code: selectedTrade,
          level_number: selectedLevel.level_number,
          level_suffix: selectedLevel.level_suffix || ''
        })
      });
      if (res?.success) {
        setCreatedSerial(res.serial_code || null);
        setStudentForm({
          student_id: '',
          first_name: '',
          last_name: '',
          email: '',
          phone: '',
          gender: 'male',
          date_of_birth: ''
        });
        await fetchSheet();
      } else {
        alert(res?.error || 'Byanze kongeramo umunyeshuri');
      }
    } catch (e: any) {
      alert(e?.message || 'Byanze kongeramo umunyeshuri');
    } finally {
      setLoading(false);
    }
  };

  // DataGrid Column Definitions
  const gridColumns: GridColDef[] = useMemo(() => {
    const base: GridColDef[] = [
      { field: 'index', headerName: '#', width: 60, renderCell: (params) => params.api.getAllRowIds().indexOf(params.id) + 1 },
      { field: 'username', headerName: 'Student ID', width: 140, fontWeight: 'bold' },
      {
        field: 'full_name',
        headerName: 'Amazina / Name',
        width: 220,
        valueGetter: (params, row) => `${row.first_name || ''} ${row.last_name || ''}`,
        renderCell: (params) => <span className="font-semibold text-blue-700">{params.value}</span>
      },
      { field: 'email', headerName: 'Email', width: 200 },
      { field: 'phone', headerName: 'Phone', width: 140 },
    ];

    const custom: GridColDef[] = (columns || []).map((c) => ({
      field: `custom_${c.id}`,
      headerName: c.column_name,
      width: 150,
      editable: true,
      renderEditCell: (params) => (
        <Input
          type={c.column_type === 'number' ? 'number' : c.column_type === 'date' ? 'date' : 'text'}
          defaultValue={params.value}
          onBlur={(e) => {
            params.api.setEditCellValue({ id: params.id, field: params.field, value: e.target.value });
            handleUpdateValue(params.row.id, c.id, e.target.value);
          }}
          className="h-9 w-full"
        />
      ),
      valueGetter: (params, row) => row.custom_values?.[c.id] ?? c.default_value ?? ''
    }));

    const statusCol: GridColDef = {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Badge className={params.value === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
          {params.value === 'active' ? 'Active' : 'Inactive'}
        </Badge>
      )
    };

    return [...base, ...custom, statusCol];
  }, [columns]);

  const gridRows = useMemo(() => {
    return filteredStudents.map((s, idx) => ({
      id: s.id || `temp-${idx}`,
      ...s
    }));
  }, [filteredStudents]);

  const sheetTitle = selectedTrade && selectedLevel
    ? `${selectedTrade} - Level ${selectedLevel.level_number}${selectedLevel.level_suffix || ''}`
    : '';


  return (
    <ThemeProvider theme={muiTheme}>
      <div className="min-h-screen bg-gradient-to-br from-[#f8faff] via-[#f0f4ff] to-[#e6eeff] p-6 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div>
              <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-700 bg-clip-text text-transparent drop-shadow-sm">
                Imbonerahamwe Rusange y'Abanyeshuri
              </h1>
              <p className="text-gray-500 font-medium mt-2 flex items-center gap-2">
                <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700">Advanced Grid</Badge>
                Global Student Sheets (Trade/Level independent)
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedTrade && selectedLevel && (
                <Button onClick={exportToCSV} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-200 transition-all active:scale-95">
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              )}
              {selectedTrade && selectedLevel && (
                <Button onClick={fetchSheet} variant="outline" disabled={loading} className="bg-white/80 backdrop-blur-sm border-blue-100 hover:bg-blue-50 transition-all">
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              )}
              {selectedTrade && selectedLevel && canAddStudentRole(user?.role) && (
                <Button onClick={() => setShowAddStudent(true)} variant="outline" className="bg-white/80 backdrop-blur-sm border-purple-100 hover:bg-purple-50 transition-all text-purple-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Student
                </Button>
              )}
            </div>
          </motion.div>

          <Card className="border-0 shadow-2xl shadow-blue-100/50 bg-white/70 backdrop-blur-md overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-blue-500 to-purple-500" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-indigo-900">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Filter className="w-5 h-5 text-blue-600" />
                </div>
                Hitamo Umwuga n'Urwego
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Umwuga / Trade</label>
                  <Select
                    value={selectedTrade}
                    onValueChange={(v) => {
                      setSelectedTrade(v);
                      setSelectedLevelId('');
                      setStudents([]);
                      setColumns([]);
                    }}
                  >
                    <SelectTrigger className="border-2 border-blue-50 bg-white/50 focus:ring-2 focus:ring-blue-200 transition-all h-12">
                      <SelectValue placeholder="Hitamo umwuga..." />
                    </SelectTrigger>
                    <SelectContent>
                      {GLOBAL_TRADES.map((trade) => (
                        <SelectItem key={trade.code} value={trade.code} className="hover:bg-blue-50">
                          <span className="font-bold text-blue-600">{trade.code}</span> - {trade.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Urwego / Level</label>
                  <Select value={selectedLevelId} onValueChange={setSelectedLevelId} disabled={!selectedTrade}>
                    <SelectTrigger className="border-2 border-blue-50 bg-white/50 focus:ring-2 focus:ring-blue-200 transition-all h-12">
                      <SelectValue placeholder="Hitamo urwego..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableLevels.map((level) => (
                        <SelectItem key={level.id} value={level.id} className="hover:bg-blue-50">
                          {level.display}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {selectedTrade && selectedLevel && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-4 border-t border-gray-100"
                >
                  <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
                    <Input
                      placeholder="Shakisha (Amazina, ID)..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 border-2 border-blue-50 bg-white/50 focus:ring-2 focus:ring-blue-200 h-10"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {canManageColumns(user?.role) && (
                      <Button variant="outline" onClick={openCreateColumn} className="border-blue-200 text-blue-700 hover:bg-blue-50">
                        <Settings className="w-4 h-4 mr-2" />
                        Add Column
                      </Button>
                    )}
                    <Button variant="ghost" onClick={() => addTemplateColumns('finance')} className="text-green-700 hover:bg-green-50">
                      Finance Template
                    </Button>
                    <Button variant="ghost" onClick={() => addTemplateColumns('marks')} className="text-amber-700 hover:bg-amber-50">
                      Marks Template
                    </Button>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>

          {!selectedTrade || !selectedLevel ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card className="border-0 shadow-xl bg-white/50 backdrop-blur-sm">
                <CardContent className="p-20 text-center">
                  <div className="w-24 h-24 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-6">
                    <FileText className="w-12 h-12 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-indigo-900 mb-2">Hitamo Umwuga n'Urwego</h3>
                  <p className="text-gray-500 max-w-sm mx-auto">Select a trade and a level from above to access the interactive student data grid</p>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <Tabs defaultValue="all" className="w-full space-y-6">
              <div className="flex justify-between items-center">
                <TabsList className="bg-white/80 p-1 border shadow-sm">
                  <TabsTrigger value="all" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
                    All ({filteredStudents.length})
                  </TabsTrigger>
                  <TabsTrigger value="active" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
                    Bakora ({filteredStudents.filter((s) => s.status === 'active').length})
                  </TabsTrigger>
                  <TabsTrigger value="inactive" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
                    Ntibakora ({filteredStudents.filter((s) => s.status !== 'active').length})
                  </TabsTrigger>
                </TabsList>

                <div className="hidden md:flex items-center gap-2 text-sm text-gray-500 font-medium">
                  <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                  Auto-sync active
                </div>
              </div>

              <TabsContent value="all" className="mt-0">
                <Card className="border-0 shadow-2xl overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6">
                    <div className="flex justify-between items-center text-white/90 mb-1">
                      <span className="text-xs font-bold uppercase tracking-wider opacity-80">Official Student Record</span>
                      <Users className="w-4 h-4" />
                    </div>
                    <CardTitle className="text-2xl font-black">
                      {sheetTitle} Data Management Sheet
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Box sx={{
                      height: 700,
                      width: '100%',
                      '& .MuiDataGrid-root': {
                        border: 'none',
                      },
                      '& .MuiDataGrid-cell': {
                        borderBottom: '1px solid #f1f5f9',
                        fontSize: '0.925rem',
                        '&:focus': { outline: 'none' },
                      },
                      '& .MuiDataGrid-columnHeaders': {
                        backgroundColor: '#f8fafc',
                        borderBottom: '2px solid #e2e8f0',
                        color: '#475569',
                        fontWeight: '800',
                      },
                      '& .MuiDataGrid-virtualScroller': {
                        backgroundColor: '#ffffff',
                      },
                      '& .MuiDataGrid-footerContainer': {
                        borderTop: '2px solid #e2e8f0',
                        backgroundColor: '#f8fafc',
                      }
                    }}>
                      <DataGrid
                        rows={gridRows}
                        columns={gridColumns}
                        loading={loading}
                        slots={{ toolbar: CustomToolbar }}
                        initialState={{
                          pagination: { paginationModel: { pageSize: 25 } },
                        }}
                        pageSizeOptions={[10, 25, 50, 100]}
                        disableRowSelectionOnClick
                        density="comfortable"
                      />
                    </Box>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="active">
                <Card className="p-12 text-center border-0 shadow-xl bg-white">
                  <Users className="w-16 h-16 mx-auto text-green-500 mb-4 opacity-20" />
                  <h2 className="text-xl font-bold">Active Students View</h2>
                  <p className="text-gray-500">Currently showing {filteredStudents.filter((s) => s.status === 'active').length} active records.</p>
                </Card>
              </TabsContent>

              <TabsContent value="inactive">
                <Card className="p-12 text-center border-0 shadow-xl bg-white">
                  <Users className="w-16 h-16 mx-auto text-red-500 mb-4 opacity-20" />
                  <h2 className="text-xl font-bold">Inactive Records</h2>
                  <p className="text-gray-500">Currently showing {filteredStudents.filter((s) => s.status !== 'active').length} archived records.</p>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>

        <Dialog open={showColumnModal} onOpenChange={setShowColumnModal}>
          <DialogContent className="max-w-lg border-0 shadow-2xl backdrop-blur-xl bg-white/95">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black text-indigo-900">
                {editingColumn ? 'Edit Dynamic Column' : 'Add New Student Column'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label className="text-sm font-bold">Inzina ry'Inkingi / Column Name</Label>
                <Input
                  placeholder="e.g. Marks, Fees, Comments"
                  value={columnForm.column_name}
                  onChange={(e) => setColumnForm({ ...columnForm, column_name: e.target.value })}
                  className="h-11 border-blue-50 focus:ring-blue-100"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-bold">Ubwoko / Data Type</Label>
                <Select value={columnForm.column_type} onValueChange={(v) => setColumnForm({ ...columnForm, column_type: v })}>
                  <SelectTrigger className="h-11 border-blue-50">
                    <SelectValue placeholder="Hitamo ubwoko..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Umwandiko / Text</SelectItem>
                    <SelectItem value="number">Imibare / Number</SelectItem>
                    <SelectItem value="date">Italiki / Date</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-bold">Agaciro k'Ibifatizo / Default Value</Label>
                <Input
                  placeholder="Optional"
                  value={columnForm.default_value}
                  onChange={(e) => setColumnForm({ ...columnForm, default_value: e.target.value })}
                  className="h-11 border-blue-50"
                />
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <Button variant="ghost" onClick={() => setShowColumnModal(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={saveColumn}
                  disabled={loading || !columnForm.column_name.trim()}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-8"
                >
                  {loading ? <RefreshCw className="animate-spin w-4 h-4 mr-2" /> : null}
                  Save Column
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showAddStudent} onOpenChange={setShowAddStudent}>
          <DialogContent className="max-w-2xl border-0 shadow-2xl bg-white/98">
            <DialogHeader>
              <DialogTitle>Add Student ({sheetTitle})</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {createdSerial && (
                <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-800 font-semibold">
                  Serial Code: <span className="font-mono">{createdSerial}</span>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Student ID (optional)</Label>
                  <Input value={studentForm.student_id} onChange={(e) => setStudentForm({ ...studentForm, student_id: e.target.value })} />
                </div>
                <div>
                  <Label>Gender</Label>
                  <Select value={studentForm.gender} onValueChange={(v) => setStudentForm({ ...studentForm, gender: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>First Name</Label>
                  <Input value={studentForm.first_name} onChange={(e) => setStudentForm({ ...studentForm, first_name: e.target.value })} />
                </div>
                <div>
                  <Label>Last Name</Label>
                  <Input value={studentForm.last_name} onChange={(e) => setStudentForm({ ...studentForm, last_name: e.target.value })} />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input value={studentForm.email} onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })} />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input value={studentForm.phone} onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })} />
                </div>
                <div>
                  <Label>Date of Birth</Label>
                  <Input type="date" value={studentForm.date_of_birth} onChange={(e) => setStudentForm({ ...studentForm, date_of_birth: e.target.value })} />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowAddStudent(false)}>
                  Close
                </Button>
                <Button
                  onClick={addStudent}
                  disabled={loading || !studentForm.first_name.trim() || !studentForm.last_name.trim()}
                >
                  Add Student
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </ThemeProvider>
  );
}

