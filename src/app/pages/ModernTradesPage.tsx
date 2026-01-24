import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Code, Hammer, Car, Users, BookOpen, Award, ArrowRight, Sparkles, TrendingUp, Target } from 'lucide-react';
import { useLanguage } from '@/app/contexts/LanguageContext';

interface ModernTradesPageProps {
  onNavigate: (page: string) => void;
}

const ModernTradesPage: React.FC<ModernTradesPageProps> = ({ onNavigate }) => {
  const { language } = useLanguage();
  const [trades, setTrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredTrade, setHoveredTrade] = useState<number | null>(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/trades/all')
      .then(res => res.json())
      .then(data => {
        if (data.success) setTrades(data.trades);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getIcon = (code: string) => {
    switch (code) {
      case 'SOD': return Code;
      case 'BDC': return Hammer;
      case 'AUT': return Car;
      default: return BookOpen;
    }
  };

  const getGradient = (index: number) => {
    const gradients = [
      'from-yellow-400 via-green-400 to-yellow-500',
      'from-green-400 via-yellow-400 to-green-500',
      'from-yellow-500 via-green-500 to-yellow-400'
    ];
    return gradients[index % gradients.length];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-green-50">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity }}>
          <BookOpen className="w-20 h-20 text-green-600" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-green-50">
      {/* Hero */}
      <section className="relative py-24 overflow-hidden bg-gradient-to-r from-yellow-400 via-green-400 to-yellow-500">
        <div className="absolute inset-0 opacity-20">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-4xl"
              style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
              animate={{ y: [0, -30, 0], opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 2 }}
            >
              {i % 3 === 0 ? '💻' : i % 3 === 1 ? '🏗️' : '🚗'}
            </motion.div>
          ))}
        </div>

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }} className="inline-flex items-center gap-6 mb-8">
              <div className="bg-white p-8 rounded-3xl shadow-2xl">
                <BookOpen className="w-20 h-20 text-green-600" />
              </div>
              <h1 className="text-8xl font-black text-white drop-shadow-2xl">
                {language === 'rw' ? 'IMYUGA' : 'TRADES'}
              </h1>
              <div className="bg-white p-8 rounded-3xl shadow-2xl">
                <Award className="w-20 h-20 text-yellow-600" />
              </div>
            </motion.div>

            <p className="text-3xl text-white font-black mb-8 drop-shadow-lg">
              {language === 'rw' ? 'Hitamo Umwuga Ukunda Wige' : 'Choose Your Trade & Learn'}
            </p>

            <div className="flex flex-wrap justify-center gap-6">
              {[
                { icon: Users, label: language === 'rw' ? `${trades.reduce((sum, t) => sum + t.total_students, 0)} Abanyeshuri` : `${trades.reduce((sum, t) => sum + t.total_students, 0)} Students`, color: 'yellow' },
                { icon: BookOpen, label: `${trades.length} ${language === 'rw' ? 'Imyuga' : 'Trades'}`, color: 'green' },
                { icon: Target, label: language === 'rw' ? 'Impamyabumenyi' : 'Certification', color: 'yellow' }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.1, y: -5 }}
                  className="bg-white/20 backdrop-blur-md px-8 py-4 rounded-2xl border-2 border-white/50 shadow-xl"
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-7 h-7 text-white" />
                    <span className="font-black text-white text-lg">{item.label}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trades Grid */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
            <h2 className="text-6xl font-black text-gray-900 mb-4 bg-gradient-to-r from-yellow-600 to-green-600 bg-clip-text text-transparent">
              {language === 'rw' ? 'Imyuga Yacu' : 'Our Trades'}
            </h2>
            <p className="text-2xl text-gray-600 font-bold">{language === 'rw' ? 'Hitamo ikurikire' : 'Choose your path'}</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {trades.map((trade, index) => {
              const Icon = getIcon(trade.code);
              const gradient = getGradient(index);

              return (
                <motion.div
                  key={trade.id}
                  initial={{ opacity: 0, y: 100 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2, type: 'spring' }}
                  whileHover={{ scale: 1.05, y: -10 }}
                  onHoverStart={() => setHoveredTrade(trade.id)}
                  onHoverEnd={() => setHoveredTrade(null)}
                  onClick={() => onNavigate(`trade/${trade.id}`)}
                  className="group relative cursor-pointer"
                >
                  <motion.div
                    animate={{ opacity: hoveredTrade === trade.id ? 0.8 : 0 }}
                    className={`absolute inset-0 bg-gradient-to-r ${gradient} rounded-3xl blur-2xl`}
                  />

                  <div className={`relative bg-gradient-to-br ${gradient} p-1.5 rounded-3xl shadow-2xl`}>
                    <div className="bg-white rounded-2xl overflow-hidden">
                      <div className="relative h-56 bg-gradient-to-br from-yellow-100 to-green-100 flex items-center justify-center overflow-hidden">
                        <motion.div
                          animate={{ scale: hoveredTrade === trade.id ? 1.2 : 1, rotate: hoveredTrade === trade.id ? 10 : 0 }}
                          className="text-9xl"
                        >
                          {trade.icon}
                        </motion.div>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                          className="absolute top-4 right-4 bg-white/90 rounded-full p-3 shadow-lg"
                        >
                          <Sparkles className="w-5 h-5 text-yellow-500" />
                        </motion.div>
                      </div>

                      <div className="p-6">
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`bg-gradient-to-r ${gradient} p-3 rounded-xl`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-2xl font-black text-gray-900">{language === 'rw' ? trade.name_rw : trade.name}</h3>
                            <p className="text-sm text-gray-500 font-bold">{trade.code}</p>
                          </div>
                        </div>

                        <p className="text-gray-700 text-sm mb-4 line-clamp-2">
                          {language === 'rw' ? trade.description_rw : trade.description}
                        </p>

                        <div className="grid grid-cols-3 gap-2 mb-4">
                          {[
                            { icon: Users, value: trade.total_students, label: language === 'rw' ? 'Abanyeshuri' : 'Students' },
                            { icon: BookOpen, value: trade.course_count, label: language === 'rw' ? 'Amasomo' : 'Courses' },
                            { icon: TrendingUp, value: `${trade.duration_years}Y`, label: language === 'rw' ? 'Imyaka' : 'Years' }
                          ].map((stat, i) => (
                            <div key={i} className="text-center p-2 bg-gradient-to-br from-yellow-50 to-green-50 rounded-lg">
                              <stat.icon className="w-4 h-4 mx-auto mb-1 text-green-600" />
                              <p className="text-lg font-black text-gray-900">{stat.value}</p>
                              <p className="text-xs text-gray-600 font-bold">{stat.label}</p>
                            </div>
                          ))}
                        </div>

                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`w-full bg-gradient-to-r ${gradient} text-white py-3 rounded-xl font-bold shadow-lg hover:shadow-2xl transition-all flex items-center justify-center gap-2`}
                        >
                          <BookOpen className="w-5 h-5" />
                          {language === 'rw' ? 'Reba Byose' : 'View Details'}
                          <ArrowRight className="w-5 h-5" />
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ModernTradesPage;
