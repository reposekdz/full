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

interface VolleyballPageProps {
  onNavigate: (page: string) => void;
}

const VolleyballPage: React.FC<VolleyballPageProps> = ({ onNavigate }) => {
  const [filterPosition, setFilterPosition] = useState('all');

  const players = [
    { id: 1, name: 'Marie Uwase', position: 'Setter', number: 7, points: 145, blocks: 32, matches: 18, rating: 8.7, image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400', captain: true },
    { id: 2, name: 'Grace Mukamana', position: 'Outside Hitter', number: 12, points: 198, blocks: 28, matches: 18, rating: 8.9, image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400', captain: false },
    { id: 3, name: 'Sarah Ingabire', position: 'Middle Blocker', number: 5, points: 87, blocks: 56, matches: 17, rating: 8.3, image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400', captain: false },
    { id: 4, name: 'Diane Umutoni', position: 'Libero', number: 3, points: 45, blocks: 12, matches: 18, rating: 8.1, image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400', captain: false },
    { id: 5, name: 'Aline Mutesi', position: 'Outside Hitter', number: 9, points: 176, blocks: 24, matches: 16, rating: 8.6, image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400', captain: false },
    { id: 6, name: 'Claudine Uwera', position: 'Opposite', number: 14, points: 162, blocks: 31, matches: 18, rating: 8.4, image: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400', captain: false },
  ];

  const matches = [
    { id: 1, opponent: 'IPRC Kigali', date: '2024-02-28', time: '15:30', location: 'School Court', status: 'upcoming', homeSets: null, awaySets: null, competition: 'Regional League' },
    { id: 2, opponent: 'Lycée de Kigali', date: '2024-02-18', time: '14:00', location: 'Amahoro Indoor', status: 'completed', homeSets: 3, awaySets: 1, competition: 'Championship' },
    { id: 3, opponent: 'GS Remera', date: '2024-02-12', time: '16:00', location: 'School Court', status: 'completed', homeSets: 3, awaySets: 0, competition: 'Friendly Match' },
    { id: 4, opponent: 'FAWE Girls', date: '2024-02-05', time: '15:00', location: 'Kicukiro Sports Hall', status: 'completed', homeSets: 3, awaySets: 2, competition: 'Cup Match' },
  ];

  const stats = [
    { label: 'Total Points', value: '813', icon: Target, color: 'from-blue-500 to-indigo-500' },
    { label: 'Matches Played', value: '18', icon: Trophy, color: 'from-purple-500 to-pink-500' },
    { label: 'Win Rate', value: '72%', icon: TrendingUp, color: 'from-yellow-500 to-orange-500' },
    { label: 'Team Rating', value: '8.5', icon: Star, color: 'from-green-500 to-emerald-500' },
  ];

  const topScorers = players.filter(p => p.points > 0).sort((a, b) => b.points - a.points).slice(0, 5);
  const topBlockers = players.filter(p => p.blocks > 0).sort((a, b) => b.blocks - a.blocks).slice(0, 5);
  const filteredPlayers = filterPosition === 'all' ? players : players.filter(p => p.position === filterPosition);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <Button variant="ghost" onClick={() => onNavigate('sports')} className="mb-6">
            <ChevronLeft className="w-5 h-5 mr-2" /> Back to Sports
          </Button>

          <div className="relative h-96 rounded-3xl overflow-hidden mb-8 shadow-2xl">
            <img src="https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=1200" alt="Volleyball" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border-4 border-white/50">
                  <Trophy className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h1 className="text-5xl font-black text-white mb-2">Volleyball Team</h1>
                  <p className="text-xl text-blue-200 font-semibold">Garden TVET Elite Squad</p>
                </div>
              </div>
              <div className="flex items-center space-x-6">
                <Button className="bg-white text-blue-600 hover:bg-blue-50 font-bold">
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
                <Card className="border-2 border-blue-200 hover:shadow-xl transition-all">
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
            <TabsList className="grid w-full grid-cols-4 h-14 bg-white border-2 border-blue-200 rounded-2xl p-1">
              <TabsTrigger value="players" className="font-bold">Players</TabsTrigger>
              <TabsTrigger value="matches" className="font-bold">Matches</TabsTrigger>
              <TabsTrigger value="statistics" className="font-bold">Statistics</TabsTrigger>
              <TabsTrigger value="gallery" className="font-bold">Gallery</TabsTrigger>
            </TabsList>

            <TabsContent value="players" className="mt-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <Input placeholder="Search players..." className="w-64 border-2 border-blue-200" />
                  <Select value={filterPosition} onValueChange={setFilterPosition}>
                    <SelectTrigger className="w-48 border-2 border-blue-200">
                      <SelectValue placeholder="Position" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Positions</SelectItem>
                      <SelectItem value="Setter">Setter</SelectItem>
                      <SelectItem value="Outside Hitter">Outside Hitter</SelectItem>
                      <SelectItem value="Middle Blocker">Middle Blocker</SelectItem>
                      <SelectItem value="Libero">Libero</SelectItem>
                      <SelectItem value="Opposite">Opposite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                  <Download className="w-4 h-4 mr-2" /> Export Roster
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPlayers.map((player, index) => (
                  <motion.div key={player.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                    <Card className="border-2 border-blue-200 hover:border-blue-400 hover:shadow-2xl transition-all cursor-pointer group">
                      <CardContent className="p-6">
                        <div className="relative mb-4">
                          <Avatar className="w-24 h-24 mx-auto border-4 border-blue-200 group-hover:border-blue-400 transition-all">
                            <img src={player.image} alt={player.name} />
                            <AvatarFallback>{player.name[0]}</AvatarFallback>
                          </Avatar>
                          <div className="absolute -top-2 -right-2 w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-black text-lg shadow-lg">
                            {player.number}
                          </div>
                          {player.captain && (
                            <Badge className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-white font-bold">
                              Captain
                            </Badge>
                          )}
                        </div>
                        <h3 className="text-xl font-black text-gray-900 text-center mb-1">{player.name}</h3>
                        <p className="text-sm font-semibold text-blue-600 text-center mb-4">{player.position}</p>
                        <div className="grid grid-cols-3 gap-2 mb-4">
                          <div className="bg-blue-50 rounded-lg p-2 text-center border border-blue-200">
                            <p className="text-2xl font-black text-blue-600">{player.points}</p>
                            <p className="text-xs text-gray-600 font-semibold">Points</p>
                          </div>
                          <div className="bg-purple-50 rounded-lg p-2 text-center border border-purple-200">
                            <p className="text-2xl font-black text-purple-600">{player.blocks}</p>
                            <p className="text-xs text-gray-600 font-semibold">Blocks</p>
                          </div>
                          <div className="bg-green-50 rounded-lg p-2 text-center border border-green-200">
                            <p className="text-2xl font-black text-green-600">{player.matches}</p>
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
                    <Card className={`border-2 ${match.status === 'upcoming' ? 'border-purple-200 bg-purple-50/30' : 'border-blue-200'} hover:shadow-xl transition-all`}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <Badge className={match.status === 'upcoming' ? 'bg-purple-500' : 'bg-blue-500'}>{match.status === 'upcoming' ? 'Upcoming' : 'Completed'}</Badge>
                          <span className="text-sm font-semibold text-gray-600">{match.competition}</span>
                        </div>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex-1 text-center">
                            <p className="text-2xl font-black text-gray-900 mb-2">Garden TVET</p>
                            {match.status === 'completed' && <p className="text-5xl font-black text-blue-600">{match.homeSets}</p>}
                          </div>
                          <div className="px-6">
                            <p className="text-3xl font-black text-gray-400">VS</p>
                          </div>
                          <div className="flex-1 text-center">
                            <p className="text-2xl font-black text-gray-900 mb-2">{match.opponent}</p>
                            {match.status === 'completed' && <p className="text-5xl font-black text-gray-600">{match.awaySets}</p>}
                          </div>
                        </div>
                        <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-blue-600" />
                            <span className="font-semibold">{match.date}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-blue-600" />
                            <span className="font-semibold">{match.time}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4 text-blue-600" />
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
                <Card className="border-2 border-blue-200">
                  <CardContent className="p-6">
                    <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center">
                      <Target className="w-6 h-6 mr-2 text-blue-600" /> Top Scorers
                    </h3>
                    <div className="space-y-4">
                      {topScorers.map((player, index) => (
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
                            <p className="text-3xl font-black text-blue-600">{player.points}</p>
                            <p className="text-xs text-gray-600 font-semibold">Points</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 border-purple-200">
                  <CardContent className="p-6">
                    <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center">
                      <Award className="w-6 h-6 mr-2 text-purple-600" /> Top Blockers
                    </h3>
                    <div className="space-y-4">
                      {topBlockers.map((player, index) => (
                        <div key={player.id} className="flex items-center space-x-4 p-3 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-black">
                            {index + 1}
                          </div>
                          <Avatar className="w-12 h-12 border-2 border-purple-300">
                            <img src={player.image} alt={player.name} />
                            <AvatarFallback>{player.name[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-black text-gray-900">{player.name}</p>
                            <p className="text-sm text-gray-600 font-semibold">{player.position}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-3xl font-black text-purple-600">{player.blocks}</p>
                            <p className="text-xs text-gray-600 font-semibold">Blocks</p>
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
                    <img src={`https://images.unsplash.com/photo-${1612872087720 + i}-bb876e2e67d1?w=400`} alt={`Gallery ${i}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
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

export default VolleyballPage;
