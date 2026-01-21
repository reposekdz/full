import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Clock, Filter, Search, ChevronLeft, ChevronRight, Download, Print, Users, BookOpen, MapPin, Bell, AlertCircle, CheckCircle2, Star, Award, Zap, TrendingUp, GraduationCap, User, Building } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { Separator } from '@/app/components/ui/separator';
import { Progress } from '@/app/components/ui/progress';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';

interface TimeSlot {
  id: string;
  day: string;
  dayRw: string;
  time: string;
  subject: string;
  subjectRw: string;
  teacher: string;
  teacherPhoto: string;
  room: string;
  level: string;
  trade: 'SOD' | 'BDC' | 'AUT' | 'General';
  code: string;
  type: 'theory' | 'practical' | 'lab' | 'workshop';
  duration: number;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  description: string;
  descriptionRw: string;
}

const TimetablePage: React.FC = () => {
  const [selectedWeek, setSelectedWeek] = useState(0);
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedTrade, setSelectedTrade] = useState<string>('all');
  const [selectedDay, setSelectedDay] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [viewMode, setViewMode] = useState<'week' | 'day' | 'list'>('week');

  const weekDays = [
    { en: 'Monday', rw: 'Kuwa mbere', short: 'Kw2' },
    { en: 'Tuesday', rw: 'Kuwa kabiri', short: 'Kw3' },
    { en: 'Wednesday', rw: 'Kuwa gatatu', short: 'Kw4' },
    { en: 'Thursday', rw: 'Kuwa kane', short: 'Kw5' },
    { en: 'Friday', rw: 'Kuwa gatanu', short: 'Kw6' }
  ];

  const timeSlots: TimeSlot[] = [
    {
      id: '1',
      day: 'Monday',
      dayRw: 'Kuwa mbere',
      time: '08:00 - 10:00',
      subject: 'Advanced Web Development',
      subjectRw: 'Iterambere ry\'Urubuga',
      teacher: 'Dr. Alice Uwase',
      teacherPhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80',
      room: 'Lab A1',
      level: 'Level 4 SOD',
      trade: 'SOD',
      code: 'SOD301',
      type: 'lab',
      duration: 120,
      status: 'scheduled',
      description: 'Hands-on web development with React and Node.js',
      descriptionRw: 'Gukora urubuga ukoresheje React na Node.js'
    },
    {
      id: '2',
      day: 'Monday',
      dayRw: 'Kuwa mbere',
      time: '10:00 - 12:00',
      subject: 'Database Management',
      subjectRw: 'Gucunga Ububiko bw\'Amakuru',
      teacher: 'Ms. Grace Mukamana',
      teacherPhoto: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80',
      room: 'Lab A2',
      level: 'Level 3 SOD',
      trade: 'SOD',
      code: 'SOD201',
      type: 'theory',
      duration: 120,
      status: 'scheduled',
      description: 'SQL and database design principles',
      descriptionRw: 'SQL n\'amahame yo gushushanya ububiko'
    },
    {
      id: '3',
      day: 'Monday',
      dayRw: 'Kuwa mbere',
      time: '13:00 - 16:00',
      subject: 'Structural Engineering',
      subjectRw: 'Ubwubatsi bw\'Imyubakire',
      teacher: 'Eng. Patrick Habimana',
      teacherPhoto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80',
      room: 'Workshop 1',
      level: 'Level 5 BDC',
      trade: 'BDC',
      code: 'BDC401',
      type: 'practical',
      duration: 180,
      status: 'scheduled',
      description: 'Advanced structural design and analysis',
      descriptionRw: 'Gushushanya no gusesengura imyubakire'
    },
    {
      id: '4',
      day: 'Tuesday',
      dayRw: 'Kuwa kabiri',
      time: '08:00 - 10:00',
      subject: 'Electric Vehicle Technology',
      subjectRw: 'Imodoka za Eleletrike',
      teacher: 'Ms. Claire Uwera',
      teacherPhoto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80',
      room: 'Auto Lab 2',
      level: 'Level 5A AUT',
      trade: 'AUT',
      code: 'AUT501',
      type: 'lab',
      duration: 120,
      status: 'scheduled',
      description: 'EV battery systems and diagnostics',
      descriptionRw: 'Sisitemu za batiri n\'ugusuzuma'
    },
    {
      id: '5',
      day: 'Tuesday',
      dayRw: 'Kuwa kabiri',
      time: '10:00 - 12:00',
      subject: 'Mathematics for Technical Studies',
      subjectRw: 'Imibare mu Masomo ya Tekiniki',
      teacher: 'Mr. Jean Baptiste Nkusi',
      teacherPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
      room: 'Room 201',
      level: 'Level 3',
      trade: 'General',
      code: 'GEN101',
      type: 'theory',
      duration: 120,
      status: 'scheduled',
      description: 'Essential mathematics for technical programs',
      descriptionRw: 'Imibare y\'ibanze mu mahugurwa ya tekiniki'
    },
    {
      id: '6',
      day: 'Tuesday',
      dayRw: 'Kuwa kabiri',
      time: '14:00 - 16:00',
      subject: 'Construction Project Management',
      subjectRw: 'Imicungire y\'Imishinga',
      teacher: 'Mr. Emmanuel Kayitare',
      teacherPhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80',
      room: 'Room 301',
      level: 'Level 4 BDC',
      trade: 'BDC',
      code: 'BDC301',
      type: 'theory',
      duration: 120,
      status: 'scheduled',
      description: 'Project planning and cost estimation',
      descriptionRw: 'Gutegura imishinga no kugereranya ikiguzi'
    },
    {
      id: '7',
      day: 'Wednesday',
      dayRw: 'Kuwa gatatu',
      time: '08:00 - 10:00',
      subject: 'Mobile App Development',
      subjectRw: 'Guteza imbere Porogaramu za Telefoni',
      teacher: 'Mr. Jean Baptiste Nkusi',
      teacherPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
      room: 'Lab A3',
      level: 'Level 4 SOD',
      trade: 'SOD',
      code: 'SOD302',
      type: 'lab',
      duration: 120,
      status: 'scheduled',
      description: 'Build native mobile applications',
      descriptionRw: 'Gukora porogaramu za telefoni'
    },
    {
      id: '8',
      day: 'Wednesday',
      dayRw: 'Kuwa gatatu',
      time: '10:00 - 12:00',
      subject: 'AutoCAD Design',
      subjectRw: 'Gushushanya na AutoCAD',
      teacher: 'Mr. Emmanuel Kayitare',
      teacherPhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80',
      room: 'Design Lab',
      level: 'Level 4 BDC',
      trade: 'BDC',
      code: 'BDC302',
      type: 'practical',
      duration: 120,
      status: 'scheduled',
      description: 'Technical drawing with AutoCAD software',
      descriptionRw: 'Gushushanya na porogaramu ya AutoCAD'
    },
    {
      id: '9',
      day: 'Wednesday',
      dayRw: 'Kuwa gatatu',
      time: '13:00 - 16:00',
      subject: 'Engine Diagnostics',
      subjectRw: 'Gusuzuma Moteri',
      teacher: 'Eng. David Mugabo',
      teacherPhoto: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80',
      room: 'Auto Lab 1',
      level: 'Level 4A AUT',
      trade: 'AUT',
      code: 'AUT401',
      type: 'workshop',
      duration: 180,
      status: 'scheduled',
      description: 'Advanced engine troubleshooting',
      descriptionRw: 'Gukemura ibibazo kuri moteri'
    },
    {
      id: '10',
      day: 'Thursday',
      dayRw: 'Kuwa kane',
      time: '08:00 - 10:00',
      subject: 'Cloud Computing',
      subjectRw: 'Ikoranabuhanga rya Cloud',
      teacher: 'Dr. Alice Uwase',
      teacherPhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80',
      room: 'Lab A1',
      level: 'Level 5 SOD',
      trade: 'SOD',
      code: 'SOD501',
      type: 'lab',
      duration: 120,
      status: 'scheduled',
      description: 'AWS and Azure cloud platforms',
      descriptionRw: 'Amahuriro ya Cloud AWS na Azure'
    },
    {
      id: '11',
      day: 'Thursday',
      dayRw: 'Kuwa kane',
      time: '10:00 - 13:00',
      subject: 'Building Safety Standards',
      subjectRw: 'Ibipimo by\'Umutekano mu Bwubatsi',
      teacher: 'Ms. Sarah Umutoni',
      teacherPhoto: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&q=80',
      room: 'Workshop 2',
      level: 'Level 3 BDC',
      trade: 'BDC',
      code: 'BDC201',
      type: 'practical',
      duration: 180,
      status: 'scheduled',
      description: 'Construction safety and regulations',
      descriptionRw: 'Umutekano n\'amategeko mu bwubatsi'
    },
    {
      id: '12',
      day: 'Thursday',
      dayRw: 'Kuwa kane',
      time: '14:00 - 16:00',
      subject: 'Brake Systems',
      subjectRw: 'Sisitemu zo Guhagarika',
      teacher: 'Mr. Frank Niyonzima',
      teacherPhoto: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80',
      room: 'Auto Lab 1',
      level: 'Level 4B AUT',
      trade: 'AUT',
      code: 'AUT402',
      type: 'workshop',
      duration: 120,
      status: 'scheduled',
      description: 'Brake repair and maintenance',
      descriptionRw: 'Gusana no kubungabunga freni'
    },
    {
      id: '13',
      day: 'Friday',
      dayRw: 'Kuwa gatanu',
      time: '08:00 - 11:00',
      subject: 'Software Testing',
      subjectRw: 'Igerageza rya Porogaramu',
      teacher: 'Ms. Grace Mukamana',
      teacherPhoto: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80',
      room: 'Lab A2',
      level: 'Level 5 SOD',
      trade: 'SOD',
      code: 'SOD502',
      type: 'lab',
      duration: 180,
      status: 'scheduled',
      description: 'Unit testing and integration testing',
      descriptionRw: 'Igerageza ry\'ibice n\'ihuza'
    },
    {
      id: '14',
      day: 'Friday',
      dayRw: 'Kuwa gatanu',
      time: '11:00 - 13:00',
      subject: 'Surveying Techniques',
      subjectRw: 'Uburyo bwo Gupima Ubutaka',
      teacher: 'Eng. Patrick Habimana',
      teacherPhoto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80',
      room: 'Field Training',
      level: 'Level 4 BDC',
      trade: 'BDC',
      code: 'BDC303',
      type: 'practical',
      duration: 120,
      status: 'scheduled',
      description: 'Land surveying and measurements',
      descriptionRw: 'Gupima ubutaka no gupima'
    },
    {
      id: '15',
      day: 'Friday',
      dayRw: 'Kuwa gatanu',
      time: '14:00 - 16:00',
      subject: 'Vehicle Electronics',
      subjectRw: 'Eleletrike mu Modoka',
      teacher: 'Ms. Claire Uwera',
      teacherPhoto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80',
      room: 'Auto Lab 2',
      level: 'Level 5B AUT',
      trade: 'AUT',
      code: 'AUT503',
      type: 'lab',
      duration: 120,
      status: 'scheduled',
      description: 'Modern vehicle electronics and sensors',
      descriptionRw: 'Eleletrike n\'ibikoresho bigenzura imodoka'
    }
  ];

  const filteredSlots = timeSlots.filter(slot => {
    const matchesSearch = 
      slot.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      slot.subjectRw.toLowerCase().includes(searchQuery.toLowerCase()) ||
      slot.teacher.toLowerCase().includes(searchQuery.toLowerCase()) ||
      slot.code.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesLevel = selectedLevel === 'all' || slot.level.includes(selectedLevel);
    const matchesTrade = selectedTrade === 'all' || slot.trade === selectedTrade;
    const matchesDay = selectedDay === 'all' || slot.day === selectedDay;

    return matchesSearch && matchesLevel && matchesTrade && matchesDay;
  });

  const getTypeColor = (type: string) => {
    const colors = {
      theory: 'from-blue-500 to-indigo-500',
      practical: 'from-green-500 to-emerald-500',
      lab: 'from-purple-500 to-pink-500',
      workshop: 'from-orange-500 to-red-500'
    };
    return colors[type as keyof typeof colors] || 'from-gray-500 to-gray-600';
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      theory: BookOpen,
      practical: Users,
      lab: Zap,
      workshop: Award
    };
    return icons[type as keyof typeof icons] || BookOpen;
  };

  const stats = [
    { label: 'Amasomo ku Cyumweru', value: timeSlots.length, icon: Calendar, color: 'from-blue-500 to-indigo-500' },
    { label: 'Amasaha ku Munsi', value: (timeSlots.length / 5).toFixed(1), icon: Clock, color: 'from-green-500 to-emerald-500' },
    { label: 'Abarimu', value: new Set(timeSlots.map(s => s.teacher)).size, icon: GraduationCap, color: 'from-purple-500 to-pink-500' },
    { label: 'Amacumbi', value: new Set(timeSlots.map(s => s.room)).size, icon: Building, color: 'from-orange-500 to-red-500' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-purple-50 py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <Badge className="mb-4 bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-2 text-lg">
            <Calendar className="w-5 h-5 mr-2" />
            Amahugurwa
          </Badge>
          <h1 className="text-5xl md:text-7xl font-black mb-6 bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent">
            GAHUNDA Y\'AMASAHA
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-8">
            Gahunda yawe y\'icyumweru n\'amasomo yose uziga
          </p>

          {/* Stats */}
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

        {/* Filters and Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl shadow-2xl border-2 border-orange-100 p-6 md:p-8 mb-8"
        >
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <div className="flex items-center space-x-3">
              <Search className="w-6 h-6 text-orange-600" />
              <h3 className="text-2xl font-black text-gray-900">Shakisha Isomo</h3>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline"
                size="sm"
                className="border-2 border-orange-200"
              >
                <Download className="w-4 h-4 mr-2" />
                Kurura
              </Button>
              <Button 
                variant="outline"
                size="sm"
                className="border-2 border-orange-200"
              >
                <Print className="w-4 h-4 mr-2" />
                Kucapa
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <div className="lg:col-span-2">
              <Input
                placeholder="Shakisha isomo, umwarimu, kode..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-12 text-lg border-2 border-orange-200 focus:border-orange-500"
              />
            </div>

            <Select value={selectedTrade} onValueChange={setSelectedTrade}>
              <SelectTrigger className="h-12 border-2 border-orange-200">
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
              <SelectTrigger className="h-12 border-2 border-orange-200">
                <SelectValue placeholder="Urwego" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Urwego Rwose</SelectItem>
                <SelectItem value="Level 3">Level 3</SelectItem>
                <SelectItem value="Level 4">Level 4</SelectItem>
                <SelectItem value="Level 5">Level 5</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedDay} onValueChange={setSelectedDay}>
              <SelectTrigger className="h-12 border-2 border-orange-200">
                <SelectValue placeholder="Umunsi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Iminsi Yose</SelectItem>
                {weekDays.map(day => (
                  <SelectItem key={day.en} value={day.en}>{day.rw}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* View Mode Tabs */}
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)} className="w-full">
            <TabsList className="grid w-full md:w-auto grid-cols-3">
              <TabsTrigger value="week">Icyumweru</TabsTrigger>
              <TabsTrigger value="day">Umunsi</TabsTrigger>
              <TabsTrigger value="list">Urutonde</TabsTrigger>
            </TabsList>
          </Tabs>
        </motion.div>

        {/* Week View */}
        {viewMode === 'week' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-3xl shadow-2xl border-2 border-orange-100 overflow-hidden"
          >
            <div className="p-6 bg-gradient-to-r from-orange-600 to-red-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-black mb-1">Icyumweru cya {selectedWeek + 1}</h2>
                  <p className="text-orange-100">Tariki: 01/02/2024 - 05/02/2024</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                    onClick={() => setSelectedWeek(Math.max(0, selectedWeek - 1))}
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </Button>
                  <Button
                    variant="ghost"
                    className="text-white hover:bg-white/20"
                  >
                    Uyu Munsi
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                    onClick={() => setSelectedWeek(selectedWeek + 1)}
                  >
                    <ChevronRight className="w-6 h-6" />
                  </Button>
                </div>
              </div>
            </div>

            <ScrollArea className="h-[600px]">
              <div className="p-6">
                <div className="grid grid-cols-6 gap-4">
                  {/* Time Column */}
                  <div className="col-span-1">
                    <div className="h-16" />
                    {['08:00', '10:00', '12:00', '14:00', '16:00'].map(time => (
                      <div key={time} className="h-32 flex items-start justify-end pr-4 text-sm font-bold text-gray-500">
                        {time}
                      </div>
                    ))}
                  </div>

                  {/* Days Columns */}
                  {weekDays.map((day, dayIndex) => {
                    const daySlots = filteredSlots.filter(slot => slot.day === day.en);
                    return (
                      <div key={day.en} className="col-span-1">
                        <div className="h-16 bg-gradient-to-br from-orange-100 to-pink-100 rounded-xl flex flex-col items-center justify-center mb-4 border-2 border-orange-200">
                          <p className="font-black text-gray-900">{day.short}</p>
                          <p className="text-xs text-gray-600">{day.rw}</p>
                        </div>
                        <div className="space-y-2">
                          {daySlots.map((slot, index) => {
                            const TypeIcon = getTypeIcon(slot.type);
                            return (
                              <motion.div
                                key={slot.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.05 }}
                                onClick={() => setSelectedSlot(slot)}
                                className="cursor-pointer group"
                              >
                                <Card className="h-full border-2 border-gray-100 hover:border-orange-400 hover:shadow-xl transition-all overflow-hidden">
                                  <div className={`h-1 bg-gradient-to-r ${getTypeColor(slot.type)}`} />
                                  <CardContent className="p-3">
                                    <div className="flex items-start justify-between mb-2">
                                      <Badge variant="outline" className="text-xs mb-1">
                                        {slot.time.split(' - ')[0]}
                                      </Badge>
                                      <TypeIcon className="w-4 h-4 text-gray-400" />
                                    </div>
                                    <h4 className="font-black text-sm text-gray-900 mb-1 line-clamp-2 group-hover:text-orange-600 transition-colors">
                                      {slot.subjectRw}
                                    </h4>
                                    <div className="flex items-center space-x-1 text-xs text-gray-600 mb-1">
                                      <MapPin className="w-3 h-3" />
                                      <span>{slot.room}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <Avatar className="w-5 h-5">
                                        <img src={slot.teacherPhoto} alt={slot.teacher} />
                                        <AvatarFallback>{slot.teacher[0]}</AvatarFallback>
                                      </Avatar>
                                      <span className="text-xs text-gray-600 truncate">{slot.teacher.split(' ')[0]}</span>
                                    </div>
                                  </CardContent>
                                </Card>
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </ScrollArea>
          </motion.div>
        )}

        {/* List View */}
        {viewMode === 'list' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {weekDays.map(day => {
              const daySlots = filteredSlots.filter(slot => slot.day === day.en);
              if (daySlots.length === 0) return null;

              return (
                <div key={day.en}>
                  <h3 className="text-2xl font-black text-gray-900 mb-4 flex items-center">
                    <Calendar className="w-6 h-6 mr-2 text-orange-600" />
                    {day.rw}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                    {daySlots.map((slot, index) => {
                      const TypeIcon = getTypeIcon(slot.type);
                      return (
                        <motion.div
                          key={slot.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => setSelectedSlot(slot)}
                          className="cursor-pointer group"
                        >
                          <Card className="border-2 border-gray-100 hover:border-orange-400 hover:shadow-2xl transition-all overflow-hidden h-full">
                            <div className={`h-2 bg-gradient-to-r ${getTypeColor(slot.type)}`} />
                            <CardHeader className="pb-3">
                              <div className="flex items-start justify-between mb-2">
                                <Badge className="bg-orange-600 text-white">{slot.code}</Badge>
                                <Badge variant="outline" className="capitalize">{slot.type}</Badge>
                              </div>
                              <CardTitle className="text-xl group-hover:text-orange-600 transition-colors line-clamp-2">
                                {slot.subjectRw}
                              </CardTitle>
                              <CardDescription className="text-sm">{slot.subject}</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-3">
                                <div className="flex items-center space-x-2 text-sm">
                                  <Clock className="w-4 h-4 text-blue-600" />
                                  <span className="font-semibold">{slot.time}</span>
                                  <span className="text-gray-500">({slot.duration} min)</span>
                                </div>
                                <div className="flex items-center space-x-2 text-sm">
                                  <MapPin className="w-4 h-4 text-green-600" />
                                  <span className="font-semibold">{slot.room}</span>
                                </div>
                                <Separator />
                                <div className="flex items-center space-x-3">
                                  <Avatar className="w-10 h-10 border-2 border-orange-200">
                                    <img src={slot.teacherPhoto} alt={slot.teacher} />
                                    <AvatarFallback>{slot.teacher[0]}</AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-bold text-gray-900 text-sm">{slot.teacher}</p>
                                    <p className="text-xs text-gray-500">{slot.level}</p>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}

        {/* Day View */}
        {viewMode === 'day' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-3xl shadow-2xl border-2 border-orange-100 overflow-hidden"
          >
            <div className="p-6 bg-gradient-to-r from-orange-600 to-red-600 text-white">
              <h2 className="text-3xl font-black mb-1">
                {selectedDay === 'all' ? weekDays[0].rw : weekDays.find(d => d.en === selectedDay)?.rw}
              </h2>
              <p className="text-orange-100">Tariki: 01/02/2024</p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {filteredSlots
                  .filter(slot => selectedDay === 'all' ? slot.day === weekDays[0].en : slot.day === selectedDay)
                  .map((slot, index) => {
                    const TypeIcon = getTypeIcon(slot.type);
                    return (
                      <motion.div
                        key={slot.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => setSelectedSlot(slot)}
                        className="cursor-pointer"
                      >
                        <Card className="border-2 border-gray-100 hover:border-orange-400 hover:shadow-xl transition-all">
                          <CardContent className="p-6">
                            <div className="flex items-start space-x-6">
                              <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${getTypeColor(slot.type)} flex flex-col items-center justify-center text-white flex-shrink-0`}>
                                <Clock className="w-6 h-6 mb-1" />
                                <p className="text-xs font-bold">{slot.time.split(' - ')[0]}</p>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex-1">
                                    <Badge className="mb-2 bg-orange-600 text-white">{slot.code}</Badge>
                                    <h3 className="text-2xl font-black text-gray-900 mb-1">{slot.subjectRw}</h3>
                                    <p className="text-gray-600">{slot.subject}</p>
                                  </div>
                                  <Badge variant="outline" className="capitalize">
                                    <TypeIcon className="w-4 h-4 mr-1" />
                                    {slot.type}
                                  </Badge>
                                </div>
                                <div className="grid grid-cols-3 gap-4 mb-4">
                                  <div className="flex items-center space-x-2 text-sm">
                                    <Clock className="w-4 h-4 text-blue-600" />
                                    <span>{slot.duration} min</span>
                                  </div>
                                  <div className="flex items-center space-x-2 text-sm">
                                    <MapPin className="w-4 h-4 text-green-600" />
                                    <span>{slot.room}</span>
                                  </div>
                                  <div className="flex items-center space-x-2 text-sm">
                                    <Users className="w-4 h-4 text-purple-600" />
                                    <span>{slot.level}</span>
                                  </div>
                                </div>
                                <Separator className="my-4" />
                                <div className="flex items-center space-x-3">
                                  <Avatar className="w-12 h-12 border-2 border-orange-200">
                                    <img src={slot.teacherPhoto} alt={slot.teacher} />
                                    <AvatarFallback>{slot.teacher[0]}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-bold text-gray-900">{slot.teacher}</p>
                                    <p className="text-sm text-gray-600">{slot.descriptionRw}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Slot Detail Dialog */}
      <Dialog open={!!selectedSlot} onOpenChange={() => setSelectedSlot(null)}>
        <DialogContent className="max-w-3xl">
          {selectedSlot && (
            <div>
              <DialogHeader>
                <div className={`h-2 bg-gradient-to-r ${getTypeColor(selectedSlot.type)} -mx-6 -mt-6 mb-6`} />
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Badge className="mb-3 bg-orange-600 text-white text-base px-4 py-1">
                      {selectedSlot.code}
                    </Badge>
                    <DialogTitle className="text-3xl font-black mb-2">{selectedSlot.subjectRw}</DialogTitle>
                    <p className="text-lg text-gray-600">{selectedSlot.subject}</p>
                  </div>
                </div>
              </DialogHeader>

              <div className="mt-6 space-y-6">
                {/* Quick Info */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-blue-50 rounded-xl p-4 text-center border-2 border-blue-200">
                    <Calendar className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                    <p className="font-black text-gray-900">{selectedSlot.dayRw}</p>
                    <p className="text-xs text-gray-600">Umunsi</p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4 text-center border-2 border-green-200">
                    <Clock className="w-6 h-6 text-green-600 mx-auto mb-2" />
                    <p className="font-black text-gray-900 text-sm">{selectedSlot.time.split(' - ')[0]}</p>
                    <p className="text-xs text-gray-600">Itangiriro</p>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-4 text-center border-2 border-purple-200">
                    <Users className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                    <p className="font-black text-gray-900 text-sm">{selectedSlot.duration}min</p>
                    <p className="text-xs text-gray-600">Igihe</p>
                  </div>
                  <div className="bg-orange-50 rounded-xl p-4 text-center border-2 border-orange-200">
                    <MapPin className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                    <p className="font-black text-gray-900 text-sm">{selectedSlot.room}</p>
                    <p className="text-xs text-gray-600">Icyumba</p>
                  </div>
                </div>

                <Separator />

                {/* Description */}
                <div>
                  <h4 className="text-xl font-black text-gray-900 mb-3 flex items-center">
                    <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
                    Ibisobanuro
                  </h4>
                  <p className="text-gray-700 mb-2">{selectedSlot.descriptionRw}</p>
                  <p className="text-gray-600 text-sm">{selectedSlot.description}</p>
                </div>

                <Separator />

                {/* Instructor */}
                <div>
                  <h4 className="text-xl font-black text-gray-900 mb-3 flex items-center">
                    <User className="w-5 h-5 mr-2 text-purple-600" />
                    Umwarimu
                  </h4>
                  <Card className="border-2 border-purple-100 bg-gradient-to-br from-purple-50 to-white">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <Avatar className="w-16 h-16 border-4 border-white shadow-lg">
                          <img src={selectedSlot.teacherPhoto} alt={selectedSlot.teacher} />
                          <AvatarFallback>{selectedSlot.teacher[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h5 className="text-xl font-black text-gray-900">{selectedSlot.teacher}</h5>
                          <p className="text-gray-600">{selectedSlot.level}</p>
                          <Badge className="mt-2 capitalize">{selectedSlot.trade}</Badge>
                        </div>
                        <Button className="bg-purple-600 hover:bg-purple-700">
                          Muhereze
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Actions */}
                <div className="flex space-x-3">
                  <Button className="flex-1 bg-orange-600 hover:bg-orange-700">
                    <Bell className="w-4 h-4 mr-2" />
                    Nyobora Ukumbuze
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Download className="w-4 h-4 mr-2" />
                    Kurura
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TimetablePage;
