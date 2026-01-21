import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, Calendar, Clock, AlertCircle, CheckCircle2, XCircle, Users, TrendingUp, Award, Filter, Search, Download, Bell, MapPin, User, BookOpen, ChevronRight, Target, Brain, Zap, Trophy, BarChart3, PieChart, Activity, ArrowRight } from 'lucide-react';
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

interface Exam {
  id: string;
  code: string;
  title: string;
  titleRw: string;
  course: string;
  courseRw: string;
  trade: 'SOD' | 'BDC' | 'AUT' | 'General';
  level: string;
  type: 'midterm' | 'final' | 'quiz' | 'practical';
  date: string;
  time: string;
  duration: number;
  room: string;
  instructor: string;
  instructorPhoto: string;
  totalMarks: number;
  passingMarks: number;
  studentsEnrolled: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'grading';
  description: string;
  descriptionRw: string;
  topics: string[];
  topicsRw: string[];
  materials: string[];
  rules: string[];
  rulesRw: string[];
}

const ExamsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrade, setSelectedTrade] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [activeTab, setActiveTab] = useState('upcoming');

  const exams: Exam[] = [
    {
      id: 'e1',
      code: 'SOD301-MT',
      title: 'Web Development Midterm',
      titleRw: 'Ikizamini cyo Hagati - Iterambere rya Urubuga',
      course: 'Advanced Web Development',
      courseRw: 'Iterambere ry\'Urubuga rwa Interineti',
      trade: 'SOD',
      level: 'Level 4 SOD',
      type: 'midterm',
      date: '2024-02-15',
      time: '09:00 - 11:30',
      duration: 150,
      room: 'Lab A1',
      instructor: 'Dr. Alice Uwase',
      instructorPhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80',
      totalMarks: 100,
      passingMarks: 50,
      studentsEnrolled: 45,
      status: 'upcoming',
      description: 'Comprehensive midterm covering React, Node.js, and database integration',
      descriptionRw: 'Ikizamini cyo hagati kirimo React, Node.js, n\'ububiko bw\'amakuru',
      topics: ['React Components & Hooks', 'State Management', 'API Integration', 'Database Design'],
      topicsRw: ['Ibice bya React na Hooks', 'Gucunga Imiterere', 'Guhuza API', 'Gushushanya Ububiko'],
      materials: ['Laptop required', 'Internet connection', 'Development environment setup'],
      rules: [
        'No mobile phones allowed',
        'Bring student ID card',
        'Arrive 15 minutes early',
        'No talking during exam'
      ],
      rulesRw: [
        'Terefone ntizemewe',
        'Zana ikarita y\'umunyeshuri',
        'Ngera mbere y\'iminota 15',
        'Nta kuvugana mu kizamini'
      ]
    },
    {
      id: 'e2',
      code: 'SOD201-QUIZ',
      title: 'Database Management Quiz',
      titleRw: 'Ikizamini Gito - Gucunga Ububiko',
      course: 'Database Management Systems',
      courseRw: 'Sisitemu yo Gucunga Ububiko',
      trade: 'SOD',
      level: 'Level 3 SOD',
      type: 'quiz',
      date: '2024-02-18',
      time: '14:00 - 15:00',
      duration: 60,
      room: 'Lab A2',
      instructor: 'Ms. Grace Mukamana',
      instructorPhoto: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80',
      totalMarks: 50,
      passingMarks: 25,
      studentsEnrolled: 38,
      status: 'upcoming',
      description: 'Quick assessment on SQL queries and normalization',
      descriptionRw: 'Isuzuma ry\'ibanze kuri SQL n\'amahame',
      topics: ['SQL SELECT queries', 'JOIN operations', 'Database normalization'],
      topicsRw: ['Ibibazo bya SQL SELECT', 'Ibikorwa bya JOIN', 'Gutunganya ububiko'],
      materials: ['Pen and paper', 'Calculator allowed'],
      rules: [
        'Closed book exam',
        'No electronic devices',
        'Show all your work',
        'Write clearly'
      ],
      rulesRw: [
        'Ikizamini kitemeye ibitabo',
        'Nta bikoresho bya elegitoronike',
        'Erekana ibikorwa byose',
        'Andika neza'
      ]
    },
    {
      id: 'e3',
      code: 'BDC301-FINAL',
      title: 'Construction Management Final',
      titleRw: 'Ikizamini cya Nyuma - Imicungire y\'Ubwubatsi',
      course: 'Construction Project Management',
      courseRw: 'Imicungire y\'Imishinga y\'Ubwubatsi',
      trade: 'BDC',
      level: 'Level 4 BDC',
      type: 'final',
      date: '2024-02-20',
      time: '08:00 - 11:00',
      duration: 180,
      room: 'Room 301',
      instructor: 'Mr. Emmanuel Kayitare',
      instructorPhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80',
      totalMarks: 150,
      passingMarks: 75,
      studentsEnrolled: 35,
      status: 'upcoming',
      description: 'Final exam covering all aspects of construction project management',
      descriptionRw: 'Ikizamini cya nyuma kirimo ibijyanye n\'imicungire y\'imishinga y\'ubwubatsi',
      topics: ['Project Planning', 'Cost Estimation', 'Site Management', 'Quality Control', 'Safety Regulations'],
      topicsRw: ['Gutegura Umushinga', 'Kugereranya Ikiguzi', 'Imicungire y\'Urubuga', 'Kugenzura Ireme', 'Amategeko y\'Umutekano'],
      materials: ['Calculator required', 'Drawing instruments', 'Reference materials allowed'],
      rules: [
        'Bring valid ID',
        'Arrive 30 minutes early',
        'No communication with other students',
        'Raise hand for assistance'
      ],
      rulesRw: [
        'Zana ikarita ifite agaciro',
        'Ngera mbere y\'iminota 30',
        'Nta kuvugana n\'abandi banyeshuri',
        'Zamura ukuboko niba ukeneye ubufasha'
      ]
    },
    {
      id: 'e4',
      code: 'BDC201-PRAC',
      title: 'Structural Design Practical',
      titleRw: 'Ikizamini cy\'Ibikorwa - Gushushanya Imyubakire',
      course: 'Structural Engineering',
      courseRw: 'Ubwubatsi bw\'Imyubakire',
      trade: 'BDC',
      level: 'Level 3 BDC',
      type: 'practical',
      date: '2024-02-22',
      time: '13:00 - 16:00',
      duration: 180,
      room: 'Workshop 1',
      instructor: 'Eng. Patrick Habimana',
      instructorPhoto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80',
      totalMarks: 100,
      passingMarks: 50,
      studentsEnrolled: 42,
      status: 'upcoming',
      description: 'Hands-on practical exam on structural design and analysis',
      descriptionRw: 'Ikizamini cy\'ibikorwa ku gushushanya no gusesengura imyubakire',
      topics: ['Load calculations', 'Beam design', 'Column design', 'Foundation design'],
      topicsRw: ['Kubara uburemere', 'Gushushanya ingata', 'Gushushanya inkingi', 'Gushushanya urufatiro'],
      materials: ['Safety equipment required', 'Drawing tools', 'Calculator'],
      rules: [
        'Wear safety gear',
        'Follow workshop rules',
        'Work individually',
        'Clean up after completion'
      ],
      rulesRw: [
        'Ambara ibikurura umutekano',
        'Kubahiriza amategeko y\'aho dukorera',
        'Kora wenyine',
        'Sukura nyuma yo kurangiza'
      ]
    },
    {
      id: 'e5',
      code: 'AUT301-MT',
      title: 'Auto Electronics Midterm',
      titleRw: 'Ikizamini cyo Hagati - Elegitoronike y\'Imodoka',
      course: 'Automotive Electronics',
      courseRw: 'Elegitoronike y\'Imodoka',
      trade: 'AUT',
      level: 'Level 4 AUT',
      type: 'midterm',
      date: '2024-02-16',
      time: '10:00 - 12:30',
      duration: 150,
      room: 'Auto Lab 1',
      instructor: 'Eng. David Mugabo',
      instructorPhoto: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80',
      totalMarks: 100,
      passingMarks: 50,
      studentsEnrolled: 40,
      status: 'upcoming',
      description: 'Midterm exam on automotive electrical systems and diagnostics',
      descriptionRw: 'Ikizamini cyo hagati ku sisitemu z\'amashanyarazi mu modoka',
      topics: ['Electrical circuits', 'Sensor systems', 'ECU programming', 'Diagnostics'],
      topicsRw: ['Imiyoboro y\'amashanyarazi', 'Sisitemu z\'ibipimo', 'Porogaramu ya ECU', 'Isuzuma'],
      materials: ['Multimeter', 'Diagnostic tools', 'Safety glasses'],
      rules: [
        'Safety first - no shortcuts',
        'Handle equipment carefully',
        'Report any issues immediately',
        'Work in designated areas only'
      ],
      rulesRw: [
        'Umutekano imbere - nta mpande',
        'Koresha ibikoresho witonze',
        'Menyesha ibibazo ako kanya',
        'Kora ahantu hagenwe gusa'
      ]
    },
    {
      id: 'e6',
      code: 'AUT201-FINAL',
      title: 'Engine Systems Final',
      titleRw: 'Ikizamini cya Nyuma - Sisitemu za Moteri',
      course: 'Engine Systems',
      courseRw: 'Sisitemu za Moteri',
      trade: 'AUT',
      level: 'Level 3 AUT',
      type: 'final',
      date: '2024-02-25',
      time: '08:00 - 11:00',
      duration: 180,
      room: 'Auto Lab 2',
      instructor: 'Mr. Frank Niyonzima',
      instructorPhoto: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80',
      totalMarks: 150,
      passingMarks: 75,
      studentsEnrolled: 38,
      status: 'upcoming',
      description: 'Comprehensive final exam on engine systems and maintenance',
      descriptionRw: 'Ikizamini cya nyuma kirimo sisitemu za moteri n\'imibereho',
      topics: ['Engine components', 'Fuel systems', 'Cooling systems', 'Lubrication', 'Troubleshooting'],
      topicsRw: ['Ibice bya moteri', 'Sisitemu z\'amavuta', 'Sisitemu zo gukonjesha', 'Sisitemu z\'amavuta yo gusukura', 'Gukemura ibibazo'],
      materials: ['Workshop manual', 'Tools provided', 'Safety equipment'],
      rules: [
        'Punctuality is mandatory',
        'No external help allowed',
        'Follow all safety protocols',
        'Submit work on time'
      ],
      rulesRw: [
        'Kugera ku gihe ni ngombwa',
        'Nta bufasha bwo hanze bwemewe',
        'Kubahiriza amahame y\'umutekano yose',
        'Shyikiriza akazi ku gihe'
      ]
    },
    {
      id: 'e7',
      code: 'GEN101-QUIZ',
      title: 'Business Communication Quiz',
      titleRw: 'Ikizamini Gito - Itumanaho mu Bucuruzi',
      course: 'Business Communication',
      courseRw: 'Itumanaho mu Bucuruzi',
      trade: 'General',
      level: 'Level 3',
      type: 'quiz',
      date: '2024-02-19',
      time: '15:00 - 16:00',
      duration: 60,
      room: 'Room 201',
      instructor: 'Ms. Claire Uwera',
      instructorPhoto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80',
      totalMarks: 50,
      passingMarks: 25,
      studentsEnrolled: 65,
      status: 'upcoming',
      description: 'Quiz on professional communication and business writing',
      descriptionRw: 'Ikizamini ku itumanaho ry\'umwuga n\'inyandiko z\'ubucuruzi',
      topics: ['Email etiquette', 'Report writing', 'Presentation skills'],
      topicsRw: ['Imyitwarire mu meyili', 'Kwandika raporo', 'Ubuhanga bwo kwerekana'],
      materials: ['Pen and paper only', 'No electronic devices'],
      rules: [
        'Silence mobile phones',
        'One attempt only',
        'No looking at others\' papers',
        'Stay seated until time is up'
      ],
      rulesRw: [
        'Zimya terefone',
        'Gerageza rimwe gusa',
        'Ntukebe ku mpapuro z\'abandi',
        'Icara kugeza igihe kirangiye'
      ]
    },
    {
      id: 'e8',
      code: 'SOD401-PRAC',
      title: 'Full Stack Development Practical',
      titleRw: 'Ikizamini cy\'Ibikorwa - Iterambere Ryuzuye',
      course: 'Full Stack Development',
      courseRw: 'Iterambere Ryuzuye rya Porogaramu',
      trade: 'SOD',
      level: 'Level 5 SOD',
      type: 'practical',
      date: '2024-02-17',
      time: '09:00 - 13:00',
      duration: 240,
      room: 'Lab A3',
      instructor: 'Dr. Alice Uwase',
      instructorPhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80',
      totalMarks: 200,
      passingMarks: 100,
      studentsEnrolled: 28,
      status: 'grading',
      description: 'Build a complete web application from scratch',
      descriptionRw: 'Kora porogaramu yuzuye kuva mu ntangiriro',
      topics: ['Frontend development', 'Backend APIs', 'Database design', 'Deployment'],
      topicsRw: ['Iterambere ryo imbere', 'API zo inyuma', 'Gushushanya ububiko', 'Gushyira mu bikorwa'],
      materials: ['Laptop with dev environment', 'Internet access', 'GitHub account'],
      rules: [
        'Code must be original',
        'Document your code',
        'Push to GitHub regularly',
        'Demo required at end'
      ],
      rulesRw: [
        'Kode igomba kuba yawe',
        'Andika inyandiko z\'ikode yawe',
        'Ohereza kuri GitHub buri gihe',
        'Kwerekana birakorwa mu iherezo'
      ]
    }
  ];

  const filteredExams = exams.filter(exam => {
    const matchesSearch = 
      exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exam.titleRw.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exam.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exam.course.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exam.courseRw.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTrade = selectedTrade === 'all' || exam.trade === selectedTrade;
    const matchesLevel = selectedLevel === 'all' || exam.level.includes(selectedLevel);
    const matchesType = selectedType === 'all' || exam.type === selectedType;
    const matchesTab = activeTab === 'all' || exam.status === activeTab;

    return matchesSearch && matchesTrade && matchesLevel && matchesType && matchesTab;
  });

  const stats = [
    { 
      label: 'Ibizamini Byose', 
      value: exams.length.toString(), 
      icon: FileText, 
      color: 'from-purple-600 to-indigo-600',
      description: 'Umubare wose'
    },
    { 
      label: 'Bizaza', 
      value: exams.filter(e => e.status === 'upcoming').length.toString(), 
      icon: Calendar, 
      color: 'from-blue-600 to-cyan-600',
      description: 'Biteguwe'
    },
    { 
      label: 'Biri Kurangizwa', 
      value: exams.filter(e => e.status === 'grading').length.toString(), 
      icon: Activity, 
      color: 'from-orange-600 to-amber-600',
      description: 'Amanota aratangwa'
    },
    { 
      label: 'Abanyeshuri', 
      value: exams.reduce((sum, e) => sum + e.studentsEnrolled, 0).toString(), 
      icon: Users, 
      color: 'from-green-600 to-emerald-600',
      description: 'Bose hamwe'
    }
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      upcoming: { label: 'Bizaza', labelRw: 'Bizaza', color: 'bg-blue-100 text-blue-700 border-blue-300' },
      ongoing: { label: 'Biragenda', labelRw: 'Biragenda', color: 'bg-green-100 text-green-700 border-green-300' },
      completed: { label: 'Byarangiye', labelRw: 'Byarangiye', color: 'bg-gray-100 text-gray-700 border-gray-300' },
      grading: { label: 'Amanota', labelRw: 'Amanota', color: 'bg-orange-100 text-orange-700 border-orange-300' }
    };
    const config = statusConfig[status as keyof typeof statusConfig];
    return <Badge className={`${config.color} border-2 font-bold`}>{config.labelRw}</Badge>;
  };

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      midterm: { label: 'Cyo Hagati', color: 'bg-purple-100 text-purple-700' },
      final: { label: 'Cya Nyuma', color: 'bg-red-100 text-red-700' },
      quiz: { label: 'Igizamini Gito', color: 'bg-blue-100 text-blue-700' },
      practical: { label: 'Ibikorwa', color: 'bg-green-100 text-green-700' }
    };
    const config = typeConfig[type as keyof typeof typeConfig];
    return <Badge className={`${config.color} font-semibold`}>{config.label}</Badge>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-xl">
              <FileText className="w-9 h-9 text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-gray-900">Ibizamini</h1>
              <p className="text-lg text-gray-600 font-semibold mt-1">Gahunda y'Ibizamini n'Amakuru</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-lg border-2 border-purple-100 hover:border-purple-300 transition-all"
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

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl shadow-2xl border-2 border-purple-100 p-6 md:p-8 mb-8"
        >
          <div className="flex items-center space-x-3 mb-6">
            <Search className="w-6 h-6 text-purple-600" />
            <h3 className="text-2xl font-black text-gray-900">Shakisha Ikizamini</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2">
              <Input
                placeholder="Shakisha izina, kode, isomo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-12 text-lg border-2 border-purple-200 focus:border-purple-500"
              />
            </div>

            <Select value={selectedTrade} onValueChange={setSelectedTrade}>
              <SelectTrigger className="h-12 border-2 border-purple-200">
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
              <SelectTrigger className="h-12 border-2 border-purple-200">
                <SelectValue placeholder="Urwego" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Urwego Rwose</SelectItem>
                <SelectItem value="Level 3">Level 3</SelectItem>
                <SelectItem value="Level 4">Level 4</SelectItem>
                <SelectItem value="Level 5">Level 5</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="h-12 border-2 border-purple-200">
                <SelectValue placeholder="Ubwoko" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Ubwoko Bwose</SelectItem>
                <SelectItem value="midterm">Cyo Hagati</SelectItem>
                <SelectItem value="final">Cya Nyuma</SelectItem>
                <SelectItem value="quiz">Igizamini Gito</SelectItem>
                <SelectItem value="practical">Ibikorwa</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full grid-cols-5 h-14 bg-white border-2 border-purple-200 rounded-2xl p-1">
            <TabsTrigger value="all" className="text-base font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white rounded-xl">
              Byose
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="text-base font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white rounded-xl">
              Bizaza
            </TabsTrigger>
            <TabsTrigger value="ongoing" className="text-base font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-emerald-600 data-[state=active]:text-white rounded-xl">
              Biragenda
            </TabsTrigger>
            <TabsTrigger value="completed" className="text-base font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-gray-600 data-[state=active]:to-slate-600 data-[state=active]:text-white rounded-xl">
              Byarangiye
            </TabsTrigger>
            <TabsTrigger value="grading" className="text-base font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-600 data-[state=active]:to-amber-600 data-[state=active]:text-white rounded-xl">
              Amanota
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Exams Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredExams.map((exam, index) => (
              <motion.div
                key={exam.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                layout
              >
                <Card className="h-full border-2 border-purple-100 hover:border-purple-400 hover:shadow-2xl transition-all cursor-pointer group bg-white overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <Badge className="bg-purple-100 text-purple-700 font-bold mb-2">{exam.code}</Badge>
                        <CardTitle className="text-xl font-black text-gray-900 group-hover:text-purple-600 transition-colors line-clamp-2">
                          {exam.titleRw}
                        </CardTitle>
                        <CardDescription className="text-sm font-semibold text-gray-600 mt-1 line-clamp-1">
                          {exam.courseRw}
                        </CardDescription>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {getStatusBadge(exam.status)}
                      {getTypeBadge(exam.type)}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {/* Date and Time */}
                    <div className="flex items-center space-x-2 text-sm bg-purple-50 rounded-lg p-3">
                      <Calendar className="w-4 h-4 text-purple-600 flex-shrink-0" />
                      <span className="font-bold text-gray-900">{exam.date}</span>
                      <Clock className="w-4 h-4 text-purple-600 ml-2 flex-shrink-0" />
                      <span className="font-semibold text-gray-700">{exam.time}</span>
                    </div>

                    {/* Location */}
                    <div className="flex items-center space-x-2 text-sm">
                      <MapPin className="w-4 h-4 text-purple-600" />
                      <span className="font-semibold text-gray-700">Icyumba: {exam.room}</span>
                    </div>

                    {/* Instructor */}
                    <div className="flex items-center space-x-3 bg-gray-50 rounded-lg p-3">
                      <Avatar className="w-10 h-10 border-2 border-purple-200">
                        <img src={exam.instructorPhoto} alt={exam.instructor} />
                        <AvatarFallback>{exam.instructor.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">{exam.instructor}</p>
                        <p className="text-xs text-gray-600 font-semibold">Umwarimu</p>
                      </div>
                    </div>

                    {/* Marks Info */}
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-blue-50 rounded-lg p-2">
                        <p className="text-xs text-gray-600 font-semibold">Amanota</p>
                        <p className="text-lg font-black text-blue-600">{exam.totalMarks}</p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-2">
                        <p className="text-xs text-gray-600 font-semibold">Yo Kurangira</p>
                        <p className="text-lg font-black text-green-600">{exam.passingMarks}</p>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-2">
                        <p className="text-xs text-gray-600 font-semibold">Abanyeshuri</p>
                        <p className="text-lg font-black text-purple-600">{exam.studentsEnrolled}</p>
                      </div>
                    </div>

                    {/* Duration */}
                    <div className="flex items-center justify-between bg-gradient-to-r from-purple-100 to-indigo-100 rounded-lg p-3">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-purple-700" />
                        <span className="text-sm font-bold text-purple-900">Igihe: {exam.duration} iminota</span>
                      </div>
                    </div>

                    {/* View Details Button */}
                    <Button 
                      onClick={() => setSelectedExam(exam)}
                      className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold shadow-lg group"
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

        {/* Empty State */}
        {filteredExams.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 bg-white rounded-3xl shadow-lg border-2 border-purple-100"
          >
            <FileText className="w-20 h-20 text-purple-300 mx-auto mb-4" />
            <h3 className="text-2xl font-black text-gray-900 mb-2">Nta Bizamini Byabonetse</h3>
            <p className="text-gray-600 font-semibold">Gerageza guhindura inyishindu zawe zo gushakisha</p>
          </motion.div>
        )}

        {/* Exam Detail Dialog */}
        <Dialog open={!!selectedExam} onOpenChange={() => setSelectedExam(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {selectedExam && (
              <>
                <DialogHeader>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <Badge className="bg-purple-100 text-purple-700 font-bold mb-2">{selectedExam.code}</Badge>
                      <DialogTitle className="text-3xl font-black text-gray-900 mb-2">
                        {selectedExam.titleRw}
                      </DialogTitle>
                      <DialogDescription className="text-lg font-semibold text-gray-600">
                        {selectedExam.courseRw}
                      </DialogDescription>
                    </div>
                    <div className="flex flex-col gap-2">
                      {getStatusBadge(selectedExam.status)}
                      {getTypeBadge(selectedExam.type)}
                    </div>
                  </div>
                </DialogHeader>

                <ScrollArea className="max-h-[60vh]">
                  <div className="space-y-6">
                    {/* Key Information Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl p-4 border-2 border-purple-200">
                        <Calendar className="w-6 h-6 text-purple-600 mb-2" />
                        <p className="text-xs font-semibold text-gray-600">Itariki</p>
                        <p className="text-sm font-black text-gray-900">{selectedExam.date}</p>
                      </div>
                      <div className="bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl p-4 border-2 border-blue-200">
                        <Clock className="w-6 h-6 text-blue-600 mb-2" />
                        <p className="text-xs font-semibold text-gray-600">Igihe</p>
                        <p className="text-sm font-black text-gray-900">{selectedExam.time}</p>
                      </div>
                      <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl p-4 border-2 border-green-200">
                        <MapPin className="w-6 h-6 text-green-600 mb-2" />
                        <p className="text-xs font-semibold text-gray-600">Icyumba</p>
                        <p className="text-sm font-black text-gray-900">{selectedExam.room}</p>
                      </div>
                      <div className="bg-gradient-to-br from-orange-100 to-amber-100 rounded-xl p-4 border-2 border-orange-200">
                        <Clock className="w-6 h-6 text-orange-600 mb-2" />
                        <p className="text-xs font-semibold text-gray-600">Igihe</p>
                        <p className="text-sm font-black text-gray-900">{selectedExam.duration} min</p>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="bg-purple-50 rounded-xl p-6 border-2 border-purple-200">
                      <h4 className="text-lg font-black text-gray-900 mb-3 flex items-center">
                        <FileText className="w-5 h-5 mr-2 text-purple-600" />
                        Ibisobanuro
                      </h4>
                      <p className="text-gray-700 font-semibold leading-relaxed">{selectedExam.descriptionRw}</p>
                    </div>

                    {/* Topics Covered */}
                    <div className="bg-white rounded-xl p-6 border-2 border-purple-200">
                      <h4 className="text-lg font-black text-gray-900 mb-4 flex items-center">
                        <BookOpen className="w-5 h-5 mr-2 text-purple-600" />
                        Ingingo Zizasuzumwa
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {selectedExam.topicsRw.map((topic, index) => (
                          <div key={index} className="flex items-start space-x-3 bg-purple-50 rounded-lg p-3">
                            <CheckCircle2 className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                            <span className="text-sm font-semibold text-gray-800">{topic}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Instructor Info */}
                    <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-6 border-2 border-gray-200">
                      <h4 className="text-lg font-black text-gray-900 mb-4 flex items-center">
                        <User className="w-5 h-5 mr-2 text-gray-600" />
                        Umwarimu
                      </h4>
                      <div className="flex items-center space-x-4">
                        <Avatar className="w-16 h-16 border-4 border-purple-200">
                          <img src={selectedExam.instructorPhoto} alt={selectedExam.instructor} />
                          <AvatarFallback>{selectedExam.instructor.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-xl font-black text-gray-900">{selectedExam.instructor}</p>
                          <p className="text-sm text-gray-600 font-semibold">{selectedExam.level}</p>
                        </div>
                      </div>
                    </div>

                    {/* Marks Information */}
                    <div className="bg-white rounded-xl p-6 border-2 border-purple-200">
                      <h4 className="text-lg font-black text-gray-900 mb-4 flex items-center">
                        <Award className="w-5 h-5 mr-2 text-purple-600" />
                        Amakuru y'Amanota
                      </h4>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
                          <p className="text-sm text-gray-600 font-semibold mb-1">Amanota Yose</p>
                          <p className="text-3xl font-black text-blue-600">{selectedExam.totalMarks}</p>
                        </div>
                        <div className="text-center bg-green-50 rounded-xl p-4 border-2 border-green-200">
                          <p className="text-sm text-gray-600 font-semibold mb-1">Yo Kurangira</p>
                          <p className="text-3xl font-black text-green-600">{selectedExam.passingMarks}</p>
                        </div>
                        <div className="text-center bg-purple-50 rounded-xl p-4 border-2 border-purple-200">
                          <p className="text-sm text-gray-600 font-semibold mb-1">Ijanisha (%)</p>
                          <p className="text-3xl font-black text-purple-600">
                            {Math.round((selectedExam.passingMarks / selectedExam.totalMarks) * 100)}%
                          </p>
                        </div>
                      </div>
                      <div className="mt-4">
                        <Progress 
                          value={(selectedExam.passingMarks / selectedExam.totalMarks) * 100} 
                          className="h-3 bg-gray-200"
                        />
                      </div>
                    </div>

                    {/* Exam Rules */}
                    <div className="bg-red-50 rounded-xl p-6 border-2 border-red-200">
                      <h4 className="text-lg font-black text-gray-900 mb-4 flex items-center">
                        <AlertCircle className="w-5 h-5 mr-2 text-red-600" />
                        Amategeko y'Ikizamini
                      </h4>
                      <div className="space-y-2">
                        {selectedExam.rulesRw.map((rule, index) => (
                          <div key={index} className="flex items-start space-x-3 bg-white rounded-lg p-3">
                            <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-xs font-black text-red-600">{index + 1}</span>
                            </div>
                            <span className="text-sm font-semibold text-gray-800">{rule}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Required Materials */}
                    {selectedExam.materials.length > 0 && (
                      <div className="bg-amber-50 rounded-xl p-6 border-2 border-amber-200">
                        <h4 className="text-lg font-black text-gray-900 mb-4 flex items-center">
                          <Zap className="w-5 h-5 mr-2 text-amber-600" />
                          Ibikenerwa
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {selectedExam.materials.map((material, index) => (
                            <div key={index} className="flex items-center space-x-3 bg-white rounded-lg p-3">
                              <CheckCircle2 className="w-5 h-5 text-amber-600 flex-shrink-0" />
                              <span className="text-sm font-semibold text-gray-800">{material}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3">
                      <Button className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold h-12">
                        <Bell className="w-5 h-5 mr-2" />
                        Shyira Ibutso
                      </Button>
                      <Button className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold h-12">
                        <Download className="w-5 h-5 mr-2" />
                        Kurura Amakuru
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

export default ExamsPage;
