import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import * as Sentry from '@sentry/react'
// Guard against stalled render resulting in blank screen
window.addEventListener('error', () => {
  const root = document.getElementById('root')
  if (root && !root.childElementCount) {
    root.innerHTML = '<div style="padding:16px;color:#ef4444">An error occurred while loading the app. Please refresh.</div>'
  }
})
import { detectLang, isRtl } from './lib/i18n'
import { APP_BASENAME } from './lib/config'

if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    integrations: [Sentry.browserTracingIntegration(), Sentry.replayIntegration()],
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  })
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// Removed OpenCV prefetch to avoid potential main-thread stalls on first interaction

// Register service worker for PWA in production
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Resolve SW path correctly when app is served under a sub-path
    const base = (import.meta.env.BASE_URL || APP_BASENAME || '/').replace(/\/$/, '')
    const swUrl = `${base}/sw.js`
    navigator.serviceWorker.register(swUrl).then((reg) => {
      try {
        reg.addEventListener('updatefound', () => {
          const installing = reg.installing;
          if (!installing) return;
          installing.addEventListener('statechange', () => {
            if (installing.state === 'installed' && navigator.serviceWorker.controller) {
              (window as any).__SW_WAITING = installing;
              try { window.dispatchEvent(new CustomEvent('pwa-update-available')); } catch {}
            }
          });
        });
      } catch {}
      // schedule local reminders after SW ready
      try {
        import('./utils/notifications').then(async (mod) => {
          try {
            const readyReg = await navigator.serviceWorker.ready
            await mod.scheduleAllActive(readyReg)
          } catch {
            await mod.scheduleAllActive(null)
          }
        })
      } catch {}
    }).catch(() => {});
  });
}

// Apply language and direction
try {
  const lang = detectLang()
  document.documentElement.lang = lang
  document.documentElement.dir = isRtl(lang) ? 'rtl' : 'ltr'
} catch {}
