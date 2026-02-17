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
    Stepper,
    Step,
    StepLabel,
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
    List,
    ListItem,
    ListItemText,
    Divider,
    ToggleButton,
    ToggleButtonGroup
} from '@mui/material';
import {
    Schedule,
    AutoAwesome,
    CheckCircle,
    Warning,
    Edit,
    Publish,
    Download,
    Visibility,
    Refresh
} from '@mui/icons-material';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const TRADES = ['BDC', 'SOD', 'AUT'];
const LEVELS = [1, 2, 3, 4];
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const PERIODS_PER_DAY = 12;

interface TimetableAssignment {
    id: number;
    day_of_week: number;
    day_name: string;
    period_number: number;
    course_name: string;
    course_code: string;
    teacher_name: string;
    room_number: string;
    trade_code: string;
    level_number: number;
    is_practical: boolean;
}

interface Timetable {
    id: number;
    name: string;
    academic_year: string;
    term: number;
    status: 'draft' | 'published' | 'archived';
    trades: string[];
    levels: number[];
    conflict_count: number;
    generation_time_seconds: number;
    assigned_periods: number;
}

const TimetableGenerationPage: React.FC = () => {
    const [activeStep, setActiveStep] = useState(0);
    const [academicYear, setAcademicYear] = useState('2024-2025');
    const [term, setTerm] = useState<number>(1);
    const [selectedTrades, setSelectedTrades] = useState<string[]>(['BDC', 'SOD', 'AUT']);
    const [selectedLevels, setSelectedLevels] = useState<number[]>([1, 2, 3, 4]);
    const [timetableName, setTimetableName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [generatedTimetable, setGeneratedTimetable] = useState<Timetable | null>(null);
    const [assignments, setAssignments] = useState<TimetableAssignment[]>([]);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [selectedTrade, setSelectedTrade] = useState<string>('BDC');
    const [selectedLevel, setSelectedLevel] = useState<number>(1);
    const [timetables, setTimetables] = useState<Timetable[]>([]);
    const [previewDialog, setPreviewDialog] = useState(false);

    const steps = ['Configure', 'Generate', 'Review', 'Publish'];

    useEffect(() => {
        fetchTimetables();
    }, []);

    const fetchTimetables = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/dos-timetable/list/all`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setTimetables(response.data.timetables);
            }
        } catch (err) {
            console.error('Failed to load timetables');
        }
    };

    const generateTimetable = async () => {
        if (selectedTrades.length === 0 || selectedLevels.length === 0) {
            setError('Please select at least one trade and level');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const token = localStorage.getItem('token');
            const user = JSON.parse(localStorage.getItem('user') || '{}');

            const response = await axios.post(
                `${API_URL}/dos-timetable/generate`,
                {
                    name: timetableName || `Timetable ${academicYear} Term ${term}`,
                    academic_year: academicYear,
                    term,
                    trades: selectedTrades,
                    levels: selectedLevels,
                    user_id: user.id
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                setGeneratedTimetable(response.data.timetable);
                setSuccess(`Timetable generated successfully! ${response.data.timetable.assigned_periods} periods assigned`);
                setActiveStep(2);
                loadTimetable(response.data.timetable.id);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to generate timetable');
        } finally {
            setLoading(false);
        }
    };

    const loadTimetable = async (id: number) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/dos-timetable/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                setAssignments(response.data.assignments);
            }
        } catch (err) {
            console.error('Failed to load timetable');
        }
    };

    const publishTimetable = async () => {
        if (!generatedTimetable) return;

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const user = JSON.parse(localStorage.getItem('user') || '{}');

            await axios.post(
                `${API_URL}/dos-timetable/${generatedTimetable.id}/publish`,
                { user_id: user.id },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setSuccess('Timetable published successfully!');
            setActiveStep(3);
            fetchTimetables();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to publish timetable');
        } finally {
            setLoading(false);
        }
    };

    const renderTimetableGrid = () => {
        const filteredAssignments = assignments.filter(
            a => a.trade_code === selectedTrade && a.level_number === selectedLevel
        );

        return (
            <TableContainer component={Paper} elevation={3}>
                <Table size="small" sx={{ minWidth: 800 }}>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: 'primary.main' }}>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Period</TableCell>
                            {DAYS.map((day) => (
                                <TableCell key={day} align="center" sx={{ color: 'white', fontWeight: 'bold' }}>
                                    {day}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {Array.from({ length: PERIODS_PER_DAY }, (_, i) => i + 1).map((period) => (
                            <TableRow key={period} hover>
                                <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'action.hover' }}>
                                    P{period}
                                </TableCell>
                                {DAYS.map((_, dayIndex) => {
                                    const assignment = filteredAssignments.find(
                                        a => a.day_of_week === dayIndex + 1 && a.period_number === period
                                    );

                                    return (
                                        <TableCell
                                            key={dayIndex}
                                            align="center"
                                            sx={{
                                                borderRight: 1,
                                                borderColor: 'divider',
                                                p: 0.5,
                                                backgroundColor: assignment ? (assignment.is_practical ? 'info.light' : 'success.light') : 'inherit'
                                            }}
                                        >
                                            {assignment ? (
                                                <Box sx={{ py: 1 }}>
                                                    <Typography variant="caption" fontWeight="bold" display="block">
                                                        {assignment.course_code}
                                                    </Typography>
                                                    <Typography variant="caption" fontSize="0.65rem" display="block" color="text.secondary">
                                                        {assignment.teacher_name}
                                                    </Typography>
                                                    <Typography variant="caption" fontSize="0.6rem" display="block">
                                                        {assignment.room_number}
                                                    </Typography>
                                                </Box>
                                            ) : (
                                                <Typography variant="caption" color="text.disabled">-</Typography>
                                            )}
                                        </TableCell>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        );
    };

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" gutterBottom fontWeight="bold" color="primary">
                    <Schedule sx={{ mr: 1, verticalAlign: 'middle', fontSize: 40 }} />
                    DOS Timetable Generation System
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Automated constraint-based timetable generation with conflict resolution
                </Typography>
            </Box>

            {/* Alerts */}
            {error && <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" onClose={() => setSuccess('')} sx={{ mb: 2 }}>{success}</Alert>}

            {/* Stepper */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Stepper activeStep={activeStep} alternativeLabel>
                        {steps.map((label) => (
                            <Step key={label}>
                                <StepLabel>{label}</StepLabel>
                            </Step>
                        ))}
                    </Stepper>
                </CardContent>
            </Card>

            {/* Step 0: Configuration */}
            {activeStep === 0 && (
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>Timetable Configuration</Typography>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    label="Timetable Name (Optional)"
                                    fullWidth
                                    value={timetableName}
                                    onChange={(e) => setTimetableName(e.target.value)}
                                    placeholder="Auto-generated if empty"
                                />
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <TextField
                                    label="Academic Year"
                                    fullWidth
                                    value={academicYear}
                                    onChange={(e) => setAcademicYear(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <FormControl fullWidth>
                                    <InputLabel>Term</InputLabel>
                                    <Select value={term} onChange={(e) => setTerm(Number(e.target.value))}>
                                        <MenuItem value={1}>Term 1</MenuItem>
                                        <MenuItem value={2}>Term 2</MenuItem>
                                        <MenuItem value={3}>Term 3</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12}>
                                <Typography variant="subtitle2" gutterBottom>Select Trades</Typography>
                                <ToggleButtonGroup
                                    value={selectedTrades}
                                    onChange={(_, newValue) => setSelectedTrades(newValue)}
                                    sx={{ flexWrap: 'wrap' }}
                                >
                                    {TRADES.map((trade) => (
                                        <ToggleButton key={trade} value={trade} sx={{ m: 0.5 }}>
                                            {trade}
                                        </ToggleButton>
                                    ))}
                                </ToggleButtonGroup>
                            </Grid>

                            <Grid item xs={12}>
                                <Typography variant="subtitle2" gutterBottom>Select Levels</Typography>
                                <ToggleButtonGroup
                                    value={selectedLevels}
                                    onChange={(_, newValue) => setSelectedLevels(newValue)}
                                    sx={{ flexWrap: 'wrap' }}
                                >
                                    {LEVELS.map((level) => (
                                        <ToggleButton key={level} value={level} sx={{ m: 0.5 }}>
                                            Level {level}
                                        </ToggleButton>
                                    ))}
                                </ToggleButtonGroup>
                            </Grid>

                            <Grid item xs={12}>
                                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                                    <Button
                                        variant="contained"
                                        size="large"
                                        onClick={() => setActiveStep(1)}
                                        disabled={selectedTrades.length === 0 || selectedLevels.length === 0}
                                    >
                                        Continue to Generation
                                    </Button>
                                </Box>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            )}

            {/* Step 1: Generation */}
            {activeStep === 1 && (
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>Generate Timetable</Typography>
                        <Alert severity="info" sx={{ mb: 3 }}>
                            <strong>Configuration Summary:</strong>
                            <br />
                            Academic Year: {academicYear} | Term: {term}
                            <br />
                            Trades: {selectedTrades.join(', ')} | Levels: {selectedLevels.join(', ')}
                        </Alert>

                        <Box sx={{ textAlign: 'center', py: 4 }}>
                            <Button
                                variant="contained"
                                size="large"
                                onClick={generateTimetable}
                                disabled={loading}
                                startIcon={loading ? <CircularProgress size={20} /> : <AutoAwesome />}
                                sx={{ px: 6, py: 2 }}
                            >
                                {loading ? 'Generating Timetable...' : 'Generate Timetable'}
                            </Button>
                        </Box>

                        {generatedTimetable && (
                            <Alert severity="success" sx={{ mt: 3 }}>
                                <strong>Generation Complete!</strong>
                                <br />
                                {generatedTimetable.assigned_periods} periods assigned in {generatedTimetable.generation_time_seconds}s
                                {generatedTimetable.conflict_count > 0 && ` | ${generatedTimetable.conflict_count} conflicts detected`}
                            </Alert>
                        )}

                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between', mt: 3 }}>
                            <Button onClick={() => setActiveStep(0)}>Back</Button>
                            {generatedTimetable && (
                                <Button variant="contained" onClick={() => setActiveStep(2)}>
                                    Review Timetable
                                </Button>
                            )}
                        </Box>
                    </CardContent>
                </Card>
            )}

            {/* Step 2: Review */}
            {activeStep === 2 && (
                <Card>
                    <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <Typography variant="h6">Review Timetable</Typography>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <FormControl size="small">
                                    <InputLabel>Trade</InputLabel>
                                    <Select value={selectedTrade} onChange={(e) => setSelectedTrade(e.target.value)} sx={{ minWidth: 120 }}>
                                        {selectedTrades.map(trade => (
                                            <MenuItem key={trade} value={trade}>{trade}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                <FormControl size="small">
                                    <InputLabel>Level</InputLabel>
                                    <Select value={selectedLevel} onChange={(e) => setSelectedLevel(Number(e.target.value))} sx={{ minWidth: 100 }}>
                                        {selectedLevels.map(level => (
                                            <MenuItem key={level} value={level}>Level {level}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Box>
                        </Box>

                        {renderTimetableGrid()}

                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between', mt: 3 }}>
                            <Button onClick={() => setActiveStep(1)}>Back</Button>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <Button variant="outlined" startIcon={<Download />}>
                                    Export PDF
                                </Button>
                                <Button variant="contained" onClick={publishTimetable} startIcon={<Publish />} disabled={loading}>
                                    {loading ? 'Publishing...' : 'Publish Timetable'}
                                </Button>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>
            )}

            {/* Step 3: Published */}
            {activeStep === 3 && (
                <Card>
                    <CardContent>
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                            <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
                            <Typography variant="h5" gutterBottom>Timetable Published Successfully!</Typography>
                            <Typography color="text.secondary" paragraph>
                                The timetable is now visible to all students and teachers.
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 4 }}>
                                <Button variant="outlined" onClick={() => {
                                    setActiveStep(0);
                                    setGeneratedTimetable(null);
                                    setAssignments([]);
                                }}>
                                    Generate New Timetable
                                </Button>
                                <Button variant="contained" onClick={() => fetchTimetables()}>
                                    View All Timetables
                                </Button>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>
            )}

            {/* Existing Timetables */}
            {timetables.length > 0 && (
                <Card sx={{ mt: 3 }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>Existing Timetables</Typography>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Name</TableCell>
                                        <TableCell>Academic Year</TableCell>
                                        <TableCell>Term</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell>Periods</TableCell>
                                        <TableCell>Conflicts</TableCell>
                                        <TableCell align="right">Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {timetables.map((tt) => (
                                        <TableRow key={tt.id}>
                                            <TableCell>{tt.name}</TableCell>
                                            <TableCell>{tt.academic_year}</TableCell>
                                            <TableCell>Term {tt.term}</TableCell>
                                            <TableCell>
                                                <Chip label={tt.status} size="small" color={tt.status === 'published' ? 'success' : 'default'} />
                                            </TableCell>
                                            <TableCell>{tt.assigned_periods || 0}</TableCell>
                                            <TableCell>{tt.conflict_count || 0}</TableCell>
                                            <TableCell align="right">
                                                <IconButton size="small" onClick={() => loadTimetable(tt.id)}>
                                                    <Visibility />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </Card>
            )}
        </Container>
    );
};

export default TimetableGenerationPage;
