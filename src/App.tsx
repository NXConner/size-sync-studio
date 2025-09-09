import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { APP_BASENAME } from "@/lib/config";
import { Navbar } from "./components/Navbar";
import { PwaUpdate } from "./components/PwaUpdate";
const HealthScreening = lazy(() => import("./pages/HealthScreening"));
const Index = lazy(() => import("./pages/Index"));
const Sessions = lazy(() => import("./pages/Sessions"));
const Safety = lazy(() => import("./pages/Safety"));
const Tips = lazy(() => import("./pages/Tips"));
const Measure = lazy(() => import("./pages/Measure"));
const SessionRunner = lazy(() => import("./pages/SessionRunner"));
const Settings = lazy(() => import("./pages/Settings"));
const Gallery = lazy(() => import("./pages/Gallery"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Analytics = lazy(() => import("./pages/Analytics"));
const WellnessIndex = lazy(() => import("./features/mediax/pages/Index"));
const WellnessSettings = lazy(() => import("./features/mediax/pages/Settings"));
const MediaXExplore = lazy(() => import("./features/mediax/pages/Explore"));
import WellnessErrorBoundary from "./features/mediax/components/ErrorBoundary";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const persister = typeof window !== 'undefined' ? createSyncStoragePersister({ storage: window.localStorage }) : null as any;

function TitleUpdater() {
  const location = useLocation();
  const map: Record<string, string> = {
    '/': 'Size Seeker – Dashboard',
    '/sessions': 'Size Seeker – Sessions',
    '/safety': 'Size Seeker – Safety',
    '/tips': 'Size Seeker – Tips',
    '/gallery': 'Size Seeker – Gallery',
    '/measure': 'Size Seeker – Measure',
    '/screening': 'Size Seeker – Health Screening',
    '/settings': 'Size Seeker – Settings',
  };
  const base = 'Size Seeker';
  const title = map[location.pathname] || base;
  if (typeof document !== 'undefined') document.title = title;
  return null;
}

const App = () => (
  <PersistQueryClientProvider client={queryClient} persistOptions={{ persister }}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter basename={APP_BASENAME}>
        <TitleUpdater />
        <div className="min-h-screen bg-background">
          <Navbar />
          {/* PWA update notifier */}
          <PwaUpdate />
          <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-background border rounded px-2 py-1">Skip to content</a>
          <main role="main" id="main-content">
          <Suspense fallback={<div className="p-6 text-muted-foreground">Loading…</div>}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/sessions" element={<Sessions />} />
              <Route path="/safety" element={<Safety />} />
              <Route path="/tips" element={<Tips />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/measure" element={<Measure />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/screening" element={<HealthScreening />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/run-session" element={<SessionRunner />} />
              <Route path="/mediax" element={<WellnessErrorBoundary><WellnessIndex /></WellnessErrorBoundary>} />
              <Route path="/mediax/settings" element={<WellnessErrorBoundary><WellnessSettings /></WellnessErrorBoundary>} />
              <Route path="/mediax/explore" element={<WellnessErrorBoundary><MediaXExplore /></WellnessErrorBoundary>} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          </main>
        </div>
      </BrowserRouter>
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </TooltipProvider>
  </PersistQueryClientProvider>
);

export default App;
