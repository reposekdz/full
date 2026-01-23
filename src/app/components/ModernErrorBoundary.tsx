import React, { Component, ErrorInfo, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ChevronDown, ChevronUp, RefreshCw, Home, Copy, Check } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
  copied: boolean;
}

class ModernErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    showDetails: false,
    copied: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null, showDetails: false, copied: false };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private toggleDetails = () => {
    this.setState(prev => ({ showDetails: !prev.showDetails }));
  };

  private copyError = () => {
    const { error, errorInfo } = this.state;
    const errorText = `Error: ${error?.message}\n\nStack: ${error?.stack}\n\nComponent Stack: ${errorInfo?.componentStack}`;
    navigator.clipboard.writeText(errorText);
    this.setState({ copied: true });
    setTimeout(() => this.setState({ copied: false }), 2000);
  };

  public render() {
    if (this.state.hasError) {
      const { error, errorInfo, showDetails, copied } = this.state;

      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-4xl w-full"
          >
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-4 border-red-500">
              {/* Header */}
              <div className="bg-gradient-to-r from-red-600 via-orange-600 to-red-600 p-8 text-white">
                <div className="flex items-center gap-4 mb-4">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 10, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                    className="w-16 h-16 bg-white rounded-full flex items-center justify-center"
                  >
                    <AlertTriangle className="w-10 h-10 text-red-600" />
                  </motion.div>
                  <div>
                    <h1 className="text-3xl font-black mb-1">Ikosa Ryabaye!</h1>
                    <p className="text-red-100">Something went wrong</p>
                  </div>
                </div>
                <p className="text-lg font-semibold bg-white/20 backdrop-blur-sm rounded-xl p-4">
                  {error?.message || 'Habaye ikosa ritunguranye. Gerageza kongera.'}
                </p>
              </div>

              {/* Content */}
              <div className="p-8">
                <div className="mb-6">
                  <p className="text-gray-700 mb-4">
                    Mwaramutse! Habaye ikosa mu gukoresha sisitemu. Mwakora ibi:
                  </p>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      Kanda buto ya "Ongera Utangire" kugira ngo usubire aho wari
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      Kanda buto ya "Subira Ahabanza" kugira ngo usubire ku rupapuro rw'itangiriro
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      Kanda buto ya "Reba Amakosa" kugira ngo ubone ibisobanuro birambuye
                    </li>
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 mb-6">
                  <button
                    onClick={this.handleReload}
                    className="flex-1 min-w-[200px] bg-gradient-to-r from-red-600 to-orange-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-5 h-5" />
                    Ongera Utangire
                  </button>
                  <button
                    onClick={this.handleGoHome}
                    className="flex-1 min-w-[200px] bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                  >
                    <Home className="w-5 h-5" />
                    Subira Ahabanza
                  </button>
                </div>

                {/* Error Details Toggle */}
                <div className="border-t pt-6">
                  <button
                    onClick={this.toggleDetails}
                    className="w-full flex items-center justify-between p-4 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                  >
                    <span className="font-bold text-gray-900 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-orange-600" />
                      Reba Amakosa Yose (Technical Details)
                    </span>
                    {showDetails ? (
                      <ChevronUp className="w-5 h-5 text-gray-600" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-600" />
                    )}
                  </button>

                  <AnimatePresence>
                    {showDetails && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4 p-6 bg-gray-900 rounded-xl">
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="text-white font-bold text-lg">Error Details</h3>
                            <button
                              onClick={this.copyError}
                              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                            >
                              {copied ? (
                                <>
                                  <Check className="w-4 h-4" />
                                  Copied!
                                </>
                              ) : (
                                <>
                                  <Copy className="w-4 h-4" />
                                  Copy Error
                                </>
                              )}
                            </button>
                          </div>

                          {/* Error Message */}
                          <div className="mb-4">
                            <h4 className="text-red-400 font-bold mb-2">Error Message:</h4>
                            <pre className="text-red-300 text-sm bg-black/30 p-4 rounded-lg overflow-x-auto">
                              {error?.message}
                            </pre>
                          </div>

                          {/* Error Stack */}
                          {error?.stack && (
                            <div className="mb-4">
                              <h4 className="text-orange-400 font-bold mb-2">Stack Trace:</h4>
                              <pre className="text-orange-300 text-xs bg-black/30 p-4 rounded-lg overflow-x-auto max-h-64 overflow-y-auto">
                                {error.stack}
                              </pre>
                            </div>
                          )}

                          {/* Component Stack */}
                          {errorInfo?.componentStack && (
                            <div>
                              <h4 className="text-yellow-400 font-bold mb-2">Component Stack:</h4>
                              <pre className="text-yellow-300 text-xs bg-black/30 p-4 rounded-lg overflow-x-auto max-h-64 overflow-y-auto">
                                {errorInfo.componentStack}
                              </pre>
                            </div>
                          )}

                          {/* Additional Info */}
                          <div className="mt-4 p-4 bg-blue-900/30 rounded-lg">
                            <h4 className="text-blue-400 font-bold mb-2">Debug Information:</h4>
                            <div className="text-blue-300 text-sm space-y-1">
                              <p>• Timestamp: {new Date().toLocaleString()}</p>
                              <p>• User Agent: {navigator.userAgent}</p>
                              <p>• URL: {window.location.href}</p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Help Text */}
                <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-xl">
                  <p className="text-blue-900 text-sm">
                    <strong>Icyitonderwa:</strong> Niba iki kibazo gikomeje, mwakwandikira abayobozi ba sisitemu kandi mubahe amakosa yose yerekanwe hejuru.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ModernErrorBoundary;
