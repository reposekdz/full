import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { HelpCircle, MessageSquare, BookOpen, Ticket, Search, Plus, CheckCircle, Clock, AlertCircle, ThumbsUp, Send, X, FileText, Award, Settings, UserPlus, CreditCard, Info } from 'lucide-react';

const EnhancedSupportPage = () => {
  const [categories, setCategories] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [articles, setArticles] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [ticketForm, setTicketForm] = useState({
    category_id: '',
    user_name: '',
    user_email: '',
    user_phone: '',
    subject: '',
    description: '',
    priority: 'medium'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [categoriesRes, ticketsRes, faqsRes, articlesRes, statsRes] = await Promise.all([
        fetch('http://localhost:5000/api/support-enhanced/categories'),
        fetch('http://localhost:5000/api/support-enhanced/tickets'),
        fetch('http://localhost:5000/api/support-enhanced/faqs'),
        fetch('http://localhost:5000/api/support-enhanced/articles'),
        fetch('http://localhost:5000/api/support-enhanced/stats')
      ]);

      setCategories(await categoriesRes.json());
      setTickets(await ticketsRes.json());
      setFaqs(await faqsRes.json());
      setArticles(await articlesRes.json());
      setStats(await statsRes.json());
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/support-enhanced/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticketForm)
      });
      
      if (response.ok) {
        fetchData();
        setShowTicketModal(false);
        setTicketForm({ category_id: '', user_name: '', user_email: '', user_phone: '', subject: '', description: '', priority: 'medium' });
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const markFaqHelpful = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/support-enhanced/faqs/${id}/helpful`, { method: 'POST' });
      fetchData();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const iconMap = {
    Settings, UserPlus, Award, CreditCard, Info, HelpCircle
  };

  const filteredFaqs = faqs.filter(faq => 
    faq.question_rw.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer_rw.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 via-yellow-400 to-emerald-500 flex items-center justify-center">
        <div className="text-center">
          <HelpCircle className="w-20 h-20 animate-spin text-white mx-auto mb-4" />
          <p className="text-2xl font-black text-white">Loading Support...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-emerald-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-green-600 via-yellow-500 to-emerald-600 text-white py-20 px-4 shadow-2xl">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-96 h-96 bg-yellow-400 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-green-400 rounded-full blur-3xl animate-pulse"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <div className="flex items-center justify-center mb-6">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-2xl"
              >
                <HelpCircle className="w-14 h-14 text-white" />
              </motion.div>
            </div>
            <h1 className="text-6xl md:text-7xl font-black mb-4 drop-shadow-lg">Ubufasha & Support</h1>
            <p className="text-2xl font-bold text-white/95 drop-shadow mb-8">Turi hano gufasha! We're here to help!</p>
            
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-green-600" />
                <Input
                  placeholder="Shakisha ikibazo cyangwa ikibazo..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-16 pl-16 pr-6 text-lg border-0 shadow-2xl bg-white"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
          {[
            { label: 'Tickets Zose', value: stats?.total_tickets || 0, icon: Ticket, color: 'from-green-400 to-emerald-500' },
            { label: 'Zifunguye', value: stats?.open_tickets || 0, icon: Clock, color: 'from-yellow-400 to-amber-500' },
            { label: 'Zakemutse', value: stats?.resolved_tickets || 0, icon: CheckCircle, color: 'from-lime-400 to-green-500' },
            { label: 'FAQs', value: stats?.total_faqs || 0, icon: HelpCircle, color: 'from-teal-400 to-cyan-500' },
            { label: 'Inyandiko', value: stats?.total_articles || 0, icon: BookOpen, color: 'from-emerald-400 to-green-500' }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: index * 0.1, type: "spring" }}
              whileHover={{ scale: 1.05 }}
            >
              <Card className="border-0 shadow-2xl bg-gradient-to-br from-white to-gray-50 overflow-hidden">
                <CardContent className="p-6">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center mx-auto mb-4 shadow-xl`}>
                    <stat.icon className="w-9 h-9 text-white" />
                  </div>
                  <p className="text-4xl font-black text-gray-900 mb-2 text-center">{stat.value}</p>
                  <p className="text-sm font-bold text-gray-600 text-center uppercase">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Categories Grid */}
        <div className="mb-12">
          <h2 className="text-4xl font-black text-gray-900 mb-6">Hitamo Icyiciro / Choose Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category, index) => {
              const Icon = iconMap[category.icon] || HelpCircle;
              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  onClick={() => setSelectedCategory(category.id)}
                  className="cursor-pointer"
                >
                  <Card className={`border-0 shadow-xl hover:shadow-2xl transition-all ${selectedCategory === category.id ? 'ring-4 ring-green-500' : ''}`}>
                    <CardContent className="p-6 text-center">
                      <div className={`w-16 h-16 rounded-full bg-gradient-to-br from-${category.color}-400 to-${category.color}-600 flex items-center justify-center mx-auto mb-3 shadow-lg`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="font-black text-gray-900 text-sm mb-1">{category.name_rw}</h3>
                      <p className="text-xs text-gray-600">{category.name_en}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-8">
          <Button
            onClick={() => setShowTicketModal(true)}
            className="flex-1 h-16 bg-gradient-to-r from-green-600 via-yellow-500 to-emerald-600 text-white font-black text-lg shadow-2xl"
          >
            <Plus className="w-6 h-6 mr-2" />
            Fungura Ticket Nshya
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
          {['overview', 'faqs', 'tickets', 'articles'].map((tab) => (
            <Button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`h-14 px-8 text-lg font-black whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-green-600 via-yellow-500 to-emerald-600 text-white shadow-2xl'
                  : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-green-400'
              }`}
            >
              {tab === 'overview' ? 'Muri Rusange' : 
               tab === 'faqs' ? 'Ibibazo Bikunze Kubazwa' :
               tab === 'tickets' ? 'Tickets Zanjye' : 'Inyandiko'}
            </Button>
          ))}
        </div>

        {/* FAQs Tab */}
        {activeTab === 'faqs' && (
          <div className="space-y-4">
            <h2 className="text-3xl font-black text-gray-900 mb-6">Ibibazo Bikunze Kubazwa / FAQs</h2>
            {filteredFaqs.map((faq, index) => (
              <motion.div
                key={faq.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="border-0 shadow-xl hover:shadow-2xl transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-black text-gray-900 mb-2">{faq.question_rw}</h3>
                        <p className="text-sm text-gray-600 mb-3">{faq.question_en}</p>
                        <p className="text-gray-700 leading-relaxed mb-2">{faq.answer_rw}</p>
                        <p className="text-gray-600 text-sm leading-relaxed">{faq.answer_en}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>{faq.views} views</span>
                        <span>{faq.helpful_count} found helpful</span>
                      </div>
                      <Button
                        onClick={() => markFaqHelpful(faq.id)}
                        className="bg-gradient-to-r from-green-500 to-yellow-500 text-white"
                      >
                        <ThumbsUp className="w-4 h-4 mr-2" />
                        Byafashije
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Tickets Tab */}
        {activeTab === 'tickets' && (
          <div className="space-y-4">
            <h2 className="text-3xl font-black text-gray-900 mb-6">Tickets Zanjye / My Tickets</h2>
            {tickets.map((ticket, index) => (
              <motion.div
                key={ticket.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={`border-0 shadow-xl ${
                  ticket.status === 'resolved' ? 'bg-gradient-to-r from-green-100 to-emerald-100' :
                  ticket.status === 'in_progress' ? 'bg-gradient-to-r from-yellow-100 to-amber-100' :
                  'bg-gradient-to-r from-blue-100 to-indigo-100'
                }`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge className={`${
                            ticket.status === 'resolved' ? 'bg-green-600' :
                            ticket.status === 'in_progress' ? 'bg-yellow-600' :
                            'bg-blue-600'
                          } text-white`}>
                            {ticket.status === 'resolved' ? 'YAKEMUTSE' :
                             ticket.status === 'in_progress' ? 'IRAKORA' : 'IFUNGUYE'}
                          </Badge>
                          <Badge className="bg-gray-600 text-white">{ticket.ticket_number}</Badge>
                          <Badge className={`${
                            ticket.priority === 'high' ? 'bg-red-600' :
                            ticket.priority === 'medium' ? 'bg-yellow-600' :
                            'bg-green-600'
                          } text-white`}>
                            {ticket.priority.toUpperCase()}
                          </Badge>
                        </div>
                        <h3 className="text-xl font-black text-gray-900 mb-2">{ticket.subject}</h3>
                        <p className="text-gray-700 mb-3">{ticket.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>Category: {ticket.category_name}</span>
                          <span>Created: {new Date(ticket.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Articles Tab */}
        {activeTab === 'articles' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <h2 className="col-span-full text-3xl font-black text-gray-900 mb-6">Inyandiko / Knowledge Base</h2>
            {articles.map((article, index) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <Card className="border-0 shadow-xl hover:shadow-2xl transition-all h-full">
                  <div className="h-2 bg-gradient-to-r from-green-500 to-yellow-500"></div>
                  <CardContent className="p-6">
                    {article.is_featured && (
                      <Badge className="mb-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                        FEATURED
                      </Badge>
                    )}
                    <h3 className="text-xl font-black text-gray-900 mb-2 line-clamp-2">{article.title_rw}</h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-1">{article.title_en}</p>
                    <p className="text-gray-700 mb-4 line-clamp-3">{article.content_rw.substring(0, 150)}...</p>
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                      <span>{article.views} views</span>
                      <span>{article.helpful_count} helpful</span>
                    </div>
                    <Button className="w-full bg-gradient-to-r from-green-600 to-yellow-500 text-white font-bold">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Soma Byose
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h2 className="text-3xl font-black text-gray-900 mb-6">Ibibazo Bikunze Kubazwa</h2>
              <div className="space-y-3">
                {faqs.slice(0, 5).map((faq, index) => (
                  <Card key={faq.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                    <CardContent className="p-4">
                      <h4 className="font-bold text-gray-900 mb-2">{faq.question_rw}</h4>
                      <p className="text-sm text-gray-600 line-clamp-2">{faq.answer_rw}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-black text-gray-900 mb-6">Inyandiko Zishya</h2>
              <div className="space-y-3">
                {articles.slice(0, 5).map((article, index) => (
                  <Card key={article.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                    <CardContent className="p-4">
                      <h4 className="font-bold text-gray-900 mb-2">{article.title_rw}</h4>
                      <p className="text-sm text-gray-600 line-clamp-2">{article.content_rw}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Ticket Modal */}
      <AnimatePresence>
        {showTicketModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full my-8"
            >
              <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-green-600 to-yellow-500 text-white rounded-t-2xl">
                <h3 className="text-2xl font-black">Fungura Ticket Nshya</h3>
                <Button onClick={() => setShowTicketModal(false)} className="bg-white/20 hover:bg-white/30 text-white">
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <form onSubmit={handleSubmitTicket} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Icyiciro / Category</label>
                  <select
                    value={ticketForm.category_id}
                    onChange={(e) => setTicketForm({ ...ticketForm, category_id: e.target.value })}
                    className="w-full p-3 border rounded-lg"
                    required
                  >
                    <option value="">Hitamo icyiciro...</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name_rw} - {cat.name_en}</option>
                    ))}
                  </select>
                </div>

                <Input
                  placeholder="Izina ryawe / Your Name"
                  value={ticketForm.user_name}
                  onChange={(e) => setTicketForm({ ...ticketForm, user_name: e.target.value })}
                  required
                />

                <Input
                  type="email"
                  placeholder="Email"
                  value={ticketForm.user_email}
                  onChange={(e) => setTicketForm({ ...ticketForm, user_email: e.target.value })}
                  required
                />

                <Input
                  placeholder="Telefoni / Phone"
                  value={ticketForm.user_phone}
                  onChange={(e) => setTicketForm({ ...ticketForm, user_phone: e.target.value })}
                />

                <Input
                  placeholder="Umutwe / Subject"
                  value={ticketForm.subject}
                  onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                  required
                />

                <textarea
                  placeholder="Sobanura ikibazo / Describe your issue"
                  value={ticketForm.description}
                  onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                  className="w-full p-3 border rounded-lg min-h-[150px]"
                  required
                />

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Ibanze / Priority</label>
                  <select
                    value={ticketForm.priority}
                    onChange={(e) => setTicketForm({ ...ticketForm, priority: e.target.value })}
                    className="w-full p-3 border rounded-lg"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1 bg-gradient-to-r from-green-600 to-yellow-500 text-white font-bold h-12">
                    <Send className="w-5 h-5 mr-2" />
                    Ohereza Ticket
                  </Button>
                  <Button type="button" onClick={() => setShowTicketModal(false)} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold h-12">
                    Hagarika
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EnhancedSupportPage;
