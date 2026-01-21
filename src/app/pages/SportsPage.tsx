import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Users, Calendar, Award, Medal, Target, TrendingUp, Star, Search, MapPin, Clock, ChevronRight, Play, Heart, Zap, ArrowLeft, Volleyball } from 'lucide-react';
import { Card, CardContent } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';
import { useLanguage } from '@/app/contexts/LanguageContext';

interface SportsPageProps {
  onNavigate?: (page: string) => void;
}

const sportCategories = [
  {
    id: 'football',
    name: 'Football',
    nameRw: 'Umupira w\'Amaguru',
    icon: '⚽',
    color: 'from-green-500 to-emerald-600',
    bgColor: 'from-green-50 to-emerald-50',
    borderColor: 'border-green-200 hover:border-green-400',
    image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&q=80',
    teamCount: 22,
    trophies: 8,
    nextMatch: '2024-03-01',
    description: 'Ikipe y\'umupira wamaguru igira umwanya w\'icyubahiro mu mashuri yacu',
    page: 'sport-football'
  },
  {
    id: 'volleyball',
    name: 'Volleyball',
    nameRw: 'Volleyball',
    icon: '🏐',
    color: 'from-blue-500 to-indigo-600',
    bgColor: 'from-blue-50 to-indigo-50',
    borderColor: 'border-blue-200 hover:border-blue-400',
    image: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800&q=80',
    teamCount: 12,
    trophies: 5,
    nextMatch: '2024-02-28',
    description: 'Abakinnyi b\'umupira wo mu kirere batwigishije ubuhanga n\'imbaraga',
    page: 'sport-volleyball'
  },
  {
    id: 'basketball',
    name: 'Basketball',
    nameRw: 'Umupira wo mu Gatebo',
    icon: '🏀',
    color: 'from-orange-500 to-red-600',
    bgColor: 'from-orange-50 to-red-50',
    borderColor: 'border-orange-200 hover:border-orange-400',
    image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&q=80',
    teamCount: 15,
    trophies: 6,
    nextMatch: '2024-02-25',
    description: 'Ikipe ya Basketball yatsinze igikombe cy\'intara mu mwaka ushize',
    page: 'sport-basketball'
  },
  {
    id: 'athletics',
    name: 'Athletics',
    nameRw: 'Siporo z\'Umubiri',
    icon: '🏃',
    color: 'from-yellow-500 to-amber-600',
    bgColor: 'from-yellow-50 to-amber-50',
    borderColor: 'border-yellow-200 hover:border-yellow-400',
    image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=80',
    teamCount: 30,
    trophies: 12,
    nextMatch: '2024-03-05',
    description: 'Abanyeshuri bacu ni abazanyi bakomeye mu kwiruka no gusimbuka',
    page: 'sport-athletics'
  },
  {
    id: 'handball',
    name: 'Handball',
    nameRw: 'Umupira w\'Intoki',
    icon: '🤾',
    color: 'from-purple-500 to-violet-600',
    bgColor: 'from-purple-50 to-violet-50',
    borderColor: 'border-purple-200 hover:border-purple-400',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    teamCount: 14,
    trophies: 3,
    nextMatch: '2024-03-10',
    description: 'Ikipe y\'umupira w\'intoki igenda itera imbere buri mwaka',
    page: 'sport-handball'
  },
  {
    id: 'tennis',
    name: 'Table Tennis',
    nameRw: 'Tenisi y\'Ameza',
    icon: '🏓',
    color: 'from-cyan-500 to-teal-600',
    bgColor: 'from-cyan-50 to-teal-50',
    borderColor: 'border-cyan-200 hover:border-cyan-400',
    image: 'https://images.unsplash.com/photo-1534158914592-062992fbe900?w=800&q=80',
    teamCount: 8,
    trophies: 4,
    nextMatch: '2024-03-08',
    description: 'Abanyeshuri bacu bafite ubuhanga bwihariye muri tenisi y\'ameza',
    page: 'sport-tennis'
  }
];

const upcomingMatches = [
  { id: 1, sport: 'Basketball', opponent: 'Lycée de Kigali', date: '2024-02-25', time: '14:00', location: 'Kibagabaga Stadium', sportIcon: '🏀' },
  { id: 2, sport: 'Volleyball', opponent: 'IPRC Kigali', date: '2024-02-28', time: '15:30', location: 'School Court', sportIcon: '🏐' },
  { id: 3, sport: 'Football', opponent: 'GS Remera', date: '2024-03-01', time: '14:00', location: 'Amahoro Stadium', sportIcon: '⚽' },
  { id: 4, sport: 'Athletics', opponent: 'Regional Championship', date: '2024-03-05', time: '08:00', location: 'Nyamirambo Stadium', sportIcon: '🏃' },
];

