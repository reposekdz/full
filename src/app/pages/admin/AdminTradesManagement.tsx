import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Plus, Edit, Trash2, Save, X, Upload, Image as ImageIcon,
  BookOpen, Users, Award, TrendingUp, Settings, Eye
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Badge } from '@/app/components/ui/badge';
import RwandaLocationSelector from '@/app/components/RwandaLocationSelector';

const AdminTradesManagement: React.FC = () => {
  const [trades, setTrades] = useState<any[]>([]);
  const [selectedTrade, setSelectedTrade] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('trades');

  // Form states
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    name_rw: '',
    description: '',
    description_rw: '',
    duration_years: 2,
    image_url: ''
  });

  const [courseForm, setCourseForm] = useState({
    code: '',
    name: '',
    name_rw: '',
    credits: 0
  });

  const [instructorForm, setInstructorForm] = useState({
    name: '',
    role: '',
    experience: '',
    specialization: '',
    email: ''
  });

  useEffect(() => {
    loadTrades();
  }, []);

  const loadTrades = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/trades/all');
      const data = await response.json();
      if (data.success) {
        setTrades(data.trades);
      }
    } catch (error) {
      console.error('Error loading trades:', error);
    }
  };

  const handleCreateTrade = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/trades/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (data.success) {
        loadTrades();
        setShowAddDialog(false);
        resetForm();
      }
    } catch (error) {
      console.error('Error creating trade:', error);
    }
  };

  const handleUpdateTrade = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/trades/${selectedTrade.code}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (data.success) {
        loadTrades();
        setEditMode(false);
      }
    } catch (error) {
      console.error('Error updating trade:', error);
    }
  };

  const handleAddCourse = async () => {
    if (!selectedTrade) return;
    try {
      const response = await fetch(`http://localhost:5000/api/trades/${selectedTrade.code}/courses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(courseForm)
      });
      const data = await response.json();
      if (data.success) {
        loadTrades();
        setCourseForm({ code: '', name: '', name_rw: '', credits: 0 });
      }
    } catch (error) {
      console.error('Error adding course:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      name_rw: '',
      description: '',
      description_rw: '',
      duration_years: 2,
      image_url: ''
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Gucunga Imyuga</h1>
            <p className="text-gray-600">Ongeraho, hindura cyangwa siba imyuga n'amasomo</p>
          </div>
          <Button 
            onClick={() => setShowAddDialog(true)}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:opacity-90"
          >
            <Plus className="w-5 h-5 mr-2" />
            Ongeraho Umwuga
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="trades">Imyuga ({trades.length})</TabsTrigger>
            <TabsTrigger value="courses">Amasomo</TabsTrigger>
            <TabsTrigger value="instructors">Abarimu</TabsTrigger>
          </TabsList>

          {/* Trades Tab */}
          <TabsContent value="trades">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trades.map((trade) => (
                <motion.div
                  key={trade.id}
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-gray-100"
                >
                  <div className="h-40 bg-gradient-to-r from-green-400 to-blue-500 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <h3 className="text-3xl font-bold text-white">{trade.code}</h3>
                    </div>
                  </div>
                  <div className="p-6">
                    <h4 className="text-xl font-bold mb-2">{trade.name}</h4>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{trade.description}</p>
                    <div className="flex items-center gap-2 mb-4">
                      <Badge variant="secondary">{trade.duration_years} Imyaka</Badge>
                      <Badge variant="outline">{trade.course_count || 0} Amasomo</Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setSelectedTrade(trade);
                          setFormData({
                            code: trade.code,
                            name: trade.name,
                            name_rw: trade.name_rw || '',
                            description: trade.description || '',
                            description_rw: trade.description_rw || '',
                            duration_years: trade.duration_years,
                            image_url: trade.image_url || ''
                          });
                          setEditMode(true);
                        }}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Hindura
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setSelectedTrade(trade)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Reba
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Courses Tab */}
          <TabsContent value="courses">
            <Card>
              <CardHeader>
                <CardTitle>Gucunga Amasomo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Hitamo Umwuga</label>
                    <select 
                      className="w-full p-2 border rounded-lg"
                      onChange={(e) => {
                        const trade = trades.find(t => t.code === e.target.value);
                        setSelectedTrade(trade);
                      }}
                    >
                      <option value="">Hitamo...</option>
                      {trades.map(trade => (
                        <option key={trade.code} value={trade.code}>{trade.name}</option>
                      ))}
                    </select>
                  </div>

                  {selectedTrade && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          placeholder="Kode y'Isomo"
                          value={courseForm.code}
                          onChange={(e) => setCourseForm({...courseForm, code: e.target.value})}
                        />
                        <Input
                          placeholder="Amanota"
                          type="number"
                          value={courseForm.credits}
                          onChange={(e) => setCourseForm({...courseForm, credits: parseInt(e.target.value)})}
                        />
                      </div>
                      <Input
                        placeholder="Izina ry'Isomo (English)"
                        value={courseForm.name}
                        onChange={(e) => setCourseForm({...courseForm, name: e.target.value})}
                      />
                      <Input
                        placeholder="Izina ry'Isomo (Kinyarwanda)"
                        value={courseForm.name_rw}
                        onChange={(e) => setCourseForm({...courseForm, name_rw: e.target.value})}
                      />
                      <Button onClick={handleAddCourse} className="w-full">
                        <Plus className="w-4 h-4 mr-2" />
                        Ongeraho Isomo
                      </Button>

                      <div className="mt-6">
                        <h4 className="font-semibold mb-4">Amasomo ({selectedTrade.courses?.length || 0})</h4>
                        <div className="space-y-2">
                          {selectedTrade.courses?.map((course: any, index: number) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div>
                                <p className="font-medium">{course.name}</p>
                                <p className="text-sm text-gray-600">{course.code}</p>
                              </div>
                              <Badge>{course.credits} Credits</Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Instructors Tab */}
          <TabsContent value="instructors">
            <Card>
              <CardHeader>
                <CardTitle>Gucunga Abarimu</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Input
                    placeholder="Amazina"
                    value={instructorForm.name}
                    onChange={(e) => setInstructorForm({...instructorForm, name: e.target.value})}
                  />
                  <Input
                    placeholder="Umwanya"
                    value={instructorForm.role}
                    onChange={(e) => setInstructorForm({...instructorForm, role: e.target.value})}
                  />
                  <Input
                    placeholder="Uburambe"
                    value={instructorForm.experience}
                    onChange={(e) => setInstructorForm({...instructorForm, experience: e.target.value})}
                  />
                  <Input
                    placeholder="Ubuhanga"
                    value={instructorForm.specialization}
                    onChange={(e) => setInstructorForm({...instructorForm, specialization: e.target.value})}
                  />
                  <Input
                    placeholder="Email"
                    type="email"
                    value={instructorForm.email}
                    onChange={(e) => setInstructorForm({...instructorForm, email: e.target.value})}
                  />
                  <Button className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Ongeraho Umwarimu
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Add/Edit Trade Dialog */}
        <Dialog open={showAddDialog || editMode} onOpenChange={(open) => {
          if (!open) {
            setShowAddDialog(false);
            setEditMode(false);
            resetForm();
          }
        }}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editMode ? 'Hindura Umwuga' : 'Ongeraho Umwuga'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Kode (ex: L3SOD)"
                value={formData.code}
                onChange={(e) => setFormData({...formData, code: e.target.value})}
                disabled={editMode}
              />
              <Input
                placeholder="Izina (English)"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
              <Input
                placeholder="Izina (Kinyarwanda)"
                value={formData.name_rw}
                onChange={(e) => setFormData({...formData, name_rw: e.target.value})}
              />
              <Textarea
                placeholder="Ibisobanuro (English)"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={3}
              />
              <Textarea
                placeholder="Ibisobanuro (Kinyarwanda)"
                value={formData.description_rw}
                onChange={(e) => setFormData({...formData, description_rw: e.target.value})}
                rows={3}
              />
              <Input
                placeholder="Igihe (Imyaka)"
                type="number"
                value={formData.duration_years}
                onChange={(e) => setFormData({...formData, duration_years: parseInt(e.target.value)})}
              />
              <Input
                placeholder="URL y'Ishusho"
                value={formData.image_url}
                onChange={(e) => setFormData({...formData, image_url: e.target.value})}
              />
              <div>
                <Label className="text-lg font-semibold text-green-700">Aho Umwuga Utekenera (Rwanda)</Label>
                <RwandaLocationSelector
                  onLocationChange={(location) => setFormData({...formData, ...location})}
                  required={true}
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={editMode ? handleUpdateTrade : handleCreateTrade}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {editMode ? 'Bika Impinduka' : 'Ongeraho'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowAddDialog(false);
                    setEditMode(false);
                    resetForm();
                  }}
                >
                  <X className="w-4 h-4 mr-2" />
                  Hagarika
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminTradesManagement;
