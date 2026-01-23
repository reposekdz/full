import React from 'react';
import { motion } from 'motion/react';
import { BookOpen, Users, GraduationCap, Award, Zap, Lightbulb, FileText, MessageSquare, BarChart, Shield, CheckCircle, Target, Brain, Clock, Bell, Lock, Smartphone, Laptop, Database, Server, Star, TrendingUp, Heart, Globe } from 'lucide-react';

export const IntroSection = ({ language = 'rw' }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
    <div className="bg-gradient-to-br from-green-50 to-yellow-50 rounded-3xl p-8 shadow-xl">
      <h3 className="text-4xl font-black text-gray-900 mb-6 flex items-center gap-3">
        <BookOpen className="w-10 h-10 text-green-600" />
        {language === 'rw' ? 'Intangiriro - Sisitemu Ikomeye yo Gucunga Ishuri' : 'Introduction'}
      </h3>
      
      <div className="space-y-6">
        <p className="text-2xl font-bold leading-relaxed text-green-800">
          {language === 'rw' 
            ? 'Murakaza neza kuri sisitemu yacu ikomeye yo gucunga ishuri! Sisitemu ihuza tekinoloji igezweho n\'ibikenewe n\'amashuri mu Rwanda.'
            : 'Welcome to our powerful school management system!'}
        </p>

        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <h4 className="text-3xl font-black text-green-700 mb-6 flex items-center gap-3">
            <Target className="w-8 h-8" />
            Intego Nyamukuru
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { title: 'Guteza Imbere Uburezi', desc: 'Gukoresha tekinoloji mu guteza imbere uburezi bw\'ikoranabuhanga mu Rwanda', color: 'green' },
              { title: 'Kworoshya Imikorere', desc: 'Kugabanya ibikorwa bya kimwe na kimwe no kworoshya imikorere y\'ishuri', color: 'yellow' },
              { title: 'Guhuza Abantu', desc: 'Guhuza abanyeshuri, ababyeyi, abarimu n\'ubuyobozi bw\'ishuri', color: 'green' },
              { title: 'Gutanga Raporo', desc: 'Gutanga raporo n\'imibare y\'igihe nyacyo ku iterambere ry\'abanyeshuri', color: 'yellow' }
            ].map((item, i) => (
              <div key={i} className={`flex items-start gap-4 p-4 bg-${item.color}-50 rounded-xl`}>
                <CheckCircle className={`w-8 h-8 text-${item.color}-600 mt-1 flex-shrink-0`} />
                <div>
                  <h5 className="font-bold text-lg mb-2">{item.title}</h5>
                  <p className="text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-100 via-green-100 to-yellow-100 rounded-2xl p-8 shadow-lg">
          <h4 className="text-3xl font-black text-gray-800 mb-6">Tekinoloji Zakoreshejwe</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <Laptop className="w-8 h-8 text-blue-600" />
                <h5 className="font-black text-xl">Frontend</h5>
              </div>
              <ul className="space-y-2 text-sm">
                <li>• React 18 - Modern UI framework</li>
                <li>• TypeScript - Type-safe development</li>
                <li>• Tailwind CSS - Beautiful styling</li>
                <li>• Framer Motion - Smooth animations</li>
              </ul>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <Server className="w-8 h-8 text-green-600" />
                <h5 className="font-black text-xl">Backend</h5>
              </div>
              <ul className="space-y-2 text-sm">
                <li>• Node.js - Server runtime</li>
                <li>• Express - Web framework</li>
                <li>• JWT - Secure authentication</li>
                <li>• RESTful API - 200+ endpoints</li>
              </ul>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <Database className="w-8 h-8 text-yellow-600" />
                <h5 className="font-black text-xl">Database</h5>
              </div>
              <ul className="space-y-2 text-sm">
                <li>• MySQL - Relational database</li>
                <li>• 20+ Tables - Comprehensive data</li>
                <li>• Foreign Keys - Data integrity</li>
                <li>• Indexes - Optimized performance</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </motion.div>
);

export const StudentsSection = ({ language = 'rw' }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
    <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-3xl p-8 shadow-xl">
      <h3 className="text-4xl font-black text-gray-900 mb-6 flex items-center gap-3">
        <GraduationCap className="w-10 h-10 text-blue-600" />
        Sisitemu ku Banyeshuri
      </h3>
      
      <div className="space-y-6">
        <p className="text-xl font-bold text-blue-800">
          Sisitemu itanga uburyo bworoshye bwo kwiga online aho abanyeshuri bashobora kubona amasomo yabo, gukora ibikorwa, no gukurikirana iterambere ryabo.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { icon: Laptop, title: 'Dashboard Yihariye', desc: 'Buri wumwana afite dashboard yihariye aho abona amasomo, ibikorwa, ibizamini n\'amanota ye' },
            { icon: BookOpen, title: 'Amasomo Online', desc: 'Kubona amasomo yose online, gusoma inyandiko, kureba amavideo no gukora ibibazo by\'imyitozo' },
            { icon: FileText, title: 'Ibikorwa (Assignments)', desc: 'Kubona ibikorwa byose, kumenya igihe bigomba gurangizwa no kohereza ibikorwa online' },
            { icon: Brain, title: 'Ibizamini Online', desc: 'Gukora ibizamini online, kubona amanota ako kanya no kwiga ibisubizo byiza' },
            { icon: TrendingUp, title: 'Gukurikirana Iterambere', desc: 'Kubona raporo z\'amanota, grafike z\'iterambere n\'aho ukeneye kwiyongera' },
            { icon: MessageSquare, title: 'Itumanaho n\'Abarimu', desc: 'Kohereza ubutumwa abarimu, kubaza ibibazo no kubona ibisubizo byihuse' }
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 p-3 rounded-xl">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h5 className="font-bold text-lg mb-2">{item.title}</h5>
                    <p className="text-sm text-gray-600">{item.desc}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-blue-100 rounded-2xl p-6">
          <h4 className="text-2xl font-black text-blue-800 mb-4">Inyungu z\'Abanyeshuri</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              'Kwiga ahose baba ari',
              'Kubona amasomo igihe cyose',
              'Gukurikirana iterambere ryabo',
              'Kubona ubufasha bw\'abarimu',
              'Gukora ibizamini online',
              'Kubona amanota yabo ako kanya',
              'Gusangira ibitekerezo n\'abandi',
              'Kwiga mu buryo bworoshye'
            ].map((benefit, i) => (
              <div key={i} className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-blue-600" />
                <span className="font-semibold">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </motion.div>
);

export const ParentsSection = ({ language = 'rw' }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-8 shadow-xl">
      <h3 className="text-4xl font-black text-gray-900 mb-6 flex items-center gap-3">
        <Users className="w-10 h-10 text-purple-600" />
        Sisitemu ku Babyeyi
      </h3>
      
      <div className="space-y-6">
        <p className="text-xl font-bold text-purple-800">
          Sisitemu ifasha ababyeyi gukurikirana iterambere ry\'abana babo mu buryo bworoshye. Ababyeyi bashobora kubona amanota, ibikorwa, ibizamini, n\'amakuru yose yerekeye umwana wabo.
        </p>

        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <h4 className="text-3xl font-black text-purple-700 mb-6 flex items-center gap-3">
            <Brain className="w-8 h-8" />
            Prediction System - Guhanura Iterambere
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { title: 'Guhanura Amanota', desc: 'Sisitemu ikoresha Machine Learning guhanura amanota umwana azabona mu bizamini bizaza (85-92% accuracy)', color: 'purple' },
              { title: 'Guhanura Imyitwarire', desc: 'Ikurikirana imyitwarire y\'umwana no guhanura ibibazo bishobora kubaho', color: 'pink' },
              { title: 'Guhanura Ubushobozi', desc: 'Ihanura ubushobozi bw\'umwana no gutanga inama ku masomo akeneye kwiyongera', color: 'purple' },
              { title: 'Early Warning System', desc: 'Imenyesha ababyeyi mbere y\'uko ibibazo bibaho no gutanga inama zo gukemura', color: 'pink' }
            ].map((item, i) => (
              <div key={i} className={`bg-${item.color}-50 rounded-xl p-6`}>
                <h5 className="font-bold text-lg mb-2">{item.title}</h5>
                <p className="text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: BarChart, title: 'Raporo z\'Iterambere', count: '4+', desc: 'Raporo za buri cyumweru, kwezi, igihembwe n\'umwaka' },
            { icon: Bell, title: 'Notifications', count: '24/7', desc: 'Imenyesha igihe cyose ku iterambere ry\'umwana' },
            { icon: MessageSquare, title: 'Itumanaho', count: 'Instant', desc: 'Guhanahana n\'abarimu mu buryo bwihuse' }
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="bg-white rounded-xl p-6 shadow-lg text-center">
                <Icon className="w-12 h-12 text-purple-600 mx-auto mb-3" />
                <h5 className="font-black text-2xl text-purple-600 mb-2">{item.count}</h5>
                <h6 className="font-bold mb-2">{item.title}</h6>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  </motion.div>
);
