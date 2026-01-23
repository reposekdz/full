import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Users, GraduationCap, BarChart, MessageSquare, FileText, Award, Zap, Shield, Lightbulb, ChevronRight } from 'lucide-react';
import { IntroSection, StudentsSection, ParentsSection } from './DocumentationSections';
import { TeachersSection, FeaturesSection, LearningSection, AssessmentSection, CommunicationSection, AnalyticsSection, SecuritySection } from './DocumentationSectionsExtra';

interface SystemDocumentationProps {
  language?: string;
}

const SystemDocumentation: React.FC<SystemDocumentationProps> = ({ language = 'rw' }) => {
  const [expandedSection, setExpandedSection] = useState<string | null>('intro');

  const sections = [
    { id: 'intro', icon: BookOpen, title: 'Intangiriro', titleEn: 'Introduction' },
    { id: 'students', icon: GraduationCap, title: 'Abanyeshuri', titleEn: 'For Students' },
    { id: 'parents', icon: Users, title: 'Ababyeyi', titleEn: 'For Parents' },
    { id: 'teachers', icon: Award, title: 'Abarimu', titleEn: 'For Teachers' },
    { id: 'features', icon: Zap, title: 'Ibiranga', titleEn: 'Key Features' },
    { id: 'learning', icon: Lightbulb, title: 'Kwiga Online', titleEn: 'Online Learning' },
    { id: 'assessment', icon: FileText, title: 'Ibizamini', titleEn: 'Assessments' },
    { id: 'communication', icon: MessageSquare, title: 'Itumanaho', titleEn: 'Communication' },
    { id: 'analytics', icon: BarChart, title: 'Raporo', titleEn: 'Analytics' },
    { id: 'security', icon: Shield, title: 'Umutekano', titleEn: 'Security' }
  ];

  const renderIntroSection = () => (
    <motion.div
      key="intro"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <div className="bg-gradient-to-br from-green-50 to-yellow-50 rounded-3xl p-8 shadow-xl">
        <h3 className="text-4xl font-black text-gray-900 mb-6 flex items-center gap-3">
          <BookOpen className="w-10 h-10 text-green-600" />
          {language === 'rw' ? 'Intangiriro - Sisitemu Ikomeye yo Gucunga Ishuri' : 'Introduction - Powerful School Management System'}
        </h3>
        
        <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
          <p className="text-2xl font-bold leading-relaxed text-green-800">
            {language === 'rw' 
              ? 'Murakaza neza kuri sisitemu yacu ikomeye yo gucunga ishuri! Sisitemu ihuza tekinoloji igezweho n\'ibikenewe n\'amashuri mu Rwanda.'
              : 'Welcome to our powerful school management system! The system combines modern technology with the needs of schools in Rwanda.'}
          </p>

          <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-green-200">
            <h4 className="text-3xl font-black text-green-700 mb-6 flex items-center gap-3">
              <Target className="w-8 h-8" />
              {language === 'rw' ? 'Intego Nyamukuru za Sisitemu' : 'Main System Objectives'}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-green-50 rounded-xl">
                  <CheckCircle className="w-8 h-8 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <h5 className="font-bold text-lg mb-2">{language === 'rw' ? 'Guteza Imbere Uburezi' : 'Advance Education'}</h5>
                    <p className="text-sm">{language === 'rw' ? 'Gukoresha tekinoloji mu guteza imbere uburezi bw\'ikoranabuhanga mu Rwanda no gufasha abanyeshuri kwiga mu buryo bworoshye kandi bwiza.' : 'Use technology to advance technical education in Rwanda and help students learn easily and effectively.'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-yellow-50 rounded-xl">
                  <CheckCircle className="w-8 h-8 text-yellow-600 mt-1 flex-shrink-0" />
                  <div>
                    <h5 className="font-bold text-lg mb-2">{language === 'rw' ? 'Kworoshya Imikorere' : 'Simplify Operations'}</h5>
                    <p className="text-sm">{language === 'rw' ? 'Kugabanya ibikorwa bya kimwe na kimwe no kworoshya imikorere y\'ishuri mu buryo bwose - kuva mu kwandikisha abanyeshuri kugeza mu gutanga raporo.' : 'Reduce manual tasks and simplify school operations in all aspects - from student registration to report generation.'}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-green-50 rounded-xl">
                  <CheckCircle className="w-8 h-8 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <h5 className="font-bold text-lg mb-2">{language === 'rw' ? 'Guhuza Abantu' : 'Connect People'}</h5>
                    <p className="text-sm">{language === 'rw' ? 'Guhuza abanyeshuri, ababyeyi, abarimu n\'ubuyobozi bw\'ishuri mu buryo bworoshye kandi bwihuse binyuze muri sisitemu imwe.' : 'Connect students, parents, teachers and school administration easily and quickly through one system.'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-yellow-50 rounded-xl">
                  <CheckCircle className="w-8 h-8 text-yellow-600 mt-1 flex-shrink-0" />
                  <div>
                    <h5 className="font-bold text-lg mb-2">{language === 'rw' ? 'Gutanga Raporo' : 'Provide Reports'}</h5>
                    <p className="text-sm">{language === 'rw' ? 'Gutanga raporo n\'imibare y\'igihe nyacyo ku iterambere ry\'abanyeshuri, imikorere y\'ishuri n\'ibindi byinshi.' : 'Provide real-time reports and statistics on student progress, school operations and much more.'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-yellow-100 via-green-100 to-yellow-100 rounded-2xl p-8 shadow-lg">
            <h4 className="text-3xl font-black text-gray-800 mb-6 flex items-center gap-3">
              <CodeIcon className="w-8 h-8 text-green-600" />
              {language === 'rw' ? 'Tekinoloji Zakoreshejwe mu Gukora Sisitemu' : 'Technologies Used in System Development'}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <Laptop className="w-8 h-8 text-blue-600" />
                  <h5 className="font-black text-xl text-blue-700">Frontend</h5>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">•</span>
                    <div>
                      <p className="font-bold">React 18</p>
                      <p className="text-sm text-gray-600">Modern UI framework for building interactive interfaces</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">•</span>
                    <div>
                      <p className="font-bold">TypeScript</p>
                      <p className="text-sm text-gray-600">Type-safe development for fewer bugs</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">•</span>
                    <div>
                      <p className="font-bold">Tailwind CSS</p>
                      <p className="text-sm text-gray-600">Beautiful and responsive styling</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">•</span>
                    <div>
                      <p className="font-bold">Framer Motion</p>
                      <p className="text-sm text-gray-600">Smooth animations and transitions</p>
                    </div>
                  </li>
                </ul>
              </div>
              
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <Server className="w-8 h-8 text-green-600" />
                  <h5 className="font-black text-xl text-green-700">Backend</h5>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600 font-bold">•</span>
                    <div>
                      <p className="font-bold">Node.js</p>
                      <p className="text-sm text-gray-600">Fast and scalable server runtime</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600 font-bold">•</span>
                    <div>
                      <p className="font-bold">Express.js</p>
                      <p className="text-sm text-gray-600">Powerful web application framework</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600 font-bold">•</span>
                    <div>
                      <p className="font-bold">JWT Authentication</p>
                      <p className="text-sm text-gray-600">Secure token-based authentication</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600 font-bold">•</span>
                    <div>
                      <p className="font-bold">RESTful API</p>
                      <p className="text-sm text-gray-600">200+ API endpoints for all features</p>
                    </div>
                  </li>
                </ul>
              </div>
              
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <Database className="w-8 h-8 text-yellow-600" />
                  <h5 className="font-black text-xl text-yellow-700">Database</h5>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">•</span>
                    <div>
                      <p className="font-bold">MySQL</p>
                      <p className="text-sm text-gray-600">Reliable relational database system</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">•</span>
                    <div>
                      <p className="font-bold">20+ Tables</p>
                      <p className="text-sm text-gray-600">Comprehensive data structure</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">•</span>
                    <div>
                      <p className="font-bold">Foreign Keys</p>
                      <p className="text-sm text-gray-600">Data integrity and relationships</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">•</span>
                    <div>
                      <p className="font-bold">Indexes</p>
                      <p className="text-sm text-gray-600">Optimized query performance</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-yellow-200">
            <h4 className="text-3xl font-black text-yellow-700 mb-6 flex items-center gap-3">
              <Users className="w-8 h-8" />
              {language === 'rw' ? 'Abakoresha Sisitemu' : 'System Users'}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: GraduationCap, title: language === 'rw' ? 'Abanyeshuri' : 'Students', count: '1000+', color: 'blue' },
                { icon: Award, title: language === 'rw' ? 'Abarimu' : 'Teachers', count: '50+', color: 'green' },
                { icon: Users, title: language === 'rw' ? 'Ababyeyi' : 'Parents', count: '800+', color: 'yellow' },
                { icon: Shield, title: language === 'rw' ? 'Ubuyobozi' : 'Administration', count: '10+', color: 'red' }
              ].map((user, i) => {
                const Icon = user.icon;
                return (
                  <div key={i} className={`bg-${user.color}-50 rounded-xl p-6 text-center`}>
                    <Icon className={`w-12 h-12 text-${user.color}-600 mx-auto mb-3`} />
                    <h5 className="font-black text-xl mb-2">{user.title}</h5>
                    <p className={`text-3xl font-black text-${user.color}-600`}>{user.count}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="bg-gradient-to-br from-gray-50 to-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-green-600 via-yellow-600 to-green-600 bg-clip-text text-transparent mb-6">
            {language === 'rw' ? 'Amakuru Arambuye ku Sisitemu' : 'Comprehensive System Documentation'}
          </h2>
          <p className="text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            {language === 'rw' 
              ? 'Menya byose ku sisitemu yacu ikomeye - igufasha kwiga, gukurikirana, no guhuza abanyeshuri, ababyeyi n\'abarimu mu buryo bworoshye kandi bwiza'
              : 'Learn everything about our powerful system - helping students learn, parents monitor, and teachers educate in an easy and effective way'}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-2 bg-white rounded-2xl p-4 shadow-xl">
              <h3 className="font-black text-lg mb-4 text-gray-800">{language === 'rw' ? 'Ibikubiyemo' : 'Contents'}</h3>
              {sections.map((section, index) => {
                const Icon = section.icon;
                return (
                  <motion.button
                    key={section.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => setExpandedSection(section.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      expandedSection === section.id
                        ? 'bg-gradient-to-r from-green-500 to-yellow-500 text-white shadow-lg scale-105'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-700 hover:scale-102'
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="font-bold text-sm flex-1 text-left">{language === 'rw' ? section.title : section.titleEn}</span>
                    <ChevronRight className={`w-4 h-4 transition-transform ${expandedSection === section.id ? 'rotate-90' : ''}`} />
                  </motion.button>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {expandedSection === 'intro' && <IntroSection language={language} />}
              {expandedSection === 'students' && <StudentsSection language={language} />}
              {expandedSection === 'parents' && <ParentsSection language={language} />}
              {expandedSection === 'teachers' && <TeachersSection language={language} />}
              {expandedSection === 'features' && <FeaturesSection language={language} />}
              {expandedSection === 'learning' && <LearningSection language={language} />}
              {expandedSection === 'assessment' && <AssessmentSection language={language} />}
              {expandedSection === 'communication' && <CommunicationSection language={language} />}
              {expandedSection === 'analytics' && <AnalyticsSection language={language} />}
              {expandedSection === 'security' && <SecuritySection language={language} />}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemDocumentation;
