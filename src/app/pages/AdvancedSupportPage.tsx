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
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchFilter, setSearchFilter] = useState('all');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

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

    const saved = localStorage.getItem('supportSearchHistory');
    if (saved) setSearchHistory(JSON.parse(saved));

    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('support-search')?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
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

  const searchInContent = (text: string, term: string) => {
    return text?.toLowerCase().includes(term.toLowerCase());
  };

  const filteredFaqs = faqs
    .filter(f => {
      if (selectedCategory && f.category_id !== selectedCategory) return false;
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return searchInContent(f.question, term) || searchInContent(f.question_rw, term) || 
             searchInContent(f.answer, term) || searchInContent(f.answer_rw, term);
    })
    .sort((a, b) => sortBy === 'popular' ? b.views - a.views : b.helpful_count - a.helpful_count);

  const filteredResources = resources.filter(r => {
    if (selectedCategory && r.category_id !== selectedCategory) return false;
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return searchInContent(r.title, term) || searchInContent(r.title_rw, term) ||
           searchInContent(r.description, term) || searchInContent(r.description_rw, term);
  });

  const allSearchResults = {
    faqs: filteredFaqs,
    resources: filteredResources,
    total: filteredFaqs.length + filteredResources.length
  };

  const getSearchSuggestions = () => {
    if (!searchTerm || searchTerm.length < 2) return [];
    const suggestions = new Set<string>();
    faqs.forEach(f => {
      if (searchInContent(f.question, searchTerm)) suggestions.add(language === 'rw' ? f.question_rw : f.question);
    });
    return Array.from(suggestions).slice(0, 5);
  };

  const getPopularSearches = () => {
    return faqs.sort((a, b) => b.views - a.views).slice(0, 5).map(f => language === 'rw' ? f.question_rw : f.question);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setShowSearchResults(true);
    if (term && !searchHistory.includes(term)) {
      const newHistory = [term, ...searchHistory].slice(0, 10);
      setSearchHistory(newHistory);
      localStorage.setItem('supportSearchHistory', JSON.stringify(newHistory));
    }
  };

  const clearSearchHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('supportSearchHistory');
  };

  const highlightText = (text: string, highlight: string) => {
    if (!highlight.trim()) return text;
    const regex = new RegExp(`(${highlight})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) => 
      regex.test(part) ? <mark key={i} className="bg-yellow-200 font-bold">{part}</mark> : part
    );
  };

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
            
            {/* Advanced Search in Hero */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="max-w-4xl mx-auto">
              <div className="relative">
                <div className={`bg-white rounded-2xl shadow-2xl transition-all ${
                  searchFocused ? 'ring-4 ring-yellow-300' : ''
                }`}>
                  <div className="flex items-center gap-4 p-4">
                    <div className="relative flex-shrink-0">
                      <Search className="w-8 h-8 text-green-600" />
                      {searchTerm && (
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 0.5, repeat: Infinity }}
                          className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"
                        />
                      )}
                    </div>
                    <input
                      id="support-search"
                      type="text"
                      placeholder={language === 'rw' ? 'Shakisha ibibazo, ibisubizo, ibikoresho... (Ctrl+K)' : 'Search questions, answers, resources... (Ctrl+K)'}
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setShowDropdown(true);
                      }}
                      onFocus={() => {
                        setSearchFocused(true);
                        setShowDropdown(true);
                      }}
                      onBlur={() => {
                        setTimeout(() => {
                          setSearchFocused(false);
                          setShowDropdown(false);
                        }, 200);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && searchTerm) {
                          handleSearch(searchTerm);
                          setShowDropdown(false);
                        }
                      }}
                      className="flex-1 text-xl font-bold focus:outline-none text-gray-900 placeholder:text-gray-400"
                    />
                    {searchTerm && (
                      <motion.button
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        onClick={() => {
                          setSearchTerm('');
                          setShowSearchResults(false);
                        }}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
                      >
                        <span className="text-2xl">✕</span>
                      </motion.button>
                    )}
                    <div className="flex items-center gap-2">
                      <select
                        value={searchFilter}
                        onChange={(e) => setSearchFilter(e.target.value)}
                        className="px-4 py-2 rounded-lg bg-gradient-to-r from-yellow-400 to-green-400 text-white font-bold focus:outline-none cursor-pointer"
                      >
                        <option value="all">{language === 'rw' ? 'Byose' : 'All'}</option>
                        <option value="faqs">FAQs</option>
                        <option value="resources">{language === 'rw' ? 'Ibikoresho' : 'Resources'}</option>
                      </select>
                      {searchTerm && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleSearch(searchTerm)}
                          className="px-6 py-2 bg-gradient-to-r from-green-400 to-yellow-400 text-white rounded-lg font-bold shadow-lg hover:shadow-xl transition-all"
                        >
                          {language === 'rw' ? 'Shakisha' : 'Search'}
                        </motion.button>
                      )}
                    </div>
                  </div>
                  
                  {/* Advanced Dropdown */}
                  <AnimatePresence>
                    {showDropdown && searchFocused && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="border-t border-gray-200 overflow-hidden"
                      >
                        <div className="p-4 max-h-96 overflow-y-auto">
                          {/* Live Search Results Preview */}
                          {searchTerm.length >= 2 && (
                            <div className="mb-4">
                              <div className="flex items-center justify-between mb-3">
                                <p className="text-sm font-bold text-gray-600 flex items-center gap-2">
                                  <Zap className="w-4 h-4 text-yellow-500" />
                                  {language === 'rw' ? 'Ibisubizo Byihuse' : 'Quick Results'}
                                </p>
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold">
                                  {allSearchResults.total} {language === 'rw' ? 'byabonetse' : 'found'}
                                </span>
                              </div>
                              <div className="space-y-2">
                                {getSearchSuggestions().map((suggestion, i) => (
                                  <motion.button
                                    key={i}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    onClick={() => handleSearch(suggestion)}
                                    className="w-full text-left px-4 py-3 rounded-lg hover:bg-gradient-to-r hover:from-yellow-50 hover:to-green-50 text-gray-700 font-semibold transition-all group"
                                  >
                                    <div className="flex items-center gap-3">
                                      <Search className="w-4 h-4 text-green-600 group-hover:scale-110 transition-transform" />
                                      <span className="flex-1">{highlightText(suggestion, searchTerm)}</span>
                                      <span className="text-xs text-gray-400 group-hover:text-green-600">→</span>
                                    </div>
                                  </motion.button>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Recent Searches */}
                          {!searchTerm && searchHistory.length > 0 && (
                            <div className="mb-4">
                              <div className="flex items-center justify-between mb-3">
                                <p className="text-sm font-bold text-gray-600 flex items-center gap-2">
                                  <Clock className="w-4 h-4 text-gray-500" />
                                  {language === 'rw' ? 'Ishakisha Ryashize' : 'Recent Searches'}
                                </p>
                                <button
                                  onClick={clearSearchHistory}
                                  className="text-xs text-red-500 hover:text-red-700 font-bold"
                                >
                                  {language === 'rw' ? 'Siba' : 'Clear'}
                                </button>
                              </div>
                              <div className="space-y-2">
                                {searchHistory.slice(0, 5).map((search, i) => (
                                  <button
                                    key={i}
                                    onClick={() => handleSearch(search)}
                                    className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-50 text-gray-600 font-semibold transition-all flex items-center gap-3 group"
                                  >
                                    <Clock className="w-4 h-4 text-gray-400 group-hover:text-green-600" />
                                    <span className="flex-1">{search}</span>
                                    <span className="text-xs text-gray-400 group-hover:text-green-600">→</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Popular Searches */}
                          {!searchTerm && (
                            <div>
                              <p className="text-sm font-bold text-gray-600 mb-3 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-yellow-500" />
                                {language === 'rw' ? 'Ibibazo Bikunze Gushakishwa' : 'Popular Searches'}
                              </p>
                              <div className="space-y-2">
                                {getPopularSearches().map((search, i) => (
                                  <button
                                    key={i}
                                    onClick={() => handleSearch(search)}
                                    className="w-full text-left px-4 py-2 rounded-lg hover:bg-gradient-to-r hover:from-yellow-50 hover:to-green-50 text-gray-600 font-semibold transition-all flex items-center gap-3 group"
                                  >
                                    <Star className="w-4 h-4 text-yellow-500 group-hover:scale-110 transition-transform" />
                                    <span className="flex-1 line-clamp-1">{search}</span>
                                    <span className="text-xs text-gray-400 group-hover:text-green-600">→</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Keyboard Shortcuts */}
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <p className="text-xs text-gray-500 font-bold mb-2">{language === 'rw' ? 'Utubuto tw\'Ibanze' : 'Keyboard Shortcuts'}</p>
                            <div className="flex flex-wrap gap-2">
                              <div className="flex items-center gap-1 text-xs">
                                <kbd className="px-2 py-1 bg-gray-100 rounded border border-gray-300 font-mono">Ctrl</kbd>
                                <span className="text-gray-400">+</span>
                                <kbd className="px-2 py-1 bg-gray-100 rounded border border-gray-300 font-mono">K</kbd>
                                <span className="text-gray-600 ml-1">{language === 'rw' ? 'Shakisha' : 'Search'}</span>
                              </div>
                              <div className="flex items-center gap-1 text-xs">
                                <kbd className="px-2 py-1 bg-gray-100 rounded border border-gray-300 font-mono">Enter</kbd>
                                <span className="text-gray-600 ml-1">{language === 'rw' ? 'Shakisha' : 'Search'}</span>
                              </div>
                              <div className="flex items-center gap-1 text-xs">
                                <kbd className="px-2 py-1 bg-gray-100 rounded border border-gray-300 font-mono">Esc</kbd>
                                <span className="text-gray-600 ml-1">{language === 'rw' ? 'Funga' : 'Close'}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                {/* Quick Search Stats */}
                {searchTerm && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 flex items-center justify-center gap-6 text-white"
                  >
                    <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-bold">{allSearchResults.total} {language === 'rw' ? 'Ibisubizo' : 'Results'}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full">
                      <FileText className="w-5 h-5" />
                      <span className="font-bold">{filteredFaqs.length} FAQs</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full">
                      <Download className="w-5 h-5" />
                      <span className="font-bold">{filteredResources.length} {language === 'rw' ? 'Ibikoresho' : 'Resources'}</span>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4">
        {/* Comprehensive Search Results Page */}
        {showSearchResults && searchTerm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <div className="bg-white rounded-3xl shadow-2xl p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-4xl font-black text-gray-900 mb-2">
                    {language === 'rw' ? 'Ibisubizo by\'Ishakisha' : 'Search Results'}
                  </h2>
                  <p className="text-gray-600 font-bold">
                    {allSearchResults.total} {language === 'rw' ? 'ibisubizo byabonetse kuri' : 'results found for'} "{searchTerm}"
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setShowSearchResults(false);
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-green-400 text-white rounded-xl font-bold hover:shadow-lg transition-all"
                >
                  {language === 'rw' ? 'Funga' : 'Close'}
                </button>
              </div>

              {/* Filter Tabs */}
              <div className="flex gap-3 mb-6">
                {[
                  { id: 'all', label: language === 'rw' ? 'Byose' : 'All', count: allSearchResults.total },
                  { id: 'faqs', label: 'FAQs', count: filteredFaqs.length },
                  { id: 'resources', label: language === 'rw' ? 'Ibikoresho' : 'Resources', count: filteredResources.length }
                ].map(filter => (
                  <button
                    key={filter.id}
                    onClick={() => setSearchFilter(filter.id)}
                    className={`px-6 py-3 rounded-xl font-bold transition-all ${
                      searchFilter === filter.id
                        ? 'bg-gradient-to-r from-yellow-400 to-green-400 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {filter.label} ({filter.count})
                  </button>
                ))}
              </div>

              {/* FAQs Results */}
              {(searchFilter === 'all' || searchFilter === 'faqs') && filteredFaqs.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-2">
                    <MessageCircle className="w-6 h-6 text-green-600" />
                    FAQs ({filteredFaqs.length})
                  </h3>
                  <div className="space-y-3">
                    {filteredFaqs.slice(0, searchFilter === 'faqs' ? undefined : 5).map((faq, i) => (
                      <motion.div
                        key={faq.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="bg-gradient-to-br from-yellow-50 to-green-50 rounded-xl p-5 hover:shadow-lg transition-all cursor-pointer"
                        onClick={() => {
                          setExpandedFaq(faq.id);
                          setShowSearchResults(false);
                          setActiveTab('faqs');
                        }}
                      >
                        <h4 className="text-lg font-black text-gray-900 mb-2">
                          {language === 'rw' ? faq.question_rw : faq.question}
                        </h4>
                        <p className="text-gray-700 line-clamp-2 mb-3">
                          {language === 'rw' ? faq.answer_rw : faq.answer}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <ThumbsUp className="w-4 h-4" /> {faq.helpful_count}
                          </span>
                          <span className="flex items-center gap-1">
                            <TrendingUp className="w-4 h-4" /> {faq.views} views
                          </span>
                          <span className="ml-auto text-green-600 font-bold">{language === 'rw' ? 'Reba →' : 'View →'}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Resources Results */}
              {(searchFilter === 'all' || searchFilter === 'resources') && filteredResources.length > 0 && (
                <div>
                  <h3 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="w-6 h-6 text-yellow-600" />
                    {language === 'rw' ? 'Ibikoresho' : 'Resources'} ({filteredResources.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {filteredResources.slice(0, searchFilter === 'resources' ? undefined : 6).map((resource, i) => {
                      const Icon = resource.resource_type === 'video' ? Video : resource.resource_type === 'link' ? LinkIcon : FileText;
                      return (
                        <motion.div
                          key={resource.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="bg-gradient-to-br from-green-50 to-yellow-50 rounded-xl p-5 hover:shadow-lg transition-all"
                        >
                          <div className="flex items-start gap-3 mb-3">
                            <div className="bg-gradient-to-br from-yellow-400 to-green-400 p-3 rounded-xl">
                              <Icon className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <h4 className="text-lg font-black text-gray-900 mb-1">
                                {language === 'rw' ? resource.title_rw : resource.title}
                              </h4>
                              <p className="text-sm text-gray-600 line-clamp-2">{language === 'rw' ? resource.description_rw : resource.description}</p>
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
                </div>
              )}

              {/* No Results */}
              {allSearchResults.total === 0 && (
                <div className="text-center py-12">
                  <Search className="w-20 h-20 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-2xl font-black text-gray-900 mb-2">
                    {language === 'rw' ? 'Nta bisubizo byabonetse' : 'No Results Found'}
                  </h3>
                  <p className="text-gray-600 font-bold mb-6">
                    {language === 'rw' ? 'Gerageza gukoresha amagambo atandukanye' : 'Try using different keywords'}
                  </p>
                  <button
                    onClick={() => setSearchTerm('')}
                    className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-green-400 text-white rounded-xl font-bold hover:shadow-lg transition-all"
                  >
                    {language === 'rw' ? 'Siba Ishakisha' : 'Clear Search'}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
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
