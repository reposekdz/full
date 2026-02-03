import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, Save, X, Table, Columns } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import apiService from '../services/apiService';
import { GLOBAL_TRADES, GLOBAL_LEVELS, getLevelsForTrade } from '../constants/tradesAndLevels';

export default function AccountantDynamicColumns() {
  const [trades] = useState<any[]>(GLOBAL_TRADES);
  const [selectedTrade, setSelectedTrade] = useState('');
  const [selectedLevelId, setSelectedLevelId] = useState('');
  const [columns, setColumns] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [showColumnModal, setShowColumnModal] = useState(false);
  const [editingColumn, setEditingColumn] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const availableLevels = selectedTrade ? getLevelsForTrade(selectedTrade) : GLOBAL_LEVELS;
  const selectedLevel = selectedLevelId ? GLOBAL_LEVELS.find((l) => l.id === selectedLevelId) : null;
  const levelNumber = selectedLevel?.level_number || null;
  const levelSuffix = selectedLevel?.level_suffix || '';

  const [columnForm, setColumnForm] = useState({
    column_name: '',
    column_type: 'text',
    is_required: false,
    default_value: '',
    display_order: 0
  });

  useEffect(() => {
    if (selectedTrade && selectedLevel) {
      loadSheet();
    }
  }, [selectedTrade, selectedLevelId]);

  const loadSheet = async () => {
    try {
      setLoading(true);
      const qs = new URLSearchParams({ level_suffix: levelSuffix }).toString();
      const res = await apiService.request(`/student-management/sheets/${selectedTrade}/${levelNumber}?${qs}`);
      if (res?.success) {
        setColumns(res.columns || []);
        setStudents(res.students || []);
      } else {
        setColumns([]);
        setStudents([]);
      }
    } catch (error) {
      console.error('Error loading sheet:', error);
      setColumns([]);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateColumn = async () => {
    setLoading(true);
    try {
      await apiService.request('/student-management/columns', {
        method: 'POST',
        body: JSON.stringify({
          ...columnForm,
          trade_code: selectedTrade,
          level_number: levelNumber,
          level_suffix: levelSuffix
        })
      });
      setShowColumnModal(false);
      resetForm();
      loadSheet();
    } catch (error: any) {
      alert(error.message || 'Byanze gukora inkingi');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateColumn = async () => {
    setLoading(true);
    try {
      await apiService.request(`/student-management/columns/${editingColumn.id}`, {
        method: 'PUT',
        body: JSON.stringify(columnForm)
      });
      setShowColumnModal(false);
      setEditingColumn(null);
      resetForm();
      loadSheet();
    } catch (error: any) {
      alert(error.message || 'Byanze kuvugurura inkingi');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteColumn = async (columnId: number) => {
    if (!confirm('Urashaka gusiba iyi nkingi?')) return;
    try {
      await apiService.request(`/student-management/columns/${columnId}`, { method: 'DELETE' });
      loadSheet();
    } catch (error: any) {
      alert(error.message || 'Byanze gusiba inkingi');
    }
  };

  const handleUpdateValue = async (studentId: number, columnId: number, value: string) => {
    try {
      await apiService.request(`/student-management/students/${studentId}/columns/${columnId}`, {
        method: 'PUT',
        body: JSON.stringify({ column_value: value })
      });
    } catch (error: any) {
      alert(error.message || 'Byanze kuvugurura agaciro');
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
            level_number: levelNumber,
            level_suffix: levelSuffix,
            column_name: c.column_name,
            column_type: c.column_type,
            is_required: c.is_required,
            default_value: c.default_value,
            display_order: (columns?.length || 0) + 1
          })
        });
      }
      await loadSheet();
    } catch (e: any) {
      alert(e?.message || 'Byanze kongeramo templates');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setColumnForm({
      column_name: '',
      column_type: 'text',
      is_required: false,
      default_value: '',
      display_order: 0
    });
  };

  const openEditModal = (column: any) => {
    setEditingColumn(column);
    setColumnForm({
      column_name: column.column_name,
      column_type: column.column_type,
      is_required: column.is_required,
      default_value: column.default_value || '',
      display_order: column.display_order
    });
    setShowColumnModal(true);
  };

  return (
    <div className="p-6 space-y-6">
      <Card className="border-2 border-green-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Columns className="w-6 h-6 text-green-600" />
            Gucunga Inkingi z'Imbonerahamwe
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Hitamo Umwuga</Label>
              <Select value={selectedTrade} onValueChange={setSelectedTrade}>
                <SelectTrigger>
                  <SelectValue placeholder="Hitamo umwuga..." />
                </SelectTrigger>
                <SelectContent>
                  {trades.map(trade => (
                    <SelectItem key={trade.code} value={trade.code}>
                      {trade.code} - {trade.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Hitamo Urwego</Label>
              <Select value={selectedLevelId} onValueChange={setSelectedLevelId} disabled={!selectedTrade}>
                <SelectTrigger>
                  <SelectValue placeholder="Hitamo urwego..." />
                </SelectTrigger>
                <SelectContent>
                  {availableLevels.map(level => (
                    <SelectItem key={level.id} value={level.id}>
                      {level.display}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedTrade && selectedLevel && (
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => setShowColumnModal(true)} className="bg-green-600">
                <Plus className="w-4 h-4 mr-2" />
                Ongeraho Inkingi Nshya
              </Button>
              <Button variant="outline" onClick={() => addTemplateColumns('finance')}>
                Ongeraho Finance (Paid/Unpaid/Balance)
              </Button>
              <Button variant="outline" onClick={() => addTemplateColumns('marks')}>
                Ongeraho Marks (Quiz/Mid/Final)
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {columns.length > 0 && (
        <Card className="border-2 border-blue-100">
          <CardHeader>
            <CardTitle>Inkingi Ziriho ({columns.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {columns.map((col, idx) => (
                <motion.div
                  key={col.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Badge className="bg-blue-100 text-blue-700">{col.column_type}</Badge>
                    <span className="font-semibold">{col.column_name}</span>
                    {col.is_required && <Badge className="bg-red-100 text-red-700">Ngombwa</Badge>}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => openEditModal(col)}>
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDeleteColumn(col.id)}>
                      <Trash2 className="w-3 h-3 text-red-600" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {students.length > 0 && columns.length > 0 && (
        <Card className="border-2 border-purple-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Table className="w-6 h-6 text-purple-600" />
              Imbonerahamwe y'Abanyeshuri
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2">
                    <th className="text-left p-3 bg-gray-50">Amazina</th>
                    <th className="text-left p-3 bg-gray-50">Kode</th>
                    {columns.map(col => (
                      <th key={col.id} className="text-left p-3 bg-gray-50">{col.column_name}</th>
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
                      className="border-b hover:bg-green-50"
                    >
                      <td className="p-3">{student.first_name} {student.last_name}</td>
                      <td className="p-3 text-sm text-gray-600">{student.student_id}</td>
                      {columns.map(col => (
                        <td key={col.id} className="p-3">
                          <Input
                            type={col.column_type === 'number' ? 'number' : col.column_type === 'date' ? 'date' : 'text'}
                            defaultValue={student.custom_values?.[col.id] || col.default_value || ''}
                            onBlur={(e) => handleUpdateValue(student.id, col.id, e.target.value)}
                            className="w-full"
                          />
                        </td>
                      ))}
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={showColumnModal} onOpenChange={setShowColumnModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingColumn ? 'Hindura Inkingi' : 'Ongeraho Inkingi Nshya'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Izina ry'Inkingi</Label>
              <Input
                value={columnForm.column_name}
                onChange={(e) => setColumnForm({ ...columnForm, column_name: e.target.value })}
                placeholder="Urugero: Amanota, Imyitwarire..."
              />
            </div>
            <div>
              <Label>Ubwoko bw'Inkingi</Label>
              <Select value={columnForm.column_type} onValueChange={(v) => setColumnForm({ ...columnForm, column_type: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Inyandiko</SelectItem>
                  <SelectItem value="number">Umubare</SelectItem>
                  <SelectItem value="date">Itariki</SelectItem>
                  <SelectItem value="currency">Amafaranga</SelectItem>
                  <SelectItem value="percentage">Ijanisha</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Agaciro ka Mburabuzi</Label>
              <Input
                value={columnForm.default_value}
                onChange={(e) => setColumnForm({ ...columnForm, default_value: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={columnForm.is_required}
                onChange={(e) => setColumnForm({ ...columnForm, is_required: e.target.checked })}
              />
              <Label>Inkingi ngombwa</Label>
            </div>
            <div className="flex gap-2">
              <Button onClick={editingColumn ? handleUpdateColumn : handleCreateColumn} disabled={loading} className="flex-1 bg-green-600">
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Birimo kubikwa...' : 'Bika'}
              </Button>
              <Button onClick={() => { setShowColumnModal(false); setEditingColumn(null); resetForm(); }} variant="outline">
                <X className="w-4 h-4 mr-2" />
                Bika
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
