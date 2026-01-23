import React, { useState } from 'react';
import { Search, Filter, Users, BookOpen, FileText, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Badge } from '@/app/components/ui/badge';

const SearchPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('all');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/admin/search?q=${searchTerm}&type=${searchType}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setResults(data.results || []);
    } catch (error) {
      console.error('Search error:', error);
    }
    setLoading(false);
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <Search className="w-10 h-10 text-blue-600" />
        <div>
          <h1 className="text-3xl font-black">Shakisha / Search</h1>
          <p className="text-gray-600">Shakisha abakoresha, amasomo, raporo / Search users, courses, reports</p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <Input
              placeholder="Andika icyo ushaka / Enter search term..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1"
            />
            <Select value={searchType} onValueChange={setSearchType}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Byose / All</SelectItem>
                <SelectItem value="users">Abakoresha / Users</SelectItem>
                <SelectItem value="students">Abanyeshuri / Students</SelectItem>
                <SelectItem value="teachers">Abarimu / Teachers</SelectItem>
                <SelectItem value="courses">Amasomo / Courses</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSearch} disabled={loading}>
              <Search className="w-4 h-4 mr-2" />
              {loading ? 'Shakisha...' : 'Shakisha / Search'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Ibisubizo / Results ({results.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ubwoko / Type</TableHead>
                  <TableHead>Izina / Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Uruhare / Role</TableHead>
                  <TableHead>Igihe / Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((result, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      <Badge>{result.type}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{result.name}</TableCell>
                    <TableCell>{result.email}</TableCell>
                    <TableCell>{result.role}</TableCell>
                    <TableCell>{new Date(result.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SearchPage;
