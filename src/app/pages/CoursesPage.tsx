import React, { useState } from 'react';
import { motion } from 'motion/react';
import { BookOpen, Search, Filter, GraduationCap, Clock, Users, Star, TrendingUp, Award, CheckCircle2, Calendar, FileText, Download, Play, BookMarked, Sparkles, ChevronDown, ChevronRight, X, ArrowRight, Zap, Target, Brain, Lightbulb, Trophy } from 'lucide-react';
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

interface Course {
  id: string;
  code: string;
  title: string;
  titleRw: string;
  description: string;
  descriptionRw: string;
  trade: 'SOD' | 'BDC' | 'AUT' | 'General';
  level: string;
  duration: string;
  credits: number;
  instructor: string;
  instructorPhoto: string;
  enrolled: number;
  capacity: number;
  rating: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  prerequisites: string[];
  syllabus: {
    week: number;
    topic: string;
    topicRw: string;
    objectives: string[];
  }[];
  materials: {
    title: string;
    type: 'video' | 'pdf' | 'quiz' | 'assignment';
    duration?: string;
  }[];
  outcomes: string[];
  outcomesRw: string[];
  image: string;
  featured: boolean;
  status: 'open' | 'closed' | 'upcoming';
  startDate: string;
  schedule: {
    day: string;
    time: string;
    room: string;
  }[];
}

const CoursesPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrade, setSelectedTrade] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [enrollmentDialogOpen, setEnrollmentDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [sortBy, setSortBy] = useState('popular');

  const courses: Course[] = [
    {
      id: 'c1',
      code: 'SOD301',
      title: 'Advanced Web Development',
      titleRw: 'Iterambere ry\'Urubuga rwa Interineti',
      description: 'Master modern web development with React, Node.js, and database integration',
      descriptionRw: 'Wige gukora urubuga rwa interineti ukoresheje React, Node.js, n\'ububiko bw\'amakuru',
      trade: 'SOD',
      level: 'Level 4 SOD',
      duration: '12 ibyumweru',
      credits: 4,
      instructor: 'Dr. Alice Uwase',
      instructorPhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80',
      enrolled: 45,
      capacity: 50,
      rating: 4.9,
      difficulty: 'Advanced',
      prerequisites: ['SOD201', 'SOD202'],
      image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80',
      featured: true,
      status: 'open',
      startDate: '2024-02-01',
      syllabus: [
        {
          week: 1,
          topic: 'React Fundamentals & Hooks',
          topicRw: 'Ibanze kuri React na Hooks',
          objectives: ['Understand React components', 'Master useState and useEffect', 'Build interactive UIs']
        },
        {
          week: 2,
          topic: 'State Management with Redux',
          topicRw: 'Gucunga Imiterere na Redux',
          objectives: ['Redux architecture', 'Actions and Reducers', 'Middleware integration']
        },
        {
          week: 3,
          topic: 'Backend API Development',
          topicRw: 'Guteza imbere API y\'inyuma',
          objectives: ['Node.js server setup', 'REST API design', 'Database integration']
        },
        {
          week: 4,
          topic: 'Authentication & Security',
          topicRw: 'Kwemeza umukoresha n\'Umutekano',
          objectives: ['JWT implementation', 'Password hashing', 'Secure routes']
        },
        {
          week: 5,
          topic: 'Database Design & MongoDB',
          topicRw: 'Gushushanya Ububiko bw\'Amakuru',
          objectives: ['Schema design', 'CRUD operations', 'Data relationships']
        },
        {
          week: 6,
          topic: 'Testing & Deployment',
          topicRw: 'Igerageza n\'Gushyira ku rwe',
          objectives: ['Unit testing', 'Integration tests', 'Cloud deployment']
        }
      ],
      materials: [
        { title: 'Introduction to React', type: 'video', duration: '45min' },
        { title: 'React Hooks Guide', type: 'pdf' },
        { title: 'Week 1 Quiz', type: 'quiz', duration: '20min' },
        { title: 'Build a Todo App', type: 'assignment' },
        { title: 'Redux Tutorial', type: 'video', duration: '60min' },
        { title: 'API Development', type: 'video', duration: '90min' }
      ],
      outcomes: [
        'Build full-stack web applications',
        'Implement secure authentication systems',
        'Design and optimize databases',
        'Deploy applications to cloud platforms',
        'Write clean, maintainable code',
        'Debug and test applications effectively'
      ],
      outcomesRw: [
        'Gukora porogaramu zuzuye z\'urubuga',
        'Gushyira mu bikorwa sisitemu y\'umutekano yo kwemeza abakoresha',
        'Gushushanya no kunoza ububiko bw\'amakuru',
        'Gushyira porogaramu ku biro bya interineti',
        'Kwandika kode isukuye kandi yoroshye gukurikira',
        'Gukosora no kugenzura porogaramu neza'
      ],
      schedule: [
        { day: 'Kuwa mbere', time: '08:00 - 10:00', room: 'Lab A1' },
        { day: 'Kuwa gatatu', time: '08:00 - 10:00', room: 'Lab A1' },
        { day: 'Kuwa gatanu', time: '14:00 - 16:00', room: 'Lab A2' }
      ]
    },
    {
      id: 'c2',
      code: 'BDC401',
      title: 'Structural Engineering Design',
      titleRw: 'Gushushanya Ubwubatsi bw\'Inyubako',
      description: 'Learn advanced structural design principles and construction project management',
      descriptionRw: 'Wige amahame y\'ingenzi yo gushushanya imyubakire n\'imicungire y\'imishinga',
      trade: 'BDC',
      level: 'Level 5 BDC',
      duration: '14 ibyumweru',
      credits: 5,
      instructor: 'Eng. Patrick Habimana',
      instructorPhoto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80',
      enrolled: 38,
      capacity: 40,
      rating: 4.8,
      difficulty: 'Advanced',
      prerequisites: ['BDC301', 'BDC302'],
      image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&q=80',
      featured: true,
      status: 'open',
      startDate: '2024-02-05',
      syllabus: [
        {
          week: 1,
          topic: 'Structural Analysis Fundamentals',
          topicRw: 'Ibanze mu gusesengura Imyubakire',
          objectives: ['Load calculations', 'Stress analysis', 'Safety factors']
        },
        {
          week: 2,
          topic: 'Concrete Design',
          topicRw: 'Gushushanya Beto',
          objectives: ['Reinforced concrete', 'Beam design', 'Column design']
        },
        {
          week: 3,
          topic: 'Steel Structures',
          topicRw: 'Imyubakire y\'Icyuma',
          objectives: ['Steel properties', 'Connection design', 'Stability analysis']
        },
        {
          week: 4,
          topic: 'Foundation Design',
          topicRw: 'Gushushanya Urufatiro',
          objectives: ['Soil mechanics', 'Shallow foundations', 'Deep foundations']
        }
      ],
      materials: [
        { title: 'Structural Principles', type: 'video', duration: '50min' },
        { title: 'Concrete Design Manual', type: 'pdf' },
        { title: 'Design Calculations', type: 'assignment' },
        { title: 'Steel Structures Guide', type: 'pdf' }
      ],
      outcomes: [
        'Design safe and efficient structures',
        'Perform structural analysis',
        'Select appropriate construction materials',
        'Create detailed construction drawings',
        'Estimate project costs accurately'
      ],
      outcomesRw: [
        'Gushushanya inyubako ziteje akaga kandi zinoze',
        'Gusesengura imiterere y\'inyubako',
        'Guhitamo ibikoresho by\'ubwubatsi bikwiye',
        'Gukora ibishushanyo birambuye by\'ubwubatsi',
        'Kugereranya ikiguzi cy\'umushinga neza'
      ],
      schedule: [
        { day: 'Kuwa kabiri', time: '09:00 - 12:00', room: 'Workshop 1' },
        { day: 'Kuwa kane', time: '09:00 - 12:00', room: 'Workshop 1' }
      ]
    },
    {
      id: 'c3',
      code: 'AUT501',
      title: 'Electric Vehicle Technology',
      titleRw: 'Ikoranabuhanga ry\'Imodoka za Eleletrike',
      description: 'Master EV systems, battery technology, and electric motor diagnostics',
      descriptionRw: 'Wige sisitemu z\'imodoka za eleletrike, ikoranabuhanga ry\'batiri, n\'ugusuzuma moteri',
      trade: 'AUT',
      level: 'Level 5A AUT',
      duration: '10 ibyumweru',
      credits: 4,
      instructor: 'Ms. Claire Uwera',
      instructorPhoto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80',
      enrolled: 32,
      capacity: 35,
      rating: 4.9,
      difficulty: 'Advanced',
      prerequisites: ['AUT401', 'AUT402'],
      image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800&q=80',
      featured: true,
      status: 'open',
      startDate: '2024-02-10',
      syllabus: [
        {
          week: 1,
          topic: 'EV Fundamentals',
          topicRw: 'Ibanze ku Modoka za Eleletrike',
          objectives: ['EV components', 'Battery types', 'Power electronics']
        },
        {
          week: 2,
          topic: 'Battery Management Systems',
          topicRw: 'Sisitemu zo Gucunga Batiri',
          objectives: ['BMS architecture', 'Cell balancing', 'Thermal management']
        },
        {
          week: 3,
          topic: 'Electric Motors & Controllers',
          topicRw: 'Moteri z\'Eleletrike n\'Abaziyobora',
          objectives: ['Motor types', 'Controller operation', 'Regenerative braking']
        }
      ],
      materials: [
        { title: 'EV Systems Overview', type: 'video', duration: '40min' },
        { title: 'Battery Technology Guide', type: 'pdf' },
        { title: 'Diagnostics Lab', type: 'assignment' },
        { title: 'Motor Control Theory', type: 'video', duration: '55min' }
      ],
      outcomes: [
        'Diagnose EV electrical systems',
        'Service battery packs safely',
        'Repair electric motors',
        'Understand charging infrastructure',
        'Perform software updates'
      ],
      outcomesRw: [
        'Gusuzuma sisitemu z\'eleletrike ku modoka',
        'Gukora kuri batiri mu mutekano',
        'Gusana moteri z\'eleletrike',
        'Gusobanukirwa ibikorwa remezo byo gushaja imodoka',
        'Gukora amakurum\'amakuru kuri software'
      ],
      schedule: [
        { day: 'Kuwa mbere', time: '13:00 - 16:00', room: 'Auto Lab 2' },
        { day: 'Kuwa kane', time: '13:00 - 16:00', room: 'Auto Lab 2' }
      ]
    },
    {
      id: 'c4',
      code: 'GEN101',
      title: 'Mathematics for Technical Studies',
      titleRw: 'Imibare mu Masomo ya Tekiniki',
      description: 'Essential mathematics skills for all technical programs',
      descriptionRw: 'Ubumenyi bw\'imibare bukenewe mu mahugurwa yose ya tekiniki',
      trade: 'General',
      level: 'Level 3',
      duration: '8 ibyumweru',
      credits: 3,
      instructor: 'Mr. Jean Baptiste Nkusi',
      instructorPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
      enrolled: 120,
      capacity: 150,
      rating: 4.7,
      difficulty: 'Beginner',
      prerequisites: [],
      image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80',
      featured: false,
      status: 'open',
      startDate: '2024-02-01',
      syllabus: [
        {
          week: 1,
          topic: 'Algebra Basics',
          topicRw: 'Ibanze mu Mibare y\'Algebra',
          objectives: ['Equations', 'Inequalities', 'Functions']
        },
        {
          week: 2,
          topic: 'Geometry',
          topicRw: 'Geometeriya',
          objectives: ['Shapes', 'Areas', 'Volumes']
        }
      ],
      materials: [
        { title: 'Algebra Introduction', type: 'video', duration: '30min' },
        { title: 'Practice Problems', type: 'pdf' },
        { title: 'Weekly Quiz', type: 'quiz', duration: '15min' }
      ],
      outcomes: [
        'Solve algebraic equations',
        'Calculate areas and volumes',
        'Apply math to technical problems',
        'Use trigonometry basics'
      ],
      outcomesRw: [
        'Gukemura ibibazo by\'imibare y\'Algebra',
        'Kubara ubuso n\'igipimo',
        'Gukoresha imibare mu bibazo bya tekiniki',
        'Gukoresha ibanze bya trigonometrie'
      ],
      schedule: [
        { day: 'Kuwa mbere', time: '10:00 - 11:30', room: 'Room 201' },
        { day: 'Kuwa gatanu', time: '10:00 - 11:30', room: 'Room 201' }
      ]
    },
    {
      id: 'c5',
      code: 'SOD201',
      title: 'Database Management Systems',
      titleRw: 'Sisitemu zo Gucunga Ububiko bw\'Amakuru',
      description: 'Learn SQL, database design, and data management principles',
      descriptionRw: 'Wige SQL, gushushanya ububiko bw\'amakuru, n\'amahame yo kuyacunga',
      trade: 'SOD',
      level: 'Level 3 SOD',
      duration: '10 ibyumweru',
      credits: 4,
      instructor: 'Ms. Grace Mukamana',
      instructorPhoto: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80',
      enrolled: 42,
      capacity: 50,
      rating: 4.8,
      difficulty: 'Intermediate',
      prerequisites: ['GEN101'],
      image: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&q=80',
      featured: false,
      status: 'open',
      startDate: '2024-02-05',
      syllabus: [
        {
          week: 1,
          topic: 'Database Fundamentals',
          topicRw: 'Ibanze ku Bubiko bw\'Amakuru',
          objectives: ['Database concepts', 'DBMS types', 'Data models']
        },
        {
          week: 2,
          topic: 'SQL Basics',
          topicRw: 'Ibanze kuri SQL',
          objectives: ['SELECT queries', 'INSERT/UPDATE/DELETE', 'Filtering data']
        },
        {
          week: 3,
          topic: 'Database Design',
          topicRw: 'Gushushanya Ububiko',
          objectives: ['Normalization', 'ER diagrams', 'Relationships']
        }
      ],
      materials: [
        { title: 'SQL Tutorial', type: 'video', duration: '45min' },
        { title: 'Database Design Guide', type: 'pdf' },
        { title: 'Practice Queries', type: 'assignment' }
      ],
      outcomes: [
        'Write complex SQL queries',
        'Design normalized databases',
        'Optimize database performance',
        'Implement data security'
      ],
      outcomesRw: [
        'Kwandika ibibazo bigoye bya SQL',
        'Gushushanya ububiko bw\'amakuru bw\'ibanze',
        'Kunoza imikorere y\'ububiko',
        'Gushyira mu bikorwa umutekano w\'amakuru'
      ],
      schedule: [
        { day: 'Kuwa kabiri', time: '14:00 - 16:00', room: 'Lab A3' },
        { day: 'Kuwa kane', time: '14:00 - 16:00', room: 'Lab A3' }
      ]
    },
    {
      id: 'c6',
      code: 'BDC301',
      title: 'Construction Project Management',
      titleRw: 'Imicungire y\'Imishinga y\'Ubwubatsi',
      description: 'Master project planning, cost estimation, and site management',
      descriptionRw: 'Wige gutegura imishinga, kugereranya ikiguzi, n\'imicungire y\'urubuga',
      trade: 'BDC',
      level: 'Level 4 BDC',
      duration: '12 ibyumweru',
      credits: 4,
      instructor: 'Mr. Emmanuel Kayitare',
      instructorPhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80',
      enrolled: 35,
      capacity: 40,
      rating: 4.7,
      difficulty: 'Intermediate',
      prerequisites: ['BDC201'],
      image: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&q=80',
      featured: false,
      status: 'open',
      startDate: '2024-02-08',
      syllabus: [
        {
          week: 1,
          topic: 'Project Planning',
          topicRw: 'Gutegura Umushinga',
          objectives: ['Work breakdown', 'Scheduling', 'Resource planning']
        },
        {
          week: 2,
          topic: 'Cost Estimation',
          topicRw: 'Kugereranya Ikiguzi',
          objectives: ['Material costs', 'Labor costs', 'Budgeting']
        }
      ],
      materials: [
        { title: 'Project Management Basics', type: 'video', duration: '50min' },
        { title: 'Estimation Handbook', type: 'pdf' },
        { title: 'Case Study Analysis', type: 'assignment' }
      ],
      outcomes: [
        'Create project schedules',
        'Estimate construction costs',
        'Manage construction teams',
        'Control project quality'
      ],
      outcomesRw: [
        'Gukora gahunda y\'umushinga',
        'Kugereranya ikiguzi cy\'ubwubatsi',
        'Kuyobora amakipe y\'ubwubatsi',
        'Kugenzura ireme ry\'umushinga'
      ],
      schedule: [
        { day: 'Kuwa gatatu', time: '08:00 - 10:30', room: 'Room 301' },
        { day: 'Kuwa gatanu', time: '08:00 - 10:30', room: 'Room 301' }
      ]
    }
  ];

  const filteredCourses = courses.filter(course => {
    const matchesSearch = 
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.titleRw.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTrade = selectedTrade === 'all' || course.trade === selectedTrade;
    const matchesLevel = selectedLevel === 'all' || course.level.includes(selectedLevel);
    const matchesDifficulty = selectedDifficulty === 'all' || course.difficulty === selectedDifficulty;
    const matchesTab = 
      activeTab === 'all' ||
      (activeTab === 'featured' && course.featured) ||
      (activeTab === 'open' && course.status === 'open') ||
      (activeTab === 'upcoming' && course.status === 'upcoming');

    return matchesSearch && matchesTrade && matchesLevel && matchesDifficulty && matchesTab;
  });

  const sortedCourses = [...filteredCourses].sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return b.enrolled - a.enrolled;
      case 'rating':
        return b.rating - a.rating;
      case 'newest':
        return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
      case 'title':
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  const stats = [
    { label: 'Amasomo Yose', labelEn: 'Total Courses', value: courses.length, icon: BookOpen, color: 'from-blue-500 to-indigo-500' },
    { label: 'Abanyeshuri', labelEn: 'Total Students', value: courses.reduce((sum, c) => sum + c.enrolled, 0), icon: Users, color: 'from-green-500 to-emerald-500' },
    { label: 'Abarimu', labelEn: 'Instructors', value: new Set(courses.map(c => c.instructor)).size, icon: GraduationCap, color: 'from-purple-500 to-pink-500' },
    { label: 'Ikiciro cy\'Hejuru', labelEn: 'Avg Rating', value: (courses.reduce((sum, c) => sum + c.rating, 0) / courses.length).toFixed(1), icon: Star, color: 'from-yellow-500 to-orange-500' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <Badge className="mb-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 text-lg">
            <BookOpen className="w-5 h-5 mr-2" />
            Amasomo Atangwa
          </Badge>
          <h1 className="text-5xl md:text-7xl font-black mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            IBANZE RY\'AMASOMO
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-8">
            Hitamo amasomo akomeye azagufasha gushyira mu bikorwa ubumenyi bwawe bw\'ikoranabuhanga
          </p>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100"
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mx-auto mb-3`}>
                  <stat.icon className="w-7 h-7 text-white" />
                </div>
                <p className="text-3xl font-black text-gray-900 mb-1">{stat.value}</p>
                <p className="text-sm font-semibold text-gray-600">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl shadow-2xl border-2 border-blue-100 p-6 md:p-8 mb-8"
        >
          <div className="flex items-center space-x-3 mb-6">
            <Search className="w-6 h-6 text-blue-600" />
            <h3 className="text-2xl font-black text-gray-900">Shakisha Isomo</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2">
              <Input
                placeholder="Shakisha izina ry'isomo, kode, umwarimu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-12 text-lg border-2 border-blue-200 focus:border-blue-500"
              />
            </div>

            <Select value={selectedTrade} onValueChange={setSelectedTrade}>
              <SelectTrigger className="h-12 border-2 border-blue-200">
                <SelectValue placeholder="Hitamo Ihugurwa" />
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

            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger className="h-12 border-2 border-blue-200">
                <SelectValue placeholder="Uburemere" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Byose</SelectItem>
                <SelectItem value="Beginner">Beginner</SelectItem>
                <SelectItem value="Intermediate">Intermediate</SelectItem>
                <SelectItem value="Advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between mt-6 flex-wrap gap-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
              <TabsList className="grid grid-cols-4 w-full md:w-auto">
                <TabsTrigger value="all">Byose</TabsTrigger>
                <TabsTrigger value="featured">Bizwi</TabsTrigger>
                <TabsTrigger value="open">Bifunguye</TabsTrigger>
                <TabsTrigger value="upcoming">Bizaza</TabsTrigger>
              </TabsList>
            </Tabs>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-48 border-2 border-blue-200">
                <SelectValue placeholder="Shiraho" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">Bizwi Cyane</SelectItem>
                <SelectItem value="rating">Ikiciro cy\'Hejuru</SelectItem>
                <SelectItem value="newest">Bishya</SelectItem>
                <SelectItem value="title">Izina</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600 text-lg">
            Byaboniwe: <span className="font-black text-blue-600">{sortedCourses.length}</span> amasomo
          </p>
        </div>

        {/* Courses Grid */}
        {sortedCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedCourses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedCourse(course)}
                className="group cursor-pointer"
              >
                <Card className="h-full border-2 border-gray-100 hover:border-blue-400 hover:shadow-2xl transition-all overflow-hidden">
                  {/* Course Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={course.image} 
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    {course.featured && (
                      <Badge className="absolute top-3 right-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Icyamamare
                      </Badge>
                    )}
                    <div className="absolute bottom-3 left-3 right-3">
                      <Badge className="mb-2 bg-blue-600 text-white">{course.code}</Badge>
                      <Progress 
                        value={(course.enrolled / course.capacity) * 100} 
                        className="h-2 bg-white/30"
                      />
                    </div>
                  </div>

                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <CardTitle className="text-xl font-black group-hover:text-blue-600 transition-colors line-clamp-2">
                          {course.titleRw}
                        </CardTitle>
                        <p className="text-sm text-gray-500 mt-1">{course.title}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 mt-2">
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-bold text-sm">{course.rating}</span>
                      </div>
                      <Separator orientation="vertical" className="h-4" />
                      <div className="flex items-center space-x-1 text-sm text-gray-600">
                        <Users className="w-4 h-4" />
                        <span>{course.enrolled}/{course.capacity}</span>
                      </div>
                      <Separator orientation="vertical" className="h-4" />
                      <Badge variant="outline" className="text-xs">
                        {course.difficulty}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.descriptionRw}</p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <GraduationCap className="w-4 h-4 mr-2 text-purple-600" />
                        <span className="font-semibold">{course.instructor}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-2 text-green-600" />
                        <span>{course.duration}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Award className="w-4 h-4 mr-2 text-orange-600" />
                        <span>{course.credits} Credits</span>
                      </div>
                    </div>

                    <Button 
                      className="w-full group-hover:bg-blue-700 bg-blue-600 text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCourse(course);
                      }}
                    >
                      Reba Amakuru
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="bg-white rounded-3xl p-12 shadow-xl border-2 border-gray-100 inline-block">
              <BookMarked className="w-20 h-20 text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-black text-gray-900 mb-2">Nta somo ryabonetse</h3>
              <p className="text-gray-600">Gerageza guhindura ibyo ushakisha cyangwa akayunguruzo</p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Course Detail Dialog */}
      <Dialog open={!!selectedCourse} onOpenChange={() => setSelectedCourse(null)}>
        <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden p-0">
          {selectedCourse && (
            <ScrollArea className="h-[95vh]">
              {/* Hero Image */}
              <div className="relative h-80 overflow-hidden">
                <img 
                  src={selectedCourse.image} 
                  alt={selectedCourse.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <Badge className="mb-3 bg-blue-600 text-white text-lg px-4 py-2">
                    {selectedCourse.code}
                  </Badge>
                  <h2 className="text-4xl md:text-5xl font-black text-white mb-2">
                    {selectedCourse.titleRw}
                  </h2>
                  <p className="text-xl text-blue-200">{selectedCourse.title}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white"
                  onClick={() => setSelectedCourse(null)}
                >
                  <X className="w-6 h-6" />
                </Button>
              </div>

              <div className="p-8">
                {/* Course Info Bar */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center border-2 border-blue-200">
                    <Star className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
                    <p className="text-2xl font-black text-gray-900">{selectedCourse.rating}</p>
                    <p className="text-xs text-gray-600 font-semibold">Ikiciro</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 text-center border-2 border-green-200">
                    <Users className="w-6 h-6 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-black text-gray-900">{selectedCourse.enrolled}</p>
                    <p className="text-xs text-gray-600 font-semibold">Abanyeshuri</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 text-center border-2 border-purple-200">
                    <Clock className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                    <p className="text-2xl font-black text-gray-900">{selectedCourse.duration}</p>
                    <p className="text-xs text-gray-600 font-semibold">Igihe</p>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 text-center border-2 border-orange-200">
                    <Award className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                    <p className="text-2xl font-black text-gray-900">{selectedCourse.credits}</p>
                    <p className="text-xs text-gray-600 font-semibold">Credits</p>
                  </div>
                  <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl p-4 text-center border-2 border-pink-200">
                    <Target className="w-6 h-6 text-pink-600 mx-auto mb-2" />
                    <p className="text-sm font-black text-gray-900">{selectedCourse.difficulty}</p>
                    <p className="text-xs text-gray-600 font-semibold">Urwego</p>
                  </div>
                </div>

                {/* Instructor Card */}
                <Card className="mb-8 border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-white">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <Avatar className="w-20 h-20 border-4 border-white shadow-lg">
                        <img src={selectedCourse.instructorPhoto} alt={selectedCourse.instructor} />
                        <AvatarFallback>{selectedCourse.instructor[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-blue-600 mb-1">UMWARIMU</p>
                        <h4 className="text-2xl font-black text-gray-900">{selectedCourse.instructor}</h4>
                        <p className="text-gray-600">{selectedCourse.trade} Department</p>
                      </div>
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        <Mail className="w-4 h-4 mr-2" />
                        Muhereze
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Tabs */}
                <Tabs defaultValue="overview" className="mb-8">
                  <TabsList className="grid w-full grid-cols-4 h-14 bg-gray-100 rounded-2xl p-1">
                    <TabsTrigger value="overview" className="rounded-xl text-base font-bold">Incamake</TabsTrigger>
                    <TabsTrigger value="syllabus" className="rounded-xl text-base font-bold">Gahunda</TabsTrigger>
                    <TabsTrigger value="materials" className="rounded-xl text-base font-bold">Ibikoresho</TabsTrigger>
                    <TabsTrigger value="schedule" className="rounded-xl text-base font-bold">Igihe</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="mt-6">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-2xl font-black text-gray-900 mb-4 flex items-center">
                          <BookOpen className="w-6 h-6 mr-2 text-blue-600" />
                          Ibisobanuro by\'Isomo
                        </h3>
                        <p className="text-lg text-gray-700 leading-relaxed mb-4">{selectedCourse.descriptionRw}</p>
                        <p className="text-gray-600 leading-relaxed">{selectedCourse.description}</p>
                      </div>

                      <Separator />

                      <div>
                        <h3 className="text-2xl font-black text-gray-900 mb-4 flex items-center">
                          <Target className="w-6 h-6 mr-2 text-green-600" />
                          Ibyo Uziga
                        </h3>
                        <div className="grid md:grid-cols-2 gap-4">
                          {selectedCourse.outcomesRw.map((outcome, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="flex items-start space-x-3 p-4 bg-green-50 rounded-xl border-2 border-green-200"
                            >
                              <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="font-bold text-gray-900">{outcome}</p>
                                <p className="text-sm text-gray-600 mt-1">{selectedCourse.outcomes[index]}</p>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      {selectedCourse.prerequisites.length > 0 && (
                        <>
                          <Separator />
                          <div>
                            <h3 className="text-2xl font-black text-gray-900 mb-4 flex items-center">
                              <Brain className="w-6 h-6 mr-2 text-purple-600" />
                              Amasomo Yabanje
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              {selectedCourse.prerequisites.map((prereq, index) => (
                                <Badge key={index} variant="outline" className="text-base px-4 py-2 border-2 border-purple-300">
                                  {prereq}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="syllabus" className="mt-6">
                    <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center">
                      <FileText className="w-6 h-6 mr-2 text-blue-600" />
                      Gahunda y\'Isomo
                    </h3>
                    <div className="space-y-4">
                      {selectedCourse.syllabus.map((week, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Card className="border-2 border-blue-100 hover:border-blue-400 transition-colors">
                            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
                              <div className="flex items-center justify-between">
                                <div>
                                  <Badge className="mb-2 bg-blue-600 text-white">Icyumweru {week.week}</Badge>
                                  <CardTitle className="text-xl">{week.topicRw}</CardTitle>
                                  <CardDescription className="text-base">{week.topic}</CardDescription>
                                </div>
                                <Lightbulb className="w-10 h-10 text-yellow-500" />
                              </div>
                            </CardHeader>
                            <CardContent className="pt-4">
                              <p className="text-sm font-semibold text-gray-600 mb-2">Intego:</p>
                              <ul className="space-y-2">
                                {week.objectives.map((obj, i) => (
                                  <li key={i} className="flex items-start space-x-2">
                                    <ChevronRight className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                    <span className="text-gray-700">{obj}</span>
                                  </li>
                                ))}
                              </ul>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="materials" className="mt-6">
                    <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center">
                      <Download className="w-6 h-6 mr-2 text-green-600" />
                      Ibikoresho by\'Isomo
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {selectedCourse.materials.map((material, index) => {
                        const iconMap = {
                          video: { icon: Play, color: 'from-red-500 to-pink-500' },
                          pdf: { icon: FileText, color: 'from-blue-500 to-indigo-500' },
                          quiz: { icon: Brain, color: 'from-purple-500 to-pink-500' },
                          assignment: { icon: CheckCircle2, color: 'from-green-500 to-emerald-500' }
                        };
                        const { icon: Icon, color } = iconMap[material.type];

                        return (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <Card className="border-2 border-gray-100 hover:border-green-400 hover:shadow-lg transition-all cursor-pointer group">
                              <CardContent className="p-6">
                                <div className="flex items-center space-x-4">
                                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                    <Icon className="w-7 h-7 text-white" />
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="font-black text-gray-900 group-hover:text-green-600 transition-colors">
                                      {material.title}
                                    </h4>
                                    <div className="flex items-center space-x-2 mt-1">
                                      <Badge variant="outline" className="text-xs capitalize">
                                        {material.type}
                                      </Badge>
                                      {material.duration && (
                                        <span className="text-sm text-gray-500">{material.duration}</span>
                                      )}
                                    </div>
                                  </div>
                                  <Button size="icon" variant="ghost" className="group-hover:bg-green-100">
                                    <Download className="w-5 h-5 text-gray-600 group-hover:text-green-600" />
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        );
                      })}
                    </div>
                  </TabsContent>

                  <TabsContent value="schedule" className="mt-6">
                    <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center">
                      <Calendar className="w-6 h-6 mr-2 text-orange-600" />
                      Gahunda y\'Amasaha
                    </h3>
                    <div className="space-y-4">
                      {selectedCourse.schedule.map((sched, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Card className="border-2 border-orange-100 bg-gradient-to-r from-orange-50 to-white">
                            <CardContent className="p-6">
                              <div className="grid grid-cols-3 gap-4 items-center">
                                <div>
                                  <p className="text-sm font-semibold text-gray-600">Umunsi</p>
                                  <p className="text-xl font-black text-gray-900">{sched.day}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-gray-600">Igihe</p>
                                  <p className="text-xl font-black text-gray-900">{sched.time}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-gray-600">Icyumba</p>
                                  <p className="text-xl font-black text-gray-900">{sched.room}</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Enrollment Section */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 text-white">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex-1">
                      <h3 className="text-3xl font-black mb-2">Iyandikishe kuri iri somo</h3>
                      <p className="text-blue-100 text-lg">
                        Ahari imyanya: <span className="font-black">{selectedCourse.capacity - selectedCourse.enrolled}</span> / {selectedCourse.capacity}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-blue-100 text-sm">Itangiriro</p>
                        <p className="text-2xl font-black">{new Date(selectedCourse.startDate).toLocaleDateString('rw-RW')}</p>
                      </div>
                      <Button 
                        size="lg"
                        className="bg-white text-blue-600 hover:bg-blue-50 font-black text-lg px-8"
                        onClick={() => {
                          setEnrollmentDialogOpen(true);
                        }}
                      >
                        <Trophy className="w-5 h-5 mr-2" />
                        Iyandikishe Nonaha
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

      {/* Enrollment Confirmation Dialog */}
      <Dialog open={enrollmentDialogOpen} onOpenChange={setEnrollmentDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black flex items-center">
              <Trophy className="w-6 h-6 mr-2 text-yellow-500" />
              Kwemeza Kwiyandikisha
            </DialogTitle>
            <DialogDescription>
              Ushaka rwose kwiyandikisha kuri iri somo?
            </DialogDescription>
          </DialogHeader>
          {selectedCourse && (
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 border-2 border-blue-200">
                <p className="text-sm font-semibold text-gray-600 mb-2">Isomo</p>
                <p className="text-lg font-black text-gray-900">{selectedCourse.titleRw}</p>
                <p className="text-sm text-gray-600">{selectedCourse.code}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white border-2 border-gray-200 rounded-xl p-4">
                  <p className="text-xs font-semibold text-gray-600 mb-1">Umwarimu</p>
                  <p className="font-bold text-gray-900">{selectedCourse.instructor}</p>
                </div>
                <div className="bg-white border-2 border-gray-200 rounded-xl p-4">
                  <p className="text-xs font-semibold text-gray-600 mb-1">Itangiriro</p>
                  <p className="font-bold text-gray-900">{new Date(selectedCourse.startDate).toLocaleDateString('rw-RW')}</p>
                </div>
              </div>
              <div className="flex space-x-3">
                <Button variant="outline" className="flex-1" onClick={() => setEnrollmentDialogOpen(false)}>
                  Hagarika
                </Button>
                <Button className="flex-1 bg-green-600 hover:bg-green-700">
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  Emeza
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CoursesPage;
