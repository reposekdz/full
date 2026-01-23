import React from 'react';
import { motion } from 'motion/react';
import { Award, Zap, Lightbulb, FileText, MessageSquare, BarChart, Shield, CheckCircle, Users, BookOpen, Calendar, Clock, Star, TrendingUp, Target, Lock, Bell, Globe, Heart, Smartphone } from 'lucide-react';

export const TeachersSection = ({ language = 'rw' }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
    <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-3xl p-8 shadow-xl">
      <h3 className="text-4xl font-black text-gray-900 mb-6 flex items-center gap-3">
        <Award className="w-10 h-10 text-orange-600" />
        Sisitemu ku Barimu
      </h3>
      
      <div className="space-y-6">
        <p className="text-xl font-bold text-orange-800">
          Sisitemu ifasha abarimu gutanga amasomo neza, gukurikirana abanyeshuri, gutanga ibikorwa no gusuzuma iterambere ry\'abanyeshuri.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: BookOpen, title: 'Gutanga Amasomo', desc: 'Gutegura no gutanga amasomo online, gusangira inyandiko n\'amavideo' },
            { icon: FileText, title: 'Gutanga Ibikorwa', desc: 'Gukora no gutanga ibikorwa, gusuzuma ibisubizo no gutanga amanota' },
            { icon: Calendar, title: 'Amategeko y\'Amasomo', desc: 'Kureba amategeko y\'amasomo no gukurikirana igihe cy\'amasomo' },
            { icon: BarChart, title: 'Gukurikirana Abanyeshuri', desc: 'Kubona iterambere ry\'abanyeshuri no gutanga raporo' },
            { icon: MessageSquare, title: 'Guhanahana n\'Abanyeshuri', desc: 'Kohereza ubutumwa, kubaza ibibazo no gutanga ubufasha' },
            { icon: Star, title: 'Gusuzuma Iterambere', desc: 'Gukora ibizamini, gutanga amanota no gusuzuma iterambere' }
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="bg-orange-100 p-3 rounded-xl w-fit mb-4">
                  <Icon className="w-6 h-6 text-orange-600" />
                </div>
                <h5 className="font-bold text-lg mb-2">{item.title}</h5>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            );
          })}
        </div>

        <div className="bg-orange-100 rounded-2xl p-6">
          <h4 className="text-2xl font-black text-orange-800 mb-4">Inyungu z\'Abarimu</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              'Gutanga amasomo mu buryo bworoshye',
              'Gukurikirana abanyeshuri neza',
              'Gutanga ibikorwa online',
              'Gusuzuma iterambere ry\'abanyeshuri',
              'Guhanahana n\'abanyeshuri n\'ababyeyi',
              'Kubona raporo z\'iterambere',
              'Gukora ibizamini online',
              'Kugabanya ibikorwa bya kimwe na kimwe'
            ].map((benefit, i) => (
              <div key={i} className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-orange-600" />
                <span className="font-semibold">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </motion.div>
);

export const FeaturesSection = ({ language = 'rw' }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
    <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-3xl p-8 shadow-xl">
      <h3 className="text-4xl font-black text-gray-900 mb-6 flex items-center gap-3">
        <Zap className="w-10 h-10 text-green-600" />
        Ibiranga Sisitemu
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { icon: Users, title: 'Role-Based Access', desc: 'Buri mukoresha afite uruhare rwe: Admin, Headmaster, DOS, DOD, Teachers, Students, Parents', color: 'blue' },
          { icon: Lock, title: 'Umutekano Ukomeye', desc: 'JWT Authentication, Password Encryption, Data Protection', color: 'green' },
          { icon: Globe, title: 'Multi-Language', desc: 'Sisitemu ikorera mu ndimi 4: Kinyarwanda, English, Français, Kiswahili', color: 'blue' },
          { icon: Smartphone, title: 'Responsive Design', desc: 'Ikorera kuri telefoni, tableti na mudasobwa', color: 'green' },
          { icon: Bell, title: 'Real-time Notifications', desc: 'Imenyesha y\'igihe nyacyo ku bikorwa byose', color: 'blue' },
          { icon: BarChart, title: 'Advanced Analytics', desc: 'Raporo n\'imibare y\'igihe nyacyo', color: 'green' },
          { icon: Calendar, title: 'Timetable Management', desc: 'Gucunga amategeko y\'amasomo mu buryo bworoshye', color: 'blue' },
          { icon: FileText, title: 'Document Management', desc: 'Gucunga inyandiko zose z\'ishuri', color: 'green' }
        ].map((item, i) => {
          const Icon = item.icon;
          return (
            <div key={i} className={`bg-${item.color}-50 rounded-xl p-6 border-2 border-${item.color}-200`}>
              <div className={`bg-${item.color}-100 p-3 rounded-xl w-fit mb-4`}>
                <Icon className={`w-8 h-8 text-${item.color}-600`} />
              </div>
              <h5 className="font-bold text-xl mb-2">{item.title}</h5>
              <p className="text-sm text-gray-600">{item.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  </motion.div>
);

export const LearningSection = ({ language = 'rw' }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
    <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-3xl p-8 shadow-xl">
      <h3 className="text-4xl font-black text-gray-900 mb-6 flex items-center gap-3">
        <Lightbulb className="w-10 h-10 text-yellow-600" />
        Kwiga Online
      </h3>
      
      <div className="space-y-6">
        <p className="text-xl font-bold text-yellow-800">
          Sisitemu itanga uburyo bwiza bwo kwiga online aho abanyeshuri bashobora kwiga ahose baba ari, igihe cyose.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: BookOpen, title: 'Amasomo Online', count: '100+', desc: 'Amasomo menshi online' },
            { icon: FileText, title: 'Inyandiko', count: '500+', desc: 'Inyandiko z\'amasomo' },
            { icon: Star, title: 'Amavideo', count: '200+', desc: 'Amavideo y\'amasomo' }
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="bg-white rounded-xl p-6 shadow-lg text-center">
                <Icon className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
                <h5 className="font-black text-3xl text-yellow-600 mb-2">{item.count}</h5>
                <h6 className="font-bold mb-2">{item.title}</h6>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            );
          })}
        </div>

        <div className="bg-yellow-100 rounded-2xl p-6">
          <h4 className="text-2xl font-black text-yellow-800 mb-4">Uburyo bwo Kwiga</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              'Kwiga mu buryo bwigenga',
              'Gukora ibibazo by\'imyitozo',
              'Kureba amavideo y\'amasomo',
              'Gusoma inyandiko z\'amasomo',
              'Gukora ibizamini by\'imyitozo',
              'Kubaza ibibazo abarimu',
              'Gusangira ibitekerezo n\'abandi',
              'Kwiga mu tsinda'
            ].map((method, i) => (
              <div key={i} className="flex items-center gap-2 bg-white rounded-lg p-3">
                <CheckCircle className="w-5 h-5 text-yellow-600" />
                <span className="font-semibold">{method}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </motion.div>
);

export const AssessmentSection = ({ language = 'rw' }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
    <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-3xl p-8 shadow-xl">
      <h3 className="text-4xl font-black text-gray-900 mb-6 flex items-center gap-3">
        <FileText className="w-10 h-10 text-red-600" />
        Ibizamini n\'Amanota
      </h3>
      
      <div className="space-y-6">
        <p className="text-xl font-bold text-red-800">
          Sisitemu ifasha gukora ibizamini online, gutanga amanota no gukurikirana iterambere ry\'abanyeshuri.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { title: 'Ibizamini Online', desc: 'Gukora ibizamini online, kubona amanota ako kanya no kwiga ibisubizo', icon: FileText },
            { title: 'Auto-Grading', desc: 'Sisitemu itanga amanota ku buryo bwikora ku bizamini byinshi', icon: Zap },
            { title: 'Raporo z\'Amanota', desc: 'Kubona raporo z\'amanota, grafike z\'iterambere n\'aho ukeneye kwiyongera', icon: BarChart },
            { title: 'Ibisubizo Byiza', desc: 'Kwiga ibisubizo byiza no kumenya aho wakoze amakosa', icon: CheckCircle }
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="bg-white rounded-xl p-6 shadow-lg">
                <div className="bg-red-100 p-3 rounded-xl w-fit mb-4">
                  <Icon className="w-6 h-6 text-red-600" />
                </div>
                <h5 className="font-bold text-lg mb-2">{item.title}</h5>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  </motion.div>
);

export const CommunicationSection = ({ language = 'rw' }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl p-8 shadow-xl">
      <h3 className="text-4xl font-black text-gray-900 mb-6 flex items-center gap-3">
        <MessageSquare className="w-10 h-10 text-indigo-600" />
        Itumanaho
      </h3>
      
      <div className="space-y-6">
        <p className="text-xl font-bold text-indigo-800">
          Sisitemu ifasha guhanahana hagati y\'abanyeshuri, ababyeyi, abarimu n\'ubuyobozi bw\'ishuri.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: MessageSquare, title: 'Ubutumwa', desc: 'Kohereza ubutumwa bwihuse' },
            { icon: Bell, title: 'Notifications', desc: 'Imenyesha y\'igihe nyacyo' },
            { icon: Users, title: 'Group Chat', desc: 'Guhanahana mu tsinda' }
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="bg-white rounded-xl p-6 shadow-lg text-center">
                <div className="bg-indigo-100 p-4 rounded-full w-fit mx-auto mb-4">
                  <Icon className="w-8 h-8 text-indigo-600" />
                </div>
                <h5 className="font-bold text-lg mb-2">{item.title}</h5>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  </motion.div>
);

export const AnalyticsSection = ({ language = 'rw' }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
    <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-3xl p-8 shadow-xl">
      <h3 className="text-4xl font-black text-gray-900 mb-6 flex items-center gap-3">
        <BarChart className="w-10 h-10 text-cyan-600" />
        Raporo n\'Imibare
      </h3>
      
      <div className="space-y-6">
        <p className="text-xl font-bold text-cyan-800">
          Sisitemu itanga raporo n\'imibare y\'igihe nyacyo ku iterambere ry\'abanyeshuri n\'imikorere y\'ishuri.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: TrendingUp, title: 'Iterambere', count: '95%', color: 'cyan' },
            { icon: Users, title: 'Abanyeshuri', count: '1248', color: 'blue' },
            { icon: Award, title: 'Abarimu', count: '84', color: 'cyan' },
            { icon: Star, title: 'Ibihembo', count: '25', color: 'blue' }
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className={`bg-${item.color}-100 rounded-xl p-6 text-center`}>
                <Icon className={`w-10 h-10 text-${item.color}-600 mx-auto mb-3`} />
                <h5 className={`font-black text-3xl text-${item.color}-600 mb-2`}>{item.count}</h5>
                <p className="font-bold">{item.title}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  </motion.div>
);

export const SecuritySection = ({ language = 'rw' }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
    <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-3xl p-8 shadow-xl">
      <h3 className="text-4xl font-black text-gray-900 mb-6 flex items-center gap-3">
        <Shield className="w-10 h-10 text-gray-600" />
        Umutekano
      </h3>
      
      <div className="space-y-6">
        <p className="text-xl font-bold text-gray-800">
          Sisitemu ifite umutekano ukomeye wo kurinda amakuru y\'abakoresha n\'ishuri.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { icon: Lock, title: 'JWT Authentication', desc: 'Kwinjira mu buryo bw\'umutekano binyuze muri JWT tokens' },
            { icon: Shield, title: 'Data Encryption', desc: 'Gushyira mu mwimerere amakuru yose y\'abakoresha' },
            { icon: Users, title: 'Role-Based Access', desc: 'Buri mukoresha afite uruhare rwe n\'uburenganzira bwe' },
            { icon: Bell, title: 'Activity Logging', desc: 'Gukurikirana ibikorwa byose by\'abakoresha' }
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-200">
                <div className="bg-gray-100 p-3 rounded-xl w-fit mb-4">
                  <Icon className="w-6 h-6 text-gray-600" />
                </div>
                <h5 className="font-bold text-lg mb-2">{item.title}</h5>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  </motion.div>
);
