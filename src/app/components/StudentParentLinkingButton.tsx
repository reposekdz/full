import React, { useState, useEffect } from 'react';
import { Link, CheckCircle, Clock, XCircle, Eye } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/app/components/ui/dialog';
import { Badge } from '@/app/components/ui/badge';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

interface Student {
  id: number;
  first_name: string;
  last_name: string;
  student_code: string;
  trade_code: string;
  level_number: number;
  parent_count?: number;
}

interface LinkRequest {
  id: number;
  application_code: string;
  parent_name: string;
  parent_phone: string;
  parent_email: string;
  status: 'pending' | 'approved' | 'rejected';
  submitted_at: string;
  rejection_reason?: string;
}

interface Props {
  student: Student;
  onLinkApproved?: () => void;
}

export const StudentParentLinkingButton: React.FC<Props> = ({ student, onLinkApproved }) => {
  const [showDialog, setShowDialog] = useState(false);
  const [linkRequests, setLinkRequests] = useState<LinkRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (showDialog) {
      loadLinkRequests();
    }
  }, [showDialog]);

  const loadLinkRequests = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_BASE}/parent-child-linking-advanced/all-applications`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Filter requests for this student
      const studentRequests = response.data.applications?.filter((app: any) => 
        app.child_first_name === student.first_name &&
        app.child_last_name === student.last_name &&
        app.child_trade_code === student.trade_code &&
        app.child_level_number === student.level_number
      ) || [];
      
      setLinkRequests(studentRequests);
    } catch (error) {
      console.error('Error loading link requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: number) => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_BASE}/parent-child-linking-advanced/approve/${requestId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('✅ Guhuza byemejwe! SMS yoherejwe ku mubyeyi.');
      loadLinkRequests();
      if (onLinkApproved) onLinkApproved();
    } catch (error: any) {
      alert('❌ ' + (error.response?.data?.message || 'Ikosa ryabaye'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (requestId: number) => {
    const reason = prompt('Andika impamvu yo kwanga:');
    if (!reason) return;

    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_BASE}/parent-child-linking-advanced/reject/${requestId}`,
        { reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('✅ Guhuza byanze. SMS yoherejwe ku mubyeyi.');
      loadLinkRequests();
      if (onLinkApproved) onLinkApproved();
    } catch (error: any) {
      alert('❌ ' + (error.response?.data?.message || 'Ikosa ryabaye'));
    } finally {
      setActionLoading(false);
    }
  };

  const pendingCount = linkRequests.filter(r => r.status === 'pending').length;
  const approvedCount = linkRequests.filter(r => r.status === 'approved').length;

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        onClick={() => setShowDialog(true)}
        className={`relative ${pendingCount > 0 ? 'text-orange-600 hover:bg-orange-50 border-orange-300' : 'text-green-600 hover:bg-green-50'}`}
        title="Reba Ababyeyi"
      >
        <Link className="w-4 h-4" />
        {pendingCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
            {pendingCount}
          </span>
        )}
      </Button>

      <Dialog open={showDialog} onClose={() => setShowDialog(false)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Ababyeyi ba {student.first_name} {student.last_name}
            </DialogTitle>
            <div className="text-sm text-gray-500">
              {student.student_code} - {student.trade_code} L{student.level_number}
            </div>
          </DialogHeader>

          <div className="space-y-4">
            {/* Statistics */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-orange-50 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-orange-600">{pendingCount}</div>
                <div className="text-xs text-gray-600">Tegereza</div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">{approvedCount}</div>
                <div className="text-xs text-gray-600">Byemejwe</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-gray-600">{linkRequests.length}</div>
                <div className="text-xs text-gray-600">Byose</div>
              </div>
            </div>

            {/* Link Requests */}
            {loading ? (
              <div className="text-center py-8 text-gray-500">Gukurura amakuru...</div>
            ) : linkRequests.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Link className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>Nta basaba guhuza</p>
              </div>
            ) : (
              <div className="space-y-3">
                {linkRequests.map((request) => (
                  <div
                    key={request.id}
                    className={`border rounded-lg p-4 ${
                      request.status === 'pending' ? 'border-orange-300 bg-orange-50' :
                      request.status === 'approved' ? 'border-green-300 bg-green-50' :
                      'border-red-300 bg-red-50'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-semibold text-gray-900">{request.parent_name}</div>
                        <div className="text-sm text-gray-600">{request.parent_phone}</div>
                        <div className="text-xs text-gray-500">{request.parent_email}</div>
                      </div>
                      <Badge
                        variant={
                          request.status === 'pending' ? 'warning' :
                          request.status === 'approved' ? 'success' :
                          'destructive'
                        }
                      >
                        {request.status === 'pending' ? (
                          <><Clock className="w-3 h-3 mr-1" /> Tegereza</>
                        ) : request.status === 'approved' ? (
                          <><CheckCircle className="w-3 h-3 mr-1" /> Byemejwe</>
                        ) : (
                          <><XCircle className="w-3 h-3 mr-1" /> Byanze</>
                        )}
                      </Badge>
                    </div>

                    <div className="text-xs text-gray-500 mb-3">
                      Yatanze: {new Date(request.submitted_at).toLocaleDateString('rw-RW')}
                    </div>

                    {request.status === 'rejected' && request.rejection_reason && (
                      <div className="bg-red-100 border border-red-300 rounded p-2 mb-3 text-sm">
                        <strong>Impamvu:</strong> {request.rejection_reason}
                      </div>
                    )}

                    {request.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleApprove(request.id)}
                          disabled={actionLoading}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Emeza
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReject(request.id)}
                          disabled={actionLoading}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Anga
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Funga
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
