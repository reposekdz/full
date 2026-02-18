import React, { useState, useEffect } from 'react';
import { 
  DollarSign, TrendingUp, TrendingDown, RefreshCw, Download, Plus, 
  Search, Filter, Eye, Edit, Trash2, X, CheckCircle, AlertCircle,
  CreditCard, Wallet, FileText, Users, Calendar, ChevronDown, Clock, User
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';

interface Payment {
  id: number;
  student_id: number;
  amount: number;
  payment_method: string;
  status: string;
  payment_date: string;
  first_name: string;
  last_name: string;
  student_id_code: string;
}

interface Expense {
  id: number;
  description: string;
  amount: number;
  category: string;
  status: string;
  expense_date: string;
}

interface StudentPayment {
  id: number;
  student_id: string;
  first_name: string;
  last_name: string;
  trade: string;
  level: string;
  total_fees: number;
  total_paid: number;
  balance: number;
}

const ComprehensiveAccountantDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('payments');
  const [payments, setPayments] = useState<Payment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [students, setStudents] = useState<StudentPayment[]>([]);
  const [sodLevel4Students, setSodLevel4Students] = useState<any[]>([]);
  const [sodLevel4Summary, setSodLevel4Summary] = useState<any>(null);
  const [parents, setParents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [totals, setTotals] = useState({
    total_income: 0,
    total_expenses: 0,
    total_pending: 0,
    completed_payments: 0,
    pending_payments: 0
  });
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    fetchData();
  }, [activeTab, statusFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      if (activeTab === 'payments') {
        const response = await fetch(
          `http://localhost:5000/api/comprehensive-admin/payments?status=${statusFilter}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await response.json();
        if (data.success) {
          setPayments(data.payments);
          setTotals(prev => ({
            ...prev,
            total_income: data.totals?.total_completed || 0,
            total_pending: data.totals?.total_pending || 0,
            completed_payments: data.totals?.total_payments || 0
          }));
        }
      } else if (activeTab === 'expenses') {
        const response = await fetch(
          `http://localhost:5000/api/comprehensive-admin/expenses?status=${statusFilter}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await response.json();
        if (data.success) {
          setExpenses(data.expenses);
          setTotals(prev => ({
            ...prev,
            total_expenses: data.totals?.total_paid || 0
          }));
        }
      } else if (activeTab === 'students') {
        const response = await fetch(
          `http://localhost:5000/api/comprehensive-admin/students?search=${searchQuery}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await response.json();
        if (data.success) {
          setStudents(data.students);
        }
      } else if (activeTab === 'sod-level4') {
        const response = await fetch(
          'http://localhost:5000/api/comprehensive-admin/dashboard/sod-level4',
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await response.json();
        if (data.success) {
          setSodLevel4Students(data.students);
          setSodLevel4Summary(data.summary);
        }
      } else if (activeTab === 'parents') {
        const response = await fetch(
          `http://localhost:5000/api/comprehensive-admin/parents?search=${searchQuery}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await response.json();
        if (data.success) {
          setParents(data.parents || []);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePayment = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/comprehensive-admin/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (data.success) {
        setShowModal(false);
        setFormData({});
        fetchData();
      }
    } catch (error) {
      console.error('Error creating payment:', error);
    }
  };

  const handleCreateExpense = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/comprehensive-admin/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (data.success) {
        setShowModal(false);
        setFormData({});
        fetchData();
      }
    } catch (error) {
      console.error('Error creating expense:', error);
    }
  };

  const handleCreateFee = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/comprehensive-admin/fees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (data.success) {
        setShowModal(false);
        setFormData({});
        fetchData();
      }
    } catch (error) {
      console.error('Error creating fee:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const renderPaymentsTab = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded-lg px-3 py-2"
          >
            <option value="">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </div>
        <Button onClick={() => { setModalType('payment'); setShowModal(true); }}>
          <Plus className="w-4 h-4 mr-2" /> Record Payment
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Student</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Method</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{payment.payment_date}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{payment.first_name} {payment.last_name}</div>
                      <div className="text-xs text-gray-500">{payment.student_id_code}</div>
                    </td>
                    <td className="px-4 py-3 text-sm capitalize">{payment.payment_method}</td>
                    <td className="px-4 py-3 font-bold">{formatCurrency(payment.amount)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={payment.status === 'completed' ? 'default' : 'secondary'}>
                        {payment.status}
                      </Badge>
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

  const renderExpensesTab = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded-lg px-3 py-2"
          >
            <option value="">All Status</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
          </select>
        </div>
        <Button onClick={() => { setModalType('expense'); setShowModal(true); }}>
          <Plus className="w-4 h-4 mr-2" /> Add Expense
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Description</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {expenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{expense.expense_date}</td>
                    <td className="px-4 py-3">{expense.description}</td>
                    <td className="px-4 py-3 text-sm capitalize">{expense.category}</td>
                    <td className="px-4 py-3 font-bold text-red-600">{formatCurrency(expense.amount)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={expense.status === 'paid' ? 'default' : 'secondary'}>
                        {expense.status}
                      </Badge>
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

  const renderStudentsTab = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => { setModalType('fee'); setShowModal(true); }}>
          <Plus className="w-4 h-4 mr-2" /> Add Fee
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-green-500 to-green-700 text-white">
          <CardContent className="p-4">
            <p className="text-green-100">Fully Paid</p>
            <p className="text-2xl font-bold">
              {students.filter(s => s.balance <= 0).length}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-500 to-yellow-700 text-white">
          <CardContent className="p-4">
            <p className="text-yellow-100">Partial Payment</p>
            <p className="text-2xl font-bold">
              {students.filter(s => s.balance > 0 && s.total_paid > 0).length}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-500 to-red-700 text-white">
          <CardContent className="p-4">
            <p className="text-red-100">Unpaid</p>
            <p className="text-2xl font-bold">
              {students.filter(s => s.total_paid === 0).length}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Student ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Trade/Level</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Total Fees</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Paid</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Balance</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-blue-600">{student.student_id}</td>
                    <td className="px-4 py-3 font-medium">{student.first_name} {student.last_name}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline">{student.trade}</Badge> {student.level}
                    </td>
                    <td className="px-4 py-3 font-medium">{formatCurrency(student.total_fees)}</td>
                    <td className="px-4 py-3 text-green-600 font-medium">{formatCurrency(student.total_paid)}</td>
                    <td className={`px-4 py-3 font-bold ${student.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {formatCurrency(student.balance)}
                    </td>
                    <td className="px-4 py-3">
                      {student.balance <= 0 ? (
                        <Badge variant="default" className="bg-green-600">Paid</Badge>
                      ) : student.total_paid > 0 ? (
                        <Badge variant="default" className="bg-yellow-600">Partial</Badge>
                      ) : (
                        <Badge variant="default" className="bg-red-600">Unpaid</Badge>
                      )}
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

  const renderSodLevel4Tab = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Level 4 SOD Students</h2>
        <Button onClick={async () => {
          try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/comprehensive-admin/export/sod-level4', {
              headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success && data.data) {
              const XLSX = await import('xlsx');
              const worksheet = XLSX.utils.json_to_sheet(data.data);
              const workbook = XLSX.utils.book_new();
              XLSX.utils.book_append_sheet(workbook, worksheet, 'Level4SOD');
              XLSX.writeFile(workbook, 'level4_sod_students.xlsx');
            }
          } catch (error) {
            console.error('Export error:', error);
          }
        }}>
          <Download className="w-4 h-4 mr-2" /> Export Excel
        </Button>
      </div>

      {sodLevel4Summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-700 text-white">
            <CardContent className="p-4">
              <p className="text-blue-100">Total Students</p>
              <p className="text-2xl font-bold">{sodLevel4Summary.total_students}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-500 to-green-700 text-white">
            <CardContent className="p-4">
              <p className="text-green-100">Fully Paid</p>
              <p className="text-2xl font-bold">{sodLevel4Summary.paid_students}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-yellow-500 to-yellow-700 text-white">
            <CardContent className="p-4">
              <p className="text-yellow-100">Partial</p>
              <p className="text-2xl font-bold">{sodLevel4Summary.partial_students}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-red-500 to-red-700 text-white">
            <CardContent className="p-4">
              <p className="text-red-100">Unpaid</p>
              <p className="text-2xl font-bold">{sodLevel4Summary.unpaid_students}</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">#</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Student ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Gender</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Total Fees</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Paid</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Balance</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sodLevel4Students.map((student, index) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500">{index + 1}</td>
                    <td className="px-4 py-3 font-mono text-blue-600">{student.student_id}</td>
                    <td className="px-4 py-3 font-medium">{student.first_name} {student.last_name}</td>
                    <td className="px-4 py-3">{student.gender}</td>
                    <td className="px-4 py-3 font-medium">{formatCurrency(student.total_fees || 0)}</td>
                    <td className="px-4 py-3 text-green-600 font-medium">{formatCurrency(student.total_paid || 0)}</td>
                    <td className={`px-4 py-3 font-bold ${student.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {formatCurrency(student.balance || 0)}
                    </td>
                    <td className="px-4 py-3">
                      {student.payment_status === 'paid' ? (
                        <Badge variant="default" className="bg-green-600">PAID</Badge>
                      ) : student.payment_status === 'partial' ? (
                        <Badge variant="default" className="bg-yellow-600">PARTIAL</Badge>
                      ) : (
                        <Badge variant="default" className="bg-red-600">UNPAID</Badge>
                      )}
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

  const renderParentsTab = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search parents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Phone</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Linked Students</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {parents.map((parent) => (
                  <tr key={parent.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{parent.first_name} {parent.last_name}</td>
                    <td className="px-4 py-3">{parent.email}</td>
                    <td className="px-4 py-3">{parent.phone}</td>
                    <td className="px-4 py-3">
                      {parent.linked_students?.map((s: any) => (
                        <Badge key={s.id} variant="outline" className="mr-1">
                          {s.first_name} {s.last_name} ({s.trade} {s.level})
                        </Badge>
                      ))}
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

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header Stats */}
      <div className="bg-white shadow-sm border-b p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total Income</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(totals.total_income)}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total Expenses</p>
                  <p className="text-2xl font-bold text-red-600">{formatCurrency(totals.total_expenses)}</p>
                </div>
                <TrendingDown className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Net Balance</p>
                  <p className={`text-2xl font-bold ${totals.total_income - totals.total_expenses >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(totals.total_income - totals.total_expenses)}
                  </p>
                </div>
                <Wallet className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{formatCurrency(totals.total_pending)}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="px-6 flex gap-6">
          {[
            { id: 'payments', label: 'Payments', icon: DollarSign },
            { id: 'expenses', label: 'Expenses', icon: CreditCard },
            { id: 'students', label: 'Student Fees', icon: Users },
            { id: 'sod-level4', label: 'Level 4 SOD', icon: FileText },
            { id: 'parents', label: 'Parents', icon: User }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-4 px-2 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <>
            {activeTab === 'payments' && renderPaymentsTab()}
            {activeTab === 'expenses' && renderExpensesTab()}
            {activeTab === 'students' && renderStudentsTab()}
            {activeTab === 'sod-level4' && renderSodLevel4Tab()}
            {activeTab === 'parents' && renderParentsTab()}
          </>
        )}
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">
                  {modalType === 'payment' && 'Record Payment'}
                  {modalType === 'expense' && 'Add Expense'}
                  {modalType === 'fee' && 'Add Fee'}
                </h2>
                <Button variant="ghost" onClick={() => setShowModal(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-4">
                {modalType === 'payment' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-1">Student ID</label>
                      <Input
                        type="number"
                        value={formData.student_id || ''}
                        onChange={(e) => setFormData({...formData, student_id: parseInt(e.target.value)})}
                        placeholder="Enter student ID"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Amount</label>
                      <Input
                        type="number"
                        value={formData.amount || ''}
                        onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value)})}
                        placeholder="Enter amount"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Payment Method</label>
                      <select
                        value={formData.payment_method || ''}
                        onChange={(e) => setFormData({...formData, payment_method: e.target.value})}
                        className="w-full border rounded-lg px-3 py-2"
                      >
                        <option value="">Select method</option>
                        <option value="cash">Cash</option>
                        <option value="mobile_money">Mobile Money</option>
                        <option value="bank_transfer">Bank Transfer</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Status</label>
                      <select
                        value={formData.status || ''}
                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                        className="w-full border rounded-lg px-3 py-2"
                      >
                        <option value="completed">Completed</option>
                        <option value="pending">Pending</option>
                      </select>
                    </div>
                    <Button className="w-full" onClick={handleCreatePayment}>
                      Record Payment
                    </Button>
                  </>
                )}

                {modalType === 'expense' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-1">Description</label>
                      <Input
                        type="text"
                        value={formData.description || ''}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        placeholder="Enter description"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Amount</label>
                      <Input
                        type="number"
                        value={formData.amount || ''}
                        onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value)})}
                        placeholder="Enter amount"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Category</label>
                      <select
                        value={formData.category || ''}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                        className="w-full border rounded-lg px-3 py-2"
                      >
                        <option value="">Select category</option>
                        <option value="salary">Salary</option>
                        <option value="supplies">Supplies</option>
                        <option value="maintenance">Maintenance</option>
                        <option value="utilities">Utilities</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Status</label>
                      <select
                        value={formData.status || ''}
                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                        className="w-full border rounded-lg px-3 py-2"
                      >
                        <option value="paid">Paid</option>
                        <option value="pending">Pending</option>
                      </select>
                    </div>
                    <Button className="w-full" onClick={handleCreateExpense}>
                      Add Expense
                    </Button>
                  </>
                )}

                {modalType === 'fee' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-1">Student ID</label>
                      <Input
                        type="number"
                        value={formData.student_id || ''}
                        onChange={(e) => setFormData({...formData, student_id: parseInt(e.target.value)})}
                        placeholder="Enter student ID"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Amount</label>
                      <Input
                        type="number"
                        value={formData.amount || ''}
                        onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value)})}
                        placeholder="Enter fee amount"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Description</label>
                      <Input
                        type="text"
                        value={formData.description || ''}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        placeholder="e.g., Tuition Fee, Lab Fee"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Academic Year</label>
                      <Input
                        type="text"
                        value={formData.academic_year || ''}
                        onChange={(e) => setFormData({...formData, academic_year: e.target.value})}
                        placeholder="e.g., 2024-2025"
                      />
                    </div>
                    <Button className="w-full" onClick={handleCreateFee}>
                      Add Fee
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComprehensiveAccountantDashboard;
