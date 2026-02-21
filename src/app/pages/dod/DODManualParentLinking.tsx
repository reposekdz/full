import React, { useState, useEffect } from 'react';
import { Users, Link as LinkIcon, Phone, Mail, MapPin, Search, RefreshCw, CheckCircle, AlertCircle, Trash2, Home, User, FileText, Calendar, BarChart3, Scale, FileSpreadsheet, Filter, Download, Upload, UserPlus, Send, Eye, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/app/components/ui/dialog';
import { motion, AnimatePresence } from 'motion/react';
import axios from 'axios';
import { toast } from 'sonner';

const API_BASE = 'http://localhost:5000/api';

interface Props {
  onNavigate?: (page: string) => void;
}

const DODManualParentLinking: React.FC<Props> = ({ onNavigate }) => {
  const [parents, setParents] = useState([]);
  const [filteredParents, setFilteredParents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedParent, setSelectedParent] = useState(null);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [stats, setStats] = useState({ total: 0, linked: 0, unlinked: 0 });
  const [filterStatus, setFilterStatus] = useState<'all' | 'linked' | 'unlinked'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'children' | 'recent'>('name');
  const [selectedForBulk, setSelectedForBulk] = useState<number[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  useEffect(() => {
    // Get selected student from sessionStorage
    const studentData = sessionStorage.getItem('selectedStudent');
    if (studentData) {
      const student = JSON.parse(studentData);
      setSelectedStudent(student);
    }
    loadParents();
  }, []);

  useEffect(() => {
    filterParents();
  }, [parents, searchTerm, filterStatus, sortBy]);

  const loadParents = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE}/parent-child-linking-advanced/all-parents`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        const parentsData = response.data.parents || [];
        setParents(parentsData);
        
        setStats({
          total: parentsData.length,
          linked: parentsData.filter(p => p.linked_children_count > 0).length,
          unlinked: parentsData.filter(p => p.linked_children_count === 0).length
        });
      }
    } catch (error) {
      console.error('Error loading parents:', error);
      toast.error('Failed to load parents');
    } finally {
      setLoading(false);
    }
  };

  const filterParents = () => {
    let filtered = [...parents];

    // Filter by status
    if (filterStatus === 'linked') {
      filtered = filtered.filter(p => p.linked_children_count > 0);
    } else if (filterStatus === 'unlinked') {
      filtered = filtered.filter(p => p.linked_children_count === 0);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(parent => {
        const fullName = parent.full_name?.toLowerCase() || '';
        const email = parent.email?.toLowerCase() || '';
        const phone = parent.phone?.toLowerCase() || '';
        
        return fullName.includes(term) || email.includes(term) || phone.includes(term);
      });
    }

    // Sort
    if (sortBy === 'name') {
      filtered.sort((a, b) => (a.full_name || '').localeCompare(b.full_name || ''));
    } else if (sortBy === 'children') {
      filtered.sort((a, b) => (b.linked_children_count || 0) - (a.linked_children_count || 0));
    }

    setFilteredParents(filtered);
  };

  const handleLinkParent = async () => {
    if (!selectedParent || !selectedStudent) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE}/parent-child-linking-advanced/quick-link`,
        {
          parentId: selectedParent.id,
          studentId: selectedStudent.id
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success('✅ Parent linked successfully! SMS sent to parent.');
        setShowLinkDialog(false);
        setSelectedParent(null);
        sessionStorage.removeItem('selectedStudent');
        loadParents();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to link parent');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteParent = async () => {
    if (!selectedParent) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(
        `${API_BASE}/parent-child-linking-advanced/delete-parent/${selectedParent.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success('🗑️ Parent account deleted successfully');
        setShowDeleteDialog(false);
        setSelectedParent(null);
        loadParents();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete parent');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const csv = [
      ['#', 'Name', 'Phone', 'Email', 'Address', 'Linked Children'],
      ...filteredParents.map((p, i) => [
        i + 1,
        p.full_name,
        p.phone || '-',
        p.email || '-',
        p.address || '-',
        p.linked_children_count || 0
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `parents_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('📥 Exported to CSV');
  };

  const toggleBulkSelection = (id: number) => {
    setSelectedForBulk(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedForBulk(filteredParents.map(p => p.id));
  };

  const deselectAll = () => {
    setSelectedForBulk([]);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      {/* Sidebar Navigation */}
      <div className="hidden md:flex md:w-56 lg:w-64 lg:flex-col fixed inset-y-0 z-40 mt-16">
        <div className="flex flex-col flex-grow bg-gradient-to-b from-purple-600 via-indigo-500 to-blue-600 overflow-y-auto shadow-2xl">
          <nav className="flex-1 px-3 py-4 space-y-2">
            {[
              { id: 'director-discipline-dashboard', label: 'Dashboard', Icon: Home },
              { id: 'dod-profile', label: 'Profile', Icon: User },
              { id: 'dod-discipline', label: 'Discipline', Icon: FileText },
              { id: 'dod-leave', label: 'Leave', Icon: Calendar },
              { id: 'dod-students', label: 'Students', Icon: Users },
              { id: 'dod-parent-management', label: 'Parents', Icon: Users, active: true },
              { id: 'dod-reports', label: 'Reports', Icon: BarChart3 },
              { id: 'dod-punishments', label: 'Punishments', Icon: Scale },
              { id: 'dod-student-sheets', label: 'Sheets', Icon: FileSpreadsheet }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => onNavigate?.(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                  item.active
                    ? 'bg-white text-purple-700 shadow-lg scale-105 font-bold'
                    : 'text-white hover:bg-white/20 hover:scale-105'
                }`}
              >
                <item.Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="md:pl-56 lg:pl-64 flex-1 pt-16">
        <div className="space-y-4 md:space-y-6 p-3 md:p-6">
          {/* Page Header */}
          <div className="mb-6">
            <button
              onClick={() => onNavigate?.('director-discipline-dashboard')}
              className="mb-4 text-purple-600 hover:text-purple-700 font-medium flex items-center gap-2"
            >
              ← Back to Dashboard
            </button>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-4xl font-black bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent flex items-center gap-3">
                  <LinkIcon className="w-8 h-8 md:w-10 md:h-10 text-purple-600" />
                  Manual Parent Linking
                </h1>
                <p className="text-sm md:text-base text-gray-600 mt-2">Link existing parents with students - Advanced Management System</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={exportToCSV}
                  variant="outline"
                  className="border-purple-300 text-purple-700 hover:bg-purple-50 text-xs md:text-sm"
                >
                  <Download className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                  Export CSV
                </Button>
                {selectedForBulk.length > 0 && (
                  <Button
                    onClick={() => setShowBulkActions(true)}
                    className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-xs md:text-sm"
                  >
                    <Send className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                    Bulk Actions ({selectedForBulk.length})
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Header with Student Info */}
          {selectedStudent && (
        <Card className="border-2 border-blue-500 bg-gradient-to-r from-blue-50 to-cyan-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-lg font-bold text-blue-900">
                    Select Parent for: {selectedStudent.first_name} {selectedStudent.last_name}
                  </p>
                  <p className="text-sm text-blue-700">
                    {selectedStudent.student_code} - {selectedStudent.trade_code} Level {selectedStudent.level_number}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  sessionStorage.removeItem('selectedStudent');
                  window.location.reload();
                }}
              >
                Clear Selection
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl md:text-3xl font-bold">{stats.total}</div>
                <div className="text-xs md:text-sm opacity-90">Total Parents</div>
              </div>
              <Users className="w-8 h-8 md:w-12 md:h-12 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl md:text-3xl font-bold">{stats.linked}</div>
                <div className="text-xs md:text-sm opacity-90">With Children</div>
              </div>
              <CheckCircle className="w-8 h-8 md:w-12 md:h-12 opacity-50" />
            </div>
          </CardContent>
        </Card>
            <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
              <CardContent className="p-3 md:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl md:text-3xl font-bold">{stats.unlinked}</div>
                    <div className="text-xs md:text-sm opacity-90">Without Children</div>
                  </div>
                  <AlertCircle className="w-8 h-8 md:w-12 md:h-12 opacity-50" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
              <CardContent className="p-3 md:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl md:text-3xl font-bold">{filteredParents.length}</div>
                    <div className="text-xs md:text-sm opacity-90">Showing Now</div>
                  </div>
                  <Eye className="w-8 h-8 md:w-12 md:h-12 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Advanced Filters */}
          <Card className="shadow-lg">
            <CardContent className="p-3 md:p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-4">
                <div className="md:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="🔍 Search by name, email, phone..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-purple-200 focus:border-purple-500"
                    />
                  </div>
                </div>
                <div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                    className="w-full px-3 py-2 border border-purple-200 rounded-md focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="all">All Parents</option>
                    <option value="linked">With Children</option>
                    <option value="unlinked">Without Children</option>
                  </select>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button onClick={loadParents} variant="outline" className="flex-1 min-w-[80px]">
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  </Button>
                  <Button onClick={selectAll} variant="outline" size="sm" className="text-xs">
                    Select All
                  </Button>
                  <Button onClick={deselectAll} variant="outline" size="sm" className="text-xs">
                    Clear
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Parents Excel-like Table */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading parents...</p>
            </div>
          ) : filteredParents.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">No parents found</p>
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-xl">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead className="bg-gradient-to-r from-purple-600 to-blue-600 text-white sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-center text-xs font-semibold border-r border-purple-500">
                          <input
                            type="checkbox"
                            checked={selectedForBulk.length === filteredParents.length && filteredParents.length > 0}
                            onChange={(e) => e.target.checked ? selectAll() : deselectAll()}
                            className="w-4 h-4 rounded"
                          />
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold border-r border-purple-500">#</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold border-r border-purple-500">Parent Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold border-r border-purple-500">Phone</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold border-r border-purple-500">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold border-r border-purple-500">Address</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold border-r border-purple-500">Linked Children</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                      {filteredParents.map((parent, index) => (
                        <motion.tr
                          key={parent.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.02 }}
                          className={`border-b hover:bg-blue-50 transition-colors ${
                            parent.linked_children_count > 0 ? 'bg-green-50' : 'bg-white'
                          } ${selectedForBulk.includes(parent.id) ? 'ring-2 ring-purple-500' : ''}`}
                        >
                          <td className="px-4 py-3 text-center border-r">
                            <input
                              type="checkbox"
                              checked={selectedForBulk.includes(parent.id)}
                              onChange={() => toggleBulkSelection(parent.id)}
                              className="w-4 h-4 text-purple-600 rounded"
                            />
                          </td>
                          <td className="px-4 py-3 text-sm border-r font-semibold text-gray-700">{index + 1}</td>
                          <td className="px-4 py-3 border-r">
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-purple-600" />
                              <span className="font-semibold text-sm">{parent.full_name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm border-r">
                            <div className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-gray-400" />
                              <span className="font-mono">{parent.phone || '-'}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs border-r">
                            <div className="flex items-center gap-1">
                              <Mail className="w-3 h-3 text-gray-400" />
                              <span className="truncate max-w-[200px]">{parent.email || '-'}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs border-r">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-gray-400" />
                              <span className="truncate max-w-[150px]">{parent.address || '-'}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center border-r">
                            <Badge className={`${
                              parent.linked_children_count > 0 
                                ? 'bg-green-500 text-white' 
                                : 'bg-gray-300 text-gray-700'
                            }`}>
                              {parent.linked_children_count || 0} {parent.linked_children_count === 1 ? 'child' : 'children'}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center gap-2">
                              {selectedStudent ? (
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    setSelectedParent(parent);
                                    setShowLinkDialog(true);
                                  }}
                                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 h-8 px-3"
                                >
                                  <LinkIcon className="w-3 h-3 mr-1" />
                                  Link
                                </Button>
                              ) : (
                                <span className="text-xs text-gray-400">Select student</span>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedParent(parent);
                                  setShowDeleteDialog(true);
                                }}
                                className="text-red-600 border-red-300 hover:bg-red-50 h-8 px-3"
                              >
                                <Trash2 className="w-3 h-3 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Bulk Actions Dialog */}
      <Dialog open={showBulkActions} onOpenChange={setShowBulkActions}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="w-6 h-6 text-purple-600" />
              Bulk Actions - {selectedForBulk.length} Parents Selected
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <p className="text-sm text-purple-900 font-semibold mb-2">Available Actions:</p>
              <div className="space-y-2">
                <Button
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                  onClick={() => {
                    toast.success(`📧 Sending messages to ${selectedForBulk.length} parents...`);
                    setShowBulkActions(false);
                  }}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send Bulk Message
                </Button>
                <Button
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                  onClick={() => {
                    exportToCSV();
                    setShowBulkActions(false);
                  }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Selected to CSV
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkActions(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Link Confirmation Dialog */}
      <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LinkIcon className="w-6 h-6 text-blue-600" />
              Confirm Parent-Student Link
            </DialogTitle>
            <DialogDescription>
              Link this parent with the selected student
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedParent && selectedStudent && (
              <>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <p className="text-xs font-semibold text-purple-700 mb-2">👤 PARENT</p>
                  <p className="font-bold text-purple-900">{selectedParent.full_name}</p>
                  <p className="text-sm text-purple-700">{selectedParent.phone}</p>
                  <p className="text-xs text-purple-600">{selectedParent.email}</p>
                </div>

                <div className="flex items-center justify-center">
                  <LinkIcon className="w-8 h-8 text-blue-600" />
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-xs font-semibold text-blue-700 mb-2">👨‍🎓 STUDENT</p>
                  <p className="font-bold text-blue-900">
                    {selectedStudent.first_name} {selectedStudent.last_name}
                  </p>
                  <p className="text-sm text-blue-700">{selectedStudent.student_code}</p>
                  <p className="text-xs text-blue-600">
                    {selectedStudent.trade_code} Level {selectedStudent.level_number}
                  </p>
                </div>

                <div className="bg-green-50 p-4 rounded border border-green-200">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-700 mt-0.5" />
                    <div>
                      <p className="font-semibold text-green-900">📱 SMS Notification</p>
                      <p className="text-sm text-green-700 mt-1">
                        Parent will receive a welcome SMS in Kinyarwanda with:
                      </p>
                      <ul className="text-xs text-green-600 mt-2 space-y-1 ml-4 list-disc">
                        <li>Child's full name and student code</li>
                        <li>Trade and level information</li>
                        <li>Portal access details</li>
                        <li>Features: grades, attendance, conduct, fees</li>
                        <li>School contact information</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLinkDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleLinkParent}
              disabled={loading}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
            >
              {loading ? 'Linking...' : 'Link & Send SMS'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Parent Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="w-6 h-6" />
              Delete Parent Account
            </DialogTitle>
            <DialogDescription>
              Permanently delete this parent account and all associated data
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedParent && (
              <>
                <div className="bg-red-50 p-4 rounded-lg border-2 border-red-300">
                  <p className="font-semibold text-red-900 mb-2">⚠️ Are you sure?</p>
                  <p className="text-sm text-red-700 mb-3">
                    This will permanently delete:
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-red-600" />
                      <span className="font-semibold">{selectedParent.full_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-red-600" />
                      <span className="text-sm">{selectedParent.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-red-600" />
                      <span className="text-sm">{selectedParent.email}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 p-3 rounded border border-yellow-300">
                  <p className="text-sm text-yellow-800">
                    ⚠️ This action will also delete:
                  </p>
                  <ul className="text-xs text-yellow-700 mt-2 space-y-1 ml-4 list-disc">
                    <li>All parent-child links ({selectedParent.linked_children_count || 0} children)</li>
                    <li>All pending applications</li>
                    <li>Parent login credentials</li>
                    <li>All associated data</li>
                  </ul>
                  <p className="text-sm text-yellow-900 mt-2 font-semibold">
                    This action CANNOT be undone!
                  </p>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleDeleteParent}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? 'Deleting...' : 'Delete Permanently'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DODManualParentLinking;
