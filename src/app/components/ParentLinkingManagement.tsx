import { API_BASE_URL } from '@/app/config/apiBase';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, UserPlus, CheckCircle, XCircle, Clock, Search,
  ChevronRight, User, Phone, Mail, MessageSquare,
  AlertCircle, RefreshCw, Filter, Download, Shield,
  UserCheck, Award, TrendingUp, Activity, Bell
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/app/components/ui/dialog';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';
import { useAuth } from '@/app/contexts/AuthContext';

// Types
interface LinkingRequest {
  id: number;
  parent_id: number | null;
  parent_name: string;
  parent_phone: string;
  parent_email: string | null;
  student_first_name: string;
  student_last_name: string;
  student_trade: string;
  student_level: string;
  student_id: number | null;
  student_code: string | null;
  relationship_type: string;
  message: string | null;
  status: 'pending' | 'approved' | 'rejected';
  reviewed_by: number | null;
  reviewed_by_name: string | null;
  reviewed_by_role: string | null;
  reviewed_at: string | null;
  review_note: string | null;
  created_at: string;
}

interface ParentConnection {
  id: number;
  connection_id: string;
  parent_name: string;
  parent_phone: string;
  parent_email: string | null;
  student_id: number;
  student_code: string;
  first_name: string;
  last_name: string;
  trade_code: string;
  level_number: number;
  relationship: string;
  status: string;
  can_view_marks: number;
  can_view_attendance: number;
  can_view_discipline: number;
  can_view_fees: number;
  approved_by: string | null;
  approved_by_role: string | null;
  created_at: string;
}

interface ParentLinkingManagementProps {
  userRole: string;
  userId: number;
  userName: string;
}

const formatDate = (date: string) => new Date(date).toLocaleDateString('rw-RW');
const formatDateTime = (date: string) => new Date(date).toLocaleString('rw-RW');

const APPROVER_ROLES = ['admin', 'headmaster', 'dod', 'director_study', 'director_discipline', 'accountant', 'advisor', 'patron', 'matron'];

