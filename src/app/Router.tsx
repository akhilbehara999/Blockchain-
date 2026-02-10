import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import Landing from '../modules/Landing';
import { Loader2 } from 'lucide-react';

// Lazy load modules
const Introduction = lazy(() => import('../modules/Introduction'));
const Hash = lazy(() => import('../modules/Hash'));
const Block = lazy(() => import('../modules/Block'));
const Blockchain = lazy(() => import('../modules/Blockchain'));
const Distributed = lazy(() => import('../modules/Distributed'));
const Tokens = lazy(() => import('../modules/Tokens'));
const Coinbase = lazy(() => import('../modules/Coinbase'));
const Keys = lazy(() => import('../modules/Keys'));
const Signatures = lazy(() => import('../modules/Signatures'));
const Transaction = lazy(() => import('../modules/Transaction'));
const Pow = lazy(() => import('../modules/Pow'));
const Mining = lazy(() => import('../modules/Mining'));
const Difficulty = lazy(() => import('../modules/Difficulty'));
const SmartContracts = lazy(() => import('../modules/SmartContracts'));

const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen bg-primary-bg text-accent">
    <Loader2 className="w-10 h-10 animate-spin" />
  </div>
);

const Router: React.FC = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<Landing />} />

          <Route element={<MainLayout />}>
            <Route path="/module/introduction" element={<Introduction />} />
            <Route path="/module/hash" element={<Hash />} />
            <Route path="/module/block" element={<Block />} />
            <Route path="/module/blockchain" element={<Blockchain />} />
            <Route path="/module/distributed" element={<Distributed />} />
            <Route path="/module/tokens" element={<Tokens />} />
            <Route path="/module/coinbase" element={<Coinbase />} />
            <Route path="/module/keys" element={<Keys />} />
            <Route path="/module/signatures" element={<Signatures />} />
            <Route path="/module/transaction" element={<Transaction />} />
            <Route path="/module/pow" element={<Pow />} />
            <Route path="/module/mining" element={<Mining />} />
            <Route path="/module/difficulty" element={<Difficulty />} />
            <Route path="/module/smart-contracts" element={<SmartContracts />} />

            {/* Redirects */}
            <Route path="/modules" element={<Navigate to="/module/introduction" replace />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default Router;
