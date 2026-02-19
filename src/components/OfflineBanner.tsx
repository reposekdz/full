import React from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface OfflineBannerProps {
  isOnline: boolean;
  showBanner: boolean;
}

export function OfflineBanner({ isOnline, showBanner }: OfflineBannerProps) {
  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          exit={{ y: -100 }}
          className={`fixed top-0 left-0 right-0 z-50 ${
            isOnline ? 'bg-green-500' : 'bg-red-500'
          } text-white py-2 px-4 text-center shadow-lg`}
        >
          <div className="flex items-center justify-center gap-2">
            {isOnline ? <Wifi size={20} /> : <WifiOff size={20} />}
            <span className="font-medium">
              {isOnline ? 'Back Online - Syncing data...' : 'Offline Mode - Data cached locally'}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
