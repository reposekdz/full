import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Database, Upload, FileText, Video, Image, Download, Search } from 'lucide-react';
import AdvancedLeftSidebar from '@/app/components/AdvancedLeftSidebar';

interface TeacherResourcesPageProps {
  onNavigate: (page: string) => void;
}

const TeacherResourcesPage: React.FC<TeacherResourcesPageProps> = ({ onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const resources = [
    { name: 'Isomo rya Mbere - Mathematics', type: 'PDF', size: '2.5 MB', icon: FileText, color: 'text-red-600' },
    { name: 'Video Tutorial - Physics', type: 'Video', size: '45 MB', icon: Video, color: 'text-blue-600' },
    { name: 'Diagrams - Chemistry', type: 'Images', size: '5 MB', icon: Image, color: 'text-green-600' },
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-yellow-50 via-green-50 to-yellow-100">
      <AdvancedLeftSidebar currentPage="resources" onNavigate={onNavigate} />
      <div className="flex-1 overflow-auto p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-black bg-gradient-to-r from-yellow-600 to-green-600 bg-clip-text text-transparent">
            Ibikoresho
          </h1>
          <Button className="bg-gradient-to-r from-yellow-500 to-green-500 text-white">
            <Upload className="h-4 w-4 mr-2" />
            Ohereza Ikinyabiziga
          </Button>
        </div>

        <Card className="border-2 border-yellow-200 mb-6">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Shakisha ibikoresho..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((resource, index) => {
            const Icon = resource.icon;
            return (
              <Card key={index} className="border-2 border-yellow-200 hover:shadow-xl transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="p-3 rounded-xl bg-yellow-50">
                      <Icon className={`h-8 w-8 ${resource.color}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900">{resource.name}</h3>
                      <p className="text-sm text-gray-600">{resource.type} • {resource.size}</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Kuramo
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TeacherResourcesPage;
