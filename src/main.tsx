
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

  createRoot(document.getElementById("root")!).render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
  