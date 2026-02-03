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
  LinearProgress,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemText,
  Divider,
  Avatar,
  IconButton
} from '@mui/material';
import {
  Dashboard,
  School,
  Assessment,
  AttachMoney,
  CalendarToday,
  Person,
  Grade,
  TrendingUp,
  LocalLibrary,
  Download,
  Visibility,
  Payment,
  Notifications,
  Message,
  CheckCircle,
  Warning,
  BarChart
} from '@mui/icons-material';
import axios from 'axios';
import {
  LineChart,
  Line,
  BarChart as RechartsBarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { translate, formatCurrency, formatDate } from '@/utils/kinyarwanda-translations';

const API_BASE_URL = 'http://localhost:5000/api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

interface ChildProfile {
  student_id: number;
  student_code: string;
  first_name: string;
  last_name: string;
  trade_name: string;
  level_number: number;
  level_suffix: string;
  gpa: number;
  attendance_percentage: number;
  status: string;
}

const ParentPortalUltraAdvanced: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error' | 'info', message: string } | null>(null);
  
  const [parentInfo, setParentInfo] = useState<any>(null);
  const [linkedChildren, setLinkedChildren] = useState<ChildProfile[]>([]);
  const [selectedChild, setSelectedChild] = useState<ChildProfile | null>(null);
  const [dashboard, setDashboard] = useState<any>(null);
  const [marks, setMarks] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  
  const [openLinkDialog, setOpenLinkDialog] = useState(false);
  const [serialCode, setSerialCode] = useState('');
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');

  useEffect(() => {
    fetchParentInfo();
    fetchLinkedChildren();
  }, []);

  useEffect(() => {
    if (selectedChild) {
      fetchChildDashboard();
    }
  }, [selectedChild]);

  const fetchParentInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/parent-portal-comprehensive/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setParentInfo(response.data.profile);
    } catch (error) {
      console.error('Error fetching parent info:', error);
      showAlert('error', 'Failed to load parent information');
    }
  };

  const fetchLinkedChildren = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/parent-portal-comprehensive/children`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLinkedChildren(response.data.children);
      if (response.data.children.length > 0 && !selectedChild) {
        setSelectedChild(response.data.children[0]);
      }
    } catch (error) {
      console.error('Error fetching children:', error);
      showAlert('error', 'Failed to load linked children');
    } finally {
      setLoading(false);
    }
  };

  const fetchChildDashboard = async () => {
    if (!selectedChild) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_BASE_URL}/parent-portal-comprehensive/child-dashboard/${selectedChild.student_id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDashboard(response.data.dashboard);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      showAlert('error', 'Failed to load child dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchChildMarks = async () => {
    if (!selectedChild) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_BASE_URL}/parent-portal-comprehensive/child-marks/${selectedChild.student_id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMarks(response.data.marks);
    } catch (error) {
      console.error('Error fetching marks:', error);
      showAlert('error', 'Failed to load marks');
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentHistory = async () => {
    if (!selectedChild) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_BASE_URL}/parent-portal-comprehensive/payment-history/${selectedChild.student_id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPayments(response.data.payments);
    } catch (error) {
      console.error('Error fetching payments:', error);
      showAlert('error', 'Failed to load payment history');
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendance = async () => {
    if (!selectedChild) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_BASE_URL}/parent-portal-comprehensive/child-attendance/${selectedChild.student_id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAttendance(response.data.attendance);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      showAlert('error', 'Failed to load attendance');
    } finally {
      setLoading(false);
    }
  };

  const handleLinkChild = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_BASE_URL}/serial-code-system/link-parent`,
        { serial_code: serialCode },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showAlert('success', 'Child linked successfully');
      setOpenLinkDialog(false);
      setSerialCode('');
      fetchLinkedChildren();
    } catch (error: any) {
      showAlert('error', error.response?.data?.message || 'Failed to link child');
    }
  };

  const showAlert = (type: 'success' | 'error' | 'info', message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  useEffect(() => {
    if (activeTab === 1) fetchChildMarks();
    if (activeTab === 2) fetchPaymentHistory();
    if (activeTab === 3) fetchAttendance();
  }, [activeTab, selectedChild]);

  const renderDashboard = () => (
    <Grid container spacing={3}>
      {/* Parent Info Card */}
      <Grid item xs={12}>
        <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item>
                <Avatar sx={{ width: 80, height: 80, bgcolor: 'white', color: '#667eea' }}>
                  {parentInfo?.first_name?.charAt(0)}{parentInfo?.last_name?.charAt(0)}
                </Avatar>
              </Grid>
              <Grid item xs>
                <Typography variant="h4">{parentInfo?.first_name} {parentInfo?.last_name}</Typography>
                <Typography variant="body1">{translate(parentInfo?.relationship_type || 'guardian')}</Typography>
                <Typography variant="body2">{translate('district')}: {parentInfo?.district}, {translate('province')}: {parentInfo?.province}</Typography>
              </Grid>
              <Grid item>
                <Button variant="contained" color="inherit" onClick={() => setOpenLinkDialog(true)}>
                  {translate('linkStudent')}
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Child Selector */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>{translate('linkedChild')}</Typography>
            <Grid container spacing={2}>
              {linkedChildren.map((child) => (
                <Grid item xs={12} md={4} key={child.student_id}>
                  <Card 
                    sx={{ 
                      cursor: 'pointer',
                      border: selectedChild?.student_id === child.student_id ? '2px solid #667eea' : 'none',
                      '&:hover': { boxShadow: 3 }
                    }}
                    onClick={() => setSelectedChild(child)}
                  >
                    <CardContent>
                      <Box display="flex" alignItems="center" mb={1}>
                        <Avatar sx={{ mr: 2 }}>
                          {child.first_name.charAt(0)}{child.last_name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="h6">{child.first_name} {child.last_name}</Typography>
                          <Typography variant="caption">{child.student_code}</Typography>
                        </Box>
                      </Box>
                      <Typography variant="body2" color="textSecondary">
                        {child.trade_name} - Level {child.level_number}{child.level_suffix}
                      </Typography>
                      <Box display="flex" justifyContent="space-between" mt={2}>
                        <Chip label={`GPA: ${child.gpa?.toFixed(2) || 'N/A'}`} size="small" color="primary" />
                        <Chip label={`${child.attendance_percentage?.toFixed(0) || 0}% Attendance`} size="small" color="success" />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {selectedChild && (
        <>
          {/* Statistics Cards */}
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="h4">{selectedChild.gpa?.toFixed(2) || '0.00'}</Typography>
                    <Typography variant="body2" color="textSecondary">{translate('gpa')}</Typography>
                  </Box>
                  <TrendingUp fontSize="large" color="success" />
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={(selectedChild.gpa / 4) * 100} 
                  sx={{ mt: 2 }} 
                  color="success"
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="h4">{selectedChild.attendance_percentage?.toFixed(0) || 0}%</Typography>
                    <Typography variant="body2" color="textSecondary">{translate('attendance')}</Typography>
                  </Box>
                  <CheckCircle fontSize="large" color="primary" />
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={selectedChild.attendance_percentage || 0} 
                  sx={{ mt: 2 }} 
                  color="primary"
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="h4">{dashboard?.balance ? `${(dashboard.balance / 1000).toFixed(0)}K` : '0'}</Typography>
                    <Typography variant="body2" color="textSecondary">{translate('balance')}</Typography>
                  </Box>
                  <AttachMoney fontSize="large" color="warning" />
                </Box>
                <Button 
                  fullWidth 
                  size="small" 
                  variant="outlined" 
                  sx={{ mt: 1 }}
                  onClick={() => setOpenPaymentDialog(true)}
                >
                  {translate('makePayment')}
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="h4">{dashboard?.rank || 'N/A'}</Typography>
                    <Typography variant="body2" color="textSecondary">{translate('classRank')}</Typography>
                  </Box>
                  <Grade fontSize="large" color="info" />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Performance Charts */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom">{translate('performanceTrend')}</Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dashboard?.performance_trend || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="term" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Line type="monotone" dataKey="gpa" stroke="#8884d8" strokeWidth={2} name="GPA" />
                    <Line type="monotone" dataKey="average_marks" stroke="#82ca9d" strokeWidth={2} name="Avg Marks" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom">{translate('subjectPerformance')}</Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={dashboard?.subject_performance || []}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar name="Marks" dataKey="percentage" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Payment Summary */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>{translate('payments')}</Typography>
                <Box mb={2}>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">{translate('totalFees')}:</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {dashboard?.total_fees ? formatCurrency(dashboard.total_fees) : formatCurrency(0)}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">{translate('paidAmount')}:</Typography>
                    <Typography variant="body2" color="success.main" fontWeight="bold">
                      {dashboard?.paid_amount ? formatCurrency(dashboard.paid_amount) : formatCurrency(0)}
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body1" fontWeight="bold">{translate('balance')}:</Typography>
                    <Typography variant="body1" color="error.main" fontWeight="bold">
                      {dashboard?.balance ? formatCurrency(dashboard.balance) : formatCurrency(0)}
                    </Typography>
                  </Box>
                </Box>
                {dashboard?.payment_deadline && (
                  <Alert severity={new Date(dashboard.payment_deadline) < new Date() ? 'error' : 'info'}>
                    {translate('paymentDeadline')}: {formatDate(dashboard.payment_deadline)}
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Activity */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>{translate('recentActivity')}</Typography>
                <List>
                  {dashboard?.recent_activities?.slice(0, 5).map((activity: any, index: number) => (
                    <React.Fragment key={index}>
                      <ListItem>
                        <ListItemText
                          primary={activity.description}
                          secondary={new Date(activity.activity_time).toLocaleString()}
                        />
                      </ListItem>
                      {index < 4 && <Divider />}
                    </React.Fragment>
                  )) || <Typography variant="body2" color="textSecondary">{translate('noDataAvailable')}</Typography>}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </>
      )}
    </Grid>
  );

  const renderMarks = () => (
    <Box>
      <Typography variant="h5" mb={3}>
        {translate('marks')} - {selectedChild?.first_name}
      </Typography>
      
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
                  <TableCell>{translate('subjects')}</TableCell>
                  <TableCell>{translate('assignment')}</TableCell>
                  <TableCell>{translate('marks')}</TableCell>
                  <TableCell>{translate('totalFees')}</TableCell>
                  <TableCell>%</TableCell>
                  <TableCell>{translate('grade')}</TableCell>
                  <TableCell>{translate('term')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {marks.map((mark: any) => (
                  <TableRow key={mark.id}>
                    <TableCell>{mark.subject_name}</TableCell>
                    <TableCell>
                      <Chip label={mark.assessment_type} size="small" />
                    </TableCell>
                    <TableCell>{mark.marks_obtained}</TableCell>
                    <TableCell>{mark.total_marks}</TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Box width="100px" mr={1}>
                          <LinearProgress 
                            variant="determinate" 
                            value={mark.percentage} 
                            color={mark.percentage >= 70 ? 'success' : mark.percentage >= 50 ? 'warning' : 'error'}
                          />
                        </Box>
                        <Typography variant="body2">{mark.percentage}%</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={mark.grade} 
                        color={mark.grade.includes('A') ? 'success' : mark.grade.includes('B') ? 'primary' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>T{mark.term}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}
    </Box>
  );

  const renderPayments = () => (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">{translate('paymentHistory')}</Typography>
        <Button variant="contained" startIcon={<Payment />} onClick={() => setOpenPaymentDialog(true)}>
          {translate('makePayment')}
        </Button>
      </Box>
      
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
                  <TableCell>{translate('transactionDate')}</TableCell>
                  <TableCell>{translate('paidAmount')}</TableCell>
                  <TableCell>{translate('paymentMethod')}</TableCell>
                  <TableCell>{translate('referenceNumber')}</TableCell>
                  <TableCell>{translate('status')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {payments.map((payment: any) => (
                  <TableRow key={payment.id}>
                    <TableCell>{formatDate(payment.payment_date)}</TableCell>
                    <TableCell fontWeight="bold">{formatCurrency(payment.amount)}</TableCell>
                    <TableCell>{translate(payment.payment_method)}</TableCell>
                    <TableCell>{payment.reference_number}</TableCell>
                    <TableCell>
                      <Chip 
                        label={payment.status} 
                        color={payment.status === 'completed' ? 'success' : 'warning'}
                        size="small"
                      />
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

  const renderAttendance = () => (
    <Box>
      <Typography variant="h5" mb={3}>{translate('attendance')}</Typography>
      
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
                  <TableCell>{translate('transactionDate')}</TableCell>
                  <TableCell>{translate('subjects')}</TableCell>
                  <TableCell>{translate('status')}</TableCell>
                  <TableCell>{translate('today')}</TableCell>
                  <TableCell>{translate('feedback')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {attendance.map((record: any, index: number) => (
                  <TableRow key={index}>
                    <TableCell>{formatDate(record.date)}</TableCell>
                    <TableCell>{record.subject_name}</TableCell>
                    <TableCell>
                      <Chip 
                        label={translate(record.status)} 
                        color={record.status === 'present' ? 'success' : record.status === 'late' ? 'warning' : 'error'}
                        size="small"
                        icon={record.status === 'present' ? <CheckCircle /> : <Warning />}
                      />
                    </TableCell>
                    <TableCell>{record.time}</TableCell>
                    <TableCell>{record.remarks || '-'}</TableCell>
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
        <Typography variant="h4">{translate('parentPortal')}</Typography>
        <Button variant="outlined" startIcon={<Download />}>{translate('download')}</Button>
      </Box>

      <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ mb: 3 }}>
        <Tab label={translate('dashboard')} icon={<Dashboard />} iconPosition="start" />
        <Tab label={translate('marks')} icon={<Grade />} iconPosition="start" />
        <Tab label={translate('payments')} icon={<AttachMoney />} iconPosition="start" />
        <Tab label={translate('attendance')} icon={<CalendarToday />} iconPosition="start" />
      </Tabs>

      {activeTab === 0 && renderDashboard()}
      {activeTab === 1 && renderMarks()}
      {activeTab === 2 && renderPayments()}
      {activeTab === 3 && renderAttendance()}

      {/* Link Child Dialog */}
      <Dialog open={openLinkDialog} onClose={() => setOpenLinkDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{translate('linkStudent')}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label={translate('enterSerialCode')}
            value={serialCode}
            onChange={(e) => setSerialCode(e.target.value)}
            sx={{ mt: 2 }}
            helperText={translate('enterSerialCode')}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenLinkDialog(false)}>{translate('cancel')}</Button>
          <Button onClick={handleLinkChild} variant="contained">{translate('linkStudent')}</Button>
        </DialogActions>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={openPaymentDialog} onClose={() => setOpenPaymentDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{translate('makePayment')}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="textSecondary" mb={2}>
              {translate('balance')}: {dashboard?.balance ? formatCurrency(dashboard.balance) : formatCurrency(0)}
            </Typography>
            <TextField
              fullWidth
              label={translate('paidAmount')}
              type="number"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Alert severity="info">
              {translate('payOnTime')}
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPaymentDialog(false)}>{translate('cancel')}</Button>
          <Button variant="contained">{translate('submit')}</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ParentPortalUltraAdvanced;
