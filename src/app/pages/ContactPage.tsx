import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mail, Phone, MapPin, Send, Clock, MessageCircle, FileText, User, 
  Building2, Facebook, Twitter, Instagram, Linkedin, Youtube, 
  CheckCircle2, AlertCircle, Upload, X, Calendar, Globe, MessageSquare,
  Headphones, HelpCircle, FileQuestion, Zap, ArrowRight, MapPinned
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

  const departments = [
    { value: 'admissions', label: 'Admissions Office', icon: Building2 },
    { value: 'academics', label: 'Academic Affairs', icon: FileText },
    { value: 'finance', label: 'Finance Department', icon: FileText },
    { value: 'student-services', label: 'Student Services', icon: User },
    { value: 'technical-support', label: 'Technical Support', icon: Headphones },
    { value: 'general', label: 'General Inquiry', icon: MessageCircle }
  ];

  const faqs: FAQ[] = [
    { 
      id: 1, 
      question: 'What are the admission requirements?', 
      answer: 'To apply for admission, you need a completed O-Level certificate, national ID, passport photos, and birth certificate. Visit our Admissions Office for detailed requirements.',
      category: 'Admissions'
    },
    { 
      id: 2, 
      question: 'How can I pay school fees?', 
      answer: 'School fees can be paid through Mobile Money (MTN Mobile Money, Airtel Money), bank transfer, or at our Finance Office. You can also set up installment plans.',
      category: 'Finance'
    },
    { 
      id: 3, 
      question: 'What programs do you offer?', 
      answer: 'We offer technical programs in Software Development, Building Construction, and Automobile Technology. Each program is 3 years with both theoretical and practical training.',
      category: 'Academics'
    },
    { 
      id: 4, 
      question: 'What are the office hours?', 
      answer: 'Our offices are open Monday to Friday, 8:00 AM to 5:00 PM, and Saturday 9:00 AM to 1:00 PM. We are closed on Sundays and public holidays.',
      category: 'General'
    },
    { 
      id: 5, 
      question: 'How do I access my student portal?', 
      answer: 'Visit our website and click on "Student Portal" in the header. Use your student ID and password provided during registration. Contact IT support if you face login issues.',
      category: 'Technical'
    },
    { 
      id: 6, 
      question: 'Is there accommodation available?', 
      answer: 'Yes, we have on-campus dormitories for both male and female students. Accommodation fees are separate from tuition. Contact Student Services for availability and booking.',
      category: 'Student Services'
    }
  ];

  const officeHours = [
    { day: 'Monday - Friday', hours: '8:00 AM - 5:00 PM', status: 'open' },
    { day: 'Saturday', hours: '9:00 AM - 1:00 PM', status: 'open' },
    { day: 'Sunday', hours: 'Closed', status: 'closed' }
  ];

  const contactMethods = [
    {
      icon: Phone,
      title: 'Phone Support',
      description: 'Call us during office hours',
      value: '+250 788 987 830',
      action: 'tel:+250788987830',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: Mail,
      title: 'Email Us',
      description: 'We respond within 24 hours',
      value: 'info@gardentvet.rw',
      action: 'mailto:info@gardentvet.rw',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: MessageCircle,
      title: 'Live Chat',
      description: 'Chat with our support team',
      value: 'Start Chat',
      action: 'chat',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: MapPin,
      title: 'Visit Us',
      description: 'Main Campus Location',
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
            24/7 Support Available
          </Badge>
          <h1 className="text-6xl font-black mb-6 bg-gradient-to-r from-yellow-600 to-green-600 bg-clip-text text-transparent">
            GET IN TOUCH
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            We're here to help! Choose your preferred way to reach us and we'll respond as quickly as possible.
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
              Contact Form
            </TabsTrigger>
            <TabsTrigger value="callback" className="text-lg">
              <Phone className="w-5 h-5 mr-2" />
              Request Callback
            </TabsTrigger>
            <TabsTrigger value="faq" className="text-lg">
              <HelpCircle className="w-5 h-5 mr-2" />
              FAQ
            </TabsTrigger>
          </TabsList>

          <TabsContent value="contact-form">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Card className="shadow-2xl">
                  <CardHeader>
                    <CardTitle className="text-3xl">Send us a Message</CardTitle>
                    <CardDescription>Fill out the form below and we'll get back to you within 24 hours</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Full Name *</Label>
                          <Input
                            id="name"
                            placeholder="John Doe"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Email Address *</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="john@example.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                            className="mt-1"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="phone">Phone Number *</Label>
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
                          <Label htmlFor="department">Department *</Label>
                          <Select
                            value={formData.department}
                            onValueChange={(value) => setFormData({ ...formData, department: value })}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select department" />
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
                          <Label htmlFor="subject">Subject *</Label>
                          <Input
                            id="subject"
                            placeholder="How can we help you?"
                            value={formData.subject}
                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                            required
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="priority">Priority Level</Label>
                          <Select
                            value={formData.priority}
                            onValueChange={(value) => setFormData({ ...formData, priority: value })}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="normal">Normal</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="urgent">Urgent</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="message">Message *</Label>
                        <Textarea
                          id="message"
                          rows={6}
                          placeholder="Please provide details about your inquiry..."
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          required
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="attachment">Attachment (Optional)</Label>
                        <div className="mt-1">
                          {!formData.attachment ? (
                            <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-yellow-500 transition-colors">
                              <div className="text-center">
                                <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                                <p className="text-sm text-gray-600">Click to upload file</p>
                                <p className="text-xs text-gray-400">Max size: 5MB</p>
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
                          <>Processing...</>
                        ) : (
                          <>
                            <Send className="w-5 h-5 mr-2" />
                            Send Message
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
                      Office Hours
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
                      Follow Us
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
                <CardTitle className="text-3xl">Request a Callback</CardTitle>
                <CardDescription>
                  Can't reach us right now? Request a callback and we'll call you at your preferred time.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCallbackRequest} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="cb-name">Full Name *</Label>
                      <Input
                        id="cb-name"
                        value={callbackData.name}
                        onChange={(e) => setCallbackData({ ...callbackData, name: e.target.value })}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="cb-phone">Phone Number *</Label>
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
                      <Label htmlFor="cb-date">Preferred Date *</Label>
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
                      <Label htmlFor="cb-time">Preferred Time *</Label>
                      <Select
                        value={callbackData.preferredTime}
                        onValueChange={(value) => setCallbackData({ ...callbackData, preferredTime: value })}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select time" />
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
                    <Label htmlFor="cb-reason">Reason for Callback *</Label>
                    <Textarea
                      id="cb-reason"
                      rows={4}
                      placeholder="Please tell us why you need a callback..."
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
                    {isSubmitting ? 'Submitting...' : 'Request Callback'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="faq">
            <div className="max-w-4xl mx-auto">
              <Card className="shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-3xl">Frequently Asked Questions</CardTitle>
                  <CardDescription>Find quick answers to common questions</CardDescription>
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
                    <h4 className="font-semibold text-lg mb-2">Still have questions?</h4>
                    <p className="text-gray-600 mb-4">
                      Can't find what you're looking for? Contact us directly and we'll be happy to help.
                    </p>
                    <Button className="bg-gradient-to-r from-yellow-500 to-green-500 hover:from-yellow-600 hover:to-green-600">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Contact Support
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

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
