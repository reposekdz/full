import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Newspaper, Calendar, User, Eye, Heart, Share2, Filter, Search, Image } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';

const NewsArticles: React.FC = () => {
  const [articles, setArticles] = useState<any[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<any[]>([]);
  const [displayedArticles, setDisplayedArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCount, setShowCount] = useState(8);

  useEffect(() => {
    fetchArticles();
  }, []);

  useEffect(() => {
    filterArticles();
  }, [searchTerm, selectedCategory, articles]);

  useEffect(() => {
    setDisplayedArticles(filteredArticles.slice(0, showCount));
  }, [filteredArticles, showCount]);

  const fetchArticles = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/news');
      const data = await response.json();
      if (data.success) {
        setArticles(data.articles || []);
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterArticles = () => {
    let filtered = articles;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(article => article.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(article =>
        article.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredArticles(filtered);
  };

  const handleLike = async (id: number) => {
    try {
      await fetch(`http://localhost:5000/api/news/${id}/like`, { method: 'POST' });
      fetchArticles();
    } catch (error) {
      console.error('Error liking article:', error);
    }
  };

  const handleView = async (id: number) => {
    try {
      await fetch(`http://localhost:5000/api/news/${id}/view`, { method: 'POST' });
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  };

  const loadMore = () => {
    setShowCount(prev => prev + 8);
  };

  /**
   * Build a properly-encoded image URL.
   * image_url comes from the DB as e.g. "/uploads/news/my file.jpg"
   * Browsers reject URLs with raw spaces, so we encode each path segment.
   */
  const getImageUrl = (imageUrl: string): string => {
    if (!imageUrl) return '';
    // Already a full URL – return as-is
    if (imageUrl.startsWith('http')) return imageUrl;
    // Encode each segment (preserves the slashes)
    const encoded = imageUrl
      .split('/')
      .map(segment => encodeURIComponent(segment))
      .join('/');
    return `http://localhost:5000${encoded}`;
  };

  const categoryGradients: Record<string, string> = {
    academic: 'from-blue-400 to-indigo-600',
    academics: 'from-blue-400 to-indigo-600',
    sports: 'from-green-400 to-emerald-600',
    events: 'from-purple-400 to-violet-600',
    achievements: 'from-yellow-400 to-orange-500',
    announcements: 'from-red-400 to-rose-600',
    community: 'from-teal-400 to-cyan-600',
    technology: 'from-sky-400 to-blue-600',
    culture: 'from-pink-400 to-fuchsia-600',
    school_life: 'from-amber-400 to-yellow-600',
    counseling: 'from-lime-400 to-green-600',
    leadership: 'from-orange-400 to-amber-600',
    environment: 'from-emerald-400 to-green-700',
    staff: 'from-slate-400 to-gray-600',
    other: 'from-yellow-400 to-green-500',
  };

  const categories = [
    { value: 'all', label: 'Byose' },
    { value: 'academic', label: 'Amasomo' },
    { value: 'sports', label: 'Siporo' },
    { value: 'events', label: 'Ibirori' },
    { value: 'achievements', label: 'Ibyatanzwe' },
    { value: 'announcements', label: 'Itangazo' },
    { value: 'community', label: 'Umuryango' },
    { value: 'technology', label: 'Ikoranabuhanga' },
    { value: 'culture', label: 'Umuco' },
    { value: 'other', label: 'Ibindi' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-yellow-50 via-white to-green-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Gutegura amakuru...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-green-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-black bg-gradient-to-r from-yellow-600 to-green-600 bg-clip-text text-transparent mb-4">
            Amakuru n'Inkuru
          </h1>
          <p className="text-gray-600 text-lg">Soma amakuru yose yerekeranye n'ishuri</p>
        </div>

        {/* Filters */}
        <Card className="mb-8 shadow-xl border-2 border-yellow-100">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Shakisha inkuru..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-2 border-yellow-100 focus:border-yellow-500"
                  />
                </div>
              </div>
              <div className="w-full md:w-64">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="border-2 border-yellow-100">
                    <SelectValue placeholder="Hitamo icyiciro" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Articles Grid */}
        {filteredArticles.length === 0 ? (
          <Card className="shadow-xl">
            <CardContent className="p-12 text-center">
              <Newspaper className="w-24 h-24 mx-auto text-gray-300 mb-4" />
              <h3 className="text-2xl font-bold text-gray-600 mb-2">Nta makuru abonetse</h3>
              <p className="text-gray-500">Gerageza gushakisha ikindi cyangwa hindura icyiciro</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedArticles.map((article, index) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-2xl transition-all duration-300 border-2 border-yellow-100 hover:border-yellow-300 overflow-hidden group">
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden">
                    {/* Gradient placeholder always rendered underneath */}
                    <div
                      className={`absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br ${categoryGradients[article.category] || categoryGradients.other
                        }`}
                    >
                      <Newspaper className="h-12 w-12 text-white opacity-60 mb-1" />
                      <span className="text-white text-xs font-semibold opacity-70 uppercase tracking-wide">
                        {categories.find(c => c.value === article.category)?.label || article.category}
                      </span>
                    </div>
                    {/* Real image overlaid on top; hidden if it fails to load */}
                    {article.image_url && (
                      <img
                        src={getImageUrl(article.image_url)}
                        alt={article.title}
                        className="relative w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          // Hide broken image → gradient placeholder shows through
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    )}
                    {article.is_featured && (
                      <Badge className="absolute top-4 right-4 bg-yellow-500 text-white">
                        Nyamukuru
                      </Badge>
                    )}
                  </div>

                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                        {categories.find(c => c.value === article.category)?.label || article.category}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl font-bold line-clamp-2 group-hover:text-yellow-600 transition-colors">
                      {article.title}
                    </CardTitle>
                  </CardHeader>

                  <CardContent>
                    <p className="text-gray-600 line-clamp-3 mb-4">
                      {article.description}
                    </p>

                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>{article.author || 'Admin'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(article.date_published || article.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          <span>{article.views || 0}</span>
                        </div>
                        <button
                          onClick={() => handleLike(article.id)}
                          className="flex items-center gap-1 hover:text-red-500 transition-colors"
                        >
                          <Heart className="w-4 h-4" />
                          <span>{article.likes || 0}</span>
                        </button>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleView(article.id)}
                        className="bg-gradient-to-r from-yellow-500 to-green-500 hover:from-yellow-600 hover:to-green-600 text-white"
                      >
                        Soma
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Load More Button */}
        {filteredArticles.length > displayedArticles.length && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center mt-12"
          >
            <Button
              onClick={loadMore}
              className="bg-gradient-to-r from-yellow-500 to-green-500 hover:from-yellow-600 hover:to-green-600 text-white px-8 py-6 text-lg font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:scale-105"
            >
              Tangaza Andi Makuru ({filteredArticles.length - displayedArticles.length})
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default NewsArticles;
