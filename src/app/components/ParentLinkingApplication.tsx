import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Users, CheckCircle, XCircle, Clock, AlertCircle, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Textarea } from '@/app/components/ui/textarea';
import { Badge } from '@/app/components/ui/badge';
import { toast } from 'sonner';
import { API_BASE_URL } from '@/app/config/apiBase';

const ParentLinkingApplication = () => {
  const [loading, setLoading] = useState(false);
  const [trades, setTrades] = useState([]);
  const [levels, setLevels] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [formData, setFormData] = useState({
    child_first_name: '',
    child_last_name: '',
    child_gender: '',
    trade_code: '',
    level_number: '',
    relationship: 'parent',
    notes: ''
  });

  useEffect(() => {
    fetchTrades();
    fetchMyRequests();
  }, []);

  useEffect(() => {
    if (formData.trade_code) {
      fetchLevels(formData.trade_code);
    }
  }, [formData.trade_code]);

  const fetchTrades = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/parent-linking-requests/trades`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setTrades(data.trades);
      }
    } catch (error) {
      console.error('Error fetching trades:', error);
    }
  };

  const fetchLevels = async (tradeCode) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/parent-linking-requests/levels?trade_code=${tradeCode}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setLevels(data.levels);
      }
    } catch (error) {
      console.error('Error fetching levels:', error);
    }
  };

  const fetchMyRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/parent-linking-requests/my-requests`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setMyRequests(data.requests);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.child_first_name || !formData.child_last_name || !formData.child_gender || 
        !formData.trade_code || !formData.level_number) {
      toast.error('Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/parent-linking-requests/submit-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(data.message);
        setFormData({
          child_first_name: '',
          child_last_name: '',
          child_gender: '',
          trade_code: '',
          level_number: '',
          relationship: 'parent',
          notes: ''
        });
        fetchMyRequests();
      } else {
        toast.error(data.message || 'Failed to submit request');
      }
    } catch (error) {
      console.error('Error submitting request:', error);
      toast.error('Failed to submit request');
    } finally {
      setLoading(false);
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

  return (
    <div className="space-y-6">
      {/* Application Form */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="w-6 h-6" />
              Link with Your Child
            </CardTitle>
            <CardDescription className="text-blue-100">
              Submit a request to link with your child's account. No student code required!
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="child_first_name">Child's First Name *</Label>
                  <Input
                    id="child_first_name"
                    value={formData.child_first_name}
                    onChange={(e) => setFormData({ ...formData, child_first_name: e.target.value })}
                    placeholder="Enter first name"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="child_last_name">Child's Last Name *</Label>
                  <Input
                    id="child_last_name"
                    value={formData.child_last_name}
                    onChange={(e) => setFormData({ ...formData, child_last_name: e.target.value })}
                    placeholder="Enter last name"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="child_gender">Gender *</Label>
                  <Select value={formData.child_gender} onValueChange={(v) => setFormData({ ...formData, child_gender: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="trade_code">Trade/Program *</Label>
                  <Select value={formData.trade_code} onValueChange={(v) => setFormData({ ...formData, trade_code: v, level_number: '' })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select trade" />
                    </SelectTrigger>
                    <SelectContent>
                      {trades.map((trade) => (
                        <SelectItem key={trade.trade_code} value={trade.trade_code}>
                          {trade.trade_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="level_number">Level *</Label>
                  <Select 
                    value={formData.level_number} 
                    onValueChange={(v) => setFormData({ ...formData, level_number: v })}
                    disabled={!formData.trade_code}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      {levels.map((level) => (
                        <SelectItem key={level} value={level.toString()}>
                          Level {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="relationship">Relationship</Label>
                  <Select value={formData.relationship} onValueChange={(v) => setFormData({ ...formData, relationship: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="parent">Parent</SelectItem>
                      <SelectItem value="father">Father</SelectItem>
                      <SelectItem value="mother">Mother</SelectItem>
                      <SelectItem value="guardian">Guardian</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Additional Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any additional information..."
                  rows={3}
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700">
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Submit Linking Request
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      {/* My Requests */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              My Linking Requests
            </CardTitle>
            <CardDescription>Track the status of your linking requests</CardDescription>
          </CardHeader>
          <CardContent>
            {myRequests.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <AlertCircle className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p>No linking requests yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {myRequests.map((request) => (
                  <motion.div
                    key={request.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-lg">
                          {request.student_first_name} {request.student_last_name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {request.trade_name} - Level {request.level_number}
                        </p>
                        {request.student_code && (
                          <p className="text-xs text-gray-500 mt-1">
                            Student Code: {request.student_code}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-2">
                          Submitted: {new Date(request.created_at).toLocaleDateString()}
                        </p>
                        {request.rejection_reason && (
                          <p className="text-sm text-red-600 mt-2">
                            Reason: {request.rejection_reason}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        {getStatusBadge(request.status)}
                        {request.status === 'approved' && (
                          <p className="text-xs text-green-600 mt-2">
                            Approved by: {request.approved_by_first_name} {request.approved_by_last_name}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ParentLinkingApplication;
