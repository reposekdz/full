import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AssignmentBuilder from './AssignmentBuilder';
import QuizBuilder from './QuizBuilder';
import { BookOpen, ClipboardList, Package, Users } from 'lucide-react';

const TeacherLearningDashboard = () => {
  const [activeTab, setActiveTab] = useState('assignments');

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Learning Management</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="assignments">
            <BookOpen className="w-4 h-4 mr-2" />
            Assignments
          </TabsTrigger>
          <TabsTrigger value="quizzes">
            <ClipboardList className="w-4 h-4 mr-2" />
            Quizzes
          </TabsTrigger>
          <TabsTrigger value="homework">
            <Package className="w-4 h-4 mr-2" />
            Homework
          </TabsTrigger>
          <TabsTrigger value="sessions">
            <Users className="w-4 h-4 mr-2" />
            Live Sessions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="assignments">
          <AssignmentBuilder 
            subjects={[]} 
            classes={[]} 
            onSubmit={async (data) => {
              await fetch('/api/assignments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
              });
            }}
          />
        </TabsContent>

        <TabsContent value="quizzes">
          <QuizBuilder 
            subjects={[]} 
            classes={[]} 
            onSubmit={async (data) => {
              await fetch('/api/quizzes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
              });
            }}
          />
        </TabsContent>

        <TabsContent value="homework">
          <div>Homework Management</div>
        </TabsContent>

        <TabsContent value="sessions">
          <div>Live Study Sessions</div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TeacherLearningDashboard;
