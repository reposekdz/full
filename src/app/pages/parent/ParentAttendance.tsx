import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Calendar, CheckCircle, XCircle, Clock, AlertCircle, Download, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Progress } from '@/app/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import apiService from '@/app/services/apiService';

export default function ParentAttendance() {
  const [children, setChildren] = useState<any[]>([]);
  const [selectedChild, setSelectedChild] = useState<any>(null);
  const [attendance, setAttendance] = useState<any>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChildren();
  }, []);

  useEffect(() => {
    if (selectedChild) {
      fetchAttendance();
    }
  }, [selectedChild]);

  const fetchChildren = async () => {
    try {
      setLoading(true);
      const data = await apiService.getMyChildren();
      const childrenArray = Array.isArray(data) ? data : [];
      setChildren(childrenArray);
      if (childrenArray.length > 0) setSelectedChild(childrenArray[0]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendance = async () => {
    if (!selectedChild) return;
    try {
      const data = await apiService.getChildAttendance(selectedChild.user_id);
      setAttendance(data?.summary || null);
      setAttendanceRecords(data?.records || []);
    } catch (err) {
      console.error(err);
      setAttendance(null);
      setAttendanceRecords([]);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'present': return 'bg-green-100 text-green-700 border-green-300';
      case 'absent': return 'bg-red-100 text-red-700 border-red-300';
      case 'late': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'excused': return 'bg-blue-100 text-blue-700 border-blue-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'present': return <CheckCircle className="w-4 h-4" />;
      case 'absent': return <XCircle className="w-4 h-4" />;
      case 'late': return <Clock className="w-4 h-4" />;
      case 'excused': return <AlertCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardContent className="p-12 text-center">
            <Calendar className="w-24 h-24 mx-auto text-gray-300 mb-4" />
            <h3 className="text-2xl font-bold text-gray-600 mb-2">Nta mwana uhujwe</h3>
            <p className="text-gray-500">Huza umwana mbere yo kureba kwitabira</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const attendancePercentage = attendance?.total > 0 
    ? (attendance.present / attendance.total) * 100 
    : 0;

  return (
    <div className="p-8 space-y-8 bg-gradient-to-br from-purple-50 via-white to-blue-50 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Kwitabira Amasomo
          </h1>
          <p className="text-gray-600">Kwitabira kw'umwana wawe ku masomo</p>
        </div>
        <div className="flex gap-4 items-center">
          <Select value={selectedChild?.user_id?.toString()} onValueChange={(id) => setSelectedChild(children.find(c => c.user_id.toString() === id))}>
            <SelectTrigger className="w-64 border-2 border-purple-100">
              <SelectValue placeholder="Hitamo umwana" />
            </SelectTrigger>
            <SelectContent>
              {children.map((child) => (
                <SelectItem key={child.user_id} value={child.user_id.toString()}>
                  {child.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
            <Download className="w-4 h-4 mr-2" />
            Kurura Raporo
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-5 gap-6">
        <Card className="border-2 border-green-100 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <Badge className="bg-green-100 text-green-700">Yitabye</Badge>
            </div>
            <p className="text-3xl font-black text-green-900">{attendance?.present || 0}</p>
            <p className="text-sm text-gray-600">Iminsi</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-red-100 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <XCircle className="w-8 h-8 text-red-600" />
              <Badge className="bg-red-100 text-red-700">Yibagiwe</Badge>
            </div>
            <p className="text-3xl font-black text-red-900">{attendance?.absent || 0}</p>
            <p className="text-sm text-gray-600">Iminsi</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-yellow-100 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-8 h-8 text-yellow-600" />
              <Badge className="bg-yellow-100 text-yellow-700">Yatinze</Badge>
            </div>
            <p className="text-3xl font-black text-yellow-900">{attendance?.late || 0}</p>
            <p className="text-sm text-gray-600">Iminsi</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-100 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <AlertCircle className="w-8 h-8 text-blue-600" />
              <Badge className="bg-blue-100 text-blue-700">Yahawe Uruhushya</Badge>
            </div>
            <p className="text-3xl font-black text-blue-900">{attendance?.excused || 0}</p>
            <p className="text-sm text-gray-600">Iminsi</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-100 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="w-8 h-8 text-purple-600" />
              <Badge className="bg-purple-100 text-purple-700">Yose</Badge>
            </div>
            <p className="text-3xl font-black text-purple-900">{attendance?.total || 0}</p>
            <p className="text-sm text-gray-600">Iminsi</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-2 border-purple-100 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 border-b-2 border-purple-100">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Ijanisha ry'Imikorere
              </CardTitle>
              <CardDescription>Kwitabira rusange kw'umwana wawe</CardDescription>
            </div>
            <div className="text-right">
              <p className="text-3xl font-black text-purple-900">{attendancePercentage.toFixed(1)}%</p>
              <p className="text-sm text-gray-600">Kwitabira</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <Progress value={attendancePercentage} className="h-4 mb-4" />
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-green-600">{attendance?.present || 0}</p>
              <p className="text-xs text-gray-600">Yitabye</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{attendance?.absent || 0}</p>
              <p className="text-xs text-gray-600">Yibagiwe</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-600">{attendance?.late || 0}</p>
              <p className="text-xs text-gray-600">Yatinze</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">{attendance?.excused || 0}</p>
              <p className="text-xs text-gray-600">Uruhushya</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-purple-100 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 border-b-2 border-purple-100">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Urutonde rw'Iminsi</CardTitle>
              <CardDescription>Kwitabira ku minsi yose</CardDescription>
            </div>
            <Button variant="outline" className="border-2 border-purple-200">
              <Filter className="w-4 h-4 mr-2" />
              Shyiramo Akayunguruzo
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {attendanceRecords.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">Nta makuru y'iminsi abonetse</p>
            </div>
          ) : (
            <div className="space-y-3">
              {attendanceRecords.slice(0, 30).map((record, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className="flex items-center justify-between p-4 bg-white rounded-xl border-2 border-gray-100 hover:border-purple-200 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-black text-gray-900">
                        {record.date ? new Date(record.date).getDate() : '--'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {record.date ? new Date(record.date).toLocaleDateString('en', { month: 'short' }) : '---'}
                      </p>
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{record.class_name || 'Class'}</p>
                      <p className="text-sm text-gray-500">{record.date ? new Date(record.date).toLocaleDateString() : 'N/A'}</p>
                    </div>
                  </div>
                  <Badge className={`flex items-center gap-2 border-2 ${getStatusColor(record.status)}`}>
                    {getStatusIcon(record.status)}
                    {record.status}
                  </Badge>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
