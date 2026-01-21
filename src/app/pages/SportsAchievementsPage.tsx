import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Medal, Award, Star, Crown, Target, TrendingUp, Calendar, Users, Flag, Zap, Sparkles, Search, Filter, ChevronRight, ArrowRight, CheckCircle2, Shield, Gift, Gem, Heart, Activity } from 'lucide-react';
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

interface Achievement {
  id: string;
  title: string;
  titleRw: string;
  sport: string;
  sportRw: string;
  category: 'football' | 'basketball' | 'volleyball' | 'athletics' | 'handball' | 'general';
  type: 'team' | 'individual';
  level: 'international' | 'national' | 'regional' | 'school';
  position: string;
  positionRw: string;
  year: string;
  date: string;
  event: string;
  eventRw: string;
  venue: string;
  venueRw: string;
  recipients: {
    name: string;
    photo: string;
    role: string;
    trade?: string;
    level?: string;
  }[];
  description: string;
  descriptionRw: string;
  medal: 'gold' | 'silver' | 'bronze' | 'special';
  coach?: string;
  stats?: {
    label: string;
    value: string;
  }[];
  image: string;
  highlights?: string[];
  highlightsRw?: string[];
  featured: boolean;
}

const SportsAchievementsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSport, setSelectedSport] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [activeTab, setActiveTab] = useState('all');

  const achievements: Achievement[] = [
    {
      id: 'ach1',
      title: 'Inter-School Football Championship',
      titleRw: 'Shampiyona y\'Umupira w\'Amaguru',
      sport: 'Football',
      sportRw: 'Umupira w\'Amaguru',
      category: 'football',
      type: 'team',
      level: 'national',
      position: '1st Place',
      positionRw: 'Umwanya wa 1',
      year: '2024',
      date: '2024-03-15',
      event: 'National TVET Football Championship',
      eventRw: 'Shampiyona y\'Igihugu ya TVET',
      venue: 'Amahoro National Stadium',
      venueRw: 'Stade Amahoro',
      recipients: [
        {
          name: 'IPRC Kigali Warriors',
          photo: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=200&q=80',
          role: 'Team'
        },
        {
          name: 'Jean Pierre Uwimana',
          photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
          role: 'Captain',
          trade: 'SOD',
          level: 'Level 4'
        }
      ],
      description: 'Historic victory in the national championship, defeating all opponents with exceptional teamwork and skill.',
      descriptionRw: 'Intsinzi y\'amateka muri shampiyona y\'igihugu, twatsindiye abatoza bose dufite ubufatanye n\'ubuhanga bidasanzwe.',
      medal: 'gold',
      coach: 'Coach Emmanuel Habimana',
      stats: [
        { label: 'Goals Scored', value: '28' },
        { label: 'Goals Conceded', value: '4' },
        { label: 'Clean Sheets', value: '6' },
        { label: 'Win Rate', value: '95%' }
      ],
      image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&q=80',
      highlights: [
        'Undefeated throughout the tournament',
        'Top scorer: Claude Niyonzima (12 goals)',
        'Best goalkeeper: Emmanuel Mugisha',
        'Fair play award'
      ],
      highlightsRw: [
        'Ntitwaratsindiwe mu marushanwa yose',
        'Umwinjira amanota menshi: Claude Niyonzima (amanota 12)',
        'Goalkeeper mwiza: Emmanuel Mugisha',
        'Igihembo cyo gukina neza'
      ],
      featured: true
    },
    {
      id: 'ach2',
      title: 'Regional Basketball Tournament - Girls',
      titleRw: 'Amarushanwa ya Basketball - Abakobwa',
      sport: 'Basketball',
      sportRw: 'Basketball',
      category: 'basketball',
      type: 'team',
      level: 'regional',
      position: '2nd Place',
      positionRw: 'Umwanya wa 2',
      year: '2024',
      date: '2024-02-20',
      event: 'East Africa Schools Basketball Championship',
      eventRw: 'Shampiyona ya Basketball y\'Amashuri y\'Iburasirazuba bw\'Afurika',
      venue: 'Kigali Arena',
      venueRw: 'Kigali Arena',
      recipients: [
        {
          name: 'IPRC Queens',
          photo: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=200&q=80',
          role: 'Team'
        },
        {
          name: 'Sarah Uwase',
          photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80',
          role: 'Team Captain',
          trade: 'BDC',
          level: 'Level 3'
        }
      ],
      description: 'Impressive performance securing silver medal in the regional championship.',
      descriptionRw: 'Imikino ihebuje yaduteye kugera ku medali ya kabiri muri shampiyona y\'akarere.',
      medal: 'silver',
      coach: 'Coach Grace Mukankusi',
      stats: [
        { label: 'Points Scored', value: '486' },
        { label: 'Points Against', value: '421' },
        { label: 'Rebounds', value: '312' },
        { label: 'Assists', value: '178' }
      ],
      image: 'https://images.unsplash.com/photo-1608245449230-4ac19066d2d0?w=800&q=80',
      highlights: [
        'Best 3-point shooter: Sarah Uwase',
        'Most rebounds: Divine Mukamazimpaka',
        'Fair play award',
        'Team spirit award'
      ],
      highlightsRw: [
        'Umwinjira amanota menshi ya 3-point: Sarah Uwase',
        'Rebound nyinshi: Divine Mukamazimpaka',
        'Igihembo cyo gukina neza',
        'Igihembo cy\'umwuka w\'ikipe'
      ],
      featured: true
    },
    {
      id: 'ach3',
      title: '100m Sprint Gold Medal',
      titleRw: 'Medali ya Zahabu - 100m',
      sport: 'Athletics',
      sportRw: 'Atletike',
      category: 'athletics',
      type: 'individual',
      level: 'national',
      position: '1st Place',
      positionRw: 'Umwanya wa 1',
      year: '2024',
      date: '2024-01-15',
      event: 'National Youth Athletics Championship',
      eventRw: 'Shampiyona y\'Atletike y\'Urubyiruko y\'Igihugu',
      venue: 'Huye Stadium',
      venueRw: 'Stade ya Huye',
      recipients: [
        {
          name: 'Patrick Nkunda',
          photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80',
          role: 'Athlete',
          trade: 'AUT',
          level: 'Level 2'
        }
      ],
      description: 'Record-breaking performance in the 100m sprint, setting a new national youth record.',
      descriptionRw: 'Imikino ihebuje muri 100m, yashyizeho rekoro nshya y\'igihugu y\'urubyiruko.',
      medal: 'gold',
      coach: 'Coach James Mugabo',
      stats: [
        { label: 'Time', value: '10.45s' },
        { label: 'Previous Record', value: '10.62s' },
        { label: 'Improvement', value: '0.17s' },
        { label: 'Wind Speed', value: '+1.2 m/s' }
      ],
      image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&q=80',
      highlights: [
        'New national youth record',
        'Fastest time in East Africa',
        'Qualified for continental championship',
        'Sports personality of the month'
      ],
      highlightsRw: [
        'Rekoro nshya y\'igihugu y\'urubyiruko',
        'Igihe cyihuse cyane mu Burasirazuba bw\'Afurika',
        'Yujuje ibisabwa kugira ngo yinjire mu marushanwa y\'umugabane',
        'Umukinnyi w\'ukwezi'
      ],
      featured: true
    },
    {
      id: 'ach4',
      title: 'Volleyball Championship Bronze',
      titleRw: 'Medali ya Bronze - Volleyball',
      sport: 'Volleyball',
      sportRw: 'Volleyball',
      category: 'volleyball',
      type: 'team',
      level: 'national',
      position: '3rd Place',
      positionRw: 'Umwanya wa 3',
      year: '2023',
      date: '2023-12-10',
      event: 'National Schools Volleyball Tournament',
      eventRw: 'Amarushanwa ya Volleyball y\'Amashuri y\'Igihugu',
      venue: 'BK Arena',
      venueRw: 'BK Arena',
      recipients: [
        {
          name: 'IPRC Spikers',
          photo: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=200&q=80',
          role: 'Team'
        },
        {
          name: 'Eric Manzi',
          photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80',
          role: 'Team Captain',
          trade: 'General',
          level: 'Level 3'
        }
      ],
      description: 'Strong performance earning bronze medal in competitive national tournament.',
      descriptionRw: 'Imikino ikomeye yaduteye kugera ku medali ya bronze mu marushanwa y\'igihugu.',
      medal: 'bronze',
      coach: 'Coach Patrick Ishimwe',
      stats: [
        { label: 'Sets Won', value: '18' },
        { label: 'Sets Lost', value: '10' },
        { label: 'Aces', value: '87' },
        { label: 'Blocks', value: '156' }
      ],
      image: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800&q=80',
      highlights: [
        'Best setter: Eric Manzi',
        'Most valuable player: John Bosco',
        'Team improvement award'
      ],
      highlightsRw: [
        'Setter mwiza: Eric Manzi',
        'Umukinnyi w\'agaciro: John Bosco',
        'Igihembo cy\'iterambere ry\'ikipe'
      ],
      featured: false
    },
    {
      id: 'ach5',
      title: 'Handball League Champions',
      titleRw: 'Shampiyoni za Handball',
      sport: 'Handball',
      sportRw: 'Handball',
      category: 'handball',
      type: 'team',
      level: 'school',
      position: '1st Place',
      positionRw: 'Umwanya wa 1',
      year: '2024',
      date: '2024-03-01',
      event: 'IPRC Inter-Campus Handball League',
      eventRw: 'Shampiyona ya Handball hagati y\'Amashami ya IPRC',
      venue: 'IPRC Kigali Sports Complex',
      venueRw: 'Ikigo cy\'Imikino cya IPRC Kigali',
      recipients: [
        {
          name: 'IPRC Handlers',
          photo: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=200&q=80',
          role: 'Team'
        },
        {
          name: 'Daniel Habimana',
          photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80',
          role: 'Team Captain',
          trade: 'SOD',
          level: 'Level 3'
        }
      ],
      description: 'Dominant season winning the inter-campus handball league undefeated.',
      descriptionRw: 'Sezoni ikomeye twatsindiye shampiyona hagati y\'amashami nta na rimwe twatsindwa.',
      medal: 'gold',
      coach: 'Coach Eric Nshimiyimana',
      stats: [
        { label: 'Matches Played', value: '12' },
        { label: 'Wins', value: '12' },
        { label: 'Goals Scored', value: '342' },
        { label: 'Goals Conceded', value: '198' }
      ],
      image: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800&q=80',
      highlights: [
        'Undefeated season',
        'Top scorer: Daniel Habimana (78 goals)',
        'Best goalkeeper: Emmanuel Nkusi',
        'Championship MVP'
      ],
      highlightsRw: [
        'Sezoni nta na rimwe twatsindwa',
        'Umwinjira amanota menshi: Daniel Habimana (amanota 78)',
        'Goalkeeper mwiza: Emmanuel Nkusi',
        'MVP wa shampiyona'
      ],
      featured: false
    },
    {
      id: 'ach6',
      title: 'Long Jump Silver Medal',
      titleRw: 'Medali ya Kabiri - Gusimbuka Kure',
      sport: 'Athletics',
      sportRw: 'Atletike',
      category: 'athletics',
      type: 'individual',
      level: 'regional',
      position: '2nd Place',
      positionRw: 'Umwanya wa 2',
      year: '2023',
      date: '2023-11-20',
      event: 'East Africa Schools Athletics Meet',
      eventRw: 'Irushanwa ry\'Atletike ry\'Amashuri y\'Iburasirazuba bw\'Afurika',
      venue: 'Arusha Stadium, Tanzania',
      venueRw: 'Stade ya Arusha, Tanzaniya',
      recipients: [
        {
          name: 'Claudine Mukeshimana',
          photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80',
          role: 'Athlete',
          trade: 'BDC',
          level: 'Level 4'
        }
      ],
      description: 'Outstanding performance in long jump, earning silver medal at regional level.',
      descriptionRw: 'Imikino ihebuje mu gusimbuka kure, yatsindiye medali ya kabiri ku rwego rw\'akarere.',
      medal: 'silver',
      coach: 'Coach Alice Uwera',
      stats: [
        { label: 'Best Jump', value: '6.42m' },
        { label: 'Second Best', value: '6.35m' },
        { label: 'Foul Jumps', value: '1' },
        { label: 'Wind Speed', value: '+0.8 m/s' }
      ],
      image: 'https://images.unsplash.com/photo-1571731956672-f2b94d7dd0cb?w=800&q=80',
      highlights: [
        'Personal best record',
        'Second in East Africa',
        'Youngest competitor',
        'School record holder'
      ],
      highlightsRw: [
        'Rekoro yanjye',
        'Wa kabiri mu Burasirazuba bw\'Afurika',
        'Umunyeshuri muto',
        'Rekoro y\'ishuri'
      ],
      featured: false
    },
    {
      id: 'ach7',
      title: 'Best Sports School Award',
      titleRw: 'Igihembo cy\'Ishuri Ryiza mu Mikino',
      sport: 'Multi-Sport',
      sportRw: 'Imikino Myinshi',
      category: 'general',
      type: 'team',
      level: 'national',
      position: 'Overall Winner',
      positionRw: 'Utsindiye Rusange',
      year: '2023',
      date: '2023-12-31',
      event: 'National Sports Excellence Awards',
      eventRw: 'Ibihembo by\'Imikino Nziza y\'Igihugu',
      venue: 'Kigali Convention Centre',
      venueRw: 'Ikigo cy\'Amasezerano cya Kigali',
      recipients: [
        {
          name: 'IPRC Kigali',
          photo: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=200&q=80',
          role: 'Institution'
        }
      ],
      description: 'Recognized as the best sports school in the nation for outstanding performance across all sports disciplines.',
      descriptionRw: 'Twahembwe nk\'ishuri ryiza mu mikino mu gihugu kubera imikino nziza mu bwoko bwose bw\'imikino.',
      medal: 'special',
      stats: [
        { label: 'Sports Programs', value: '12' },
        { label: 'Student Athletes', value: '450+' },
        { label: 'Medals Won', value: '45' },
        { label: 'National Records', value: '3' }
      ],
      image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&q=80',
      highlights: [
        'Excellence in football, basketball, athletics',
        'Best sports infrastructure',
        'Outstanding coaching staff',
        'Community engagement in sports'
      ],
      highlightsRw: [
        'Imikino nziza mu mpira y\'amaguru, basketball, atletike',
        'Ibikorwa remezo by\'imikino byiza',
        'Abatoza b\'ubuhanga',
        'Kugira uruhare mu mikino mu muryango'
      ],
      featured: true
    },
    {
      id: 'ach8',
      title: 'Football Derby Cup Winners',
      titleRw: 'Intsinzi mu Gikombe cya Derby',
      sport: 'Football',
      sportRw: 'Umupira w\'Amaguru',
      category: 'football',
      type: 'team',
      level: 'school',
      position: '1st Place',
      positionRw: 'Umwanya wa 1',
      year: '2024',
      date: '2024-02-14',
      event: 'Valentine\'s Derby Cup',
      eventRw: 'Gikombe cya Derby cya Valentine',
      venue: 'IPRC Kigali Stadium',
      venueRw: 'Stade ya IPRC Kigali',
      recipients: [
        {
          name: 'IPRC Warriors',
          photo: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=200&q=80',
          role: 'Team'
        }
      ],
      description: 'Thrilling victory in the annual derby cup competition.',
      descriptionRw: 'Intsinzi ishimishije mu marushanwa ya buri mwaka ya Derby Cup.',
      medal: 'gold',
      coach: 'Coach Emmanuel Habimana',
      stats: [
        { label: 'Final Score', value: '3-2' },
        { label: 'Shots on Target', value: '12' },
        { label: 'Possession', value: '58%' },
        { label: 'Corners', value: '8' }
      ],
      image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&q=80',
      highlights: [
        'Dramatic last-minute winner',
        'Man of the match: Jean Claude Niyonzima',
        'Record attendance: 5000+ spectators'
      ],
      highlightsRw: [
        'Umukino w\'igihe cy\'iherezo',
        'Umukinnyi w\'umukino: Jean Claude Niyonzima',
        'Abantu benshi: 5000+'
      ],
      featured: false
    }
  ];

  const filteredAchievements = achievements.filter(achievement => {
    const matchesSearch = 
      achievement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      achievement.titleRw.toLowerCase().includes(searchQuery.toLowerCase()) ||
      achievement.sport.toLowerCase().includes(searchQuery.toLowerCase()) ||
      achievement.event.toLowerCase().includes(searchQuery.toLowerCase()) ||
      achievement.recipients.some(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesSport = selectedSport === 'all' || achievement.category === selectedSport;
    const matchesLevel = selectedLevel === 'all' || achievement.level === selectedLevel;
    const matchesYear = selectedYear === 'all' || achievement.year === selectedYear;
    const matchesTab = activeTab === 'all' || achievement.type === activeTab;

    return matchesSearch && matchesSport && matchesLevel && matchesYear && matchesTab;
  });

  const stats = [
    { 
      label: 'Intsinzi Zose', 
      value: achievements.length.toString(), 
      icon: Trophy, 
      color: 'from-yellow-600 to-orange-600',
      description: 'Byose Hamwe'
    },
    { 
      label: 'Medali za Zahabu', 
      value: achievements.filter(a => a.medal === 'gold').length.toString(), 
      icon: Medal, 
      color: 'from-yellow-500 to-yellow-600',
      description: 'Gold Medals'
    },
    { 
      label: 'Medali za Kabiri', 
      value: achievements.filter(a => a.medal === 'silver').length.toString(), 
      icon: Award, 
      color: 'from-gray-400 to-gray-500',
      description: 'Silver Medals'
    },
    { 
      label: 'Medali za Bronze', 
      value: achievements.filter(a => a.medal === 'bronze').length.toString(), 
      icon: Star, 
      color: 'from-orange-700 to-orange-800',
      description: 'Bronze Medals'
    }
  ];

  const getMedalBadge = (medal: string) => {
    const medalConfig = {
      gold: { label: 'Zahabu', color: 'bg-yellow-100 text-yellow-700 border-yellow-400', icon: Crown },
      silver: { label: 'Kabiri', color: 'bg-gray-100 text-gray-700 border-gray-400', icon: Medal },
      bronze: { label: 'Bronze', color: 'bg-orange-100 text-orange-700 border-orange-400', icon: Award },
      special: { label: 'Idasanzwe', color: 'bg-purple-100 text-purple-700 border-purple-400', icon: Sparkles }
    };
    const config = medalConfig[medal as keyof typeof medalConfig];
    const IconComponent = config.icon;
    return (
      <Badge className={`${config.color} border-2 font-semibold flex items-center gap-1`}>
        <IconComponent className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const getLevelBadge = (level: string) => {
    const levelConfig = {
      international: { label: 'Mpuzamahanga', color: 'bg-purple-100 text-purple-700 border-purple-300' },
      national: { label: 'Igihugu', color: 'bg-blue-100 text-blue-700 border-blue-300' },
      regional: { label: 'Akarere', color: 'bg-green-100 text-green-700 border-green-300' },
      school: { label: 'Ishuri', color: 'bg-orange-100 text-orange-700 border-orange-300' }
    };
    const config = levelConfig[level as keyof typeof levelConfig];
    return <Badge className={`${config.color} border font-medium`}>{config.label}</Badge>;
  };

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      team: { label: 'Ikipe', color: 'bg-blue-100 text-blue-700 border-blue-300', icon: Users },
      individual: { label: 'Umuntu ku giti cye', color: 'bg-green-100 text-green-700 border-green-300', icon: Target }
    };
    const config = typeConfig[type as keyof typeof typeConfig];
    const IconComponent = config.icon;
    return (
      <Badge className={`${config.color} border font-medium flex items-center gap-1`}>
        <IconComponent className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-yellow-600 to-orange-600 rounded-xl shadow-lg">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                Intsinzi za Siporo
              </h1>
              <p className="text-gray-600">Sports Achievements & Trophy Cabinet</p>
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
                      <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-yellow-600 group-hover:translate-x-1 transition-all" />
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
          <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Search className="w-6 h-6 text-yellow-600" />
                  Shakisha Intsinzi
                </CardTitle>
                <CardDescription>Search and filter achievements</CardDescription>
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

                <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                  <SelectTrigger className="w-[180px] border-2">
                    <SelectValue placeholder="Hitamo Urwego" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Urwego Rwose</SelectItem>
                    <SelectItem value="international">Mpuzamahanga</SelectItem>
                    <SelectItem value="national">Igihugu</SelectItem>
                    <SelectItem value="regional">Akarere</SelectItem>
                    <SelectItem value="school">Ishuri</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-[150px] border-2">
                    <SelectValue placeholder="Umwaka" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Imyaka Yose</SelectItem>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2023">2023</SelectItem>
                    <SelectItem value="2022">2022</SelectItem>
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
                placeholder="Shakisha intsinzi, ibirori, cyangwa abatsindiye..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-2 h-12 text-lg"
              />
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto border-2">
            <TabsTrigger value="all" className="data-[state=active]:bg-yellow-600 data-[state=active]:text-white">
              Byose
            </TabsTrigger>
            <TabsTrigger value="team" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Amakipe
            </TabsTrigger>
            <TabsTrigger value="individual" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
              Abantu ku Giti Cyabo
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <AnimatePresence mode="popLayout">
            {filteredAchievements.map((achievement, index) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                layout
              >
                <Card 
                  className={`border-2 hover:shadow-2xl transition-all duration-300 cursor-pointer group overflow-hidden ${
                    achievement.featured ? 'ring-2 ring-yellow-400 ring-offset-2' : ''
                  }`}
                  onClick={() => setSelectedAchievement(achievement)}
                >
                  {achievement.featured && (
                    <div className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white text-center py-1 text-xs font-bold flex items-center justify-center gap-1">
                      <Sparkles className="w-3 h-3 fill-white" />
                      FEATURED ACHIEVEMENT
                    </div>
                  )}

                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={achievement.image} 
                      alt={achievement.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3">
                      {getMedalBadge(achievement.medal)}
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                      <p className="text-white text-sm font-semibold">{achievement.year}</p>
                    </div>
                  </div>
                  
                  <CardHeader className="bg-gradient-to-br from-yellow-50 to-orange-50 pb-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-900 group-hover:text-yellow-600 transition-colors line-clamp-2">
                          {achievement.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">{achievement.titleRw}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {getLevelBadge(achievement.level)}
                      {getTypeBadge(achievement.type)}
                      <Badge variant="outline" className="border-yellow-300 text-yellow-700">
                        {achievement.sport}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-4">
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Flag className="w-4 h-4 text-yellow-600 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 truncate">{achievement.position}</p>
                          <p className="text-gray-500 text-xs">{achievement.positionRw}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <Trophy className="w-4 h-4 text-yellow-600 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-700 font-medium truncate">{achievement.event}</p>
                          <p className="text-gray-500 text-xs truncate">{achievement.eventRw}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-yellow-600 flex-shrink-0" />
                        <span className="text-gray-700 font-medium">
                          {new Date(achievement.date).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </span>
                      </div>
                    </div>

                    <Separator className="my-3" />

                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-2">Recipients:</p>
                      <div className="flex flex-wrap gap-2">
                        {achievement.recipients.slice(0, 3).map((recipient, idx) => (
                          <div key={idx} className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg">
                            <img 
                              src={recipient.photo} 
                              alt={recipient.name} 
                              className="w-8 h-8 rounded-full object-cover border-2 border-yellow-200"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-semibold text-gray-900 truncate">{recipient.name}</p>
                              <p className="text-xs text-gray-500">{recipient.role}</p>
                            </div>
                          </div>
                        ))}
                        {achievement.recipients.length > 3 && (
                          <div className="flex items-center justify-center bg-yellow-50 p-2 rounded-lg min-w-[60px]">
                            <p className="text-xs font-semibold text-yellow-700">+{achievement.recipients.length - 3} more</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <Button 
                      className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white group-hover:shadow-lg transition-all"
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

        {filteredAchievements.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Nta ntsinzi zabonetse</h3>
            <p className="text-gray-500">Gerageza guhindura amashakiro yawe</p>
          </motion.div>
        )}

        <AnimatePresence>
          {selectedAchievement && (
            <Dialog open={!!selectedAchievement} onOpenChange={() => setSelectedAchievement(null)}>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <DialogTitle className="text-2xl mb-2">{selectedAchievement.title}</DialogTitle>
                      <DialogDescription className="text-base">{selectedAchievement.titleRw}</DialogDescription>
                    </div>
                    {selectedAchievement.featured && (
                      <Badge className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white border-0 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 fill-white" />
                        Featured
                      </Badge>
                    )}
                  </div>
                </DialogHeader>

                <div className="space-y-6 mt-4">
                  <div className="relative h-64 rounded-lg overflow-hidden">
                    <img 
                      src={selectedAchievement.image} 
                      alt={selectedAchievement.title} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 right-4">
                      {getMedalBadge(selectedAchievement.medal)}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {getLevelBadge(selectedAchievement.level)}
                    {getTypeBadge(selectedAchievement.type)}
                    <Badge variant="outline" className="border-yellow-300 text-yellow-700">
                      {selectedAchievement.sport} • {selectedAchievement.sportRw}
                    </Badge>
                    <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300 border">
                      {selectedAchievement.year}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="border-2">
                      <CardHeader className="bg-yellow-50">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Trophy className="w-5 h-5 text-yellow-600" />
                          Amakuru y'Intsinzi
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4 space-y-3">
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Umwanya</p>
                          <p className="font-bold text-xl text-yellow-600">{selectedAchievement.position}</p>
                          <p className="text-sm text-gray-600">{selectedAchievement.positionRw}</p>
                        </div>
                        <Separator />
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Ibirori</p>
                          <p className="font-semibold text-gray-900">{selectedAchievement.event}</p>
                          <p className="text-sm text-gray-600">{selectedAchievement.eventRw}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Aho</p>
                          <p className="font-semibold text-gray-900">{selectedAchievement.venue}</p>
                          <p className="text-sm text-gray-600">{selectedAchievement.venueRw}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Itariki</p>
                          <p className="font-semibold text-gray-900">
                            {new Date(selectedAchievement.date).toLocaleDateString('en-US', { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </p>
                        </div>
                        {selectedAchievement.coach && (
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Umutoza</p>
                            <p className="font-semibold text-gray-900">{selectedAchievement.coach}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {selectedAchievement.stats && (
                      <Card className="border-2">
                        <CardHeader className="bg-blue-50">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Activity className="w-5 h-5 text-blue-600" />
                            Imibare / Statistics
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                          <div className="space-y-3">
                            {selectedAchievement.stats.map((stat, index) => (
                              <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                <span className="text-sm font-medium text-gray-700">{stat.label}</span>
                                <span className="text-lg font-bold text-blue-600">{stat.value}</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  <Card className="border-2">
                    <CardHeader className="bg-green-50">
                      <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-green-600" />
                        Abatsindiye / Recipients
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedAchievement.recipients.map((recipient, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                            <img 
                              src={recipient.photo} 
                              alt={recipient.name} 
                              className="w-16 h-16 rounded-full object-cover border-4 border-green-200"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-gray-900">{recipient.name}</p>
                              <p className="text-sm text-gray-600">{recipient.role}</p>
                              {recipient.trade && recipient.level && (
                                <p className="text-xs text-gray-500">{recipient.trade} • {recipient.level}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-2">
                    <CardHeader className="bg-purple-50">
                      <CardTitle className="flex items-center gap-2">
                        <Target className="w-5 h-5 text-purple-600" />
                        Ibisobanuro
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <p className="text-gray-700 mb-2">{selectedAchievement.description}</p>
                      <p className="text-gray-600 italic">{selectedAchievement.descriptionRw}</p>
                    </CardContent>
                  </Card>

                  {selectedAchievement.highlights && selectedAchievement.highlights.length > 0 && (
                    <Card className="border-2">
                      <CardHeader className="bg-yellow-50">
                        <CardTitle className="flex items-center gap-2">
                          <Zap className="w-5 h-5 text-yellow-600" />
                          Ibyerekana Cyane / Highlights
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <div className="space-y-3">
                          {selectedAchievement.highlights.map((highlight, index) => (
                            <div key={index} className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                              <Star className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5 fill-yellow-600" />
                              <div className="flex-1">
                                <p className="font-semibold text-gray-900">{highlight}</p>
                                {selectedAchievement.highlightsRw && selectedAchievement.highlightsRw[index] && (
                                  <p className="text-sm text-gray-600 mt-1">{selectedAchievement.highlightsRw[index]}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SportsAchievementsPage;
