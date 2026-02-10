import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/app/contexts/AuthContext';
import ModernUniversalSidebar from './ModernUniversalSidebar';

interface GlobalMobileMenuProps {
  currentPage?: string;
  onNavigate?: (page: string) => void;
}

export const GlobalMobileMenu: React.FC<GlobalMobileMenuProps> = ({ currentPage, onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();

  // Only show for authenticated users
  if (!user) return null;

  return (
    <>
      {/* Mobile Menu Button - Fixed Position */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 w-12 h-12 bg-gradient-to-br from-yellow-500 to-green-500 rounded-xl shadow-xl flex items-center justify-center text-white hover:shadow-2xl transition-all hover:scale-105"
        aria-label="Open Menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/50 z-[60]"
            />

            {/* Sidebar */}
            <motion.div
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-80 bg-white z-[70] shadow-2xl overflow-hidden"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 z-10 w-10 h-10 bg-red-500 rounded-lg shadow-lg flex items-center justify-center text-white hover:bg-red-600 transition-colors"
                aria-label="Close Menu"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Sidebar Content */}
              <div className="h-full overflow-y-auto">
                <ModernUniversalSidebar
                  currentPage={currentPage}
                  onNavigate={(page) => {
                    onNavigate?.(page);
                    setIsOpen(false);
                  }}
                  onLogout={() => {
                    logout();
                    setIsOpen(false);
                  }}
                  onProfileView={() => {
                    onNavigate?.('profile');
                    setIsOpen(false);
                  }}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
