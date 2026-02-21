import React, { useState, useEffect } from 'react';
import { Link, CheckCircle, XCircle, Clock, Phone, User, Search, Filter, RefreshCw, Send, Trash2, Mail, MapPin, Calendar, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/app/components/ui/dialog';
import { Textarea } from '@/app/components/ui/textarea';
import axios from 'axios';
import { toast } from 'sonner';

const API_BASE = 'http://localhost:5000/api';

const DODParentApplicationLinking = () => {
  const [applications, setApplications] = useState([]);
  const [filteredApps, setFilteredApps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [selectedApp, setSelectedApp] = useState(null);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    // Check if a student was selected from the student sheets
    const studentData = sessionStorage.getItem('selectedStudent');
    if (studentData) {
      const student = JSON.parse(studentData);
      setSelectedStudent(student);
      setSearchTerm(`${student.first_name} ${student.last_name}`);
      sessionStorage.removeItem('selectedStudent'); // Clear after use
    }
    loadApplications();
  }, []);

  useEffect(() => {
    filterApplications();
  }, [applications, searchTerm, statusFilter, selectedStudent]);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE}/parent-child-linking-advanced/all-applications`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        const apps = response.data.applications || [];
        setApplications(apps);
        
        // Calculate stats
        setStats({
          total: apps.length,
          pending: apps.filter(a => a.status === 'pending').length,
          approved: apps.filter(a => a.status === 'approved').length,
          rejected: apps.filter(a => a.status === 'rejected').length
        });
      }
    } catch (error) {
      console.error('Error loading applications:', error);
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const filterApplications = () => {
    let filtered = applications;

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status === statusFilter);
    }

    // Filter by search term or selected student
    if (searchTerm || selectedStudent) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(app => {
        const childName = `${app.child_first_name} ${app.child_last_name}`.toLowerCase();
        const parentName = app.parent_name?.toLowerCase() || '';
        const appCode = app.application_code?.toLowerCase() || '';
        
        // If student is selected, prioritize exact match
        if (selectedStudent) {
          return app.child_first_name === selectedStudent.first_name &&
                 app.child_last_name === selectedStudent.last_name &&
                 app.child_trade_code === selectedStudent.trade_code &&
                 app.child_level_number === selectedStudent.level_number;
        }
        
        return childName.includes(term) || parentName.includes(term) || appCode.includes(term);
      });
    }

    setFilteredApps(filtered);
  };

  const handleApprove = async () => {
    if (!selectedApp) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE}/parent-child-linking-advanced/approve/${selectedApp.id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success('✅ Parent linked successfully! SMS sent to parent.');
        setShowApproveDialog(false);
        setSelectedApp(null);
        loadApplications();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve application');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedApp || !rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE}/parent-child-linking-advanced/reject/${selectedApp.id}`,
        { reason: rejectionReason },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success('✅ Application rejected. SMS sent to parent.');
        setShowRejectDialog(false);
        setSelectedApp(null);
        setRejectionReason('');
        loadApplications();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject application');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedApp) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(
        `${API_BASE}/parent-child-linking-advanced/delete/${selectedApp.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success('🗑️ Application deleted successfully');
        setShowDeleteDialog(false);
        setSelectedApp(null);
        loadApplications();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete application');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      pending: { color: 'bg-yellow-500', icon: Clock, text: 'Tegereza' },
      approved: { color: 'bg-green-500', icon: CheckCircle, text: 'Byemejwe' },
      rejected: { color: 'bg-red-500', icon: XCircle, text: 'Byanze' }
    };
    const { color, icon: Icon, text } = config[status] || config.pending;
    return (
      <Badge className={`${color} text-white`}>
        <Icon className="w-3 h-3 mr-1" />
        {text}
      </Badge>
    );
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-4">
            <div className="text-3xl font-bold">{stats.total}</div>
            <div className="text-sm opacity-90">Total Applications</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white">
          <CardContent className="p-4">
            <div className="text-3xl font-bold">{stats.pending}</div>
            <div className="text-sm opacity-90">Pending Review</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-4">
            <div className="text-3xl font-bold">{stats.approved}</div>
            <div className="text-sm opacity-90">Approved</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
          <CardContent className="p-4">
            <div className="text-3xl font-bold">{stats.rejected}</div>
            <div className="text-sm opacity-90">Rejected</div>
          </CardContent>
        </Card>
      </div>

      {/* Selected Student Alert */}
      {selectedStudent && (
        <Card className="border-2 border-blue-500 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <User className="w-6 h-6 text-blue-600" />
                <div>
                  <p className="font-bold text-blue-900">
                    Viewing applications for: {selectedStudent.first_name} {selectedStudent.last_name}
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
                  setSelectedStudent(null);
                  setSearchTerm('');
                }}
              >
                Clear Filter
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by parent name, child name, or application code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border rounded px-4 py-2"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <Button onClick={loadApplications} variant="outline">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Applications Excel-like Table */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading applications...</p>
        </div>
      ) : filteredApps.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Link className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">No applications found</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-gradient-to-r from-blue-600 to-purple-600 text-white sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold border-r border-blue-500">#</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold border-r border-blue-500">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold border-r border-blue-500">Parent Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold border-r border-blue-500">Phone</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold border-r border-blue-500">Student Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold border-r border-blue-500">Trade</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold border-r border-blue-500">Level</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold border-r border-blue-500">Match</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold border-r border-blue-500">Submitted</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApps.map((app, index) => (
                    <tr
                      key={app.id}
                      className={`border-b hover:bg-gray-50 transition-colors ${
                        app.status === 'pending' ? 'bg-yellow-50' : 
                        app.status === 'approved' ? 'bg-green-50' : 
                        app.status === 'rejected' ? 'bg-red-50' : ''
                      }`}
                    >
                      <td className="px-4 py-3 text-sm border-r">{index + 1}</td>
                      <td className="px-4 py-3 border-r">
                        {getStatusBadge(app.status)}
                      </td>
                      <td className="px-4 py-3 border-r">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-purple-600" />
                          <div>
                            <p className="font-semibold text-sm">{app.parent_full_name || app.parent_name}</p>
                            {app.parent_email && <p className="text-xs text-gray-500">{app.parent_email}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm border-r">
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-gray-400" />
                          {app.parent_phone}
                        </div>
                      </td>
                      <td className="px-4 py-3 border-r">
                        <p className="font-semibold text-sm">
                          {app.child_full_name || `${app.child_first_name} ${app.child_last_name}`}
                        </p>
                        <p className="text-xs text-gray-500">{app.child_gender}</p>
                      </td>
                      <td className="px-4 py-3 text-sm font-mono border-r">{app.child_trade_code}</td>
                      <td className="px-4 py-3 text-sm text-center border-r">{app.child_level_number}</td>
                      <td className="px-4 py-3 border-r">
                        {app.matched_student_name ? (
                          <div className="text-xs">
                            <p className="font-semibold text-green-700">✓ {app.matched_student_name}</p>
                            <p className="text-gray-500 font-mono">{app.matched_student_code}</p>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">No match</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600 border-r">
                        {new Date(app.submitted_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          {app.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => {
                                  setSelectedApp(app);
                                  setShowApproveDialog(true);
                                }}
                                className="bg-green-600 hover:bg-green-700 h-8 px-3"
                              >
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedApp(app);
                                  setShowRejectDialog(true);
                                }}
                                className="text-red-600 border-red-300 hover:bg-red-50 h-8 px-3"
                              >
                                <XCircle className="w-3 h-3 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                          {app.status === 'rejected' && app.rejection_reason && (
                            <div className="text-xs text-red-700 max-w-xs">
                              <p className="font-semibold">Reason:</p>
                              <p className="truncate">{app.rejection_reason}</p>
                            </div>
                          )}
                          {app.status === 'approved' && (
                            <div className="text-xs text-green-700">
                              <p className="font-semibold">✓ Linked</p>
                              {app.reviewed_by_name && <p className="text-gray-500">By: {app.reviewed_by_name}</p>}
                            </div>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedApp(app);
                              setShowDeleteDialog(true);
                            }}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Approve Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Parent Link</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedApp && (
              <>
                <div className="bg-blue-50 p-4 rounded">
                  <p className="font-semibold mb-2">Parent: {selectedApp.parent_name}</p>
                  <p className="text-sm">Phone: {selectedApp.parent_phone}</p>
                </div>
                <div className="bg-green-50 p-4 rounded">
                  <p className="font-semibold mb-2">
                    Child: {selectedApp.child_first_name} {selectedApp.child_last_name}
                  </p>
                  <p className="text-sm">
                    {selectedApp.child_trade_code} Level {selectedApp.child_level_number}
                  </p>
                </div>
                <div className="bg-yellow-50 p-4 rounded border border-yellow-200">
                  <div className="flex items-start gap-2">
                    <Send className="w-5 h-5 text-yellow-700 mt-0.5" />
                    <div>
                      <p className="font-semibold text-yellow-900">📱 SMS Notification (Kinyarwanda)</p>
                      <p className="text-sm text-yellow-700 mt-2">
                        Parent will receive welcome SMS at {selectedApp.parent_phone}:
                      </p>
                      <div className="bg-white p-3 rounded mt-2 text-xs border border-yellow-300">
                        <p className="font-bold text-green-600">🎓 MURAKAZA NEZA KURI GARDEN TVET SCHOOL! 🎓</p>
                        <p className="mt-2">Mwaramutse {selectedApp.parent_full_name || selectedApp.parent_name},</p>
                        <p className="mt-1">Icyifuzo cyanyu cyo guhuza umwana {selectedApp.child_full_name} cyemejwe!</p>
                        <p className="mt-2 font-semibold">✅ AMAKURU Y'UMWANA:</p>
                        <p className="ml-2">- Amazina: {selectedApp.child_full_name}</p>
                        <p className="ml-2">- Urwego: Level {selectedApp.child_level_number}</p>
                        <p className="ml-2">- Umwuga: {selectedApp.child_trade_code}</p>
                        <p className="mt-2 font-semibold">📱 IBYIZA BY'IKORANABUHANGA:</p>
                        <p className="ml-2 text-xs">✓ Amanota n'ibisubizo by'umwana</p>
                        <p className="ml-2 text-xs">✓ Kwitabira amasomo (attendance)</p>
                        <p className="ml-2 text-xs">✓ Imyitwarire (40/40 conduct system)</p>
                        <p className="ml-2 text-xs">✓ Amafaranga n'ibiciro</p>
                        <p className="ml-2 text-xs">✓ Ubutumwa bw'abarimu</p>
                        <p className="mt-2 text-gray-600">- Garden TVET School</p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleApprove} disabled={loading} className="bg-green-600 hover:bg-green-700">
              {loading ? 'Processing...' : 'Approve & Send SMS'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Application</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedApp && (
              <div className="bg-gray-50 p-4 rounded">
                <p className="font-semibold">
                  {selectedApp.parent_name} → {selectedApp.child_first_name} {selectedApp.child_last_name}
                </p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-2">Rejection Reason *</label>
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explain why this application is being rejected..."
                rows={4}
              />
            </div>
            <div className="bg-red-50 p-3 rounded border border-red-200">
              <p className="text-sm text-red-700">
                📱 Parent will receive an SMS with the rejection reason
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleReject}
              disabled={loading || !rejectionReason.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? 'Processing...' : 'Reject & Send SMS'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="w-5 h-5" />
              Delete Application
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedApp && (
              <>
                <div className="bg-red-50 p-4 rounded border-2 border-red-300">
                  <p className="font-semibold text-red-900 mb-2">⚠️ Are you sure?</p>
                  <p className="text-sm text-red-700">
                    This will permanently delete the application from:
                  </p>
                  <div className="mt-3 space-y-1">
                    <p className="text-sm"><strong>Parent:</strong> {selectedApp.parent_full_name || selectedApp.parent_name}</p>
                    <p className="text-sm"><strong>Child:</strong> {selectedApp.child_full_name || `${selectedApp.child_first_name} ${selectedApp.child_last_name}`}</p>
                    <p className="text-sm"><strong>Status:</strong> {selectedApp.status}</p>
                  </div>
                </div>
                <div className="bg-yellow-50 p-3 rounded border border-yellow-300">
                  <p className="text-sm text-yellow-800">
                    ⚠️ This action cannot be undone. The parent will NOT be notified.
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
              onClick={handleDelete}
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

export default DODParentApplicationLinking;
