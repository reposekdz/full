import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  DollarSign, 
  TrendingUp, 
  Receipt,
  CreditCard,
  AlertCircle,
  Plus,
  Download,
  Search,
  Calendar,
  PieChart,
  BarChart3,
  RefreshCw,
  FileText,
  Wallet,
  Target
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import apiService from '../../services/apiService';

export default function AccountantDashboardAdvanced() {
  const [feeStructures, setFeeStructures] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [outstandingBalances, setOutstandingBalances] = useState<any[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [dailyRevenue, setDailyRevenue] = useState<any>(null);
  const [monthlyRevenue, setMonthlyRevenue] = useState<any>(null);
  const [collectionEfficiency, setCollectionEfficiency] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showFeeDialog, setShowFeeDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showBudgetDialog, setShowBudgetDialog] = useState(false);
  const [showExpenseDialog, setShowExpenseDialog] = useState(false);

  const [feeForm, setFeeForm] = useState({
    academic_year: new Date().getFullYear().toString(),
    term: 'Term 1',
    trade_code: '',
    trade_name: '',
    level_number: '',
    fee_type: 'Tuition',
    fee_category: 'Academic',
    amount: '',
    due_date: '',
    description: '',
    is_mandatory: true,
    installment_allowed: false
  });

  const [paymentForm, setPaymentForm] = useState({
    student_id: '',
    fee_type: 'Tuition',
    amount: '',
    payment_method: 'Cash',
    payment_reference: '',
    payment_date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const [budgetForm, setBudgetForm] = useState({
    academic_year: new Date().getFullYear().toString(),
    category: 'Academic',
    subcategory: '',
    allocated_amount: '',
    description: ''
  });

  const [expenseForm, setExpenseForm] = useState({
    category: 'Academic',
    subcategory: '',
    amount: '',
    expense_date: new Date().toISOString().split('T')[0],
    description: '',
    vendor: '',
    receipt_number: '',
    payment_method: 'Cash',
    budget_id: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      const currentMonth = new Date().toISOString().slice(0, 7);
      const currentYear = new Date().getFullYear().toString();

      const [
        feeData,
        paymentsData,
        balancesData,
        budgetsData,
        expensesData,
        dailyData,
        monthlyData,
        efficiencyData
      ] = await Promise.all([
        apiService.getFeeStructures({}),
        apiService.getPayments({ page: 1, limit: 50 }),
        apiService.getOutstandingBalances({}),
        apiService.getBudgets({}),
        apiService.getExpenseReports({}),
        apiService.getDailyRevenue(today),
        apiService.getMonthlyRevenue(currentMonth),
        apiService.getCollectionEfficiency(currentYear)
      ]);

      if (feeData.success) setFeeStructures(feeData.feeStructures || []);
      if (paymentsData.success) setPayments(paymentsData.payments || []);
      if (balancesData.success) setOutstandingBalances(balancesData.balances || []);
      if (budgetsData.success) setBudgets(budgetsData.budgets || []);
      if (expensesData.success) setExpenses(expensesData.expenses || []);
      if (dailyData.success) setDailyRevenue(dailyData.revenue);
      if (monthlyData.success) setMonthlyRevenue(monthlyData.revenue);
      if (efficiencyData.success) setCollectionEfficiency(efficiencyData.efficiency);
    } catch (error) {
      console.error('Error fetching accountant data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFeeStructure = async () => {
    try {
      const result = await apiService.createFeeStructure({
        ...feeForm,
        level_number: parseInt(feeForm.level_number),
        amount: parseFloat(feeForm.amount)
      });

      if (result.success) {
        setShowFeeDialog(false);
        setFeeForm({
          academic_year: new Date().getFullYear().toString(),
          term: 'Term 1',
          trade_code: '',
          trade_name: '',
          level_number: '',
          fee_type: 'Tuition',
          fee_category: 'Academic',
          amount: '',
          due_date: '',
          description: '',
          is_mandatory: true,
          installment_allowed: false
        });
        fetchData();
        alert('Fee structure created successfully!');
      }
    } catch (error: any) {
      alert('Failed to create fee structure: ' + error.message);
    }
  };

  const handleRecordPayment = async () => {
    try {
      const result = await apiService.recordPayment({
        ...paymentForm,
        amount: parseFloat(paymentForm.amount)
      });

      if (result.success) {
        setShowPaymentDialog(false);
        setPaymentForm({
          student_id: '',
          fee_type: 'Tuition',
          amount: '',
          payment_method: 'Cash',
          payment_reference: '',
          payment_date: new Date().toISOString().split('T')[0],
          notes: ''
        });
        fetchData();
        alert('Payment recorded successfully! Receipt: ' + result.receiptNumber);
      }
    } catch (error: any) {
      alert('Failed to record payment: ' + error.message);
    }
  };

  const handleCreateBudget = async () => {
    try {
      const result = await apiService.createBudget({
        ...budgetForm,
        allocated_amount: parseFloat(budgetForm.allocated_amount)
      });

      if (result.success) {
        setShowBudgetDialog(false);
        setBudgetForm({
          academic_year: new Date().getFullYear().toString(),
          category: 'Academic',
          subcategory: '',
          allocated_amount: '',
          description: ''
        });
        fetchData();
        alert('Budget created successfully!');
      }
    } catch (error: any) {
      alert('Failed to create budget: ' + error.message);
    }
  };

  const handleRecordExpense = async () => {
    try {
      const result = await apiService.recordExpense({
        ...expenseForm,
        amount: parseFloat(expenseForm.amount),
        budget_id: expenseForm.budget_id ? parseInt(expenseForm.budget_id) : null
      });

      if (result.success) {
        setShowExpenseDialog(false);
        setExpenseForm({
          category: 'Academic',
          subcategory: '',
          amount: '',
          expense_date: new Date().toISOString().split('T')[0],
          description: '',
          vendor: '',
          receipt_number: '',
          payment_method: 'Cash',
          budget_id: ''
        });
        fetchData();
        alert('Expense recorded successfully!');
      }
    } catch (error: any) {
      alert('Failed to record expense: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const totalOutstanding = outstandingBalances.reduce((sum, b) => sum + parseFloat(b.balance || 0), 0);
  const totalBudget = budgets.reduce((sum, b) => sum + parseFloat(b.allocated_amount || 0), 0);
  const totalSpent = budgets.reduce((sum, b) => sum + parseFloat(b.spent_amount || 0), 0);

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-gray-50 to-green-50 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Accountant Dashboard</h1>
          <p className="text-gray-600">Comprehensive financial management</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowPaymentDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Record Payment
          </Button>
          <Button onClick={fetchData} variant="outline">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div whileHover={{ scale: 1.02 }}>
          <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
              <DollarSign className="w-5 h-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dailyRevenue?.total_amount?.toLocaleString() || 0} RWF
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {dailyRevenue?.payment_count || 0} payments
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }}>
          <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {monthlyRevenue?.total_amount?.toLocaleString() || 0} RWF
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {monthlyRevenue?.payment_count || 0} payments
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }}>
          <Card className="border-2 border-red-200 bg-gradient-to-br from-red-50 to-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Outstanding Balance</CardTitle>
              <AlertCircle className="w-5 h-5 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalOutstanding.toLocaleString()} RWF
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {outstandingBalances.length} students
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }}>
          <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Budget Utilization</CardTitle>
              <Target className="w-5 h-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(1) : 0}%
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {totalSpent.toLocaleString()} / {totalBudget.toLocaleString()} RWF
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Tabs defaultValue="payments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="fees">Fee Structures</TabsTrigger>
          <TabsTrigger value="balances">Outstanding Balances</TabsTrigger>
          <TabsTrigger value="budgets">Budgets</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Recent Payments</CardTitle>
                <Button onClick={() => setShowPaymentDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Record Payment
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Student ID</th>
                      <th className="text-left p-2">Fee Type</th>
                      <th className="text-left p-2">Amount</th>
                      <th className="text-left p-2">Payment Method</th>
                      <th className="text-left p-2">Date</th>
                      <th className="text-left p-2">Status</th>
                      <th className="text-left p-2">Reference</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment: any) => (
                      <tr key={payment.id} className="border-b hover:bg-gray-50">
                        <td className="p-2 font-medium">{payment.student_id}</td>
                        <td className="p-2">{payment.fee_type}</td>
                        <td className="p-2 font-bold">{parseFloat(payment.amount).toLocaleString()} RWF</td>
                        <td className="p-2">{payment.payment_method}</td>
                        <td className="p-2 text-sm">{new Date(payment.payment_date).toLocaleDateString()}</td>
                        <td className="p-2">
                          <Badge variant={payment.status === 'paid' ? 'default' : 'secondary'}>
                            {payment.status}
                          </Badge>
                        </td>
                        <td className="p-2 text-sm text-gray-600">{payment.payment_reference}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fees">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Fee Structures</CardTitle>
                <Button onClick={() => setShowFeeDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Fee Structure
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Academic Year</th>
                      <th className="text-left p-2">Term</th>
                      <th className="text-left p-2">Trade</th>
                      <th className="text-left p-2">Level</th>
                      <th className="text-left p-2">Fee Type</th>
                      <th className="text-left p-2">Amount</th>
                      <th className="text-left p-2">Due Date</th>
                      <th className="text-left p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {feeStructures.map((fee: any) => (
                      <tr key={fee.id} className="border-b hover:bg-gray-50">
                        <td className="p-2">{fee.academic_year}</td>
                        <td className="p-2">{fee.term}</td>
                        <td className="p-2">{fee.trade_name || fee.trade_code}</td>
                        <td className="p-2">{fee.level_number}</td>
                        <td className="p-2">{fee.fee_type}</td>
                        <td className="p-2 font-bold">{parseFloat(fee.amount).toLocaleString()} RWF</td>
                        <td className="p-2 text-sm">{new Date(fee.due_date).toLocaleDateString()}</td>
                        <td className="p-2">
                          <Badge variant={fee.status === 'active' ? 'default' : 'secondary'}>
                            {fee.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="balances">
          <Card>
            <CardHeader>
              <CardTitle>Outstanding Balances</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Student ID</th>
                      <th className="text-left p-2">Student Name</th>
                      <th className="text-left p-2">Trade</th>
                      <th className="text-left p-2">Balance</th>
                      <th className="text-left p-2">Last Payment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {outstandingBalances.map((balance: any, index: number) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="p-2 font-medium">{balance.student_id}</td>
                        <td className="p-2">{balance.student_name}</td>
                        <td className="p-2">{balance.trade_name}</td>
                        <td className="p-2 font-bold text-red-600">
                          {parseFloat(balance.balance).toLocaleString()} RWF
                        </td>
                        <td className="p-2 text-sm">
                          {balance.last_payment_date 
                            ? new Date(balance.last_payment_date).toLocaleDateString()
                            : 'Never'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="budgets">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Budget Management</CardTitle>
                <Button onClick={() => setShowBudgetDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Budget
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {budgets.map((budget: any) => (
                  <div key={budget.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-bold">{budget.category}</div>
                        <div className="text-sm text-gray-600">{budget.subcategory}</div>
                      </div>
                      <Badge variant={budget.status === 'active' ? 'default' : 'secondary'}>
                        {budget.status}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Allocated:</span>
                        <span className="font-medium">{parseFloat(budget.allocated_amount).toLocaleString()} RWF</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Spent:</span>
                        <span className="font-medium">{parseFloat(budget.spent_amount || 0).toLocaleString()} RWF</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Remaining:</span>
                        <span className="font-medium text-green-600">
                          {(parseFloat(budget.allocated_amount) - parseFloat(budget.spent_amount || 0)).toLocaleString()} RWF
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ 
                            width: `${Math.min((parseFloat(budget.spent_amount || 0) / parseFloat(budget.allocated_amount)) * 100, 100)}%` 
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Expense Records</CardTitle>
                <Button onClick={() => setShowExpenseDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Record Expense
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Date</th>
                      <th className="text-left p-2">Category</th>
                      <th className="text-left p-2">Description</th>
                      <th className="text-left p-2">Vendor</th>
                      <th className="text-left p-2">Amount</th>
                      <th className="text-left p-2">Payment Method</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map((expense: any) => (
                      <tr key={expense.id} className="border-b hover:bg-gray-50">
                        <td className="p-2 text-sm">{new Date(expense.expense_date).toLocaleDateString()}</td>
                        <td className="p-2">
                          <div>{expense.category}</div>
                          <div className="text-xs text-gray-600">{expense.subcategory}</div>
                        </td>
                        <td className="p-2 text-sm">{expense.description}</td>
                        <td className="p-2">{expense.vendor}</td>
                        <td className="p-2 font-bold">{parseFloat(expense.amount).toLocaleString()} RWF</td>
                        <td className="p-2">{expense.payment_method}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Collection Efficiency</CardTitle>
              </CardHeader>
              <CardContent>
                {collectionEfficiency && (
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Total Expected:</span>
                      <span className="font-bold">{parseFloat(collectionEfficiency.total_expected || 0).toLocaleString()} RWF</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Collected:</span>
                      <span className="font-bold text-green-600">{parseFloat(collectionEfficiency.total_collected || 0).toLocaleString()} RWF</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Collection Rate:</span>
                      <span className="font-bold text-blue-600">{collectionEfficiency.collection_rate || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-green-600 h-3 rounded-full"
                        style={{ width: `${collectionEfficiency.collection_rate || 0}%` }}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button className="w-full" variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export Payment Report
                  </Button>
                  <Button className="w-full" variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export Fee Statement
                  </Button>
                  <Button className="w-full" variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export Budget Report
                  </Button>
                  <Button className="w-full" variant="outline">
                    <FileText className="w-4 h-4 mr-2" />
                    Generate Financial Summary
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={showFeeDialog} onOpenChange={setShowFeeDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Fee Structure</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Academic Year</Label>
              <Input value={feeForm.academic_year} onChange={(e) => setFeeForm({...feeForm, academic_year: e.target.value})} />
            </div>
            <div>
              <Label>Term</Label>
              <Select value={feeForm.term} onValueChange={(value) => setFeeForm({...feeForm, term: value})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Term 1">Term 1</SelectItem>
                  <SelectItem value="Term 2">Term 2</SelectItem>
                  <SelectItem value="Term 3">Term 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Trade Code</Label>
              <Input value={feeForm.trade_code} onChange={(e) => setFeeForm({...feeForm, trade_code: e.target.value})} />
            </div>
            <div>
              <Label>Trade Name</Label>
              <Input value={feeForm.trade_name} onChange={(e) => setFeeForm({...feeForm, trade_name: e.target.value})} />
            </div>
            <div>
              <Label>Level Number</Label>
              <Input type="number" value={feeForm.level_number} onChange={(e) => setFeeForm({...feeForm, level_number: e.target.value})} />
            </div>
            <div>
              <Label>Fee Type</Label>
              <Input value={feeForm.fee_type} onChange={(e) => setFeeForm({...feeForm, fee_type: e.target.value})} />
            </div>
            <div>
              <Label>Amount (RWF)</Label>
              <Input type="number" value={feeForm.amount} onChange={(e) => setFeeForm({...feeForm, amount: e.target.value})} />
            </div>
            <div>
              <Label>Due Date</Label>
              <Input type="date" value={feeForm.due_date} onChange={(e) => setFeeForm({...feeForm, due_date: e.target.value})} />
            </div>
            <div className="col-span-2">
              <Label>Description</Label>
              <Textarea value={feeForm.description} onChange={(e) => setFeeForm({...feeForm, description: e.target.value})} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFeeDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateFeeStructure}>Create Fee Structure</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Student ID</Label>
              <Input value={paymentForm.student_id} onChange={(e) => setPaymentForm({...paymentForm, student_id: e.target.value})} />
            </div>
            <div>
              <Label>Fee Type</Label>
              <Input value={paymentForm.fee_type} onChange={(e) => setPaymentForm({...paymentForm, fee_type: e.target.value})} />
            </div>
            <div>
              <Label>Amount (RWF)</Label>
              <Input type="number" value={paymentForm.amount} onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})} />
            </div>
            <div>
              <Label>Payment Method</Label>
              <Select value={paymentForm.payment_method} onValueChange={(value) => setPaymentForm({...paymentForm, payment_method: value})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Mobile Money">Mobile Money</SelectItem>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  <SelectItem value="Cheque">Cheque</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Payment Reference</Label>
              <Input value={paymentForm.payment_reference} onChange={(e) => setPaymentForm({...paymentForm, payment_reference: e.target.value})} />
            </div>
            <div>
              <Label>Payment Date</Label>
              <Input type="date" value={paymentForm.payment_date} onChange={(e) => setPaymentForm({...paymentForm, payment_date: e.target.value})} />
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea value={paymentForm.notes} onChange={(e) => setPaymentForm({...paymentForm, notes: e.target.value})} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>Cancel</Button>
            <Button onClick={handleRecordPayment}>Record Payment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showBudgetDialog} onOpenChange={setShowBudgetDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Budget</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Academic Year</Label>
              <Input value={budgetForm.academic_year} onChange={(e) => setBudgetForm({...budgetForm, academic_year: e.target.value})} />
            </div>
            <div>
              <Label>Category</Label>
              <Input value={budgetForm.category} onChange={(e) => setBudgetForm({...budgetForm, category: e.target.value})} />
            </div>
            <div>
              <Label>Subcategory</Label>
              <Input value={budgetForm.subcategory} onChange={(e) => setBudgetForm({...budgetForm, subcategory: e.target.value})} />
            </div>
            <div>
              <Label>Allocated Amount (RWF)</Label>
              <Input type="number" value={budgetForm.allocated_amount} onChange={(e) => setBudgetForm({...budgetForm, allocated_amount: e.target.value})} />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={budgetForm.description} onChange={(e) => setBudgetForm({...budgetForm, description: e.target.value})} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBudgetDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateBudget}>Create Budget</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showExpenseDialog} onOpenChange={setShowExpenseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Expense</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Category</Label>
              <Input value={expenseForm.category} onChange={(e) => setExpenseForm({...expenseForm, category: e.target.value})} />
            </div>
            <div>
              <Label>Subcategory</Label>
              <Input value={expenseForm.subcategory} onChange={(e) => setExpenseForm({...expenseForm, subcategory: e.target.value})} />
            </div>
            <div>
              <Label>Amount (RWF)</Label>
              <Input type="number" value={expenseForm.amount} onChange={(e) => setExpenseForm({...expenseForm, amount: e.target.value})} />
            </div>
            <div>
              <Label>Expense Date</Label>
              <Input type="date" value={expenseForm.expense_date} onChange={(e) => setExpenseForm({...expenseForm, expense_date: e.target.value})} />
            </div>
            <div>
              <Label>Vendor</Label>
              <Input value={expenseForm.vendor} onChange={(e) => setExpenseForm({...expenseForm, vendor: e.target.value})} />
            </div>
            <div>
              <Label>Receipt Number</Label>
              <Input value={expenseForm.receipt_number} onChange={(e) => setExpenseForm({...expenseForm, receipt_number: e.target.value})} />
            </div>
            <div>
              <Label>Payment Method</Label>
              <Select value={expenseForm.payment_method} onValueChange={(value) => setExpenseForm({...expenseForm, payment_method: value})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Mobile Money">Mobile Money</SelectItem>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  <SelectItem value="Cheque">Cheque</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={expenseForm.description} onChange={(e) => setExpenseForm({...expenseForm, description: e.target.value})} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExpenseDialog(false)}>Cancel</Button>
            <Button onClick={handleRecordExpense}>Record Expense</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
