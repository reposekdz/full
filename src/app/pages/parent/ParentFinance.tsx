import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { DollarSign, CreditCard, Receipt, TrendingUp, Download, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Progress } from '@/app/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import apiService from '@/app/services/apiService';

export default function ParentFinance() {
  const [children, setChildren] = useState<any[]>([]);
  const [selectedChild, setSelectedChild] = useState<any>(null);
  const [fees, setFees] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChildren();
  }, []);

  useEffect(() => {
    if (selectedChild) {
      fetchFees();
    }
  }, [selectedChild]);

  const fetchChildren = async () => {
    try {
      setLoading(true);
      const data = await apiService.getMyChildren();
      const childrenArray = Array.isArray(data) ? data : [];
      setChildren(childrenArray);
      if (childrenArray.length > 0) setSelectedChild(childrenArray[0]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFees = async () => {
    if (!selectedChild) return;
    try {
      const data = await apiService.getChildFees(selectedChild.user_id);
      setFees(data?.summary || null);
      setTransactions(data?.transactions || []);
    } catch (err) {
      console.error(err);
      setFees(null);
      setTransactions([]);
    }
  };

  const formatMoney = (amount: number) => {
    return `FRw ${amount.toLocaleString()}`;
  };

  const getPaymentStatus = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid': 
      case 'completed': 
        return { color: 'bg-green-100 text-green-700 border-green-300', icon: <CheckCircle className="w-4 h-4" /> };
      case 'pending': 
        return { color: 'bg-yellow-100 text-yellow-700 border-yellow-300', icon: <Clock className="w-4 h-4" /> };
      case 'failed': 
      case 'cancelled': 
        return { color: 'bg-red-100 text-red-700 border-red-300', icon: <XCircle className="w-4 h-4" /> };
      default: 
        return { color: 'bg-gray-100 text-gray-700 border-gray-300', icon: null };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardContent className="p-12 text-center">
            <DollarSign className="w-24 h-24 mx-auto text-gray-300 mb-4" />
            <h3 className="text-2xl font-bold text-gray-600 mb-2">Nta mwana uhujwe</h3>
            <p className="text-gray-500">Huza umwana mbere yo kureba amafaranga</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalPaid = fees?.total_paid || 0;
  const totalRequired = fees?.total_required || 0;
  const balance = fees?.balance || 0;
  const paymentPercentage = totalRequired > 0 ? (totalPaid / totalRequired) * 100 : 0;

  return (
    <div className="p-8 space-y-8 bg-gradient-to-br from-purple-50 via-white to-blue-50 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Amafaranga y'Ishuri
          </h1>
          <p className="text-gray-600">Reba no kwishyura amafaranga y'ishuri</p>
        </div>
        <div className="flex gap-4 items-center">
          <Select value={selectedChild?.user_id?.toString()} onValueChange={(id) => setSelectedChild(children.find(c => c.user_id.toString() === id))}>
            <SelectTrigger className="w-64 border-2 border-purple-100">
              <SelectValue placeholder="Hitamo umwana" />
            </SelectTrigger>
            <SelectContent>
              {children.map((child) => (
                <SelectItem key={child.user_id} value={child.user_id.toString()}>
                  {child.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button className="bg-gradient-to-r from-green-600 to-teal-600 text-white">
            <CreditCard className="w-4 h-4 mr-2" />
            Ishyura Ubu
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        <Card className="border-2 border-purple-100 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-8 h-8 text-purple-600" />
              <Badge className="bg-purple-100 text-purple-700">Yose</Badge>
            </div>
            <p className="text-3xl font-black text-purple-900">{formatMoney(totalRequired)}</p>
            <p className="text-sm text-gray-600">Amafaranga Yose</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-100 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <Badge className="bg-green-100 text-green-700">Byishyuwe</Badge>
            </div>
            <p className="text-3xl font-black text-green-900">{formatMoney(totalPaid)}</p>
            <p className="text-sm text-gray-600">Wishyuye</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-red-100 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-red-600" />
              <Badge className="bg-red-100 text-red-700">Ikirarane</Badge>
            </div>
            <p className="text-3xl font-black text-red-900">{formatMoney(balance)}</p>
            <p className="text-sm text-gray-600">Ugomba Kwishyura</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-100 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Receipt className="w-8 h-8 text-blue-600" />
              <Badge className="bg-blue-100 text-blue-700">Raporo</Badge>
            </div>
            <p className="text-3xl font-black text-blue-900">{transactions.length}</p>
            <p className="text-sm text-gray-600">Amahuriro</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-2 border-purple-100 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 border-b-2 border-purple-100">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Ijanisha ry'Kwishyura
              </CardTitle>
              <CardDescription>Amafaranga wishyuye no ugomba kwishyura</CardDescription>
            </div>
            <div className="text-right">
              <p className="text-3xl font-black text-purple-900">{paymentPercentage.toFixed(1)}%</p>
              <p className="text-sm text-gray-600">Wishyuye</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <Progress value={paymentPercentage} className="h-4 mb-4" />
          <div className="grid grid-cols-3 gap-6">
            <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl text-center">
              <p className="text-3xl font-black text-purple-900">{formatMoney(totalRequired)}</p>
              <p className="text-sm text-purple-700 mt-1">Yose Ugomba</p>
            </div>
            <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl text-center">
              <p className="text-3xl font-black text-green-900">{formatMoney(totalPaid)}</p>
              <p className="text-sm text-green-700 mt-1">Wishyuye</p>
            </div>
            <div className="p-6 bg-gradient-to-br from-red-50 to-red-100 rounded-xl text-center">
              <p className="text-3xl font-black text-red-900">{formatMoney(balance)}</p>
              <p className="text-sm text-red-700 mt-1">Ikirarane</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-purple-100 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 border-b-2 border-purple-100">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="w-5 h-5" />
                Amatariki y'Kwishyura
              </CardTitle>
              <CardDescription>Amahuriro yose y'amafaranga</CardDescription>
            </div>
            <Button variant="outline" className="border-2 border-purple-200">
              <Download className="w-4 h-4 mr-2" />
              Kurura Raporo
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {transactions.length === 0 ? (
            <div className="text-center py-12">
              <Receipt className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">Nta mahuriro abonetse</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction, index) => {
                const statusInfo = getPaymentStatus(transaction.status);
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className="flex items-center justify-between p-4 bg-white rounded-xl border-2 border-gray-100 hover:border-purple-200 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{transaction.description || 'School Fees'}</p>
                        <p className="text-sm text-gray-500">{transaction.date ? new Date(transaction.date).toLocaleDateString() : 'N/A'}</p>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-4">
                      <div>
                        <p className="text-xl font-black text-gray-900">{formatMoney(transaction.amount)}</p>
                        <Badge className={`flex items-center gap-2 border-2 mt-1 ${statusInfo.color}`}>
                          {statusInfo.icon}
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
