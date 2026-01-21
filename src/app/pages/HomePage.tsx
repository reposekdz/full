import React from 'react';
import Hero from '@/app/components/Hero';
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

const newsArticles = [
  {
    title: 'Abanyeshuri bacu batsinze amahugurwa y\'ubuhanga',
    description: 'Ikipe y\'abanyeshuri muri Software Development yatsindiye igihembo cya mbere mu mahugurwa y\'igihugu.',
    date: 'Mutarama 15, 2026',
    category: 'Ibihembo',
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800',
    author: 'Jean Mugisha'
  },
  {
    title: 'Ishuri ryacu ryitabiriye ibirori bya siporo',
    description: 'Abanyeshuri bacu batsinze imikino 5 mu birori bya siporo by\'ishuri ry\'igihugu.',
    date: 'Mutarama 12, 2026',
    category: 'Siporo',
    image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800',
    author: 'Sarah Uwase'
  },
  {
    title: 'Amashuri mashya azatangira mu kwezi gutaha',
    description: 'Kwiyandikisha kw\'abanyeshuri bashya kuzatangira Nyakanga 1, 2026.',
    date: 'Mutarama 10, 2026',
    category: 'Amakuru',
    image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800',
    author: 'Grace Ingabire'
  },
  {
    title: 'Ubufatanye bushya n\'amasosiyete',
    description: 'Ishuri ryacu ryasinyeho amasezerano y\'ubufatanye n\'amasosiyete 5 mu bikorwa.',
    date: 'Mutarama 8, 2026',
    category: 'Ubufatanye',
    image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800',
    author: 'Peter Karenzi'
  },
];

const testimonials = [
  {
    name: 'Jean Claude Mugisha',
    role: 'Umunyeshuri - Software Development',
    avatar: 'JM',
    quote: 'Ishuri ryacu ryampaye amahirwe menshi yo kwiga ubuhanga bw\'ikoranabuhanga. Abarimu bacu barahebuje kandi bagashoboye.',
    rating: 5
  },
  {
    name: 'Marie Uwase',
    role: 'Umubyeyi',
    avatar: 'MU',
    quote: 'Umwana wanjye yarahindutse cyane kuva atangiye kwiga muri iri shuri. Amasomo ni meza kandi abanyeshuri bagenzurwa neza.',
    rating: 5
  },
  {
    name: 'Patrick Nkurunziza',
    role: 'Warangije - Building Construction',
    avatar: 'PN',
    quote: 'Nyuma yo kurangiza amashuri yanjye, nabonye akazi kahambaye mu kigo cy\'ubwubatsi. Murakoze ishuri!',
    rating: 5
  },
  {
    name: 'Alice Mukandori',
    role: 'Umwarimu',
    avatar: 'AM',
    quote: 'Ni ishuri ryiza cyane rifite ibikoresho byiza by\'amashuri. Abanyeshuri bacu bagera kuri byinshi.',
    rating: 5
  },
];

const schoolStats = [
  {
    value: '1,248',
    label: 'Abanyeshuri',
    icon: Users,
    color: 'from-blue-500 to-indigo-500'
  },
  {
    value: '84',
    label: 'Abarimu',
    icon: GraduationCap,
    color: 'from-green-500 to-teal-500'
  },
  {
    value: '95%',
    label: 'Gushirwa mu kazi',
    icon: Briefcase,
    color: 'from-yellow-500 to-orange-500'
  },
  {
    value: '25+',
    label: 'Ibihembo',
    icon: Trophy,
    color: 'from-orange-500 to-red-500'
  },
];

const achievements = [
  {
    title: 'Ishuri ry\'Umwaka',
    year: '2025',
    description: 'Twatoranijwe nk\'ishuri ry\'umwaka mu mahugurwa y\'ubuhanga'
  },
  {
    title: 'Igihembo cya Mbere - Siporo',
    year: '2025',
    description: 'Abanyeshuri bacu batsinze igihembo cya mbere mu mikino y\'ishuri'
  },
  {
    title: 'Ubuhanga bw\'Ikoranabuhanga',
    year: '2024',
    description: 'Ikipe yacu yatsinze amahugurwa y\'igihugu y\'ubuhanga bw\'ikoranabuhanga'
  },
  {
    title: 'Ubufatanye Mpuzamahanga',
    year: '2024',
    description: 'Twashyizeho ubufatanye n\'amashuri menshi mu mahanga'
  },
];

