import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Users, Award, TrendingUp, ArrowRight, Sparkles, Star, Target, Zap, Crown, Flame } from 'lucide-react';

interface SportsPageProps {
  onNavigate: (page: string) => void;
}

const SportsPage: React.FC<SportsPageProps> = ({ onNavigate }) => {
  const [teams, setTeams] = useState<any[]>([]);
  const [hoveredTeam, setHoveredTeam] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/sports/teams');
      const data = await response.json();
      if (data.success) {
        const filteredTeams = data.teams.filter((team: any) => 
          team.sport_type === 'football' || team.sport_type === 'volleyball'
        );
        setTeams(filteredTeams);
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-green-50 flex items-center justify-center">
        <motion.div animate={{ rotate: 360, scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }}>
          <Trophy className="w-20 h-20 text-green-600" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-green-50 to-yellow-50">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, Math.random() * 20 - 10, 0],
              opacity: [0.1, 0.3, 0.1],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          >
            {i % 3 === 0 ? '⚽' : i % 3 === 1 ? '🏐' : '🏆'}
          </motion.div>
        ))}
      </div>

      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-green-400 to-yellow-500 opacity-90" />
        <div className="absolute inset-0">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
            className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
            className="absolute bottom-10 right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="inline-flex items-center gap-6 mb-8"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="bg-white p-8 rounded-3xl shadow-2xl"
              >
                <Trophy className="w-20 h-20 text-green-600" />
              </motion.div>
              <h1 className="text-8xl font-black text-white drop-shadow-2xl">
                SIPORO
              </h1>
              <motion.div
                animate={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                className="bg-white p-8 rounded-3xl shadow-2xl"
              >
                <Crown className="w-20 h-20 text-yellow-600" />
              </motion.div>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-3xl text-white font-black mb-8 drop-shadow-lg"
            >
              Amakipe ya Siporo ya Garden TVET School
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap justify-center gap-6"
            >
              {[
                { icon: Trophy, label: 'Intsinzi Nyinshi', color: 'yellow' },
                { icon: Users, label: `${teams.length} Amakipe`, color: 'green' },
                { icon: Star, label: 'Abakinnyi Beza', color: 'yellow' },
                { icon: Flame, label: 'Imikino Myinshi', color: 'green' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.1, y: -5 }}
                  className="bg-white/20 backdrop-blur-md px-8 py-4 rounded-2xl border-2 border-white/50 shadow-xl"
                >
                  <div className="flex items-center gap-3">
                    <item.icon className={`w-7 h-7 text-${item.color}-100`} />
                    <span className="font-black text-white text-lg">{item.label}</span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Teams Section */}
      <section className="py-20 px-4 relative z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-6xl font-black text-gray-900 mb-4 bg-gradient-to-r from-yellow-600 to-green-600 bg-clip-text text-transparent">
              Amakipe Yacu
            </h2>
            <p className="text-2xl text-gray-600 font-bold">Hitamo ikipe ukunde urebe byose</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {teams.map((team, index) => {
              const isFootball = team.icon === '⚽';
              const gradientColors = isFootball
                ? 'from-yellow-400 via-green-400 to-yellow-500'
                : 'from-green-400 via-yellow-400 to-green-500';

              return (
                <motion.div
                  key={team.id}
                  initial={{ opacity: 0, y: 100, rotateY: -30 }}
                  animate={{ opacity: 1, y: 0, rotateY: 0 }}
                  transition={{
                    delay: index * 0.2,
                    type: 'spring',
                    stiffness: 100,
                    damping: 15,
                  }}
                  whileHover={{ scale: 1.02, y: -10 }}
                  onHoverStart={() => setHoveredTeam(team.id)}
                  onHoverEnd={() => setHoveredTeam(null)}
                  onClick={() => onNavigate(`sport-team/${team.id}`)}
                  className="group relative cursor-pointer"
                  style={{ transformStyle: 'preserve-3d', perspective: '1000px' }}
                >
                  {/* Glow Effect */}
                  <motion.div
                    animate={{
                      opacity: hoveredTeam === team.id ? 0.8 : 0,
                      scale: hoveredTeam === team.id ? 1.1 : 1,
                    }}
                    className={`absolute inset-0 bg-gradient-to-r ${gradientColors} rounded-2xl blur-2xl`}
                  />

                  {/* Main Card */}
                  <div className={`relative bg-gradient-to-br ${gradientColors} p-1.5 rounded-2xl shadow-xl`}>
                    <div className="bg-white rounded-xl overflow-hidden">
                      {/* Image Section */}
                      <div className="relative h-48 overflow-hidden">
                        <motion.img
                          whileHover={{ scale: 1.15, rotate: 3 }}
                          transition={{ duration: 0.6 }}
                          src={team.image_url}
                          alt={team.name}
                          className="w-full h-full object-cover"
                        />
                        <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent`} />

                        {/* Floating Sparkles */}
                        <motion.div
                          animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                          className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg"
                        >
                          <Sparkles className="w-4 h-4 text-yellow-500" />
                        </motion.div>

                        {/* Animated Icon */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <motion.div
                            animate={{
                              scale: [1, 1.1, 1],
                              rotate: [0, 5, -5, 0],
                            }}
                            transition={{ duration: 4, repeat: Infinity }}
                            className="text-6xl drop-shadow-xl"
                          >
                            {team.icon}
                          </motion.div>
                        </div>

                        {/* Team Name Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <motion.div
                            initial={{ x: -30, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: index * 0.2 + 0.3 }}
                          >
                            <h3 className="text-2xl font-black text-white mb-1 drop-shadow-xl">
                              {team.name}
                            </h3>
                            <p className="text-sm text-white/90 font-bold drop-shadow-lg">
                              {team.name_en}
                            </p>
                          </motion.div>
                        </div>
                      </div>

                      {/* Content Section */}
                      <div className={`p-4 bg-gradient-to-br ${isFootball ? 'from-yellow-50 to-green-50' : 'from-green-50 to-yellow-50'}`}>
                        <p className="text-gray-700 text-sm leading-relaxed mb-4 font-medium line-clamp-2">
                          {team.description}
                        </p>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-2 mb-4">
                          {[
                            { icon: Users, value: team.total_players, label: 'Abakinnyi', color: 'yellow' },
                            { icon: Trophy, value: team.total_achievements, label: 'Ibihembo', color: 'green' },
                          ].map((stat, i) => (
                            <motion.div
                              key={i}
                              whileHover={{ scale: 1.05 }}
                              className={`text-center p-3 bg-gradient-to-br from-${stat.color}-100 to-white rounded-lg shadow-sm hover:shadow-md transition-all`}
                            >
                              <stat.icon className={`w-5 h-5 mx-auto mb-1 text-${stat.color}-700`} />
                              <p className="text-lg font-black text-gray-900">{stat.value}</p>
                              <p className="text-xs text-gray-600 font-bold">{stat.label}</p>
                            </motion.div>
                          ))}
                        </div>

                        {/* Action Button */}
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`w-full bg-gradient-to-r ${gradientColors} text-white py-3 rounded-lg font-bold text-sm shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2`}
                        >
                          <Trophy className="w-4 h-4" />
                          Reba Byose
                        </motion.button>
                      </div>
                    </div>
                  </div>

                  {/* Hover Indicator */}
                  <AnimatePresence>
                    {hoveredTeam === team.id && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-white px-8 py-4 rounded-2xl shadow-2xl z-20"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-black text-gray-900 text-lg">Kanda urebe byose</span>
                          <ArrowRight className="w-6 h-6 text-green-600" />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-yellow-400 via-green-400 to-yellow-500 rounded-[3rem] p-12 text-center shadow-2xl"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-8xl mb-6"
            >
              🏆
            </motion.div>
            <h3 className="text-5xl font-black text-white mb-6">Wifuza Kwinjira mu Kipe?</h3>
            <p className="text-2xl text-white/90 mb-8 font-bold">Tanga ubushobozi bwawe kandi ube umwe mu bakinnyi bacu!</p>
            <motion.button
              whileHover={{ scale: 1.1, y: -5 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-gray-900 px-12 py-6 rounded-2xl font-black text-2xl shadow-2xl hover:shadow-3xl transition-all inline-flex items-center gap-4"
            >
              <Users className="w-8 h-8" />
              Injira Ubu
              <ArrowRight className="w-8 h-8" />
            </motion.button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default SportsPage;
