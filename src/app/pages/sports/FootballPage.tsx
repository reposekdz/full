import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Trophy, Users, Target, TrendingUp, Calendar, Clock, MapPin, Award, Star, ChevronLeft, Play, Share2, Heart, Download, BarChart3, Activity, Zap, Shield } from 'lucide-react';
import { Card, CardContent } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Progress } from '@/app/components/ui/progress';
import { Input } from '@/app/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';

interface FootballPageProps {
  onNavigate: (page: string) => void;
}

const FootballPage: React.FC<FootballPageProps> = ({ onNavigate }) => {
  const [filterPosition, setFilterPosition] = useState('all');
  const [players, setPlayers] = useState<any[]>([]);
  const [coaches, setCoaches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/sports/teams/1')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          if (data.players) {
            const mappedPlayers = data.players.map((p: any) => ({
              id: p.id,
              name: p.name,
              position: p.position,
              number: p.jersey_number,
              goals: Math.floor(Math.random() * 15),
              assists: Math.floor(Math.random() * 12),
              matches: Math.floor(Math.random() * 10) + 15,
              rating: (Math.random() * 1.5 + 7.5).toFixed(1),
              image: `http://localhost:5000${p.image_url}`,
              captain: p.is_captain === 1
            }));
            setPlayers(mappedPlayers);
          }
          if (data.coaches) {
            const mappedCoaches = data.coaches.map((c: any) => ({
              id: c.id,
              name: c.name,
              role: c.role,
              image: `http://localhost:5000${c.image_url}`,
              experience: c.experience_years,
              bio: c.bio
            }));
            setCoaches(mappedCoaches);
          }
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const matches = [
    { id: 1, opponent: 'Lycée de Kigali', date: '2024-03-01', time: '14:00', location: 'Amahoro Stadium', status: 'upcoming', homeScore: null, awayScore: null, competition: 'Inter-School Championship' },
    { id: 2, opponent: 'IPRC Kigali', date: '2024-02-20', time: '15:00', location: 'School Field', status: 'completed', homeScore: 3, awayScore: 1, competition: 'Friendly Match' },
    { id: 3, opponent: 'GS Remera', date: '2024-02-15', time: '16:00', location: 'Nyamirambo Stadium', status: 'completed', homeScore: 2, awayScore: 2, competition: 'League Match' },
    { id: 4, opponent: 'FAWE Girls', date: '2024-02-10', time: '14:30', location: 'Kicukiro Ground', status: 'completed', homeScore: 4, awayScore: 0, competition: 'Cup Match' },
  ];

  const stats = [
    { label: 'Total Goals', value: '42', icon: Target, color: 'from-green-500 to-emerald-500', trend: '+12%' },
    { label: 'Matches Played', value: '22', icon: Trophy, color: 'from-blue-500 to-indigo-500', trend: '100%' },
    { label: 'Win Rate', value: '68%', icon: TrendingUp, color: 'from-yellow-500 to-orange-500', trend: '+8%' },
    { label: 'Team Rating', value: '8.1', icon: Star, color: 'from-purple-500 to-pink-500', trend: '+0.3' },
  ];

  const topScorers = players.filter(p => p.goals > 0).sort((a, b) => b.goals - a.goals).slice(0, 5);
  const topAssisters = players.filter(p => p.assists > 0).sort((a, b) => b.assists - a.assists).slice(0, 5);
  const filteredPlayers = filterPosition === 'all' ? players : players.filter(p => p.position === filterPosition);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading players...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <Button variant="ghost" onClick={() => onNavigate('sports')} className="mb-6">
            <ChevronLeft className="w-5 h-5 mr-2" /> Back to Sports
          </Button>

          <div className="relative h-96 rounded-3xl overflow-hidden mb-8 shadow-2xl">
            <img src="http://localhost:5000/uploads/sports/foot ball team.png" alt="Football Team" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border-4 border-white/50">
                  <Trophy className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h1 className="text-5xl font-black text-white mb-2">Football Team</h1>
                  <p className="text-xl text-green-200 font-semibold">Garden TVET Champions</p>
                </div>
              </div>
              <div className="flex items-center space-x-6">
                <Button className="bg-white text-green-600 hover:bg-green-50 font-bold">
                  <Play className="w-4 h-4 mr-2" /> Watch Highlights
                </Button>
                <Button variant="outline" className="border-white text-white hover:bg-white/20">
                  <Share2 className="w-4 h-4 mr-2" /> Share
                </Button>
                <Button variant="outline" className="border-white text-white hover:bg-white/20">
                  <Heart className="w-4 h-4 mr-2" /> Follow
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <motion.div key={index} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.1 }}>
                <Card className="border-2 border-green-200 hover:shadow-xl transition-all">
                  <CardContent className="p-6">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mx-auto mb-4`}>
                      <stat.icon className="w-7 h-7 text-white" />
                    </div>
                    <p className="text-4xl font-black text-gray-900 text-center mb-2">{stat.value}</p>
                    <p className="text-sm font-semibold text-gray-600 text-center">{stat.label}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <Tabs defaultValue="overview" className="mb-8">
            <TabsList className="grid w-full grid-cols-7 h-14 bg-white border-2 border-green-200 rounded-2xl p-1">
              <TabsTrigger value="overview" className="font-bold">Overview</TabsTrigger>
              <TabsTrigger value="coaches" className="font-bold">Coaches</TabsTrigger>
              <TabsTrigger value="players" className="font-bold">Players</TabsTrigger>
              <TabsTrigger value="matches" className="font-bold">Matches</TabsTrigger>
              <TabsTrigger value="statistics" className="font-bold">Statistics</TabsTrigger>
              <TabsTrigger value="achievements" className="font-bold">Achievements</TabsTrigger>
              <TabsTrigger value="gallery" className="font-bold">Gallery</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-2 border-green-200">
                  <CardContent className="p-6">
                    <h3 className="text-2xl font-black text-gray-900 mb-4 flex items-center">
                      <Activity className="w-6 h-6 mr-2 text-green-600" /> Team Performance
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="font-semibold">Attack</span>
                          <span className="font-black text-green-600">85%</span>
                        </div>
                        <Progress value={85} className="h-3" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="font-semibold">Defense</span>
                          <span className="font-black text-blue-600">78%</span>
                        </div>
                        <Progress value={78} className="h-3" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="font-semibold">Midfield</span>
                          <span className="font-black text-purple-600">82%</span>
                        </div>
                        <Progress value={82} className="h-3" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-2 border-blue-200">
                  <CardContent className="p-6">
                    <h3 className="text-2xl font-black text-gray-900 mb-4 flex items-center">
                      <Zap className="w-6 h-6 mr-2 text-blue-600" /> Quick Stats
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                        <span className="font-semibold">Clean Sheets</span>
                        <span className="text-2xl font-black text-green-600">8</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                        <span className="font-semibold">Penalties</span>
                        <span className="text-2xl font-black text-blue-600">12</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                        <span className="font-semibold">Corners</span>
                        <span className="text-2xl font-black text-yellow-600">45</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="coaches" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {coaches.map((coach, index) => (
                  <motion.div key={coach.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                    <Card className="border-2 border-green-200 hover:shadow-2xl transition-all">
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-6">
                          <div className="w-32 h-32 rounded-full border-4 border-green-300 overflow-hidden flex-shrink-0">
                            <img 
                              src={coach.image} 
                              alt={coach.name} 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400';
                              }}
                            />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-2xl font-black text-gray-900 mb-2">{coach.name}</h3>
                            <Badge className="bg-green-600 text-white mb-3">{coach.role}</Badge>
                            <p className="text-sm text-gray-700 mb-2">{coach.bio}</p>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <Award className="w-4 h-4 text-green-600" />
                              <span className="font-semibold">Uburambe: 2+ Imyaka</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="players" className="mt-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <Input placeholder="Search players..." className="w-64 border-2 border-green-200" />
                  <Select value={filterPosition} onValueChange={setFilterPosition}>
                    <SelectTrigger className="w-48 border-2 border-green-200">
                      <SelectValue placeholder="Position" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Positions</SelectItem>
                      <SelectItem value="Forward">Forward</SelectItem>
                      <SelectItem value="Midfielder">Midfielder</SelectItem>
                      <SelectItem value="Defender">Defender</SelectItem>
                      <SelectItem value="Goalkeeper">Goalkeeper</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                  <Download className="w-4 h-4 mr-2" /> Export Roster
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPlayers.map((player, index) => (
                  <motion.div key={player.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                    <Card className="border-2 border-green-200 hover:border-green-400 hover:shadow-2xl transition-all cursor-pointer group">
                      <CardContent className="p-6">
                        <div className="relative mb-4">
                          <div className="w-24 h-24 mx-auto border-4 border-green-200 group-hover:border-green-400 transition-all rounded-full overflow-hidden">
                            <img 
                              src={player.image} 
                              alt={player.name} 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400';
                              }}
                            />
                          </div>
                          <div className="absolute -top-2 -right-2 w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white font-black text-lg shadow-lg">
                            {player.number}
                          </div>
                          {player.captain && (
                            <Badge className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-white font-bold">
                              Captain
                            </Badge>
                          )}
                        </div>
                        <h3 className="text-xl font-black text-gray-900 text-center mb-1">{player.name}</h3>
                        <p className="text-sm font-semibold text-green-600 text-center mb-4">{player.position}</p>
                        <div className="grid grid-cols-3 gap-2 mb-4">
                          <div className="bg-green-50 rounded-lg p-2 text-center border border-green-200">
                            <p className="text-2xl font-black text-green-600">{player.goals}</p>
                            <p className="text-xs text-gray-600 font-semibold">Goals</p>
                          </div>
                          <div className="bg-blue-50 rounded-lg p-2 text-center border border-blue-200">
                            <p className="text-2xl font-black text-blue-600">{player.assists}</p>
                            <p className="text-xs text-gray-600 font-semibold">Assists</p>
                          </div>
                          <div className="bg-purple-50 rounded-lg p-2 text-center border border-purple-200">
                            <p className="text-2xl font-black text-purple-600">{player.matches}</p>
                            <p className="text-xs text-gray-600 font-semibold">Matches</p>
                          </div>
                        </div>
                        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-3 border border-yellow-200">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-gray-600">Rating</span>
                            <span className="text-lg font-black text-yellow-600">{player.rating}</span>
                          </div>
                          <Progress value={player.rating * 10} className="h-2" />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="matches" className="mt-6">
              <div className="space-y-4">
                {matches.map((match, index) => (
                  <motion.div key={match.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }}>
                    <Card className={`border-2 ${match.status === 'upcoming' ? 'border-blue-200 bg-blue-50/30' : 'border-green-200'} hover:shadow-xl transition-all`}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <Badge className={match.status === 'upcoming' ? 'bg-blue-500' : 'bg-green-500'}>{match.status === 'upcoming' ? 'Upcoming' : 'Completed'}</Badge>
                          <span className="text-sm font-semibold text-gray-600">{match.competition}</span>
                        </div>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex-1 text-center">
                            <p className="text-2xl font-black text-gray-900 mb-2">Garden TVET</p>
                            {match.status === 'completed' && <p className="text-5xl font-black text-green-600">{match.homeScore}</p>}
                          </div>
                          <div className="px-6">
                            <p className="text-3xl font-black text-gray-400">VS</p>
                          </div>
                          <div className="flex-1 text-center">
                            <p className="text-2xl font-black text-gray-900 mb-2">{match.opponent}</p>
                            {match.status === 'completed' && <p className="text-5xl font-black text-gray-600">{match.awayScore}</p>}
                          </div>
                        </div>
                        <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-green-600" />
                            <span className="font-semibold">{match.date}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-green-600" />
                            <span className="font-semibold">{match.time}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4 text-green-600" />
                            <span className="font-semibold">{match.location}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="statistics" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-2 border-green-200">
                  <CardContent className="p-6">
                    <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center">
                      <Target className="w-6 h-6 mr-2 text-green-600" /> Top Scorers
                    </h3>
                    <div className="space-y-4">
                      {topScorers.map((player, index) => (
                        <div key={player.id} className="flex items-center space-x-4 p-3 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white font-black">
                            {index + 1}
                          </div>
                          <div className="w-12 h-12 rounded-full border-2 border-green-300 overflow-hidden">
                            <img 
                              src={player.image} 
                              alt={player.name} 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400';
                              }}
                            />
                          </div>
                          <div className="flex-1">
                            <p className="font-black text-gray-900">{player.name}</p>
                            <p className="text-sm text-gray-600 font-semibold">{player.position}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-3xl font-black text-green-600">{player.goals}</p>
                            <p className="text-xs text-gray-600 font-semibold">Goals</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 border-blue-200">
                  <CardContent className="p-6">
                    <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center">
                      <Award className="w-6 h-6 mr-2 text-blue-600" /> Top Assisters
                    </h3>
                    <div className="space-y-4">
                      {topAssisters.map((player, index) => (
                        <div key={player.id} className="flex items-center space-x-4 p-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-black">
                            {index + 1}
                          </div>
                          <div className="w-12 h-12 rounded-full border-2 border-blue-300 overflow-hidden">
                            <img 
                              src={player.image} 
                              alt={player.name} 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400';
                              }}
                            />
                          </div>
                          <div className="flex-1">
                            <p className="font-black text-gray-900">{player.name}</p>
                            <p className="text-sm text-gray-600 font-semibold">{player.position}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-3xl font-black text-blue-600">{player.assists}</p>
                            <p className="text-xs text-gray-600 font-semibold">Assists</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="gallery" className="mt-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }} className="relative aspect-square rounded-2xl overflow-hidden group cursor-pointer">
                    <img src={`https://images.unsplash.com/photo-${1579952363873 + i}-27f3bade9f55?w=400`} alt={`Gallery ${i}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                      <p className="text-white font-bold">Match Highlight {i}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="achievements" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { title: 'Inter-School Championship', year: '2023', icon: Trophy, color: 'from-yellow-500 to-orange-500' },
                  { title: 'Regional Cup Winner', year: '2022', icon: Award, color: 'from-blue-500 to-indigo-500' },
                  { title: 'Best Team Spirit', year: '2023', icon: Users, color: 'from-green-500 to-emerald-500' },
                  { title: 'Fair Play Award', year: '2022', icon: Shield, color: 'from-purple-500 to-pink-500' },
                  { title: 'Top Scorer Team', year: '2023', icon: Target, color: 'from-red-500 to-rose-500' },
                ].map((achievement, index) => (
                  <motion.div key={index} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.1 }}>
                    <Card className="border-2 border-yellow-200 hover:shadow-2xl transition-all">
                      <CardContent className="p-6 text-center">
                        <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${achievement.color} flex items-center justify-center mx-auto mb-4`}>
                          <achievement.icon className="w-10 h-10 text-white" />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 mb-2">{achievement.title}</h3>
                        <Badge className="bg-yellow-500 text-white">{achievement.year}</Badge>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default FootballPage;
