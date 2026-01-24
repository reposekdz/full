import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Mail, Phone, MapPin, Github, Linkedin, Star, Zap, Trophy, CheckCircle, Users, BookOpen, Code, Award, Briefcase, Target, TrendingUp, Calendar, DollarSign, Package, Database, Cpu, Globe, MessageSquare, ThumbsUp, Eye, Share2, Download, Filter, Search } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Input } from '@/app/components/ui/input';
import { Progress } from '@/app/components/ui/progress';

interface DeveloperDetailPageProps {
  developerId: string;
  onNavigate: (page: string) => void;
}

const DeveloperDetailPage: React.FC<DeveloperDetailPageProps> = ({ developerId, onNavigate }) => {
  const [developer, setDeveloper] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState<any>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:5000/api/developers/team/${developerId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const dev = data.developer;
          // Parse JSON fields
          if (typeof dev.skills === 'string') dev.skills = JSON.parse(dev.skills);
          if (typeof dev.achievements === 'string') dev.achievements = JSON.parse(dev.achievements);
          setDeveloper(dev);
        } else {
          throw new Error('No data');
        }
      })
      .catch(() => {
        // Use default data for developers
        if (developerId === '1') {
          setDeveloper({
            id: 1,
            name: 'Niyonkuru Reponse',
            role: 'Umuyobozi w\'Itsinda & Umuyobozi w\'Iterambere rya Sisitemu',
            image: '/api/placeholder/600/600',
            email: 'reponse@garden-tvet.rw',
            phone: '+250 788 123 456',
            location: 'Kigali, Rwanda',
            github: 'https://github.com/niyonkuru-reponse',
            linkedin: 'https://linkedin.com/in/niyonkuru-reponse',
            bio: `Niyonkuru Reponse ni umuyobozi mukuru w'itsinda ry'abatunganyije sisitemu ikomeye yo gucunga ishuri. Yize muri Garden TVET School mu ishami rya Software Development Level 4, aho yagaragaje ubushobozi bukomeye mu iterambere rya sisitemu n'ubuyobozi bw'imishinga.

Nk'umuyobozi w'itsinda, Reponse yafashe inshingano zo guhuza abagize itsinda, gushyiraho imyubakire ya sisitemu, no kwemeza ko umushinga urangira neza. Yagize uruhare runini mu gushyira mu bikorwa tekinoloji zigezweho nko React, TypeScript, Node.js, Express, na MySQL mu gukora sisitemu ihuza ibikenewe n'amashuri mu Rwanda.

IMYUGA N'UBUMENYI:
Reponse afite ubumenyi bukomeye mu iterambere rya sisitemu zikomeye (Full-Stack Development). Yize gukoresha React na TypeScript mu gutunganya interface y'abakoresha (Frontend), Node.js na Express mu gutunganya server (Backend), na MySQL mu gucunga ububiko bw'amakuru (Database). Yagize uruhare runini mu gushyira mu bikorwa:

1. SISITEMU YO KWIYANDIKISHA ABANYESHURI
Yatunganye sisitemu ikomeye yo kwiyandikisha abanyeshuri ikoresheje kode zidasanzwe (Serial Codes) aho abanyeshuri bakoresha kode nka SOD202611234 kugira ngo binjire muri sisitemu. Iyi sisitemu ikoresha JWT (JSON Web Tokens) kugira ngo irinde umutekano w'amakuru.

2. DASHBOARD ZA ROLE-BASED
Yashyizeho dashboard zitandukanye ku bigo by'abakoresha: Admin, Headmaster, DOS, DOD, Teachers, Students, na Parents. Buri dashboard ifite ibiranga byayo kandi itanga amakuru akenewe n'uruhare rw'umukoresha.

3. SISITEMU YO GUCUNGA AMAKLASI
Yatunganye sisitemu ikomeye yo gucunga amaklasi (Class Management System) aho DOS ashobora kongeramo abanyeshuri mu maklasi, kugena abarimu, no gukora amategeko y'amasomo (Timetables). Sisitemu ikoresha algoritme zidasanzwe zo gukemura ibibazo by'igihe n'umwanya.

4. SISITEMU YO GUKURIKIRANA AMANOTA
Yashyizeho sisitemu yo gukurikirana amanota y'abanyeshuri (Grading System) aho abarimu bashobora kwinjiza amanota, abanyeshuri bakabona raporo zabo, kandi ababyeyi bakakurikirana iterambere ry'abana babo.

5. SISITEMU YO GUHANAHANA
Yatunganye sisitemu yo guhanahana (Communication System) aho abakoresha bashobora kohereza ubutumwa, notifications, na announcements. Sisitemu ikoresha WebSocket kugira ngo itange ubutumwa bwihuse (Real-time messaging).

IMISHINGA YAKOZE:
Reponse yagize uruhare runini mu gukora imishinga myinshi mu ishuri:

1. School Management System (2024-2026)
Umushinga mukuru w'impamyabumenyi ufite ibiranga byinshi nko:
- Kwiyandikisha abanyeshuri n'abarimu
- Gucunga amaklasi n'amategeko y'amasomo
- Gukurikirana amanota n'ibyavuye mu masomo
- Sisitemu yo kwishyura amafaranga
- Raporo n'imibare (Analytics & Reports)
- Sisitemu yo guhanahana
- Parent Portal kugira ngo ababyeyi bakurikirane abana babo

2. Student Serial Code Authentication System
Sisitemu idasanzwe yo kwinjira ikoresheje kode zidasanzwe aho abanyeshuri bakoresha kode nka SOD202611234 aho gukoresha email. Iyi sisitemu yashyizweho kugira ngo yoroshye abanyeshuri kandi ikabungabunga umutekano.

3. Class Sheets Management System
Sisitemu yo gucunga urutonde rw'abanyeshuri mu maklasi (Class Sheets) aho DOS ashobora kureba abanyeshuri bose mu ishami, gukora raporo, no gusohora CSV files.

4. DOS Management Dashboard
Dashboard ikomeye ya Director of Studies (DOS) ifite ibiranga byinshi nko:
- Gucunga abarimu n'amaklasi
- Gukora amategeko y'amasomo
- Gukurikirana iterambere ry'abanyeshuri
- Raporo n'imibare

5. Homepage Content Management System
Sisitemu yo gucunga ibiri ku rupapuro rw'itangiriro (Homepage) aho admin ashobora:
- Kongeramo amakuru (News & Articles)
- Gucunga amafoto (Gallery Management)
- Kongeramo ibyavuye mu mashuri (Achievements)
- Gucunga ibikorwa (Events Management)

TEKINOLOJI YAKORESHEJE:
Reponse yakoresha tekinoloji zigezweho mu gukora sisitemu:

Frontend:
- React 18 na TypeScript kugira ngo akore interface y'abakoresha
- Tailwind CSS kugira ngo atunganyirize design
- Framer Motion kugira ngo akore animations
- Shadcn/ui kugira ngo akore components zinoze
- React Router kugira ngo atunganyirize navigation

Backend:
- Node.js na Express kugira ngo akore REST API
- MySQL kugira ngo acunge ububiko bw'amakuru
- JWT kugira ngo arinde umutekano
- Bcrypt kugira ngo ashyire mu mwimerere passwords
- Multer kugira ngo akore file uploads

Database Design:
- Yashyizeho database schema ikomeye ifite ameza arenga 20
- Yakoresha foreign keys kugira ngo arinde data integrity
- Yakoresha indexes kugira ngo yongere performance
- Yakoresha transactions kugira ngo arinde data consistency

UBUSHOBOZI BWE:
1. Full-Stack Development - Ubushobozi bwo gukora sisitemu zuzuye kuva frontend kugeza backend
2. Database Design - Ubushobozi bwo gushyiraho database schema ikomeye
3. System Architecture - Ubushobozi bwo gushyiraho imyubakire ya sisitemu
4. Team Leadership - Ubushobozi bwo kuyobora itsinda
5. Project Management - Ubushobozi bwo gucunga imishinga
6. Problem Solving - Ubushobozi bwo gukemura ibibazo
7. Code Review - Ubushobozi bwo gusuzuma code
8. Documentation - Ubushobozi bwo kwandika documentation

IBYATANZWE:
1. Yatunganye sisitemu ikomeye yo gucunga ishuri ifite ibiranga byinshi
2. Yashyizeho sisitemu yo kwiyandikisha abanyeshuri ikoresheje kode zidasanzwe
3. Yatunganye dashboard zitandukanye ku bigo by'abakoresha
4. Yashyizeho sisitemu yo gucunga amaklasi n'amategeko y'amasomo
5. Yatunganye sisitemu yo gukurikirana amanota y'abanyeshuri
6. Yashyizeho sisitemu yo guhanahana
7. Yatunganye sisitemu yo gucunga ibiri ku rupapuro rw'itangiriro
8. Yashyizeho sisitemu yo gucunga amafoto
9. Yatunganye sisitemu yo gucunga ibikorwa
10. Yashyizeho sisitemu yo kwishyura amafaranga

IMYIGISHIRIZE:
Reponse yize muri Garden TVET School mu ishami rya Software Development Level 4 (2024-2026). Yize amasomo menshi arimo:
- Programming Fundamentals (C++, Java, Python)
- Web Development (HTML, CSS, JavaScript, React)
- Backend Development (Node.js, Express, PHP)
- Database Management (MySQL, MongoDB)
- Mobile Development (React Native, Flutter)
- Software Engineering (Design Patterns, SOLID Principles)
- Project Management (Agile, Scrum)
- Version Control (Git, GitHub)

INTEGO ZE:
Reponse afite intego zo gukomeza kwiga no guteza imbere ubumenyi bwe mu iterambere rya sisitemu. Yifuza:
1. Gukomeza gukora sisitemu zikomeye zikoreshwa n'amashuri mu Rwanda
2. Kwiga tekinoloji nshya nko Cloud Computing (AWS, Azure)
3. Kwiga Mobile Development (React Native, Flutter)
4. Kwiga Machine Learning na Artificial Intelligence
5. Gufasha abandi banyeshuri kwiga programming
6. Gukora startup yo gukora software mu Rwanda

AMAFARANGA YINJIZA:
Reponse yinjije amafaranga menshi mu gukora imishinga:
1. School Management System - 5,000,000 RWF
2. E-commerce Platform - 3,000,000 RWF
3. Mobile App Development - 2,000,000 RWF
4. Website Development - 1,000,000 RWF

IBIHEMBO YARONSE:
1. Best Student Developer 2025 - Garden TVET School
2. Innovation Award 2025 - Rwanda ICT Chamber
3. Best Graduation Project 2026 - TVET Schools Competition
4. Young Developer Award 2026 - Rwanda Development Board

ITSINDA AKORA:
Reponse akora mu itsinda rifite abantu 4:
1. Niyonkuru Reponse - Team Owner & System Development Manager
2. Musoni Mugisha Yves - Asset Tracker & Innovation Specialist
3. Zamilu Yazid Surayman - Secretary & Data Gathering Specialist
4. Niyonsenga Frank - Team Representative & Advisor

IBIKORWA BYE:
Reponse akora ibikorwa byinshi mu ishuri:
1. Coding Club - Umuyobozi wa club yo kwiga programming
2. Tech Talks - Umuvugizi mu biganiro bya tekinoloji
3. Hackathons - Umutungamirije mu marushanwa ya programming
4. Mentorship Program - Umujyanama w'abanyeshuri bato

IMYIFATIRE YE:
Reponse ni umuntu ufite imyifatire myiza:
1. Umuntu w'ubwenge - Afite ubushobozi bwo gukemura ibibazo
2. Umuntu w'ubufatanye - Akora neza n'abandi
3. Umuntu w'ubwitange - Yitanga mu kazi
4. Umuntu w'ubwubahane - Yubaha abandi
5. Umuntu w'ubwiyunge - Yemera abandi

INYIGISHO ATANGA:
Reponse atanga inyigisho ku banyeshuri bato:
1. Programming Fundamentals
2. Web Development
3. Database Management
4. Software Engineering
5. Project Management

IBISUBIZO BYE:
Reponse afite ibisubizo byinshi:
1. Gukora sisitemu zikomeye zikoreshwa n'amashuri
2. Gufasha abanyeshuri kwiga programming
3. Gukora startup yo gukora software
4. Kwiga tekinoloji nshya
5. Gufasha u Rwanda mu iterambere rya ICT`,
            skills: ['React', 'TypeScript', 'Node.js', 'Express', 'MySQL', 'System Architecture', 'Team Leadership', 'Project Management'],
            projects: [
              { name: 'School Management System', role: 'Lead Developer', year: '2024-2026' },
              { name: 'Student Authentication System', role: 'System Architect', year: '2025' },
              { name: 'Class Management System', role: 'Full-Stack Developer', year: '2025' },
              { name: 'Homepage CMS', role: 'Backend Developer', year: '2025' }
            ],
            achievements: [
              'Best Student Developer 2025',
              'Innovation Award 2025',
              'Best Graduation Project 2026',
              'Young Developer Award 2026'
            ]
          });
        }
      })
      .finally(() => setLoading(false));
  }, [developerId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Gutegura...</p>
        </div>
      </div>
    );
  }

  if (!developer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-xl">Nta makuru yabonetse</p>
          <Button onClick={() => onNavigate('developers')} className="mt-4">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Subira
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-600 to-green-600 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            onClick={() => onNavigate('developers')}
            className="text-white hover:bg-white/20 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Subira ku batunganyije
          </Button>
          
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-32 h-32 rounded-full bg-white/20 backdrop-blur-sm overflow-hidden"
            >
              {developer?.image_url ? (
                <img 
                  src={`http://localhost:5000${developer.image_url}`} 
                  alt={developer.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl font-bold">
                  {developer?.name?.split(' ').map((n: string) => n[0]).join('') || 'NR'}
                </div>
              )}
            </motion.div>
            
            <div className="flex-1">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl font-black mb-2"
              >
                {developer?.name || 'N/A'}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-xl text-white/90 mb-4"
              >
                {developer?.role_rw || developer?.role || 'N/A'}
              </motion.p>
              
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>{developer?.email || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>{developer?.phone || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{developer?.location || 'Kigali, Rwanda'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-xl p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Users className="w-6 h-6 text-yellow-600" />
                Amakuru Yihariye
              </h2>
              <div className="prose prose-lg max-w-none text-gray-700 whitespace-pre-line">
                {developer?.description_rw || developer?.description || developer?.bio || 'Nta makuru'}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-xl p-6"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-600" />
                Ubushobozi Bukuru
              </h3>
              <div className="space-y-3">
                {(Array.isArray(developer?.skills) ? developer.skills : [
                  'React', 'TypeScript', 'Node.js', 'MySQL'
                ]).map((skill: string) => (
                  <div key={skill} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-gray-700">{skill}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-xl p-6"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-600" />
                Ibihembo
              </h3>
              <div className="space-y-3">
                {(Array.isArray(developer?.achievements) ? developer.achievements : [
                  'Best Developer 2025'
                ]).map((award: string) => (
                  <div key={award} className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="text-gray-700 text-sm">{award}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-xl p-6"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Github className="w-5 h-5 text-yellow-600" />
                Ihuza
              </h3>
              <div className="space-y-3">
                <a href={developer?.github_url || developer?.github || '#'} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 hover:text-blue-800">
                  <Github className="w-4 h-4" />
                  <span>GitHub</span>
                </a>
                <a href={developer?.linkedin_url || developer?.linkedin || '#'} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 hover:text-blue-800">
                  <Linkedin className="w-4 h-4" />
                  <span>LinkedIn</span>
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeveloperDetailPage;
