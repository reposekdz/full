import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Users, Trophy, Calendar, MapPin, Star, Award, Target, TrendingUp, Activity, Shield, Heart, Medal, Zap } from 'lucide-react';

interface UltraTeamViewPageProps {
  teamId: string;
  onNavigate: (page: string) => void;
}

const UltraTeamViewPage: React.FC<UltraTeamViewPageProps> = ({ teamId, onNavigate }) => {
  const [team, setTeam] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetch(`http://localhost:5000/api/sports/teams/${teamId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const t = data.team;
          if (typeof t.players === 'string') t.players = JSON.parse(t.players);
          if (typeof t.achievements === 'string') t.achievements = JSON.parse(t.achievements);
          setTeam(t);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [teamId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-yellow-50">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-green-600 border-t-yellow-600 rounded-full mx-auto mb-4"
          />
          <p className="text-gray-600 text-lg font-bold">Gutegura Ikipe...</p>
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-yellow-50">
        <div className="text-center">
          <h2 className="text-3xl font-black text-gray-900 mb-4">Ikipe Ntiyabonetse</h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onNavigate('sports')}
            className="bg-gradient-to-r from-green-600 to-yellow-600 text-white px-8 py-4 rounded-xl font-black shadow-lg"
          >
            <ArrowLeft className="inline w-5 h-5 mr-2" />
            Subira ku Makipe
          </motion.button>
        </div>
      </div>
    );
  }

  const stats = [
    { label: 'Abakinnyi', value: team.total_players || 0, icon: Users, color: 'from-blue-500 to-blue-600' },
    { label: 'Ibihembo', value: team.total_achievements || 0, icon: Trophy, color: 'from-yellow-500 to-yellow-600' },
    { label: 'Imikino', value: '25+', icon: Activity, color: 'from-green-500 to-green-600' },
    { label: 'Intsinzi', value: '18+', icon: Star, color: 'from-purple-500 to-purple-600' }
  ];

  const teamValues = [
    { icon: Shield, title: 'Ubufatanye', desc: 'Gukorana neza mu kipe' },
    { icon: Heart, title: 'Urukundo', desc: 'Gukunda umukino n\'ikipe' },
    { icon: Target, title: 'Intego', desc: 'Gushaka gutsinda buri mukino' },
    { icon: TrendingUp, title: 'Iterambere', desc: 'Gukomeza gutera imbere' },
    { icon: Zap, title: 'Imbaraga', desc: 'Gukina n\'imbaraga zose' },
    { icon: Award, title: 'Icyubahiro', desc: 'Kwubaha abandi n\'amategeko' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-yellow-50">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-r from-green-600 via-yellow-500 to-green-600 overflow-hidden">
        <motion.div
          animate={{ backgroundPosition: ['0%', '100%', '0%'] }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute inset-0 opacity-20"
          style={{ backgroundImage: 'linear-gradient(45deg, transparent 25%, rgba(255,255,255,0.3) 25%, rgba(255,255,255,0.3) 50%, transparent 50%, transparent 75%, rgba(255,255,255,0.3) 75%)', backgroundSize: '50px 50px' }}
        />
        
        <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
          <motion.button
            whileHover={{ x: -5 }}
            onClick={() => onNavigate('sports')}
            className="flex items-center gap-2 text-white hover:text-white/80 transition mb-6 font-bold"
          >
            <ArrowLeft className="w-5 h-5" /> Subira ku Makipe
          </motion.button>
          
          <div className="flex flex-col md:flex-row items-start md:items-center gap-8 pb-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative"
            >
              <div className="absolute -inset-4 bg-white/30 rounded-3xl blur-xl" />
              <div className="relative w-40 h-40 rounded-2xl overflow-hidden bg-white shadow-2xl border-4 border-white">
                <img
                  src={`http://localhost:5000${team.image_url}`}
                  alt={team.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-r from-yellow-400 to-white rounded-full flex items-center justify-center shadow-lg"
              >
                <Trophy className="w-8 h-8 text-green-600" />
              </motion.div>
            </motion.div>
            
            <div className="flex-1">
              <motion.h1
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-5xl font-black text-white mb-2"
              >
                {team.name}
              </motion.h1>
              <motion.p
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-2xl text-white/90 font-bold mb-6"
              >
                {team.name_en}
              </motion.p>
              
              <div className="flex flex-wrap gap-3">
                {stats.slice(0, 2).map((stat, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 + idx * 0.1 }}
                    className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-xl border-2 border-white/30"
                  >
                    <div className="flex items-center gap-3">
                      <stat.icon className="w-6 h-6 text-white" />
                      <div>
                        <p className="text-2xl font-black text-white">{stat.value}</p>
                        <p className="text-sm text-white/80 font-bold">{stat.label}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 -mt-8 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -5, scale: 1.05 }}
              className="bg-white rounded-2xl p-6 shadow-2xl border-2 border-gray-100"
            >
              <div className={`w-14 h-14 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
                <stat.icon className="w-7 h-7 text-white" />
              </div>
              <p className="text-3xl font-black bg-gradient-to-r from-green-600 to-yellow-600 bg-clip-text text-transparent">{stat.value}</p>
              <p className="text-sm text-gray-600 font-bold">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white shadow-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-2 py-4 overflow-x-auto">
            {['overview', 'players', 'achievements', 'values', 'schedule'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-xl font-black transition whitespace-nowrap ${
                  activeTab === tab
                    ? 'bg-gradient-to-r from-green-600 to-yellow-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab === 'overview' && 'Ibyanyu'}
                {tab === 'players' && 'Abakinnyi'}
                {tab === 'achievements' && 'Ibihembo'}
                {tab === 'values' && 'Indangagaciro'}
                {tab === 'schedule' && 'Gahunda'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="bg-white rounded-2xl shadow-xl p-8"
            >
              <h2 className="text-3xl font-black text-gray-900 mb-6">Ibyanyu {team.name}</h2>
              <div className="space-y-6 text-gray-700 text-lg leading-relaxed">
                <p className="whitespace-pre-line">
                  {team.description || team.description_rw || 'Nta makuru ahari.'}
                </p>
                <div className="bg-gradient-to-r from-green-50 to-yellow-50 rounded-xl p-6 border-l-4 border-green-600">
                  <h3 className="text-xl font-black text-gray-900 mb-3">Intego y'Ikipe</h3>
                  <p>
                    Ikipe yacu ifite intego yo gutsinda imikino yose, guteza imbere abakinnyi, no kugira ubufatanye bukomeye. Dushaka kuba ikipe ikomeye kandi ikunzwe mu gihugu.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'players' && (
            <motion.div
              key="players"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                <h2 className="text-3xl font-black text-gray-900 mb-4">Abakinnyi ba {team.name}</h2>
                <p className="text-gray-700 text-lg">
                  Ikipe yacu igizwe n'abakinnyi {team.total_players || 0} bafite ubushobozi bukomeye. Bose bafite urukundo rukabije rw'umukino kandi bakora ibishoboka byose kugira ngo ikipe yatsinde.
                </p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(team.players || []).map((player: any, idx: number) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{ y: -5, scale: 1.05 }}
                    className="bg-white rounded-2xl shadow-xl p-6 border-2 border-gray-100"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-yellow-500 rounded-full flex items-center justify-center">
                        <Users className="text-white text-2xl" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-black text-gray-900">{player.name}</h3>
                        <p className="text-gray-600 font-semibold">{player.position}</p>
                      </div>
                      {player.number && (
                        <div className="text-4xl font-black text-gray-300">#{player.number}</div>
                      )}
                    </div>
                    {player.description && (
                      <p className="text-gray-700 text-sm">{player.description}</p>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'achievements' && (
            <motion.div
              key="achievements"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                <h2 className="text-3xl font-black text-gray-900 mb-4">Ibihembo bya {team.name}</h2>
                <p className="text-gray-700 text-lg">
                  Ikipe yacu yatsindiye ibihembo {team.total_achievements || 0} mu marushanwa atandukanye. Dufite amateka meza yo gutsinda kandi tukomeza gukora ibishoboka byose kugira ngo tukomeze gutsinda.
                </p>
              </div>
              <div className="space-y-4">
                {(team.achievements || []).map((achievement: any, idx: number) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{ x: 5, scale: 1.02 }}
                    className="bg-white rounded-2xl shadow-xl p-6 flex items-center gap-6"
                  >
                    <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <Trophy className="text-white text-2xl" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-black text-gray-900">{achievement.title || achievement}</h3>
                      {achievement.year && (
                        <p className="text-gray-600 font-semibold">{achievement.year}</p>
                      )}
                      {achievement.description && (
                        <p className="text-gray-700 mt-2">{achievement.description}</p>
                      )}
                    </div>
                    <Medal className="w-12 h-12 text-yellow-500" />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'values' && (
            <motion.div
              key="values"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                <h2 className="text-3xl font-black text-gray-900 mb-4">Indangagaciro za {team.name}</h2>
                <p className="text-gray-700 text-lg">
                  Ikipe yacu ifite indangagaciro z'ingenzi zidufasha gutsinda no gukomeza gutera imbere. Izi ndangagaciro ni zo zituma tuba ikipe ikomeye kandi ikunzwe.
                </p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teamValues.map((value, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{ y: -5, scale: 1.05 }}
                    className="bg-white rounded-2xl p-6 shadow-xl border-2 border-gray-100"
                  >
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-yellow-500 rounded-2xl flex items-center justify-center mb-4">
                      <value.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 mb-2">{value.title}</h3>
                    <p className="text-gray-700">{value.desc}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'schedule' && (
            <motion.div
              key="schedule"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="bg-white rounded-2xl shadow-xl p-8"
            >
              <h2 className="text-3xl font-black text-gray-900 mb-6">Gahunda y'Imyitozo</h2>
              <div className="space-y-4">
                {[
                  { day: 'Kuwa mbere', time: '4:00 PM - 6:00 PM', location: 'Stade Ngoma', activity: 'Imyitozo Rusange' },
                  { day: 'Kuwa kabiri', time: '3:30 PM - 5:30 PM', location: 'Ikirambi cy\'Ishuri', activity: 'Imyitozo y\'Ubushobozi' },
                  { day: 'Kuwa gatatu', time: '4:00 PM - 6:00 PM', location: 'Stade Ngoma', activity: 'Umukino w\'Imyitozo' },
                  { day: 'Kuwa kane', time: '3:30 PM - 5:30 PM', location: 'Ikirambi cy\'Ishuri', activity: 'Imyitozo y\'Ubushobozi' },
                  { day: 'Kuwa gatanu', time: '4:00 PM - 6:00 PM', location: 'Stade Ngoma', activity: 'Imyitozo Rusange' }
                ].map((schedule, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{ x: 5 }}
                    className="flex items-center gap-6 p-6 bg-gradient-to-r from-green-50 to-yellow-50 rounded-xl"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-yellow-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-black text-gray-900">{schedule.day}</h3>
                      <div className="flex items-center gap-4 mt-1 text-gray-700">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-green-600" />
                          <span className="font-semibold">{schedule.time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-yellow-600" />
                          <span className="font-semibold">{schedule.location}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="px-4 py-2 bg-white rounded-lg font-bold text-gray-800">{schedule.activity}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default UltraTeamViewPage;
