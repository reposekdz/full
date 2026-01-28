import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users, TrendingUp, Award, Target, BarChart3, PieChart, Calendar,
  Plus, Edit, Trash2, Eye, Download, Upload, RefreshCw, Filter, Search,
  Star, CheckCircle, AlertCircle, Activity, Zap, Trophy, BookOpen,
  Calculator, DollarSign, Package, GraduationCap, Shield, Briefcase
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Label } from '@/app/components/ui/label';
import { Progress } from '@/app/components/ui/progress';

const API_BASE = 'http://localhost:5000/api';

interface StaffDynamicSheetsDashboardProps {
  userRole: string;
  userId: number;
}

const StaffDynamicSheetsDashboard: React.FC<StaffDynamicSheetsDashboardProps> = ({ userRole, userId }) => {
  const [staffSheets, setStaffSheets] = useState<any[]>([]);
  const [columns, setColumns] = useState<any[]>([]);
  const [selectedRole, setSelectedRole] = useState('teacher');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showAddColumnDialog, setShowAddColumnDialog] = useState(false);
  const [selectedSheet, setSelectedSheet] = useState<any>(null);
  const [editData, setEditData] = useState<any>({});

  useEffect(() => {
    fetchRoleColumns();
    fetchStaffSheets();
  }, [selectedRole]);

  const fetchRoleColumns = async () => {
    try {
      const response = await fetch(`${API_BASE}/staff-dynamic-sheets/role-columns/${selectedRole}`);
      const data = await response.json();
      if (data.success) {
        setColumns(data.columns || []);
      }
    } catch (error) {
      console.error('Error fetching columns:', error);
    }
  };

  const fetchStaffSheets = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/staff-dynamic-sheets/sheets/${selectedRole}`);
      const data = await response.json();
      if (data.success) {
        setStaffSheets(data.sheets || []);
      }
    } catch (error) {
      console.error('Error fetching staff sheets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSheet = async () => {
    try {
      const response = await fetch(`${API_BASE}/staff-dynamic-sheets/sheets/${selectedSheet.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: editData
        })
      });
      const result = await response.json();
      if (result.success) {
        fetchStaffSheets();
        setShowEditDialog(false);
        alert('Sheet updated successfully!');
      }
    } catch (error) {
      console.error('Error updating sheet:', error);
    }
  };

  const handleRecalculate = async (sheetId: number) => {
    try {
      const response = await fetch(`${API_BASE}/staff-dynamic-sheets/sheets/${sheetId}/recalculate`, {
        method: 'POST'
      });
      const data = await response.json();
      if (data.success) {
        fetchStaffSheets();
        alert('Sheet recalculated successfully!');
      }
    } catch (error) {
      console.error('Error recalculating:', error);
    }
  };

  const openEditDialog = (sheet: any) => {
    setSelectedSheet(sheet);
    try {
      setEditData(typeof sheet.data === 'string' ? JSON.parse(sheet.data) : sheet.data || {});
    } catch (e) {
      setEditData({});
    }
    setShowEditDialog(true);
  };

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

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'teacher': return GraduationCap;
      case 'headmaster': return Star;
      case 'director_study': return BookOpen;
      case 'director_discipline': return Shield;
      case 'advisor': return Users;
      case 'accountant': return DollarSign;
      case 'stock_manager': return Package;
      default: return Users;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'teacher': return 'from-green-500 to-green-600';
      case 'headmaster': return 'from-purple-500 to-purple-600';
      case 'director_study': return 'from-yellow-500 to-yellow-600';
      case 'director_discipline': return 'from-red-500 to-red-600';
      case 'advisor': return 'from-indigo-500 to-indigo-600';
      case 'accountant': return 'from-emerald-500 to-emerald-600';
      case 'stock_manager': return 'from-cyan-500 to-cyan-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const calculateAveragePerformance = () => {
    if (staffSheets.length === 0) return 0;
    const performanceColumns = columns.filter(col => 
      col.name.includes('performance') || col.name.includes('effectiveness') || col.name.includes('rating')
    );
    
    let totalPerformance = 0;
    let count = 0;
    
    staffSheets.forEach(sheet => {
      try {
        const data = typeof sheet.data === 'string' ? JSON.parse(sheet.data) : sheet.data || {};
        performanceColumns.forEach(col => {
          const value = parseFloat(data[col.name]);
          if (!isNaN(value)) {
            totalPerformance += value;
            count++;
          }
        });
      } catch (e) {}
    });
    
    return count > 0 ? (totalPerformance / count).toFixed(1) : 0;
  };

  const stats = [
    { title: 'Total Staff', value: staffSheets.length, icon: Users, color: 'from-blue-500 to-blue-600', subtitle: `${selectedRole} role` },
    { title: 'Avg Performance', value: calculateAveragePerformance(), icon: TrendingUp, color: 'from-green-500 to-green-600', subtitle: 'Out of 10' },
    { title: 'Data Columns', value: columns.length, icon: BarChart3, color: 'from-purple-500 to-purple-600', subtitle: 'Tracked metrics' },
    { title: 'Top Performers', value: Math.ceil(staffSheets.length * 0.2), icon: Trophy, color: 'from-yellow-500 to-yellow-600', subtitle: 'Top 20%' }
  ];

  const filteredSheets = staffSheets.filter(sheet => 
    sheet.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sheet.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sheet.user_id?.toString().includes(searchQuery)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-green-50 p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-green-600 to-yellow-600 bg-clip-text text-transparent">
              Staff Performance Tracking
            </h1>
            <p className="text-gray-600 mt-2">Dynamic sheets for staff performance and metrics</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => {
                fetchRoleColumns();
                fetchStaffSheets();
              }}
              disabled={loading}
              className="bg-gradient-to-r from-green-600 to-yellow-600 hover:from-green-700 hover:to-yellow-700"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              onClick={() => setShowAddColumnDialog(true)}
              className="bg-gradient-to-r from-yellow-600 to-green-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Column
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>
      </motion.div>

      <Card className="border-none shadow-xl mb-6">
        <CardHeader className="bg-gradient-to-r from-green-50 to-yellow-50">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardTitle className="flex items-center gap-2 font-black">
              <BarChart3 className="w-6 h-6 text-green-600" />
              Staff Role Selection
            </CardTitle>
            <div className="flex gap-3">
              <Input
                placeholder="Search staff..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64"
              />
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="w-56">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="teacher">Teacher</SelectItem>
                  <SelectItem value="headmaster">Headmaster</SelectItem>
                  <SelectItem value="director_study">Director of Studies</SelectItem>
                  <SelectItem value="director_discipline">Director of Discipline</SelectItem>
                  <SelectItem value="advisor">Advisor</SelectItem>
                  <SelectItem value="accountant">Accountant</SelectItem>
                  <SelectItem value="stock_manager">Stock Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="border-none shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-50 to-yellow-50">
            <CardTitle className="flex items-center gap-2 font-black">
              <Target className="w-5 h-5 text-green-600" />
              Tracked Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {columns.map((column, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-3 bg-gradient-to-r from-white to-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-bold text-gray-800">
                      {column.name.replace(/_/g, ' ').toUpperCase()}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {column.type}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-none shadow-xl">
          <CardHeader className="bg-gradient-to-r from-green-50 to-yellow-50">
            <CardTitle className="flex items-center gap-2 font-black">
              <Users className="w-6 h-6 text-green-600" />
              Staff Performance Data
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {filteredSheets.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 font-bold">No staff records found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredSheets.map((sheet) => {
                  let sheetData = {};
                  try {
                    sheetData = typeof sheet.data === 'string' ? JSON.parse(sheet.data) : sheet.data || {};
                  } catch (e) {}

                  return (
                    <motion.div
                      key={sheet.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: 1.01 }}
                      className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg overflow-hidden border-2 border-gray-100"
                    >
                      <div className={`h-2 bg-gradient-to-r ${getRoleColor(selectedRole)}`} />
                      
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${getRoleColor(selectedRole)} flex items-center justify-center`}>
                              {React.createElement(getRoleIcon(selectedRole), { className: 'w-8 h-8 text-white' })}
                            </div>
                            <div>
                              <h3 className="text-xl font-black text-gray-800">
                                {sheet.first_name} {sheet.last_name}
                              </h3>
                              <p className="text-sm text-gray-600">
                                User ID: {sheet.user_id} • Role: {selectedRole}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => openEditDialog(sheet)}
                              size="sm"
                              className="bg-gradient-to-r from-green-600 to-green-700"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => handleRecalculate(sheet.id)}
                              size="sm"
                              className="bg-gradient-to-r from-yellow-600 to-yellow-700"
                            >
                              <Calculator className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {columns.filter(col => !col.calculated).slice(0, 6).map((column, idx) => {
                            const value = sheetData[column.name] || 0;
                            return (
                              <div key={idx} className="bg-white rounded-lg p-3 border border-gray-200">
                                <p className="text-xs text-gray-500 mb-1">
                                  {column.name.replace(/_/g, ' ').toUpperCase()}
                                </p>
                                <p className="text-lg font-black bg-gradient-to-r from-green-600 to-yellow-600 bg-clip-text text-transparent">
                                  {column.type === 'currency' && '$'}{value}{column.type === 'percentage' && '%'}
                                </p>
                              </div>
                            );
                          })}
                        </div>

                        {columns.filter(col => col.calculated).length > 0 && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <p className="text-xs font-bold text-gray-600 mb-3">CALCULATED METRICS</p>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                              {columns.filter(col => col.calculated).map((column, idx) => {
                                const value = sheetData[column.name] || 0;
                                return (
                                  <div key={idx} className="bg-gradient-to-r from-green-50 to-yellow-50 rounded-lg p-3 border-2 border-green-200">
                                    <p className="text-xs text-gray-700 mb-1 font-bold">
                                      {column.name.replace(/_/g, ' ').toUpperCase()}
                                    </p>
                                    <p className="text-xl font-black bg-gradient-to-r from-green-600 to-yellow-600 bg-clip-text text-transparent">
                                      {typeof value === 'number' ? value.toFixed(2) : value}{column.type === 'percentage' && '%'}
                                    </p>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black bg-gradient-to-r from-green-600 to-yellow-600 bg-clip-text text-transparent">
              Edit Staff Performance Data
            </DialogTitle>
            {selectedSheet && (
              <p className="text-gray-600">
                {selectedSheet.first_name} {selectedSheet.last_name}
              </p>
            )}
          </DialogHeader>
          <div className="space-y-4">
            {columns.filter(col => !col.calculated).map((column, index) => (
              <div key={index}>
                <Label>{column.name.replace(/_/g, ' ').toUpperCase()}</Label>
                <Input
                  type={column.type === 'number' || column.type === 'currency' || column.type === 'percentage' ? 'number' : 'text'}
                  value={editData[column.name] || ''}
                  onChange={(e) => setEditData({ ...editData, [column.name]: e.target.value })}
                  placeholder={`Enter ${column.name}`}
                />
              </div>
            ))}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleUpdateSheet}
                className="flex-1 bg-gradient-to-r from-green-600 to-yellow-600"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Update Data
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

      <Dialog open={showAddColumnDialog} onOpenChange={setShowAddColumnDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl font-black bg-gradient-to-r from-green-600 to-yellow-600 bg-clip-text text-transparent">
              Add Custom Column
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Column Name</Label>
              <Input placeholder="e.g., custom_metric" />
            </div>
            <div>
              <Label>Column Type</Label>
              <Select defaultValue="number">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="currency">Currency</SelectItem>
                  <SelectItem value="text">Text</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3 pt-4">
              <Button className="flex-1 bg-gradient-to-r from-green-600 to-yellow-600">
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

export default StaffDynamicSheetsDashboard;
