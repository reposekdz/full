import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Mail, Phone, MapPin, Github, Linkedin, Code, Award, Briefcase, GraduationCap, Star, Zap, Trophy, Target, CheckCircle, Calendar, Users, BookOpen, MessageSquare, Shield, UserCheck } from 'lucide-react';
import { Button } from '@/app/components/ui/button';

interface NiyonsengaDetailPageProps {
  onNavigate: (page: string) => void;
}

const NiyonsengaDetailPage: React.FC<NiyonsengaDetailPageProps> = ({ onNavigate }) => {
  const [developer, setDeveloper] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Use default data for Niyonsenga Frank
    setDeveloper({
      id: 4,
      name: 'Niyonsenga Frank',
      role: 'Team Representative & Advisor',
      image: '/api/placeholder/600/600',
      email: 'frank@garden-tvet.rw',
      phone: '+250 788 456 789',
      location: 'Kigali, Rwanda',
      github: 'https://github.com/niyonsenga-frank',
      linkedin: 'https://linkedin.com/in/niyonsenga-frank',
      bio: `Niyonsenga Frank ni umuhanga mu kuyobora itsinda (Team Leadership) n'ubujyanama bw'ikoranabuhanga (Technical Advisory) mu itsinda ry'abatunganyije sisitemu ikomeye yo gucunga ishuri. Yize muri Garden TVET School mu ishami rya Software Development Level 4, aho yagaragaje ubushobozi bukomeye mu kuyobora itsinda, guhuza abagize itsinda, no gutanga ubujyanama bw'ikoranabuhanga.

Nk'umuhanga mu kuyobora itsinda, Frank yafashe inshingano zo guhuza abagize itsinda, gukemura amakimbirane, gutanga ubujyanama, no kwemeza ko itsinda rikora neza. Yagize uruhare runini mu gushyira mu bikorwa tekinoloji zigezweho nko React, Node.js, Git, na project management tools mu kuyobora imishinga.

IMYUGA N'UBUMENYI:
Frank afite ubumenyi bukomeye mu kuyobora itsinda (Team Leadership) n'ubujyanama bw'ikoranabuhanga (Technical Advisory). Yize gukoresha Git na GitHub mu kuyobora code, Slack na Discord mu guhanahana, Jira na Trello mu gucunga imishinga, na Zoom na Microsoft Teams mu gukora inama. Yagize uruhare runini mu gushyira mu bikorwa:

1. TEAM COORDINATION SYSTEM
Yatunganye sisitemu yo guhuza itsinda (Team Coordination) aho abagize itsinda bashobora:
- Gusangira amakuru n'ibitekerezo
- Gukurikirana imishinga n'inshingano
- Gukora inama za video
- Gusangira dosiye n'ibikoresho

2. PROJECT MANAGEMENT PLATFORM
Yashyizeho platform yo gucunga imishinga aho:
- Gushyiraho imishinga mishya
- Gukurikirana iterambere ry'imishinga
- Gutanga inshingano ku bagize itsinda
- Gukora raporo z'iterambere

3. COMMUNICATION & COLLABORATION SYSTEM
Yatunganye sisitemu yo guhanahana n'ubufatanye aho:
- Real-time messaging
- File sharing na collaboration
- Video conferencing integration
- Notification management

4. QUALITY ASSURANCE FRAMEWORK
Yashyizeho framework yo kwemeza ubwiza (Quality Assurance) aho:
- Code review processes
- Testing procedures
- Documentation standards
- Performance monitoring

5. MENTORSHIP & TRAINING PLATFORM
Yatunganye platform yo gutoza n'ubujyanama aho:
- Training materials management
- Skill assessment tools
- Mentorship matching system
- Progress tracking

IMISHINGA YAKOZE:
Frank yagize uruhare runini mu gukora imishinga myinshi:

1. Team Management & Collaboration Platform (2024-2026)
Umushinga mukuru w'impamyabumenyi ufite ibiranga byinshi nko:
- Team member management
- Project assignment na tracking
- Communication tools
- Performance evaluation
- Resource allocation
- Meeting scheduling na management
- Document collaboration
- Knowledge sharing platform

2. Student Leadership Development System
Sisitemu yo guteza imbere ubuyobozi bw'abanyeshuri aho:
- Leadership skills assessment
- Training program management
- Mentorship opportunities
- Leadership project tracking
- Peer evaluation system

3. Staff Communication Portal
Portal yo guhanahana hagati y'abakozi aho:
- Internal messaging system
- Announcement management
- Event coordination
- Resource sharing
- Feedback collection

4. Academic Advisory System
Sisitemu yo gutanga ubujyanama bw'amasomo aho:
- Student counseling management
- Academic planning tools
- Career guidance resources
- Progress monitoring
- Parent communication

5. Conflict Resolution Platform
Platform yo gukemura amakimbirane aho:
- Issue reporting system
- Mediation process management
- Resolution tracking
- Feedback collection
- Prevention strategies

TEKINOLOJI YAKORESHEJE:
Frank yakoresha tekinoloji zigezweho:

Project Management:
- Jira na Confluence
- Trello na Asana
- Microsoft Project
- Slack na Discord
- Zoom na Microsoft Teams

Development Tools:
- Git na GitHub kugira ngo ayobore code
- VS Code na development environments
- Docker kugira ngo atunganyirize environments
- CI/CD pipelines

Communication Platforms:
- Slack API integration
- Microsoft Teams integration
- Zoom SDK
- WebRTC kugira ngo akore video calls
- Socket.io kugira ngo akore real-time messaging

Frontend Development:
- React na TypeScript
- Material-UI na Ant Design
- Responsive design principles
- Progressive Web Apps (PWA)

Backend Development:
- Node.js na Express
- RESTful API design
- Authentication na authorization
- Database integration

UBUSHOBOZI BWE:
1. Team Leadership - Ubushobozi bwo kuyobora itsinda
2. Project Management - Ubushobozi bwo gucunga imishinga
3. Communication Skills - Ubushobozi bwo guhanahana
4. Conflict Resolution - Ubushobozi bwo gukemura amakimbirane
5. Technical Advisory - Ubushobozi bwo gutanga ubujyanama bw'ikoranabuhanga
6. Mentorship - Ubushobozi bwo gutoza abandi
7. Strategic Planning - Ubushobozi bwo gutegura ingamba
8. Quality Assurance - Ubushobozi bwo kwemeza ubwiza

IBYATANZWE:
1. Yatunganye team coordination system
2. Yashyizeho project management platform
3. Yatunganye communication na collaboration system
4. Yashyizeho quality assurance framework
5. Yatunganye mentorship na training platform
6. Yashyizeho student leadership development system
7. Yatunganye staff communication portal
8. Yashyizeho academic advisory system
9. Yatunganye conflict resolution platform
10. Yashyizeho performance evaluation system

IMYIGISHIRIZE:
Frank yize muri Garden TVET School mu ishami rya Software Development Level 4 (2024-2026). Yize amasomo menshi arimo:
- Leadership na Management Principles
- Project Management (Agile, Scrum, Waterfall)
- Communication na Interpersonal Skills
- Conflict Resolution na Mediation
- Team Building na Collaboration
- Strategic Planning na Decision Making
- Quality Management Systems
- Technical Advisory na Consulting

INTEGO ZE:
Frank afite intego zo:
1. Gukomeza guteza imbere ubushobozi bwo kuyobora itsinda
2. Kwiga advanced project management methodologies
3. Gukora consulting company yo gufasha amashuri
4. Kwiga organizational psychology na change management
5. Gufasha abanyeshuri benshi guteza imbere ubuyobozi
6. Gukora leadership training programs

AMAFARANGA YINJIZA:
1. Team Management Solutions - 3,000,000 RWF
2. Leadership Training Programs - 2,200,000 RWF
3. Consulting Services - 2,800,000 RWF
4. Project Management Tools - 1,500,000 RWF

IBIHEMBO YARONSE:
1. Best Team Leader 2025 - Garden TVET School
2. Leadership Excellence Award 2025 - Rwanda ICT Chamber
3. Best Project Management Solution 2026 - TVET Competition
4. Young Leader Award 2026 - Rwanda Development Board

ITSINDA AKORA:
Frank akora mu itsinda rifite abantu 4:
1. Niyonkuru Reponse - Team Owner & System Development Manager
2. Musoni Mugisha Yves - Asset Tracker & Innovation Specialist
3. Zamiru Yazid Surayman - Secretary & Data Gathering Specialist
4. Niyonsenga Frank - Team Representative & Advisor

IBIKORWA BYE:
1. Leadership Club - Umuyobozi wa club y'ubuyobozi
2. Debate Society - Umuyobozi wa sosiyete y'impaka
3. Student Council - Umujyanama w'abanyeshuri
4. Peer Mentorship Program - Umuyobozi wa gahunda yo gutoza
5. Conflict Mediation Team - Umuyobozi w'itsinda ryo gukemura amakimbirane

AMAHUGURWA YATANZE:
1. Leadership Skills Development
2. Effective Communication Techniques
3. Project Management Fundamentals
4. Conflict Resolution Strategies
5. Team Building Activities

IMISHINGA AZAKORA:
1. AI-Powered Team Analytics - Sisitemu yo gusesengura imikorere y'itsinda ikoresheje AI
2. Virtual Reality Leadership Training - Gahunda yo gutoza ubuyobozi ikoresheje VR
3. Blockchain-Based Credential System - Sisitemu yo kwemeza impamyabumenyi ikoresheje blockchain
4. Smart Meeting Assistant - Umufasha w'inama ukoresheje AI
5. Global Leadership Network - Urusobe rw'abayobozi ku isi

UBUFATANYE:
Frank afatanyije n'amashuri menshi mu Rwanda:
1. Rwanda Leadership University
2. University of Rwanda - School of Business
3. Private Sector Federation - Leadership Development
4. Youth Leadership Organizations

UBWIYUNGE BWE:
Frank ni umuntu wiyunge cyane mu guteza imbere ubuyobozi bw'urubyiruko. Yifuza ko abanyeshuri bose bazagira amahirwe yo guteza imbere ubushobozi bwabo bwo kuyobora.

AMAHUGURWA YAKOZE:
Frank yakoze amahugurwa menshi:

1. Leadership Skills Workshop (2025)
Amahugurwa y'ubushobozi bwo kuyobora aho yigishije:
- Effective leadership styles
- Decision making processes
- Team motivation techniques
- Communication strategies
- Conflict resolution methods

2. Project Management Training (2025)
Amahugurwa yo gucunga imishinga aho yigishije:
- Agile methodology
- Scrum framework
- Risk management
- Resource allocation
- Timeline management

3. Communication Skills Seminar (2025)
Amahugurwa y'ubushobozi bwo guhanahana aho yigishije:
- Public speaking techniques
- Active listening skills
- Written communication
- Non-verbal communication
- Cross-cultural communication

4. Conflict Resolution Workshop (2026)
Amahugurwa yo gukemura amakimbirane aho yigishije:
- Mediation techniques
- Negotiation strategies
- Problem-solving approaches
- Emotional intelligence
- Restorative justice principles

ITSINDA AYOBORA:
Frank ayobora itsinda rifite abanyeshuri 15 mu ishuri:

1. Student Leadership Council
Inama y'abanyeshuri bayobozi aho:
- Gukurikirana ibibazo by'abanyeshuri
- Gutanga ibitekerezo ku bayobozi b'ishuri
- Gutegura ibikorwa by'abanyeshuri
- Gufasha mu gukemura amakimbirane

2. Peer Mentorship Program
Gahunda yo gutoza abanyeshuri aho:
- Abanyeshuri bakuru bafasha abato
- Gutanga ubujyanama bw'amasomo
- Gufasha mu kwiga
- Guteza imbere ubwiyunge

3. Debate and Public Speaking Club
Club y'impaka n'ubwiyerekano aho:
- Gutegura impaka
- Gutoza ubwiyerekano
- Gukora amahugurwa y'ubwiyerekano
- Gufasha abanyeshuri kwiyerekana

IMISHINGA YO GUTEZA IMBERE UBUYOBOZI:
1. Young Leaders Academy - Ishuri ry'abayobozi bato
2. Leadership Mentorship Network - Urusobe rw'ubujyanama bw'ubuyobozi
3. Community Service Projects - Imishinga yo gufasha abaturage
4. Innovation Challenge Program - Gahunda y'ubushakashatsi
5. Global Leadership Exchange - Guhana ubuyobozi n'abandi banyeshuri ku isi

UBUSHOBOZI BWE MU KUYOBORA:
1. Strategic Thinking - Ubushobozi bwo gutekereza ku buryo bw'ingamba
2. Emotional Intelligence - Ubwenge bw'amarangamutima
3. Decision Making - Ubushobozi bwo gufata ibyemezo
4. Team Building - Ubushobozi bwo kubaka itsinda
5. Change Management - Ubushobozi bwo gucunga impinduka
6. Crisis Management - Ubushobozi bwo gucunga ibibazo
7. Innovation Leadership - Ubuyobozi bw'ubushakashatsi
8. Cultural Competence - Ubushobozi bwo gukorana n'imico itandukanye

AMATEGEKO AKURIKIZA MU KUYOBORA:
1. Transparency - Ubunyangamugayo
2. Accountability - Kwicuza ku nshingano
3. Integrity - Ubwiyunge
4. Respect - Kubaha abandi
5. Collaboration - Ubufatanye
6. Innovation - Ubushakashatsi
7. Excellence - Ubwiza
8. Service - Gufasha abandi`
    });
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Gukuramo amakuru...</p>
        </div>
      </div>
    );
  }

  if (!developer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Nta makuru aboneka</p>
          <Button onClick={() => onNavigate('developers')} className="mt-4">
            Subira ku batunganyije
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white py-8">
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
              className="w-32 h-32 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-4xl font-bold"
            >
              {developer.name.split(' ').map((n: string) => n[0]).join('')}
            </motion.div>
            
            <div className="flex-1">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl font-black mb-2"
              >
                {developer.name}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-xl text-white/90 mb-4"
              >
                {developer.role}
              </motion.p>
              
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>{developer.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>{developer.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{developer.location}</span>
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
                <UserCheck className="w-6 h-6 text-green-600" />
                Amakuru Yihariye
              </h2>
              <div className="prose prose-lg max-w-none text-gray-700 whitespace-pre-line">
                {developer.bio}
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
                <MessageSquare className="w-5 h-5 text-green-600" />
                Ubushobozi Bukuru
              </h3>
              <div className="space-y-3">
                {[
                  'Team Leadership',
                  'Project Management', 
                  'Communication Skills',
                  'Conflict Resolution',
                  'Technical Advisory',
                  'Strategic Planning'
                ].map((skill, index) => (
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
                <Trophy className="w-5 h-5 text-green-600" />
                Ibihembo
              </h3>
              <div className="space-y-3">
                {[
                  'Best Team Leader 2025',
                  'Leadership Excellence Award 2025',
                  'Best Project Management Solution 2026',
                  'Young Leader Award 2026'
                ].map((award, index) => (
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
                <Github className="w-5 h-5 text-green-600" />
                Ihuza
              </h3>
              <div className="space-y-3">
                <a href={developer.github} className="flex items-center gap-2 text-blue-600 hover:text-blue-800">
                  <Github className="w-4 h-4" />
                  <span>GitHub</span>
                </a>
                <a href={developer.linkedin} className="flex items-center gap-2 text-blue-600 hover:text-blue-800">
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

export default NiyonsengaDetailPage;