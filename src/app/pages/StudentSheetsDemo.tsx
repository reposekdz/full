import React, { useState } from 'react';
import { AccountantSheet, DODSheet, DOSSheet, TeacherSheet } from '@/app/components/tables';
import { generateSampleStudents } from '@/app/utils/sampleData';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { DollarSign, Shield, BookOpen, GraduationCap } from 'lucide-react';

export const StudentSheetsDemo: React.FC = () => {
  const [students] = useState(generateSampleStudents(100));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-[1800px] mx-auto">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Global Student Management Sheets</h1>
          <p className="text-gray-600">Excel-like tables for all school management roles</p>
        </div>

        <Tabs defaultValue="accountant" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="accountant" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Accountant
            </TabsTrigger>
            <TabsTrigger value="dod" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              DOD
            </TabsTrigger>
            <TabsTrigger value="dos" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              DOS
            </TabsTrigger>
            <TabsTrigger value="teacher" className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4" />
              Teacher
            </TabsTrigger>
          </TabsList>

          <TabsContent value="accountant" className="mt-0">
            <AccountantSheet students={students} />
          </TabsContent>

          <TabsContent value="dod" className="mt-0">
            <DODSheet students={students} />
          </TabsContent>

          <TabsContent value="dos" className="mt-0">
            <DOSSheet students={students} />
          </TabsContent>

          <TabsContent value="teacher" className="mt-0">
            <TeacherSheet students={students} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
