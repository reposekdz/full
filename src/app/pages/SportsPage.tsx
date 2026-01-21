import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Users, Calendar, Award, Medal, Target, TrendingUp, Star, Search, Filter, MapPin, Clock, ChevronRight, Play, Download, Share2, Heart, MessageSquare, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';
import { Progress } from '@/app/components/ui/progress';
import { Dialog, DialogContent } from '@/app/components/ui/dialog';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import AdvancedLeftSidebar from '@/app/components/AdvancedLeftSidebar';

interface SportsPageProps {
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

const SportsPage: React.FC<SportsPageProps> = ({ onNavigate, onLogout }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('teams');

  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [filterSport, setFilterSport] = useState('all');

  const teams = [
    { id: 't1', name: 'Ikipe ya Basketball', nameEn: 'Basketball Team', members: 15, coach: 'Coach Mike', coachPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80', wins: 12, losses: 3, draws: 2, image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&q=80', color: 'from-orange-500 to-red-500', captain: 'Jean Mugisha', founded: '2020', achievements: 5, nextMatch: '2024-02-25' },
    { id: 't2', name: 'Ikipe ya Football', nameEn: 'Football Team', members: 22, coach: 'Coach David', coachPhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80', wins: 18, losses: 5, draws: 4, image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&q=80', color: 'from-green-500 to-emerald-500', captain: 'Patrick Nkusi', founded: '2019', achievements: 8, nextMatch: '2024-03-01' },
    { id: 't3', name: 'Ikipe ya Volleyball', nameEn: 'Volleyball Team', members: 12, coach: 'Coach Sarah', coachPhoto: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80', wins: 10, losses: 4, draws: 1, image: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800&q=80', color: 'from-blue-500 to-indigo-500', captain: 'Marie Uwase', founded: '2021', achievements: 3, nextMatch: '2024-02-28' },
    { id: 't4', name: 'Ikipe ya Athletics', nameEn: 'Athletics Team', members: 18, coach: 'Coach Emmanuel', coachPhoto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80', wins: 15, losses: 2, draws: 0, image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=80', color: 'from-purple-500 to-pink-500', captain: 'Eric Habimana', founded: '2018', achievements: 12, nextMatch: '2024-03-05' }
  ];

  const events = [
    { id: 'e1', title: 'Umukino wa Basketball', titleEn: 'Basketball Match', date: '2024-02-25', time: '14:00', location: 'Kibagabaga Stadium', teams: 'Garden TVET vs Lycée de Kigali', status: 'upcoming', image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&q=80', ticketPrice: 'RWF 2,000', expectedAttendance: 500, description: 'Umukino ukomeye wa championship' },
    { id: 'e2', title: 'Amarushanwa ya Football', titleEn: 'Football Tournament', date: '2024-03-01', time: '09:00', location: 'Amahoro Stadium', teams: 'Inter-School Championship', status: 'upcoming', image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&q=80', ticketPrice: 'RWF 5,000', expectedAttendance: 2000, description: 'Amarushanwa makuru y\'amashuri' },
    { id: 'e3', title: 'Umukino wa Volleyball', titleEn: 'Volleyball Game', date: '2024-02-28', time: '15:30', location: 'School Court', teams: 'Garden TVET vs IPRC Kigali', status: 'upcoming', image: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800&q=80', ticketPrice: 'Free', expectedAttendance: 300, description: 'Umukino w\'ubucuti' },
    { id: 'e4', title: 'Amarushanwa ya Athletics', titleEn: 'Athletics Championship', date: '2024-03-05', time: '08:00', location: 'Nyamirambo Stadium', teams: 'Regional Athletics Meet', status: 'upcoming', image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=80', ticketPrice: 'RWF 3,000', expectedAttendance: 1000, description: 'Amarushanwa y\'akarere' }
  ];

  const achievements = [
    { id: 'a1', title: 'Igikombe cya Basketball 2023', titleEn: 'Basketball Championship 2023', date: '2023-12-15', position: '1st Place', icon: Trophy, color: 'from-yellow-500 to-orange-500' },
    { id: 'a2', title: 'Umukino Mwiza wa Football', titleEn: 'Best Football Performance', date: '2023-11-20', position: '2nd Place', icon: Medal, color: 'from-gray-400 to-gray-500' },
    { id: 'a3', title: 'MVP wa Volleyball', titleEn: 'Volleyball MVP Award', date: '2023-10-10', position: 'Individual Award', icon: Star, color: 'from-purple-500 to-pink-500' }
  ];

  const stats = [
    { label: 'Amakipe', value: teams.length.toString(), icon: Users, color: 'from-blue-600 to-indigo-600' },
    { label: 'Ibirori', value: events.length.toString(), icon: Calendar, color: 'from-green-600 to-emerald-600' },
    { label: 'Ibihembo', value: achievements.length.toString(), icon: Trophy, color: 'from-yellow-600 to-orange-600' },
    { label: 'Abakinnyi', value: teams.reduce((sum, t) => sum + t.members, 0).toString(), icon: Target, color: 'from-purple-600 to-pink-600' }
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 overflow-hidden">
      <AdvancedLeftSidebar currentPage="sports" onNavigate={onNavigate} onLogout={onLogout} />
      
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-600 to-red-600 flex items-center justify-center shadow-xl">
                <Trophy className="w-9 h-9 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-black text-gray-900">Siporo</h1>
                <p className="text-lg text-gray-600 font-semibold mt-1">Amakipe, Ibirori n'Intsinzi</p>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {stats.map((stat, index) => (
                <motion.div key={index} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl p-6 shadow-lg border-2 border-orange-100">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mx-auto mb-3`}>
                    <stat.icon className="w-7 h-7 text-white" />
                  </div>
                  <p className="text-3xl font-black text-gray-900 mb-1 text-center">{stat.value}</p>
                  <p className="text-sm font-semibold text-gray-600 text-center">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl shadow-2xl border-2 border-orange-100 p-6 mb-8">
            <div className="flex items-center space-x-3 mb-6">
              <Search className="w-6 h-6 text-orange-600" />
              <h3 className="text-2xl font-black text-gray-900">Shakisha</h3>
            </div>
            <Input placeholder="Shakisha amakipe, ibirori..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 text-lg border-2 border-orange-200" />
          </motion.div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList className="grid w-full grid-cols-3 h-14 bg-white border-2 border-orange-200 rounded-2xl p-1">
              <TabsTrigger value="teams" className="text-base font-bold rounded-xl">Amakipe</TabsTrigger>
              <TabsTrigger value="events" className="text-base font-bold rounded-xl">Ibirori</TabsTrigger>
              <TabsTrigger value="achievements" className="text-base font-bold rounded-xl">Intsinzi</TabsTrigger>
            </TabsList>

            <TabsContent value="teams" className="mt-6">
              <div className="mb-6 flex items-center justify-between">
                <p className="text-gray-600 font-semibold">Byaboniwe: <span className="font-black text-orange-600">{teams.length}</span> amakipe</p>
                <Select value={filterSport} onValueChange={setFilterSport}>
                  <SelectTrigger className="w-48 border-2 border-orange-200"><SelectValue placeholder="Siporo" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Siporo Zose</SelectItem>
                    <SelectItem value="basketball">Basketball</SelectItem>
                    <SelectItem value="football">Football</SelectItem>
                    <SelectItem value="volleyball">Volleyball</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                  {teams.map((team, index) => (
                    <motion.div key={team.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ delay: index * 0.05 }} layout>
                      <Card className="border-2 border-orange-100 hover:border-orange-400 hover:shadow-2xl transition-all overflow-hidden cursor-pointer group" onClick={() => setSelectedTeam(team)}>
                        <div className="relative h-48 overflow-hidden">
                          <img src={team.image} alt={team.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
                            <div className="flex items-center space-x-1">
                              <Trophy className="w-4 h-4 text-yellow-500" />
                              <span className="font-black text-sm">{team.achievements}</span>
                            </div>
                          </div>
                          <div className="absolute bottom-3 left-3 right-3">
                            <h3 className="text-2xl font-black text-white mb-1">{team.name}</h3>
                            <p className="text-orange-200 font-semibold">{team.nameEn}</p>
                          </div>
                        </div>
                        <CardContent className="p-6 space-y-4">
                          <div className="flex items-center space-x-3">
                            <Avatar className="w-12 h-12 border-2 border-orange-200">
                              <img src={team.coachPhoto} alt={team.coach} />
                              <AvatarFallback>{team.coach[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="text-sm font-bold text-gray-900">{team.coach}</p>
                              <p className="text-xs text-gray-600 font-semibold">Umutoza</p>
                            </div>
                            <Badge className="bg-orange-100 text-orange-700 font-bold">{team.members}</Badge>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div className="bg-green-50 rounded-lg p-3 text-center border-2 border-green-200">
                              <p className="text-2xl font-black text-green-600">{team.wins}</p>
                              <p className="text-xs text-gray-600 font-semibold">Intsinzi</p>
                            </div>
                            <div className="bg-yellow-50 rounded-lg p-3 text-center border-2 border-yellow-200">
                              <p className="text-2xl font-black text-yellow-600">{team.draws}</p>
                              <p className="text-xs text-gray-600 font-semibold">Guhuza</p>
                            </div>
                            <div className="bg-red-50 rounded-lg p-3 text-center border-2 border-red-200">
                              <p className="text-2xl font-black text-red-600">{team.losses}</p>
                              <p className="text-xs text-gray-600 font-semibold">Gutsindwa</p>
                            </div>
                          </div>
                          <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-3 border border-orange-200">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-semibold text-gray-600">Umukino Utaha</span>
                              <span className="text-sm font-black text-orange-600">{team.nextMatch}</span>
                            </div>
                          </div>
                          <Button className={`w-full bg-gradient-to-r ${team.color} text-white font-bold group-hover:shadow-lg transition-shadow`}>
                            Reba Byinshi <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </TabsContent>

            <TabsContent value="events" className="mt-6">
              <div className="space-y-4">
                {events.map((event, index) => (
                  <motion.div key={event.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }}>
                    <Card className="border-2 border-orange-100 hover:border-orange-400 hover:shadow-xl transition-all">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-2xl font-black text-gray-900 mb-2">{event.title}</h3>
                            <p className="text-gray-600 font-semibold mb-4">{event.titleEn}</p>
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2 text-sm">
                                <Calendar className="w-4 h-4 text-orange-600" />
                                <span className="font-bold">{event.date}</span>
                                <Clock className="w-4 h-4 text-orange-600 ml-2" />
                                <span className="font-semibold">{event.time}</span>
                              </div>
                              <div className="flex items-center space-x-2 text-sm">
                                <MapPin className="w-4 h-4 text-orange-600" />
                                <span className="font-semibold">{event.location}</span>
                              </div>
                              <div className="flex items-center space-x-2 text-sm">
                                <Users className="w-4 h-4 text-orange-600" />
                                <span className="font-semibold">{event.teams}</span>
                              </div>
                            </div>
                          </div>
                          <Badge className="bg-blue-100 text-blue-700 font-bold">Bizaza</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="achievements" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {achievements.map((achievement, index) => (
                  <motion.div key={achievement.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.1 }}>
                    <Card className={`border-2 border-yellow-200 bg-gradient-to-br ${achievement.color} text-white overflow-hidden`}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-center mb-4">
                          <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <achievement.icon className="w-12 h-12 text-white" />
                          </div>
                        </div>
                        <h3 className="text-xl font-black text-center mb-2">{achievement.title}</h3>
                        <p className="text-white/90 text-center font-semibold mb-4">{achievement.titleEn}</p>
                        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
                          <p className="text-2xl font-black">{achievement.position}</p>
                          <p className="text-sm text-white/80 font-semibold">{achievement.date}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default SportsPage;
