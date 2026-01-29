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

export default function AccountantDynamicColumns() {
  const [trades, setTrades] = useState<any[]>([]);
  const [levels, setLevels] = useState<any[]>([]);
  const [selectedTrade, setSelectedTrade] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [columns, setColumns] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [showColumnModal, setShowColumnModal] = useState(false);
  const [editingColumn, setEditingColumn] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const [columnForm, setColumnForm] = useState({
    column_name: '',
    column_type: 'text',
    is_required: false,
    default_value: '',
    display_order: 0
  });

  useEffect(() => {
    loadTrades();
    loadLevels();
  }, []);

  useEffect(() => {
    if (selectedTrade && selectedLevel) {
      loadColumns();
      loadStudents();
    }
  }, [selectedTrade, selectedLevel]);

  const loadTrades = async () => {
    try {
      const data = await apiService.getTrades();
      setTrades(data);
    } catch (error) {
      console.error('Error loading trades:', error);
    }
  };

  const loadLevels = async () => {
    try {
      const data = await apiService.getLevels();
      setLevels(data);
    } catch (error) {
      console.error('Error loading levels:', error);
    }
  };

  const loadColumns = async () => {
    try {
      const data = await apiService.getLevelSheetColumns(parseInt(selectedTrade), parseInt(selectedLevel));
      setColumns(data);
    } catch (error) {
      console.error('Error loading columns:', error);
    }
  };

  const loadStudents = async () => {
    try {
      const data = await apiService.getStudentsByTradeLevel(parseInt(selectedTrade), parseInt(selectedLevel));
      setStudents(data.students || []);
    } catch (error) {
      console.error('Error loading students:', error);
    }
  };

  const handleCreateColumn = async () => {
    setLoading(true);
    try {
      await apiService.createLevelSheetColumn({
        ...columnForm,
        trade_id: parseInt(selectedTrade),
        level_id: parseInt(selectedLevel)
      });
      setShowColumnModal(false);
      resetForm();
      loadColumns();
      loadStudents();
    } catch (error: any) {
      alert(error.message || 'Byanze gukora inkingi');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateColumn = async () => {
    setLoading(true);
    try {
      await apiService.updateLevelSheetColumn(editingColumn.id, columnForm);
      setShowColumnModal(false);
      setEditingColumn(null);
      resetForm();
      loadColumns();
    } catch (error: any) {
      alert(error.message || 'Byanze kuvugurura inkingi');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteColumn = async (columnId: number) => {
    if (!confirm('Urashaka gusiba iyi nkingi?')) return;
    try {
      await apiService.deleteLevelSheetColumn(columnId);
      loadColumns();
      loadStudents();
    } catch (error: any) {
      alert(error.message || 'Byanze gusiba inkingi');
    }
  };

  const handleUpdateValue = async (studentId: number, columnId: number, value: string) => {
    try {
      await apiService.updateStudentColumnValue(studentId, columnId, value);
    } catch (error: any) {
      alert(error.message || 'Byanze kuvugurura agaciro');
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
                    <SelectItem key={trade.id} value={trade.id.toString()}>
                      {trade.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Hitamo Urwego</Label>
              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Hitamo urwego..." />
                </SelectTrigger>
                <SelectContent>
                  {levels.map(level => (
                    <SelectItem key={level.id} value={level.id.toString()}>
                      Urwego {level.level_number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedTrade && selectedLevel && (
            <Button onClick={() => setShowColumnModal(true)} className="bg-green-600">
              <Plus className="w-4 h-4 mr-2" />
              Ongeraho Inkingi Nshya
            </Button>
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
