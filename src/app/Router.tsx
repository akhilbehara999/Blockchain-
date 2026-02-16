import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import MainLayout from '../components/layout/MainLayout';
import ErrorBoundary from '../components/ErrorBoundary';
import Skeleton from '../components/ui/Skeleton';
import PageTransition from '../components/layout/PageTransition';
import RouteGuard from '../components/RouteGuard';
import NotFound from '../pages/NotFound';

// Lazy load pages
const Landing = React.lazy(() => import('../pages/Landing'));
const Journey = React.lazy(() => import('../pages/Journey'));
const Sandbox = React.lazy(() => import('../pages/Sandbox'));
const Challenges = React.lazy(() => import('../pages/Challenges'));

const LoadingFallback = () => (
  <div className="p-8 space-y-6 max-w-4xl mx-auto">
    <Skeleton className="h-48 w-full" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  </div>
);

const AnimatedRoutes: React.FC = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Landing page (no layout, or simplified layout) */}
        <Route path="/" element={<PageTransition><Landing /></PageTransition>} />

        {/* Main application routes with layout */}
        <Route element={<MainLayout />}>
          <Route path="/journey" element={<Navigate to="/journey/1" replace />} />
          <Route
            path="/journey/:step"
            element={
              <RouteGuard type="journey">
                <PageTransition mode="slide"><Journey /></PageTransition>
              </RouteGuard>
            }
          />
          <Route
            path="/sandbox"
            element={
              <RouteGuard type="sandbox">
                <PageTransition><Sandbox /></PageTransition>
              </RouteGuard>
            }
          />
          <Route
            path="/challenges"
            element={
              <RouteGuard type="challenges">
                <PageTransition><Challenges /></PageTransition>
              </RouteGuard>
            }
          />
        </Route>

        {/* Fallback route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

const Router: React.FC = () => {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ErrorBoundary>
        <Suspense fallback={<LoadingFallback />}>
          <AnimatedRoutes />
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Router;
