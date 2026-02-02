import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Save, X, Table, Download, Calculator, Sigma, TrendingUp, Percent, Hash } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import apiService from '../services/apiService';
import axios from 'axios';

export default function GlobalStudentSheets({ onNavigate }: { onNavigate: (page: string) => void }) {
  const [selectedTrade, setSelectedTrade] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [trades, setTrades] = useState<any[]>([]);
  const [levels, setLevels] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [columns, setColumns] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [editingCell, setEditingCell] = useState<any>(null);
  const [cellValue, setCellValue] = useState('');

  const [columnForm, setColumnForm] = useState({
    column_name: '',
    column_type: 'text',
    is_required: false,
    default_value: '',
    display_order: 0,
    formula: '',
    calculation_type: 'none'
  });

  const [showFormulaBuilder, setShowFormulaBuilder] = useState(false);
  const [calculatedValues, setCalculatedValues] = useState<any>({});

  useEffect(() => {
    fetchTrades();
  }, []);

  useEffect(() => {
    if (selectedTrade) {
      fetchLevels(selectedTrade);
    } else {
      setLevels([]);
      setSelectedLevel('');
    }
  }, [selectedTrade]);

  useEffect(() => {
    if (selectedTrade && selectedLevel) {
      loadSheet();
    }
  }, [selectedTrade, selectedLevel]);

  const fetchTrades = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/trades-levels/trades');
      if (response.data.success) {
        setTrades(response.data.trades);
      }
    } catch (error) {
      console.error('Error fetching trades:', error);
    }
  };

  const fetchLevels = async (tradeCode: string) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/trades-levels/trades/${tradeCode}/levels`);
      if (response.data.success) {
        setLevels(response.data.levels);
      }
    } catch (error) {
      console.error('Error fetching levels:', error);
      setLevels([]);
    }
  };

  const loadSheet = async () => {
    if (!selectedTrade || !selectedLevel) return;
    
    const levelNumber = parseInt(selectedLevel);
    const levelSuffix = selectedLevel.replace(/\d+/, '') || '';
    
    setLoading(true);
    try {
      const result = await apiService.getEntities('students', {
        tradeCode: selectedTrade,
        levelNumber: levelNumber,
        levelSuffix: levelSuffix
      });
      
      if (result.success) {
        setStudents(result.entities || []);
        setColumns(result.customColumns || []);
      }
    } catch (error) {
      console.error('Error loading sheet:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleStudentAdded = (event: any) => {
      const newStudent = event.detail;
      const levelNumber = parseInt(selectedLevel);
      if (selectedTrade && selectedLevel && 
          newStudent.trade_code === selectedTrade && 
          newStudent.level_number === levelNumber) {
        loadSheet();
      }
    };
    
    window.addEventListener('studentAdded', handleStudentAdded);
    return () => window.removeEventListener('studentAdded', handleStudentAdded);
  }, [selectedTrade, selectedLevel]);

  const calculateFormula = (formula: string, studentData: any, allColumns: any[]) => {
    try {
      let result = formula;
      allColumns.forEach(col => {
        const value = studentData.custom_values?.[col.id] || 0;
        result = result.replace(new RegExp(`\\{${col.column_name}\\}`, 'g'), value);
      });
      return eval(result);
    } catch {
      return 'Error';
    }
  };

  const calculateColumnStats = (columnId: number) => {
    const values = students.map(s => parseFloat(s.custom_values?.[columnId]) || 0).filter(v => !isNaN(v));
    if (!values.length) return { sum: 0, avg: 0, min: 0, max: 0, count: 0 };
    return {
      sum: values.reduce((a, b) => a + b, 0),
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      count: values.length
    };
  };

  const handleAddColumn = async () => {
    if (!columnForm.column_name) {
      alert('Please fill in column name');
      return;
    }
    
    setLoading(true);
    try {
      const result = await apiService.createCustomColumn({
        entity_type: 'students',
        column_name: columnForm.column_name,
        column_label: columnForm.column_name,
        column_type: columnForm.column_type,
        data_type: columnForm.column_type === 'number' ? 'decimal' : 'string',
        is_required: columnForm.is_required,
        default_value: columnForm.default_value,
        display_order: columnForm.display_order
      });
      
      if (result.success) {
        setShowAddColumn(false);
        setColumnForm({ column_name: '', column_type: 'text', is_required: false, default_value: '', display_order: 0, formula: '', calculation_type: 'none' });
        loadSheet();
      } else {
        alert(result.message || 'Failed to add column');
      }
    } catch (error: any) {
      alert(error.message || 'Failed to add column');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCell = async () => {
    if (!editingCell) return;
    
    setLoading(true);
    try {
      const customFields = { [editingCell.columnId]: cellValue };
      const result = await apiService.updateEntityCustomFields(
        'students',
        editingCell.studentId,
        customFields
      );
      
      if (result.success) {
        setEditingCell(null);
        setCellValue('');
        loadSheet();
      }
    } catch (error: any) {
      alert(error.message || 'Failed to update value');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteColumn = async (columnId: number) => {
    if (!confirm('Delete this column? All data will be lost.')) return;
    
    try {
      await apiService.request(`/management/columns/${columnId}`, { method: 'DELETE' });
      loadSheet();
    } catch (error: any) {
      alert(error.message || 'Failed to delete column');
    }
  };

  const exportToCSV = () => {
    if (!students.length) return;
    
    const headers = ['Name', 'Student ID', ...columns.map(c => c.column_name)];
    const rows = students.map(s => [
      `${s.first_name} ${s.last_name}`,
      s.username,
      ...columns.map(c => s.custom_values?.[c.id] || '')
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedTrade}_Level${selectedLevel}_Sheet.csv`;
    a.click();
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Table className="w-6 h-6" />
            Global Student Sheets
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Select Trade</Label>
              <Select value={selectedTrade} onValueChange={setSelectedTrade}>
                <SelectTrigger>
                  <SelectValue placeholder="Select trade..." />
                </SelectTrigger>
                <SelectContent>
                  {trades.map(trade => (
                    <SelectItem key={trade.trade_code} value={trade.trade_code}>
                      {trade.trade_code} - {trade.trade_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Select Level</Label>
              <Select value={selectedLevel} onValueChange={setSelectedLevel} disabled={!selectedTrade}>
                <SelectTrigger>
                  <SelectValue placeholder="Select level..." />
                </SelectTrigger>
                <SelectContent>
                  {levels.map(level => (
                    <SelectItem key={level.level_display} value={level.level_display}>
                      Level {level.level_display}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedTrade && selectedLevel && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{selectedTrade} - Level {selectedLevel} ({students.length} students)</span>
              <div className="flex gap-2">
                <Button onClick={() => setShowAddColumn(true)} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Column
                </Button>
                <Button onClick={exportToCSV} size="sm" variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border p-2 text-left sticky left-0 bg-gray-100 z-10">Name</th>
                      <th className="border p-2 text-left">Student ID</th>
                      {columns.map(col => (
                        <th key={col.id} className="border p-2 text-left min-w-[150px]">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="font-bold">{col.column_name}</span>
                                {col.calculation_type !== 'none' && (
                                  <Calculator className="w-4 h-4 text-blue-600" />
                                )}
                              </div>
                              <Button size="sm" variant="ghost" onClick={() => handleDeleteColumn(col.id)}>
                                <Trash2 className="w-3 h-3 text-red-600" />
                              </Button>
                            </div>
                            {col.column_type === 'number' && (
                              <div className="text-xs text-gray-600 space-y-1">
                                <div className="flex justify-between">
                                  <span>Sum:</span>
                                  <span className="font-bold">{calculateColumnStats(col.id).sum.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Avg:</span>
                                  <span className="font-bold">{calculateColumnStats(col.id).avg.toFixed(2)}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student, idx) => (
                      <motion.tr
                        key={student.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.02 }}
                        className="hover:bg-blue-50"
                      >
                        <td className="border p-2 font-semibold sticky left-0 bg-white">
                          {student.first_name} {student.last_name}
                        </td>
                        <td className="border p-2 text-sm">{student.username}</td>
                        {columns.map(col => (
                          <td key={col.id} className="border p-2">
                            {col.formula ? (
                              <div className="bg-blue-50 p-1 rounded text-sm font-bold text-blue-700">
                                {calculateFormula(col.formula, student, columns)}
                              </div>
                            ) : editingCell?.studentId === student.id && editingCell?.columnId === col.id ? (
                              <div className="flex gap-1">
                                <Input
                                  value={cellValue}
                                  onChange={(e) => setCellValue(e.target.value)}
                                  className="h-8"
                                  type={col.column_type === 'number' ? 'number' : 'text'}
                                  autoFocus
                                />
                                <Button size="sm" onClick={handleUpdateCell}>
                                  <Save className="w-3 h-3" />
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => setEditingCell(null)}>
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            ) : (
                              <div
                                className="cursor-pointer hover:bg-gray-100 p-1 rounded"
                                onClick={() => {
                                  setEditingCell({ studentId: student.id, columnId: col.id });
                                  setCellValue(student.custom_values?.[col.id] || '');
                                }}
                              >
                                {student.custom_values?.[col.id] || '-'}
                              </div>
                            )}
                          </td>
                        ))}
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Dialog open={showAddColumn} onOpenChange={setShowAddColumn}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Column</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Column Name *</Label>
              <Input
                value={columnForm.column_name}
                onChange={(e) => setColumnForm({ ...columnForm, column_name: e.target.value })}
                placeholder="e.g., Math Marks, Attendance"
              />
            </div>
            <div>
              <Label>Column Type</Label>
              <Select value={columnForm.column_type} onValueChange={(v) => setColumnForm({ ...columnForm, column_type: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="percentage">Percentage</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Calculation Type</Label>
              <Select value={columnForm.calculation_type} onValueChange={(v) => setColumnForm({ ...columnForm, calculation_type: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="sum">Sum</SelectItem>
                  <SelectItem value="average">Average</SelectItem>
                  <SelectItem value="formula">Custom Formula</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {columnForm.calculation_type === 'formula' && (
              <div>
                <Label>Formula (use {'{ColumnName}'} for references)</Label>
                <Input
                  value={columnForm.formula}
                  onChange={(e) => setColumnForm({ ...columnForm, formula: e.target.value })}
                  placeholder="e.g., {Math} + {Science} / 2"
                />
                <p className="text-xs text-gray-500 mt-1">Example: {'{Math}'} * 0.4 + {'{Science}'} * 0.6</p>
              </div>
            )}
            <div>
              <Label>Default Value</Label>
              <Input
                value={columnForm.default_value}
                onChange={(e) => setColumnForm({ ...columnForm, default_value: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddColumn} disabled={loading} className="flex-1">
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Adding...' : 'Add Column'}
              </Button>
              <Button onClick={() => setShowAddColumn(false)} variant="outline">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
