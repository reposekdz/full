import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Users, AlertCircle, Download, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import axios from 'axios';
import { toast } from 'sonner';

const API_BASE = 'http://localhost:5000/api';

const AccountantFeeDashboard = () => {
  const [statistics, setStatistics] = useState(null);
  const [payments, setPayments] = useState([]);
  const [outstanding, setOutstanding] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const [statsRes, paymentsRes, outstandingRes] = await Promise.all([
        axios.get(`${API_BASE}/fee-payment/accountant/statistics`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_BASE}/fee-payment/accountant/payments`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_BASE}/fee-payment/accountant/outstanding`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setStatistics(statsRes.data.statistics);
      setPayments(paymentsRes.data.payments || []);
      setOutstanding(outstandingRes.data.students || []);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const sendReminder = async (studentId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE}/fee-payment/accountant/send-reminder/${studentId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Reminder sent to parents');
    } catch (error) {
      toast.error('Failed to send reminder');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Fee Management Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4">
            <p className="text-sm opacity-90">Total Fees</p>
            <p className="text-3xl font-bold">{statistics?.overview?.total_fees?.toLocaleString() || 0} RWF</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-4">
            <p className="text-sm opacity-90">Total Paid</p>
            <p className="text-3xl font-bold">{statistics?.overview?.total_paid?.toLocaleString() || 0} RWF</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
          <CardContent className="p-4">
            <p className="text-sm opacity-90">Balance</p>
            <p className="text-3xl font-bold">{statistics?.overview?.total_balance?.toLocaleString() || 0} RWF</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-4">
            <p className="text-sm opacity-90">Today</p>
            <p className="text-3xl font-bold">{statistics?.today?.total?.toLocaleString() || 0} RWF</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Payments */}
      <Card>
        <CardHeader><CardTitle>Recent Payments</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left">Date</th>
                  <th className="px-4 py-2 text-left">Student</th>
                  <th className="px-4 py-2 text-left">Amount</th>
                  <th className="px-4 py-2 text-left">Method</th>
                  <th className="px-4 py-2 text-left">Parent</th>
                  <th className="px-4 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.slice(0, 20).map((p) => (
                  <tr key={p.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm">{new Date(p.payment_date).toLocaleDateString()}</td>
                    <td className="px-4 py-2"><p className="font-semibold">{p.student_name}</p><p className="text-xs text-gray-500">{p.student_code}</p></td>
                    <td className="px-4 py-2 font-bold">{p.amount.toLocaleString()} RWF</td>
                    <td className="px-4 py-2 text-sm">{p.payment_method}</td>
                    <td className="px-4 py-2 text-sm">{p.parent_name}</td>
                    <td className="px-4 py-2"><Badge className="bg-green-500">Completed</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Outstanding Fees */}
      <Card>
        <CardHeader><CardTitle>Outstanding Fees</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left">Student</th>
                  <th className="px-4 py-2 text-left">Trade</th>
                  <th className="px-4 py-2 text-left">Total</th>
                  <th className="px-4 py-2 text-left">Paid</th>
                  <th className="px-4 py-2 text-left">Balance</th>
                  <th className="px-4 py-2 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {outstanding.slice(0, 20).map((s) => (
                  <tr key={s.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2"><p className="font-semibold">{s.student_name}</p><p className="text-xs text-gray-500">{s.student_code}</p></td>
                    <td className="px-4 py-2 text-sm">{s.trade_code} L{s.level_number}</td>
                    <td className="px-4 py-2">{s.total_amount?.toLocaleString() || 0} RWF</td>
                    <td className="px-4 py-2 text-green-600">{s.paid_amount?.toLocaleString() || 0} RWF</td>
                    <td className="px-4 py-2 font-bold text-red-600">{s.balance?.toLocaleString() || 0} RWF</td>
                    <td className="px-4 py-2">
                      <Button size="sm" onClick={() => sendReminder(s.id)} className="bg-blue-600"><Send className="w-3 h-3 mr-1" />Remind</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountantFeeDashboard;
