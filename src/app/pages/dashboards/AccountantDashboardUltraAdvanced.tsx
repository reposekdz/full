import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  LinearProgress
} from '@mui/material';
import {
  Dashboard,
  AttachMoney,
  TrendingUp,
  TrendingDown,
  People,
  Assessment,
  Download,
  Send,
  Visibility,
  Edit,
  CheckCircle,
  Warning,
  Cancel,
  Payment,
  Receipt,
  Analytics,
  Notifications,
  Add,
  Refresh
} from '@mui/icons-material';
import axios from 'axios';
import {
  BarChart as RechartsBarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const API_BASE_URL = 'http://localhost:5000/api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const AccountantDashboardUltraAdvanced: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error' | 'info', message: string } | null>(null);
  
  const [dashboard, setDashboard] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [overduePayments, setOverduePayments] = useState<any[]>([]);
  
  const [openRecordPayment, setOpenRecordPayment] = useState(false);
  const [openSendReminder, setOpenSendReminder] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  
  const [paymentData, setPaymentData] = useState({
    student_id: '',
    amount: '',
    payment_method: 'cash',
    reference_number: '',
    payment_date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const [transactionData, setTransactionData] = useState({
    type: 'income',
    category: '',
    amount: '',
    description: '',
    transaction_date: new Date().toISOString().split('T')[0],
    reference_number: '',
    payment_method: 'cash'
  });

  const [openAddTransaction, setOpenAddTransaction] = useState(false);
  const [openBulkReminders, setOpenBulkReminders] = useState(false);
  const [bulkReminderSettings, setBulkReminderSettings] = useState({
    filter_type: 'overdue',
    days_overdue: 7,
    min_balance: 10000
  });

  const [filterTrade, setFilterTrade] = useState('');
  const [filterPaymentStatus, setFilterPaymentStatus] = useState('');
  const [searchStudent, setSearchStudent] = useState('');
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchDashboard();
  }, [dateRange]);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_BASE_URL}/accountant-ultra-advanced/dashboard?start_date=${dateRange.start}&end_date=${dateRange.end}`, 
        { headers: { Authorization: `Bearer ${token}` }}
      );
      setDashboard(response.data.dashboard);
      if (response.data.dashboard?.overdue_payments) {
        setOverduePayments(response.data.dashboard.overdue_payments);
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      showAlert('error', 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentPayments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      let query = `SELECT * FROM global_student_sheets WHERE status = 'active'`;
      const params = new URLSearchParams();
      if (filterTrade) params.append('trade_code', filterTrade);
      if (filterPaymentStatus) params.append('payment_status', filterPaymentStatus);
      if (searchStudent) params.append('search', searchStudent);
      
      const response = await axios.get(`${API_BASE_URL}/student-ultra-advanced/search?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudents(response.data.students || []);
    } catch (error) {
      console.error('Error fetching students:', error);
      showAlert('error', 'Failed to load student payments');
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      params.append('start_date', dateRange.start);
      params.append('end_date', dateRange.end);
      params.append('limit', '100');
      
      const response = await axios.get(`${API_BASE_URL}/accountant-ultra-advanced/payments/history?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTransactions(response.data.payments || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      showAlert('error', 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      params.append('start_date', dateRange.start);
      params.append('end_date', dateRange.end);
      
      const response = await axios.get(`${API_BASE_URL}/accountant-ultra-advanced/analytics/income-expense?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAnalytics(response.data.analytics);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      showAlert('error', 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const handleRecordPayment = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/accountant-ultra-advanced/payments/record`, paymentData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showAlert('success', 'Payment recorded successfully');
      setOpenRecordPayment(false);
      setPaymentData({
        student_id: '',
        amount: '',
        payment_method: 'cash',
        reference_number: '',
        payment_date: new Date().toISOString().split('T')[0],
        notes: ''
      });
      fetchDashboard();
      if (activeTab === 1) fetchStudentPayments();
      if (activeTab === 2) fetchTransactions();
    } catch (error: any) {
      showAlert('error', error.response?.data?.message || 'Failed to record payment');
    }
  };

  const handleSendReminder = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_BASE_URL}/accountant-ultra-advanced/payments/send-reminder`,
        { student_id: selectedStudent.student_id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showAlert('success', 'Reminder sent successfully via SMS');
      setOpenSendReminder(false);
    } catch (error: any) {
      showAlert('error', error.response?.data?.message || 'Failed to send reminder');
    }
  };

  const handleBulkReminders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE_URL}/accountant-ultra-advanced/payments/bulk-reminders`,
        bulkReminderSettings,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showAlert('success', `Bulk reminders sent: ${response.data.sent} successful, ${response.data.failed} failed`);
      setOpenBulkReminders(false);
    } catch (error: any) {
      showAlert('error', error.response?.data?.message || 'Failed to send bulk reminders');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTransaction = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/accountant-ultra-advanced/transactions`, transactionData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showAlert('success', 'Transaction recorded successfully');
      setOpenAddTransaction(false);
      setTransactionData({
        type: 'income',
        category: '',
        amount: '',
        description: '',
        transaction_date: new Date().toISOString().split('T')[0],
        reference_number: '',
        payment_method: 'cash'
      });
      fetchDashboard();
      if (activeTab === 2) fetchTransactions();
    } catch (error: any) {
      showAlert('error', error.response?.data?.message || 'Failed to record transaction');
    }
  };

  const handleExportReport = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE_URL}/accountant-ultra-advanced/reports/generate`,
        { 
          report_type: 'comprehensive',
          start_date: dateRange.start,
          end_date: dateRange.end,
          include_details: true
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const dataStr = JSON.stringify(response.data.report, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `financial_report_${dateRange.start}_to_${dateRange.end}.json`;
      link.click();
      showAlert('success', 'Report exported successfully');
    } catch (error: any) {
      showAlert('error', 'Failed to export report');
    }
  };

  const showAlert = (type: 'success' | 'error' | 'info', message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  useEffect(() => {
    if (activeTab === 1) fetchStudentPayments();
    if (activeTab === 2) fetchTransactions();
    if (activeTab === 3) fetchAnalytics();
    if (activeTab === 4) fetchOverduePayments();
  }, [activeTab, filterTrade, filterPaymentStatus]);

  const renderDashboard = () => (
    <Grid container spacing={3}>
      {/* Date Range Filter */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Start Date"
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="End Date"
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <Button fullWidth variant="contained" onClick={fetchDashboard}>
                  Apply Date Range
                </Button>
              </Grid>
              <Grid item xs={12} md={3}>
                <Button fullWidth variant="outlined" onClick={handleExportReport} startIcon={<Download />}>
                  Export Report
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Financial Summary Cards */}
      <Grid item xs={12} md={3}>
        <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', height: '100%' }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <AttachMoney fontSize="large" />
              <Chip label="Expected" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.3)', color: 'white' }} />
            </Box>
            <Typography variant="h4" fontWeight="bold">
              {dashboard?.summary?.student_fees?.expected_fees ? 
                `${(dashboard.summary.student_fees.expected_fees / 1000000).toFixed(2)}M` : '0'}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>Expected Revenue (RWF)</Typography>
            <Typography variant="caption" sx={{ opacity: 0.7 }}>
              {dashboard?.summary?.student_fees?.student_count || 0} Students
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card sx={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white', height: '100%' }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <CheckCircle fontSize="large" />
              <Chip label="Collected" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.3)', color: 'white' }} />
            </Box>
            <Typography variant="h4" fontWeight="bold">
              {dashboard?.summary?.student_fees?.collected_fees ? 
                `${(dashboard.summary.student_fees.collected_fees / 1000000).toFixed(2)}M` : '0'}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>Collected Revenue (RWF)</Typography>
            <LinearProgress 
              variant="determinate" 
              value={dashboard?.summary?.collection_rate || 0} 
              sx={{ mt: 1, backgroundColor: 'rgba(255,255,255,0.3)', '& .MuiLinearProgress-bar': { bgcolor: 'white' } }}
            />
            <Typography variant="caption" sx={{ opacity: 0.7 }}>
              {dashboard?.summary?.collection_rate || 0}% Collection Rate
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card sx={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white', height: '100%' }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Warning fontSize="large" />
              <Chip label="Outstanding" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.3)', color: 'white' }} />
            </Box>
            <Typography variant="h4" fontWeight="bold">
              {dashboard?.summary?.student_fees?.outstanding_fees ? 
                `${(dashboard.summary.student_fees.outstanding_fees / 1000000).toFixed(2)}M` : '0'}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>Outstanding Balance (RWF)</Typography>
            <Box mt={1} display="flex" gap={1}>
              <Chip label={`${dashboard?.summary?.student_fees?.unpaid || 0} Unpaid`} size="small" 
                sx={{ bgcolor: 'rgba(255,255,255,0.3)', color: 'white' }} />
              <Chip label={`${dashboard?.summary?.student_fees?.partial_paid || 0} Partial`} size="small" 
                sx={{ bgcolor: 'rgba(255,255,255,0.3)', color: 'white' }} />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white', height: '100%' }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <TrendingUp fontSize="large" />
              <Chip label="Income" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.3)', color: 'white' }} />
            </Box>
            <Typography variant="h4" fontWeight="bold">
              {dashboard?.summary?.total_income ? 
                `${(dashboard.summary.total_income / 1000000).toFixed(2)}M` : '0'}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>Total Income (RWF)</Typography>
            <Typography variant="caption" sx={{ opacity: 0.7, display: 'block', mt: 0.5 }}>
              <TrendingDown fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
              Expenses: {dashboard?.summary?.total_expenses ? 
                `${(dashboard.summary.total_expenses / 1000000).toFixed(2)}M` : '0'} RWF
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Recent Payments */}
      <Grid item xs={12} md={8}>
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Recent Payments</Typography>
              <Button size="small" onClick={() => setActiveTab(2)}>View All</Button>
            </Box>
            <TableContainer sx={{ maxHeight: 350 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Student</TableCell>
                    <TableCell>Trade/Level</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell>Method</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dashboard?.recent_payments?.slice(0, 10).map((payment: any) => (
                    <TableRow key={payment.id} hover>
                      <TableCell>{new Date(payment.payment_date).toLocaleDateString()}</TableCell>
                      <TableCell>{payment.first_name} {payment.last_name}</TableCell>
                      <TableCell>{payment.trade_code} L{payment.level_number}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                        {payment.amount?.toLocaleString()} RWF
                      </TableCell>
                      <TableCell>
                        <Chip label={payment.payment_method} size="small" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Overdue Payments Summary */}
      <Grid item xs={12} md={4}>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Overdue Payments</Typography>
            <Box mb={2}>
              <Typography variant="h3" color="error" fontWeight="bold">
                {dashboard?.overdue_payments?.length || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">Students with overdue payments</Typography>
            </Box>
            <Box maxHeight={250} overflow="auto">
              {dashboard?.overdue_payments?.slice(0, 5).map((payment: any) => (
                <Box key={payment.student_id} mb={2} p={1.5} sx={{ bgcolor: 'error.lighter', borderRadius: 1 }}>
                  <Typography variant="body2" fontWeight="bold">{payment.student_name}</Typography>
                  <Typography variant="caption" color="error">{payment.balance?.toLocaleString()} RWF</Typography>
                  <Typography variant="caption" display="block" color="text.secondary">
                    {payment.days_overdue} days overdue
                  </Typography>
                </Box>
              ))}
            </Box>
            <Button 
              fullWidth 
              variant="outlined" 
              color="error" 
              sx={{ mt: 2 }}
              onClick={() => setActiveTab(4)}
            >
              View All Overdue
            </Button>
          </CardContent>
        </Card>
      </Grid>

      {/* Monthly Collection Trend */}
      <Grid item xs={12} md={7}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Monthly Collection Trend</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={dashboard?.monthly_trends || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <RechartsTooltip formatter={(value) => `${Number(value).toLocaleString()} RWF`} />
                <Legend />
                <Area type="monotone" dataKey="income" stackId="1" stroke="#82ca9d" fill="#82ca9d" name="Income" />
                <Area type="monotone" dataKey="expenses" stackId="1" stroke="#ff8042" fill="#ff8042" name="Expenses" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Category Breakdown */}
      <Grid item xs={12} md={5}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Income by Category</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dashboard?.category_breakdown?.filter((c: any) => c.type === 'income') || []}
                  dataKey="total_amount"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) => `${entry.category}: ${(entry.total_amount / 1000).toFixed(0)}K`}
                >
                  {dashboard?.category_breakdown?.filter((c: any) => c.type === 'income')
                    .map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip formatter={(value) => `${Number(value).toLocaleString()} RWF`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Quick Actions */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Quick Actions</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Button 
                  fullWidth 
                  variant="contained" 
                  size="large"
                  startIcon={<Payment />}
                  onClick={() => setOpenRecordPayment(true)}
                  sx={{ py: 1.5 }}
                >
                  Record Payment
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button 
                  fullWidth 
                  variant="contained" 
                  color="secondary"
                  size="large"
                  startIcon={<Add />}
                  onClick={() => setOpenAddTransaction(true)}
                  sx={{ py: 1.5 }}
                >
                  Add Transaction
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button 
                  fullWidth 
                  variant="outlined" 
                  size="large"
                  startIcon={<Send />}
                  onClick={() => setOpenBulkReminders(true)}
                  sx={{ py: 1.5 }}
                >
                  Send Bulk Reminders
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button 
                  fullWidth 
                  variant="outlined" 
                  size="large"
                  startIcon={<Download />}
                  onClick={handleExportReport}
                  sx={{ py: 1.5 }}
                >
                  Export Report
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderStudentPayments = () => (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Student Payments</Typography>
        <Box display="flex" gap={2}>
          <Button variant="outlined" startIcon={<Refresh />} onClick={fetchStudentPayments}>
            Refresh
          </Button>
          <Button variant="contained" startIcon={<Payment />} onClick={() => setOpenRecordPayment(true)}>
            Record Payment
          </Button>
        </Box>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Search Student"
                placeholder="Name or Code"
                value={searchStudent}
                onChange={(e) => setSearchStudent(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Filter by Trade</InputLabel>
                <Select value={filterTrade} onChange={(e) => setFilterTrade(e.target.value)}>
                  <MenuItem value="">All Trades</MenuItem>
                  <MenuItem value="AUT">AUT - Automotive</MenuItem>
                  <MenuItem value="BDC">BDC - Building Construction</MenuItem>
                  <MenuItem value="SOD">SOD - Software Development</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Payment Status</InputLabel>
                <Select value={filterPaymentStatus} onChange={(e) => setFilterPaymentStatus(e.target.value)}>
                  <MenuItem value="">All Status</MenuItem>
                  <MenuItem value="paid">Fully Paid</MenuItem>
                  <MenuItem value="partial">Partially Paid</MenuItem>
                  <MenuItem value="unpaid">Unpaid</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <Button fullWidth variant="contained" size="large" onClick={fetchStudentPayments} sx={{ height: '56px' }}>
                Apply Filters
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {loading ? (
        <Box display="flex" justifyContent="center" p={5}>
          <CircularProgress />
        </Box>
      ) : (
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Student</TableCell>
                  <TableCell>Code</TableCell>
                  <TableCell>Trade/Level</TableCell>
                  <TableCell>Total Fees</TableCell>
                  <TableCell>Paid</TableCell>
                  <TableCell>Balance</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {students.map((student: any) => (
                  <TableRow key={student.student_id}>
                    <TableCell>{student.first_name} {student.last_name}</TableCell>
                    <TableCell>{student.student_code}</TableCell>
                    <TableCell>{student.trade_code} L{student.level_number}{student.level_suffix}</TableCell>
                    <TableCell>{student.total_fees?.toLocaleString()} RWF</TableCell>
                    <TableCell style={{ color: 'green', fontWeight: 'bold' }}>
                      {student.paid_amount?.toLocaleString()} RWF
                    </TableCell>
                    <TableCell style={{ color: 'red', fontWeight: 'bold' }}>
                      {student.balance?.toLocaleString()} RWF
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={student.payment_status} 
                        color={
                          student.payment_status === 'paid' ? 'success' : 
                          student.payment_status === 'partial' ? 'warning' : 'error'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Record Payment">
                        <IconButton 
                          size="small" 
                          onClick={() => {
                            setPaymentData({...paymentData, student_id: student.student_id});
                            setOpenRecordPayment(true);
                          }}
                        >
                          <Payment />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Send Reminder">
                        <IconButton 
                          size="small"
                          onClick={() => {
                            setSelectedStudent(student);
                            setOpenSendReminder(true);
                          }}
                        >
                          <Send />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="View Details">
                        <IconButton size="small">
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}
    </Box>
  );

  const renderTransactions = () => (
    <Box>
      <Typography variant="h5" mb={3}>Transaction History</Typography>
      
      {loading ? (
        <Box display="flex" justifyContent="center" p={5}>
          <CircularProgress />
        </Box>
      ) : (
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Student</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Method</TableCell>
                  <TableCell>Reference</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Recorded By</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.map((transaction: any) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{new Date(transaction.payment_date).toLocaleDateString()}</TableCell>
                    <TableCell>{transaction.student_name}</TableCell>
                    <TableCell fontWeight="bold">{transaction.amount?.toLocaleString()} RWF</TableCell>
                    <TableCell>
                      <Chip label={transaction.payment_method} size="small" />
                    </TableCell>
                    <TableCell>{transaction.reference_number}</TableCell>
                    <TableCell>
                      <Chip 
                        label={transaction.status} 
                        color={transaction.status === 'completed' ? 'success' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{transaction.recorded_by}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}
    </Box>
  );

  const renderAnalytics = () => (
    <Box>
      <Typography variant="h5" mb={3}>Financial Analytics</Typography>
      
      {loading ? (
        <Box display="flex" justifyContent="center" p={5}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Collection Rate by Trade</Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsBarChart data={analytics?.collection_by_trade || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="trade_code" />
                    <YAxis />
                    <RechartsTooltip />
                    <Bar dataKey="collection_rate" fill="#8884d8" />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Payment Methods Distribution</Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics?.payment_methods || []}
                      dataKey="count"
                      nameKey="method"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {analytics?.payment_methods?.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );

  const renderOverduePayments = () => (
    <Box>
      <Typography variant="h5" mb={3}>Overdue Payments</Typography>
      
      {loading ? (
        <Box display="flex" justifyContent="center" p={5}>
          <CircularProgress />
        </Box>
      ) : (
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Student</TableCell>
                  <TableCell>Trade/Level</TableCell>
                  <TableCell>Balance</TableCell>
                  <TableCell>Deadline</TableCell>
                  <TableCell>Days Overdue</TableCell>
                  <TableCell>Guardian Contact</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {overduePayments.map((payment: any) => (
                  <TableRow key={payment.student_id}>
                    <TableCell>{payment.student_name}</TableCell>
                    <TableCell>{payment.trade_code} L{payment.level_number}</TableCell>
                    <TableCell style={{ color: 'red', fontWeight: 'bold' }}>
                      {payment.balance?.toLocaleString()} RWF
                    </TableCell>
                    <TableCell>{new Date(payment.payment_deadline).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Chip 
                        label={`${payment.days_overdue} days`} 
                        color="error" 
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{payment.guardian_phone}</TableCell>
                    <TableCell>
                      <Button 
                        size="small" 
                        variant="outlined" 
                        startIcon={<Send />}
                        onClick={() => {
                          setSelectedStudent(payment);
                          setOpenSendReminder(true);
                        }}
                      >
                        Send Reminder
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}
    </Box>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {alert && (
        <Alert severity={alert.type} onClose={() => setAlert(null)} sx={{ mb: 3 }}>
          {alert.message}
        </Alert>
      )}

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4">Accountant Dashboard</Typography>
        <Button variant="outlined" startIcon={<Download />}>Export Report</Button>
      </Box>

      <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ mb: 3 }}>
        <Tab label="Dashboard" icon={<Dashboard />} iconPosition="start" />
        <Tab label="Student Payments" icon={<People />} iconPosition="start" />
        <Tab label="Transactions" icon={<Receipt />} iconPosition="start" />
        <Tab label="Analytics" icon={<Analytics />} iconPosition="start" />
        <Tab label="Overdue" icon={<Warning />} iconPosition="start" />
      </Tabs>

      {activeTab === 0 && renderDashboard()}
      {activeTab === 1 && renderStudentPayments()}
      {activeTab === 2 && renderTransactions()}
      {activeTab === 3 && renderAnalytics()}
      {activeTab === 4 && renderOverduePayments()}

      {/* Record Payment Dialog */}
      <Dialog open={openRecordPayment} onClose={() => setOpenRecordPayment(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Record Payment</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Student ID"
                type="number"
                value={paymentData.student_id}
                onChange={(e) => setPaymentData({...paymentData, student_id: e.target.value})}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Amount (RWF)"
                type="number"
                value={paymentData.amount}
                onChange={(e) => setPaymentData({...paymentData, amount: e.target.value})}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Payment Method</InputLabel>
                <Select 
                  value={paymentData.payment_method} 
                  onChange={(e) => setPaymentData({...paymentData, payment_method: e.target.value})}
                >
                  <MenuItem value="cash">Cash</MenuItem>
                  <MenuItem value="mobile_money">Mobile Money</MenuItem>
                  <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
                  <MenuItem value="cheque">Cheque</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Reference Number"
                value={paymentData.reference_number}
                onChange={(e) => setPaymentData({...paymentData, reference_number: e.target.value})}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Payment Date"
                type="date"
                value={paymentData.payment_date}
                onChange={(e) => setPaymentData({...paymentData, payment_date: e.target.value})}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRecordPayment(false)}>Cancel</Button>
          <Button onClick={handleRecordPayment} variant="contained">Record Payment</Button>
        </DialogActions>
      </Dialog>

      {/* Send Reminder Dialog */}
      <Dialog open={openSendReminder} onClose={() => setOpenSendReminder(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Send Payment Reminder</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1" mb={2}>
              Send payment reminder to <strong>{selectedStudent?.student_name || `${selectedStudent?.first_name} ${selectedStudent?.last_name}`}</strong>
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Outstanding Balance: <strong>{selectedStudent?.balance?.toLocaleString()} RWF</strong>
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Guardian Contact: <strong>{selectedStudent?.guardian_phone}</strong>
            </Typography>
            <Alert severity="info" sx={{ mt: 2 }}>
              Reminder will be sent via SMS to the guardian's phone number.
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSendReminder(false)}>Cancel</Button>
          <Button onClick={handleSendReminder} variant="contained" startIcon={<Send />}>
            Send Reminder
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Transaction Dialog */}
      <Dialog open={openAddTransaction} onClose={() => setOpenAddTransaction(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Transaction</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Transaction Type</InputLabel>
                <Select
                  value={transactionData.type}
                  onChange={(e) => setTransactionData({...transactionData, type: e.target.value})}
                >
                  <MenuItem value="income">Income</MenuItem>
                  <MenuItem value="expense">Expense</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Category"
                value={transactionData.category}
                onChange={(e) => setTransactionData({...transactionData, category: e.target.value})}
                placeholder="e.g., Salaries, Utilities, Materials"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Amount (RWF)"
                type="number"
                value={transactionData.amount}
                onChange={(e) => setTransactionData({...transactionData, amount: e.target.value})}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={transactionData.description}
                onChange={(e) => setTransactionData({...transactionData, description: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Transaction Date"
                type="date"
                value={transactionData.transaction_date}
                onChange={(e) => setTransactionData({...transactionData, transaction_date: e.target.value})}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Payment Method</InputLabel>
                <Select
                  value={transactionData.payment_method}
                  onChange={(e) => setTransactionData({...transactionData, payment_method: e.target.value})}
                >
                  <MenuItem value="cash">Cash</MenuItem>
                  <MenuItem value="mobile_money">Mobile Money</MenuItem>
                  <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
                  <MenuItem value="cheque">Cheque</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Reference Number (Optional)"
                value={transactionData.reference_number}
                onChange={(e) => setTransactionData({...transactionData, reference_number: e.target.value})}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddTransaction(false)}>Cancel</Button>
          <Button 
            onClick={handleAddTransaction} 
            variant="contained"
            disabled={!transactionData.category || !transactionData.amount}
          >
            Add Transaction
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Reminders Dialog */}
      <Dialog open={openBulkReminders} onClose={() => setOpenBulkReminders(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Send Bulk Payment Reminders</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Alert severity="warning" sx={{ mb: 3 }}>
              This will send SMS reminders to all guardians matching the criteria below.
            </Alert>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Filter Type</InputLabel>
                  <Select
                    value={bulkReminderSettings.filter_type}
                    onChange={(e) => setBulkReminderSettings({...bulkReminderSettings, filter_type: e.target.value})}
                  >
                    <MenuItem value="overdue">Overdue Payments Only</MenuItem>
                    <MenuItem value="all_outstanding">All Outstanding Balances</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              {bulkReminderSettings.filter_type === 'overdue' && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Minimum Days Overdue"
                    type="number"
                    value={bulkReminderSettings.days_overdue}
                    onChange={(e) => setBulkReminderSettings({...bulkReminderSettings, days_overdue: parseInt(e.target.value)})}
                  />
                </Grid>
              )}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Minimum Balance (RWF)"
                  type="number"
                  value={bulkReminderSettings.min_balance}
                  onChange={(e) => setBulkReminderSettings({...bulkReminderSettings, min_balance: parseInt(e.target.value)})}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenBulkReminders(false)}>Cancel</Button>
          <Button 
            onClick={handleBulkReminders} 
            variant="contained"
            color="warning"
            startIcon={<Send />}
          >
            Send Bulk Reminders
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AccountantDashboardUltraAdvanced;
