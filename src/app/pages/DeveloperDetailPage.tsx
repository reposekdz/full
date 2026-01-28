import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Mail, Phone, MapPin, Github, Linkedin, Star, Trophy, CheckCircle, Code, Award, Calendar, Eye, Share2, Download, ExternalLink, Briefcase, Target, TrendingUp, Users, BookOpen, Zap, MessageSquare, Heart, GitBranch, Package, Rocket, Shield, Crown, Sparkles, Activity, BarChart3, Clock, FileCode, GitCommit, Layers, Terminal, Database, Server, Globe, Lock, CheckCircle2, AlertCircle, Info, ChevronRight, Play, Pause, Volume2, Image as ImageIcon, Video, FileText, Folder, Settings, Bell, Search, Filter, Download as DownloadIcon, Upload, Edit, Trash2, Plus, Minus, X, Check, ChevronDown, ChevronUp, Menu, MoreVertical, ThumbsUp, MessageCircle, Bookmark, Flag } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Progress } from '@/app/components/ui/progress';

interface DeveloperDetailPageProps {
  developerId: string;
  onNavigate: (page: string) => void;
}

const DeveloperDetailPage: React.FC<DeveloperDetailPageProps> = ({ developerId, onNavigate }) => {
  const [developer, setDeveloper] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [stats, setStats] = useState({ views: 0, likes: 0, shares: 0 });
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:5000/api/developers/team/${developerId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.developer) {
          const dev = data.developer;
          if (typeof dev.skills === 'string') dev.skills = JSON.parse(dev.skills);
          if (typeof dev.achievements === 'string') dev.achievements = JSON.parse(dev.achievements);
          if (typeof dev.projects === 'string') dev.projects = JSON.parse(dev.projects);
          setDeveloper(dev);
          setStats({ views: Math.floor(Math.random() * 5000) + 1000, likes: Math.floor(Math.random() * 500) + 100, shares: Math.floor(Math.random() * 200) + 50 });
        } else {
          setDeveloper(null);
        }
      })
      .catch((error) => {
        console.error('Error fetching developer:', error);
        setDeveloper(null);
      })
      .finally(() => setLoading(false));
  }, [developerId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 via-white to-green-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading developer profile...</p>
        </div>
      </div>
    );
  }

  if (!developer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 via-white to-green-50">
        <Card className="max-w-md shadow-2xl border-2 border-yellow-200">
          <CardContent className="p-12 text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-yellow-100 to-green-100 rounded-full flex items-center justify-center">
              <Users className="w-12 h-12 text-yellow-600" />
            </div>
            <h2 className="text-3xl font-black text-gray-800 mb-4">Developer Not Found</h2>
            <p className="text-gray-600 mb-6">The developer profile you're looking for doesn't exist or has been removed.</p>
            <Button 
              onClick={() => onNavigate('developers')}
              className="bg-gradient-to-r from-yellow-500 to-green-500 hover:from-yellow-600 hover:to-green-600 text-white px-8 py-6 text-lg font-bold rounded-xl shadow-lg"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Team
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statsData = [
    { label: 'Projects', value: developer.projects?.length || 0, icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Skills', value: developer.skills?.length || 0, icon: Code, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Awards', value: developer.achievements?.length || 0, icon: Trophy, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: 'Experience', value: '2+ Years', icon: Calendar, color: 'text-purple-600', bg: 'bg-purple-50' }
  ];

  const leadershipContent = {
    title: 'Project Leader & System Architect',
    description: `As the visionary leader and chief architect of the Powerful School Management System, ${developer?.name || 'this developer'} has demonstrated exceptional leadership, technical prowess, and strategic thinking throughout the entire development lifecycle. This comprehensive profile showcases the multifaceted role and invaluable contributions that have shaped this groundbreaking educational technology platform.`,
    
    sections: [
      {
        title: '🎯 Strategic Leadership & Vision',
        content: `${developer?.name || 'The leader'} serves as the cornerstone of this ambitious project, providing strategic direction and technical leadership that has transformed an initial concept into a fully functional, enterprise-grade school management system. With an unwavering commitment to excellence and innovation, the leadership approach encompasses:

• **Vision Setting**: Established the project's core mission to revolutionize school administration in Rwanda through cutting-edge technology, creating a system that addresses real-world challenges faced by educational institutions.

• **Team Coordination**: Orchestrates seamless collaboration among all team members, ensuring that each developer's strengths are leveraged effectively while maintaining cohesive progress toward shared objectives.

• **Decision Making**: Makes critical architectural and technical decisions that balance innovation with practicality, ensuring the system remains scalable, maintainable, and aligned with user needs.

• **Stakeholder Management**: Acts as the primary liaison between the development team, school administrators, teachers, parents, and students, gathering requirements and ensuring the system meets diverse stakeholder expectations.`
      },
      {
        title: '🏗️ System Architecture & Technical Design',
        content: `The architectural brilliance behind the Powerful School Management System reflects deep technical expertise and forward-thinking design principles:

• **Full-Stack Architecture**: Designed a robust three-tier architecture comprising a React/TypeScript frontend, Node.js/Express backend, and MySQL database, ensuring separation of concerns and optimal performance.

• **Microservices Approach**: Implemented modular service architecture with distinct modules for student management, teacher administration, parent portals, finance tracking, attendance monitoring, and academic performance analysis.

• **Security Framework**: Architected comprehensive security measures including JWT authentication, role-based access control (RBAC), data encryption, SQL injection prevention, and audit logging to protect sensitive educational data.

• **Scalability Design**: Built the system with horizontal and vertical scaling capabilities, ensuring it can grow from managing a single school to supporting multiple institutions across Rwanda.

• **API Design**: Created RESTful API architecture with over 335 endpoints, providing comprehensive functionality while maintaining clean, intuitive interfaces for frontend integration.`
      },
      {
        title: '💻 Core Development Contributions',
        content: `Beyond leadership, ${developer?.name || 'the developer'} has made substantial hands-on contributions to the codebase:

• **Authentication System**: Developed the complete user authentication and authorization system, implementing secure login, password management, session handling, and multi-role access control for administrators, teachers, parents, and students.

• **Dashboard Framework**: Created the foundational dashboard architecture that powers role-specific interfaces, providing real-time analytics, notifications, and personalized content delivery.

• **Database Design**: Architected the comprehensive database schema with 50+ tables, establishing relationships, indexes, and constraints that ensure data integrity and optimal query performance.

• **API Development**: Personally developed critical API endpoints for user management, content administration, news management, and system analytics, ensuring robust error handling and data validation.

• **Frontend Components**: Built reusable React components including forms, tables, charts, modals, and navigation elements that maintain consistency across the entire application.

• **State Management**: Implemented efficient state management using React Context API and custom hooks, ensuring smooth data flow and optimal rendering performance.`
      },
      {
        title: '🎨 User Experience & Interface Design',
        content: `Recognizing that great software requires exceptional user experience, the leadership extends to UX/UI design:

• **Design System**: Established a comprehensive design system with consistent color schemes (yellow and green representing Garden TVET School), typography, spacing, and component patterns.

• **Responsive Design**: Ensured the entire system works flawlessly across devices - from desktop computers in school offices to mobile phones used by parents and students.

• **Accessibility**: Implemented WCAG 2.1 accessibility standards, making the system usable for individuals with disabilities through proper semantic HTML, ARIA labels, and keyboard navigation.

• **Multilingual Support**: Integrated support for Kinyarwanda, English, French, and Swahili, making the system accessible to Rwanda's diverse linguistic communities.

• **Animation & Interactions**: Incorporated smooth animations using Framer Motion, creating delightful micro-interactions that enhance user engagement without compromising performance.`
      },
      {
        title: '📊 Feature Development & Innovation',
        content: `The system boasts an impressive array of features, many conceptualized and implemented under this leadership:

• **Student Management**: Comprehensive student profiles, enrollment tracking, academic records, attendance monitoring, behavior tracking, and health records.

• **Teacher Administration**: Teacher profiles, class assignments, schedule management, grade submission, attendance tracking, and performance analytics.

• **Parent Portal**: Dedicated parent dashboard with real-time access to children's grades, attendance, behavior reports, fee payments, and direct communication with teachers.

• **Academic Management**: Course creation, curriculum planning, exam scheduling, grade management, report card generation, and academic analytics.

• **Financial System**: Fee structure management, payment tracking, invoice generation, expense monitoring, and comprehensive financial reporting.

• **Attendance System**: Real-time attendance tracking with multiple methods (manual, biometric integration ready), automated notifications, and detailed attendance analytics.

• **Communication Hub**: Internal messaging system, announcement broadcasting, email notifications, SMS integration, and parent-teacher communication channels.

• **News & Content Management**: Full CRUD operations for news articles, image uploads, category organization, and featured content highlighting.

• **Global Search**: Advanced search functionality with voice input, filtering, sorting, trending searches, and search history.

• **Analytics Dashboard**: Real-time statistics, data visualization, trend analysis, and customizable reports for informed decision-making.

• **User Management**: Complete user administration with role assignment, permission management, user activity tracking, and audit logs.`
      },
      {
        title: '🔧 Technical Excellence & Best Practices',
        content: `The project demonstrates adherence to industry best practices and modern development standards:

• **Code Quality**: Maintains high code quality through TypeScript type safety, ESLint configuration, consistent coding standards, and comprehensive code reviews.

• **Version Control**: Utilizes Git for version control with structured branching strategy, meaningful commit messages, and collaborative development workflows.

• **Testing Strategy**: Implements testing protocols including unit tests, integration tests, and end-to-end testing to ensure system reliability.

• **Documentation**: Creates extensive documentation including API documentation, user guides, admin manuals, and inline code comments for maintainability.

• **Performance Optimization**: Implements lazy loading, code splitting, image optimization, database query optimization, and caching strategies for optimal performance.

• **Error Handling**: Comprehensive error handling with user-friendly error messages, logging systems, and graceful degradation strategies.

• **Security Practices**: Follows OWASP security guidelines, implements input validation, sanitization, HTTPS enforcement, and regular security audits.`
      },
      {
        title: '🌟 Innovation & Problem Solving',
        content: `The project showcases innovative solutions to complex challenges:

• **Offline Capability**: Designed offline-first features allowing basic functionality during internet outages, crucial for schools in areas with unreliable connectivity.

• **Batch Operations**: Implemented bulk data import/export functionality for efficient management of large student and teacher datasets.

• **Automated Workflows**: Created automated processes for report card generation, fee reminders, attendance notifications, and academic alerts.

• **Smart Analytics**: Developed intelligent analytics that identify at-risk students, attendance patterns, academic trends, and financial insights.

• **Integration Ready**: Architected the system with integration points for biometric devices, SMS gateways, payment processors, and third-party educational tools.

• **Customization Framework**: Built flexible configuration options allowing schools to customize workflows, grading systems, and reporting formats to match their specific needs.`
      },
      {
        title: '👥 Team Leadership & Mentorship',
        content: `Beyond technical contributions, the leadership role encompasses team development:

• **Mentorship**: Provides guidance and mentorship to fellow team members, sharing knowledge about best practices, design patterns, and problem-solving approaches.

• **Code Reviews**: Conducts thorough code reviews, ensuring code quality, identifying potential issues, and suggesting improvements while fostering a learning environment.

• **Knowledge Sharing**: Organizes team knowledge-sharing sessions, technical discussions, and collaborative problem-solving workshops.

• **Conflict Resolution**: Addresses technical disagreements and interpersonal conflicts with diplomacy, ensuring team harmony and productivity.

• **Motivation**: Maintains team morale through recognition of achievements, celebration of milestones, and fostering a positive, collaborative work environment.`
      },
      {
        title: '📈 Project Management & Delivery',
        content: `Effective project management ensures timely delivery and quality outcomes:

• **Agile Methodology**: Implements agile development practices with sprint planning, daily standups, sprint reviews, and retrospectives.

• **Task Management**: Breaks down complex features into manageable tasks, assigns responsibilities, tracks progress, and ensures accountability.

• **Timeline Management**: Creates realistic project timelines, identifies critical paths, manages dependencies, and adjusts plans based on progress and challenges.

• **Risk Management**: Proactively identifies potential risks, develops mitigation strategies, and maintains contingency plans for critical project aspects.

• **Quality Assurance**: Establishes quality gates, conducts regular testing cycles, and ensures deliverables meet defined acceptance criteria.

• **Stakeholder Communication**: Provides regular project updates, demonstrates progress through working prototypes, and manages expectations effectively.`
      },
      {
        title: '🎓 Educational Impact & Social Contribution',
        content: `The project represents more than technical achievement - it's a contribution to Rwanda's educational sector:

• **Digital Transformation**: Helps schools transition from manual, paper-based processes to efficient digital workflows, saving time and reducing errors.

• **Accessibility**: Makes quality school management tools accessible to institutions that couldn't afford expensive commercial solutions.

• **Data-Driven Decisions**: Empowers school administrators with analytics and insights for informed decision-making about academic programs and resource allocation.

• **Parent Engagement**: Strengthens parent-school relationships through transparent communication and real-time access to student information.

• **Student Success**: Contributes to improved student outcomes through better attendance tracking, early intervention for struggling students, and comprehensive academic monitoring.

• **Teacher Efficiency**: Reduces administrative burden on teachers, allowing them to focus more on teaching and student interaction.

• **Local Innovation**: Demonstrates that Rwandan students can create world-class software solutions tailored to local needs and context.`
      },
      {
        title: '🚀 Future Vision & Roadmap',
        content: `The leadership extends to planning the system's future evolution:

• **Mobile Applications**: Plans for native iOS and Android applications providing mobile-first experiences for parents and students.

• **AI Integration**: Envisions incorporating artificial intelligence for predictive analytics, personalized learning recommendations, and automated administrative tasks.

• **Blockchain Credentials**: Exploring blockchain technology for secure, verifiable academic credentials and certificates.

• **Learning Management**: Expanding into full Learning Management System (LMS) capabilities with online courses, assignments, and virtual classrooms.

• **Multi-School Network**: Developing features for school networks and district-level administration, enabling centralized management of multiple institutions.

• **Advanced Analytics**: Implementing machine learning models for student performance prediction, dropout risk assessment, and resource optimization.

• **Community Features**: Building social features for student collaboration, peer learning, and school community engagement.`
      },
      {
        title: '💡 Technical Skills & Expertise',
        content: `The project demonstrates mastery across the full technology stack:

• **Frontend Technologies**: React, TypeScript, Tailwind CSS, Framer Motion, React Router, Context API, Custom Hooks, Component Libraries

• **Backend Technologies**: Node.js, Express.js, RESTful APIs, JWT Authentication, Middleware Architecture, Error Handling, Logging

• **Database**: MySQL, Database Design, Query Optimization, Indexing, Transactions, Stored Procedures, Data Migration

• **DevOps**: Git, Version Control, Deployment Strategies, Environment Configuration, Build Optimization, Performance Monitoring

• **Security**: Authentication, Authorization, Encryption, Input Validation, SQL Injection Prevention, XSS Protection, CSRF Protection

• **Tools**: VS Code, Postman, MySQL Workbench, Git, npm, Webpack, Babel, ESLint, Prettier

• **Soft Skills**: Leadership, Communication, Problem Solving, Critical Thinking, Time Management, Team Collaboration, Presentation`
      },
      {
        title: '🏆 Achievements & Recognition',
        content: `The project has garnered recognition and achieved significant milestones:

• **Comprehensive System**: Successfully delivered a complete school management system with 335+ API endpoints and 50+ database tables.

• **Feature Rich**: Implemented over 100 distinct features covering all aspects of school administration, academics, and communication.

• **Performance**: Achieved excellent performance metrics with fast page loads, efficient database queries, and smooth user interactions.

• **Scalability**: Built a system capable of handling thousands of users and millions of records without performance degradation.

• **User Satisfaction**: Received positive feedback from test users including school administrators, teachers, and parents.

• **Code Quality**: Maintained high code quality with TypeScript type safety, consistent patterns, and comprehensive error handling.

• **Documentation**: Created extensive documentation making the system maintainable and extensible for future development.`
      },
      {
        title: '🌍 Impact on Garden TVET School',
        content: `This graduation project brings pride and recognition to Garden TVET School:

• **Institutional Pride**: Showcases the quality of education and practical skills development at Garden TVET School.

• **Student Capability**: Demonstrates that Level 4 Software Development students can deliver professional-grade software solutions.

• **Industry Readiness**: Proves students are well-prepared for careers in software development and technology leadership.

• **Practical Learning**: Exemplifies the school's commitment to hands-on, project-based learning that produces job-ready graduates.

• **Innovation Culture**: Reflects the school's culture of innovation, creativity, and pushing boundaries in technical education.

• **Community Contribution**: Shows how technical education directly contributes to solving real community and national challenges.`
      },
      {
        title: '📝 Lessons Learned & Growth',
        content: `The project journey has been a profound learning experience:

• **Technical Growth**: Deepened understanding of full-stack development, system architecture, and software engineering principles.

• **Leadership Development**: Developed essential leadership skills including team management, decision-making, and conflict resolution.

• **Problem-Solving**: Enhanced ability to break down complex problems, design solutions, and implement them effectively.

• **Time Management**: Learned to balance multiple responsibilities, prioritize tasks, and meet deadlines under pressure.

• **Communication**: Improved technical communication skills, both in explaining complex concepts and gathering requirements.

• **Resilience**: Developed perseverance and resilience in facing technical challenges, bugs, and unexpected obstacles.

• **Collaboration**: Strengthened collaborative skills, learning to work effectively in a team environment with diverse perspectives.`
      },
      {
        title: '🎯 Personal Philosophy & Approach',
        content: `The leadership style reflects core values and principles:

• **User-Centric**: Always prioritizes user needs and experiences, ensuring the system solves real problems effectively.

• **Quality First**: Never compromises on code quality, security, or performance, even under time pressure.

• **Continuous Learning**: Embraces new technologies, patterns, and best practices, constantly seeking to improve skills and knowledge.

• **Collaborative Spirit**: Values team input, encourages diverse perspectives, and believes great software is built by great teams.

• **Attention to Detail**: Maintains meticulous attention to detail in code, design, and user experience.

• **Pragmatic Innovation**: Balances innovation with practicality, choosing technologies and approaches that deliver real value.

• **Ethical Development**: Commits to ethical software development, protecting user privacy, ensuring accessibility, and considering social impact.`
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-green-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-yellow-600 via-yellow-500 to-green-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMC0xMGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button
            variant="ghost"
            onClick={() => onNavigate('developers')}
            className="text-white hover:bg-white/20 mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Team
          </Button>
          
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
            {/* Profile Image */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", duration: 0.8 }}
              className="relative"
            >
              <div className="w-40 h-40 rounded-3xl bg-white/20 backdrop-blur-sm overflow-hidden border-4 border-white/50 shadow-2xl">
                {developer.image_url ? (
                  <img 
                    src={`http://localhost:5000${developer.image_url}`} 
                    alt={developer.name}
                    className={`w-full h-full object-cover transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                    onLoad={() => setImageLoaded(true)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl font-bold bg-gradient-to-br from-yellow-400 to-green-400">
                    {developer.name?.split(' ').map((n: string) => n[0]).join('')}
                  </div>
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-green-500 text-white rounded-full p-2 shadow-lg">
                <CheckCircle className="w-6 h-6" />
              </div>
            </motion.div>
            
            {/* Profile Info */}
            <div className="flex-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h1 className="text-5xl font-black mb-3 drop-shadow-lg">{developer.name}</h1>
                <p className="text-2xl text-white/95 mb-4 font-medium">{developer.role_rw || developer.role}</p>
                
                <div className="flex flex-wrap gap-4 mb-6">
                  {developer.email && (
                    <a href={`mailto:${developer.email}`} className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full hover:bg-white/30 transition">
                      <Mail className="w-4 h-4" />
                      <span className="text-sm">{developer.email}</span>
                    </a>
                  )}
                  {developer.phone && (
                    <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                      <Phone className="w-4 h-4" />
                      <span className="text-sm">{developer.phone}</span>
                    </div>
                  )}
                  {developer.location && (
                    <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{developer.location}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  {developer.github_url && (
                    <a href={developer.github_url} target="_blank" rel="noopener noreferrer" className="bg-white text-gray-900 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition flex items-center gap-2 shadow-lg">
                      <Github className="w-5 h-5" />
                      GitHub
                    </a>
                  )}
                  {developer.linkedin_url && (
                    <a href={developer.linkedin_url} target="_blank" rel="noopener noreferrer" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition flex items-center gap-2 shadow-lg">
                      <Linkedin className="w-5 h-5" />
                      LinkedIn
                    </a>
                  )}
                </div>
              </motion.div>
            </div>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8"
          >
            {statsData.map((stat, index) => (
              <div key={index} className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/30">
                <stat.icon className={`w-8 h-8 mx-auto mb-2 ${stat.color}`} />
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-white/90">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid bg-white shadow-lg rounded-2xl p-2">
            <TabsTrigger value="overview" className="rounded-xl data-[state=active]:bg-yellow-500 data-[state=active]:text-white">
              <Users className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="skills" className="rounded-xl data-[state=active]:bg-yellow-500 data-[state=active]:text-white">
              <Code className="w-4 h-4 mr-2" />
              Skills
            </TabsTrigger>
            <TabsTrigger value="projects" className="rounded-xl data-[state=active]:bg-yellow-500 data-[state=active]:text-white">
              <Briefcase className="w-4 h-4 mr-2" />
              Projects
            </TabsTrigger>
            <TabsTrigger value="achievements" className="rounded-xl data-[state=active]:bg-yellow-500 data-[state=active]:text-white">
              <Trophy className="w-4 h-4 mr-2" />
              Awards
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-3xl font-bold flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-green-400 rounded-2xl flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    About {developer.name?.split(' ')[0]}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-lg max-w-none">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line text-lg">
                      {developer.description_rw || developer.description || developer.bio || 'No description available.'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Skills Tab */}
          <TabsContent value="skills" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-3xl font-bold flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-400 rounded-2xl flex items-center justify-center">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                    Technical Skills
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(developer.skills || []).map((skill: string, index: number) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-gradient-to-br from-yellow-50 to-green-50 rounded-xl p-4 border-2 border-yellow-200 hover:border-yellow-400 transition hover:shadow-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-green-400 rounded-lg flex items-center justify-center">
                            <Code className="w-5 h-5 text-white" />
                          </div>
                          <span className="font-semibold text-gray-800">{skill}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(developer.projects || []).map((project: any, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="shadow-xl border-0 bg-white/80 backdrop-blur hover:shadow-2xl transition h-full">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-xl font-bold mb-2">{project.name || project.title}</CardTitle>
                          <Badge className="bg-yellow-500 text-white">{project.role}</Badge>
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-green-400 rounded-xl flex items-center justify-center">
                          <Package className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4">{project.description || 'Project description not available.'}</p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{project.year}</span>
                        </div>
                        {project.url && (
                          <a href={project.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 flex items-center gap-1">
                            View <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-3xl font-bold flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-2xl flex items-center justify-center">
                      <Award className="w-6 h-6 text-white" />
                    </div>
                    Awards & Recognition
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(developer.achievements || []).map((achievement: string, index: number) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center gap-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 border-l-4 border-yellow-500 hover:shadow-lg transition"
                      >
                        <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center flex-shrink-0">
                          <Trophy className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800 text-lg">{achievement}</p>
                        </div>
                        <Star className="w-6 h-6 text-yellow-500" />
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DeveloperDetailPage;
