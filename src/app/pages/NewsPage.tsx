import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Newspaper, Calendar, User, Eye, Heart, Share2, Bookmark, 
  Search, Filter, Grid, List, ChevronRight, Clock, Tag,
  Image as ImageIcon, Play, Download, ExternalLink, X,
  TrendingUp, MessageCircle, Facebook, Twitter, Linkedin
} from 'lucide-react';
import { Card, CardContent } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Dialog, DialogContent } from '@/app/components/ui/dialog';

interface NewsPageProps {
  onNavigate: (page: string) => void;
}

const API_BASE = 'http://localhost:5000/api';

const NewsPage: React.FC<NewsPageProps> = ({ onNavigate }) => {
  const [news, setNews] = useState<any[]>([]);
  const [gallery, setGallery] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNews, setSelectedNews] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [likedNews, setLikedNews] = useState<Set<number>>(new Set());
  const [bookmarkedNews, setBookmarkedNews] = useState<Set<number>>(new Set());

  const categories = [
    { id: 'all', label: 'Byose', icon: Newspaper, color: 'from-blue-500 to-indigo-600' },
    { id: 'academic', label: 'Amasomo', icon: TrendingUp, color: 'from-green-500 to-teal-600' },
    { id: 'sports', label: 'Siporo', icon: TrendingUp, color: 'from-yellow-500 to-orange-600' },
    { id: 'events', label: 'Ibirori', icon: Calendar, color: 'from-purple-500 to-pink-600' },
    { id: 'achievements', label: 'Intsinzi', icon: TrendingUp, color: 'from-red-500 to-rose-600' },
  ];

  useEffect(() => {
    fetchNews();
    fetchGallery();
  }, []);

  const fetchNews = async () => {
    try {
      const response = await fetch(`${API_BASE}/admin-advanced/news?limit=50`);
      const data = await response.json();
      if (data.success) {
        setNews(data.news || []);
      }
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGallery = async () => {
    try {
      const response = await fetch(`${API_BASE}/admin/gallery?limit=20`);
      const data = await response.json();
      if (data.success) {
        setGallery(data.gallery || []);
      }
    } catch (error) {
      console.error('Error fetching gallery:', error);
    }
  };

  const filteredNews = news.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.content?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleLike = (id: number) => {
    setLikedNews(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const toggleBookmark = (id: number) => {
    setBookmarkedNews(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const shareNews = (newsItem: any) => {
    if (navigator.share) {
      navigator.share({
        title: newsItem.title,
        text: newsItem.excerpt,
        url: window.location.href
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-green-50 pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Newspaper className="w-12 h-12 text-yellow-600" />
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-yellow-600 via-green-600 to-yellow-600 bg-clip-text text-transparent">
              Amakuru y'Ishuri
            </h1>
          </div>
          <p className="text-gray-600 text-lg">Soma amakuru mashya n'ibikorwa by'ishuri</p>
        </motion.div>

        {/* Search & Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 space-y-4"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Shakisha amakuru..."
                className="pl-12 h-14 border-2 border-yellow-200 focus:border-green-400 rounded-2xl text-lg"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                onClick={() => setViewMode('grid')}
                className="h-14 px-6 rounded-2xl"
              >
                <Grid className="w-5 h-5" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                onClick={() => setViewMode('list')}
                className="h-14 px-6 rounded-2xl"
              >
                <List className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-3">
            {categories.map((cat, index) => {
              const Icon = cat.icon;
              return (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant={selectedCategory === cat.id ? 'default' : 'outline'}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`rounded-full px-6 py-3 font-semibold ${
                      selectedCategory === cat.id
                        ? `bg-gradient-to-r ${cat.color} text-white shadow-lg`
                        : 'border-2 border-gray-200 hover:border-yellow-400'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {cat.label}
                  </Button>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="news" className="space-y-6">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 h-14 bg-yellow-100 rounded-2xl p-1">
            <TabsTrigger value="news" className="rounded-xl text-base font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-green-500 data-[state=active]:text-white">
              <Newspaper className="w-5 h-5 mr-2" />
              Amakuru
            </TabsTrigger>
            <TabsTrigger value="gallery" className="rounded-xl text-base font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-green-500 data-[state=active]:text-white">
              <ImageIcon className="w-5 h-5 mr-2" />
              Amafoto
            </TabsTrigger>
          </TabsList>

          {/* News Tab */}
          <TabsContent value="news" className="space-y-6">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <Card key={i} className="animate-pulse">
                    <div className="h-48 bg-gray-200 rounded-t-xl" />
                    <CardContent className="p-6 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-4 bg-gray-200 rounded w-full" />
                      <div className="h-4 bg-gray-200 rounded w-5/6" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredNews.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <Newspaper className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">Nta makuru abonetse</p>
              </motion.div>
            ) : (
              <div className={viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
                : 'space-y-6'
              }>
                {filteredNews.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -5 }}
                  >
                    <Card className="overflow-hidden border-2 border-yellow-100 hover:border-green-300 hover:shadow-2xl transition-all group cursor-pointer"
                      onClick={() => onNavigate(`news/${item.id}`)}
                    >
                      {item.image && (
                        <div className="relative h-48 overflow-hidden">
                          <motion.img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          {item.featured && (
                            <Badge className="absolute top-3 right-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0">
                              <TrendingUp className="w-3 h-3 mr-1" />
                              Trending
                            </Badge>
                          )}
                        </div>
                      )}
                      <CardContent className="p-6 space-y-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="border-green-300 text-green-700">
                            <Tag className="w-3 h-3 mr-1" />
                            {item.category}
                          </Badge>
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="w-4 h-4 mr-1" />
                            {new Date(item.published_date).toLocaleDateString('rw-RW')}
                          </div>
                        </div>

                        <h3 
                          className="text-xl font-bold text-gray-900 line-clamp-2 group-hover:text-green-600 transition-colors cursor-pointer"
                        >
                          {item.title}
                        </h3>

                        <p className="text-gray-600 line-clamp-3">{item.excerpt || item.content?.substring(0, 150)}</p>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <div className="flex items-center gap-4">
                            <motion.button
                              whileHover={{ scale: 1.2 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleLike(item.id);
                              }}
                              className={`flex items-center gap-1 ${likedNews.has(item.id) ? 'text-red-500' : 'text-gray-400'}`}
                            >
                              <Heart className={`w-5 h-5 ${likedNews.has(item.id) ? 'fill-current' : ''}`} />
                              <span className="text-sm font-medium">{item.views || 0}</span>
                            </motion.button>

                            <motion.button
                              whileHover={{ scale: 1.2 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleBookmark(item.id);
                              }}
                              className={`${bookmarkedNews.has(item.id) ? 'text-yellow-500' : 'text-gray-400'}`}
                            >
                              <Bookmark className={`w-5 h-5 ${bookmarkedNews.has(item.id) ? 'fill-current' : ''}`} />
                            </motion.button>

                            <motion.button
                              whileHover={{ scale: 1.2 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                shareNews(item);
                              }}
                              className="text-gray-400 hover:text-green-500"
                            >
                              <Share2 className="w-5 h-5" />
                            </motion.button>
                          </div>

                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              onNavigate(`news/${item.id}`);
                            }}
                            className="bg-gradient-to-r from-yellow-500 to-green-500 text-white rounded-full px-6"
                          >
                            Soma
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Gallery Tab */}
          <TabsContent value="gallery">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {gallery.map((img, index) => (
                <motion.div
                  key={img.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.03 }}
                  whileHover={{ scale: 1.05 }}
                  className="relative aspect-square rounded-2xl overflow-hidden cursor-pointer group"
                  onClick={() => setSelectedImage(img.image_url)}
                >
                  <img
                    src={img.image_url}
                    alt={img.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <p className="text-white font-semibold text-sm">{img.title}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* News Detail Modal */}
      <Dialog open={!!selectedNews} onOpenChange={() => setSelectedNews(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedNews && (
            <div className="space-y-6">
              {selectedNews.image && (
                <img
                  src={selectedNews.image}
                  alt={selectedNews.title}
                  className="w-full h-96 object-cover rounded-2xl"
                />
              )}
              <div className="space-y-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <Badge className="bg-gradient-to-r from-yellow-500 to-green-500 text-white">
                    {selectedNews.category}
                  </Badge>
                  <div className="flex items-center text-gray-500">
                    <Calendar className="w-4 h-4 mr-2" />
                    {new Date(selectedNews.published_date).toLocaleDateString('rw-RW')}
                  </div>
                  <div className="flex items-center text-gray-500">
                    <User className="w-4 h-4 mr-2" />
                    {selectedNews.author_id}
                  </div>
                </div>

                <h1 className="text-3xl md:text-4xl font-black text-gray-900">
                  {selectedNews.title}
                </h1>

                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {selectedNews.content}
                  </p>
                </div>

                <div className="flex items-center gap-4 pt-6 border-t">
                  <Button
                    onClick={() => shareNews(selectedNews)}
                    variant="outline"
                    className="flex-1 rounded-full"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Sangiza
                  </Button>
                  <Button
                    onClick={() => toggleBookmark(selectedNews.id)}
                    variant="outline"
                    className="flex-1 rounded-full"
                  >
                    <Bookmark className={`w-4 h-4 mr-2 ${bookmarkedNews.has(selectedNews.id) ? 'fill-current' : ''}`} />
                    Bika
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Image Lightbox */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-6xl p-0 bg-black/95">
          {selectedImage && (
            <div className="relative">
              <Button
                onClick={() => setSelectedImage(null)}
                variant="ghost"
                className="absolute top-4 right-4 z-10 text-white hover:bg-white/20 rounded-full"
              >
                <X className="w-6 h-6" />
              </Button>
              <img
                src={selectedImage}
                alt="Gallery"
                className="w-full h-auto max-h-[90vh] object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NewsPage;
