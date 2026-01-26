import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  DollarSign, TrendingUp, TrendingDown, Wallet, CreditCard, Receipt, FileText,
  PieChart, BarChart3, LineChart, Calendar, Clock, Download, Upload, Filter,
  Search, Plus, Edit, Trash2, Eye, Check, X, AlertCircle, CheckCircle,
  ArrowUpRight, ArrowDownRight, Banknote, Building, Users, Target, Zap,
  RefreshCw, Send, Mail, Phone, MapPin, Package, ShoppingCart, Archive,
  ClipboardList, Activity, Award, Star, ThumbsUp, Settings, Bell, Info
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Label } from '@/app/components/ui/label';
import { Progress } from '@/app/components/ui/progress';

const API_BASE = 'http://localhost:5000/api';

interface Budget {
  id: number;
  category: string;
  allocated_amount: number;
  spent_amount: number;
  remaining_amount: number;
  fiscal_year: string;
  status: 'active' | 'closed' | 'exceeded';
  created_at: string;
  creator_first_name?: string;
  creator_last_name?: string;
}

interface Expense {
  id: number;
  category: string;
  amount: number;
  description: string;
  expense_date: string;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  receipt_number?: string;
  vendor_name?: string;
  payment_method?: string;
  approved_by?: number;
  approved_at?: string;
}

interface Income {
  id: number;
  source: string;
  amount: number;
  description: string;
  income_date: string;
  payment_method: string;
  receipt_number?: string;
  payer_name?: string;
}

interface Invoice {
  id: number;
  invoice_number: string;
  student_id?: number;
  student_name?: string;
  amount: number;
  due_date: string;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  description: string;
  issued_date: string;
  paid_date?: string;
}

interface FinancialStats {
  total_income: number;
  total_expenses: number;
  total_budget: number;
  budget_utilized: number;
  pending_invoices: number;
  overdue_invoices: number;
  monthly_income: number;
  monthly_expenses: number;
  profit_margin: number;
}

