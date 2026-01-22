import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StudentAssignmentView from './StudentAssignmentView';
import { BookOpen, ClipboardCheck, Package, Video } from 'lucide-react';

const StudentLearningDashboard = ({ studentId, classId }) => {
  const [stats, setStats] = useState({
    pending_assignments: 0,
    upcoming_quizzes: 0,
    active_homework: 0,
    live_sessions: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    // Fetch student statistics
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">My Learning</h1>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Assignments</p>
                <p className="text-2xl font-bold">{stats.pending_assignments}</p>
              </div>
              <BookOpen className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Quizzes</p>
                <p className="text-2xl font-bold">{stats.upcoming_quizzes}</p>
              </div>
              <ClipboardCheck className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Homework</p>
                <p className="text-2xl font-bold">{stats.active_homework}</p>
              </div>
              <Package className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Live Sessions</p>
                <p className="text-2xl font-bold">{stats.live_sessions}</p>
              </div>
              <Video className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="assignments">
        <TabsList>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
          <TabsTrigger value="homework">Homework</TabsTrigger>
          <TabsTrigger value="sessions">Study Sessions</TabsTrigger>
        </TabsList>

        <TabsContent value="assignments">
          <StudentAssignmentView classId={classId} studentId={studentId} />
        </TabsContent>

        <TabsContent value="quizzes">
          <div>Quiz List</div>
        </TabsContent>

        <TabsContent value="homework">
          <div>Homework List</div>
        </TabsContent>

        <TabsContent value="sessions">
          <div>Available Study Sessions</div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudentLearningDashboard;
