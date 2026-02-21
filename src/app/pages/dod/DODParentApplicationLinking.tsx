import React, { useState, useEffect } from 'react';
import { UserPlus, CheckCircle, XCircle, Clock, Search, RefreshCw, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/app/components/ui/dialog';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { toast } from 'sonner';

const API_BASE = 'http://localhost:5000/api';

const DODParentApplicationLinking = () => {
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({ total_applications: 0, pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApp, setSelectedApp] = useState(null);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const [appsRes, statsRes] = await Promise.all([
        fetch(`${API_BASE}/parent-child-linking/all-applications?limit=100`, { headers }),
        fetch(`${API_BASE}/parent-child-linking/statistics`, { headers })
      ]);

      const appsData = await appsRes.json();
      const statsData = await statsRes.json();

      if (appsData.success) setApplications(appsData.applications || []);
      if (statsData.success) setStats(statsData.applications || {});
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedApp) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/parent-child-linking/approve/${selectedApp.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Application approved! Parent can now access child data.');
        setShowApproveDialog(false);
        setSelectedApp(null);
        fetchData();
      } else {
        toast.error(data.message || 'Failed to approve application');
      }
    } catch (error) {
      console.error('Error approving application:', error);
      toast.error('Failed to approve application');
    }
  };

  const handleReject = async () => {
    if (!selectedApp || !rejectionReason) {
      toast.error('Please provide a rejection reason');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/parent-child-linking/reject/${selectedApp.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rejection_reason: rejectionReason })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Application rejected. Parent has been notified.');
        setShowRejectDialog(false);
        setSelectedApp(null);
        setRejectionReason('');
        fetchData();
      } else {
        toast.error(data.message || 'Failed to reject application');
      }
    } catch (error) {
      console.error('Error rejecting application:', error);
      toast.error('Failed to reject application');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-500"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const filteredApplications = applications.filter(app =>
    app.child_first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.child_last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.parent_first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.parent_last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.student_code?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Parent Application Linking
            </h1>
            <p className="text-gray-600 mt-1">Review and approve parent-child linking requests</p>
          </div>
          <Button onClick={fetchData} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-white/80 text-sm">Total Applications</p>
                  <p className="text-3xl font-bold">{stats.total_applications || 0}</p>
                </div>
                <UserPlus className="w-10 h-10 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-white/80 text-sm">Pending</p>
                  <p className="text-3xl font-bold">{stats.pending || 0}</p>
                </div>
                <Clock className="w-10 h-10 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-white/80 text-sm">Approved</p>
                  <p className="text-3xl font-bold">{stats.approved || 0}</p>
                </div>
                <CheckCircle className="w-10 h-10 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-white/80 text-sm">Rejected</p>
                  <p className="text-3xl font-bold">{stats.rejected || 0}</p>
                </div>
                <XCircle className="w-10 h-10 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by parent name, child name, or student code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Applications Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-blue-600 to-indigo-600">
                  <TableHead className="text-white">Parent</TableHead>
                  <TableHead className="text-white">Child</TableHead>
                  <TableHead className="text-white">Trade/Level</TableHead>
                  <TableHead className="text-white">Gender</TableHead>
                  <TableHead className="text-white">Student Code</TableHead>
                  <TableHead className="text-white">Status</TableHead>
                  <TableHead className="text-white">Date</TableHead>
                  <TableHead className="text-white">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.map(app => (
                  <TableRow key={app.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div>
                        <p className="font-medium">{app.parent_first_name} {app.parent_last_name}</p>
                        <p className="text-sm text-gray-500">{app.parent_email}</p>
                        <p className="text-sm text-gray-500">{app.parent_phone}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{app.child_first_name} {app.child_last_name}</p>
                        {app.student_first_name && (
                          <p className="text-sm text-green-600">✓ Matched: {app.student_first_name} {app.student_last_name}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{app.child_trade_code}</Badge>
                      <span className="ml-2 text-sm">L{app.child_level_number}</span>
                    </TableCell>
                    <TableCell>{app.child_gender === 'Male' ? 'Gabo' : 'Gore'}</TableCell>
                    <TableCell>
                      {app.student_code ? (
                        <span className="font-mono text-sm">{app.student_code}</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(app.status)}</TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {new Date(app.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {app.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => {
                              setSelectedApp(app);
                              setShowApproveDialog(true);
                            }}
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              setSelectedApp(app);
                              setShowRejectDialog(true);
                            }}
                          >
                            <XCircle className="w-3 h-3 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
                      {app.status !== 'pending' && (
                        <span className="text-sm text-gray-500">
                          {app.reviewed_by_name} ({new Date(app.reviewed_at).toLocaleDateString()})
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Approve Dialog */}
        <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                Approve Parent Linking
              </DialogTitle>
            </DialogHeader>
            {selectedApp && (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Parent</p>
                  <p className="font-bold">{selectedApp.parent_first_name} {selectedApp.parent_last_name}</p>
                  <p className="text-sm">{selectedApp.parent_email}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Child</p>
                  <p className="font-bold">{selectedApp.child_first_name} {selectedApp.child_last_name}</p>
                  <p className="text-sm">{selectedApp.child_trade_code} - Level {selectedApp.child_level_number}</p>
                  {selectedApp.student_code && (
                    <p className="text-sm font-mono">{selectedApp.student_code}</p>
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  By approving, the parent will get full access to view their child's:
                </p>
                <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                  <li>Marks and grades</li>
                  <li>Attendance records</li>
                  <li>Discipline records</li>
                  <li>Conduct score</li>
                  <li>Fee balance</li>
                  <li>Messages from teachers</li>
                  <li>Assignments and timetable</li>
                </ul>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowApproveDialog(false)}>Cancel</Button>
              <Button className="bg-green-600 hover:bg-green-700" onClick={handleApprove}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve Application
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reject Dialog */}
        <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <XCircle className="w-5 h-5" />
                Reject Parent Linking
              </DialogTitle>
            </DialogHeader>
            {selectedApp && (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Parent</p>
                  <p className="font-bold">{selectedApp.parent_first_name} {selectedApp.parent_last_name}</p>
                </div>
                <div>
                  <Label>Rejection Reason *</Label>
                  <Textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Explain why this application is being rejected..."
                    rows={4}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRejectDialog(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleReject}>
                <XCircle className="w-4 h-4 mr-2" />
                Reject Application
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default DODParentApplicationLinking;
