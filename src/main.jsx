import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import DonatePage from './pages/DonatePage.jsx';
import './index.css';

// ---------------------------------------------------------------------------
// Simple client-side URL router — no external library needed.
// Routes:
//   /donate/:username  → DonatePage (public, no auth)
//   everything else    → App (streamer dashboard + landing)
// ---------------------------------------------------------------------------
function Router() {
  const path = window.location.pathname;
  const donateMatch = path.match(/^\/donate\/([^/]+)\/?$/i);

  if (donateMatch) {
    const streamerUsername = decodeURIComponent(donateMatch[1]);
    return <DonatePage streamerUsername={streamerUsername} />;
  }

  return <App />;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router />
  </React.StrictMode>,
);
