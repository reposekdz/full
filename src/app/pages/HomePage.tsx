import React, { useState, useEffect } from 'react';
import Hero from '@/app/components/Hero';
import CampusGallerySection from '@/app/components/CampusGallerySection';
import { motion } from 'motion/react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { 
  ArrowRight, 
  BookOpen, 
  Users, 
  Award, 
  TrendingUp, 
  GraduationCap,
  Trophy,
  Building,
  Clock,
  Calendar,
  Star,
  Quote,
  CheckCircle,
  Target,
  Briefcase,
  Globe
} from 'lucide-react';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';

interface HomePageProps {
  onNavigate: (page: string) => void;
}

const trades = [
  {
    titleKey: 'softwareDevelopment',
    image: 'https://images.unsplash.com/photo-1531498860502-7c67cf02f657?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2Z0d2FyZSUyMGRldmVsb3BtZW50JTIwY29kaW5nfGVufDF8fHx8MTc2ODcxODI3MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    code: 'SOD',
  },
  {
    titleKey: 'buildingConstruction',
    image: 'https://images.unsplash.com/photo-1672072830247-85ac23671e96?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25zdHJ1Y3Rpb24lMjBidWlsZGluZyUyMHNpdGV8ZW58MXx8fHwxNzY4NzMwNzQ0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    code: 'BDC',
  },
  {
    titleKey: 'automobileTechnology',
    image: 'https://images.unsplash.com/photo-1636761358757-0a616eb9e17e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhdXRvbW9iaWxlJTIwbWVjaGFuaWMlMjB3b3Jrc2hvcHxlbnwxfHx8fDE3Njg4MDYyMTl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    code: 'AUTO',
  },
];

// These will be replaced by API data
const defaultNewsArticles = [
  {
    id: 1,
    title: 'Abanyeshuri bacu batsinze amahugurwa y\'ubuhanga',
    description: 'Ikipe y\'abanyeshuri muri Software Development yatsindiye igihembo cya mbere mu mahugurwa y\'igihugu.',
    publish_date: 'Mutarama 15, 2026',
    category: 'Ibihembo',
    image_url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800',
    author: 'Jean Mugisha',
    is_active: true,
    sort_order: 1
  },
  {
    id: 2,
    title: 'Ishuri ryacu ryitabiriye ibirori bya siporo',
    description: 'Abanyeshuri bacu batsinze imikino 5 mu birori bya siporo by\'ishuri ry\'igihugu.',
    publish_date: 'Mutarama 12, 2026',
    category: 'Siporo',
    image_url: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800',
    author: 'Sarah Uwase',
    is_active: true,
    sort_order: 2
  },
  {
    id: 3,
    title: 'Amashuri mashya azatangira mu kwezi gutaha',
    description: 'Kwiyandikisha kw\'abanyeshuri bashya kuzatangira Nyakanga 1, 2026.',
    publish_date: 'Mutarama 10, 2026',
    category: 'Amakuru',
    image_url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800',
    author: 'Grace Ingabire',
    is_active: true,
    sort_order: 3
  },
  {
    id: 4,
    title: 'Ubufatanye bushya n\'amasosiyete',
    description: 'Ishuri ryacu ryasinyeho amasezerano y\'ubufatanye n\'amasosiyete 5 mu bikorwa.',
    publish_date: 'Mutarama 8, 2026',
    category: 'Ubufatanye',
    image_url: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800',
    author: 'Peter Karenzi',
    is_active: true,
    sort_order: 4
  },
];

