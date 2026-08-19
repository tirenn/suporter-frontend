// Google Analytics 4 (GA4) helper utility
export const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || '';

/**
 * Initializes Google Analytics script dynamically if VITE_GA_MEASUREMENT_ID is configured.
 */
export function initGA() {
  if (!GA_MEASUREMENT_ID || GA_MEASUREMENT_ID.startsWith('G-XXXXX') || typeof window === 'undefined') {
    return;
  }

  // Avoid duplicate script injection
  if (document.getElementById('ga-gtag-script')) {
    return;
  }

  // Inject gtag.js
  const script = document.createElement('script');
  script.id = 'ga-gtag-script';
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  window.gtag = gtag;

  gtag('js', new Date());
  gtag('config', GA_MEASUREMENT_ID, {
    send_page_view: true,
  });

  console.log('[Analytics] Google Analytics initialized with ID:', GA_MEASUREMENT_ID);
}

/**
 * Track virtual page views in Single Page App (SPA)
 */
export function trackPageView(pagePath, pageTitle) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function' && GA_MEASUREMENT_ID) {
    window.gtag('event', 'page_view', {
      page_path: pagePath,
      page_title: pageTitle || document.title,
      page_location: window.location.href,
    });
  }
}

/**
 * Track custom user events
 */
export function trackEvent(eventName, eventParams = {}) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function' && GA_MEASUREMENT_ID) {
    window.gtag('event', eventName, eventParams);
  }
}
