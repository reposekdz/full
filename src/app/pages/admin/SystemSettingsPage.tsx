import React, { useState } from 'react';
import { Settings, Save, RefreshCw, Shield, Database, Mail, Bell, Lock, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Switch } from '@/app/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';

const SystemSettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    schoolName: 'G.S Kigali',
    schoolNameRw: 'GS Kigali',
    academicYear: '2025-2026',
    timezone: 'Africa/Kigali',
    language: 'en',
    emailNotifications: true,
    smsNotifications: true,
    maintenanceMode: false,
    registrationOpen: true,
    maxStudentsPerClass: 40,
  });

  const handleSave = () => {
    alert('Settings saved successfully!');
  };

  return (
    <div className="p-6 bg-gradient-to-br from-slate-50 via-white to-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">System Settings</h1>
          <p className="text-gray-600">Configure system-wide settings and preferences</p>
        </div>
        <Button onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" />
          Save Settings
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start border-b rounded-none bg-transparent h-12 px-4">
          <TabsTrigger value="general" className="data-[state=active]:bg-blue-100">
            <Globe className="w-4 h-4 mr-2" /> General
          </TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-green-100">
            <Shield className="w-4 h-4 mr-2" /> Security
          </TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-yellow-100">
            <Bell className="w-4 h-4 mr-2" /> Notifications
          </TabsTrigger>
          <TabsTrigger value="database" className="data-[state=active]:bg-purple-100">
            <Database className="w-4 h-4 mr-2" /> Database
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="m-0 mt-4">
          {activeTab === 'general' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>School Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">School Name (English)</label>
                    <Input value={settings.schoolName} onChange={(e) => setSettings({...settings, schoolName: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">School Name (Kinyarwanda)</label>
                    <Input value={settings.schoolNameRw} onChange={(e) => setSettings({...settings, schoolNameRw: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Academic Year</label>
                    <Input value={settings.academicYear} onChange={(e) => setSettings({...settings, academicYear: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Timezone</label>
                    <select className="w-full p-2 border rounded" value={settings.timezone} onChange={(e) => setSettings({...settings, timezone: e.target.value})}>
                      <option value="Africa/Kigali">Africa/Kigali (GMT+2)</option>
                      <option value="Africa/Nairobi">Africa/Nairobi (GMT+3)</option>
                      <option value="UTC">UTC</option>
                    </select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Registration Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Registration Open</p>
                      <p className="text-sm text-gray-500">Allow new student registrations</p>
                    </div>
                    <Switch checked={settings.registrationOpen} onCheckedChange={(checked) => setSettings({...settings, registrationOpen: checked})} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Maintenance Mode</p>
                      <p className="text-sm text-gray-500">Show maintenance page to users</p>
                    </div>
                    <Switch checked={settings.maintenanceMode} onCheckedChange={(checked) => setSettings({...settings, maintenanceMode: checked})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Max Students Per Class</label>
                    <Input type="number" value={settings.maxStudentsPerClass} onChange={(e) => setSettings({...settings, maxStudentsPerClass: parseInt(e.target.value)})} />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle><Lock className="w-5 h-5 mr-2" />Password Policy</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Require Strong Passwords</p>
                      <p className="text-sm text-gray-500">Min 8 chars, uppercase, lowercase, numbers</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Force Password Change</p>
                      <p className="text-sm text-gray-500">Force change every 90 days</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Session Timeout (minutes)</label>
                    <Input type="number" defaultValue={30} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle><Shield className="w-5 h-5 mr-2" />Access Control</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">IP Whitelist</p>
                      <p className="text-sm text-gray-500">Restrict access by IP</p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Two-Factor Authentication</p>
                      <p className="text-sm text-gray-500">Require 2FA for staff</p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Login Rate Limiting</p>
                      <p className="text-sm text-gray-500">Prevent brute force attacks</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle><Mail className="w-5 h-5 mr-2" />Email Notifications</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Enable Email</p>
                      <p className="text-sm text-gray-500">Send email notifications</p>
                    </div>
                    <Switch checked={settings.emailNotifications} onCheckedChange={(checked) => setSettings({...settings, emailNotifications: checked})} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">New Application</p>
                      <p className="text-sm text-gray-500">Notify when new application submitted</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Payment Received</p>
                      <p className="text-sm text-gray-500">Notify when payment received</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle><Bell className="w-5 h-5 mr-2" />SMS Notifications</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Enable SMS</p>
                      <p className="text-sm text-gray-500">Send SMS notifications</p>
                    </div>
                    <Switch checked={settings.smsNotifications} onCheckedChange={(checked) => setSettings({...settings, smsNotifications: checked})} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Fee Reminders</p>
                      <p className="text-sm text-gray-500">Send automatic fee reminders</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Attendance Alerts</p>
                      <p className="text-sm text-gray-500">Notify parents of absences</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'database' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle><Database className="w-5 h-5 mr-2" />Backup Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Auto Backup</p>
                      <p className="text-sm text-gray-500">Automatically backup database</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Backup Frequency</label>
                    <select className="w-full p-2 border rounded">
                      <option>Daily</option>
                      <option>Weekly</option>
                      <option>Monthly</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Retention Period (days)</label>
                    <Input type="number" defaultValue={30} />
                  </div>
                  <Button variant="outline" className="w-full">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Backup Now
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Database Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Database Size</span>
                    <span className="font-medium">245 MB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Total Tables</span>
                    <span className="font-medium">156</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Last Backup</span>
                    <span className="font-medium">2 hours ago</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status</span>
                    <Badge className="bg-green-100 text-green-800">Connected</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemSettingsPage;
