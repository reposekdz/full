import React, { useState, useEffect } from 'react';
import { Plane, Plus, Search, Filter, Eye, Check, X, Home, User, FileText, Calendar, Users, BarChart3, Scale, Mail, FileSpreadsheet, Clock, CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { apiService } from '@/app/services/apiService';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';

interface LeaveRequest {
  id: number;
  student_id: number;
  student_number: string;
  first_name: string;
  last_name: string;
  trade_name: string;
  level: number;
  leave_type: string;
  reason: string;
  start_date: string;
  end_date: string;
  status: string;
  approved_by: number;
  approved_at: string;
  approver_first_name: string;
  approver_last_name: string;
  notes: string;
  days_requested: number;
  created_at: string;
}

const DODLeaveManagementPage: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState({ start: '', end: '' });
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [actionNotes, setActionNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const [newLeaveForm, setNewLeaveForm] = useState({
    student_id: '',
    leave_type: 'sick',
    reason: '',
    start_date: '',
    end_date: ''
  });

  const [students, setStudents] = useState<any[]>([]);

  useEffect(() => {
    loadLeaveRequests();
    loadStudents();
  }, []);

  useEffect(() => {
    filterRequests();
  }, [searchTerm, statusFilter, dateFilter, leaveRequests]);

  const loadLeaveRequests = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (statusFilter) params.status = statusFilter;
      if (dateFilter.start) params.start_date = dateFilter.start;
      if (dateFilter.end) params.end_date = dateFilter.end;

      const data = await apiService.getLeaveRequests(params);
      setLeaveRequests(data.leave_requests || []);
    } catch (error) {
      console.error('Error loading leave requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStudents = async () => {
    try {
      const data = await apiService.getStudents({ limit: 500 });
      setStudents(data.students || []);
    } catch (error) {
      console.error('Error loading students:', error);
    }
  };

  const filterRequests = () => {
    let filtered = [...leaveRequests];

    if (searchTerm) {
      filtered = filtered.filter(
        (req) =>
          `${req.first_name} ${req.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
          req.student_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
          req.reason.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredRequests(filtered);
  };

  const handleCreateLeave = async () => {
    if (!newLeaveForm.student_id || !newLeaveForm.reason || !newLeaveForm.start_date || !newLeaveForm.end_date) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setProcessing(true);
      const data = await apiService.createLeaveRequest({
        student_id: parseInt(newLeaveForm.student_id),
        leave_type: newLeaveForm.leave_type,
        reason: newLeaveForm.reason,
        start_date: newLeaveForm.start_date,
        end_date: newLeaveForm.end_date
      });

      if (data.success) {
        showSuccessMessage('Leave request created successfully!');
        setCreateModalOpen(false);
        setNewLeaveForm({
          student_id: '',
          leave_type: 'sick',
          reason: '',
          start_date: '',
          end_date: ''
        });
        loadLeaveRequests();
      } else {
        alert(data.message || 'Failed to create leave request');
      }
    } catch (error: any) {
      console.error('Error creating leave:', error);
      alert(error.message || 'Failed to create leave request');
    } finally {
      setProcessing(false);
    }
  };

  const handleApproveReject = async (leaveId: number, status: 'approved' | 'rejected') => {
    try {
      setProcessing(true);
      const data = await apiService.updateLeaveStatus(leaveId, {
        status,
        notes: actionNotes
      });

      if (data.success) {
        showSuccessMessage(`Leave request ${status} successfully!`);
        setApproveModalOpen(false);
        setActionNotes('');
        setSelectedRequest(null);
        loadLeaveRequests();
      } else {
        alert(data.message || `Failed to ${status} leave request`);
      }
    } catch (error: any) {
      console.error('Error updating leave status:', error);
      alert(error.message || `Failed to ${status} leave request`);
    } finally {
      setProcessing(false);
    }
  };

  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getLeaveTypeColor = (type: string) => {
    switch (type) {
      case 'sick':
        return 'bg-red-50 text-red-700';
      case 'personal':
        return 'bg-blue-50 text-blue-700';
      case 'family':
        return 'bg-purple-50 text-purple-700';
      case 'emergency':
        return 'bg-orange-50 text-orange-700';
      default:
        return 'bg-gray-50 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5" />;
      case 'rejected':
        return <XCircle className="w-5 h-5" />;
      case 'pending':
        return <Clock className="w-5 h-5" />;
      default:
        return <AlertCircle className="w-5 h-5" />;
    }
  };

  const statistics = {
    total: leaveRequests.length,
    pending: leaveRequests.filter((r) => r.status === 'pending').length,
    approved: leaveRequests.filter((r) => r.status === 'approved').length,
    rejected: leaveRequests.filter((r) => r.status === 'rejected').length,
    total_days: leaveRequests.reduce((sum, r) => sum + (r.days_requested || 0), 0)
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-blue-100">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-cyan-50">
      {/* Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col fixed inset-y-0 z-40 mt-16">
        <div className="flex flex-col flex-grow bg-gradient-to-b from-green-600 via-blue-500 to-cyan-600 overflow-y-auto shadow-2xl">
          <nav className="flex-1 px-3 py-4 space-y-2">
            {[
              { id: 'director-discipline-dashboard', label: 'Dashboard', Icon: Home },
              { id: 'dod-profile', label: 'Profile', Icon: User },
              { id: 'dod-discipline', label: 'Discipline', Icon: FileText },
              { id: 'dod-leave-management', label: 'Leave', Icon: Plane, active: true },
              { id: 'dod-students', label: 'Students', Icon: Users },
              { id: 'dod-parent-management', label: 'Parents', Icon: Mail },
              { id: 'dod-reports', label: 'Reports', Icon: BarChart3 },
              { id: 'dod-punishments', label: 'Punishments', Icon: Scale },
              { id: 'dod-student-sheets', label: 'Sheets', Icon: FileSpreadsheet }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                  item.active
                    ? 'bg-white text-green-700 shadow-lg scale-105 font-bold'
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
      <div className="lg:pl-64 flex-1 pt-16">
        <div className="p-4 md:p-6">
          <div className="mb-6">
            <button
              onClick={() => onNavigate('director-discipline-dashboard')}
              className="mb-4 text-green-600 hover:text-green-700 font-medium"
            >
              ← Back to Dashboard
            </button>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-4xl font-black bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent flex items-center gap-3">
                  <Plane className="w-10 h-10 text-green-600" />
                  Leave Management
                </h1>
                <p className="text-gray-600 mt-2">Manage student leave requests and approvals</p>
              </div>

              <Button
                onClick={() => setCreateModalOpen(true)}
                className="bg-gradient-to-r from-green-600 to-blue-600 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Leave Request
              </Button>
            </div>
          </div>

          {/* Success Message */}
          <AnimatePresence>
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-4 p-4 bg-green-100 border border-green-400 text-green-800 rounded-lg flex items-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                {successMessage}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{statistics.total}</div>
                  <div className="text-sm text-gray-600">Total Requests</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-600">{statistics.pending}</div>
                  <div className="text-sm text-gray-600">Pending</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{statistics.approved}</div>
                  <div className="text-sm text-gray-600">Approved</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600">{statistics.rejected}</div>
                  <div className="text-sm text-gray-600">Rejected</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">{statistics.total_days}</div>
                  <div className="text-sm text-gray-600">Total Days</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label>Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      placeholder="Search by student name or ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label>Status</Label>
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      loadLeaveRequests();
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                <div>
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={dateFilter.start}
                    onChange={(e) => setDateFilter({ ...dateFilter, start: e.target.value })}
                  />
                </div>

                <div>
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={dateFilter.end}
                    onChange={(e) => setDateFilter({ ...dateFilter, end: e.target.value })}
                  />
                </div>
              </div>

              <div className="mt-4">
                <Button onClick={loadLeaveRequests} variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  Apply Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Leave Requests List */}
          <div className="grid grid-cols-1 gap-4">
            {filteredRequests.map((request) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all duration-200"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg ${getStatusColor(request.status)}`}>
                        {getStatusIcon(request.status)}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-xl font-bold text-gray-900">
                            {request.first_name} {request.last_name}
                          </h3>
                          <Badge className={getStatusColor(request.status)}>{request.status}</Badge>
                          <Badge className={getLeaveTypeColor(request.leave_type)}>
                            {request.leave_type}
                          </Badge>
                        </div>

                        <p className="text-sm text-gray-600 mb-2">
                          <strong>ID:</strong> {request.student_number} | <strong>Trade:</strong>{' '}
                          {request.trade_name} - Level {request.level}
                        </p>

                        <p className="text-gray-700 mb-3">
                          <strong>Reason:</strong> {request.reason}
                        </p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600">
                          <div>
                            <strong>Start:</strong> {new Date(request.start_date).toLocaleDateString()}
                          </div>
                          <div>
                            <strong>End:</strong> {new Date(request.end_date).toLocaleDateString()}
                          </div>
                          <div>
                            <strong>Days:</strong> {request.days_requested}
                          </div>
                          <div>
                            <strong>Requested:</strong>{' '}
                            {new Date(request.created_at).toLocaleDateString()}
                          </div>
                        </div>

                        {request.status !== 'pending' && request.approver_first_name && (
                          <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm">
                              <strong>{request.status === 'approved' ? 'Approved' : 'Rejected'} by:</strong>{' '}
                              {request.approver_first_name} {request.approver_last_name} on{' '}
                              {new Date(request.approved_at).toLocaleDateString()}
                            </p>
                            {request.notes && (
                              <p className="text-sm text-gray-600 mt-1">
                                <strong>Notes:</strong> {request.notes}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={() => {
                        setSelectedRequest(request);
                        setDetailsModalOpen(true);
                      }}
                      variant="outline"
                      size="sm"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>

                    {request.status === 'pending' && (
                      <>
                        <Button
                          onClick={() => {
                            setSelectedRequest(request);
                            setActionNotes('');
                            setApproveModalOpen(true);
                          }}
                          size="sm"
                          className="bg-green-600 text-white hover:bg-green-700"
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Approve/Reject
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}

            {filteredRequests.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center text-gray-500">
                  <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p>No leave requests found</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Create Leave Modal */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-green-600">
              Create Leave Request
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Student *</Label>
              <select
                value={newLeaveForm.student_id}
                onChange={(e) => setNewLeaveForm({ ...newLeaveForm, student_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select student</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.student_id} - {student.first_name} {student.last_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label>Leave Type *</Label>
              <select
                value={newLeaveForm.leave_type}
                onChange={(e) => setNewLeaveForm({ ...newLeaveForm, leave_type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
              >
                <option value="sick">Sick Leave</option>
                <option value="personal">Personal Leave</option>
                <option value="family">Family Emergency</option>
                <option value="emergency">Emergency</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <Label>Reason *</Label>
              <Textarea
                placeholder="Enter reason for leave"
                value={newLeaveForm.reason}
                onChange={(e) => setNewLeaveForm({ ...newLeaveForm, reason: e.target.value })}
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Date *</Label>
                <Input
                  type="date"
                  value={newLeaveForm.start_date}
                  onChange={(e) => setNewLeaveForm({ ...newLeaveForm, start_date: e.target.value })}
                />
              </div>

              <div>
                <Label>End Date *</Label>
                <Input
                  type="date"
                  value={newLeaveForm.end_date}
                  onChange={(e) => setNewLeaveForm({ ...newLeaveForm, end_date: e.target.value })}
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <Button variant="outline" onClick={() => setCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateLeave}
                disabled={processing}
                className="bg-gradient-to-r from-green-600 to-blue-600 text-white"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Leave
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Approve/Reject Modal */}
      <Dialog open={approveModalOpen} onOpenChange={setApproveModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-green-600">
              Approve or Reject Leave
            </DialogTitle>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="font-semibold">
                  {selectedRequest.first_name} {selectedRequest.last_name}
                </p>
                <p className="text-sm text-gray-600">
                  {new Date(selectedRequest.start_date).toLocaleDateString()} -{' '}
                  {new Date(selectedRequest.end_date).toLocaleDateString()} ({selectedRequest.days_requested}{' '}
                  days)
                </p>
              </div>

              <div>
                <Label>Notes (Optional)</Label>
                <Textarea
                  placeholder="Add notes for approval/rejection"
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setApproveModalOpen(false);
                    setActionNotes('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleApproveReject(selectedRequest.id, 'rejected')}
                  disabled={processing}
                  className="bg-red-600 text-white hover:bg-red-700"
                >
                  {processing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <X className="w-4 h-4 mr-2" />}
                  Reject
                </Button>
                <Button
                  onClick={() => handleApproveReject(selectedRequest.id, 'approved')}
                  disabled={processing}
                  className="bg-green-600 text-white hover:bg-green-700"
                >
                  {processing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
                  Approve
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Details Modal */}
      <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-green-600">Leave Request Details</DialogTitle>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              <div>
                <Label className="text-gray-600">Student</Label>
                <p className="font-semibold">
                  {selectedRequest.first_name} {selectedRequest.last_name} ({selectedRequest.student_number})
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-600">Trade</Label>
                  <p className="font-semibold">
                    {selectedRequest.trade_name} - Level {selectedRequest.level}
                  </p>
                </div>
                <div>
                  <Label className="text-gray-600">Leave Type</Label>
                  <Badge className={getLeaveTypeColor(selectedRequest.leave_type)}>
                    {selectedRequest.leave_type}
                  </Badge>
                </div>
              </div>

              <div>
                <Label className="text-gray-600">Reason</Label>
                <p className="font-semibold">{selectedRequest.reason}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-600">Start Date</Label>
                  <p className="font-semibold">
                    {new Date(selectedRequest.start_date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <Label className="text-gray-600">End Date</Label>
                  <p className="font-semibold">
                    {new Date(selectedRequest.end_date).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div>
                <Label className="text-gray-600">Duration</Label>
                <p className="font-semibold">{selectedRequest.days_requested} days</p>
              </div>

              <div>
                <Label className="text-gray-600">Status</Label>
                <Badge className={getStatusColor(selectedRequest.status)}>{selectedRequest.status}</Badge>
              </div>

              {selectedRequest.status !== 'pending' && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm">
                    <strong>{selectedRequest.status === 'approved' ? 'Approved' : 'Rejected'} by:</strong>{' '}
                    {selectedRequest.approver_first_name} {selectedRequest.approver_last_name}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Date:</strong> {new Date(selectedRequest.approved_at).toLocaleDateString()}
                  </p>
                  {selectedRequest.notes && (
                    <p className="text-sm text-gray-600 mt-2">
                      <strong>Notes:</strong> {selectedRequest.notes}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DODLeaveManagementPage;