const defaultTestimonials = [
  {
    id: 1,
    name: 'Jean Claude Mugisha',
    role: 'Umunyeshuri - Software Development',
    avatar: 'JM',
    quote: 'Ishuri ryacu ryampaye amahirwe menshi yo kwiga ubuhanga bw\'ikoranabuhanga. Abarimu bacu barahebuje kandi bagashoboye.',
    rating: 5,
    is_active: true,
    sort_order: 1
  },
  {
    id: 2,
    name: 'Marie Uwase',
    role: 'Umubyeyi',
    avatar: 'MU',
    quote: 'Umwana wanjye yarahindutse cyane kuva atangiye kwiga muri iri shuri. Amasomo ni meza kandi abanyeshuri bagenzurwa neza.',
    rating: 5,
    is_active: true,
    sort_order: 2
  },
  {
    id: 3,
    name: 'Patrick Nkurunziza',
    role: 'Warangije - Building Construction',
    avatar: 'PN',
    quote: 'Nyuma yo kurangiza amashuri yanjye, nabonye akazi kahambaye mu kigo cy\'ubwubatsi. Murakoze ishuri!',
    rating: 5,
    is_active: true,
    sort_order: 3
  },
  {
    id: 4,
    name: 'Alice Mukandori',
    role: 'Umwarimu',
    avatar: 'AM',
    quote: 'Ni ishuri ryiza cyane rifite ibikoresho byiza by\'amashuri. Abanyeshuri bacu bagera kuri byinshi.',
    rating: 5,
    is_active: true,
    sort_order: 4
  },
];

const defaultSchoolStats = [
  {
    id: 1,
    stat_key: 'students',
    value: '1,248',
    label: 'Abanyeshuri',
    icon: 'Users',
    color: 'from-blue-500 to-indigo-500',
    is_active: true,
    sort_order: 1
  },
  {
    id: 2,
    stat_key: 'teachers',
    value: '84',
    label: 'Abarimu',
    icon: 'GraduationCap',
    color: 'from-green-500 to-teal-500',
    is_active: true,
    sort_order: 2
  },
  {
    id: 3,
    stat_key: 'employment',
    value: '95%',
    label: 'Gushirwa mu kazi',
    icon: 'Briefcase',
    color: 'from-yellow-500 to-orange-500',
    is_active: true,
    sort_order: 3
  },
  {
    id: 4,
    stat_key: 'awards',
    value: '25+',
    label: 'Ibihembo',
    icon: 'Trophy',
    color: 'from-orange-500 to-red-500',
    is_active: true,
    sort_order: 4
  },
];

const defaultAchievements = [
  {
    id: 1,
    title: 'Ishuri ry\'Umwaka',
    year: '2025',
    description: 'Twatoranijwe nk\'ishuri ry\'umwaka mu mahugurwa y\'ubuhanga',
    image_url: '',
    is_active: true,
    sort_order: 1
  },
  {
    id: 2,
    title: 'Igihembo cya Mbere - Siporo',
    year: '2025',
    description: 'Abanyeshuri bacu batsinze igihembo cya mbere mu mikino y\'ishuri',
    image_url: '',
    is_active: true,
    sort_order: 2
  },
  {
    id: 3,
    title: 'Ubuhanga bw\'Ikoranabuhanga',
    year: '2024',
    description: 'Ikipe yacu yatsinze amahugurwa y\'igihugu y\'ubuhanga bw\'ikoranabuhanga',
    image_url: '',
    is_active: true,
    sort_order: 3
  },
  {
    id: 4,
    title: 'Ubufatanye Mpuzamahanga',
    year: '2024',
    description: 'Twashyizeho ubufatanye n\'amashuri menshi mu mahanga',
    image_url: '',
    is_active: true,
    sort_order: 4
  },
];