const FinancialManagementSystem: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [stats, setStats] = useState<FinancialStats>({
    total_income: 0,
    total_expenses: 0,
    total_budget: 0,
    budget_utilized: 0,
    pending_invoices: 0,
    overdue_invoices: 0,
    monthly_income: 0,
    monthly_expenses: 0,
    profit_margin: 0
  });

  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  const [showBudgetDialog, setShowBudgetDialog] = useState(false);
  const [showExpenseDialog, setShowExpenseDialog] = useState(false);
  const [showIncomeDialog, setShowIncomeDialog] = useState(false);
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);

  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const [budgetForm, setBudgetForm] = useState({
    category: '',
    allocated_amount: '',
    fiscal_year: new Date().getFullYear().toString()
  });

  const [expenseForm, setExpenseForm] = useState({
    category: '',
    amount: '',
    description: '',
    expense_date: new Date().toISOString().split('T')[0],
    vendor_name: '',
    payment_method: 'cash',
    receipt_number: ''
  });

  const [incomeForm, setIncomeForm] = useState({
    source: '',
    amount: '',
    description: '',
    income_date: new Date().toISOString().split('T')[0],
    payment_method: 'cash',
    payer_name: '',
    receipt_number: ''
  });

  const [invoiceForm, setInvoiceForm] = useState({
    student_id: '',
    amount: '',
    description: '',
    due_date: '',
    invoice_number: ''
  });

  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const [statsRes, budgetsRes, expensesRes, incomesRes, invoicesRes] = await Promise.all([
        fetch(`${API_BASE}/financial-system/stats`, { headers }),
        fetch(`${API_BASE}/financial-system/budgets?limit=100`, { headers }),
        fetch(`${API_BASE}/financial-system/expenses?limit=100`, { headers }),
        fetch(`${API_BASE}/financial-system/income?limit=100`, { headers }),
        fetch(`${API_BASE}/invoices?limit=100`, { headers })
      ]);

      const [statsData, budgetsData, expensesData, incomesData, invoicesData] = await Promise.all([
        statsRes.json(),
        budgetsRes.json(),
        expensesRes.json(),
        incomesRes.json(),
        invoicesRes.json()
      ]);

      if (statsData.success) setStats(statsData.stats || statsData);
      if (budgetsData.success) setBudgets(budgetsData.budgets || []);
      if (expensesData.success) setExpenses(expensesData.expenses || []);
      if (incomesData.success) setIncomes(incomesData.income || []);
      if (invoicesData.success) setInvoices(invoicesData.invoices || invoicesData.data || []);

    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAllData();
    setRefreshing(false);
  };

  const handleCreateBudget = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/financial-system/budgets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...budgetForm,
          allocated_amount: parseFloat(budgetForm.allocated_amount)
        })
      });

      const data = await response.json();
      if (data.success) {
        setShowBudgetDialog(false);
        setBudgetForm({ category: '', allocated_amount: '', fiscal_year: new Date().getFullYear().toString() });
        fetchAllData();
      }
    } catch (error) {
      console.error('Create budget error:', error);
    }
  };

  const handleCreateExpense = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/financial-system/expenses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...expenseForm,
          amount: parseFloat(expenseForm.amount)
        })
      });

      const data = await response.json();
      if (data.success) {
        setShowExpenseDialog(false);
        setExpenseForm({
          category: '',
          amount: '',
          description: '',
          expense_date: new Date().toISOString().split('T')[0],
          vendor_name: '',
          payment_method: 'cash',
          receipt_number: ''
        });
        fetchAllData();
      }
    } catch (error) {
      console.error('Create expense error:', error);
    }
  };

  const handleCreateIncome = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/financial-system/income`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...incomeForm,
          amount: parseFloat(incomeForm.amount)
        })
      });

      const data = await response.json();
      if (data.success) {
        setShowIncomeDialog(false);
        setIncomeForm({
          source: '',
          amount: '',
          description: '',
          income_date: new Date().toISOString().split('T')[0],
          payment_method: 'cash',
          payer_name: '',
          receipt_number: ''
        });
        fetchAllData();
      }
    } catch (error) {
      console.error('Create income error:', error);
    }
  };

  const handleApproveExpense = async (expenseId: number) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE}/financial-system/expenses/${expenseId}/approve`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchAllData();
    } catch (error) {
      console.error('Approve expense error:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF' }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': case 'approved': case 'paid': return 'bg-green-500/20 text-green-400';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400';
      case 'rejected': case 'cancelled': case 'exceeded': return 'bg-red-500/20 text-red-400';
      case 'overdue': return 'bg-orange-500/20 text-orange-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-yellow-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-16 h-16 text-green-400 animate-spin mx-auto mb-4" />
          <p className="text-xl text-green-400">Loading Financial System...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-yellow-900 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto space-y-6"
      >
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-yellow-400 bg-clip-text text-transparent">
              Financial Management System
            </h1>
            <p className="text-gray-400 mt-2">Complete financial control and reporting</p>
          </div>
          <Button onClick={handleRefresh} disabled={refreshing} className="bg-green-600 hover:bg-green-700">
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div whileHover={{ scale: 1.02 }} className="relative overflow-hidden">
            <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Total Income</p>
                    <h3 className="text-2xl font-bold text-green-400 mt-1">{formatCurrency(stats.total_income)}</h3>
                    <p className="text-xs text-green-400 mt-2 flex items-center">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Monthly: {formatCurrency(stats.monthly_income)}
                    </p>
                  </div>
                  <div className="bg-green-500/20 p-3 rounded-lg">
                    <TrendingUp className="w-8 h-8 text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} className="relative overflow-hidden">
            <Card className="bg-gradient-to-br from-red-500/10 to-red-600/10 border-red-500/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Total Expenses</p>
                    <h3 className="text-2xl font-bold text-red-400 mt-1">{formatCurrency(stats.total_expenses)}</h3>
                    <p className="text-xs text-red-400 mt-2 flex items-center">
                      <TrendingDown className="w-3 h-3 mr-1" />
                      Monthly: {formatCurrency(stats.monthly_expenses)}
                    </p>
                  </div>
                  <div className="bg-red-500/20 p-3 rounded-lg">
                    <TrendingDown className="w-8 h-8 text-red-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} className="relative overflow-hidden">
            <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 border-yellow-500/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Total Budget</p>
                    <h3 className="text-2xl font-bold text-yellow-400 mt-1">{formatCurrency(stats.total_budget)}</h3>
                    <p className="text-xs text-yellow-400 mt-2">
                      Utilized: {stats.budget_utilized.toFixed(1)}%
                    </p>
                    <Progress value={stats.budget_utilized} className="mt-2 h-1" />
                  </div>
                  <div className="bg-yellow-500/20 p-3 rounded-lg">
                    <Wallet className="w-8 h-8 text-yellow-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} className="relative overflow-hidden">
            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Profit Margin</p>
                    <h3 className="text-2xl font-bold text-blue-400 mt-1">{stats.profit_margin.toFixed(1)}%</h3>
                    <p className="text-xs text-gray-400 mt-2">
                      {stats.total_income - stats.total_expenses > 0 ? 'Surplus' : 'Deficit'}: {formatCurrency(Math.abs(stats.total_income - stats.total_expenses))}
                    </p>
                  </div>
                  <div className="bg-blue-500/20 p-3 rounded-lg">
                    <PieChart className="w-8 h-8 text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-gray-800/50 border border-green-500/20">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-green-600">
              <BarChart3 className="w-4 h-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="budgets" className="data-[state=active]:bg-green-600">
              <Wallet className="w-4 h-4 mr-2" />
              Budgets
            </TabsTrigger>
            <TabsTrigger value="expenses" className="data-[state=active]:bg-green-600">
              <Receipt className="w-4 h-4 mr-2" />
              Expenses
            </TabsTrigger>
            <TabsTrigger value="income" className="data-[state=active]:bg-green-600">
              <DollarSign className="w-4 h-4 mr-2" />
              Income
            </TabsTrigger>
            <TabsTrigger value="invoices" className="data-[state=active]:bg-green-600">
              <FileText className="w-4 h-4 mr-2" />
              Invoices
            </TabsTrigger>
            <TabsTrigger value="reports" className="data-[state=active]:bg-green-600">
              <LineChart className="w-4 h-4 mr-2" />
              Reports
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gray-800/50 border-green-500/20">
                <CardHeader>
                  <CardTitle className="text-green-400">Budget Utilization</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {budgets.slice(0, 5).map((budget) => (
                    <div key={budget.id} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">{budget.category}</span>
                        <span className="text-green-400">{((budget.spent_amount / budget.allocated_amount) * 100).toFixed(1)}%</span>
                      </div>
                      <Progress 
                        value={(budget.spent_amount / budget.allocated_amount) * 100} 
                        className="h-2"
                      />
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>Spent: {formatCurrency(budget.spent_amount)}</span>
                        <span>Allocated: {formatCurrency(budget.allocated_amount)}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-green-500/20">
                <CardHeader>
                  <CardTitle className="text-green-400">Recent Transactions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {expenses.slice(0, 5).map((expense) => (
                    <div key={expense.id} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="bg-red-500/20 p-2 rounded-lg">
                          <Receipt className="w-4 h-4 text-red-400" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-300">{expense.category}</p>
                          <p className="text-xs text-gray-500">{new Date(expense.expense_date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-red-400">-{formatCurrency(expense.amount)}</p>
                        <Badge className={getStatusColor(expense.status)}>{expense.status}</Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gray-800/50 border-green-500/20">
              <CardHeader>
                <CardTitle className="text-green-400">Pending Invoices</CardTitle>
                <CardDescription>Invoices awaiting payment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {invoices.filter(inv => inv.status === 'pending' || inv.status === 'overdue').slice(0, 10).map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg border border-yellow-500/20">
                      <div className="flex items-center gap-4">
                        <div className="bg-yellow-500/20 p-3 rounded-lg">
                          <FileText className="w-5 h-5 text-yellow-400" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-200">#{invoice.invoice_number}</p>
                          <p className="text-sm text-gray-400">{invoice.student_name || 'N/A'}</p>
                          <p className="text-xs text-gray-500">Due: {new Date(invoice.due_date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-yellow-400">{formatCurrency(invoice.amount)}</p>
                        <Badge className={getStatusColor(invoice.status)}>{invoice.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Budgets Tab */}
          <TabsContent value="budgets" className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                <Input
                  placeholder="Search budgets..."
                  className="w-64 bg-gray-800 border-green-500/30"
                />
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-40 bg-gray-800 border-green-500/30">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                    <SelectItem value="exceeded">Exceeded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={() => setShowBudgetDialog(true)} className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Budget
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {budgets.map((budget) => (
                <motion.div
                  key={budget.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.01 }}
                >
                  <Card className="bg-gray-800/50 border-green-500/20">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-green-400">{budget.category}</h3>
                          <p className="text-sm text-gray-400">Fiscal Year: {budget.fiscal_year}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Created by: {budget.creator_first_name} {budget.creator_last_name}
                          </p>
                        </div>
                        <Badge className={getStatusColor(budget.status)}>{budget.status}</Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-gray-400">Allocated</p>
                          <p className="text-lg font-bold text-blue-400">{formatCurrency(budget.allocated_amount)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Spent</p>
                          <p className="text-lg font-bold text-red-400">{formatCurrency(budget.spent_amount)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Remaining</p>
                          <p className="text-lg font-bold text-green-400">{formatCurrency(budget.remaining_amount)}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Utilization</span>
                          <span className="text-green-400">{((budget.spent_amount / budget.allocated_amount) * 100).toFixed(1)}%</span>
                        </div>
                        <Progress value={(budget.spent_amount / budget.allocated_amount) * 100} className="h-2" />
                      </div>

                      <div className="flex gap-2 mt-4">
                        <Button size="sm" variant="outline" className="border-green-500/30">
                          <Eye className="w-3 h-3 mr-1" />
                          View Details
                        </Button>
                        <Button size="sm" variant="outline" className="border-yellow-500/30">
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Expenses Tab */}
          <TabsContent value="expenses" className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                <Input placeholder="Search expenses..." className="w-64 bg-gray-800 border-green-500/30" />
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-40 bg-gray-800 border-green-500/30">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="salaries">Salaries</SelectItem>
                    <SelectItem value="utilities">Utilities</SelectItem>
                    <SelectItem value="supplies">Supplies</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={() => setShowExpenseDialog(true)} className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Expense
              </Button>
            </div>

            <Card className="bg-gray-800/50 border-green-500/20">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-700/30">
                      <tr>
                        <th className="text-left p-4 text-green-400">Date</th>
                        <th className="text-left p-4 text-green-400">Category</th>
                        <th className="text-left p-4 text-green-400">Description</th>
                        <th className="text-left p-4 text-green-400">Vendor</th>
                        <th className="text-left p-4 text-green-400">Amount</th>
                        <th className="text-left p-4 text-green-400">Status</th>
                        <th className="text-left p-4 text-green-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expenses.map((expense) => (
                        <tr key={expense.id} className="border-t border-gray-700/50 hover:bg-gray-700/20">
                          <td className="p-4 text-gray-300">{new Date(expense.expense_date).toLocaleDateString()}</td>
                          <td className="p-4 text-gray-300">{expense.category}</td>
                          <td className="p-4 text-gray-400 text-sm">{expense.description}</td>
                          <td className="p-4 text-gray-300">{expense.vendor_name || 'N/A'}</td>
                          <td className="p-4 text-red-400 font-bold">{formatCurrency(expense.amount)}</td>
                          <td className="p-4">
                            <Badge className={getStatusColor(expense.status)}>{expense.status}</Badge>
                          </td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              {expense.status === 'pending' && (
                                <Button size="sm" onClick={() => handleApproveExpense(expense.id)} className="bg-green-600">
                                  <Check className="w-3 h-3" />
                                </Button>
                              )}
                              <Button size="sm" variant="outline" className="border-green-500/30">
                                <Eye className="w-3 h-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Income Tab */}
          <TabsContent value="income" className="space-y-4">
            <div className="flex justify-between items-center">
              <Input placeholder="Search income..." className="w-64 bg-gray-800 border-green-500/30" />
              <Button onClick={() => setShowIncomeDialog(true)} className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Income
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {incomes.map((income) => (
                <Card key={income.id} className="bg-gray-800/50 border-green-500/20">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-4">
                        <div className="bg-green-500/20 p-4 rounded-lg">
                          <DollarSign className="w-6 h-6 text-green-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-green-400">{income.source}</h3>
                          <p className="text-sm text-gray-400">{income.description}</p>
                          <div className="flex gap-4 mt-2 text-xs text-gray-500">
                            <span>Date: {new Date(income.income_date).toLocaleDateString()}</span>
                            <span>Method: {income.payment_method}</span>
                            {income.receipt_number && <span>Receipt: {income.receipt_number}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-400">{formatCurrency(income.amount)}</p>
                        {income.payer_name && <p className="text-sm text-gray-400 mt-1">From: {income.payer_name}</p>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Invoices Tab */}
          <TabsContent value="invoices" className="space-y-4">
            <div className="flex justify-between items-center">
              <Input placeholder="Search invoices..." className="w-64 bg-gray-800 border-green-500/30" />
              <Button onClick={() => setShowInvoiceDialog(true)} className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Invoice
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {invoices.map((invoice) => (
                <Card key={invoice.id} className="bg-gray-800/50 border-green-500/20">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg text-green-400">#{invoice.invoice_number}</CardTitle>
                        <CardDescription>{invoice.student_name || 'N/A'}</CardDescription>
                      </div>
                      <Badge className={getStatusColor(invoice.status)}>{invoice.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <p className="text-2xl font-bold text-yellow-400">{formatCurrency(invoice.amount)}</p>
                      </div>
                      <div className="text-sm text-gray-400 space-y-1">
                        <p>Issued: {new Date(invoice.issued_date).toLocaleDateString()}</p>
                        <p>Due: {new Date(invoice.due_date).toLocaleDateString()}</p>
                        {invoice.paid_date && <p>Paid: {new Date(invoice.paid_date).toLocaleDateString()}</p>}
                      </div>
                      <p className="text-sm text-gray-300">{invoice.description}</p>
                      <div className="flex gap-2 pt-2">
                        <Button size="sm" variant="outline" className="flex-1 border-green-500/30">
                          <Eye className="w-3 h-3 mr-1" />
                          View
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1 border-blue-500/30">
                          <Download className="w-3 h-3 mr-1" />
                          PDF
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-gray-800/50 border-green-500/20">
                <CardHeader>
                  <CardTitle className="text-green-400">Generate Financial Reports</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Report Type</Label>
                    <Select>
                      <SelectTrigger className="bg-gray-700 border-green-500/30">
                        <SelectValue placeholder="Select report type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="income-statement">Income Statement</SelectItem>
                        <SelectItem value="balance-sheet">Balance Sheet</SelectItem>
                        <SelectItem value="cash-flow">Cash Flow Statement</SelectItem>
                        <SelectItem value="budget-variance">Budget Variance Report</SelectItem>
                        <SelectItem value="expense-analysis">Expense Analysis</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Start Date</Label>
                      <Input type="date" className="bg-gray-700 border-green-500/30" />
                    </div>
                    <div className="space-y-2">
                      <Label>End Date</Label>
                      <Input type="date" className="bg-gray-700 border-green-500/30" />
                    </div>
                  </div>
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    <Download className="w-4 h-4 mr-2" />
                    Generate Report
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-green-500/20">
                <CardHeader>
                  <CardTitle className="text-green-400">Quick Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-700/30 p-4 rounded-lg">
                      <p className="text-xs text-gray-400">This Month Income</p>
                      <p className="text-xl font-bold text-green-400">{formatCurrency(stats.monthly_income)}</p>
                    </div>
                    <div className="bg-gray-700/30 p-4 rounded-lg">
                      <p className="text-xs text-gray-400">This Month Expenses</p>
                      <p className="text-xl font-bold text-red-400">{formatCurrency(stats.monthly_expenses)}</p>
                    </div>
                    <div className="bg-gray-700/30 p-4 rounded-lg">
                      <p className="text-xs text-gray-400">Pending Invoices</p>
                      <p className="text-xl font-bold text-yellow-400">{stats.pending_invoices}</p>
                    </div>
                    <div className="bg-gray-700/30 p-4 rounded-lg">
                      <p className="text-xs text-gray-400">Overdue Invoices</p>
                      <p className="text-xl font-bold text-orange-400">{stats.overdue_invoices}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Dialogs */}
        <Dialog open={showBudgetDialog} onOpenChange={setShowBudgetDialog}>
          <DialogContent className="bg-gray-800 border-green-500/30 text-white max-w-md">
            <DialogHeader>
              <DialogTitle className="text-green-400">Create New Budget</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Input
                  value={budgetForm.category}
                  onChange={(e) => setBudgetForm({ ...budgetForm, category: e.target.value })}
                  placeholder="e.g., Salaries, Utilities"
                  className="bg-gray-700 border-green-500/30"
                />
              </div>
              <div className="space-y-2">
                <Label>Allocated Amount (RWF)</Label>
                <Input
                  type="number"
                  value={budgetForm.allocated_amount}
                  onChange={(e) => setBudgetForm({ ...budgetForm, allocated_amount: e.target.value })}
                  placeholder="0.00"
                  className="bg-gray-700 border-green-500/30"
                />
              </div>
              <div className="space-y-2">
                <Label>Fiscal Year</Label>
                <Input
                  value={budgetForm.fiscal_year}
                  onChange={(e) => setBudgetForm({ ...budgetForm, fiscal_year: e.target.value })}
                  className="bg-gray-700 border-green-500/30"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCreateBudget} className="flex-1 bg-green-600 hover:bg-green-700">
                  Create Budget
                </Button>
                <Button onClick={() => setShowBudgetDialog(false)} variant="outline" className="flex-1 border-gray-600">
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showExpenseDialog} onOpenChange={setShowExpenseDialog}>
          <DialogContent className="bg-gray-800 border-green-500/30 text-white max-w-md">
            <DialogHeader>
              <DialogTitle className="text-green-400">Add New Expense</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={expenseForm.category} onValueChange={(v) => setExpenseForm({ ...expenseForm, category: v })}>
                  <SelectTrigger className="bg-gray-700 border-green-500/30">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="salaries">Salaries</SelectItem>
                    <SelectItem value="utilities">Utilities</SelectItem>
                    <SelectItem value="supplies">Supplies</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="equipment">Equipment</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Amount (RWF)</Label>
                <Input
                  type="number"
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                  placeholder="0.00"
                  className="bg-gray-700 border-green-500/30"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                  className="bg-gray-700 border-green-500/30"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Vendor Name</Label>
                <Input
                  value={expenseForm.vendor_name}
                  onChange={(e) => setExpenseForm({ ...expenseForm, vendor_name: e.target.value })}
                  className="bg-gray-700 border-green-500/30"
                />
              </div>
              <div className="space-y-2">
                <Label>Expense Date</Label>
                <Input
                  type="date"
                  value={expenseForm.expense_date}
                  onChange={(e) => setExpenseForm({ ...expenseForm, expense_date: e.target.value })}
                  className="bg-gray-700 border-green-500/30"
                />
              </div>
              <div className="space-y-2">
                <Label>Payment Method</Label>
                <Select value={expenseForm.payment_method} onValueChange={(v) => setExpenseForm({ ...expenseForm, payment_method: v })}>
                  <SelectTrigger className="bg-gray-700 border-green-500/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="mobile_money">Mobile Money</SelectItem>
                    <SelectItem value="check">Check</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCreateExpense} className="flex-1 bg-green-600 hover:bg-green-700">
                  Add Expense
                </Button>
                <Button onClick={() => setShowExpenseDialog(false)} variant="outline" className="flex-1 border-gray-600">
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showIncomeDialog} onOpenChange={setShowIncomeDialog}>
          <DialogContent className="bg-gray-800 border-green-500/30 text-white max-w-md">
            <DialogHeader>
              <DialogTitle className="text-green-400">Add New Income</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="space-y-2">
                <Label>Source</Label>
                <Input
                  value={incomeForm.source}
                  onChange={(e) => setIncomeForm({ ...incomeForm, source: e.target.value })}
                  placeholder="e.g., Tuition Fees, Donations"
                  className="bg-gray-700 border-green-500/30"
                />
              </div>
              <div className="space-y-2">
                <Label>Amount (RWF)</Label>
                <Input
                  type="number"
                  value={incomeForm.amount}
                  onChange={(e) => setIncomeForm({ ...incomeForm, amount: e.target.value })}
                  placeholder="0.00"
                  className="bg-gray-700 border-green-500/30"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={incomeForm.description}
                  onChange={(e) => setIncomeForm({ ...incomeForm, description: e.target.value })}
                  className="bg-gray-700 border-green-500/30"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Payer Name</Label>
                <Input
                  value={incomeForm.payer_name}
                  onChange={(e) => setIncomeForm({ ...incomeForm, payer_name: e.target.value })}
                  className="bg-gray-700 border-green-500/30"
                />
              </div>
              <div className="space-y-2">
                <Label>Income Date</Label>
                <Input
                  type="date"
                  value={incomeForm.income_date}
                  onChange={(e) => setIncomeForm({ ...incomeForm, income_date: e.target.value })}
                  className="bg-gray-700 border-green-500/30"
                />
              </div>
              <div className="space-y-2">
                <Label>Payment Method</Label>
                <Select value={incomeForm.payment_method} onValueChange={(v) => setIncomeForm({ ...incomeForm, payment_method: v })}>
                  <SelectTrigger className="bg-gray-700 border-green-500/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="mobile_money">Mobile Money</SelectItem>
                    <SelectItem value="check">Check</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCreateIncome} className="flex-1 bg-green-600 hover:bg-green-700">
                  Add Income
                </Button>
                <Button onClick={() => setShowIncomeDialog(false)} variant="outline" className="flex-1 border-gray-600">
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>
    </div>
  );
};

export default FinancialManagementSystem;
