import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Trophy, Medal, Target, Star, Shield, Activity, TrendingUp, Award, Search, Filter, Calendar, MapPin, User, Phone, Mail, Facebook, Instagram, Twitter, Crown, Zap, Heart, Flag, ChevronRight, ArrowRight, UserPlus, X } from 'lucide-react';
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

interface TeamMember {
  id: string;
  name: string;
  photo: string;
  position: string;
  positionRw: string;
  jerseyNumber: number;
  role: 'captain' | 'vice-captain' | 'player' | 'goalkeeper';
  trade: string;
  level: string;
  stats: {
    matches: number;
    goals?: number;
    assists?: number;
    saves?: number;
    points?: number;
  };
}

interface SportsTeam {
  id: string;
  name: string;
  nameRw: string;
  sport: string;
  sportRw: string;
  category: 'football' | 'basketball' | 'volleyball' | 'athletics' | 'handball';
  gender: 'male' | 'female' | 'mixed';
  logo: string;
  banner: string;
  established: string;
  coach: {
    name: string;
    photo: string;
    experience: string;
    achievements: string[];
  };
  captain: string;
  members: TeamMember[];
  achievements: {
    year: string;
    title: string;
    titleRw: string;
    position: string;
  }[];
  stats: {
    matches: number;
    wins: number;
    draws: number;
    losses: number;
    goalsFor?: number;
    goalsAgainst?: number;
    points: number;
  };
  upcoming: {
    date: string;
    opponent: string;
    venue: string;
    time: string;
  }[];
  description: string;
  descriptionRw: string;
  colors: {
    primary: string;
    secondary: string;
  };
  socialMedia: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
  trainingSchedule: {
    day: string;
    time: string;
    venue: string;
  }[];
}

const SportsTeamsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSport, setSelectedSport] = useState<string>('all');
  const [selectedGender, setSelectedGender] = useState<string>('all');
  const [selectedTeam, setSelectedTeam] = useState<SportsTeam | null>(null);
  const [activeTab, setActiveTab] = useState('all');

  const teams: SportsTeam[] = [
    {
      id: 't1',
      name: 'IPRC Kigali Lions',
      nameRw: 'Intare za IPRC Kigali',
      sport: 'Football',
      sportRw: 'Umupira w\'Amaguru',
      category: 'football',
      gender: 'male',
      logo: 'https://images.unsplash.com/photo-1606925797300-0b35e9d1794e?w=400&q=80',
      banner: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&q=80',
      established: '2018',
      coach: {
        name: 'Coach Emmanuel Nkurunziza',
        photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80',
        experience: '15 years',
        achievements: ['National Championship 2022', 'Regional Cup 2023', 'Best Coach Award 2022']
      },
      captain: 'Jean Pierre Uwimana',
      members: [
        {
          id: 'm1',
          name: 'Jean Pierre Uwimana',
          photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
          position: 'Forward',
          positionRw: 'Intsinzi',
          jerseyNumber: 10,
          role: 'captain',
          trade: 'SOD',
          level: 'Level 4',
          stats: { matches: 25, goals: 18, assists: 12 }
        },
        {
          id: 'm2',
          name: 'Patrick Habimana',
          photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80',
          position: 'Midfielder',
          positionRw: 'Hagati',
          jerseyNumber: 8,
          role: 'vice-captain',
          trade: 'BDC',
          level: 'Level 4',
          stats: { matches: 24, goals: 10, assists: 15 }
        },
        {
          id: 'm3',
          name: 'David Mugabo',
          photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80',
          position: 'Goalkeeper',
          positionRw: 'Umurinzi w\'Urubuga',
          jerseyNumber: 1,
          role: 'goalkeeper',
          trade: 'AUT',
          level: 'Level 3',
          stats: { matches: 25, saves: 87 }
        },
        {
          id: 'm4',
          name: 'Frank Kayitare',
          photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80',
          position: 'Defender',
          positionRw: 'Umurinzi',
          jerseyNumber: 5,
          role: 'player',
          trade: 'SOD',
          level: 'Level 3',
          stats: { matches: 23, goals: 3, assists: 5 }
        }
      ],
      achievements: [
        { year: '2023', title: 'Regional Cup Champions', titleRw: 'Abatsinzi ba Cup y\'Akarere', position: '1st' },
        { year: '2022', title: 'National Schools League', titleRw: 'Ligi y\'Amashuri y\'Igihugu', position: '2nd' },
        { year: '2021', title: 'IPRC Sports Festival', titleRw: 'Umunani wa Siporo wa IPRC', position: '1st' }
      ],
      stats: {
        matches: 25,
        wins: 18,
        draws: 4,
        losses: 3,
        goalsFor: 52,
        goalsAgainst: 18,
        points: 58
      },
      upcoming: [
        { date: '2024-03-15', opponent: 'IPRC Huye Stars', venue: 'Amahoro Stadium', time: '15:00' },
        { date: '2024-03-22', opponent: 'IPRC Musanze Eagles', venue: 'Home Ground', time: '14:00' }
      ],
      description: 'The Lions are the pride of IPRC Kigali, known for their aggressive attacking style and solid defense.',
      descriptionRw: 'Intare ni ishema rya IPRC Kigali, zizwiho uburyo bwo gutera no kwirinda neza.',
      colors: {
        primary: '#1E40AF',
        secondary: '#FCD34D'
      },
      socialMedia: {
        facebook: 'https://facebook.com/iprclions',
        instagram: 'https://instagram.com/iprclions',
        twitter: 'https://twitter.com/iprclions'
      },
      trainingSchedule: [
        { day: 'Monday', time: '16:00 - 18:00', venue: 'Main Field' },
        { day: 'Wednesday', time: '16:00 - 18:00', venue: 'Main Field' },
        { day: 'Friday', time: '16:00 - 18:00', venue: 'Main Field' },
        { day: 'Saturday', time: '09:00 - 11:00', venue: 'Main Field' }
      ]
    },
    {
      id: 't2',
      name: 'IPRC Queens',
      nameRw: 'Imikenyezi ya IPRC',
      sport: 'Basketball',
      sportRw: 'Umupira w\'Agatebo',
      category: 'basketball',
      gender: 'female',
      logo: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&q=80',
      banner: 'https://images.unsplash.com/photo-1608245449230-4ac19066d2d0?w=1200&q=80',
      established: '2019',
      coach: {
        name: 'Coach Marie Uwase',
        photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80',
        experience: '12 years',
        achievements: ['National Championship 2023', 'Best Female Coach 2023']
      },
      captain: 'Marie Claire Mukamana',
      members: [
        {
          id: 'm5',
          name: 'Marie Claire Mukamana',
          photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80',
          position: 'Point Guard',
          positionRw: 'Umurinzi w\'Amanota',
          jerseyNumber: 7,
          role: 'captain',
          trade: 'SOD',
          level: 'Level 4',
          stats: { matches: 22, points: 385 }
        },
        {
          id: 'm6',
          name: 'Grace Uwera',
          photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80',
          position: 'Center',
          positionRw: 'Hagati',
          jerseyNumber: 12,
          role: 'vice-captain',
          trade: 'BDC',
          level: 'Level 3',
          stats: { matches: 22, points: 298 }
        },
        {
          id: 'm7',
          name: 'Claire Mukeshimana',
          photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80',
          position: 'Shooting Guard',
          positionRw: 'Umurinzi w\'Urasa',
          jerseyNumber: 23,
          role: 'player',
          trade: 'General',
          level: 'Level 3',
          stats: { matches: 20, points: 265 }
        }
      ],
      achievements: [
        { year: '2023', title: 'National Schools Championship', titleRw: 'Ubwatsinzi bw\'Amashuri y\'Igihugu', position: '1st' },
        { year: '2023', title: 'IPRC Inter-Campus Tournament', titleRw: 'Amarushanwa ya IPRC', position: '1st' },
        { year: '2022', title: 'Regional Basketball League', titleRw: 'Ligi y\'Umupira w\'Agatebo y\'Akarere', position: '2nd' }
      ],
      stats: {
        matches: 22,
        wins: 19,
        draws: 0,
        losses: 3,
        points: 57
      },
      upcoming: [
        { date: '2024-03-18', opponent: 'IPRC Kitabi Stars', venue: 'Kigali Arena', time: '16:00' },
        { date: '2024-03-25', opponent: 'IPRC Tumba Panthers', venue: 'Home Court', time: '15:00' }
      ],
      description: 'The Queens dominate the court with precision passing and fierce defense.',
      descriptionRw: 'Imikenyezi yiganza ku kibuga n\'uburyo bukomeye bwo kwirinda.',
      colors: {
        primary: '#9333EA',
        secondary: '#F472B6'
      },
      socialMedia: {
        instagram: 'https://instagram.com/iprcqueens'
      },
      trainingSchedule: [
        { day: 'Tuesday', time: '16:30 - 18:30', venue: 'Indoor Court' },
        { day: 'Thursday', time: '16:30 - 18:30', venue: 'Indoor Court' },
        { day: 'Saturday', time: '10:00 - 12:00', venue: 'Indoor Court' }
      ]
    },
    {
      id: 't3',
      name: 'IPRC Thunder',
      nameRw: 'Inkuba za IPRC',
      sport: 'Volleyball',
      sportRw: 'Umupira wa Volley',
      category: 'volleyball',
      gender: 'mixed',
      logo: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=400&q=80',
      banner: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=1200&q=80',
      established: '2020',
      coach: {
        name: 'Coach Patrick Niyonzima',
        photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80',
        experience: '10 years',
        achievements: ['Regional Tournament Winner 2023']
      },
      captain: 'Emmanuel Kayitare',
      members: [
        {
          id: 'm8',
          name: 'Emmanuel Kayitare',
          photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80',
          position: 'Setter',
          positionRw: 'Ushinzwe Gushyira',
          jerseyNumber: 9,
          role: 'captain',
          trade: 'BDC',
          level: 'Level 4',
          stats: { matches: 20, points: 156 }
        },
        {
          id: 'm9',
          name: 'Alice Uwamahoro',
          photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80',
          position: 'Spiker',
          positionRw: 'Ugukura',
          jerseyNumber: 11,
          role: 'player',
          trade: 'SOD',
          level: 'Level 3',
          stats: { matches: 19, points: 142 }
        }
      ],
      achievements: [
        { year: '2023', title: 'IPRC Volleyball Cup', titleRw: 'Igikombe cya Volley ya IPRC', position: '1st' },
        { year: '2022', title: 'Regional Schools Tournament', titleRw: 'Amarushanwa y\'Amashuri y\'Akarere', position: '3rd' }
      ],
      stats: {
        matches: 20,
        wins: 14,
        draws: 2,
        losses: 4,
        points: 44
      },
      upcoming: [
        { date: '2024-03-20', opponent: 'IPRC Ngoma Spikers', venue: 'Sports Hall', time: '17:00' }
      ],
      description: 'Thunder strikes with powerful spikes and coordinated team play.',
      descriptionRw: 'Inkuba zikubita n\'imbaraga n\'umukino uhujwe neza.',
      colors: {
        primary: '#DC2626',
        secondary: '#FBBF24'
      },
      socialMedia: {
        instagram: 'https://instagram.com/iprcthunder'
      },
      trainingSchedule: [
        { day: 'Monday', time: '17:00 - 19:00', venue: 'Sports Hall' },
        { day: 'Wednesday', time: '17:00 - 19:00', venue: 'Sports Hall' },
        { day: 'Friday', time: '17:00 - 19:00', venue: 'Sports Hall' }
      ]
    },
    {
      id: 't4',
      name: 'IPRC Sprinters',
      nameRw: 'Abahagarika ba IPRC',
      sport: 'Athletics',
      sportRw: 'Siporo Nyinshi',
      category: 'athletics',
      gender: 'mixed',
      logo: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&q=80',
      banner: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1200&q=80',
      established: '2017',
      coach: {
        name: 'Coach Jean Claude Habimana',
        photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80',
        experience: '18 years',
        achievements: ['National Athletics Coach Award 2022', 'Regional Championship 2023']
      },
      captain: 'Eric Nshimiyimana',
      members: [
        {
          id: 'm10',
          name: 'Eric Nshimiyimana',
          photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
          position: '100m Sprint',
          positionRw: 'Kwiruka 100m',
          jerseyNumber: 17,
          role: 'captain',
          trade: 'AUT',
          level: 'Level 4',
          stats: { matches: 15, points: 245 }
        },
        {
          id: 'm11',
          name: 'Diane Umutoni',
          photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80',
          position: 'Long Jump',
          positionRw: 'Gusimbuka',
          jerseyNumber: 14,
          role: 'player',
          trade: 'General',
          level: 'Level 3',
          stats: { matches: 14, points: 198 }
        }
      ],
      achievements: [
        { year: '2023', title: 'National Athletics Championship', titleRw: 'Ubwatsinzi bwa Siporo Nyinshi bw\'Igihugu', position: '1st' },
        { year: '2023', title: 'IPRC Sports Day', titleRw: 'Umunani wa Siporo wa IPRC', position: '1st' },
        { year: '2022', title: 'Regional Track & Field', titleRw: 'Siporo y\'Akarere', position: '2nd' }
      ],
      stats: {
        matches: 15,
        wins: 12,
        draws: 1,
        losses: 2,
        points: 37
      },
      upcoming: [
        { date: '2024-03-28', opponent: 'National Schools Meet', venue: 'National Stadium', time: '09:00' }
      ],
      description: 'Our athletes embody speed, strength, and endurance.',
      descriptionRw: 'Abakinnyi bacu bagaragaza umuvuduko, imbaraga, n\'ihangane.',
      colors: {
        primary: '#059669',
        secondary: '#FDE047'
      },
      socialMedia: {
        facebook: 'https://facebook.com/iprcsprinters'
      },
      trainingSchedule: [
        { day: 'Monday', time: '06:00 - 08:00', venue: 'Track Field' },
        { day: 'Tuesday', time: '16:00 - 18:00', venue: 'Track Field' },
        { day: 'Thursday', time: '06:00 - 08:00', venue: 'Track Field' },
        { day: 'Friday', time: '16:00 - 18:00', venue: 'Track Field' }
      ]
    },
    {
      id: 't5',
      name: 'IPRC Warriors',
      nameRw: 'Abarwanyi ba IPRC',
      sport: 'Handball',
      sportRw: 'Umupira w\'Ikiganza',
      category: 'handball',
      gender: 'male',
      logo: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=400&q=80',
      banner: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=1200&q=80',
      established: '2021',
      coach: {
        name: 'Coach Robert Ndayisaba',
        photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80',
        experience: '8 years',
        achievements: ['Rising Coach Award 2023']
      },
      captain: 'Claude Mugisha',
      members: [
        {
          id: 'm12',
          name: 'Claude Mugisha',
          photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80',
          position: 'Playmaker',
          positionRw: 'Umukinnyi Mukuru',
          jerseyNumber: 13,
          role: 'captain',
          trade: 'SOD',
          level: 'Level 4',
          stats: { matches: 18, goals: 42 }
        }
      ],
      achievements: [
        { year: '2023', title: 'IPRC Handball League', titleRw: 'Ligi y\'Umupira w\'Ikiganza ya IPRC', position: '2nd' }
      ],
      stats: {
        matches: 18,
        wins: 11,
        draws: 3,
        losses: 4,
        goalsFor: 245,
        goalsAgainst: 198,
        points: 36
      },
      upcoming: [
        { date: '2024-03-17', opponent: 'IPRC Karongi Kings', venue: 'Home Court', time: '15:30' }
      ],
      description: 'Warriors fight with determination and skill on every match.',
      descriptionRw: 'Abarwanyi barwana n\'iharanira n\'ubuhanga mu mikino yose.',
      colors: {
        primary: '#7C3AED',
        secondary: '#A78BFA'
      },
      socialMedia: {
        instagram: 'https://instagram.com/iprcwarriors'
      },
      trainingSchedule: [
        { day: 'Tuesday', time: '17:00 - 19:00', venue: 'Indoor Court' },
        { day: 'Thursday', time: '17:00 - 19:00', venue: 'Indoor Court' },
        { day: 'Saturday', time: '14:00 - 16:00', venue: 'Indoor Court' }
      ]
    }
  ];

  const filteredTeams = teams.filter(team => {
    const matchesSearch = 
      team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.nameRw.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.sport.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.sportRw.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSport = selectedSport === 'all' || team.category === selectedSport;
    const matchesGender = selectedGender === 'all' || team.gender === selectedGender;

    return matchesSearch && matchesSport && matchesGender;
  });

  const stats = [
    { 
      label: 'Amakipe', 
      value: teams.length.toString(), 
      icon: Users, 
      color: 'from-blue-600 to-cyan-600',
      description: 'Amakipe Yose'
    },
    { 
      label: 'Abakinnyi', 
      value: teams.reduce((sum, t) => sum + t.members.length, 0).toString(), 
      icon: User, 
      color: 'from-green-600 to-emerald-600',
      description: 'Abakinnyi Bose'
    },
    { 
      label: 'Ibihembo', 
      value: teams.reduce((sum, t) => sum + t.achievements.length, 0).toString(), 
      icon: Trophy, 
      color: 'from-yellow-600 to-orange-600',
      description: 'Intsinzi'
    },
    { 
      label: 'Imikino Itegerejwe', 
      value: teams.reduce((sum, t) => sum + t.upcoming.length, 0).toString(), 
      icon: Calendar, 
      color: 'from-purple-600 to-indigo-600',
      description: 'Bizaza'
    }
  ];

  const getGenderBadge = (gender: string) => {
    const genderConfig = {
      male: { label: 'Abagabo', color: 'bg-blue-100 text-blue-700 border-blue-300' },
      female: { label: 'Abagore', color: 'bg-pink-100 text-pink-700 border-pink-300' },
      mixed: { label: 'Bihujwe', color: 'bg-purple-100 text-purple-700 border-purple-300' }
    };
    const config = genderConfig[gender as keyof typeof genderConfig];
    return <Badge className={`${config.color} border-2 font-semibold`}>{config.label}</Badge>;
  };

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      captain: { label: 'Kapiteni', color: 'bg-yellow-100 text-yellow-700 border-yellow-300', icon: Crown },
      'vice-captain': { label: 'Kapiteni Wungirije', color: 'bg-orange-100 text-orange-700 border-orange-300', icon: Medal },
      goalkeeper: { label: 'Goalkeeper', color: 'bg-green-100 text-green-700 border-green-300', icon: Shield },
      player: { label: 'Umukinnyi', color: 'bg-blue-100 text-blue-700 border-blue-300', icon: Star }
    };
    const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.player;
    const IconComponent = config.icon;
    return (
      <Badge className={`${config.color} border-2 font-semibold flex items-center gap-1`}>
        <IconComponent className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const getWinRate = (stats: SportsTeam['stats']) => {
    return Math.round((stats.wins / stats.matches) * 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-600 to-blue-600 flex items-center justify-center shadow-xl">
              <Users className="w-9 h-9 text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-gray-900">Amakipe ya Siporo</h1>
              <p className="text-lg text-gray-600 font-semibold mt-1">Amakipe n'Abakinnyi ba IPRC Kigali</p>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-lg border-2 border-green-100 hover:border-green-300 transition-all"
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mx-auto mb-3`}>
                  <stat.icon className="w-7 h-7 text-white" />
                </div>
                <p className="text-3xl font-black text-gray-900 mb-1 text-center">{stat.value}</p>
                <p className="text-sm font-semibold text-gray-600 text-center">{stat.label}</p>
                <p className="text-xs text-gray-500 text-center mt-1">{stat.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl shadow-2xl border-2 border-green-100 p-6 md:p-8 mb-8"
        >
          <div className="flex items-center space-x-3 mb-6">
            <Search className="w-6 h-6 text-green-600" />
            <h3 className="text-2xl font-black text-gray-900">Shakisha Ikipe</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Shakisha izina, siporo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 text-lg border-2 border-green-200 focus:border-green-500"
            />

            <Select value={selectedSport} onValueChange={setSelectedSport}>
              <SelectTrigger className="h-12 border-2 border-green-200">
                <SelectValue placeholder="Siporo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Siporo Zose</SelectItem>
                <SelectItem value="football">Umupira w'Amaguru</SelectItem>
                <SelectItem value="basketball">Umupira w'Agatebo</SelectItem>
                <SelectItem value="volleyball">Volley</SelectItem>
                <SelectItem value="athletics">Siporo Nyinshi</SelectItem>
                <SelectItem value="handball">Umupira w'Ikiganza</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedGender} onValueChange={setSelectedGender}>
              <SelectTrigger className="h-12 border-2 border-green-200">
                <SelectValue placeholder="Igitsina" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Byose</SelectItem>
                <SelectItem value="male">Abagabo</SelectItem>
                <SelectItem value="female">Abagore</SelectItem>
                <SelectItem value="mixed">Bihujwe</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredTeams.map((team, index) => (
              <motion.div
                key={team.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                layout
              >
                <Card className="h-full border-2 border-green-100 hover:border-green-400 hover:shadow-2xl transition-all cursor-pointer group bg-white overflow-hidden">
                  <div className="relative h-40 overflow-hidden">
                    <img src={team.banner} alt={team.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-3 left-3 right-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-16 h-16 rounded-xl border-4 border-white shadow-lg overflow-hidden bg-white">
                          <img src={team.logo} alt={team.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-white font-black text-lg">{team.nameRw}</h3>
                          <p className="text-white/90 text-sm font-semibold">{team.sportRw}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <CardHeader className="pb-3">
                    <div className="flex flex-wrap gap-2 mb-3">
                      {getGenderBadge(team.gender)}
                      <Badge className="bg-gray-100 text-gray-700 font-semibold">
                        Est. {team.established}
                      </Badge>
                      <Badge className="bg-green-100 text-green-700 font-semibold">
                        {team.members.length} Abakinnyi
                      </Badge>
                    </div>

                    <CardDescription className="text-sm font-semibold text-gray-600 line-clamp-2">
                      {team.descriptionRw}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4">
                      <div className="grid grid-cols-3 gap-3 text-center">
                        <div>
                          <p className="text-xs text-gray-600 font-semibold mb-1">Imikino</p>
                          <p className="text-2xl font-black text-gray-900">{team.stats.matches}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 font-semibold mb-1">Tsinze</p>
                          <p className="text-2xl font-black text-green-600">{team.stats.wins}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 font-semibold mb-1">%</p>
                          <p className="text-2xl font-black text-blue-600">{getWinRate(team.stats)}%</p>
                        </div>
                      </div>
                      <div className="mt-3">
                        <Progress value={getWinRate(team.stats)} className="h-2 bg-gray-200" />
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 bg-yellow-50 border-2 border-yellow-200 rounded-lg p-3">
                      <Crown className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-600 font-semibold">Kapiteni</p>
                        <p className="text-sm font-black text-gray-900 truncate">{team.captain}</p>
                      </div>
                    </div>

                    {team.achievements.length > 0 && (
                      <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-3">
                        <div className="flex items-center space-x-2 mb-2">
                          <Trophy className="w-4 h-4 text-orange-600" />
                          <p className="text-xs font-black text-gray-900">Ibihembo Byaheruka</p>
                        </div>
                        <div className="space-y-1">
                          {team.achievements.slice(0, 2).map((achievement, idx) => (
                            <div key={idx} className="flex items-center justify-between text-xs">
                              <span className="font-semibold text-gray-700 truncate flex-1">{achievement.titleRw}</span>
                              <Badge className="bg-orange-200 text-orange-800 text-xs ml-2">{achievement.position}</Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {team.upcoming.length > 0 && (
                      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-3">
                        <div className="flex items-center space-x-2 mb-2">
                          <Calendar className="w-4 h-4 text-blue-600" />
                          <p className="text-xs font-black text-gray-900">Umukino Utegerejwe</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-semibold text-gray-700">{team.upcoming[0].opponent}</p>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-600">{team.upcoming[0].date}</span>
                            <span className="font-bold text-blue-600">{team.upcoming[0].time}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <Button 
                      onClick={() => setSelectedTeam(team)}
                      className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold shadow-lg group"
                    >
                      Reba Amakuru Yuzuye
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {filteredTeams.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 bg-white rounded-3xl shadow-lg border-2 border-green-100"
          >
            <Users className="w-20 h-20 text-green-300 mx-auto mb-4" />
            <h3 className="text-2xl font-black text-gray-900 mb-2">Nta Makipe Yabonetse</h3>
            <p className="text-gray-600 font-semibold">Gerageza guhindura inyishindu zawe zo gushakisha</p>
          </motion.div>
        )}

        <Dialog open={!!selectedTeam} onOpenChange={() => setSelectedTeam(null)}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
            {selectedTeam && (
              <>
                <div className="relative h-48 -mx-6 -mt-6 mb-6 overflow-hidden">
                  <img src={selectedTeam.banner} alt={selectedTeam.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-20 h-20 rounded-2xl border-4 border-white shadow-2xl overflow-hidden bg-white">
                        <img src={selectedTeam.logo} alt={selectedTeam.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <h2 className="text-white font-black text-3xl mb-1">{selectedTeam.nameRw}</h2>
                        <p className="text-white/90 text-lg font-semibold">{selectedTeam.sportRw}</p>
                      </div>
                      {getGenderBadge(selectedTeam.gender)}
                    </div>
                  </div>
                </div>

                <ScrollArea className="max-h-[60vh]">
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gradient-to-br from-green-100 to-blue-100 rounded-2xl p-6 border-2 border-green-200">
                        <h4 className="text-xl font-black text-gray-900 mb-4 flex items-center">
                          <Activity className="w-6 h-6 mr-2 text-green-600" />
                          Imikorere
                        </h4>
                        <div className="space-y-3">
                          <div className="bg-white rounded-xl p-4">
                            <div className="grid grid-cols-4 gap-3 text-center">
                              <div>
                                <p className="text-xs text-gray-600 font-semibold">Imikino</p>
                                <p className="text-2xl font-black text-gray-900">{selectedTeam.stats.matches}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 font-semibold">Tsinze</p>
                                <p className="text-2xl font-black text-green-600">{selectedTeam.stats.wins}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 font-semibold">Guhuza</p>
                                <p className="text-2xl font-black text-yellow-600">{selectedTeam.stats.draws}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 font-semibold">Tsindwe</p>
                                <p className="text-2xl font-black text-red-600">{selectedTeam.stats.losses}</p>
                              </div>
                            </div>
                          </div>
                          {selectedTeam.stats.goalsFor !== undefined && (
                            <div className="bg-white rounded-xl p-4">
                              <div className="grid grid-cols-2 gap-3 text-center">
                                <div>
                                  <p className="text-xs text-gray-600 font-semibold">Impunzi Zatanze</p>
                                  <p className="text-3xl font-black text-green-600">{selectedTeam.stats.goalsFor}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-600 font-semibold">Impunzi Bemejwe</p>
                                  <p className="text-3xl font-black text-red-600">{selectedTeam.stats.goalsAgainst}</p>
                                </div>
                              </div>
                            </div>
                          )}
                          <div className="bg-white rounded-xl p-4 text-center">
                            <p className="text-sm text-gray-600 font-semibold mb-2">Igipimo cyo Gutsinda</p>
                            <p className="text-4xl font-black text-blue-600 mb-3">{getWinRate(selectedTeam.stats)}%</p>
                            <Progress value={getWinRate(selectedTeam.stats)} className="h-3 bg-gray-200" />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-6">
                          <h4 className="text-xl font-black text-gray-900 mb-4 flex items-center">
                            <User className="w-6 h-6 mr-2 text-yellow-600" />
                            Umutoza
                          </h4>
                          <div className="flex items-center space-x-4 mb-4">
                            <Avatar className="w-16 h-16 border-4 border-yellow-200">
                              <img src={selectedTeam.coach.photo} alt={selectedTeam.coach.name} />
                              <AvatarFallback>{selectedTeam.coach.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="font-black text-gray-900 text-lg">{selectedTeam.coach.name}</p>
                              <p className="text-sm font-semibold text-gray-600">{selectedTeam.coach.experience} Experience</p>
                            </div>
                          </div>
                          {selectedTeam.coach.achievements.length > 0 && (
                            <div className="bg-white rounded-xl p-3">
                              <p className="text-xs font-black text-gray-900 mb-2">Ibihembo</p>
                              <ul className="space-y-1">
                                {selectedTeam.coach.achievements.map((achievement, idx) => (
                                  <li key={idx} className="flex items-start text-xs">
                                    <Trophy className="w-3 h-3 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                                    <span className="font-semibold text-gray-700">{achievement}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>

                        {selectedTeam.socialMedia && Object.keys(selectedTeam.socialMedia).length > 0 && (
                          <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-6">
                            <h4 className="text-lg font-black text-gray-900 mb-3">Imbuga Nkoranyambaga</h4>
                            <div className="flex gap-2">
                              {selectedTeam.socialMedia.facebook && (
                                <Button size="sm" variant="outline" className="border-2">
                                  <Facebook className="w-4 h-4" />
                                </Button>
                              )}
                              {selectedTeam.socialMedia.instagram && (
                                <Button size="sm" variant="outline" className="border-2">
                                  <Instagram className="w-4 h-4" />
                                </Button>
                              )}
                              {selectedTeam.socialMedia.twitter && (
                                <Button size="sm" variant="outline" className="border-2">
                                  <Twitter className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-white border-2 border-green-200 rounded-2xl p-6">
                      <h4 className="text-xl font-black text-gray-900 mb-4 flex items-center">
                        <Users className="w-6 h-6 mr-2 text-green-600" />
                        Abakinnyi ({selectedTeam.members.length})
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedTeam.members.map((member) => (
                          <div key={member.id} className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200">
                            <div className="flex items-center space-x-3 mb-3">
                              <Avatar className="w-12 h-12 border-2 border-green-200">
                                <img src={member.photo} alt={member.name} />
                                <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="font-black text-gray-900 truncate">{member.name}</p>
                                <p className="text-xs text-gray-600 font-semibold">{member.positionRw}</p>
                              </div>
                              <div className="text-center bg-green-100 rounded-lg px-3 py-2">
                                <p className="text-2xl font-black text-green-600">{member.jerseyNumber}</p>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2 mb-3">
                              {getRoleBadge(member.role)}
                              <Badge className="bg-blue-100 text-blue-700 font-semibold">{member.level}</Badge>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-center text-xs">
                              <div className="bg-white rounded p-2">
                                <p className="text-gray-600 font-semibold">Imikino</p>
                                <p className="text-lg font-black text-gray-900">{member.stats.matches}</p>
                              </div>
                              {member.stats.goals !== undefined && (
                                <div className="bg-white rounded p-2">
                                  <p className="text-gray-600 font-semibold">Impunzi</p>
                                  <p className="text-lg font-black text-green-600">{member.stats.goals}</p>
                                </div>
                              )}
                              {member.stats.assists !== undefined && (
                                <div className="bg-white rounded p-2">
                                  <p className="text-gray-600 font-semibold">Assist</p>
                                  <p className="text-lg font-black text-blue-600">{member.stats.assists}</p>
                                </div>
                              )}
                              {member.stats.saves !== undefined && (
                                <div className="bg-white rounded p-2">
                                  <p className="text-gray-600 font-semibold">Saves</p>
                                  <p className="text-lg font-black text-purple-600">{member.stats.saves}</p>
                                </div>
                              )}
                              {member.stats.points !== undefined && (
                                <div className="bg-white rounded p-2">
                                  <p className="text-gray-600 font-semibold">Amanota</p>
                                  <p className="text-lg font-black text-orange-600">{member.stats.points}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {selectedTeam.achievements.length > 0 && (
                      <div className="bg-gradient-to-br from-orange-100 to-yellow-100 border-2 border-orange-200 rounded-2xl p-6">
                        <h4 className="text-xl font-black text-gray-900 mb-4 flex items-center">
                          <Trophy className="w-6 h-6 mr-2 text-orange-600" />
                          Ibihembo n'Intsinzi
                        </h4>
                        <div className="space-y-3">
                          {selectedTeam.achievements.map((achievement, idx) => (
                            <div key={idx} className="bg-white rounded-xl p-4 border-2 border-orange-200">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <p className="font-black text-gray-900">{achievement.titleRw}</p>
                                  <p className="text-sm text-gray-600 font-semibold">{achievement.title}</p>
                                </div>
                                <div className="flex items-center space-x-3">
                                  <Badge className="bg-orange-100 text-orange-700 font-bold text-lg">
                                    {achievement.position}
                                  </Badge>
                                  <Badge className="bg-gray-100 text-gray-700 font-semibold">
                                    {achievement.year}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedTeam.upcoming.length > 0 && (
                      <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
                        <h4 className="text-xl font-black text-gray-900 mb-4 flex items-center">
                          <Calendar className="w-6 h-6 mr-2 text-blue-600" />
                          Imikino Itegerejwe
                        </h4>
                        <div className="space-y-3">
                          {selectedTeam.upcoming.map((match, idx) => (
                            <div key={idx} className="bg-white rounded-xl p-4 border-2 border-blue-200">
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                <div>
                                  <p className="text-gray-600 font-semibold mb-1">Umucamanza</p>
                                  <p className="font-black text-gray-900">{match.opponent}</p>
                                </div>
                                <div>
                                  <p className="text-gray-600 font-semibold mb-1">Itariki</p>
                                  <p className="font-black text-gray-900">{match.date}</p>
                                </div>
                                <div>
                                  <p className="text-gray-600 font-semibold mb-1">Igihe</p>
                                  <p className="font-black text-blue-600">{match.time}</p>
                                </div>
                                <div>
                                  <p className="text-gray-600 font-semibold mb-1">Ahantu</p>
                                  <p className="font-black text-gray-900">{match.venue}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedTeam.trainingSchedule.length > 0 && (
                      <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-6">
                        <h4 className="text-xl font-black text-gray-900 mb-4 flex items-center">
                          <Target className="w-6 h-6 mr-2 text-purple-600" />
                          Gahunda y'Imyitozo
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {selectedTeam.trainingSchedule.map((schedule, idx) => (
                            <div key={idx} className="bg-white rounded-lg p-3 border-2 border-purple-100">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-black text-gray-900">{schedule.day}</p>
                                  <p className="text-sm text-gray-600 font-semibold">{schedule.venue}</p>
                                </div>
                                <Badge className="bg-purple-100 text-purple-700 font-bold">
                                  {schedule.time}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <Button className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold shadow-lg">
                        <UserPlus className="w-4 h-4 mr-2" />
                        Jya mu Kipe
                      </Button>
                      <Button variant="outline" className="flex-1 border-2 border-green-300 font-bold">
                        <Heart className="w-4 h-4 mr-2" />
                        Shyigikira
                      </Button>
                    </div>
                  </div>
                </ScrollArea>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default SportsTeamsPage;
