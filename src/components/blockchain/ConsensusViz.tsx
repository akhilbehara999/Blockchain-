import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Cpu, Coins, Users, Shield, Zap, Clock, Lock, AlertTriangle,
  Play, RotateCcw, Trophy, Activity, CheckCircle
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip
} from 'recharts';

import Card from '../ui/Card';
import Button from '../ui/Button';
import Slider from '../ui/Slider';
import Toggle from '../ui/Toggle';
import Tabs from '../ui/Tabs';
import ProgressBar from '../ui/ProgressBar';
import Badge from '../ui/Badge';
import { simulatePoW, simulatePoS, simulateDPoS } from '../../engine/consensus';

// --- Types ---

interface Miner {
  id: string;
  name: string;
  hashRate: number; // 1-100
  progress: number; // 0-100
  wins: number;
  color: string;
}

interface Validator {
  id: string;
  name: string;
  stake: number; // 0-1000
  wins: number;
  color: string;
}

interface Candidate {
  id: string;
  name: string;
  votes: number; // 0-100
  isDelegate: boolean;
}

// --- Main Component ---

const ConsensusViz: React.FC = () => {
  const [activeTab, setActiveTab] = useState('pow');

  const tabs = [
    { id: 'pow', label: 'Proof of Work', icon: <Cpu className="w-4 h-4" /> },
    { id: 'pos', label: 'Proof of Stake', icon: <Coins className="w-4 h-4" /> },
    { id: 'dpos', label: 'Delegated PoS', icon: <Users className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-8">
      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={setActiveTab}
        className="mb-6"
      />

      <div className="min-h-[500px]">
        {activeTab === 'pow' && <PoWTab />}
        {activeTab === 'pos' && <PoSTab />}
        {activeTab === 'dpos' && <DPoSTab />}
      </div>

      <ComparisonTable />
    </div>
  );
};

export default ConsensusViz;

// --- Tab 1: Proof of Work ---

const PoWTab: React.FC = () => {
  const [miners, setMiners] = useState<Miner[]>([
    { id: '1', name: 'Miner A', hashRate: 20, progress: 0, wins: 0, color: 'text-accent' },
    { id: '2', name: 'Miner B', hashRate: 30, progress: 0, wins: 0, color: 'text-success' },
    { id: '3', name: 'Miner C', hashRate: 25, progress: 0, wins: 0, color: 'text-warning' },
    { id: '4', name: 'Miner D', hashRate: 25, progress: 0, wins: 0, color: 'text-danger' },
  ]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [attackMode, setAttackMode] = useState(false);
  const [winner, setWinner] = useState<Miner | null>(null);
  const [roundStats, setRoundStats] = useState<{ time: number; attempts: number } | null>(null);

  // Attack Mode Effect
  useEffect(() => {
    if (attackMode) {
      setMiners(prev => prev.map(m =>
        m.id === '1' ? { ...m, hashRate: 60 } : { ...m, hashRate: 10 }
      ));
    } else {
      // Reset to balanced
      setMiners([
        { id: '1', name: 'Miner A', hashRate: 20, progress: 0, wins: 0, color: 'text-accent' },
        { id: '2', name: 'Miner B', hashRate: 30, progress: 0, wins: 0, color: 'text-success' },
        { id: '3', name: 'Miner C', hashRate: 25, progress: 0, wins: 0, color: 'text-warning' },
        { id: '4', name: 'Miner D', hashRate: 25, progress: 0, wins: 0, color: 'text-danger' },
      ]);
    }
    setWinner(null);
    setRoundStats(null);
  }, [attackMode]);

  const runSimulation = () => {
    setIsSimulating(true);
    setWinner(null);
    setRoundStats(null);

    // Reset progress
    setMiners(prev => prev.map(m => ({ ...m, progress: 0 })));

    // Simulate duration based on inverse of total hashrate (simplified)
    const totalHashRate = miners.reduce((acc, m) => acc + m.hashRate, 0);
    const difficulty = 4; // Virtual difficulty

    // Use engine for result
    const result = simulatePoW(miners.map(m => ({ name: m.name, hashRate: m.hashRate })), difficulty);

    // Animation loop
    const duration = 2000; // 2 seconds animation
    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const p = Math.min(elapsed / duration, 1);

      setMiners(prev => prev.map(m => {
        // Progress speed proportional to hashrate relative to total
        // But we want the winner to reach 100 first.
        // Simplified: animate towards 100, winner hits it first.

        let targetProgress = p * 100;

        // Add some jitter
        const jitter = Math.random() * 5;

        // If this is the winner, ensure they are ahead at the end
        if (m.name === result.winner && p > 0.9) {
           return { ...m, progress: Math.min(100, targetProgress + 10) };
        }

        return { ...m, progress: Math.min(95, targetProgress * (m.hashRate / (totalHashRate/4)) + jitter) };
      }));

      if (p >= 1) {
        clearInterval(interval);
        finishSimulation(result);
      }
    }, 50);
  };

  const finishSimulation = (result: { winner: string; attempts: Record<string, number>; timeMs: number }) => {
    setIsSimulating(false);

    const winnerMiner = miners.find(m => m.name === result.winner);
    if (winnerMiner) {
      setWinner(winnerMiner);
      setMiners(prev => prev.map(m =>
        m.name === result.winner
          ? { ...m, progress: 100, wins: m.wins + 1 }
          : { ...m, progress: m.progress } // Keep progress as is
      ));
      setRoundStats({
        time: result.timeMs,
        attempts: Object.values(result.attempts).reduce((a, b) => a + b, 0)
      });
    }
  };

  const updateHashRate = (id: string, val: number) => {
    if (attackMode) return; // Locked in attack mode
    setMiners(prev => prev.map(m => m.id === id ? { ...m, hashRate: val } : m));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 space-y-6">
        <Card title="Miner Configuration">
          <div className="space-y-6">
             <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-medium text-text-secondary">Attack Scenario</span>
                <Toggle
                  checked={attackMode}
                  onChange={setAttackMode}
                  label="51% Attack"
                />
             </div>

             {attackMode && (
               <div className="bg-danger/10 border border-danger/20 rounded-lg p-3 flex items-start gap-3">
                 <AlertTriangle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
                 <p className="text-xs text-danger">
                   Miner A controls majority hash rate! They can now rewrite recent blocks or censor transactions.
                 </p>
               </div>
             )}

             <div className="space-y-4">
               {miners.map(m => (
                 <Slider
                   key={m.id}
                   label={m.name}
                   min={1}
                   max={100}
                   value={m.hashRate}
                   onChange={(val) => updateHashRate(m.id, val)}
                   disabled={isSimulating || attackMode}
                   showValue
                 />
               ))}
             </div>

             <Button
               className="w-full"
               onClick={runSimulation}
               disabled={isSimulating}
               variant="primary"
             >
               {isSimulating ? 'Mining...' : 'Simulate Round'}
             </Button>
          </div>
        </Card>
      </div>

      <div className="lg:col-span-2 space-y-6">
        <Card title="Mining Race">
          <div className="space-y-8 min-h-[300px] flex flex-col justify-center">
            {miners.map(m => (
              <div key={m.id} className="space-y-2">
                <div className="flex justify-between items-center">
                   <div className="flex items-center gap-2">
                     <Cpu className={`w-5 h-5 ${m.color.replace('text-', 'stroke-')}`} />
                     <span className="font-medium">{m.name}</span>
                     {winner?.id === m.id && (
                       <Badge variant="success" className="text-[10px] py-0 h-5">WINNER</Badge>
                     )}
                   </div>
                   <div className="text-xs text-text-secondary font-mono">
                     {m.hashRate} MH/s
                   </div>
                </div>
                <div className="relative h-6 bg-tertiary-bg rounded-full overflow-hidden">
                   <motion.div
                     className={`absolute top-0 left-0 h-full ${m.color.replace('text-', 'bg-')}`}
                     initial={{ width: '0%' }}
                     animate={{ width: `${m.progress}%` }}
                     transition={{ type: 'tween', ease: 'linear' }}
                   />
                   {/* Activity indicator */}
                   {isSimulating && (
                     <motion.div
                        className="absolute top-0 right-0 bottom-0 w-8 bg-white/20 skew-x-[-20deg]"
                        animate={{ x: ['-200%', '400%'] }}
                        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                     />
                   )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {winner && roundStats && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-success/5 border-success/20">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-success/20 rounded-full text-success">
                      <Trophy className="w-6 h-6" />
                    </div>
                    <div>
                       <h3 className="font-bold text-lg">{winner.name} Found the Block!</h3>
                       <p className="text-sm text-text-secondary">
                         {roundStats.attempts.toLocaleString()} hashes computed in {(roundStats.time/1000).toFixed(2)}s
                       </p>
                    </div>
                 </div>
                 <div className="text-right">
                    <div className="text-xs text-text-secondary uppercase">Reward</div>
                    <div className="font-mono text-xl font-bold text-accent">50 BTC</div>
                 </div>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};

// --- Tab 2: Proof of Stake ---

const COLORS = ['#6366F1', '#22C55E', '#EAB308', '#EF4444'];

const PoSTab: React.FC = () => {
  const [validators, setValidators] = useState<Validator[]>([
    { id: '1', name: 'Validator A', stake: 100, wins: 0, color: COLORS[0] },
    { id: '2', name: 'Validator B', stake: 100, wins: 0, color: COLORS[1] },
    { id: '3', name: 'Validator C', stake: 100, wins: 0, color: COLORS[2] },
    { id: '4', name: 'Validator D', stake: 100, wins: 0, color: COLORS[3] },
  ]);
  const [attackMode, setAttackMode] = useState(false);
  const [selectedValidator, setSelectedValidator] = useState<string | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [simulationCount, setSimulationCount] = useState(0);

  useEffect(() => {
    if (attackMode) {
      setValidators(prev => prev.map(v =>
        v.id === '1' ? { ...v, stake: 800 } : { ...v, stake: 50 }
      ));
    } else {
      setValidators(prev => prev.map((v, i) => ({ ...v, stake: 100 })));
    }
    setSelectedValidator(null);
    setSimulationCount(0);
  }, [attackMode]);

  const updateStake = (id: string, val: number) => {
    if (attackMode) return;
    setValidators(prev => prev.map(v => v.id === id ? { ...v, stake: val } : v));
  };

  const spinWheel = () => {
    setIsSpinning(true);
    setSelectedValidator(null);

    // Simulate spin duration
    setTimeout(() => {
       const result = simulatePoS(validators);
       setSelectedValidator(result.selected);
       setIsSpinning(false);

       // Update wins
       setValidators(prev => prev.map(v =>
         v.name === result.selected ? { ...v, wins: v.wins + 1 } : v
       ));
    }, 1500);
  };

  const runBulkSimulation = () => {
     setIsSpinning(true);
     let rounds = 0;
     const maxRounds = 10;

     const interval = setInterval(() => {
        rounds++;
        const result = simulatePoS(validators);
        setValidators(prev => prev.map(v =>
           v.name === result.selected ? { ...v, wins: v.wins + 1 } : v
        ));

        if (rounds >= maxRounds) {
           clearInterval(interval);
           setIsSpinning(false);
           setSimulationCount(prev => prev + maxRounds);
        }
     }, 100);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 space-y-6">
        <Card title="Staking Configuration">
           <div className="space-y-6">
             <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-medium text-text-secondary">Attack Scenario</span>
                <Toggle
                  checked={attackMode}
                  onChange={setAttackMode}
                  label="Rich Get Richer"
                />
             </div>

             {attackMode && (
               <div className="bg-danger/10 border border-danger/20 rounded-lg p-3 flex items-start gap-3">
                 <AlertTriangle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
                 <p className="text-xs text-danger">
                   Validator A owns majority stake! Centralization risk: they control block production.
                 </p>
               </div>
             )}

             <div className="space-y-4">
               {validators.map(v => (
                 <Slider
                   key={v.id}
                   label={v.name}
                   min={0}
                   max={1000}
                   value={v.stake}
                   onChange={(val) => updateStake(v.id, val)}
                   disabled={isSpinning || attackMode}
                   showValue
                 />
               ))}
             </div>

             <div className="grid grid-cols-2 gap-3">
               <Button
                 onClick={spinWheel}
                 disabled={isSpinning}
                 variant="primary"
               >
                 {isSpinning ? 'Spinning...' : 'Select Validator'}
               </Button>
               <Button
                 onClick={runBulkSimulation}
                 disabled={isSpinning}
                 variant="secondary"
               >
                 Run 10 Rounds
               </Button>
             </div>
           </div>
        </Card>
      </div>

      <div className="lg:col-span-2 space-y-6">
         <Card title="Stake Distribution">
           <div className="flex flex-col md:flex-row items-center justify-center gap-8 min-h-[300px]">
              {/* Pie Chart */}
              <div className="relative w-64 h-64">
                 <ResponsiveContainer width="100%" height="100%">
                   <PieChart>
                     <Pie
                       data={validators}
                       dataKey="stake"
                       nameKey="name"
                       cx="50%"
                       cy="50%"
                       innerRadius={60}
                       outerRadius={80}
                       paddingAngle={5}
                     >
                       {validators.map((entry, index) => (
                         <Cell
                           key={`cell-${index}`}
                           fill={entry.color}
                           stroke={selectedValidator === entry.name ? '#fff' : 'none'}
                           strokeWidth={2}
                           className="transition-all duration-300"
                           opacity={selectedValidator && selectedValidator !== entry.name ? 0.3 : 1}
                         />
                       ))}
                     </Pie>
                     <RechartsTooltip
                        contentStyle={{ backgroundColor: '#1E293B', border: 'none', borderRadius: '8px' }}
                        itemStyle={{ color: '#F8FAFC' }}
                     />
                   </PieChart>
                 </ResponsiveContainer>

                 {/* Center Label */}
                 <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    {selectedValidator ? (
                       <motion.div
                         initial={{ scale: 0 }}
                         animate={{ scale: 1 }}
                         className="text-center"
                       >
                          <div className="text-xs text-text-secondary">Selected</div>
                          <div className="font-bold text-sm">{selectedValidator}</div>
                       </motion.div>
                    ) : (
                       <div className="text-xs text-text-secondary">
                          {isSpinning ? 'Selecting...' : 'Total Stake'}
                          <div className="font-mono text-lg text-text-primary">
                             {validators.reduce((a, b) => a + b.stake, 0)}
                          </div>
                       </div>
                    )}
                 </div>
              </div>

              {/* Stats */}
              <div className="flex-1 w-full space-y-4">
                 <h4 className="text-sm font-medium text-text-secondary uppercase">Win History</h4>
                 {validators.map(v => (
                    <div key={v.id} className="flex items-center gap-3">
                       <div className="w-3 h-3 rounded-full" style={{ backgroundColor: v.color }} />
                       <span className="text-sm flex-1">{v.name}</span>
                       <div className="flex items-center gap-2">
                          <div className="w-32 h-2 bg-tertiary-bg rounded-full overflow-hidden">
                             <motion.div
                               className="h-full rounded-full"
                               style={{ backgroundColor: v.color }}
                               initial={{ width: 0 }}
                               animate={{ width: `${(v.wins / Math.max(1, simulationCount + (selectedValidator ? 1 : 0))) * 100}%` }}
                             />
                          </div>
                          <span className="font-mono text-xs w-6 text-right">{v.wins}</span>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
         </Card>
      </div>
    </div>
  );
};

// --- Tab 3: Delegated Proof of Stake ---

const DPoSTab: React.FC = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([
    { id: '1', name: 'Delegate A', votes: 10, isDelegate: false },
    { id: '2', name: 'Delegate B', votes: 20, isDelegate: false },
    { id: '3', name: 'Delegate C', votes: 15, isDelegate: false },
    { id: '4', name: 'Delegate D', votes: 5, isDelegate: false },
    { id: '5', name: 'Delegate E', votes: 25, isDelegate: false },
    { id: '6', name: 'Delegate F', votes: 10, isDelegate: false },
  ]);
  const [userVotes, setUserVotes] = useState<Record<string, number>>({
    '1': 10, '2': 20, '3': 15, '4': 5, '5': 25, '6': 10
  }); // Tracks sliders

  const [activeDelegates, setActiveDelegates] = useState<string[]>([]);
  const [currentProducer, setCurrentProducer] = useState<string | null>(null);
  const [isElectionRunning, setIsElectionRunning] = useState(false);
  const [attackMode, setAttackMode] = useState(false);

  const MAX_VOTES = 100;
  const totalVotesUsed = Object.values(userVotes).reduce((a, b) => a + b, 0);

  useEffect(() => {
    if (attackMode) {
       // Concentrate votes on A, B, C
       const newVotes = { '1': 40, '2': 40, '3': 20, '4': 0, '5': 0, '6': 0 };
       setUserVotes(newVotes);
       updateCandidates(newVotes);
    } else {
       // Reset
       const newVotes = { '1': 10, '2': 20, '3': 15, '4': 5, '5': 25, '6': 10 };
       setUserVotes(newVotes);
       updateCandidates(newVotes);
    }
  }, [attackMode]);

  const updateCandidates = (votesMap: Record<string, number>) => {
    setCandidates(prev => prev.map(c => ({
      ...c, votes: votesMap[c.id] || 0
    })));
  };

  const handleVoteChange = (id: string, val: number) => {
    if (attackMode) return;
    // Allow change, just warn if over limit? Or clamp?
    // Let's allow but show warning
    const newVotes = { ...userVotes, [id]: val };
    setUserVotes(newVotes);
    updateCandidates(newVotes);
  };

  const runElection = () => {
    setIsElectionRunning(true);
    setCurrentProducer(null);

    // Simulate DPoS election
    // Top 3 become delegates
    const result = simulateDPoS(
       candidates.map(c => ({ name: c.name, votes: c.votes })),
       3
    );

    // Animate selection
    setTimeout(() => {
       setActiveDelegates(result.activeDelegates);
       setCandidates(prev => prev.map(c => ({
          ...c,
          isDelegate: result.activeDelegates.includes(c.name)
       })));

       startBlockProduction(result.activeDelegates);
    }, 1000);
  };

  const startBlockProduction = (delegates: string[]) => {
     let index = 0;
     const interval = setInterval(() => {
        setCurrentProducer(delegates[index]);
        index = (index + 1) % delegates.length;
     }, 1500); // Switch every 1.5s

     // Stop after 3 full rounds (3 * 3 = 9 steps)
     setTimeout(() => {
        clearInterval(interval);
        setIsElectionRunning(false);
        setCurrentProducer(null);
     }, 1500 * 9);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 space-y-6">
        <Card title="Vote Allocation">
           <div className="space-y-6">
             <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-medium text-text-secondary">Attack Scenario</span>
                <Toggle
                  checked={attackMode}
                  onChange={setAttackMode}
                  label="Cartel Formation"
                />
             </div>

             {attackMode && (
               <div className="bg-danger/10 border border-danger/20 rounded-lg p-3 flex items-start gap-3">
                 <AlertTriangle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
                 <p className="text-xs text-danger">
                   A few delegates control all the votes. Collusion risk is high!
                 </p>
               </div>
             )}

             <div className="space-y-4">
               {candidates.map(c => (
                 <Slider
                   key={c.id}
                   label={c.name}
                   min={0}
                   max={50}
                   value={userVotes[c.id]}
                   onChange={(val) => handleVoteChange(c.id, val)}
                   disabled={isElectionRunning || attackMode}
                   showValue
                 />
               ))}
             </div>

             <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Total Votes:</span>
                <span className={`font-mono ${totalVotesUsed > MAX_VOTES ? 'text-danger' : 'text-success'}`}>
                   {totalVotesUsed} / {MAX_VOTES}
                </span>
             </div>

             <Button
               className="w-full"
               onClick={runElection}
               disabled={isElectionRunning} // Allow running even if votes != 100 for playground feel
               variant="primary"
             >
               {isElectionRunning ? 'Consensus Running...' : 'Run Election'}
             </Button>
           </div>
        </Card>
      </div>

      <div className="lg:col-span-2 space-y-6">
         <Card title="Active Delegates & Block Production">
            <div className="space-y-8 min-h-[300px]">
               {/* Candidates Grid */}
               <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {candidates.map(c => (
                     <motion.div
                        key={c.id}
                        layout
                        className={`
                           p-4 rounded-xl border flex flex-col items-center justify-center gap-2 text-center transition-colors relative
                           ${c.isDelegate
                              ? 'bg-accent/10 border-accent shadow-[0_0_15px_rgba(99,102,241,0.3)]'
                              : 'bg-tertiary-bg border-transparent opacity-60'
                           }
                           ${currentProducer === c.name ? 'ring-2 ring-white scale-105' : ''}
                        `}
                     >
                        <Users className={`w-8 h-8 ${c.isDelegate ? 'text-accent' : 'text-text-secondary'}`} />
                        <div className="font-bold text-sm">{c.name}</div>
                        <div className="text-xs text-text-secondary">{c.votes} Votes</div>

                        {c.isDelegate && (
                           <div className="absolute top-2 right-2">
                              <CheckCircle className="w-4 h-4 text-accent" />
                           </div>
                        )}

                        {currentProducer === c.name && (
                           <motion.div
                             className="absolute -top-3 bg-success text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-lg"
                             initial={{ y: 5, opacity: 0 }}
                             animate={{ y: 0, opacity: 1 }}
                           >
                              PRODUCING BLOCK
                           </motion.div>
                        )}
                     </motion.div>
                  ))}
               </div>

               {/* Round Robin Viz */}
               <div className="bg-tertiary-bg/50 rounded-xl p-6 flex flex-col items-center justify-center min-h-[120px]">
                  {activeDelegates.length > 0 ? (
                     <div className="flex items-center gap-4">
                        {activeDelegates.map((d, i) => (
                           <React.Fragment key={d}>
                              <div className={`
                                 w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all
                                 ${currentProducer === d ? 'bg-accent text-white scale-110 shadow-lg' : 'bg-secondary-bg text-text-secondary'}
                              `}>
                                 {d.split(' ')[1]}
                              </div>
                              {i < activeDelegates.length - 1 && (
                                 <div className="w-8 h-0.5 bg-border" />
                              )}
                           </React.Fragment>
                        ))}
                     </div>
                  ) : (
                     <p className="text-text-secondary text-sm">Run election to select delegates</p>
                  )}
                  {currentProducer && (
                     <p className="mt-4 text-sm font-mono text-accent animate-pulse">
                        Block produced by {currentProducer}
                     </p>
                  )}
               </div>
            </div>
         </Card>
      </div>
    </div>
  );
};

// --- Comparison Table ---

const ComparisonTable: React.FC = () => {
  const data = [
    { mech: 'Proof of Work', energy: 'High', decentral: 'High', speed: 'Low', cost: 'High' },
    { mech: 'Proof of Stake', energy: 'Low', decentral: 'Medium', speed: 'High', cost: 'High' },
    { mech: 'Delegated PoS', energy: 'Very Low', decentral: 'Low', speed: 'Very High', cost: 'Medium' },
  ];

  return (
    <Card title="Consensus Comparison">
       <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
             <thead className="bg-tertiary-bg text-text-secondary uppercase font-medium">
                <tr>
                   <th className="px-6 py-3 rounded-tl-lg">Mechanism</th>
                   <th className="px-6 py-3">Energy Use</th>
                   <th className="px-6 py-3">Decentralization</th>
                   <th className="px-6 py-3">Speed (TPS)</th>
                   <th className="px-6 py-3 rounded-tr-lg">Attack Cost</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-border/30">
                {data.map((row, i) => (
                   <tr key={i} className="hover:bg-tertiary-bg/30 transition-colors">
                      <td className="px-6 py-4 font-bold text-text-primary">{row.mech}</td>
                      <td className="px-6 py-4">
                         <Badge variant={row.energy === 'High' ? 'danger' : row.energy === 'Low' ? 'success' : 'secondary'}>
                            {row.energy}
                         </Badge>
                      </td>
                      <td className="px-6 py-4">{row.decentral}</td>
                      <td className="px-6 py-4">{row.speed}</td>
                      <td className="px-6 py-4">{row.cost}</td>
                   </tr>
                ))}
             </tbody>
          </table>
       </div>
    </Card>
  );
};
