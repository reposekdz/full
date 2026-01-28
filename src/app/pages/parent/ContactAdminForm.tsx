import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Send, User, MessageSquare, Phone, Mail, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import apiService from '@/app/services/apiService';

export default function ContactAdminForm() {
  const [formData, setFormData] = useState({
    student_name: '',
    message: '',
    preferred_contact: 'email'
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.student_name.trim() || !formData.message.trim()) {
      setStatus('error');
      setErrorMessage('Uzuza ibibazwa byose');
      return;
    }

    try {
      setLoading(true);
      setStatus('idle');
      const response = await apiService.requestLinkingCodeHelp(formData);
      
      if (response.success) {
        setStatus('success');
        setFormData({
          student_name: '',
          message: '',
          preferred_contact: 'email'
        });
      } else {
        setStatus('error');
        setErrorMessage(response.message || 'Byanze kohereza');
      }
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.message || 'Byanze kohereza');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-8 bg-gradient-to-br from-purple-50 via-white to-blue-50 min-h-screen">
      <div>
        <h1 className="text-4xl font-black bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Vugisha Admin
        </h1>
        <p className="text-gray-600">Saba ubufasha bwo kubona kode yo guhuza n'umwana wawe</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card className="border-2 border-purple-100 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 border-b-2 border-purple-100">
            <CardTitle className="flex items-center gap-2">
              <Send className="w-6 h-6 text-purple-600" />
              Kohereza Ubutumwa
            </CardTitle>
            <CardDescription>
              Andika amazina y'umwana n'ubutumwa bwawe. Admin, Headmaster, cyangwa DOS bazagusubiza vuba.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="student_name" className="flex items-center gap-2">
                  <User className="w-4 h-4 text-purple-600" />
                  Amazina y'Umwana
                </Label>
                <Input
                  id="student_name"
                  placeholder="Andika amazina y'umwana wawe..."
                  value={formData.student_name}
                  onChange={(e) => setFormData({ ...formData, student_name: e.target.value })}
                  className="border-2 border-purple-100 focus:border-purple-500"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-purple-600" />
                  Ubutumwa
                </Label>
                <Textarea
                  id="message"
                  placeholder="Andika ubutumwa bwawe hano... Sobanura neza icyo usaba..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="border-2 border-purple-100 focus:border-purple-500 min-h-[150px]"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="preferred_contact">Uburyo Wakwishyuriweho</Label>
                <Select 
                  value={formData.preferred_contact} 
                  onValueChange={(value) => setFormData({ ...formData, preferred_contact: value })}
                  disabled={loading}
                >
                  <SelectTrigger className="border-2 border-purple-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Email
                      </div>
                    </SelectItem>
                    <SelectItem value="phone">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        Telefoni
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {status === 'success' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2 p-4 bg-green-50 text-green-700 rounded-lg border-2 border-green-200"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <div>
                    <p className="font-semibold">Byakozwe neza!</p>
                    <p className="text-sm">Ubutumwa bwawe bwoherejwe. Uzasubizwa vuba.</p>
                  </div>
                </motion.div>
              )}

              {status === 'error' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2 p-4 bg-red-50 text-red-700 rounded-lg border-2 border-red-200"
                >
                  <AlertCircle className="w-5 h-5" />
                  <div>
                    <p className="font-semibold">Byanze!</p>
                    <p className="text-sm">{errorMessage}</p>
                  </div>
                </motion.div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white"
              >
                {loading ? 'Gukohereza...' : 'Kohereza Ubutumwa'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-2 border-blue-100 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardTitle className="text-blue-900">Uburyo Ibizakubera</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Kohereza Ubutumwa</h3>
                  <p className="text-sm text-gray-600">
                    Uzuza ifishi hejuru ukagisha button yo kohereza
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Admin Azabona</h3>
                  <p className="text-sm text-gray-600">
                    Admin, Headmaster, cyangwa DOS bazabona ubutumwa bwawe ako kanya
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Uzasubizwa</h3>
                  <p className="text-sm text-gray-600">
                    Bazagusubiza kuri telefoni cyangwa email bahe kode yo guhuza
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-yellow-100 shadow-xl bg-yellow-50">
            <CardContent className="p-6">
              <div className="flex gap-3">
                <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-yellow-900 mb-2">Icyitonderwa</h3>
                  <p className="text-sm text-yellow-800">
                    Kode yo guhuza n'umwana wawe itangwa n'abayobozi b'ishuri gusa. 
                    Nta wundi uyishobora kuguha. Ubundi, reba ko amazina y'umwana wawe ari yo ukandika neza.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
