import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Settings,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Search,
  Server,
  Database,
  Mail,
  Shield,
  Bell,
  Layout,
  Globe,
  Key
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Badge } from '@/app/components/ui/badge';

const API_BASE = 'http://localhost:5000/api';

interface SystemSetting {
  id: number;
  key: string;
  value: string;
  description: string;
  category: string;
  data_type: string;
  is_editable: boolean;
  updated_at: string;
}

const SystemSettingsManagement: React.FC = () => {
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSetting, setEditingSetting] = useState<SystemSetting | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  
  const [formData, setFormData] = useState({
    key: '',
    value: '',
    description: '',
    category: 'general',
    data_type: 'string',
    is_editable: true
  });

  const categories = ['general', 'email', 'sms', 'security', 'appearance', 'academic', 'financial', 'system'];
  const dataTypes = ['string', 'number', 'boolean', 'json', 'url', 'email'];

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/system-settings`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setSettings(data.data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const token = localStorage.getItem('token');
    const url = editingSetting
      ? `${API_BASE}/system-settings/${editingSetting.id}`
      : `${API_BASE}/system-settings`;
    
    const method = editingSetting ? 'PUT' : 'POST';
    
    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        fetchSettings();
        setShowModal(false);
        resetForm();
      }
    } catch (error) {
      console.error('Error saving setting:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this setting?')) return;
    
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_BASE}/system-settings/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        fetchSettings();
      }
    } catch (error) {
      console.error('Error deleting setting:', error);
    }
  };

  const handleEdit = (setting: SystemSetting) => {
    setEditingSetting(setting);
    setFormData({
      key: setting.key,
      value: setting.value,
      description: setting.description,
      category: setting.category,
      data_type: setting.data_type,
      is_editable: setting.is_editable
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      key: '',
      value: '',
      description: '',
      category: 'general',
      data_type: 'string',
      is_editable: true
    });
    setEditingSetting(null);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'email': return <Mail className="w-5 h-5" />;
      case 'sms': return <Bell className="w-5 h-5" />;
      case 'security': return <Shield className="w-5 h-5" />;
      case 'appearance': return <Layout className="w-5 h-5" />;
      case 'system': return <Server className="w-5 h-5" />;
      case 'academic': return <Database className="w-5 h-5" />;
      case 'financial': return <Key className="w-5 h-5" />;
      default: return <Globe className="w-5 h-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'email': return 'bg-blue-100 text-blue-800';
      case 'sms': return 'bg-purple-100 text-purple-800';
      case 'security': return 'bg-red-100 text-red-800';
      case 'appearance': return 'bg-pink-100 text-pink-800';
      case 'system': return 'bg-gray-100 text-gray-800';
      case 'academic': return 'bg-green-100 text-green-800';
      case 'financial': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-indigo-100 text-indigo-800';
    }
  };

  const filteredSettings = settings.filter(setting => {
    const matchesSearch = setting.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          setting.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          setting.value?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || setting.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  const settingsByCategory = categories.reduce((acc, category) => {
    acc[category] = filteredSettings.filter(s => s.category === category);
    return acc;
  }, {} as Record<string, SystemSetting[]>);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-zinc-50 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Settings className="w-10 h-10 text-gray-700" />
            System Settings Management
          </h1>
          <p className="text-gray-600">Configure system-wide settings and parameters</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Settings</p>
                  <p className="text-2xl font-bold text-gray-900">{settings.length}</p>
                </div>
                <Settings className="w-8 h-8 text-gray-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Categories</p>
                  <p className="text-2xl font-bold text-blue-600">{categories.length}</p>
                </div>
                <Database className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Editable</p>
                  <p className="text-2xl font-bold text-green-600">
                    {settings.filter(s => s.is_editable).length}
                  </p>
                </div>
                <Edit className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Protected</p>
                  <p className="text-2xl font-bold text-red-600">
                    {settings.filter(s => !s.is_editable).length}
                  </p>
                </div>
                <Shield className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search settings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                onClick={() => {
                  resetForm();
                  setShowModal(true);
                }}
                className="bg-gray-800 hover:bg-gray-900"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Setting
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Settings by Category */}
        <div className="space-y-6">
          {categories.map(category => {
            const categorySettings = settingsByCategory[category];
            if (categorySettings.length === 0) return null;

            return (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {getCategoryIcon(category)}
                      {category.charAt(0).toUpperCase() + category.slice(1)} Settings
                      <Badge variant="secondary">{categorySettings.length}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {categorySettings.map((setting) => (
                        <div
                          key={setting.id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium text-gray-900">{setting.key}</p>
                              <Badge className={getCategoryColor(setting.category)}>
                                {setting.data_type}
                              </Badge>
                              {!setting.is_editable && (
                                <Badge variant="outline" className="text-red-600 border-red-600">
                                  <Shield className="w-3 h-3 mr-1" />
                                  Protected
                                </Badge>
                              )}
                            </div>
                            {setting.description && (
                              <p className="text-sm text-gray-600 mb-1">{setting.description}</p>
                            )}
                            <p className="text-sm font-mono text-gray-800 bg-white px-2 py-1 rounded inline-block">
                              {setting.value}
                            </p>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(setting)}
                              disabled={!setting.is_editable}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(setting.id)}
                              disabled={!setting.is_editable}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {filteredSettings.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Settings className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No settings found</h3>
              <p className="text-gray-500 mb-4">Create your first setting to get started</p>
              <Button
                onClick={() => {
                  resetForm();
                  setShowModal(true);
                }}
                className="bg-gray-800 hover:bg-gray-900"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Setting
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Add/Edit Modal */}
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingSetting ? 'Edit Setting' : 'Create New Setting'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="key">Setting Key *</Label>
                <Input
                  id="key"
                  value={formData.key}
                  onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                  placeholder="e.g., SCHOOL_NAME, MAX_STUDENTS"
                  required
                  disabled={!!editingSetting}
                />
              </div>

              <div>
                <Label htmlFor="value">Value *</Label>
                <Input
                  id="value"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  placeholder="Enter setting value"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter setting description"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="data_type">Data Type *</Label>
                  <Select
                    value={formData.data_type}
                    onValueChange={(value) => setFormData({ ...formData, data_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select data type" />
                    </SelectTrigger>
                    <SelectContent>
                      {dataTypes.map(type => (
                        <SelectItem key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="is_editable">Editable</Label>
                <input
                  type="checkbox"
                  id="is_editable"
                  checked={formData.is_editable}
                  onChange={(e) => setFormData({ ...formData, is_editable: e.target.checked })}
                  className="h-4 w-4"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1 bg-gray-800 hover:bg-gray-900">
                  <Save className="mr-2 h-4 w-4" />
                  {editingSetting ? 'Update' : 'Create'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1"
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default SystemSettingsManagement;
