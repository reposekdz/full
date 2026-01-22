import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const SupportsPage: React.FC = () => {
  const { t } = useLanguage();
  const [tickets, setTickets] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [showCreateTicket, setShowCreateTicket] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    category: 'technical',
    priority: 'medium',
    subject: '',
    description: ''
  });

  useEffect(() => {
    fetchTickets();
    fetchArticles();
  }, []);

  const fetchTickets = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get(`${API_URL}/support/tickets`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTickets(data.tickets || []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    }
  };

  const fetchArticles = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/support/knowledge-base`);
      setArticles(data.articles || []);
    } catch (error) {
      console.error('Error fetching articles:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/support/tickets`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(t('success'));
      setShowCreateTicket(false);
      setFormData({ category: 'technical', priority: 'medium', subject: '', description: '' });
      fetchTickets();
    } catch (error) {
      alert(t('error'));
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      open: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      resolved: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            {t('supportCenter')}
          </h1>
          <p className="text-xl text-gray-600">{t('supportDescription')}</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {[
            { label: t('activeUsers'), value: '2,543', icon: '👥', color: 'blue' },
            { label: t('resolvedTickets'), value: '98%', icon: '✅', color: 'green' },
            { label: t('avgResponseTime'), value: '2h', icon: '⚡', color: 'yellow' },
            { label: t('satisfactionRate'), value: '4.9/5', icon: '⭐', color: 'purple' }
          ].map((stat, idx) => (
            <div key={idx} className={`bg-white rounded-2xl shadow-lg p-6 border-l-4 border-${stat.color}-500 hover:shadow-xl transition-all`}>
              <div className="text-4xl mb-2">{stat.icon}</div>
              <div className="text-3xl font-bold text-gray-800">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Support Options */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">{t('howCanWeHelp')}</h2>
              <div className="space-y-4">
                {[
                  { icon: '📚', title: t('knowledgeBase'), desc: t('browseArticles'), count: articles.length },
                  { icon: '🎥', title: t('videoTutorials'), desc: t('watchGuides'), count: 45 },
                  { icon: '🎫', title: t('supportTickets'), desc: t('getPersonalizedHelp'), count: tickets.length },
                  { icon: '💬', title: t('contactSupport'), desc: t('speakWithTeam'), count: null }
                ].map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => idx === 2 && setShowCreateTicket(true)}
                    className="w-full text-left p-4 rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="text-3xl">{option.icon}</div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-800 group-hover:text-blue-600">{option.title}</h3>
                        <p className="text-sm text-gray-600">{option.desc}</p>
                        {option.count !== null && (
                          <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                            {option.count} {t('articles')}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Tickets & Articles */}
          <div className="lg:col-span-2 space-y-6">
            {/* My Tickets */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">{t('myTickets')}</h2>
                <button
                  onClick={() => setShowCreateTicket(true)}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all"
                >
                  + {t('createTicket')}
                </button>
              </div>
              <div className="space-y-4">
                {tickets.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <div className="text-6xl mb-4">🎫</div>
                    <p>{t('loading')}</p>
                  </div>
                ) : (
                  tickets.map((ticket) => (
                    <div key={ticket.id} className="border-2 border-gray-200 rounded-xl p-4 hover:border-blue-500 transition-all">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-gray-800">{ticket.subject}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(ticket.status)}`}>
                          {t(ticket.status)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{ticket.description}</p>
                      <div className="flex gap-4 text-xs text-gray-500">
                        <span>🏷️ {t(ticket.category)}</span>
                        <span>⚡ {t(ticket.priority)}</span>
                        <span>📅 {new Date(ticket.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Knowledge Base */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">{t('knowledgeBase')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {articles.slice(0, 6).map((article) => (
                  <div key={article.id} className="border-2 border-gray-200 rounded-xl p-4 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer">
                    <h3 className="font-bold text-gray-800 mb-2">{article.title}</h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{article.content}</p>
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>👁️ {article.views} views</span>
                      <span className="text-blue-600 font-semibold">{t('viewMore')} →</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Ticket Modal */}
      {showCreateTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">{t('createTicket')}</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t('category')}</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  >
                    <option value="technical">{t('technical')}</option>
                    <option value="academic">{t('academic')}</option>
                    <option value="administrative">{t('administrative')}</option>
                    <option value="other">{t('other')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t('priority')}</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  >
                    <option value="low">{t('low')}</option>
                    <option value="medium">{t('medium')}</option>
                    <option value="high">{t('high')}</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t('subject')}</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t('description')}</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={5}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowCreateTicket(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {loading ? t('loading') : t('submit')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportsPage;
