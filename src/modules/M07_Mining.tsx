import React, { useState, useEffect, useRef } from 'react';
import ModuleLayout from '../components/layout/ModuleLayout';
import Tabs from '../components/ui/Tabs';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Slider from '../components/ui/Slider';
import NonceCounter from '../components/blockchain/NonceCounter';
import HashDisplay from '../components/blockchain/HashDisplay';
import MiningAnimation from '../components/blockchain/MiningAnimation';
import { useMining } from '../hooks/useMining';
import { useNetworkDelay } from '../hooks/useNetworkDelay';
import { calculateHash } from '../engine/block';
import { Block } from '../engine/types';
import { Hammer, Play, Square, Trophy, Zap, Timer } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import MiningSimulator from '../components/mining/MiningSimulator';

const M07_Mining: React.FC = () => {
  const [activeTab, setActiveTab] = useState('manual');

  const tabs = [
    { id: 'manual', label: 'Manual Mining', icon: <Hammer className="w-4 h-4" /> },
    { id: 'auto', label: 'Auto Mining', icon: <Zap className="w-4 h-4" /> },
    { id: 'race', label: 'Mining Race', icon: <Trophy className="w-4 h-4" /> },
  ];

  return (
    <ModuleLayout moduleId="mining" title="Mining & Proof of Work" subtitle="The race to secure the blockchain">
      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={setActiveTab}
        className="mb-8"
      />

      <div className="min-h-[600px]">
        {activeTab === 'manual' && <ManualMiningTab />}
        {activeTab === 'auto' && <AutoMiningTab />}
        {activeTab === 'race' && <MiningRaceTab />}
      </div>
    </ModuleLayout>
  );
};

// --- Tab 1: Manual Mining ---

