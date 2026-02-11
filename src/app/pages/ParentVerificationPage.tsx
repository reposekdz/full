import { API_BASE_URL } from '@/app/config/apiBase';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Phone, User, MessageSquare, CheckCircle, Clock,
  AlertCircle, Send, RefreshCw, ChevronRight, Shield, Key,
  BookOpen, Calendar, Award, FileText, Bell
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Label } from '@/app/components/ui/label';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Progress } from '@/app/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/app/components/ui/dialog';
import { useAuth } from '@/app/contexts/AuthContext';

// Types
interface VerificationRequest {
  id: number;
  parent_name: string;
  parent_phone: string;
  parent_email: string | null;
  student_first_name: string;
  student_last_name: string;
  student_trade: string | null;
  student_level: string | null;
  relationship_type: string;
  message: string | null;
  verification_code: string;
  status: 'pending' | 'verified' | 'approved' | 'rejected' | 'expired';
  created_at: string;
}

const ParentVerificationPage: React.FC = () => {
  const { user } = useAuth();
  
  // State
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('request');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Trades and Levels from database
  const [trades, setTrades] = useState<any[]>([]);
  const levels = [1, 2, 3]; // Standard levels
  
  // Fetch trades from database
  useEffect(() => {
    const fetchTrades = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/trades`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success && data.trades) {
          setTrades(data.trades);
        }
      } catch (error) {
        console.error('Error fetching trades:', error);
      } finally {
        setInitialLoading(false);
      }
    };
    
    fetchTrades();
  }, []);
  
  // Request verification form
  const [requestForm, setRequestForm] = useState({
    parent_name: '',
    parent_phone: '',
    parent_email: '',
    student_first_name: '',
    student_last_name: '',
    student_trade: '',
    student_level: '',
    relationship: 'father',
    message: ''
  });
  
  // Verification form
  const [verificationForm, setVerificationForm] = useState({
    request_id: '',
    verification_code: ''
  });
  
  // Resend form
  const [resendForm, setResendForm] = useState({
    request_id: '',
    parent_phone: ''
  });
  
  // Request verification
  const handleRequestVerification = async () => {
    if (!requestForm.parent_phone || !requestForm.student_first_name || !requestForm.student_last_name) {
      setErrorMessage('Please fill in all required fields');
      return;
    }
    
    setLoading(true);
    setErrorMessage('');
    
    try {
      const res = await fetch(`${API_BASE_URL}/parent-linking/request-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestForm)
      });
      
      const data = await res.json();
      
      if (data.success) {
        setSuccessMessage(`Verification code sent to ${requestForm.parent_phone}!`);
        setVerificationForm({ ...verificationForm, request_id: data.request_id.toString() });
        setActiveTab('verify');
      } else {
        setErrorMessage(data.message);
      }
    } catch (error) {
      setErrorMessage('Error sending verification request');
    } finally {
      setLoading(false);
    }
  };
  
  // Verify code
  const handleVerifyCode = async () => {
    if (!verificationForm.verification_code) {
      setErrorMessage('Please enter the verification code');
      return;
    }
    
    setLoading(true);
    setErrorMessage('');
    
    try {
      const res = await fetch(`${API_BASE_URL}/parent-linking/verify-and-submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parent_phone: requestForm.parent_phone,
          verification_code: verificationForm.verification_code,
          request_id: parseInt(verificationForm.request_id)
        })
      });
      
      const data = await res.json();
      
      if (data.success) {
        setSuccessMessage('Verification successful! Your request has been submitted for approval.');
        setVerificationForm({ request_id: '', verification_code: '' });
      } else {
        setErrorMessage(data.message);
      }
    } catch (error) {
      setErrorMessage('Error verifying code');
    } finally {
      setLoading(false);
    }
  };
  
  // Resend code
  const handleResendCode = async () => {
    if (!resendForm.request_id || !resendForm.parent_phone) {
      setErrorMessage('Please enter request ID and phone number');
      return;
    }
    
    setLoading(true);
    
    try {
      const res = await fetch(`${API_BASE_URL}/parent-linking/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resendForm)
      });
      
      const data = await res.json();
      
      if (data.success) {
        setSuccessMessage('New verification code sent!');
      } else {
        setErrorMessage(data.message);
      }
    } catch (error) {
      setErrorMessage('Error resending code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4 shadow-lg">
            <Users className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Parent Portal</h1>
          <p className="text-lg text-gray-600">Link with your child's school account</p>
        </div>

        {/* Alerts */}
        <AnimatePresence>
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3"
            >
              <CheckCircle className="w-6 h-6 text-green-600" />
              <p className="text-green-700 font-medium">{successMessage}</p>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSuccessMessage('')}
                className="ml-auto"
              >
                ×
              </Button>
            </motion.div>
          )}
          
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3"
            >
              <AlertCircle className="w-6 h-6 text-red-600" />
              <p className="text-red-700 font-medium">{errorMessage}</p>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setErrorMessage('')}
                className="ml-auto"
              >
                ×
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <Card className="border-2 border-purple-200 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Shield className="w-6 h-6" />
              Verification Process
            </CardTitle>
            <CardDescription className="text-white/90">
              Complete the verification process to link with your child's account
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-6">
            {/* Process Steps */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                {[
                  { step: 1, title: 'Request', icon: Send },
                  { step: 2, title: 'Verify', icon: Key },
                  { step: 3, title: 'Approval', icon: CheckCircle },
                  { step: 4, title: 'Access', icon: Users }
                ].map((s, idx) => (
                  <React.Fragment key={s.step}>
                    <div className="flex flex-col items-center">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        activeTab === 'request' && s.step === 1 ? 'bg-purple-600 text-white' :
                        activeTab === 'verify' && s.step === 2 ? 'bg-purple-600 text-white' :
                        (activeTab === 'approval' || activeTab === 'success') && s.step >= 3 ? 'bg-green-500 text-white' :
                        'bg-gray-200 text-gray-500'
                      }`}>
                        <s.icon className="w-5 h-5" />
                      </div>
                      <span className="text-sm mt-2 font-medium">{s.title}</span>
                    </div>
                    {idx < 3 && (
                      <div className={`flex-1 h-1 mx-2 rounded ${
                        (activeTab === 'verify' && s.step === 1) ||
                        (activeTab === 'approval' && s.step >= 2) ||
                        (activeTab === 'success' && s.step >= 3)
                          ? 'bg-green-500' : 'bg-gray-200'
                      }`} />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3 bg-purple-100">
                <TabsTrigger value="request" className="flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  Request Code
                </TabsTrigger>
                <TabsTrigger value="verify" className="flex items-center gap-2">
                  <Key className="w-4 h-4" />
                  Verify Code
                </TabsTrigger>
                <TabsTrigger value="resend" className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Resend Code
                </TabsTrigger>
              </TabsList>

              {/* Request Tab */}
              <TabsContent value="request" className="space-y-6 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Your Full Name *</Label>
                    <Input
                      value={requestForm.parent_name}
                      onChange={(e) => setRequestForm({ ...requestForm, parent_name: e.target.value })}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <Label>Phone Number *</Label>
                    <Input
                      value={requestForm.parent_phone}
                      onChange={(e) => setRequestForm({ ...requestForm, parent_phone: e.target.value })}
                      placeholder="+250788000000"
                    />
                  </div>
                  <div>
                    <Label>Email (Optional)</Label>
                    <Input
                      type="email"
                      value={requestForm.parent_email}
                      onChange={(e) => setRequestForm({ ...requestForm, parent_email: e.target.value })}
                      placeholder="your@email.com"
                    />
                  </div>
                  <div>
                    <Label>Relationship to Student *</Label>
                    <Select
                      value={requestForm.relationship}
                      onValueChange={(v) => setRequestForm({ ...requestForm, relationship: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="father">Father</SelectItem>
                        <SelectItem value="mother">Mother</SelectItem>
                        <SelectItem value="guardian">Guardian</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Student Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Student First Name *</Label>
                      <Input
                        value={requestForm.student_first_name}
                        onChange={(e) => setRequestForm({ ...requestForm, student_first_name: e.target.value })}
                        placeholder="Student's first name"
                      />
                    </div>
                    <div>
                      <Label>Student Last Name *</Label>
                      <Input
                        value={requestForm.student_last_name}
                        onChange={(e) => setRequestForm({ ...requestForm, student_last_name: e.target.value })}
                        placeholder="Student's last name"
                      />
                    </div>
                    <div>
                      <Label>Trade/Program</Label>
                      <Select
                        value={requestForm.student_trade}
                        onValueChange={(v) => setRequestForm({ ...requestForm, student_trade: v })}
                        disabled={initialLoading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={initialLoading ? "Loading..." : "Select trade"} />
                        </SelectTrigger>
                        <SelectContent>
                          {trades.length > 0 ? (
                            trades.map((trade: any) => (
                              <SelectItem key={trade.trade_code} value={trade.trade_name || trade.trade_code}>
                                {trade.trade_name || trade.trade_code}
                              </SelectItem>
                            ))
                          ) : (
                            <>
                              <SelectItem value="General Education">General Education</SelectItem>
                              <SelectItem value="Agriculture">Agriculture</SelectItem>
                              <SelectItem value="Carpentry">Carpentry</SelectItem>
                              <SelectItem value="Masonry">Masonry</SelectItem>
                              <SelectItem value="Electrical">Electrical</SelectItem>
                              <SelectItem value="Plumbing">Plumbing</SelectItem>
                              <SelectItem value="Hotel Management">Hotel Management</SelectItem>
                              <SelectItem value="Food Production">Food Production</SelectItem>
                            </>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Level</Label>
                      <Select
                        value={requestForm.student_level}
                        onValueChange={(v) => setRequestForm({ ...requestForm, student_level: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Level 1</SelectItem>
                          <SelectItem value="2">Level 2</SelectItem>
                          <SelectItem value="3">Level 3</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Additional Message (Optional)</Label>
                  <Textarea
                    value={requestForm.message}
                    onChange={(e) => setRequestForm({ ...requestForm, message: e.target.value })}
                    placeholder="Any additional information..."
                    rows={3}
                  />
                </div>

                <Button
                  onClick={handleRequestVerification}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-lg py-6"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                      Sending...
                    </div>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Send Verification Code
                    </>
                  )}
                </Button>
              </TabsContent>

              {/* Verify Tab */}
              <TabsContent value="verify" className="space-y-6 mt-6">
                <Card className="border-2 border-blue-200 bg-blue-50">
                  <CardContent className="p-6 text-center">
                    <Phone className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                    <h3 className="font-bold text-xl mb-2">Enter Verification Code</h3>
                    <p className="text-gray-600 mb-4">
                      We sent a verification code to <strong>{requestForm.parent_phone}</strong>
                    </p>
                    <p className="text-sm text-gray-500">
                      The code will expire in 24 hours
                    </p>
                  </CardContent>
                </Card>

                <div>
                  <Label>Verification Code *</Label>
                  <Input
                    value={verificationForm.verification_code}
                    onChange={(e) => setVerificationForm({ ...verificationForm, verification_code: e.target.value.toUpperCase() })}
                    placeholder="Enter 6-character code"
                    className="text-center text-2xl tracking-widest"
                    maxLength={6}
                  />
                </div>

                <div className="flex gap-4">
                  <Button
                    onClick={handleVerifyCode}
                    disabled={loading || !verificationForm.verification_code}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                  >
                    {loading ? 'Verifying...' : 'Verify & Submit'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab('resend')}
                  >
                    Resend Code
                  </Button>
                </div>
              </TabsContent>

              {/* Resend Tab */}
              <TabsContent value="resend" className="space-y-6 mt-6">
                <Card className="border-2 border-orange-200 bg-orange-50">
                  <CardContent className="p-6 text-center">
                    <RefreshCw className="w-12 h-12 text-orange-600 mx-auto mb-4" />
                    <h3 className="font-bold text-xl mb-2">Resend Verification Code</h3>
                    <p className="text-gray-600">
                      Enter your request ID and phone number to receive a new code
                    </p>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Request ID *</Label>
                    <Input
                      value={resendForm.request_id}
                      onChange={(e) => setResendForm({ ...resendForm, request_id: e.target.value })}
                      placeholder="Enter your request ID"
                    />
                  </div>
                  <div>
                    <Label>Phone Number *</Label>
                    <Input
                      value={resendForm.parent_phone}
                      onChange={(e) => setResendForm({ ...resendForm, parent_phone: e.target.value })}
                      placeholder="+250788000000"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleResendCode}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white"
                >
                  {loading ? 'Sending...' : 'Resend Verification Code'}
                </Button>
              </TabsContent>
            </Tabs>

            {/* Info Section */}
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-bold text-gray-900 mb-2">How it works:</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                <li>Fill in your information and your child's details</li>
                <li>We send a verification code to your phone via SMS</li>
                <li>Enter the code to verify your phone number</li>
                <li>Your request is sent to the school administration for approval</li>
                <li>Once approved by Headmaster, DOD, or DOS, you'll get access</li>
                <li>You can then view your child's attendance, marks, fees, and more!</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ParentVerificationPage;
