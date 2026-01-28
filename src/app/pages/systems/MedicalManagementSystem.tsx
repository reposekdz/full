import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Activity, Search, Filter, Plus, Edit, Trash2, Eye, Download, RefreshCw,
  Clock, Calendar, User, CheckCircle, XCircle, AlertCircle,
  TrendingUp, Users, Heart, Zap, Bell, FileText, Clipboard,
  Stethoscope, Pill, Thermometer, ShieldAlert
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
import { Checkbox } from '@/app/components/ui/checkbox';
import { apiService } from '@/app/services/apiService';
import { toast } from 'sonner';

interface MedicalRecord {
  id: number;
  student_id: number;
  student_first_name?: string;
  student_last_name?: string;
  record_type: 'visit' | 'allergy' | 'condition' | 'medication' | 'immunization';
  description: string;
  treatment: string;
  prescribed_by: string;
  visit_date: string;
  parent_notified: boolean;
}

const MedicalManagementSystem: React.FC = () => {
  const [activeTab, setActiveTab] = useState('records');
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [showRecordDialog, setShowRecordDialog] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const [recordForm, setRecordForm] = useState({
    student_id: '',
    record_type: 'visit',
    description: '',
    treatment: '',
    prescribed_by: '',
    visit_date: new Date().toISOString().split('T')[0],
    parent_notified: true
  });

  useEffect(() => {
    fetchAllData();
    fetchStudents();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [recordsRes, analyticsRes] = await Promise.all([
        apiService.getMedicalRecords(),
        apiService.getMedicalAnalytics()
      ]);

      if (recordsRes.success) setRecords(recordsRes.records || []);
      if (analyticsRes.success) setAnalytics(analyticsRes.analytics);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const data = await apiService.getStudents({ limit: 1000 });
      if (data.success) setStudents(data.users || []);
    } catch (error) {
      console.error('Fetch students error:', error);
    }
  };

  const handleSaveRecord = async () => {
    try {
      if (!recordForm.student_id) {
        toast.error('Please select a student');
        return;
      }

      let response;
      if (selectedRecord) {
        response = await apiService.updateMedicalRecord(selectedRecord.id, {
          ...recordForm,
          student_id: parseInt(recordForm.student_id)
        });
      } else {
        response = await apiService.createMedicalRecord({
          ...recordForm,
          student_id: parseInt(recordForm.student_id)
        });
      }

      if (response.success) {
        setShowRecordDialog(false);
        resetForm();
        fetchAllData();
        if (recordForm.parent_notified) {
          toast.success('Record saved and parent notified via WhatsApp/SMS!');
        } else {
          toast.success('Record saved successfully!');
        }
      } else {
        toast.error(response.message || 'Failed to save record');
      }
    } catch (error) {
      console.error('Save record error:', error);
      toast.error('Failed to save record');
    }
  };

  const resetForm = () => {
    setRecordForm({
      student_id: '',
      record_type: 'visit',
      description: '',
      treatment: '',
      prescribed_by: '',
      visit_date: new Date().toISOString().split('T')[0],
      parent_notified: true
    });
    setSelectedRecord(null);
  };

  const handleEditRecord = (record: MedicalRecord) => {
    setSelectedRecord(record);
    setRecordForm({
      student_id: record.student_id.toString(),
      record_type: record.record_type,
      description: record.description,
      treatment: record.treatment,
      prescribed_by: record.prescribed_by,
      visit_date: record.visit_date.split('T')[0],
      parent_notified: record.parent_notified
    });
    setShowRecordDialog(true);
  };

  const filteredRecords = records.filter(record => {
    const fullName = `${record.student_first_name} ${record.student_last_name}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || 
                         record.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || record.record_type === filterType;
    return matchesSearch && matchesType;
  });

  const getRecordTypeBadge = (type: string) => {
    switch (type) {
      case 'visit': return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Sickbay Visit</Badge>;
      case 'allergy': return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Allergy</Badge>;
      case 'condition': return <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">Chronic Condition</Badge>;
      case 'medication': return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Medication</Badge>;
      default: return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">{type}</Badge>;
    }
  };

  if (loading && !records.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-16 h-16 text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-xl text-blue-400">Loading Medical System...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto space-y-6"
      >
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Medical Management System
            </h1>
            <p className="text-gray-400 mt-2">Student health tracking and parent notification portal</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={fetchAllData} variant="outline" className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={() => { resetForm(); setShowRecordDialog(true); }} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              New Medical Record
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gray-800/50 border-blue-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Records</p>
                  <h3 className="text-2xl font-bold text-blue-400 mt-1">{analytics?.total_records || 0}</h3>
                </div>
                <Clipboard className="w-10 h-10 text-blue-400 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-red-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Common Issues</p>
                  <h3 className="text-2xl font-bold text-red-400 mt-1">
                    {analytics?.common_conditions?.[0]?.record_type || 'None'}
                  </h3>
                </div>
                <ShieldAlert className="w-10 h-10 text-red-400 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-green-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Notifications Sent</p>
                  <h3 className="text-2xl font-bold text-green-400 mt-1">
                    {analytics?.parent_notification?.find((n: any) => n.parent_notified === 1)?.count || 0}
                  </h3>
                </div>
                <Bell className="w-10 h-10 text-green-400 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-purple-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Monthly Visits</p>
                  <h3 className="text-2xl font-bold text-purple-400 mt-1">
                    {analytics?.monthly_trends?.[0]?.count || 0}
                  </h3>
                </div>
                <TrendingUp className="w-10 h-10 text-purple-400 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-gray-800/50 border border-blue-500/20">
            <TabsTrigger value="records" className="data-[state=active]:bg-blue-600">
              <Activity className="w-4 h-4 mr-2" />
              Medical Records
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-blue-600">
              <TrendingUp className="w-4 h-4 mr-2" />
              Health Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="records" className="space-y-4 mt-6">
            <div className="flex gap-4 mb-6">
              <div className="flex-1">
                <Input
                  placeholder="Search students or descriptions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-gray-800 border-blue-500/30 text-white"
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-48 bg-gray-800 border-blue-500/30 text-white">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="visit">Visits</SelectItem>
                  <SelectItem value="allergy">Allergies</SelectItem>
                  <SelectItem value="condition">Conditions</SelectItem>
                  <SelectItem value="medication">Medication</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {filteredRecords.map((record) => (
                <Card key={record.id} className="bg-gray-800/40 border-gray-700 hover:border-blue-500/50 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                          <User className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white">
                            {record.student_first_name} {record.student_last_name}
                          </h3>
                          <div className="flex gap-2 mt-1">
                            {getRecordTypeBadge(record.record_type)}
                            <Badge variant="outline" className="border-gray-600 text-gray-400">
                              {new Date(record.visit_date).toLocaleDateString()}
                            </Badge>
                          </div>
                          <p className="text-gray-300 mt-3 font-medium">Description:</p>
                          <p className="text-gray-400 text-sm">{record.description}</p>
                          <p className="text-gray-300 mt-2 font-medium">Treatment:</p>
                          <p className="text-gray-400 text-sm">{record.treatment}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-3">
                        {record.parent_notified ? (
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Parent Notified
                          </Badge>
                        ) : (
                          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                            <XCircle className="w-3 h-3 mr-1" />
                            Not Notified
                          </Badge>
                        )}
                        <div className="flex gap-2 mt-4">
                          <Button size="sm" variant="outline" className="border-blue-500/30 text-blue-400" onClick={() => handleEditRecord(record)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="border-red-500/30 text-red-400">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
             <Card className="bg-gray-800/50 border-blue-500/20">
               <CardHeader>
                 <CardTitle className="text-white">Health Trends</CardTitle>
                 <CardDescription>Visual representation of student health data</CardDescription>
               </CardHeader>
               <CardContent>
                 <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-700 rounded-lg">
                    <p className="text-gray-500 italic">Health analytics charts will be rendered here</p>
                 </div>
               </CardContent>
             </Card>
          </TabsContent>
        </Tabs>

        {/* Record Dialog */}
        <Dialog open={showRecordDialog} onOpenChange={setShowRecordDialog}>
          <DialogContent className="bg-gray-900 border-blue-500/30 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedRecord ? 'Edit Medical Record' : 'New Medical Record'}</DialogTitle>
              <DialogDescription className="text-gray-400">
                Enter details of the student's visit or medical condition.
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label>Student</Label>
                <Select 
                  value={recordForm.student_id} 
                  onValueChange={(val) => setRecordForm({...recordForm, student_id: val})}
                >
                  <SelectTrigger className="bg-gray-800 border-blue-500/30">
                    <SelectValue placeholder="Select Student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map(s => (
                      <SelectItem key={s.id} value={s.id.toString()}>{s.first_name} {s.last_name} ({s.student_code || s.id})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Record Type</Label>
                <Select 
                  value={recordForm.record_type} 
                  onValueChange={(val: any) => setRecordForm({...recordForm, record_type: val})}
                >
                  <SelectTrigger className="bg-gray-800 border-blue-500/30">
                    <SelectValue placeholder="Record Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="visit">Sickbay Visit</SelectItem>
                    <SelectItem value="allergy">Allergy</SelectItem>
                    <SelectItem value="condition">Chronic Condition</SelectItem>
                    <SelectItem value="medication">Medication</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Description / Symptoms</Label>
                <Textarea 
                  value={recordForm.description}
                  onChange={(e) => setRecordForm({...recordForm, description: e.target.value})}
                  className="bg-gray-800 border-blue-500/30"
                  placeholder="E.g., High fever, persistent cough, etc."
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Treatment / Action Taken</Label>
                <Textarea 
                  value={recordForm.treatment}
                  onChange={(e) => setRecordForm({...recordForm, treatment: e.target.value})}
                  className="bg-gray-800 border-blue-500/30"
                  placeholder="E.g., Administered Paracetamol, recommended bed rest."
                />
              </div>
              <div className="space-y-2">
                <Label>Prescribed / Handled By</Label>
                <Input 
                  value={recordForm.prescribed_by}
                  onChange={(e) => setRecordForm({...recordForm, prescribed_by: e.target.value})}
                  className="bg-gray-800 border-blue-500/30"
                  placeholder="Nurse or Doctor Name"
                />
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input 
                  type="date"
                  value={recordForm.visit_date}
                  onChange={(e) => setRecordForm({...recordForm, visit_date: e.target.value})}
                  className="bg-gray-800 border-blue-500/30"
                />
              </div>
              <div className="col-span-2 flex items-center space-x-2 mt-2">
                <Checkbox 
                  id="notify" 
                  checked={recordForm.parent_notified}
                  onCheckedChange={(checked) => setRecordForm({...recordForm, parent_notified: !!checked})}
                  className="border-blue-500"
                />
                <Label htmlFor="notify" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Notify Parent via WhatsApp and SMS immediately
                </Label>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRecordDialog(false)} className="border-gray-600 text-gray-400">
                Cancel
              </Button>
              <Button onClick={handleSaveRecord} className="bg-blue-600 hover:bg-blue-700">
                {selectedRecord ? 'Update Record' : 'Save & Notify'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>
    </div>
  );
};

export default MedicalManagementSystem;
