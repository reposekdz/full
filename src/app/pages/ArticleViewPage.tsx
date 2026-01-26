import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowLeft, Share2, Bookmark, Heart, MessageCircle, Twitter, Facebook, Linkedin, Mail, Clock, User, Calendar, Eye, ThumbsUp, ChevronUp, Printer, Download, Volume2, VolumeX, ZoomIn, ZoomOut, Copy, Check, Send, MoreVertical, Flag, Reply, TrendingUp, Sparkles } from 'lucide-react';
import { useLanguage } from '@/app/contexts/LanguageContext';

interface ArticleViewPageProps {
  articleId: string;
  onNavigate: (page: string) => void;
}

const ArticleViewPage: React.FC<ArticleViewPageProps> = ({ articleId, onNavigate }) => {
  const { language } = useLanguage();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [comments, setComments] = useState<any[]>([
    { id: 1, author: 'Jean Mugisha', avatar: 'JM', text: 'Great article! Very informative.', time: '2 hours ago', likes: 12 },
    { id: 2, author: 'Marie Uwase', avatar: 'MU', text: 'Thanks for sharing this valuable information.', time: '5 hours ago', likes: 8 },
  ]);
  const [newComment, setNewComment] = useState('');
  const [fontSize, setFontSize] = useState(18);
  const [isReading, setIsReading] = useState(false);
  const [readProgress, setReadProgress] = useState(0);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const articleRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();

  useEffect(() => {
    fetchArticle();
    trackView();
  }, [articleId]);

  useEffect(() => {
    const handleScroll = () => {
      if (articleRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
        const progress = (scrollTop / (scrollHeight - clientHeight)) * 100;
        setReadProgress(progress);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchArticle = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/news/${articleId}`);
      const data = await res.json();
      if (data.success) {
        setArticle(data.article);
        setLikes(data.article.likes || 0);
      }
    } catch (error) {
      console.error('Error fetching article:', error);
    } finally {
      setLoading(false);
    }
  };

  const trackView = async () => {
    try {
      await fetch(`http://localhost:5000/api/news/${articleId}/view`, { method: 'POST' });
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  };

  const handleLike = async () => {
    setLiked(!liked);
    setLikes(liked ? likes - 1 : likes + 1);
    try {
      await fetch(`http://localhost:5000/api/news/${articleId}/like`, { method: 'POST' });
    } catch (error) {
      console.error('Error liking article:', error);
    }
  };

  const handleBookmark = () => {
    setBookmarked(!bookmarked);
    const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
    if (bookmarked) {
      localStorage.setItem('bookmarks', JSON.stringify(bookmarks.filter((id: string) => id !== articleId)));
    } else {
      localStorage.setItem('bookmarks', JSON.stringify([...bookmarks, articleId]));
    }
  };

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const text = article?.title || '';
    const urls: any = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      email: `mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(url)}`
    };
    if (urls[platform]) window.open(urls[platform], '_blank');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => window.print();

  const readAloud = () => {
    if (isReading) {
      window.speechSynthesis.cancel();
      setIsReading(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(article?.content || '');
      utterance.lang = language === 'rw' ? 'rw-RW' : 'en-US';
      utterance.onend = () => setIsReading(false);
      window.speechSynthesis.speak(utterance);
      setIsReading(true);
    }
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const handlePostComment = () => {
    if (newComment.trim()) {
      const comment = {
        id: Date.now(),
        author: 'Anonymous',
        avatar: 'AN',
        text: newComment,
        time: 'Just now',
        likes: 0
      };
      setComments([comment, ...comments]);
      setNewComment('');
    }
  };

  const relatedArticles = [
    { id: 10, title: 'Ikipe y\'Ikigo', image: '/uploads/news/team yikigo.jpg', category: 'Sports' },
    { id: 12, title: 'Inama Nyishi', image: '/uploads/news/inama nyishi.jpg', category: 'Leadership' },
    { id: 13, title: 'Kuganirizwa n\'Abayobozi', image: '/uploads/news/kuganirizwa nabayobozi.jpg', category: 'Education' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
          <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full"></div>
        </motion.div>
      </div>
    );
  }

  if (!article) return null;

  return (
    <div className="min-h-screen bg-white">
      {/* Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-500 via-green-500 to-yellow-600 z-50 origin-left"
        style={{ scaleX: scrollYProgress }}
      />

      {/* Floating Action Bar */}
      <motion.div
        initial={{ x: -100 }}
        animate={{ x: 0 }}
        className="fixed left-4 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col gap-3"
      >
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleLike}
          className={`p-3 rounded-full shadow-lg transition-all ${liked ? 'bg-red-500 text-white' : 'bg-white text-gray-700 hover:bg-red-50'}`}
        >
          <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleBookmark}
          className={`p-3 rounded-full shadow-lg transition-all ${bookmarked ? 'bg-yellow-500 text-white' : 'bg-white text-gray-700 hover:bg-yellow-50'}`}
        >
          <Bookmark className={`w-5 h-5 ${bookmarked ? 'fill-current' : ''}`} />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowShareMenu(!showShareMenu)}
          className="p-3 bg-white rounded-full shadow-lg text-gray-700 hover:bg-blue-50 transition-all"
        >
          <Share2 className="w-5 h-5" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={readAloud}
          className={`p-3 rounded-full shadow-lg transition-all ${isReading ? 'bg-green-500 text-white' : 'bg-white text-gray-700 hover:bg-green-50'}`}
        >
          {isReading ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handlePrint}
          className="p-3 bg-white rounded-full shadow-lg text-gray-700 hover:bg-gray-50 transition-all"
        >
          <Printer className="w-5 h-5" />
        </motion.button>
      </motion.div>

      {/* Share Menu */}
      {showShareMenu && (
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          className="fixed left-20 top-1/2 -translate-y-1/2 z-40 bg-white rounded-2xl shadow-2xl p-4 hidden lg:block"
        >
          <div className="flex flex-col gap-2">
            <button onClick={() => handleShare('twitter')} className="p-3 hover:bg-blue-50 rounded-lg transition-all flex items-center gap-2">
              <Twitter className="w-5 h-5 text-blue-400" />
              <span className="text-sm font-medium">Twitter</span>
            </button>
            <button onClick={() => handleShare('facebook')} className="p-3 hover:bg-blue-50 rounded-lg transition-all flex items-center gap-2">
              <Facebook className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium">Facebook</span>
            </button>
            <button onClick={() => handleShare('linkedin')} className="p-3 hover:bg-blue-50 rounded-lg transition-all flex items-center gap-2">
              <Linkedin className="w-5 h-5 text-blue-700" />
              <span className="text-sm font-medium">LinkedIn</span>
            </button>
            <button onClick={() => handleShare('email')} className="p-3 hover:bg-gray-50 rounded-lg transition-all flex items-center gap-2">
              <Mail className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium">Email</span>
            </button>
            <button onClick={handleCopy} className="p-3 hover:bg-green-50 rounded-lg transition-all flex items-center gap-2">
              {copied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5 text-gray-600" />}
              <span className="text-sm font-medium">{copied ? 'Copied!' : 'Copy Link'}</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 font-medium transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          {language === 'rw' ? 'Subira' : 'Back'}
        </motion.button>

        {/* Category Badge */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <span className="inline-block px-4 py-2 bg-gradient-to-r from-yellow-500 to-green-500 text-white rounded-full text-sm font-bold">
            {article.category}
          </span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-6 leading-tight"
        >
          {article.title}
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl text-gray-600 mb-8 leading-relaxed"
        >
          {article.description}
        </motion.p>

        {/* Meta Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap items-center gap-6 pb-8 mb-8 border-b-2 border-gray-200"
        >
          <div className="flex items-center gap-2 text-gray-600">
            <User className="w-5 h-5" />
            <span className="font-medium">{article.author}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="w-5 h-5" />
            <span>{new Date(article.date_published || article.publish_date).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="w-5 h-5" />
            <span>{Math.ceil((article.content?.length || 0) / 200)} min read</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Eye className="w-5 h-5" />
            <span>{article.views || 0} views</span>
          </div>
        </motion.div>

        {/* Featured Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-12 rounded-2xl overflow-hidden shadow-2xl"
        >
          <img
            src={article.image_url?.startsWith('/uploads') ? `http://localhost:5000${article.image_url}` : article.image_url}
            alt={article.title}
            className="w-full h-auto"
          />
        </motion.div>

        {/* Font Size Controls */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-between mb-8 p-4 bg-gray-50 rounded-xl"
        >
          <span className="text-sm font-medium text-gray-700">Text Size:</span>
          <div className="flex items-center gap-3">
            <button onClick={() => setFontSize(Math.max(14, fontSize - 2))} className="p-2 hover:bg-white rounded-lg transition-all">
              <ZoomOut className="w-5 h-5" />
            </button>
            <span className="text-sm font-bold">{fontSize}px</span>
            <button onClick={() => setFontSize(Math.min(24, fontSize + 2))} className="p-2 hover:bg-white rounded-lg transition-all">
              <ZoomIn className="w-5 h-5" />
            </button>
          </div>
        </motion.div>

        {/* Article Content */}
        <motion.article
          ref={articleRef}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="prose prose-lg max-w-none mb-12"
          style={{ fontSize: `${fontSize}px` }}
        >
          <div className="text-gray-800 leading-relaxed space-y-6">
            {article.content?.split('\n').map((paragraph: string, i: number) => (
              <p key={i} className="mb-6">{paragraph}</p>
            ))}
          </div>
        </motion.article>

        {/* Engagement Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-8 py-8 border-y-2 border-gray-200 mb-12"
        >
          <div className="flex items-center gap-2">
            <ThumbsUp className="w-6 h-6 text-green-600" />
            <span className="text-2xl font-black text-gray-900">{likes}</span>
            <span className="text-gray-600">Likes</span>
          </div>
          <div className="flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-blue-600" />
            <span className="text-2xl font-black text-gray-900">{comments.length}</span>
            <span className="text-gray-600">Comments</span>
          </div>
          <div className="flex items-center gap-2">
            <Share2 className="w-6 h-6 text-purple-600" />
            <span className="text-2xl font-black text-gray-900">{article.shares || 0}</span>
            <span className="text-gray-600">Shares</span>
          </div>
        </motion.div>

        {/* Comments Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h3 className="text-3xl font-black text-gray-900 mb-6 flex items-center gap-3">
            <MessageCircle className="w-8 h-8 text-blue-600" />
            Comments ({comments.length})
          </h3>
          
          <div className="bg-gradient-to-br from-yellow-50 to-green-50 rounded-2xl p-6 mb-8 border-2 border-yellow-200">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts..."
              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none resize-none bg-white"
              rows={4}
            />
            <div className="flex items-center justify-between mt-4">
              <span className="text-sm text-gray-600">{newComment.length}/500 characters</span>
              <button 
                onClick={handlePostComment}
                disabled={!newComment.trim()}
                className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-green-500 text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
              >
                <Send className="w-5 h-5" />
                Post Comment
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {comments.map((comment, index) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100 hover:border-yellow-200 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500 to-green-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {comment.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-bold text-gray-900">{comment.author}</h4>
                        <span className="text-sm text-gray-500">{comment.time}</span>
                      </div>
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-all">
                        <MoreVertical className="w-5 h-5 text-gray-400" />
                      </button>
                    </div>
                    <p className="text-gray-700 mb-4">{comment.text}</p>
                    <div className="flex items-center gap-4">
                      <button className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors">
                        <ThumbsUp className="w-4 h-4" />
                        <span className="text-sm font-medium">{comment.likes}</span>
                      </button>
                      <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
                        <Reply className="w-4 h-4" />
                        <span className="text-sm font-medium">Reply</span>
                      </button>
                      <button className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors">
                        <Flag className="w-4 h-4" />
                        <span className="text-sm font-medium">Report</span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Related Articles */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h3 className="text-3xl font-black text-gray-900 mb-6 flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-purple-600" />
            Related Articles
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedArticles.map((related, index) => (
              <motion.div
                key={related.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => onNavigate(`article/${related.id}`)}
                className="group cursor-pointer bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all border-2 border-gray-100 hover:border-yellow-300"
              >
                <div className="aspect-video relative overflow-hidden">
                  <img
                    src={`http://localhost:5000${related.image}`}
                    alt={related.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3">
                    <span className="px-3 py-1 bg-gradient-to-r from-yellow-500 to-green-500 text-white text-xs font-bold rounded-full">
                      {related.category}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h4 className="font-bold text-gray-900 group-hover:text-green-600 transition-colors line-clamp-2">
                    {related.title}
                  </h4>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Newsletter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-yellow-500 via-green-500 to-yellow-600 rounded-3xl p-8 md:p-12 text-center text-white mb-12"
        >
          <Sparkles className="w-12 h-12 mx-auto mb-4" />
          <h3 className="text-3xl font-black mb-4">Stay Updated!</h3>
          <p className="text-lg mb-6 opacity-90">Subscribe to our newsletter for the latest news</p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-6 py-4 rounded-xl text-gray-900 focus:outline-none focus:ring-4 focus:ring-white/50"
            />
            <button className="px-8 py-4 bg-white text-green-600 rounded-xl font-bold hover:shadow-2xl transition-all">
              Subscribe
            </button>
          </div>
        </motion.div>
      </div>

      {/* Scroll to Top */}
      {readProgress > 20 && (
        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 p-4 bg-gradient-to-r from-yellow-500 to-green-500 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all z-40"
        >
          <ChevronUp className="w-6 h-6" />
        </motion.button>
      )}
    </div>
  );
};

export default ArticleViewPage;
