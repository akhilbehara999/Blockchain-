import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import ErrorBoundary from '../components/ErrorBoundary';
import Skeleton from '../components/ui/Skeleton';

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

const Router: React.FC = () => {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ErrorBoundary>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* Landing page (no layout, or simplified layout) */}
            <Route path="/" element={<Landing />} />

            {/* Main application routes with layout */}
            <Route element={<MainLayout />}>
              <Route path="/journey" element={<Journey />} />
              <Route path="/journey/:step" element={<Journey />} />
              <Route path="/sandbox" element={<Sandbox />} />
              <Route path="/challenges" element={<Challenges />} />
            </Route>

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Router;