const ManualMiningTab: React.FC = () => {
  const [difficulty, setDifficulty] = useState(2);
  const [block, setBlock] = useState<Block>({
    index: 1,
    timestamp: 1678900000000, // Fixed timestamp for consistency
    data: 'Alice pays Bob 5 coins',
    previousHash: '0000000000000000000000000000000000000000000000000000000000000000',
    nonce: 0,
    hash: '',
  });
  const [attempts, setAttempts] = useState(0);
  const [isValid, setIsValid] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Calculate hash whenever block changes
  useEffect(() => {
    const newHash = calculateHash(block);
    const target = '0'.repeat(difficulty);
    const valid = newHash.startsWith(target);

    setBlock(prev => ({ ...prev, hash: newHash }));
    setIsValid(valid);

    if (valid && !isValid) {
      setShowSuccess(true);
    }
  }, [block.nonce, block.data, block.index, block.previousHash, block.timestamp, difficulty]);

  const handleNextNonce = () => {
    setBlock(prev => ({ ...prev, nonce: prev.nonce + 1 }));
    setAttempts(prev => prev + 1);
    setShowSuccess(false); // Reset animation for subsequent attempts
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card
            title={`Block #${block.index}`}
            className={`border-l-4 transition-colors ${isValid ? 'border-l-success' : 'border-l-tertiary-bg'}`}
          >
            <div className="space-y-4">
              {/* Data Field */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-text-secondary uppercase">Data</label>
                <div className="w-full bg-tertiary-bg rounded-lg p-3 text-sm font-mono border border-border/50">
                  {block.data}
                </div>
              </div>

              {/* Nonce Control */}
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1 flex-1">
                  <label className="text-xs font-medium text-text-secondary uppercase">Nonce</label>
                  <NonceCounter nonce={block.nonce} isMining={false} />
                </div>
                <div className="flex items-end h-full pt-5">
                   <Button onClick={handleNextNonce} disabled={isValid && showSuccess}>
                     Try Next Nonce ({block.nonce + 1})
                   </Button>
                </div>
              </div>

              {/* Hash Display */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-text-secondary uppercase">Hash</label>
                <HashDisplay hash={block.hash} highlightLeadingZeros={true} animate={true} />
              </div>

              {/* Status Indicator */}
              <div className="flex justify-between items-center text-sm">
                <span className="text-text-secondary">Target: <span className="font-mono text-accent">{difficulty}</span> leading zeros</span>
                <span className={`font-bold ${isValid ? 'text-success' : 'text-danger'}`}>
                  {isValid ? 'BLOCK VALID' : 'INVALID HASH'}
                </span>
              </div>
            </div>

            <AnimatePresence>
                {showSuccess && <MiningAnimation onComplete={() => setShowSuccess(false)} />}
            </AnimatePresence>
          </Card>
        </div>

        {/* Sidebar Controls */}
        <div className="space-y-6">
           <Card title="Mining Settings">
              <Slider
                label="Difficulty"
                min={1}
                max={6}
                value={difficulty}
                onChange={(val) => {
                  setDifficulty(val);
                  setIsValid(false);
                  setShowSuccess(false);
                }}
                showValue
              />
              <p className="text-xs text-text-secondary mt-4">
                Finding a hash with {difficulty} leading zeros is exponentially harder as difficulty increases.
              </p>
           </Card>

           <Card title="Statistics">
              <div className="space-y-2 text-sm">
                 <div className="flex justify-between">
                    <span className="text-text-secondary">Attempts</span>
                    <span className="font-mono">{attempts}</span>
                 </div>
                 <div className="flex justify-between">
                    <span className="text-text-secondary">Current Nonce</span>
                    <span className="font-mono">{block.nonce}</span>
                 </div>
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
};

// --- Tab 2: Auto Mining ---

const AutoMiningTab: React.FC = () => {
  const { propagateBlock, isWaiting } = useNetworkDelay();
  const [difficulty, setDifficulty] = useState(4);
  const [block, setBlock] = useState<Block>({
    index: 1,
    timestamp: 1678900000000,
    data: 'Alice pays Bob 5 coins',
    previousHash: '0000000000000000000000000000000000000000000000000000000000000000',
    nonce: 0,
    hash: '',
  });

  const { startMine, stopMine, isMining, nonce, hash } = useMining();
  const [elapsed, setElapsed] = useState(0);
  const [hashesPerSecond, setHashesPerSecond] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastProgressRef = useRef(0);
  const lastTimeRef = useRef(Date.now());

  // Handle mining start/stop logic
  const toggleMining = () => {
    if (isMining) {
      stopMine();
      if (timerRef.current) clearInterval(timerRef.current);
      setHashesPerSecond(0);
    } else {
      setElapsed(0);
      setHashesPerSecond(0);
      setShowSuccess(false);
      lastProgressRef.current = 0;
      lastTimeRef.current = Date.now();

      // Update block timestamp for freshness
      const currentBlock = { ...block, timestamp: Date.now() };
      setBlock(currentBlock);

      startMine(currentBlock, difficulty, (result) => {
        // On Complete
        if (timerRef.current) clearInterval(timerRef.current);

        // Propagate mined block with delay
        propagateBlock(result, () => {
            setBlock(prev => ({ ...prev, nonce: result.nonce, hash: result.hash }));
            setShowSuccess(true);
        });
      });

      // Start metrics timer
      timerRef.current = setInterval(() => {
        // Update elapsed
        setElapsed((prev) => prev + 0.1);

        // Update hash rate (approximate)
        // Since `progress` updates in batches from worker, this might be jumpy
        // We smooth it slightly or just accept it
      }, 100);
    }
  };

  // Calculate Hash Rate Effect
  useEffect(() => {
    if (isMining) {
        const interval = setInterval(() => {
             const now = Date.now();
             const timeDiff = (now - lastTimeRef.current) / 1000;
             if (timeDiff >= 1) {
                 const hashes = nonce - lastProgressRef.current;
                 setHashesPerSecond(Math.round(hashes / timeDiff));
                 lastProgressRef.current = nonce;
                 lastTimeRef.current = now;
             }
        }, 1000);
        return () => clearInterval(interval);
    }
  }, [isMining, nonce]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      stopMine();
    };
  }, []);

  // Check validity for border color
  const target = '0'.repeat(difficulty);
  const isValid = hash.startsWith(target) || (showSuccess && block.hash.startsWith(target));

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card
            title={`Block #${block.index}`}
            className={`border-l-4 transition-colors ${isValid ? 'border-l-success' : isMining ? 'border-l-warning' : 'border-l-tertiary-bg'}`}
          >
             <div className="space-y-4">
               {/* Nonce Display */}
               <div className="space-y-1">
                 <label className="text-xs font-medium text-text-secondary uppercase">Nonce</label>
                 <NonceCounter nonce={isMining ? nonce : block.nonce} isMining={isMining} />
               </div>

               {/* Hash Display (Throttled by React render cycle from hook updates) */}
               <div className="space-y-1">
                 <label className="text-xs font-medium text-text-secondary uppercase">Current Hash</label>
                 <HashDisplay
                    hash={isMining ? hash : block.hash}
                    highlightLeadingZeros={true}
                    animate={false} // Disable animation during rapid mining for performance
                 />
               </div>

                {/* Status */}
               <div className="flex justify-between items-center text-sm h-6">
                  {isMining && <span className="text-warning font-bold animate-pulse">MINING IN PROGRESS...</span>}
                  {isWaiting && !isMining && <span className="text-accent font-bold animate-pulse">PROPAGATING BLOCK...</span>}
                  {isValid && !isMining && !isWaiting && <span className="text-success font-bold">BLOCK MINED!</span>}
               </div>
             </div>

             <AnimatePresence>
                {showSuccess && <MiningAnimation onComplete={() => setShowSuccess(false)} />}
             </AnimatePresence>
          </Card>
        </div>

        {/* Controls Sidebar */}
        <div className="space-y-6">
           <Card title="Miner Controls">
              <div className="space-y-6">
                <Slider
                    label="Difficulty"
                    min={1}
                    max={6}
                    value={difficulty}
                    onChange={(val) => {
                        setDifficulty(val);
                        if (isMining) toggleMining(); // Restart if running
                        setShowSuccess(false);
                    }}
                    showValue
                />

                <Button
                    variant={isMining ? 'danger' : 'primary'}
                    className="w-full"
                    onClick={toggleMining}
                    disabled={isWaiting}
                >
                    {isMining ? (
                        <>
                            <Square className="w-4 h-4 mr-2 fill-current" /> Stop Mining
                        </>
                    ) : (
                        <>
                            <Play className="w-4 h-4 mr-2 fill-current" /> Start Mining
                        </>
                    )}
                </Button>
              </div>
           </Card>

           <Card title="Performance">
              <div className="space-y-4 text-sm">
                 <div className="flex justify-between items-center">
                    <span className="text-text-secondary flex items-center gap-2">
                        <Zap className="w-4 h-4 text-warning" /> Hash Rate
                    </span>
                    <span className="font-mono text-lg">{hashesPerSecond.toLocaleString()} H/s</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-text-secondary flex items-center gap-2">
                        <Timer className="w-4 h-4 text-accent" /> Elapsed
                    </span>
                    <span className="font-mono text-lg">{elapsed.toFixed(1)}s</span>
                 </div>
                 <div className="flex justify-between items-center pt-2 border-t border-border/50">
                    <span className="text-text-secondary">Total Attempts</span>
                    <span className="font-mono text-text-primary">{(isMining ? nonce : block.nonce).toLocaleString()}</span>
                 </div>
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
};

// --- Tab 3: Mining Race ---

const MiningRaceTab: React.FC = () => {
    return <MiningSimulator />;
};

export default M07_Mining;
