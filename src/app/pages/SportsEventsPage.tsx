import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Trophy, Medal, Target, Clock, MapPin, Users, Flag, TrendingUp, Award, Search, Filter, ChevronRight, ArrowRight, CheckCircle2, XCircle, Activity, Zap, Star, AlertCircle, PlayCircle, Pause, FastForward } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/app/components/ui/dialog';
import { Progress } from '@/app/components/ui/progress';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';
import { Separator } from '@/app/components/ui/separator';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';

interface SportsEvent {
  id: string;
  title: string;
  titleRw: string;
  sport: string;
  sportRw: string;
  category: 'football' | 'basketball' | 'volleyball' | 'athletics' | 'handball' | 'general';
  type: 'match' | 'tournament' | 'championship' | 'friendly' | 'practice';
  date: string;
  time: string;
  venue: string;
  venueRw: string;
  status: 'upcoming' | 'live' | 'completed' | 'cancelled' | 'postponed';
  homeTeam: {
    name: string;
    nameRw: string;
    logo: string;
    score?: number;
  };
  awayTeam: {
    name: string;
    nameRw: string;
    logo: string;
    score?: number;
  };
  description: string;
  descriptionRw: string;
  tickets: {
    available: number;
    total: number;
    price: number;
  };
  organizer: string;
  organizerRw: string;
  highlights?: string[];
  highlightsRw?: string[];
  attendance?: number;
  weather?: string;
  referee?: string;
  featured: boolean;
}

const SportsEventsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSport, setSelectedSport] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedEvent, setSelectedEvent] = useState<SportsEvent | null>(null);
  const [activeTab, setActiveTab] = useState('upcoming');

  const events: SportsEvent[] = [
    {
      id: 'ev1',
      title: 'Inter-School Football Championship Final',
      titleRw: 'Umukino wa Nyuma - Shampiyona y\'Amashuri',
      sport: 'Football',
      sportRw: 'Umupira w\'Amaguru',
      category: 'football',
      type: 'championship',
      date: '2024-03-15',
      time: '14:00',
      venue: 'IPRC Kigali Main Stadium',
      venueRw: 'Stade Nkuru ya IPRC Kigali',
      status: 'upcoming',
      homeTeam: {
        name: 'IPRC Kigali Warriors',
        nameRw: 'Intare za IPRC Kigali',
        logo: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=100&q=80'
      },
      awayTeam: {
        name: 'TVET Champions',
        nameRw: 'Shampiyoni za TVET',
        logo: 'https://images.unsplash.com/photo-1511886929837-354d827aae26?w=100&q=80'
      },
      description: 'The ultimate showdown between two powerhouse teams for the championship title.',
      descriptionRw: 'Umukino ukomeye hagati y\'amakipe abiri akomeye kugira ngo habone shampiyoni.',
      tickets: {
        available: 450,
        total: 500,
        price: 2000
      },
      organizer: 'IPRC Sports Department',
      organizerRw: 'Ishami ry\'Imikino muri IPRC',
      featured: true
    },
    {
      id: 'ev2',
      title: 'Girls Basketball League Match',
      titleRw: 'Umukino wa Basketball y\'Abakobwa',
      sport: 'Basketball',
      sportRw: 'Basketball',
      category: 'basketball',
      type: 'match',
      date: '2024-03-12',
      time: '15:30',
      venue: 'Indoor Sports Hall',
      venueRw: 'Icyumba cy\'Imikino',
      status: 'live',
      homeTeam: {
        name: 'IPRC Queens',
        nameRw: 'Abamikazi ba IPRC',
        logo: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=100&q=80',
        score: 42
      },
      awayTeam: {
        name: 'Tech Stars',
        nameRw: 'Inyenyeri za Tekiniki',
        logo: 'https://images.unsplash.com/photo-1608245449230-4ac19066d2d0?w=100&q=80',
        score: 38
      },
      description: 'Exciting basketball match in the regional league.',
      descriptionRw: 'Umukino ushimishije wa basketball mu ikipe y\'akarere.',
      tickets: {
        available: 120,
        total: 200,
        price: 1000
      },
      organizer: 'Women\'s Sports Association',
      organizerRw: 'Ishyirahamwe ry\'Imikino y\'Abagore',
      attendance: 180,
      featured: true
    },
    {
      id: 'ev3',
      title: 'Volleyball Tournament - Semi Finals',
      titleRw: 'Amarushanwa ya Volleyball - Semi Final',
      sport: 'Volleyball',
      sportRw: 'Volleyball',
      category: 'volleyball',
      type: 'tournament',
      date: '2024-03-10',
      time: '13:00',
      venue: 'Outdoor Courts',
      venueRw: 'Ibikumba byo Hanze',
      status: 'completed',
      homeTeam: {
        name: 'IPRC Spikers',
        nameRw: 'Abatera ba IPRC',
        logo: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=100&q=80',
        score: 3
      },
      awayTeam: {
        name: 'Tech Blockers',
        nameRw: 'Abahagarika ba Tech',
        logo: 'https://images.unsplash.com/photo-1593786481097-d0283d0d5f49?w=100&q=80',
        score: 1
      },
      description: 'Intense semi-final match with incredible rallies.',
      descriptionRw: 'Umukino ukomeye wa semi-final ufite imikino ihebuje.',
      tickets: {
        available: 0,
        total: 300,
        price: 1500
      },
      organizer: 'IPRC Athletics Department',
      organizerRw: 'Ishami ry\'Atletike muri IPRC',
      highlights: ['Amazing 25-point rally in set 3', 'Player of the match: Sarah Uwase', 'Record attendance'],
      highlightsRw: ['Umukino w\'amanota 25 uhebuje mu set ya 3', 'Umukinnyi w\'umukino: Sarah Uwase', 'Abantu benshi cyane'],
      attendance: 300,
      weather: 'Sunny, 24°C',
      referee: 'Emmanuel Habimana',
      featured: false
    },
    {
      id: 'ev4',
      title: 'Athletics Track & Field Championship',
      titleRw: 'Shampiyona y\'Atletike',
      sport: 'Athletics',
      sportRw: 'Atletike',
      category: 'athletics',
      type: 'championship',
      date: '2024-03-20',
      time: '09:00',
      venue: 'National Stadium',
      venueRw: 'Stade y\'Igihugu',
      status: 'upcoming',
      homeTeam: {
        name: 'IPRC Runners',
        nameRw: 'Abanyamaguru ba IPRC',
        logo: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=100&q=80'
      },
      awayTeam: {
        name: 'Regional Athletes',
        nameRw: 'Abakinnyi b\'Akarere',
        logo: 'https://images.unsplash.com/photo-1571731956672-f2b94d7dd0cb?w=100&q=80'
      },
      description: 'Annual athletics championship featuring 100m, 200m, 400m, long jump, and more.',
      descriptionRw: 'Shampiyona y\'atletike ya buri mwaka ifite 100m, 200m, 400m, gusimbuka kure, n\'ibindi.',
      tickets: {
        available: 800,
        total: 1000,
        price: 3000
      },
      organizer: 'National Athletics Federation',
      organizerRw: 'Federasiyo y\'Atletike y\'Igihugu',
      featured: true
    },
    {
      id: 'ev5',
      title: 'Handball Friendly Match',
      titleRw: 'Umukino w\'Ubucuti - Handball',
      sport: 'Handball',
      sportRw: 'Handball',
      category: 'handball',
      type: 'friendly',
      date: '2024-03-08',
      time: '16:00',
      venue: 'IPRC Handball Court',
      venueRw: 'Ikibuga cya Handball cya IPRC',
      status: 'completed',
      homeTeam: {
        name: 'IPRC Handlers',
        nameRw: 'Abakinnyi ba IPRC',
        logo: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=100&q=80',
        score: 28
      },
      awayTeam: {
        name: 'Youth Academy',
        nameRw: 'Ishuri ry\'Urubyiruko',
        logo: 'https://images.unsplash.com/photo-1511886929837-354d827aae26?w=100&q=80',
        score: 24
      },
      description: 'Pre-season friendly match to prepare for the upcoming league.',
      descriptionRw: 'Umukino w\'ubucuti wo kwitegura shampiyona izaza.',
      tickets: {
        available: 0,
        total: 150,
        price: 500
      },
      organizer: 'IPRC Handball Club',
      organizerRw: 'Club ya Handball ya IPRC',
      highlights: ['Fast-paced action', 'Great teamwork displayed', 'Promising young talent'],
      highlightsRw: ['Imikino yihuta', 'Gukorana neza kwerekanye', 'Impano nziza z\'urubyiruko'],
      attendance: 150,
      featured: false
    },
    {
      id: 'ev6',
      title: 'Annual Sports Day',
      titleRw: 'Umunsi w\'Imikino wa Buri Mwaka',
      sport: 'Multi-Sport',
      sportRw: 'Imikino Myinshi',
      category: 'general',
      type: 'tournament',
      date: '2024-03-25',
      time: '08:00',
      venue: 'IPRC Campus Grounds',
      venueRw: 'Ikibuga cya IPRC',
      status: 'upcoming',
      homeTeam: {
        name: 'All IPRC Students',
        nameRw: 'Abanyeshuri Bose ba IPRC',
        logo: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=100&q=80'
      },
      awayTeam: {
        name: 'Staff & Alumni',
        nameRw: 'Abakozi n\'Abahoze',
        logo: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=100&q=80'
      },
      description: 'A day filled with various sports activities, competitions, and fun events for everyone.',
      descriptionRw: 'Umunsi wuzuye imikino itandukanye, amarushanwa, n\'ibirori bishimishije abantu bose.',
      tickets: {
        available: 2000,
        total: 2000,
        price: 0
      },
      organizer: 'IPRC Student Council',
      organizerRw: 'Inama y\'Abanyeshuri ya IPRC',
      featured: true
    },
    {
      id: 'ev7',
      title: 'Football Derby Match',
      titleRw: 'Umukino wa Derby - Umupira w\'Amaguru',
      sport: 'Football',
      sportRw: 'Umupira w\'Amaguru',
      category: 'football',
      type: 'match',
      date: '2024-03-05',
      time: '15:00',
      venue: 'City Stadium',
      venueRw: 'Stade y\'Umujyi',
      status: 'completed',
      homeTeam: {
        name: 'IPRC Warriors',
        nameRw: 'Intare za IPRC',
        logo: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=100&q=80',
        score: 2
      },
      awayTeam: {
        name: 'City United',
        nameRw: 'United y\'Umujyi',
        logo: 'https://images.unsplash.com/photo-1511886929837-354d827aae26?w=100&q=80',
        score: 2
      },
      description: 'Thrilling derby match ended in a dramatic draw.',
      descriptionRw: 'Umukino ushimishije wa derby warangiye mu kigira nk\'uko.',
      tickets: {
        available: 0,
        total: 600,
        price: 2500
      },
      organizer: 'Regional Football Association',
      organizerRw: 'Ishyirahamwe ry\'Umupira w\'Amaguru ry\'Akarere',
      highlights: ['Two late goals in injury time', 'Man of the match: Jean Claude', 'Record-breaking attendance'],
      highlightsRw: ['Amanota 2 yinjiye mu gihe cy\'ikirenga', 'Umukinnyi w\'umukino: Jean Claude', 'Abantu benshi b\'amateka'],
      attendance: 600,
      weather: 'Cloudy, 22°C',
      referee: 'Patrick Nkusi',
      featured: false
    },
    {
      id: 'ev8',
      title: 'Basketball 3x3 Tournament',
      titleRw: 'Amarushanwa ya Basketball 3x3',
      sport: 'Basketball',
      sportRw: 'Basketball',
      category: 'basketball',
      type: 'tournament',
      date: '2024-03-18',
      time: '10:00',
      venue: 'Outdoor Basketball Court',
      venueRw: 'Ikibuga cya Basketball cyo Hanze',
      status: 'upcoming',
      homeTeam: {
        name: 'Street Ballers',
        nameRw: 'Abakinnyi b\'Umuhanda',
        logo: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=100&q=80'
      },
      awayTeam: {
        name: 'Campus Legends',
        nameRw: 'Abakinnyi b\'Amateka',
        logo: 'https://images.unsplash.com/photo-1608245449230-4ac19066d2d0?w=100&q=80'
      },
      description: '3x3 basketball tournament featuring the best street basketball players.',
      descriptionRw: 'Amarushanwa ya basketball 3x3 afite abakinnyi b\'umuhanda bakomeye.',
      tickets: {
        available: 250,
        total: 300,
        price: 1000
      },
      organizer: 'Urban Sports League',
      organizerRw: 'Shampiyona y\'Imikino y\'Umujyi',
      featured: false
    }
  ];

  const filteredEvents = events.filter(event => {
    const matchesSearch = 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.titleRw.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.sport.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.homeTeam.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.awayTeam.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSport = selectedSport === 'all' || event.category === selectedSport;
    const matchesType = selectedType === 'all' || event.type === selectedType;
    const matchesTab = activeTab === 'all' || event.status === activeTab;

    return matchesSearch && matchesSport && matchesType && matchesTab;
  });

  const stats = [
    { 
      label: 'Ibirori Byose', 
      value: events.length.toString(), 
      icon: Calendar, 
      color: 'from-blue-600 to-cyan-600',
      description: 'Byose hamwe'
    },
    { 
      label: 'Bizatangira', 
      value: events.filter(e => e.status === 'upcoming').length.toString(), 
      icon: Clock, 
      color: 'from-green-600 to-emerald-600',
      description: 'Bitegerejwe'
    },
    { 
      label: 'Biragenda', 
      value: events.filter(e => e.status === 'live').length.toString(), 
      icon: PlayCircle, 
      color: 'from-red-600 to-orange-600',
      description: 'Kuri Live'
    },
    { 
      label: 'Byarangiye', 
      value: events.filter(e => e.status === 'completed').length.toString(), 
      icon: CheckCircle2, 
      color: 'from-purple-600 to-indigo-600',
      description: 'Byararangiye'
    }
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      upcoming: { label: 'Bizatangira', color: 'bg-blue-100 text-blue-700 border-blue-300', icon: Clock },
      live: { label: 'Live', color: 'bg-red-100 text-red-700 border-red-300 animate-pulse', icon: PlayCircle },
      completed: { label: 'Byarangiye', color: 'bg-green-100 text-green-700 border-green-300', icon: CheckCircle2 },
      cancelled: { label: 'Byahagaritswe', color: 'bg-gray-100 text-gray-700 border-gray-300', icon: XCircle },
      postponed: { label: 'Byimuwe', color: 'bg-yellow-100 text-yellow-700 border-yellow-300', icon: AlertCircle }
    };
    const config = statusConfig[status as keyof typeof statusConfig];
    const IconComponent = config.icon;
    return (
      <Badge className={`${config.color} border-2 font-semibold flex items-center gap-1`}>
        <IconComponent className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      match: { label: 'Umukino', color: 'bg-blue-100 text-blue-700 border-blue-300' },
      tournament: { label: 'Amarushanwa', color: 'bg-purple-100 text-purple-700 border-purple-300' },
      championship: { label: 'Shampiyona', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
      friendly: { label: 'Ubucuti', color: 'bg-green-100 text-green-700 border-green-300' },
      practice: { label: 'Imyitozo', color: 'bg-gray-100 text-gray-700 border-gray-300' }
    };
    const config = typeConfig[type as keyof typeof typeConfig];
    return <Badge className={`${config.color} border font-medium`}>{config.label}</Badge>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-orange-600 to-red-600 rounded-xl shadow-lg">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Ibirori bya Siporo
              </h1>
              <p className="text-gray-600">Sports Events & Calendar</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-2 hover:shadow-xl transition-all duration-300 cursor-pointer group">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <div className={`p-3 bg-gradient-to-br ${stat.color} rounded-lg group-hover:scale-110 transition-transform`}>
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-orange-600 group-hover:translate-x-1 transition-all" />
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                    <p className="text-sm font-semibold text-gray-700">{stat.label}</p>
                    <p className="text-xs text-gray-500">{stat.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <Card className="mb-8 border-2 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Search className="w-6 h-6 text-orange-600" />
                  Shakisha Ibirori
                </CardTitle>
                <CardDescription>Search and filter sports events</CardDescription>
              </div>
              <div className="flex flex-wrap gap-3">
                <Select value={selectedSport} onValueChange={setSelectedSport}>
                  <SelectTrigger className="w-[180px] border-2">
                    <SelectValue placeholder="Hitamo Siporo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Siporo Zose</SelectItem>
                    <SelectItem value="football">Umupira w'Amaguru</SelectItem>
                    <SelectItem value="basketball">Basketball</SelectItem>
                    <SelectItem value="volleyball">Volleyball</SelectItem>
                    <SelectItem value="athletics">Atletike</SelectItem>
                    <SelectItem value="handball">Handball</SelectItem>
                    <SelectItem value="general">Izindi</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-[180px] border-2">
                    <SelectValue placeholder="Hitamo Ubwoko" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Byose</SelectItem>
                    <SelectItem value="match">Imikino</SelectItem>
                    <SelectItem value="tournament">Amarushanwa</SelectItem>
                    <SelectItem value="championship">Shampiyona</SelectItem>
                    <SelectItem value="friendly">Ubucuti</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Shakisha ikirori, ikipe, cyangwa aho..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-2 h-12 text-lg"
              />
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto border-2">
            <TabsTrigger value="all" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">
              Byose
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Bizatangira
            </TabsTrigger>
            <TabsTrigger value="live" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
              Live
            </TabsTrigger>
            <TabsTrigger value="completed" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
              Byarangiye
            </TabsTrigger>
            <TabsTrigger value="postponed" className="data-[state=active]:bg-yellow-600 data-[state=active]:text-white">
              Byimuwe
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <AnimatePresence mode="popLayout">
            {filteredEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                layout
              >
                <Card 
                  className={`border-2 hover:shadow-2xl transition-all duration-300 cursor-pointer group overflow-hidden ${
                    event.featured ? 'ring-2 ring-orange-400 ring-offset-2' : ''
                  }`}
                  onClick={() => setSelectedEvent(event)}
                >
                  {event.featured && (
                    <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white text-center py-1 text-xs font-bold flex items-center justify-center gap-1">
                      <Star className="w-3 h-3 fill-white" />
                      FEATURED EVENT
                    </div>
                  )}
                  
                  <CardHeader className="bg-gradient-to-br from-orange-50 to-red-50 pb-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-2">
                          {event.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">{event.titleRw}</p>
                      </div>
                      {getStatusBadge(event.status)}
                    </div>

                    <div className="flex items-center gap-2">
                      {getTypeBadge(event.type)}
                      <Badge variant="outline" className="border-orange-300 text-orange-700">
                        {event.sport}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between mb-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3 flex-1">
                        <img src={event.homeTeam.logo} alt={event.homeTeam.name} className="w-12 h-12 rounded-full object-cover border-2 border-orange-200" />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 truncate">{event.homeTeam.name}</p>
                          <p className="text-xs text-gray-500 truncate">{event.homeTeam.nameRw}</p>
                        </div>
                        {event.homeTeam.score !== undefined && (
                          <span className="text-2xl font-bold text-orange-600">{event.homeTeam.score}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-center my-2">
                      <div className="flex items-center gap-2 text-gray-500 font-semibold">
                        <div className="h-px w-8 bg-gray-300"></div>
                        <span className="text-sm">VS</span>
                        <div className="h-px w-8 bg-gray-300"></div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3 flex-1">
                        <img src={event.awayTeam.logo} alt={event.awayTeam.name} className="w-12 h-12 rounded-full object-cover border-2 border-orange-200" />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 truncate">{event.awayTeam.name}</p>
                          <p className="text-xs text-gray-500 truncate">{event.awayTeam.nameRw}</p>
                        </div>
                        {event.awayTeam.score !== undefined && (
                          <span className="text-2xl font-bold text-orange-600">{event.awayTeam.score}</span>
                        )}
                      </div>
                    </div>

                    <Separator className="my-4" />

                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-orange-600 flex-shrink-0" />
                        <span className="text-gray-700 font-medium">
                          {new Date(event.date).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-orange-600 flex-shrink-0" />
                        <span className="text-gray-700 font-medium">{event.time}</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-orange-600 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-700 font-medium truncate">{event.venue}</p>
                          <p className="text-gray-500 text-xs truncate">{event.venueRw}</p>
                        </div>
                      </div>

                      {event.status === 'upcoming' && (
                        <div className="pt-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-600">Amaticket Asigaye</span>
                            <span className="text-xs font-semibold text-gray-700">
                              {event.tickets.available}/{event.tickets.total}
                            </span>
                          </div>
                          <Progress 
                            value={(event.tickets.available / event.tickets.total) * 100} 
                            className="h-2"
                          />
                          {event.tickets.price > 0 && (
                            <p className="text-sm text-orange-600 font-bold mt-2">
                              {event.tickets.price.toLocaleString()} RWF
                            </p>
                          )}
                        </div>
                      )}

                      {event.attendance && (
                        <div className="flex items-center gap-2 text-sm pt-2 bg-green-50 p-2 rounded">
                          <Users className="w-4 h-4 text-green-600" />
                          <span className="text-green-700 font-semibold">{event.attendance} abantu</span>
                        </div>
                      )}
                    </div>

                    <Button 
                      className="w-full mt-4 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white group-hover:shadow-lg transition-all"
                    >
                      Reba Amakuru Yuzuye
                      <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredEvents.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Nta birori byabonetse</h3>
            <p className="text-gray-500">Gerageza guhindura amashakiro yawe</p>
          </motion.div>
        )}

        <AnimatePresence>
          {selectedEvent && (
            <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <DialogTitle className="text-2xl mb-2">{selectedEvent.title}</DialogTitle>
                      <DialogDescription className="text-base">{selectedEvent.titleRw}</DialogDescription>
                    </div>
                    {selectedEvent.featured && (
                      <Badge className="bg-gradient-to-r from-orange-600 to-red-600 text-white border-0 flex items-center gap-1">
                        <Star className="w-3 h-3 fill-white" />
                        Featured
                      </Badge>
                    )}
                  </div>
                </DialogHeader>

                <div className="space-y-6 mt-4">
                  <div className="flex flex-wrap gap-2">
                    {getStatusBadge(selectedEvent.status)}
                    {getTypeBadge(selectedEvent.type)}
                    <Badge variant="outline" className="border-orange-300 text-orange-700">
                      {selectedEvent.sport} • {selectedEvent.sportRw}
                    </Badge>
                  </div>

                  <Card className="border-2">
                    <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50">
                      <CardTitle className="flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-orange-600" />
                        Amakipe
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                          <img 
                            src={selectedEvent.homeTeam.logo} 
                            alt={selectedEvent.homeTeam.name} 
                            className="w-16 h-16 rounded-full object-cover border-4 border-orange-200"
                          />
                          <div className="flex-1">
                            <p className="font-bold text-lg text-gray-900">{selectedEvent.homeTeam.name}</p>
                            <p className="text-gray-600">{selectedEvent.homeTeam.nameRw}</p>
                            <Badge className="mt-1 bg-orange-100 text-orange-700">Home Team</Badge>
                          </div>
                          {selectedEvent.homeTeam.score !== undefined && (
                            <div className="text-4xl font-bold text-orange-600">
                              {selectedEvent.homeTeam.score}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-center">
                          <div className="px-4 py-2 bg-gray-100 rounded-full font-bold text-gray-600">VS</div>
                        </div>

                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                          <img 
                            src={selectedEvent.awayTeam.logo} 
                            alt={selectedEvent.awayTeam.name} 
                            className="w-16 h-16 rounded-full object-cover border-4 border-orange-200"
                          />
                          <div className="flex-1">
                            <p className="font-bold text-lg text-gray-900">{selectedEvent.awayTeam.name}</p>
                            <p className="text-gray-600">{selectedEvent.awayTeam.nameRw}</p>
                            <Badge className="mt-1 bg-blue-100 text-blue-700">Away Team</Badge>
                          </div>
                          {selectedEvent.awayTeam.score !== undefined && (
                            <div className="text-4xl font-bold text-orange-600">
                              {selectedEvent.awayTeam.score}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="border-2">
                      <CardHeader className="bg-orange-50">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-orange-600" />
                          Igihe n'Aho
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4 space-y-3">
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Itariki</p>
                          <p className="font-semibold text-gray-900">
                            {new Date(selectedEvent.date).toLocaleDateString('en-US', { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Isaha</p>
                          <p className="font-semibold text-gray-900">{selectedEvent.time}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Aho</p>
                          <p className="font-semibold text-gray-900">{selectedEvent.venue}</p>
                          <p className="text-sm text-gray-600">{selectedEvent.venueRw}</p>
                        </div>
                        {selectedEvent.weather && (
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Ikirere</p>
                            <p className="font-semibold text-gray-900">{selectedEvent.weather}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card className="border-2">
                      <CardHeader className="bg-purple-50">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Users className="w-5 h-5 text-purple-600" />
                          Amakuru y'Ibirori
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4 space-y-3">
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Uwateguye</p>
                          <p className="font-semibold text-gray-900">{selectedEvent.organizer}</p>
                          <p className="text-sm text-gray-600">{selectedEvent.organizerRw}</p>
                        </div>
                        {selectedEvent.referee && (
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Referee</p>
                            <p className="font-semibold text-gray-900">{selectedEvent.referee}</p>
                          </div>
                        )}
                        {selectedEvent.attendance && (
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Abantu Babashyizeho</p>
                            <p className="font-semibold text-gray-900 flex items-center gap-2">
                              <Users className="w-4 h-4 text-green-600" />
                              {selectedEvent.attendance.toLocaleString()}
                            </p>
                          </div>
                        )}
                        {selectedEvent.status === 'upcoming' && (
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Amaticket</p>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium">
                                {selectedEvent.tickets.available}/{selectedEvent.tickets.total}
                              </span>
                              <span className="text-sm text-gray-600">
                                {Math.round((selectedEvent.tickets.available / selectedEvent.tickets.total) * 100)}% available
                              </span>
                            </div>
                            <Progress 
                              value={(selectedEvent.tickets.available / selectedEvent.tickets.total) * 100} 
                              className="h-2 mb-2"
                            />
                            {selectedEvent.tickets.price > 0 ? (
                              <p className="text-lg font-bold text-orange-600">
                                {selectedEvent.tickets.price.toLocaleString()} RWF
                              </p>
                            ) : (
                              <Badge className="bg-green-100 text-green-700 border-green-300 border">
                                Kubuntu / Free
                              </Badge>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="border-2">
                    <CardHeader className="bg-blue-50">
                      <CardTitle className="flex items-center gap-2">
                        <Target className="w-5 h-5 text-blue-600" />
                        Ibisobanuro
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <p className="text-gray-700 mb-2">{selectedEvent.description}</p>
                      <p className="text-gray-600 italic">{selectedEvent.descriptionRw}</p>
                    </CardContent>
                  </Card>

                  {selectedEvent.highlights && selectedEvent.highlights.length > 0 && (
                    <Card className="border-2">
                      <CardHeader className="bg-yellow-50">
                        <CardTitle className="flex items-center gap-2">
                          <Zap className="w-5 h-5 text-yellow-600" />
                          Ibyerekana Cyane / Highlights
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <div className="space-y-3">
                          {selectedEvent.highlights.map((highlight, index) => (
                            <div key={index} className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                              <Star className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5 fill-yellow-600" />
                              <div className="flex-1">
                                <p className="font-semibold text-gray-900">{highlight}</p>
                                {selectedEvent.highlightsRw && selectedEvent.highlightsRw[index] && (
                                  <p className="text-sm text-gray-600 mt-1">{selectedEvent.highlightsRw[index]}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <div className="flex gap-3 pt-4">
                    {selectedEvent.status === 'upcoming' && selectedEvent.tickets.available > 0 && (
                      <Button className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white">
                        <Trophy className="w-4 h-4 mr-2" />
                        Gura Ticket
                      </Button>
                    )}
                    <Button variant="outline" className="flex-1 border-2">
                      <Download className="w-4 h-4 mr-2" />
                      Download Details
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SportsEventsPage;
