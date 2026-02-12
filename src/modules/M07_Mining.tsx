import React, { useState, useEffect, useRef, useCallback } from 'react';
import ModuleLayout from '../components/layout/ModuleLayout';
import Tabs from '../components/ui/Tabs';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Slider from '../components/ui/Slider';
import NonceCounter from '../components/blockchain/NonceCounter';
import HashDisplay from '../components/blockchain/HashDisplay';
import MiningAnimation from '../components/blockchain/MiningAnimation';
import ProgressBar from '../components/ui/ProgressBar';
import { useMining } from '../hooks/useMining';
import { useNetworkDelay } from '../hooks/useNetworkDelay';
import { calculateHash } from '../engine/block';
import { Block } from '../engine/types';
import { Hammer, Play, Square, Trophy, Timer, Zap, History } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

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

  const { startMine, stopMine, isMining, nonce, hash, progress } = useMining();
  const [startTime, setStartTime] = useState<number | null>(null);
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
      setStartTime(Date.now());
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
        const now = Date.now();
        const timeDiff = (now - lastTimeRef.current) / 1000;

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

interface Racer {
  id: string;
  name: string;
  hashRate: number; // 1-10
  progress: number; // 0-100%
  finished: boolean;
  time: number;
  attempts: number;
  color: 'accent' | 'success' | 'danger';
}

interface RaceResult {
    difficulty: number;
    avgTime: number;
    raceId: number; // to simplify key
}