const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const { t } = useLanguage();

  return (
    <div>
      <Hero />

      {/* Statistics Section */}
      <section className="py-16 bg-gradient-to-br from-yellow-50 via-white to-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-black mb-4 bg-gradient-to-r from-[#ADFF2F] via-teal-600 to-blue-600 bg-clip-text text-transparent">
              Imibare Yacu
            </h2>
            <p className="text-gray-600 text-lg">
              Ishuri ry\'ubuhanga rifite imikorere myiza kandi ryizera
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {schoolStats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-2 border-yellow-200 shadow-lg hover:shadow-xl transition-all">
                  <CardContent className="p-8 text-center">
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                      <stat.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-4xl font-black text-gray-900 mb-2">{stat.value}</h3>
                    <p className="text-gray-600 font-medium">{stat.label}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trades Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-black text-center mb-12 bg-gradient-to-r from-[#ADFF2F] via-teal-600 to-blue-600 bg-clip-text text-transparent"
          >
            {t('tradesOffered')}
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {trades.map((trade, index) => (
              <motion.div
                key={trade.code}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="group relative overflow-hidden rounded-2xl shadow-xl cursor-pointer"
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
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-2xl font-bold text-white mb-2">{t(trade.titleKey)}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-[#ADFF2F] font-bold text-lg">{trade.code}</span>
                    <ArrowRight className="w-6 h-6 text-white transform group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* News Section */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-yellow-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-black mb-4 bg-gradient-to-r from-[#ADFF2F] via-teal-600 to-blue-600 bg-clip-text text-transparent">
              Amakuru Y\'Ishuri
            </h2>
            <p className="text-gray-600 text-lg">
              Amakuru mashya n\'ibikorwa by\'ishuri ryacu
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {newsArticles.map((article, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-2 border-yellow-200 shadow-lg hover:shadow-xl transition-all h-full overflow-hidden group cursor-pointer">
                  <div className="aspect-video relative overflow-hidden">
                    <img 
                      src={article.image} 
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <Badge className="absolute top-4 right-4 bg-gradient-to-r from-yellow-500 to-green-500 text-white border-0">
                      {article.category}
                    </Badge>
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                      <Calendar className="w-4 h-4" />
                      {article.date}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                      {article.description}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <span className="text-sm text-gray-600">{article.author}</span>
                      <ArrowRight className="w-5 h-5 text-[#ADFF2F] group-hover:translate-x-2 transition-transform" />
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
                key={index}
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
                key={index}
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
            {[
              {
                icon: GraduationCap,
                title: 'Abarimu Babizi',
                description: 'Abarimu bacu bafite uburambe bwinshi kandi barahebuje',
                color: 'from-blue-500 to-indigo-500'
              },
              {
                icon: Building,
                title: 'Ibikoresho Byiza',
                description: 'Ishuri dufite ibikoresho bigezweho by\'amashuri',
                color: 'from-green-500 to-teal-500'
              },
              {
                icon: Briefcase,
                title: 'Gushirwa mu Kazi',
                description: '95% y\'abanyeshuri bacu babona akazi nyuma y\'amashuri',
                color: 'from-yellow-500 to-orange-500'
              },
              {
                icon: Trophy,
                title: 'Ibihembo Byinshi',
                description: 'Twatsindiye ibihembo 25+ mu myaka 5 ishize',
                color: 'from-orange-500 to-red-500'
              },
              {
                icon: Globe,
                title: 'Ubufatanye Mpuzamahanga',
                description: 'Dufite ubufatanye n\'amashuri menshi mu mahanga',
                color: 'from-pink-500 to-rose-500'
              },
              {
                icon: Target,
                title: 'Ibikorwa by\'Inyongera',
                description: 'Siporo, club, n\'ibikorwa by\'inyongera byinshi',
                color: 'from-purple-500 to-indigo-500'
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <Card className="border-2 border-yellow-200 shadow-lg hover:shadow-xl transition-all h-full">
                  <CardContent className="p-8 text-center">
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br ${feature.color} flex items-center justify-center`}>
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
