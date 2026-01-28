import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Home, Bed, Users, DollarSign } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { apiService } from '@/app/services/apiService';

export default function HostelPage() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [reason, setReason] = useState('');

  useEffect(() => {
    fetchRooms();
    fetchApplications();
  }, []);

  const fetchRooms = async () => {
    try {
      const data = await apiService.getHostelRooms();
      setRooms(data);
    } catch (err) { console.error(err); }
  };

  const fetchApplications = async () => {
    try {
      const data = await apiService.getMyHostelApplications();
      setApplications(data);
    } catch (err) { console.error(err); }
  };

  const applyHostel = async () => {
    try {
      const res = await apiService.applyForHostel(selectedRoom.id, reason);
      if (res.error) throw new Error(res.error);
      fetchApplications();
      setSelectedRoom(null);
      setReason('');
    } catch (err: any) {
      alert(err.message || 'Application failed');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-black bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">Hostel Management</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {rooms.map(room => (
          <Card key={room.id} className="hover:shadow-lg transition">
            <CardHeader className="bg-gradient-to-r from-orange-500 to-red-600 text-white">
              <CardTitle className="flex items-center gap-2">
                <Home className="w-5 h-5" />
                Room {room.room_number}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Bed className="w-4 h-4 text-gray-500" />
                <span>{room.room_type}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-gray-500" />
                <span>{room.available_beds} beds available</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="w-4 h-4 text-gray-500" />
                <span className="font-bold">FRw {room.monthly_fee?.toLocaleString()}/month</span>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button onClick={() => setSelectedRoom(room)} className="w-full bg-gradient-to-r from-orange-600 to-red-600">Apply</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Apply for Hostel</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Room</Label>
                      <Input value={`Room ${selectedRoom?.room_number} - ${selectedRoom?.room_type}`} disabled />
                    </div>
                    <div>
                      <Label>Monthly Fee</Label>
                      <Input value={`FRw ${selectedRoom?.monthly_fee?.toLocaleString()}`} disabled />
                    </div>
                    <div>
                      <Label>Reason for Application</Label>
                      <Textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={4} placeholder="Why do you need hostel accommodation?" />
                    </div>
                    <Button onClick={applyHostel} className="w-full bg-gradient-to-r from-orange-600 to-red-600">Submit Application</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {applications.map(app => (
              <div key={app.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-semibold">Room {app.room_number} - {app.room_type}</p>
                  <p className="text-sm text-gray-600">Applied: {new Date(app.applied_at).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold">FRw {app.monthly_fee?.toLocaleString()}/mo</span>
                  <Badge className={app.status === 'approved' ? 'bg-green-500' : app.status === 'rejected' ? 'bg-red-500' : 'bg-yellow-500'}>{app.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
