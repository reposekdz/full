import React, { useState, useEffect } from 'react';
import { Database, Download, Plus, Trash2, HardDrive } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Alert, AlertDescription } from '@/app/components/ui/alert';

const BackupPage: React.FC = () => {
  const [backups, setBackups] = useState<any[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBackups();
  }, []);

  const fetchBackups = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/admin/backups', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setBackups(data.backups || []);
    } catch (error) {
      console.error('Fetch error:', error);
    }
  };

  const handleCreateBackup = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/admin/backup', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setMessage({ type: data.success ? 'success' : 'error', text: data.message });
      if (data.success) fetchBackups();
    } catch (error) {
      setMessage({ type: 'error', text: 'Backup failed' });
    }
    setLoading(false);
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Database className="w-10 h-10 text-blue-600" />
          <div>
            <h1 className="text-3xl font-black">Backup</h1>
            <p className="text-gray-600">Gucunga backup y'ububiko / Manage database backups</p>
          </div>
        </div>
        <Button onClick={handleCreateBackup} disabled={loading}>
          <Plus className="w-4 h-4 mr-2" />
          {loading ? 'Gukora...' : 'Kora Backup / Create Backup'}
        </Button>
      </div>

      {message && (
        <Alert className={message.type === 'success' ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <HardDrive className="w-12 h-12 text-blue-600 mb-4" />
            <h3 className="font-bold text-lg">{backups.length} Backups</h3>
            <p className="text-gray-600">Total backups created</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <Database className="w-12 h-12 text-green-600 mb-4" />
            <h3 className="font-bold text-lg">Auto Backup</h3>
            <p className="text-gray-600">Enabled daily at 2 AM</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <Download className="w-12 h-12 text-purple-600 mb-4" />
            <h3 className="font-bold text-lg">Last Backup</h3>
            <p className="text-gray-600">{backups[0] ? new Date(backups[0].created_at).toLocaleDateString() : 'Never'}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Backup History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Izina / Filename</TableHead>
                <TableHead>Ingano / Size</TableHead>
                <TableHead>Wakoze / Created By</TableHead>
                <TableHead>Igihe / Date</TableHead>
                <TableHead>Igikorwa / Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {backups.map((backup) => (
                <TableRow key={backup.id}>
                  <TableCell className="font-medium">{backup.filename}</TableCell>
                  <TableCell>{(backup.size / 1024).toFixed(2)} KB</TableCell>
                  <TableCell>{backup.created_by}</TableCell>
                  <TableCell>{new Date(backup.created_at).toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default BackupPage;
