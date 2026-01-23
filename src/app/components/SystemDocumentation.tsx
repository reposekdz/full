import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Users, GraduationCap, BarChart, MessageSquare, Calendar, FileText, Award, Target, Zap, Shield, Globe, Heart, Lightbulb, TrendingUp, CheckCircle, ChevronDown, ChevronRight } from 'lucide-react';

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

  return (
    <div className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-green-600 to-yellow-600 bg-clip-text text-transparent mb-4">
            {language === 'rw' ? 'Amakuru Arambuye ku Sisitemu' : 'Comprehensive System Guide'}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {language === 'rw' 
              ? 'Menya byose ku sisitemu yacu ikomeye yo gucunga ishuri - igufasha kwiga, gukurikirana, no guhuza abanyeshuri, ababyeyi n\'abarimu'
              : 'Learn everything about our powerful school management system - helping students learn, parents monitor, and teachers educate'}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-2">
              {sections.map((section, index) => {
                const Icon = section.icon;
                return (
                  <motion.button
                    key={section.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      expandedSection === section.id
                        ? 'bg-gradient-to-r from-green-500 to-yellow-500 text-white shadow-lg'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-bold text-sm">{language === 'rw' ? section.title : section.titleEn}</span>
                    <ChevronRight className={`w-4 h-4 ml-auto transition-transform ${expandedSection === section.id ? 'rotate-90' : ''}`} />
                  </motion.button>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {expandedSection === 'intro' && (
                <motion.div
                  key="intro"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-gradient-to-br from-green-50 to-yellow-50 rounded-3xl p-8 shadow-xl"
                >
                  <h3 className="text-3xl font-black text-gray-900 mb-6 flex items-center gap-3">
                    <BookOpen className="w-8 h-8 text-green-600" />
                    {language === 'rw' ? 'Intangiriro - Sisitemu Ikomeye yo Gucunga Ishuri' : 'Introduction - Powerful School Management System'}
                  </h3>
                  
                  <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
                    <p className="text-xl font-semibold leading-relaxed">
                      {language === 'rw' 
                        ? 'Sisitemu yacu yo gucunga ishuri ni umushinga ukomeye wateguwe n\'abanyeshuri ba Level 4 Software Development muri Garden TVET School. Sisitemu ihuza tekinoloji igezweho n\'ibikenewe n\'amashuri mu Rwanda, igamije guteza imbere uburezi no kworoshya imikorere y\'ishuri.'
                        : 'Our school management system is a powerful project developed by Level 4 Software Development students at Garden TVET School. The system combines modern technology with the needs of schools in Rwanda, aiming to advance education and simplify school operations.'}
                    </p>

                    <div className="bg-white rounded-2xl p-6 shadow-lg">
                      <h4 className="text-2xl font-black text-green-700 mb-4">{language === 'rw' ? 'Intego Nyamukuru' : 'Main Objectives'}</h4>
                      <ul className="space-y-3">
                        <li className="flex items-start gap-3">
                          <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                          <span>{language === 'rw' ? 'Guteza imbere uburezi bw\'ikoranabuhanga mu Rwanda' : 'Advance technology-based education in Rwanda'}</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                          <span>{language === 'rw' ? 'Kworoshya imikorere y\'ishuri no kugabanya ibikorwa bya kimwe na kimwe' : 'Simplify school operations and reduce manual tasks'}</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                          <span>{language === 'rw' ? 'Guhuza abanyeshuri, ababyeyi n\'abarimu mu buryo bworoshye' : 'Connect students, parents and teachers seamlessly'}</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                          <span>{language === 'rw' ? 'Gutanga raporo n\'imibare y\'igihe nyacyo ku iterambere ry\'abanyeshuri' : 'Provide real-time reports and statistics on student progress'}</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                          <span>{language === 'rw' ? 'Gufasha ababyeyi gukurikirana iterambere ry\'abana babo' : 'Help parents monitor their children\'s progress'}</span>
                        </li>
                      </ul>
                    </div>

                    <div className="bg-gradient-to-r from-yellow-100 to-green-100 rounded-2xl p-6 shadow-lg">
                      <h4 className="text-2xl font-black text-yellow-700 mb-4">{language === 'rw' ? 'Tekinoloji Zakoreshejwe' : 'Technologies Used'}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white rounded-xl p-4">
                          <h5 className="font-bold text-green-700 mb-2">Frontend</h5>
                          <ul className="space-y-1 text-sm">
                            <li>• React 18 - Modern UI framework</li>
                            <li>• TypeScript - Type-safe development</li>
                            <li>• Tailwind CSS - Beautiful styling</li>
                            <li>• Framer Motion - Smooth animations</li>
                          </ul>
                        </div>
                        <div className="bg-white rounded-xl p-4">
                          <h5 className="font-bold text-yellow-700 mb-2">Backend</h5>
                          <ul className="space-y-1 text-sm">
                            <li>• Node.js - Server runtime</li>
                            <li>• Express - Web framework</li>
                            <li>• MySQL - Database system</li>
                            <li>• JWT - Secure authentication</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemDocumentation;
