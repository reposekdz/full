import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, BookOpen, DollarSign, User, MessageCircle, HelpCircle, Send, Search, ThumbsUp, Download, FileText, Video, Link as LinkIcon, CheckCircle, Clock, AlertCircle, Sparkles } from 'lucide-react';
import { useLanguage } from '@/app/contexts/LanguageContext';

const ModernSupportPage: React.FC = () => {
  const { language } = useLanguage();
  const [categories, setCategories] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('faqs');
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [ticketData, setTicketData] = useState({ name: '', email: '', phone: '', subject: '', message: '', priority: 'medium' });
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/support/categories')
      .then(res => res.json())
      .then(data => {
        if (data.success) setCategories(data.categories);
      });

    fetch('http://localhost:5000/api/support/faqs')
      .then(res => res.json())
      .then(data => {
        if (data.success) setFaqs(data.faqs);
      });

    fetch('http://localhost:5000/api/support/resources')
      .then(res => res.json())
      .then(data => {
        if (data.success) setResources(data.resources);
      });
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
      setShowTicketForm(false);
      setTicketData({ name: '', email: '', phone: '', subject: '', message: '', priority: 'medium' });
    }
  };

  const markHelpful = async (faqId: number) => {
    await fetch(`http://localhost:5000/api/support/faqs/${faqId}/helpful`, { method: 'PUT' });
    setFaqs(faqs.map(f => f.id === faqId ? { ...f, helpful_count: f.helpful_count + 1 } : f));
  };

  const filteredFaqs = faqs.filter(f => 
    (!selectedCategory || f.category_id === selectedCategory) &&
    (!searchTerm || f.question.toLowerCase().includes(searchTerm.toLowerCase()) || f.question_rw?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredResources = resources.filter(r => !selectedCategory || r.category_id === selectedCategory);

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
              {i % 3 === 0 ? '💬' : i % 3 === 1 ? '🎯' : '✨'}
            </motion.div>
          ))}
        </div>

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="inline-flex items-center gap-6 mb-8">
              <div className="bg-white p-8 rounded-3xl shadow-2xl">
                <HelpCircle className="w-20 h-20 text-green-600" />
              </div>
              <h1 className="text-8xl font-black text-white drop-shadow-2xl">
                {language === 'rw' ? 'UBUFASHA' : 'SUPPORT'}
              </h1>
              <div className="bg-white p-8 rounded-3xl shadow-2xl">
                <Sparkles className="w-20 h-20 text-yellow-600" />
              </div>
            </motion.div>

            <p className="text-3xl text-white font-black mb-8 drop-shadow-lg">
              {language === 'rw' ? 'Turi Hano Kugufasha' : 'We\'re Here to Help'}
            </p>

            {/* Search */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
                <input
                  type="text"
                  placeholder={language === 'rw' ? 'Shakisha...' : 'Search...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-16 pr-6 py-5 rounded-2xl text-lg font-bold shadow-2xl focus:outline-none focus:ring-4 focus:ring-white/50"
                />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Categories */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-12">
          {categories.map((cat, i) => {
            const Icon = getIcon(cat.icon);
            const isSelected = selectedCategory === cat.id;
            const gradient = cat.color === 'yellow' ? 'from-yellow-400 to-green-400' : 'from-green-400 to-yellow-400';

            return (
              <motion.button
                key={cat.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                onClick={() => setSelectedCategory(isSelected ? null : cat.id)}
                className={`relative p-6 rounded-2xl shadow-lg transition-all ${
                  isSelected ? `bg-gradient-to-br ${gradient} text-white` : 'bg-white text-gray-700 hover:shadow-xl'
                }`}
              >
                <Icon className={`w-12 h-12 mx-auto mb-3 ${isSelected ? 'text-white' : 'text-green-600'}`} />
                <p className="font-black text-sm mb-1">{language === 'rw' ? cat.name_rw : cat.name}</p>
                <p className={`text-xs ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>
                  {cat.faq_count} {language === 'rw' ? 'FAQs' : 'FAQs'}
                </p>
              </motion.button>
            );
          })}
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          {[
            { id: 'faqs', label: language === 'rw' ? 'Ibibazo Bikunze Kubazwa' : 'FAQs', icon: MessageCircle },
            { id: 'resources', label: language === 'rw' ? 'Ibikoresho' : 'Resources', icon: FileText },
            { id: 'ticket', label: language === 'rw' ? 'Tanga Ikibazo' : 'Submit Ticket', icon: Send }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-yellow-400 to-green-400 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* FAQs Tab */}
        {activeTab === 'faqs' && (
          <div className="space-y-4">
            {filteredFaqs.map((faq, i) => (
              <motion.div
                key={faq.id}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden"
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                  className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-all"
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
                      <div className="p-6 bg-gradient-to-br from-yellow-50 to-green-50">
                        <p className="text-gray-700 mb-4">{language === 'rw' ? faq.answer_rw : faq.answer}</p>
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
            ))}
          </div>
        )}

        {/* Resources Tab */}
        {activeTab === 'resources' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((resource, i) => {
              const Icon = resource.resource_type === 'video' ? Video : resource.resource_type === 'link' ? LinkIcon : FileText;
              return (
                <motion.div
                  key={resource.id}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="bg-gradient-to-br from-yellow-400 to-green-400 p-3 rounded-xl">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-black text-gray-900 mb-2">
                        {language === 'rw' ? resource.title_rw : resource.title}
                      </h3>
                      <p className="text-sm text-gray-600">{language === 'rw' ? resource.description_rw : resource.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <Download className="w-4 h-4" /> {resource.downloads}
                    </span>
                    <button className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-green-400 text-white rounded-lg font-bold hover:shadow-lg transition-all">
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto">
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
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ModernSupportPage;
