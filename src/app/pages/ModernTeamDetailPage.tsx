import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Trophy, Users, Star, Calendar, Award, TrendingUp, Target, Crown, Shield, Zap, Activity, Medal, ChevronRight, Filter, Search, X } from 'lucide-react';
import { useLanguage } from '@/app/contexts/LanguageContext';

interface TeamDetailPageProps {
  teamId: string;
  onNavigate: (page: string) => void;
}

const ModernTeamDetailPage: React.FC<TeamDetailPageProps> = ({ teamId, onNavigate }) => {
  const { language } = useLanguage();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('players');
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const [filterPosition, setFilterPosition] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetch(`http://localhost:5000/api/sports/teams/${teamId}`)
      .then(r => r.json())
      .then(teamData => {
        if (teamData.success) setData(teamData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [teamId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-green-50">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity }}>
          <Trophy className="w-20 h-20 text-green-600" />
        </motion.div>
      </div>
    );
  }

  if (!data) return null;

  const { team, coaches, players, achievements, recentMatches, stats } = data;
  const gradient = team.sport_type === 'football' ? 'from-yellow-400 via-green-400 to-yellow-500' : 'from-green-400 via-yellow-400 to-green-500';

  const filteredPlayers = players.filter((p: any) => {
    const matchesPosition = filterPosition === 'all' || p.position === filterPosition;
    const matchesSearch = p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || p.name_rw?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPosition && matchesSearch;
  });

  const positions = [...new Set(players.map((p: any) => p.position))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-green-50">
      {/* Hero Header */}
      <div className={`bg-gradient-to-r ${gradient} text-white py-12 relative overflow-hidden`}>
        <div className="absolute inset-0 opacity-20">
          {[...Array(15)].map((_, i) => (
            <motion.div key={i} className="absolute text-6xl" style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
              animate={{ y: [0, -20, 0], opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 3, repeat: Infinity, delay: Math.random() * 2 }}>
              {team.icon}
            </motion.div>
          ))}
        </div>
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <button onClick={() => onNavigate('sports')} className="flex items-center gap-2 text-white/90 hover:text-white mb-6 font-bold transition-all hover:gap-3">
            <ArrowLeft className="w-5 h-5" /> Subira ku Makipe
          </button>
          <div className="flex items-center gap-6">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }} className="text-9xl drop-shadow-2xl">
              {team.icon}
            </motion.div>
            <div>
              <h1 className="text-6xl font-black mb-2 drop-shadow-lg">{team.name}</h1>
              <p className="text-2xl text-white/90 font-bold">{team.name_en}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Stats Overview */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-12">
          {[
            { icon: Users, label: 'Abakinnyi', value: players.length, color: 'blue' },
            { icon: Trophy, label: 'Intsinzi', value: stats?.wins || 0, color: 'green' },
            { icon: Activity, label: 'Imikino', value: stats?.total_matches || 0, color: 'purple' },
            { icon: Award, label: 'Ibihembo', value: achievements.length, color: 'yellow' },
            { icon: Target, label: 'Impunzi', value: stats?.goals_for || 0, color: 'orange' }
          ].map((stat, i) => (
            <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.1 }}
              className={`bg-gradient-to-br from-${stat.color}-50 to-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all`}>
              <stat.icon className={`w-8 h-8 text-${stat.color}-600 mb-3`} />
              <p className="text-4xl font-black text-gray-900 mb-1">{stat.value}</p>
              <p className="text-sm text-gray-600 font-bold">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Coaches Section */}
        {coaches && coaches.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
            <h2 className="text-4xl font-black text-gray-900 mb-6 flex items-center gap-3">
              <Crown className="w-10 h-10 text-yellow-600" />
              Abatoza
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {coaches.map((coach: any, idx: number) => (
                <motion.div key={coach.id} initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }}
                  className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all">
                  <div className={`bg-gradient-to-r ${gradient} p-6`}>
                    <h3 className="text-2xl font-black text-white">{idx === 0 ? 'Umutoza Mukuru' : 'Umufasha w\'Umutoza'}</h3>
                  </div>
                  <div className="p-6 flex gap-6">
                    <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-yellow-100 to-green-100 flex items-center justify-center overflow-hidden shadow-lg flex-shrink-0">
                      {coach.image_url ? (
                        <img src={`http://localhost:5000${coach.image_url}`} alt={coach.name} className="w-full h-full object-cover" />
                      ) : (
                        <Users className="w-16 h-16 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-2xl font-black text-gray-900 mb-2">{coach.name_rw || coach.name}</h4>
                      <p className="text-lg text-gray-600 font-bold mb-4">{coach.role_rw || coach.role}</p>
                      <div className="flex gap-3">
                        <div className="bg-green-50 rounded-lg px-4 py-2">
                          <p className="text-xs text-gray-600 mb-1">Uburambe</p>
                          <p className="text-xl font-black text-green-600">{coach.experience_years} Imyaka</p>
                        </div>
                        <div className="bg-yellow-50 rounded-lg px-4 py-2">
                          <p className="text-xs text-gray-600 mb-1">Ibihembo</p>
                          <p className="text-xl font-black text-yellow-600">{achievements.length}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Tabs */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
          {[
            { id: 'players', label: 'Abakinnyi', icon: Users },
            { id: 'achievements', label: 'Ibihembo', icon: Trophy },
            { id: 'matches', label: 'Imikino', icon: Calendar },
            { id: 'stats', label: 'Imibare', icon: TrendingUp }
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${
                activeTab === tab.id ? `bg-gradient-to-r ${gradient} text-white shadow-lg` : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}>
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Players Tab */}
        {activeTab === 'players' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Search & Filter */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="text" placeholder="Shakisha umukinnyi..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 outline-none font-bold" />
                </div>
                <select value={filterPosition} onChange={(e) => setFilterPosition(e.target.value)}
                  className="px-6 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 outline-none font-bold bg-white">
                  <option value="all">Imyanya Yose</option>
                  {positions.map(pos => <option key={pos} value={pos}>{pos}</option>)}
                </select>
              </div>
            </div>

            {/* Players Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPlayers.map((player: any, idx: number) => (
                <motion.div key={player.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.05 }}
                  whileHover={{ y: -8, scale: 1.02 }} onClick={() => setSelectedPlayer(player)}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer hover:shadow-2xl transition-all group">
                  <div className={`bg-gradient-to-r ${gradient} p-6 relative`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="bg-white/20 backdrop-blur-md rounded-full px-4 py-2">
                        <p className="text-3xl font-black text-white">#{player.jersey_number}</p>
                      </div>
                      {player.is_captain && (
                        <div className="bg-yellow-500 rounded-full p-2 shadow-lg">
                          <Crown className="w-5 h-5 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="w-32 h-32 mx-auto rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center overflow-hidden border-4 border-white/30 shadow-2xl">
                      {player.image_url ? (
                        <img src={`http://localhost:5000${player.image_url}`} alt={player.name} className="w-full h-full object-cover" />
                      ) : (
                        <Users className="w-16 h-16 text-white/50" />
                      )}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-black text-gray-900 mb-1">{player.name_rw || player.name}</h3>
                    <p className="text-sm text-gray-600 font-bold mb-4">{player.position_rw || player.position}</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-blue-50 rounded-lg p-3 text-center">
                        <p className="text-xs text-gray-600 mb-1">Ikilas</p>
                        <p className="text-lg font-black text-blue-600">{player.class}</p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3 text-center">
                        <p className="text-xs text-gray-600 mb-1">Uburebure</p>
                        <p className="text-lg font-black text-green-600">{player.height}cm</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Achievements Tab */}
        {activeTab === 'achievements' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {achievements.map((achievement: any, idx: number) => (
              <motion.div key={achievement.id} initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all">
                <div className="flex items-start gap-4">
                  <div className="text-6xl">{achievement.icon || '🏆'}</div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-black text-gray-900 mb-2">{achievement.title_rw || achievement.title}</h3>
                    <p className="text-gray-600 mb-3 font-bold">{achievement.description_rw}</p>
                    <div className="flex items-center gap-4">
                      <span className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full text-sm font-black">{achievement.position}</span>
                      <span className="text-gray-500 font-bold">{new Date(achievement.achievement_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Matches Tab */}
        {activeTab === 'matches' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {recentMatches.map((match: any, idx: number) => (
              <motion.div key={match.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-sm text-gray-500 mb-1 font-bold">{new Date(match.match_date).toLocaleDateString()}</p>
                      <p className="text-xs text-gray-400 font-bold">{match.match_time}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-black text-gray-900 text-lg">Garden TVET</p>
                        <p className="text-4xl font-black text-green-600">{match.our_score}</p>
                      </div>
                      <div className="text-3xl font-black text-gray-400">-</div>
                      <div>
                        <p className="font-black text-gray-900 text-lg">{match.opponent}</p>
                        <p className="text-4xl font-black text-gray-600">{match.opponent_score}</p>
                      </div>
                    </div>
                  </div>
                  <span className={`px-6 py-3 rounded-full font-bold text-lg ${
                    match.result === 'win' ? 'bg-green-100 text-green-700' :
                    match.result === 'loss' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {match.result === 'win' ? '🏆 Twatsindiye' : match.result === 'loss' ? '❌ Twatsindiwe' : '🤝 Ikigwi'}
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Stats Tab */}
        {activeTab === 'stats' && stats && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-2xl font-black text-gray-900 mb-6">Imikorere</h3>
              <div className="space-y-4">
                {[
                  { label: 'Intsinzi', value: stats.wins, color: 'green', percent: (stats.wins / stats.total_matches) * 100 },
                  { label: 'Ikigwi', value: stats.draws, color: 'gray', percent: (stats.draws / stats.total_matches) * 100 },
                  { label: 'Gutsindwa', value: stats.losses, color: 'red', percent: (stats.losses / stats.total_matches) * 100 }
                ].map((stat, i) => (
                  <div key={i}>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-700 font-bold">{stat.label}</span>
                      <span className={`font-black text-${stat.color}-600`}>{stat.value}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${stat.percent}%` }} transition={{ duration: 1, delay: i * 0.2 }}
                        className={`h-full bg-${stat.color}-600 rounded-full`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-2xl font-black text-gray-900 mb-6">Impunzi</h3>
              <div className="space-y-4">
                <div className="bg-blue-50 rounded-xl p-6 text-center">
                  <p className="text-gray-600 font-bold mb-2">Impunzi Zatanze</p>
                  <p className="text-5xl font-black text-blue-600">{stats.goals_for || 0}</p>
                </div>
                <div className="bg-red-50 rounded-xl p-6 text-center">
                  <p className="text-gray-600 font-bold mb-2">Impunzi Bemejwe</p>
                  <p className="text-5xl font-black text-red-600">{stats.goals_against || 0}</p>
                </div>
                <div className="bg-green-50 rounded-xl p-6 text-center">
                  <p className="text-gray-600 font-bold mb-2">Itandukaniro</p>
                  <p className="text-5xl font-black text-green-600">+{(stats.goals_for || 0) - (stats.goals_against || 0)}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Player Detail Modal */}
      <AnimatePresence>
        {selectedPlayer && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedPlayer(null)}>
            <motion.div initial={{ scale: 0.9, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 50 }}
              onClick={(e) => e.stopPropagation()} className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className={`bg-gradient-to-r ${gradient} p-8 relative`}>
                <button onClick={() => setSelectedPlayer(null)} className="absolute top-4 right-4 bg-white/20 backdrop-blur-md rounded-full p-2 hover:bg-white/30 transition-all">
                  <X className="w-6 h-6 text-white" />
                </button>
                <div className="flex items-center gap-6">
                  <div className="w-32 h-32 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center overflow-hidden border-4 border-white/30 shadow-2xl">
                    {selectedPlayer.image_url ? (
                      <img src={`http://localhost:5000${selectedPlayer.image_url}`} alt={selectedPlayer.name} className="w-full h-full object-cover" />
                    ) : (
                      <Users className="w-16 h-16 text-white/50" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-4xl font-black text-white">{selectedPlayer.name_rw || selectedPlayer.name}</h2>
                      {selectedPlayer.is_captain && <Crown className="w-8 h-8 text-yellow-300" />}
                    </div>
                    <p className="text-xl text-white/90 font-bold mb-2">{selectedPlayer.position_rw || selectedPlayer.position}</p>
                    <div className="bg-white/20 backdrop-blur-md rounded-full px-6 py-2 inline-block">
                      <p className="text-3xl font-black text-white">#{selectedPlayer.jersey_number}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-8">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-blue-50 rounded-xl p-4 text-center">
                    <p className="text-sm text-gray-600 mb-1 font-bold">Ikilas</p>
                    <p className="text-2xl font-black text-blue-600">{selectedPlayer.class}</p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4 text-center">
                    <p className="text-sm text-gray-600 mb-1 font-bold">Uburebure</p>
                    <p className="text-2xl font-black text-green-600">{selectedPlayer.height}cm</p>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-4 text-center">
                    <p className="text-sm text-gray-600 mb-1 font-bold">Uburemere</p>
                    <p className="text-2xl font-black text-purple-600">{selectedPlayer.weight || 'N/A'}kg</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ModernTeamDetailPage;
