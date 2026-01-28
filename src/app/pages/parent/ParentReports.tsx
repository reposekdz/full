import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { FileText, Download, Award, Calendar, TrendingUp, BarChart3, PieChart, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Progress } from '@/app/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import apiService from '@/app/services/apiService';

export default function ParentReports() {
  const [children, setChildren] = useState<any[]>([]);
  const [selectedChild, setSelectedChild] = useState<any>(null);
  const [academicReport, setAcademicReport] = useState<any>(null);
  const [attendanceReport, setAttendanceReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChildren();
  }, []);

  useEffect(() => {
    if (selectedChild) {
      fetchReports();
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

  const fetchReports = async () => {
    if (!selectedChild) return;
    try {
      const [academic, attendance] = await Promise.all([
        apiService.getChildAcademics(selectedChild.user_id),
        apiService.getChildAttendance(selectedChild.user_id)
      ]);
      setAcademicReport(academic);
      setAttendanceReport(attendance);
    } catch (err) {
      console.error(err);
    }
  };

  const generatePDF = (type: string) => {
    alert(`Gukurura ${type} Report... (Bizakorwa vuba)`);
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
            <FileText className="w-24 h-24 mx-auto text-gray-300 mb-4" />
            <h3 className="text-2xl font-bold text-gray-600 mb-2">Nta mwana uhujwe</h3>
            <p className="text-gray-500">Huza umwana mbere yo kureba raporo</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const averageGrade = academicReport?.average_marks || 0;
  const attendanceRate = attendanceReport?.summary?.total > 0 
    ? (attendanceReport.summary.present / attendanceReport.summary.total) * 100 
    : 0;

  return (
    <div className="p-8 space-y-8 bg-gradient-to-br from-purple-50 via-white to-blue-50 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Raporo z'Umwana
          </h1>
          <p className="text-gray-600">Raporo n'imikorere y'umwana wawe</p>
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
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        <Card className="border-2 border-purple-100 shadow-xl">
          <CardContent className="p-6 text-center">
            <Award className="w-12 h-12 mx-auto text-purple-600 mb-2" />
            <p className="text-3xl font-black text-purple-900">{averageGrade.toFixed(1)}%</p>
            <p className="text-sm text-gray-600">Amanota y'Impera</p>
          </CardContent>
        </Card>
        <Card className="border-2 border-blue-100 shadow-xl">
          <CardContent className="p-6 text-center">
            <Calendar className="w-12 h-12 mx-auto text-blue-600 mb-2" />
            <p className="text-3xl font-black text-blue-900">{attendanceRate.toFixed(1)}%</p>
            <p className="text-sm text-gray-600">Kwitabira</p>
          </CardContent>
        </Card>
        <Card className="border-2 border-green-100 shadow-xl">
          <CardContent className="p-6 text-center">
            <TrendingUp className="w-12 h-12 mx-auto text-green-600 mb-2" />
            <p className="text-3xl font-black text-green-900">{selectedChild?.total_medals || 0}</p>
            <p className="text-sm text-gray-600">Ibihembo</p>
          </CardContent>
        </Card>
        <Card className="border-2 border-yellow-100 shadow-xl">
          <CardContent className="p-6 text-center">
            <BarChart3 className="w-12 h-12 mx-auto text-yellow-600 mb-2" />
            <p className="text-3xl font-black text-yellow-900">{selectedChild?.rank || 'N/A'}</p>
            <p className="text-sm text-gray-600">Umwanya mu Ishuri</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-2 border-purple-100 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 border-b-2 border-purple-100">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Raporo y'Umwana: {selectedChild?.name}
              </CardTitle>
              <CardDescription>Amakuru yose yerekeranye n'iterambere ry'umwana</CardDescription>
            </div>
            <Button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white" onClick={() => generatePDF('Complete')}>
              <Download className="w-4 h-4 mr-2" />
              Kurura Raporo Yuzuye
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-600" />
                Imikorere mu Masomo
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">Impera y'Amanota</span>
                    <span className="font-bold text-purple-600">{averageGrade.toFixed(1)}%</span>
                  </div>
                  <Progress value={averageGrade} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">Amasomo Yose</span>
                    <span className="font-bold">{academicReport?.grades?.length || 0}</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">Amanota Meza (≥60%)</span>
                    <span className="font-bold text-green-600">
                      {academicReport?.grades?.filter((g: any) => (g.obtained_marks / g.max_marks * 100) >= 60).length || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Kwitabira Amasomo
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">Kwitabira Rusange</span>
                    <span className="font-bold text-blue-600">{attendanceRate.toFixed(1)}%</span>
                  </div>
                  <Progress value={attendanceRate} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">Iminsi Yitabye</span>
                    <span className="font-bold text-green-600">{attendanceReport?.summary?.present || 0}</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">Iminsi Yibagiwe</span>
                    <span className="font-bold text-red-600">{attendanceReport?.summary?.absent || 0}</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">Yatinze</span>
                    <span className="font-bold text-yellow-600">{attendanceReport?.summary?.late || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="academic" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 h-auto p-1 bg-white border-2 border-purple-100 rounded-2xl shadow-lg">
          <TabsTrigger value="academic" className="rounded-xl py-3 data-[state=active]:bg-purple-600 data-[state=active]:text-white">
            <Award className="w-4 h-4 mr-2" />
            Raporo y'Amasomo
          </TabsTrigger>
          <TabsTrigger value="attendance" className="rounded-xl py-3 data-[state=active]:bg-purple-600 data-[state=active]:text-white">
            <Calendar className="w-4 h-4 mr-2" />
            Raporo y'Kwitabira
          </TabsTrigger>
          <TabsTrigger value="performance" className="rounded-xl py-3 data-[state=active]:bg-purple-600 data-[state=active]:text-white">
            <TrendingUp className="w-4 h-4 mr-2" />
            Raporo y'Imikorere
          </TabsTrigger>
        </TabsList>

        <TabsContent value="academic">
          <Card className="border-2 border-purple-100 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 border-b-2 border-purple-100">
              <div className="flex justify-between items-center">
                <CardTitle>Raporo y'Amasomo</CardTitle>
                <Button variant="outline" onClick={() => generatePDF('Academic')}>
                  <Download className="w-4 h-4 mr-2" />
                  Kurura PDF
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl text-center">
                    <p className="text-4xl font-black text-purple-900">{averageGrade.toFixed(1)}%</p>
                    <p className="text-sm text-purple-700 mt-1">Impera</p>
                  </div>
                  <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl text-center">
                    <p className="text-4xl font-black text-green-900">
                      {academicReport?.grades?.filter((g: any) => (g.obtained_marks / g.max_marks * 100) >= 60).length || 0}
                    </p>
                    <p className="text-sm text-green-700 mt-1">Amanota Meza</p>
                  </div>
                  <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl text-center">
                    <p className="text-4xl font-black text-blue-900">{academicReport?.grades?.length || 0}</p>
                    <p className="text-sm text-blue-700 mt-1">Amasomo Yose</p>
                  </div>
                </div>
                <p className="text-gray-600 italic">
                  Raporo irambuye y'amanota y'umwana wawe ku masomo yose yize muri semester iyi.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance">
          <Card className="border-2 border-purple-100 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 border-b-2 border-purple-100">
              <div className="flex justify-between items-center">
                <CardTitle>Raporo y'Kwitabira</CardTitle>
                <Button variant="outline" onClick={() => generatePDF('Attendance')}>
                  <Download className="w-4 h-4 mr-2" />
                  Kurura PDF
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="grid md:grid-cols-4 gap-6">
                  <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl text-center">
                    <p className="text-4xl font-black text-green-900">{attendanceReport?.summary?.present || 0}</p>
                    <p className="text-sm text-green-700 mt-1">Yitabye</p>
                  </div>
                  <div className="p-6 bg-gradient-to-br from-red-50 to-red-100 rounded-xl text-center">
                    <p className="text-4xl font-black text-red-900">{attendanceReport?.summary?.absent || 0}</p>
                    <p className="text-sm text-red-700 mt-1">Yibagiwe</p>
                  </div>
                  <div className="p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl text-center">
                    <p className="text-4xl font-black text-yellow-900">{attendanceReport?.summary?.late || 0}</p>
                    <p className="text-sm text-yellow-700 mt-1">Yatinze</p>
                  </div>
                  <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl text-center">
                    <p className="text-4xl font-black text-blue-900">{attendanceRate.toFixed(1)}%</p>
                    <p className="text-sm text-blue-700 mt-1">Impera</p>
                  </div>
                </div>
                <p className="text-gray-600 italic">
                  Raporo irambuye y'uko umwana wawe yitabiriye amasomo ku minsi yose.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <Card className="border-2 border-purple-100 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 border-b-2 border-purple-100">
              <div className="flex justify-between items-center">
                <CardTitle>Raporo y'Imikorere Rusange</CardTitle>
                <Button variant="outline" onClick={() => generatePDF('Performance')}>
                  <Download className="w-4 h-4 mr-2" />
                  Kurura PDF
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-8 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                    <h4 className="font-bold text-purple-900 mb-4 flex items-center gap-2">
                      <Award className="w-5 h-5" />
                      Imikorere mu Masomo
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Impera y'Amanota:</span>
                        <Badge className="bg-purple-600">{averageGrade.toFixed(1)}%</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Umwanya:</span>
                        <Badge className="bg-purple-600">{selectedChild?.rank || 'N/A'}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Ibihembo:</span>
                        <Badge className="bg-purple-600">{selectedChild?.total_medals || 0}</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="p-8 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                    <h4 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Kwitabira n'Imyitwarire
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Kwitabira:</span>
                        <Badge className="bg-blue-600">{attendanceRate.toFixed(1)}%</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Imyitwarire:</span>
                        <Badge className="bg-blue-600">{selectedChild?.conduct_score || 100}/100</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Ibihano:</span>
                        <Badge className="bg-blue-600">{selectedChild?.disciplinary_issues || 0}</Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-white rounded-xl border-2 border-purple-100">
                  <h4 className="font-bold text-gray-900 mb-3">Icyifuzo cy'Umwarimu</h4>
                  <p className="text-gray-700 italic">
                    "{selectedChild?.name} ni umunyeshuri mwiza cyane, akora neza mu masomo kandi yitabira neza. Komeza gutyo!"
                  </p>
                  <div className="flex items-center gap-2 mt-4 text-sm text-gray-500">
                    <User className="w-4 h-4" />
                    <span>Umwarimu Mukuru</span>
                  </div>
                </div>

                <p className="text-gray-600 italic">
                  Raporo irambuye y'imikorere rusange y'umwana wawe mu ishuri.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
