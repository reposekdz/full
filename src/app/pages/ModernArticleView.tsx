import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowLeft, Heart, Share2, MessageCircle, Bookmark, Eye, Clock, User, ThumbsUp, Send, Twitter, Facebook, Linkedin, Copy, Check, Download, Printer, Volume2, VolumeX, TrendingUp, Award, Star, MoreVertical, Flag, ExternalLink } from 'lucide-react';

interface ArticleViewProps {
  articleId: string;
  onNavigate: (page: string) => void;
}

export const ModernArticleView: React.FC<ArticleViewProps> = ({ articleId, onNavigate }) => {
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [views, setViews] = useState(0);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [readProgress, setReadProgress] = useState(0);
  const articleRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();

  useEffect(() => {
    fetchArticle();
    trackView();
    const saved = localStorage.getItem(`bookmarked_${articleId}`);
    setBookmarked(saved === 'true');
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
      const res = await fetch(`http://localhost:5000/api/news/${articleId}`);
      const data = await res.json();
      if (data.success) {
        setArticle(data.article);
        setLikes(data.article.likes || 0);
        setViews(data.article.views || 0);
        setComments(data.article.comments || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const trackView = async () => {
    try {
      await fetch(`http://localhost:5000/api/news/${articleId}/view`, { method: 'POST' });
      setViews(prev => prev + 1);
    } catch (error) {}
  };

  const handleLike = async () => {
    setLiked(!liked);
    setLikes(liked ? likes - 1 : likes + 1);
    try {
      await fetch(`http://localhost:5000/api/news/${articleId}/like`, { method: 'POST' });
    } catch (error) {}
  };

  const handleBookmark = () => {
    setBookmarked(!bookmarked);
    localStorage.setItem(`bookmarked_${articleId}`, (!bookmarked).toString());
  };

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const text = article?.title || '';
    const urls: any = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
    };
    if (urls[platform]) window.open(urls[platform], '_blank');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePostComment = async () => {
    if (!newComment.trim()) return;
    const comment = {
      id: Date.now(),
      author: 'You',
      text: newComment,
      time: 'Just now',
      likes: 0,
      avatar: 'YO'
    };
    setComments([comment, ...comments]);
    setNewComment('');
    try {
      await fetch(`http://localhost:5000/api/news/${articleId}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newComment })
      });
    } catch (error) {}
  };

  const readAloud = () => {
    if (isReading) {
      window.speechSynthesis.cancel();
      setIsReading(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(article?.content || '');
      utterance.onend = () => setIsReading(false);
      window.speechSynthesis.speak(utterance);
      setIsReading(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-yellow-50">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full"></div>
        </motion.div>
      </div>
    );
  }

  if (!article) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-green-100">
      {/* Progress Bar */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-yellow-500 z-50 origin-left" 
        style={{ scaleX: scrollYProgress }} 
      />

      {/* Sticky Header */}
      <motion.div 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="sticky top-0 z-40 bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-lg"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => onNavigate('home')} 
              className="flex items-center gap-2 text-gray-900 hover:text-green-600 font-bold transition-colors group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span>Back</span>
            </button>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleLike} 
                className={`p-3 rounded-xl transition-all ${liked ? 'bg-red-50 text-red-600 scale-110' : 'hover:bg-gray-100'}`}
              >
                <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
              </button>
              <button 
                onClick={handleBookmark} 
                className={`p-3 rounded-xl transition-all ${bookmarked ? 'bg-yellow-50 text-yellow-600 scale-110' : 'hover:bg-gray-100'}`}
              >
                <Bookmark className={`w-5 h-5 ${bookmarked ? 'fill-current' : ''}`} />
              </button>
              <button 
                onClick={() => setShowShareMenu(!showShareMenu)} 
                className="p-3 hover:bg-gray-100 rounded-xl transition-all relative"
              >
                <Share2 className="w-5 h-5" />
                {showShareMenu && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-2xl border p-3 w-56"
                  >
                    <button onClick={() => handleShare('twitter')} className="w-full flex items-center gap-3 p-3 hover:bg-blue-50 rounded-lg transition-all">
                      <Twitter className="w-5 h-5 text-blue-400" />
                      <span className="text-sm font-medium">Twitter</span>
                    </button>
                    <button onClick={() => handleShare('facebook')} className="w-full flex items-center gap-3 p-3 hover:bg-blue-50 rounded-lg transition-all">
                      <Facebook className="w-5 h-5 text-blue-600" />
                      <span className="text-sm font-medium">Facebook</span>
                    </button>
                    <button onClick={() => handleShare('linkedin')} className="w-full flex items-center gap-3 p-3 hover:bg-blue-50 rounded-lg transition-all">
                      <Linkedin className="w-5 h-5 text-blue-700" />
                      <span className="text-sm font-medium">LinkedIn</span>
                    </button>
                    <button onClick={handleCopy} className="w-full flex items-center gap-3 p-3 hover:bg-green-50 rounded-lg transition-all">
                      {copied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
                      <span className="text-sm font-medium">{copied ? 'Copied!' : 'Copy Link'}</span>
                    </button>
                  </motion.div>
                )}
              </button>
              <button 
                onClick={readAloud} 
                className={`p-3 rounded-xl transition-all ${isReading ? 'bg-green-50 text-green-600' : 'hover:bg-gray-100'}`}
              >
                {isReading ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          {article.image && (
            <div className="relative rounded-3xl overflow-hidden shadow-2xl mb-8 group">
              <img 
                src={`http://localhost:5000${article.image}`} 
                alt={article.title}
                className="w-full h-96 object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                <span className="bg-gradient-to-r from-green-500 to-yellow-500 px-4 py-2 rounded-full text-sm font-bold mb-4 inline-block">
                  {article.category}
                </span>
              </div>
            </div>
          )}

          <h1 className="text-5xl font-black mb-6 bg-gradient-to-r from-green-600 to-yellow-600 bg-clip-text text-transparent leading-tight">
            {article.title}
          </h1>

          <div className="flex items-center gap-6 text-gray-600 mb-8">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5" />
              <span className="font-medium">{article.author || 'GARDEN TSS'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span>{new Date(article.created_at).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              <span>{views} views</span>
            </div>
          </div>

          {/* Engagement Stats */}
          <div className="flex items-center gap-4 p-6 bg-white rounded-2xl shadow-lg">
            <button 
              onClick={handleLike}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-50 to-pink-50 hover:from-red-100 hover:to-pink-100 rounded-xl transition-all"
            >
              <Heart className={`w-5 h-5 ${liked ? 'fill-current text-red-600' : 'text-red-600'}`} />
              <span className="font-bold text-red-600">{likes}</span>
            </button>
            <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 rounded-xl transition-all">
              <MessageCircle className="w-5 h-5 text-blue-600" />
              <span className="font-bold text-blue-600">{comments.length}</span>
            </button>
            <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-50 to-yellow-50 hover:from-green-100 hover:to-yellow-100 rounded-xl transition-all">
              <Share2 className="w-5 h-5 text-green-600" />
              <span className="font-bold text-green-600">Share</span>
            </button>
          </div>
        </motion.div>

        {/* Article Content */}
        <motion.div 
          ref={articleRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="prose prose-lg max-w-none mb-12"
        >
          <div className="bg-white rounded-3xl shadow-xl p-12">
            <div className="text-gray-800 leading-relaxed text-lg" dangerouslySetInnerHTML={{ __html: article.content }} />
          </div>
        </motion.div>

        {/* Comments Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-3xl shadow-xl p-8"
        >
          <h3 className="text-3xl font-black mb-6 bg-gradient-to-r from-green-600 to-yellow-600 bg-clip-text text-transparent">
            Comments ({comments.length})
          </h3>

          {/* Comment Input */}
          <div className="mb-8">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts..."
              rows={4}
              className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all resize-none"
            />
            <button
              onClick={handlePostComment}
              disabled={!newComment.trim()}
              className="mt-4 px-8 py-3 bg-gradient-to-r from-green-500 to-yellow-500 text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send className="w-5 h-5" />
              Post Comment
            </button>
          </div>

          {/* Comments List */}
          <div className="space-y-6">
            {comments.map((comment, i) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-4 p-6 bg-gradient-to-r from-green-50 to-yellow-50 rounded-2xl hover:shadow-lg transition-all"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-yellow-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                  {comment.avatar}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-gray-900">{comment.author}</span>
                    <span className="text-sm text-gray-500">{comment.time}</span>
                  </div>
                  <p className="text-gray-700 mb-3">{comment.text}</p>
                  <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-green-600 transition-colors">
                    <ThumbsUp className="w-4 h-4" />
                    <span>{comment.likes}</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