const recentAchievements = [
  { id: 1, title: 'Igikombe cya Basketball 2023', position: '🥇 1st Place', sport: 'Basketball', date: '2023-12-15' },
  { id: 2, title: 'Igikombe cya Football', position: '🥈 2nd Place', sport: 'Football', date: '2023-11-20' },
  { id: 3, title: 'MVP wa Volleyball', position: '⭐ MVP Award', sport: 'Volleyball', date: '2023-10-10' },
  { id: 4, title: 'Amarushanwa y\'Intara', position: '🥇 1st Place', sport: 'Athletics', date: '2023-09-25' },
];

const SportsPage: React.FC<SportsPageProps> = ({ onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredSport, setHoveredSport] = useState<string | null>(null);
  const { language } = useLanguage();

  const filteredSports = sportCategories.filter(sport =>
    sport.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sport.nameRw.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = [
    { label: language === 'rw' ? 'Siporo' : 'Sports', value: sportCategories.length.toString(), icon: Zap, color: 'from-purple-600 to-pink-600' },
    { label: language === 'rw' ? 'Abakinnyi' : 'Athletes', value: '100+', icon: Users, color: 'from-blue-600 to-indigo-600' },
    { label: language === 'rw' ? 'Ibihembo' : 'Trophies', value: '38', icon: Trophy, color: 'from-yellow-600 to-orange-600' },
    { label: language === 'rw' ? 'Imikino' : 'Matches', value: '50+', icon: Calendar, color: 'from-green-600 to-emerald-600' },
  ];

  const handleNavigate = (page: string) => {
    if (onNavigate) {
      onNavigate(page);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      {/* Hero Section */}
      <div className="relative h-80 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1600&q=80"
          alt="Sports"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-orange-600/90 via-red-600/80 to-orange-600/90" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
        
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-4"
          >
            <Trophy className="w-12 h-12 text-yellow-400" />
            <Badge className="bg-white/20 backdrop-blur-sm text-white text-lg px-6 py-2 border-0 font-bold">
              Garden TVET Sports
            </Badge>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-6xl font-black text-white mb-4"
          >
            {language === 'rw' ? 'Siporo z\'Ishuri' : 'School Sports'}
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-xl text-orange-100 max-w-2xl"
          >
            {language === 'rw' 
              ? 'Amakipe, Intsinzi n\'Imikino - Twigishe uburyo bwo gutsinda!' 
              : 'Teams, Victories & Matches - Learn the way of champions!'}
          </motion.p>
        </div>

        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => handleNavigate('home')}
          className="absolute top-4 left-4 text-white hover:bg-white/20"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          {language === 'rw' ? 'Ahabanza' : 'Home'}
        </Button>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 -mt-16 relative z-10">
        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-white shadow-xl border-2 border-orange-100 hover:shadow-2xl transition-all">
                <CardContent className="p-5 text-center">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mx-auto mb-3 shadow-lg`}>
                    <stat.icon className="w-7 h-7 text-white" />
                  </div>
                  <p className="text-3xl font-black text-gray-900 mb-1">{stat.value}</p>
                  <p className="text-sm font-semibold text-gray-600">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl border-2 border-orange-100 p-6 mb-8"
        >
          <div className="flex items-center gap-4">
            <Search className="w-6 h-6 text-orange-600" />
            <Input
              placeholder={language === 'rw' ? 'Shakisha siporo...' : 'Search sports...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 text-lg border-2 border-orange-200 focus:border-orange-400"
            />
          </div>
        </motion.div>

        {/* Sport Categories Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-6">
            <Zap className="w-8 h-8 text-orange-600" />
            <h2 className="text-3xl font-black text-gray-900">
              {language === 'rw' ? 'Amakipe n\'Siporo' : 'Teams & Sports'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredSports.map((sport, index) => (
                <motion.div
                  key={sport.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.1 }}
                  onMouseEnter={() => setHoveredSport(sport.id)}
                  onMouseLeave={() => setHoveredSport(null)}
                  onClick={() => handleNavigate(sport.page)}
                  className="cursor-pointer"
                >
                  <Card className={`overflow-hidden border-2 ${sport.borderColor} hover:shadow-2xl transition-all duration-300 group`}>
                    {/* Image Header */}
                    <div className="relative h-48 overflow-hidden">
                      <motion.img
                        src={sport.image}
                        alt={sport.name}
                        className="w-full h-full object-cover"
                        animate={{ scale: hoveredSport === sport.id ? 1.1 : 1 }}
                        transition={{ duration: 0.4 }}
                      />
                      <div className={`absolute inset-0 bg-gradient-to-t ${sport.color} opacity-60 mix-blend-multiply`} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                      
                      {/* Sport Icon */}
                      <motion.div
                        className="absolute top-4 left-4 text-5xl"
                        animate={{ 
                          rotate: hoveredSport === sport.id ? 10 : 0,
                          scale: hoveredSport === sport.id ? 1.2 : 1 
                        }}
                      >
                        {sport.icon}
                      </motion.div>

                      {/* Trophy Count */}
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-lg">
                        <div className="flex items-center gap-1">
                          <Trophy className="w-4 h-4 text-yellow-500" />
                          <span className="font-black text-sm">{sport.trophies}</span>
                        </div>
                      </div>

                      {/* Title */}
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-2xl font-black text-white mb-1">
                          {language === 'rw' ? sport.nameRw : sport.name}
                        </h3>
                        <div className="flex items-center gap-2 text-white/80">
                          <Users className="w-4 h-4" />
                          <span className="text-sm font-semibold">{sport.teamCount} {language === 'rw' ? 'abakinnyi' : 'players'}</span>
                        </div>
                      </div>
                    </div>

                    <CardContent className="p-5">
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {sport.description}
                      </p>

                      {/* Next Match */}
                      <div className={`bg-gradient-to-r ${sport.bgColor} rounded-lg p-3 mb-4 border border-gray-100`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-600" />
                            <span className="text-sm font-semibold text-gray-600">
                              {language === 'rw' ? 'Umukino Utaha' : 'Next Match'}
                            </span>
                          </div>
                          <Badge className={`bg-gradient-to-r ${sport.color} text-white text-xs font-bold`}>
                            {sport.nextMatch}
                          </Badge>
                        </div>
                      </div>

                      <Button className={`w-full bg-gradient-to-r ${sport.color} text-white font-bold shadow-lg hover:shadow-xl transition-all group-hover:scale-[1.02]`}>
                        {language === 'rw' ? 'Reba Byinshi' : 'View Details'}
                        <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Upcoming Matches Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-6">
            <Calendar className="w-8 h-8 text-blue-600" />
            <h2 className="text-3xl font-black text-gray-900">
              {language === 'rw' ? 'Imikino Izaza' : 'Upcoming Matches'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingMatches.map((match, index) => (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
              >
                <Card className="border-2 border-blue-100 hover:border-blue-300 hover:shadow-xl transition-all">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="text-4xl">{match.sportIcon}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-bold text-gray-900">
                            Garden TVET vs {match.opponent}
                          </h3>
                          <Badge className="bg-blue-100 text-blue-700 font-semibold">
                            {match.sport}
                          </Badge>
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4 text-blue-500" />
                            <span className="font-semibold">{match.date}</span>
                            <Clock className="w-4 h-4 text-blue-500 ml-2" />
                            <span>{match.time}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="w-4 h-4 text-blue-500" />
                            <span>{match.location}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <Trophy className="w-8 h-8 text-yellow-600" />
            <h2 className="text-3xl font-black text-gray-900">
              {language === 'rw' ? 'Intsinzi z\'Ubu Bwa Vuba' : 'Recent Achievements'}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentAchievements.map((achievement, index) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.9 + index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <Card className="border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50 hover:shadow-xl transition-all overflow-hidden">
                  <CardContent className="p-5 text-center">
                    <div className="text-4xl mb-3">{achievement.position.split(' ')[0]}</div>
                    <h3 className="font-bold text-gray-900 mb-1 text-sm">{achievement.title}</h3>
                    <Badge className="bg-yellow-100 text-yellow-700 font-semibold mb-2">
                      {achievement.sport}
                    </Badge>
                    <p className="text-xs text-gray-500">{achievement.date}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="mt-12 text-center"
        >
          <Card className="bg-gradient-to-r from-orange-500 via-red-500 to-orange-500 border-0 shadow-2xl">
            <CardContent className="p-8">
              <h3 className="text-2xl md:text-3xl font-black text-white mb-4">
                {language === 'rw' ? 'Ushaka Kujya mu Ikipe?' : 'Want to Join a Team?'}
              </h3>
              <p className="text-orange-100 mb-6 max-w-2xl mx-auto">
                {language === 'rw' 
                  ? 'Iyandikishe kugira ngo ube umwe mu bakinnyi bacu. Twigishe, dukine, dutsinde hamwe!' 
                  : 'Register to become one of our athletes. Learn, play, and win together!'}
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button
                  size="lg"
                  onClick={() => handleNavigate('register')}
                  className="bg-white text-orange-600 hover:bg-orange-50 font-bold shadow-lg hover:shadow-xl"
                >
                  <Heart className="w-5 h-5 mr-2" />
                  {language === 'rw' ? 'Iyandikishe' : 'Register Now'}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => handleNavigate('contactUs')}
                  className="border-2 border-white text-white hover:bg-white/20 font-bold"
                >
                  <Play className="w-5 h-5 mr-2" />
                  {language === 'rw' ? 'Twandikire' : 'Contact Us'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default SportsPage;
