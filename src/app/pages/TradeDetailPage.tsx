import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, BookOpen, Award, Code, Hammer, Car, Mail, Phone, Star } from 'lucide-react';
import { useLanguage } from '@/app/contexts/LanguageContext';

interface TradeDetailPageProps {
  tradeId: string;
  onNavigate: (page: string) => void;
}

const TradeDetailPage: React.FC<TradeDetailPageProps> = ({ tradeId, onNavigate }) => {
  const { language } = useLanguage();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('instructors');

  useEffect(() => {
    fetch(`http://localhost:5000/api/trades/${tradeId}`)
      .then(res => res.json())
      .then(result => {
        if (result.success) setData(result);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [tradeId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-green-50">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity }}>
          <BookOpen className="w-20 h-20 text-green-600" />
        </motion.div>
      </div>
    );
  }

  if (!data) return null;

  const { trade, instructors, courses } = data;
  const getIcon = () => {
    switch (trade.code) {
      case 'SOD': return Code;
      case 'BDC': return Hammer;
      case 'AUT': return Car;
      default: return BookOpen;
    }
  };
  const Icon = getIcon();
  const gradient = trade.code === 'SOD' ? 'from-yellow-400 via-green-400 to-yellow-500' :
                   trade.code === 'BDC' ? 'from-green-400 via-yellow-400 to-green-500' :
                   'from-yellow-500 via-green-500 to-yellow-400';

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-green-50">
      {/* Header */}
      <div className={`bg-gradient-to-r ${gradient} text-white py-12`}>
        <div className="max-w-7xl mx-auto px-4">
          <button onClick={() => onNavigate('trades')} className="flex items-center gap-2 text-white/90 hover:text-white mb-6 font-bold">
            <ArrowLeft className="w-5 h-5" /> {language === 'rw' ? 'Subira ku Myuga' : 'Back to Trades'}
          </button>
          
          <div className="flex items-center gap-6">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-8xl">
              {trade.icon}
            </motion.div>
            <div>
              <h1 className="text-5xl font-black mb-2">{language === 'rw' ? trade.name_rw : trade.name}</h1>
              <p className="text-xl text-white/90 mb-4">{trade.code}</p>
              <p className="text-lg text-white/80">{language === 'rw' ? trade.description_rw : trade.description}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { icon: Users, value: trade.total_students, label: language === 'rw' ? 'Abanyeshuri' : 'Students', color: 'yellow' },
            { icon: Users, value: instructors.length, label: language === 'rw' ? 'Abarimu' : 'Instructors', color: 'green' },
            { icon: BookOpen, value: courses.length, label: language === 'rw' ? 'Amasomo' : 'Courses', color: 'yellow' }
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`bg-gradient-to-br from-${stat.color}-100 to-white rounded-2xl shadow-lg p-6 text-center`}
            >
              <stat.icon className={`w-12 h-12 mx-auto mb-3 text-${stat.color}-600`} />
              <p className="text-4xl font-black text-gray-900 mb-2">{stat.value}</p>
              <p className="text-gray-600 font-bold">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          {[
            { id: 'instructors', label: language === 'rw' ? 'Abarimu' : 'Instructors', icon: Users },
            { id: 'courses', label: language === 'rw' ? 'Amasomo' : 'Courses', icon: BookOpen }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                activeTab === tab.id
                  ? `bg-gradient-to-r ${gradient} text-white shadow-lg`
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Instructors Tab */}
        {activeTab === 'instructors' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {instructors.map((instructor: any, index: number) => (
              <motion.div
                key={instructor.id}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-100 to-green-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {instructor.image_url ? (
                      <img src={`http://localhost:5000${instructor.image_url}`} alt={instructor.name} className="w-full h-full object-cover" />
                    ) : (
                      <Users className="w-12 h-12 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-black text-gray-900 mb-1">{instructor.name_rw || instructor.name}</h3>
                    <p className="text-sm text-gray-600 font-bold mb-3">{instructor.role_rw || instructor.role}</p>
                    <p className="text-sm text-gray-700 mb-3">{instructor.specialization_rw || instructor.specialization}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3" /> {instructor.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {instructor.phone}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-1 text-yellow-500">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-sm font-bold text-gray-700">{instructor.experience_years} {language === 'rw' ? 'imyaka' : 'years'}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Courses Tab */}
        {activeTab === 'courses' && (
          <div className="space-y-4">
            {[1, 2, 3, 4].map(level => {
              const levelCourses = courses.filter((c: any) => c.level === level);
              if (levelCourses.length === 0) return null;

              return (
                <div key={level}>
                  <h3 className="text-2xl font-black text-gray-900 mb-4">
                    Level {level}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {levelCourses.map((course: any, index: number) => (
                      <motion.div
                        key={course.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all"
                      >
                        <div className="flex items-start gap-4">
                          <div className={`bg-gradient-to-br ${gradient} p-3 rounded-xl`}>
                            <BookOpen className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-lg font-black text-gray-900">{language === 'rw' ? course.name_rw : course.name}</h4>
                              <span className="text-xs font-bold text-gray-500">{course.code}</span>
                            </div>
                            <p className="text-sm text-gray-700 mb-3">{course.description_rw}</p>
                            <div className="flex items-center gap-4">
                              <span className="text-xs font-bold text-green-600">Level {course.level}</span>
                              <span className="text-xs font-bold text-yellow-600">{course.credits} Credits</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TradeDetailPage;
