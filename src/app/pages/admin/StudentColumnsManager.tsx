import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, Search, Filter, Download, Upload,
  Columns, Eye, EyeOff, GripVertical, Save, X, CheckCircle, XCircle, ArrowUp, ArrowDown
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Switch } from '@/app/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';

interface StudentColumn {
  id: number;
  key: string;
  label: string;
  label_rw: string;
  type: string;
  width: number;
  visible: boolean;
  sortable: boolean;
  filterable: boolean;
  required: boolean;
  order: number;
}

const defaultColumns: StudentColumn[] = [
  { id: 1, key: 'student_id', label: 'Student ID', label_rw: 'ID y\'Umunyeshuri', type: 'text', width: 120, visible: true, sortable: true, filterable: true, required: true, order: 1 },
  { id: 2, key: 'first_name', label: 'First Name', label_rw: 'Izina ribanza', type: 'text', width: 150, visible: true, sortable: true, filterable: true, required: true, order: 2 },
  { id: 3, key: 'last_name', label: 'Last Name', label_rw: 'Izina rikurikira', type: 'text', width: 150, visible: true, sortable: true, filterable: true, required: true, order: 3 },
  { id: 4, key: 'gender', label: 'Gender', label_rw: 'Igitsina', type: 'select', width: 100, visible: true, sortable: true, filterable: true, required: true, order: 4 },
  { id: 5, key: 'level', label: 'Level', label_rw: 'Ibice', type: 'select', width: 100, visible: true, sortable: true, filterable: true, required: true, order: 5 },
  { id: 6, key: 'trade', label: 'Trade', label_rw: 'Ishami', type: 'select', width: 150, visible: true, sortable: true, filterable: true, required: true, order: 6 },
  { id: 7, key: 'status', label: 'Status', label_rw: 'Statusi', type: 'select', width: 100, visible: true, sortable: true, filterable: true, required: false, order: 7 },
  { id: 8, key: 'total_fees', label: 'Total Fees', label_rw: 'Amafaranga yose', type: 'number', width: 120, visible: true, sortable: true, filterable: false, required: false, order: 8 },
  { id: 9, key: 'total_paid', label: 'Total Paid', label_rw: 'Amafaranga yishyuwe', type: 'number', width: 120, visible: true, sortable: true, filterable: false, required: false, order: 9 },
  { id: 10, key: 'balance', label: 'Balance', label_rw: 'Ibyishyuriwe', type: 'number', width: 120, visible: true, sortable: true, filterable: false, required: false, order: 10 },
  { id: 11, key: 'payment_status', label: 'Payment Status', label_rw: 'Statusi yo kwishyura', type: 'select', width: 130, visible: true, sortable: true, filterable: true, required: false, order: 11 },
  { id: 12, key: 'parent_name', label: 'Parent Name', label_rw: 'Izina r\'Umubyeyi', type: 'text', width: 180, visible: false, sortable: true, filterable: true, required: false, order: 12 },
  { id: 13, key: 'parent_phone', label: 'Parent Phone', label_rw: 'Telefone y\'Umubyeyi', type: 'text', width: 150, visible: false, sortable: false, filterable: true, required: false, order: 13 },
  { id: 14, key: 'email', label: 'Email', label_rw: 'Imeyili', type: 'email', width: 200, visible: false, sortable: true, filterable: true, required: false, order: 14 },
  { id: 15, key: 'address', label: 'Address', label_rw: 'Aderesi', type: 'text', width: 200, visible: false, sortable: false, filterable: true, required: false, order: 15 },
];

