import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '@/app/config/apiBase';
import { Users, Plus, Search, Download, TrendingUp, UserCheck, Calendar, FileText, Bell } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import GlobalStudentSheets from '@/app/components/GlobalStudentSheets';

interface StaffManagementAdvancedProps {
  onNavigate: (page: string) => void;
  userRole?: string;
  userId?: number;
}

const StaffManagementAdvanced: React.FC<StaffManagementAdvancedProps> = ({ onNavigate, userRole = 'admin', userId = 1 }) => {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    total_staff: 0,
    active_staff: 0,
    inactive_staff: 0,
    total_teachers: 0
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/staff-advanced?analytics=true`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        setStaff(data.staff);
        if (data.analytics?.summary) {
          setStats(data.analytics.summary);
        }
      }
    } catch (error) {
      console.error('Failed to fetch staff:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStaff = staff.filter(s =>
    s.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Staff Management</h1>
          <p className="text-gray-600">Advanced staff management system</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Staff</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.total_staff}</p>
                </div>
                <Users className="w-12 h-12 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active</p>
                  <p className="text-3xl font-bold text-green-600">{stats.active_staff}</p>
                </div>
                <UserCheck className="w-12 h-12 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Teachers</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.total_teachers}</p>
                </div>
                <TrendingUp className="w-12 h-12 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Inactive</p>
                  <p className="text-3xl font-bold text-red-600">{stats.inactive_staff}</p>
                </div>
                <Users className="w-12 h-12 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex-1 w-full md:w-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Search staff..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button>
                  <FileText className="w-4 h-4 mr-2" />
                  Student Sheets
                </Button>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Staff
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs defaultValue="staff" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="staff" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Staff Management
            </TabsTrigger>
            <TabsTrigger value="students" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Student Sheets
            </TabsTrigger>
          </TabsList>

          <TabsContent value="staff">
            {/* Staff List */}
            <Card>
              <CardHeader>
                <CardTitle>Staff Members ({filteredStaff.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading staff...</p>
                  </div>
                ) : filteredStaff.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">No staff members found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredStaff.map((member) => (
                      <motion.div
                        key={member.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                            {member.first_name?.[0]}{member.last_name?.[0]}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {member.first_name} {member.last_name}
                            </h3>
                            <p className="text-sm text-gray-600">{member.email}</p>
                            <div className="flex gap-2 mt-1">
                              <Badge variant="outline">{member.role_name}</Badge>
                              {member.department && (
                                <Badge variant="secondary">{member.department}</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant={member.status === 'active' ? 'default' : 'destructive'}>
                            {member.status}
                          </Badge>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="students">
            <GlobalStudentSheets userRole={userRole} userId={userId} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StaffManagementAdvanced;
