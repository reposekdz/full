
  import { createRoot } from "react-dom/client";
  import App from "./app/App.tsx";
  import { ErrorBoundary } from "./app/components/ErrorBoundary";
  import "./styles/index.css";

  // Suppress MetaMask errors
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason?.message?.includes('MetaMask')) {
      event.preventDefault();
    }
  });

  // Register Service Worker for PWA
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js')
        .then((registration) => {
          console.log('✅ PWA Service Worker registered:', registration.scope);
          
          // Check for updates every hour
          setInterval(() => {
            registration.update();
          }, 3600000);
        })
        .catch((error) => {
          console.log('❌ Service Worker registration failed:', error);
        });
    });
  }

  // PWA Install Prompt
  let deferredPrompt: any;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    console.log('💡 App can be installed!');
  });

  // Track installation
  window.addEventListener('appinstalled', () => {
    console.log('✅ App installed successfully!');
    deferredPrompt = null;
  });

  createRoot(document.getElementById("root")!).render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
  