import React, { useState } from 'react';
import { GlobalStudentSheet } from './GlobalStudentSheet';
import { DollarSign, TrendingUp, TrendingDown, AlertCircle, CheckCircle } from 'lucide-react';
import { Card } from '@/app/components/ui/card';

interface AccountantSheetProps {
  students: any[];
}

export const AccountantSheet: React.FC<AccountantSheetProps> = ({ students }) => {
  const totalFees = students.reduce((sum, s) => sum + s.fees, 0);
  const totalPaid = students.reduce((sum, s) => sum + s.feesPaid, 0);
  const totalBalance = students.reduce((sum, s) => sum + s.feesBalance, 0);
  const collectionRate = ((totalPaid / totalFees) * 100).toFixed(1);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Fees</p>
              <p className="text-2xl font-bold text-green-700">${totalFees.toLocaleString()}</p>
            </div>
            <DollarSign className="w-10 h-10 text-green-600" />
          </div>
        </Card>
        
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Paid</p>
              <p className="text-2xl font-bold text-blue-700">${totalPaid.toLocaleString()}</p>
            </div>
            <CheckCircle className="w-10 h-10 text-blue-600" />
          </div>
        </Card>
        
        <Card className="p-4 bg-gradient-to-br from-red-50 to-orange-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Balance</p>
              <p className="text-2xl font-bold text-red-700">${totalBalance.toLocaleString()}</p>
            </div>
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
        </Card>
        
        <Card className="p-4 bg-gradient-to-br from-purple-50 to-pink-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Collection Rate</p>
              <p className="text-2xl font-bold text-purple-700">{collectionRate}%</p>
            </div>
            <TrendingUp className="w-10 h-10 text-purple-600" />
          </div>
        </Card>
      </div>
      
      <GlobalStudentSheet role="accountant" students={students} />
    </div>
  );
};