const defaultFeatures = [
  {
    id: 1,
    title: 'Experienced Teachers',
    title_rw: 'Abarimu Babizi',
    description: 'Our teachers have extensive experience and expertise',
    description_rw: 'Abarimu bacu bafite uburambe bwinshi n\'ubuhanga',
    icon: 'GraduationCap',
    color: 'from-blue-500 to-indigo-600',
    is_active: true,
    sort_order: 1
  },
  {
    id: 2,
    title: 'Modern Facilities',
    title_rw: 'Ibikoresho By\'Igihe',
    description: 'State-of-the-art facilities and equipment',
    description_rw: 'Ibikoresho bigezweho by\'igihe',
    icon: 'Building',
    color: 'from-green-500 to-teal-500',
    is_active: true,
    sort_order: 2
  },
  {
    id: 3,
    title: 'High Employment Rate',
    title_rw: 'Gushirwa mu Kazi Cyinshi',
    description: '95% of our graduates find employment',
    description_rw: '95% y\'abanyeshuri bacu babona akazi',
    icon: 'Briefcase',
    color: 'from-yellow-500 to-orange-500',
    is_active: true,
    sort_order: 3
  },
  {
    id: 4,
    title: 'Many Trophies',
    title_rw: 'Ibihembo Byinshi',
    description: '25+ trophies won in various competitions',
    description_rw: 'Ibihembo 25+ byatsindwe mu marushanwa',
    icon: 'Trophy',
    color: 'from-orange-500 to-red-500',
    is_active: true,
    sort_order: 4
  },
  {
    id: 5,
    title: 'International Partnerships',
    title_rw: 'Ubufatanye Mpuzamahanga',
    description: 'Partnerships with international institutions',
    description_rw: 'Ubufatanye n\'amashuri mpuzamahanga',
    icon: 'Globe',
    color: 'from-pink-500 to-rose-500',
    is_active: true,
    sort_order: 5
  },
  {
    id: 6,
    title: 'Extracurricular Activities',
    title_rw: 'Ibikorwa by\'Inyongera',
    description: 'Sports, clubs, and other activities',
    description_rw: 'Siporo, amakoperative n\'ibindi bikorwa',
    icon: 'Target',
    color: 'from-purple-500 to-indigo-500',
    is_active: true,
    sort_order: 6
  },
];

const defaultEvents = [
  {
    id: 1,
    title: 'Parent-Teacher Meeting',
    title_rw: 'Inama y\'Ababyeyi n\'Abarimu',
    description: 'Monthly meeting between parents and teachers',
    description_rw: 'Inama y\'ukwezi ihuza ababyeyi n\'abarimu',
    event_date: '2026-01-25',
    event_time: '14:00:00',
    location: 'Main Hall',
    event_type: 'academic',
    priority: 'high',
    organizer: 'School Administration',
    organizer_rw: 'Abayobozi b\'Ishuri',
    contact_info: 'admin@school.rw',
    max_attendees: 200,
    current_attendees: 0,
    status: 'upcoming',
    is_active: true,
    sort_order: 1
  },
  {
    id: 2,
    title: 'Mid-term Exams',
    title_rw: 'Imirimo y\'Icyiciro cya Kabiri',
    description: 'Mid-term examinations for all classes',
    description_rw: 'Imirimo y\'icyiciro cya kabiri ku mashuri yose',
    event_date: '2026-01-28',
    event_time: '08:00:00',
    location: 'All Classrooms',
    event_type: 'academic',
    priority: 'high',
    organizer: 'Academic Department',
    organizer_rw: 'Ishami ry\'Amashuri',
    contact_info: 'academic@school.rw',
    max_attendees: null,
    current_attendees: 0,
    status: 'upcoming',
    is_active: true,
    sort_order: 2
  },
  {
    id: 3,
    title: 'Basketball Championship',
    title_rw: 'Igikombe cya Basketball',
    description: 'Regional basketball championship finals',
    description_rw: 'Impera z\'igikombe cya basketball cy\'akarere',
    event_date: '2026-02-01',
    event_time: '14:00:00',
    location: 'Kibagabaga Stadium',
    event_type: 'sports',
    priority: 'medium',
    organizer: 'Sports Department',
    organizer_rw: 'Ishami ry\'Imikino',
    contact_info: 'sports@school.rw',
    max_attendees: 500,
    current_attendees: 0,
    status: 'upcoming',
    is_active: true,
    sort_order: 3
  },
  {
    id: 4,
    title: 'Athletics Competition',
    title_rw: 'Marushanwa y\'Imikino Ngororamubiri',
    description: 'Inter-school athletics competition',
    description_rw: 'Marushanwa y\'imikino ngororamubiri hagati y\'amashuri',
    event_date: '2026-02-05',
    event_time: '08:00:00',
    location: 'Nyamirambo Stadium',
    event_type: 'sports',
    priority: 'medium',
    organizer: 'PE Department',
    organizer_rw: 'Ishami ry\'Imikino Ngororamubiri',
    contact_info: 'pe@school.rw',
    max_attendees: 300,
    current_attendees: 0,
    status: 'upcoming',
    is_active: true,
    sort_order: 4
  },
];

