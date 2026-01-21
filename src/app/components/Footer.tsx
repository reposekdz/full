import React from 'react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin, Send } from 'lucide-react';
import { motion } from 'motion/react';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';

interface FooterProps {
  onNavigate: (page: string) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { t } = useLanguage();

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
            <div className="flex space-x-2">
              <Input
                type="email"
                placeholder={t('email')}
                className="bg-white/20 border-white/30 text-white placeholder-white/60 focus:bg-white/30 focus:border-white/50 backdrop-blur-sm"
              />
              <Button className="bg-white text-yellow-600 hover:bg-yellow-100 hover:text-yellow-700 font-bold shadow-lg">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

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