const ParentLinkingManagement: React.FC<ParentLinkingManagementProps> = ({
  userRole,
  userId,
  userName
}) => {
  const { token } = useAuth();
  
  // State
  const [loading, setLoading] = useState(true);
  const [pendingRequests, setPendingRequests] = useState<LinkingRequest[]>([]);
  const [allRequests, setAllRequests] = useState<LinkingRequest[]>([]);
  const [connections, setConnections] = useState<ParentConnection[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  
  // UI State
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedRequest, setSelectedRequest] = useState<LinkingRequest | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [approvalNote, setApprovalNote] = useState('');
  const [rejectNote, setRejectNote] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [bulkMode, setBulkMode] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Check if user can approve
  const canApprove = APPROVER_ROLES.includes(userRole);

  useEffect(() => {
    if (canApprove) {
      loadData();
    }
  }, [canApprove]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load pending count
      const countRes = await fetch(`${API_BASE_URL}/parent-linking/pending-count`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const countData = await countRes.json();
      if (countData.success) setPendingCount(countData.pendingCount);

      // Load pending requests
      const pendingRes = await fetch(`${API_BASE_URL}/parent-linking/pending-requests`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const pendingData = await pendingRes.json();
      if (pendingData.success) setPendingRequests(pendingData.requests);

      // Load all requests
      const allRes = await fetch(`${API_BASE_URL}/parent-linking/linking-requests?status=${filterStatus}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const allData = await allRes.json();
      if (allData.success) setAllRequests(allData.requests);

      // Load connections
      const connRes = await fetch(`${API_BASE_URL}/parent-linking/connections`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const connData = await connRes.json();
      if (connData.success) setConnections(connData.connections);

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number, note: string = '') => {
    try {
      const res = await fetch(`${API_BASE_URL}/parent-linking/linking-requests/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ action: 'approve', note })
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMessage('Request approved successfully!');
        setShowApprovalModal(false);
        setApprovalNote('');
        loadData();
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error approving request:', error);
    }
  };

  const handleReject = async (id: number, note: string = '') => {
    try {
      const res = await fetch(`${API_BASE_URL}/parent-linking/linking-requests/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ action: 'reject', note })
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMessage('Request rejected successfully!');
        setShowRejectModal(false);
        setRejectNote('');
        loadData();
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
    }
  };

  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) return;
    try {
      const res = await fetch(`${API_BASE_URL}/parent-linking/bulk-approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ request_ids: selectedIds })
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMessage(`Successfully approved ${data.approved} requests!`);
        setSelectedIds([]);
        setBulkMode(false);
        loadData();
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error in bulk approve:', error);
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const filteredRequests = allRequests.filter(req => {
    if (filterStatus !== 'all' && req.status !== filterStatus) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        req.parent_name.toLowerCase().includes(query) ||
        req.parent_phone.includes(query) ||
        req.student_first_name.toLowerCase().includes(query) ||
        req.student_last_name.toLowerCase().includes(query)
      );
    }
    return true;
  });

  if (!canApprove) {
    return (
      <Card className="border-2 border-red-200">
        <CardContent className="p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-500">You do not have permission to manage parent linking requests.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6">
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3"
          >
            <CheckCircle className="w-6 h-6" />
            {successMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Stats */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-black text-gray-900 flex items-center gap-3">
                <Shield className="w-10 h-10 text-purple-600" />
                Parent Linking Management
              </h1>
              <p className="text-gray-600 mt-2">Approve and manage parent-student connections</p>
            </div>
            <div className="flex gap-3">
              <Button onClick={loadData} variant="outline" className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
              <Button className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600">
                <Download className="w-4 h-4" />
                Export
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { title: 'Pending Requests', value: pendingCount, icon: Clock, color: 'from-orange-500 to-red-500', bgColor: 'bg-orange-50', textColor: 'text-orange-700' },
            { title: 'Active Connections', value: connections.filter(c => c.status === 'active').length, icon: Users, color: 'from-green-500 to-emerald-500', bgColor: 'bg-green-50', textColor: 'text-green-700' },
            { title: 'Total Requests', value: allRequests.length, icon: UserPlus, color: 'from-blue-500 to-indigo-500', bgColor: 'bg-blue-50', textColor: 'text-blue-700' },
            { title: 'Your Role', value: userRole.toUpperCase(), icon: Award, color: 'from-purple-500 to-pink-500', bgColor: 'bg-purple-50', textColor: 'text-purple-700' }
          ].map((stat, idx) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="overflow-hidden hover:shadow-xl transition-all border-2">
                <CardContent className="p-0">
                  <div className={`bg-gradient-to-br ${stat.color} p-6 text-white`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-white/90 text-sm mb-2">{stat.title}</p>
                        <p className="text-4xl font-black">{typeof stat.value === 'number' ? stat.value : stat.value}</p>
                      </div>
                      <stat.icon className="w-12 h-12 opacity-90" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Main Content */}
        <Card className="border-2 border-purple-200 shadow-2xl">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <UserCheck className="w-7 h-7" />
                  Parent Linking Requests
                </CardTitle>
                <CardDescription className="text-white/90 mt-1">
                  Review and approve parent requests to access student information
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/20" onClick={loadData}>
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-3 bg-purple-100 mb-4">
                <TabsTrigger value="pending" className="relative">
                  Pending
                  {pendingCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {pendingCount}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="all">All Requests</TabsTrigger>
                <TabsTrigger value="connections">Connections</TabsTrigger>
              </TabsList>

              {/* Pending Tab */}
              <TabsContent value="pending">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                <p className="mt-4 text-gray-500">Loading pending requests...</p>
              </div>
            ) : pendingRequests.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">All Caught Up!</h3>
                <p className="text-gray-500">No pending requests at the moment.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {bulkMode && (
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <span className="text-sm text-blue-700">{selectedIds.length} requests selected</span>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setBulkMode(false)}>Cancel</Button>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={handleBulkApprove}>
                        Approve Selected
                      </Button>
                    </div>
                  </div>
                )}
                
                <AnimatePresence>
                  {pendingRequests.map((request, idx) => (
                    <motion.div
                      key={request.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ delay: idx * 0.05 }}
                      className="p-4 rounded-lg border-2 border-orange-200 bg-orange-50 hover:bg-orange-100 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          {bulkMode && (
                            <button
                              onClick={() => toggleSelect(request.id)}
                              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                selectedIds.includes(request.id) ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                              }`}
                            >
                              {selectedIds.includes(request.id) && <CheckCircle className="w-4 h-4 text-white" />}
                            </button>
                          )}
                          
                          <Avatar className="w-12 h-12">
                            <AvatarFallback className="bg-orange-200 text-orange-700">
                              {request.parent_name[0]}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-gray-900">{request.parent_name}</h4>
                              <Badge variant="outline" className="text-xs">{request.relationship_type}</Badge>
                            </div>
                            <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {request.parent_phone}
                              </span>
                              {request.parent_email && (
                                <span className="flex items-center gap-1">
                                  <Mail className="w-3 h-3" />
                                  {request.parent_email}
                                </span>
                              )}
                            </div>
                            
                            <div className="mt-3 p-3 bg-white rounded-lg border border-orange-200">
                              <p className="text-sm font-medium text-gray-900">
                                Student: {request.student_first_name} {request.student_last_name}
                              </p>
                              <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                                <span>{request.student_trade}</span>
                                <span>Level {request.student_level}</span>
                                {request.student_code && <span>Code: {request.student_code}</span>}
                              </div>
                              {request.message && (
                                <p className="mt-2 text-sm text-gray-600 italic">"{request.message}"</p>
                              )}
                            </div>
                            
                            <p className="mt-2 text-xs text-gray-400">
                              Requested: {formatDateTime(request.created_at)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-2">
                          <Button 
                            size="sm" 
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => {
                              setSelectedRequest(request);
                              setShowApprovalModal(true);
                            }}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => {
                              setSelectedRequest(request);
                              setShowRejectModal(true);
                            }}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </TabsContent>

              {/* All Requests Tab */}
              <TabsContent value="all">
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search by parent name, phone, or student name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  {filteredRequests.map((request, idx) => (
                    <motion.div
                      key={request.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className="p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback className="bg-gray-200 text-gray-700">
                              {request.parent_name[0]}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-gray-900">{request.parent_name}</p>
                              <Badge className={
                                request.status === 'approved' ? 'bg-green-100 text-green-700' :
                                request.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                'bg-yellow-100 text-yellow-700'
                              }>
                                {request.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-500">
                              {request.student_first_name} {request.student_last_name} • {request.relationship_type}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="text-right text-sm">
                            <p className="text-gray-500">{formatDate(request.created_at)}</p>
                            {request.reviewed_by_name && (
                              <p className="text-xs text-gray-400">
                                by {request.reviewed_by_name} ({request.reviewed_by_role})
                              </p>
                            )}
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>

              {/* Connections Tab */}
              <TabsContent value="connections">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {connections.map((conn, idx) => (
                    <motion.div
                      key={conn.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.03 }}
                      className="p-4 rounded-lg border border-gray-200 bg-white hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-blue-100 text-blue-700">
                            {conn.parent_name[0]}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{conn.parent_name}</p>
                          <p className="text-sm text-gray-500">{conn.parent_phone}</p>
                          
                          <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                            <p className="font-medium">{conn.first_name} {conn.last_name}</p>
                            <p className="text-xs text-gray-500">{conn.trade_code} - Level {conn.level_number}</p>
                          </div>
                          
                          <div className="mt-2 flex flex-wrap gap-1">
                            <Badge variant="outline" className="text-xs">{conn.relationship}</Badge>
                            <Badge variant={conn.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                              {conn.status}
                            </Badge>
                          </div>
                          
                          <p className="mt-2 text-xs text-gray-400">
                            Approved by {conn.approved_by} ({conn.approved_by_role})
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

      {/* Approval Modal */}
      <Dialog open={showApprovalModal} onOpenChange={setShowApprovalModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Linking Request</DialogTitle>
            <DialogDescription>
              You are approving {selectedRequest?.parent_name} to link with student {selectedRequest?.student_first_name} {selectedRequest?.student_last_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Approval Note (Optional)</Label>
              <Textarea
                value={approvalNote}
                onChange={(e) => setApprovalNote(e.target.value)}
                placeholder="Add any notes about this approval..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApprovalModal(false)}>Cancel</Button>
            <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleApprove(selectedRequest?.id || 0, approvalNote)}>
              Confirm Approval
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Modal */}
      <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Linking Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this request. The parent will be notified.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Rejection Reason *</Label>
              <Textarea
                value={rejectNote}
                onChange={(e) => setRejectNote(e.target.value)}
                placeholder="Enter reason for rejection"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectModal(false)}>Cancel</Button>
            <Button 
              variant="destructive" 
              onClick={() => handleReject(selectedRequest?.id || 0, rejectNote)}
              disabled={!rejectNote.trim()}
            >
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
};

export default ParentLinkingManagement;