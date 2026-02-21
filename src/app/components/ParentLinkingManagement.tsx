import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/app/components/ui/dialog';
import { Search, CheckCircle, XCircle, Phone, Mail, User, Calendar, MessageSquare } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const API_BASE = 'http://localhost:5000/api';

interface LinkRequest {
  id: number;
  parent_id: number;
  parent_name: string;
  parent_phone: string;
  parent_email: string;
  student_name: string;
  trade: string;
  level: string;
  message: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  processed_by_name?: string;
  notes?: string;
}

interface Student {
  id: number;
  student_code: string;
  first_name: string;
  last_name: string;
  trade_code: string;
  trade_name: string;
  level_number: number;
  gpa: number;
  attendance_percentage: number;
  conduct_score: number;
}

const ParentLinkingManagement: React.FC = () => {
  const [requests, setRequests] = useState<LinkRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<LinkRequest | null>(null);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [notes, setNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE}/parent-links/manual-requests`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setRequests(res.data.requests || []);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const searchStudents = async () => {
    if (!searchQuery || searchQuery.length < 2) return;
    
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE}/parent-links/search-students?query=${searchQuery}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setSearchResults(res.data.students || []);
      }
    } catch (error) {
      console.error('Error searching students:', error);
      toast.error('Search failed');
    }
  };

  const handleApprove = async () => {
    if (!selectedRequest || !selectedStudent) {
      toast.error('Please select a student');
      return;
    }

    try {
      setProcessing(true);
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${API_BASE}/parent-links/approve-manual-request`,
        {
          request_id: selectedRequest.id,
          student_id: selectedStudent.id,
          notes
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        toast.success('Request approved and link created!');
        setShowApproveDialog(false);
        setSelectedRequest(null);
        setSelectedStudent(null);
        setNotes('');
        setSearchQuery('');
        setSearchResults([]);
        fetchRequests();
      }
    } catch (error: any) {
      console.error('Error approving request:', error);
      toast.error(error.response?.data?.message || 'Failed to approve');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;

    try {
      setProcessing(true);
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${API_BASE}/parent-links/reject-manual-request`,
        {
          request_id: selectedRequest.id,
          notes
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        toast.success('Request rejected');
        setShowRejectDialog(false);
        setSelectedRequest(null);
        setNotes('');
        fetchRequests();
      }
    } catch (error: any) {
      console.error('Error rejecting request:', error);
      toast.error(error.response?.data?.message || 'Failed to reject');
    } finally {
      setProcessing(false);
    }
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const processedRequests = requests.filter(r => r.status !== 'pending');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Parent Linking Requests</h1>
        <p className="text-gray-600">Approve or reject parent-student linking requests</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-3xl font-bold text-orange-600">{pendingRequests.length}</p>
              </div>
              <MessageSquare className="w-10 h-10 text-orange-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-3xl font-bold text-green-600">
                  {requests.filter(r => r.status === 'approved').length}
                </p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rejected</p>
                <p className="text-3xl font-bold text-red-600">
                  {requests.filter(r => r.status === 'rejected').length}
                </p>
              </div>
              <XCircle className="w-10 h-10 text-red-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Requests */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-orange-600" />
            Pending Requests ({pendingRequests.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingRequests.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p>No pending requests</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <div key={request.id} className="border-2 border-orange-200 rounded-lg p-4 bg-orange-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-4 h-4 text-gray-600" />
                        <span className="font-bold text-lg">{request.parent_name}</span>
                        <Badge className="bg-orange-500">Pending</Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="w-4 h-4" />
                          {request.parent_phone}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="w-4 h-4" />
                          {request.parent_email}
                        </div>
                      </div>

                      <div className="bg-white rounded p-3 mb-3">
                        <p className="text-sm font-medium text-gray-700 mb-1">Requested Student:</p>
                        <p className="font-bold">{request.student_name}</p>
                        <p className="text-sm text-gray-600">
                          {request.trade && `Trade: ${request.trade}`}
                          {request.level && ` | Level: ${request.level}`}
                        </p>
                      </div>

                      {request.message && (
                        <div className="bg-white rounded p-3 mb-3">
                          <p className="text-sm font-medium text-gray-700 mb-1">Message:</p>
                          <p className="text-sm text-gray-600">{request.message}</p>
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        {new Date(request.created_at).toLocaleString()}
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Button
                        onClick={() => {
                          setSelectedRequest(request);
                          setShowApproveDialog(true);
                        }}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        onClick={() => {
                          setSelectedRequest(request);
                          setShowRejectDialog(true);
                        }}
                        variant="destructive"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Processed Requests */}
      <Card>
        <CardHeader>
          <CardTitle>Processed Requests ({processedRequests.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {processedRequests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No processed requests</p>
            </div>
          ) : (
            <div className="space-y-3">
              {processedRequests.map((request) => (
                <div key={request.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold">{request.parent_name}</p>
                      <p className="text-sm text-gray-600">Student: {request.student_name}</p>
                      {request.processed_by_name && (
                        <p className="text-xs text-gray-500">Processed by: {request.processed_by_name}</p>
                      )}
                    </div>
                    <Badge className={request.status === 'approved' ? 'bg-green-500' : 'bg-red-500'}>
                      {request.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approve Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Approve Linking Request</DialogTitle>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded p-4">
                <p className="font-bold mb-2">Parent: {selectedRequest.parent_name}</p>
                <p className="text-sm text-gray-600">Requested: {selectedRequest.student_name}</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Search for Student</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Search by name or code..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && searchStudents()}
                  />
                  <Button onClick={searchStudents}>
                    <Search className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {searchResults.length > 0 && (
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {searchResults.map((student) => (
                    <div
                      key={student.id}
                      onClick={() => setSelectedStudent(student)}
                      className={`border-2 rounded-lg p-3 cursor-pointer transition-all ${
                        selectedStudent?.id === student.id
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold">{student.first_name} {student.last_name}</p>
                          <p className="text-sm text-gray-600">
                            {student.student_code} | {student.trade_name} L{student.level_number}
                          </p>
                        </div>
                        {selectedStudent?.id === student.id && (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">Notes (Optional)</label>
                <textarea
                  className="w-full p-3 border rounded-lg"
                  rows={3}
                  placeholder="Add any notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleApprove}
              disabled={!selectedStudent || processing}
              className="bg-green-600 hover:bg-green-700"
            >
              {processing ? 'Processing...' : 'Approve & Link'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Linking Request</DialogTitle>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              <div className="bg-red-50 rounded p-4">
                <p className="font-bold mb-2">Parent: {selectedRequest.parent_name}</p>
                <p className="text-sm text-gray-600">Student: {selectedRequest.student_name}</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Reason for Rejection</label>
                <textarea
                  className="w-full p-3 border rounded-lg"
                  rows={3}
                  placeholder="Explain why this request is being rejected..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleReject}
              disabled={processing}
              variant="destructive"
            >
              {processing ? 'Processing...' : 'Reject Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ParentLinkingManagement;
