import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Bus, MapPin, Clock, Calendar, DollarSign } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { apiService } from '@/app/services/apiService';

export default function TransportPage() {
  const [routes, setRoutes] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<any>(null);
  const [bookingDate, setBookingDate] = useState('');

  useEffect(() => {
    fetchRoutes();
    fetchBookings();
  }, []);

  const fetchRoutes = async () => {
    try {
      const data = await apiService.getTransportRoutes();
      setRoutes(data);
    } catch (err) { console.error(err); }
  };

  const fetchBookings = async () => {
    try {
      const data = await apiService.getMyTransportBookings();
      setBookings(data);
    } catch (err) { console.error(err); }
  };

  const bookTransport = async () => {
    try {
      const res = await apiService.bookTransport(selectedRoute.id, bookingDate);
      if (res.error) throw new Error(res.error);
      fetchBookings();
      setSelectedRoute(null);
    } catch (err: any) {
      alert(err.message || 'Booking failed');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-black bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">Transport Services</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {routes.map(route => (
          <Card key={route.id} className="hover:shadow-lg transition">
            <CardHeader className="bg-gradient-to-r from-green-500 to-teal-600 text-white">
              <CardTitle className="flex items-center gap-2">
                <Bus className="w-5 h-5" />
                {route.route_name}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span>{route.start_point} → {route.end_point}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-gray-500" />
                <span>{route.departure_time}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="w-4 h-4 text-gray-500" />
                <span className="font-bold">FRw {route.fare?.toLocaleString()}</span>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button onClick={() => setSelectedRoute(route)} className="w-full bg-gradient-to-r from-green-600 to-teal-600">Book Now</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Book Transport</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Route</Label>
                      <Input value={selectedRoute?.route_name} disabled />
                    </div>
                    <div>
                      <Label>Booking Date</Label>
                      <Input type="date" value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} />
                    </div>
                    <div>
                      <Label>Amount</Label>
                      <Input value={`FRw ${selectedRoute?.fare?.toLocaleString()}`} disabled />
                    </div>
                    <Button onClick={bookTransport} className="w-full bg-gradient-to-r from-green-600 to-teal-600">Confirm Booking</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {bookings.map(booking => (
              <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-semibold">{booking.route_name}</p>
                  <p className="text-sm text-gray-600">{new Date(booking.booking_date).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold">FRw {booking.amount?.toLocaleString()}</span>
                  <Badge className={booking.status === 'confirmed' ? 'bg-green-500' : 'bg-yellow-500'}>{booking.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
