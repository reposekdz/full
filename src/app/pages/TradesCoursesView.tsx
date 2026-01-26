import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/app/components/ui/collapsible';
import { ChevronDown, ChevronRight, Users, BookOpen, GraduationCap } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

interface Course {
  id: number;
  name: string;
  capacity: number;
  student_count: number;
  teacher_name: string;
  is_active: boolean;
}

interface Level {
  level_number: number;
  level_suffix: string;
  level_name: string;
  courses: Course[];
  total_students: number;
}

interface Trade {
  id: number;
  code: string;
  name: string;
  description: string;
  duration_months: number;
  levels: Level[];
  total_levels: number;
  total_courses: number;
  total_students: number;
}

export default function TradesCoursesView() {
  const [structure, setStructure] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedTrades, setExpandedTrades] = useState<Set<number>>(new Set());
  const [expandedLevels, setExpandedLevels] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchStructure();
  }, []);

  const fetchStructure = async () => {
    try {
      const res = await axios.get(`${API_URL}/trades-courses/structure`);
      if (res.data.success) {
        setStructure(res.data.structure);
      }
    } catch (err) {
      console.error('Failed to fetch trades structure:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleTrade = (tradeId: number) => {
    const newExpanded = new Set(expandedTrades);
    if (newExpanded.has(tradeId)) {
      newExpanded.delete(tradeId);
    } else {
      newExpanded.add(tradeId);
    }
    setExpandedTrades(newExpanded);
  };

  const toggleLevel = (levelKey: string) => {
    const newExpanded = new Set(expandedLevels);
    if (newExpanded.has(levelKey)) {
      newExpanded.delete(levelKey);
    } else {
      newExpanded.add(levelKey);
    }
    setExpandedLevels(newExpanded);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Trades, Levels & Courses</h1>
          <p className="text-gray-600 mt-1">Complete structure of all trades and their classes</p>
        </div>
        <Button onClick={fetchStructure}>Refresh</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Trades</p>
                <p className="text-3xl font-black text-blue-600">{structure.length}</p>
              </div>
              <GraduationCap className="w-10 h-10 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Courses</p>
                <p className="text-3xl font-black text-green-600">
                  {structure.reduce((sum, t) => sum + t.total_courses, 0)}
                </p>
              </div>
              <BookOpen className="w-10 h-10 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Students</p>
                <p className="text-3xl font-black text-purple-600">
                  {structure.reduce((sum, t) => sum + t.total_students, 0)}
                </p>
              </div>
              <Users className="w-10 h-10 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {structure.map((trade) => (
          <Card key={trade.id} className="overflow-hidden">
            <Collapsible open={expandedTrades.has(trade.id)} onOpenChange={() => toggleTrade(trade.id)}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {expandedTrades.has(trade.id) ? 
                        <ChevronDown className="w-5 h-5" /> : 
                        <ChevronRight className="w-5 h-5" />
                      }
                      <div>
                        <CardTitle className="text-xl">{trade.name}</CardTitle>
                        <p className="text-sm text-gray-600 mt-1">{trade.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Badge className="bg-blue-500">{trade.code}</Badge>
                      <Badge variant="outline">{trade.total_levels} Levels</Badge>
                      <Badge variant="outline">{trade.total_courses} Courses</Badge>
                      <Badge variant="outline">{trade.total_students} Students</Badge>
                      <Badge variant="outline">{trade.duration_months} Months</Badge>
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <CardContent className="border-t bg-gray-50 p-6">
                  <div className="space-y-4">
                    {trade.levels.map((level) => {
                      const levelKey = `${trade.id}-${level.level_number}${level.level_suffix}`;
                      return (
                        <Card key={levelKey} className="bg-white">
                          <Collapsible open={expandedLevels.has(levelKey)} onOpenChange={() => toggleLevel(levelKey)}>
                            <CollapsibleTrigger asChild>
                              <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors py-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3">
                                    {expandedLevels.has(levelKey) ? 
                                      <ChevronDown className="w-4 h-4" /> : 
                                      <ChevronRight className="w-4 h-4" />}
                                    <div>
                                      <h3 className="font-bold text-lg">{level.level_name}</h3>
                                      <p className="text-sm text-gray-600">
                                        {level.courses.length} Courses • {level.total_students} Students
                                      </p>
                                    </div>
                                  </div>
                                  <Badge variant="outline">{level.courses.length} Courses</Badge>
                                </div>
                              </CardHeader>
                            </CollapsibleTrigger>
                            
                            <CollapsibleContent>
                              <CardContent className="border-t">
                                <div className="space-y-3">
                                  {level.courses.map((course) => (
                                    <div key={course.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                      <div className="flex-1">
                                        <div className="flex items-center space-x-2">
                                          <p className="font-semibold text-gray-900">{course.name}</p>
                                          {!course.is_active && <Badge variant="outline" className="text-xs">Inactive</Badge>}
                                        </div>
                                        <p className="text-sm text-gray-600 mt-1">
                                          Teacher: {course.teacher_name}
                                        </p>
                                        <div className="flex items-center space-x-4 mt-2">
                                          <span className="text-xs text-gray-500">
                                            Capacity: {course.capacity}
                                          </span>
                                          <span className="text-xs text-gray-500">
                                            Enrolled: {course.student_count}/{course.capacity}
                                          </span>
                                        </div>
                                      </div>
                                      <div className="flex items-center space-x-3">
                                        <div className="text-right">
                                          <p className="text-sm text-gray-600">Students</p>
                                          <p className="text-lg font-bold text-blue-600">{course.student_count}</p>
                                        </div>
                                        <Button size="sm" variant="outline">View</Button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </CardContent>
                            </CollapsibleContent>
                          </Collapsible>
                        </Card>
                      );
                    })}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        ))}
      </div>
    </div>
  );
}
