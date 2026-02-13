import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Key, Lock, History, Shield, Save, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import apiService from '@/app/services/apiService';

const StaffAccessCodeManager: React.FC = () => {
  const [currentCode, setCurrentCode] = useState<any>(null);
  const [newCode, setNewCode] = useState('');
  const [changeReason, setChangeReason] = useState('');
  const [showCurrentCode, setShowCurrentCode] = useState(false);
  const [showNewCode, setShowNewCode] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    fetchCurrentCode();
  }, []);

  const fetchCurrentCode = async () => {
    try {
      const res = await apiService.get('/api/staff-access-codes/access-code');
      if (res.success) {
        setCurrentCode(res.accessCode);
      }
    } catch (error) {
      console.error('Error fetching access code:', error);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await apiService.get('/api/staff-access-codes/access-code/history');
      if (res.success) {
        setHistory(res.history);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const handleUpdateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newCode || newCode.length < 4) {
      alert('Access code must be at least 4 characters');
      return;
    }

    if (!window.confirm('Are you sure you want to change the staff access code? This will affect all staff logins.')) {
      return;
    }

    setLoading(true);
    try {
      const res = await apiService.put('/api/staff-access-codes/access-code', {
        new_code: newCode,
        change_reason: changeReason
      });

      if (res.success) {
        alert('Access code updated successfully!');
        setNewCode('');
        setChangeReason('');
        fetchCurrentCode();
      }
    } catch (error: any) {
      console.error('Error updating access code:', error);
      alert(error.response?.data?.message || 'Failed to update access code');
    } finally {
      setLoading(false);
    }
  };

  const handleShowHistory = async () => {
    if (!showHistory) {
      await fetchHistory();
    }
    setShowHistory(!showHistory);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-gray-900 flex items-center gap-2">
            <Shield className="h-8 w-8 text-yellow-500" />
            Staff Access Code Management
          </h2>
          <p className="text-gray-600 mt-1">Manage the access code for staff portal login</p>
        </div>
      </div>

      {/* Current Access Code */}
      <Card className="border-2 border-yellow-200">
        <CardHeader className="bg-gradient-to-r from-yellow-50 to-green-50">
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-yellow-600" />
            Current Access Code
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {currentCode ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Active Code
                  </label>
                  <div className="flex items-center gap-2">
                    <Input
                      type={showCurrentCode ? 'text' : 'password'}
                      value={currentCode.code_value}
                      readOnly
                      className="font-mono text-lg border-2 border-yellow-300 bg-yellow-50"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowCurrentCode(!showCurrentCode)}
                      className="border-2 border-yellow-300"
                    >
                      {showCurrentCode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-bold text-gray-600">Last Updated:</span>
                  <p className="text-gray-900">
                    {currentCode.updated_at ? new Date(currentCode.updated_at).toLocaleString() : 'Never'}
                  </p>
                </div>
                <div>
                  <span className="font-bold text-gray-600">Status:</span>
                  <div className="mt-1">
                    <Badge className="bg-green-100 text-green-700">
                      Active
                    </Badge>
                  </div>
                </div>
              </div>

              {currentCode.description && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-900">
                    <AlertCircle className="h-4 w-4 inline mr-1" />
                    {currentCode.description}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500">Loading...</p>
          )}
        </CardContent>
      </Card>

      {/* Update Access Code Form */}
      <Card className="border-2 border-green-200">
        <CardHeader className="bg-gradient-to-r from-green-50 to-yellow-50">
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-green-600" />
            Update Access Code
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleUpdateCode} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                New Access Code *
              </label>
              <div className="flex items-center gap-2">
                <Input
                  type={showNewCode ? 'text' : 'password'}
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  placeholder="Enter new access code (min 4 characters)"
                  className="border-2 border-green-300"
                  required
                  minLength={4}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowNewCode(!showNewCode)}
                  className="border-2 border-green-300"
                >
                  {showNewCode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Minimum 4 characters. Use a combination of letters, numbers, and symbols.
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Reason for Change (Optional)
              </label>
              <textarea
                value={changeReason}
                onChange={(e) => setChangeReason(e.target.value)}
                placeholder="Why are you changing the access code?"
                className="w-full h-20 border-2 border-green-300 rounded-lg px-3 py-2"
              />
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p className="text-sm text-orange-900 flex items-start gap-2">
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Warning:</strong> Changing the access code will require all staff members 
                  to use the new code for portal access. Make sure to communicate the new code to 
                  authorized staff members.
                </span>
              </p>
            </div>

            <Button
              type="submit"
              disabled={loading || !newCode}
              className="w-full bg-gradient-to-r from-green-500 to-yellow-500 text-white font-bold"
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Updating...' : 'Update Access Code'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Change History */}
      <Card className="border-2 border-blue-200">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-blue-600" />
              Change History
            </CardTitle>
            <Button
              variant="outline"
              onClick={handleShowHistory}
              className="border-2 border-blue-300"
            >
              {showHistory ? 'Hide' : 'Show'} History
            </Button>
          </div>
        </CardHeader>
        {showHistory && (
          <CardContent className="pt-6">
            {history.length > 0 ? (
              <div className="space-y-3">
                {history.map((entry) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-blue-100 text-blue-700">
                            {new Date(entry.changed_at).toLocaleString()}
                          </Badge>
                          <span className="text-sm text-gray-600">
                            by {entry.first_name} {entry.last_name} ({entry.changed_by_username})
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-bold text-gray-600">Old Code:</span>
                            <p className="font-mono text-red-600">{entry.old_value}</p>
                          </div>
                          <div>
                            <span className="font-bold text-gray-600">New Code:</span>
                            <p className="font-mono text-green-600">{entry.new_value}</p>
                          </div>
                        </div>
                        {entry.change_reason && (
                          <div className="mt-2 text-sm">
                            <span className="font-bold text-gray-600">Reason:</span>
                            <p className="text-gray-700">{entry.change_reason}</p>
                          </div>
                        )}
                        {entry.ip_address && (
                          <div className="mt-1 text-xs text-gray-500">
                            IP: {entry.ip_address}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No change history available</p>
            )}
          </CardContent>
        )}
      </Card>

      {/* Information Card */}
      <Card className="border-2 border-purple-200">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-purple-600" />
            Important Information
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-yellow-500 font-bold">•</span>
              <span>Only Admin and Headmaster can update the staff access code</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-500 font-bold">•</span>
              <span>All changes are logged with timestamp, user, and IP address</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-500 font-bold">•</span>
              <span>Staff members need this code to access the management portal</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-500 font-bold">•</span>
              <span>Current default code is: <code className="bg-gray-100 px-2 py-1 rounded">g@2026</code></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-500 font-bold">•</span>
              <span>Recommended to change the code periodically for security</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default StaffAccessCodeManager;
