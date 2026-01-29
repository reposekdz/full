import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, UserPlus, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import apiService from '../services/apiService';

export default function ParentStudentConnection() {
  const [trades, setTrades] = useState<any[]>([]);
  const [levels, setLevels] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrade, setSelectedTrade] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [myConnections, setMyConnections] = useState<any[]>([]);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [relationship, setRelationship] = useState('parent');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTrades();
    loadLevels();
    loadMyConnections();
  }, []);

  const loadTrades = async () => {
    try {
      const data = await apiService.getTrades();
      setTrades(data);
    } catch (error) {
      console.error('Error loading trades:', error);
    }
  };

  const loadLevels = async () => {
    try {
      const data = await apiService.getLevels();
      setLevels(data);
    } catch (error) {
      console.error('Error loading levels:', error);
    }
  };

  const loadMyConnections = async () => {
    try {
      const data = await apiService.getParentChildren();
      setMyConnections(data || []);
    } catch (error) {
      console.error('Error loading connections:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const data = await apiService.searchStudentsForConnection(
        searchQuery,
        selectedTrade ? parseInt(selectedTrade) : undefined,
        selectedLevel ? parseInt(selectedLevel) : undefined
      );
      setSearchResults(data || []);
    } catch (error: any) {
      alert(error.message || 'Byanze gushakisha');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestConnection = async () => {
    if (!selectedStudent) return;
    setLoading(true);
    try {
      await apiService.requestParentConnection(selectedStudent.id, relationship);
      alert('Icyifuzo cyoherejwe neza! Tegereza kwemezwa.');
      setShowConnectModal(false);
      setSelectedStudent(null);
      loadMyConnections();
    } catch (error: any) {
      alert(error.message || 'Byanze kohereza icyifuzo');
    } finally {
      setLoading(false);
    }
  };

  const openConnectModal = (student: any) => {
    setSelectedStudent(student);
    setShowConnectModal(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-700"><CheckCircle className="w-3 h-3 mr-1" />Byemejwe</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-700"><XCircle className="w-3 h-3 mr-1" />Byanzwe</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-700"><Clock className="w-3 h-3 mr-1" />Birategerezwa</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Card className="border-2 border-blue-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-6 h-6 text-blue-600" />
            Shakisha Umunyeshuri Wawe
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <Input
              placeholder="Andika amazina cyangwa kode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Select value={selectedTrade} onValueChange={setSelectedTrade}>
              <SelectTrigger>
                <SelectValue placeholder="Umwuga (Hitamo)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Umwuga wose</SelectItem>
                {trades.map(trade => (
                  <SelectItem key={trade.id} value={trade.id.toString()}>
                    {trade.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger>
                <SelectValue placeholder="Urwego (Hitamo)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Urwego rwose</SelectItem>
                {levels.map(level => (
                  <SelectItem key={level.id} value={level.id.toString()}>
                    Urwego {level.level_number}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleSearch} disabled={loading} className="w-full bg-blue-600">
            <Search className="w-4 h-4 mr-2" />
            {loading ? 'Birashakishwa...' : 'Shakisha'}
          </Button>

          {searchResults.length > 0 && (
            <div className="mt-4 space-y-2">
              <h3 className="font-semibold">Ibisubizo ({searchResults.length})</h3>
              {searchResults.map((student, idx) => (
                <motion.div
                  key={student.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-semibold">{student.first_name} {student.last_name}</p>
                    <p className="text-sm text-gray-600">Kode: {student.student_id}</p>
                    <p className="text-xs text-gray-500">
                      {student.trade_name} - Urwego {student.level_number}
                    </p>
                  </div>
                  <Button size="sm" onClick={() => openConnectModal(student)} className="bg-green-600">
                    <UserPlus className="w-3 h-3 mr-1" />
                    Huza
                  </Button>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-2 border-green-100">
        <CardHeader>
          <CardTitle>Abana Banjye / Ibyifuzo</CardTitle>
        </CardHeader>
        <CardContent>
          {myConnections.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Nta bana bahuye</p>
          ) : (
            <div className="space-y-3">
              {myConnections.map((conn, idx) => (
                <motion.div
                  key={conn.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-semibold">{conn.first_name} {conn.last_name}</p>
                    <p className="text-sm text-gray-600">Kode: {conn.student_id}</p>
                    <p className="text-xs text-gray-500">
                      {conn.trade_name} - Urwego {conn.level_number}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Yoherejwe: {new Date(conn.requested_at).toLocaleDateString()}
                    </p>
                  </div>
                  {getStatusBadge(conn.status)}
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showConnectModal} onOpenChange={setShowConnectModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Saba Guhuza n'Umunyeshuri</DialogTitle>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-4">
              <Card>
                <CardContent className="pt-4">
                  <p className="font-semibold text-lg">{selectedStudent.first_name} {selectedStudent.last_name}</p>
                  <p className="text-sm text-gray-600">Kode: {selectedStudent.student_id}</p>
                  <p className="text-sm text-gray-500">
                    {selectedStudent.trade_name} - Urwego {selectedStudent.level_number}
                  </p>
                </CardContent>
              </Card>

              <div>
                <Label>Isano</Label>
                <Select value={relationship} onValueChange={setRelationship}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="parent">Umubyeyi</SelectItem>
                    <SelectItem value="guardian">Umurerezi</SelectItem>
                    <SelectItem value="relative">Umuryango</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleRequestConnection} disabled={loading} className="flex-1 bg-green-600">
                  <UserPlus className="w-4 h-4 mr-2" />
                  {loading ? 'Birimo koherezwa...' : 'Ohereza Icyifuzo'}
                </Button>
                <Button onClick={() => setShowConnectModal(false)} variant="outline">
                  Bika
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
