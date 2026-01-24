import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, BookOpen, DollarSign, User, MessageCircle, HelpCircle, Send, Search, ThumbsUp, Download, FileText, Video, Link as LinkIcon, CheckCircle, Clock, AlertCircle, Sparkles, Filter, TrendingUp, Zap, Phone, Mail, MessageSquare, Shield, Award, Target, Rocket, Heart, Star, Users, Trophy } from 'lucide-react';
import { useLanguage } from '@/app/contexts/LanguageContext';

const AdvancedSupportPage: React.FC = () => {
  const { language } = useLanguage();
  const [categories, setCategories] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('faqs');
  const [ticketData, setTicketData] = useState({ name: '', email: '', phone: '', subject: '', message: '', priority: 'medium' });
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState('popular');

  useEffect(() => {
    fetch('http://localhost:5000/api/support/categories')
      .then(res => res.json())
      .then(data => { if (data.success) setCategories(data.categories); });

    fetch('http://localhost:5000/api/support/faqs')
      .then(res => res.json())
      .then(data => { if (data.success) setFaqs(data.faqs); });

    fetch('http://localhost:5000/api/support/resources')
      .then(res => res.json())
      .then(data => { if (data.success) setResources(data.resources); });
  }, []);

  const getIcon = (iconName: string) => {
    const icons: any = { Settings, BookOpen, DollarSign, User, MessageCircle };
    return icons[iconName] || HelpCircle;
  };

  const handleTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await fetch('http://localhost:5000/api/support/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...ticketData, category_id: selectedCategory })
    });
    const data = await response.json();
    if (data.success) {
      alert(`Ticket created: ${data.ticket_number}`);
      setTicketData({ name: '', email: '', phone: '', subject: '', message: '', priority: 'medium' });
    }
  };

  const markHelpful = async (faqId: number) => {
    await fetch(`http://localhost:5000/api/support/faqs/${faqId}/helpful`, { method: 'PUT' });
    setFaqs(faqs.map(f => f.id === faqId ? { ...f, helpful_count: f.helpful_count + 1 } : f));
  };

  const filteredFaqs = faqs
    .filter(f => (!selectedCategory || f.category_id === selectedCategory) &&
      (!searchTerm || f.question.toLowerCase().includes(searchTerm.toLowerCase()) || f.question_rw?.toLowerCase().includes(searchTerm.toLowerCase())))
    .sort((a, b) => sortBy === 'popular' ? b.views - a.views : b.helpful_count - a.helpful_count);

  const filteredResources = resources.filter(r => !selectedCategory || r.category_id === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-green-50">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden bg-gradient-to-r from-yellow-400 via-green-400 to-yellow-500 mb-12">
        <div className="absolute inset-0 opacity-20">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-4xl"
              style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
              animate={{ y: [0, -30, 0], opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 3 + Math.random() * 2, repeat: Infinity }}
            >
              {i % 3 === 0 ? '💡' : i % 3 === 1 ? '📚' : '🎯'}
            </motion.div>
          ))}
        </div>
        <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-4 mb-6">
              <div className="bg-white p-6 rounded-3xl shadow-2xl">
                <HelpCircle className="w-16 h-16 text-green-600" />
              </div>
              <h1 className="text-7xl font-black text-white drop-shadow-2xl">
                {language === 'rw' ? 'UBUFASHA' : 'SUPPORT'}
              </h1>
            </div>
            <p className="text-2xl text-white font-black mb-8 drop-shadow-lg">
              {language === 'rw' ? 'Ikigo Cyuzuye cy\'Ubufasha bwa Garden TVET School' : 'Garden TVET School Comprehensive Support Center'}
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4">
        {/* Article Content Section */}
        <div className="mb-12">
          <div className="bg-white rounded-3xl shadow-2xl p-12">
            <div className="flex items-center gap-4 mb-8">
              <div className="bg-gradient-to-r from-yellow-400 to-green-400 p-4 rounded-2xl">
                <Shield className="w-12 h-12 text-white" />
              </div>
              <div>
                <h2 className="text-4xl font-black text-gray-900">{language === 'rw' ? 'Ikigo cy\'Ubufasha' : 'Support Center'}</h2>
                <p className="text-gray-600 font-bold">{language === 'rw' ? 'Amakuru Yuzuye ku Bufasha' : 'Comprehensive Support Information'}</p>
              </div>
            </div>

            <div className="prose prose-lg max-w-none space-y-6 text-gray-700 leading-relaxed">
              <p className="text-xl font-bold text-gray-900 mb-6">
                {language === 'rw' 
                  ? 'Ikigo cy\'Ubufasha cya Garden TVET School cyashyizweho kugira ngo gifashe abanyeshuri, ababyeyi, abakozi, n\'abandi bantu bose bakeneye ubufasha ku bijyanye n\'ishuri. Dufite itsinda ry\'abakozi bafite ubumenyi bukomeye kandi bwiteguye kugufasha igihe cyose.'
                  : 'The Garden TVET School Support Center was established to assist students, parents, staff, and all other individuals who need help with school-related matters. We have a team of knowledgeable staff ready to help you at any time.'}
              </p>

              <h3 className="text-3xl font-black text-gray-900 mt-8 mb-4 flex items-center gap-3">
                <Target className="w-8 h-8 text-green-600" />
                {language === 'rw' ? 'Intego z\'Ikigo cy\'Ubufasha' : 'Support Center Objectives'}
              </h3>
              <p>
                {language === 'rw'
                  ? 'Ikigo cy\'ubufasha gifite intego nyinshi zikomeye. Intego yacu ya mbere ni ugufasha abanyeshuri kugera ku ntego zabo mu burezi no mu buzima. Dufite kandi intego yo gufasha ababyeyi kumva neza uko ishuri rikora no kumenya uko bashobora gufasha abana babo. Dufite kandi intego yo gufasha abakozi kugira neza akazi kabo no kugira ubuzima bwiza. Intego yacu ikomeye ni ugufasha abantu bose bakeneye ubufasha ku bijyanye n\'ishuri.'
                  : 'The support center has several important objectives. Our primary goal is to help students achieve their educational and life goals. We also aim to help parents understand how the school operates and how they can support their children. We also aim to help staff perform their work well and have a good life. Our main objective is to help everyone who needs assistance with school-related matters.'}
              </p>

              <h3 className="text-3xl font-black text-gray-900 mt-8 mb-4 flex items-center gap-3">
                <Users className="w-8 h-8 text-yellow-600" />
                {language === 'rw' ? 'Serivisi Dutanga' : 'Services We Provide'}
              </h3>
              <p>
                {language === 'rw'
                  ? 'Ikigo cy\'ubufasha gitanga serivisi nyinshi. Dufite serivisi yo gufasha abanyeshuri mu bibazo by\'amasomo, serivisi yo gufasha mu bibazo by\'amafaranga, serivisi yo gufasha mu bibazo by\'ubuzima, serivisi yo gufasha mu bibazo by\'imyitwarire, n\'izindi serivisi nyinshi. Dufite kandi serivisi yo gufasha ababyeyi kumva neza uko ishuri rikora no kumenya uko bashobora gufasha abana babo. Serivisi zacu ziraboneka igihe cyose kandi ziratangwa n\'abakozi bafite ubumenyi bukomeye.'
                  : 'The support center provides many services. We have services to help students with academic issues, financial issues, health issues, behavioral issues, and many other services. We also have services to help parents understand how the school operates and how they can support their children. Our services are available at all times and are provided by knowledgeable staff.'}
              </p>

              <div className="bg-gradient-to-br from-yellow-50 to-green-50 rounded-2xl p-8 my-8">
                <h4 className="text-2xl font-black text-gray-900 mb-4">{language === 'rw' ? 'Serivisi Zikomeye' : 'Key Services'}</h4>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                    <span className="font-bold">{language === 'rw' ? 'Ubufasha mu Masomo - Dufite abakozi bafite ubumenyi bukomeye mu masomo batanga ubufasha ku banyeshuri bakeneye' : 'Academic Support - We have knowledgeable staff who provide assistance to students in need'}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                    <span className="font-bold">{language === 'rw' ? 'Ubufasha mu Mafaranga - Dufite serivisi yo gufasha abanyeshuri bakeneye ubufasha mu mafaranga y\'ishuri' : 'Financial Support - We have services to help students who need financial assistance'}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                    <span className="font-bold">{language === 'rw' ? 'Ubufasha mu Buzima - Dufite abaganga n\'abaforomo batanga ubufasha ku buzima bw\'abanyeshuri' : 'Health Support - We have doctors and nurses who provide health assistance to students'}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                    <span className="font-bold">{language === 'rw' ? 'Ubufasha mu Myitwarire - Dufite abajyanama batanga ubufasha ku banyeshuri bafite ibibazo by\'imyitwarire' : 'Behavioral Support - We have counselors who provide assistance to students with behavioral issues'}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                    <span className="font-bold">{language === 'rw' ? 'Ubufasha Tekiniki - Dufite abatekinisiye batanga ubufasha ku bibazo bya tekinoloji' : 'Technical Support - We have technicians who provide assistance with technology issues'}</span>
                  </li>
                </ul>
              </div>

              <h3 className="text-3xl font-black text-gray-900 mt-8 mb-4 flex items-center gap-3">
                <Clock className="w-8 h-8 text-green-600" />
                {language === 'rw' ? 'Igihe Serivisi Ziraboneka' : 'Service Availability'}
              </h3>
              <p>
                {language === 'rw'
                  ? 'Ikigo cy\'ubufasha kirakora buri munsi ukurikije gahunda ikurikira: Ku cyumweru kuva saa 2 z\'igitondo kugeza saa 12 z\'ijoro. Dufite kandi serivisi z\'ubufasha bwa telefone ziraboneka igihe cyose. Ushobora kuduhamagara ku nomero +250 788 123 456 cyangwa kutwohereza email kuri support@garden-tvet.rw. Dufite kandi serivisi z\'ubufasha bwa WhatsApp ziraboneka ku nomero +250 788 123 456.'
                  : 'The support center operates daily according to the following schedule: Monday to Sunday from 8:00 AM to 6:00 PM. We also have phone support services available at all times. You can call us at +250 788 123 456 or send us an email at support@garden-tvet.rw. We also have WhatsApp support services available at +250 788 123 456.'}
              </p>

              <h3 className="text-3xl font-black text-gray-900 mt-8 mb-4 flex items-center gap-3">
                <Rocket className="w-8 h-8 text-yellow-600" />
                {language === 'rw' ? 'Uburyo bwo Kubona Ubufasha' : 'How to Access Support'}
              </h3>
              <p>
                {language === 'rw'
                  ? 'Hari uburyo butandukanye bwo kubona ubufasha. Ushobora kuja mu biro by\'ubufasha biherereye mu ishuri. Ushobora kandi kuduhamagara ku telefone cyangwa kutwohereza email. Ushobora kandi gusaba ubufasha ukoresheje sisitemu yacu ya interineti aho ushobora gusaba ticket y\'ubufasha. Dufite kandi serivisi z\'ubufasha bwa WhatsApp. Uburyo bwose bwo kubona ubufasha buraboneka kandi bworoshye.'
                  : 'There are different ways to access support. You can visit the support office located at the school. You can also call us by phone or send us an email. You can also request support using our online system where you can submit a support ticket. We also have WhatsApp support services. All methods of accessing support are available and easy.'}
              </p>

              <div className="bg-gradient-to-r from-yellow-400 to-green-400 rounded-2xl p-8 my-8 text-white">
                <h4 className="text-3xl font-black mb-4">{language === 'rw' ? 'Ubutumwa bw\'Umuyobozi w\'Ikigo cy\'Ubufasha' : 'Message from Support Center Director'}</h4>
                <p className="text-lg leading-relaxed">
                  {language === 'rw'
                    ? '"Ikigo cy\'ubufasha ni igice cy\'ingenzi cy\'ishuri. Turi hano kugufasha igihe cyose ukeneye ubufasha. Dufite itsinda ry\'abakozi bafite ubumenyi bukomeye kandi bwiteguye kugufasha. Ntutinye kuduhamagara cyangwa kuja mu biro byacu. Turi hano kugufasha kugera ku ntego zawe. Dushimira cyane ko uri muri Garden TVET School kandi turabashyigikira mu bikorwa byawe byose."'
                    : '"The support center is an essential part of the school. We are here to help you whenever you need assistance. We have a team of knowledgeable staff ready to help you. Don\'t hesitate to call us or visit our office. We are here to help you achieve your goals. We greatly appreciate that you are at Garden TVET School and we support you in all your endeavors."'}
                </p>
                <p className="text-right mt-4 font-black">- {language === 'rw' ? 'Umuyobozi w\'Ikigo cy\'Ubufasha' : 'Support Center Director'}, Garden TVET School</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className="mb-8">

          {/* Advanced Search Bar */}
          <div className="relative">
            <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
            <input
              type="text"
              placeholder={language === 'rw' ? 'Shakisha ibibazo, ibisubizo, cyangwa ibikoresho...' : 'Search questions, answers, or resources...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-16 pr-6 py-5 rounded-2xl text-lg font-bold shadow-xl focus:outline-none focus:ring-4 focus:ring-yellow-400/50 bg-white"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-6 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: MessageCircle, value: faqs.length, label: language === 'rw' ? 'FAQs' : 'FAQs', color: 'yellow' },
            { icon: FileText, value: resources.length, label: language === 'rw' ? 'Ibikoresho' : 'Resources', color: 'green' },
            { icon: CheckCircle, value: categories.length, label: language === 'rw' ? 'Ibyiciro' : 'Categories', color: 'yellow' },
            { icon: TrendingUp, value: faqs.reduce((sum, f) => sum + f.views, 0), label: language === 'rw' ? 'Abareba' : 'Views', color: 'green' }
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`bg-gradient-to-br from-${stat.color}-100 to-white rounded-xl shadow-lg p-4 text-center`}
            >
              <stat.icon className={`w-8 h-8 mx-auto mb-2 text-${stat.color}-600`} />
              <p className="text-3xl font-black text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-600 font-bold">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Categories */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-black text-gray-900">{language === 'rw' ? 'Ibyiciro' : 'Categories'}</h2>
            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory(null)}
                className="text-sm font-bold text-gray-600 hover:text-gray-900"
              >
                {language === 'rw' ? 'Siba' : 'Clear'}
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {categories.map((cat) => {
              const Icon = getIcon(cat.icon);
              const isSelected = selectedCategory === cat.id;
              const gradient = cat.color === 'yellow' ? 'from-yellow-400 to-green-400' : 'from-green-400 to-yellow-400';

              return (
                <motion.button
                  key={cat.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedCategory(isSelected ? null : cat.id)}
                  className={`p-4 rounded-xl shadow-lg transition-all ${
                    isSelected ? `bg-gradient-to-br ${gradient} text-white` : 'bg-white text-gray-700 hover:shadow-xl'
                  }`}
                >
                  <Icon className={`w-8 h-8 mx-auto mb-2 ${isSelected ? 'text-white' : 'text-green-600'}`} />
                  <p className="font-black text-xs mb-1">{language === 'rw' ? cat.name_rw : cat.name}</p>
                  <p className={`text-xs ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>{cat.faq_count} FAQs</p>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Tabs with Sort */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-3">
            {[
              { id: 'faqs', label: language === 'rw' ? 'FAQs' : 'FAQs', icon: MessageCircle },
              { id: 'resources', label: language === 'rw' ? 'Ibikoresho' : 'Resources', icon: FileText },
              { id: 'ticket', label: language === 'rw' ? 'Tanga Ikibazo' : 'Submit Ticket', icon: Send }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-yellow-400 to-green-400 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'faqs' && (
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 rounded-lg border-2 border-gray-200 font-bold text-sm focus:outline-none focus:border-green-400"
            >
              <option value="popular">{language === 'rw' ? 'Bikunze Kureba' : 'Most Viewed'}</option>
              <option value="helpful">{language === 'rw' ? 'Byafashije' : 'Most Helpful'}</option>
            </select>
          )}
        </div>

        {/* FAQs Tab */}
        {activeTab === 'faqs' && (
          <div className="space-y-3">
            {filteredFaqs.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl shadow-lg">
                <HelpCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 font-bold">{language === 'rw' ? 'Nta bisubizo byabonetse' : 'No results found'}</p>
              </div>
            ) : (
              filteredFaqs.map((faq, i) => (
                <motion.div
                  key={faq.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all"
                >
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                    className="w-full p-5 text-left flex items-center justify-between hover:bg-gray-50 transition-all"
                  >
                    <div className="flex-1">
                      <h3 className="text-lg font-black text-gray-900 mb-2">
                        {language === 'rw' ? faq.question_rw : faq.question}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="w-4 h-4" /> {faq.helpful_count}
                        </span>
                        <span>{faq.views} views</span>
                      </div>
                    </div>
                    <motion.div animate={{ rotate: expandedFaq === faq.id ? 180 : 0 }}>
                      <HelpCircle className="w-6 h-6 text-green-600" />
                    </motion.div>
                  </button>

                  <AnimatePresence>
                    {expandedFaq === faq.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-gray-200"
                      >
                        <div className="p-5 bg-gradient-to-br from-yellow-50 to-green-50">
                          <p className="text-gray-700 mb-4 leading-relaxed">{language === 'rw' ? faq.answer_rw : faq.answer}</p>
                          <button
                            onClick={() => markHelpful(faq.id)}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400 to-green-400 text-white rounded-lg font-bold hover:shadow-lg transition-all"
                          >
                            <ThumbsUp className="w-4 h-4" />
                            {language === 'rw' ? 'Byafashije' : 'Helpful'}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))
            )}
          </div>
        )}

        {/* Resources Tab */}
        {activeTab === 'resources' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filteredResources.map((resource, i) => {
              const Icon = resource.resource_type === 'video' ? Video : resource.resource_type === 'link' ? LinkIcon : FileText;
              return (
                <motion.div
                  key={resource.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-xl shadow-lg p-5 hover:shadow-xl transition-all"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="bg-gradient-to-br from-yellow-400 to-green-400 p-3 rounded-xl">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-black text-gray-900 mb-1">
                        {language === 'rw' ? resource.title_rw : resource.title}
                      </h3>
                      <p className="text-sm text-gray-600">{language === 'rw' ? resource.description_rw : resource.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <Download className="w-4 h-4" /> {resource.downloads}
                    </span>
                    <button className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-green-400 text-white rounded-lg font-bold hover:shadow-lg transition-all text-sm">
                      {language === 'rw' ? 'Fungura' : 'Open'}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Ticket Form Tab */}
        {activeTab === 'ticket' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl p-8">
              <h2 className="text-3xl font-black text-gray-900 mb-6">{language === 'rw' ? 'Tanga Ikibazo' : 'Submit a Ticket'}</h2>
              <form onSubmit={handleTicketSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder={language === 'rw' ? 'Izina' : 'Name'}
                  value={ticketData.name}
                  onChange={(e) => setTicketData({ ...ticketData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-400 focus:outline-none font-bold"
                  required
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={ticketData.email}
                  onChange={(e) => setTicketData({ ...ticketData, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-400 focus:outline-none font-bold"
                  required
                />
                <input
                  type="tel"
                  placeholder={language === 'rw' ? 'Telefone' : 'Phone'}
                  value={ticketData.phone}
                  onChange={(e) => setTicketData({ ...ticketData, phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-400 focus:outline-none font-bold"
                />
                <input
                  type="text"
                  placeholder={language === 'rw' ? 'Ingingo' : 'Subject'}
                  value={ticketData.subject}
                  onChange={(e) => setTicketData({ ...ticketData, subject: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-400 focus:outline-none font-bold"
                  required
                />
                <textarea
                  placeholder={language === 'rw' ? 'Ubutumwa' : 'Message'}
                  value={ticketData.message}
                  onChange={(e) => setTicketData({ ...ticketData, message: e.target.value })}
                  rows={5}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-400 focus:outline-none font-bold"
                  required
                />
                <select
                  value={ticketData.priority}
                  onChange={(e) => setTicketData({ ...ticketData, priority: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-400 focus:outline-none font-bold"
                >
                  <option value="low">{language === 'rw' ? 'Byihutirwa Bike' : 'Low Priority'}</option>
                  <option value="medium">{language === 'rw' ? 'Byihutirwa' : 'Medium Priority'}</option>
                  <option value="high">{language === 'rw' ? 'Byihutirwa Cyane' : 'High Priority'}</option>
                  <option value="urgent">{language === 'rw' ? 'Byihutirwa Cya Mbere' : 'Urgent'}</option>
                </select>
                <button
                  type="submit"
                  className="w-full py-4 bg-gradient-to-r from-yellow-400 via-green-400 to-yellow-500 text-white rounded-xl font-black text-lg shadow-lg hover:shadow-2xl transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-6 h-6" />
                  {language === 'rw' ? 'Ohereza' : 'Submit Ticket'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Contact Options */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { icon: Phone, title: language === 'rw' ? 'Duhamagare' : 'Call Us', value: '+250 788 123 456', color: 'yellow' },
            { icon: Mail, title: language === 'rw' ? 'Twandikire' : 'Email Us', value: 'support@garden-tvet.rw', color: 'green' },
            { icon: MessageSquare, title: language === 'rw' ? 'Aho Turi' : 'Visit Us', value: 'Kigali, Rwanda', color: 'yellow' }
          ].map((contact, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`bg-gradient-to-br from-${contact.color}-100 to-white rounded-xl shadow-lg p-6 text-center`}
            >
              <contact.icon className={`w-12 h-12 mx-auto mb-3 text-${contact.color}-600`} />
              <h3 className="text-lg font-black text-gray-900 mb-2">{contact.title}</h3>
              <p className="text-gray-700 font-bold">{contact.value}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdvancedSupportPage;
