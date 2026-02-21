import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, AlertCircle, RefreshCw, Phone, Mail, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { toast } from 'sonner';

const API_BASE = 'http://localhost:5000/api';

const ParentWaitingDashboard = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchApplications();
    const interval = setInterval(fetchApplications, 30000); // Auto-refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchApplications = async () => {
    try {
      setRefreshing(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/parent-child-linking/my-applications`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        setApplications(data.applications || []);
        
        // Check if any approved - redirect to main dashboard
        const hasApproved = data.applications?.some(app => app.status === 'approved');
        if (hasApproved) {
          toast.success('Icyifuzo cyawe cyemejwe! Urakurikiranwa...');
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        }
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'pending':
        return {
          icon: <Clock className="w-6 h-6" />,
          text: 'Tegereza',
          color: 'bg-yellow-500',
          description: 'Icyifuzo cyawe kiri mu gusuzumwa'
        };
      case 'approved':
        return {
          icon: <CheckCircle className="w-6 h-6" />,
          text: 'Byemejwe',
          color: 'bg-green-500',
          description: 'Icyifuzo cyawe cyemejwe!'
        };
      case 'rejected':
        return {
          icon: <XCircle className="w-6 h-6" />,
          text: 'Byanze',
          color: 'bg-red-500',
          description: 'Icyifuzo cyawe cyanze'
        };
      default:
        return {
          icon: <AlertCircle className="w-6 h-6" />,
          text: status,
          color: 'bg-gray-500',
          description: ''
        };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-gray-700">Gukurura amakuru...</p>
        </div>
      </div>
    );
  }

  const pendingApps = applications.filter(a => a.status === 'pending');
  const approvedApps = applications.filter(a => a.status === 'approved');
  const rejectedApps = applications.filter(a => a.status === 'rejected');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-block p-4 bg-white rounded-full shadow-lg mb-4">
            <Clock className="w-12 h-12 text-blue-600 animate-pulse" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Uri ku Rutonde rw'Abahagaritse
          </h1>
          <p className="text-gray-600 text-lg">
            Icyifuzo cyawe kiri mu gusuzumwa n'abakozi b'ishuri
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-l-4 border-yellow-500 hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Bitegerejwe</p>
                  <p className="text-3xl font-bold text-yellow-600">{pendingApps.length}</p>
                </div>
                <Clock className="w-12 h-12 text-yellow-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-green-500 hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Byemejwe</p>
                  <p className="text-3xl font-bold text-green-600">{approvedApps.length}</p>
                </div>
                <CheckCircle className="w-12 h-12 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-red-500 hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Byanze</p>
                  <p className="text-3xl font-bold text-red-600">{rejectedApps.length}</p>
                </div>
                <XCircle className="w-12 h-12 text-red-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Refresh Button */}
        <div className="flex justify-center mb-6">
          <Button
            onClick={fetchApplications}
            disabled={refreshing}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Gukurura...' : 'Kuvugurura'}
          </Button>
        </div>

        {/* Applications List */}
        <div className="space-y-6">
          {applications.map((app) => {
            const statusInfo = getStatusInfo(app.status);
            return (
              <Card key={app.id} className="hover:shadow-2xl transition-all duration-300 border-2">
                <CardHeader className={`${statusInfo.color} text-white`}>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {statusInfo.icon}
                      <span>{statusInfo.text}</span>
                    </div>
                    <Badge variant="secondary" className="bg-white text-gray-800">
                      #{app.application_code || app.id}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Student Info */}
                    <div className="space-y-3">
                      <h3 className="font-bold text-lg text-gray-800 mb-3 flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Amakuru y'Umwana
                      </h3>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-semibold">Izina:</span> {app.child_first_name} {app.child_last_name}</p>
                        <p><span className="font-semibold">Igitsina:</span> {app.child_gender === 'Male' ? 'Gabo' : 'Gore'}</p>
                        <p><span className="font-semibold">Umwuga:</span> {app.trade_name || app.child_trade_code}</p>
                        <p><span className="font-semibold">Urwego:</span> Level {app.child_level_number}</p>
                        {app.student_code && (
                          <p><span className="font-semibold">Code:</span> {app.student_code}</p>
                        )}
                      </div>
                    </div>

                    {/* Status Info */}
                    <div className="space-y-3">
                      <h3 className="font-bold text-lg text-gray-800 mb-3">Aho Bigeze</h3>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-2">{statusInfo.description}</p>
                        <p className="text-xs text-gray-500">
                          Yoherejwe: {new Date(app.created_at).toLocaleDateString('rw-RW', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                        {app.reviewed_at && (
                          <p className="text-xs text-gray-500 mt-1">
                            Yasuzumwe: {new Date(app.reviewed_at).toLocaleDateString('rw-RW', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        )}
                      </div>

                      {app.status === 'rejected' && app.rejection_reason && (
                        <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded">
                          <p className="text-sm font-semibold text-red-800 mb-1 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            Impamvu yo Kwanga
                          </p>
                          <p className="text-sm text-red-700">{app.rejection_reason}</p>
                        </div>
                      )}

                      {app.status === 'approved' && (
                        <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded">
                          <p className="text-sm font-semibold text-green-800 mb-1 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            Byemejwe!
                          </p>
                          <p className="text-sm text-green-700">
                            Ubu ushobora kureba amakuru yose y'umwana wawe. Ikiganiro kizakurikiranwa...
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Help Section */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600" />
              Ubufasha
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-blue-600 mt-1" />
                <div>
                  <p className="font-semibold">Hamagara</p>
                  <p className="text-gray-600">+250 788 123 456</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-blue-600 mt-1" />
                <div>
                  <p className="font-semibold">Email</p>
                  <p className="text-gray-600">info@gardentvet.ac.rw</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ParentWaitingDashboard;
