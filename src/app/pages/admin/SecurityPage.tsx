import React, { useState, useEffect } from 'react';
import { Shield, Lock, Key, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Badge } from '@/app/components/ui/badge';

const SecurityPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/admin/security/logs', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setLogs(data.logs || []);
    } catch (error) {
      console.error('Fetch error:', error);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <Shield className="w-10 h-10 text-blue-600" />
        <div>
          <h1 className="text-3xl font-black">Umutekano / Security</h1>
          <p className="text-gray-600">Reba ibikorwa n'umutekano / Monitor security and activities</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <Lock className="w-12 h-12 text-green-600 mb-4" />
            <h3 className="font-bold text-lg">Secure</h3>
            <p className="text-gray-600">System is protected</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <Key className="w-12 h-12 text-blue-600 mb-4" />
            <h3 className="font-bold text-lg">Encrypted</h3>
            <p className="text-gray-600">Data is encrypted</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <AlertTriangle className="w-12 h-12 text-yellow-600 mb-4" />
            <h3 className="font-bold text-lg">0 Threats</h3>
            <p className="text-gray-600">No security issues</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ibikorwa bya Vuba / Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Igikorwa / Action</TableHead>
                <TableHead>Umukoresha / User</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Igihe / Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log, idx) => (
                <TableRow key={idx}>
                  <TableCell><Badge>{log.action}</Badge></TableCell>
                  <TableCell>{log.user}</TableCell>
                  <TableCell>{log.ip_address}</TableCell>
                  <TableCell>{new Date(log.created_at).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityPage;
