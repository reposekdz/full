import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Phone, Mail, MessageSquare, ArrowLeft, Send, Loader2 } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Textarea } from '@/app/components/ui/textarea';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';

export default function ContactStaff() {
  const [message, setMessage] = useState('');
  const [subject, setSubject] = useState('');
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);

  const staffContacts = [
    {
      role: 'Director of Studies (DOS)',
      name: 'Mr. NIYONZIMA Jean',
      phone: '+250 788 123 456',
      email: 'dos@garden.rw',
      icon: '👨‍🏫'
    },
    {
      role: 'Director of Discipline (DOD)',
      name: 'Mrs. UWASE Marie',
      phone: '+250 788 234 567',
      email: 'dod@garden.rw',
      icon: '👮‍♀️'
    },
    {
      role: 'Headmaster',
      name: 'Dr. MUGISHA Patrick',
      phone: '+250 788 345 678',
      email: 'headmaster@garden.rw',
      icon: '🎓'
    }
  ];

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    
    // Simulate sending
    setTimeout(() => {
      setSending(false);
      setSuccess(true);
      setMessage('');
      setSubject('');
      
      setTimeout(() => setSuccess(false), 3000);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-yellow-400 to-green-500 p-4">
      <div className="max-w-4xl mx-auto py-8">
        {/* Back Button */}
        <Button
          onClick={() => window.history.back()}
          className="mb-6 bg-white text-green-600 hover:bg-gray-100"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Subira
        </Button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-2xl p-8 mb-6"
        >
          <h1 className="text-3xl font-bold text-green-600 mb-2">
            📞 Gufashwa Nabakozi
          </h1>
          <p className="text-gray-600">
            Hamagara cyangwa ohereze ubutumwa ku bakozi b'ishuri
          </p>
        </motion.div>

        {/* Staff Contacts */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          {staffContacts.map((staff, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="text-4xl mb-2 text-center">{staff.icon}</div>
                  <CardTitle className="text-center text-sm">{staff.role}</CardTitle>
                  <p className="text-center font-semibold text-green-600">{staff.name}</p>
                </CardHeader>
                <CardContent className="space-y-2">
                  <a
                    href={`tel:${staff.phone}`}
                    className="flex items-center gap-2 text-sm hover:text-green-600 transition"
                  >
                    <Phone className="w-4 h-4" />
                    {staff.phone}
                  </a>
                  <a
                    href={`mailto:${staff.email}`}
                    className="flex items-center gap-2 text-sm hover:text-green-600 transition"
                  >
                    <Mail className="w-4 h-4" />
                    {staff.email}
                  </a>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Message Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-2xl p-8"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-green-600" />
            Ohereza Ubutumwa
          </h2>

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
              ✅ Ubutumwa bwoherejwe neza! Tuzagusubiza vuba.
            </div>
          )}

          <form onSubmit={handleSendMessage} className="space-y-4">
            <div>
              <Label htmlFor="subject">Ingingo *</Label>
              <Input
                id="subject"
                placeholder="Urugero: Ikibazo cyo guhuza n'umwana"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="message">Ubutumwa *</Label>
              <Textarea
                id="message"
                placeholder="Andika ikibazo cyawe hano..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={6}
                className="mt-1"
              />
            </div>

            <Button
              type="submit"
              disabled={sending}
              className="w-full bg-gradient-to-r from-green-500 to-yellow-500 hover:from-green-600 hover:to-yellow-600 text-white font-semibold py-6 text-lg"
            >
              {sending ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Tegereza...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Ohereza Ubutumwa
                </>
              )}
            </Button>
          </form>
        </motion.div>

        {/* Quick Help */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-blue-50 border border-blue-200 rounded-xl p-6 mt-6"
        >
          <h3 className="font-bold text-blue-800 mb-3">💡 Ubufasha Bwihuse</h3>
          <ul className="space-y-2 text-sm text-blue-700">
            <li>• Niba udashobora guhuza n'umwana, reba neza amazina n'umwuga</li>
            <li>• Hamagara DOS cyangwa DOD niba hari ikibazo</li>
            <li>• Ohereza email kuri headmaster@garden.rw</li>
            <li>• Sura ishuri: KG 123 St, Kigali</li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
}
