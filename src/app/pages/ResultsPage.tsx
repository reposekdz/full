import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Award, TrendingUp, TrendingDown, BarChart3, PieChart, Target, Trophy, Star, FileText, Download, Filter, Search, Calendar, Users, CheckCircle2, XCircle, AlertCircle, Zap, Brain, BookOpen, ChevronRight, ArrowRight, Activity } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/app/components/ui/dialog';
import { Progress } from '@/app/components/ui/progress';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';
import { Separator } from '@/app/components/ui/separator';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';

interface ExamResult {
  id: string;
  studentId: string;
  studentName: string;
  studentPhoto: string;
  examCode: string;
  examTitle: string;
  examTitleRw: string;
  course: string;
  courseRw: string;
  trade: 'SOD' | 'BDC' | 'AUT' | 'General';
  level: string;
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F';
  status: 'passed' | 'failed' | 'distinction' | 'merit';
  rank: number;
  totalStudents: number;
  examDate: string;
  publishedDate: string;
  subjects: {
    name: string;
    nameRw: string;
    totalMarks: number;
    obtained: number;
    grade: string;
  }[];
  teacherComments: string;
  teacherCommentsRw: string;
  improvement: number;
  strengths: string[];
  weaknesses: string[];
}

const ResultsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrade, setSelectedTrade] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [selectedResult, setSelectedResult] = useState<ExamResult | null>(null);
  const [activeTab, setActiveTab] = useState('all');

  const results: ExamResult[] = [
    {
      id: 'r1',
      studentId: 'ST2024001',
      studentName: 'Jean Pierre Uwimana',
      studentPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
      examCode: 'SOD301-MT',
      examTitle: 'Web Development Midterm',
      examTitleRw: 'Ikizamini cyo Hagati - Iterambere rya Urubuga',
      course: 'Advanced Web Development',
      courseRw: 'Iterambere ry\'Urubuga rwa Interineti',
      trade: 'SOD',
      level: 'Level 4 SOD',
      totalMarks: 100,
      obtainedMarks: 92,
      percentage: 92,
      grade: 'A+',
      status: 'distinction',
      rank: 1,
      totalStudents: 45,
      examDate: '2024-02-15',
      publishedDate: '2024-02-20',
      subjects: [
        { name: 'React & Hooks', nameRw: 'React na Hooks', totalMarks: 30, obtained: 28, grade: 'A+' },
        { name: 'State Management', nameRw: 'Gucunga Imiterere', totalMarks: 25, obtained: 24, grade: 'A+' },
        { name: 'API Integration', nameRw: 'Guhuza API', totalMarks: 25, obtained: 22, grade: 'A' },
        { name: 'Database Design', nameRw: 'Gushushanya Ububiko', totalMarks: 20, obtained: 18, grade: 'A' }
      ],
      teacherComments: 'Excellent performance! Shows deep understanding of web development concepts.',
      teacherCommentsRw: 'Ibisubizo byiza cyane! Yerekana ubumenyi bukomeye ku bijanye n\'iterambere rya urubuga.',
      improvement: 8,
      strengths: ['React expertise', 'Clean code', 'Problem-solving'],
      weaknesses: ['Time management during exam']
    },
    {
      id: 'r2',
      studentId: 'ST2024002',
      studentName: 'Marie Claire Mukamana',
      studentPhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80',
      examCode: 'SOD301-MT',
      examTitle: 'Web Development Midterm',
      examTitleRw: 'Ikizamini cyo Hagati - Iterambere rya Urubuga',
      course: 'Advanced Web Development',
      courseRw: 'Iterambere ry\'Urubuga rwa Interineti',
      trade: 'SOD',
      level: 'Level 4 SOD',
      totalMarks: 100,
      obtainedMarks: 88,
      percentage: 88,
      grade: 'A',
      status: 'distinction',
      rank: 2,
      totalStudents: 45,
      examDate: '2024-02-15',
      publishedDate: '2024-02-20',
      subjects: [
        { name: 'React & Hooks', nameRw: 'React na Hooks', totalMarks: 30, obtained: 27, grade: 'A' },
        { name: 'State Management', nameRw: 'Gucunga Imiterere', totalMarks: 25, obtained: 23, grade: 'A' },
        { name: 'API Integration', nameRw: 'Guhuza API', totalMarks: 25, obtained: 21, grade: 'A' },
        { name: 'Database Design', nameRw: 'Gushushanya Ububiko', totalMarks: 20, obtained: 17, grade: 'B+' }
      ],
      teacherComments: 'Great work! Strong foundation in web development.',
      teacherCommentsRw: 'Akazi keza! Urufatiro rukomeye ku iterambere rya urubuga.',
      improvement: 5,
      strengths: ['Good understanding', 'Consistent performance'],
      weaknesses: ['Database design needs improvement']
    },
    {
      id: 'r3',
      studentId: 'ST2024003',
      studentName: 'Patrick Habimana',
      studentPhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80',
      examCode: 'BDC301-FINAL',
      examTitle: 'Construction Management Final',
      examTitleRw: 'Ikizamini cya Nyuma - Imicungire y\'Ubwubatsi',
      course: 'Construction Project Management',
      courseRw: 'Imicungire y\'Imishinga y\'Ubwubatsi',
      trade: 'BDC',
      level: 'Level 4 BDC',
      totalMarks: 150,
      obtainedMarks: 138,
      percentage: 92,
      grade: 'A+',
      status: 'distinction',
      rank: 1,
      totalStudents: 35,
      examDate: '2024-02-20',
      publishedDate: '2024-02-25',
      subjects: [
        { name: 'Project Planning', nameRw: 'Gutegura Umushinga', totalMarks: 40, obtained: 37, grade: 'A' },
        { name: 'Cost Estimation', nameRw: 'Kugereranya Ikiguzi', totalMarks: 35, obtained: 33, grade: 'A+' },
        { name: 'Site Management', nameRw: 'Imicungire y\'Urubuga', totalMarks: 40, obtained: 38, grade: 'A+' },
        { name: 'Quality Control', nameRw: 'Kugenzura Ireme', totalMarks: 35, obtained: 30, grade: 'A' }
      ],
      teacherComments: 'Outstanding performance! Demonstrates excellent grasp of construction management.',
      teacherCommentsRw: 'Ibisubizo bidasanzwe! Yerekana ubumenyi bukomeye ku micungire y\'ubwubatsi.',
      improvement: 10,
      strengths: ['Leadership skills', 'Technical knowledge', 'Practical application'],
      weaknesses: ['None significant']
    },
    {
      id: 'r4',
      studentId: 'ST2024004',
      studentName: 'David Mugabo',
      studentPhoto: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80',
      examCode: 'AUT301-MT',
      examTitle: 'Auto Electronics Midterm',
      examTitleRw: 'Ikizamini cyo Hagati - Elegitoronike y\'Imodoka',
      course: 'Automotive Electronics',
      courseRw: 'Elegitoronike y\'Imodoka',
      trade: 'AUT',
      level: 'Level 4 AUT',
      totalMarks: 100,
      obtainedMarks: 85,
      percentage: 85,
      grade: 'A',
      status: 'distinction',
      rank: 2,
      totalStudents: 40,
      examDate: '2024-02-16',
      publishedDate: '2024-02-21',
      subjects: [
        { name: 'Electrical Circuits', nameRw: 'Imiyoboro y\'amashanyarazi', totalMarks: 30, obtained: 26, grade: 'A' },
        { name: 'Sensor Systems', nameRw: 'Sisitemu z\'ibipimo', totalMarks: 25, obtained: 22, grade: 'A' },
        { name: 'ECU Programming', nameRw: 'Porogaramu ya ECU', totalMarks: 25, obtained: 20, grade: 'B+' },
        { name: 'Diagnostics', nameRw: 'Isuzuma', totalMarks: 20, obtained: 17, grade: 'A' }
      ],
      teacherComments: 'Very good work! Strong theoretical and practical skills.',
      teacherCommentsRw: 'Akazi keza cyane! Ubuhanga bukomeye bwa teoriya n\'ibikorwa.',
      improvement: 7,
      strengths: ['Diagnostic skills', 'Hands-on ability'],
      weaknesses: ['ECU programming needs more practice']
    },
    {
      id: 'r5',
      studentId: 'ST2024005',
      studentName: 'Grace Uwera',
      studentPhoto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80',
      examCode: 'SOD201-QUIZ',
      examTitle: 'Database Management Quiz',
      examTitleRw: 'Ikizamini Gito - Gucunga Ububiko',
      course: 'Database Management Systems',
      courseRw: 'Sisitemu yo Gucunga Ububiko',
      trade: 'SOD',
      level: 'Level 3 SOD',
      totalMarks: 50,
      obtainedMarks: 45,
      percentage: 90,
      grade: 'A+',
      status: 'distinction',
      rank: 1,
      totalStudents: 38,
      examDate: '2024-02-18',
      publishedDate: '2024-02-22',
      subjects: [
        { name: 'SQL Queries', nameRw: 'Ibibazo bya SQL', totalMarks: 20, obtained: 19, grade: 'A+' },
        { name: 'JOIN Operations', nameRw: 'Ibikorwa bya JOIN', totalMarks: 15, obtained: 14, grade: 'A+' },
        { name: 'Normalization', nameRw: 'Gutunganya', totalMarks: 15, obtained: 12, grade: 'B+' }
      ],
      teacherComments: 'Excellent SQL knowledge! Keep up the good work.',
      teacherCommentsRw: 'Ubumenyi bukomeye bwa SQL! Komeza uko ukoze.',
      improvement: 12,
      strengths: ['SQL mastery', 'Query optimization'],
      weaknesses: ['Normalization theory']
    },
    {
      id: 'r6',
      studentId: 'ST2024006',
      studentName: 'Emmanuel Niyonzima',
      studentPhoto: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80',
      examCode: 'BDC201-PRAC',
      examTitle: 'Structural Design Practical',
      examTitleRw: 'Ikizamini cy\'Ibikorwa - Gushushanya Imyubakire',
      course: 'Structural Engineering',
      courseRw: 'Ubwubatsi bw\'Imyubakire',
      trade: 'BDC',
      level: 'Level 3 BDC',
      totalMarks: 100,
      obtainedMarks: 78,
      percentage: 78,
      grade: 'B+',
      status: 'merit',
      rank: 5,
      totalStudents: 42,
      examDate: '2024-02-22',
      publishedDate: '2024-02-27',
      subjects: [
        { name: 'Load Calculations', nameRw: 'Kubara uburemere', totalMarks: 30, obtained: 24, grade: 'B+' },
        { name: 'Beam Design', nameRw: 'Gushushanya ingata', totalMarks: 25, obtained: 20, grade: 'B+' },
        { name: 'Column Design', nameRw: 'Gushushanya inkingi', totalMarks: 25, obtained: 18, grade: 'B' },
        { name: 'Foundation Design', nameRw: 'Gushushanya urufatiro', totalMarks: 20, obtained: 16, grade: 'B+' }
      ],
      teacherComments: 'Good effort! Need more practice on column design.',
      teacherCommentsRw: 'Imbaraga nziza! Ukeneye kwiyitorera ku gushushanya inkingi.',
      improvement: -3,
      strengths: ['Load calculations', 'Foundation work'],
      weaknesses: ['Column design complexity']
    },
    {
      id: 'r7',
      studentId: 'ST2024007',
      studentName: 'Claire Mukeshimana',
      studentPhoto: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80',
      examCode: 'GEN101-QUIZ',
      examTitle: 'Business Communication Quiz',
      examTitleRw: 'Ikizamini Gito - Itumanaho mu Bucuruzi',
      course: 'Business Communication',
      courseRw: 'Itumanaho mu Bucuruzi',
      trade: 'General',
      level: 'Level 3',
      totalMarks: 50,
      obtainedMarks: 42,
      percentage: 84,
      grade: 'A',
      status: 'distinction',
      rank: 3,
      totalStudents: 65,
      examDate: '2024-02-19',
      publishedDate: '2024-02-23',
      subjects: [
        { name: 'Email Etiquette', nameRw: 'Imyitwarire mu meyili', totalMarks: 20, obtained: 17, grade: 'A' },
        { name: 'Report Writing', nameRw: 'Kwandika raporo', totalMarks: 15, obtained: 13, grade: 'A' },
        { name: 'Presentation Skills', nameRw: 'Ubuhanga bwo kwerekana', totalMarks: 15, obtained: 12, grade: 'B+' }
      ],
      teacherComments: 'Strong communication skills! Work on presentation confidence.',
      teacherCommentsRw: 'Ubuhanga bukomeye bwo gutumanaho! Kora ku kwizera mu kwerekana.',
      improvement: 6,
      strengths: ['Written communication', 'Professional tone'],
      weaknesses: ['Presentation delivery']
    },
    {
      id: 'r8',
      studentId: 'ST2024008',
      studentName: 'Frank Kayitare',
      studentPhoto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80',
      examCode: 'AUT201-FINAL',
      examTitle: 'Engine Systems Final',
      examTitleRw: 'Ikizamini cya Nyuma - Sisitemu za Moteri',
      course: 'Engine Systems',
      courseRw: 'Sisitemu za Moteri',
      trade: 'AUT',
      level: 'Level 3 AUT',
      totalMarks: 150,
      obtainedMarks: 120,
      percentage: 80,
      grade: 'B+',
      status: 'merit',
      rank: 4,
      totalStudents: 38,
      examDate: '2024-02-25',
      publishedDate: '2024-03-01',
      subjects: [
        { name: 'Engine Components', nameRw: 'Ibice bya moteri', totalMarks: 40, obtained: 33, grade: 'A' },
        { name: 'Fuel Systems', nameRw: 'Sisitemu z\'amavuta', totalMarks: 35, obtained: 28, grade: 'B+' },
        { name: 'Cooling Systems', nameRw: 'Sisitemu zo gukonjesha', totalMarks: 40, obtained: 30, grade: 'B' },
        { name: 'Troubleshooting', nameRw: 'Gukemura ibibazo', totalMarks: 35, obtained: 29, grade: 'A' }
      ],
      teacherComments: 'Good performance! Focus more on cooling system principles.',
      teacherCommentsRw: 'Ibisubizo byiza! Witondere cyane ku mahame ya sisitemu zo gukonjesha.',
      improvement: 4,
      strengths: ['Troubleshooting ability', 'Engine knowledge'],
      weaknesses: ['Cooling system theory']
    }
  ];

  const filteredResults = results.filter(result => {
    const matchesSearch = 
      result.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.examTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.examTitleRw.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.examCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.course.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTrade = selectedTrade === 'all' || result.trade === selectedTrade;
    const matchesLevel = selectedLevel === 'all' || result.level.includes(selectedLevel);
    const matchesGrade = selectedGrade === 'all' || result.grade === selectedGrade;
    const matchesTab = activeTab === 'all' || result.status === activeTab;

    return matchesSearch && matchesTrade && matchesLevel && matchesGrade && matchesTab;
  });

  const stats = [
    { 
      label: 'Ibisubizo Byose', 
      value: results.length.toString(), 
      icon: FileText, 
      color: 'from-blue-600 to-cyan-600',
      description: 'Umubare wose'
    },
    { 
      label: 'Intsinzi', 
      value: results.filter(r => r.status === 'distinction').length.toString(), 
      icon: Trophy, 
      color: 'from-yellow-600 to-orange-600',
      description: 'Distinction'
    },
    { 
      label: 'Barasohotse', 
      value: results.filter(r => r.status === 'passed' || r.status === 'merit' || r.status === 'distinction').length.toString(), 
      icon: CheckCircle2, 
      color: 'from-green-600 to-emerald-600',
      description: 'Batsindiye'
    },
    { 
      label: 'Ikigereranyo', 
      value: Math.round(results.reduce((sum, r) => sum + r.percentage, 0) / results.length) + '%', 
      icon: TrendingUp, 
      color: 'from-purple-600 to-indigo-600',
      description: 'Rusange'
    }
  ];

  const getGradeBadge = (grade: string) => {
    const gradeConfig: Record<string, { color: string }> = {
      'A+': { color: 'bg-green-100 text-green-700 border-green-300' },
      'A': { color: 'bg-blue-100 text-blue-700 border-blue-300' },
      'B+': { color: 'bg-cyan-100 text-cyan-700 border-cyan-300' },
      'B': { color: 'bg-indigo-100 text-indigo-700 border-indigo-300' },
      'C+': { color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
      'C': { color: 'bg-orange-100 text-orange-700 border-orange-300' },
      'D': { color: 'bg-red-100 text-red-700 border-red-300' },
      'F': { color: 'bg-red-200 text-red-900 border-red-400' }
    };
    const config = gradeConfig[grade];
    return <Badge className={`${config.color} border-2 font-bold text-lg px-3 py-1`}>{grade}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      distinction: { label: 'Intsinzi', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
      merit: { label: 'Byiza', color: 'bg-green-100 text-green-700 border-green-300' },
      passed: { label: 'Yasohotse', color: 'bg-blue-100 text-blue-700 border-blue-300' },
      failed: { label: 'Yanze', color: 'bg-red-100 text-red-700 border-red-300' }
    };
    const config = statusConfig[status as keyof typeof statusConfig];
    return <Badge className={`${config.color} border-2 font-semibold`}>{config.label}</Badge>;
  };

  const getPercentageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-cyan-600';
    if (percentage >= 60) return 'text-yellow-600';
    if (percentage >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  const getImprovementIcon = (improvement: number) => {
    if (improvement > 0) return <TrendingUp className="w-5 h-5 text-green-600" />;
    if (improvement < 0) return <TrendingDown className="w-5 h-5 text-red-600" />;
    return <Activity className="w-5 h-5 text-gray-600" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center shadow-xl">
              <Award className="w-9 h-9 text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-gray-900">Ibisubizo</h1>
              <p className="text-lg text-gray-600 font-semibold mt-1">Amanota n'Imikorere y'Abanyeshuri</p>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-lg border-2 border-blue-100 hover:border-blue-300 transition-all"
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mx-auto mb-3`}>
                  <stat.icon className="w-7 h-7 text-white" />
                </div>
                <p className="text-3xl font-black text-gray-900 mb-1 text-center">{stat.value}</p>
                <p className="text-sm font-semibold text-gray-600 text-center">{stat.label}</p>
                <p className="text-xs text-gray-500 text-center mt-1">{stat.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl shadow-2xl border-2 border-blue-100 p-6 md:p-8 mb-8"
        >
          <div className="flex items-center space-x-3 mb-6">
            <Search className="w-6 h-6 text-blue-600" />
            <h3 className="text-2xl font-black text-gray-900">Shakisha Ibisubizo</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2">
              <Input
                placeholder="Shakisha izina, ikizamini, isomo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-12 text-lg border-2 border-blue-200 focus:border-blue-500"
              />
            </div>

            <Select value={selectedTrade} onValueChange={setSelectedTrade}>
              <SelectTrigger className="h-12 border-2 border-blue-200">
                <SelectValue placeholder="Ihugurwa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Byose</SelectItem>
                <SelectItem value="SOD">Software Development</SelectItem>
                <SelectItem value="BDC">Building Construction</SelectItem>
                <SelectItem value="AUT">Automobile Technology</SelectItem>
                <SelectItem value="General">General</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger className="h-12 border-2 border-blue-200">
                <SelectValue placeholder="Urwego" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Urwego Rwose</SelectItem>
                <SelectItem value="Level 3">Level 3</SelectItem>
                <SelectItem value="Level 4">Level 4</SelectItem>
                <SelectItem value="Level 5">Level 5</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedGrade} onValueChange={setSelectedGrade}>
              <SelectTrigger className="h-12 border-2 border-blue-200">
                <SelectValue placeholder="Umurango" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Umurango Wose</SelectItem>
                <SelectItem value="A+">A+</SelectItem>
                <SelectItem value="A">A</SelectItem>
                <SelectItem value="B+">B+</SelectItem>
                <SelectItem value="B">B</SelectItem>
                <SelectItem value="C+">C+</SelectItem>
                <SelectItem value="C">C</SelectItem>
                <SelectItem value="D">D</SelectItem>
                <SelectItem value="F">F</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full grid-cols-4 h-14 bg-white border-2 border-blue-200 rounded-2xl p-1">
            <TabsTrigger value="all" className="text-base font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white rounded-xl">
              Byose
            </TabsTrigger>
            <TabsTrigger value="distinction" className="text-base font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-600 data-[state=active]:to-orange-600 data-[state=active]:text-white rounded-xl">
              Intsinzi
            </TabsTrigger>
            <TabsTrigger value="merit" className="text-base font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-emerald-600 data-[state=active]:text-white rounded-xl">
              Byiza
            </TabsTrigger>
            <TabsTrigger value="passed" className="text-base font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-xl">
              Basohotse
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredResults.map((result, index) => (
              <motion.div
                key={result.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                layout
              >
                <Card className="h-full border-2 border-blue-100 hover:border-blue-400 hover:shadow-2xl transition-all cursor-pointer group bg-white overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3 flex-1">
                        <Avatar className="w-12 h-12 border-2 border-blue-200">
                          <img src={result.studentPhoto} alt={result.studentName} />
                          <AvatarFallback>{result.studentName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg font-black text-gray-900 truncate">
                            {result.studentName}
                          </CardTitle>
                          <p className="text-sm text-gray-600 font-semibold">{result.studentId}</p>
                        </div>
                      </div>
                      {getGradeBadge(result.grade)}
                    </div>

                    <CardDescription className="text-sm font-semibold text-gray-600 line-clamp-2">
                      {result.examTitleRw}
                    </CardDescription>
                    <p className="text-xs text-gray-500 font-semibold mt-1">{result.courseRw}</p>

                    <div className="flex flex-wrap gap-2 mt-3">
                      {getStatusBadge(result.status)}
                      <Badge className="bg-blue-100 text-blue-700 font-semibold">{result.level}</Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-600">Amanota</span>
                        <span className={`text-3xl font-black ${getPercentageColor(result.percentage)}`}>
                          {result.percentage}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="font-semibold text-gray-600">Yaronse: {result.obtainedMarks}/{result.totalMarks}</span>
                      </div>
                      <Progress value={result.percentage} className="h-2 bg-gray-200" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-purple-50 rounded-lg p-3 text-center">
                        <div className="flex items-center justify-center space-x-1 mb-1">
                          <Trophy className="w-4 h-4 text-purple-600" />
                          <p className="text-xs text-gray-600 font-semibold">Umwanya</p>
                        </div>
                        <p className="text-2xl font-black text-purple-600">{result.rank}</p>
                        <p className="text-xs text-gray-500">kuri {result.totalStudents}</p>
                      </div>

                      <div className="bg-green-50 rounded-lg p-3 text-center">
                        <div className="flex items-center justify-center space-x-1 mb-1">
                          {getImprovementIcon(result.improvement)}
                          <p className="text-xs text-gray-600 font-semibold">Iterambere</p>
                        </div>
                        <p className={`text-2xl font-black ${result.improvement > 0 ? 'text-green-600' : result.improvement < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                          {result.improvement > 0 ? '+' : ''}{result.improvement}%
                        </p>
                        <p className="text-xs text-gray-500">kuva iherezo</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3 text-gray-600" />
                        <span className="font-semibold text-gray-600">{result.publishedDate}</span>
                      </div>
                      <Badge className="bg-gray-200 text-gray-700 font-semibold">{result.examCode}</Badge>
                    </div>

                    <Button 
                      onClick={() => setSelectedResult(result)}
                      className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold shadow-lg group"
                    >
                      Reba Amakuru Yuzuye
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {filteredResults.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 bg-white rounded-3xl shadow-lg border-2 border-blue-100"
          >
            <Award className="w-20 h-20 text-blue-300 mx-auto mb-4" />
            <h3 className="text-2xl font-black text-gray-900 mb-2">Nta Bisubizo Byabonetse</h3>
            <p className="text-gray-600 font-semibold">Gerageza guhindura inyishindu zawe zo gushakisha</p>
          </motion.div>
        )}

        <Dialog open={!!selectedResult} onOpenChange={() => setSelectedResult(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {selectedResult && (
              <>
                <DialogHeader>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4 flex-1">
                      <Avatar className="w-16 h-16 border-4 border-blue-200">
                        <img src={selectedResult.studentPhoto} alt={selectedResult.studentName} />
                        <AvatarFallback>{selectedResult.studentName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <DialogTitle className="text-3xl font-black text-gray-900 mb-1">
                          {selectedResult.studentName}
                        </DialogTitle>
                        <DialogDescription className="text-lg font-semibold text-gray-600">
                          {selectedResult.studentId} • {selectedResult.level}
                        </DialogDescription>
                      </div>
                    </div>
                    {getGradeBadge(selectedResult.grade)}
                  </div>
                </DialogHeader>

                <ScrollArea className="max-h-[60vh]">
                  <div className="space-y-6">
                    <div className="bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl p-6 border-2 border-blue-200">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-xl font-black text-gray-900">{selectedResult.examTitleRw}</h4>
                        {getStatusBadge(selectedResult.status)}
                      </div>
                      <p className="text-gray-700 font-semibold mb-4">{selectedResult.courseRw}</p>
                      
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="bg-white rounded-xl p-4 text-center">
                          <p className="text-sm text-gray-600 font-semibold mb-2">Amanota Yuzuye</p>
                          <p className={`text-4xl font-black ${getPercentageColor(selectedResult.percentage)}`}>
                            {selectedResult.percentage}%
                          </p>
                          <p className="text-sm text-gray-600 mt-2 font-semibold">
                            {selectedResult.obtainedMarks}/{selectedResult.totalMarks}
                          </p>
                        </div>
                        
                        <div className="bg-white rounded-xl p-4 text-center">
                          <p className="text-sm text-gray-600 font-semibold mb-2">Umwanya</p>
                          <p className="text-4xl font-black text-purple-600">{selectedResult.rank}</p>
                          <p className="text-sm text-gray-600 mt-2 font-semibold">kuri {selectedResult.totalStudents}</p>
                        </div>
                        
                        <div className="bg-white rounded-xl p-4 text-center">
                          <p className="text-sm text-gray-600 font-semibold mb-2">Iterambere</p>
                          <div className="flex items-center justify-center space-x-2">
                            {getImprovementIcon(selectedResult.improvement)}
                            <p className={`text-4xl font-black ${selectedResult.improvement > 0 ? 'text-green-600' : selectedResult.improvement < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                              {selectedResult.improvement > 0 ? '+' : ''}{selectedResult.improvement}%
                            </p>
                          </div>
                        </div>
                      </div>

                      <Progress value={selectedResult.percentage} className="h-3 bg-white" />
                    </div>

                    <div>
                      <h4 className="text-xl font-black text-gray-900 mb-4 flex items-center">
                        <BookOpen className="w-6 h-6 mr-2 text-blue-600" />
                        Amanota y'Ingingo
                      </h4>
                      <div className="grid grid-cols-1 gap-3">
                        {selectedResult.subjects.map((subject, index) => (
                          <div key={index} className="bg-white border-2 border-blue-100 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex-1">
                                <h5 className="font-black text-gray-900">{subject.nameRw}</h5>
                                <p className="text-sm text-gray-600 font-semibold">{subject.name}</p>
                              </div>
                              {getGradeBadge(subject.grade)}
                            </div>
                            <div className="flex items-center justify-between text-sm mb-2">
                              <span className="font-semibold text-gray-600">
                                {subject.obtained}/{subject.totalMarks} amanota
                              </span>
                              <span className={`font-bold ${getPercentageColor((subject.obtained / subject.totalMarks) * 100)}`}>
                                {Math.round((subject.obtained / subject.totalMarks) * 100)}%
                              </span>
                            </div>
                            <Progress value={(subject.obtained / subject.totalMarks) * 100} className="h-2 bg-gray-200" />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                        <h5 className="font-black text-gray-900 mb-3 flex items-center">
                          <CheckCircle2 className="w-5 h-5 mr-2 text-green-600" />
                          Imbaraga
                        </h5>
                        <ul className="space-y-2">
                          {selectedResult.strengths.map((strength, index) => (
                            <li key={index} className="flex items-start">
                              <Star className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                              <span className="text-sm font-semibold text-gray-700">{strength}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4">
                        <h5 className="font-black text-gray-900 mb-3 flex items-center">
                          <Target className="w-5 h-5 mr-2 text-orange-600" />
                          Intege
                        </h5>
                        <ul className="space-y-2">
                          {selectedResult.weaknesses.map((weakness, index) => (
                            <li key={index} className="flex items-start">
                              <AlertCircle className="w-4 h-4 text-orange-600 mr-2 mt-0.5 flex-shrink-0" />
                              <span className="text-sm font-semibold text-gray-700">{weakness}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                      <h5 className="font-black text-gray-900 mb-3 flex items-center">
                        <Brain className="w-5 h-5 mr-2 text-blue-600" />
                        Ibitekerezo by'Umwarimu
                      </h5>
                      <p className="text-gray-700 font-semibold mb-2">{selectedResult.teacherCommentsRw}</p>
                      <p className="text-sm text-gray-600 italic">{selectedResult.teacherComments}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-gray-600 font-semibold mb-1">Itariki y'Ikizamini</p>
                        <p className="font-black text-gray-900">{selectedResult.examDate}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-gray-600 font-semibold mb-1">Itariki Yatangiweho</p>
                        <p className="font-black text-gray-900">{selectedResult.publishedDate}</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold shadow-lg">
                        <Download className="w-4 h-4 mr-2" />
                        Kuramo Raporo
                      </Button>
                      <Button variant="outline" className="flex-1 border-2 border-blue-300 font-bold">
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Reba Imikorere
                      </Button>
                    </div>
                  </div>
                </ScrollArea>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ResultsPage;
