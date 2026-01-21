import React, { useState } from 'react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin, Send, Navigation, ExternalLink, Maximize2 } from 'lucide-react';
import { motion } from 'motion/react';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Card, CardContent } from '@/app/components/ui/card';

interface FooterProps {
  onNavigate: (page: string) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { t } = useLanguage();
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Thank you for subscribing!');
    setEmail('');
  };

  const openInGoogleMaps = () => {
    window.open('https://www.google.com/maps/place/school/@-2.147160782320079,30.56593116685559,20z', '_blank');
  };

  return (
    <footer className="bg-gradient-to-br from-yellow-500 via-green-500 to-yellow-600 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-black mb-4 text-white drop-shadow-lg">{t('quickLinks')}</h3>
            <ul className="space-y-2">
              {['home', 'sports', 'services', 'trades', 'contactUs', 'supports'].map((link) => (
                <li key={link}>
                  <button
                    onClick={() => onNavigate(link)}
                    className="hover:text-yellow-100 transition-colors text-white/90 hover:underline hover:translate-x-1 transform transition-transform duration-200 block"
                  >
                    {t(link)}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-black mb-4 text-white drop-shadow-lg">{t('contactInfo')}</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <Phone className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                <span className="text-white/90">+250 788 987 830</span>
              </div>
              <div className="flex items-start space-x-2">
                <Mail className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                <span className="text-white/90">info@gardentvet.rw</span>
              </div>
              <div className="flex items-start space-x-2">
                <MapPin className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                <span className="text-white/90">Kigali, Rwanda</span>
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-black mb-4 text-white drop-shadow-lg">{t('newsletter')}</h3>
            <p className="text-white/80 mb-4">Subscribe to our newsletter for updates</p>
            <form onSubmit={handleSubscribe} className="flex space-x-2">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('email')}
                className="bg-white/20 border-white/30 text-white placeholder-white/60 focus:bg-white/30 focus:border-white/50 backdrop-blur-sm"
                required
              />
              <Button type="submit" className="bg-white text-yellow-600 hover:bg-yellow-100 hover:text-yellow-700 font-bold shadow-lg">
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </div>

        {/* Interactive Map Section */}
        <div className="mt-12">
          <Card className="border-2 border-white/30 bg-white/10 backdrop-blur-md overflow-hidden shadow-2xl">
            <CardContent className="p-0">
              <div className="bg-gradient-to-r from-white/20 to-white/10 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white drop-shadow-lg">Visit Our Campus</h3>
                    <p className="text-white/80 text-sm">Kigali, Rwanda - Find us on the map</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={openInGoogleMaps}
                    variant="outline"
                    className="border-white/50 text-white hover:bg-white hover:text-yellow-600 backdrop-blur-sm"
                  >
                    <Navigation className="w-4 h-4 mr-2" />
                    Get Directions
                  </Button>
                  <Button
                    onClick={() => setIsMapExpanded(true)}
                    variant="outline"
                    className="border-white/50 text-white hover:bg-white hover:text-yellow-600 backdrop-blur-sm"
                  >
                    <Maximize2 className="w-4 h-4 mr-2" />
                    Expand Map
                  </Button>
                </div>
              </div>
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none" />
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d647.7129128267301!2d30.56593116685559!3d-2.147160782320079!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x19c4cb37e426c625%3A0x7221b435a93126ba!2sschool!5e1!3m2!1sen!2srw!4v1769014643169!5m2!1sen!2srw"
                  width="100%"
                  height="400"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="transition-all duration-300 group-hover:brightness-110"
                />
              </div>
              <div className="bg-gradient-to-r from-white/10 to-white/5 px-6 py-3 flex items-center justify-between">
                <div className="flex items-center space-x-6 text-sm text-white/80">
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4" />
                    <span>+250 788 987 830</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4" />
                    <span>info@gardentvet.rw</span>
                  </div>
                </div>
                <Button
                  onClick={openInGoogleMaps}
                  size="sm"
                  className="bg-white/20 hover:bg-white text-white hover:text-yellow-600 backdrop-blur-sm"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open in Google Maps
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Expanded Map Dialog */}
        <Dialog open={isMapExpanded} onOpenChange={setIsMapExpanded}>
          <DialogContent className="max-w-6xl h-[90vh] p-0">
            <DialogHeader className="px-6 py-4 border-b">
              <DialogTitle className="flex items-center space-x-3">
                <MapPin className="w-6 h-6 text-yellow-600" />
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
            <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 text-yellow-600" />
                  <span className="font-semibold">Kigali, Rwanda</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4 text-green-600" />
                  <span>+250 788 987 830</span>
                </div>
              </div>
              <Button
                onClick={openInGoogleMaps}
                className="bg-gradient-to-r from-yellow-500 to-green-500 hover:from-yellow-600 hover:to-green-600 text-white"
              >
                <Navigation className="w-4 h-4 mr-2" />
                Get Directions
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Social Media & Copyright */}
        <div className="mt-12 pt-8 border-t border-white/20">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex space-x-4">
              <motion.a
                whileHover={{ scale: 1.2, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                href="#"
                className="w-10 h-10 bg-white/20 hover:bg-white hover:text-yellow-600 text-white rounded-full flex items-center justify-center transition-all backdrop-blur-sm shadow-lg"
              >
                <Facebook className="w-5 h-5" />
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.2, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                href="#"
                className="w-10 h-10 bg-white/20 hover:bg-white hover:text-yellow-600 text-white rounded-full flex items-center justify-center transition-all backdrop-blur-sm shadow-lg"
              >
                <Twitter className="w-5 h-5" />
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.2, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                href="#"
                className="w-10 h-10 bg-white/20 hover:bg-white hover:text-yellow-600 text-white rounded-full flex items-center justify-center transition-all backdrop-blur-sm shadow-lg"
              >
                <Instagram className="w-5 h-5" />
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.2, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                href="#"
                className="w-10 h-10 bg-white/20 hover:bg-white hover:text-yellow-600 text-white rounded-full flex items-center justify-center transition-all backdrop-blur-sm shadow-lg"
              >
                <Youtube className="w-5 h-5" />
              </motion.a>
            </div>

            <p className="text-white/90 font-medium">
              © 2026 Garden TVET School. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
