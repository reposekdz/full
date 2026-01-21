import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Code, 
  HardHat, 
  Wrench, 
  ArrowRight, 
  X, 
  Image as ImageIcon, 
  Settings, 
  Award, 
  Sparkles, 
  ZoomIn, 
  Users, 
  Calendar,
  MapPin,
  Clock,
  TrendingUp,
  Star,
  GraduationCap,
  Building,
  Laptop,
  ChevronLeft,
  ChevronRight,
  Play,
  Download,
  BookOpen,
  Target,
  Trophy,
  CheckCircle2,
  Heart,
  Share2,
  Eye,
  Filter,
  Search,
  Grid3X3,
  List,
  BarChart3,
  PieChart,
  LineChart,
  Users2,
  Briefcase,
  Globe,
  Zap,
  Shield,
  Lightbulb,
  Rocket,
  Crown,
  Gem,
  Phone,
  Mail
} from 'lucide-react';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import { Button } from '@/app/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Separator } from '@/app/components/ui/separator';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { Progress } from '@/app/components/ui/progress';
import { Input } from '@/app/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';

interface Trade {
  id: string;
  title: string;
  code: string;
  icon: typeof Code;
  image: string;
  description: string;
  levels: Array<{
    level: string;
    duration: string;
    description: string;
    modules: string[];
  }>;
  tools: Array<{
    name: string;
    icon: typeof Code;
    description: string;
    image: string;
    category: string;
  }>;
  gallery: Array<{
    url: string;
    title: string;
    category: string;
    description?: string;
  }>;
  features: string[];
  workshops: Array<{
    name: string;
    description: string;
    duration: string;
    capacity: number;
    instructor: string;
    image: string;
  }>;
  statistics: {
    totalStudents: number;
    graduationRate: number;
    employmentRate: number;
    averageSalary: string;
    industryPartners: number;
  };
  teachers: Array<{
    name: string;
    specialization: string;
    experience: string;
    image: string;
    qualifications: string[];
  }>;
  testimonials: Array<{
    name: string;
    role: string;
    text: string;
    rating: number;
    image?: string;
  }>;
  achievements: Array<{
    title: string;
    year: string;
    description: string;
    icon: typeof Award;
  }>;
  curriculum: {
    overview: string;
    subjects: Array<{
      name: string;
      credits: number;
      level: string;
    }>;
  };
}

