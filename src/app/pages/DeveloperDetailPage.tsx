import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Mail, Phone, MapPin, Github, Linkedin, Code, Award, Briefcase, GraduationCap, Star, Zap, Trophy, Target, CheckCircle, Calendar, Users, BookOpen } from 'lucide-react';
import { Button } from '@/app/components/ui/button';

interface DeveloperDetailPageProps {
  developerId: string;
  onNavigate: (page: string) => void;
}

const DeveloperDetailPage: React.FC<DeveloperDetailPageProps> = ({ developerId, onNavigate }) => {
  const [developer, setDeveloper] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Fetch developer details
    fetch(`http://localhost:5000/api/developers/team/${developerId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setDeveloper(data.developer);
        } else {
          throw new Error('No data');
        }
      })
      .catch(() => {
        // Use default data for Niyonkuru Reponse
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
      <div className="bg-gradient-to-r from-yellow-400 via-green-400 to-yellow-500 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Button onClick={() => onNavigate('developers')} variant="ghost" className="text-white hover:bg-white/20">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Subira ku Itsinda
          </Button>
        </div>
      </div>

      {/* Profile Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar - Fixed */}
          <div className="lg:col-span-1">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="sticky top-24">
              <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-4 border-yellow-400 p-6">
                {/* Circular Avatar */}
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="w-48 h-48 rounded-full overflow-hidden border-8 border-gradient-to-br from-yellow-400 to-green-400 shadow-2xl"
                    >
                      {developer?.image && (
                        <img src={developer.image} alt={developer?.name || 'Developer'} className="w-full h-full object-cover" />
                      )}
                    </motion.div>
                    <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-gradient-to-br from-yellow-400 to-green-400 rounded-full flex items-center justify-center shadow-xl">
                      <Star className="w-8 h-8 text-white fill-current" />
                    </div>
                  </div>
                </div>

                <div className="text-center mb-6">
                  <h1 className="text-2xl font-black text-gray-900 mb-2">{developer?.name || 'N/A'}</h1>
                  <p className="text-base font-bold bg-gradient-to-r from-yellow-600 to-green-600 bg-clip-text text-transparent mb-4">{developer?.role || 'N/A'}</p>
                </div>
                    
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-gray-700 p-3 bg-gray-50 rounded-xl">
                    <MapPin className="w-5 h-5 text-yellow-600" />
                    <span className="text-sm">{developer?.location || 'Kigali, Rwanda'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700 p-3 bg-gray-50 rounded-xl">
                    <Mail className="w-5 h-5 text-green-600" />
                    <a href={`mailto:${developer?.email}`} className="hover:text-green-600 text-sm truncate">{developer?.email || 'N/A'}</a>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700 p-3 bg-gray-50 rounded-xl">
                    <Phone className="w-5 h-5 text-yellow-600" />
                    <a href={`tel:${developer?.phone}`} className="hover:text-yellow-600 text-sm">{developer?.phone || 'N/A'}</a>
                  </div>
                </div>

                <div className="flex gap-3">
                  <a href={developer?.github || '#'} target="_blank" rel="noopener noreferrer" className="flex-1 bg-gradient-to-r from-yellow-400 to-green-400 text-white py-3 rounded-xl font-bold text-center hover:shadow-lg transition-shadow flex items-center justify-center gap-2">
                    <Github className="w-5 h-5" />
                    GitHub
                  </a>
                  <a href={developer?.linkedin || '#'} target="_blank" rel="noopener noreferrer" className="flex-1 bg-gradient-to-r from-green-400 to-yellow-400 text-white py-3 rounded-xl font-bold text-center hover:shadow-lg transition-shadow flex items-center justify-center gap-2">
                    <Linkedin className="w-5 h-5" />
                    LinkedIn
                  </a>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Bio */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-3xl shadow-xl p-8">
              <h2 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-3">
                <BookOpen className="w-6 h-6 text-yellow-600" />
                Amateka Yanjye
              </h2>
              <div className="prose prose-lg max-w-none text-gray-700 whitespace-pre-line leading-relaxed">
                {developer?.bio || 'Nta makuru'}
              </div>
            </motion.div>

            {/* Skills */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-3xl shadow-xl p-8">
              <h2 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-3">
                <Zap className="w-6 h-6 text-green-600" />
                Ubumenyi Bwanjye
              </h2>
              <div className="flex flex-wrap gap-3">
                {developer?.skills?.map((skill: string, i: number) => (
                  <span key={i} className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-green-400 text-white font-bold rounded-full shadow-lg">
                    {skill}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Projects */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-3xl shadow-xl p-8">
              <h2 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-3">
                <Briefcase className="w-6 h-6 text-yellow-600" />
                Imishinga Yakoze
              </h2>
              <div className="space-y-4">
                {developer?.projects?.map((project: any, i: number) => (
                  <div key={i} className="border-l-4 border-green-400 pl-4 py-2">
                    <h3 className="font-bold text-lg text-gray-900">{project.name}</h3>
                    <p className="text-gray-600">{project.role} • {project.year}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Achievements */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white rounded-3xl shadow-xl p-8">
              <h2 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-3">
                <Trophy className="w-6 h-6 text-yellow-600" />
                Ibihembo Yaronse
              </h2>
              <div className="space-y-3">
                {developer?.achievements?.map((achievement: string, i: number) => (
                  <div key={i} className="flex items-center gap-3">
                    <Star className="w-5 h-5 text-yellow-500 fill-current" />
                    <span className="text-gray-700 font-semibold">{achievement}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeveloperDetailPage;
