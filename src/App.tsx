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
import { useEffect } from 'react'
import { applyTheme } from '@/lib/design_system'
import { PwaUpdate } from "./components/PwaUpdate";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";

// Add error logging
console.log("App.tsx loading...");
const HealthScreening = lazy(() => import("./pages/HealthScreening"));
const WellnessPositions = lazy(() => import("./pages/WellnessPositions"));
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
const AchievementsDetail = lazy(() => import("./pages/AchievementsDetail"));
const Studio = lazy(() => import("./pages/Studio"));
const WellnessIndex = lazy(() => import("./features/mediax/pages/Index"));
const WellnessSettings = lazy(() => import("./features/mediax/pages/Settings"));
const MediaXExplore = lazy(() => import("./features/mediax/pages/Explore"));
const PositionLibraryPage = lazy(() => import("./pages/PositionLibraryPage"));
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

const App = () => {
  console.log("App component rendering...");
  console.log("App: Current location:", window.location.href);
  console.log("App: Document ready state:", document.readyState);

  // Simple test component first
  const TestComponent = () => {
    console.log("TestComponent rendering...");
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary mb-4">Size Seeker</h1>
          <p className="text-muted-foreground mb-4">App is loading...</p>
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
        </div>
      </div>
    );
  };
  
  try {
    return (
      <PersistQueryClientProvider client={queryClient} persistOptions={{ persister }}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <ErrorBoundary>
            <BrowserRouter basename={APP_BASENAME}>
              <TitleUpdater />
              <div className="min-h-screen bg-background">
                <Navbar />
                {/* PWA update notifier */}
                <PwaUpdate />
                <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-background border rounded px-2 py-1">Skip to content</a>
                <main role="main" id="main-content">
                <Suspense fallback={<TestComponent />}>
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
                    <Route path="/positions" element={<PositionLibraryPage />} />
                    <Route path="/wellness" element={<WellnessPositions />} />
                    <Route path="/achievements" element={<AchievementsDetail />} />
                    <Route path="/run-session" element={<SessionRunner />} />
                    <Route path="/studio" element={<Studio />} />
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
          </ErrorBoundary>
          {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
        </TooltipProvider>
      </PersistQueryClientProvider>
    );
  } catch (error) {
    console.error("App component error:", error);
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">App Error</h1>
          <p className="text-muted-foreground">Something went wrong loading the app.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded"
          >
            Reload
          </button>
        </div>
      </div>
    );
  }
};

export default App;
