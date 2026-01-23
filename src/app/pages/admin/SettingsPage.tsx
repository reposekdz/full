import React, { useState, useEffect } from 'react';
import { Settings, Save, School, Mail, Phone, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Switch } from '@/app/components/ui/switch';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import { Separator } from '@/app/components/ui/separator';
import AdminGalleryUpload from '@/app/components/AdminGalleryUpload';

const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState({ school_name: '', email: '', phone: '', address: '', academic_year: '' });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/admin/settings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setSettings(data.settings);
    } catch (error) {
      console.error('Fetch error:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/admin/settings', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      const data = await res.json();
      setMessage({ type: data.success ? 'success' : 'error', text: data.message });
    } catch (error) {
      setMessage({ type: 'error', text: 'Update failed' });
    }
    setLoading(false);
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <Settings className="w-10 h-10 text-blue-600" />
        <div>
          <h1 className="text-3xl font-black">Igenamiterere / Settings</h1>
          <p className="text-gray-600">Gucunga igenamiterere rya sisitemu / Manage system configuration</p>
        </div>
      </div>

      {message && (
        <Alert className={message.type === 'success' ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Amakuru y'Ishuri / School Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Izina ry'Ishuri / School Name</Label>
            <Input value={settings.school_name} onChange={(e) => setSettings({ ...settings, school_name: e.target.value })} />
          </div>
          <div>
            <Label>Email</Label>
            <Input value={settings.email} onChange={(e) => setSettings({ ...settings, email: e.target.value })} />
          </div>
          <div>
            <Label>Telefone / Phone</Label>
            <Input value={settings.phone} onChange={(e) => setSettings({ ...settings, phone: e.target.value })} />
          </div>
          <div>
            <Label>Aderesi / Address</Label>
            <Input value={settings.address} onChange={(e) => setSettings({ ...settings, address: e.target.value })} />
          </div>
          <div>
            <Label>Umwaka w'Amashuri / Academic Year</Label>
            <Input value={settings.academic_year} onChange={(e) => setSettings({ ...settings, academic_year: e.target.value })} />
          </div>
          <Button onClick={handleSave} disabled={loading} className="w-full">
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Bika...' : 'Bika Impinduka / Save Changes'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Igenamiterere rya Sisitemu / System Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Email Notifications</p>
              <p className="text-sm text-gray-500">Ohereza amamenyo kuri email</p>
            </div>
            <Switch />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Auto Backup</p>
              <p className="text-sm text-gray-500">Backup ya buri munsi</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Maintenance Mode</p>
              <p className="text-sm text-gray-500">Hagarika sisitemu</p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      <AdminGalleryUpload />
    </div>
  );
};

export default SettingsPage;
