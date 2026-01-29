import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserCheck, UserX, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import apiService from '../services/apiService';

export default function ParentConnectionApproval() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const data = await apiService.getParentConnectionRequests();
      setRequests(data || []);
    } catch (error) {
      console.error('Error loading requests:', error);
    }
  };

  const handleApprove = async (requestId: number) => {
    setLoading(true);
    try {
      await apiService.approveParentConnection(requestId, 'approved');
      alert('Icyifuzo cyemejwe!');
      loadRequests();
    } catch (error: any) {
      alert(error.message || 'Byanze kwemeza');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (requestId: number) => {
    if (!confirm('Urashaka kwanga iki cyifuzo?')) return;
    setLoading(true);
    try {
      await apiService.approveParentConnection(requestId, 'rejected');
      alert('Icyifuzo cyanzwe!');
      loadRequests();
    } catch (error: any) {
      alert(error.message || 'Byanze kwanga');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <Card className="border-2 border-purple-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-purple-600" />
            Ibyifuzo byo Guhuza Ababyeyi n'Abana ({requests.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">Nta byifuzo bihari</p>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((request, idx) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="p-4 bg-gray-50 rounded-lg border-2 border-gray-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                          <UserCheck className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-lg">{request.parent_name}</p>
                          <p className="text-sm text-gray-600">{request.parent_email}</p>
                        </div>
                      </div>
                      
                      <div className="ml-15 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">Umunyeshuri:</span>
                          <span className="font-semibold">{request.first_name} {request.last_name}</span>
                          <Badge className="bg-blue-100 text-blue-700">{request.student_id}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">Umwuga:</span>
                          <span>{request.trade_name}</span>
                          <span className="text-sm text-gray-500">Urwego:</span>
                          <span>{request.level_number}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">Isano:</span>
                          <Badge className="bg-green-100 text-green-700">{request.relationship}</Badge>
                        </div>
                        <div className="text-xs text-gray-400 mt-2">
                          Yoherejwe: {new Date(request.requested_at).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleApprove(request.id)}
                        disabled={loading}
                        className="bg-green-600"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Emeza
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleReject(request.id)}
                        disabled={loading}
                        variant="outline"
                        className="text-red-600 border-red-600"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Anga
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
