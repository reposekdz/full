import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Code, 
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
  Globe,
  Database,
  Smartphone,
  Laptop,
  CloudIcon,
  Quote,
  Mail,
  Phone,
  ZoomIn,
  X,
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
import { getTeachersByTrade } from '@/app/data/mockTeachers';
import { mockStudents } from '@/app/data/mockStudents';
import { 
  TradeInquiryModal, 
  TradeFAQSection, 
  TradeVideoModal, 
  TradeCurriculumTimeline,
  TradePartnersSection,
  ScheduleVisitModal 
} from '@/app/components/trades';

interface SODTradePageProps {
  onNavigate: (page: string) => void;
}

const SODTradePage: React.FC<SODTradePageProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [currentGalleryIndex, setCurrentGalleryIndex] = useState(0);
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  const teachers = getTeachersByTrade('SOD');
  const students = mockStudents.filter(s => s.trade === 'SOD');

  const programs = [
    {
      level: 'Level 3 SOD',
      duration: '1 Year',
      description: 'Foundation in programming, web basics, and software fundamentals',
      modules: ['HTML/CSS Basics', 'JavaScript Fundamentals', 'Python Intro', 'Database Basics']
    },
    {
      level: 'Level 4 SOD',
      duration: '1 Year',
      description: 'Advanced programming concepts, frameworks, and application development',
      modules: ['React/Vue.js', 'Node.js', 'SQL Advanced', 'API Development', 'Mobile Apps']
    },
    {
      level: 'Level 5 SOD',
      duration: '1 Year',
      description: 'Professional software engineering with real-world projects',
      modules: ['Full-Stack Dev', 'Cloud Computing', 'DevOps', 'AI/ML Basics', 'Capstone Project']
    }
  ];

  const tools = [
    { name: 'Visual Studio Code', icon: Code, description: 'Industry-standard code editor', image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&q=80' },
    { name: 'Git & GitHub', icon: Globe, description: 'Version control and collaboration', image: 'https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=400&q=80' },
    { name: 'React & Vue.js', icon: Smartphone, description: 'Modern frontend frameworks', image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&q=80' },
    { name: 'Node.js & Express', icon: Database, description: 'Backend development tools', image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&q=80' },
    { name: 'MongoDB & PostgreSQL', icon: Database, description: 'Database management systems', image: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=400&q=80' },
    { name: 'AWS Cloud Services', icon: CloudIcon, description: 'Cloud deployment platform', image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&q=80' },
    { name: 'Docker', icon: Laptop, description: 'Containerization technology', image: 'https://images.unsplash.com/photo-1605745341112-85968b19335b?w=400&q=80' },
    { name: 'Figma & Adobe XD', icon: Briefcase, description: 'UI/UX design tools', image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&q=80' }
  ];

  const gallery = [
    { url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80', title: 'Modern Computer Lab', category: 'Facilities' },
    { url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80', title: 'Collaborative Learning', category: 'Classes' },
    { url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&q=80', title: 'Student Projects', category: 'Projects' },
    { url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80', title: 'Team Workshops', category: 'Workshops' },
    { url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80', title: 'Coding Sessions', category: 'Classes' },
    { url: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=80', title: 'Innovation Lab', category: 'Facilities' },
    { url: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800&q=80', title: 'Mobile Development', category: 'Projects' },
    { url: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&q=80', title: 'Web Development', category: 'Projects' }
  ];

  const achievements = [
    { title: 'National Coding Competition Winner 2023', icon: Award },
    { title: 'Best App Development Project 2024', icon: Smartphone },
    { title: '94% Graduate Employment Rate', icon: Briefcase },
    { title: 'Industry Partnership with 15+ Tech Companies', icon: Globe }
  ];

  const testimonials = [
    { 
      name: 'Jean Mugisha', 
      role: 'Level 5 Student', 
      text: 'The SOD program transformed my life. I now work as a full-stack developer.',
      rating: 5 
    },
    { 
      name: 'Marie Uwase', 
      role: 'Graduate 2023', 
      text: 'Excellent teachers and modern curriculum. Highly recommended!',
      rating: 5 
    },
    { 
      name: 'Eric Habimana', 
      role: 'Alumni', 
      text: 'The hands-on approach and real projects gave me industry-ready skills.',
      rating: 5 
    }
  ];

  const stats = [
    { label: 'Active Students', value: students.length, icon: Users, color: 'from-blue-500 to-indigo-500' },
    { label: 'Expert Teachers', value: teachers.length, icon: GraduationCap, color: 'from-green-500 to-teal-500' },
    { label: 'Success Rate', value: '94%', icon: TrendingUp, color: 'from-yellow-500 to-orange-500' },
    { label: 'Industry Partners', value: '15+', icon: Briefcase, color: 'from-purple-500 to-pink-500' }
  ];

  const faqs = [
    {
      question: 'What are the admission requirements for the SOD program?',
      answer: 'Applicants need a secondary school certificate (O-Level or A-Level) with good grades in Mathematics and English. Basic computer literacy is preferred but not required as we provide foundation training.'
    },
    {
      question: 'How long does it take to complete the full program?',
      answer: 'The complete program spans 3 years (Levels 3, 4, and 5), with each level taking approximately 1 year. Students can also enroll in individual levels based on their prior experience.'
    },
    {
      question: 'What programming languages will I learn?',
      answer: 'You will learn HTML, CSS, JavaScript, Python, React, Node.js, SQL, and more. The curriculum is regularly updated to include the latest industry-demanded technologies.'
    },
    {
      question: 'Are there internship opportunities?',
      answer: 'Yes! We have partnerships with 15+ tech companies that provide internship opportunities. Many students secure full-time employment through these internships.'
    },
    {
      question: 'What equipment do I need to bring?',
      answer: 'A personal laptop is recommended but not required. Our labs are equipped with modern computers and all necessary software. We provide free access to cloud development tools.'
    },
    {
      question: 'Is financial aid available?',
      answer: 'Yes, we offer scholarships for outstanding students and flexible payment plans. Government education loans are also available through our partnerships with local banks.'
    }
  ];

  const partners = [
    { name: 'TechCorp Rwanda', description: 'Leading software development company', type: 'employment' as const },
    { name: 'Digital Hub', description: 'Innovation and technology center', type: 'training' as const },
    { name: 'Microsoft Partners', description: 'Global technology partner', type: 'equipment' as const },
    { name: 'StartUp Kigali', description: 'Tech startup incubator', type: 'internship' as const },
    { name: 'CodeLab Africa', description: 'Pan-African coding bootcamp', type: 'training' as const },
    { name: 'AWS Academy', description: 'Cloud computing certification partner', type: 'equipment' as const },
    { name: 'iHUB Rwanda', description: 'Technology innovation hub', type: 'internship' as const },
    { name: 'MTN Digital', description: 'Telecommunications leader', type: 'employment' as const }
  ];

  const nextGalleryImage = () => {
    setCurrentGalleryIndex((prev) => (prev + 1) % gallery.length);
  };

  const prevGalleryImage = () => {
    setCurrentGalleryIndex((prev) => (prev - 1 + gallery.length) % gallery.length);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white">
        <div className="absolute inset-0 opacity-20">
          <motion.div
            animate={{ 
              backgroundPosition: ['0% 0%', '100% 100%'],
            }}
            transition={{ duration: 20, repeat: Infinity, repeatType: 'reverse' }}
            className="w-full h-full"
            style={{
              backgroundImage: 'url(https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&q=80)',
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
              <Code className="w-5 h-5 mr-2" />
              Software Development Program
            </Badge>
            <h1 className="text-5xl md:text-7xl font-black mb-6">
              Master Software Development
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              Transform your passion for technology into a rewarding career with our comprehensive software development program
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button 
                size="lg" 
                className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-8 py-6"
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
                  <p className="text-sm text-blue-100">{stat.label}</p>
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
            <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white">
              Overview
            </TabsTrigger>
            <TabsTrigger value="programs" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white">
              Programs
            </TabsTrigger>
            <TabsTrigger value="tools" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white">
              Tools & Tech
            </TabsTrigger>
            <TabsTrigger value="teachers" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white">
              Teachers
            </TabsTrigger>
            <TabsTrigger value="students" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white">
              Students
            </TabsTrigger>
            <TabsTrigger value="gallery" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white">
              Gallery
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            <Card className="border-2 border-blue-200">
              <CardHeader>
                <CardTitle className="text-3xl flex items-center">
                  <BookOpen className="w-8 h-8 mr-3 text-blue-600" />
                  About Software Development
                </CardTitle>
                <CardDescription className="text-lg">
                  Comprehensive program designed to make you industry-ready
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-gray-700 text-lg leading-relaxed">
                  Our Software Development program is designed to equip students with cutting-edge skills in programming, 
                  web development, mobile applications, and cloud technologies. With a perfect blend of theoretical knowledge 
                  and hands-on practice, students graduate ready to tackle real-world challenges in the tech industry.
                </p>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center">
                      <CheckCircle2 className="w-6 h-6 mr-2 text-green-500" />
                      What You'll Learn
                    </h3>
                    <ul className="space-y-3">
                      {[
                        'Full-Stack Web Development (Frontend & Backend)',
                        'Mobile Application Development (iOS & Android)',
                        'Database Design and Management',
                        'Cloud Computing & DevOps',
                        'Software Engineering Best Practices',
                        'Agile Project Management',
                        'UI/UX Design Principles',
                        'Version Control with Git'
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
                      <Award className="w-6 h-6 mr-2 text-blue-500" />
                      Career Opportunities
                    </h3>
                    <ul className="space-y-3">
                      {[
                        'Full-Stack Developer',
                        'Frontend Developer',
                        'Backend Developer',
                        'Mobile App Developer',
                        'DevOps Engineer',
                        'Software Engineer',
                        'UI/UX Designer',
                        'Technical Project Manager'
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
            <Card className="border-2 border-blue-200">
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
                        className="flex items-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200"
                      >
                        <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg mr-4">
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
            <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center">
                  <Quote className="w-7 h-7 mr-3 text-blue-600" />
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
              accentColor="text-blue-600"
              borderColor="border-blue-200"
            />

            {/* Industry Partners */}
            <TradePartnersSection
              partners={partners}
              accentColor="text-blue-600"
              borderColor="border-blue-200"
              gradientColor="from-blue-500 to-indigo-500"
            />
          </TabsContent>

          {/* Programs Tab */}
          <TabsContent value="programs" className="space-y-6">
            {/* Interactive Curriculum Timeline */}
            <TradeCurriculumTimeline
              programs={programs}
              accentColor="text-blue-600"
              borderColor="border-blue-200"
              gradientColor="from-blue-500 to-indigo-500"
            />

            {/* Quick Enroll CTA */}
            <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">Ready to Start?</h3>
                    <p className="text-gray-600">Choose your level and begin your journey in software development</p>
                  </div>
                  <div className="flex gap-3">
                    <Button 
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white"
                      onClick={() => setShowInquiryModal(true)}
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Inquire Now
                    </Button>
                    <Button 
                      variant="outline" 
                      className="border-blue-300 text-blue-700"
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

          {/* Tools & Tech Tab */}
          <TabsContent value="tools" className="space-y-6">
            <Card className="border-2 border-blue-200">
              <CardHeader>
                <CardTitle className="text-3xl flex items-center">
                  <Wrench className="w-8 h-8 mr-3 text-blue-600" />
                  Technologies & Tools
                </CardTitle>
                <CardDescription className="text-lg">
                  Industry-standard tools and technologies you'll master
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
                        <Card className="border-2 border-blue-200 hover:border-blue-400 hover:shadow-xl transition-all overflow-hidden">
                          <div className="relative h-40 overflow-hidden">
                            <img 
                              src={tool.image} 
                              alt={tool.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 to-transparent" />
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
            <Card className="border-2 border-blue-200">
              <CardHeader>
                <CardTitle className="text-3xl flex items-center">
                  <GraduationCap className="w-8 h-8 mr-3 text-blue-600" />
                  Our Expert Teachers
                </CardTitle>
                <CardDescription className="text-lg">
                  Learn from industry professionals with years of experience
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
                      <Card className="border-2 border-blue-200 hover:shadow-xl transition-all overflow-hidden">
                        <div className="relative h-64 overflow-hidden">
                          <img 
                            src={teacher.photoUrl} 
                            alt={teacher.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-4 right-4">
                            <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                              <Star className="w-4 h-4 mr-1 fill-white" />
                              {teacher.rating}
                            </Badge>
                          </div>
                        </div>
                        <CardContent className="p-6">
                          <h3 className="text-xl font-black text-gray-900 mb-1">{teacher.name}</h3>
                          <p className="text-sm text-blue-600 font-bold mb-3">{teacher.specialization}</p>
                          <p className="text-sm text-gray-600 mb-4">{teacher.bio}</p>
                          
                          <div className="space-y-2 mb-4">
                            <div className="flex items-center text-sm text-gray-600">
                              <Award className="w-4 h-4 mr-2 text-blue-500" />
                              {teacher.qualification}
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <Briefcase className="w-4 h-4 mr-2 text-green-500" />
                              {teacher.experience} years experience
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <Users className="w-4 h-4 mr-2 text-purple-500" />
                              {teacher.studentsCount} students
                            </div>
                          </div>

                          <div className="pt-4 border-t border-blue-100">
                            <p className="text-xs font-bold text-gray-700 mb-2">Teaching:</p>
                            <div className="flex flex-wrap gap-2">
                              {teacher.coursesTeaching.slice(0, 2).map((course, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs border-blue-300 text-blue-700">
                                  {course}
                                </Badge>
                              ))}
                              {teacher.coursesTeaching.length > 2 && (
                                <Badge variant="outline" className="text-xs border-blue-300 text-blue-700">
                                  +{teacher.coursesTeaching.length - 2}
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className="flex gap-2 mt-4">
                            <Button size="sm" className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                              <Mail className="w-4 h-4 mr-1" />
                              Contact
                            </Button>
                            <Button size="sm" variant="outline" className="border-blue-300 text-blue-700">
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
            <Card className="border-2 border-blue-200">
              <CardHeader>
                <CardTitle className="text-3xl flex items-center">
                  <Users className="w-8 h-8 mr-3 text-blue-600" />
                  Our Students
                </CardTitle>
                <CardDescription className="text-lg">
                  Meet some of our talented students enrolled in the SOD program
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
                      <Card className="border-2 border-blue-200 hover:shadow-xl transition-all">
                        <CardContent className="p-6">
                          <div className="flex flex-col items-center text-center mb-4">
                            <Avatar className="h-24 w-24 border-4 border-blue-400 mb-3">
                              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white text-2xl font-bold">
                                {student.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <h3 className="font-black text-gray-900 text-lg">{student.name}</h3>
                            <Badge className="mt-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-0">
                              {student.level}
                            </Badge>
                            <p className="text-xs text-gray-600 mt-1">{student.studentCode}</p>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <div className="flex items-center justify-between text-sm mb-2">
                                <span className="text-gray-600 flex items-center">
                                  <TrendingUp className="w-4 h-4 mr-1" />
                                  Performance
                                </span>
                                <span className="font-bold text-gray-900">{student.overallAverage}%</span>
                              </div>
                              <Progress value={student.overallAverage} className="h-2" />
                            </div>

                            <div>
                              <div className="flex items-center justify-between text-sm mb-2">
                                <span className="text-gray-600 flex items-center">
                                  <CheckCircle2 className="w-4 h-4 mr-1" />
                                  Attendance
                                </span>
                                <span className="font-bold text-gray-900">{student.attendanceRate}%</span>
                              </div>
                              <Progress value={student.attendanceRate} className="h-2" />
                            </div>

                            <div className="pt-3 border-t border-blue-100 grid grid-cols-2 gap-2 text-center">
                              <div>
                                <p className="text-xs text-gray-600">Behavior</p>
                                <p className="text-lg font-black text-gray-900">{student.behaviorScore}%</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600">Grades</p>
                                <p className="text-lg font-black text-gray-900">{student.grades.length}</p>
                              </div>
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
            <Card className="border-2 border-blue-200">
              <CardHeader>
                <CardTitle className="text-3xl flex items-center">
                  <ZoomIn className="w-8 h-8 mr-3 text-blue-600" />
                  Photo Gallery
                </CardTitle>
                <CardDescription className="text-lg">
                  Explore our facilities, workshops, and student activities
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
                      <Badge className="mb-2 bg-blue-500 text-white">
                        {gallery[currentGalleryIndex].category}
                      </Badge>
                      <h3 className="text-2xl font-black text-white">{gallery[currentGalleryIndex].title}</h3>
                    </div>
                  </div>
                  <button
                    onClick={prevGalleryImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg transition-all"
                  >
                    <ChevronLeft className="w-6 h-6 text-blue-600" />
                  </button>
                  <button
                    onClick={nextGalleryImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg transition-all"
                  >
                    <ChevronRight className="w-6 h-6 text-blue-600" />
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
                      className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer border-2 border-transparent hover:border-blue-400 transition-all"
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
                        <Badge className="bg-blue-500 text-white text-xs">
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
          <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-600 to-indigo-600 text-white overflow-hidden">
            <CardContent className="p-12 text-center relative">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                  backgroundImage: 'url(https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&q=80)',
                  backgroundSize: 'cover'
                }} />
              </div>
              <div className="relative z-10">
                <h2 className="text-4xl font-black mb-4">Ready to Start Your Journey?</h2>
                <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                  Join hundreds of students who are building their future in software development
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Button 
                    size="lg" 
                    className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-8 py-6"
                    onClick={() => setShowInquiryModal(true)}
                  >
                    Apply Now
                    <ArrowRight className="ml-2 w-5 h-5" />
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
        tradeName="Software Development"
        tradeColor="from-blue-500 to-indigo-500"
        programs={programs.map(p => ({ level: p.level, duration: p.duration }))}
      />

      <TradeVideoModal
        open={showVideoModal}
        onOpenChange={setShowVideoModal}
        videoUrl="https://example.com/sod-program-video"
        title="Software Development Program Overview"
      />

      <ScheduleVisitModal
        open={showScheduleModal}
        onOpenChange={setShowScheduleModal}
        tradeName="Software Development"
        tradeColor="from-blue-500 to-indigo-500"
      />
    </div>
  );
};

export default SODTradePage;
