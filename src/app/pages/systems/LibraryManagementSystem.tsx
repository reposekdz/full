import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpen, Search, Filter, Plus, Edit, Trash2, Eye, Download, Upload, Star,
  Clock, Calendar, User, MapPin, Package, CheckCircle, XCircle, AlertCircle,
  RefreshCw, BarChart3, TrendingUp, Users, BookMarked, Library, Bookmark,
  Heart, Share2, ThumbsUp, MessageCircle, Award, Target, Zap, Bell, Settings,
  FileText, Image as ImageIcon, Video, Headphones, Globe, Mail, Phone
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Label } from '@/app/components/ui/label';
import { Progress } from '@/app/components/ui/progress';

const API_BASE = 'http://localhost:5000/api';

interface Book {
  id: number;
  title: string;
  author: string;
  isbn: string;
  category: string;
  publisher?: string;
  publication_year?: number;
  quantity: number;
  available_quantity: number;
  location?: string;
  description?: string;
  status: 'available' | 'borrowed' | 'reserved' | 'maintenance';
  cover_image?: string;
  rating?: number;
  borrowing_history?: BorrowingRecord[];
}

interface BorrowingRecord {
  id: number;
  book_id: number;
  user_id: number;
  user_name?: string;
  borrow_date: string;
  due_date: string;
  return_date?: string;
  status: 'active' | 'returned' | 'overdue';
  fine_amount?: number;
}

interface LibraryStats {
  total_books: number;
  total_borrowed: number;
  overdue_books: number;
  available_books: number;
  unique_borrowers: number;
  popular_categories: { category: string; count: number }[];
}

