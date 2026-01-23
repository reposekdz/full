import React, { useState, useEffect } from 'react';
import { FileText, Filter, Search, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Badge } from '@/app/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';

const LogsPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

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

  const filteredLogs = logs.filter(log => 
    (filter === 'all' || log.action === filter) &&
    (log.user?.toLowerCase().includes(search.toLowerCase()) || log.action?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <FileText className="w-10 h-10 text-blue-600" />
        <div>
          <h1 className="text-3xl font-black">Logs</h1>
          <p className="text-gray-600">Reba ibikorwa bya sisitemu / View system activity logs</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex gap-4">
            <Input 
              placeholder="Shakisha / Search..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              className="flex-1" 
            />
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Byose / All</SelectItem>
                <SelectItem value="login">Login</SelectItem>
                <SelectItem value="logout">Logout</SelectItem>
                <SelectItem value="create">Create</SelectItem>
                <SelectItem value="update">Update</SelectItem>
                <SelectItem value="delete">Delete</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Igikorwa / Action</TableHead>
                <TableHead>Umukoresha / User</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Ibisobanuro / Details</TableHead>
                <TableHead>Igihe / Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log, idx) => (
                <TableRow key={idx}>
                  <TableCell>
                    <Badge variant={log.action === 'login' ? 'default' : log.action === 'delete' ? 'destructive' : 'secondary'}>
                      {log.action}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{log.user}</TableCell>
                  <TableCell>{log.ip_address}</TableCell>
                  <TableCell className="text-sm text-gray-600">{log.details}</TableCell>
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

export default LogsPage;
