import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Users, Award, TrendingUp, X, Mail, Phone, Calendar, Target, Star, ImageIcon, Sparkles } from 'lucide-react';

interface TeamsListPageProps {
  onNavigate: (page: string) => void;
}

const TeamsListPage: React.FC<TeamsListPageProps> = ({ onNavigate }) => {
  const [teams, setTeams] = useState<any[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('players');
  const [imageModal, setImageModal] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/sports/teams');
      const data = await response.json();
      setTeams(data);
    } catch (error) {
      console.error('Error fetching teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamDetails = async (teamId: number) => {
    try {
      const response = await fetch(`http://localhost:5000/api/sports/teams/${teamId}`);
      const data = await response.json();
      setSelectedTeam(data);
    } catch (error) {
      console.error('Error fetching team details:', error);
    }
  };

  const handleTeamClick = (teamId: number) => {
    fetchTeamDetails(teamId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-green-50 flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
          <Trophy className="w-16 h-16 text-green-600" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-green-50">
      {/* Hero Header */}
      <section className="relative py-20 overflow-hidden bg-gradient-to-r from-yellow-400 via-green-400 to-yellow-500">
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-3 bg-white rounded-full"
              style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
              animate={{ y: [0, -20, 0], opacity: [0.2, 1, 0.2] }}
              transition={{ duration: 2 + Math.random(), repeat: Infinity, delay: Math.random() }}
            />
          ))}
        </div>
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <div className="inline-flex items-center gap-4 mb-6">
              <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.6 }} className="bg-white p-6 rounded-3xl shadow-2xl">
                <Trophy className="w-16 h-16 text-green-600" />
              </motion.div>
              <h1 className="text-7xl font-black text-white drop-shadow-2xl">AMAKIPE YACU</h1>
            </div>
            <p className="text-2xl text-white/90 font-bold mb-8">Garden TVET School Sports Teams</p>
            <div className="flex justify-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-2xl border-2 border-white/50">
                <p className="text-white font-black text-3xl">{teams.length}</p>
                <p className="text-white/90 text-sm">Amakipe</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Teams Grid */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {teams.map((team, index) => (
              <motion.div
                key={team.id}
                initial={{ opacity: 0, y: 50, rotateY: -10 }}
                animate={{ opacity: 1, y: 0, rotateY: 0 }}
                transition={{ delay: index * 0.15, type: 'spring' }}
                whileHover={{ scale: 1.03, y: -10, rotateY: 3 }}
                onClick={() => handleTeamClick(team.id)}
                className="group relative cursor-pointer"
                style={{ transformStyle: 'preserve-3d' }}
              >
                <motion.div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-green-400 rounded-3xl blur-3xl opacity-0 group-hover:opacity-70 transition-opacity duration-500" />
                
                <div className="relative bg-gradient-to-br from-yellow-400 via-green-400 to-yellow-500 p-1 rounded-3xl shadow-2xl">
                  <div className="bg-white rounded-3xl overflow-hidden">
                    <div className="relative h-80">
                      <motion.img
                        src={team.image_url}
                        alt={team.name}
                        className="w-full h-full object-cover"
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.6 }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                      
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                        className="absolute top-6 right-6 bg-white/90 backdrop-blur-sm rounded-full p-4 shadow-xl"
                      >
                        <Sparkles className="w-8 h-8 text-yellow-500" />
                      </motion.div>
                      
                      <div className="absolute inset-0 flex items-center justify-center">
                        <motion.div
                          animate={{ scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }}
                          transition={{ duration: 3, repeat: Infinity }}
                          className="text-9xl drop-shadow-2xl filter brightness-110"
                        >
                          {team.icon}
                        </motion.div>
                      </div>
                      
                      <div className="absolute bottom-0 left-0 right-0 p-8">
                        <motion.h3 
                          className="text-4xl font-black text-white mb-2 drop-shadow-lg"
                          whileHover={{ scale: 1.05 }}
                        >
                          {team.name}
                        </motion.h3>
                        <p className="text-xl text-white/90 font-bold">{team.name_en}</p>
                      </div>
                    </div>
                    
                    <div className="p-8 bg-gradient-to-br from-yellow-50 to-green-50">
                      <p className="text-gray-700 mb-6 text-lg leading-relaxed">{team.description}</p>
                      
                      <div className="grid grid-cols-3 gap-4 mb-6">
                        <motion.div whileHover={{ scale: 1.1, y: -5 }} className="text-center p-4 bg-gradient-to-br from-yellow-100 to-yellow-50 rounded-2xl shadow-lg">
                          <Users className="w-7 h-7 mx-auto mb-2 text-yellow-700" />
                          <p className="text-3xl font-black text-gray-900">{team.total_players}</p>
                          <p className="text-xs text-gray-600 font-bold">Abakinnyi</p>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.1, y: -5 }} className="text-center p-4 bg-gradient-to-br from-green-100 to-green-50 rounded-2xl shadow-lg">
                          <Trophy className="w-7 h-7 mx-auto mb-2 text-green-700" />
                          <p className="text-3xl font-black text-gray-900">{team.total_achievements}</p>
                          <p className="text-xs text-gray-600 font-bold">Ibihembo</p>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.1, y: -5 }} className="text-center p-4 bg-gradient-to-br from-yellow-100 to-green-100 rounded-2xl shadow-lg">
                          <TrendingUp className="w-7 h-7 mx-auto mb-2 text-green-700" />
                          <p className="text-3xl font-black text-gray-900">{team.win_rate}%</p>
                          <p className="text-xs text-gray-600 font-bold">Intsinzi</p>
                        </motion.div>
                      </div>
                      
                      <div className="flex items-center gap-3 mb-6">
                        <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${team.win_rate}%` }}
                            transition={{ duration: 1.5, delay: index * 0.2 }}
                            className="h-full bg-gradient-to-r from-yellow-400 via-green-400 to-yellow-500 shadow-lg"
                          />
                        </div>
                        <span className="text-lg font-black text-gray-700">{team.win_rate}%</span>
                      </div>
                      
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-full bg-gradient-to-r from-yellow-400 via-green-400 to-yellow-500 text-white py-4 rounded-2xl font-black text-lg shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-3"
                      >
                        <Trophy className="w-6 h-6" />
                        Reba Byose
                        <Sparkles className="w-6 h-6" />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Detail Modal */}
      <AnimatePresence>
        {selectedTeam && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 overflow-y-auto backdrop-blur-sm"
            onClick={() => setSelectedTeam(null)}
          >
            <div className="min-h-screen py-8 px-4">
              <motion.div
                initial={{ scale: 0.8, y: 100 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.8, y: 100 }}
                onClick={(e) => e.stopPropagation()}
                className="max-w-7xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden"
              >
                {/* Header */}
                <div className="relative h-[500px]">
                  <img src={selectedTeam.image_url} alt={selectedTeam.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedTeam(null)}
                    className="absolute top-8 right-8 bg-white p-4 rounded-full shadow-2xl z-10"
                  >
                    <X className="w-7 h-7 text-gray-900" />
                  </motion.button>
                  <div className="absolute bottom-0 left-0 right-0 p-12">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-9xl mb-6">{selectedTeam.icon}</motion.div>
                    <h2 className="text-6xl font-black text-white mb-3 drop-shadow-2xl">{selectedTeam.name}</h2>
                    <p className="text-3xl text-white/90 font-bold mb-6">{selectedTeam.name_en}</p>
                    <p className="text-xl text-white/80 max-w-4xl leading-relaxed">{selectedTeam.description}</p>
                  </div>
                </div>

                {/* Stats Bar */}
                <div className="bg-gradient-to-r from-yellow-400 via-green-400 to-yellow-500 p-8">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center text-white">
                    {[
                      { label: 'Abakinnyi', value: selectedTeam.total_players, icon: Users },
                      { label: 'Imikino', value: selectedTeam.total_matches, icon: Target },
                      { label: 'Intsinzi', value: selectedTeam.total_wins, icon: Trophy },
                      { label: 'Ibihembo', value: selectedTeam.total_achievements, icon: Award },
                      { label: 'Igipimo', value: `${selectedTeam.win_rate}%`, icon: TrendingUp }
                    ].map((stat, i) => (
                      <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                        <stat.icon className="w-10 h-10 mx-auto mb-2" />
                        <p className="text-4xl font-black">{stat.value}</p>
                        <p className="text-sm font-bold">{stat.label}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Tabs */}
                <div className="border-b-4 border-gray-200 bg-gradient-to-r from-yellow-50 to-green-50">
                  <div className="flex overflow-x-auto">
                    {[
                      { id: 'players', label: 'Abakinnyi', icon: Users },
                      { id: 'coaches', label: 'Abatoza', icon: Star },
                      { id: 'achievements', label: 'Ibihembo', icon: Trophy },
                      { id: 'gallery', label: 'Amafoto', icon: ImageIcon },
                      { id: 'schedule', label: 'Gahunda', icon: Calendar }
                    ].map((tab) => (
                      <motion.button
                        key={tab.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-10 py-5 font-black whitespace-nowrap transition-all flex items-center gap-3 ${
                          activeTab === tab.id
                            ? 'border-b-4 border-green-500 text-green-600 bg-white'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
                        }`}
                      >
                        <tab.icon className="w-6 h-6" />
                        {tab.label}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Tab Content */}
                <div className="p-10 bg-gradient-to-br from-yellow-50 via-white to-green-50 min-h-[600px]">
                  {activeTab === 'players' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {selectedTeam.players?.map((player: any, index: number) => (
                        <motion.div
                          key={player.id}
                          initial={{ opacity: 0, scale: 0.8, rotateY: -20 }}
                          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ scale: 1.05, y: -10 }}
                          className="relative bg-gradient-to-br from-yellow-100 via-white to-green-100 rounded-3xl p-8 shadow-xl hover:shadow-2xl"
                        >
                          <div className="relative mb-6">
                            <motion.img
                              whileHover={{ scale: 1.1, rotate: 5 }}
                              src={player.image_url}
                              alt={player.name}
                              className="w-40 h-40 rounded-full mx-auto object-cover border-4 border-white shadow-2xl"
                            />
                            <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-green-500 text-white w-16 h-16 rounded-full flex items-center justify-center font-black text-2xl shadow-xl border-4 border-white">
                              {player.jersey_number}
                            </div>
                          </div>
                          <h4 className="text-2xl font-black text-center mb-3 text-gray-900">{player.name}</h4>
                          <p className="text-center text-green-600 font-bold text-lg mb-4">{player.position}</p>
                          <div className="flex justify-center gap-6 text-sm text-gray-700 font-bold">
                            <span className="flex items-center gap-2">🎂 {player.age} yrs</span>
                            <span className="flex items-center gap-2">📏 {player.height}</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'coaches' && (
                    <div className="space-y-10">
                      {selectedTeam.coaches?.map((coach: any, index: number) => (
                        <motion.div
                          key={coach.id}
                          initial={{ opacity: 0, x: -50 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={`bg-gradient-to-br ${coach.is_head_coach ? 'from-yellow-100 to-green-100' : 'from-green-100 to-yellow-100'} rounded-3xl p-10 shadow-xl`}
                        >
                          <div className="flex flex-col md:flex-row gap-10">
                            <motion.img
                              whileHover={{ scale: 1.1, rotate: 3 }}
                              src={coach.image_url}
                              alt={coach.name}
                              className="w-56 h-56 rounded-3xl object-cover shadow-2xl border-4 border-white"
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-4 mb-6">
                                {coach.is_head_coach ? <Trophy className="w-10 h-10 text-yellow-600" /> : <Star className="w-10 h-10 text-green-600" />}
                                <h3 className="text-4xl font-black">{coach.is_head_coach ? 'Umutoza Mukuru' : 'Umufasha w\'Umutoza'}</h3>
                              </div>
                              <h4 className="text-5xl font-black text-gray-900 mb-3">{coach.name}</h4>
                              <p className="text-2xl text-green-600 font-bold mb-6">{coach.specialization}</p>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                                <div className="flex items-center gap-3 bg-white p-4 rounded-xl shadow">
                                  <Calendar className="w-6 h-6 text-gray-600" />
                                  <span className="text-gray-700 font-bold">Uburambe: {coach.experience_years} Imyaka</span>
                                </div>
                                {coach.phone && (
                                  <div className="flex items-center gap-3 bg-white p-4 rounded-xl shadow">
                                    <Phone className="w-6 h-6 text-gray-600" />
                                    <span className="text-gray-700 font-bold">{coach.phone}</span>
                                  </div>
                                )}
                                {coach.email && (
                                  <div className="flex items-center gap-3 bg-white p-4 rounded-xl shadow md:col-span-2">
                                    <Mail className="w-6 h-6 text-gray-600" />
                                    <span className="text-gray-700 font-bold">{coach.email}</span>
                                  </div>
                                )}
                              </div>
                              {coach.achievements?.length > 0 && (
                                <div className="bg-white rounded-2xl p-6 shadow-lg">
                                  <h5 className="font-black text-gray-900 mb-4 flex items-center gap-3 text-xl">
                                    <Star className="w-6 h-6 text-yellow-500" />
                                    Ibyatanzwe
                                  </h5>
                                  <ul className="space-y-3">
                                    {coach.achievements.map((achievement: string, i: number) => (
                                      <motion.li
                                        key={i}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="flex items-center gap-3 text-gray-700 font-bold"
                                      >
                                        <span className="w-3 h-3 bg-gradient-to-r from-yellow-400 to-green-500 rounded-full" />
                                        {achievement}
                                      </motion.li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'achievements' && (
                    <div className="space-y-6">
                      {selectedTeam.achievements?.map((achievement: any, index: number) => (
                        <motion.div
                          key={achievement.id}
                          initial={{ opacity: 0, x: -50 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ scale: 1.02, x: 10 }}
                          className="bg-gradient-to-r from-yellow-100 via-white to-green-100 rounded-3xl p-8 flex items-center gap-8 shadow-xl hover:shadow-2xl"
                        >
                          <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-8xl">
                            {achievement.icon}
                          </motion.div>
                          <div className="flex-1">
                            <h4 className="text-3xl font-black text-gray-900 mb-3">{achievement.title}</h4>
                            <p className="text-gray-600 flex items-center gap-3 text-lg font-bold">
                              <Calendar className="w-5 h-5" />
                              {achievement.date}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'gallery' && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                      {selectedTeam.gallery?.map((item: any, index: number) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, scale: 0.7 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ scale: 1.05, rotate: 2 }}
                          onClick={() => setImageModal(item.image_url)}
                          className="relative aspect-video rounded-3xl overflow-hidden cursor-pointer shadow-xl hover:shadow-2xl"
                        >
                          <img src={item.image_url} alt={`Gallery ${index + 1}`} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-all flex items-center justify-center">
                            <ImageIcon className="w-16 h-16 text-white" />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'schedule' && (
                    <div className="space-y-6">
                      {selectedTeam.schedule?.map((match: any, index: number) => (
                        <motion.div
                          key={match.id}
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ scale: 1.02, y: -5 }}
                          className="bg-gradient-to-r from-yellow-100 to-green-100 rounded-3xl p-8 shadow-xl hover:shadow-2xl"
                        >
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex-1">
                              <h4 className="text-3xl font-black text-gray-900 mb-4">vs {match.opponent}</h4>
                              <div className="flex flex-wrap gap-6 text-gray-700 font-bold">
                                <span className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow">
                                  <Calendar className="w-5 h-5" />
                                  {match.match_date}
                                </span>
                                <span className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow">
                                  <Target className="w-5 h-5" />
                                  {match.venue}
                                </span>
                                <span className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow">
                                  ⏰ {match.match_time}
                                </span>
                              </div>
                            </div>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="bg-gradient-to-r from-yellow-400 to-green-500 text-white px-8 py-4 rounded-2xl font-black text-lg shadow-xl"
                            >
                              Reba Byose
                            </motion.button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Modal */}
      <AnimatePresence>
        {imageModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setImageModal(null)}
            className="fixed inset-0 bg-black/95 z-[60] flex items-center justify-center p-4 backdrop-blur-sm"
          >
            <motion.img
              initial={{ scale: 0.7, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0.7, rotate: 10 }}
              src={imageModal}
              alt="Gallery"
              className="max-w-full max-h-full rounded-3xl shadow-2xl"
            />
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setImageModal(null)}
              className="absolute top-8 right-8 bg-white p-4 rounded-full shadow-2xl"
            >
              <X className="w-7 h-7" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TeamsListPage;
