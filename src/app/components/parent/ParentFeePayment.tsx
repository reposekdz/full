import React, { useState, useEffect } from 'react';
import { DollarSign, CreditCard, Smartphone, Building, CheckCircle, Receipt } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Badge } from '@/app/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/app/components/ui/dialog';
import axios from 'axios';
import { toast } from 'sonner';

const API_BASE = 'http://localhost:5000/api';

const ParentFeePayment = ({ studentId, studentName }) => {
  const [feeDetails, setFeeDetails] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState({
    amount: '',
    payment_method: 'mobile_money',
    reference_number: ''
  });

  useEffect(() => {
    if (studentId) loadFeeDetails();
  }, [studentId]);

  const loadFeeDetails = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE}/fee-payment/student/${studentId}/fees`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setFeeDetails(response.data.fee_details);
        setPaymentHistory(response.data.payment_history || []);
      }
    } catch (error) {
      toast.error('Failed to load fee details');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!paymentData.amount || parseFloat(paymentData.amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_BASE}/fee-payment/payment/make`, {
        student_id: studentId,
        ...paymentData,
        amount: parseFloat(paymentData.amount)
      }, { headers: { Authorization: `Bearer ${token}` } });
      if (response.data.success) {
        toast.success('✅ Payment successful! SMS sent.');
        setShowPaymentDialog(false);
        setPaymentData({ amount: '', payment_method: 'mobile_money', reference_number: '' });
        loadFeeDetails();
      }
    } catch (error) {
      toast.error('Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-2 border-blue-500">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-6 h-6" />
            Fee Summary - {studentName}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {feeDetails && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-blue-700">{feeDetails.total_amount?.toLocaleString()} RWF</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Paid</p>
                  <p className="text-2xl font-bold text-green-700">{feeDetails.paid_amount?.toLocaleString()} RWF</p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <p className="text-sm text-gray-600">Balance</p>
                  <p className="text-2xl font-bold text-red-700">{feeDetails.balance?.toLocaleString()} RWF</p>
                </div>
              </div>
              {feeDetails.balance > 0 && (
                <Button onClick={() => setShowPaymentDialog(true)} className="w-full bg-green-600 text-lg py-6">
                  <DollarSign className="w-5 h-5 mr-2" />Make Payment
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Payment History</CardTitle></CardHeader>
        <CardContent>
          {paymentHistory.map((p) => (
            <div key={p.id} className="p-4 border rounded mb-2">
              <div className="flex justify-between">
                <div><p className="font-bold">{p.amount.toLocaleString()} RWF</p><p className="text-sm">{p.payment_method}</p></div>
                <p className="text-xs">{new Date(p.payment_date).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Make Payment</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Amount</Label><Input type="number" value={paymentData.amount} onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })} /></div>
            <div><Label>Method</Label><select value={paymentData.payment_method} onChange={(e) => setPaymentData({ ...paymentData, payment_method: e.target.value })} className="w-full border rounded p-2"><option value="mobile_money">Mobile Money</option><option value="bank_transfer">Bank</option><option value="cash">Cash</option></select></div>
            <div><Label>Reference</Label><Input value={paymentData.reference_number} onChange={(e) => setPaymentData({ ...paymentData, reference_number: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>Cancel</Button>
            <Button onClick={handlePayment} disabled={loading} className="bg-green-600">{loading ? 'Processing...' : 'Pay'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ParentFeePayment;
