import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Hammer, Play, Pause, Zap, Award, Settings } from 'lucide-react';
import { backgroundEngine, Miner } from '../../../engine/BackgroundEngine';
import { useBlockchainStore } from '../../../stores/useBlockchainStore';
import { useSandboxStore } from '../../../stores/useSandboxStore';
import { useWalletStore } from '../../../stores/useWalletStore';
import { forkManager } from '../../../engine/ForkManager';
import { NodeIdentity } from '../../../engine/NodeIdentity';

interface MinerStat extends Miner {
  blocksWon: number;
  isUser?: boolean;
}

const MiningPanel: React.FC = () => {
  const mode = useSandboxStore(state => state.mode);
  const blocks = useBlockchainStore(state => state.blocks);
  const incrementMastery = useSandboxStore(state => state.incrementMastery);
  const { mempool, mineMempool } = useWalletStore();

  const [isMining, setIsMining] = useState(false);
  const [userHashRate, setUserHashRate] = useState(25); // Default user hashrate
  const [miners, setMiners] = useState<Miner[]>([]);
  const [lastWin, setLastWin] = useState<string | null>(null);

  // Poll miners from background engine
  useEffect(() => {
    const updateMiners = () => {
      setMiners([...backgroundEngine.getSimulatedMiners()]);
    };
    updateMiners();
    const interval = setInterval(updateMiners, 2000);
    return () => clearInterval(interval);
  }, []);

  // Calculate Leaderboard
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

    // Merge simulated miners with user
    const allMiners: MinerStat[] = miners.map(m => ({
      ...m,
      blocksWon: stats[m.name] || 0
    }));

    // Add user if they have won or are mining
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

  // User Mining Loop
  useEffect(() => {
    if (!isMining) return;

    let timeout: NodeJS.Timeout;
    const mine = () => {
      // Logic: Probability check based on hashrate vs "Network Difficulty"
      // Simpler: Just random delay correlated to hashrate
      // Base average time for network is ~45s for 110 total hashrate
      // User has 25 hashrate -> should take ~4x as long as network?
      // Network produces block every 45s.
      // User probability per second ~ userHashRate / (totalNetworkHashRate + userHashRate) / 45?
      // Let's just use exponential distribution

      const avgTime = 60000 * (100 / userHashRate); // If hashrate is 100, avg 1 min. If 25, avg 4 min.
      // This is quite slow compared to network. Let's buff it for fun.
      const buffedAvg = avgTime / 4;

      const delay = Math.random() * 5000 + 1000; // Check every few seconds

      timeout = setTimeout(() => {
        // Roll dice
        const chance = Math.random();
        // Probability of finding block in this 'slice'
        // Let's say we check every 3s.
        // We want avg time to be `buffedAvg`.
        // P = 1 - e^(-lambda * t)
        // lambda = 1 / buffedAvg
        // P = 1 - e^(-3000 / buffedAvg)

        const p = 1 - Math.exp(-3000 / buffedAvg);

        if (chance < p) {
          // Found a block!
          const userMinerId = NodeIdentity.getOrCreate().getId();

          // Select Transactions
          // We can use walletStore logic but we need to format data string manually for forkManager
          // Actually walletStore.mineMempool() returns tx objects.
          // We need to construct string data.

          // Let's just grab top 5 from mempool
          const sortedMempool = [...mempool].sort((a, b) => (b.fee || 0) - (a.fee || 0));
          const txsToMine = sortedMempool.slice(0, 5);

          // We need to actually remove them from mempool to avoid double spend if we win
          // backgroundEngine does this.
          // Let's call a custom miner helper if possible?
          // We'll manualy construct block data.

          const txData = txsToMine.map(tx => {
             // We need names...
             // Simplified: Just use addresses or lookups if cheap
             return `${tx.from.substring(0, 8)}->${tx.to.substring(0, 8)} (${tx.amount})`;
          }).join(', ');

          const blockData = `Mined by ${userMinerId}\n${txData || 'No transactions'}`;

          forkManager.processBlock(blockData, userMinerId);

          // Remove from mempool (Local update)
          // useWalletStore.getState().mineMempool(); // This marks them confirmed.
          // But wait, if we are on a fork or if block is rejected?
          // For sandbox, let's assume immediate success locally.
          if (txsToMine.length > 0) {
             useWalletStore.getState().mineMempool();
          }

          incrementMastery('blocksMined');
          setLastWin(new Date().toLocaleTimeString());
        }

        mine(); // Loop
      }, delay);
    };

    mine();
    return () => clearTimeout(timeout);
  }, [isMining, userHashRate, mempool, incrementMastery]);

  const toggleMining = () => setIsMining(!isMining);

  const adjustMiner = (miner: Miner, delta: number) => {
    miner.hashRate = Math.max(1, miner.hashRate + delta);
    // Force update
    setMiners([...miners]);
  };

  return (
    <div className="h-full bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden">
      <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 text-sm">
          <Hammer className="w-4 h-4 text-yellow-600" />
          Mining
        </h3>
        <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Total Hashrate: {leaderboard.reduce((a,b) => a + b.hashRate, 0)}</span>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {/* User Miner Control */}
        <div className="bg-gray-100 dark:bg-gray-700/50 rounded-lg p-3 mb-4 border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-sm text-gray-900 dark:text-white flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-500" /> My Miner
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${isMining ? 'bg-green-100 text-green-700 dark:bg-green-900/30' : 'bg-gray-200 text-gray-600 dark:bg-gray-600'}`}>
                    {isMining ? 'Running' : 'Stopped'}
                </span>
            </div>

            <div className="flex items-center gap-4">
                <button
                    onClick={toggleMining}
                    className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-sm font-medium transition-colors ${
                        isMining
                        ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                        : 'bg-green-50 text-green-600 hover:bg-green-100 border border-green-200'
                    }`}
                >
                    {isMining ? <><Pause className="w-4 h-4" /> Stop Mining</> : <><Play className="w-4 h-4" /> Start Mining</>}
                </button>

                {/* Hashrate Slider (Simulated upgrade) */}
                 <div className="flex flex-col flex-1">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Power</span>
                        <span>{userHashRate} MH/s</span>
                    </div>
                    <input
                        type="range"
                        min="10"
                        max="100"
                        value={userHashRate}
                        onChange={(e) => setUserHashRate(parseInt(e.target.value))}
                        className="h-1.5 bg-gray-300 rounded-lg appearance-none cursor-pointer dark:bg-gray-600 accent-yellow-500"
                    />
                 </div>
            </div>
            {lastWin && (
                <div className="mt-2 text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                    <Award className="w-3 h-3" /> Last block found at {lastWin}
                </div>
            )}
        </div>

        {/* Leaderboard */}
        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Network Miners</h4>
        <div className="space-y-2">
            {leaderboard.map((miner) => (
                <div key={miner.name} className={`flex items-center justify-between p-2 rounded border ${miner.isUser ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/10 dark:border-yellow-800' : 'bg-white border-gray-100 dark:bg-gray-800 dark:border-gray-700'}`}>
                    <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${miner.isUser ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}>
                            {miner.name.substring(0, 2)}
                        </div>
                        <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-1">
                                {miner.isUser ? 'You' : miner.name}
                                {miner.isUser && <span className="text-[10px] bg-yellow-200 text-yellow-800 px-1 rounded">ME</span>}
                            </div>
                            <div className="text-xs text-gray-500">{miner.hashRate} MH/s</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                         <div className="text-right">
                            <div className="text-sm font-bold text-gray-900 dark:text-white">{miner.blocksWon}</div>
                            <div className="text-[10px] text-gray-500">blocks</div>
                        </div>

                        {/* God Mode Controls */}
                        {mode === 'god' && !miner.isUser && (
                            <div className="flex flex-col gap-1">
                                <button onClick={() => adjustMiner(miner, 5)} className="p-0.5 hover:bg-gray-100 rounded text-green-600">▲</button>
                                <button onClick={() => adjustMiner(miner, -5)} className="p-0.5 hover:bg-gray-100 rounded text-red-600">▼</button>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default MiningPanel;
