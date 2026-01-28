import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Award, TrendingUp, BookOpen, BarChart3, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Progress } from '@/app/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import apiService from '@/app/services/apiService';

export default function ParentGrades() {
  const [children, setChildren] = useState<any[]>([]);
  const [selectedChild, setSelectedChild] = useState<any>(null);
  const [grades, setGrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChildren();
  }, []);

  useEffect(() => {
    if (selectedChild) {
      fetchGrades();
    }
  }, [selectedChild]);

  const fetchChildren = async () => {
    try {
      setLoading(true);
      const data = await apiService.getMyChildren();
      const childrenArray = Array.isArray(data) ? data : [];
      setChildren(childrenArray);
      if (childrenArray.length > 0) setSelectedChild(childrenArray[0]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchGrades = async () => {
    if (!selectedChild) return;
    try {
      const data = await apiService.getChildAcademics(selectedChild.user_id);
      setGrades(data?.grades || []);
    } catch (err) {
      console.error(err);
      setGrades([]);
    }
  };

  const getGradeColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-blue-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getGradeLabel = (percentage: number) => {
    if (percentage >= 80) return 'Excellent';
    if (percentage >= 70) return 'Very Good';
    if (percentage >= 60) return 'Good';
    if (percentage >= 50) return 'Average';
    return 'Needs Improvement';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardContent className="p-12 text-center">
            <Award className="w-24 h-24 mx-auto text-gray-300 mb-4" />
            <h3 className="text-2xl font-bold text-gray-600 mb-2">Nta mwana uhujwe</h3>
            <p className="text-gray-500">Huza umwana mbere yo kureba amanota</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const averageGrade = grades.length > 0 
    ? grades.reduce((sum, g) => sum + ((g.obtained_marks / g.max_marks) * 100), 0) / grades.length 
    : 0;

  return (
    <div className="p-8 space-y-8 bg-gradient-to-br from-purple-50 via-white to-blue-50 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Amanota
          </h1>
          <p className="text-gray-600">Reba amanota y'umwana wawe</p>
        </div>
        <div className="flex gap-4 items-center">
          <Select value={selectedChild?.user_id?.toString()} onValueChange={(id) => setSelectedChild(children.find(c => c.user_id.toString() === id))}>
            <SelectTrigger className="w-64 border-2 border-purple-100">
              <SelectValue placeholder="Hitamo umwana" />
            </SelectTrigger>
            <SelectContent>
              {children.map((child) => (
                <SelectItem key={child.user_id} value={child.user_id.toString()}>
                  {child.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
            <Download className="w-4 h-4 mr-2" />
            Kurura Raporo
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        <Card className="border-2 border-purple-100 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Award className="w-8 h-8 text-purple-600" />
              <Badge className="bg-purple-100 text-purple-700">Impera</Badge>
            </div>
            <p className="text-3xl font-black text-purple-900">{averageGrade.toFixed(1)}%</p>
            <p className="text-sm text-gray-600">Amanota y'Impera</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-100 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <BookOpen className="w-8 h-8 text-blue-600" />
              <Badge className="bg-blue-100 text-blue-700">Amasomo</Badge>
            </div>
            <p className="text-3xl font-black text-blue-900">{grades.length}</p>
            <p className="text-sm text-gray-600">Amasomo Yose</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-100 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-green-600" />
              <Badge className="bg-green-100 text-green-700">Neza</Badge>
            </div>
            <p className="text-3xl font-black text-green-900">
              {grades.filter(g => (g.obtained_marks / g.max_marks * 100) >= 60).length}
            </p>
            <p className="text-sm text-gray-600">Amanota Meza</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-yellow-100 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <BarChart3 className="w-8 h-8 text-yellow-600" />
              <Badge className="bg-yellow-100 text-yellow-700">Gukora Neza</Badge>
            </div>
            <p className="text-3xl font-black text-yellow-900">
              {grades.filter(g => (g.obtained_marks / g.max_marks * 100) < 50).length}
            </p>
            <p className="text-sm text-gray-600">Gukora Cyane</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-2 border-purple-100 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 border-b-2 border-purple-100">
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Amanota ku Somo
          </CardTitle>
          <CardDescription>Amanota yose y'umwana wawe ku masomo yose</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {grades.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">Nta manota abonetse</p>
            </div>
          ) : (
            <div className="space-y-4">
              {grades.map((grade, index) => {
                const percentage = (grade.obtained_marks / grade.max_marks) * 100;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 bg-white rounded-xl border-2 border-gray-100 hover:border-purple-200 transition-all"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-bold text-lg text-gray-900">{grade.subject_name || 'Subject'}</h4>
                        <p className="text-sm text-gray-500">{grade.assessment_date ? new Date(grade.assessment_date).toLocaleDateString() : 'N/A'}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-2xl font-black ${getGradeColor(percentage)}`}>
                          {grade.obtained_marks}/{grade.max_marks}
                        </p>
                        <Badge className={percentage >= 60 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                          {getGradeLabel(percentage)}
                        </Badge>
                      </div>
                    </div>
                    <Progress value={percentage} className="h-2" />
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm text-gray-600">Performance</span>
                      <span className={`text-sm font-bold ${getGradeColor(percentage)}`}>{percentage.toFixed(1)}%</span>
                    </div>
                    {grade.remarks && (
                      <p className="text-sm text-gray-600 mt-2 italic">"{grade.remarks}"</p>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
