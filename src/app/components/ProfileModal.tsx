import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Edit, 
  Save, 
  X, 
  Camera,
  Shield,
  Key,
  Bell,
  Globe,
  Settings,
  Award,
  BookOpen,
  Clock,
  Target
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';
import { Badge } from '@/app/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Switch } from '@/app/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { useAuth } from '@/app/contexts/AuthContext';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '+250788123456',
    address: 'Kigali, Rwanda',
    bio: 'Passionate about education and technology',
    dateOfBirth: '1990-01-01',
    language: 'en',
    notifications: {
      email: true,
      sms: true,
      push: true
    }
  });

  const handleSave = () => {
    setIsEditing(false);
    // Save profile data logic here
  };

  const getRoleStats = () => {
    switch (user?.role) {
      case 'student':
        return [
          { label: 'Amasomo', value: '8', icon: BookOpen },
          { label: 'Impera', value: '88.5%', icon: Target },
          { label: 'Kwitabira', value: '96%', icon: Clock },
          { label: 'Ibihembo', value: '5', icon: Award }
        ];
      case 'teacher':
        return [
          { label: 'Amaklasi', value: '6', icon: BookOpen },
          { label: 'Abanyeshuri', value: '180', icon: User },
          { label: 'Ubunyangamugayo', value: '4.8/5', icon: Award },
          { label: 'Uburambe', value: '8 yrs', icon: Clock }
        ];
      case 'parent':
        return [
          { label: 'Abana', value: '2', icon: User },
          { label: 'Impera', value: '85%', icon: Target },
          { label: 'Inama', value: '12', icon: Calendar },
          { label: 'Ubutumwa', value: '24', icon: Mail }
        ];
      default:
        return [
          { label: 'Abakoresha', value: '1,234', icon: User },
          { label: 'Ibikorwa', value: '45', icon: Settings },
          { label: 'Raporo', value: '28', icon: BookOpen },
          { label: 'Imikorere', value: '94%', icon: Target }
        ];
    }
  };

  const stats = getRoleStats();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="text-2xl font-black">Profil Yawe</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Profile Header */}
          <Card className="border-2 border-yellow-200 bg-gradient-to-r from-yellow-50 to-green-50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <Avatar className="h-24 w-24 border-4 border-yellow-400">
                    <AvatarFallback className="bg-gradient-to-br from-yellow-500 to-green-500 text-white text-3xl font-bold">
                      {user?.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="icon"
                    className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-yellow-500 hover:bg-yellow-600"
                  >
                    <Camera className="h-4 w-4 text-white" />
                  </Button>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-2xl font-black text-gray-900">{user?.name}</h2>
                    <Button
                      onClick={() => setIsEditing(!isEditing)}
                      className={isEditing ? 'bg-green-500 hover:bg-green-600' : 'bg-yellow-500 hover:bg-yellow-600'}
                    >
                      {isEditing ? (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Bika
                        </>
                      ) : (
                        <>
                          <Edit className="h-4 w-4 mr-2" />
                          Hindura
                        </>
                      )}
                    </Button>
                  </div>
                  <Badge className="bg-gradient-to-r from-yellow-500 to-green-500 text-white border-0 mb-2">
                    {user?.role.replace('_', ' ').toUpperCase()}
                  </Badge>
                  <p className="text-gray-600">{profileData.bio}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="border-2 border-yellow-200">
                  <CardContent className="p-4 text-center">
                    <Icon className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
                    <p className="text-2xl font-black text-gray-900">{stat.value}</p>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Profile Tabs */}
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-white border-2 border-yellow-200">
              <TabsTrigger value="personal" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-green-500 data-[state=active]:text-white">
                Amakuru
              </TabsTrigger>
              <TabsTrigger value="security" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-green-500 data-[state=active]:text-white">
                Umutekano
              </TabsTrigger>
              <TabsTrigger value="preferences" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-green-500 data-[state=active]:text-white">
                Amahitamo
              </TabsTrigger>
              <TabsTrigger value="activity" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-green-500 data-[state=active]:text-white">
                Ibikorwa
              </TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="space-y-4">
              <Card className="border-2 border-yellow-200">
                <CardHeader>
                  <CardTitle>Amakuru Yihariye</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Amazina</Label>
                      <Input
                        id="name"
                        value={profileData.name}
                        onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                        disabled={!isEditing}
                        className="border-2 border-yellow-200"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                        disabled={!isEditing}
                        className="border-2 border-yellow-200"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Telefone</Label>
                      <Input
                        id="phone"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                        disabled={!isEditing}
                        className="border-2 border-yellow-200"
                      />
                    </div>
                    <div>
                      <Label htmlFor="dob">Itariki y'Amavuko</Label>
                      <Input
                        id="dob"
                        type="date"
                        value={profileData.dateOfBirth}
                        onChange={(e) => setProfileData({...profileData, dateOfBirth: e.target.value})}
                        disabled={!isEditing}
                        className="border-2 border-yellow-200"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="address">Aderesi</Label>
                    <Input
                      id="address"
                      value={profileData.address}
                      onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                      disabled={!isEditing}
                      className="border-2 border-yellow-200"
                    />
                  </div>
                  <div>
                    <Label htmlFor="bio">Incamake</Label>
                    <Textarea
                      id="bio"
                      value={profileData.bio}
                      onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                      disabled={!isEditing}
                      className="border-2 border-yellow-200"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-4">
              <Card className="border-2 border-yellow-200">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="h-5 w-5 mr-2 text-yellow-600" />
                    Umutekano w'Konti
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="current-password">Ijambo Banga Rihari</Label>
                      <Input
                        id="current-password"
                        type="password"
                        placeholder="Injiza ijambo banga rihari"
                        className="border-2 border-yellow-200"
                      />
                    </div>
                    <div>
                      <Label htmlFor="new-password">Ijambo Banga Rishya</Label>
                      <Input
                        id="new-password"
                        type="password"
                        placeholder="Injiza ijambo banga rishya"
                        className="border-2 border-yellow-200"
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirm-password">Emeza Ijambo Banga</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        placeholder="Ongera wandike ijambo banga"
                        className="border-2 border-yellow-200"
                      />
                    </div>
                    <Button className="bg-gradient-to-r from-yellow-500 to-green-500 text-white">
                      <Key className="h-4 w-4 mr-2" />
                      Hindura Ijambo Banga
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preferences" className="space-y-4">
              <Card className="border-2 border-yellow-200">
                <CardHeader>
                  <CardTitle>Amahitamo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Ururimi</Label>
                        <p className="text-sm text-gray-600">Hitamo ururimi rw'interface</p>
                      </div>
                      <Select value={profileData.language} onValueChange={(value) => setProfileData({...profileData, language: value})}>
                        <SelectTrigger className="w-32 border-2 border-yellow-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="rw">Kinyarwanda</SelectItem>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="fr">Français</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-3">
                      <Label>Amamenyo</Label>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Email Notifications</p>
                            <p className="text-sm text-gray-600">Akira amamenyo kuri email</p>
                          </div>
                          <Switch 
                            checked={profileData.notifications.email}
                            onCheckedChange={(checked) => setProfileData({
                              ...profileData, 
                              notifications: {...profileData.notifications, email: checked}
                            })}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">SMS Notifications</p>
                            <p className="text-sm text-gray-600">Akira amamenyo kuri telefone</p>
                          </div>
                          <Switch 
                            checked={profileData.notifications.sms}
                            onCheckedChange={(checked) => setProfileData({
                              ...profileData, 
                              notifications: {...profileData.notifications, sms: checked}
                            })}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Push Notifications</p>
                            <p className="text-sm text-gray-600">Akira amamenyo kuri app</p>
                          </div>
                          <Switch 
                            checked={profileData.notifications.push}
                            onCheckedChange={(checked) => setProfileData({
                              ...profileData, 
                              notifications: {...profileData.notifications, push: checked}
                            })}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="space-y-4">
              <Card className="border-2 border-yellow-200">
                <CardHeader>
                  <CardTitle>Ibikorwa Biheruka</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { action: 'Kwinjira mu sisiteme', time: '2 amasaha ashize', icon: User },
                      { action: 'Guhindura profil', time: '1 umunsi ushize', icon: Edit },
                      { action: 'Gusoma ubutumwa', time: '2 iminsi ishize', icon: Mail },
                      { action: 'Kureba amanota', time: '3 iminsi ishize', icon: BookOpen },
                      { action: 'Gukuramo raporo', time: '1 icyumweru gishize', icon: Calendar }
                    ].map((activity, index) => {
                      const Icon = activity.icon;
                      return (
                        <div key={index} className="flex items-center space-x-4 p-3 bg-gradient-to-r from-yellow-50 to-green-50 rounded-lg border border-yellow-200">
                          <Icon className="h-5 w-5 text-yellow-600" />
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{activity.action}</p>
                            <p className="text-sm text-gray-600">{activity.time}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t-2 border-yellow-200">
            <Button variant="outline" onClick={onClose} className="border-2 border-yellow-200">
              Funga
            </Button>
            {isEditing && (
              <Button onClick={handleSave} className="bg-gradient-to-r from-yellow-500 to-green-500 text-white">
                <Save className="h-4 w-4 mr-2" />
                Bika Impinduka
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileModal;