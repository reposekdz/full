import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Code, Hammer, Car, Users, BookOpen, Award, ArrowRight, Sparkles, TrendingUp, Target } from 'lucide-react';
import { useLanguage } from '@/app/contexts/LanguageContext';

interface ModernTradesPageProps {
  onNavigate: (page: string) => void;
}

const ModernTradesPage: React.FC<ModernTradesPageProps> = ({ onNavigate }) => {
  const { language } = useLanguage();
  const [trades, setTrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredTrade, setHoveredTrade] = useState<number | null>(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/trades/all')
      .then(res => res.json())
      .then(data => {
        if (data.success) setTrades(data.trades);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getIcon = (code: string) => {
    switch (code) {
      case 'SOD': return Code;
      case 'BDC': return Hammer;
      case 'AUT': return Car;
      default: return BookOpen;
    }
  };

  const getGradient = (index: number) => {
    const gradients = [
      'from-yellow-400 via-green-400 to-yellow-500',
      'from-green-400 via-yellow-400 to-green-500',
      'from-yellow-500 via-green-500 to-yellow-400'
    ];
    return gradients[index % gradients.length];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-green-50">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity }}>
          <BookOpen className="w-20 h-20 text-green-600" />
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
              transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 2 }}
            >
              {i % 3 === 0 ? '💻' : i % 3 === 1 ? '🏗️' : '🚗'}
            </motion.div>
          ))}
        </div>

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }} className="inline-flex items-center gap-6 mb-8">
              <div className="bg-white p-8 rounded-3xl shadow-2xl">
                <BookOpen className="w-20 h-20 text-green-600" />
              </div>
              <h1 className="text-8xl font-black text-white drop-shadow-2xl">
                {language === 'rw' ? 'IMYUGA' : 'TRADES'}
              </h1>
              <div className="bg-white p-8 rounded-3xl shadow-2xl">
                <Award className="w-20 h-20 text-yellow-600" />
              </div>
            </motion.div>

            <p className="text-3xl text-white font-black mb-8 drop-shadow-lg">
              {language === 'rw' ? 'Hitamo Umwuga Ukunda Wige' : 'Choose Your Trade & Learn'}
            </p>

            <div className="flex flex-wrap justify-center gap-6">
              {[
                { icon: Users, label: language === 'rw' ? `${trades.reduce((sum, t) => sum + t.total_students, 0)} Abanyeshuri` : `${trades.reduce((sum, t) => sum + t.total_students, 0)} Students`, color: 'yellow' },
                { icon: BookOpen, label: `${trades.length} ${language === 'rw' ? 'Imyuga' : 'Trades'}`, color: 'green' },
                { icon: Target, label: language === 'rw' ? 'Impamyabumenyi' : 'Certification', color: 'yellow' }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.1, y: -5 }}
                  className="bg-white/20 backdrop-blur-md px-8 py-4 rounded-2xl border-2 border-white/50 shadow-xl"
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-7 h-7 text-white" />
                    <span className="font-black text-white text-lg">{item.label}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Article Content - Left Side (2/3 width) */}
            <div className="lg:w-2/3">
              <div className="bg-white rounded-3xl shadow-2xl p-12">
              <div className="flex items-center gap-4 mb-8">
                <div className="bg-gradient-to-r from-yellow-400 to-green-400 p-4 rounded-2xl">
                  <BookOpen className="w-12 h-12 text-white" />
                </div>
                <div>
                  <h2 className="text-4xl font-black text-gray-900">Imyuga muri Garden TVET School</h2>
                  <p className="text-gray-600 font-bold">Amakuru Yuzuye ku Myuga Yose n'Inzego Zayo</p>
                </div>
              </div>

              <div className="prose prose-lg max-w-none space-y-6 text-gray-700 leading-relaxed">
                <p className="text-xl font-bold text-gray-900 mb-6">
                  Garden TVET School ni ishuri ry'ubumenyi bw'ikoranabuhanga (Technical and Vocational Education and Training) riherereye mu Kigali, u Rwanda. Ishuri ryacu rifite imyuga itatu ikomeye: Software Development (SOD), Building and Construction (BDC), n'Automotive Technology (AUT). Buri mwuga ufite inzego enye z'amashuri: Level 4, Level 5, Level 6, na Level 7. Abanyeshuri biga imyaka itatu kugeza ine bitewe n'inzego.
                </p>

                {/* SOFTWARE DEVELOPMENT */}
                <div className="bg-gradient-to-br from-yellow-50 to-green-50 rounded-2xl p-8 my-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="bg-gradient-to-r from-yellow-400 to-green-400 p-4 rounded-2xl">
                      <Code className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-4xl font-black text-gray-900">Software Development (SOD)</h3>
                  </div>
                  
                  <p className="text-lg font-bold mb-6">
                    Umwuga wa Software Development ni umwuga ukomeye wo gutunganya porogaramu z'ikoranabuhanga. Abanyeshuri biga gukora website, application za mobile, software z'ibiro, na sisitemu zitandukanye. Umwuga urangwa n'ubushobozi bwo gukoresha ururimi rw'ikoranabuhanga nko JavaScript, Python, Java, C++, n'izindi. Abanyeshuri bagira ubushobozi bwo gukora imishinga ikomeye y'ikoranabuhanga.
                  </p>

                  <h4 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-2">
                    <Target className="w-6 h-6 text-green-600" />
                    Level 4 - Urwego rwa Kane (Intangiriro)
                  </h4>
                  <p className="mb-4">
                    Ku rwego rwa kane, abanyeshuri batangira kwiga ibanze by'ikoranabuhanga. Biga HTML, CSS, JavaScript y'ibanze, no gukora website zoroshye. Biga kandi ibanze bya programming nko variables, loops, functions, na data types. Abanyeshuri biga gukoresha tools nka Visual Studio Code, Git, na GitHub. Igihe cy'amashuri ni ukwezi 6 kugeza 12. Nyuma y'urwego rwa kane, abanyeshuri bahabwa impamyabumenyi ya Certificate mu Software Development.
                  </p>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-white rounded-xl p-4">
                      <h5 className="font-black text-gray-900 mb-2">Amasomo Akomeye:</h5>
                      <ul className="space-y-1 text-sm">
                        <li>• Introduction to Programming</li>
                        <li>• HTML & CSS Fundamentals</li>
                        <li>• JavaScript Basics</li>
                        <li>• Database Fundamentals</li>
                        <li>• Web Design Principles</li>
                      </ul>
                    </div>
                    <div className="bg-white rounded-xl p-4">
                      <h5 className="font-black text-gray-900 mb-2">Ubushobozi Bwinjizwa:</h5>
                      <ul className="space-y-1 text-sm">
                        <li>• Gukora website zoroshye</li>
                        <li>• Gukoresha Git na GitHub</li>
                        <li>• Kwandika code nziza</li>
                        <li>• Gukemura ibibazo by'ibanze</li>
                        <li>• Gukorana mu matsinda</li>
                      </ul>
                    </div>
                  </div>

                  <h4 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-6 h-6 text-yellow-600" />
                    Level 5 - Urwego rwa Gatanu (Hagati)
                  </h4>
                  <p className="mb-4">
                    Ku rwego rwa gatanu, abanyeshuri bakomeza kwiga ibintu bigoye. Biga React, Node.js, Express, na MongoDB. Biga gukora full-stack applications zihuza frontend na backend. Abanyeshuri biga kandi API development, authentication, na security. Biga gukoresha frameworks nka React, Angular, cyangwa Vue.js. Igihe cy'amashuri ni umwaka 1. Nyuma y'urwego rwa gatanu, abanyeshuri bahabwa impamyabumenyi ya Diploma mu Software Development.
                  </p>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-white rounded-xl p-4">
                      <h5 className="font-black text-gray-900 mb-2">Amasomo Akomeye:</h5>
                      <ul className="space-y-1 text-sm">
                        <li>• React & Modern JavaScript</li>
                        <li>• Node.js & Express</li>
                        <li>• Database Design (SQL & NoSQL)</li>
                        <li>• RESTful API Development</li>
                        <li>• Mobile App Development</li>
                      </ul>
                    </div>
                    <div className="bg-white rounded-xl p-4">
                      <h5 className="font-black text-gray-900 mb-2">Ubushobozi Bwinjizwa:</h5>
                      <ul className="space-y-1 text-sm">
                        <li>• Gukora full-stack applications</li>
                        <li>• API development na integration</li>
                        <li>• Database design na management</li>
                        <li>• Mobile app development</li>
                        <li>• Security best practices</li>
                      </ul>
                    </div>
                  </div>

                  <h4 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-2">
                    <Award className="w-6 h-6 text-green-600" />
                    Level 6 - Urwego rwa Gatandatu (Kigezweho)
                  </h4>
                  <p className="mb-4">
                    Ku rwego rwa gatandatu, abanyeshuri biga ibintu bigoye cyane. Biga cloud computing (AWS, Azure), DevOps, CI/CD, Docker, Kubernetes, na microservices architecture. Biga kandi machine learning basics, AI integration, na advanced security. Abanyeshuri bakora imishinga ikomeye y'ikoranabuhanga. Igihe cy'amashuri ni umwaka 1 kugeza 1.5. Nyuma y'urwego rwa gatandatu, abanyeshuri bahabwa impamyabumenyi ya Advanced Diploma mu Software Development.
                  </p>

                  <h4 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-yellow-600" />
                    Level 7 - Urwego rwa Karindwi (Impamyabumenyi)
                  </h4>
                  <p className="mb-4">
                    Urwego rwa karindwi ni urwego rwo hejuru cyane. Abanyeshuri bakora umushinga mukuru (graduation project) wo gutunganya sisitemu ikomeye. Biga advanced topics nko system architecture, scalability, performance optimization, na enterprise software development. Abanyeshuri bakora imishinga nka school management systems, hospital management systems, e-commerce platforms, n'izindi. Igihe cy'amashuri ni ukwezi 6 kugeza 12. Nyuma y'urwego rwa karindwi, abanyeshuri bahabwa impamyabumenyi ya Bachelor's Degree mu Software Development.
                  </p>
                </div>

                {/* BUILDING AND CONSTRUCTION */}
                <div className="bg-gradient-to-br from-green-50 to-yellow-50 rounded-2xl p-8 my-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="bg-gradient-to-r from-green-400 to-yellow-400 p-4 rounded-2xl">
                      <Hammer className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-4xl font-black text-gray-900">Building and Construction (BDC)</h3>
                  </div>
                  
                  <p className="text-lg font-bold mb-6">
                    Umwuga wa Building and Construction ni umwuga ukomeye wo kubaka amazu, inzugi, imihanda, n'ibindi bintu by'ikoranabuhanga. Abanyeshuri biga gushushanya amazu, kubara ibiciro, gukoresha ibikoresho by'ubwubatsi, no gucunga imishinga y'ubwubatsi. Umwuga urangwa n'ubushobozi bwo gukora ibishushanyo mbonera (architectural drawings), gukoresha AutoCAD, Revit, na software z'ubwubatsi. Abanyeshuri bagira ubushobozi bwo gucunga imishinga ikomeye y'ubwubatsi.
                  </p>

                  <h4 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-2">
                    <Target className="w-6 h-6 text-green-600" />
                    Level 4 - Urwego rwa Kane (Intangiriro)
                  </h4>
                  <p className="mb-4">
                    Ku rwego rwa kane, abanyeshuri batangira kwiga ibanze by'ubwubatsi. Biga gushushanya amazu yoroshye, gukoresha ibikoresho by'ubwubatsi, no kubara ibiciro by'ibanze. Biga kandi ibanze bya construction materials, building codes, na safety regulations. Abanyeshuri biga gukoresha tools nka AutoCAD, measuring tools, na construction equipment. Igihe cy'amashuri ni ukwezi 6 kugeza 12. Nyuma y'urwego rwa kane, abanyeshuri bahabwa impamyabumenyi ya Certificate mu Building and Construction.
                  </p>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-white rounded-xl p-4">
                      <h5 className="font-black text-gray-900 mb-2">Amasomo Akomeye:</h5>
                      <ul className="space-y-1 text-sm">
                        <li>• Introduction to Construction</li>
                        <li>• Building Materials</li>
                        <li>• Basic Drafting & Drawing</li>
                        <li>• Construction Safety</li>
                        <li>• Measurement & Estimation</li>
                      </ul>
                    </div>
                    <div className="bg-white rounded-xl p-4">
                      <h5 className="font-black text-gray-900 mb-2">Ubushobozi Bwinjizwa:</h5>
                      <ul className="space-y-1 text-sm">
                        <li>• Gushushanya amazu yoroshye</li>
                        <li>• Gukoresha ibikoresho by'ubwubatsi</li>
                        <li>• Kubara ibiciro by'ibanze</li>
                        <li>• Kumva building codes</li>
                        <li>• Safety practices</li>
                      </ul>
                    </div>
                  </div>

                  <h4 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-6 h-6 text-yellow-600" />
                    Level 5 - Urwego rwa Gatanu (Hagati)
                  </h4>
                  <p className="mb-4">
                    Ku rwego rwa gatanu, abanyeshuri bakomeza kwiga ibintu bigoye. Biga advanced AutoCAD, Revit, structural design, na project management. Biga gukora ibishushanyo mbonera by'amazu akomeye, gucunga imishinga y'ubwubatsi, no gukora cost estimation ikomeye. Abanyeshuri biga kandi surveying, site management, na quality control. Igihe cy'amashuri ni umwaka 1. Nyuma y'urwego rwa gatanu, abanyeshuri bahabwa impamyabumenyi ya Diploma mu Building and Construction.
                  </p>

                  <h4 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-2">
                    <Award className="w-6 h-6 text-green-600" />
                    Level 6 - Urwego rwa Gatandatu (Kigezweho)
                  </h4>
                  <p className="mb-4">
                    Ku rwego rwa gatandatu, abanyeshuri biga ibintu bigoye cyane. Biga advanced structural engineering, construction management, contract administration, na building information modeling (BIM). Biga kandi sustainable construction, green building, na advanced project management. Abanyeshuri bakora imishinga ikomeye y'ubwubatsi. Igihe cy'amashuri ni umwaka 1 kugeza 1.5. Nyuma y'urwego rwa gatandatu, abanyeshuri bahabwa impamyabumenyi ya Advanced Diploma mu Building and Construction.
                  </p>

                  <h4 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-yellow-600" />
                    Level 7 - Urwego rwa Karindwi (Impamyabumenyi)
                  </h4>
                  <p className="mb-4">
                    Urwego rwa karindwi ni urwego rwo hejuru cyane. Abanyeshuri bakora umushinga mukuru wo gushushanya no kubaka inzu cyangwa ikigo gikomeye. Biga advanced topics nko mega project management, infrastructure development, na construction technology innovation. Abanyeshuri bakora imishinga nka residential complexes, commercial buildings, bridges, n'izindi. Igihe cy'amashuri ni ukwezi 6 kugeza 12. Nyuma y'urwego rwa karindwi, abanyeshuri bahabwa impamyabumenyi ya Bachelor's Degree mu Building and Construction.
                  </p>
                </div>

                {/* AUTOMOTIVE TECHNOLOGY */}
                <div className="bg-gradient-to-br from-yellow-50 to-green-50 rounded-2xl p-8 my-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="bg-gradient-to-r from-yellow-400 to-green-400 p-4 rounded-2xl">
                      <Car className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-4xl font-black text-gray-900">Automotive Technology (AUT)</h3>
                  </div>
                  
                  <p className="text-lg font-bold mb-6">
                    Umwuga wa Automotive Technology ni umwuga ukomeye wo gusana no gucunga ibinyabiziga. Abanyeshuri biga gusana moteri, transmission, brakes, electrical systems, n'ibindi bice by'imodoka. Umwuga urangwa n'ubushobozi bwo gukoresha ibikoresho by'ikoranabuhanga nka diagnostic tools, computer systems, na modern equipment. Abanyeshuri bagira ubushobozi bwo gusana ibinyabiziga byose: imodoka, amapikipiki, amakami, n'ibindi.
                  </p>

                  <h4 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-2">
                    <Target className="w-6 h-6 text-green-600" />
                    Level 4 - Urwego rwa Kane (Intangiriro)
                  </h4>
                  <p className="mb-4">
                    Ku rwego rwa kane, abanyeshuri batangira kwiga ibanze by'imodoka. Biga engine basics, transmission basics, brake systems, na electrical systems basics. Biga kandi gukoresha ibikoresho by'ibanze by'ikoranabuhanga, safety procedures, na vehicle maintenance. Abanyeshuri biga gusana ibinyabiziga byoroshye no gukemura ibibazo by'ibanze. Igihe cy'amashuri ni ukwezi 6 kugeza 12. Nyuma y'urwego rwa kane, abanyeshuri bahabwa impamyabumenyi ya Certificate mu Automotive Technology.
                  </p>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-white rounded-xl p-4">
                      <h5 className="font-black text-gray-900 mb-2">Amasomo Akomeye:</h5>
                      <ul className="space-y-1 text-sm">
                        <li>• Engine Fundamentals</li>
                        <li>• Transmission Systems</li>
                        <li>• Brake Systems</li>
                        <li>• Electrical Systems Basics</li>
                        <li>• Vehicle Maintenance</li>
                      </ul>
                    </div>
                    <div className="bg-white rounded-xl p-4">
                      <h5 className="font-black text-gray-900 mb-2">Ubushobozi Bwinjizwa:</h5>
                      <ul className="space-y-1 text-sm">
                        <li>• Gusana moteri zoroshye</li>
                        <li>• Gukoresha ibikoresho by'ibanze</li>
                        <li>• Vehicle inspection</li>
                        <li>• Basic troubleshooting</li>
                        <li>• Safety procedures</li>
                      </ul>
                    </div>
                  </div>

                  <h4 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-6 h-6 text-yellow-600" />
                    Level 5 - Urwego rwa Gatanu (Hagati)
                  </h4>
                  <p className="mb-4">
                    Ku rwego rwa gatanu, abanyeshuri bakomeza kwiga ibintu bigoye. Biga advanced engine repair, transmission repair, advanced electrical systems, fuel injection systems, na computer diagnostics. Biga kandi air conditioning systems, suspension systems, na steering systems. Abanyeshuri biga gukoresha diagnostic tools zigoye no gusana ibinyabiziga bigezweho. Igihe cy'amashuri ni umwaka 1. Nyuma y'urwego rwa gatanu, abanyeshuri bahabwa impamyabumenyi ya Diploma mu Automotive Technology.
                  </p>

                  <h4 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-2">
                    <Award className="w-6 h-6 text-green-600" />
                    Level 6 - Urwego rwa Gatandatu (Kigezweho)
                  </h4>
                  <p className="mb-4">
                    Ku rwego rwa gatandatu, abanyeshuri biga ibintu bigoye cyane. Biga hybrid and electric vehicle technology, advanced diagnostics, automotive electronics, na vehicle performance tuning. Biga kandi automotive business management, customer service, na workshop management. Abanyeshuri bakora imishinga ikomeye yo gusana ibinyabiziga bigoye. Igihe cy'amashuri ni umwaka 1 kugeza 1.5. Nyuma y'urwego rwa gatandatu, abanyeshuri bahabwa impamyabumenyi ya Advanced Diploma mu Automotive Technology.
                  </p>

                  <h4 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-yellow-600" />
                    Level 7 - Urwego rwa Karindwi (Impamyabumenyi)
                  </h4>
                  <p className="mb-4">
                    Urwego rwa karindwi ni urwego rwo hejuru cyane. Abanyeshuri bakora umushinga mukuru wo gusana cyangwa gukora ibinyabiziga bigoye. Biga advanced topics nko automotive engineering, vehicle design, autonomous vehicles, na future automotive technology. Abanyeshuri bakora imishinga nka custom vehicle builds, performance modifications, diagnostic system development, n'izindi. Igihe cy'amashuri ni ukwezi 6 kugeza 12. Nyuma y'urwego rwa karindwi, abanyeshuri bahabwa impamyabumenyi ya Bachelor's Degree mu Automotive Technology.
                  </p>
                </div>

                {/* General Information */}
                <div className="bg-gradient-to-r from-yellow-400 to-green-400 rounded-2xl p-8 my-8 text-white">
                  <h4 className="text-3xl font-black mb-4">Amakuru Rusange ku Myuga</h4>
                  <div className="space-y-4 text-lg leading-relaxed">
                    <p>
                      <strong>Ibisabwa kugira ngo winjire:</strong> Abanyeshuri bagomba kuba bafite impamyabumenyi ya O-Level (S3) cyangwa A-Level (S6) bitewe n'urwego bashaka kwinjiramo. Bagomba kandi gutsinda ikizamini cy'kwinjira cyangwa kugira amanota ahagije.
                    </p>
                    <p>
                      <strong>Amafaranga y'ishuri:</strong> Amafaranga y'ishuri aratandukanye bitewe n'umwuga n'urwego. Dufite kandi gahunda zo gufasha abanyeshuri bakeneye ubufasha mu mafaranga. Ushobora kubona amakuru arambuye ku mafaranga uhamagaye ishuri cyangwa usure urubuga rwacu.
                    </p>
                    <p>
                      <strong>Amahirwe y'akazi:</strong> Nyuma yo kurangiza amashuri, abanyeshuri bagira amahirwe menshi y'akazi. Bashobora gukora mu makampani akomeye, gufungura ibigo byabo, cyangwa gukomeza kwiga ku rwego rwo hejuru. Dufite kandi gahunda zo gufasha abanyeshuri kubona akazi.
                    </p>
                    <p>
                      <strong>Ibikoresho n'Ibigo:</strong> Garden TVET School ifite ibikoresho byiza by'ikoranabuhanga. Dufite laboratoire nziza, workshops, computer labs, na library nziza. Abanyeshuri bagira amahirwe yo gukoresha ibikoresho bigezweho mu kwiga kwabo.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Trade Cards - Right Side (1/3 width) */}
          <div className="lg:w-1/3">
            <div className="sticky top-24 space-y-6">
              <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} className="text-center mb-6">
                <h3 className="text-3xl font-black text-gray-900 mb-2 bg-gradient-to-r from-yellow-600 to-green-600 bg-clip-text text-transparent">
                  {language === 'rw' ? 'Imyuga Yacu' : 'Our Trades'}
                </h3>
                <p className="text-sm text-gray-600 font-bold">{language === 'rw' ? 'Kanda urebe byose' : 'Click to view details'}</p>
              </motion.div>

              {trades.map((trade, index) => {
                const Icon = getIcon(trade.code);
                const gradient = getGradient(index);

                return (
                  <motion.div
                    key={trade.id}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.2 }}
                    whileHover={{ scale: 1.05, x: -5 }}
                    onHoverStart={() => setHoveredTrade(trade.id)}
                    onHoverEnd={() => setHoveredTrade(null)}
                    onClick={() => onNavigate(`trade/${trade.id}`)}
                    className="group relative cursor-pointer"
                  >
                    <motion.div
                      animate={{ opacity: hoveredTrade === trade.id ? 0.6 : 0 }}
                      className={`absolute inset-0 bg-gradient-to-r ${gradient} rounded-2xl blur-xl`}
                    />

                    <div className={`relative bg-gradient-to-br ${gradient} p-1.5 rounded-2xl shadow-lg hover:shadow-2xl transition-all`}>
                      <div className="bg-white rounded-xl overflow-hidden">
                        <div className="relative h-32 bg-gradient-to-br from-yellow-100 to-green-100 flex items-center justify-center">
                          <motion.div
                            animate={{ scale: hoveredTrade === trade.id ? 1.2 : 1, rotate: hoveredTrade === trade.id ? 10 : 0 }}
                            className="text-6xl"
                          >
                            {trade.icon}
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
                          <div className="flex items-center gap-2 mb-2">
                            <div className={`bg-gradient-to-r ${gradient} p-2 rounded-lg`}>
                              <Icon className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <h4 className="text-lg font-black text-gray-900">{language === 'rw' ? trade.name_rw : trade.name}</h4>
                              <p className="text-xs text-gray-500 font-bold">{trade.code}</p>
                            </div>
                          </div>

                          <p className="text-gray-700 text-xs mb-3 line-clamp-2">
                            {language === 'rw' ? trade.description_rw : trade.description}
                          </p>

                          <div className="grid grid-cols-3 gap-2 mb-3">
                            {[
                              { icon: Users, value: trade.total_students, label: language === 'rw' ? 'Abanyeshuri' : 'Students' },
                              { icon: BookOpen, value: trade.course_count, label: language === 'rw' ? 'Amasomo' : 'Courses' },
                              { icon: TrendingUp, value: `${trade.duration_years}Y`, label: language === 'rw' ? 'Imyaka' : 'Years' }
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
                            <BookOpen className="w-4 h-4" />
                            {language === 'rw' ? 'Reba Byose' : 'View Details'}
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

export default ModernTradesPage;
