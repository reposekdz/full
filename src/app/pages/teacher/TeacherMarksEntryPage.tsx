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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Chip,
    Tooltip,
    Tabs,
    Tab,
    Divider
} from '@mui/material';
import {
    Edit,
    Save,
    Add,
    Delete,
    Upload,
    Download,
    CheckCircle,
    Calculate,
    School,
    TrendingUp
} from '@mui/icons-material';
import { apiService } from '@/app/services/apiService';

interface Student {
    id: string;
    first_name: string;
    last_name: string;
    student_code: string;
    trade_code: string;
    level: number;
}

interface Column {
    id: number;
    column_name: string;
    assessment_type: string;
    max_marks: number;
    course_name: string;
    weight: number;
}

interface Mark {
    student_id: string;
    column_id: number;
    marks: number;
}

const TeacherMarksEntryPage: React.FC = () => {
    const [tradeCode, setTradeCode] = useState('BDC');
    const [level, setLevel] = useState(1);
    const [academicYear, setAcademicYear] = useState('2024-2025');
    const [term, setTerm] = useState(1);
    const [students, setStudents] = useState<Student[]>([]);
    const [columns, setColumns] = useState<Column[]>([]);
    const [marks, setMarks] = useState<{ [key: string]: number }>({});
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [addColumnDialog, setAddColumnDialog] = useState(false);
    const [newColumn, setNewColumn] = useState({
        column_name: '',
        assessment_type: 'Quiz',
        max_marks: 100,
        course_name: '',
        weight: 1
    });
    const [tabValue, setTabValue] = useState(0);

    useEffect(() => {
        fetchStudents();
        fetchColumns();
        fetchMarks();
    }, [tradeCode, level, academicYear, term]);

    const fetchStudents = async () => {
        try {
            const response = await apiService.request(`students?trade_code=${tradeCode}&level_number=${level}`);
            setStudents(response.students || []);
        } catch (err) {
            console.error('Failed to load students');
        }
    };

    const fetchColumns = async () => {
        try {
            const response = await apiService.request(`global-student-sheets/columns?trade=${tradeCode}&level=${level}&year=${academicYear}&term=${term}`);
            setColumns(response.columns || []);
        } catch (err) {
            console.error('Failed to load columns');
        }
    };

    const fetchMarks = async () => {
        setLoading(true);
        try {
            const response = await apiService.request(`global-student-sheets/marks?trade=${tradeCode}&level=${level}&year=${academicYear}&term=${term}`);

            const marksData: { [key: string]: number } = {};
            response.marks?.forEach((mark: Mark) => {
                marksData[`${mark.student_id}_${mark.column_id}`] = mark.marks;
            });
            setMarks(marksData);
        } catch (err) {
            console.error('Failed to load marks');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkChange = (studentId: string, columnId: number, value: string) => {
        const key = `${studentId}_${columnId}`;
        const numValue = parseFloat(value);

        if (!isNaN(numValue)) {
            setMarks({ ...marks, [key]: numValue });
        } else if (value === '') {
            const newMarks = { ...marks };
            delete newMarks[key];
            setMarks(newMarks);
        }
    };

    const saveMarks = async () => {
        setSaving(true);
        setError('');
        setSuccess('');

        try {
            const marksArray = Object.entries(marks).map(([key, value]) => {
                const [student_id, column_id] = key.split('_');
                return {
                    student_id,
                    column_id: parseInt(column_id),
                    marks: value,
                    academic_year: academicYear,
                    term
                };
            });

            await apiService.request('global-student-sheets/save-marks', {
                method: 'POST',
                body: JSON.stringify({ marks: marksArray })
            });

            setSuccess('Marks saved successfully!');
        } catch (err: any) {
            setError(err.message || 'Failed to save marks');
        } finally {
            setSaving(false);
        }
    };

    const addColumn = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');

            await apiService.request('global-student-sheets/add-column', {
                method: 'POST',
                body: JSON.stringify({
                    ...newColumn,
                    trade_code: tradeCode,
                    level_number: level,
                    academic_year: academicYear,
                    term,
                    created_by: user.id
                })
            });

            setSuccess('Column added successfully!');
            setAddColumnDialog(false);
            fetchColumns();
            setNewColumn({
                column_name: '',
                assessment_type: 'Quiz',
                max_marks: 100,
                course_name: '',
                weight: 1
            });
        } catch (err: any) {
            setError(err.message || 'Failed to add column');
        }
    };

    const calculateStudentTotal = (studentId: string) => {
        let total = 0;
        columns.forEach(col => {
            const mark = marks[`${studentId}_${col.id}`];
            if (mark !== undefined) {
                total += mark;
            }
        });
        return total;
    };

    const calculateStudentAverage = (studentId: string) => {
        const totalMaxMarks = columns.reduce((sum, col) => sum + col.max_marks, 0);
        if (totalMaxMarks === 0) return 0;
        return (calculateStudentTotal(studentId) / totalMaxMarks) * 100;
    };

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" gutterBottom fontWeight="bold" color="primary">
                    <Edit sx={{ mr: 1, verticalAlign: 'middle', fontSize: 40 }} />
                    Teacher Marks Entry
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Enter and manage student marks with auto-calculation
                </Typography>
            </Box>

            {/* Alerts */}
            {error && <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" onClose={() => setSuccess('')} sx={{ mb: 2 }}>{success}</Alert>}

            {/* Controls */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={6} md={2}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Trade</InputLabel>
                                <Select value={tradeCode} onChange={(e) => setTradeCode(e.target.value)}>
                                    <MenuItem value="BDC">BDC</MenuItem>
                                    <MenuItem value="SOD">SOD</MenuItem>
                                    <MenuItem value="AUT">AUT</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6} md={2}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Level</InputLabel>
                                <Select value={level} onChange={(e) => setLevel(Number(e.target.value))}>
                                    <MenuItem value={1}>Level 1</MenuItem>
                                    <MenuItem value={2}>Level 2</MenuItem>
                                    <MenuItem value={3}>Level 3</MenuItem>
                                    <MenuItem value={4}>Level 4</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6} md={2}>
                            <TextField
                                label="Academic Year"
                                size="small"
                                fullWidth
                                value={academicYear}
                                onChange={(e) => setAcademicYear(e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={2}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Term</InputLabel>
                                <Select value={term} onChange={(e) => setTerm(Number(e.target.value))}>
                                    <MenuItem value={1}>Term 1</MenuItem>
                                    <MenuItem value={2}>Term 2</MenuItem>
                                    <MenuItem value={3}>Term 3</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button
                                    variant="outlined"
                                    startIcon={<Add />}
                                    onClick={() => setAddColumnDialog(true)}
                                    fullWidth
                                >
                                    Add Assessment
                                </Button>
                                <Button
                                    variant="contained"
                                    startIcon={saving ? <CircularProgress size={16} /> : <Save />}
                                    onClick={saveMarks}
                                    disabled={saving}
                                    fullWidth
                                >
                                    Save All
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Marks Grid */}
            <Card>
                <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6">Marks Entry Grid</Typography>
                        <Chip label={`${students.length} Students`} color="primary" />
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
                                        <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'primary.main', color: 'white' }}>
                                            Student
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'primary.main', color: 'white' }}>
                                            Code
                                        </TableCell>
                                        {columns.map((col) => (
                                            <TableCell
                                                key={col.id}
                                                align="center"
                                                sx={{ fontWeight: 'bold', backgroundColor: 'primary.main', color: 'white', minWidth: 120 }}
                                            >
                                                <Box>
                                                    <Typography variant="caption" display="block">{col.column_name}</Typography>
                                                    <Typography variant="caption" display="block" sx={{ opacity: 0.8 }}>
                                                        {col.assessment_type} (/{col.max_marks})
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                        ))}
                                        <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'success.main', color: 'white' }}>
                                            Total
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'success.main', color: 'white' }}>
                                            Average %
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {students.map((student) => (
                                        <TableRow key={student.id} hover>
                                            <TableCell sx={{ fontWeight: 'bold' }}>
                                                {student.first_name} {student.last_name}
                                            </TableCell>
                                            <TableCell>{student.student_code}</TableCell>
                                            {columns.map((col) => {
                                                const key = `${student.id}_${col.id}`;
                                                const value = marks[key];
                                                return (
                                                    <TableCell key={col.id} align="center">
                                                        <TextField
                                                            type="number"
                                                            size="small"
                                                            value={value ?? ''}
                                                            onChange={(e) => handleMarkChange(student.id, col.id, e.target.value)}
                                                            inputProps={{
                                                                min: 0,
                                                                max: col.max_marks,
                                                                step: 0.5,
                                                                style: { textAlign: 'center' }
                                                            }}
                                                            sx={{ width: 80 }}
                                                            error={value !== undefined && (value < 0 || value > col.max_marks)}
                                                        />
                                                    </TableCell>
                                                );
                                            })}
                                            <TableCell align="center" sx={{ fontWeight: 'bold', backgroundColor: 'action.hover' }}>
                                                {calculateStudentTotal(student.id).toFixed(1)}
                                            </TableCell>
                                            <TableCell align="center" sx={{ fontWeight: 'bold', backgroundColor: 'action.hover' }}>
                                                <Chip
                                                    label={`${calculateStudentAverage(student.id).toFixed(1)}%`}
                                                    size="small"
                                                    color={calculateStudentAverage(student.id) >= 75 ? 'success' : calculateStudentAverage(student.id) >= 50 ? 'warning' : 'error'}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </CardContent>
            </Card>

            {/* Add Column Dialog */}
            <Dialog open={addColumnDialog} onClose={() => setAddColumnDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Add New Assessment Column</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <TextField
                                label="Assessment Name"
                                fullWidth
                                value={newColumn.column_name}
                                onChange={(e) => setNewColumn({ ...newColumn, column_name: e.target.value })}
                                placeholder="e.g., Quiz 1, Midterm Exam"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Type</InputLabel>
                                <Select
                                    value={newColumn.assessment_type}
                                    onChange={(e) => setNewColumn({ ...newColumn, assessment_type: e.target.value })}
                                >
                                    <MenuItem value="Quiz">Quiz</MenuItem>
                                    <MenuItem value="Assignment">Assignment</MenuItem>
                                    <MenuItem value="Midterm">Midterm Exam</MenuItem>
                                    <MenuItem value="Final">Final Exam</MenuItem>
                                    <MenuItem value="Project">Project</MenuItem>
                                    <MenuItem value="Practical">Practical</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Max Marks"
                                type="number"
                                fullWidth
                                value={newColumn.max_marks}
                                onChange={(e) => setNewColumn({ ...newColumn, max_marks: parseInt(e.target.value) })}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Course/Subject"
                                fullWidth
                                value={newColumn.course_name}
                                onChange={(e) => setNewColumn({ ...newColumn, course_name: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Weight (for weighted average)"
                                type="number"
                                fullWidth
                                value={newColumn.weight}
                                onChange={(e) => setNewColumn({ ...newColumn, weight: parseFloat(e.target.value) })}
                                inputProps={{ min: 0, step: 0.1 }}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setAddColumnDialog(false)}>Cancel</Button>
                    <Button variant="contained" onClick={addColumn} disabled={!newColumn.column_name || !newColumn.max_marks}>
                        Add Column
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default TeacherMarksEntryPage;
