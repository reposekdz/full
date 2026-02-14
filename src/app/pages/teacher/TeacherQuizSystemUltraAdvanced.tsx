import React, { useState, useEffect } from 'react';
import {
  Box, Container, Grid, Card, CardContent, Typography, Button, Tabs, Tab,
  TextField, FormControl, InputLabel, Select, MenuItem, IconButton, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, Switch, FormControlLabel,
  List, ListItem, ListItemText, ListItemSecondaryAction, Divider, Alert,
  Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Stepper, Step, StepLabel, Radio, RadioGroup, Checkbox, FormGroup,
  Accordion, AccordionSummary, AccordionDetails, Tooltip, Badge, Avatar,
  LinearProgress, CircularProgress, Slider, Rating
} from '@mui/material';
import {
  Add, Edit, Delete, Visibility, ContentCopy, CloudUpload, Image as ImageIcon,
  VideoLibrary, AudioFile, Code, DragIndicator, Save, Preview, Send,
  Timer, CheckCircle, Cancel, TrendingUp, Assessment, School, Quiz as QuizIcon,
  ExpandMore, Refresh, Download, Share, Settings, AutoAwesome, Psychology
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import axios from 'axios';
import { API_BASE_URL } from '@/app/config/apiBase';

interface Question {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay' | 'matching' | 'fill_blank' | 'code';
  question_text: string;
  points: number;
  options?: string[];
  correct_answer?: string | string[];
  explanation?: string;
  media_url?: string;
  media_type?: 'image' | 'video' | 'audio';
  code_language?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

interface Quiz {
  id?: number;
  title: string;
  description: string;
  subject_id: string;
  trade_code: string;
  level_number: string;
  level_suffix: string;
  difficulty_level: 'easy' | 'medium' | 'hard';
  time_limit: number;
  total_marks: number;
  passing_marks: number;
  instructions: string;
  start_time: string;
  end_time: string;
  randomize_questions: boolean;
  show_results_immediately: boolean;
  allow_review: boolean;
  max_attempts: number;
  questions: Question[];
}

const TeacherQuizSystemUltraAdvanced: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [currentQuiz, setCurrentQuiz] = useState<Quiz>({
    title: '',
    description: '',
    subject_id: '',
    trade_code: '',
    level_number: '',
    level_suffix: '',
    difficulty_level: 'medium',
    time_limit: 60,
    total_marks: 100,
    passing_marks: 50,
    instructions: '',
    start_time: '',
    end_time: '',
    randomize_questions: false,
    show_results_immediately: true,
    allow_review: true,
    max_attempts: 3,
    questions: []
  });
  
  const [openQuizBuilder, setOpenQuizBuilder] = useState(false);
  const [openQuestionDialog, setOpenQuestionDialog] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<Question>({
    id: Date.now().toString(),
    type: 'multiple_choice',
    question_text: '',
    points: 10,
    options: ['', '', '', ''],
    correct_answer: '',
    explanation: '',
    difficulty: 'medium'
  });
  
  const [editingQuestionIndex, setEditingQuestionIndex] = useState<number | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error' | 'info', message: string } | null>(null);
  const [builderStep, setBuilderStep] = useState(0);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/quizzes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setQuizzes(response.data.quizzes || []);
      }
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuiz = () => {
    setCurrentQuiz({
      title: '',
      description: '',
      subject_id: '',
      trade_code: '',
      level_number: '',
      level_suffix: '',
      difficulty_level: 'medium',
      time_limit: 60,
      total_marks: 100,
      passing_marks: 50,
      instructions: '',
      start_time: '',
      end_time: '',
      randomize_questions: false,
      show_results_immediately: true,
      allow_review: true,
      max_attempts: 3,
      questions: []
    });
    setBuilderStep(0);
    setOpenQuizBuilder(true);
  };

  const handleAddQuestion = () => {
    setCurrentQuestion({
      id: Date.now().toString(),
      type: 'multiple_choice',
      question_text: '',
      points: 10,
      options: ['', '', '', ''],
      correct_answer: '',
      explanation: '',
      difficulty: 'medium'
    });
    setEditingQuestionIndex(null);
    setOpenQuestionDialog(true);
  };

  const handleEditQuestion = (index: number) => {
    setCurrentQuestion(currentQuiz.questions[index]);
    setEditingQuestionIndex(index);
    setOpenQuestionDialog(true);
  };

  const handleSaveQuestion = () => {
    const updatedQuestions = [...currentQuiz.questions];
    if (editingQuestionIndex !== null) {
      updatedQuestions[editingQuestionIndex] = currentQuestion;
    } else {
      updatedQuestions.push(currentQuestion);
    }
    setCurrentQuiz({ ...currentQuiz, questions: updatedQuestions });
    setOpenQuestionDialog(false);
  };

  const handleDeleteQuestion = (index: number) => {
    const updatedQuestions = currentQuiz.questions.filter((_, i) => i !== index);
    setCurrentQuiz({ ...currentQuiz, questions: updatedQuestions });
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    const items = Array.from(currentQuiz.questions);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setCurrentQuiz({ ...currentQuiz, questions: items });
  };

  const handleSaveQuiz = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const totalMarks = currentQuiz.questions.reduce((sum, q) => sum + q.points, 0);
      const quizData = { ...currentQuiz, total_marks: totalMarks };
      
      const response = await axios.post(`${API_BASE_URL}/quizzes`, quizData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        showAlert('success', 'Quiz created successfully!');
        setOpenQuizBuilder(false);
        fetchQuizzes();
      }
    } catch (error: any) {
      showAlert('error', error.response?.data?.message || 'Failed to create quiz');
    } finally {
      setLoading(false);
    }
  };

  const generateAISuggestions = async () => {
    // Simulate AI suggestions
    const suggestions = [
      'What is the primary purpose of React hooks?',
      'Explain the difference between state and props in React',
      'How does the virtual DOM improve performance?',
      'What are the benefits of using TypeScript with React?'
    ];
    setAiSuggestions(suggestions);
  };

  const showAlert = (type: 'success' | 'error' | 'info', message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  const renderQuestionTypeFields = () => {
    switch (currentQuestion.type) {
      case 'multiple_choice':
        return (
          <Box>
            <Typography variant="subtitle2" gutterBottom>Options</Typography>
            {currentQuestion.options?.map((option, index) => (
              <Box key={index} display="flex" alignItems="center" mb={1}>
                <Radio
                  checked={currentQuestion.correct_answer === option}
                  onChange={() => setCurrentQuestion({ ...currentQuestion, correct_answer: option })}
                />
                <TextField
                  fullWidth
                  size="small"
                  placeholder={`Option ${index + 1}`}
                  value={option}
                  onChange={(e) => {
                    const newOptions = [...(currentQuestion.options || [])];
                    newOptions[index] = e.target.value;
                    setCurrentQuestion({ ...currentQuestion, options: newOptions });
                  }}
                />
                {index > 1 && (
                  <IconButton size="small" onClick={() => {
                    const newOptions = currentQuestion.options?.filter((_, i) => i !== index);
                    setCurrentQuestion({ ...currentQuestion, options: newOptions });
                  }}>
                    <Delete fontSize="small" />
                  </IconButton>
                )}
              </Box>
            ))}
            <Button
              size="small"
              startIcon={<Add />}
              onClick={() => setCurrentQuestion({
                ...currentQuestion,
                options: [...(currentQuestion.options || []), '']
              })}
            >
              Add Option
            </Button>
          </Box>
        );
      
      case 'true_false':
        return (
          <FormControl fullWidth>
            <InputLabel>Correct Answer</InputLabel>
            <Select
              value={currentQuestion.correct_answer}
              onChange={(e) => setCurrentQuestion({ ...currentQuestion, correct_answer: e.target.value })}
            >
              <MenuItem value="true">True</MenuItem>
              <MenuItem value="false">False</MenuItem>
            </Select>
          </FormControl>
        );
      
      case 'short_answer':
      case 'fill_blank':
        return (
          <TextField
            fullWidth
            label="Sample Correct Answer"
            value={currentQuestion.correct_answer}
            onChange={(e) => setCurrentQuestion({ ...currentQuestion, correct_answer: e.target.value })}
            helperText="Provide a sample answer for reference"
          />
        );
      
      case 'code':
        return (
          <Box>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Programming Language</InputLabel>
              <Select
                value={currentQuestion.code_language || 'javascript'}
                onChange={(e) => setCurrentQuestion({ ...currentQuestion, code_language: e.target.value })}
              >
                <MenuItem value="javascript">JavaScript</MenuItem>
                <MenuItem value="python">Python</MenuItem>
                <MenuItem value="java">Java</MenuItem>
                <MenuItem value="cpp">C++</MenuItem>
                <MenuItem value="sql">SQL</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              multiline
              rows={6}
              label="Expected Code Solution"
              value={currentQuestion.correct_answer}
              onChange={(e) => setCurrentQuestion({ ...currentQuestion, correct_answer: e.target.value })}
              sx={{ fontFamily: 'monospace' }}
            />
          </Box>
        );
      
      default:
        return null;
    }
  };

  const renderQuizBuilder = () => (
    <Dialog open={openQuizBuilder} onClose={() => setOpenQuizBuilder(false)} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Create Advanced Quiz</Typography>
          <Box>
            <IconButton onClick={() => setPreviewMode(!previewMode)}>
              <Preview />
            </IconButton>
            <IconButton onClick={() => setOpenQuizBuilder(false)}>
              <Cancel />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Stepper activeStep={builderStep} sx={{ mb: 4 }}>
          <Step><StepLabel>Basic Info</StepLabel></Step>
          <Step><StepLabel>Questions</StepLabel></Step>
          <Step><StepLabel>Settings</StepLabel></Step>
          <Step><StepLabel>Review</StepLabel></Step>
        </Stepper>

        {builderStep === 0 && (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Quiz Title"
                value={currentQuiz.title}
                onChange={(e) => setCurrentQuiz({ ...currentQuiz, title: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                value={currentQuiz.description}
                onChange={(e) => setCurrentQuiz({ ...currentQuiz, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Trade</InputLabel>
                <Select
                  value={currentQuiz.trade_code}
                  onChange={(e) => setCurrentQuiz({ ...currentQuiz, trade_code: e.target.value })}
                >
                  <MenuItem value="AUT">Automotive</MenuItem>
                  <MenuItem value="BDC">Building Construction</MenuItem>
                  <MenuItem value="SOD">Software Development</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={3}>
              <TextField
                fullWidth
                type="number"
                label="Level"
                value={currentQuiz.level_number}
                onChange={(e) => setCurrentQuiz({ ...currentQuiz, level_number: e.target.value })}
              />
            </Grid>
            <Grid item xs={3}>
              <TextField
                fullWidth
                label="Suffix"
                value={currentQuiz.level_suffix}
                onChange={(e) => setCurrentQuiz({ ...currentQuiz, level_suffix: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Difficulty</InputLabel>
                <Select
                  value={currentQuiz.difficulty_level}
                  onChange={(e) => setCurrentQuiz({ ...currentQuiz, difficulty_level: e.target.value as any })}
                >
                  <MenuItem value="easy">Easy</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="hard">Hard</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                type="number"
                label="Time Limit (minutes)"
                value={currentQuiz.time_limit}
                onChange={(e) => setCurrentQuiz({ ...currentQuiz, time_limit: parseInt(e.target.value) })}
              />
            </Grid>
          </Grid>
        )}

        {builderStep === 1 && (
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Questions ({currentQuiz.questions.length})</Typography>
              <Box>
                <Button
                  variant="outlined"
                  startIcon={<AutoAwesome />}
                  onClick={generateAISuggestions}
                  sx={{ mr: 1 }}
                >
                  AI Suggestions
                </Button>
                <Button variant="contained" startIcon={<Add />} onClick={handleAddQuestion}>
                  Add Question
                </Button>
              </Box>
            </Box>

            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="questions">
                {(provided) => (
                  <List {...provided.droppableProps} ref={provided.innerRef}>
                    {currentQuiz.questions.map((question, index) => (
                      <Draggable key={question.id} draggableId={question.id} index={index}>
                        {(provided) => (
                          <Paper
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            sx={{ mb: 2, p: 2 }}
                          >
                            <Box display="flex" alignItems="center">
                              <Box {...provided.dragHandleProps} sx={{ mr: 2 }}>
                                <DragIndicator />
                              </Box>
                              <Box flex={1}>
                                <Typography variant="subtitle1">
                                  Q{index + 1}. {question.question_text}
                                </Typography>
                                <Box display="flex" gap={1} mt={1}>
                                  <Chip label={question.type} size="small" />
                                  <Chip label={`${question.points} pts`} size="small" color="primary" />
                                  <Chip label={question.difficulty} size="small" color="secondary" />
                                </Box>
                              </Box>
                              <Box>
                                <IconButton onClick={() => handleEditQuestion(index)}>
                                  <Edit />
                                </IconButton>
                                <IconButton onClick={() => handleDeleteQuestion(index)} color="error">
                                  <Delete />
                                </IconButton>
                              </Box>
                            </Box>
                          </Paper>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </List>
                )}
              </Droppable>
            </DragDropContext>

            {currentQuiz.questions.length === 0 && (
              <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50' }}>
                <QuizIcon sx={{ fontSize: 60, color: 'grey.400', mb: 2 }} />
                <Typography color="text.secondary">No questions added yet</Typography>
                <Button variant="contained" startIcon={<Add />} onClick={handleAddQuestion} sx={{ mt: 2 }}>
                  Add First Question
                </Button>
              </Paper>
            )}
          </Box>
        )}

        {builderStep === 2 && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Instructions"
                value={currentQuiz.instructions}
                onChange={(e) => setCurrentQuiz({ ...currentQuiz, instructions: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                type="datetime-local"
                label="Start Time"
                InputLabelProps={{ shrink: true }}
                value={currentQuiz.start_time}
                onChange={(e) => setCurrentQuiz({ ...currentQuiz, start_time: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                type="datetime-local"
                label="End Time"
                InputLabelProps={{ shrink: true }}
                value={currentQuiz.end_time}
                onChange={(e) => setCurrentQuiz({ ...currentQuiz, end_time: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                type="number"
                label="Passing Marks"
                value={currentQuiz.passing_marks}
                onChange={(e) => setCurrentQuiz({ ...currentQuiz, passing_marks: parseInt(e.target.value) })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                type="number"
                label="Max Attempts"
                value={currentQuiz.max_attempts}
                onChange={(e) => setCurrentQuiz({ ...currentQuiz, max_attempts: parseInt(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12}>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch
                      checked={currentQuiz.randomize_questions}
                      onChange={(e) => setCurrentQuiz({ ...currentQuiz, randomize_questions: e.target.checked })}
                    />
                  }
                  label="Randomize Questions"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={currentQuiz.show_results_immediately}
                      onChange={(e) => setCurrentQuiz({ ...currentQuiz, show_results_immediately: e.target.checked })}
                    />
                  }
                  label="Show Results Immediately"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={currentQuiz.allow_review}
                      onChange={(e) => setCurrentQuiz({ ...currentQuiz, allow_review: e.target.checked })}
                    />
                  }
                  label="Allow Review After Submission"
                />
              </FormGroup>
            </Grid>
          </Grid>
        )}

        {builderStep === 3 && (
          <Box>
            <Alert severity="info" sx={{ mb: 3 }}>
              Review your quiz before publishing
            </Alert>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>{currentQuiz.title}</Typography>
                    <Typography color="text.secondary" paragraph>{currentQuiz.description}</Typography>
                    <Box display="flex" gap={1} flexWrap="wrap">
                      <Chip label={`${currentQuiz.trade_code} L${currentQuiz.level_number}`} />
                      <Chip label={currentQuiz.difficulty_level} color="primary" />
                      <Chip label={`${currentQuiz.time_limit} min`} icon={<Timer />} />
                      <Chip label={`${currentQuiz.questions.length} questions`} icon={<QuizIcon />} />
                      <Chip label={`${currentQuiz.questions.reduce((sum, q) => sum + q.points, 0)} marks`} color="secondary" />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpenQuizBuilder(false)}>Cancel</Button>
        {builderStep > 0 && (
          <Button onClick={() => setBuilderStep(builderStep - 1)}>Back</Button>
        )}
        {builderStep < 3 ? (
          <Button variant="contained" onClick={() => setBuilderStep(builderStep + 1)}>
            Next
          </Button>
        ) : (
          <Button variant="contained" onClick={handleSaveQuiz} disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Publish Quiz'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );

  const renderQuestionDialog = () => (
    <Dialog open={openQuestionDialog} onClose={() => setOpenQuestionDialog(false)} maxWidth="md" fullWidth>
      <DialogTitle>
        {editingQuestionIndex !== null ? 'Edit Question' : 'Add New Question'}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={8}>
            <FormControl fullWidth>
              <InputLabel>Question Type</InputLabel>
              <Select
                value={currentQuestion.type}
                onChange={(e) => setCurrentQuestion({ ...currentQuestion, type: e.target.value as any })}
              >
                <MenuItem value="multiple_choice">Multiple Choice</MenuItem>
                <MenuItem value="true_false">True/False</MenuItem>
                <MenuItem value="short_answer">Short Answer</MenuItem>
                <MenuItem value="essay">Essay</MenuItem>
                <MenuItem value="fill_blank">Fill in the Blank</MenuItem>
                <MenuItem value="code">Code Question</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={4}>
            <TextField
              fullWidth
              type="number"
              label="Points"
              value={currentQuestion.points}
              onChange={(e) => setCurrentQuestion({ ...currentQuestion, points: parseInt(e.target.value) })}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Question Text"
              value={currentQuestion.question_text}
              onChange={(e) => setCurrentQuestion({ ...currentQuestion, question_text: e.target.value })}
            />
          </Grid>
          <Grid item xs={12}>
            {renderQuestionTypeFields()}
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Explanation (Optional)"
              value={currentQuestion.explanation}
              onChange={(e) => setCurrentQuestion({ ...currentQuestion, explanation: e.target.value })}
              helperText="Shown to students after submission"
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Difficulty</InputLabel>
              <Select
                value={currentQuestion.difficulty}
                onChange={(e) => setCurrentQuestion({ ...currentQuestion, difficulty: e.target.value as any })}
              >
                <MenuItem value="easy">Easy</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="hard">Hard</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpenQuestionDialog(false)}>Cancel</Button>
        <Button variant="contained" onClick={handleSaveQuestion}>
          {editingQuestionIndex !== null ? 'Update' : 'Add'} Question
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {alert && (
        <Alert severity={alert.type} sx={{ mb: 2 }} onClose={() => setAlert(null)}>
          {alert.message}
        </Alert>
      )}

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Quiz & Assessment System
          </Typography>
          <Typography color="text.secondary">
            Create, manage, and analyze quizzes with advanced features
          </Typography>
        </Box>
        <Button variant="contained" size="large" startIcon={<Add />} onClick={handleCreateQuiz}>
          Create Quiz
        </Button>
      </Box>

      <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ mb: 3 }}>
        <Tab icon={<QuizIcon />} label="My Quizzes" />
        <Tab icon={<Assessment />} label="Submissions" />
        <Tab icon={<TrendingUp />} label="Analytics" />
      </Tabs>

      {activeTab === 0 && (
        <Grid container spacing={3}>
          {quizzes.map((quiz) => (
            <Grid item xs={12} md={6} lg={4} key={quiz.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>{quiz.title}</Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {quiz.description}
                  </Typography>
                  <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
                    <Chip label={quiz.difficulty_level} size="small" color="primary" />
                    <Chip label={`${quiz.time_limit} min`} size="small" />
                    <Chip label={`${quiz.questions.length} questions`} size="small" />
                  </Box>
                  <Box display="flex" gap={1}>
                    <Button size="small" startIcon={<Visibility />}>View</Button>
                    <Button size="small" startIcon={<Edit />}>Edit</Button>
                    <Button size="small" startIcon={<Assessment />}>Results</Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
          {quizzes.length === 0 && (
            <Grid item xs={12}>
              <Paper sx={{ p: 6, textAlign: 'center' }}>
                <QuizIcon sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No quizzes created yet
                </Typography>
                <Button variant="contained" startIcon={<Add />} onClick={handleCreateQuiz} sx={{ mt: 2 }}>
                  Create Your First Quiz
                </Button>
              </Paper>
            </Grid>
          )}
        </Grid>
      )}

      {renderQuizBuilder()}
      {renderQuestionDialog()}
    </Container>
  );
};

export default TeacherQuizSystemUltraAdvanced;
