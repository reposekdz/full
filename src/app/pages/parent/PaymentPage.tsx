import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Grid,
    Card,
    CardContent,
    Typography,
    Button,
    TextField,
    Radio,
    RadioGroup,
    FormControlLabel,
    FormControl,
    FormLabel,
    Alert,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    LinearProgress,
    IconButton,
    Tooltip,
    Divider,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Select,
    MenuItem,
    InputAdornment,
    Collapse
} from '@mui/material';
import {
    CreditCard,
    AccountBalance,
    Phone,
    Receipt,
    Download,
    CheckCircle,
    Warning,
    Info,
    ArrowForward,
    History,
    AttachMoney,
    TrendingUp,
    CalendarToday,
    ExpandMore,
    ExpandLess,
    Print
} from '@mui/icons-material';
import axios from 'axios';
import PaymentReceipt from '../../components/PaymentReceipt';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface Student {
    student_id: string;
    first_name: string;
    last_name: string;
    trade_name: string;
    level_number: string;
    total_fees: number;
    paid_amount: number;
    balance: number;
    payment_status: 'paid' | 'partial' | 'unpaid';
    percentage_paid: number;
}

interface FeeStructure {
    id: number;
    fee_type: string;
    fee_category: string;
    amount: number;
    due_date: string;
    status: 'paid' | 'overdue' | 'pending';
    paid_amount: number;
}

interface Payment {
    id: number;
    amount: number;
    payment_method: string;
    reference_number: string;
    payment_date: string;
    status: string;
    receipt_number: string;
    bank_name: string;
}

interface PaymentGateway {
    code: string;
    name: string;
    color: string;
    icon: React.JSX.Element;
    feePercent?: number;
    enabled: boolean;
    type: 'bank' | 'mobile';
}

const PAYMENT_GATEWAYS: PaymentGateway[] = [
    {
        code: 'gt_bank',
        name: 'GT Bank Rwanda',
        color: '#1A237E',
        icon: <AccountBalance />,
        enabled: true,
        type: 'bank'
    },
    {
        code: 'bpr',
        name: 'Bank of Kigali (BPR)',
        color: '#C62828',
        icon: <AccountBalance />,
        enabled: true,
        type: 'bank'
    },
    {
        code: 'equity_bank',
        name: 'Equity Bank Rwanda',
        color: '#1565C0',
        icon: <AccountBalance />,
        enabled: true,
        type: 'bank'
    },
    {
        code: 'mtn_money',
        name: 'MTN Mobile Money',
        color: '#FFC107',
        icon: <Phone />,
        feePercent: 0.5,
        enabled: true,
        type: 'mobile'
    },
    {
        code: 'airtel_money',
        name: 'Airtel Money',
        color: '#D32F2F',
        icon: <Phone />,
        feePercent: 0.5,
        enabled: true,
        type: 'mobile'
    }
];

