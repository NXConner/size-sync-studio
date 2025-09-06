import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { APP_BASENAME } from "@/lib/config";
import { Navbar } from "./components/Navbar";
import { PwaUpdate } from "./components/PwaUpdate";
const Index = lazy(() => import("./pages/Index"));
const Sessions = lazy(() => import("./pages/Sessions"));
const Safety = lazy(() => import("./pages/Safety"));
const Tips = lazy(() => import("./pages/Tips"));
const Measure = lazy(() => import("./pages/Measure"));
const SessionRunner = lazy(() => import("./pages/SessionRunner"));
const Gallery = lazy(() => import("./pages/Gallery"));
const Chat = lazy(() => import("./pages/Chat"));
const NotFound = lazy(() => import("./pages/NotFound"));
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

const App = () => (
  <PersistQueryClientProvider client={queryClient} persistOptions={{ persister }}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter basename={APP_BASENAME}>
        <div className="min-h-screen bg-background">
          <Navbar />
          {/* PWA update notifier */}
          <PwaUpdate />
          <main role="main">
          <Suspense fallback={<div className="p-6 text-muted-foreground">Loading…</div>}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/sessions" element={<Sessions />} />
              <Route path="/safety" element={<Safety />} />
              <Route path="/tips" element={<Tips />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/measure" element={<Measure />} />
              <Route path="/chat" element={<Chat />} />
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
