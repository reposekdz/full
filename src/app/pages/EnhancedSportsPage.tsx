import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Users, Award, TrendingUp, ArrowRight, Sparkles, Star, Target, Zap, Crown, Flame, Calendar, MapPin, Clock, Heart, Shield, Rocket } from 'lucide-react';

interface EnhancedSportsPageProps {
  onNavigate: (page: string) => void;
}

const EnhancedSportsPage: React.FC<EnhancedSportsPageProps> = ({ onNavigate }) => {
  const [teams, setTeams] = useState<any[]>([]);
  const [hoveredTeam, setHoveredTeam] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/sports/teams')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const filtered = data.teams.filter((t: any) => t.sport_type === 'football' || t.sport_type === 'volleyball');
          setTeams(filtered);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-green-50 flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity }}>
          <Trophy className="w-20 h-20 text-green-600" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-green-50">
      {/* Hero */}
      <section className="relative py-24 overflow-hidden bg-gradient-to-r from-yellow-400 via-green-400 to-yellow-500">
        <div className="absolute inset-0 opacity-20">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-4xl"
              style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
              animate={{ y: [0, -30, 0], opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 3 + Math.random() * 2, repeat: Infinity }}
            >
              {i % 3 === 0 ? '⚽' : i % 3 === 1 ? '🏐' : '🏆'}
            </motion.div>
          ))}
        </div>

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="inline-flex items-center gap-6 mb-8">
              <div className="bg-white p-8 rounded-3xl shadow-2xl">
                <Trophy className="w-20 h-20 text-green-600" />
              </div>
              <h1 className="text-8xl font-black text-white drop-shadow-2xl">SIPORO</h1>
              <div className="bg-white p-8 rounded-3xl shadow-2xl">
                <Crown className="w-20 h-20 text-yellow-600" />
              </div>
            </motion.div>
            <p className="text-3xl text-white font-black mb-8 drop-shadow-lg">
              Amakipe ya Siporo ya Garden TVET School
            </p>
          </motion.div>
        </div>
      </section>

      {/* Teams Cards */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Article Content - Left Side */}
            <div className="lg:w-2/3">
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl shadow-2xl p-12">
                <div className="flex items-center gap-4 mb-8">
                  <div className="bg-gradient-to-r from-yellow-400 to-green-400 p-4 rounded-2xl">
                    <Shield className="w-12 h-12 text-white" />
                  </div>
                  <div>
                    <h2 className="text-4xl font-black text-gray-900">Siporo muri Garden TVET School</h2>
                    <p className="text-gray-600 font-bold">Iterambere ry'Umubiri n'Umwuka</p>
                  </div>
                </div>

            <div className="prose prose-lg max-w-none space-y-6 text-gray-700 leading-relaxed">
              <p className="text-xl font-bold text-gray-900 mb-6">
                Garden TVET School ni ishuri ry'ubumenyi bw'ikoranabuhanga (Technical and Vocational Education and Training) riherereye mu Kigali, u Rwanda. Ishuri ryacu rifite umuco ukomeye wo gushyigikira siporo nk'igice cy'ingenzi cy'uburezi bwuzuye bw'abanyeshuri. Twizera ko siporo ari urufunguzo rwo guteza imbere ubuzima bw'umubiri, ubushobozi bwo gukorana n'abandi, no kwiyubaka imico myiza.
              </p>

              <h3 className="text-3xl font-black text-gray-900 mt-8 mb-4 flex items-center gap-3">
                <Target className="w-8 h-8 text-green-600" />
                Intego z'Amakipe ya Siporo
              </h3>
              <p>
                Amakipe ya siporo ya Garden TVET School yashyizweho mu 2020 hagamijwe guteza imbere ubushobozi bw'abanyeshuri mu mikino itandukanye. Intego zacu ni uguteza imbere ubuzima bw'umubiri bw'abanyeshuri, kwigisha abanyeshuri gufatanya no gukorana mu matsinda, no kubafasha kugera ku ntego zabo mu mikino. Dufite amakipe abiri akomeye: Umupira w'Amaguru (Football) n'Umupira w'Amaboko (Volleyball), byombi bifite abakinnyi beza kandi bifite intsinzi nyinshi mu marushanwa atandukanye.
              </p>

              <h3 className="text-3xl font-black text-gray-900 mt-8 mb-4 flex items-center gap-3">
                <Users className="w-8 h-8 text-yellow-600" />
                Abatoza Bacu Bafite Uburambe
              </h3>
              <p>
                Amakipe yacu ayobowe n'abatoza bafite uburambe bukomeye mu gutoza siporo. Abatoza bacu bafite imyaka myinshi y'uburambe mu gutoza abanyeshuri no kubafasha kugera ku ntego zabo. Bafite ubumenyi bukomeye mu mikino, imyitozo, n'uburyo bwo guteza imbere ubushobozi bw'abakinnyi. Bafite kandi ubushobozi bwo gufasha abanyeshuri mu bibazo by'umubiri n'umutwe, no kubafasha kwiga imyifatire myiza mu mikino.
              </p>

              <div className="bg-gradient-to-br from-yellow-50 to-green-50 rounded-2xl p-8 my-8">
                <h4 className="text-2xl font-black text-gray-900 mb-4">Abatoza ba Football</h4>
                <p className="mb-4">
                  <strong className="text-green-600">Coach Jean Pierre</strong> ni umutoza mukuru w'ikipe ya Football. Afite uburambe bw'imyaka 10 mu gutoza umupira w'amaguru. Yatoje amakipe menshi kandi yaronse ibihembo byinshi mu marushanwa y'amashuri. Afite ubumenyi bukomeye mu mikino ya moteri, imyitozo y'umubiri, n'uburyo bwo guteza imbere ubushobozi bw'abakinnyi. Yize muri National Sports Academy kandi afite impamyabumenyi nyinshi mu gutoza siporo.
                </p>
                <p>
                  Coach Jean Pierre yigisha abanyeshuri gukina neza, gufatanya mu kipe, no kwubaha amategeko y'umukino. Afite kandi ubushobozi bwo gufasha abanyeshuri mu bibazo by'umubiri n'umutwe, no kubafasha kwiga imyifatire myiza mu mikino. Yizera ko siporo ari urufunguzo rwo guteza imbere ubuzima bw'umubiri n'umwuka bw'abanyeshuri.
                </p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-yellow-50 rounded-2xl p-8 my-8">
                <h4 className="text-2xl font-black text-gray-900 mb-4">Abatoza ba Volleyball</h4>
                <p className="mb-4">
                  <strong className="text-yellow-600">Coach Marie Claire</strong> ni umutoza mukuru w'ikipe ya Volleyball. Afite uburambe bw'imyaka 8 mu gutoza umupira w'amaboko. Yatoje amakipe menshi kandi yaronse ibihembo byinshi mu marushanwa y'amashuri. Afite ubumenyi bukomeye mu mikino ya volleyball, imyitozo y'umubiri, n'uburyo bwo guteza imbere ubushobozi bw'abakinnyi. Yize muri Kigali Institute of Physical Education kandi afite impamyabumenyi nyinshi mu gutoza siporo.
                </p>
                <p>
                  Coach Marie Claire yigisha abanyeshuri gukina neza, gufatanya mu kipe, no kwubaha amategeko y'umukino. Afite kandi ubushobozi bwo gufasha abanyeshuri mu bibazo by'umubiri n'umutwe, no kubafasha kwiga imyifatire myiza mu mikino. Yizera ko volleyball ari umukino ukomeye wo guteza imbere ubushobozi bwo gukorana n'abandi no gufatanya mu matsinda.
                </p>
              </div>

              <h3 className="text-3xl font-black text-gray-900 mt-8 mb-4 flex items-center gap-3">
                <Trophy className="w-8 h-8 text-green-600" />
                Intsinzi n'Ibihembo
              </h3>
              <p>
                Amakipe ya siporo ya Garden TVET School yatsindiye ibihembo byinshi mu marushanwa atandukanye. Ikipe ya Football yatsindiye Igikombe cy'Amashuri (Inter-School Championship) mu 2024, kandi yahawwe igihembo cy'Ikipe Yiza Cyane (Best Team Award) mu marushanwa y'amashuri ya TVET. Ikipe ya Volleyball nayo yatsindiye amarushanwa y'akarere (Regional Champions) mu 2024, kandi yahawwe igihembo cy'Imikino Myiza (Fair Play Award) mu mikino y'amashuri ku rwego rw'igihugu.
              </p>

              <h3 className="text-3xl font-black text-gray-900 mt-8 mb-4 flex items-center gap-3">
                <Rocket className="w-8 h-8 text-yellow-600" />
                Imyitozo n'Ibikorwa
              </h3>
              <p>
                Amakipe yacu akora imyitozo buri munsi nyuma y'amasomo. Imyitozo itangira saa 11 z'umugoroba kugeza saa 1 z'ijoro. Abakinnyi bakora imyitozo y'umubiri, imyitozo y'ubushobozi, n'imyitozo y'umukino. Abatoza bacu bashyira mu gaciro imyitozo ikomeye kandi ifite intego yo guteza imbere ubushobozi bw'abakinnyi. Dufite kandi ibikorwa by'umukino buri cyumweru aho abakinnyi bakina imikino y'amakipe cyangwa imikino y'amarushanwa.
              </p>

              <h3 className="text-3xl font-black text-gray-900 mt-8 mb-4 flex items-center gap-3">
                <Heart className="w-8 h-8 text-green-600" />
                Ubuzima bw'Umubiri n'Imyifatire
              </h3>
              <p>
                Muri Garden TVET School, twizera ko siporo ari urufunguzo rwo guteza imbere ubuzima bw'umubiri n'umwuka bw'abanyeshuri. Siporo ifasha abanyeshuri kugira ubuzima bw'umubiri bwiza, kwiga gufatanya n'abandi, no kwiga imyifatire myiza nko kwihangana, guhangana n'ibibazo, no kwubaha abandi. Dufite kandi gahunda zo gufasha abanyeshuri kwiga indyo nziza, kuruhuka neza, no kwita ku buzima bwabo bw'umubiri.
              </p>

              <h3 className="text-3xl font-black text-gray-900 mt-8 mb-4 flex items-center gap-3">
                <Calendar className="w-8 h-8 text-yellow-600" />
                Amarushanwa n'Ibikorwa
              </h3>
              <p>
                Buri mwaka, amakipe yacu yitabira amarushanwa menshi. Dufite amarushanwa y'amashuri (Inter-School Tournaments), amarushanwa y'akarere (Regional Championships), n'amarushanwa ku rwego rw'igihugu (National School Games). Amarushanwa aya afasha abanyeshuri kwiga guhangana n'abandi, kwiga gufatanya mu matsinda, no kwiga imyifatire myiza mu mikino. Dufite kandi ibikorwa by'umukino buri cyumweru aho abakinnyi bakina imikino y'amakipe cyangwa imikino y'amarushanwa.
              </p>

              <h3 className="text-3xl font-black text-gray-900 mt-8 mb-4 flex items-center gap-3">
                <MapPin className="w-8 h-8 text-green-600" />
                Ibikoresho n'Aho Tukina
              </h3>
              <p>
                Garden TVET School ifite ibikoresho byiza byo gukina siporo. Dufite terrain nziza ya football ifite ubuso bwiza kandi ifite ibikoresho byose bikenewe. Dufite kandi terrain ya volleyball ifite ubuso bwiza kandi ifite ibikoresho byose bikenewe. Ibikoresho byacu birimo: imipira, imyenda y'imikino, inkweto z'imikino, n'ibindi bikoresho byose bikenewe mu mikino. Dufite kandi ahantu ho kuruhukira abakinnyi, ahantu ho guhindura imyenda, n'ahantu ho kwoga.
              </p>

              <h3 className="text-3xl font-black text-gray-900 mt-8 mb-4 flex items-center gap-3">
                <Star className="w-8 h-8 text-yellow-600" />
                Kwinjira mu Makipe
              </h3>
              <p>
                Abanyeshuri bose ba Garden TVET School bashobora kwinjira mu makipe ya siporo. Dufite ibikorwa byo guhitamo abakinnyi (trials) buri mwaka aho abanyeshuri bashobora kwerekana ubushobozi bwabo. Abatoza bacu bahitamo abakinnyi bashingiye ku bushobozi bwabo, imyifatire yabo, n'ubwitange bwabo. Abakinnyi bahitawe bagomba kwitabira imyitozo buri munsi no kwubaha amategeko y'ikipe. Dufite kandi gahunda zo gufasha abakinnyi bashya kwiga no guteza imbere ubushobozi bwabo.
              </p>

              <h3 className="text-3xl font-black text-gray-900 mt-8 mb-4 flex items-center gap-3">
                <Award className="w-8 h-8 text-green-600" />
                Inkunga n'Ubufasha
              </h3>
              <p>
                Amakipe ya siporo ya Garden TVET School ahawe inkunga n'ubufasha n'ishuri, ababyeyi, n'abafasha ba siporo. Ishuri ritanga amafaranga yo kugura ibikoresho, kwishyura abatoza, no kwishyura amarushanwa. Ababyeyi batanga inkunga mu mafaranga no mu bindi bikorwa. Abafasha ba siporo batanga inkunga mu mafaranga, ibikoresho, n'ubundi bufasha. Dushimira cyane inkunga n'ubufasha byose tuhabwa kandi turabikoresha neza mu guteza imbere amakipe yacu.
              </p>

              <h3 className="text-3xl font-black text-gray-900 mt-8 mb-4 flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-yellow-600" />
                Ejo Hazaza h'Amakipe
              </h3>
              <p>
                Ejo hazaza h'amakipe ya siporo ya Garden TVET School ni heza. Dufite intego zo gukomeza guteza imbere ubushobozi bw'abakinnyi, gutsinda amarushanwa menshi, no gufasha abanyeshuri kugera ku ntego zabo mu mikino. Dufite kandi intego zo kongeramo amakipe mashya y'imikino itandukanye nko basketball, handball, na tennis. Dushaka kandi gufasha abakinnyi bacu kugera ku rwego rwo hejuru rw'imikino no kubafasha kubona amahirwe yo gukina mu makipe akomeye.
              </p>

              <div className="bg-gradient-to-r from-yellow-400 to-green-400 rounded-2xl p-8 my-8 text-white">
                <h4 className="text-3xl font-black mb-4">Ubutumwa bw'Umuyobozi w'Ishuri</h4>
                <p className="text-lg leading-relaxed">
                  "Siporo ni igice cy'ingenzi cy'uburezi bwuzuye bw'abanyeshuri. Muri Garden TVET School, twizera ko siporo ifasha abanyeshuri guteza imbere ubuzima bw'umubiri n'umwuka, kwiga gufatanya n'abandi, no kwiga imyifatire myiza. Dushimira cyane abatoza bacu, abakinnyi bacu, n'abafasha ba siporo ku bufasha bwabo mu guteza imbere amakipe yacu. Turabashimira kandi turabashyigikira mu bikorwa byabo byose."
                </p>
                <p className="text-right mt-4 font-black">- Umuyobozi Mukuru, Garden TVET School</p>
              </div>
            </div>
          </motion.div>
        </div>

            {/* Team Cards - Right Side */}
            <div className="lg:w-1/3">
              <div className="sticky top-24 space-y-6">
                <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} className="text-center mb-6">
                  <h3 className="text-3xl font-black text-gray-900 mb-2 bg-gradient-to-r from-yellow-600 to-green-600 bg-clip-text text-transparent">
                    Amakipe Yacu
                  </h3>
                  <p className="text-sm text-gray-600 font-bold">Kanda urebe byose</p>
                </motion.div>

                {teams.map((team, index) => {
                  const gradient = team.sport_type === 'football' ? 'from-yellow-400 via-green-400 to-yellow-500' : 'from-green-400 via-yellow-400 to-green-500';

                  return (
                    <motion.div
                      key={team.id}
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.2 }}
                      whileHover={{ scale: 1.05, x: -5 }}
                      onHoverStart={() => setHoveredTeam(team.id)}
                      onHoverEnd={() => setHoveredTeam(null)}
                      onClick={() => onNavigate(`sport-team/${team.id}`)}
                      className="group relative cursor-pointer"
                    >
                      <motion.div
                        animate={{ opacity: hoveredTeam === team.id ? 0.6 : 0 }}
                        className={`absolute inset-0 bg-gradient-to-r ${gradient} rounded-2xl blur-xl`}
                      />

                      <div className={`relative bg-gradient-to-br ${gradient} p-1.5 rounded-2xl shadow-lg hover:shadow-2xl transition-all`}>
                        <div className="bg-white rounded-xl overflow-hidden">
                          <div className="relative h-32 bg-gradient-to-br from-yellow-100 to-green-100 flex items-center justify-center">
                            <motion.div
                              animate={{ scale: hoveredTeam === team.id ? 1.2 : 1, rotate: hoveredTeam === team.id ? 10 : 0 }}
                              className="text-6xl"
                            >
                              {team.icon}
                            </motion.div>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                              className="absolute top-2 right-2 bg-white/90 rounded-full p-2 shadow-lg"
                            >
                              <Sparkles className="w-4 h-4 text-yellow-500" />
                            </motion.div>
                          </div>

                          <div className="p-4">
                            <h4 className="text-xl font-black text-gray-900 mb-1">{team.name}</h4>
                            <p className="text-xs text-gray-600 font-bold mb-3">{team.name_en}</p>

                            <div className="grid grid-cols-3 gap-2 mb-3">
                              {[
                                { icon: Users, value: team.total_players, label: 'Players' },
                                { icon: Trophy, value: team.total_achievements, label: 'Awards' },
                                { icon: Star, value: team.total_wins, label: 'Wins' }
                              ].map((stat, i) => (
                                <div key={i} className="text-center p-2 bg-gradient-to-br from-yellow-50 to-green-50 rounded-lg">
                                  <stat.icon className="w-4 h-4 mx-auto mb-1 text-green-600" />
                                  <p className="text-lg font-black text-gray-900">{stat.value}</p>
                                  <p className="text-xs text-gray-600 font-bold">{stat.label}</p>
                                </div>
                              ))}
                            </div>

                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className={`w-full bg-gradient-to-r ${gradient} text-white py-2 rounded-lg font-bold text-sm shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2`}
                            >
                              <Trophy className="w-4 h-4" />
                              Reba Byose
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default EnhancedSportsPage;
