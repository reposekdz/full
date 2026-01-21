import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Trophy, Users, Target, TrendingUp, Calendar, Clock, MapPin, Award, Star, ChevronLeft, Play, Share2, Heart, Download } from 'lucide-react';
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

  const players = [
    { id: 1, name: 'Patrick Nkusi', position: 'Forward', number: 10, goals: 15, assists: 8, matches: 20, rating: 8.5, image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400', captain: true },
    { id: 2, name: 'Jean Mugisha', position: 'Midfielder', number: 8, goals: 7, assists: 12, matches: 22, rating: 8.2, image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', captain: false },
    { id: 3, name: 'Eric Habimana', position: 'Defender', number: 5, goals: 2, assists: 3, matches: 21, rating: 7.8, image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400', captain: false },
    { id: 4, name: 'David Uwase', position: 'Goalkeeper', number: 1, goals: 0, assists: 0, matches: 22, rating: 8.0, image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400', captain: false },
    { id: 5, name: 'Emmanuel Niyonzima', position: 'Forward', number: 11, goals: 12, assists: 5, matches: 19, rating: 8.3, image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400', captain: false },
    { id: 6, name: 'Claude Bizimana', position: 'Midfielder', number: 6, goals: 4, assists: 9, matches: 20, rating: 7.9, image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400', captain: false },
  ];

  const matches = [
    { id: 1, opponent: 'Lycée de Kigali', date: '2024-03-01', time: '14:00', location: 'Amahoro Stadium', status: 'upcoming', homeScore: null, awayScore: null, competition: 'Inter-School Championship' },
    { id: 2, opponent: 'IPRC Kigali', date: '2024-02-20', time: '15:00', location: 'School Field', status: 'completed', homeScore: 3, awayScore: 1, competition: 'Friendly Match' },
    { id: 3, opponent: 'GS Remera', date: '2024-02-15', time: '16:00', location: 'Nyamirambo Stadium', status: 'completed', homeScore: 2, awayScore: 2, competition: 'League Match' },
    { id: 4, opponent: 'FAWE Girls', date: '2024-02-10', time: '14:30', location: 'Kicukiro Ground', status: 'completed', homeScore: 4, awayScore: 0, competition: 'Cup Match' },
  ];

  const stats = [
    { label: 'Total Goals', value: '42', icon: Target, color: 'from-green-500 to-emerald-500' },
    { label: 'Matches Played', value: '22', icon: Trophy, color: 'from-blue-500 to-indigo-500' },
    { label: 'Win Rate', value: '68%', icon: TrendingUp, color: 'from-yellow-500 to-orange-500' },
    { label: 'Team Rating', value: '8.1', icon: Star, color: 'from-purple-500 to-pink-500' },
  ];

  const topScorers = players.filter(p => p.goals > 0).sort((a, b) => b.goals - a.goals).slice(0, 5);
  const topAssisters = players.filter(p => p.assists > 0).sort((a, b) => b.assists - a.assists).slice(0, 5);
  const filteredPlayers = filterPosition === 'all' ? players : players.filter(p => p.position === filterPosition);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <Button variant="ghost" onClick={() => onNavigate('sports')} className="mb-6">
            <ChevronLeft className="w-5 h-5 mr-2" /> Back to Sports
          </Button>

          <div className="relative h-96 rounded-3xl overflow-hidden mb-8 shadow-2xl">
            <img src="https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=1200" alt="Football" className="w-full h-full object-cover" />
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

          <Tabs defaultValue="players" className="mb-8">
            <TabsList className="grid w-full grid-cols-4 h-14 bg-white border-2 border-green-200 rounded-2xl p-1">
              <TabsTrigger value="players" className="font-bold">Players</TabsTrigger>
              <TabsTrigger value="matches" className="font-bold">Matches</TabsTrigger>
              <TabsTrigger value="statistics" className="font-bold">Statistics</TabsTrigger>
              <TabsTrigger value="gallery" className="font-bold">Gallery</TabsTrigger>
            </TabsList>

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
                          <Avatar className="w-24 h-24 mx-auto border-4 border-green-200 group-hover:border-green-400 transition-all">
                            <img src={player.image} alt={player.name} />
                            <AvatarFallback>{player.name[0]}</AvatarFallback>
                          </Avatar>
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
                          <Avatar className="w-12 h-12 border-2 border-green-300">
                            <img src={player.image} alt={player.name} />
                            <AvatarFallback>{player.name[0]}</AvatarFallback>
                          </Avatar>
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
                          <Avatar className="w-12 h-12 border-2 border-blue-300">
                            <img src={player.image} alt={player.name} />
                            <AvatarFallback>{player.name[0]}</AvatarFallback>
                          </Avatar>
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
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default FootballPage;
