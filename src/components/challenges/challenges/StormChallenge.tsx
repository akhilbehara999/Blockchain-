import React, { useState, useEffect } from 'react';
import { useProgress } from '../../../context/ProgressContext';
import { useBlockchainStore } from '../../../stores/useBlockchainStore';
import { forkManager } from '../../../engine/ForkManager';
import { backgroundEngine } from '../../../engine/BackgroundEngine';
import Button from '../../../components/ui/Button';
import { CloudLightning, Zap, AlertTriangle, ShieldCheck, RefreshCw } from 'lucide-react';

const StormChallenge: React.FC = () => {
  const { challenges, updateChallengeProgress } = useProgress();
  const { blocks } = useBlockchainStore();

  const [timeLeft, setTimeLeft] = useState(300); // 5:00
  const [isActive, setIsActive] = useState(false);
  const [balance, setBalance] = useState(0);
  const [isMining, setIsMining] = useState(false);
  const [status, setStatus] = useState<'idle' | 'running' | 'success' | 'failed'>('idle');
  const [reorgCount, setReorgCount] = useState(0);
  const miningTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
      return () => {
          if (miningTimeoutRef.current) clearTimeout(miningTimeoutRef.current);
      };
  }, []);

  useEffect(() => {
      let interval: NodeJS.Timeout;
      if (isActive && timeLeft > 0) {
          interval = setInterval(() => {
              setTimeLeft(prev => prev - 1);
          }, 1000);
      }
      return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  useEffect(() => {
      if (timeLeft === 0 && isActive) {
          endChallenge();
      }
  }, [timeLeft, isActive]);

  // Track Balance
  useEffect(() => {
     const chain = useBlockchainStore.getState().blocks;
     const minedCount = chain.filter(b => b.data.includes("Mined by User_Storm")).length;
     const newBalance = minedCount * 10; // 10 coins per block

     if (isActive && newBalance < balance) {
         // Balance dropped! Reorg detected.
         setReorgCount(prev => prev + 1);
     }
     setBalance(newBalance);
  }, [blocks, isActive, balance]);

  const startChallenge = () => {
      setIsActive(true);
      setStatus('running');
      setTimeLeft(300);
      setReorgCount(0);

      // Chaos Settings
      forkManager.setForkProbability(0.6); // High fork chance
      backgroundEngine.setBlockDelayMultiplier(0.2); // Fast blocks
      backgroundEngine.triggerMempoolSpike(20);

      if (!backgroundEngine.isRunning()) backgroundEngine.start();
  };

  const endChallenge = () => {
      setIsActive(false);

      // Restore Settings
      forkManager.setForkProbability(0.15);
      backgroundEngine.setBlockDelayMultiplier(1.0);

      if (balance >= 5) {
          setStatus('success');
          if (!challenges.storm.completed) {
              updateChallengeProgress('storm', { completed: true, attempts: challenges.storm.attempts + 1 });
          }
      } else {
          setStatus('failed');
          updateChallengeProgress('storm', { attempts: challenges.storm.attempts + 1 });
      }
  };

  const handleMine = async () => {
      if (isMining || !isActive) return;
      setIsMining(true);

      // Simulate PoW delay
      const timeout = setTimeout(() => {
          const blockData = `Mined by User_Storm\nStorm Transaction Data`;
          forkManager.processBlock(blockData, 'User_Storm');
          setIsMining(false);
      }, 1000);
      miningTimeoutRef.current = timeout;
  };

  const formatTime = (sec: number) => {
      const m = Math.floor(sec / 60);
      const s = sec % 60;
      return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const reset = () => {
      setStatus('idle');
      setTimeLeft(300);
      setBalance(0);
      setReorgCount(0);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold mb-4 flex items-center text-gray-900 dark:text-white">
            <span className="bg-blue-100 text-blue-700 p-2 rounded-lg mr-3">
                <CloudLightning className="w-6 h-6" />
            </span>
            Survive the Storm
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
            The network is unstable. Forks and reorgs are happening frequently.
            Mine blocks to earn coins, but beware—your earnings might disappear if the chain reorganizes!
            <strong> Keep your balance above 5 coins</strong> when the timer ends.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl text-center">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Time Remaining</div>
                <div className={`text-3xl font-mono font-bold ${timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-gray-900 dark:text-white'}`}>
                    {formatTime(timeLeft)}
                </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl text-center">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Your Balance</div>
                <div className={`text-3xl font-mono font-bold ${balance >= 5 ? 'text-green-500' : 'text-orange-500'}`}>
                    {balance}
                </div>
                <div className="text-xs text-gray-400">Target: 5+</div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl text-center">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Reorgs Survived</div>
                <div className="text-3xl font-mono font-bold text-purple-500">
                    {reorgCount}
                </div>
            </div>
        </div>

        <div className="flex flex-col items-center justify-center space-y-6">
            {status === 'idle' && (
                <Button onClick={startChallenge} size="lg" className="w-full max-w-md">
                    Start Chaos Simulation
                </Button>
            )}

            {status === 'running' && (
                <div className="w-full max-w-md space-y-4">
                    <Button
                        onClick={handleMine}
                        disabled={isMining}
                        className={`w-full py-4 text-lg ${isMining ? 'opacity-75 cursor-wait' : ''}`}
                    >
                        {isMining ? (
                            <span className="flex items-center justify-center">
                                <Zap className="w-5 h-5 mr-2 animate-spin" /> Mining...
                            </span>
                        ) : (
                            <span className="flex items-center justify-center">
                                <Zap className="w-5 h-5 mr-2" /> Mine Block (+10 Coins)
                            </span>
                        )}
                    </Button>

                    <div className="flex items-center justify-center text-sm text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded">
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        Network instability detected!
                    </div>
                </div>
            )}

            {status === 'success' && (
                <div className="text-center p-6 bg-green-50 dark:bg-green-900/20 rounded-xl w-full max-w-lg">
                    <ShieldCheck className="w-16 h-16 mx-auto text-green-500 mb-4" />
                    <h3 className="text-2xl font-bold text-green-700 dark:text-green-300 mb-2">Survived!</h3>
                    <p className="text-green-600 dark:text-green-400 mb-6">
                        You maintained a balance of {balance} coins despite the network chaos.
                    </p>
                    <Button onClick={reset} variant="secondary">
                        <RefreshCw className="w-4 h-4 mr-2" /> Play Again
                    </Button>
                </div>
            )}

            {status === 'failed' && (
                <div className="text-center p-6 bg-red-50 dark:bg-red-900/20 rounded-xl w-full max-w-lg">
                    <AlertTriangle className="w-16 h-16 mx-auto text-red-500 mb-4" />
                    <h3 className="text-2xl font-bold text-red-700 dark:text-red-300 mb-2">Defeated</h3>
                    <p className="text-red-600 dark:text-red-400 mb-6">
                        Your balance was {balance} (Target: 5). The storm claimed your coins.
                    </p>
                    <Button onClick={reset} variant="secondary">
                        <RefreshCw className="w-4 h-4 mr-2" /> Try Again
                    </Button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default StormChallenge;
