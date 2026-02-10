import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import { Loader2 } from 'lucide-react';

// Lazy load modules
const Landing = React.lazy(() => import('../modules/Landing'));
const Introduction = React.lazy(() => import('../modules/Introduction'));
const Hash = React.lazy(() => import('../modules/M01_Hashing'));
const Block = React.lazy(() => import('../modules/M02_Block'));
const Blockchain = React.lazy(() => import('../modules/M03_Blockchain'));
const Distributed = React.lazy(() => import('../modules/Distributed'));
const Tokens = React.lazy(() => import('../modules/M05_Tokens'));
const Coinbase = React.lazy(() => import('../modules/Coinbase'));
const Keys = React.lazy(() => import('../modules/Keys'));
const Signatures = React.lazy(() => import('../modules/M06_Signatures'));
const Transaction = React.lazy(() => import('../modules/Transaction'));
const Pow = React.lazy(() => import('../modules/Pow'));
const Mining = React.lazy(() => import('../modules/M07_Mining'));
const Consensus = React.lazy(() => import('../modules/M08_Consensus'));
const Difficulty = React.lazy(() => import('../modules/Difficulty'));
const SmartContracts = React.lazy(() => import('../modules/M09_SmartContracts'));
const MerkleTrees = React.lazy(() => import('../modules/M10_MerkleTrees'));
const Network = React.lazy(() => import('../modules/M04_Network'));
const Attack51 = React.lazy(() => import('../modules/M11_Attack51'));
const Forks = React.lazy(() => import('../modules/M12_Forks'));
const DeFi = React.lazy(() => import('../modules/M13_DeFi'));
const NFTs = React.lazy(() => import('../modules/M14_NFTs'));

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <Loader2 className="w-8 h-8 animate-spin text-accent" />
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
            <Route path="/module/consensus" element={<Consensus />} />
            <Route path="/module/difficulty" element={<Difficulty />} />
            <Route path="/module/smart-contracts" element={<SmartContracts />} />
            <Route path="/module/merkletrees" element={<MerkleTrees />} />
            <Route path="/module/network" element={<Network />} />
            <Route path="/module/attack51" element={<Attack51 />} />
            <Route path="/module/forks" element={<Forks />} />
            <Route path="/module/defi" element={<DeFi />} />
            <Route path="/module/nfts" element={<NFTs />} />
          </Route>

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default Router;