const StudentColumnsManager: React.FC = () => {
  const [columns, setColumns] = useState<StudentColumn[]>(defaultColumns);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingColumn, setEditingColumn] = useState<StudentColumn | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    // Load saved columns from localStorage
    const saved = localStorage.getItem('student_columns');
    if (saved) {
      try {
        setColumns(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading saved columns:', e);
      }
    }
  }, []);

  const filteredColumns = columns.filter(col => 
    col.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    col.key.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const visibleColumns = filteredColumns.filter(c => c.visible);
  const hiddenColumns = filteredColumns.filter(c => !c.visible);
  const customColumns = filteredColumns.filter(c => c.id > 11);

  const handleSave = () => {
    localStorage.setItem('student_columns', JSON.stringify(columns));
    setHasChanges(false);
    alert('Columns saved successfully!');
  };

  const handleReset = () => {
    if (confirm('Reset all columns to default?')) {
      setColumns(defaultColumns);
      localStorage.removeItem('student_columns');
      setHasChanges(false);
    }
  };

  const toggleVisibility = (id: number) => {
    setColumns(cols => cols.map(c => c.id === id ? { ...c, visible: !c.visible } : c));
    setHasChanges(true);
  };

  const moveColumn = (id: number, direction: 'up' | 'down') => {
    const index = columns.findIndex(c => c.id === id);
    if (direction === 'up' && index > 0) {
      const newCols = [...columns];
      [newCols[index - 1], newCols[index]] = [newCols[index], newCols[index - 1]];
      newCols.forEach((c, i) => c.order = i + 1);
      setColumns(newCols);
      setHasChanges(true);
    } else if (direction === 'down' && index < columns.length - 1) {
      const newCols = [...columns];
      [newCols[index], newCols[index + 1]] = [newCols[index + 1], newCols[index]];
      newCols.forEach((c, i) => c.order = i + 1);
      setColumns(newCols);
      setHasChanges(true);
    }
  };

  const handleSaveColumn = (column: Partial<StudentColumn>) => {
    if (editingColumn) {
      setColumns(cols => cols.map(c => c.id === editingColumn.id ? { ...c, ...column } : c));
    } else {
      const newColumn: StudentColumn = {
        id: Date.now(),
        key: column.key || 'custom_' + Date.now(),
        label: column.label || 'New Column',
        label_rw: column.label_rw || '',
        type: column.type || 'text',
        width: column.width || 150,
        visible: true,
        sortable: true,
        filterable: true,
        required: false,
        order: columns.length + 1
      };
      setColumns(cols => [...cols, newColumn]);
    }
    setShowModal(false);
    setEditingColumn(null);
    setHasChanges(true);
  };

  const handleDeleteColumn = (id: number) => {
    if (confirm('Are you sure you want to delete this column?')) {
      setColumns(cols => cols.filter(c => c.id !== id));
      setHasChanges(true);
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-green-50 via-white to-teal-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Student Columns Manager</h1>
          <p className="text-gray-600">Customize which columns to show in student sheets</p>
        </div>
        <div className="flex gap-2">
          {hasChanges && (
            <>
              <Button variant="outline" onClick={handleReset}>
                <X className="w-4 h-4 mr-2" />
                Reset
              </Button>
              <Button onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </>
          )}
          <Button onClick={() => { setEditingColumn(null); setShowModal(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            Add Column
          </Button>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Search columns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-white rounded-xl shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Columns</p>
                <p className="text-2xl font-bold">{columns.length}</p>
              </div>
              <Columns className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white rounded-xl shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Visible</p>
                <p className="text-2xl font-bold text-green-600">{visibleColumns.length}</p>
              </div>
              <Eye className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white rounded-xl shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Hidden</p>
                <p className="text-2xl font-bold text-gray-600">{hiddenColumns.length}</p>
              </div>
              <EyeOff className="w-8 h-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white rounded-xl shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Custom</p>
                <p className="text-2xl font-bold text-purple-600">{customColumns.length}</p>
              </div>
              <Plus className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white rounded-xl shadow-sm">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full justify-start border-b rounded-none bg-transparent h-12 px-4">
            <TabsTrigger value="all" className="data-[state=active]:bg-green-100">All ({filteredColumns.length})</TabsTrigger>
            <TabsTrigger value="visible" className="data-[state=active]:bg-green-100">Visible ({visibleColumns.length})</TabsTrigger>
            <TabsTrigger value="hidden" className="data-[state=active]:bg-gray-100">Hidden ({hiddenColumns.length})</TabsTrigger>
            <TabsTrigger value="custom" className="data-[state=active]:bg-purple-100">Custom ({customColumns.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="m-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-16">Order</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Key</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Label (EN)</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Label (RW)</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-24">Width</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-24">Visible</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-24">Sort</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-24">Filter</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-24">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {(activeTab === 'all' ? filteredColumns : 
                    activeTab === 'visible' ? visibleColumns : 
                    activeTab === 'hidden' ? hiddenColumns : 
                    customColumns).map((col) => (
                    <tr key={col.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" onClick={() => moveColumn(col.id, 'up')}>
                            <ArrowUp className="w-3 h-3" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => moveColumn(col.id, 'down')}>
                            <ArrowDown className="w-3 h-3" />
                          </Button>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">{col.key}</code>
                      </td>
                      <td className="px-4 py-3 font-medium">{col.label}</td>
                      <td className="px-4 py-3 text-gray-600">{col.label_rw || '-'}</td>
                      <td className="px-4 py-3">
                        <Badge variant="outline">{col.type}</Badge>
                      </td>
                      <td className="px-4 py-3">{col.width}px</td>
                      <td className="px-4 py-3">
                        <Switch checked={col.visible} onCheckedChange={() => toggleVisibility(col.id)} />
                      </td>
                      <td className="px-4 py-3">
                        {col.sortable ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-gray-300" />}
                      </td>
                      <td className="px-4 py-3">
                        {col.filterable ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-gray-300" />}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => { setEditingColumn(col); setShowModal(true); }}>
                            <Edit className="w-3 h-3" />
                          </Button>
                          {col.id > 11 && (
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteColumn(col.id)}>
                              <Trash2 className="w-3 h-3 text-red-500" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Modal for Add/Edit Column */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{editingColumn ? 'Edit Column' : 'Add New Column'}</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleSaveColumn({
                key: formData.get('key') as string,
                label: formData.get('label') as string,
                label_rw: formData.get('label_rw') as string,
                type: formData.get('type') as string,
                width: parseInt(formData.get('width') as string) || 150
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Column Key</label>
                  <Input name="key" defaultValue={editingColumn?.key} required placeholder="e.g., custom_field" disabled={!!editingColumn} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Label (English)</label>
                  <Input name="label" defaultValue={editingColumn?.label} required placeholder="e.g., Custom Field" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Label (Kinyarwanda)</label>
                  <Input name="label_rw" defaultValue={editingColumn?.label_rw} placeholder="e.g., Ikihegerezo" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Data Type</label>
                  <select name="type" defaultValue={editingColumn?.type || 'text'} className="w-full p-2 border rounded">
                    <option value="text">Text</option>
                    <option value="number">Number</option>
                    <option value="date">Date</option>
                    <option value="select">Select</option>
                    <option value="email">Email</option>
                    <option value="phone">Phone</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Width (px)</label>
                  <Input name="width" type="number" defaultValue={editingColumn?.width || 150} min="50" max="500" />
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  {editingColumn ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentColumnsManager;