const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const { t, language } = useLanguage();
  const [newsArticles, setNewsArticles] = useState(defaultNewsArticles);
  const [testimonials, setTestimonials] = useState(defaultTestimonials);
  const [schoolStats, setSchoolStats] = useState(defaultSchoolStats);
  const [achievements, setAchievements] = useState(defaultAchievements);
  const [dynamicFeatures, setDynamicFeatures] = useState(defaultFeatures);
  const [upcomingEvents, setUpcomingEvents] = useState(defaultEvents);
  const [sportsCategories, setSportsCategories] = useState([]);
  const [sportsMatches, setSportsMatches] = useState([]);
  const [sportsAchievements, setSportsAchievements] = useState([]);
  const [loading, setLoading] = useState(false);

  const API_BASE = 'http://localhost:5000/api';

  // Icon mapping
  const iconMap: { [key: string]: any } = {
    Users,
    GraduationCap,
    Briefcase,
    Trophy,
    Award,
    Target,
    TrendingUp,
    BookOpen
  };

  // Fetch all dynamic content from API
  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      try {
        // Fetch news articles
        try {
          const newsResponse = await fetch(`${API_BASE}/content/news`);
          const newsData = await newsResponse.json();
          if (newsData.success && newsData.articles && newsData.articles.length > 0) {
            setNewsArticles(newsData.articles);
          }
        } catch (error) {
          console.log('News API error, using default:', error.message);
        }

        // Fetch testimonials
        try {
          const testimonialsResponse = await fetch(`${API_BASE}/content/testimonials`);
          const testimonialsData = await testimonialsResponse.json();
          if (testimonialsData.success && testimonialsData.testimonials && testimonialsData.testimonials.length > 0) {
            setTestimonials(testimonialsData.testimonials);
          }
        } catch (error) {
          console.log('Testimonials API error, using default:', error.message);
        }

        // Fetch school statistics 
        try {
          const statsResponse = await fetch(`${API_BASE}/content/stats`);
          const statsData = await statsResponse.json();
          if (statsData.success && statsData.stats && statsData.stats.length > 0) {
            setSchoolStats(statsData.stats);
          }
        } catch (error) {
          console.log('Stats API error, using default:', error.message);
        }

        // Fetch achievements
        try {
          const achievementsResponse = await fetch(`${API_BASE}/content/achievements`);
          const achievementsData = await achievementsResponse.json();
          if (achievementsData.success && achievementsData.achievements && achievementsData.achievements.length > 0) {
            setAchievements(achievementsData.achievements);
          }
        } catch (error) {
          console.log('Achievements API error, using default:', error.message);
        }

        // Fetch slides for hero section
        try {
          const slidesResponse = await fetch(`${API_BASE}/content/slides`);
          const slidesData = await slidesResponse.json();
          if (slidesData.success && slidesData.slides && slidesData.slides.length > 0) {
            // Pass slides to Hero component or use them for homepage content
            console.log('Loaded slides:', slidesData.slides);
          }
        } catch (error) {
          console.log('Slides API error:', error.message);
        }

        // Fetch sports teams and events
        try {
          const sportsResponse = await fetch(`${API_BASE}/sports/teams`);
          const sportsData = await sportsResponse.json();
          if (sportsData.success && sportsData.teams) {
            setSportsCategories(sportsData.teams);
          }
        } catch (error) {
          console.log('Sports API error:', error.message);
        }

        // Fetch management teams
        try {
          const teamsResponse = await fetch(`${API_BASE}/teams`);
          const teamsData = await teamsResponse.json();
          if (teamsData.success && teamsData.teams) {
            console.log('Management teams loaded:', teamsData.teams);
          }
        } catch (error) {
          console.log('Teams API error:', error.message);
        }

        // Fetch dynamic features
        try {
          const featuresResponse = await fetch(`${API_BASE}/dynamic/features`);
          const featuresData = await featuresResponse.json();
          if (featuresData.success && featuresData.features.length > 0) {
            setDynamicFeatures(featuresData.features);
          }
        } catch (error) {
          console.log('Using default features');
        }

        // Fetch upcoming events
        try {
          const eventsResponse = await fetch(`${API_BASE}/dynamic/events?status=upcoming&limit=4`);
          const eventsData = await eventsResponse.json();
          if (eventsData.success && eventsData.events.length > 0) {
            setUpcomingEvents(eventsData.events);
          }
        } catch (error) {
          console.log('Using default events');
        }

        // Fetch sports categories
        try {
          const sportsResponse = await fetch(`${API_BASE}/dynamic/sports/categories`);
          const sportsData = await sportsResponse.json();
          if (sportsData.success && sportsData.categories.length > 0) {
            setSportsCategories(sportsData.categories);
          }
        } catch (error) {
          console.log('Using default sports categories');
        }

        // Fetch upcoming sports matches
        try {
          const matchesResponse = await fetch(`${API_BASE}/dynamic/sports/matches?status=upcoming&limit=4`);
          const matchesData = await matchesResponse.json();
          if (matchesData.success && matchesData.matches.length > 0) {
            setSportsMatches(matchesData.matches);
          }
        } catch (error) {
          console.log('Using default sports matches');
        }

        // Fetch sports achievements
        try {
          const sportsAchievementsResponse = await fetch(`${API_BASE}/dynamic/sports/achievements?featured=true&limit=4`);
          const sportsAchievementsData = await sportsAchievementsResponse.json();
          if (sportsAchievementsData.success && sportsAchievementsData.achievements.length > 0) {
            setSportsAchievements(sportsAchievementsData.achievements);
          }
        } catch (error) {
          console.log('Using default sports achievements');
        }

      } catch (error) {
        console.error('Error fetching content:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  return (
    <div>
      <Hero />

      {/* Statistics Section */}
      <section className="py-8 sm:py-12 md:py-16 bg-gradient-to-br from-yellow-50 via-white to-green-50">
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-6 sm:mb-8 md:mb-12"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black mb-2 sm:mb-4 bg-gradient-to-r from-[#ADFF2F] via-teal-600 to-blue-600 bg-clip-text text-transparent px-2">
              Ishuri ry'Imyuga n'Ubumenyi Ngiro
            </h2>
            <p className="text-gray-600 text-sm sm:text-base md:text-lg px-4">
              Ishuri ry'ubuhanga rifite imikorere myiza kandi ryizera
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {schoolStats.map((stat, index) => {
              const IconComponent = iconMap[stat.icon] || Users;
              return (
                <motion.div
                  key={stat.stat_key || stat.label}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="border-2 border-yellow-200 shadow-lg hover:shadow-xl transition-all">
                    <CardContent className="p-4 sm:p-6 md:p-8 text-center">
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 mx-auto mb-2 sm:mb-3 md:mb-4 rounded-full bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                        <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-white" />
                      </div>
                      <h3 className="text-xl sm:text-2xl md:text-4xl font-black text-gray-900 mb-1 sm:mb-2">{stat.value}</h3>
                      <p className="text-xs sm:text-sm md:text-base text-gray-600 font-medium">{stat.label}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trades Section */}
      <section className="py-8 sm:py-12 md:py-16 bg-white">
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl sm:text-3xl md:text-4xl font-black text-center mb-6 sm:mb-8 md:mb-12 bg-gradient-to-r from-[#ADFF2F] via-teal-600 to-blue-600 bg-clip-text text-transparent px-2"
          >
            {t('tradesOffered')}
          </motion.h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {trades.map((trade, index) => (
              <motion.div
                key={trade.code}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="group relative overflow-hidden rounded-xl sm:rounded-2xl shadow-xl cursor-pointer"
                onClick={() => onNavigate('trades')}
              >
                <div className="aspect-[4/3] relative">
                  <ImageWithFallback
                    src={trade.image}
                    alt={t(trade.titleKey)}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-2">{t(trade.titleKey)}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-[#ADFF2F] font-bold text-base sm:text-lg">{trade.code}</span>
                    <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 text-white transform group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* News Section */}
      <section className="py-8 sm:py-12 md:py-16 bg-gradient-to-br from-gray-50 to-yellow-50/30">
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-6 sm:mb-8 md:mb-12"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black mb-2 sm:mb-4 bg-gradient-to-r from-[#ADFF2F] via-teal-600 to-blue-600 bg-clip-text text-transparent px-2">
              Amakuru Y\'Ishuri
            </h2>
            <p className="text-gray-600 text-sm sm:text-base md:text-lg px-4">
              Amakuru mashya n\'ibikorwa by\'ishuri ryacu
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {newsArticles.map((article, index) => (
              <motion.div
                key={article.id || index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-2 border-yellow-200 shadow-lg hover:shadow-xl transition-all h-full overflow-hidden group cursor-pointer">
                  <div className="aspect-video relative overflow-hidden">
                    <img 
                      src={article.image_url?.startsWith('/uploads') ? `http://localhost:5000${article.image_url}` : article.image_url || article.image} 
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <Badge className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-gradient-to-r from-yellow-500 to-green-500 text-white border-0 text-xs sm:text-sm">
                      {article.category}
                    </Badge>
                  </div>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">
                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                      {article.publish_date || article.date}
                    </div>
                    <h3 className="text-sm sm:text-base md:text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 line-clamp-2 sm:line-clamp-3">
                      {article.description}
                    </p>
                    <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-gray-200">
                      <span className="text-xs sm:text-sm text-gray-600 truncate">{article.author}</span>
                      <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-[#ADFF2F] group-hover:translate-x-2 transition-transform flex-shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-gradient-to-br from-yellow-500 via-green-500 to-teal-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-black mb-4 text-white">
              Ibyo Abantu Bavuga
            </h2>
            <p className="text-white/90 text-lg">
              Icyo abanyeshuri, ababyeyi, n\'abarimu bavuga ku ishuri ryacu
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id || index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-2 border-white/30 shadow-xl hover:shadow-2xl transition-all bg-white/95 backdrop-blur-sm h-full">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <Avatar className="h-14 w-14 border-2 border-yellow-400">
                        <AvatarFallback className="bg-gradient-to-br from-yellow-500 to-green-500 text-white text-lg font-bold">
                          {testimonial.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                        <p className="text-sm text-gray-600">{testimonial.role}</p>
                        <div className="flex gap-1 mt-2">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          ))}
                        </div>
                      </div>
                      <Quote className="w-8 h-8 text-yellow-500 opacity-50" />
                    </div>
                    <p className="text-gray-700 italic">
                      "{testimonial.quote}"
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-black mb-4 bg-gradient-to-r from-[#ADFF2F] via-teal-600 to-blue-600 bg-clip-text text-transparent">
              Ibihembo N\'Intsinzi
            </h2>
            <p className="text-gray-600 text-lg">
              Ibyo twagezeho mu myaka yashize
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {achievements.map((achievement, index) => (
              <motion.div
                key={achievement.id || index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <Card className="border-2 border-yellow-200 shadow-lg hover:shadow-xl transition-all h-full bg-gradient-to-br from-yellow-50 to-green-50">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-yellow-500 to-green-500 flex items-center justify-center">
                      <Trophy className="w-8 h-8 text-white" />
                    </div>
                    <Badge className="mb-3 bg-gradient-to-r from-yellow-500 to-green-500 text-white border-0">
                      {achievement.year}
                    </Badge>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {achievement.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {achievement.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Campus Gallery Section */}
      <CampusGallerySection />

      {/* Dual Portal Section */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Upcoming Events */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl shadow-xl p-8 border-2 border-yellow-200"
            >
              <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
                <Calendar className="w-7 h-7 text-yellow-600" />
                {t('upcomingEvents')}
              </h3>
              <div className="space-y-4">
                {[
                  { title: 'Inama y\'Ababyeyi', date: '25', month: 'JAN', time: '2:00 PM', location: 'Icyumba Gikuru' },
                  { title: 'Ikizamini cy\'Igice', date: '28', month: 'JAN', time: '8:00 AM', location: 'Amaklasi Yose' },
                  { title: 'Umukino wa Basketball', date: '30', month: 'JAN', time: '4:00 PM', location: 'Terrain ya Siporo' }
                ].map((event, i) => (
                  <div key={i} className="flex items-start space-x-4 p-4 bg-gradient-to-r from-[#ADFF2F]/10 to-blue-50 rounded-lg border border-yellow-200 hover:shadow-md transition-shadow">
                    <div className="bg-gradient-to-br from-[#ADFF2F] to-teal-500 text-white rounded-lg p-3 flex-shrink-0">
                      <div className="text-center">
                        <div className="text-2xl font-black">{event.date}</div>
                        <div className="text-xs">{event.month}</div>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900">{event.title}</h4>
                      <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                        <Clock className="w-4 h-4" />
                        {event.time} • {event.location}
                      </p>
                    </div>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Student & Parent Portal */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-[#ADFF2F] via-teal-500 to-blue-600 rounded-2xl shadow-xl p-8"
            >
              <h3 className="text-2xl font-black text-white mb-6">{t('studentParentPortal')}</h3>
              <div className="space-y-4">
                <motion.button
                  whileHover={{ scale: 1.05, x: 10 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onNavigate('login')}
                  className="w-full flex items-center justify-between bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-6 rounded-xl transition-all border-2 border-white/30"
                >
                  <div className="flex items-center space-x-4">
                    <div className="bg-white/20 p-3 rounded-lg">
                      <BookOpen className="w-8 h-8" />
                    </div>
                    <div className="text-left">
                      <span className="font-bold text-lg block">{t('studentPortal')}</span>
                      <span className="text-sm text-white/80">Injira kuri dashbord yawe</span>
                    </div>
                  </div>
                  <ArrowRight className="w-6 h-6" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05, x: 10 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onNavigate('register')}
                  className="w-full flex items-center justify-between bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-6 rounded-xl transition-all border-2 border-white/30"
                >
                  <div className="flex items-center space-x-4">
                    <div className="bg-white/20 p-3 rounded-lg">
                      <Users className="w-8 h-8" />
                    </div>
                    <div className="text-left">
                      <span className="font-bold text-lg block">{t('studentAndParent')}</span>
                      <span className="text-sm text-white/80">Reba amakuru y\'abana bawe</span>
                    </div>
                  </div>
                  <ArrowRight className="w-6 h-6" />
                </motion.button>

                <div className="mt-6 p-6 bg-white/10 backdrop-blur-sm rounded-xl border-2 border-white/20">
                  <h4 className="font-bold text-white mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Imiterere Yose
                  </h4>
                  <ul className="space-y-2 text-white/90 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Reba amanota yawe
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Kubungabunga kwitabira
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Kwishyura amafaranga
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Kubona amakuru y\'ishuri
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 bg-gradient-to-br from-yellow-50 to-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-black mb-4 bg-gradient-to-r from-[#ADFF2F] via-teal-600 to-blue-600 bg-clip-text text-transparent">
              Kuki Watora Ishuri Ryacu?
            </h2>
            <p className="text-gray-600 text-lg">
              Impamvu zitandukanye zo guhitamo ishuri ryacu
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {dynamicFeatures.map((feature, index) => {
              const IconComponent = iconMap[feature.icon] || GraduationCap;
              return (
                <motion.div
                  key={feature.id || index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <Card className="border-2 border-yellow-200 shadow-lg hover:shadow-xl transition-all h-full">
                    <CardContent className="p-8 text-center">
                      <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br ${feature.color} flex items-center justify-center`}>
                        <IconComponent className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">
                        {language === 'rw' ? feature.title_rw : feature.title}
                      </h3>
                      <p className="text-gray-600">
                        {language === 'rw' ? feature.description_rw : feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
