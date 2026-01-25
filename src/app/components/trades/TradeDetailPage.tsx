import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, BookOpen, Award, Code, Hammer, Car, Mail, Phone, Star, Clock, GraduationCap, CheckCircle2, TrendingUp, Calendar, Briefcase, Target, Zap } from 'lucide-react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Progress } from '@/app/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';

interface TradeDetailPageProps {
  tradeId: string;
  onNavigate: (page: string) => void;
}

const TradeDetailPage: React.FC<TradeDetailPageProps> = ({ tradeId, onNavigate }) => {
  const { language } = useLanguage();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchTradeData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/api/trades/code/${tradeId.toUpperCase()}`);
        const result = await response.json();
        if (result.success) {
          setData(result);
        }
      } catch (error) {
        console.error('Error fetching trade:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTradeData();
  }, [tradeId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-green-50">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity }}>
          <BookOpen className="w-20 h-20 text-green-600" />
        </motion.div>
      </div>
    );
  }

  if (!data) return null;

  const { trade, instructors, courses, statistics } = data;
  
  const getCareerPaths = (code: string) => {
    const careers: { [key: string]: any[] } = {
      'L4SOD': [
        { title: 'Backend Developer', description: 'Build server-side applications', salary: '$45,000+', growth: '+18%', level: 'Mid-Level' },
        { title: 'Database Administrator', description: 'Manage and optimize databases', salary: '$50,000+', growth: '+15%', level: 'Mid-Level' },
        { title: 'API Developer', description: 'Create and maintain APIs', salary: '$48,000+', growth: '+16%', level: 'Mid-Level' }
      ],
      'L5BDC': [
        { title: 'Construction Manager', description: 'Oversee construction projects', salary: '$55,000+', growth: '+12%', level: 'Senior' },
        { title: 'Site Supervisor', description: 'Manage construction sites', salary: '$48,000+', growth: '+10%', level: 'Mid-Level' },
        { title: 'Architectural Technician', description: 'Support architectural design', salary: '$45,000+', growth: '+11%', level: 'Mid-Level' }
      ],
      'L3SOD': [
        { title: 'Junior Web Developer', description: 'Build websites and web apps', salary: '$35,000+', growth: '+20%', level: 'Entry' },
        { title: 'UI/UX Designer', description: 'Design user interfaces', salary: '$38,000+', growth: '+19%', level: 'Entry' },
        { title: 'Frontend Developer', description: 'Create interactive web pages', salary: '$40,000+', growth: '+18%', level: 'Entry' }
      ],
      'L3BDC': [
        { title: 'Construction Worker', description: 'Perform basic construction tasks', salary: '$25,000+', growth: '+8%', level: 'Entry' },
        { title: 'Mason', description: 'Specialize in brickwork and stonework', salary: '$28,000+', growth: '+7%', level: 'Entry' },
        { title: 'Plumber Assistant', description: 'Support plumbing installations', salary: '$26,000+', growth: '+9%', level: 'Entry' }
      ],
      'L4BDC': [
        { title: 'Construction Technician', description: 'Perform construction work', salary: '$38,000+', growth: '+9%', level: 'Mid-Level' },
        { title: 'Concrete Specialist', description: 'Expert in concrete work', salary: '$40,000+', growth: '+8%', level: 'Mid-Level' },
        { title: 'CAD Technician', description: 'Create technical drawings', salary: '$42,000+', growth: '+10%', level: 'Mid-Level' }
      ],
      'L3AUTO': [
        { title: 'Automotive Technician', description: 'Repair and maintain vehicles', salary: '$32,000+', growth: '+12%', level: 'Entry' },
        { title: 'Mechanic Assistant', description: 'Support senior mechanics', salary: '$28,000+', growth: '+10%', level: 'Entry' },
        { title: 'Service Technician', description: 'Perform vehicle servicing', salary: '$30,000+', growth: '+11%', level: 'Entry' }
      ],
      'L5SOD': [
        { title: 'Full Stack Developer', description: 'Build complete applications', salary: '$65,000+', growth: '+22%', level: 'Senior' },
        { title: 'Software Architect', description: 'Design software systems', salary: '$75,000+', growth: '+20%', level: 'Senior' },
        { title: 'DevOps Engineer', description: 'Manage deployment pipelines', salary: '$70,000+', growth: '+21%', level: 'Senior' }
      ],
      'L4AUTO': [
        { title: 'Diesel Mechanic', description: 'Specialize in diesel engines', salary: '$42,000+', growth: '+11%', level: 'Mid-Level' },
        { title: 'Automotive Electrician', description: 'Work on vehicle electronics', salary: '$45,000+', growth: '+13%', level: 'Mid-Level' },
        { title: 'Transmission Specialist', description: 'Expert in transmissions', salary: '$48,000+', growth: '+12%', level: 'Mid-Level' }
      ],
      'L5AUTO': [
        { title: 'Master Technician', description: 'Lead automotive expert', salary: '$55,000+', growth: '+14%', level: 'Senior' },
        { title: 'Shop Manager', description: 'Manage automotive shop', salary: '$60,000+', growth: '+10%', level: 'Senior' },
        { title: 'Hybrid Vehicle Specialist', description: 'Expert in hybrid technology', salary: '$58,000+', growth: '+16%', level: 'Senior' }
      ]
    };
    return careers[code] || [];
  };
  
  const getIcon = () => {
    if (trade.code.includes('SOD')) return Code;
    if (trade.code.includes('BDC')) return Hammer;
    if (trade.code.includes('AUTO')) return Car;
    return BookOpen;
  };
  
  const Icon = getIcon();
  
  const getGradient = () => {
    if (trade.code.includes('SOD')) return 'from-blue-500 via-indigo-500 to-purple-500';
    if (trade.code.includes('BDC')) return 'from-green-500 via-teal-500 to-emerald-500';
    if (trade.code.includes('AUTO')) return 'from-orange-500 via-red-500 to-pink-500';
    return 'from-yellow-400 via-green-400 to-yellow-500';
  };
  
  const gradient = getGradient();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Hero Header */}
      <div className={`bg-gradient-to-r ${gradient} text-white py-16 relative overflow-hidden`}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC40Ij48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] animate-pulse" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <button 
            onClick={() => onNavigate('trades')} 
            className="flex items-center gap-2 text-white/90 hover:text-white mb-8 font-bold transition-all hover:gap-3"
          >
            <ArrowLeft className="w-5 h-5" /> 
            {language === 'rw' ? 'Subira ku Myuga' : 'Back to Trades'}
          </button>
          
          <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
            <motion.div 
              initial={{ scale: 0 }} 
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border-2 border-white/20"
            >
              <Icon className="w-24 h-24 text-white" />
            </motion.div>
            
            <div className="flex-1">
              <Badge className="mb-3 bg-white/20 text-white border-white/30 text-sm px-4 py-1">
                {trade.code}
              </Badge>
              <h1 className="text-5xl md:text-6xl font-black mb-4">
                {language === 'rw' ? trade.name_rw : trade.name}
              </h1>
              <p className="text-xl text-white/90 mb-6 max-w-3xl">
                {language === 'rw' ? trade.description_rw : trade.description}
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full">
                  <Clock className="w-5 h-5" />
                  <span className="font-bold">{trade.duration_years} {language === 'rw' ? 'Imyaka' : 'Years'}</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full">
                  <Award className="w-5 h-5" />
                  <span className="font-bold">{trade.level}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12 -mt-20 relative z-20">
          {[
            { 
              icon: BookOpen, 
              value: statistics.totalCourses, 
              label: language === 'rw' ? 'Amasomo' : 'Courses', 
              color: 'from-blue-500 to-indigo-500' 
            },
            { 
              icon: Users, 
              value: statistics.totalInstructors, 
              label: language === 'rw' ? 'Abarimu' : 'Instructors', 
              color: 'from-green-500 to-teal-500' 
            },
            { 
              icon: Award, 
              value: statistics.totalCredits, 
              label: language === 'rw' ? 'Amanota' : 'Credits', 
              color: 'from-yellow-500 to-orange-500' 
            },
            { 
              icon: Clock, 
              value: statistics.totalHours, 
              label: language === 'rw' ? 'Amasaha' : 'Hours', 
              color: 'from-purple-500 to-pink-500' 
            }
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="border-2 shadow-xl hover:shadow-2xl transition-all">
                <CardContent className="p-6 text-center">
                  <div className={`bg-gradient-to-br ${stat.color} p-4 rounded-2xl inline-block mb-4`}>
                    <stat.icon className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-4xl font-black text-gray-900 mb-2">{stat.value}</p>
                  <p className="text-gray-600 font-bold">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Tabs Navigation */}
        <div className="flex flex-wrap gap-3 mb-8 bg-white p-2 rounded-2xl shadow-lg">
          {[
            { id: 'overview', label: language === 'rw' ? 'Incamake' : 'Overview', icon: BookOpen },
            { id: 'courses', label: language === 'rw' ? 'Amasomo' : 'Courses', icon: GraduationCap },
            { id: 'instructors', label: language === 'rw' ? 'Abarimu' : 'Instructors', icon: Users },
            { id: 'careers', label: language === 'rw' ? 'Imyuga' : 'Careers', icon: Briefcase }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                activeTab === tab.id
                  ? `bg-gradient-to-r ${gradient} text-white shadow-lg scale-105`
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-3xl flex items-center gap-3">
                  <BookOpen className="w-8 h-8" />
                  {language === 'rw' ? 'Ibyerekeye Umwuga' : 'About This Trade'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-lg text-gray-700 leading-relaxed">
                  {language === 'rw' ? trade.description_rw : trade.description}
                </p>
                
                <div className="grid md:grid-cols-2 gap-6 pt-6 border-t">
                  <div>
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <CheckCircle2 className="w-6 h-6 text-green-500" />
                      {language === 'rw' ? 'Uziga' : 'What You\'ll Learn'}
                    </h3>
                    <ul className="space-y-3">
                      {courses.slice(0, 6).map((course: any, idx: number) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Star className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{language === 'rw' ? course.name_rw : course.name}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <TrendingUp className="w-6 h-6 text-blue-500" />
                      {language === 'rw' ? 'Amahirwe y\'Akazi' : 'Career Opportunities'}
                    </h3>
                    <p className="text-gray-700 mb-4">
                      {language === 'rw' 
                        ? 'Nyuma yo kurangiza iyi porogaramu, uzashobora gukora nka:'
                        : 'After completing this program, you can work as:'}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {['Professional', 'Technician', 'Specialist', 'Expert', 'Manager'].map((role, idx) => (
                        <Badge key={idx} variant="outline" className="text-sm">
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Courses Tab */}
        {activeTab === 'courses' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-3xl flex items-center gap-3">
                  <GraduationCap className="w-8 h-8" />
                  {language === 'rw' ? 'Amasomo Yose' : 'All Courses'}
                  <Badge className={`ml-auto bg-gradient-to-r ${gradient} text-white`}>
                    {courses.length} {language === 'rw' ? 'Amasomo' : 'Courses'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {courses.map((course: any, index: number) => (
                    <motion.div
                      key={course.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="border-2 hover:shadow-xl transition-all h-full">
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4 mb-4">
                            <div className={`bg-gradient-to-br ${gradient} p-3 rounded-xl flex-shrink-0`}>
                              <BookOpen className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <Badge variant="outline" className="mb-2 text-xs">
                                {course.code}
                              </Badge>
                              <h4 className="text-lg font-black text-gray-900 mb-1 line-clamp-2">
                                {language === 'rw' ? course.name_rw : course.name}
                              </h4>
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600 flex items-center gap-1">
                                <Award className="w-4 h-4" />
                                {language === 'rw' ? 'Amanota' : 'Credits'}
                              </span>
                              <span className="font-bold text-gray-900">{course.credits}</span>
                            </div>
                            
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600 flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {language === 'rw' ? 'Amasaha' : 'Hours'}
                              </span>
                              <span className="font-bold text-gray-900">{course.hours}h</span>
                            </div>
                            
                            <div className="pt-3 border-t">
                              <Progress value={(course.credits / 6) * 100} className="h-2" />
                              <p className="text-xs text-gray-500 mt-2 text-center">
                                {language === 'rw' ? 'Urwego' : 'Level'}: {trade.level}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Instructors Tab */}
        {activeTab === 'instructors' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-3xl flex items-center gap-3">
                  <Users className="w-8 h-8" />
                  {language === 'rw' ? 'Abarimu Bacu' : 'Our Instructors'}
                  <Badge className={`ml-auto bg-gradient-to-r ${gradient} text-white`}>
                    {instructors.length} {language === 'rw' ? 'Abarimu' : 'Instructors'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {instructors.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {instructors.map((instructor: any, index: number) => (
                      <motion.div
                        key={instructor.id}
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card className="border-2 hover:shadow-xl transition-all h-full">
                          <CardContent className="p-6">
                            <div className="flex items-start gap-4 mb-4">
                              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                                {instructor.photo_url ? (
                                  <img 
                                    src={`http://localhost:5000${instructor.photo_url}`} 
                                    alt={instructor.name} 
                                    className="w-full h-full object-cover" 
                                  />
                                ) : (
                                  <Users className="w-10 h-10 text-gray-400" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="text-xl font-black text-gray-900 mb-1">
                                  {language === 'rw' ? instructor.name_rw || instructor.name : instructor.name}
                                </h3>
                                <p className="text-sm text-gray-600 font-bold mb-2">
                                  {instructor.specialization}
                                </p>
                              </div>
                            </div>
                            
                            <div className="space-y-2 mb-4">
                              {instructor.qualification && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <Award className="w-4 h-4 text-blue-500" />
                                  <span>{instructor.qualification}</span>
                                </div>
                              )}
                              {instructor.experience_years && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <Star className="w-4 h-4 text-yellow-500" />
                                  <span>{instructor.experience_years} {language === 'rw' ? 'imyaka' : 'years'}</span>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex gap-2 pt-4 border-t">
                              {instructor.email && (
                                <Button size="sm" variant="outline" className="flex-1">
                                  <Mail className="w-4 h-4 mr-1" />
                                  {language === 'rw' ? 'Andikira' : 'Email'}
                                </Button>
                              )}
                              {instructor.phone && (
                                <Button size="sm" variant="outline" className="flex-1">
                                  <Phone className="w-4 h-4 mr-1" />
                                  {language === 'rw' ? 'Hamagara' : 'Call'}
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">
                      {language === 'rw' 
                        ? 'Nta barimu bahari kuri ubu' 
                        : 'No instructors available at the moment'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Careers Tab */}
        {activeTab === 'careers' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-3xl flex items-center gap-3">
                  <Briefcase className="w-8 h-8" />
                  {language === 'rw' ? 'Amahirwe y\'Akazi' : 'Career Opportunities'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {getCareerPaths(trade.code).map((career: any, index: number) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="border-2 hover:shadow-xl transition-all h-full">
                        <CardContent className="p-6">
                          <div className="flex items-start gap-3 mb-4">
                            <div className={`bg-gradient-to-br ${gradient} p-3 rounded-xl`}>
                              <Briefcase className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <h4 className="text-lg font-black text-gray-900 mb-2">
                                {career.title}
                              </h4>
                              <p className="text-sm text-gray-600 mb-4">
                                {career.description}
                              </p>
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                              <span className="text-sm text-gray-600 flex items-center gap-2">
                                <Target className="w-4 h-4" />
                                {language === 'rw' ? 'Umushahara' : 'Salary'}
                              </span>
                              <span className="font-bold text-green-600">{career.salary}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                              <span className="text-sm text-gray-600 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4" />
                                {language === 'rw' ? 'Ikura' : 'Growth'}
                              </span>
                              <span className="font-bold text-blue-600">{career.growth}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                              <span className="text-sm text-gray-600 flex items-center gap-2">
                                <Zap className="w-4 h-4" />
                                {language === 'rw' ? 'Urwego' : 'Level'}
                              </span>
                              <span className="font-bold text-purple-600">{career.level}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-12"
        >
          <Card className={`border-2 bg-gradient-to-r ${gradient} text-white overflow-hidden`}>
            <CardContent className="p-12 text-center relative">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC40Ij48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] animate-pulse" />
              </div>
              <div className="relative z-10">
                <h2 className="text-4xl font-black mb-4">
                  {language === 'rw' ? 'Witeguye Gutangira?' : 'Ready to Start Your Journey?'}
                </h2>
                <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                  {language === 'rw' 
                    ? 'Jya muri iyi porogaramu kandi utangire urugendo rwawe mu kazi' 
                    : 'Enroll in this program and start your journey to a successful career'}
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Button 
                    size="lg" 
                    className="bg-white text-gray-900 hover:bg-gray-100 text-lg px-8 py-6"
                    onClick={() => onNavigate('register')}
                  >
                    {language === 'rw' ? 'Iyandikishe' : 'Enroll Now'}
                    <ArrowLeft className="ml-2 w-5 h-5 rotate-180" />
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-6"
                    onClick={() => onNavigate('contactUs')}
                  >
                    <Phone className="mr-2 w-5 h-5" />
                    {language === 'rw' ? 'Twandikire' : 'Contact Us'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default TradeDetailPage;
