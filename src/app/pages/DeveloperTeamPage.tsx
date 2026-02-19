import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { Code, Star, Sparkles, Trophy, Users } from 'lucide-react';
import SystemDocumentation from '@/app/components/SystemDocumentationFull';

interface DeveloperTeamPageProps {
  onNavigate?: (page: string) => void;
}

const DeveloperTeamPage: React.FC<DeveloperTeamPageProps> = ({ onNavigate }) => {
  const { language } = useLanguage();
  const [developers, setDevelopers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const gradients = [
    'from-yellow-400 via-green-400 to-yellow-500',
    'from-green-400 via-yellow-400 to-green-500',
    'from-yellow-500 via-green-400 to-yellow-400',
    'from-green-500 via-yellow-400 to-green-400'
  ];

  useEffect(() => {
    const fetchDevelopers = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/developers/team');
        const data = await response.json();
        console.log('Developers API response:', data);
        if (data.success) {
          // Show ALL developers, with or without images - add gradient to each
          const devsWithGradients = data.developers.map((dev: any, index: number) => ({
            ...dev,
            gradient: gradients[index % gradients.length]
          }));
          setDevelopers(devsWithGradients);
        }
      } catch (error) {
        console.error('Error fetching developers:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDevelopers();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 via-white to-green-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-yellow-400 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">{language === 'rw' ? 'Urasubira...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-green-50">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden bg-gradient-to-r from-yellow-400 via-green-400 to-yellow-500">
        <div className="absolute inset-0 opacity-20">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white rounded-full"
              style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
              animate={{ y: [0, -30, 0], opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 2 }}
            />
          ))}
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }} className="inline-flex items-center gap-3 mb-6">
              <div className="bg-white p-4 rounded-2xl shadow-2xl">
                <Code className="w-12 h-12 text-green-600" />
              </div>
              <h1 className="text-5xl md:text-6xl font-black text-white drop-shadow-lg">
                {language === 'rw' ? 'Itsinda ry\'Abatunganyije' : 'Development Team'}
              </h1>
            </motion.div>
            
            <p className="text-xl md:text-2xl text-white/90 max-w-4xl mx-auto mb-6 font-semibold drop-shadow">
              {language === 'rw' 
                ? 'Abanyeshuri ba Level 4 Software Development muri Garden TVET School' 
                : 'Level 4 Software Development Students at Garden TVET School'}
            </p>
            
            <div className="flex items-center justify-center gap-6 flex-wrap">
              <div className="flex items-center gap-2 bg-white px-6 py-3 rounded-full shadow-xl">
                <Trophy className="w-6 h-6 text-yellow-600" />
                <span className="font-bold text-gray-800">{language === 'rw' ? 'Umushinga w\'Impamyabumenyi' : 'Graduation Project'}</span>
              </div>
              <div className="flex items-center gap-2 bg-white px-6 py-3 rounded-full shadow-xl">
                <Star className="w-6 h-6 text-green-600" />
                <span className="font-bold text-gray-800">2024-2026</span>
              </div>
              <div className="flex items-center gap-2 bg-white px-6 py-3 rounded-full shadow-xl">
                <Users className="w-6 h-6 text-yellow-600" />
                <span className="font-bold text-gray-800">{developers.length} {language === 'rw' ? 'Abagize Itsinda' : 'Team Members'}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Team Members Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {developers.map((dev, index) => {
              const gradientClass = `bg-gradient-to-r ${dev.gradient}`;
              return (
                <motion.div
                  key={dev.id}
                  initial={{ opacity: 0, y: 50, rotateY: -15 }}
                  whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15, type: 'spring', stiffness: 100 }}
                  whileHover={{ scale: 1.08, y: -15, rotateY: 5 }}
                  onClick={() => onNavigate && onNavigate(`developer/${dev.id}`)}
                  className="group relative cursor-pointer perspective-1000"
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-green-400 rounded-3xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500"
                  />
                  
                  <div className={`relative ${gradientClass} p-1 rounded-3xl shadow-2xl overflow-hidden hover:shadow-3xl transition-all`}>
                    <div className="bg-white rounded-3xl overflow-hidden">
                      <div className="relative h-64 overflow-hidden bg-gray-200">
                        {dev.image_url ? (
                          <motion.img
                            src={`http://localhost:5000${encodeURI(dev.image_url)}`}
                            alt={dev.name}
                            className="w-full h-full object-cover"
                            whileHover={{ scale: 1.15, rotate: 2 }}
                            transition={{ duration: 0.6 }}
                          />
                        ) : (
                          <div className={`w-full h-full ${gradientClass} flex items-center justify-center`}>
                            <div className="text-white text-center p-4">
                              <div className="w-20 h-20 mx-auto mb-3 bg-white/20 rounded-full flex items-center justify-center">
                                <span className="text-4xl font-black">{dev.name?.charAt(0) || 'D'}</span>
                              </div>
                              <p className="text-sm font-bold opacity-80">{language === 'rw' ? 'Nta ifoto' : 'No Photo'}</p>
                            </div>
                          </div>
                        )}
                        <div className={`absolute inset-0 ${gradientClass} opacity-20 group-hover:opacity-40 transition-opacity`}></div>
                        
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                          <div className="flex items-center gap-2">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-white text-sm font-bold">Level 4 Developer</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-6">
                        <h3 className="text-xl font-black text-gray-900 mb-2">{dev.name}</h3>
                        <p className={`text-sm font-bold ${gradientClass} bg-clip-text text-transparent mb-4 line-clamp-2`}>
                          {language === 'rw' ? dev.role_rw : dev.role}
                        </p>
                        
                        <div className="flex items-center gap-2 mb-4">
                          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              whileInView={{ width: '95%' }}
                              transition={{ duration: 1, delay: index * 0.2 }}
                              className={`h-full ${gradientClass}`}
                            />
                          </div>
                          <span className="text-xs font-bold text-gray-600">95%</span>
                        </div>
                        
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`w-full py-3 ${gradientClass} text-white text-sm font-bold rounded-xl hover:shadow-xl transition-all flex items-center justify-center gap-2`}
                        >
                          {language === 'rw' ? 'Reba Byinshi' : 'View Profile'}
                          <motion.div
                            animate={{ x: [0, 5, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          >
                            →
                          </motion.div>
                        </motion.button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="absolute inset-0 border-4 border-transparent group-hover:border-yellow-400 rounded-3xl transition-all duration-500 pointer-events-none" />
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Project Info */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-yellow-400 via-green-400 to-yellow-500">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-6 drop-shadow-lg">
              {language === 'rw' ? 'Umushinga Wacu' : 'Our Project'}
            </h2>
            <p className="text-xl text-white/90 mb-8 leading-relaxed font-semibold drop-shadow">
              {language === 'rw'
                ? 'Sisitemu Ikomeye yo Gucunga Ishuri - Umushinga w\'impamyabumenyi wateguwe n\'abanyeshuri ba Level 4 Software Development muri Garden TVET School. Sisitemu ihuza tekinoloji igezweho n\'ibikenewe n\'amashuri mu Rwanda.'
                : 'Powerful School Management System - A graduation project developed by Level 4 Software Development students at Garden TVET School. The system combines modern technology with the needs of schools in Rwanda.'}
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <div className="bg-white/20 backdrop-blur-md px-6 py-3 rounded-full shadow-xl">
                <span className="text-white font-bold">React + TypeScript</span>
              </div>
              <div className="bg-white/20 backdrop-blur-md px-6 py-3 rounded-full shadow-xl">
                <span className="text-white font-bold">Node.js + Express</span>
              </div>
              <div className="bg-white/20 backdrop-blur-md px-6 py-3 rounded-full shadow-xl">
                <span className="text-white font-bold">MySQL Database</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* System Documentation */}
      <SystemDocumentation language={language} />
    </div>
  );
};

export default DeveloperTeamPage;
