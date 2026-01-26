import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, Heart, Share2, Bookmark, MessageCircle, Eye, Calendar, 
  User, Clock, ThumbsUp, Send, Facebook, Twitter, Linkedin, Link2,
  TrendingUp, Tag, ChevronRight, Download, Print, MoreVertical
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
  const API_BASE = 'http://localhost:5000/api';

  useEffect(() => {
    fetchArticle();
    trackView();
  }, [articleId]);

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

  const shareLinks = [
    { name: 'Facebook', icon: Facebook, color: 'bg-blue-600', url: `https://facebook.com/sharer/sharer.php?u=${window.location.href}` },
    { name: 'Twitter', icon: Twitter, color: 'bg-sky-500', url: `https://twitter.com/intent/tweet?url=${window.location.href}` },
    { name: 'LinkedIn', icon: Linkedin, color: 'bg-blue-700', url: `https://linkedin.com/sharing/share-offsite/?url=${window.location.href}` },
  ];

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied!');
  };

  if (!article) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#ADFF2F]"></div></div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-yellow-50/30">
      {/* Hero Section */}
      <div className="relative h-[60vh] overflow-hidden">
        <img 
          src={article.image_url?.startsWith('/uploads') ? `http://localhost:5000${article.image_url}` : article.image_url} 
          alt={article.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        
        <button 
          onClick={() => onNavigate('home')}
          className="absolute top-6 left-6 flex items-center gap-2 bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full hover:bg-white/30 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-semibold">Back</span>
        </button>

        <div className="absolute bottom-0 left-0 right-0 p-8 max-w-5xl mx-auto">
          <Badge className="mb-4 bg-gradient-to-r from-yellow-500 to-green-500 text-white border-0 text-sm px-4 py-1">
            {article.category}
          </Badge>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">{article.title}</h1>
          <div className="flex flex-wrap items-center gap-6 text-white/90">
            <div className="flex items-center gap-2">
              <Avatar className="h-10 w-10 border-2 border-white">
                <AvatarFallback className="bg-gradient-to-br from-yellow-500 to-green-500 text-white">
                  {article.author?.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="font-semibold">{article.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <span>{article.publish_date}</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              <span>{article.views || 0} views</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span>5 min read</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleLike}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                liked ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-red-50'
              }`}
            >
              <Heart className={`w-5 h-5 ${liked ? 'fill-white' : ''}`} />
              <span className="font-semibold">{article.likes || 0}</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShareOpen(!shareOpen)}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-gray-700 hover:bg-blue-50 transition-all"
            >
              <Share2 className="w-5 h-5" />
              <span className="font-semibold">Share</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setBookmarked(!bookmarked)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                bookmarked ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-yellow-50'
              }`}
            >
              <Bookmark className={`w-5 h-5 ${bookmarked ? 'fill-white' : ''}`} />
            </motion.button>
          </div>

          <div className="flex items-center gap-2">
            <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-all">
              <Download className="w-5 h-5 text-gray-700" />
            </button>
            <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-all">
              <Print className="w-5 h-5 text-gray-700" />
            </button>
            <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-all">
              <MoreVertical className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        </div>

        {/* Share Dropdown */}
        <AnimatePresence>
          {shareOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg"
            >
              <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-4">
                {shareLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-2 px-4 py-2 rounded-full ${link.color} text-white hover:opacity-90 transition-all`}
                  >
                    <link.icon className="w-5 h-5" />
                    <span className="font-semibold">{link.name}</span>
                  </a>
                ))}
                <button
                  onClick={copyLink}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-700 text-white hover:bg-gray-800 transition-all"
                >
                  <Link2 className="w-5 h-5" />
                  <span className="font-semibold">Copy Link</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="prose prose-lg max-w-none"
        >
          <p className="text-xl text-gray-700 leading-relaxed mb-8">{article.description}</p>
          <div className="text-gray-600 leading-relaxed space-y-4">
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
            <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
          </div>
        </motion.div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mt-8 pt-8 border-t border-gray-200">
          <Tag className="w-5 h-5 text-gray-500" />
          {['Education', 'Technology', 'Innovation', 'Students'].map((tag) => (
            <Badge key={tag} variant="outline" className="px-3 py-1 text-sm">
              {tag}
            </Badge>
          ))}
        </div>

        {/* Comments Section */}
        <div className="mt-12 pt-12 border-t border-gray-200">
          <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
            <MessageCircle className="w-7 h-7 text-[#ADFF2F]" />
            Comments ({comments.length})
          </h3>

          {/* Comment Input */}
          <Card className="mb-8 border-2 border-yellow-200">
            <CardContent className="p-6">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your thoughts..."
                className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-[#ADFF2F] focus:outline-none resize-none"
                rows={4}
              />
              <div className="flex justify-end mt-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleComment}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#ADFF2F] to-green-500 text-white rounded-full font-semibold hover:shadow-lg transition-all"
                >
                  <Send className="w-5 h-5" />
                  Post Comment
                </motion.button>
              </div>
            </CardContent>
          </Card>

          {/* Comments List */}
          <div className="space-y-4">
            {comments.map((c) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="border-2 border-gray-200 hover:border-yellow-200 transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12 border-2 border-yellow-400">
                        <AvatarFallback className="bg-gradient-to-br from-yellow-500 to-green-500 text-white font-bold">
                          {c.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="font-bold text-gray-900">{c.author}</h4>
                            <p className="text-sm text-gray-500">{c.time}</p>
                          </div>
                          <button className="flex items-center gap-1 text-gray-500 hover:text-red-500 transition-colors">
                            <ThumbsUp className="w-4 h-4" />
                            <span className="text-sm font-semibold">{c.likes}</span>
                          </button>
                        </div>
                        <p className="text-gray-700">{c.text}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Related Articles */}
        <div className="mt-16 pt-12 border-t border-gray-200">
          <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
            <TrendingUp className="w-7 h-7 text-[#ADFF2F]" />
            Related Articles
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="border-2 border-yellow-200 hover:shadow-xl transition-all cursor-pointer group">
                <div className="aspect-video relative overflow-hidden">
                  <img 
                    src={`https://images.unsplash.com/photo-${1523240795612 + i}?w=400`}
                    alt="Related"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <CardContent className="p-4">
                  <h4 className="font-bold text-gray-900 mb-2 line-clamp-2">Related Article Title {i}</h4>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Jan {15 + i}, 2026</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleView;
