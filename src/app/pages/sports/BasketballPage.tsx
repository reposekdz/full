import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Users, Target, TrendingUp, Calendar, Clock, MapPin, Award, Star, ChevronLeft, Play, Share2, Heart, Download, Medal, Zap } from 'lucide-react';
import { Card, CardContent } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Input } from '@/app/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { useLanguage } from '@/app/contexts/LanguageContext';

interface BasketballPageProps {
  onNavigate: (page: string) => void;
}

const BasketballPage: React.FC<BasketballPageProps> = ({ onNavigate }) => {
  const [filterPosition, setFilterPosition] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { language } = useLanguage();

  const players = [
    { id: 1, name: 'Jean Pierre Habimana', position: 'Point Guard', number: 1, points: 245, assists: 89, rebounds: 34, matches: 20, rating: 8.7, image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400', captain: true },
    { id: 2, name: 'Eric Mugabo', position: 'Shooting Guard', number: 23, points: 312, assists: 45, rebounds: 67, matches: 22, rating: 8.9, image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', captain: false },
    { id: 3, name: 'Patrick Uwimana', position: 'Small Forward', number: 11, points: 198, assists: 34, rebounds: 89, matches: 21, rating: 8.4, image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400', captain: false },
    { id: 4, name: 'David Niyonzima', position: 'Power Forward', number: 32, points: 156, assists: 23, rebounds: 134, matches: 22, rating: 8.2, image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400', captain: false },
    { id: 5, name: 'Claude Bizimana', position: 'Center', number: 34, points: 178, assists: 15, rebounds: 167, matches: 19, rating: 8.5, image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400', captain: false },
    { id: 6, name: 'Emmanuel Ndayisaba', position: 'Point Guard', number: 5, points: 134, assists: 78, rebounds: 28, matches: 18, rating: 7.9, image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400', captain: false },
  ];

  const matches = [
    { id: 1, opponent: 'Lycée de Kigali', date: '2024-02-25', time: '14:00', location: 'Kibagabaga Stadium', status: 'upcoming', homeScore: null, awayScore: null, competition: 'Inter-School Championship' },
    { id: 2, opponent: 'IPRC Kigali', date: '2024-02-18', time: '15:00', location: 'School Gymnasium', status: 'completed', homeScore: 78, awayScore: 65, competition: 'Friendly Match' },
    { id: 3, opponent: 'GS Remera', date: '2024-02-12', time: '16:00', location: 'Nyamirambo Stadium', status: 'completed', homeScore: 85, awayScore: 72, competition: 'League Match' },
    { id: 4, opponent: 'FAWE Rwanda', date: '2024-02-05', time: '14:30', location: 'Kicukiro Court', status: 'completed', homeScore: 92, awayScore: 68, competition: 'Cup Match' },
  ];

  const trophies = [
    { id: 1, title: 'Igikombe cy\'Intara 2023', titleEn: 'Regional Championship 2023', position: '🥇 1st Place', date: '2023-12-15', image: 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=400' },
    { id: 2, title: 'Inter-School League 2023', titleEn: 'Inter-School League 2023', position: '🥇 1st Place', date: '2023-11-20', image: 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=400' },
    { id: 3, title: 'MVP Award - Eric Mugabo', titleEn: 'MVP Award', position: '⭐ Individual', date: '2023-12-15', image: 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=400' },
    { id: 4, title: 'Amarushanwa y\'Umujyi 2022', titleEn: 'City Championship 2022', position: '🥈 2nd Place', date: '2022-12-10', image: 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=400' },
    { id: 5, title: 'Best Defense Award', titleEn: 'Best Defense Award', position: '🛡️ Team Award', date: '2023-06-20', image: 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=400' },
    { id: 6, title: 'Rookie of the Year', titleEn: 'Rookie of the Year', position: '⭐ Individual', date: '2023-05-15', image: 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=400' },
  ];

  const stats = [
    { label: language === 'rw' ? 'Amanota Yose' : 'Total Points', value: '1,223', icon: Target, color: 'from-orange-500 to-red-500' },
    { label: language === 'rw' ? 'Imikino' : 'Matches', value: '22', icon: Trophy, color: 'from-blue-500 to-indigo-500' },
    { label: language === 'rw' ? 'Gutsinda' : 'Win Rate', value: '82%', icon: TrendingUp, color: 'from-green-500 to-emerald-500' },
    { label: language === 'rw' ? 'Ibihembo' : 'Trophies', value: '6', icon: Medal, color: 'from-yellow-500 to-orange-500' },
  ];

  const filteredPlayers = (filterPosition === 'all' 
    ? players 
    : players.filter(p => p.position === filterPosition))
    .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <Button variant="ghost" onClick={() => onNavigate('sports')} className="mb-6 hover:bg-orange-100">
            <ChevronLeft className="w-5 h-5 mr-2" /> 
            {language === 'rw' ? 'Subira ku Siporo' : 'Back to Sports'}
          </Button>

          {/* Hero Banner */}
          <div className="relative h-96 rounded-3xl overflow-hidden mb-8 shadow-2xl">
            <img src="https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1200" alt="Basketball" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-orange-600/30 to-red-600/30" />
            
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center border-4 border-white/50 shadow-xl">
                  <span className="text-5xl">🏀</span>
                </div>
                <div>
                  <h1 className="text-5xl font-black text-white mb-2">
                    {language === 'rw' ? 'Ikipe ya Basketball' : 'Basketball Team'}
                  </h1>
                  <p className="text-xl text-orange-200 font-semibold">Garden TVET Champions 🏆</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Button className="bg-white text-orange-600 hover:bg-orange-50 font-bold shadow-lg">
                  <Play className="w-4 h-4 mr-2" /> 
                  {language === 'rw' ? 'Reba Video' : 'Watch Highlights'}
                </Button>
                <Button variant="outline" className="border-white text-white hover:bg-white/20">
                  <Share2 className="w-4 h-4 mr-2" /> 
                  {language === 'rw' ? 'Sangiza' : 'Share'}
                </Button>
                <Button variant="outline" className="border-white text-white hover:bg-white/20">
                  <Heart className="w-4 h-4 mr-2" /> 
                  {language === 'rw' ? 'Gukurikira' : 'Follow'}
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, index) => (
              <motion.div 
                key={index} 
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }} 
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-2 border-orange-200 hover:shadow-xl transition-all">
                  <CardContent className="p-6 text-center">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                      <stat.icon className="w-7 h-7 text-white" />
                    </div>
                    <p className="text-3xl font-black text-gray-900 mb-1">{stat.value}</p>
                    <p className="text-sm font-semibold text-gray-600">{stat.label}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Tabs Section */}
          <Tabs defaultValue="players" className="mb-8">
            <TabsList className="grid w-full grid-cols-4 h-14 bg-white border-2 border-orange-200 rounded-2xl p-1">
              <TabsTrigger value="players" className="font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white rounded-xl">
                {language === 'rw' ? 'Abakinnyi' : 'Players'}
              </TabsTrigger>
              <TabsTrigger value="matches" className="font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white rounded-xl">
                {language === 'rw' ? 'Imikino' : 'Matches'}
              </TabsTrigger>
              <TabsTrigger value="trophies" className="font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white rounded-xl">
                {language === 'rw' ? 'Ibikombe' : 'Trophies'}
              </TabsTrigger>
              <TabsTrigger value="gallery" className="font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white rounded-xl">
                {language === 'rw' ? 'Amafoto' : 'Gallery'}
              </TabsTrigger>
            </TabsList>

            {/* Players Tab */}
            <TabsContent value="players" className="mt-6">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                  <Input 
                    placeholder={language === 'rw' ? 'Shakisha umukinnyi...' : 'Search players...'}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-64 border-2 border-orange-200" 
                  />
                  <Select value={filterPosition} onValueChange={setFilterPosition}>
                    <SelectTrigger className="w-48 border-2 border-orange-200">
                      <SelectValue placeholder="Position" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{language === 'rw' ? 'Imyanya Yose' : 'All Positions'}</SelectItem>
                      <SelectItem value="Point Guard">Point Guard</SelectItem>
                      <SelectItem value="Shooting Guard">Shooting Guard</SelectItem>
                      <SelectItem value="Small Forward">Small Forward</SelectItem>
                      <SelectItem value="Power Forward">Power Forward</SelectItem>
                      <SelectItem value="Center">Center</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg">
                  <Download className="w-4 h-4 mr-2" /> 
                  {language === 'rw' ? 'Kuramo Urutonde' : 'Export Roster'}
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPlayers.map((player, index) => (
                  <motion.div 
                    key={player.id} 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -5 }}
                  >
                    <Card className="border-2 border-orange-200 hover:border-orange-400 hover:shadow-2xl transition-all cursor-pointer group overflow-hidden">
                      <CardContent className="p-6">
                        <div className="relative mb-4">
                          <Avatar className="w-24 h-24 mx-auto border-4 border-orange-200 group-hover:border-orange-400 transition-all shadow-lg">
                            <img src={player.image} alt={player.name} className="object-cover" />
                            <AvatarFallback className="bg-gradient-to-br from-orange-500 to-red-500 text-white text-2xl font-bold">
                              {player.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="absolute -top-2 -right-2 w-14 h-14 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white font-black text-xl shadow-lg border-4 border-white">
                            {player.number}
                          </div>
                          {player.captain && (
                            <Badge className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-white font-bold shadow-md">
                              ⭐ Captain
                            </Badge>
                          )}
                        </div>
                        <h3 className="text-xl font-black text-gray-900 text-center mb-1">{player.name}</h3>
                        <p className="text-sm font-semibold text-orange-600 text-center mb-4">{player.position}</p>
                        
                        <div className="grid grid-cols-3 gap-2 mb-4">
                          <div className="bg-orange-50 rounded-lg p-2 text-center border border-orange-200">
                            <p className="text-lg font-black text-orange-600">{player.points}</p>
                            <p className="text-xs text-gray-600 font-semibold">{language === 'rw' ? 'Amanota' : 'Points'}</p>
                          </div>
                          <div className="bg-blue-50 rounded-lg p-2 text-center border border-blue-200">
                            <p className="text-lg font-black text-blue-600">{player.assists}</p>
                            <p className="text-xs text-gray-600 font-semibold">{language === 'rw' ? 'Gufasha' : 'Assists'}</p>
                          </div>
                          <div className="bg-green-50 rounded-lg p-2 text-center border border-green-200">
                            <p className="text-lg font-black text-green-600">{player.rebounds}</p>
                            <p className="text-xs text-gray-600 font-semibold">{language === 'rw' ? 'Gufata' : 'Rebounds'}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-3 border border-orange-200">
                          <span className="text-sm font-semibold text-gray-600">{language === 'rw' ? 'Amanota' : 'Rating'}</span>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            <span className="font-black text-gray-900">{player.rating}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            {/* Matches Tab */}
            <TabsContent value="matches" className="mt-6">
              <div className="space-y-4">
                {matches.map((match, index) => (
                  <motion.div 
                    key={match.id} 
                    initial={{ opacity: 0, x: -20 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className={`border-2 ${match.status === 'upcoming' ? 'border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50' : 'border-orange-200'} hover:shadow-xl transition-all`}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-6">
                            <div className="text-center">
                              <p className="text-2xl font-black text-gray-900">Garden TVET</p>
                              {match.status === 'completed' && (
                                <p className="text-4xl font-black text-orange-600">{match.homeScore}</p>
                              )}
                            </div>
                            <div className="text-center px-6">
                              <Badge className={match.status === 'upcoming' ? 'bg-blue-500' : 'bg-green-500'}>
                                {match.status === 'upcoming' ? (language === 'rw' ? 'Izaza' : 'Upcoming') : (language === 'rw' ? 'Yarangiye' : 'Final')}
                              </Badge>
                              <p className="text-2xl font-black text-gray-400 mt-2">VS</p>
                            </div>
                            <div className="text-center">
                              <p className="text-2xl font-black text-gray-900">{match.opponent}</p>
                              {match.status === 'completed' && (
                                <p className="text-4xl font-black text-gray-500">{match.awayScore}</p>
                              )}
                            </div>
                          </div>
                          <div className="text-right space-y-2">
                            <Badge className="bg-orange-100 text-orange-700">{match.competition}</Badge>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Calendar className="w-4 h-4" />
                              <span className="font-semibold">{match.date}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Clock className="w-4 h-4" />
                              <span>{match.time}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <MapPin className="w-4 h-4" />
                              <span>{match.location}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            {/* Trophies Tab */}
            <TabsContent value="trophies" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trophies.map((trophy, index) => (
                  <motion.div 
                    key={trophy.id} 
                    initial={{ opacity: 0, scale: 0.9 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                  >
                    <Card className="border-2 border-yellow-300 bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50 hover:shadow-2xl transition-all overflow-hidden">
                      <CardContent className="p-6 text-center">
                        <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-xl">
                          <Trophy className="w-10 h-10 text-white" />
                        </div>
                        <div className="text-3xl mb-2">{trophy.position.split(' ')[0]}</div>
                        <h3 className="text-lg font-black text-gray-900 mb-1">{trophy.title}</h3>
                        <p className="text-sm text-gray-600 font-semibold mb-3">{trophy.titleEn}</p>
                        <Badge className="bg-yellow-100 text-yellow-700 font-bold">
                          {trophy.date}
                        </Badge>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            {/* Gallery Tab */}
            <TabsContent value="gallery" className="mt-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[
                  'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400',
                  'https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?w=400',
                  'https://images.unsplash.com/photo-1519861531473-9200262188bf?w=400',
                  'https://images.unsplash.com/photo-1504450758481-7338bbe75c8e?w=400',
                  'https://images.unsplash.com/photo-1577471488278-16eec37ffcc2?w=400',
                  'https://images.unsplash.com/photo-1518063319789-7217e6706b04?w=400',
                  'https://images.unsplash.com/photo-1515523110800-9415d13b84a8?w=400',
                  'https://images.unsplash.com/photo-1559692048-79a3f837883d?w=400',
                ].map((img, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.05 }}
                    className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group"
                  >
                    <img src={img} alt={`Gallery ${index + 1}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                      <Zap className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
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

export default BasketballPage;
