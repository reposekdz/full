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
  const [overviewContent, setOverviewContent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    Promise.all([
      fetch(`http://localhost:5000/api/sports/teams/${teamId}`).then(r => r.json()),
      fetch(`http://localhost:5000/api/sports/teams/${teamId}/overview`).then(r => r.json())
    ])
      .then(([teamData, overviewData]) => {
        if (teamData.success) setData(teamData);
        if (overviewData.success) setOverviewContent(overviewData.content);
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

  const { team, coach, coaches, players, achievements, recentMatches } = data;
  const isFootball = team.sport_type === 'football';
  const sportName = isFootball ? 'Football' : 'Volleyball';
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
              <h1 className="text-5xl font-black mb-2">{sportName} Team</h1>
              <p className="text-xl text-white/90">{team.name}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Coaches Section */}
        {coaches && coaches.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {coaches.map((coachItem: any, idx: number) => (
              <motion.div key={coachItem.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} className="bg-gradient-to-br from-white to-yellow-50 rounded-2xl shadow-2xl overflow-hidden">
                <div className={`bg-gradient-to-r ${gradient} p-6`}>
                  <h2 className="text-3xl font-black text-white flex items-center gap-3">
                    <Crown className="w-8 h-8" />
                    {idx === 0 ? (language === 'rw' ? 'Umutoza Mukuru' : 'Head Coach') : (language === 'rw' ? 'Umufasha w\'Umutoza' : 'Assistant Coach')}
                  </h2>
                </div>
                <div className="p-8">
                  <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="relative">
                      <div className="w-48 h-48 rounded-2xl bg-gradient-to-br from-yellow-100 to-green-100 flex items-center justify-center overflow-hidden shadow-xl">
                        {coachItem.image_url ? (
                          <img src={`http://localhost:5000${coachItem.image_url}`} alt={coachItem.name} className="w-full h-full object-cover" />
                        ) : (
                          <Users className="w-24 h-24 text-gray-400" />
                        )}
                      </div>
                      <div className="absolute -bottom-3 -right-3 bg-yellow-500 text-white rounded-full p-3 shadow-lg">
                        <Trophy className="w-6 h-6" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-3xl font-black text-gray-900 mb-2">{idx === 0 && isFootball ? 'Coach Chance Jotham' : (coachItem.name_rw || coachItem.name)}</h3>
                      <p className="text-xl text-gray-600 font-bold mb-4">{coachItem.role_rw || coachItem.role}</p>
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-green-50 rounded-lg p-4">
                          <p className="text-sm text-gray-600 mb-1">Uburambe</p>
                          <p className="text-2xl font-black text-green-600">{coachItem.experience_years} {language === 'rw' ? 'Imyaka' : 'Years'}</p>
                        </div>
                        <div className="bg-yellow-50 rounded-lg p-4">
                          <p className="text-sm text-gray-600 mb-1">Ibihembo</p>
                          <p className="text-2xl font-black text-yellow-600">{coachItem.achievements_count || achievements.length}</p>
                        </div>
                      </div>
                      {coachItem.bio_rw && (
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-gray-700 leading-relaxed">{coachItem.bio_rw}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-8 overflow-x-auto">
          {[
            { id: 'overview', label: language === 'rw' ? 'Incamake' : 'Overview', icon: Target },
            { id: 'players', label: language === 'rw' ? 'Abakinnyi' : 'Players', icon: Users },
            { id: 'achievements', label: language === 'rw' ? 'Ibihembo' : 'Achievements', icon: Trophy },
            { id: 'matches', label: language === 'rw' ? 'Imikino' : 'Matches', icon: Calendar },
            { id: 'stats', label: language === 'rw' ? 'Imibare' : 'Statistics', icon: TrendingUp },
            { id: 'gallery', label: language === 'rw' ? 'Amafoto' : 'Gallery', icon: Award }
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

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Dynamic Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {overviewContent.filter(c => c.content_type === 'stat').map((stat, index) => (
                <motion.div
                  key={stat.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-gradient-to-br from-white to-${stat.color}-50 rounded-2xl shadow-xl p-6 border-l-4 border-${stat.color}-500 hover:shadow-2xl transition-all`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-4xl">{stat.icon}</span>
                    <div className={`bg-${stat.color}-100 text-${stat.color}-600 px-3 py-1 rounded-full text-xs font-bold`}>
                      {language === 'rw' ? 'Imibare' : 'Stats'}
                    </div>
                  </div>
                  <h3 className="text-sm text-gray-600 mb-2">{language === 'rw' ? stat.title_rw : stat.title}</h3>
                  <p className="text-4xl font-black text-gray-900 mb-2">{stat.value}</p>
                  <p className="text-xs text-gray-500">{language === 'rw' ? stat.description_rw : stat.description}</p>
                </motion.div>
              ))}
            </div>

            {/* Highlights Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {overviewContent.filter(c => c.content_type === 'highlight').map((highlight, index) => (
                <motion.div
                  key={highlight.id}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.15 }}
                  className="bg-gradient-to-br from-yellow-400 via-green-400 to-yellow-500 rounded-2xl shadow-2xl p-8 text-white overflow-hidden relative"
                >
                  <div className="absolute top-0 right-0 text-9xl opacity-10">{highlight.icon}</div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-5xl">{highlight.icon}</span>
                      <div>
                        <h3 className="text-2xl font-black">{language === 'rw' ? highlight.title_rw : highlight.title}</h3>
                        {highlight.value && <p className="text-3xl font-black mt-1">{highlight.value}</p>}
                      </div>
                    </div>
                    <p className="text-lg font-bold text-white/90">{language === 'rw' ? highlight.description_rw : highlight.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Milestones Timeline */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-3xl font-black text-gray-900 mb-8 flex items-center gap-3">
                <Target className="w-8 h-8 text-green-600" />
                {language === 'rw' ? 'Intego Zagezweho' : 'Milestones Achieved'}
              </h3>
              <div className="space-y-6">
                {overviewContent.filter(c => c.content_type === 'milestone').map((milestone, index) => (
                  <motion.div
                    key={milestone.id}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-6 p-6 bg-gradient-to-r from-green-50 to-yellow-50 rounded-xl hover:shadow-lg transition-all"
                  >
                    <div className="text-6xl">{milestone.icon}</div>
                    <div className="flex-1">
                      <h4 className="text-2xl font-black text-gray-900 mb-2">{language === 'rw' ? milestone.title_rw : milestone.title}</h4>
                      <p className="text-gray-700 text-lg mb-2">{language === 'rw' ? milestone.description_rw : milestone.description}</p>
                      {milestone.value && (
                        <div className="inline-block bg-gradient-to-r from-green-600 to-yellow-600 text-white px-6 py-2 rounded-full font-black text-xl">
                          {milestone.value}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Quotes/Motivation */}
            {overviewContent.filter(c => c.content_type === 'quote').length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {overviewContent.filter(c => c.content_type === 'quote').map((quote, index) => (
                  <motion.div
                    key={quote.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-2xl p-8 text-white relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 text-9xl opacity-10">"</div>
                    <div className="relative z-10">
                      <span className="text-4xl mb-4 block">{quote.icon}</span>
                      <h4 className="text-2xl font-black mb-3">{language === 'rw' ? quote.title_rw : quote.title}</h4>
                      <p className="text-xl font-bold italic">"{language === 'rw' ? quote.description_rw : quote.description}"</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Image Gallery */}
            {overviewContent.filter(c => c.content_type === 'image' && c.image_url).length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h3 className="text-3xl font-black text-gray-900 mb-6 flex items-center gap-3">
                  <Award className="w-8 h-8 text-yellow-600" />
                  {language === 'rw' ? 'Amafoto y\'Ikipe' : 'Team Gallery'}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {overviewContent.filter(c => c.content_type === 'image' && c.image_url).map((img, index) => (
                    <motion.div
                      key={img.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="aspect-square rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all cursor-pointer group"
                    >
                      <img
                        src={`http://localhost:5000${img.image_url}`}
                        alt={img.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Form */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-3xl font-black text-gray-900 mb-6 flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-blue-600" />
                {language === 'rw' ? 'Imikorere Iheruka' : 'Recent Form'}
              </h3>
              <div className="flex flex-wrap gap-3">
                {recentMatches.slice(0, 15).map((match: any, i: number) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className={`w-16 h-16 rounded-xl flex items-center justify-center font-black text-2xl text-white shadow-lg hover:scale-110 transition-transform ${
                      match.result === 'win' ? 'bg-gradient-to-br from-green-500 to-green-600' :
                      match.result === 'loss' ? 'bg-gradient-to-br from-red-500 to-red-600' :
                      'bg-gradient-to-br from-gray-400 to-gray-500'
                    }`}
                  >
                    {match.result === 'win' ? 'W' : match.result === 'loss' ? 'L' : 'D'}
                  </motion.div>
                ))}
              </div>
              <div className="mt-6 grid grid-cols-3 gap-4">
                <div className="bg-green-50 rounded-xl p-4 text-center">
                  <p className="text-sm text-gray-600 mb-1">{language === 'rw' ? 'Intsinzi' : 'Wins'}</p>
                  <p className="text-3xl font-black text-green-600">{recentMatches.filter((m: any) => m.result === 'win').length}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-sm text-gray-600 mb-1">{language === 'rw' ? 'Ikigwi' : 'Draws'}</p>
                  <p className="text-3xl font-black text-gray-600">{recentMatches.filter((m: any) => m.result === 'draw').length}</p>
                </div>
                <div className="bg-red-50 rounded-xl p-4 text-center">
                  <p className="text-sm text-gray-600 mb-1">{language === 'rw' ? 'Gutsindwa' : 'Losses'}</p>
                  <p className="text-3xl font-black text-red-600">{recentMatches.filter((m: any) => m.result === 'loss').length}</p>
                </div>
              </div>
            </div>

            {/* Announcements */}
            {overviewContent.filter(c => c.content_type === 'announcement').length > 0 && (
              <div className="space-y-4">
                {overviewContent.filter(c => c.content_type === 'announcement').map((announcement, index) => (
                  <motion.div
                    key={announcement.id}
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl shadow-xl p-6 text-white flex items-center gap-6"
                  >
                    <span className="text-5xl">{announcement.icon}</span>
                    <div className="flex-1">
                      <h4 className="text-2xl font-black mb-2">{language === 'rw' ? announcement.title_rw : announcement.title}</h4>
                      <p className="text-lg font-bold">{language === 'rw' ? announcement.description_rw : announcement.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Players Tab */}
        {activeTab === 'players' && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className={`bg-gradient-to-r ${gradient} p-6`}>
              <h2 className="text-2xl font-black text-white flex items-center gap-3">
                <Users className="w-6 h-6" />
                Urutonde rw'Abakinnyi ({players.length})
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-black text-gray-700">#</th>
                    <th className="px-6 py-4 text-left text-sm font-black text-gray-700">Ifoto</th>
                    <th className="px-6 py-4 text-left text-sm font-black text-gray-700">Izina</th>
                    <th className="px-6 py-4 text-left text-sm font-black text-gray-700">Umwanya</th>
                    <th className="px-6 py-4 text-left text-sm font-black text-gray-700">Ikilas</th>
                    <th className="px-6 py-4 text-left text-sm font-black text-gray-700">Uburebure</th>
                    <th className="px-6 py-4 text-left text-sm font-black text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {players.map((player: any, index: number) => (
                    <motion.tr
                      key={player.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-yellow-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-green-400 flex items-center justify-center text-white font-black shadow-lg">
                          {player.jersey_number}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-yellow-100 to-green-100 flex items-center justify-center overflow-hidden shadow-md">
                          {player.image_url ? (
                            <img src={`http://localhost:5000${player.image_url}`} alt={player.name} className="w-full h-full object-cover" />
                          ) : (
                            <Users className="w-8 h-8 text-gray-400" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div>
                            <p className="font-black text-gray-900">{player.name_rw || player.name}</p>
                            <p className="text-sm text-gray-500">{player.name}</p>
                          </div>
                          {player.is_captain && (
                            <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                              <Crown className="w-3 h-3" /> C
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold">
                          {player.position_rw || player.position}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-700 font-bold">{player.class}</td>
                      <td className="px-6 py-4 text-gray-700 font-bold">{player.height} cm</td>
                      <td className="px-6 py-4">
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold">
                          Active
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
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

        {/* Statistics Tab */}
        {activeTab === 'stats' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Match Statistics</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Wins</span>
                      <span className="font-bold text-green-600">{recentMatches.filter((m: any) => m.result === 'win').length}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: `${(recentMatches.filter((m: any) => m.result === 'win').length / recentMatches.length) * 100}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Draws</span>
                      <span className="font-bold text-gray-600">{recentMatches.filter((m: any) => m.result === 'draw').length}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-gray-600 h-2 rounded-full" style={{ width: `${(recentMatches.filter((m: any) => m.result === 'draw').length / recentMatches.length) * 100}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Losses</span>
                      <span className="font-bold text-red-600">{recentMatches.filter((m: any) => m.result === 'loss').length}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-red-600 h-2 rounded-full" style={{ width: `${(recentMatches.filter((m: any) => m.result === 'loss').length / recentMatches.length) * 100}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Scoring Statistics</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                    <span className="text-gray-700 font-medium">Total Goals Scored</span>
                    <span className="text-2xl font-black text-blue-600">{recentMatches.reduce((sum: number, m: any) => sum + m.our_score, 0)}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-red-50 rounded-lg">
                    <span className="text-gray-700 font-medium">Total Goals Conceded</span>
                    <span className="text-2xl font-black text-red-600">{recentMatches.reduce((sum: number, m: any) => sum + m.opponent_score, 0)}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                    <span className="text-gray-700 font-medium">Goal Difference</span>
                    <span className="text-2xl font-black text-green-600">+{recentMatches.reduce((sum: number, m: any) => sum + (m.our_score - m.opponent_score), 0)}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-yellow-50 rounded-lg">
                    <span className="text-gray-700 font-medium">Avg Goals Per Match</span>
                    <span className="text-2xl font-black text-yellow-600">{(recentMatches.reduce((sum: number, m: any) => sum + m.our_score, 0) / recentMatches.length).toFixed(1)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Player Statistics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-gradient-to-br from-yellow-50 to-green-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Total Squad</p>
                  <p className="text-3xl font-black text-gray-900">{players.length}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-green-50 to-yellow-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Average Height</p>
                  <p className="text-3xl font-black text-gray-900">{(players.reduce((sum: number, p: any) => sum + p.height, 0) / players.length).toFixed(0)} cm</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-yellow-50 to-green-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Team Captain</p>
                  <p className="text-lg font-black text-gray-900">{players.find((p: any) => p.is_captain)?.name || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Gallery Tab */}
        {activeTab === 'gallery' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Team Gallery</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {achievements.map((achievement: any, index: number) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="aspect-square rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all cursor-pointer"
                >
                  <div className="w-full h-full bg-gradient-to-br from-yellow-100 to-green-100 flex items-center justify-center text-6xl">
                    {achievement.icon}
                  </div>
                </motion.div>
              ))}
              {players.slice(0, 8).map((player: any, index: number) => (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: (achievements.length + index) * 0.1 }}
                  className="aspect-square rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all cursor-pointer"
                >
                  {player.image_url ? (
                    <img src={`http://localhost:5000${player.image_url}`} alt={player.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-green-100 to-yellow-100 flex items-center justify-center">
                      <Users className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamDetailPage;
