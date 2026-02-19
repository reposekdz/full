import React, { useEffect, useState } from 'react';
import { Download, X, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { usePWAStore, pwaManager } from '../utils/pwaManager';

export const PWAInstallBanner: React.FC = () => {
  const { isInstallable, isOnline, pendingActions, syncStatus } = usePWAStore();
  const [showBanner, setShowBanner] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const isDismissed = localStorage.getItem('pwa-install-dismissed');
    if (!isDismissed && isInstallable) {
      setShowBanner(true);
    }
  }, [isInstallable]);

  const handleInstall = async () => {
    const installed = await pwaManager.showInstallPrompt();
    if (installed) {
      setShowBanner(false);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setDismissed(true);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  if (!showBanner || dismissed) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg shadow-2xl p-4 z-50 animate-slide-up">
      <button onClick={handleDismiss} className="absolute top-2 right-2 text-white/80 hover:text-white">
        <X size={20} />
      </button>
      <div className="flex items-start gap-3">
        <img src="/src/assets/logo/Gemini_Generated_Image_6gbu966gbu966gbu.ico" alt="Garden TVET Logo" className="w-12 h-12 rounded-lg" />
        <div className="flex-1">
          <h3 className="font-bold text-lg mb-1">Install Garden TVET</h3>
          <p className="text-sm text-white/90 mb-3">Install our app for offline access, faster loading, and a better experience!</p>
          <button onClick={handleInstall} className="w-full bg-white text-yellow-600 font-semibold py-2 px-4 rounded-lg hover:bg-yellow-50 transition-colors flex items-center justify-center gap-2">
            <Download size={18} />Install App
          </button>
        </div>
      </div>
    </div>
  );
};

export const OfflineIndicator: React.FC = () => {
  const { isOnline, pendingActions, syncStatus } = usePWAStore();
  const [showDetails, setShowDetails] = useState(false);

  if (isOnline && pendingActions.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className={`${isOnline ? 'bg-green-500' : 'bg-red-500'} text-white rounded-lg shadow-lg p-3 cursor-pointer transition-all hover:shadow-xl`} onClick={() => setShowDetails(!showDetails)}>
        <div className="flex items-center gap-2">
          {isOnline ? <Wifi size={20} /> : <WifiOff size={20} />}
          <span className="font-semibold">{isOnline ? 'Online' : 'Offline'}</span>
          {pendingActions.length > 0 && (
            <span className="bg-white text-red-500 rounded-full px-2 py-0.5 text-xs font-bold">{pendingActions.length}</span>
          )}
        </div>
        {showDetails && pendingActions.length > 0 && (
          <div className="mt-3 pt-3 border-t border-white/20">
            <p className="text-sm mb-2">{pendingActions.length} pending actions</p>
            {isOnline && (
              <button onClick={(e) => { e.stopPropagation(); pwaManager.syncOfflineData(); }} className="w-full bg-white text-red-500 font-semibold py-1 px-3 rounded text-sm hover:bg-red-50 transition-colors flex items-center justify-center gap-2" disabled={syncStatus === 'syncing'}>
                <RefreshCw size={14} className={syncStatus === 'syncing' ? 'animate-spin' : ''} />
                {syncStatus === 'syncing' ? 'Syncing...' : 'Sync Now'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export const PWAUpdatePrompt: React.FC = () => {
  const [showUpdate, setShowUpdate] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        setShowUpdate(true);
      });
    }
  }, []);

  if (!showUpdate) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-white p-4 text-center z-50 shadow-lg">
      <p className="mb-2 font-semibold">New version available!</p>
      <button onClick={() => window.location.reload()} className="bg-white text-yellow-600 font-bold py-2 px-6 rounded-lg hover:bg-yellow-50 transition-colors">Update Now</button>
    </div>
  );
};
