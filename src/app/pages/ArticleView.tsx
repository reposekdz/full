import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { 
  ArrowLeft, Heart, Share2, Bookmark, MessageCircle, Eye, Calendar, 
  User, Clock, ThumbsUp, Send, Facebook, Twitter, Linkedin, Link2,
  TrendingUp, Tag, ChevronRight, Download, Print, MoreVertical, Volume2, VolumeX,
  Maximize2, Minimize2, Type, Sun, Moon, Copy, Check, Flag, Award, Star, Zap,
  BookOpen, Headphones, Share, Mail, ExternalLink, Filter, SortAsc, Search
} from 'lucide-react';
import { Card, CardContent } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';

interface ArticleViewProps {
  articleId: string;
  onNavigate: (page: string) => void;
}

const ArticleView: React.FC<ArticleViewProps> = ({ articleId, onNavigate }) => {
  const [article, setArticle] = useState<any>(null);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<any[]>([]);
  const [shareOpen, setShareOpen] = useState(false);
  const [relatedArticles, setRelatedArticles] = useState<any[]>([]);
  const [readingMode, setReadingMode] = useState(false);
  const [fontSize, setFontSize] = useState(18);
  const [darkMode, setDarkMode] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [readProgress, setReadProgress] = useState(0);
  const [copied, setCopied] = useState(false);
  const [showTableOfContents, setShowTableOfContents] = useState(false);
  const [commentSort, setCommentSort] = useState('newest');
  const [commentFilter, setCommentFilter] = useState('');
  const articleRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const API_BASE = 'http://localhost:5000/api';

  useEffect(() => {
    fetchArticle();
    trackView();
    fetchRelatedArticles();
    const savedBookmark = localStorage.getItem(`bookmark_${articleId}`);
    if (savedBookmark) setBookmarked(true);
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode) setDarkMode(savedDarkMode === 'true');
  }, [articleId]);

  useEffect(() => {
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
      const progress = (scrollTop / (scrollHeight - clientHeight)) * 100;
      setReadProgress(progress);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchArticle = async () => {
    try {
      const res = await fetch(`${API_BASE}/article-interactions/${articleId}`);
      const data = await res.json();
      if (data.success) {
        setArticle(data.article);
        setComments(data.article.comments || []);
      }
    } catch (error) {
      console.error('Error fetching article:', error);
    }
  };

  const trackView = async () => {
    try {
      await fetch(`${API_BASE}/article-interactions/${articleId}/view`, { method: 'POST' });
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  };

  const handleLike = async () => {
    try {
      const res = await fetch(`${API_BASE}/article-interactions/${articleId}/like`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setLiked(!liked);
        setArticle({ ...article, likes: data.likes });
      }
    } catch (error) {
      console.error('Error liking article:', error);
    }
  };

  const handleComment = async () => {
    if (!comment.trim()) return;
    try {
      const res = await fetch(`${API_BASE}/article-interactions/${articleId}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: comment, author: 'Anonymous' })
      });
      if (res.ok) {
        setComment('');
        fetchArticle();
      }
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };

  const fetchRelatedArticles = async () => {
    try {
      const res = await fetch(`${API_BASE}/article-interactions/${articleId}/related`);
      const data = await res.json();
      if (data.success) setRelatedArticles(data.articles);
    } catch (error) {
      console.error('Error fetching related:', error);
    }
  };

  const readAloud = () => {
    if (isReading) {
      window.speechSynthesis.cancel();
      setIsReading(false);
    } else {
      const text = article?.description || '';
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => setIsReading(false);
      window.speechSynthesis.speak(utterance);
      setIsReading(true);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleBookmark = () => {
    setBookmarked(!bookmarked);
    localStorage.setItem(`bookmark_${articleId}`, (!bookmarked).toString());
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    localStorage.setItem('darkMode', (!darkMode).toString());
  };

  const sortedComments = [...comments].sort((a, b) => {
    if (commentSort === 'newest') return b.id - a.id;
    if (commentSort === 'oldest') return a.id - b.id;
    if (commentSort === 'popular') return (b.likes || 0) - (a.likes || 0);
    return 0;
  }).filter(c => c.text.toLowerCase().includes(commentFilter.toLowerCase()));

  const shareLinks = [
    { name: 'Facebook', icon: Facebook, color: 'bg-blue-600', url: `https://facebook.com/sharer/sharer.php?u=${window.location.href}` },
    { name: 'Twitter', icon: Twitter, color: 'bg-sky-500', url: `https://twitter.com/intent/tweet?url=${window.location.href}` },
    { name: 'LinkedIn', icon: Linkedin, color: 'bg-blue-700', url: `https://linkedin.com/sharing/share-offsite/?url=${window.location.href}` },
  ];

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied!');
  };

  if (!article) return <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50"><div className="relative"><div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-[#ADFF2F]"></div><Zap className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-[#ADFF2F] animate-pulse" /></div></div>;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'}`}>
      {/* Reading Progress Bar */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#ADFF2F] via-yellow-400 to-green-500 z-50 origin-left shadow-lg" 
        style={{ scaleX: scrollYProgress }} 
      />

      {/* Floating Action Buttons */}
      <div className="fixed right-6 top-1/2 transform -translate-y-1/2 z-40 space-y-3">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleDarkMode}
          className={`p-4 rounded-full shadow-2xl backdrop-blur-lg transition-all ${darkMode ? 'bg-yellow-500 text-white' : 'bg-gray-800 text-yellow-400'}`}
          title="Toggle Dark Mode"
        >
          {darkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setReadingMode(!readingMode)}
          className="p-4 rounded-full bg-white/90 shadow-2xl backdrop-blur-lg hover:bg-white transition-all"
          title="Reading Mode"
        >
          {readingMode ? <Minimize2 className="w-6 h-6 text-purple-600" /> : <Maximize2 className="w-6 h-6 text-purple-600" />}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={readAloud}
          className={`p-4 rounded-full shadow-2xl backdrop-blur-lg transition-all ${isReading ? 'bg-red-500 text-white' : 'bg-white/90 text-blue-600 hover:bg-white'}`}
          title="Text to Speech"
        >
          {isReading ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="p-4 rounded-full bg-gradient-to-r from-[#ADFF2F] to-green-500 text-white shadow-2xl backdrop-blur-lg hover:shadow-3xl transition-all"
          title="Scroll to Top"
        >
          <ArrowLeft className="w-6 h-6 rotate-90" />
        </motion.button>
      </div>
      {/* Hero Section */}
      <div className="relative h-[70vh] overflow-hidden">
        <motion.img 
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5 }}
          src={article.image_url?.startsWith('/uploads') ? `http://localhost:5000${article.image_url}` : article.image_url} 
          alt={article.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
        
        {/* Floating Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="absolute top-6 right-6 flex gap-3"
        >
          <div className="bg-white/20 backdrop-blur-xl px-4 py-2 rounded-full flex items-center gap-2 text-white border border-white/30">
            <Eye className="w-5 h-5" />
            <span className="font-bold">{article.views || 0}</span>
          </div>
          <div className="bg-white/20 backdrop-blur-xl px-4 py-2 rounded-full flex items-center gap-2 text-white border border-white/30">
            <Heart className="w-5 h-5" />
            <span className="font-bold">{article.likes || 0}</span>
          </div>
          <div className="bg-white/20 backdrop-blur-xl px-4 py-2 rounded-full flex items-center gap-2 text-white border border-white/30">
            <MessageCircle className="w-5 h-5" />
            <span className="font-bold">{comments.length}</span>
          </div>
        </motion.div>
        
        <button 
          onClick={() => onNavigate('home')}
          className="absolute top-6 left-6 flex items-center gap-2 bg-white/20 backdrop-blur-xl text-white px-6 py-3 rounded-full hover:bg-white/30 transition-all border border-white/30 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold">Back to News</span>
        </button>

        <div className="absolute bottom-0 left-0 right-0 p-8 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <Badge className="bg-gradient-to-r from-[#ADFF2F] to-green-500 text-white border-0 text-sm px-5 py-2 font-bold shadow-lg">
                {article.category}
              </Badge>
              {article.featured && (
                <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 text-sm px-5 py-2 font-bold shadow-lg flex items-center gap-1">
                  <Star className="w-4 h-4 fill-white" />
                  Featured
                </Badge>
              )}
              <Badge className="bg-white/20 backdrop-blur-xl text-white border border-white/30 text-sm px-5 py-2 font-bold">
                <Clock className="w-4 h-4 mr-1 inline" />
                5 min read
              </Badge>
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-white mb-6 leading-tight drop-shadow-2xl">{article.title}</h1>
            <div className="flex flex-wrap items-center gap-6 text-white/90">
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-xl px-4 py-2 rounded-full border border-white/20">
                <Avatar className="h-12 w-12 border-2 border-white shadow-lg">
                  <AvatarFallback className="bg-gradient-to-br from-[#ADFF2F] to-green-600 text-white font-bold text-lg">
                    {article.author?.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-bold text-sm">Written by</p>
                  <p className="font-black">{article.author}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-xl px-4 py-2 rounded-full border border-white/20">
                <Calendar className="w-5 h-5" />
                <span className="font-semibold">{article.publish_date}</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-xl px-4 py-2 rounded-full border border-white/20">
                <TrendingUp className="w-5 h-5" />
                <span className="font-semibold">Trending</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Action Bar */}
      <motion.div 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`sticky top-0 z-40 backdrop-blur-2xl border-b shadow-xl transition-colors ${darkMode ? 'bg-gray-800/95 border-gray-700' : 'bg-white/95 border-gray-200'}`}
      >
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLike}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl transition-all font-bold shadow-lg ${
                  liked ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white' : `${darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-700'} hover:bg-red-50`
                }`}
              >
                <Heart className={`w-5 h-5 ${liked ? 'fill-white' : ''}`} />
                <span>{article.likes || 0}</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShareOpen(!shareOpen)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl transition-all font-bold shadow-lg ${darkMode ? 'bg-gray-700 text-gray-200 hover:bg-blue-600' : 'bg-gray-100 text-gray-700 hover:bg-blue-50'}`}
              >
                <Share2 className="w-5 h-5" />
                <span>Share</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleBookmark}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl transition-all font-bold shadow-lg ${
                  bookmarked ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white' : `${darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-700'} hover:bg-yellow-50`
                }`}
              >
                <Bookmark className={`w-5 h-5 ${bookmarked ? 'fill-white' : ''}`} />
                <span>{bookmarked ? 'Saved' : 'Save'}</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl transition-all font-bold shadow-lg ${darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-700 hover:bg-purple-50'}`}
              >
                <MessageCircle className="w-5 h-5" />
                <span>{comments.length}</span>
              </motion.button>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-gradient-to-r from-[#ADFF2F]/20 to-green-500/20 px-4 py-2 rounded-xl">
                <Type className="w-5 h-5 text-green-600" />
                <button onClick={() => setFontSize(Math.max(14, fontSize - 2))} className="px-2 py-1 hover:bg-white/50 rounded">A-</button>
                <span className="font-bold text-sm">{fontSize}px</span>
                <button onClick={() => setFontSize(Math.min(24, fontSize + 2))} className="px-2 py-1 hover:bg-white/50 rounded">A+</button>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.print()}
                className={`p-3 rounded-xl transition-all shadow-lg ${darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                <Print className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`p-3 rounded-xl transition-all shadow-lg ${darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                <Download className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`p-3 rounded-xl transition-all shadow-lg ${darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                <Flag className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Share Dropdown */}
        <AnimatePresence>
          {shareOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className={`absolute top-full left-0 right-0 border-b shadow-2xl ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
            >
              <div className="max-w-6xl mx-auto px-6 py-6">
                <h4 className={`text-lg font-black mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Share this article</h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {shareLinks.map((link) => (
                    <motion.a
                      key={link.name}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className={`flex flex-col items-center gap-3 p-4 rounded-2xl ${link.color} text-white hover:shadow-2xl transition-all`}
                    >
                      <link.icon className="w-8 h-8" />
                      <span className="font-bold text-sm">{link.name}</span>
                    </motion.a>
                  ))}
                  <motion.button
                    onClick={copyLink}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-gradient-to-br from-gray-700 to-gray-900 text-white hover:shadow-2xl transition-all"
                  >
                    {copied ? <Check className="w-8 h-8" /> : <Link2 className="w-8 h-8" />}
                    <span className="font-bold text-sm">{copied ? 'Copied!' : 'Copy Link'}</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 text-white hover:shadow-2xl transition-all"
                  >
                    <Mail className="w-8 h-8" />
                    <span className="font-bold text-sm">Email</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Content */}
      <div className={`max-w-6xl mx-auto px-6 py-12 ${readingMode ? 'max-w-3xl' : ''}`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-3xl p-8 md:p-12 shadow-2xl mb-12 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
        >
          <div className={`prose prose-lg max-w-none ${darkMode ? 'prose-invert' : ''}`} style={{ fontSize: `${fontSize}px` }}>
            <p className={`text-2xl leading-relaxed mb-8 font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{article.description}</p>
            <div className={`leading-relaxed space-y-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
              <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
              <blockquote className="border-l-4 border-[#ADFF2F] pl-6 italic my-8 text-xl">
                "Education is the most powerful weapon which you can use to change the world."
              </blockquote>
              <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.</p>
            </div>
          </div>
        </motion.div>

        {/* Tags */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex flex-wrap gap-3 p-6 rounded-2xl shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-gradient-to-r from-yellow-50 to-green-50'}`}
        >
          <Tag className="w-6 h-6 text-[#ADFF2F]" />
          {['Education', 'Technology', 'Innovation', 'Students', 'Learning', 'Future'].map((tag) => (
            <motion.div
              key={tag}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Badge className={`px-4 py-2 text-sm font-bold cursor-pointer transition-all ${darkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-white hover:bg-[#ADFF2F] hover:text-white'}`}>
                #{tag}
              </Badge>
            </motion.div>
          ))}
        </motion.div>

        {/* Comments Section */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className={`text-3xl font-black flex items-center gap-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              <MessageCircle className="w-8 h-8 text-[#ADFF2F]" />
              Comments ({sortedComments.length})
            </h3>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search comments..."
                  value={commentFilter}
                  onChange={(e) => setCommentFilter(e.target.value)}
                  className={`pl-10 pr-4 py-2 rounded-xl border-2 focus:outline-none transition-all ${darkMode ? 'bg-gray-700 border-gray-600 text-white focus:border-[#ADFF2F]' : 'bg-white border-gray-200 focus:border-[#ADFF2F]'}`}
                />
              </div>
              <select
                value={commentSort}
                onChange={(e) => setCommentSort(e.target.value)}
                className={`px-4 py-2 rounded-xl border-2 focus:outline-none transition-all font-semibold ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>
          </div>

          {/* Comment Input */}
          <Card className={`mb-8 border-2 shadow-2xl ${darkMode ? 'bg-gray-800 border-gray-700' : 'border-yellow-200 bg-white'}`}>
            <CardContent className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <Avatar className="h-12 w-12 border-2 border-[#ADFF2F] shadow-lg">
                  <AvatarFallback className="bg-gradient-to-br from-[#ADFF2F] to-green-600 text-white font-bold">
                    YO
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your thoughts and join the conversation..."
                    className={`w-full p-4 border-2 rounded-xl focus:outline-none resize-none transition-all ${darkMode ? 'bg-gray-700 border-gray-600 text-white focus:border-[#ADFF2F]' : 'border-gray-200 focus:border-[#ADFF2F]'}`}
                    rows={4}
                  />
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <button className={`p-2 rounded-lg transition-all ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                    <Award className="w-5 h-5 text-gray-500" />
                  </button>
                  <button className={`p-2 rounded-lg transition-all ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                    <Star className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleComment}
                  disabled={!comment.trim()}
                  className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-[#ADFF2F] to-green-500 text-white rounded-xl font-bold hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                  Post Comment
                </motion.button>
              </div>
            </CardContent>
          </Card>

          {/* Comments List */}
          <div className="space-y-4">
            {sortedComments.map((c, index) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={`border-2 shadow-lg hover:shadow-2xl transition-all ${darkMode ? 'bg-gray-800 border-gray-700' : 'border-gray-200 hover:border-yellow-200 bg-white'}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-14 w-14 border-2 border-[#ADFF2F] shadow-lg">
                        <AvatarFallback className="bg-gradient-to-br from-[#ADFF2F] to-green-600 text-white font-bold text-lg">
                          {c.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className={`font-black text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>{c.author}</h4>
                            <p className="text-sm text-gray-500 flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              {c.time}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <motion.button 
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-red-50 to-pink-50 text-red-600 hover:from-red-100 hover:to-pink-100 transition-all"
                            >
                              <ThumbsUp className="w-4 h-4" />
                              <span className="font-bold">{c.likes}</span>
                            </motion.button>
                            <button className={`p-2 rounded-xl transition-all ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                              <MoreVertical className="w-5 h-5 text-gray-500" />
                            </button>
                          </div>
                        </div>
                        <p className={`leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{c.text}</p>
                        <div className="flex items-center gap-4 mt-4">
                          <button className={`text-sm font-semibold transition-colors ${darkMode ? 'text-gray-400 hover:text-[#ADFF2F]' : 'text-gray-600 hover:text-[#ADFF2F]'}`}>Reply</button>
                          <button className={`text-sm font-semibold transition-colors ${darkMode ? 'text-gray-400 hover:text-[#ADFF2F]' : 'text-gray-600 hover:text-[#ADFF2F]'}`}>Share</button>
                          <button className={`text-sm font-semibold transition-colors ${darkMode ? 'text-gray-400 hover:text-red-500' : 'text-gray-600 hover:text-red-500'}`}>Report</button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Related Articles */}
        <div className="mt-16">
          <h3 className={`text-3xl font-black mb-8 flex items-center gap-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            <TrendingUp className="w-8 h-8 text-[#ADFF2F]" />
            You Might Also Like
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(relatedArticles.length > 0 ? relatedArticles : [1, 2, 3]).map((item, i) => {
              const isArticle = typeof item === 'object';
              return (
                <motion.div
                  key={isArticle ? item.id : i}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -8 }}
                >
                  <Card className={`border-2 shadow-xl hover:shadow-2xl transition-all cursor-pointer group overflow-hidden ${darkMode ? 'bg-gray-800 border-gray-700' : 'border-yellow-200 bg-white'}`}>
                    <div className="aspect-video relative overflow-hidden">
                      <img 
                        src={isArticle ? `http://localhost:5000${item.image_url}` : `https://images.unsplash.com/photo-${1523240795612 + i}?w=400`}
                        alt={isArticle ? item.title : 'Related'}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <Badge className="absolute top-3 left-3 bg-gradient-to-r from-[#ADFF2F] to-green-500 text-white border-0 font-bold">
                        {isArticle ? item.category : 'News'}
                      </Badge>
                    </div>
                    <CardContent className="p-5">
                      <h4 className={`font-black text-lg mb-3 line-clamp-2 group-hover:text-[#ADFF2F] transition-colors ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {isArticle ? item.title : `Related Article Title ${i + 1}`}
                      </h4>
                      <p className={`text-sm mb-4 line-clamp-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {isArticle ? item.description : 'Discover more amazing content from our collection of articles.'}
                      </p>
                      <div className="flex items-center justify-between text-sm">
                        <span className={`flex items-center gap-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          <Calendar className="w-4 h-4" />
                          {isArticle ? item.publish_date : `Jan ${15 + i}, 2026`}
                        </span>
                        <ChevronRight className="w-5 h-5 text-[#ADFF2F] group-hover:translate-x-2 transition-transform" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleView;