const PaymentPage: React.FC = () => {
    // State management
    const [students, setStudents] = useState<Student[]>([]);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [feeStructure, setFeeStructure] = useState<FeeStructure[]>([]);
    const [paymentHistory, setPaymentHistory] = useState<Payment[]>([]);
    const [selectedGateway, setSelectedGateway] = useState<string>('');
    const [amount, setAmount] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showFeeDetails, setShowFeeDetails] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [paymentDialog, setPaymentDialog] = useState(false);
    const [receiptDialog, setReceiptDialog] = useState(false);
    const [selectedReceipt, setSelectedReceipt] = useState<Payment | null>(null);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchStudents();
    }, []);

    useEffect(() => {
        if (selectedStudent) {
            fetchFeeStructure(selectedStudent.student_id);
            fetchPaymentHistory(selectedStudent.student_id);
        }
    }, [selectedStudent]);

    const fetchStudents = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/parent-payment-portal/my-children`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setStudents(response.data.children);
                if (response.data.children.length > 0) {
                    setSelectedStudent(response.data.children[0]);
                }
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load students');
        }
    };

    const fetchFeeStructure = async (studentId: string) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/parent-payment-portal/fee-structure/${studentId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setFeeStructure(response.data.feeStructure);
            }
        } catch (err) {
            console.error('Failed to load fee structure');
        }
    };

    const fetchPaymentHistory = async (studentId: string) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/parent-payment-portal/payment-history/${studentId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setPaymentHistory(response.data.payments);
            }
        } catch (err) {
            console.error('Failed to load payment history');
        }
    };

    const handlePayment = async () => {
        if (!selectedStudent || !selectedGateway || !amount) {
            setError('Please fill all fields');
            return;
        }

        const paymentAmount = parseFloat(amount);
        if (paymentAmount <= 0) {
            setError('Invalid amount');
            return;
        }

        setProcessing(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${API_URL}/parent-payment-portal/initiate-payment`,
                {
                    studentId: selectedStudent.student_id,
                    amount: paymentAmount,
                    paymentMethod: selectedGateway
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                setSuccess(`Payment processed successfully! Receipt: ${response.data.receiptNumber}`);
                setPaymentDialog(false);
                setAmount('');
                // Refresh data
                fetchStudents();
                fetchPaymentHistory(selectedStudent.student_id);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Payment failed');
        } finally {
            setProcessing(false);
        }
    };

    const calculateFee = () => {
        if (!amount || !selectedGateway) return 0;
        const gateway = PAYMENT_GATEWAYS.find(g => g.code === selectedGateway);
        if (gateway && gateway.feePercent) {
            return (parseFloat(amount) * gateway.feePercent) / 100;
        }
        return 0;
    };

    const getTotal = () => {
        return parseFloat(amount || '0') + calculateFee();
    };

    const handleDownloadReceipt = (payment: Payment) => {
        setSelectedReceipt(payment);
        setReceiptDialog(true);
    };

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" gutterBottom fontWeight="bold" color="primary">
                    💳 Payment Portal
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Make payments securely through GT Bank, BPR, Equity Bank, MTN, or Airtel Money
                </Typography>
            </Box>

            {/* Alerts */}
            {error && <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" onClose={() => setSuccess('')} sx={{ mb: 2 }}>{success}</Alert>}

            <Grid container spacing={3}>
                {/* Left Column - Student Selection & Fee Summary */}
                <Grid size={{ xs: 12, md: 4 }}>
                    {/* Student Selector */}
                    <Card sx={{ mb: 2 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>Select Student</Typography>
                            <FormControl fullWidth>
                                <Select
                                    value={selectedStudent?.student_id || ''}
                                    onChange={(e) => {
                                        const student = students.find(s => s.student_id === e.target.value);
                                        setSelectedStudent(student || null);
                                    }}
                                >
                                    {students.map((student) => (
                                        <MenuItem key={student.student_id} value={student.student_id}>
                                            {student.first_name} {student.last_name} - {student.trade_name} L{student.level_number}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </CardContent>
                    </Card>

                    {/* Fee Summary Card */}
                    {selectedStudent && (
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Typography variant="h6">Fee Summary</Typography>
                                    <Chip
                                        label={selectedStudent.payment_status.toUpperCase()}
                                        color={
                                            selectedStudent.payment_status === 'paid' ? 'success' :
                                                selectedStudent.payment_status === 'partial' ? 'warning' : 'error'
                                        }
                                        size="small"
                                    />
                                </Box>

                                <List dense>
                                    <ListItem>
                                        <ListItemText
                                            primary="Total Fees"
                                            primaryTypographyProps={{ fontWeight: 'bold' }}
                                        />
                                        <Typography variant="body2">{selectedStudent.total_fees.toLocaleString()} RWF</Typography>
                                    </ListItem>
                                    <Divider />
                                    <ListItem>
                                        <ListItemText
                                            primary="Amount Paid"
                                            primaryTypographyProps={{ color: 'success.main' }}
                                        />
                                        <Typography variant="body2" color="success.main">
                                            {selectedStudent.paid_amount.toLocaleString()} RWF
                                        </Typography>
                                    </ListItem>
                                    <Divider />
                                    <ListItem>
                                        <ListItemText
                                            primary="Balance Due"
                                            primaryTypographyProps={{ fontWeight: 'bold', color: 'error.main' }}
                                        />
                                        <Typography variant="h6" color="error.main">
                                            {selectedStudent.balance.toLocaleString()} RWF
                                        </Typography>
                                    </ListItem>
                                </List>

                                {/* Progress Bar */}
                                <Box sx={{ mt: 2 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="caption">Payment Progress</Typography>
                                        <Typography variant="caption" fontWeight="bold">
                                            {selectedStudent.percentage_paid.toFixed(1)}%
                                        </Typography>
                                    </Box>
                                    <LinearProgress
                                        variant="determinate"
                                        value={selectedStudent.percentage_paid}
                                        sx={{ height: 8, borderRadius: 1 }}
                                    />
                                </Box>

                                {/* Actions */}
                                <Box sx={{ mt: 3, display: 'flex', gap: 1 }}>
                                    <Button
                                        variant="contained"
                                        fullWidth
                                        startIcon={<AttachMoney />}
                                        onClick={() => setPaymentDialog(true)}
                                        disabled={selectedStudent.balance <= 0}
                                    >
                                        Make Payment
                                    </Button>
                                </Box>

                                <Button
                                    fullWidth
                                    startIcon={showFeeDetails ? <ExpandLess /> : <ExpandMore />}
                                    onClick={() => setShowFeeDetails(!showFeeDetails)}
                                    sx={{ mt: 1 }}
                                >
                                    View Fee Breakdown
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </Grid>

                {/* Right Column - Fee Details & Payment History */}
                <Grid size={{ xs: 12, md: 8 }}>
                    {/* Fee Breakdown */}
                    <Collapse in={showFeeDetails}>
                        <Card sx={{ mb: 2 }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>Fee Breakdown</Typography>
                                <TableContainer>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Fee Type</TableCell>
                                                <TableCell>Category</TableCell>
                                                <TableCell align="right">Amount</TableCell>
                                                <TableCell align="right">Paid</TableCell>
                                                <TableCell>Due Date</TableCell>
                                                <TableCell>Status</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {feeStructure.map((fee) => (
                                                <TableRow key={fee.id}>
                                                    <TableCell>{fee.fee_type}</TableCell>
                                                    <TableCell>{fee.fee_category}</TableCell>
                                                    <TableCell align="right">{fee.amount.toLocaleString()} RWF</TableCell>
                                                    <TableCell align="right">{fee.paid_amount.toLocaleString()} RWF</TableCell>
                                                    <TableCell>{new Date(fee.due_date).toLocaleDateString()}</TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={fee.status}
                                                            size="small"
                                                            color={
                                                                fee.status === 'paid' ? 'success' :
                                                                    fee.status === 'overdue' ? 'error' : 'default'
                                                            }
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </CardContent>
                        </Card>
                    </Collapse>

                    {/* Payment History */}
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6">
                                    <History sx={{ mr: 1, verticalAlign: 'middle' }} />
                                    Payment History
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {paymentHistory.length} transaction(s)
                                </Typography>
                            </Box>

                            <TableContainer component={Paper} variant="outlined">
                                <Table>
                                    <TableHead>
                                        <TableRow sx={{ backgroundColor: 'action.hover' }}>
                                            <TableCell>Date</TableCell>
                                            <TableCell>Method</TableCell>
                                            <TableCell align="right">Amount</TableCell>
                                            <TableCell>Reference</TableCell>
                                            <TableCell>Status</TableCell>
                                            <TableCell align="center">Receipt</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {paymentHistory.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} align="center">
                                                    <Typography color="text.secondary" py={3}>
                                                        No payment history yet
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            paymentHistory.map((payment) => (
                                                <TableRow key={payment.id} hover>
                                                    <TableCell>
                                                        {new Date(payment.payment_date).toLocaleDateString()}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            {PAYMENT_GATEWAYS.find(g => g.code === payment.payment_method)?.icon}
                                                            <Typography variant="body2">{payment.bank_name}</Typography>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Typography fontWeight="bold">
                                                            {payment.amount.toLocaleString()} RWF
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                                                            {payment.reference_number}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={payment.status}
                                                            size="small"
                                                            color={payment.status === 'completed' ? 'success' : 'default'}
                                                        />
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <Tooltip title="Download Receipt">
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => handleDownloadReceipt(payment)}
                                                                color="primary"
                                                            >
                                                                <Download />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Payment Dialog */}
            <Dialog open={paymentDialog} onClose={() => !processing && setPaymentDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>
                    <CreditCard sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Make Payment
                </DialogTitle>
                <DialogContent dividers>
                    {selectedStudent && (
                        <>
                            <Alert severity="info" sx={{ mb: 3 }}>
                                Payment for: <strong>{selectedStudent.first_name} {selectedStudent.last_name}</strong>
                                <br />
                                Outstanding Balance: <strong>{selectedStudent.balance.toLocaleString()} RWF</strong>
                            </Alert>

                            <TextField
                                label="Amount to Pay (RWF)"
                                type="number"
                                fullWidth
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                sx={{ mb: 3 }}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start">RWF</InputAdornment>,
                                }}
                                helperText={`Maximum: ${selectedStudent.balance.toLocaleString()} RWF`}
                            />

                            <FormControl component="fieldset" fullWidth sx={{ mb: 2 }}>
                                <FormLabel component="legend" sx={{ mb: 2 }}>Select Payment Method</FormLabel>
                                <RadioGroup value={selectedGateway} onChange={(e) => setSelectedGateway(e.target.value)}>
                                    {PAYMENT_GATEWAYS.filter(g => g.enabled).map((gateway) => (
                                        <Paper
                                            key={gateway.code}
                                            sx={{
                                                p: 2,
                                                mb: 1,
                                                border: selectedGateway === gateway.code ? 2 : 1,
                                                borderColor: selectedGateway === gateway.code ? gateway.color : 'divider',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                '&:hover': { borderColor: gateway.color }
                                            }}
                                            onClick={() => setSelectedGateway(gateway.code)}
                                        >
                                            <FormControlLabel
                                                value={gateway.code}
                                                control={<Radio />}
                                                label={
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Box sx={{ color: gateway.color }}>{gateway.icon}</Box>
                                                        <Box>
                                                            <Typography>{gateway.name}</Typography>
                                                            {gateway.feePercent && (
                                                                <Typography variant="caption" color="text.secondary">
                                                                    Transaction fee: {gateway.feePercent}%
                                                                </Typography>
                                                            )}
                                                        </Box>
                                                    </Box>
                                                }
                                            />
                                        </Paper>
                                    ))}
                                </RadioGroup>
                            </FormControl>

                            {/* Payment Summary */}
                            {amount && selectedGateway && (
                                <Paper sx={{ p: 2, bgcolor: 'action.hover' }}>
                                    <Typography variant="subtitle2" gutterBottom>Payment Summary</Typography>
                                    <Divider sx={{ my: 1 }} />
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography>Amount:</Typography>
                                        <Typography>{parseFloat(amount).toLocaleString()} RWF</Typography>
                                    </Box>
                                    {calculateFee() > 0 && (
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Typography>Transaction Fee:</Typography>
                                            <Typography>{calculateFee().toLocaleString()} RWF</Typography>
                                        </Box>
                                    )}
                                    <Divider sx={{ my: 1 }} />
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography fontWeight="bold">Total:</Typography>
                                        <Typography fontWeight="bold" color="primary">
                                            {getTotal().toLocaleString()} RWF
                                        </Typography>
                                    </Box>
                                </Paper>
                            )}
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPaymentDialog(false)} disabled={processing}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handlePayment}
                        disabled={!amount || !selectedGateway || processing}
                        startIcon={processing ? <CircularProgress size={16} /> : <CheckCircle />}
                    >
                        {processing ? 'Processing...' : 'Confirm Payment'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Receipt Dialog */}
            <Dialog
                open={receiptDialog}
                onClose={() => setReceiptDialog(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogContent sx={{ p: 0 }}>
                    {selectedReceipt && (
                        <PaymentReceipt
                            payment={selectedReceipt}
                            onClose={() => setReceiptDialog(false)}
                        />
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setReceiptDialog(false)}>Close</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default PaymentPage;