const trades: Trade[] = [
  {
    id: 'sod',
    title: 'Software Development',
    code: 'SOD',
    icon: Code,
    image: 'https://images.unsplash.com/photo-1531498860502-7c67cf02f657?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2Z0d2FyZSUyMGRldmVsb3BtZW50JTIwY29kaW5nfGVufDF8fHx8MTc2ODcxODI3MXww&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Master the art of software development with cutting-edge technologies, real-world projects, and industry-standard practices.',
    levels: [
      { 
        level: 'Level 3 SOD', 
        duration: '1 Year', 
        description: 'Foundation in programming fundamentals and web development basics',
        modules: ['HTML/CSS/JavaScript', 'Python Programming', 'Database Fundamentals', 'Git Version Control', 'Problem Solving']
      },
      { 
        level: 'Level 4 SOD', 
        duration: '1 Year', 
        description: 'Advanced programming concepts and full-stack development',
        modules: ['React & Vue.js', 'Node.js & Express', 'SQL & NoSQL Databases', 'API Development', 'Mobile App Development']
      },
      { 
        level: 'Level 5 SOD', 
        duration: '1 Year', 
        description: 'Professional software engineering and industry practices',
        modules: ['Software Architecture', 'Cloud Computing (AWS/Azure)', 'DevOps & CI/CD', 'AI/ML Integration', 'Capstone Projects']
      },
    ],
    tools: [
      { name: 'Visual Studio Code', icon: Code, description: 'Professional code editor', image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&q=80', category: 'Development' },
      { name: 'Git & GitHub', icon: Globe, description: 'Version control system', image: 'https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=400&q=80', category: 'Version Control' },
      { name: 'React & Vue.js', icon: Zap, description: 'Frontend frameworks', image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&q=80', category: 'Frontend' },
      { name: 'Node.js & Express', icon: Settings, description: 'Backend development', image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&q=80', category: 'Backend' },
      { name: 'MySQL & MongoDB', icon: Building, description: 'Database management', image: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=400&q=80', category: 'Database' },
      { name: 'AWS & Azure', icon: Globe, description: 'Cloud platforms', image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&q=80', category: 'Cloud' }
    ],
    gallery: [
      { url: 'https://images.unsplash.com/photo-1531498860502-7c67cf02f657?w=800&q=80', title: 'Modern Computer Lab', category: 'Facilities', description: 'State-of-the-art computer laboratory with latest hardware' },
      { url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80', title: 'Coding Workshop', category: 'Classes', description: 'Interactive programming sessions with expert instructors' },
      { url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80', title: 'Team Collaboration', category: 'Student Life', description: 'Students working together on real-world projects' },
      { url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80', title: 'Web Development', category: 'Projects', description: 'Building responsive and modern web applications' },
      { url: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800&q=80', title: 'Mobile Apps', category: 'Projects', description: 'Creating innovative mobile applications' },
      { url: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&q=80', title: 'Innovation Hub', category: 'Facilities', description: 'Creative workspace for innovative solutions' }
    ],
    features: ['Hands-on coding labs', 'Real-world projects', 'Industry mentorship', 'Job placement support', 'Modern curriculum', 'Certification programs'],
    workshops: [
      { name: 'Web Development Bootcamp', description: 'Intensive training in modern web technologies', duration: '2 weeks', capacity: 20, instructor: 'John Doe', image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&q=80' },
      { name: 'Mobile App Development', description: 'Build native and cross-platform mobile apps', duration: '3 weeks', capacity: 15, instructor: 'Jane Smith', image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&q=80' },
      { name: 'Cloud Computing Workshop', description: 'Learn AWS and Azure cloud services', duration: '1 week', capacity: 25, instructor: 'Mike Johnson', image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&q=80' }
    ],
    statistics: {
      totalStudents: 450,
      graduationRate: 94,
      employmentRate: 89,
      averageSalary: '$65,000',
      industryPartners: 25
    },
    teachers: [
      { name: 'Dr. Alice Cooper', specialization: 'Full-Stack Development', experience: '8 years', image: 'https://images.unsplash.com/photo-1494790108755-2616c9009fb1?w=400&q=80', qualifications: ['PhD Computer Science', 'AWS Certified', 'React Expert'] },
      { name: 'Prof. Bob Wilson', specialization: 'Software Architecture', experience: '12 years', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80', qualifications: ['MS Software Engineering', 'Google Cloud Certified', 'Agile Coach'] },
      { name: 'Sarah Johnson', specialization: 'Mobile Development', experience: '6 years', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80', qualifications: ['BS Computer Science', 'iOS Developer', 'Android Expert'] }
    ],
    testimonials: [
      { name: 'Jean Mugisha', role: 'Software Engineer at TechCorp', text: 'The SOD program gave me the skills and confidence to excel in my career. The hands-on approach was invaluable.', rating: 5, image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80' },
      { name: 'Marie Uwase', role: 'Full-Stack Developer', text: 'Amazing instructors and curriculum. I landed my dream job within 3 months of graduation.', rating: 5, image: 'https://images.unsplash.com/photo-1494790108755-2616c9009fb1?w=400&q=80' },
      { name: 'Paul Niyonzima', role: 'Mobile App Developer', text: 'The mobile development specialization opened doors to exciting opportunities in the tech industry.', rating: 5, image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80' }
    ],
    achievements: [
      { title: 'National Coding Competition Winner', year: '2023', description: 'First place in Rwanda National Programming Contest', icon: Trophy },
      { title: 'Best Innovation Award', year: '2024', description: 'Recognized for outstanding student projects', icon: Lightbulb },
      { title: 'Industry Partnership Excellence', year: '2023', description: 'Established partnerships with 25+ tech companies', icon: Briefcase }
    ],
    curriculum: {
      overview: 'Comprehensive software development curriculum covering modern programming languages, frameworks, and industry best practices.',
      subjects: [
        { name: 'Programming Fundamentals', credits: 6, level: 'Level 3' },
        { name: 'Web Development', credits: 8, level: 'Level 3' },
        { name: 'Database Systems', credits: 6, level: 'Level 4' },
        { name: 'Software Engineering', credits: 8, level: 'Level 4' },
        { name: 'Cloud Computing', credits: 6, level: 'Level 5' },
        { name: 'Capstone Project', credits: 12, level: 'Level 5' }
      ]
    }
  },
  {
    id: 'bdc',
    title: 'Building Construction',
    code: 'BDC',
    icon: HardHat,
    image: 'https://images.unsplash.com/photo-1672072830247-85ac23671e96?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25zdHJ1Y3Rpb24lMjBidWlsZGluZyUyMHNpdGV8ZW58MXx8fHwxNzY4NzMwNzQ0fDA',
    description: 'Build your future in construction with comprehensive training in modern building techniques, safety standards, and project management.',
    levels: [
      { 
        level: 'Level 3 BDC', 
        duration: '1 Year', 
        description: 'Foundation in construction fundamentals and safety protocols',
        modules: ['Construction Basics', 'Material Properties', 'Safety Standards', 'Blueprint Reading', 'Hand Tools Usage']
      },
      { 
        level: 'Level 4 BDC', 
        duration: '1 Year', 
        description: 'Advanced construction techniques and site management',
        modules: ['Advanced Techniques', 'Surveying & Mapping', 'Cost Estimation', 'Site Management', 'Quality Control']
      },
      { 
        level: 'Level 5 BDC', 
        duration: '1 Year', 
        description: 'Professional project management and structural design',
        modules: ['Project Management', 'Structural Design', 'Building Codes', 'Green Construction', 'Capstone Project']
      },
    ],
    tools: [
      { name: 'AutoCAD', icon: Laptop, description: 'Computer-aided design software', image: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&q=80', category: 'Design' },
      { name: 'Total Station', icon: Target, description: 'Surveying instrument', image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&q=80', category: 'Surveying' },
      { name: 'Power Tools', icon: Zap, description: 'Professional construction tools', image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400&q=80', category: 'Tools' },
      { name: 'Safety Equipment', icon: Shield, description: 'Personal protective equipment', image: 'https://images.unsplash.com/photo-1572126258301-2a65c71a8b79?w=400&q=80', category: 'Safety' },
      { name: 'BIM Software', icon: Building, description: 'Building Information Modeling', image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400&q=80', category: 'Software' },
      { name: 'Concrete Mixers', icon: Settings, description: 'Construction machinery', image: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400&q=80', category: 'Machinery' }
    ],
    gallery: [
      { url: 'https://images.unsplash.com/photo-1672072830247-85ac23671e96?w=800&q=80', title: 'Construction Workshop', category: 'Facilities', description: 'Modern construction training facility' },
      { url: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&q=80', title: 'Practical Training', category: 'Classes', description: 'Hands-on construction experience' },
      { url: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&q=80', title: 'Site Management', category: 'Projects', description: 'Real construction project management' },
      { url: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&q=80', title: 'Tool Training', category: 'Classes', description: 'Professional tool operation training' },
      { url: 'https://images.unsplash.com/photo-1572126258301-2a65c71a8b79?w=800&q=80', title: 'Safety Training', category: 'Safety', description: 'Comprehensive safety protocols' },
      { url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80', title: 'Surveying Practice', category: 'Classes', description: 'Land surveying and mapping' }
    ],
    features: ['On-site training', 'Safety certifications', 'Industry partnerships', 'Modern workshops', 'Professional mentorship', 'Job placement'],
    workshops: [
      { name: 'Advanced Concrete Technology', description: 'Modern concrete mixing and finishing techniques', duration: '2 weeks', capacity: 15, instructor: 'Mark Stevens', image: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400&q=80' },
      { name: 'Steel Frame Construction', description: 'Steel structure assembly and welding', duration: '3 weeks', capacity: 12, instructor: 'Robert Chen', image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400&q=80' },
      { name: 'Green Building Practices', description: 'Sustainable construction methods', duration: '1 week', capacity: 20, instructor: 'Lisa Green', image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400&q=80' }
    ],
    statistics: {
      totalStudents: 380,
      graduationRate: 91,
      employmentRate: 87,
      averageSalary: '$55,000',
      industryPartners: 18
    },
    teachers: [
      { name: 'Eng. Michael Brown', specialization: 'Structural Engineering', experience: '15 years', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80', qualifications: ['MS Civil Engineering', 'Professional Engineer', 'LEED Certified'] },
      { name: 'Foreman James Wilson', specialization: 'Construction Management', experience: '20 years', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80', qualifications: ['BS Construction Management', 'PMP Certified', 'Safety Expert'] },
      { name: 'Architect Emma Davis', specialization: 'Building Design', experience: '10 years', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80', qualifications: ['M.Arch', 'AutoCAD Certified', 'BIM Specialist'] }
    ],
    testimonials: [
      { name: 'Patrick Uwimana', role: 'Site Manager', text: 'The BDC program prepared me for real-world construction challenges. Excellent hands-on training.', rating: 5, image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80' },
      { name: 'Grace Mukamana', role: 'Construction Engineer', text: 'Outstanding faculty and practical experience. I now manage major construction projects.', rating: 5, image: 'https://images.unsplash.com/photo-1494790108755-2616c9009fb1?w=400&q=80' },
      { name: 'David Nshuti', role: 'Building Inspector', text: 'The program covers everything from safety to project management. Highly recommended.', rating: 5, image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80' }
    ],
    achievements: [
      { title: 'Best Construction Project Award', year: '2023', description: 'Outstanding student construction project recognition', icon: Building },
      { title: 'Safety Excellence Certificate', year: '2024', description: 'Zero-accident training program achievement', icon: Shield },
      { title: 'Industry Partnership Growth', year: '2023', description: 'Expanded partnerships with construction companies', icon: Users2 }
    ],
    curriculum: {
      overview: 'Comprehensive construction curriculum covering traditional and modern building techniques, safety protocols, and project management.',
      subjects: [
        { name: 'Construction Fundamentals', credits: 6, level: 'Level 3' },
        { name: 'Building Materials', credits: 4, level: 'Level 3' },
        { name: 'Surveying & Mapping', credits: 6, level: 'Level 4' },
        { name: 'Project Management', credits: 8, level: 'Level 4' },
        { name: 'Structural Design', credits: 8, level: 'Level 5' },
        { name: 'Construction Project', credits: 10, level: 'Level 5' }
      ]
    }
  },
  {
    id: 'aut',
    title: 'Automobile Technology',
    code: 'AUT',
    icon: Wrench,
    image: 'https://images.unsplash.com/photo-1636761358757-0a616eb9e17e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhdXRvbW9iaWxlJTIwbWVjaGFuaWMlMjB3b3Jrc2hvcHxlbnwxfHx8fDE3Njg4MDYyMTl8MA',
    description: 'Master automotive technology with comprehensive training in modern vehicle systems, diagnostics, and emerging technologies like electric vehicles.',
    levels: [
      { 
        level: 'Level 3 AUT', 
        duration: '1 Year', 
        description: 'Foundation in automotive fundamentals and basic systems',
        modules: ['Automotive Basics', 'Engine Systems', 'Electrical Fundamentals', 'Safety Procedures', 'Tool Usage']
      },
      { 
        level: 'Level 4A AUT', 
        duration: '1 Year', 
        description: 'Advanced automotive systems and diagnostics',
        modules: ['Advanced Diagnostics', 'Transmission Systems', 'Fuel Injection', 'Brake Systems', 'Air Conditioning']
      },
      { 
        level: 'Level 4B AUT', 
        duration: '1 Year', 
        description: 'Electronics and modern vehicle technologies',
        modules: ['Automotive Electronics', 'Hybrid Systems', 'Advanced Troubleshooting', 'Computer Networks', 'Sensor Technology']
      },
      { 
        level: 'Level 5A AUT', 
        duration: '1 Year', 
        description: 'Shop management and customer service excellence',
        modules: ['Vehicle Management', 'Shop Operations', 'Customer Service', 'Quality Control', 'Business Practices']
      },
      { 
        level: 'Level 5B AUT', 
        duration: '1 Year', 
        description: 'Specialization and certification preparation',
        modules: ['Specialization Areas', 'Certification Prep', 'Business Management', 'Electric Vehicles', 'Capstone Project']
      },
    ],
    tools: [
      { name: 'OBD-II Scanners', icon: Laptop, description: 'Diagnostic computer systems', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80', category: 'Diagnostics' },
      { name: 'Hydraulic Lifts', icon: TrendingUp, description: 'Vehicle lifting equipment', image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&q=80', category: 'Lifting' },
      { name: 'Power Tools', icon: Zap, description: 'Professional automotive tools', image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400&q=80', category: 'Tools' },
      { name: 'Multimeters', icon: BarChart3, description: 'Electrical testing equipment', image: 'https://images.unsplash.com/photo-1581092335397-9583dd4c7d8d?w=400&q=80', category: 'Testing' },
      { name: 'Torque Wrenches', icon: Settings, description: 'Precision tightening tools', image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&q=80', category: 'Precision' },
      { name: 'Alignment Systems', icon: Target, description: 'Wheel alignment technology', image: 'https://images.unsplash.com/photo-1636761358757-0a616eb9e17e?w=400&q=80', category: 'Alignment' }
    ],
    gallery: [
      { url: 'https://images.unsplash.com/photo-1636761358757-0a616eb9e17e?w=800&q=80', title: 'Modern Auto Shop', category: 'Facilities', description: 'State-of-the-art automotive workshop' },
      { url: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&q=80', title: 'Engine Diagnostics', category: 'Classes', description: 'Advanced engine diagnostic training' },
      { url: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=80', title: 'Electric Vehicle Lab', category: 'Facilities', description: 'Cutting-edge EV technology training' },
      { url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80', title: 'Computer Diagnostics', category: 'Classes', description: 'Modern diagnostic equipment training' },
      { url: 'https://images.unsplash.com/photo-1581092335397-9583dd4c7d8d?w=800&q=80', title: 'Electrical Systems', category: 'Classes', description: 'Automotive electrical system repair' },
      { url: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&q=80', title: 'Hands-on Training', category: 'Student Life', description: 'Practical automotive repair experience' }
    ],
    features: ['Modern workshop', 'Real vehicle training', 'ASE certification', 'Hybrid/EV training', 'Industry connections', 'Career support'],
    workshops: [
      { name: 'Electric Vehicle Fundamentals', description: 'Comprehensive EV technology and maintenance', duration: '2 weeks', capacity: 16, instructor: 'Dr. Tesla Wong', image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&q=80' },
      { name: 'Advanced Diagnostics', description: 'Computer-based automotive diagnostics', duration: '1 week', capacity: 20, instructor: 'Tech Master Liu', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80' },
      { name: 'Performance Tuning', description: 'Engine performance optimization', duration: '3 weeks', capacity: 12, instructor: 'Speed Racer Joe', image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&q=80' }
    ],
    statistics: {
      totalStudents: 418,
      graduationRate: 93,
      employmentRate: 91,
      averageSalary: '$58,000',
      industryPartners: 22
    },
    teachers: [
      { name: 'Master Tech John Rodriguez', specialization: 'Engine Systems', experience: '18 years', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80', qualifications: ['ASE Master Certified', 'Hybrid Specialist', 'Ford Certified'] },
      { name: 'Dr. Sarah Kim', specialization: 'Electric Vehicles', experience: '12 years', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80', qualifications: ['PhD Automotive Engineering', 'Tesla Certified', 'EV Expert'] },
      { name: 'Instructor Mike Thompson', specialization: 'Diagnostics', experience: '14 years', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80', qualifications: ['BS Automotive Technology', 'Snap-on Certified', 'Diagnostic Specialist'] }
    ],
    testimonials: [
      { name: 'Alex Nkunda', role: 'Automotive Technician', text: 'The AUT program gave me hands-on experience with real vehicles. Now I work at a premium dealership.', rating: 5, image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80' },
      { name: 'Rachel Uwimpuhwe', role: 'Electric Vehicle Specialist', text: 'The EV training was exceptional. I\'m now certified to work on Tesla and other electric vehicles.', rating: 5, image: 'https://images.unsplash.com/photo-1494790108755-2616c9009fb1?w=400&q=80' },
      { name: 'Peter Gasana', role: 'Shop Manager', text: 'The business management modules prepared me to run my own auto repair shop successfully.', rating: 5, image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80' }
    ],
    achievements: [
      { title: 'ASE Excellence Award', year: '2023', description: 'Outstanding ASE certification pass rates', icon: Award },
      { title: 'EV Training Pioneer', year: '2024', description: 'First in Rwanda to offer comprehensive EV training', icon: Rocket },
      { title: 'Industry Innovation Award', year: '2023', description: 'Recognition for modern automotive education', icon: Gem }
    ],
    curriculum: {
      overview: 'Cutting-edge automotive curriculum covering traditional and modern vehicle technologies including electric and hybrid systems.',
      subjects: [
        { name: 'Automotive Fundamentals', credits: 6, level: 'Level 3' },
        { name: 'Engine Systems', credits: 8, level: 'Level 3' },
        { name: 'Advanced Diagnostics', credits: 8, level: 'Level 4A' },
        { name: 'Automotive Electronics', credits: 6, level: 'Level 4B' },
        { name: 'Electric Vehicle Technology', credits: 8, level: 'Level 5A' },
        { name: 'Shop Management', credits: 6, level: 'Level 5B' }
      ]
    }
  }
];

const TradesPage: React.FC = () => {
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [selectedGalleryImage, setSelectedGalleryImage] = useState<string | null>(null);
  const [hoveredTool, setHoveredTool] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentGalleryIndex, setCurrentGalleryIndex] = useState(0);
  const [galleryFilter, setGalleryFilter] = useState('All');
  const [toolFilter, setToolFilter] = useState('All');
  const [activeStatistic, setActiveStatistic] = useState<string | null>(null);

  // Filter functions
  const filteredTrades = trades.filter(trade => {
    const matchesSearch = trade.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trade.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || trade.code === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const nextGalleryImage = () => {
    if (selectedTrade) {
      setCurrentGalleryIndex((prev) => (prev + 1) % selectedTrade.gallery.length);
    }
  };

  const prevGalleryImage = () => {
    if (selectedTrade) {
      setCurrentGalleryIndex((prev) => (prev - 1 + selectedTrade.gallery.length) % selectedTrade.gallery.length);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 text-white">
        <div className="absolute inset-0 opacity-20">
          <motion.div
            animate={{ 
              backgroundPosition: ['0% 0%', '100% 100%'],
            }}
            transition={{ duration: 20, repeat: Infinity, repeatType: 'reverse' }}
            className="w-full h-full bg-cover bg-center"
            style={{
              backgroundImage: 'url(https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=1200&q=80)'
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <Badge className="mb-6 bg-white/20 text-white border-white/30 text-lg px-6 py-3">
              <Sparkles className="w-5 h-5 mr-2" />
              Professional Technical Education
            </Badge>
            <h1 className="text-6xl md:text-8xl font-black mb-6 bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
              TRADES OFFERED
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-4xl mx-auto leading-relaxed">
              Discover world-class technical education programs designed to prepare you for successful careers in today's most in-demand fields
            </p>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mt-12 max-w-4xl mx-auto">
              {[
                { label: 'Students', value: '1,248', icon: Users },
                { label: 'Success Rate', value: '93%', icon: TrendingUp },
                { label: 'Programs', value: '3', icon: BookOpen },
                { label: 'Teachers', value: '65+', icon: GraduationCap },
                { label: 'Partners', value: '65+', icon: Briefcase },
                { label: 'Years', value: '15+', icon: Award }
              ].map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/10 backdrop-blur-md rounded-xl p-4 text-center border border-white/20"
                  >
                    <Icon className="w-6 h-6 mx-auto mb-2 text-blue-200" />
                    <p className="text-2xl font-black text-white">{stat.value}</p>
                    <p className="text-xs text-blue-200">{stat.label}</p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl p-8 mb-12 border border-gray-200"
        >
          <div className="flex flex-col lg:flex-row gap-6 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search trades, skills, or technologies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-6 text-lg rounded-xl border-2 border-gray-200 focus:border-blue-500 transition-colors"
              />
            </div>
            
            <div className="flex gap-4 items-center">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48 py-6 text-lg rounded-xl border-2">
                  <Filter className="w-5 h-5 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Programs</SelectItem>
                  <SelectItem value="SOD">Software Development</SelectItem>
                  <SelectItem value="BDC">Building Construction</SelectItem>
                  <SelectItem value="AUT">Automobile Technology</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex rounded-xl border-2 border-gray-200 overflow-hidden">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  onClick={() => setViewMode('grid')}
                  className="rounded-none border-0"
                  size="lg"
                >
                  <Grid3X3 className="w-5 h-5" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  onClick={() => setViewMode('list')}
                  className="rounded-none border-0"
                  size="lg"
                >
                  <List className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Trades Display */}
        <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-3 gap-8' : 'space-y-6'}`}>
          {filteredTrades.map((trade, index) => {
            const Icon = trade.icon;
            return (
              <motion.div
                key={trade.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  className={`overflow-hidden hover:shadow-2xl transition-all duration-500 cursor-pointer group border-2 border-transparent hover:border-blue-300 ${
                    viewMode === 'list' ? 'flex flex-row h-64' : 'h-auto'
                  }`}
                  onClick={() => setSelectedTrade(trade)}
                >
                  <div className={`relative ${viewMode === 'list' ? 'w-1/3' : 'h-72'} overflow-hidden`}>
                    <ImageWithFallback
                      src={trade.image}
                      alt={trade.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    
                    {/* Floating Stats */}
                    <div className="absolute top-4 right-4 space-y-2">
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-bold text-gray-800"
                      >
                        <Users className="w-4 h-4 inline mr-1" />
                        {trade.statistics.totalStudents} Students
                      </motion.div>
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className="bg-green-500/90 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-bold text-white"
                      >
                        <TrendingUp className="w-4 h-4 inline mr-1" />
                        {trade.statistics.graduationRate}% Success
                      </motion.div>
                    </div>

                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex items-center mb-3">
                        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 mr-3">
                          <Icon className="w-8 h-8 text-white" />
                        </div>
                        <Badge className="bg-blue-600/90 backdrop-blur-sm text-white border-blue-300/50 text-sm px-3 py-1">
                          {trade.code} Program
                        </Badge>
                      </div>
                      <h3 className="text-2xl font-black text-white mb-1">{trade.title}</h3>
                      <p className="text-blue-100 text-sm">{trade.levels.length} Levels Available</p>
                    </div>
                  </div>

                  <div className={`p-6 bg-white ${viewMode === 'list' ? 'flex-1' : ''}`}>
                    <CardDescription className="text-gray-700 text-base mb-4 line-clamp-3">
                      {trade.description}
                    </CardDescription>

                    {/* Quick Features */}
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-2 text-blue-500" />
                        <span>{trade.levels[0].duration} - {trade.levels[trade.levels.length - 1].duration} Duration</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Award className="w-4 h-4 mr-2 text-green-500" />
                        <span>{trade.statistics.employmentRate}% Employment Rate</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Globe className="w-4 h-4 mr-2 text-purple-500" />
                        <span>{trade.statistics.industryPartners} Industry Partners</span>
                      </div>
                    </div>

                    {/* Level Badges */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {trade.levels.slice(0, 3).map((level, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs border-blue-300 text-blue-700">
                          {level.level}
                        </Badge>
                      ))}
                      {trade.levels.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{trade.levels.length - 3} more
                        </Badge>
                      )}
                    </div>

                    <div className="flex gap-3">
                      <Button 
                        className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 shadow-lg hover:shadow-xl transition-all"
                        size="lg"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" />
                      </Button>
                      <Button
                        variant="outline"
                        size="lg"
                        className="border-2 border-blue-300 text-blue-700 hover:bg-blue-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Add to favorites functionality
                        }}
                      >
                        <Heart className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Trade Details Dialog */}
      <Dialog open={!!selectedTrade} onOpenChange={() => setSelectedTrade(null)}>
        <DialogContent className="max-w-7xl max-h-[95vh] p-0 overflow-hidden">
          {selectedTrade && (
            <ScrollArea className="h-[80vh] pr-4">
              <DialogHeader>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="bg-blue-600 p-3 rounded-lg">
                    <selectedTrade.icon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <DialogTitle className="text-3xl">{selectedTrade.title}</DialogTitle>
                    <Badge className="mt-2 bg-blue-600 text-white">{selectedTrade.code}</Badge>
                  </div>
                </div>
              </DialogHeader>

              <Tabs defaultValue="levels" className="mt-6">
                <TabsList className="grid w-full grid-cols-6">
                  <TabsTrigger value="levels">Levels</TabsTrigger>
                  <TabsTrigger value="tools">Tools</TabsTrigger>
                  <TabsTrigger value="gallery">Gallery</TabsTrigger>
                  <TabsTrigger value="workshops">Workshops</TabsTrigger>
                  <TabsTrigger value="teachers">Faculty</TabsTrigger>
                  <TabsTrigger value="features">Features</TabsTrigger>
                </TabsList>

                {/* Levels Tab */}
                <TabsContent value="levels" className="space-y-4">
                  {selectedTrade.levels.map((level, index) => (
                    <Card key={level.level}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-xl">{level.level}</CardTitle>
                            <CardDescription>{level.duration}</CardDescription>
                          </div>
                          <Award className="w-8 h-8 text-blue-600" />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600">{level.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                {/* Tools Tab */}
                <TabsContent value="tools">
                  <Card className="border-2 border-yellow-200">
                    <CardHeader>
                      <CardTitle className="flex items-center text-2xl">
                        <Wrench className="w-6 h-6 mr-2 text-yellow-600" />
                        Tools & Equipment
                      </CardTitle>
                      <CardDescription>Professional equipment and software you'll master</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedTrade.tools.map((tool, index) => {
                          const Icon = tool.icon;
                          return (
                            <motion.div
                              key={tool.name}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              onMouseEnter={() => setHoveredTool(tool.name)}
                              onMouseLeave={() => setHoveredTool(null)}
                              className={`group relative overflow-hidden rounded-xl border-2 transition-all cursor-pointer ${
                                hoveredTool === tool.name 
                                  ? 'bg-gradient-to-r from-yellow-50 to-green-50 border-yellow-400 shadow-xl scale-105 transform' 
                                  : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-lg'
                              }`}
                            >
                              <div className="aspect-video relative overflow-hidden">
                                <ImageWithFallback
                                  src={tool.image}
                                  alt={tool.name}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                                <div className="absolute top-3 right-3">
                                  <Badge className="bg-blue-600/90 text-white">
                                    {tool.category}
                                  </Badge>
                                </div>
                                <div className="absolute bottom-3 left-3 right-3">
                                  <div className="flex items-center space-x-3">
                                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2">
                                      <Icon className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                      <h4 className="font-bold text-white text-lg">{tool.name}</h4>
                                      <p className="text-blue-100 text-sm">{tool.description}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              {hoveredTool === tool.name && (
                                <motion.div
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="absolute inset-0 bg-gradient-to-t from-blue-600/90 via-blue-500/70 to-transparent flex items-center justify-center"
                                >
                                  <div className="text-center text-white">
                                    <Sparkles className="w-8 h-8 mx-auto mb-2 animate-pulse" />
                                    <p className="font-bold">Professional Tool</p>
                                  </div>
                                </motion.div>
                              )}
                            </motion.div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Gallery Tab */}
                <TabsContent value="gallery">
                  <Card className="border-2 border-yellow-200">
                    <CardHeader>
                      <CardTitle className="flex items-center text-2xl">
                        <ImageIcon className="w-6 h-6 mr-2 text-yellow-600" />
                        Photo Gallery
                      </CardTitle>
                      <CardDescription>Explore our facilities and student work</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedTrade.gallery.map((img, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className="aspect-video rounded-lg overflow-hidden relative group cursor-pointer border-2 border-transparent hover:border-yellow-400 transition-all"
                            onClick={() => setSelectedGalleryImage(img.url)}
                          >
                            <ImageWithFallback
                              src={img.url}
                              alt={img.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                            
                            {/* Category Badge */}
                            <div className="absolute top-3 right-3">
                              <Badge className="bg-blue-600/90 text-white backdrop-blur-sm">
                                {img.category}
                              </Badge>
                            </div>

                            {/* Title and Description */}
                            <div className="absolute bottom-3 left-3 right-3">
                              <h4 className="font-bold text-white text-lg mb-1">{img.title}</h4>
                              {img.description && (
                                <p className="text-blue-100 text-sm">{img.description}</p>
                              )}
                            </div>

                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                              <motion.div
                                initial={{ scale: 0 }}
                                whileHover={{ scale: 1 }}
                                className="bg-white/90 backdrop-blur-sm rounded-full p-4 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <ZoomIn className="w-8 h-8 text-gray-900" />
                              </motion.div>
                            </div>
                            
                            <div className="absolute top-2 left-2 bg-gradient-to-r from-yellow-500 to-green-500 text-white px-3 py-1 rounded-full text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                              Click to expand
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Workshops Tab */}
                <TabsContent value="workshops">
                  <Card className="border-2 border-green-200">
                    <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50">
                      <CardTitle className="flex items-center text-2xl">
                        <Building className="w-6 h-6 mr-2 text-green-600" />
                        Specialized Workshops
                      </CardTitle>
                      <CardDescription>Intensive hands-on training sessions</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {selectedTrade.workshops.map((workshop, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden hover:shadow-xl hover:border-green-400 transition-all group"
                          >
                            <div className="aspect-video relative overflow-hidden">
                              <ImageWithFallback
                                src={workshop.image}
                                alt={workshop.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                              <div className="absolute top-3 right-3">
                                <Badge className="bg-green-600/90 text-white backdrop-blur-sm">
                                  {workshop.duration}
                                </Badge>
                              </div>
                              <div className="absolute bottom-3 left-3 right-3">
                                <h3 className="font-bold text-white text-lg mb-1">{workshop.name}</h3>
                                <p className="text-green-100 text-sm">by {workshop.instructor}</p>
                              </div>
                            </div>
                            <div className="p-4">
                              <p className="text-gray-700 mb-4">{workshop.description}</p>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center text-sm text-gray-600">
                                  <Users className="w-4 h-4 mr-2 text-blue-500" />
                                  <span>Max {workshop.capacity} students</span>
                                </div>
                                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                  <Calendar className="w-4 h-4 mr-1" />
                                  Register
                                </Button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Teachers Tab */}
                <TabsContent value="teachers">
                  <Card className="border-2 border-purple-200">
                    <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                      <CardTitle className="flex items-center text-2xl">
                        <Users className="w-6 h-6 mr-2 text-purple-600" />
                        Expert Faculty
                      </CardTitle>
                      <CardDescription>Meet our experienced instructors and industry professionals</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {selectedTrade.teachers.map((teacher, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:shadow-xl hover:border-purple-400 transition-all text-center group"
                          >
                            <div className="relative mb-4">
                              <Avatar className="w-24 h-24 mx-auto border-4 border-purple-200 group-hover:border-purple-400 transition-colors">
                                <AvatarImage src={teacher.image} alt={teacher.name} />
                                <AvatarFallback className="bg-purple-100 text-purple-700 text-lg font-bold">
                                  {teacher.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                                <Badge className="bg-purple-600 text-white px-3 py-1">
                                  {teacher.experience}
                                </Badge>
                              </div>
                            </div>
                            
                            <h3 className="font-bold text-gray-900 text-lg mb-1">{teacher.name}</h3>
                            <p className="text-purple-600 font-medium mb-3">{teacher.specialization}</p>
                            
                            <div className="space-y-2">
                              <h4 className="font-semibold text-gray-700 text-sm">Qualifications:</h4>
                              {teacher.qualifications.map((qual, qualIndex) => (
                                <Badge 
                                  key={qualIndex} 
                                  variant="outline" 
                                  className="text-xs border-purple-300 text-purple-700 mr-1 mb-1"
                                >
                                  {qual}
                                </Badge>
                              ))}
                            </div>

                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <div className="flex justify-center space-x-2">
                                <Button size="sm" variant="outline" className="border-purple-300 text-purple-700 hover:bg-purple-50">
                                  <Mail className="w-4 h-4 mr-1" />
                                  Contact
                                </Button>
                                <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                                  <Users className="w-4 h-4 mr-1" />
                                  View Profile
                                </Button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Features Tab */}
                <TabsContent value="features">
                  <div className="space-y-8">
                    {/* Program Features */}
                    <Card className="border-2 border-blue-200">
                      <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
                        <CardTitle className="text-2xl flex items-center">
                          <Sparkles className="w-6 h-6 mr-3 text-blue-600" />
                          Program Highlights
                        </CardTitle>
                        <CardDescription>What makes this program exceptional</CardDescription>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {selectedTrade.features.map((feature, index) => (
                            <motion.div
                              key={feature}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="flex items-start space-x-4 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 hover:shadow-lg hover:border-blue-400 transition-all group cursor-pointer"
                            >
                              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                <CheckCircle2 className="text-white w-6 h-6" />
                              </div>
                              <div className="flex-1">
                                <span className="font-bold text-gray-900 text-lg group-hover:text-blue-700 transition-colors">{feature}</span>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Student Testimonials */}
                    <Card className="border-2 border-yellow-200">
                      <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50">
                        <CardTitle className="text-2xl flex items-center">
                          <Star className="w-6 h-6 mr-3 text-yellow-600" />
                          Student Success Stories
                        </CardTitle>
                        <CardDescription>Hear from our graduates and current students</CardDescription>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {selectedTrade.testimonials.map((testimonial, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: index * 0.1 }}
                              className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-200 hover:border-yellow-400 hover:shadow-xl transition-all"
                            >
                              <div className="flex items-center mb-4">
                                <Avatar className="w-12 h-12 mr-3 border-2 border-yellow-300">
                                  <AvatarImage src={testimonial.image} alt={testimonial.name} />
                                  <AvatarFallback className="bg-yellow-100 text-yellow-700 font-bold">
                                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                                  <p className="text-yellow-600 text-sm font-medium">{testimonial.role}</p>
                                </div>
                                <div className="flex">
                                  {[...Array(testimonial.rating)].map((_, i) => (
                                    <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
                                  ))}
                                </div>
                              </div>
                              <blockquote className="text-gray-700 italic">
                                "{testimonial.text}"
                              </blockquote>
                            </motion.div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>

              <Separator className="my-8" />

              {/* Action Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 text-lg shadow-lg hover:shadow-xl transition-all" size="lg">
                  <Rocket className="w-5 h-5 mr-2" />
                  Apply Now
                </Button>
                <Button variant="outline" className="border-2 border-blue-300 text-blue-700 hover:bg-blue-50 font-bold py-4 text-lg" size="lg">
                  <Download className="w-5 h-5 mr-2" />
                  Download Brochure
                </Button>
                <Button variant="outline" className="border-2 border-green-300 text-green-700 hover:bg-green-50 font-bold py-4 text-lg" size="lg">
                  <Phone className="w-5 h-5 mr-2" />
                  Contact Advisor
                </Button>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

      {/* Gallery Image Modal */}
      <Dialog open={!!selectedGalleryImage} onOpenChange={() => setSelectedGalleryImage(null)}>
        <DialogContent className="max-w-5xl p-0 overflow-hidden">
          {selectedGalleryImage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative"
            >
              <ImageWithFallback
                src={selectedGalleryImage}
                alt="Gallery Image"
                className="w-full h-auto max-h-[85vh] object-contain"
              />
              <Button
                variant="outline"
                className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm hover:bg-white"
                onClick={() => setSelectedGalleryImage(null)}
                size="icon"
              >
                <X className="w-5 h-5" />
              </Button>
            </motion.div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TradesPage;