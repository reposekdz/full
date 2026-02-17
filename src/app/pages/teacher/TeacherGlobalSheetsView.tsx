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
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Alert,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Chip,
    Tooltip,
    Divider,
    InputAdornment
} from '@mui/material';
import {
    Search,
    FilterList,
    GetApp, // Export icon
    Visibility,
    School,
    TrendingUp,
    Rule, // For conduct
    CheckCircle,
    Cancel
} from '@mui/icons-material';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface StudentSheet {
    id: number;
    student_id: number;
    first_name: string;
    last_name: string;
    student_code: string;
    trade_code: string;
    level_number: number;
    status: string;
    average_marks: number;
    attendance_percentage: number;
    conduct_score: number;
    custom_values?: string; // "colId:text:num|colId:text:num"
}

const TeacherGlobalSheetsView: React.FC = () => {
    const [tradeCode, setTradeCode] = useState('');
    const [levelNumber, setLevelNumber] = useState(0);
    const [sheets, setSheets] = useState<StudentSheet[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('active');

    useEffect(() => {
        fetchSheets();
    }, [tradeCode, levelNumber]);

    const fetchSheets = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            let url = `${API_URL}/global-student-sheets/sheets/teacher?`;
            if (tradeCode) url += `trade_code=${tradeCode}&`;
            if (levelNumber) url += `level_number=${levelNumber}&`;

            const response = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                setSheets(response.data.sheets);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load sheets');
        } finally {
            setLoading(false);
        }
    };

    const filteredSheets = sheets.filter(sheet => {
        const matchesSearch =
            sheet.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sheet.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sheet.student_code.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = filterStatus === 'all' || sheet.status === filterStatus;

        return matchesSearch && matchesStatus;
    });

    const exportToExcel = () => {
        // Logic to export data to Excel (CSVs)
        const headers = ['Student Code', 'Name', 'Trade', 'Level', 'Status', 'Avg Marks', 'Attendance %', 'Conduct'];
        const csvContent = [
            headers.join(','),
            ...filteredSheets.map(s => [
                s.student_code,
                `"${s.first_name} ${s.last_name}"`,
                s.trade_code,
                s.level_number,
                s.status,
                s.average_marks,
                s.attendance_percentage,
                s.conduct_score
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `student_sheets_${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();
    };

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" gutterBottom fontWeight="bold" color="primary">
                    <School sx={{ mr: 1, verticalAlign: 'middle', fontSize: 40 }} />
                    Global Student Sheets
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Comprehensive view of all student performance metrics and details
                </Typography>
            </Box>

            {/* Filters & Actions */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={3}>
                            <TextField
                                fullWidth
                                placeholder="Search students..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start"><Search /></InputAdornment>,
                                }}
                                size="small"
                            />
                        </Grid>
                        <Grid item xs={6} md={2}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Trade</InputLabel>
                                <Select value={tradeCode} onChange={(e) => setTradeCode(e.target.value)}>
                                    <MenuItem value="">All Trades</MenuItem>
                                    <MenuItem value="BDC">BDC</MenuItem>
                                    <MenuItem value="SOD">SOD</MenuItem>
                                    <MenuItem value="AUT">AUT</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={6} md={2}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Level</InputLabel>
                                <Select value={levelNumber} onChange={(e) => setLevelNumber(Number(e.target.value))}>
                                    <MenuItem value={0}>All Levels</MenuItem>
                                    <MenuItem value={1}>Level 1</MenuItem>
                                    <MenuItem value={2}>Level 2</MenuItem>
                                    <MenuItem value={3}>Level 3</MenuItem>
                                    <MenuItem value={4}>Level 4</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={6} md={2}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Status</InputLabel>
                                <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                                    <MenuItem value="all">All Status</MenuItem>
                                    <MenuItem value="active">Active</MenuItem>
                                    <MenuItem value="inactive">Inactive</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={3} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Button
                                variant="outlined"
                                startIcon={<GetApp />}
                                onClick={exportToExcel}
                                disabled={filteredSheets.length === 0}
                            >
                                Export CSV
                            </Button>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Data Grid */}
            <Card>
                <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6">Student Data Grid</Typography>
                        <Chip label={`${filteredSheets.length} Records`} color="primary" variant="outlined" />
                    </Box>

                    {loading ? (
                        <Box sx={{ textAlign: 'center', py: 8 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 600 }}>
                            <Table stickyHeader size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'action.hover' }}>Student Code</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'action.hover' }}>Full Name</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'action.hover' }}>Class</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'action.hover' }}>Status</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 'bold', backgroundColor: 'action.hover' }}>Avg Marks</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 'bold', backgroundColor: 'action.hover' }}>Attendance</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 'bold', backgroundColor: 'action.hover' }}>Conduct</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 'bold', backgroundColor: 'action.hover' }}>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredSheets.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                                                <Typography color="text.secondary">No students found matching filters.</Typography>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredSheets.map((sheet) => (
                                            <TableRow key={sheet.id} hover>
                                                <TableCell sx={{ fontFamily: 'monospace' }}>{sheet.student_code}</TableCell>
                                                <TableCell sx={{ fontWeight: '500' }}>
                                                    {sheet.first_name} {sheet.last_name}
                                                </TableCell>
                                                <TableCell>
                                                    <Chip label={`${sheet.trade_code} L${sheet.level_number}`} size="small" />
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={sheet.status}
                                                        size="small"
                                                        color={sheet.status === 'active' ? 'success' : 'default'}
                                                        variant="outlined"
                                                    />
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                                                        <TrendingUp fontSize="small" color={sheet.average_marks >= 70 ? 'success' : 'warning'} />
                                                        <Typography fontWeight="bold">
                                                            {sheet.average_marks ? Number(sheet.average_marks).toFixed(1) : '0.0'}%
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Typography color={sheet.attendance_percentage < 75 ? 'error.main' : 'text.primary'}>
                                                        {sheet.attendance_percentage ? Number(sheet.attendance_percentage).toFixed(0) : 0}%
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                                                        <Rule fontSize="small" />
                                                        <Typography>{sheet.conduct_score ? Number(sheet.conduct_score).toFixed(0) : 100}</Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Tooltip title="View Details">
                                                        <IconButton size="small" color="primary">
                                                            <Visibility fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </CardContent>
            </Card>
        </Container>
    );
};

export default TeacherGlobalSheetsView;
