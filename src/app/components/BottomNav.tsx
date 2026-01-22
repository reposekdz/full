import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, LogIn, Globe, Home, Menu, X, CheckCircle } from 'lucide-react';
import { useLanguage, Language } from '@/app/contexts/LanguageContext';
import { useAuth } from '@/app/contexts/AuthContext';
import { Button } from '@/app/components/ui/button';
import { EnhancedGlobalSearch } from '@/app/components/EnhancedGlobalSearch';

interface BottomNavProps {
  onNavigate: (page: string) => void;
  onSearch: () => void;
  currentPage: string;
}

export const BottomNav: React.FC<BottomNavProps> = ({ onNavigate, onSearch, currentPage }) => {
  const { language, setLanguage } = useLanguage();
  const { user } = useAuth();
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const languages = [
    { code: 'rw', flag: '🇷🇼', name: 'Kinyarwanda' },
    { code: 'en', flag: '🇬🇧', name: 'English' },
    { code: 'fr', flag: '🇫🇷', name: 'Français' },
    { code: 'sw', flag: '🇰🇪', name: 'Kiswahili' }
  ];

  return (
    <>
      {/* Bottom Navigation - Mobile & Tablet Only */}
      <motion.nav
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t-2 border-yellow-300 shadow-2xl safe-area-bottom"
      >
        <div className="grid grid-cols-4 gap-1 p-2">
          {/* Home */}
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={() => onNavigate('home')}
            className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-2xl transition-all ${
              currentPage === 'home'
                ? 'bg-gradient-to-t from-yellow-400 to-green-400 shadow-lg'
                : 'hover:bg-gray-100 active:bg-gray-200'
            }`}
          >
            <motion.div
              animate={currentPage === 'home' ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.3 }}
              className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                currentPage === 'home' ? 'bg-white/20' : 'bg-gray-100'
              }`}
            >
              <Home className={`w-6 h-6 ${currentPage === 'home' ? 'text-white' : 'text-gray-700'}`} />
            </motion.div>
            <span className={`text-xs font-bold ${currentPage === 'home' ? 'text-white' : 'text-gray-600'}`}>
              Home
            </span>
          </motion.button>

          {/* Search */}
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={() => setShowSearch(true)}
            className="flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-2xl hover:bg-gray-100 active:bg-gray-200 transition-all"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center shadow-md">
              <Search className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs font-bold text-gray-600">Search</span>
          </motion.button>

          {/* Login/Profile */}
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={() => onNavigate(user ? 'dashboard' : 'login')}
            className="flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-2xl hover:bg-gray-100 active:bg-gray-200 transition-all"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-green-400 to-teal-400 flex items-center justify-center shadow-md">
              <LogIn className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs font-bold text-gray-600">{user ? 'Profile' : 'Login'}</span>
          </motion.button>

          {/* Language */}
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={() => setShowLangMenu(true)}
            className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-2xl transition-all ${
              showLangMenu ? 'bg-blue-50' : 'hover:bg-gray-100 active:bg-gray-200'
            }`}
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-400 flex items-center justify-center shadow-md">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs font-bold text-gray-600">Lang</span>
          </motion.button>
        </div>
      </motion.nav>

      {/* Search Modal */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 z-[60] bg-white"
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b-2 border-yellow-200">
                <h2 className="text-xl font-black text-gray-900">Search</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowSearch(false)}
                  className="rounded-full"
                >
                  <X className="w-6 h-6" />
                </Button>
              </div>
              <div className="flex-1 overflow-auto p-4">
                <EnhancedGlobalSearch onNavigate={(page) => {
                  onNavigate(page);
                  setShowSearch(false);
                }} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Language Selection Modal */}
      <AnimatePresence>
        {showLangMenu && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[55]"
              onClick={() => setShowLangMenu(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="md:hidden fixed bottom-0 left-0 right-0 z-[60] bg-white rounded-t-3xl shadow-2xl"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-black text-gray-900">Select Language</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowLangMenu(false)}
                    className="rounded-full"
                  >
                    <X className="w-6 h-6" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {languages.map((lang) => (
                    <motion.button
                      key={lang.code}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setLanguage(lang.code as Language);
                        setShowLangMenu(false);
                      }}
                      className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all ${
                        language === lang.code
                          ? 'border-yellow-400 bg-gradient-to-r from-yellow-50 to-green-50 shadow-lg scale-105'
                          : 'border-gray-200 hover:border-yellow-300 hover:bg-gray-50 active:scale-95'
                      }`}
                    >
                      <span className="text-4xl">{lang.flag}</span>
                      <div className="text-left flex-1">
                        <p className={`font-bold text-sm ${
                          language === lang.code ? 'text-yellow-700' : 'text-gray-900'
                        }`}>
                          {lang.name}
                        </p>
                        {language === lang.code && (
                          <div className="flex items-center gap-1 mt-1">
                            <CheckCircle className="w-3 h-3 text-green-600" />
                            <span className="text-xs text-green-600 font-semibold">Active</span>
                          </div>
                        )}
                      </div>
                    </motion.button>
                  ))}
                </div>
                <div className="h-6" />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Spacer */}
      <div className="md:hidden h-20" />
    </>
  );
};
