import React, { useState, useEffect } from 'react';
import { DollarSign, Plus, Search, Download, Eye, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Badge } from '@/app/components/ui/badge';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import AccountantSidebar from '@/app/components/AccountantSidebar';

const PaymentsManagement: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const [payments, setPayments] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [filters, setFilters] = useState({ search: '', status: '', payment_type: '' });
  const [newPayment, setNewPayment] = useState({ student_id: '', amount: '', payment_type: '', payment_method: '', description: '' });
  const API_BASE = 'http://localhost:5000/api';

  useEffect(() => { fetchPayments(); fetchStudents(); }, [filters]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ ...(filters.search && { search: filters.search }), ...(filters.status && { status: filters.status }) });
      const response = await fetch(`${API_BASE}/accountant/payments?${params}`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
      const data = await response.json();
      if (data.success) setPayments(data.payments);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await fetch(`${API_BASE}/students/list?limit=1000`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
      const data = await response.json();
      if (data.success) setStudents(data.students);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleAddPayment = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/accountant/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify(newPayment)
      });
      const data = await response.json();
      if (data.success) {
        alert('Payment recorded!');
        setIsAddDialogOpen(false);
        setNewPayment({ student_id: '', amount: '', payment_type: '', payment_method: '', description: '' });
        fetchPayments();
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      const response = await fetch(`${API_BASE}/accountant/payments/${id}/approve`, { method: 'PUT', headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
      const data = await response.json();
      if (data.success) { alert('Payment approved!'); fetchPayments(); }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const formatCurrency = (amount: number) => new Intl.NumberFormat('rw-RW', { style: 'currency', currency: 'RWF', minimumFractionDigits: 0 }).format(amount);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <AccountantSidebar currentPage="payments-management" onNavigate={onNavigate} />
      <div className="flex-1 overflow-auto p-8">
        <Card className="border-2 border-emerald-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2"><DollarSign className="w-6 h-6 text-emerald-600" />Kwishyura</CardTitle>
              <Button onClick={() => setIsAddDialogOpen(true)} className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
                <Plus className="w-4 h-4 mr-2" />Ongeraho
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input placeholder="Shakisha..." value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} className="pl-10" />
              </div>
              <Select value={filters.status} onValueChange={(v) => setFilters({ ...filters, status: v })}>
                <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Byose</SelectItem>
                  <SelectItem value="pending">Bitegerejwe</SelectItem>
                  <SelectItem value="approved">Byemejwe</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filters.payment_type} onValueChange={(v) => setFilters({ ...filters, payment_type: v })}>
                <SelectTrigger><SelectValue placeholder="Ubwoko" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Byose</SelectItem>
                  <SelectItem value="tuition">Amafaranga y'Ishuri</SelectItem>
                  <SelectItem value="transport">Transport</SelectItem>
                  <SelectItem value="hostel">Hostel</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Umunyeshuri</TableHead>
                  <TableHead>Amafaranga</TableHead>
                  <TableHead>Ubwoko</TableHead>
                  <TableHead>Itariki</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ibikorwa</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? <TableRow><TableCell colSpan={6} className="text-center">Gukuramo...</TableCell></TableRow> : payments.length === 0 ? <TableRow><TableCell colSpan={6} className="text-center">Nta kwishyura</TableCell></TableRow> : payments.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{p.student_name}</TableCell>
                    <TableCell className="font-bold text-emerald-600">{formatCurrency(p.amount)}</TableCell>
                    <TableCell><Badge variant="outline">{p.payment_type}</Badge></TableCell>
                    <TableCell>{new Date(p.payment_date).toLocaleDateString()}</TableCell>
                    <TableCell><Badge variant={p.status === 'approved' ? 'default' : 'secondary'}>{p.status === 'approved' ? 'Byemejwe' : 'Bitegerejwe'}</Badge></TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline"><Eye className="w-4 h-4" /></Button>
                        {p.status === 'pending' && <Button size="sm" className="bg-emerald-600 text-white" onClick={() => handleApprove(p.id)}><Check className="w-4 h-4" /></Button>}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Ongeraho Kwishyura</DialogTitle></DialogHeader>
            <div className="grid gap-4">
              <div>
                <Label>Umunyeshuri</Label>
                <Select value={newPayment.student_id} onValueChange={(v) => setNewPayment({ ...newPayment, student_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Hitamo" /></SelectTrigger>
                  <SelectContent>{students.map(s => <SelectItem key={s.id} value={s.id.toString()}>{s.first_name} {s.last_name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Amafaranga</Label>
                <Input type="number" value={newPayment.amount} onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })} />
              </div>
              <div>
                <Label>Ubwoko</Label>
                <Select value={newPayment.payment_type} onValueChange={(v) => setNewPayment({ ...newPayment, payment_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tuition">Amafaranga y'Ishuri</SelectItem>
                    <SelectItem value="transport">Transport</SelectItem>
                    <SelectItem value="hostel">Hostel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Uburyo</Label>
                <Select value={newPayment.payment_method} onValueChange={(v) => setNewPayment({ ...newPayment, payment_method: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="mobile_money">Mobile Money</SelectItem>
                    <SelectItem value="bank">Bank</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Hagarika</Button>
              <Button onClick={handleAddPayment} disabled={loading} className="bg-emerald-600 text-white">Bika</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default PaymentsManagement;
