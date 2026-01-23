import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, Calendar, User, Eye, Heart, Share2, Bookmark, 
  Clock, Tag, Facebook, Twitter, Linkedin, Link as LinkIcon,
  MessageCircle, ThumbsUp, Send
} from 'lucide-react';
import { Card, CardContent } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';
import { Textarea } from '@/app/components/ui/textarea';

interface NewsDetailPageProps {
  newsId: string;
  onNavigate: (page: string) => void;
}

const API_BASE = 'http://localhost:5000/api';

const NewsDetailPage: React.FC<NewsDetailPageProps> = ({ newsId, onNavigate }) => {
  const [news, setNews] = useState<any>(null);
  const [relatedNews, setRelatedNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<any[]>([]);

  useEffect(() => {
    fetchNewsDetail();
    fetchRelatedNews();
  }, [newsId]);

  const fetchNewsDetail = async () => {
    try {
      const response = await fetch(`${API_BASE}/admin-advanced/news`);
      const data = await response.json();
      if (data.success) {
        const newsItem = data.news.find((n: any) => n.id === parseInt(newsId));
        setNews(newsItem);
      }
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedNews = async () => {
    try {
      const response = await fetch(`${API_BASE}/admin-advanced/news?limit=3`);
      const data = await response.json();
      if (data.success) {
        setRelatedNews(data.news.filter((n: any) => n.id !== parseInt(newsId)).slice(0, 3));
      }
    } catch (error) {
      console.error('Error fetching related news:', error);
    }
  };

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const text = news?.title;
    
    const shareUrls: any = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      twitter: `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      copy: url
    };

    if (platform === 'copy') {
      navigator.clipboard.writeText(url);
      alert('Link copied!');
    } else {
      window.open(shareUrls[platform], '_blank');
    }
  };

  const handleCommentSubmit = () => {
    if (comment.trim()) {
      setComments([...comments, {
        id: Date.now(),
        text: comment,
        author: 'Umukoresha',
        date: new Date().toISOString()
      }]);
      setComment('');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-green-50 pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-96 bg-gray-200 rounded-3xl" />
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  if (!news) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-green-50 pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-500 text-xl">Amakuru ntabonetse</p>
          <Button onClick={() => onNavigate('news')} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Subira ku makuru
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-green-50 pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Button
            variant="ghost"
            onClick={() => onNavigate('news')}
            className="hover:bg-yellow-100 rounded-full"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Subira ku makuru
          </Button>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Featured Image */}
          {news.image && (
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className="relative h-96 rounded-3xl overflow-hidden shadow-2xl"
            >
              <img
                src={news.image}
                alt={news.title}
                className="w-full h-full object-cover"
              />
              {news.featured && (
                <Badge className="absolute top-6 right-6 bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 text-lg px-4 py-2">
                  Trending
                </Badge>
              )}
            </motion.div>
          )}

          {/* Article Header */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              <Badge className="bg-gradient-to-r from-yellow-500 to-green-500 text-white text-sm px-4 py-1">
                <Tag className="w-4 h-4 mr-2" />
                {news.category}
              </Badge>
              <div className="flex items-center text-gray-500">
                <Calendar className="w-4 h-4 mr-2" />
                {new Date(news.published_date).toLocaleDateString('rw-RW', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
              <div className="flex items-center text-gray-500">
                <Clock className="w-4 h-4 mr-2" />
                {Math.ceil(news.content?.length / 1000)} min gusoma
              </div>
              <div className="flex items-center text-gray-500">
                <Eye className="w-4 h-4 mr-2" />
                {news.views || 0} views
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight">
              {news.title}
            </h1>

            {news.excerpt && (
              <p className="text-xl text-gray-600 leading-relaxed">
                {news.excerpt}
              </p>
            )}

            {/* Author Info */}
            <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
              <Avatar className="h-12 w-12 ring-2 ring-yellow-400">
                <AvatarFallback className="bg-gradient-to-br from-yellow-500 to-green-500 text-white font-bold">
                  A
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-gray-900">Admin</p>
                <p className="text-sm text-gray-500">Umwanditsi</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <Card className="border-2 border-yellow-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setLiked(!liked)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                      liked ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
                    <span className="font-semibold">{liked ? 'Liked' : 'Like'}</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setBookmarked(!bookmarked)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                      bookmarked ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    <Bookmark className={`w-5 h-5 ${bookmarked ? 'fill-current' : ''}`} />
                    <span className="font-semibold">Bika</span>
                  </motion.button>
                </div>

                <div className="flex items-center gap-2">
                  <p className="text-sm text-gray-500 mr-2">Sangiza:</p>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleShare('facebook')}
                    className="rounded-full hover:bg-blue-50 hover:text-blue-600"
                  >
                    <Facebook className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleShare('twitter')}
                    className="rounded-full hover:bg-sky-50 hover:text-sky-600"
                  >
                    <Twitter className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleShare('linkedin')}
                    className="rounded-full hover:bg-blue-50 hover:text-blue-700"
                  >
                    <Linkedin className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleShare('copy')}
                    className="rounded-full hover:bg-green-50 hover:text-green-600"
                  >
                    <LinkIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Article Content */}
          <Card className="border-2 border-yellow-200">
            <CardContent className="p-8 md:p-12">
              <div className="prose prose-lg max-w-none">
                <div className="text-gray-700 leading-relaxed whitespace-pre-wrap text-lg">
                  {news.content}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          {news.tags && (
            <div className="flex items-center gap-3 flex-wrap">
              <Tag className="w-5 h-5 text-gray-400" />
              {news.tags.split(',').map((tag: string, index: number) => (
                <Badge key={index} variant="outline" className="border-green-300 text-green-700">
                  {tag.trim()}
                </Badge>
              ))}
            </div>
          )}

          {/* Comments Section */}
          <Card className="border-2 border-yellow-200">
            <CardContent className="p-6 space-y-6">
              <h3 className="text-2xl font-bold flex items-center gap-2">
                <MessageCircle className="w-6 h-6 text-green-600" />
                Ibitekerezo ({comments.length})
              </h3>

              {/* Comment Form */}
              <div className="space-y-3">
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Andika icyo utekereza..."
                  className="min-h-24 border-2 border-gray-200 focus:border-green-400 rounded-xl"
                />
                <Button
                  onClick={handleCommentSubmit}
                  disabled={!comment.trim()}
                  className="bg-gradient-to-r from-yellow-500 to-green-500 text-white rounded-full px-6"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Ohereza
                </Button>
              </div>

              {/* Comments List */}
              <div className="space-y-4">
                {comments.map((c) => (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-4 p-4 bg-gray-50 rounded-xl"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-gradient-to-br from-yellow-500 to-green-500 text-white">
                        {c.author[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-gray-900">{c.author}</p>
                        <span className="text-xs text-gray-500">
                          {new Date(c.date).toLocaleDateString('rw-RW')}
                        </span>
                      </div>
                      <p className="text-gray-700">{c.text}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Related News */}
          {relatedNews.length > 0 && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold">Amakuru Ajyanye</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedNews.map((item) => (
                  <motion.div
                    key={item.id}
                    whileHover={{ y: -5 }}
                    onClick={() => onNavigate(`news/${item.id}`)}
                    className="cursor-pointer"
                  >
                    <Card className="overflow-hidden border-2 border-yellow-100 hover:border-green-300 hover:shadow-xl transition-all">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-40 object-cover"
                        />
                      )}
                      <CardContent className="p-4">
                        <h4 className="font-bold text-gray-900 line-clamp-2 mb-2">
                          {item.title}
                        </h4>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {item.excerpt}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default NewsDetailPage;
