import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Users, Target, ArrowLeft, Shield, Star, Calendar, MapPin, Clock, TrendingUp, Award } from 'lucide-react';
import { Card, CardContent } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';

interface TeamDetailPageProps {
  teamId: number;
  onBack: () => void;
}

const TeamDetailPage: React.FC<TeamDetailPageProps> = ({ teamId, onBack }) => {
  const [team, setTeam] = useState<any>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [coaches, setCoaches] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [upcomingMatches, setUpcomingMatches] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('players');

  useEffect(() => {
    fetchTeamData();
  }, [teamId]);

  const fetchTeamData = async () => {
    try {
      const [teamRes, playersRes, coachesRes, matchesRes, upcomingRes, goalsRes, statsRes] = await Promise.all([
        fetch(`http://localhost:5000/api/sports/teams/${teamId}`),
        fetch(`http://localhost:5000/api/sports-players/players?team_id=${teamId}`),
        fetch('http://localhost:5000/api/services-advanced/coaches'),
        fetch(`http://localhost:5000/api/sports/matches?team_id=${teamId}&upcoming=false`),
        fetch(`http://localhost:5000/api/sports/matches?team_id=${teamId}&upcoming=true`),
        fetch(`http://localhost:5000/api/sports-players/goals?team_id=${teamId}`),
        fetch(`http://localhost:5000/api/sports-players/teams/${teamId}/stats`)
      ]);

      const teamData = await teamRes.json();
      const playersData = await playersRes.json();
      const coachesData = await coachesRes.json();
      const matchesData = await matchesRes.json();
      const upcomingData = await upcomingRes.json();
      const goalsData = await goalsRes.json();
      const statsData = await statsRes.json();

      setTeam(teamData);
      setPlayers(Array.isArray(playersData) ? playersData : []);
      setCoaches(Array.isArray(coachesData) ? coachesData.filter(c => c.sport === teamData.sport) : []);
      setMatches(Array.isArray(matchesData) ? matchesData : []);
      setUpcomingMatches(Array.isArray(upcomingData) ? upcomingData : []);
      setGoals(Array.isArray(goalsData) ? goalsData : []);
      setStats(statsData);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !team) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 via-yellow-400 to-emerald-500 flex items-center justify-center">
        <div className="text-center">
          <Trophy className="w-20 h-20 animate-spin text-white mx-auto mb-4" />
          <p className="text-2xl font-black text-white">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-emerald-50">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-green-600 via-yellow-500 to-emerald-600 text-white py-16 px-4 shadow-2xl">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-96 h-96 bg-yellow-400 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-green-400 rounded-full blur-3xl animate-pulse"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <Button onClick={onBack} variant="ghost" className="text-white hover:bg-white/20 mb-6 font-bold">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Subira
          </Button>

          <div className="flex flex-col md:flex-row items-center gap-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="w-32 h-32 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-2xl"
            >
              <Trophy className="w-20 h-20 text-white" />
            </motion.div>

            <div className="flex-1 text-center md:text-left">
              <h1 className="text-6xl font-black mb-4">{team.name}</h1>
              <Badge className="bg-white text-green-900 text-xl px-6 py-3 mb-4">
                {team.sport}
              </Badge>
              <p className="text-2xl font-bold text-white/95">{team.description_rw}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 text-center">
                <p className="text-5xl font-black">{team.wins || 0}</p>
                <p className="text-sm font-bold uppercase">Intsinzi</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 text-center">
                <p className="text-5xl font-black">{stats?.stats?.total_goals || 0}</p>
                <p className="text-sm font-bold uppercase">Ibitego</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 text-center">
                <p className="text-5xl font-black">{players.length}</p>
                <p className="text-sm font-bold uppercase">Abakinnyi</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 text-center">
                <p className="text-5xl font-black">{matches.length}</p>
                <p className="text-sm font-bold uppercase">Imikino</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
          {['players', 'coaches', 'matches', 'upcoming', 'goals', 'stats'].map((tab) => (
            <Button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`h-14 px-8 text-lg font-black whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-green-600 via-yellow-500 to-emerald-600 text-white shadow-2xl'
                  : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-green-400'
              }`}
            >
              {tab === 'players' ? 'Abakinnyi' : 
               tab === 'coaches' ? 'Abatoza' :
               tab === 'matches' ? 'Imikino Yakinnye' :
               tab === 'upcoming' ? 'Imikino Izaza' :
               tab === 'goals' ? 'Ibitego' : 'Imibare'}
            </Button>
          ))}
        </div>

        {/* Players Tab */}
        {activeTab === 'players' && (
          <div>
            <h2 className="text-4xl font-black text-gray-900 mb-6">Abakinnyi / Players</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {players.map((player, index) => (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="border-0 shadow-xl bg-gradient-to-br from-white via-green-50 to-yellow-50 hover:shadow-2xl transition-all">
                    <div className="h-2 bg-gradient-to-r from-green-500 to-yellow-500"></div>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-yellow-400 rounded-full flex items-center justify-center text-white text-3xl font-black shadow-xl">
                          {player.jersey_number}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-black text-gray-900 mb-1">{player.name}</h3>
                          {player.is_captain && (
                            <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white mb-2">
                              <Star className="w-3 h-3 mr-1" />
                              KAPITENI
                            </Badge>
                          )}
                          <p className="text-sm font-bold text-green-600">{player.position}</p>
                          <p className="text-xs text-gray-600">{player.class}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center">
                        {team.sport === 'Football' && (
                          <>
                            <div className="bg-green-100 rounded-lg p-2">
                              <p className="text-2xl font-black text-green-700">{player.goals_scored}</p>
                              <p className="text-xs text-gray-600">Ibitego</p>
                            </div>
                            <div className="bg-yellow-100 rounded-lg p-2">
                              <p className="text-2xl font-black text-yellow-700">{player.assists}</p>
                              <p className="text-xs text-gray-600">Assists</p>
                            </div>
                          </>
                        )}
                        <div className="bg-emerald-100 rounded-lg p-2">
                          <p className="text-2xl font-black text-emerald-700">{player.matches_played}</p>
                          <p className="text-xs text-gray-600">Imikino</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Coaches Tab */}
        {activeTab === 'coaches' && (
          <div>
            <h2 className="text-4xl font-black text-gray-900 mb-6">Abatoza / Coaches</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {coaches.map((coach, index) => (
                <motion.div
                  key={coach.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="border-0 shadow-2xl bg-gradient-to-br from-white to-green-50">
                    <div className="h-3 bg-gradient-to-r from-green-500 to-yellow-500"></div>
                    <CardContent className="p-8">
                      <div className="flex gap-6 mb-6">
                        {coach.image_url ? (
                          <img src={`http://localhost:5000${coach.image_url}`} alt={coach.name} className="w-32 h-32 rounded-full object-cover border-4 border-green-200 shadow-xl" />
                        ) : (
                          <div className="w-32 h-32 bg-gradient-to-br from-green-400 to-yellow-400 rounded-full flex items-center justify-center shadow-xl">
                            <Shield className="w-16 h-16 text-white" />
                          </div>
                        )}
                        <div className="flex-1">
                          <h3 className="text-3xl font-black text-gray-900 mb-2">{coach.name}</h3>
                          <Badge className="bg-gradient-to-r from-green-600 to-yellow-500 text-white text-base px-4 py-2 mb-3">
                            {coach.sport}
                          </Badge>
                          <p className="text-gray-700 font-bold">{coach.title}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-green-100 rounded-xl p-4 text-center">
                          <p className="text-3xl font-black text-green-700">{coach.experience_years}</p>
                          <p className="text-sm text-gray-700 font-bold">Imyaka</p>
                        </div>
                        <div className="bg-yellow-100 rounded-xl p-4 text-center">
                          <p className="text-3xl font-black text-yellow-700">{JSON.parse(coach.achievements || '[]').length}</p>
                          <p className="text-sm text-gray-700 font-bold">Ibihembo</p>
                        </div>
                      </div>
                      <p className="text-gray-700 leading-relaxed line-clamp-4">{coach.bio_rw}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Matches Tab */}
        {activeTab === 'matches' && (
          <div>
            <h2 className="text-4xl font-black text-gray-900 mb-6">Imikino Yakinnye / Past Matches</h2>
            <div className="space-y-4">
              {matches.map((match, index) => (
                <motion.div
                  key={match.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className={`border-0 shadow-xl ${
                    match.result === 'win' ? 'bg-gradient-to-r from-green-100 to-emerald-100' :
                    match.result === 'loss' ? 'bg-gradient-to-r from-red-100 to-pink-100' :
                    'bg-gradient-to-r from-yellow-100 to-amber-100'
                  }`}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <Badge className={`mb-3 text-white text-sm px-4 py-1 ${
                            match.result === 'win' ? 'bg-gradient-to-r from-green-600 to-emerald-600' :
                            match.result === 'loss' ? 'bg-gradient-to-r from-red-600 to-pink-600' :
                            'bg-gradient-to-r from-yellow-600 to-amber-600'
                          }`}>
                            {match.result === 'win' ? '🏆 INTSINZI' : match.result === 'loss' ? '❌ GUTSINDWA' : '🤝 KURINGANIZA'}
                          </Badge>
                          <h3 className="text-2xl font-black text-gray-900 mb-3">{team.name} vs {match.opponent}</h3>
                          <div className="flex items-center space-x-6 text-sm text-gray-700">
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4" />
                              <span className="font-bold">{match.match_date}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <MapPin className="w-4 h-4" />
                              <span className="font-bold">{match.venue}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right ml-6">
                          <p className="text-5xl font-black text-gray-900">{match.score}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Matches Tab */}
        {activeTab === 'upcoming' && (
          <div>
            <h2 className="text-4xl font-black text-gray-900 mb-6">Imikino Izaza / Upcoming Matches</h2>
            <div className="space-y-4">
              {upcomingMatches.map((match, index) => (
                <motion.div
                  key={match.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-indigo-50">
                    <CardContent className="p-6">
                      <Badge className="mb-3 bg-gradient-to-r from-green-600 to-yellow-500 text-white text-sm px-4 py-1">
                        UPCOMING
                      </Badge>
                      <h3 className="text-3xl font-black text-gray-900 mb-4">{team.name} vs {match.opponent}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-3 bg-white rounded-lg p-4">
                          <Calendar className="w-6 h-6 text-green-600" />
                          <div>
                            <p className="text-xs text-gray-600">Itariki</p>
                            <p className="font-black text-gray-900">{match.match_date}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 bg-white rounded-lg p-4">
                          <Clock className="w-6 h-6 text-green-600" />
                          <div>
                            <p className="text-xs text-gray-600">Isaha</p>
                            <p className="font-black text-gray-900">{match.match_time}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 bg-white rounded-lg p-4">
                          <MapPin className="w-6 h-6 text-green-600" />
                          <div>
                            <p className="text-xs text-gray-600">Aho</p>
                            <p className="font-black text-gray-900">{match.venue}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Goals Tab */}
        {activeTab === 'goals' && team.sport === 'Football' && (
          <div>
            <h2 className="text-4xl font-black text-gray-900 mb-6">Ibitego / Goals</h2>
            <div className="space-y-3">
              {goals.map((goal, index) => (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="border-0 shadow-lg bg-gradient-to-r from-yellow-50 to-orange-50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white text-2xl font-black shadow-xl">
                            {goal.jersey_number}
                          </div>
                          <div>
                            <h4 className="text-xl font-black text-gray-900">{goal.player_name}</h4>
                            <p className="text-sm text-gray-600">vs {goal.opponent} • {goal.match_date}</p>
                            {goal.assist_name && (
                              <p className="text-xs text-gray-500">Assist: {goal.assist_name}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className="bg-gradient-to-r from-green-600 to-yellow-500 text-white text-lg px-4 py-2">
                            {goal.minute}'
                          </Badge>
                          <p className="text-xs text-gray-600 mt-1">{goal.goal_type}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Stats Tab */}
        {activeTab === 'stats' && (
          <div>
            <h2 className="text-4xl font-black text-gray-900 mb-6">Imibare / Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Card className="border-0 shadow-2xl bg-gradient-to-br from-green-50 to-emerald-50">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center">
                    <TrendingUp className="w-7 h-7 mr-3 text-green-600" />
                    Team Overview
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-white rounded-xl">
                      <span className="font-bold text-gray-700">Total Players</span>
                      <span className="text-3xl font-black text-green-600">{stats?.stats?.total_players || 0}</span>
                    </div>
                    {team.sport === 'Football' && (
                      <>
                        <div className="flex justify-between items-center p-4 bg-white rounded-xl">
                          <span className="font-bold text-gray-700">Total Goals</span>
                          <span className="text-3xl font-black text-yellow-600">{stats?.stats?.total_goals || 0}</span>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-white rounded-xl">
                          <span className="font-bold text-gray-700">Total Assists</span>
                          <span className="text-3xl font-black text-orange-600">{stats?.stats?.total_assists || 0}</span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between items-center p-4 bg-white rounded-xl">
                      <span className="font-bold text-gray-700">Average Age</span>
                      <span className="text-3xl font-black text-emerald-600">{parseFloat(stats?.stats?.avg_age || 0).toFixed(1)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {team.sport === 'Football' && stats?.topScorers && (
                <Card className="border-0 shadow-2xl bg-gradient-to-br from-yellow-50 to-orange-50">
                  <CardContent className="p-8">
                    <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center">
                      <Trophy className="w-7 h-7 mr-3 text-yellow-600" />
                      Top Scorers
                    </h3>
                    <div className="space-y-3">
                      {stats.topScorers.map((player: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-white rounded-xl">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-black">
                              {player.jersey_number}
                            </div>
                            <div>
                              <p className="font-black text-gray-900">{player.name}</p>
                              <p className="text-xs text-gray-600">{player.position}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-black text-yellow-600">{player.goals_scored}</p>
                            <p className="text-xs text-gray-600">{player.assists} assists</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamDetailPage;
