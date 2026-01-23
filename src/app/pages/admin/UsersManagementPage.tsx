import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit, Trash2, Search, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Badge } from '@/app/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';

const UsersManagementPage: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editUser, setEditUser] = useState<any>(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', role: 'student', password: '' });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Fetch error:', error);
    }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const url = editUser ? `http://localhost:5000/api/admin/users/${editUser.id}` : 'http://localhost:5000/api/admin/users';
      const method = editUser ? 'PUT' : 'POST';
      await fetch(url, {
        method,
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      setIsDialogOpen(false);
      setEditUser(null);
      setForm({ name: '', email: '', phone: '', role: 'student', password: '' });
      fetchUsers();
    } catch (error) {
      console.error('Save error:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Urashaka gusiba uyu mukoresha? / Delete this user?')) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5000/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchUsers();
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const filteredUsers = users.filter(u => 
    (roleFilter === 'all' || u.role === roleFilter) &&
    (u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Users className="w-10 h-10 text-blue-600" />
          <div>
            <h1 className="text-3xl font-black">Abakoresha / Users</h1>
            <p className="text-gray-600">Gucunga abakoresha bose / Manage all system users</p>
          </div>
        </div>
        <Button onClick={() => { setEditUser(null); setForm({ name: '', email: '', phone: '', role: 'student', password: '' }); setIsDialogOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          Ongeraho / Add User
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex gap-4">
            <Input placeholder="Shakisha / Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1" />
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Byose / All</SelectItem>
                <SelectItem value="student">Abanyeshuri / Students</SelectItem>
                <SelectItem value="teacher">Abarimu / Teachers</SelectItem>
                <SelectItem value="parent">Ababyeyi / Parents</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Izina / Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Telefone / Phone</TableHead>
                <TableHead>Uruhare / Role</TableHead>
                <TableHead>Igikorwa / Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone}</TableCell>
                  <TableCell><Badge>{user.role}</Badge></TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => { setEditUser(user); setForm({ name: user.name, email: user.email, phone: user.phone, role: user.role, password: '' }); setIsDialogOpen(true); }}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(user.id)}>
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editUser ? 'Hindura / Edit' : 'Ongeraho / Add'} Umukoresha / User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Izina / Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <Label>Email</Label>
              <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <Label>Telefone / Phone</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div>
              <Label>Uruhare / Role</Label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Umunyeshuri / Student</SelectItem>
                  <SelectItem value="teacher">Umwarimu / Teacher</SelectItem>
                  <SelectItem value="parent">Umubyeyi / Parent</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {!editUser && (
              <div>
                <Label>Ijambo Ryibanga / Password</Label>
                <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              </div>
            )}
            <Button onClick={handleSave} className="w-full">Bika / Save</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersManagementPage;
