import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GlobalStudentSheets from '../components/GlobalStudentSheets';
import DOSStudentManagement from '../components/DOSStudentManagement';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { FileSpreadsheet, UserPlus } from 'lucide-react';

export default function UnifiedStudentManagement() {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      navigate('/login');
    }
  }, [navigate]);

  if (!user) return null;

  const canManageStudents = ['dos', 'headmaster', 'admin', 'super_admin'].includes(user.role);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {canManageStudents ? (
        <Tabs defaultValue="sheets" className="w-full">
          <div className="bg-white border-b-2 border-blue-200 sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-6 py-4">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="sheets" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Imbonerahamwe
                </TabsTrigger>
                <TabsTrigger value="manage" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Gucunga
                </TabsTrigger>
              </TabsList>
            </div>
          </div>
          <TabsContent value="sheets" className="m-0">
            <GlobalStudentSheets />
          </TabsContent>
          <TabsContent value="manage" className="m-0">
            <DOSStudentManagement />
          </TabsContent>
        </Tabs>
      ) : (
        <GlobalStudentSheets />
      )}
    </div>
  );
}
