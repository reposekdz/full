import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mail, Phone, MapPin, Send, Clock, MessageCircle, FileText, User, 
  Building2, Facebook, Twitter, Instagram, Linkedin, Youtube, 
  CheckCircle2, AlertCircle, Upload, X, Calendar, Globe, MessageSquare,
  Headphones, HelpCircle, FileQuestion, Zap, ArrowRight, MapPinned,
  Navigation, ExternalLink, Maximize2
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Label } from '@/app/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Badge } from '@/app/components/ui/badge';
import { Separator } from '@/app/components/ui/separator';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { apiService } from '@/app/services/apiService';

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  department: string;
  subject: string;
  message: string;
  priority: string;
  attachment?: File | null;
}

interface CallbackRequest {
  name: string;
  phone: string;
  preferredTime: string;
  preferredDate: string;
  reason: string;
}

interface FAQ {
  id: number;
  question: string;
  answer: string;
  category: string;
}

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    department: '',
    subject: '',
    message: '',
    priority: 'normal',
    attachment: null
  });
  
  const [callbackData, setCallbackData] = useState<CallbackRequest>({
    name: '',
    phone: '',
    preferredTime: '',
    preferredDate: '',
    reason: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [liveChatOpen, setLiveChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{sender: string, message: string, time: string}>>([]);
  const [chatInput, setChatInput] = useState('');
  const [isMapExpanded, setIsMapExpanded] = useState(false);

  const departments = [
    { value: 'admissions', label: 'Ibiro by\'Injira', icon: Building2 },
    { value: 'academics', label: 'Amasomo', icon: FileText },
    { value: 'finance', label: 'Amafaranga', icon: FileText },
    { value: 'student-services', label: 'Serivisi z\'Abanyeshuri', icon: User },
    { value: 'technical-support', label: 'Ubufasha bwa Tekiniki', icon: Headphones },
    { value: 'general', label: 'Ibibazo Rusange', icon: MessageCircle }
  ];

  const faqs: FAQ[] = [
    { 
      id: 1, 
      question: 'Ni ibihe bisabwa kugirango winjire?', 
      answer: 'Kugirango usabe kwinjira, ukeneye impamyabumenyi ya O-Level yuzuye, indangamuntu, amafoto ya pasiporo, n\'ibyangombwa by\'amavuko. Sura ibiro by\'injira kugirango ubone ibisobanuro birambuye.',
      category: 'Injira'
    },
    { 
      id: 2, 
      question: 'Nishyura nte amafaranga y\'ishuri?', 
      answer: 'Amafaranga y\'ishuri ashobora kwishyurwa binyuze kuri Mobile Money (MTN Mobile Money, Airtel Money), kwimurika kuri banki, cyangwa mu biro by\'amafaranga. Urashobora kandi gushyiraho gahunda yo kwishyura buhoro buhoro.',
      category: 'Amafaranga'
    },
    { 
      id: 3, 
      question: 'Ni ibihe byigisho mutanga?', 
      answer: 'Dutanga amahugurwa ya tekiniki mu iterambere rya software, kubaka, n\'ikoranabuhanga ry\'imodoka. Buri gahunda imara imyaka 3 hamwe n\'amahugurwa y\'ibitekerezo n\'ibyabugororangingo.',
      category: 'Amasomo'
    },
    { 
      id: 4, 
      question: 'Ni ayahe masaha ibiro bifungura?', 
      answer: 'Ibiro byacu bifungura kuwa mbere kugeza kuwa gatanu, 8:00 AM - 5:00 PM, na kuwa gatandatu 9:00 AM - 1:00 PM. Turafunga ku cyumweru n\'iminsi mikuru.',
      category: 'Rusange'
    },
    { 
      id: 5, 
      question: 'Njya gute kuri portal y\'abanyeshuri?', 
      answer: 'Sura urubuga rwacu kandi ukande kuri "Portal y\'Abanyeshuri" mu mutwe. Koresha ID yawe y\'umunyeshuri n\'ijambo ry\'ibanga wahawe mu gihe cyo kwiyandikisha. Hamagara ubufasha bwa IT niba ugize ikibazo cyo kwinjira.',
      category: 'Tekiniki'
    },
    { 
      id: 6, 
      question: 'Hari aho batuye?', 
      answer: 'Yego, dufite inzu z\'abanyeshuri ku ishuri ku bagabo n\'abakobwa. Amafaranga yo gutura atandukanye n\'amafaranga y\'ishuri. Hamagara serivisi z\'abanyeshuri kugirango umenye aho habonetse no gutumiza.',
      category: 'Serivisi z\'Abanyeshuri'
    }
  ];

  const officeHours = [
    { day: 'Kuwa mbere - Kuwa gatanu', hours: '8:00 AM - 5:00 PM', status: 'open' },
    { day: 'Kuwa gatandatu', hours: '9:00 AM - 1:00 PM', status: 'open' },
    { day: 'Ku cyumweru', hours: 'Bifunze', status: 'closed' }
  ];

  const contactMethods = [
    {
      icon: Phone,
      title: 'Telefone',
      description: 'Duhamagare mu gihe cy\'akazi',
      value: '+250 788 987 830',
      action: 'tel:+250788987830',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: Mail,
      title: 'Imeri',
      description: 'Tuzasubiza mu masaha 24',
      value: 'info@gardentvet.rw',
      action: 'mailto:info@gardentvet.rw',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: MessageCircle,
      title: 'Ikiganiro',
      description: 'Ganira n\'itsinda ryacu',
      value: 'Tangira Ikiganiro',
      action: 'chat',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: MapPin,
      title: 'Dusure',
      description: 'Aho duherereyeho',
      value: 'Kigali, Rwanda',
      action: 'https://maps.google.com',
      color: 'from-orange-500 to-orange-600'
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'attachment' && formData[key]) {
          formDataToSend.append(key, formData[key] as File);
        } else {
          formDataToSend.append(key, formData[key as keyof ContactFormData] as string);
        }
      });

      const response = await apiService.submitContactForm(formDataToSend);

      setSubmitStatus('success');
      setStatusMessage('Your message has been sent successfully! We will get back to you soon.');
      setFormData({
        name: '',
        email: '',
        phone: '',
        department: '',
        subject: '',
        message: '',
        priority: 'normal',
        attachment: null
      });
    } catch (error) {
      setSubmitStatus('error');
      setStatusMessage('Failed to send message. Please try again or contact us directly.');
      console.error('Contact form error:', error);
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setSubmitStatus('idle'), 5000);
    }
  };

  const handleCallbackRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await apiService.requestCallback(callbackData);

      setSubmitStatus('success');
      setStatusMessage('Callback request received! We will call you at your preferred time.');
      setCallbackData({
        name: '',
        phone: '',
        preferredTime: '',
        preferredDate: '',
        reason: ''
      });
    } catch (error) {
      setSubmitStatus('error');
      setStatusMessage('Failed to submit callback request. Please try again.');
      console.error('Callback request error:', error);
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setSubmitStatus('idle'), 5000);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      setFormData({ ...formData, attachment: file });
    }
  };

  const removeAttachment = () => {
    setFormData({ ...formData, attachment: null });
  };

  const handleChatSend = () => {
    if (chatInput.trim()) {
      const newMessage = {
        sender: 'You',
        message: chatInput,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages([...chatMessages, newMessage]);
      setChatInput('');
      
      setTimeout(() => {
        const autoReply = {
          sender: 'Support',
          message: 'Thank you for your message. A support agent will respond shortly.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setChatMessages(prev => [...prev, autoReply]);
      }, 1000);
    }
  };

  const handleContactMethodClick = (action: string) => {
    if (action === 'chat') {
      setLiveChatOpen(true);
    } else if (action.startsWith('http')) {
      window.open(action, '_blank');
    } else if (action.startsWith('tel:') || action.startsWith('mailto:')) {
      window.location.href = action;
    }
  };

  const openInGoogleMaps = () => {
    window.open('https://www.google.com/maps/place/school/@-2.147160782320079,30.56593116685559,20z', '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-24 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <Badge className="mb-4 bg-gradient-to-r from-yellow-500 to-green-500 text-white">
            <Zap className="w-3 h-3 mr-1" />
            Ubufasha 24/7 Burahari
          </Badge>
          <h1 className="text-6xl font-black mb-6 bg-gradient-to-r from-yellow-600 to-green-600 bg-clip-text text-transparent">
            TWANDIKIRE
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Turi hano kugirango tugufashe! Hitamo uburyo bushimishije bwo kutwandikira kandi tuzasubiza vuba bishoboka.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {contactMethods.map((method, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="cursor-pointer"
              onClick={() => handleContactMethodClick(method.action)}
            >
              <Card className="h-full hover:shadow-2xl transition-all border-2 border-transparent hover:border-yellow-400">
                <CardContent className="p-6">
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${method.color} flex items-center justify-center mb-4`}>
                    <method.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{method.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{method.description}</p>
                  <p className="text-lg font-semibold text-gray-800">{method.value}</p>
                  <ArrowRight className="w-5 h-5 text-yellow-600 mt-2" />
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <Tabs defaultValue="contact-form" className="mb-16">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="contact-form" className="text-lg">
              <MessageSquare className="w-5 h-5 mr-2" />
              Ifishi y'Itumanaho
            </TabsTrigger>
            <TabsTrigger value="callback" className="text-lg">
              <Phone className="w-5 h-5 mr-2" />
              Saba Guhamagara
            </TabsTrigger>
            <TabsTrigger value="faq" className="text-lg">
              <HelpCircle className="w-5 h-5 mr-2" />
              Ibibazo Bikunze Kubazwa
            </TabsTrigger>
          </TabsList>

          <TabsContent value="contact-form">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Card className="shadow-2xl">
                  <CardHeader>
                    <CardTitle className="text-3xl">Duhe Ubutumwa</CardTitle>
                    <CardDescription>Uzuza ifishi hepfo kandi tuzakusubiza mu masaha 24</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Amazina Yuzuye *</Label>
                          <Input
                            id="name"
                            placeholder="Izina Ryawe"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Aderesi ya Imeri *</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="imeri@urugero.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                            className="mt-1"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="phone">Nimero ya Telefone *</Label>
                          <Input
                            id="phone"
                            type="tel"
                            placeholder="+250 788 123 456"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            required
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="department">Ishami *</Label>
                          <Select
                            value={formData.department}
                            onValueChange={(value) => setFormData({ ...formData, department: value })}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Hitamo ishami" />
                            </SelectTrigger>
                            <SelectContent>
                              {departments.map(dept => (
                                <SelectItem key={dept.value} value={dept.value}>
                                  {dept.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="subject">Ingingo *</Label>
                          <Input
                            id="subject"
                            placeholder="Twakugufasha gute?"
                            value={formData.subject}
                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                            required
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="priority">Urwego rw'Ibanze</Label>
                          <Select
                            value={formData.priority}
                            onValueChange={(value) => setFormData({ ...formData, priority: value })}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Hasi</SelectItem>
                              <SelectItem value="normal">Bisanzwe</SelectItem>
                              <SelectItem value="high">Hejuru</SelectItem>
                              <SelectItem value="urgent">Byihutirwa</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="message">Ubutumwa *</Label>
                        <Textarea
                          id="message"
                          rows={6}
                          placeholder="Tanga amakuru arambuye ku kibazo cyawe..."
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          required
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="attachment">Inyandiko Yometse (Ntabwo Bisabwa)</Label>
                        <div className="mt-1">
                          {!formData.attachment ? (
                            <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-yellow-500 transition-colors">
                              <div className="text-center">
                                <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                                <p className="text-sm text-gray-600">Kanda kugirango ushyire dosiye</p>
                                <p className="text-xs text-gray-400">Ingano ntarengwa: 5MB</p>
                              </div>
                              <input
                                id="attachment"
                                type="file"
                                className="hidden"
                                onChange={handleFileChange}
                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                              />
                            </label>
                          ) : (
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <FileText className="w-6 h-6 text-blue-600" />
                                <span className="text-sm font-medium">{formData.attachment.name}</span>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={removeAttachment}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>

                      {submitStatus !== 'idle' && (
                        <Alert className={submitStatus === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}>
                          {submitStatus === 'success' ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-red-600" />
                          )}
                          <AlertDescription className={submitStatus === 'success' ? 'text-green-800' : 'text-red-800'}>
                            {statusMessage}
                          </AlertDescription>
                        </Alert>
                      )}

                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-gradient-to-r from-yellow-500 to-green-500 hover:from-yellow-600 hover:to-green-600 text-white h-12 text-lg"
                      >
                        {isSubmitting ? (
                          <>Iratunganywa...</>
                        ) : (
                          <>
                            <Send className="w-5 h-5 mr-2" />
                            Ohereza Ubutumwa
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="bg-gradient-to-br from-yellow-500 to-green-500 text-white shadow-2xl">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Clock className="w-6 h-6 mr-2" />
                      Amasaha y'Akazi
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {officeHours.map((schedule, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="font-semibold">{schedule.day}</span>
                          <Badge className={schedule.status === 'open' ? 'bg-white text-green-600' : 'bg-white text-red-600'}>
                            {schedule.hours}
                          </Badge>
                        </div>
                      ))}
                    </div>
                    <Separator className="my-4 bg-white/30" />
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Phone className="w-5 h-5" />
                        <span>+250 788 987 830</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Mail className="w-5 h-5" />
                        <span>info@gardentvet.rw</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPinned className="w-5 h-5" />
                        <span>Kigali, Rwanda</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Globe className="w-6 h-6 mr-2 text-blue-600" />
                      Dukurikire
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { icon: Facebook, name: 'Facebook', color: 'hover:bg-blue-600' },
                        { icon: Twitter, name: 'Twitter', color: 'hover:bg-sky-500' },
                        { icon: Instagram, name: 'Instagram', color: 'hover:bg-pink-600' },
                        { icon: Linkedin, name: 'LinkedIn', color: 'hover:bg-blue-700' },
                        { icon: Youtube, name: 'YouTube', color: 'hover:bg-red-600' }
                      ].map((social, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          className={`w-full ${social.color} hover:text-white transition-all`}
                        >
                          <social.icon className="w-4 h-4 mr-2" />
                          {social.name}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="callback">
            <Card className="max-w-2xl mx-auto shadow-2xl">
              <CardHeader>
                <CardTitle className="text-3xl">Saba Guhamagara</CardTitle>
                <CardDescription>
                  Ntushobora kutugeraho ubu? Saba guhamagara kandi tuzakuhamagara mu gihe ukunda.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCallbackRequest} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="cb-name">Amazina Yuzuye *</Label>
                      <Input
                        id="cb-name"
                        value={callbackData.name}
                        onChange={(e) => setCallbackData({ ...callbackData, name: e.target.value })}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="cb-phone">Nimero ya Telefone *</Label>
                      <Input
                        id="cb-phone"
                        type="tel"
                        value={callbackData.phone}
                        onChange={(e) => setCallbackData({ ...callbackData, phone: e.target.value })}
                        required
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="cb-date">Itariki Ukunda *</Label>
                      <Input
                        id="cb-date"
                        type="date"
                        value={callbackData.preferredDate}
                        onChange={(e) => setCallbackData({ ...callbackData, preferredDate: e.target.value })}
                        required
                        className="mt-1"
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div>
                      <Label htmlFor="cb-time">Igihe Ukunda *</Label>
                      <Select
                        value={callbackData.preferredTime}
                        onValueChange={(value) => setCallbackData({ ...callbackData, preferredTime: value })}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Hitamo igihe" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="08:00-10:00">8:00 AM - 10:00 AM</SelectItem>
                          <SelectItem value="10:00-12:00">10:00 AM - 12:00 PM</SelectItem>
                          <SelectItem value="12:00-14:00">12:00 PM - 2:00 PM</SelectItem>
                          <SelectItem value="14:00-16:00">2:00 PM - 4:00 PM</SelectItem>
                          <SelectItem value="16:00-17:00">4:00 PM - 5:00 PM</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="cb-reason">Impamvu yo Guhamagara *</Label>
                    <Textarea
                      id="cb-reason"
                      rows={4}
                      placeholder="Tubwire impamvu ukeneye guhamagara..."
                      value={callbackData.reason}
                      onChange={(e) => setCallbackData({ ...callbackData, reason: e.target.value })}
                      required
                      className="mt-1"
                    />
                  </div>

                  {submitStatus !== 'idle' && (
                    <Alert className={submitStatus === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}>
                      {submitStatus === 'success' ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      )}
                      <AlertDescription className={submitStatus === 'success' ? 'text-green-800' : 'text-red-800'}>
                        {statusMessage}
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-yellow-500 to-green-500 hover:from-yellow-600 hover:to-green-600 text-white h-12 text-lg"
                  >
                    {isSubmitting ? 'Iratunganywa...' : 'Saba Guhamagara'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="faq">
            <div className="max-w-4xl mx-auto">
              <Card className="shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-3xl">Ibibazo Bikunze Kubazwa</CardTitle>
                  <CardDescription>Shakisha ibisubizo byihuse ku bibazo bisanzwe</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {faqs.map((faq) => (
                      <motion.div
                        key={faq.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="border-2 border-gray-200 rounded-lg overflow-hidden hover:border-yellow-400 transition-all"
                      >
                        <button
                          onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                          className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-start space-x-3">
                            <FileQuestion className="w-5 h-5 text-yellow-600 mt-1 flex-shrink-0" />
                            <div>
                              <h4 className="font-semibold text-lg">{faq.question}</h4>
                              <Badge variant="outline" className="mt-1">{faq.category}</Badge>
                            </div>
                          </div>
                          <motion.div
                            animate={{ rotate: expandedFAQ === faq.id ? 180 : 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <ArrowRight className="w-5 h-5 text-gray-400 rotate-90" />
                          </motion.div>
                        </button>
                        <AnimatePresence>
                          {expandedFAQ === faq.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="bg-gray-50 px-4 pb-4"
                            >
                              <p className="text-gray-700 pt-2 pl-8">{faq.answer}</p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    ))}
                  </div>
                  <div className="mt-8 p-6 bg-gradient-to-r from-yellow-50 to-green-50 rounded-lg">
                    <h4 className="font-semibold text-lg mb-2">Ufite ibibazo?</h4>
                    <p className="text-gray-600 mb-4">
                      Ntushobora kubona icyo ushaka? Twandikire kandi tuzishimira kukugufasha.
                    </p>
                    <Button className="bg-gradient-to-r from-yellow-500 to-green-500 hover:from-yellow-600 hover:to-green-600">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Hamagara Ubufasha
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Modern Interactive Map Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <Card className="border-2 border-yellow-200 shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-yellow-500 to-green-500 px-8 py-6 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <MapPin className="w-8 h-8 text-white" />
                </div>
                <div className="text-white">
                  <h3 className="text-3xl font-black drop-shadow-lg">Sura Kaminuza Yacu</h3>
                  <p className="text-white/90 text-lg">Kigali, Rwanda - Dusange ku ikarita</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  onClick={openInGoogleMaps}
                  variant="outline"
                  className="border-white/50 bg-white/10 text-white hover:bg-white hover:text-yellow-600 backdrop-blur-sm h-12 px-6"
                >
                  <Navigation className="w-5 h-5 mr-2" />
                  Bona Inzira
                </Button>
                <Button
                  onClick={() => setIsMapExpanded(true)}
                  variant="outline"
                  className="border-white/50 bg-white/10 text-white hover:bg-white hover:text-yellow-600 backdrop-blur-sm h-12 px-6"
                >
                  <Maximize2 className="w-5 h-5 mr-2" />
                  Kwagura Ikarita
                </Button>
              </div>
            </div>
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none" />
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d647.7129128267301!2d30.56593116685559!3d-2.147160782320079!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x19c4cb37e426c625%3A0x7221b435a93126ba!2sschool!5e1!3m2!1sen!2srw!4v1769014643169!5m2!1sen!2srw"
                width="100%"
                height="500"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="transition-all duration-300 group-hover:brightness-110"
              />
            </div>
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-8 py-5 flex items-center justify-between border-t-2 border-yellow-200">
              <div className="flex items-center space-x-8">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-yellow-500 to-green-500 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Duhamagare</p>
                    <p className="text-sm font-bold text-gray-800">+250 788 987 830</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-yellow-500 to-green-500 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Duhe Imeri</p>
                    <p className="text-sm font-bold text-gray-800">info@gardentvet.rw</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-yellow-500 to-green-500 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Aho Duherereyeho</p>
                    <p className="text-sm font-bold text-gray-800">Kigali, Rwanda</p>
                  </div>
                </div>
              </div>
              <Button
                onClick={openInGoogleMaps}
                className="bg-gradient-to-r from-yellow-500 to-green-500 hover:from-yellow-600 hover:to-green-600 text-white h-12 px-6 shadow-lg"
              >
                <ExternalLink className="w-5 h-5 mr-2" />
                Fungura muri Google Maps
              </Button>
            </div>
          </Card>
        </motion.div>

        <Dialog open={isMapExpanded} onOpenChange={setIsMapExpanded}>
          <DialogContent className="max-w-6xl h-[90vh] p-0">
            <DialogHeader className="px-6 py-4 border-b bg-gradient-to-r from-yellow-50 to-green-50">
              <DialogTitle className="flex items-center space-x-3 text-2xl">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-yellow-500 to-green-500 flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <span>Garden TVET School Location</span>
              </DialogTitle>
            </DialogHeader>
            <div className="flex-1 relative">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d647.7129128267301!2d30.56593116685559!3d-2.147160782320079!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x19c4cb37e426c625%3A0x7221b435a93126ba!2sschool!5e1!3m2!1sen!2srw!4v1769014643169!5m2!1sen!2srw"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0"
              />
            </div>
            <div className="px-6 py-4 border-t bg-gradient-to-r from-yellow-50 to-green-50 flex items-center justify-between">
              <div className="flex items-center space-x-8">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-yellow-600" />
                  <span className="font-semibold text-gray-800">Kigali, Rwanda</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-gray-800">+250 788 987 830</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-gray-800">info@gardentvet.rw</span>
                </div>
              </div>
              <Button
                onClick={openInGoogleMaps}
                className="bg-gradient-to-r from-yellow-500 to-green-500 hover:from-yellow-600 hover:to-green-600 text-white h-12 px-6"
              >
                <Navigation className="w-5 h-5 mr-2" />
                Get Directions
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Card className="shadow-2xl bg-gradient-to-r from-gray-900 to-gray-800 text-white">
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-xl font-bold mb-4">Quick Links</h3>
                <div className="space-y-2">
                  <a href="#" className="block hover:text-yellow-400 transition-colors">About Us</a>
                  <a href="#" className="block hover:text-yellow-400 transition-colors">Admissions</a>
                  <a href="#" className="block hover:text-yellow-400 transition-colors">Programs</a>
                  <a href="#" className="block hover:text-yellow-400 transition-colors">Campus Life</a>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-4">Contact Info</h3>
                <div className="space-y-3">
                  <p className="flex items-center"><Phone className="w-4 h-4 mr-2" /> +250 788 987 830</p>
                  <p className="flex items-center"><Mail className="w-4 h-4 mr-2" /> info@gardentvet.rw</p>
                  <p className="flex items-center"><MapPin className="w-4 h-4 mr-2" /> Kigali, Rwanda</p>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-4">Location Map</h3>
                <div className="bg-gray-700 h-32 rounded-lg flex items-center justify-center">
                  <MapPin className="w-8 h-8 text-yellow-400" />
                  <span className="ml-2">Interactive Map</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <AnimatePresence>
        {liveChatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-4 right-4 w-96 bg-white rounded-2xl shadow-2xl border-2 border-yellow-400 overflow-hidden z-50"
          >
            <div className="bg-gradient-to-r from-yellow-500 to-green-500 p-4 flex items-center justify-between text-white">
              <div className="flex items-center space-x-2">
                <Headphones className="w-6 h-6" />
                <div>
                  <h4 className="font-bold">Live Support</h4>
                  <p className="text-xs">We're online now</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLiveChatOpen(false)}
                className="text-white hover:bg-white/20"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="h-96 overflow-y-auto p-4 space-y-3">
              {chatMessages.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Start a conversation</p>
                </div>
              ) : (
                chatMessages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.sender === 'You' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        msg.sender === 'You'
                          ? 'bg-gradient-to-r from-yellow-500 to-green-500 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <p className="text-sm">{msg.message}</p>
                      <p className="text-xs opacity-70 mt-1">{msg.time}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="p-4 border-t">
              <div className="flex space-x-2">
                <Input
                  placeholder="Type your message..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleChatSend()}
                />
                <Button
                  onClick={handleChatSend}
                  className="bg-gradient-to-r from-yellow-500 to-green-500"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!liveChatOpen && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          onClick={() => setLiveChatOpen(true)}
          className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-yellow-500 to-green-500 rounded-full shadow-2xl flex items-center justify-center text-white z-40 hover:shadow-yellow-500/50 transition-all"
        >
          <MessageCircle className="w-8 h-8" />
        </motion.button>
      )}
    </div>
  );
};

export default ContactPage;
