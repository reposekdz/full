import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Users, Award, Calendar, Star, Crown, Flame, TrendingUp, Target, Zap, Medal, Activity, ChevronRight, ArrowRight } from 'lucide-react';

interface SportsPageProps {
  onNavigate: (page: string) => void;
}

const BeautifulSportsPage: React.FC<SportsPageProps> = ({ onNavigate }) => {
  const [teams, setTeams] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [upcomingMatches, setUpcomingMatches] = useState<any[]>([]);
  const [topPlayers, setTopPlayers] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [teamsRes, leaderboardRes, matchesRes, playersRes, analyticsRes] = await Promise.all([
        fetch('http://localhost:5000/api/sports/teams'),
        fetch('http://localhost:5000/api/sports/leaderboard'),
        fetch('http://localhost:5000/api/sports/upcoming-matches'),
        fetch('http://localhost:5000/api/sports/top-players'),
        fetch('http://localhost:5000/api/sports/analytics')
      ]);
      const [teamsData, leaderboardData, matchesData, playersData, analyticsData] = await Promise.all([
        teamsRes.json(), leaderboardRes.json(), matchesRes.json(), playersRes.json(), analyticsRes.json()
      ]);
      if (teamsData.success) setTeams(teamsData.teams);
      if (leaderboardData.success) setLeaderboard(leaderboardData.leaderboard);
      if (matchesData.success) setUpcomingMatches(matchesData.matches);
      if (playersData.success) setTopPlayers(playersData.players);
      if (analyticsData.success) setAnalytics(analyticsData.analytics);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-yellow-50">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
          <Trophy className="w-16 h-16 text-green-600" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-green-50">
      {/* Hero Section - Compact & Impactful */}
      <section className="relative bg-gradient-to-r from-green-600 via-yellow-500 to-green-600 py-16 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {[...Array(20)].map((_, i) => (
            <motion.div key={i} className="absolute text-6xl" style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
              animate={{ y: [0, -20, 0], opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 3, repeat: Infinity, delay: Math.random() * 2 }}>
              {i % 2 === 0 ? '⚽' : '🏐'}
            </motion.div>
          ))}
        </div>
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <div className="flex items-center justify-center gap-4 mb-6">
              <Trophy className="w-16 h-16 text-white" />
              <h1 className="text-6xl font-black text-white">SIPORO</h1>
              <Crown className="w-16 h-16 text-yellow-300" />
            </div>
            <p className="text-2xl text-white/90 font-bold mb-8">Garden TVET School Sports Excellence</p>
            {analytics && (
              <div className="flex justify-center gap-8">
                {[
                  { icon: Trophy, value: analytics.teams, label: 'Amakipe' },
                  { icon: Users, value: analytics.players, label: 'Abakinnyi' },
                  { icon: Activity, value: analytics.matches, label: 'Imikino' },
                  { icon: Award, value: analytics.achievements, label: 'Ibihembo' }
                ].map((stat, i) => (
                  <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.1 }}
                    className="bg-white/20 backdrop-blur-md rounded-2xl px-6 py-4 border-2 border-white/30">
                    <stat.icon className="w-8 h-8 text-white mx-auto mb-2" />
                    <p className="text-3xl font-black text-white">{stat.value}</p>
                    <p className="text-sm text-white/80 font-bold">{stat.label}</p>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Main Content Grid - Better Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          
          {/* Left Column - Leaderboard */}
          <div className="lg:col-span-1">
            <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-3xl shadow-2xl overflow-hidden sticky top-4">
              <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-6">
                <h2 className="text-2xl font-black text-white flex items-center gap-3">
                  <Medal className="w-8 h-8" />
                  Urutonde rw'Intsinzi
                </h2>
              </div>
              <div className="p-6 space-y-4">
                {leaderboard.slice(0, 5).map((team, idx) => (
                  <motion.div key={team.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }} whileHover={{ scale: 1.02 }}
                    className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-yellow-50 rounded-xl cursor-pointer hover:shadow-lg transition-all"
                    onClick={() => onNavigate(`sport-team/${team.id}`)}>
                    <div className={`text-4xl ${idx === 0 ? 'scale-125' : ''}`}>
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}`}
                    </div>
                    <div className="text-5xl">{team.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-black text-gray-900">{team.name}</h3>
                      <div className="flex gap-3 mt-1">
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold">
                          {team.wins} Intsinzi
                        </span>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-bold">
                          {team.players} Abakinnyi
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Column - Teams & Matches */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Teams Section */}
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-4xl font-black text-gray-900 flex items-center gap-3">
                  <Trophy className="w-10 h-10 text-green-600" />
                  Amakipe Yacu
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {teams.map((team, idx) => (
                  <motion.div key={team.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }} whileHover={{ y: -8, scale: 1.02 }}
                    onClick={() => onNavigate(`sport-team/${team.id}`)}
                    className="group bg-white rounded-2xl shadow-xl overflow-hidden cursor-pointer hover:shadow-2xl transition-all">
                    <div className="relative h-48 overflow-hidden">
                      <img src={team.image_url} alt={team.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <motion.div className="text-8xl" animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 3, repeat: Infinity }}>
                          {team.icon}
                        </motion.div>
                      </div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-2xl font-black text-white mb-1">{team.name}</h3>
                        <p className="text-sm text-white/80 font-bold">{team.name_en}</p>
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        <div className="text-center p-3 bg-green-50 rounded-xl">
                          <Users className="w-5 h-5 mx-auto mb-1 text-green-600" />
                          <p className="text-2xl font-black text-gray-900">{team.total_players || 0}</p>
                          <p className="text-xs text-gray-600 font-bold">Abakinnyi</p>
                        </div>
                        <div className="text-center p-3 bg-yellow-50 rounded-xl">
                          <Trophy className="w-5 h-5 mx-auto mb-1 text-yellow-600" />
                          <p className="text-2xl font-black text-gray-900">{team.total_achievements || 0}</p>
                          <p className="text-xs text-gray-600 font-bold">Ibihembo</p>
                        </div>
                        <div className="text-center p-3 bg-blue-50 rounded-xl">
                          <Star className="w-5 h-5 mx-auto mb-1 text-blue-600" />
                          <p className="text-2xl font-black text-gray-900">{team.total_wins || 0}</p>
                          <p className="text-xs text-gray-600 font-bold">Intsinzi</p>
                        </div>
                      </div>
                      <button className="w-full bg-gradient-to-r from-green-600 to-yellow-600 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2 group">
                        Reba Byose
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Upcoming Matches */}
            {upcomingMatches.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-6">
                  <h2 className="text-2xl font-black text-white flex items-center gap-3">
                    <Calendar className="w-8 h-8" />
                    Imikino Itegerejwe
                  </h2>
                </div>
                <div className="p-6 space-y-3">
                  {upcomingMatches.slice(0, 4).map((match, idx) => (
                    <motion.div key={idx} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl hover:shadow-md transition-all">
                      <div className="flex items-center gap-4">
                        <div className="text-4xl">{match.icon}</div>
                        <div>
                          <p className="font-black text-gray-900">{match.team_name} vs {match.opponent}</p>
                          <p className="text-sm text-gray-600 font-bold">{match.location_rw}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-blue-600">{new Date(match.match_date).toLocaleDateString()}</p>
                        <p className="text-sm text-gray-600 font-bold">{match.match_time}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Top Players Section - Full Width */}
        {topPlayers.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-purple-600 via-pink-600 to-purple-600 rounded-3xl shadow-2xl p-8">
            <h2 className="text-4xl font-black text-white mb-8 flex items-center gap-3">
              <Star className="w-10 h-10" />
              Abakinnyi Beza Cyane
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {topPlayers.slice(0, 12).map((player, idx) => (
                <motion.div key={player.id} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }} whileHover={{ scale: 1.05, y: -5 }}
                  className="bg-white rounded-2xl p-4 text-center shadow-lg hover:shadow-2xl transition-all">
                  <div className="relative mb-3">
                    <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-yellow-100 to-green-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                      {player.image_url ? (
                        <img src={`http://localhost:5000${player.image_url}`} alt={player.name} className="w-full h-full object-cover" />
                      ) : (
                        <Users className="w-10 h-10 text-gray-400" />
                      )}
                    </div>
                    {player.is_captain && (
                      <div className="absolute -top-2 -right-2 bg-yellow-500 rounded-full p-1.5 shadow-lg">
                        <Crown className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                  <h3 className="font-black text-gray-900 text-sm mb-1 line-clamp-1">{player.name_rw || player.name}</h3>
                  <p className="text-xs text-gray-600 font-bold mb-2">{player.position_rw}</p>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-2xl">{player.team_icon}</span>
                    <span className="bg-gradient-to-r from-green-600 to-yellow-600 text-white px-2 py-1 rounded-full text-xs font-black">
                      #{player.jersey_number}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* CTA Section */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="bg-gradient-to-r from-green-600 via-yellow-500 to-green-600 rounded-3xl p-12 text-center shadow-2xl">
          <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }} className="text-8xl mb-6">
            🏆
          </motion.div>
          <h3 className="text-4xl font-black text-white mb-4">Wifuza Kwinjira mu Kipe?</h3>
          <p className="text-xl text-white/90 mb-8 font-bold">Tanga ubushobozi bwawe kandi ube umwe mu bakinnyi bacu!</p>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            className="bg-white text-gray-900 px-12 py-5 rounded-2xl font-black text-xl shadow-2xl hover:shadow-3xl transition-all inline-flex items-center gap-3">
            <Users className="w-7 h-7" />
            Injira Ubu
            <ArrowRight className="w-7 h-7" />
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default BeautifulSportsPage;
