import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { BookOpen, Search, Filter, Calendar, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import { apiService } from '@/app/services/apiService';

export default function LibraryPage() {
  const [books, setBooks] = useState<any[]>([]);
  const [myIssues, setMyIssues] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBook, setSelectedBook] = useState<any>(null);

  useEffect(() => {
    fetchBooks();
    fetchMyIssues();
  }, []);

  const fetchBooks = async () => {
    try {
      const data = await apiService.getLibraryBooks({ search: searchTerm });
      setBooks(data);
    } catch (err) { console.error(err); }
  };

  const fetchMyIssues = async () => {
    try {
      const data = await apiService.getMyLibraryIssues();
      setMyIssues(data);
    } catch (err) { console.error(err); }
  };

  const issueBook = async (bookId: number) => {
    try {
      const res = await apiService.issueLibraryBook(bookId);
      if (res.error) throw new Error(res.error);
      fetchBooks();
      fetchMyIssues();
    } catch (err: any) {
      alert(err.message || 'Failed to issue book');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Library</h1>
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search books..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && fetchBooks()} className="pl-10" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { title: 'Total Books', value: books.length, color: 'from-blue-500 to-blue-600' },
          { title: 'Available', value: books.filter(b => b.available_copies > 0).length, color: 'from-green-500 to-green-600' },
          { title: 'My Issues', value: myIssues.filter(i => i.status === 'issued').length, color: 'from-yellow-500 to-yellow-600' },
          { title: 'Overdue', value: myIssues.filter(i => i.status === 'issued' && new Date(i.due_date) < new Date()).length, color: 'from-red-500 to-red-600' }
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className={`bg-gradient-to-r ${stat.color} p-6 text-white`}>
                  <p className="text-white/80 text-sm">{stat.title}</p>
                  <p className="text-3xl font-black mt-1">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {books.map(book => (
          <Card key={book.id} className="hover:shadow-lg transition">
            <CardHeader>
              <CardTitle className="text-lg">{book.title}</CardTitle>
              <p className="text-sm text-gray-600">{book.author}</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">ISBN:</span>
                <span className="font-semibold">{book.isbn}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Available:</span>
                <Badge className={book.available_copies > 0 ? 'bg-green-500' : 'bg-red-500'}>{book.available_copies}/{book.total_copies}</Badge>
              </div>
              <Button onClick={() => issueBook(book.id)} disabled={book.available_copies === 0} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600">
                {book.available_copies > 0 ? 'Issue Book' : 'Not Available'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My Issued Books</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {myIssues.map(issue => (
              <div key={issue.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-semibold">{issue.title}</p>
                  <p className="text-sm text-gray-600">{issue.author}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Due Date</p>
                    <p className="text-sm font-semibold">{new Date(issue.due_date).toLocaleDateString()}</p>
                  </div>
                  <Badge className={issue.status === 'returned' ? 'bg-green-500' : new Date(issue.due_date) < new Date() ? 'bg-red-500' : 'bg-yellow-500'}>
                    {issue.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
