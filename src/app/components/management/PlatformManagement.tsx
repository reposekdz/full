import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, 
  Users, 
  Shield,
  Database,
  Palette,
  Layout,
  FileText,
  Globe,
  Bell,
  Plus,
  Edit,
  Trash2,
  Save,
  RefreshCw,
  Eye,
  Code
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import apiService from '../../services/apiService';

export default function PlatformManagement() {
  const [settings, setSettings] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [showSettingDialog, setShowSettingDialog] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);

  const [userForm, setUserForm] = useState({
    username: '',
    email: '',
    role: 'teacher',
    first_name: '',
    last_name: '',
    password: ''
  });

  const [settingForm, setSettingForm] = useState({
    setting_key: '',
    setting_value: '',
    category: 'general',
    description: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [settingsData, usersData, logsData] = await Promise.all([
        apiService.getSystemSettings(),
        apiService.getAdminUsers({ page: 1, limit: 100 }),
        apiService.getActivityLogs({ page: 1, limit: 50 })
      ]);

      if (settingsData.success) setSettings(settingsData.settings || []);
      if (usersData.success) setUsers(usersData.users || []);
      if (logsData.success) setActivityLogs(logsData.logs || []);
    } catch (error) {
      console.error('Error fetching platform data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    try {
      const result = await apiService.createAdminUser(userForm);
      
      if (result.success) {
        setShowUserDialog(false);
        setUserForm({
          username: '',
          email: '',
          role: 'teacher',
          first_name: '',
          last_name: '',
          password: ''
        });
        fetchData();
        alert('User created successfully!');
      }
    } catch (error: any) {
      alert('Failed to create user: ' + error.message);
    }
  };

  const handleUpdateSetting = async () => {
    try {
      const result = await apiService.updateSystemSetting(
        settingForm.setting_key,
        settingForm.setting_value
      );
      
      if (result.success) {
        setShowSettingDialog(false);
        setSettingForm({
          setting_key: '',
          setting_value: '',
          category: 'general',
          description: ''
        });
        fetchData();
        alert('Setting updated successfully!');
      }
    } catch (error: any) {
      alert('Failed to update setting: ' + error.message);
    }
  };

  const handleBulkActivate = async () => {
    try {
      const result = await apiService.bulkActivateUsers(selectedUsers);
      
      if (result.success) {
        setSelectedUsers([]);
        fetchData();
        alert('Users activated successfully!');
      }
    } catch (error: any) {
      alert('Failed to activate users: ' + error.message);
    }
  };

  const handleBulkDeactivate = async () => {
    try {
      const result = await apiService.bulkDeactivateUsers(selectedUsers);
      
      if (result.success) {
        setSelectedUsers([]);
        fetchData();
        alert('Users deactivated successfully!');
      }
    } catch (error: any) {
      alert('Failed to deactivate users: ' + error.message);
    }
  };

  const toggleUserSelection = (userId: number) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-gray-50 to-indigo-50 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Platform Management</h1>
          <p className="text-gray-600">Manage system settings, users, and platform components</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowUserDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </Button>
          <Button onClick={() => setShowSettingDialog(true)} variant="secondary">
            <Settings className="w-4 h-4 mr-2" />
            Add Setting
          </Button>
          <Button onClick={fetchData} variant="outline">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="settings">System Settings</TabsTrigger>
          <TabsTrigger value="components">Platform Components</TabsTrigger>
          <TabsTrigger value="activity">Activity Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>System Users</CardTitle>
                {selectedUsers.length > 0 && (
                  <div className="flex gap-2">
                    <Badge variant="secondary">{selectedUsers.length} selected</Badge>
                    <Button size="sm" onClick={handleBulkActivate}>Activate</Button>
                    <Button size="sm" variant="destructive" onClick={handleBulkDeactivate}>
                      Deactivate
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">
                        <input
                          type="checkbox"
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedUsers(users.map(u => u.id));
                            } else {
                              setSelectedUsers([]);
                            }
                          }}
                        />
                      </th>
                      <th className="text-left p-2">Username</th>
                      <th className="text-left p-2">Name</th>
                      <th className="text-left p-2">Email</th>
                      <th className="text-left p-2">Role</th>
                      <th className="text-left p-2">Status</th>
                      <th className="text-left p-2">Last Login</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user: any) => (
                      <tr key={user.id} className="border-b hover:bg-gray-50">
                        <td className="p-2">
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user.id)}
                            onChange={() => toggleUserSelection(user.id)}
                          />
                        </td>
                        <td className="p-2 font-medium">{user.username}</td>
                        <td className="p-2">{user.first_name} {user.last_name}</td>
                        <td className="p-2 text-sm text-gray-600">{user.email}</td>
                        <td className="p-2">
                          <Badge variant="outline">{user.role}</Badge>
                        </td>
                        <td className="p-2">
                          <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                            {user.status}
                          </Badge>
                        </td>
                        <td className="p-2 text-sm text-gray-600">
                          {user.last_login ? new Date(user.last_login).toLocaleString() : 'Never'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {['general', 'academic', 'financial', 'communication', 'security'].map(category => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="capitalize">{category} Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {settings
                      .filter(s => s.category === category)
                      .map((setting: any) => (
                        <div key={setting.id} className="p-3 border rounded-lg">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="font-medium text-sm">{setting.setting_key}</div>
                              <div className="text-xs text-gray-600 mt-1">
                                {setting.description}
                              </div>
                              <div className="text-sm font-medium mt-2">
                                {setting.setting_value}
                              </div>
                            </div>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => {
                                setSettingForm({
                                  setting_key: setting.setting_key,
                                  setting_value: setting.setting_value,
                                  category: setting.category,
                                  description: setting.description
                                });
                                setShowSettingDialog(true);
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      )) || <p className="text-sm text-gray-500">No settings in this category</p>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="components" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-2 border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layout className="w-5 h-5" />
                  Dashboard Components
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 bg-white rounded">
                    <span className="text-sm">Admin Dashboard Advanced</span>
                    <Badge variant="default">Active</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-white rounded">
                    <span className="text-sm">Teacher Portal Advanced</span>
                    <Badge variant="default">Active</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-white rounded">
                    <span className="text-sm">Student Portal Advanced</span>
                    <Badge variant="default">Active</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-white rounded">
                    <span className="text-sm">Parent Portal Advanced</span>
                    <Badge variant="default">Active</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-white rounded">
                    <span className="text-sm">Accountant Dashboard</span>
                    <Badge variant="default">Active</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Data Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 bg-white rounded">
                    <span className="text-sm">Global Student Sheets</span>
                    <Badge variant="default">Active</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-white rounded">
                    <span className="text-sm">Universal Entity Management</span>
                    <Badge variant="default">Active</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-white rounded">
                    <span className="text-sm">Dynamic Column System</span>
                    <Badge variant="default">Active</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-white rounded">
                    <span className="text-sm">Stock Management</span>
                    <Badge variant="default">Active</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-white rounded">
                    <span className="text-sm">Fee Management</span>
                    <Badge variant="default">Active</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-200 bg-purple-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Security & Auth
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 bg-white rounded">
                    <span className="text-sm">JWT Authentication</span>
                    <Badge variant="default">Active</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-white rounded">
                    <span className="text-sm">Role-Based Access Control</span>
                    <Badge variant="default">Active</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-white rounded">
                    <span className="text-sm">Activity Logging</span>
                    <Badge variant="default">Active</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-white rounded">
                    <span className="text-sm">Session Management</span>
                    <Badge variant="default">Active</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>API Endpoints Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: 'Universal Staff Management', endpoint: '/api/universal-management', status: 'operational' },
                  { name: 'Admin Dashboard Advanced', endpoint: '/api/admin-dashboard-advanced', status: 'operational' },
                  { name: 'Accountant Comprehensive', endpoint: '/api/accountant-comprehensive', status: 'operational' },
                  { name: 'Stock Management Advanced', endpoint: '/api/stock-advanced', status: 'operational' },
                  { name: 'Teacher Portal Advanced', endpoint: '/api/teacher-portal-advanced', status: 'operational' },
                  { name: 'Student Portal Comprehensive', endpoint: '/api/student-portal-comprehensive', status: 'operational' },
                  { name: 'Parent Portal Comprehensive', endpoint: '/api/parent-portal-comprehensive', status: 'operational' }
                ].map((api, index) => (
                  <div key={index} className="p-3 border rounded-lg flex justify-between items-center">
                    <div>
                      <div className="font-medium text-sm">{api.name}</div>
                      <div className="text-xs text-gray-600 font-mono">{api.endpoint}</div>
                    </div>
                    <Badge variant="default" className="bg-green-600">
                      {api.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activityLogs.map((log: any, index: number) => (
                  <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <Code className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{log.action}</div>
                      <div className="text-sm text-gray-600">{log.description}</div>
                      <div className="flex gap-4 mt-1 text-xs text-gray-500">
                        <span>User: {log.username}</span>
                        <span>IP: {log.ip_address}</span>
                        <span>{new Date(log.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                    <Badge variant="outline">{log.action_type}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Username</Label>
              <Input 
                value={userForm.username}
                onChange={(e) => setUserForm({...userForm, username: e.target.value})}
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input 
                type="email"
                value={userForm.email}
                onChange={(e) => setUserForm({...userForm, email: e.target.value})}
              />
            </div>
            <div>
              <Label>First Name</Label>
              <Input 
                value={userForm.first_name}
                onChange={(e) => setUserForm({...userForm, first_name: e.target.value})}
              />
            </div>
            <div>
              <Label>Last Name</Label>
              <Input 
                value={userForm.last_name}
                onChange={(e) => setUserForm({...userForm, last_name: e.target.value})}
              />
            </div>
            <div>
              <Label>Role</Label>
              <Select 
                value={userForm.role}
                onValueChange={(value) => setUserForm({...userForm, role: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="headmaster">Headmaster</SelectItem>
                  <SelectItem value="teacher">Teacher</SelectItem>
                  <SelectItem value="accountant">Accountant</SelectItem>
                  <SelectItem value="stockmanager">Stock Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Password</Label>
              <Input 
                type="password"
                value={userForm.password}
                onChange={(e) => setUserForm({...userForm, password: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUserDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateUser}>Create User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showSettingDialog} onOpenChange={setShowSettingDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update System Setting</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Setting Key</Label>
              <Input 
                value={settingForm.setting_key}
                onChange={(e) => setSettingForm({...settingForm, setting_key: e.target.value})}
                disabled={!!settingForm.setting_key}
              />
            </div>
            <div>
              <Label>Setting Value</Label>
              <Textarea 
                value={settingForm.setting_value}
                onChange={(e) => setSettingForm({...settingForm, setting_value: e.target.value})}
              />
            </div>
            <div>
              <Label>Category</Label>
              <Select 
                value={settingForm.category}
                onValueChange={(value) => setSettingForm({...settingForm, category: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="academic">Academic</SelectItem>
                  <SelectItem value="financial">Financial</SelectItem>
                  <SelectItem value="communication">Communication</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea 
                value={settingForm.description}
                onChange={(e) => setSettingForm({...settingForm, description: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSettingDialog(false)}>Cancel</Button>
            <Button onClick={handleUpdateSetting}>Update Setting</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
