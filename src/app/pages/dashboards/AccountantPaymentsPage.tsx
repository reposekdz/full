import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Paper,
    Typography,
    Chip,
    IconButton,
    TextField,
    MenuItem,
    Button,
    Grid,
    Dialog,
    DialogContent,
    Tooltip,
    Card,
    CardContent,
    useTheme,
    alpha
} from '@mui/material';
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as ChartTooltip,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts';
import {
    DataGrid,
    GridColDef,
    GridToolbarContainer,
    GridToolbarExport,
    GridToolbarFilterButton,
    GridToolbarDensitySelector
} from '@mui/x-data-grid';
import {
    Refresh
} from '@mui/icons-material';
import axios from 'axios';
import PaymentReceipt from '../../components/PaymentReceipt';

const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:5000/api';

// Custom Toolbar
function CustomToolbar() {
    return (
        <GridToolbarContainer sx={{ p: 2 }}>
            <GridToolbarFilterButton />
            <GridToolbarDensitySelector />
            <GridToolbarExport printOptions={{ disableToolbarButton: true }} />
        </GridToolbarContainer>
    );
}

const AccountantPaymentsPage: React.FC = () => {
    const [payments, setPayments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);
    const [receiptOpen, setReceiptOpen] = useState(false);

    const theme = useTheme();

    // Filters
    const [statusFilter, setStatusFilter] = useState('all');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Stats
    const stats = {
        totalRevenue: payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0),
        pendingAmount: payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0),
        totalCount: payments.length,
        completedCount: payments.filter(p => p.status === 'completed').length
    };

    // Chart Data
    const getChartData = () => {
        const dailyData: any = {};
        payments.filter(p => p.status === 'completed').forEach(p => {
            const date = new Date(p.created_at).toLocaleDateString();
            dailyData[date] = (dailyData[date] || 0) + p.amount;
        });
        return Object.entries(dailyData).map(([name, value]) => ({ name, value })).sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime());
    };

    const getMethodData = () => {
        const methods: any = {};
        payments.forEach(p => {
            const method = p.payment_method || 'unknown';
            methods[method] = (methods[method] || 0) + 1;
        });
        return Object.entries(methods).map(([name, value]) => ({ name, value }));
    };

    const COLORS = [theme.palette.primary.main, theme.palette.secondary.main, theme.palette.warning.main, theme.palette.error.main];

    useEffect(() => {
        fetchPayments();
    }, [statusFilter, startDate, endDate]);

    const fetchPayments = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            let url = `${API_URL}/payments/all?`;

            if (statusFilter !== 'all') url += `status=${statusFilter}&`;
            if (startDate) url += `start_date=${startDate}&`;
            if (endDate) url += `end_date=${endDate}&`;

            const response = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                setPayments(response.data.payments.map((p: any) => ({
                    id: p.id,
                    ...p,
                    amount: parseFloat(p.amount) // Ensure number for sorting
                })));
            }
        } catch (error) {
            console.error('Failed to fetch payments', error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewReceipt = (payment: any) => {
        setSelectedReceipt(payment);
        setReceiptOpen(true);
    };

    const columns: GridColDef[] = [
        {
            field: 'id',
            headerName: 'ID',
            width: 70
        },
        {
            field: 'student_name',
            headerName: 'Student Name',
            width: 200,
            renderCell: (params) => (
                <Box>
                    <Typography variant="body2" fontWeight="500">{params.value}</Typography>
                    <Typography variant="caption" color="text.secondary">{params.row.student_code}</Typography>
                </Box>
            )
        },
        {
            field: 'parent_name',
            headerName: 'Parent',
            width: 180,
        },
        {
            field: 'reference_number',
            headerName: 'Reference',
            width: 180,
            renderCell: (params) => (
                <Tooltip title={params.value}>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {params.value}
                    </Typography>
                </Tooltip>
            )
        },
        {
            field: 'amount',
            headerName: 'Amount (RWF)',
            width: 150,
            type: 'number',
            valueFormatter: (params: any) => {
                return new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF' }).format(params.value);
            }
        },
        {
            field: 'payment_method',
            headerName: 'Method',
            width: 150,
            renderCell: (params) => (
                <Chip
                    label={params.value?.replace('_', ' ').toUpperCase()}
                    size="small"
                    variant="outlined"
                    color={params.value?.includes('mobile') ? 'warning' : 'info'}
                />
            )
        },
        {
            field: 'status',
            headerName: 'Status',
            width: 130,
            renderCell: (params) => {
                let color: any = 'default';
                let icon = <Pending fontSize="small" />;

                if (params.value === 'completed') {
                    color = 'success';
                    icon = <CheckCircle fontSize="small" />;
                } else if (params.value === 'failed') {
                    color = 'error';
                    icon = <Cancel fontSize="small" />;
                } else if (params.value === 'pending') {
                    color = 'warning';
                }

                return (
                    <Chip
                        icon={icon}
                        label={params.value.toUpperCase()}
                        color={color}
                        size="small"
                        sx={{ width: '100%' }}
                    />
                );
            }
        },
        {
            field: 'created_at',
            headerName: 'Date',
            width: 180,
            type: 'dateTime',
            valueGetter: (params) => new Date(params.value),
            valueFormatter: (params: any) => {
                return params.value?.toLocaleString();
            }
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 100,
            sortable: false,
            renderCell: (params) => (
                <Tooltip title="View Receipt">
                    <IconButton color="primary" onClick={() => handleViewReceipt(params.row)}>
                        <Visibility />
                    </IconButton>
                </Tooltip>
            )
        }
    ];

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" fontWeight="bold" color="primary">
                    💰 Financial Ledger & Analytics
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<Refresh />}
                    onClick={fetchPayments}
                >
                    Refresh Data
                </Button>
            </Box>

            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), borderLeft: `5px solid ${theme.palette.success.main}` }}>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom variant="overline">Total Revenue</Typography>
                            <Typography variant="h5" fontWeight="bold">
                                {new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF' }).format(stats.totalRevenue)}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1), borderLeft: `5px solid ${theme.palette.warning.main}` }}>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom variant="overline">Pending Payments</Typography>
                            <Typography variant="h5" fontWeight="bold">
                                {new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF' }).format(stats.pendingAmount)}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), borderLeft: `5px solid ${theme.palette.primary.main}` }}>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom variant="overline">Transaction Count</Typography>
                            <Typography variant="h5" fontWeight="bold">{stats.totalCount}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ bgcolor: alpha(theme.palette.info.main, 0.1), borderLeft: `5px solid ${theme.palette.info.main}` }}>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom variant="overline">Success Rate</Typography>
                            <Typography variant="h5" fontWeight="bold">
                                {stats.totalCount > 0 ? Math.round((stats.completedCount / stats.totalCount) * 100) : 0}%
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Charts Section */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, md: 8 }}>
                    <Paper sx={{ p: 3, height: 400 }}>
                        <Typography variant="h6" gutterBottom>Revenue Trends (Completed)</Typography>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={getChartData()}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.8} />
                                        <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis tickFormatter={(value) => `${value / 1000}k`} />
                                <ChartTooltip formatter={(value: any) => new Intl.NumberFormat('en-RW').format(value)} />
                                <Area type="monotone" dataKey="value" stroke={theme.palette.primary.main} fillOpacity={1} fill="url(#colorValue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper sx={{ p: 3, height: 400 }}>
                        <Typography variant="h6" gutterBottom>Payment Methods Breakdown</Typography>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={getMethodData()}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {getMethodData().map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <ChartTooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>
            </Grid>

            {/* Filters */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid size={{ xs: 12, md: 3 }}>
                        <TextField
                            label="Status"
                            select
                            fullWidth
                            size="small"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <MenuItem value="all">All Statuses</MenuItem>
                            <MenuItem value="completed">Completed</MenuItem>
                            <MenuItem value="pending">Pending</MenuItem>
                            <MenuItem value="failed">Failed</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <TextField
                            label="Start Date"
                            type="date"
                            fullWidth
                            size="small"
                            InputLabelProps={{ shrink: true }}
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <TextField
                            label="End Date"
                            type="date"
                            fullWidth
                            size="small"
                            InputLabelProps={{ shrink: true }}
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Button
                            fullWidth
                            variant="outlined"
                            onClick={() => {
                                setStatusFilter('all');
                                setStartDate('');
                                setEndDate('');
                            }}
                        >
                            Clear Filters
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            {/* Data Grid */}
            <Paper sx={{ height: 600, width: '100%', p: 1 }}>
                <DataGrid
                    rows={payments}
                    columns={columns}
                    initialState={{
                        pagination: { paginationModel: { pageSize: 25 } },
                        sorting: { sortModel: [{ field: 'created_at', sort: 'desc' }] }
                    }}
                    pageSizeOptions={[10, 25, 50, 100]}
                    slots={{ toolbar: CustomToolbar }}
                    loading={loading}
                    disableRowSelectionOnClick
                    sx={{
                        border: 0,
                        '& .MuiDataGrid-columnHeaders': {
                            backgroundColor: 'grey.100', // Light grey header
                            color: 'grey.800',
                            fontWeight: 'bold'
                        },
                        '& .MuiDataGrid-row:hover': {
                            backgroundColor: 'action.hover'
                        }
                    }}
                />
            </Paper>

            {/* Receipt Dialog */}
            <Dialog
                open={receiptOpen}
                onClose={() => setReceiptOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogContent sx={{ p: 0 }}>
                    {selectedReceipt && (
                        <PaymentReceipt
                            payment={selectedReceipt}
                            onClose={() => setReceiptOpen(false)}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </Container>
    );
};

export default AccountantPaymentsPage;
