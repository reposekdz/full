import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Trophy, Users, Star, Calendar, MapPin, Award, TrendingUp, Target, Zap, Crown, Shield } from 'lucide-react';
import { useLanguage } from '@/app/contexts/LanguageContext';

interface TeamDetailPageProps {
  teamId: string;
  onNavigate: (page: string) => void;
}

const TeamDetailPage: React.FC<TeamDetailPageProps> = ({ teamId, onNavigate }) => {
  const { language } = useLanguage();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('players');

  useEffect(() => {
    fetch(`http://localhost:5000/api/sports/teams/${teamId}`)
      .then(res => res.json())
      .then(result => {
        if (result.success) setData(result);
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

  const { team, coach, players, achievements, recentMatches } = data;
  const isFootball = team.sport_type === 'football';
  const gradient = isFootball ? 'from-yellow-400 via-green-400 to-yellow-500' : 'from-green-400 via-yellow-400 to-green-500';

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-green-50">
      {/* Header */}
      <div className={`bg-gradient-to-r ${gradient} text-white py-12`}>
        <div className="max-w-7xl mx-auto px-4">
          <button onClick={() => onNavigate('sports')} className="flex items-center gap-2 text-white/90 hover:text-white mb-6 font-bold">
            <ArrowLeft className="w-5 h-5" /> Subira ku Makipe
          </button>
          
          <div className="flex items-center gap-6">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-8xl">
              {team.icon}
            </motion.div>
            <div>
              <h1 className="text-5xl font-black mb-2">{team.name}</h1>
              <p className="text-xl text-white/90">{team.name_en}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Coach Section */}
        {coach && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h2 className="text-3xl font-black text-gray-900 mb-6 flex items-center gap-3">
              <Crown className="w-8 h-8 text-yellow-600" />
              {language === 'rw' ? 'Umutoza' : 'Coach'}
            </h2>
            <div className="flex items-center gap-6">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-yellow-100 to-green-100 flex items-center justify-center overflow-hidden">
                {coach.image_url ? (
                  <img src={`http://localhost:5000${coach.image_url}`} alt={coach.name} className="w-full h-full object-cover" />
                ) : (
                  <Users className="w-16 h-16 text-gray-400" />
                )}
              </div>
              <div>
                <h3 className="text-2xl font-black text-gray-900">{coach.name_rw || coach.name}</h3>
                <p className="text-lg text-gray-600 font-bold">{coach.role_rw || coach.role}</p>
                <p className="text-gray-500 mt-2">{coach.experience_years} {language === 'rw' ? 'imyaka y\'uburambe' : 'years experience'}</p>
                {coach.bio_rw && <p className="text-gray-700 mt-3">{coach.bio_rw}</p>}
              </div>
            </div>
          </motion.div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          {[
            { id: 'players', label: language === 'rw' ? 'Abakinnyi' : 'Players', icon: Users },
            { id: 'achievements', label: language === 'rw' ? 'Ibihembo' : 'Achievements', icon: Trophy },
            { id: 'matches', label: language === 'rw' ? 'Imikino' : 'Matches', icon: Calendar }
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

        {/* Players Tab */}
        {activeTab === 'players' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {players.map((player: any, index: number) => (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all"
              >
                <div className="relative h-48 bg-gradient-to-br from-yellow-100 to-green-100 flex items-center justify-center">
                  {player.image_url ? (
                    <img src={`http://localhost:5000${player.image_url}`} alt={player.name} className="w-full h-full object-cover" />
                  ) : (
                    <Users className="w-20 h-20 text-gray-400" />
                  )}
                  <div className="absolute top-3 right-3 bg-white rounded-full w-12 h-12 flex items-center justify-center font-black text-xl shadow-lg">
                    {player.jersey_number}
                  </div>
                  {player.is_captain && (
                    <div className="absolute top-3 left-3 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                      <Crown className="w-3 h-3" /> Captain
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-black text-gray-900">{player.name_rw || player.name}</h3>
                  <p className="text-sm text-gray-600 font-bold">{player.position_rw || player.position}</p>
                  <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                    <span>{player.class}</span>
                    <span>{player.height}cm</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Achievements Tab */}
        {activeTab === 'achievements' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {achievements.map((achievement: any, index: number) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="text-5xl">{achievement.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-black text-gray-900 mb-2">{achievement.title_rw || achievement.title}</h3>
                    <p className="text-gray-600 mb-3">{achievement.description_rw}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(achievement.achievement_date).toLocaleDateString()}
                      </span>
                      <span className="font-bold text-yellow-600">Position: {achievement.position}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2 font-bold">{achievement.competition_name_rw || achievement.competition_name}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Matches Tab */}
        {activeTab === 'matches' && (
          <div className="space-y-4">
            {recentMatches.map((match: any, index: number) => (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-sm text-gray-500 mb-1">{new Date(match.match_date).toLocaleDateString()}</p>
                      <p className="text-xs text-gray-400">{match.match_time}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-black text-gray-900">Garden TVET</p>
                        <p className="text-3xl font-black text-green-600">{match.our_score}</p>
                      </div>
                      <div className="text-2xl font-black text-gray-400">-</div>
                      <div>
                        <p className="font-black text-gray-900">{match.opponent}</p>
                        <p className="text-3xl font-black text-gray-600">{match.opponent_score}</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <span className={`px-4 py-2 rounded-full font-bold text-sm ${
                      match.result === 'win' ? 'bg-green-100 text-green-700' :
                      match.result === 'loss' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {match.result === 'win' ? '🏆 Twatsindiye' : match.result === 'loss' ? '❌ Twatsindiwe' : '🤝 Ikigwi'}
                    </span>
                    <p className="text-xs text-gray-500 mt-2 text-center">{match.location_rw || match.location}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamDetailPage;
