import React from 'react';
import { ReactNode, useState } from 'react';
import { AlertTriangle, RefreshCw, Home, Copy, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Header from './Header';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorCount: number;
  timestamp: Date | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorCount: 0, timestamp: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error, timestamp: new Date() };
  }

  componentDidCatch(error: Error) {
    console.error('Error caught by boundary:', error);
    this.setState(prev => ({ errorCount: prev.errorCount + 1 }));
  }

  handleReload = () => window.location.reload();
  handleHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };
  handleCopyError = () => {
    const errorText = `${this.state.error?.name}: ${this.state.error?.message}\n\nStack: ${this.state.error?.stack}`;
    navigator.clipboard.writeText(errorText);
  };

  render() {
    if (this.state.hasError) {
      return <ErrorDisplay error={this.state.error} errorCount={this.state.errorCount} timestamp={this.state.timestamp} onReload={this.handleReload} onHome={this.handleHome} onCopyError={this.handleCopyError} />;
    }
    return this.props.children;
  }
}

// Separate functional component for error display
function ErrorDisplay({ error, errorCount, timestamp, onReload, onHome, onCopyError }: { 
  error: Error | null; 
  errorCount: number; 
  timestamp: Date | null; 
  onReload: () => void; 
  onHome: () => void; 
  onCopyError: () => void 
}) {
  const [showDetails, setShowDetails] = useState(false);
  const [showStack, setShowStack] = useState(false);

  const errorMessagesRw: Record<string, string> = {
    'TypeError': 'Habaye ikosa ry\'ubwoko. Nyamuneka kontora ibyo winjiza.',
    'ReferenceError': 'Habaye ikosa ry\'uko bisobanurwa. Nyamuneka ongera mu gikoresho.',
    'SyntaxError': 'Habaye ikosa ry\'imvugo. Nyamuneka twandikire ubufasha.',
    'RangeError': 'Habaye ikosa ry\'umubare. Nyamuneka gerageza noneho.',
  };

  const errorType = error?.name || 'Ikosa Kitazwi';
  const friendlyMessage = errorMessagesRw[errorType] || 'Habaye ikibazo kitazwi. Ikipe yacu yabigaragaje.';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Header currentPage="error" onNavigate={() => {}} onSearch={() => {}} />
      
      <div className="pt-20 px-4 py-12 flex items-center justify-center min-h-[calc(100vh-80px)]">
        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-2xl">
          <div className="bg-white rounded-2xl shadow-xl border-2 border-yellow-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-yellow-500 to-green-500 px-8 py-8">
              <div className="flex items-center space-x-4">
                <motion.div animate={{ rotate: [0, -10, 10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                  <AlertTriangle className="w-12 h-12 text-white" />
                </motion.div>
                <div>
                  <h1 className="text-3xl font-black text-white">Ikosa Ryabaye!</h1>
                  <p className="text-white/80 text-sm mt-1">Ikosa #{errorCount} • {timestamp?.toLocaleTimeString()}</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="px-8 py-8 space-y-6">
              {/* Error type badge */}
              <div className="flex items-center space-x-3">
                <span className="px-4 py-2 bg-yellow-100 border-2 border-yellow-400 rounded-lg text-yellow-700 font-mono text-sm">
                  {errorType}
                </span>
                <span className="text-gray-500 text-sm">Kode: {Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
              </div>

              {/* Friendly message */}
              <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
                <p className="text-gray-800 text-lg font-semibold">{friendlyMessage}</p>
              </div>

              {/* Error message */}
              <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4">
                <p className="text-gray-700 font-mono text-sm break-words">{error?.message}</p>
              </div>

              {/* Details toggle */}
              <motion.button onClick={() => setShowDetails(!showDetails)} className="w-full flex items-center justify-between p-4 bg-yellow-50 hover:bg-yellow-100 border-2 border-yellow-300 rounded-lg transition-all">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  <span className="text-gray-800 font-semibold">Ibisobanuro Byimbitse</span>
                </div>
                {showDetails ? <ChevronUp className="w-5 h-5 text-yellow-600" /> : <ChevronDown className="w-5 h-5 text-yellow-600" />}
              </motion.button>

              {/* Details panel */}
              <AnimatePresence>
                {showDetails && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-4">
                    {/* Stack trace toggle */}
                    <motion.button onClick={() => setShowStack(!showStack)} className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 border-2 border-gray-300 rounded-lg transition-all">
                      <span className="text-gray-700 font-mono text-sm">Inyandiko y\'Ikosa</span>
                      {showStack ? <ChevronUp className="w-4 h-4 text-gray-600" /> : <ChevronDown className="w-4 h-4 text-gray-600" />}
                    </motion.button>

                    {/* Stack trace */}
                    <AnimatePresence>
                      {showStack && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="bg-gray-100 border-2 border-gray-300 rounded-lg p-4 max-h-48 overflow-y-auto">
                          <p className="text-gray-700 font-mono text-xs whitespace-pre-wrap break-words">{error?.stack}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* System info */}
                    <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-4 space-y-2">
                      <p className="text-gray-700 text-sm"><span className="font-semibold text-gray-800">Ikirango:</span> {navigator.userAgent.split(' ').slice(-2).join(' ')}</p>
                      <p className="text-gray-700 text-sm"><span className="font-semibold text-gray-800">Umwanya:</span> {timestamp?.toLocaleString()}</p>
                      <p className="text-gray-700 text-sm"><span className="font-semibold text-gray-800">URL:</span> {window.location.href}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action buttons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onReload} className="flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-green-500 hover:from-yellow-600 hover:to-green-600 text-white font-semibold rounded-lg transition-all shadow-lg border-2 border-yellow-600">
                  <RefreshCw className="w-5 h-5" />
                  <span>Ongera mu Gikoresho</span>
                </motion.button>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onHome} className="flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold rounded-lg transition-all shadow-lg border-2 border-blue-600">
                  <Home className="w-5 h-5" />
                  <span>Garuka Ahabanza</span>
                </motion.button>
              </div>

              {/* Copy error button */}
              <motion.button whileHover={{ scale: 1.02 }} onClick={onCopyError} className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 border-2 border-gray-300 text-gray-700 hover:text-gray-900 font-semibold rounded-lg transition-all">
                <Copy className="w-4 h-4" />
                <span>Kopya Ibisobanuro by\'Ikosa</span>
              </motion.button>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 border-t-2 border-yellow-200 px-8 py-4">
              <p className="text-center text-gray-600 text-sm">Ukeneye ubufasha? Twandikire: <span className="font-semibold text-yellow-600">support@gardentvet.com</span></p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
