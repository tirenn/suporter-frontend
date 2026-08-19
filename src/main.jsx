import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import DonatePage from './pages/DonatePage.jsx';
import { initGA, trackPageView } from './utils/analytics';
import './index.css';

// Initialize Google Analytics if configured
initGA();

// ---------------------------------------------------------------------------
// Simple client-side URL router — no external library needed.
// Routes:
//   /suporter/:username  → DonatePage (public, no auth)
//   everything else      → App (streamer dashboard + landing)
// ---------------------------------------------------------------------------
function Router() {
  const path = window.location.pathname;
  const suporterMatch = path.match(/^\/suporter\/([^/]+)\/?$/i);

  useEffect(() => {
    trackPageView(path);
  }, [path]);

  if (suporterMatch) {
    const streamerUsername = decodeURIComponent(suporterMatch[1]);
    return <DonatePage streamerUsername={streamerUsername} />;
  }

  return <App />;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router />
  </React.StrictMode>,
);
