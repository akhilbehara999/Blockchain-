import React, { useState, useEffect, useMemo } from 'react';
import { Hammer, Play, Pause, Zap, Award, Activity, Cpu } from 'lucide-react';
import { backgroundEngine, Miner } from '../../../engine/BackgroundEngine';
import { useBlockchainStore } from '../../../stores/useBlockchainStore';
import { useSandboxStore } from '../../../stores/useSandboxStore';
import { useWalletStore } from '../../../stores/useWalletStore';
import { forkManager } from '../../../engine/ForkManager';
import { NodeIdentity } from '../../../engine/NodeIdentity';
import SandboxPanel from '../SandboxPanel';

interface MinerStat extends Miner {
  blocksWon: number;
  isUser?: boolean;
}

const MiningPanel: React.FC = () => {
  const blocks = useBlockchainStore(state => state.blocks);
  const incrementMastery = useSandboxStore(state => state.incrementMastery);
  const { mempool } = useWalletStore();

  const [isMining, setIsMining] = useState(false);
  const [userHashRate, setUserHashRate] = useState(25);
  const [miners, setMiners] = useState<Miner[]>([]);
  const [lastWin, setLastWin] = useState<string | null>(null);

  // Poll miners
  useEffect(() => {
    const updateMiners = () => {
      setMiners([...backgroundEngine.getSimulatedMiners()]);
    };
    updateMiners();
    const interval = setInterval(updateMiners, 2000);
    return () => clearInterval(interval);
  }, []);

  // Leaderboard Logic
  const leaderboard = useMemo(() => {
    const stats: Record<string, number> = {};
    blocks.forEach(b => {
      const match = b.data.match(/Mined by ([^\n]+)/);
      if (match) {
        const name = match[1];
        stats[name] = (stats[name] || 0) + 1;
      }
    });

    const userMinerId = NodeIdentity.getOrCreate().getId();
    const allMiners: MinerStat[] = miners.map(m => ({
      ...m,
      blocksWon: stats[m.name] || 0
    }));

    if (isMining || stats[userMinerId]) {
      allMiners.push({
        name: userMinerId,
        hashRate: userHashRate,
        blocksWon: stats[userMinerId] || 0,
        isUser: true
      });
    }

    return allMiners.sort((a, b) => b.blocksWon - a.blocksWon || b.hashRate - a.hashRate);
  }, [blocks, miners, isMining, userHashRate]);

  // Mining Logic
  useEffect(() => {
    if (!isMining) return;

    let timeout: NodeJS.Timeout;
    const mine = () => {
      const avgTime = 60000 * (100 / userHashRate);
      const buffedAvg = avgTime / 4;
      const delay = Math.random() * 5000 + 1000;

      timeout = setTimeout(() => {
        const chance = Math.random();
        const p = 1 - Math.exp(-3000 / buffedAvg);

        if (chance < p) {
          const userMinerId = NodeIdentity.getOrCreate().getId();
          const sortedMempool = [...mempool].sort((a, b) => (b.fee || 0) - (a.fee || 0));
          const txsToMine = sortedMempool.slice(0, 5);

          const txData = txsToMine.map(tx => {
             return `${tx.from.substring(0, 8)}->${tx.to.substring(0, 8)} (${tx.amount})`;
          }).join(', ');

          const blockData = `Mined by ${userMinerId}\n${txData || 'No transactions'}`;
          forkManager.processBlock(blockData, userMinerId);

          if (txsToMine.length > 0) {
             useWalletStore.getState().mineMempool();
          }

          incrementMastery('blocksMined');
          setLastWin(new Date().toLocaleTimeString());
        }
        mine();
      }, delay);
    };

    mine();
    return () => clearTimeout(timeout);
  }, [isMining, userHashRate, mempool, incrementMastery]);

  const toggleMining = () => setIsMining(!isMining);

  const totalHashRate = leaderboard.reduce((a,b) => a + b.hashRate, 0);

  return (
    <SandboxPanel
        title="Mining Control"
        icon={Hammer}
        isLive={isMining}
        footer={
            <div className="flex justify-between items-center text-xs text-gray-500">
                <span className="flex items-center gap-1"><Activity className="w-3 h-3" /> Network Hashrate: {totalHashRate} MH/s</span>
                {lastWin && <span className="text-green-600 font-bold flex items-center gap-1"><Award className="w-3 h-3" /> Last Win: {lastWin}</span>}
            </div>
        }
    >
        <div className="space-y-6">
            {/* Control Panel */}
            <div className={`p-4 rounded-xl border transition-all duration-300 ${isMining ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800' : 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700'}`}>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-lg ${isMining ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-200 text-gray-500'}`}>
                            <Zap className={`w-5 h-5 ${isMining ? 'fill-current' : ''}`} />
                        </div>
                        <div>
                            <h4 className="font-bold text-sm text-gray-900 dark:text-white">Mining Node</h4>
                            <div className="text-xs text-gray-500">{isMining ? 'Solving PoW puzzles...' : 'Miner is idle'}</div>
                        </div>
                    </div>
                    <button
                        onClick={toggleMining}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-all hover:scale-105 active:scale-95 ${
                            isMining
                            ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700 animate-pulse'
                        }`}
                    >
                        {isMining ? <><Pause className="w-4 h-4" /> Stop</> : <><Play className="w-4 h-4" /> Start Mining</>}
                    </button>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between text-xs font-medium text-gray-500">
                        <span>Hardware Power</span>
                        <span>{userHashRate} MH/s</span>
                    </div>
                    <input
                        type="range"
                        min="10"
                        max="100"
                        value={userHashRate}
                        onChange={(e) => setUserHashRate(parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-indigo-600"
                    />
                </div>
            </div>

            {/* Mining Race / Leaderboard */}
            <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3 flex items-center gap-1">
                    <Cpu className="w-3 h-3" /> Active Miners
                </h4>
                <div className="space-y-3">
                    {leaderboard.map((miner) => (
                        <div key={miner.name} className="relative group">
                            <div className="flex justify-between items-center text-xs mb-1 relative z-10">
                                <span className={`font-bold flex items-center gap-1 ${miner.isUser ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-700 dark:text-gray-300'}`}>
                                    {miner.isUser ? 'YOU' : miner.name}
                                    {miner.isUser && <span className="bg-indigo-100 text-indigo-700 text-[10px] px-1 rounded">ME</span>}
                                </span>
                                <span className="text-gray-500">{miner.hashRate} MH/s</span>
                            </div>

                            {/* Visual Bar */}
                            <div className="h-8 w-full bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden relative border border-gray-200 dark:border-gray-700">
                                {/* Hashrate bar */}
                                <div
                                    className={`absolute top-0 left-0 bottom-0 opacity-20 ${miner.isUser ? 'bg-indigo-500' : 'bg-gray-500'}`}
                                    style={{ width: `${(miner.hashRate / 100) * 100}%` }}
                                ></div>

                                {/* Animated "Working" bar */}
                                { (miner.isUser ? isMining : true) && (
                                     <div
                                        className={`absolute top-0 bottom-0 w-2 blur-sm ${miner.isUser ? 'bg-indigo-400' : 'bg-gray-400'} animate-[mining_1s_infinite_linear]`}
                                        style={{ animationDuration: `${2000 / miner.hashRate}s` }}
                                     ></div>
                                )}

                                {/* Blocks Won count overlay */}
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 font-mono font-bold text-xs text-gray-400 z-10">
                                    {miner.blocksWon} BLOCKS
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        <style>{`
            @keyframes mining {
                0% { left: -10%; opacity: 0; }
                50% { opacity: 1; }
                100% { left: 110%; opacity: 0; }
            }
        `}</style>
    </SandboxPanel>
  );
};

export default MiningPanel;
