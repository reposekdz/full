import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { 
  Car, 
  Users, 
  Award, 
  Star, 
  BookOpen, 
  TrendingUp, 
  ArrowRight, 
  ChevronLeft,
  ChevronRight,
  Wrench,
  GraduationCap,
  Briefcase,
  CheckCircle2,
  Zap,
  Settings,
  Gauge,
  Cog,
  Battery,
  Zap as Lightning,
  Quote,
  Mail,
  Phone,
  ZoomIn,
  X,
  Fuel,
  Play,
  Calendar,
  MessageCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Progress } from '@/app/components/ui/progress';
import { Dialog, DialogContent } from '@/app/components/ui/dialog';
import { 
  TradeInquiryModal, 
  TradeFAQSection, 
  TradeVideoModal, 
  TradeCurriculumTimeline,
  TradePartnersSection,
  ScheduleVisitModal 
} from '@/app/components/trades';

interface AUTTradePageProps {
  onNavigate: (page: string) => void;
}

const AUTTradePage: React.FC<AUTTradePageProps> = ({ onNavigate }) => {
  const TRADE_CODE = 'AUT';
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [currentGalleryIndex, setCurrentGalleryIndex] = useState(0);
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  const [tradeInfo, setTradeInfo] = useState<any>(null);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);

  useEffect(() => {
    const loadTradeData = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/trades/code/${TRADE_CODE}`);
        const data = await res.json();
        if (data?.success) {
          setTradeInfo(data.trade || null);
          setTeachers(Array.isArray(data.instructors) ? data.instructors : []);
          setStudents(Array.isArray(data.students) ? data.students : []);
        }
      } catch (e) {
        setTeachers([]);
        setStudents([]);
        setTradeInfo(null);
      }
    };

    loadTradeData();
  }, []);

  const programs = [
    {
      level: 'Level 3 AUT',
      duration: '1 Year',
      description: 'Foundation in automotive basics, maintenance, and safety',
      modules: ['Auto Basics', 'Engine Fundamentals', 'Basic Repair', 'Safety Protocols']
    },
    {
      level: 'Level 4A AUT',
      duration: '6 Months',
      description: 'Advanced engine systems and electrical diagnostics',
      modules: ['Engine Systems', 'Electrical Diagnostics', 'Fuel Systems', 'Transmission']
    },
    {
      level: 'Level 4B AUT',
      duration: '6 Months',
      description: 'Specialized automotive systems and technologies',
      modules: ['Brake Systems', 'Suspension', 'AC Systems', 'Performance Tuning']
    },
    {
      level: 'Level 5A AUT',
      duration: '6 Months',
      description: 'Electric vehicles and hybrid technology',
      modules: ['EV Technology', 'Battery Systems', 'Hybrid Engines', 'Charging Systems']
    },
    {
      level: 'Level 5B AUT',
      duration: '6 Months',
      description: 'Advanced diagnostics and automotive management',
      modules: ['Computer Diagnostics', 'Shop Management', 'Customer Service', 'Capstone Project']
    }
  ];

  const tools = [
    { name: 'Diagnostic Scanners', icon: Settings, description: 'OBD-II diagnostic tools', image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&q=80' },
    { name: 'Engine Hoists', icon: Cog, description: 'Heavy-duty lifting equipment', image: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=400&q=80' },
    { name: 'Power Tools', icon: Wrench, description: 'Pneumatic & electric tools', image: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=400&q=80' },
    { name: 'Brake Systems', icon: Car, description: 'Brake testing equipment', image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&q=80' },
    { name: 'Battery Testers', icon: Battery, description: 'EV battery diagnostics', image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=400&q=80' },
    { name: 'Alignment Tools', icon: Gauge, description: 'Wheel alignment systems', image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&q=80' },
    { name: 'Welding Equipment', icon: Fuel, description: 'Auto body repair tools', image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400&q=80' },
    { name: 'EV Charging Stations', icon: Lightning, description: 'Electric vehicle chargers', image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=400&q=80' }
  ];

  const gallery = [
    { url: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&q=80', title: 'Automotive Workshop', category: 'Facilities' },
    { url: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=800&q=80', title: 'Engine Diagnostics', category: 'Classes' },
    { url: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=800&q=80', title: 'Hands-On Training', category: 'Workshops' },
    { url: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=80', title: 'Modern Auto Lab', category: 'Facilities' },
    { url: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&q=80', title: 'Electric Vehicle Training', category: 'Classes' },
    { url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80', title: 'Performance Testing', category: 'Projects' },
    { url: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&q=80', title: 'Auto Repair Workshop', category: 'Workshops' },
    { url: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800&q=80', title: 'EV Technology Lab', category: 'Facilities' }
  ];

  const achievements = [
    { title: 'National Auto Skills Competition Winner 2023', icon: Award },
    { title: 'Best EV Project Innovation 2024', icon: Lightning },
    { title: '93% Graduate Employment Rate', icon: Briefcase },
    { title: 'Partnership with 15+ Auto Companies', icon: Car }
  ];

  const testimonials = [
    { 
      name: 'Emmanuel Mugisha', 
      role: 'Level 5B Student', 
      text: 'The AUT program prepared me for the modern automotive industry with cutting-edge EV training.',
      rating: 5 
    },
    { 
      name: 'Sandra Uwera', 
      role: 'Graduate 2023', 
      text: 'Amazing practical experience and expert instructors. I now run my own auto repair shop.',
      rating: 5 
    },
    { 
      name: 'David Habimana', 
      role: 'Alumni', 
      text: 'The hands-on training with real vehicles gave me confidence to work in any garage.',
      rating: 5 
    }
  ];

  const stats = [
    { label: 'Active Students', value: tradeInfo?.total_students ?? students.length, icon: Users, color: 'from-green-500 to-teal-500' },
    { label: 'Expert Teachers', value: tradeInfo?.total_instructors ?? teachers.length, icon: GraduationCap, color: 'from-cyan-500 to-blue-500' },
    { label: 'Success Rate', value: '93%', icon: TrendingUp, color: 'from-yellow-500 to-orange-500' },
    { label: 'Industry Partners', value: '15+', icon: Briefcase, color: 'from-purple-500 to-pink-500' }
  ];

  const faqs = [
    {
      question: 'What vehicles will I work on during training?',
      answer: 'You will work on a variety of vehicles including passenger cars, light trucks, and commercial vehicles. We also have dedicated EV and hybrid training vehicles.'
    },
    {
      question: 'Do I need any prior mechanical experience?',
      answer: 'No prior experience is required. Our Level 3 program starts from the fundamentals and progressively builds your skills to professional level.'
    },
    {
      question: 'What certifications will I earn?',
      answer: 'You will earn industry-recognized certifications including ASE-equivalent credentials, EV safety certification, and our TVET professional diploma.'
    },
    {
      question: 'Is EV training included in the program?',
      answer: 'Yes! Levels 5A and 5B focus extensively on electric vehicle technology, hybrid systems, and modern computer diagnostics.'
    },
    {
      question: 'Will I learn about modern car computers?',
      answer: 'Absolutely. You will learn OBD-II diagnostics, ECU programming, and advanced computer-based troubleshooting using industry-standard tools.'
    },
    {
      question: 'Can I start my own auto repair business?',
      answer: 'Yes! Our program includes business management and entrepreneurship training specifically designed to help graduates start their own workshops.'
    }
  ];

  const partners = [
    { name: 'Toyota Rwanda', description: 'Official Toyota dealership & service', type: 'employment' as const },
    { name: 'CFAO Motors', description: 'Multi-brand automotive group', type: 'internship' as const },
    { name: 'Bosch Diagnostics', description: 'Diagnostic equipment supplier', type: 'equipment' as const },
    { name: 'EV Rwanda', description: 'Electric vehicle specialists', type: 'training' as const },
    { name: 'AutoZone Partners', description: 'Parts and accessories supplier', type: 'equipment' as const },
    { name: 'Kigali Motors', description: 'Premium auto service center', type: 'employment' as const },
    { name: 'Tesla Service Center', description: 'EV service training partner', type: 'training' as const },
    { name: 'Auto Excellence', description: 'Luxury vehicle specialist', type: 'internship' as const }
  ];

  const nextGalleryImage = () => {
    setCurrentGalleryIndex((prev) => (prev + 1) % gallery.length);
  };

  const prevGalleryImage = () => {
    setCurrentGalleryIndex((prev) => (prev - 1 + gallery.length) % gallery.length);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-cyan-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-green-600 via-teal-600 to-cyan-600 text-white">
        <div className="absolute inset-0 opacity-20">
          <motion.div
            animate={{ 
              backgroundPosition: ['0% 0%', '100% 100%'],
            }}
            transition={{ duration: 20, repeat: Infinity, repeatType: 'reverse' }}
            className="w-full h-full"
            style={{
              backgroundImage: 'url(https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=1200&q=80)',
              backgroundSize: 'cover'
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <Badge className="mb-6 bg-white/20 text-white border-white/30 text-lg px-6 py-2">
              <Car className="w-5 h-5 mr-2" />
              Automobile Technology Program
            </Badge>
            <h1 className="text-5xl md:text-7xl font-black mb-6">
              Master Automotive Technology
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-green-100 max-w-3xl mx-auto">
              From classic engines to electric vehicles - become an expert in modern automotive technology
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button 
                size="lg" 
                className="bg-white text-green-600 hover:bg-green-50 text-lg px-8 py-6"
                onClick={() => setShowInquiryModal(true)}
              >
                Enroll Now
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-6"
                onClick={() => setShowVideoModal(true)}
              >
                <Play className="mr-2 w-5 h-5" />
                Watch Video
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-6"
                onClick={() => setShowScheduleModal(true)}
              >
                <Calendar className="mr-2 w-5 h-5" />
                Schedule Visit
              </Button>
            </div>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-center border border-white/20"
                >
                  <Icon className="w-8 h-8 mx-auto mb-3" />
                  <p className="text-3xl font-black mb-1">{stat.value}</p>
                  <p className="text-sm text-green-100">{stat.label}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 gap-2 bg-white p-2 rounded-2xl shadow-lg">
            <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-teal-500 data-[state=active]:text-white">
              Overview
            </TabsTrigger>
            <TabsTrigger value="programs" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-teal-500 data-[state=active]:text-white">
              Programs
            </TabsTrigger>
            <TabsTrigger value="tools" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-teal-500 data-[state=active]:text-white">
              Tools & Equipment
            </TabsTrigger>
            <TabsTrigger value="teachers" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-teal-500 data-[state=active]:text-white">
              Teachers
            </TabsTrigger>
            <TabsTrigger value="students" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-teal-500 data-[state=active]:text-white">
              Students
            </TabsTrigger>
            <TabsTrigger value="gallery" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-teal-500 data-[state=active]:text-white">
              Gallery
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            <Card className="border-2 border-green-200">
              <CardHeader>
                <CardTitle className="text-3xl flex items-center">
                  <BookOpen className="w-8 h-8 mr-3 text-green-600" />
                  About Automobile Technology
                </CardTitle>
                <CardDescription className="text-lg">
                  Comprehensive program covering traditional and modern automotive systems
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-gray-700 text-lg leading-relaxed">
                  Our Automobile Technology program equips students with expertise in vehicle diagnostics, repair, 
                  maintenance, and the latest electric vehicle technology. With comprehensive training in both 
                  traditional combustion engines and modern EV systems, graduates are ready for the automotive industry's future.
                </p>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center">
                      <CheckCircle2 className="w-6 h-6 mr-2 text-green-500" />
                      What You'll Learn
                    </h3>
                    <ul className="space-y-3">
                      {[
                        'Engine Diagnostics & Repair',
                        'Electric Vehicle Technology',
                        'Auto Electrical Systems',
                        'Transmission & Drivetrain',
                        'Brake & Suspension Systems',
                        'Computer-Based Diagnostics',
                        'Hybrid Vehicle Technology',
                        'Auto Body & Paint'
                      ].map((item, index) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-start"
                        >
                          <Zap className="w-5 h-5 mr-2 text-yellow-500 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{item}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center">
                      <Award className="w-6 h-6 mr-2 text-green-500" />
                      Career Opportunities
                    </h3>
                    <ul className="space-y-3">
                      {[
                        'Automotive Technician',
                        'EV Specialist',
                        'Diagnostic Technician',
                        'Auto Service Manager',
                        'Auto Electrician',
                        'Shop Foreman',
                        'Parts Manager',
                        'Auto Entrepreneur'
                      ].map((item, index) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-start"
                        >
                          <Briefcase className="w-5 h-5 mr-2 text-purple-500 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{item}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card className="border-2 border-green-200">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center">
                  <Award className="w-7 h-7 mr-3 text-yellow-600" />
                  Our Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {achievements.map((achievement, index) => {
                    const Icon = achievement.icon;
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-xl border-2 border-green-200"
                      >
                        <div className="p-3 bg-gradient-to-br from-green-500 to-teal-500 rounded-lg mr-4">
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <p className="font-bold text-gray-900">{achievement.title}</p>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Testimonials */}
            <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-teal-50">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center">
                  <Quote className="w-7 h-7 mr-3 text-green-600" />
                  Student Testimonials
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  {testimonials.map((testimonial, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white rounded-xl p-6 shadow-md"
                    >
                      <div className="flex mb-3">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                        ))}
                      </div>
                      <p className="text-gray-700 mb-4 italic">"{testimonial.text}"</p>
                      <div>
                        <p className="font-bold text-gray-900">{testimonial.name}</p>
                        <p className="text-sm text-gray-600">{testimonial.role}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* FAQ Section */}
            <TradeFAQSection 
              faqs={faqs}
              accentColor="text-green-600"
              borderColor="border-green-200"
            />

            {/* Industry Partners */}
            <TradePartnersSection
              partners={partners}
              accentColor="text-green-600"
              borderColor="border-green-200"
              gradientColor="from-green-500 to-teal-500"
            />
          </TabsContent>

          {/* Programs Tab */}
          <TabsContent value="programs" className="space-y-6">
            <TradeCurriculumTimeline
              programs={programs}
              accentColor="text-green-600"
              borderColor="border-green-200"
              gradientColor="from-green-500 to-teal-500"
            />

            <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-teal-50">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">Ready to Get Started?</h3>
                    <p className="text-gray-600">Choose your level and begin your automotive journey</p>
                  </div>
                  <div className="flex gap-3">
                    <Button 
                      className="bg-gradient-to-r from-green-500 to-teal-500 text-white"
                      onClick={() => setShowInquiryModal(true)}
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Inquire Now
                    </Button>
                    <Button 
                      variant="outline" 
                      className="border-green-300 text-green-700"
                      onClick={() => setShowScheduleModal(true)}
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Visit Campus
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tools & Equipment Tab */}
          <TabsContent value="tools" className="space-y-6">
            <Card className="border-2 border-green-200">
              <CardHeader>
                <CardTitle className="text-3xl flex items-center">
                  <Wrench className="w-8 h-8 mr-3 text-green-600" />
                  Tools & Equipment
                </CardTitle>
                <CardDescription className="text-lg">
                  Professional automotive tools and diagnostic equipment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {tools.map((tool, index) => {
                    const Icon = tool.icon;
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="group"
                      >
                        <Card className="border-2 border-green-200 hover:border-green-400 hover:shadow-xl transition-all overflow-hidden">
                          <div className="relative h-40 overflow-hidden">
                            <img 
                              src={tool.image} 
                              alt={tool.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-green-900/80 to-transparent" />
                            <div className="absolute bottom-3 left-3">
                              <Icon className="w-8 h-8 text-white" />
                            </div>
                          </div>
                          <CardContent className="p-4">
                            <h3 className="font-bold text-gray-900 mb-1">{tool.name}</h3>
                            <p className="text-sm text-gray-600">{tool.description}</p>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Teachers Tab */}
          <TabsContent value="teachers" className="space-y-6">
            <Card className="border-2 border-green-200">
              <CardHeader>
                <CardTitle className="text-3xl flex items-center">
                  <GraduationCap className="w-8 h-8 mr-3 text-green-600" />
                  Our Expert Teachers
                </CardTitle>
                <CardDescription className="text-lg">
                  Learn from experienced automotive professionals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {teachers.map((teacher, index) => (
                    <motion.div
                      key={teacher.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="border-2 border-green-200 hover:shadow-xl transition-all overflow-hidden">
                        <div className="relative h-64 overflow-hidden">
                          {teacher.image_url ? (
                            <img 
                              src={`http://localhost:5000${teacher.image_url}`} 
                              alt={teacher.name_rw || teacher.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-green-600 to-teal-600 flex items-center justify-center">
                              <div className="text-white text-4xl font-black">
                                {(teacher.name_rw || teacher.name || 'T').toString().charAt(0)}
                              </div>
                            </div>
                          )}
                          <div className="absolute top-4 right-4">
                            <Badge className="bg-gradient-to-r from-green-500 to-teal-500 text-white border-0">
                              {teacher.role_rw || teacher.role || 'Instructor'}
                            </Badge>
                          </div>
                        </div>
                        <CardContent className="p-6">
                          <h3 className="text-xl font-black text-gray-900 mb-1">{teacher.name_rw || teacher.name}</h3>
                          <p className="text-sm text-green-600 font-bold mb-3">
                            {teacher.specialization_rw || teacher.specialization || teacher.role || 'Instructor'}
                          </p>
                          
                          <div className="space-y-2 mb-4">
                            <div className="flex items-center text-sm text-gray-600">
                              <Award className="w-4 h-4 mr-2 text-green-500" />
                              {teacher.role_rw || teacher.role || 'Instructor'}
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <Briefcase className="w-4 h-4 mr-2 text-cyan-500" />
                              {teacher.experience_years || 0} years experience
                            </div>
                            {teacher.email && (
                              <div className="flex items-center text-sm text-gray-600">
                                <Mail className="w-4 h-4 mr-2 text-purple-500" />
                                {teacher.email}
                              </div>
                            )}
                            {teacher.phone && (
                              <div className="flex items-center text-sm text-gray-600">
                                <Phone className="w-4 h-4 mr-2 text-purple-500" />
                                {teacher.phone}
                              </div>
                            )}
                          </div>

                          <div className="flex gap-2 mt-4">
                            <Button size="sm" className="flex-1 bg-gradient-to-r from-green-500 to-teal-500 text-white">
                              <Mail className="w-4 h-4 mr-1" />
                              Contact
                            </Button>
                            <Button size="sm" variant="outline" className="border-green-300 text-green-700">
                              View Profile
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students" className="space-y-6">
            <Card className="border-2 border-green-200">
              <CardHeader>
                <CardTitle className="text-3xl flex items-center">
                  <Users className="w-8 h-8 mr-3 text-green-600" />
                  Our Students
                </CardTitle>
                <CardDescription className="text-lg">
                  Meet some of our talented students enrolled in the AUT program
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {students.map((student, index) => (
                    <motion.div
                      key={student.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="border-2 border-green-200 hover:shadow-xl transition-all">
                        <CardContent className="p-6">
                          <div className="flex flex-col items-center text-center mb-4">
                            <Avatar className="h-24 w-24 border-4 border-green-400 mb-3">
                              <AvatarFallback className="bg-gradient-to-br from-green-500 to-teal-500 text-white text-2xl font-bold">
                                {student.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <h3 className="font-black text-gray-900 text-lg">{student.name}</h3>
                            <Badge className="mt-2 bg-gradient-to-r from-green-500 to-teal-500 text-white border-0">
                              Level {student.level} {TRADE_CODE}
                            </Badge>
                            <p className="text-xs text-gray-600 mt-1">{student.student_code || student.studentCode}</p>
                          </div>

                          <div className="pt-3 border-t border-green-100 grid grid-cols-2 gap-2 text-center">
                            <div>
                              <p className="text-xs text-gray-600">Status</p>
                              <p className="text-lg font-black text-gray-900">{student.is_active ? 'Active' : 'Inactive'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600">Level</p>
                              <p className="text-lg font-black text-gray-900">{student.level}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Gallery Tab */}
          <TabsContent value="gallery" className="space-y-6">
            <Card className="border-2 border-green-200">
              <CardHeader>
                <CardTitle className="text-3xl flex items-center">
                  <ZoomIn className="w-8 h-8 mr-3 text-green-600" />
                  Photo Gallery
                </CardTitle>
                <CardDescription className="text-lg">
                  Explore our automotive workshops, labs, and training facilities
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Featured Image Carousel */}
                <div className="relative mb-8 rounded-2xl overflow-hidden">
                  <div className="aspect-video relative">
                    <img 
                      src={gallery[currentGalleryIndex].url}
                      alt={gallery[currentGalleryIndex].title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6">
                      <Badge className="mb-2 bg-green-500 text-white">
                        {gallery[currentGalleryIndex].category}
                      </Badge>
                      <h3 className="text-2xl font-black text-white">{gallery[currentGalleryIndex].title}</h3>
                    </div>
                  </div>
                  <button
                    onClick={prevGalleryImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg transition-all"
                  >
                    <ChevronLeft className="w-6 h-6 text-green-600" />
                  </button>
                  <button
                    onClick={nextGalleryImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg transition-all"
                  >
                    <ChevronRight className="w-6 h-6 text-green-600" />
                  </button>
                </div>

                {/* Gallery Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {gallery.map((image, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer border-2 border-transparent hover:border-green-400 transition-all"
                      onClick={() => setSelectedImage(image.url)}
                    >
                      <img 
                        src={image.url}
                        alt={image.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center">
                        <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <Badge className="bg-green-500 text-white text-xs">
                          {image.category}
                        </Badge>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-16"
        >
          <Card className="border-2 border-green-200 bg-gradient-to-r from-green-600 to-teal-600 text-white overflow-hidden">
            <CardContent className="p-12 text-center relative">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                  backgroundImage: 'url(https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=1200&q=80)',
                  backgroundSize: 'cover'
                }} />
              </div>
              <div className="relative z-10">
                <h2 className="text-4xl font-black mb-4">Ready to Start Your Automotive Journey?</h2>
                <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
                  Join our program and become an expert in modern automotive technology
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Button 
                    size="lg" 
                    className="bg-white text-green-600 hover:bg-green-50 text-lg px-8 py-6"
                    onClick={() => onNavigate('register')}
                  >
                    Apply Now
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-6"
                    onClick={() => onNavigate('contactUs')}
                  >
                    <Phone className="mr-2 w-5 h-5" />
                    Contact Us
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Image Zoom Dialog */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-6xl p-0 overflow-hidden">
          {selectedImage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative"
            >
              <img
                src={selectedImage}
                alt="Gallery Image"
                className="w-full h-auto max-h-[90vh] object-contain"
              />
              <Button
                variant="outline"
                className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm hover:bg-white"
                onClick={() => setSelectedImage(null)}
                size="icon"
              >
                <X className="w-5 h-5" />
              </Button>
            </motion.div>
          )}
        </DialogContent>
      </Dialog>

      {/* Interactive Modals */}
      <TradeInquiryModal
        open={showInquiryModal}
        onOpenChange={setShowInquiryModal}
        tradeName="Automobile Technology"
        tradeColor="from-green-500 to-teal-500"
        programs={programs.map(p => ({ level: p.level, duration: p.duration }))}
      />

      <TradeVideoModal
        open={showVideoModal}
        onOpenChange={setShowVideoModal}
        videoUrl="https://example.com/aut-program-video"
        title="Automobile Technology Program Overview"
      />

      <ScheduleVisitModal
        open={showScheduleModal}
        onOpenChange={setShowScheduleModal}
        tradeName="Automobile Technology"
        tradeColor="from-green-500 to-teal-500"
      />
    </div>
  );
};

export default AUTTradePage;