const LibraryManagementSystem: React.FC = () => {
  const [activeTab, setActiveTab] = useState('catalog');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [stats, setStats] = useState<LibraryStats>({
    total_books: 0,
    total_borrowed: 0,
    overdue_books: 0,
    available_books: 0,
    unique_borrowers: 0,
    popular_categories: []
  });

  const [books, setBooks] = useState<Book[]>([]);
  const [borrowings, setBorrowings] = useState<BorrowingRecord[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  const [showBookDialog, setShowBookDialog] = useState(false);
  const [showBorrowDialog, setShowBorrowDialog] = useState(false);
  const [showBookDetails, setShowBookDetails] = useState(false);

  const [bookForm, setBookForm] = useState({
    title: '',
    author: '',
    isbn: '',
    category: '',
    publisher: '',
    publication_year: '',
    quantity: '',
    location: '',
    description: '',
    cover_image: ''
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const [statsRes, booksRes, borrowingsRes] = await Promise.all([
        fetch(`${API_BASE}/library-system/stats`, { headers }),
        fetch(`${API_BASE}/library-system/books?limit=200`, { headers }),
        fetch(`${API_BASE}/library-system/borrowings?limit=100`, { headers })
      ]);

      const [statsData, booksData, borrowingsData] = await Promise.all([
        statsRes.json(),
        booksRes.json(),
        borrowingsRes.json()
      ]);

      if (statsData.success) setStats(statsData.stats || statsData);
      if (booksData.success) setBooks(booksData.books || []);
      if (borrowingsData.success) setBorrowings(borrowingsData.borrowings || borrowingsData.data || []);

    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAllData();
    setRefreshing(false);
  };

  const handleAddBook = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/library-system/books`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...bookForm,
          quantity: parseInt(bookForm.quantity),
          publication_year: parseInt(bookForm.publication_year)
        })
      });

      const data = await response.json();
      if (data.success) {
        setShowBookDialog(false);
        setBookForm({
          title: '', author: '', isbn: '', category: '', publisher: '',
          publication_year: '', quantity: '', location: '', description: '', cover_image: ''
        });
        fetchAllData();
      }
    } catch (error) {
      console.error('Add book error:', error);
    }
  };

  const handleBorrowBook = async (bookId: number) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE}/library-system/borrow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ book_id: bookId })
      });
      fetchAllData();
    } catch (error) {
      console.error('Borrow book error:', error);
    }
  };

  const handleReturnBook = async (borrowingId: number) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE}/library-system/return/${borrowingId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchAllData();
    } catch (error) {
      console.error('Return book error:', error);
    }
  };

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.isbn.includes(searchTerm);
    const matchesCategory = filterCategory === 'all' || book.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || book.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500/20 text-green-400';
      case 'borrowed': return 'bg-blue-500/20 text-blue-400';
      case 'overdue': return 'bg-red-500/20 text-red-400';
      case 'reserved': return 'bg-yellow-500/20 text-yellow-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-yellow-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-16 h-16 text-green-400 animate-spin mx-auto mb-4" />
          <p className="text-xl text-green-400">Loading Library System...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-yellow-900 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto space-y-6"
      >
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-yellow-400 bg-clip-text text-transparent">
              Library Management System
            </h1>
            <p className="text-gray-400 mt-2">Digital library with comprehensive book management</p>
          </div>
          <Button onClick={handleRefresh} disabled={refreshing} className="bg-green-600 hover:bg-green-700">
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Books</p>
                  <h3 className="text-2xl font-bold text-green-400 mt-1">{stats.total_books}</h3>
                </div>
                <BookOpen className="w-10 h-10 text-green-400 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Currently Borrowed</p>
                  <h3 className="text-2xl font-bold text-blue-400 mt-1">{stats.total_borrowed}</h3>
                </div>
                <BookMarked className="w-10 h-10 text-blue-400 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 border-yellow-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Available</p>
                  <h3 className="text-2xl font-bold text-yellow-400 mt-1">{stats.available_books}</h3>
                </div>
                <CheckCircle className="w-10 h-10 text-yellow-400 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500/10 to-red-600/10 border-red-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Overdue</p>
                  <h3 className="text-2xl font-bold text-red-400 mt-1">{stats.overdue_books}</h3>
                </div>
                <AlertCircle className="w-10 h-10 text-red-400 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Active Borrowers</p>
                  <h3 className="text-2xl font-bold text-purple-400 mt-1">{stats.unique_borrowers}</h3>
                </div>
                <Users className="w-10 h-10 text-purple-400 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-gray-800/50 border border-green-500/20">
            <TabsTrigger value="catalog" className="data-[state=active]:bg-green-600">
              <BookOpen className="w-4 h-4 mr-2" />
              Book Catalog
            </TabsTrigger>
            <TabsTrigger value="borrowings" className="data-[state=active]:bg-green-600">
              <BookMarked className="w-4 h-4 mr-2" />
              Borrowings
            </TabsTrigger>
            <TabsTrigger value="digital" className="data-[state=active]:bg-green-600">
              <Globe className="w-4 h-4 mr-2" />
              Digital Library
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-green-600">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Book Catalog */}
          <TabsContent value="catalog" className="space-y-4 mt-6">
            <div className="flex gap-4 mb-6">
              <div className="flex-1">
                <Input
                  placeholder="Search books by title, author, or ISBN..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-gray-800 border-green-500/30"
                  icon={<Search className="w-4 h-4" />}
                />
              </div>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-48 bg-gray-800 border-green-500/30">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="fiction">Fiction</SelectItem>
                  <SelectItem value="non-fiction">Non-Fiction</SelectItem>
                  <SelectItem value="science">Science</SelectItem>
                  <SelectItem value="history">History</SelectItem>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="arts">Arts</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40 bg-gray-800 border-green-500/30">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="borrowed">Borrowed</SelectItem>
                  <SelectItem value="reserved">Reserved</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={() => setShowBookDialog(true)} className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Book
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredBooks.map((book) => (
                <motion.div
                  key={book.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.02 }}
                  className="group"
                >
                  <Card className="bg-gray-800/50 border-green-500/20 h-full hover:border-green-500/40 transition-all">
                    <CardContent className="p-4 space-y-3">
                      <div className="aspect-[3/4] bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg flex items-center justify-center relative overflow-hidden">
                        {book.cover_image ? (
                          <img src={book.cover_image} alt={book.title} className="w-full h-full object-cover" />
                        ) : (
                          <BookOpen className="w-16 h-16 text-gray-600" />
                        )}
                        <div className="absolute top-2 right-2">
                          <Badge className={getStatusColor(book.status)}>{book.status}</Badge>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h3 className="font-bold text-green-400 line-clamp-2 min-h-[3rem]">{book.title}</h3>
                        <p className="text-sm text-gray-400">by {book.author}</p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{book.category}</span>
                          <span>{book.publication_year}</span>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">
                            {book.available_quantity}/{book.quantity} available
                          </span>
                          {book.rating && (
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                              <span className="text-yellow-400">{book.rating.toFixed(1)}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedBook(book);
                              setShowBookDetails(true);
                            }}
                            variant="outline"
                            className="flex-1 border-green-500/30"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </Button>
                          {book.available_quantity > 0 && (
                            <Button
                              size="sm"
                              onClick={() => handleBorrowBook(book.id)}
                              className="flex-1 bg-green-600 hover:bg-green-700"
                            >
                              <BookMarked className="w-3 h-3 mr-1" />
                              Borrow
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {filteredBooks.length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No books found matching your criteria</p>
              </div>
            )}
          </TabsContent>

          {/* Borrowings */}
          <TabsContent value="borrowings" className="space-y-4 mt-6">
            <Card className="bg-gray-800/50 border-green-500/20">
              <CardHeader>
                <CardTitle className="text-green-400">Active Borrowings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {borrowings.filter(b => b.status === 'active' || b.status === 'overdue').map((borrowing) => (
                    <div key={borrowing.id} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg border border-green-500/10">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-lg ${borrowing.status === 'overdue' ? 'bg-red-500/20' : 'bg-blue-500/20'}`}>
                          <BookMarked className={`w-5 h-5 ${borrowing.status === 'overdue' ? 'text-red-400' : 'text-blue-400'}`} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-200">{borrowing.user_name}</p>
                          <div className="flex gap-4 text-sm text-gray-400 mt-1">
                            <span>Borrowed: {new Date(borrowing.borrow_date).toLocaleDateString()}</span>
                            <span>Due: {new Date(borrowing.due_date).toLocaleDateString()}</span>
                          </div>
                          {borrowing.fine_amount && borrowing.fine_amount > 0 && (
                            <p className="text-xs text-red-400 mt-1">Fine: {borrowing.fine_amount} RWF</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(borrowing.status)}>{borrowing.status}</Badge>
                        <Button
                          size="sm"
                          onClick={() => handleReturnBook(borrowing.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Return
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-green-500/20">
              <CardHeader>
                <CardTitle className="text-green-400">Returned Books</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-700/30">
                      <tr>
                        <th className="text-left p-3 text-green-400">User</th>
                        <th className="text-left p-3 text-green-400">Borrow Date</th>
                        <th className="text-left p-3 text-green-400">Return Date</th>
                        <th className="text-left p-3 text-green-400">Duration</th>
                        <th className="text-left p-3 text-green-400">Fine</th>
                      </tr>
                    </thead>
                    <tbody>
                      {borrowings.filter(b => b.status === 'returned').slice(0, 10).map((borrowing) => (
                        <tr key={borrowing.id} className="border-t border-gray-700/50">
                          <td className="p-3 text-gray-300">{borrowing.user_name}</td>
                          <td className="p-3 text-gray-400">{new Date(borrowing.borrow_date).toLocaleDateString()}</td>
                          <td className="p-3 text-gray-400">{borrowing.return_date ? new Date(borrowing.return_date).toLocaleDateString() : 'N/A'}</td>
                          <td className="p-3 text-gray-400">
                            {borrowing.return_date ? 
                              Math.ceil((new Date(borrowing.return_date).getTime() - new Date(borrowing.borrow_date).getTime()) / (1000 * 60 * 60 * 24)) + ' days'
                              : 'N/A'}
                          </td>
                          <td className="p-3 text-red-400">{borrowing.fine_amount || 0} RWF</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Digital Library */}
          <TabsContent value="digital" className="space-y-4 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20">
                <CardContent className="p-6 text-center">
                  <FileText className="w-12 h-12 text-blue-400 mx-auto mb-3" />
                  <h3 className="text-xl font-bold text-blue-400 mb-2">E-Books</h3>
                  <p className="text-gray-400 text-sm mb-4">Access digital books online</p>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    Browse E-Books
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/20">
                <CardContent className="p-6 text-center">
                  <Video className="w-12 h-12 text-purple-400 mx-auto mb-3" />
                  <h3 className="text-xl font-bold text-purple-400 mb-2">Video Lectures</h3>
                  <p className="text-gray-400 text-sm mb-4">Educational video content</p>
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    Watch Videos
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20">
                <CardContent className="p-6 text-center">
                  <Headphones className="w-12 h-12 text-green-400 mx-auto mb-3" />
                  <h3 className="text-xl font-bold text-green-400 mb-2">Audiobooks</h3>
                  <p className="text-gray-400 text-sm mb-4">Listen to books on the go</p>
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    Browse Audiobooks
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gray-800/50 border-green-500/20">
              <CardHeader>
                <CardTitle className="text-green-400">Featured Digital Content</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((item) => (
                    <div key={item} className="flex items-center gap-4 p-4 bg-gray-700/30 rounded-lg">
                      <div className="bg-green-500/20 p-3 rounded-lg">
                        <FileText className="w-6 h-6 text-green-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-200">Digital Resource {item}</h4>
                        <p className="text-sm text-gray-400">Available for online access</p>
                      </div>
                      <Button size="sm" variant="outline" className="border-green-500/30">
                        <Download className="w-3 h-3 mr-1" />
                        Access
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics" className="space-y-4 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-gray-800/50 border-green-500/20">
                <CardHeader>
                  <CardTitle className="text-green-400">Popular Categories</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {stats.popular_categories.map((cat, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">{cat.category}</span>
                        <span className="text-green-400">{cat.count} books</span>
                      </div>
                      <Progress value={(cat.count / stats.total_books) * 100} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-green-500/20">
                <CardHeader>
                  <CardTitle className="text-green-400">Library Performance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-700/30 p-4 rounded-lg">
                      <p className="text-xs text-gray-400">Circulation Rate</p>
                      <p className="text-2xl font-bold text-green-400">
                        {stats.total_books > 0 ? ((stats.total_borrowed / stats.total_books) * 100).toFixed(1) : 0}%
                      </p>
                    </div>
                    <div className="bg-gray-700/30 p-4 rounded-lg">
                      <p className="text-xs text-gray-400">Availability Rate</p>
                      <p className="text-2xl font-bold text-yellow-400">
                        {stats.total_books > 0 ? ((stats.available_books / stats.total_books) * 100).toFixed(1) : 0}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Dialogs */}
        <Dialog open={showBookDialog} onOpenChange={setShowBookDialog}>
          <DialogContent className="bg-gray-800 border-green-500/30 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-green-400">Add New Book</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto pr-2">
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input
                  value={bookForm.title}
                  onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })}
                  className="bg-gray-700 border-green-500/30"
                />
              </div>
              <div className="space-y-2">
                <Label>Author *</Label>
                <Input
                  value={bookForm.author}
                  onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })}
                  className="bg-gray-700 border-green-500/30"
                />
              </div>
              <div className="space-y-2">
                <Label>ISBN</Label>
                <Input
                  value={bookForm.isbn}
                  onChange={(e) => setBookForm({ ...bookForm, isbn: e.target.value })}
                  className="bg-gray-700 border-green-500/30"
                />
              </div>
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select value={bookForm.category} onValueChange={(v) => setBookForm({ ...bookForm, category: v })}>
                  <SelectTrigger className="bg-gray-700 border-green-500/30">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fiction">Fiction</SelectItem>
                    <SelectItem value="non-fiction">Non-Fiction</SelectItem>
                    <SelectItem value="science">Science</SelectItem>
                    <SelectItem value="history">History</SelectItem>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="arts">Arts</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Publisher</Label>
                <Input
                  value={bookForm.publisher}
                  onChange={(e) => setBookForm({ ...bookForm, publisher: e.target.value })}
                  className="bg-gray-700 border-green-500/30"
                />
              </div>
              <div className="space-y-2">
                <Label>Publication Year</Label>
                <Input
                  type="number"
                  value={bookForm.publication_year}
                  onChange={(e) => setBookForm({ ...bookForm, publication_year: e.target.value })}
                  className="bg-gray-700 border-green-500/30"
                />
              </div>
              <div className="space-y-2">
                <Label>Quantity *</Label>
                <Input
                  type="number"
                  value={bookForm.quantity}
                  onChange={(e) => setBookForm({ ...bookForm, quantity: e.target.value })}
                  className="bg-gray-700 border-green-500/30"
                />
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  value={bookForm.location}
                  onChange={(e) => setBookForm({ ...bookForm, location: e.target.value })}
                  placeholder="e.g., Shelf A-12"
                  className="bg-gray-700 border-green-500/30"
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={bookForm.description}
                  onChange={(e) => setBookForm({ ...bookForm, description: e.target.value })}
                  className="bg-gray-700 border-green-500/30"
                  rows={3}
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Cover Image URL</Label>
                <Input
                  value={bookForm.cover_image}
                  onChange={(e) => setBookForm({ ...bookForm, cover_image: e.target.value })}
                  className="bg-gray-700 border-green-500/30"
                />
              </div>
              <div className="col-span-2 flex gap-2">
                <Button onClick={handleAddBook} className="flex-1 bg-green-600 hover:bg-green-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Book
                </Button>
                <Button onClick={() => setShowBookDialog(false)} variant="outline" className="flex-1 border-gray-600">
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showBookDetails} onOpenChange={setShowBookDetails}>
          <DialogContent className="bg-gray-800 border-green-500/30 text-white max-w-3xl">
            {selectedBook && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-green-400">{selectedBook.title}</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-3 gap-6">
                  <div className="col-span-1">
                    <div className="aspect-[3/4] bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg flex items-center justify-center">
                      {selectedBook.cover_image ? (
                        <img src={selectedBook.cover_image} alt={selectedBook.title} className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <BookOpen className="w-24 h-24 text-gray-600" />
                      )}
                    </div>
                  </div>
                  <div className="col-span-2 space-y-4">
                    <div>
                      <p className="text-sm text-gray-400">Author</p>
                      <p className="text-lg text-gray-200">{selectedBook.author}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-400">ISBN</p>
                        <p className="text-gray-200">{selectedBook.isbn}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Category</p>
                        <Badge className="bg-green-500/20 text-green-400">{selectedBook.category}</Badge>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Publisher</p>
                        <p className="text-gray-200">{selectedBook.publisher || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Year</p>
                        <p className="text-gray-200">{selectedBook.publication_year || 'N/A'}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Availability</p>
                      <p className="text-lg font-bold text-green-400">
                        {selectedBook.available_quantity} / {selectedBook.quantity} available
                      </p>
                      <Progress value={(selectedBook.available_quantity / selectedBook.quantity) * 100} className="h-2 mt-2" />
                    </div>
                    {selectedBook.description && (
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Description</p>
                        <p className="text-sm text-gray-300">{selectedBook.description}</p>
                      </div>
                    )}
                    <div className="flex gap-2 pt-4">
                      {selectedBook.available_quantity > 0 && (
                        <Button onClick={() => handleBorrowBook(selectedBook.id)} className="flex-1 bg-green-600 hover:bg-green-700">
                          <BookMarked className="w-4 h-4 mr-2" />
                          Borrow Book
                        </Button>
                      )}
                      <Button variant="outline" className="flex-1 border-green-500/30">
                        <Heart className="w-4 h-4 mr-2" />
                        Add to Wishlist
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </motion.div>
    </div>
  );
};

export default LibraryManagementSystem;
