import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowLeft, Share2, Bookmark, Heart, MessageCircle, Twitter, Facebook, Linkedin, Mail, Clock, User, Calendar, Eye, ThumbsUp, ChevronUp, Printer, Volume2, VolumeX, Copy, Check, Send, MoreVertical, Flag, Reply, TrendingUp, Sparkles, BookmarkCheck, ExternalLink } from 'lucide-react';
import { useLanguage } from '@/app/contexts/LanguageContext';

interface ArticleViewPageProps {
  articleId: string;
  onNavigate: (page: string) => void;
}

const NYTArticleViewPage: React.FC<ArticleViewPageProps> = ({ articleId, onNavigate }) => {
  const { language } = useLanguage();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [fontSize, setFontSize] = useState(18);
  const [isReading, setIsReading] = useState(false);
  const [readProgress, setReadProgress] = useState(0);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showComments, setShowComments] = useState(true);
  const [relatedArticles, setRelatedArticles] = useState<any[]>([]);
  const articleRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();

  useEffect(() => {
    fetchArticle();
    trackView();
    fetchRelatedArticles();
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
        // Fetch comments
        const commentsRes = await fetch(`http://localhost:5000/api/article-interactions/comments/${articleId}`);
        const commentsData = await commentsRes.json();
        if (commentsData.success) {
          setComments(commentsData.comments || []);
        }
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedArticles = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/homepage/news');
      const data = await res.json();
      if (data.success) {
        const filtered = data.news.filter((n: any) => n.id !== parseInt(articleId)).slice(0, 6);
        setRelatedArticles(filtered);
      }
    } catch (error) {
      console.error('Error fetching related:', error);
    }
  };

  const trackView = async () => {
    try {
      await fetch(`http://localhost:5000/api/news/${articleId}/view`, { method: 'POST' });
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

  const handlePostComment = async () => {
    if (newComment.trim()) {
      try {
        const res = await fetch(`http://localhost:5000/api/article-interactions/comments/${articleId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ comment: newComment, author: 'Anonymous' })
        });
        const data = await res.json();
        if (data.success) {
          setComments([{ id: Date.now(), author: 'You', avatar: 'YO', comment: newComment, created_at: new Date().toISOString(), likes: 0 }, ...comments]);
          setNewComment('');
        }
      } catch (error) {
        console.error('Error posting comment:', error);
      }
    }
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

  const getTimeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
          <div className="w-16 h-16 border-4 border-gray-900 border-t-transparent rounded-full"></div>
        </motion.div>
      </div>
    );
  }

  if (!article) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-green-50">
      {/* Progress Bar */}
      <motion.div className="fixed top-0 left-0 right-0 h-0.5 bg-gray-900 z-50 origin-left" style={{ scaleX: scrollYProgress }} />

      {/* Sticky Header */}
      <motion.div 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="sticky top-0 z-40 bg-gradient-to-r from-yellow-500 via-green-500 to-teal-500 backdrop-blur-sm shadow-lg"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <button onClick={() => onNavigate('home')} className="flex items-center gap-2 text-white hover:text-yellow-200 font-bold transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Back to Home</span>
          </button>
          <div className="flex items-center gap-3">
            <button onClick={handleLike} className={`p-2 rounded-full transition-all ${liked ? 'bg-white/30 text-white' : 'bg-white/20 hover:bg-white/30 text-white'}`}>
              <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
            </button>
            <button onClick={handleBookmark} className={`p-2 rounded-full transition-all ${bookmarked ? 'bg-white/30 text-white' : 'bg-white/20 hover:bg-white/30 text-white'}`}>
              {bookmarked ? <BookmarkCheck className="w-5 h-5 fill-current" /> : <Bookmark className="w-5 h-5" />}
            </button>
            <button onClick={() => setShowShareMenu(!showShareMenu)} className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-full transition-all">
              <Share2 className="w-5 h-5" />
            </button>
            <button onClick={readAloud} className={`p-2 rounded-full transition-all ${isReading ? 'bg-white/30 text-white' : 'bg-white/20 hover:bg-white/30 text-white'}`}>
              {isReading ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Share Dropdown */}
      {showShareMenu && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="fixed top-16 right-4 z-50 bg-white rounded-xl shadow-2xl border border-gray-200 p-3 w-56">
          <button onClick={() => handleShare('twitter')} className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-all">
            <Twitter className="w-5 h-5 text-blue-400" />
            <span className="text-sm font-medium">Share on Twitter</span>
          </button>
          <button onClick={() => handleShare('facebook')} className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-all">
            <Facebook className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium">Share on Facebook</span>
          </button>
          <button onClick={() => handleShare('linkedin')} className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-all">
            <Linkedin className="w-5 h-5 text-blue-700" />
            <span className="text-sm font-medium">Share on LinkedIn</span>
          </button>
          <button onClick={handleCopy} className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-all">
            {copied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
            <span className="text-sm font-medium">{copied ? 'Link Copied!' : 'Copy Link'}</span>
          </button>
        </motion.div>
      )}

      {/* Main Content */}
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Category */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4">
          <span className="text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-yellow-500 to-green-500 text-white px-4 py-2 rounded-full">{article.category}</span>
        </motion.div>

        {/* Title */}
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold bg-gradient-to-r from-yellow-600 via-green-600 to-teal-600 bg-clip-text text-transparent mb-6 leading-tight">
          {article.title}
        </motion.h1>

        {/* Subtitle */}
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-xl text-gray-600 mb-8 font-serif leading-relaxed">
          {article.description}
        </motion.p>

        {/* Meta */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="flex flex-wrap items-center gap-4 pb-8 mb-8 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center text-white font-bold text-sm">
              {article.author?.charAt(0) || 'A'}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{article.author}</p>
              <p className="text-xs text-gray-500">{new Date(article.date_published).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500 ml-auto">
            <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{Math.ceil((article.content?.length || 0) / 200)} min</span>
            <span className="flex items-center gap-1"><Eye className="w-4 h-4" />{article.views || 0}</span>
          </div>
        </motion.div>

        {/* Featured Image */}
        <motion.figure initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="mb-12">
          <img src={article.image_url?.startsWith('/uploads') ? `http://localhost:5000${article.image_url}` : article.image_url} alt={article.title} className="w-full h-auto rounded-sm" />
          <figcaption className="text-sm text-gray-500 mt-3 italic">Garden TVET School - {article.category}</figcaption>
        </motion.figure>

        {/* Article Body */}
        <motion.div ref={articleRef} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="prose prose-lg max-w-none font-serif" style={{ fontSize: `${fontSize}px`, lineHeight: '1.8' }}>
          {article.content?.split('\n').map((para: string, i: number) => (
            <p key={i} className="mb-6 text-gray-800 first-letter:text-6xl first-letter:font-bold first-letter:mr-2 first-letter:float-left first-letter:leading-none">{para}</p>
          ))}
        </motion.div>

        {/* Engagement Bar */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between py-8 my-12 border-y border-gray-200">
          <div className="flex items-center gap-6">
            <button onClick={handleLike} className="flex items-center gap-2 text-gray-700 hover:text-red-600 transition-colors">
              <Heart className={`w-6 h-6 ${liked ? 'fill-current text-red-600' : ''}`} />
              <span className="font-semibold">{likes}</span>
            </button>
            <button onClick={() => setShowComments(!showComments)} className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors">
              <MessageCircle className="w-6 h-6" />
              <span className="font-semibold">{comments.length}</span>
            </button>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleBookmark} className="p-2 hover:bg-gray-100 rounded-full transition-all">
              <Bookmark className={`w-5 h-5 ${bookmarked ? 'fill-current' : ''}`} />
            </button>
            <button onClick={() => setShowShareMenu(!showShareMenu)} className="p-2 hover:bg-gray-100 rounded-full transition-all">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </motion.div>

        {/* Comments */}
        {showComments && (
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-16">
            <h2 className="text-3xl font-serif font-bold text-gray-900 mb-8">Comments ({comments.length})</h2>
            
            <div className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
              <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="What are your thoughts?" className="w-full p-4 border border-gray-300 rounded-lg focus:border-gray-900 focus:outline-none resize-none bg-white" rows={4} />
              <div className="flex items-center justify-between mt-4">
                <span className="text-sm text-gray-500">{newComment.length}/500</span>
                <button onClick={handlePostComment} disabled={!newComment.trim()} className="px-6 py-2 bg-gray-900 text-white rounded-full font-semibold hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                  Publish
                </button>
              </div>
            </div>

            <div className="space-y-6">
              {comments.map((comment) => (
                <div key={comment.id} className="border-b border-gray-200 pb-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {comment.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-gray-900">{comment.author}</span>
                        <span className="text-sm text-gray-500">{comment.time}</span>
                      </div>
                      <p className="text-gray-800 mb-3">{comment.comment || comment.text}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <button className="flex items-center gap-1 text-gray-600 hover:text-gray-900 transition-colors">
                          <ThumbsUp className="w-4 h-4" />
                          <span>{comment.likes || 0}</span>
                        </button>
                        <span className="text-gray-500">{new Date(comment.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        )}
      </article>

      {/* Related Articles Sidebar */}
      <aside className="border-t border-gray-200 bg-gradient-to-br from-yellow-50 via-green-50 to-teal-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-10">
            <Sparkles className="w-7 h-7 text-yellow-600" />
            <h2 className="text-3xl font-serif font-bold bg-gradient-to-r from-yellow-600 via-green-600 to-teal-600 bg-clip-text text-transparent">More from Garden TVET</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedArticles.map((related, idx) => (
              <motion.article 
                key={related.id} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }} 
                onClick={() => onNavigate(`article/${related.id}`)} 
                className="group cursor-pointer bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100"
              >
                <div className="relative aspect-video overflow-hidden">
                  <img 
                    src={related.image_url?.startsWith('/uploads') ? `http://localhost:5000${related.image_url}` : related.image_url} 
                    alt={related.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute top-3 left-3">
                    <span className="text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-yellow-500 via-green-500 to-teal-500 text-white px-3 py-1.5 rounded-full shadow-lg">
                      {related.category}
                    </span>
                  </div>
                  {related.is_featured && (
                    <div className="absolute top-3 right-3">
                      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-2 rounded-full shadow-lg">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                    </div>
                  )}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center gap-3 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="flex items-center gap-1 bg-black/40 backdrop-blur-sm px-2 py-1 rounded-full">
                      <Eye className="w-3 h-3" />
                      {related.views || 0}
                    </span>
                    <span className="flex items-center gap-1 bg-black/40 backdrop-blur-sm px-2 py-1 rounded-full">
                      <Heart className="w-3 h-3" />
                      {related.likes || 0}
                    </span>
                    <span className="flex items-center gap-1 bg-black/40 backdrop-blur-sm px-2 py-1 rounded-full">
                      <MessageCircle className="w-3 h-3" />
                      {related.comments || 0}
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-serif font-bold text-gray-900 group-hover:bg-gradient-to-r group-hover:from-yellow-600 group-hover:via-green-600 group-hover:to-teal-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300 mb-2 line-clamp-2">
                    {related.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{related.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {getTimeAgo(related.date_published)}
                    </span>
                    <span className="flex items-center gap-1 text-yellow-600 font-semibold group-hover:gap-2 transition-all">
                      Read More
                      <ExternalLink className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </aside>

      {/* Scroll to Top */}
      {readProgress > 20 && (
        <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="fixed bottom-8 right-8 p-3 bg-gray-900 text-white rounded-full shadow-lg hover:bg-gray-800 transition-all z-40">
          <ChevronUp className="w-6 h-6" />
        </motion.button>
      )}
    </div>
  );
};

export default NYTArticleViewPage;
