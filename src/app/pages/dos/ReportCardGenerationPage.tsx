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
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    LinearProgress,
    Divider,
    List,
    ListItem,
    ListItemText,
    Checkbox,
    FormControlLabel
} from '@mui/material';
import {
    Assessment,
    Download,
    Visibility,
    Print,
    CheckCircle,
    TrendingUp,
    School,
    Star
} from '@mui/icons-material';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface ReportCard {
    id: number;
    student_name: string;
    student_code: string;
    trade_code: string;
    level_number: number;
    total_marks: number;
    max_marks: number;
    percentage: number;
    grade: string;
    class_rank: number;
    total_students_in_class: number;
    attendance_percentage: number;
    subjects_data: any[];
    teacher_comment: string;
    headmaster_comment: string;
}

const ReportCardGenerationPage: React.FC = () => {
    const [academicYear, setAcademicYear] = useState('2024-2025');
    const [term, setTerm] = useState<number>(1);
    const [tradeCode, setTradeCode] = useState('BDC');
    const [levelNumber, setLevelNumber] = useState<number>(1);
    const [students, setStudents] = useState<any[]>([]);
    const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
    const [reportCards, setReportCards] = useState<ReportCard[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [previewDialog, setPreviewDialog] = useState(false);
    const [selectedReport, setSelectedReport] = useState<ReportCard | null>(null);
    const [generationMode, setGenerationMode] = useState<'bulk' | 'individual'>('bulk');

    useEffect(() => {
        fetchStudents();
    }, [tradeCode, levelNumber]);

    const fetchStudents = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `${API_URL}/students?trade=${tradeCode}&level=${levelNumber}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setStudents(response.data.students || []);
        } catch (err) {
            console.error('Failed to load students');
        }
    };

    const fetchReports = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `${API_URL}/dos-reports/class/${tradeCode}/${levelNumber}?academic_year=${academicYear}&term=${term}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (response.data.success) {
                setReportCards(response.data.reports);
            }
        } catch (err) {
            console.error('Failed to load reports');
        }
    };

    const generateReports = async () => {
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const token = localStorage.getItem('token');
            const user = JSON.parse(localStorage.getItem('user') || '{}');

            const payload: any = {
                academic_year: academicYear,
                term,
                trade_code: tradeCode,
                levelNumber,
                user_id: user.id
            };

            if (generationMode === 'individual' && selectedStudents.length > 0) {
                payload.student_ids = selectedStudents;
            }

            const response = await axios.post(
                `${API_URL}/dos-reports/generate`,
                payload,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                setSuccess(`Successfully generated ${response.data.report_ids.length} report card(s)!`);
                fetchReports();
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to generate report cards');
        } finally {
            setLoading(false);
        }
    };

    const viewReport = (report: ReportCard) => {
        setSelectedReport(report);
        setPreviewDialog(true);
    };

    const getGradeColor = (grade: string) => {
        switch (grade) {
            case 'A': return 'success';
            case 'B+': case 'B': return 'info';
            case 'C': return 'warning';
            case 'D': return 'warning';
            case 'F': return 'error';
            default: return 'default';
        }
    };

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" gutterBottom fontWeight="bold" color="primary">
                    <Assessment sx={{ mr: 1, verticalAlign: 'middle', fontSize: 40 }} />
                    Report Card Generation
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Generate comprehensive academic report cards with automatic grading and ranking
                </Typography>
            </Box>

            {/* Alerts */}
            {error && <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" onClose={() => setSuccess('')} sx={{ mb: 2 }}>{success}</Alert>}

            <Grid container spacing={3}>
                {/* Left Panel - Configuration */}
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>Configuration</Typography>

                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextField
                                        label="Academic Year"
                                        fullWidth
                                        size="small"
                                        value={academicYear}
                                        onChange={(e) => setAcademicYear(e.target.value)}
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Term</InputLabel>
                                        <Select value={term} onChange={(e) => setTerm(Number(e.target.value))}>
                                            <MenuItem value={1}>Term 1</MenuItem>
                                            <MenuItem value={2}>Term 2</MenuItem>
                                            <MenuItem value={3}>Term 3</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>

                                <Grid item xs={12}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Trade</InputLabel>
                                        <Select value={tradeCode} onChange={(e) => setTradeCode(e.target.value)}>
                                            <MenuItem value="BDC">Building Construction (BDC)</MenuItem>
                                            <MenuItem value="SOD">Software Development (SOD)</MenuItem>
                                            <MenuItem value="AUT">Automotive (AUT)</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>

                                <Grid item xs={12}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Level</InputLabel>
                                        <Select value={levelNumber} onChange={(e) => setLevelNumber(Number(e.target.value))}>
                                            <MenuItem value={1}>Level 1</MenuItem>
                                            <MenuItem value={2}>Level 2</MenuItem>
                                            <MenuItem value={3}>Level 3</MenuItem>
                                            <MenuItem value={4}>Level 4</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>

                                <Grid item xs={12}>
                                    <Divider sx={{ my: 2 }} />
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={generationMode === 'individual'}
                                                onChange={(e) => setGenerationMode(e.target.checked ? 'individual' : 'bulk')}
                                            />
                                        }
                                        label="Select specific students"
                                    />
                                </Grid>

                                {generationMode === 'individual' && (
                                    <Grid item xs={12}>
                                        <Typography variant="caption" display="block" gutterBottom>
                                            Selected: {selectedStudents.length} student(s)
                                        </Typography>
                                        <Box sx={{ maxHeight: 200, overflowY: 'auto' }}>
                                            {students.map((student) => (
                                                <FormControlLabel
                                                    key={student.id}
                                                    control={
                                                        <Checkbox
                                                            checked={selectedStudents.includes(student.id)}
                                                            onChange={(e) => {
                                                                if (e.target.checked) {
                                                                    setSelectedStudents([...selectedStudents, student.id]);
                                                                } else {
                                                                    setSelectedStudents(selectedStudents.filter(id => id !== student.id));
                                                                }
                                                            }}
                                                        />
                                                    }
                                                    label={`${student.first_name} ${student.last_name}`}
                                                />
                                            ))}
                                        </Box>
                                    </Grid>
                                )}

                                <Grid item xs={12}>
                                    <Button
                                        variant="contained"
                                        fullWidth
                                        size="large"
                                        onClick={generateReports}
                                        disabled={loading || (generationMode === 'individual' && selectedStudents.length === 0)}
                                        startIcon={loading ? <CircularProgress size={20} /> : <Assessment />}
                                    >
                                        {loading ? 'Generating...' : 'Generate Report Cards'}
                                    </Button>
                                </Grid>

                                <Grid item xs={12}>
                                    <Button
                                        variant="outlined"
                                        fullWidth
                                        onClick={fetchReports}
                                    >
                                        View Existing Reports
                                    </Button>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Right Panel - Generated Reports */}
                <Grid item xs={12} md={8}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>Generated Report Cards</Typography>

                            {reportCards.length === 0 ? (
                                <Box sx={{ textAlign: 'center', py: 8 }}>
                                    <School sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
                                    <Typography color="text.secondary">
                                        No report cards generated yet for this term.
                                    </Typography>
                                </Box>
                            ) : (
                                <TableContainer component={Paper} variant="outlined">
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow sx={{ backgroundColor: 'action.hover' }}>
                                                <TableCell>Rank</TableCell>
                                                <TableCell>Student</TableCell>
                                                <TableCell>Code</TableCell>
                                                <TableCell align="center">Marks</TableCell>
                                                <TableCell align="center">%</TableCell>
                                                <TableCell align="center">Grade</TableCell>
                                                <TableCell align="center">Attendance</TableCell>
                                                <TableCell align="center">Actions</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {reportCards.map((report) => (
                                                <TableRow key={report.id} hover>
                                                    <TableCell>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                            {report.class_rank === 1 && <Star sx={{ color: 'gold', fontSize: 18 }} />}
                                                            {report.class_rank === 2 && <Star sx={{ color: 'silver', fontSize: 18 }} />}
                                                            {report.class_rank === 3 && <Star sx={{ color: '#CD7F32', fontSize: 18 }} />}
                                                            <Typography>#{report.class_rank}</Typography>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>{report.student_name}</TableCell>
                                                    <TableCell>{report.student_code}</TableCell>
                                                    <TableCell align="center">
                                                        {report.total_marks}/{report.max_marks}
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <Box>
                                                            <Typography variant="body2" fontWeight="bold">
                                                                {report.percentage.toFixed(1)}%
                                                            </Typography>
                                                            <LinearProgress
                                                                variant="determinate"
                                                                value={report.percentage}
                                                                sx={{ height: 4, borderRadius: 1 }}
                                                            />
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <Chip
                                                            label={report.grade}
                                                            size="small"
                                                            color={getGradeColor(report.grade) as any}
                                                        />
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        {report.attendance_percentage.toFixed(0)}%
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <IconButton size="small" onClick={() => viewReport(report)}>
                                                            <Visibility fontSize="small" />
                                                        </IconButton>
                                                        <IconButton size="small">
                                                            <Download fontSize="small" />
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Report Preview Dialog */}
            <Dialog open={previewDialog} onClose={() => setPreviewDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6">Report Card Preview</Typography>
                        {selectedReport && (
                            <Chip
                                label={`Grade: ${selectedReport.grade}`}
                                color={getGradeColor(selectedReport.grade) as any}
                            />
                        )}
                    </Box>
                </DialogTitle>
                <DialogContent dividers>
                    {selectedReport && (
                        <Box>
                            {/* Student Info */}
                            <Grid container spacing={2} sx={{ mb: 3 }}>
                                <Grid item xs={6}>
                                    <Typography variant="subtitle2" color="text.secondary">Student Name</Typography>
                                    <Typography variant="h6">{selectedReport.student_name}</Typography>
                                </Grid>
                                <Grid item xs={3}>
                                    <Typography variant="subtitle2" color="text.secondary">Student Code</Typography>
                                    <Typography>{selectedReport.student_code}</Typography>
                                </Grid>
                                <Grid item xs={3}>
                                    <Typography variant="subtitle2" color="text.secondary">Class</Typography>
                                    <Typography>{selectedReport.trade_code} Level {selectedReport.level_number}</Typography>
                                </Grid>
                            </Grid>

                            <Divider sx={{ my: 2 }} />

                            {/* Performance Summary */}
                            <Grid container spacing={2} sx={{ mb: 3 }}>
                                <Grid item xs={3}>
                                    <Typography variant="caption" color="text.secondary">Total Marks</Typography>
                                    <Typography variant="h6">{selectedReport.total_marks}/{selectedReport.max_marks}</Typography>
                                </Grid>
                                <Grid item xs={3}>
                                    <Typography variant="caption" color="text.secondary">Percentage</Typography>
                                    <Typography variant="h6" color="primary">{selectedReport.percentage.toFixed(1)}%</Typography>
                                </Grid>
                                <Grid item xs={3}>
                                    <Typography variant="caption" color="text.secondary">Class Rank</Typography>
                                    <Typography variant="h6">
                                        {selectedReport.class_rank}/{selectedReport.total_students_in_class}
                                    </Typography>
                                </Grid>
                                <Grid item xs={3}>
                                    <Typography variant="caption" color="text.secondary">Attendance</Typography>
                                    <Typography variant="h6">{selectedReport.attendance_percentage.toFixed(0)}%</Typography>
                                </Grid>
                            </Grid>

                            {/* Subject Performance */}
                            <Typography variant="subtitle1" gutterBottom fontWeight="bold">Subject Performance</Typography>
                            <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Subject</TableCell>
                                            <TableCell align="right">Marks</TableCell>
                                            <TableCell align="right">%</TableCell>
                                            <TableCell align="center">Grade</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {selectedReport.subjects_data && JSON.parse(selectedReport.subjects_data as any).map((subject: any, index: number) => (
                                            <TableRow key={index}>
                                                <TableCell>{subject.subject}</TableCell>
                                                <TableCell align="right">{subject.marks_obtained}/{subject.max_marks}</TableCell>
                                                <TableCell align="right">{subject.percentage.toFixed(1)}%</TableCell>
                                                <TableCell align="center">
                                                    <Chip label={subject.grade} size="small" color={getGradeColor(subject.grade) as any} />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>

                            {/* Comments */}
                            <Typography variant="subtitle1" gutterBottom fontWeight="bold">Teacher's Comment</Typography>
                            <Paper sx={{ p: 2, mb: 2, bgcolor: 'action.hover' }}>
                                <Typography variant="body2">{selectedReport.teacher_comment}</Typography>
                            </Paper>

                            <Typography variant="subtitle1" gutterBottom fontWeight="bold">Headmaster's Comment</Typography>
                            <Paper sx={{ p: 2, bgcolor: 'action.hover' }}>
                                <Typography variant="body2">{selectedReport.headmaster_comment}</Typography>
                            </Paper>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPreviewDialog(false)}>Close</Button>
                    <Button variant="outlined" startIcon={<Print />}>
                        Print
                    </Button>
                    <Button variant="contained" startIcon={<Download />}>
                        Download PDF
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default ReportCardGenerationPage;
