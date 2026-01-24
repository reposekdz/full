import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { BookOpen, Search, Plus, TrendingUp } from 'lucide-react';

const API_URL = 'http://localhost:5000/api/comprehensive-db';

export default function LibraryManagement() {
  const [books, setBooks] = useState<any[]>([]);
  const [issues, setIssues] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLibraryData();
  }, []);

  const fetchLibraryData = async () => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    
    try {
      const [booksRes, issuesRes, statsRes] = await Promise.all([
        axios.get(`${API_URL}/library/books?limit=20`, { headers }),
        axios.get(`${API_URL}/library/issues?limit=10`, { headers }),
        axios.get(`${API_URL}/library/statistics`, { headers })
      ]);
      
      setBooks(booksRes.data.books || []);
      setIssues(issuesRes.data.issues || []);
      setStats(statsRes.data.statistics);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const issueBook = async (bookId: number, userId: number) => {
    const token = localStorage.getItem('token');
    try {
      await axios.post(`${API_URL}/library/issue`, {
        book_id: bookId,
        user_id: userId,
        issue_date: new Date().toISOString().split('T')[0],
        due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }, { headers: { Authorization: `Bearer ${token}` } });
      fetchLibraryData();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredBooks = books.filter(book => 
    book.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Library Management</h1>
        <Button><Plus className="w-4 h-4 mr-2" />Add Book</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Books</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totals?.total_books || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Copies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totals?.total_copies || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Currently Issued</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totals?.currently_issued || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Overdue Books</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats?.totals?.overdue_books || 0}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Book Catalog</CardTitle>
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search books..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredBooks.map((book: any) => (
                <div key={book.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <h4 className="font-semibold">{book.title}</h4>
                    <p className="text-sm text-gray-600">{book.author}</p>
                    <div className="flex gap-2 mt-1">
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">{book.category}</span>
                      <span className="text-xs text-gray-600">ISBN: {book.isbn}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold">{book.available_copies}/{book.total_copies} Available</div>
                    <Button size="sm" className="mt-2" disabled={book.available_copies === 0}>
                      Issue Book
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {issues.map((issue: any) => (
                <div key={issue.id} className="p-3 border rounded-lg">
                  <h4 className="font-semibold text-sm">{issue.book_title}</h4>
                  <p className="text-xs text-gray-600">{issue.user_name}</p>
                  <div className="flex justify-between mt-2 text-xs">
                    <span>Due: {new Date(issue.due_date).toLocaleDateString()}</span>
                    <span className={`px-2 py-1 rounded ${issue.days_overdue > 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                      {issue.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Popular Books</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats?.popular_books?.slice(0, 6).map((book: any, idx: number) => (
              <div key={idx} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold">{book.title}</h4>
                    <p className="text-sm text-gray-600">{book.author}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">{book.issue_count}</div>
                    <p className="text-xs text-gray-600">issues</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
