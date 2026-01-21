import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Code, Building2, Car, ArrowLeft, Users, Trophy, Clock, Star, 
  GraduationCap, BookOpen, Target, CheckCircle2, Play, Download,
  Calendar, MapPin, Mail, Phone, Briefcase, TrendingUp, Award,
  ChevronRight, Heart, Share2, Zap, Shield, Lightbulb, Rocket,
  FileText, Video, Image as ImageIcon, ExternalLink
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Progress } from '@/app/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { useLanguage } from '@/app/contexts/LanguageContext';

interface TradeDetailPageProps {
  tradeId: string;
  onNavigate: (page: string) => void;
}

const tradesData = {
  'sod': {
    id: 'sod',
    code: 'SOD',
    title: 'Software Development',
    titleRw: 'Iterambere rya Porogaramu',
    icon: Code,
    gradient: 'from-blue-600 via-indigo-600 to-purple-600',
    lightGradient: 'from-blue-50 to-indigo-50',
    heroImage: 'https://images.unsplash.com/photo-1531498860502-7c67cf02f657?w=1920&q=80',
    description: 'Master the art of software development with cutting-edge technologies, real-world projects, and industry-standard practices. Our comprehensive program prepares you for a successful career in the tech industry.',
    descriptionRw: 'Menya uburyo bwo gukora porogaramu z\'ikoranabuhanga hamwe n\'ikoranabuhanga rishya, imishinga nyayo, n\'imyitwarire isanzwe mu nganda. Gahunda yacu yuzuye itegura intsinzi mu by\'ikoranabuhanga.',
    stats: { students: 156, successRate: 96, employmentRate: 92, duration: '2 Years' },
    features: [
      { icon: Code, title: 'Full-Stack Development', titleRw: 'Iterambere Ryuzuye' },
      { icon: Laptop, title: 'Mobile App Development', titleRw: 'Porogaramu z\'Telefone' },
      { icon: Shield, title: 'Cybersecurity Basics', titleRw: 'Umutekano wa Murandasi' },
      { icon: Zap, title: 'Cloud Computing', titleRw: 'Ikoranabuhanga rya Cloud' },
    ],
    curriculum: [
      { level: 'Level 3', duration: '1 Year', modules: ['HTML/CSS/JavaScript', 'Python Basics', 'Database Fundamentals', 'Git Version Control', 'Problem Solving'] },
      { level: 'Level 4', duration: '1 Year', modules: ['React & Node.js', 'Advanced Python', 'SQL & NoSQL', 'API Development', 'Mobile Apps', 'DevOps Basics'] },
    ],
    instructors: [
      { name: 'Dr. Jean Mugabo', role: 'Lead Instructor', experience: '15 years', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', email: 'j.mugabo@garden.rw' },
      { name: 'Marie Uwimana', role: 'Senior Developer', experience: '10 years', image: 'https://images.unsplash.com/photo-1494790108755-2616b612b134?w=150', email: 'm.uwimana@garden.rw' },
      { name: 'Patrick Nkusi', role: 'Mobile Expert', experience: '8 years', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', email: 'p.nkusi@garden.rw' },
    ],
    gallery: [
      { url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800', title: 'Classroom Session' },
      { url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800', title: 'Programming Lab' },
      { url: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800', title: 'Code Development' },
      { url: 'https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?w=800', title: 'Team Project' },
    ],
    careers: [
      { title: 'Full Stack Developer', salary: '$50,000+', growth: '+15%' },
      { title: 'Mobile App Developer', salary: '$55,000+', growth: '+18%' },
      { title: 'Software Engineer', salary: '$65,000+', growth: '+12%' },
      { title: 'DevOps Engineer', salary: '$70,000+', growth: '+20%' },
    ],
  },
  'bdc': {
    id: 'bdc',
    code: 'BDC',
    title: 'Building Construction',
    titleRw: 'Ubwubatsi bw\'Inyubako',
    icon: Building2,
    gradient: 'from-orange-500 via-amber-500 to-yellow-500',
    lightGradient: 'from-orange-50 to-amber-50',
    heroImage: 'https://images.unsplash.com/photo-1672072830247-85ac23671e96?w=1920&q=80',
    description: 'Learn comprehensive construction techniques from foundation to finishing. Our hands-on program combines traditional craftsmanship with modern construction technology.',
    descriptionRw: 'Iga uburyo bwo kubaka bwuzuye kuva ku mushinga kugeza ku isoza. Gahunda yacu ihuje ubuhanga bwa kera n\'ikoranabuhanga rishya ryo kubaka.',
    stats: { students: 124, successRate: 94, employmentRate: 89, duration: '2 Years' },
    features: [
      { icon: Building2, title: 'Structural Design', titleRw: 'Imigambi y\'Inyubako' },
      { icon: Shield, title: 'Safety Standards', titleRw: 'Amahame y\'Umutekano' },
      { icon: Target, title: 'Project Management', titleRw: 'Gucunga Imishinga' },
      { icon: Zap, title: 'Sustainable Building', titleRw: 'Kubaka Byirambye' },
    ],
    curriculum: [
      { level: 'Level 3', duration: '1 Year', modules: ['Construction Basics', 'Building Materials', 'Safety Protocols', 'Technical Drawing', 'Site Preparation'] },
      { level: 'Level 4', duration: '1 Year', modules: ['Advanced Construction', 'Project Management', 'Structural Design', 'Quality Control', 'Sustainable Methods'] },
    ],
    instructors: [
      { name: 'Eng. Paul Habimana', role: 'Lead Instructor', experience: '20 years', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', email: 'p.habimana@garden.rw' },
      { name: 'Alice Mukamana', role: 'Safety Expert', experience: '12 years', image: 'https://images.unsplash.com/photo-1494790108755-2616b612b134?w=150', email: 'a.mukamana@garden.rw' },
    ],
    gallery: [
      { url: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800', title: 'Construction Site' },
      { url: 'https://images.unsplash.com/photo-1585504198199-20277593b94f?w=800', title: 'Building Techniques' },
      { url: 'https://images.unsplash.com/photo-1590845947426-c4a88c96a048?w=800', title: 'Practical Training' },
      { url: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800', title: 'Safety Training' },
    ],
    careers: [
      { title: 'Construction Manager', salary: '$45,000+', growth: '+10%' },
      { title: 'Site Supervisor', salary: '$40,000+', growth: '+8%' },
      { title: 'Building Inspector', salary: '$42,000+', growth: '+7%' },
      { title: 'Project Coordinator', salary: '$48,000+', growth: '+12%' },
    ],
  },
  'aut': {
    id: 'aut',
    code: 'AUTO',
    title: 'Automobile Technology',
    titleRw: 'Ikoranabuhanga ry\'Imodoka',
    icon: Car,
    gradient: 'from-green-500 via-emerald-500 to-teal-500',
    lightGradient: 'from-green-50 to-emerald-50',
    heroImage: 'https://images.unsplash.com/photo-1636761358757-0a616eb9e17e?w=1920&q=80',
    description: 'Master automotive diagnostics, repair, and maintenance with state-of-the-art equipment. Our program covers everything from traditional mechanics to electric vehicle technology.',
    descriptionRw: 'Menya isuzuma, gusana, no kubungabunga imodoka hamwe n\'ibikoresho bishya. Gahunda yacu irimo ibintu byose kuva ku buhanga bw\'imodoka kugera ku imodoka z\'amashanyarazi.',
    stats: { students: 98, successRate: 95, employmentRate: 91, duration: '2 Years' },
    features: [
      { icon: Car, title: 'Engine Diagnostics', titleRw: 'Isuzuma ry\'Injini' },
      { icon: Zap, title: 'Electric Vehicles', titleRw: 'Imodoka z\'Amashanyarazi' },
      { icon: Shield, title: 'Safety Systems', titleRw: 'Sisitemu z\'Umutekano' },
      { icon: Target, title: 'Workshop Management', titleRw: 'Gucunga Ateliye' },
    ],
    curriculum: [
      { level: 'Level 3', duration: '1 Year', modules: ['Engine Fundamentals', 'Electrical Systems', 'Basic Diagnostics', 'Vehicle Maintenance', 'Safety Procedures'] },
      { level: 'Level 4', duration: '1 Year', modules: ['Advanced Diagnostics', 'Hybrid Technology', 'Electronic Systems', 'Engine Performance', 'Workshop Management'] },
    ],
    instructors: [
      { name: 'Claude Bizimana', role: 'Lead Mechanic', experience: '18 years', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', email: 'c.bizimana@garden.rw' },
      { name: 'Grace Uwera', role: 'EV Specialist', experience: '8 years', image: 'https://images.unsplash.com/photo-1494790108755-2616b612b134?w=150', email: 'g.uwera@garden.rw' },
    ],
    gallery: [
      { url: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800', title: 'Workshop' },
      { url: 'https://images.unsplash.com/photo-1615906841282-a2b0c5845a61?w=800', title: 'Engine Work' },
      { url: 'https://images.unsplash.com/photo-1589734760604-86cc61f96ddb?w=800', title: 'Student Practice' },
      { url: 'https://images.unsplash.com/photo-1609069985744-95be8e1c1d8b?w=800', title: 'Modern Equipment' },
    ],
    careers: [
      { title: 'Automotive Technician', salary: '$38,000+', growth: '+9%' },
      { title: 'Service Manager', salary: '$48,000+', growth: '+6%' },
      { title: 'EV Specialist', salary: '$52,000+', growth: '+25%' },
      { title: 'Auto Shop Owner', salary: '$55,000+', growth: '+12%' },
    ],
  },
};

// Add Laptop icon since it's used in features
const Laptop = Code;

const TradeDetailPage: React.FC<TradeDetailPageProps> = ({ tradeId, onNavigate }) => {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  const trade = tradesData[tradeId as keyof typeof tradesData];
  
  if (!trade) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Trade Not Found</h1>
          <Button onClick={() => onNavigate('trades')}>Back to Trades</Button>
        </div>
      </div>
    );
  }

  const Icon = trade.icon;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-[500px] overflow-hidden">
        <motion.img
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5 }}
          src={trade.heroImage}
          alt={trade.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => onNavigate('trades')}
          className="absolute top-6 left-6 text-white hover:bg-white/20 z-20"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          {language === 'rw' ? 'Subira' : 'Back'}
        </Button>

        {/* Hero Content */}
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${trade.gradient} flex items-center justify-center shadow-2xl`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <Badge className={`bg-gradient-to-r ${trade.gradient} text-white text-xl px-6 py-2 font-black border-0`}>
                  {trade.code}
                </Badge>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-black text-white mb-4">
                {language === 'rw' ? trade.titleRw : trade.title}
              </h1>
              
              <p className="text-xl text-gray-200 max-w-3xl mb-8">
                {language === 'rw' ? trade.descriptionRw : trade.description}
              </p>

              {/* Stats Row */}
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-5 py-2">
                  <Users className="w-5 h-5 text-yellow-400" />
                  <span className="text-white font-bold">{trade.stats.students} {language === 'rw' ? 'Abanyeshuri' : 'Students'}</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-5 py-2">
                  <Trophy className="w-5 h-5 text-green-400" />
                  <span className="text-white font-bold">{trade.stats.successRate}% {language === 'rw' ? 'Intsinzi' : 'Success'}</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-5 py-2">
                  <Briefcase className="w-5 h-5 text-blue-400" />
                  <span className="text-white font-bold">{trade.stats.employmentRate}% {language === 'rw' ? 'Akazi' : 'Employment'}</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-5 py-2">
                  <Clock className="w-5 h-5 text-purple-400" />
                  <span className="text-white font-bold">{trade.stats.duration}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 h-14 bg-white border-2 border-gray-200 rounded-2xl p-1 mb-8">
            <TabsTrigger value="overview" className="text-base font-bold rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-green-500 data-[state=active]:text-white">
              {language === 'rw' ? 'Incamake' : 'Overview'}
            </TabsTrigger>
            <TabsTrigger value="curriculum" className="text-base font-bold rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-green-500 data-[state=active]:text-white">
              {language === 'rw' ? 'Amasomo' : 'Curriculum'}
            </TabsTrigger>
            <TabsTrigger value="instructors" className="text-base font-bold rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-green-500 data-[state=active]:text-white">
              {language === 'rw' ? 'Abarimu' : 'Instructors'}
            </TabsTrigger>
            <TabsTrigger value="gallery" className="text-base font-bold rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-green-500 data-[state=active]:text-white">
              {language === 'rw' ? 'Amafoto' : 'Gallery'}
            </TabsTrigger>
            <TabsTrigger value="careers" className="text-base font-bold rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-green-500 data-[state=active]:text-white">
              {language === 'rw' ? 'Imyuga' : 'Careers'}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Features */}
              <div className="lg:col-span-2">
                <Card className="border-2 border-gray-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      <Zap className={`w-6 h-6 bg-gradient-to-r ${trade.gradient} bg-clip-text text-transparent`} />
                      {language === 'rw' ? 'Ibyo Uziga' : 'What You\'ll Learn'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {trade.features.map((feature, index) => {
                        const FeatureIcon = feature.icon;
                        return (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`p-5 rounded-xl bg-gradient-to-br ${trade.lightGradient} border-2 border-gray-100 hover:shadow-lg transition-all`}
                          >
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${trade.gradient} flex items-center justify-center mb-3`}>
                              <FeatureIcon className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="font-bold text-gray-900 text-lg">
                              {language === 'rw' ? feature.titleRw : feature.title}
                            </h3>
                          </motion.div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                  {[
                    { label: language === 'rw' ? 'Abanyeshuri' : 'Students', value: trade.stats.students, icon: Users, color: 'blue' },
                    { label: language === 'rw' ? 'Intsinzi' : 'Success Rate', value: `${trade.stats.successRate}%`, icon: Trophy, color: 'green' },
                    { label: language === 'rw' ? 'Akazi' : 'Employment', value: `${trade.stats.employmentRate}%`, icon: Briefcase, color: 'purple' },
                    { label: language === 'rw' ? 'Igihe' : 'Duration', value: trade.stats.duration, icon: Clock, color: 'orange' },
                  ].map((stat, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className={`border-2 border-${stat.color}-200 bg-${stat.color}-50`}>
                        <CardContent className="p-5 text-center">
                          <stat.icon className={`w-8 h-8 mx-auto mb-2 text-${stat.color}-600`} />
                          <p className="text-3xl font-black text-gray-900">{stat.value}</p>
                          <p className="text-sm font-semibold text-gray-600">{stat.label}</p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Enrollment Card */}
              <div>
                <Card className={`border-2 border-gray-200 bg-gradient-to-br ${trade.lightGradient} sticky top-8`}>
                  <CardHeader>
                    <CardTitle className="text-xl">
                      {language === 'rw' ? 'Kwiyandikisha' : 'Enroll Now'}
                    </CardTitle>
                    <CardDescription>
                      {language === 'rw' ? 'Tangira urugendo rwawe uyu munsi' : 'Start your journey today'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm">
                        <Calendar className="w-5 h-5 text-gray-500" />
                        <span>{language === 'rw' ? 'Intangiriro: Gashyantare 2026' : 'Start: February 2026'}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Clock className="w-5 h-5 text-gray-500" />
                        <span>{trade.stats.duration}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <MapPin className="w-5 h-5 text-gray-500" />
                        <span>Garden TVET School, Kigali</span>
                      </div>
                    </div>

                    <Button 
                      onClick={() => onNavigate('register')}
                      className={`w-full bg-gradient-to-r ${trade.gradient} text-white font-bold py-6 text-lg`}
                    >
                      {language === 'rw' ? 'Iyandikishe Nonaha' : 'Apply Now'}
                      <ChevronRight className="w-5 h-5 ml-2" />
                    </Button>

                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1">
                        <Heart className="w-4 h-4 mr-2" />
                        {language === 'rw' ? 'Bika' : 'Save'}
                      </Button>
                      <Button variant="outline" className="flex-1">
                        <Share2 className="w-4 h-4 mr-2" />
                        {language === 'rw' ? 'Sangiza' : 'Share'}
                      </Button>
                    </div>

                    <Button variant="outline" className="w-full" onClick={() => onNavigate('contactUs')}>
                      <Phone className="w-4 h-4 mr-2" />
                      {language === 'rw' ? 'Twandikire' : 'Contact Us'}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Curriculum Tab */}
          <TabsContent value="curriculum" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {trade.curriculum.map((level, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2 }}
                >
                  <Card className="border-2 border-gray-200 h-full">
                    <CardHeader className={`bg-gradient-to-r ${trade.gradient} text-white`}>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-2xl">{level.level}</CardTitle>
                        <Badge className="bg-white/20 text-white border-0 text-lg px-4 py-1">
                          {level.duration}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <h4 className="font-bold text-gray-900 mb-4">
                        {language === 'rw' ? 'Amasomo:' : 'Modules:'}
                      </h4>
                      <div className="space-y-3">
                        {level.modules.map((module, moduleIndex) => (
                          <div key={moduleIndex} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                            <span className="font-medium text-gray-700">{module}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Instructors Tab */}
          <TabsContent value="instructors" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trade.instructors.map((instructor, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.15 }}
                >
                  <Card className="border-2 border-gray-200 hover:shadow-xl transition-all">
                    <CardContent className="p-6 text-center">
                      <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-gray-200">
                        <AvatarImage src={instructor.image} alt={instructor.name} />
                        <AvatarFallback className={`bg-gradient-to-br ${trade.gradient} text-white text-2xl font-bold`}>
                          {instructor.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{instructor.name}</h3>
                      <Badge className={`bg-gradient-to-r ${trade.gradient} text-white border-0 mb-3`}>
                        {instructor.role}
                      </Badge>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center justify-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{instructor.experience} experience</span>
                        </div>
                        <div className="flex items-center justify-center gap-2">
                          <Mail className="w-4 h-4" />
                          <span>{instructor.email}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Gallery Tab */}
          <TabsContent value="gallery" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {trade.gallery.map((image, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="group cursor-pointer relative aspect-square rounded-2xl overflow-hidden"
                  onClick={() => setSelectedImage(image.url)}
                >
                  <img
                    src={image.url}
                    alt={image.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <p className="font-bold">{image.title}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Careers Tab */}
          <TabsContent value="careers" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {trade.careers.map((career, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.15 }}
                >
                  <Card className="border-2 border-gray-200 hover:shadow-xl transition-all">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${trade.gradient} flex items-center justify-center`}>
                          <Briefcase className="w-7 h-7 text-white" />
                        </div>
                        <Badge className="bg-green-100 text-green-700 font-bold">
                          {career.growth} growth
                        </Badge>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{career.title}</h3>
                      <div className="flex items-center gap-2 text-lg">
                        <span className="font-bold text-green-600">{career.salary}</span>
                        <span className="text-gray-500">/ year</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* CTA */}
            <Card className={`bg-gradient-to-r ${trade.gradient} border-0 mt-8`}>
              <CardContent className="p-8 text-center text-white">
                <h3 className="text-2xl font-bold mb-4">
                  {language === 'rw' ? 'Witeguye Gutangira?' : 'Ready to Start?'}
                </h3>
                <p className="text-white/90 mb-6 max-w-2xl mx-auto">
                  {language === 'rw' 
                    ? 'Iyandikishe uyu munsi maze utangire urugendo rwawe rwo gutsinda mu mwuga wa tekiniki.' 
                    : 'Enroll today and begin your journey to a successful career in technology.'}
                </p>
                <Button 
                  size="lg"
                  onClick={() => onNavigate('register')}
                  className="bg-white text-gray-900 hover:bg-gray-100 font-bold px-8 py-6 text-lg"
                >
                  {language === 'rw' ? 'Iyandikishe Nonaha' : 'Enroll Now'}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Image Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <motion.img
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              src={selectedImage}
              alt="Gallery"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            <Button
              variant="ghost"
              className="absolute top-4 right-4 text-white hover:bg-white/20"
              onClick={() => setSelectedImage(null)}
            >
              ✕
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TradeDetailPage;
