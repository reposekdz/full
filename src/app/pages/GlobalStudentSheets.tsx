import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { FileText, Search, Download, Filter, Users, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { GLOBAL_TRADES, GLOBAL_LEVELS, getLevelsForTrade } from '@/app/constants/tradesAndLevels';
import apiService from '@/app/services/apiService';

export default function GlobalStudentSheets() {
  const [selectedTrade, setSelectedTrade] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const availableLevels = selectedTrade ? getLevelsForTrade(selectedTrade) : GLOBAL_LEVELS;

  useEffect(() => {
    if (selectedTrade && selectedLevel) {
      fetchStudents();
    }
  }, [selectedTrade, selectedLevel]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await apiService.getAccountantStudentsFinancial({
        trade: selectedTrade,
        level: selectedLevel
      });
      setStudents(response.students || []);
    } catch (error) {
      console.error('Failed to fetch students:', error);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(s =>
    `${s.first_name} ${s.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.student_code?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const exportToCSV = () => {
    const headers = ['Student Code', 'First Name', 'Last Name', 'Trade', 'Level', 'Status'];
    const rows = filteredStudents.map(s => [
      s.student_code || s.student_id,
      s.first_name,
      s.last_name,
      s.trade || selectedTrade,
      s.level || selectedLevel,
      s.status || 'active'
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedTrade}_${selectedLevel}_students.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-5xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Imbonerahamwe Rusange y'Abanyeshuri
            </h1>
            <p className="text-gray-600 mt-2">Global Student Sheets - All Trades & Levels</p>
          </div>
          {selectedTrade && selectedLevel && (
            <Button onClick={exportToCSV} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          )}
        </div>

        <Card className="border-2 border-blue-100 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-6 h-6 text-blue-600" />
              Hitamo Umwuga n'Urwego - Select Trade & Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Umwuga / Trade</label>
                <Select value={selectedTrade} onValueChange={(v) => { setSelectedTrade(v); setSelectedLevel(''); }}>
                  <SelectTrigger className="border-2">
                    <SelectValue placeholder="Hitamo umwuga..." />
                  </SelectTrigger>
                  <SelectContent>
                    {GLOBAL_TRADES.map(trade => (
                      <SelectItem key={trade.code} value={trade.code}>
                        {trade.code} - {trade.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Urwego / Level</label>
                <Select value={selectedLevel} onValueChange={setSelectedLevel} disabled={!selectedTrade}>
                  <SelectTrigger className="border-2">
                    <SelectValue placeholder="Hitamo urwego..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableLevels.map(level => (
                      <SelectItem key={level.id} value={level.display}>
                        {level.display}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {selectedTrade && selectedLevel && (
          <Tabs defaultValue="all" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-white border-2 border-blue-200 p-1">
              <TabsTrigger value="all">Abanyeshuri Bose ({filteredStudents.length})</TabsTrigger>
              <TabsTrigger value="active">Bakora ({filteredStudents.filter(s => s.status === 'active').length})</TabsTrigger>
              <TabsTrigger value="inactive">Ntibakora ({filteredStudents.filter(s => s.status !== 'active').length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <Card className="border-2 border-blue-100 shadow-xl">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="w-6 h-6 text-blue-600" />
                      {selectedTrade} - {selectedLevel} Student Sheet
                    </CardTitle>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="Shakisha..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 border-2 w-64"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex justify-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                  ) : filteredStudents.length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-600">Nta banyeshuri babonetse / No students found</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b-2 bg-gradient-to-r from-blue-50 to-indigo-50">
                            <th className="text-left py-3 px-4 font-bold">#</th>
                            <th className="text-left py-3 px-4 font-bold">Student Code</th>
                            <th className="text-left py-3 px-4 font-bold">Amazina / Names</th>
                            <th className="text-left py-3 px-4 font-bold">Email</th>
                            <th className="text-left py-3 px-4 font-bold">Phone</th>
                            <th className="text-center py-3 px-4 font-bold">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredStudents.map((student, index) => (
                            <motion.tr
                              key={student.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.02 }}
                              className="border-b hover:bg-blue-50"
                            >
                              <td className="py-3 px-4 text-gray-600">{index + 1}</td>
                              <td className="py-3 px-4 font-mono font-semibold">
                                {student.student_code || student.student_id}
                              </td>
                              <td className="py-3 px-4">
                                <p className="font-semibold">{student.first_name} {student.last_name}</p>
                              </td>
                              <td className="py-3 px-4 text-sm text-gray-600">{student.email || 'N/A'}</td>
                              <td className="py-3 px-4 text-sm text-gray-600">{student.phone || 'N/A'}</td>
                              <td className="py-3 px-4 text-center">
                                <Badge className={student.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                                  {student.status === 'active' ? 'Active' : 'Inactive'}
                                </Badge>
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="active">
              <Card className="border-2 border-green-100 shadow-xl">
                <CardHeader>
                  <CardTitle>Active Students</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    {filteredStudents.filter(s => s.status === 'active').length} active students in {selectedTrade} {selectedLevel}
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="inactive">
              <Card className="border-2 border-gray-100 shadow-xl">
                <CardHeader>
                  <CardTitle>Inactive Students</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    {filteredStudents.filter(s => s.status !== 'active').length} inactive students in {selectedTrade} {selectedLevel}
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {!selectedTrade && !selectedLevel && (
          <Card className="border-2 border-blue-100 shadow-xl">
            <CardContent className="p-12 text-center">
              <FileText className="w-24 h-24 mx-auto text-blue-300 mb-4" />
              <h3 className="text-2xl font-bold text-gray-700 mb-2">
                Hitamo Umwuga n'Urwego
              </h3>
              <p className="text-gray-600">
                Select a trade and level to view the student sheet
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