const MiningRaceTab: React.FC = () => {
  const [raceDifficulty, setRaceDifficulty] = useState(3);
  const [racers, setRacers] = useState<Racer[]>([
    { id: '1', name: 'Miner Alice', hashRate: 3, progress: 0, finished: false, time: 0, attempts: 0, color: 'accent' },
    { id: '2', name: 'Miner Bob', hashRate: 6, progress: 0, finished: false, time: 0, attempts: 0, color: 'success' },
    { id: '3', name: 'Miner Charlie', hashRate: 9, progress: 0, finished: false, time: 0, attempts: 0, color: 'danger' },
  ]);
  const [raceStatus, setRaceStatus] = useState<'idle' | 'racing' | 'finished'>('idle');
  const [winner, setWinner] = useState<Racer | null>(null);
  const [history, setHistory] = useState<RaceResult[]>([]);
  const requestRef = useRef<number>();
  const startTimeRef = useRef<number>(0);

  // Constants
  const TARGET_NONCE = 500 * Math.pow(2, raceDifficulty); // Scale target by difficulty

  const updateRace = () => {
    const now = Date.now();
    const elapsed = (now - startTimeRef.current) / 1000;

    setRacers(prevRacers => {
        let allFinished = true;
        let newWinner = winner;

        const nextRacers = prevRacers.map(r => {
            if (r.finished) return r;

            allFinished = false;
            // Simulate progress: hashRate * random factor
            const speed = r.hashRate * 50; // Base speed multiplier
            const variance = Math.random() * 0.5 + 0.75; // Randomness 0.75 - 1.25
            const increment = speed * variance;

            const newAttempts = r.attempts + increment;

            // Check finish
            if (newAttempts >= TARGET_NONCE) {
                if (!newWinner) newWinner = { ...r, time: elapsed, finished: true, attempts: newAttempts };
                return { ...r, progress: 100, finished: true, time: elapsed, attempts: newAttempts };
            }

            return { ...r, progress: (newAttempts / TARGET_NONCE) * 100, attempts: newAttempts };
        });

        if (newWinner && !winner) {
            setWinner(newWinner);
        }

        if (allFinished) {
            setRaceStatus('finished');
            // Add to history
            const avgTime = nextRacers.reduce((acc, r) => acc + r.time, 0) / nextRacers.length;
            setHistory(prev => {
                const newHistory = [...prev, { difficulty: raceDifficulty, avgTime, raceId: Date.now() }];
                // Keep only last 10 or group by difficulty?
                // Prompt: "plot multiple races showing difficulty vs average mining time (accumulates data across races)"
                // Let's store raw points for scatter/line chart
                return newHistory;
            });
        } else {
            requestRef.current = requestAnimationFrame(updateRace);
        }

        return nextRacers;
    });
  };

  const startRace = () => {
    setRaceStatus('racing');
    setWinner(null);
    setRacers(prev => prev.map(r => ({ ...r, progress: 0, finished: false, time: 0, attempts: 0 })));
    startTimeRef.current = Date.now();
    requestRef.current = requestAnimationFrame(updateRace);
  };

  useEffect(() => {
    return () => {
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  // Compute chart data: Average time per difficulty
  const chartData = Object.values(history.reduce((acc, curr) => {
    if (!acc[curr.difficulty]) {
        acc[curr.difficulty] = { difficulty: curr.difficulty, totalTime: 0, count: 0 };
    }
    acc[curr.difficulty].totalTime += curr.avgTime;
    acc[curr.difficulty].count += 1;
    return acc;
  }, {} as Record<number, { difficulty: number, totalTime: number, count: number }>))
  .map(item => ({
    difficulty: item.difficulty,
    avgTime: (item.totalTime / item.count).toFixed(2)
  }))
  .sort((a, b) => a.difficulty - b.difficulty);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Race Config */}
        <div className="lg:col-span-1 space-y-6">
            <Card title="Race Configuration">
                <div className="space-y-6">
                    <Slider
                        label="Race Difficulty"
                        min={1}
                        max={5}
                        value={raceDifficulty}
                        onChange={setRaceDifficulty}
                        disabled={raceStatus === 'racing'}
                        showValue
                    />

                    <div className="space-y-4 pt-4 border-t border-border/50">
                        <label className="text-xs font-medium text-text-secondary uppercase">Hash Rates</label>
                        {racers.map((r, i) => (
                            <Slider
                                key={r.id}
                                label={r.name}
                                min={1}
                                max={10}
                                value={r.hashRate}
                                onChange={(val) => {
                                    const newRacers = [...racers];
                                    newRacers[i].hashRate = val;
                                    setRacers(newRacers);
                                }}
                                disabled={raceStatus === 'racing'}
                            />
                        ))}
                    </div>

                    <Button
                        onClick={startRace}
                        disabled={raceStatus === 'racing'}
                        className="w-full"
                        variant="primary"
                    >
                        {raceStatus === 'racing' ? 'Racing...' : 'Start Race'}
                    </Button>
                </div>
            </Card>

            {/* Recent Winner */}
            <AnimatePresence>
                {winner && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                    >
                        <Card className="border-l-4 border-l-warning bg-warning/10">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-warning/20 rounded-full text-warning">
                                    <Trophy className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-text-primary">{winner.name} Wins!</h3>
                                    <p className="text-sm text-text-secondary">+50 Block Reward</p>
                                </div>
                            </div>
                        </Card>
                         <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                            {/* Confetti logic usually goes here or separate component */}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>

        {/* Race Track & Results */}
        <div className="lg:col-span-2 space-y-6">
            <Card title="Mining Race Track">
                <div className="space-y-6 py-4">
                    {racers.map(r => (
                        <div key={r.id} className="space-y-2">
                             <div className="flex justify-between text-sm">
                                <span className="font-medium text-text-primary">{r.name}</span>
                                <span className="text-text-secondary font-mono">
                                    {r.finished ? `${r.time.toFixed(2)}s` : `${Math.round(r.attempts)} nonces`}
                                </span>
                             </div>
                             <div className="relative">
                                <ProgressBar
                                    value={r.progress}
                                    color={r.color}
                                    className="h-4"
                                />
                                {r.finished && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="absolute -right-2 -top-2 bg-success text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                                    >
                                        DONE
                                    </motion.div>
                                )}
                             </div>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Results Chart */}
            <Card title="Difficulty vs Average Time">
                <div className="h-[250px] w-full mt-4">
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                                <XAxis
                                    dataKey="difficulty"
                                    stroke="#94A3B8"
                                    label={{ value: 'Difficulty', position: 'insideBottom', offset: -5 }}
                                />
                                <YAxis
                                    stroke="#94A3B8"
                                    label={{ value: 'Time (s)', angle: -90, position: 'insideLeft' }}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155' }}
                                    itemStyle={{ color: '#F8FAFC' }}
                                />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="avgTime"
                                    name="Avg Time (s)"
                                    stroke="#6366F1"
                                    strokeWidth={2}
                                    dot={{ fill: '#6366F1' }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-text-secondary opacity-50">
                            <History className="w-12 h-12 mb-2" />
                            <p>Run races at different difficulties to see data</p>
                        </div>
                    )}
                </div>
            </Card>
        </div>
      </div>
    </div>
  );
};

export default M07_Mining;
