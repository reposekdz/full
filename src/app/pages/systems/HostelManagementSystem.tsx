import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bed, Search, Filter, Plus, Edit, Trash2, Eye, Download, RefreshCw,
  Clock, Calendar, User, CheckCircle, XCircle, AlertCircle,
  TrendingUp, Users, Award, Target, Zap, Bell, Clipboard,
  BarChart3, PieChart, Activity, Save, Home, MapPin, Shield, Info
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/app/components/ui/dialog';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Label } from '@/app/components/ui/label';
import { Progress } from '@/app/components/ui/progress';
import { toast } from 'sonner';
import { apiService } from '@/app/services/apiService';
import { useAuth } from '@/app/contexts/AuthContext';

interface Room {
  id: number;
  room_number: string;
  block_name: string;
  room_type: string;
  capacity: number;
  occupied_count: number;
  status: string;
  price_per_term: number;
}

interface Application {
  id: number;
  student_id: number;
  student_name: string;
  student_code: string;
  room_id: number;
  room_number: string;
  block_name: string;
  application_date: string;
  status: string;
  reason: string;
}

const HostelManagementSystem: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAllocateDialog, setShowAllocateDialog] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const roomsRes = await apiService.getHostelRooms();
      if (roomsRes.success) setRooms(roomsRes.rooms || []);
      
      if (user?.role === 'admin' || user?.role === 'super_admin' || user?.role === 'headmaster') {
        // In a real app, we'd have a getHostelApplications for admins
        // For now we might use getMyHostelApplications or similar if it returns all for admin
        const appsRes = await apiService.getMyHostelApplications();
        if (appsRes.success) setApplications(appsRes.applications || []);
      }
    } catch (error) {
      console.error('Fetch hostel data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAllocate = async (studentId: number, roomId: number) => {
    try {
      setSubmitting(true);
      const res = await apiService.allocateHostelRoom(studentId, roomId, {
        allocation_date: new Date().toISOString().split('T')[0],
        status: 'active'
      });
      if (res.success) {
        toast.success('Room allocated successfully and parent notified!');
        setShowAllocateDialog(false);
        fetchData();
      } else {
        toast.error(res.message || 'Failed to allocate room');
      }
    } catch (error) {
      console.error('Allocation error:', error);
      toast.error('Failed to allocate room');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckout = async (allocationId: number) => {
    try {
      setSubmitting(true);
      const res = await apiService.checkoutHostelRoom(allocationId);
      if (res.success) {
        toast.success('Student checked out successfully and parent notified!');
        fetchData();
      } else {
        toast.error(res.message || 'Failed to checkout');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to checkout');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredRooms = rooms.filter(room => 
    room.room_number.toLowerCase().includes(searchTerm.toLowerCase()) || 
    room.block_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && !rooms.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-16 h-16 text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-xl text-blue-400">Loading Hostel System...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-indigo-900 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto space-y-6"
      >
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent flex items-center gap-3">
              <Bed className="w-10 h-10 text-blue-400" />
              Hostel Management System
            </h1>
            <p className="text-gray-400 mt-2">Manage student accommodation and room allocations</p>
          </div>
          <Button onClick={fetchData} variant="outline" className="border-blue-500/30 text-blue-400">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-blue-900/50 border border-blue-500/30 p-1 mb-8">
            <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600">Overview</TabsTrigger>
            <TabsTrigger value="rooms" className="data-[state=active]:bg-blue-600">Rooms & Blocks</TabsTrigger>
            <TabsTrigger value="applications" className="data-[state=active]:bg-blue-600">Applications</TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-blue-600">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="bg-blue-800/40 border-blue-500/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-400 text-sm font-medium">Total Capacity</p>
                      <h3 className="text-2xl font-bold text-white mt-1">
                        {rooms.reduce((acc, r) => acc + r.capacity, 0)}
                      </h3>
                    </div>
                    <Users className="w-8 h-8 text-blue-500 opacity-50" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-blue-800/40 border-blue-500/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-400 text-sm font-medium">Occupied Beds</p>
                      <h3 className="text-2xl font-bold text-white mt-1">
                        {rooms.reduce((acc, r) => acc + r.occupied_count, 0)}
                      </h3>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-500 opacity-50" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-blue-800/40 border-blue-500/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-yellow-400 text-sm font-medium">Available Beds</p>
                      <h3 className="text-2xl font-bold text-white mt-1">
                        {rooms.reduce((acc, r) => acc + (r.capacity - r.occupied_count), 0)}
                      </h3>
                    </div>
                    <Bed className="w-8 h-8 text-yellow-500 opacity-50" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-blue-800/40 border-blue-500/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-400 text-sm font-medium">Occupancy Rate</p>
                      <h3 className="text-2xl font-bold text-white mt-1">
                        {Math.round((rooms.reduce((acc, r) => acc + r.occupied_count, 0) / (rooms.reduce((acc, r) => acc + r.capacity, 0) || 1)) * 100)}%
                      </h3>
                    </div>
                    <TrendingUp className="w-8 h-8 text-purple-500 opacity-50" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-blue-800/40 border-blue-500/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-400" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[1, 2, 3].map((_, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-blue-900/30">
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                          <User className="w-4 h-4 text-blue-400" />
                        </div>
                        <div>
                          <p className="text-sm text-white font-medium">Room Allocation #12{i}</p>
                          <p className="text-xs text-blue-400">Student ID: STU00{i+1} allocated to Block A-10{i}</p>
                          <p className="text-[10px] text-gray-500 mt-1">2 hours ago</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-blue-800/40 border-blue-500/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-400" />
                    Pending Applications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {applications.filter(a => a.status === 'pending').slice(0, 3).map((app) => (
                      <div key={app.id} className="flex items-center justify-between p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-400">
                            {app.student_name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm text-white font-medium">{app.student_name}</p>
                            <p className="text-xs text-yellow-400">{app.room_type || 'Standard Room'}</p>
                          </div>
                        </div>
                        <Button size="sm" variant="ghost" className="text-yellow-400 hover:text-yellow-300">
                          Review
                        </Button>
                      </div>
                    ))}
                    {applications.filter(a => a.status === 'pending').length === 0 && (
                      <div className="text-center py-6 text-gray-500 italic">No pending applications</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="rooms">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
                <Input
                  placeholder="Search rooms by number or block..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-blue-900/40 border-blue-500/30 pl-10 text-white"
                />
              </div>
              <Button className="bg-blue-600 hover:bg-blue-500">
                <Plus className="w-4 h-4 mr-2" />
                Add New Room
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredRooms.map((room) => (
                <Card key={room.id} className="bg-blue-900/30 border-blue-500/20 hover:border-blue-400/50 transition-all">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <Badge className={room.occupied_count < room.capacity ? 'bg-green-600' : 'bg-red-600'}>
                        {room.occupied_count < room.capacity ? 'Available' : 'Full'}
                      </Badge>
                      <span className="text-xs text-blue-400 font-bold">{room.block_name}</span>
                    </div>
                    <CardTitle className="text-2xl text-white mt-1">Room {room.room_number}</CardTitle>
                    <CardDescription className="text-blue-300/70">{room.room_type}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-gray-400">
                          <span>Occupancy</span>
                          <span>{room.occupied_count} / {room.capacity} beds</span>
                        </div>
                        <Progress value={(room.occupied_count / room.capacity) * 100} className="h-1.5" />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-1 text-gray-400">
                          <MapPin className="w-3 h-3" />
                          <span>{room.block_name}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-400">
                          <Shield className="w-3 h-3" />
                          <span>Floor {Math.floor(parseInt(room.room_number) / 100) || 1}</span>
                        </div>
                      </div>

                      <div className="pt-2 flex gap-2">
                        <Button 
                          className="flex-1 bg-blue-600 hover:bg-blue-500 text-xs" 
                          size="sm"
                          onClick={() => {
                            setSelectedRoom(room);
                            setShowAllocateDialog(true);
                          }}
                        >
                          Allocate
                        </Button>
                        <Button variant="outline" size="sm" className="border-blue-500/30 text-blue-400">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="applications">
            <Card className="bg-blue-900/30 border-blue-500/20">
              <CardContent className="p-0">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-blue-500/20 bg-blue-900/50">
                      <th className="p-4 text-blue-400 font-medium uppercase text-xs">Student</th>
                      <th className="p-4 text-blue-400 font-medium uppercase text-xs">Room Type</th>
                      <th className="p-4 text-blue-400 font-medium uppercase text-xs">Reason</th>
                      <th className="p-4 text-blue-400 font-medium uppercase text-xs">Date</th>
                      <th className="p-4 text-blue-400 font-medium uppercase text-xs">Status</th>
                      <th className="p-4 text-blue-400 font-medium uppercase text-xs">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-blue-500/10">
                    {applications.map((app) => (
                      <tr key={app.id} className="hover:bg-blue-500/5 transition-colors">
                        <td className="p-4">
                          <div>
                            <p className="text-white font-medium text-sm">{app.student_name}</p>
                            <p className="text-[10px] text-gray-500">{app.student_code}</p>
                          </div>
                        </td>
                        <td className="p-4 text-gray-300 text-sm">Standard Double</td>
                        <td className="p-4 text-gray-400 text-xs italic max-w-xs truncate">{app.reason}</td>
                        <td className="p-4 text-gray-400 text-sm">
                          {new Date(app.application_date).toLocaleDateString()}
                        </td>
                        <td className="p-4">
                          <Badge className={
                            app.status === 'approved' ? 'bg-green-600' :
                            app.status === 'rejected' ? 'bg-red-600' :
                            'bg-yellow-600'
                          }>
                            {app.status}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <Button size="sm" variant="ghost" className="text-blue-400 hover:text-white">
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-red-400 hover:text-white">
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {applications.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-gray-500 italic">No applications found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="analytics">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="bg-blue-800/40 border-blue-500/20">
                  <CardHeader>
                    <CardTitle className="text-white">Occupancy by Block</CardTitle>
                  </CardHeader>
                  <CardContent className="h-80 flex items-center justify-center">
                     <div className="text-blue-400 flex flex-col items-center">
                        <PieChart className="w-16 h-16 opacity-20 mb-4" />
                        <p>Occupancy distribution chart would appear here</p>
                     </div>
                  </CardContent>
                </Card>

                <Card className="bg-blue-800/40 border-blue-500/20">
                  <CardHeader>
                    <CardTitle className="text-white">Revenue Analysis (Per Term)</CardTitle>
                  </CardHeader>
                  <CardContent className="h-80 flex items-center justify-center">
                     <div className="text-blue-400 flex flex-col items-center">
                        <BarChart3 className="w-16 h-16 opacity-20 mb-4" />
                        <p>Revenue and fee collection stats would appear here</p>
                     </div>
                  </CardContent>
                </Card>
             </div>
          </TabsContent>
        </Tabs>

        {/* Allocate Room Dialog */}
        <Dialog open={showAllocateDialog} onOpenChange={setShowAllocateDialog}>
          <DialogContent className="bg-indigo-900 border-blue-500/30 text-white">
            <DialogHeader>
              <DialogTitle>Allocate Room {selectedRoom?.room_number}</DialogTitle>
              <DialogDescription className="text-blue-300">
                Enter student details to allocate a bed in {selectedRoom?.block_name}.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Student ID / Code</Label>
                <Input placeholder="e.g. STU2024001" className="bg-blue-900/50 border-blue-500/30" />
              </div>
              <div className="space-y-2">
                <Label>Allocation Term</Label>
                <Select defaultValue="term1">
                  <SelectTrigger className="bg-blue-900/50 border-blue-500/30">
                    <SelectValue placeholder="Select Term" />
                  </SelectTrigger>
                  <SelectContent className="bg-indigo-900 border-blue-500/30 text-white">
                    <SelectItem value="term1">Term 1, 2024</SelectItem>
                    <SelectItem value="term2">Term 2, 2024</SelectItem>
                    <SelectItem value="term3">Term 3, 2024</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="bg-blue-500/10 p-4 rounded-lg flex gap-3">
                <Info className="w-5 h-5 text-blue-400 shrink-0" />
                <p className="text-xs text-blue-300">
                  Allocating a room will automatically generate the hostel fee for the selected term. 
                  The parent will be notified via SMS/WhatsApp.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setShowAllocateDialog(false)} variant="ghost" className="text-gray-400 hover:text-white">
                Cancel
              </Button>
              <Button 
                onClick={() => handleAllocate(1, selectedRoom?.id || 0)} 
                disabled={submitting}
                className="bg-blue-600 hover:bg-blue-500"
              >
                {submitting ? 'Allocating...' : 'Confirm Allocation'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>
    </div>
  );
};

export default HostelManagementSystem;
