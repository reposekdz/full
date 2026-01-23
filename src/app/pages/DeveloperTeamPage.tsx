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
  const [developers, setDevelopers] = useState([
    {
      id: 1,
      name: 'Niyonkuru Reponse',
      role: 'Team Owner & System Development Manager',
      role_rw: 'Umuyobozi w\'Itsinda & Umuyobozi w\'Iterambere rya Sisitemu',
      image: '/api/placeholder/400/400',
      gradient: 'from-yellow-400 via-green-400 to-yellow-500'
    },
    {
      id: 2,
      name: 'Musoni Mugisha Yves',
      role: 'Asset Tracker & Innovation Specialist',
      role_rw: 'Umukurikirana w\'Umutungo & Inzobere mu Guhanga Udushya',
      image: '/api/placeholder/400/400',
      gradient: 'from-green-400 via-yellow-400 to-green-500'
    },
    {
      id: 3,
      name: 'Zamilu Yazid Surayman',
      role: 'Secretary & Data Gathering Specialist',
      role_rw: 'Umunyamabanga & Inzobere mu Gukusanya Amakuru',
      image: '/api/placeholder/400/400',
      gradient: 'from-yellow-500 via-green-400 to-yellow-400'
    },
    {
      id: 4,
      name: 'Niyonsenga Frank',
      role: 'Team Representative & Advisor',
      role_rw: 'Uhagarariye Itsinda & Umujyanama',
      image: '/api/placeholder/400/400',
      gradient: 'from-green-500 via-yellow-400 to-green-400'
    }
  ]);

  useEffect(() => {
    fetch('http://localhost:5000/api/developers/team')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.developers.length > 0) {
          setDevelopers(data.developers.map((dev: any) => ({
            ...dev,
            image: dev.image_url?.startsWith('/uploads') ? `http://localhost:5000${dev.image_url}` : dev.image_url || '/api/placeholder/400/400'
          })));
        }
      })
      .catch(() => console.log('Using default data'));
  }, []);

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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {developers.map((dev, index) => {
              const gradientClass = `bg-gradient-to-r ${dev.gradient}`;
              return (
                <motion.div
                  key={dev.id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -10 }}
                  onClick={() => onNavigate && onNavigate(`developer/${dev.id}`)}
                  className="group relative cursor-pointer"
                >
                  <div className={`relative ${gradientClass} p-1 rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all`}>
                    <div className="bg-white rounded-2xl overflow-hidden">
                      <div className="relative h-48 overflow-hidden">
                        <motion.img
                          src={dev.image}
                          alt={dev.name}
                          className="w-full h-full object-cover"
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 0.5 }}
                        />
                        <div className={`absolute inset-0 ${gradientClass} opacity-30`}></div>
                        <motion.div className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-lg">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        </motion.div>
                      </div>

                      <div className="p-4">
                        <h3 className="text-lg font-black text-gray-900 mb-1 line-clamp-1">{dev.name}</h3>
                        <p className={`text-xs font-bold ${gradientClass} bg-clip-text text-transparent mb-2 line-clamp-2`}>
                          {language === 'rw' ? dev.role_rw : dev.role}
                        </p>
                        <div className="flex items-center gap-1 mb-3">
                          <Sparkles className="w-3 h-3 text-yellow-500" />
                          <span className="text-xs text-gray-600 font-semibold">Level 4 Software Dev</span>
                        </div>
                        <button className={`w-full py-2 ${gradientClass} text-white text-sm font-bold rounded-lg hover:shadow-lg transition-shadow`}>
                          {language === 'rw' ? 'Reba Byinshi' : 'View Profile'}
                        </button>
                      </div>
                    </div>
                  </div>
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
