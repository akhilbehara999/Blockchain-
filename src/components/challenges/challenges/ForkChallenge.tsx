import React, { useState, useEffect, useRef } from 'react';
import { useProgress } from '../../../context/ProgressContext';
import { useBlockchainStore } from '../../../stores/useBlockchainStore';
import { useForkStore } from '../../../stores/useForkStore';
import { forkManager } from '../../../engine/ForkManager';
import { backgroundEngine } from '../../../engine/BackgroundEngine';
import Button from '../../../components/ui/Button';
import { GitBranch, Trophy, RefreshCw } from 'lucide-react';

const ForkChallenge: React.FC = () => {
  const { challenges, updateChallengeProgress } = useProgress();
  const { activeFork } = useForkStore();

  const [stage, setStage] = useState<'setup' | 'forked' | 'resolved'>('setup');
  const [prediction, setPrediction] = useState<'A' | 'B' | null>(null);
  const [result, setResult] = useState<'A' | 'B' | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>("");

  const miningIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Setup
    backgroundEngine.stop();
    forkManager.clearMinerAssignments();
    forkManager.assignMinerToChain('Miner_Alpha', 'A');
    forkManager.assignMinerToChain('Miner_Beta', 'B');

    return () => {
      if (miningIntervalRef.current) clearInterval(miningIntervalRef.current);
      backgroundEngine.start();
      forkManager.clearMinerAssignments();
    };
  }, []);

  // Monitor Fork Status
  useEffect(() => {
      // If we were forked and now we are not, it's resolved
      if (stage === 'forked' && !activeFork) {
          handleResolution();
      }

      // If active fork appears, update stage
      if (stage === 'setup' && activeFork && activeFork.status === 'active') {
          setStage('forked');
          startMiningRace();
      }
  }, [activeFork, stage]);

  const handleResolution = () => {
      if (miningIntervalRef.current) clearInterval(miningIntervalRef.current);
      setStage('resolved');

      // Check head of chain
      const head = useBlockchainStore.getState().blocks.slice(-1)[0];
      let winner: 'A' | 'B' | null = null;

      if (head.data.includes('Miner_Alpha')) {
          winner = 'A';
      } else if (head.data.includes('Miner_Beta')) {
          winner = 'B';
      }

      setResult(winner);

      if (winner && winner === prediction) {
          setStatusMessage("Correct! The miner with higher hashrate won the race.");
          if (!challenges.fork.completed) {
              updateChallengeProgress('fork', { completed: true, attempts: challenges.fork.attempts + 1 });
          }
      } else {
          setStatusMessage("Incorrect prediction. Try again.");
          updateChallengeProgress('fork', { attempts: challenges.fork.attempts + 1 });
      }
  };

  const startMiningRace = () => {
      // Simulate miners finding blocks
      // Alpha (60%) vs Beta (40%)
      const interval = setInterval(() => {
          if (!useForkStore.getState().activeFork) return;

          const rand = Math.random();
          // Adjust probability: 60% Alpha, 40% Beta
          // But Alpha mines for Chain A, Beta for Chain B (via assignment)

          let minerName = '';
          if (rand < 0.6) {
              minerName = 'Miner_Alpha';
          } else {
              minerName = 'Miner_Beta';
          }

          // Mine a block
          const blockData = `Mined by ${minerName}\nRandom Data ${Math.random().toString(36).substring(7)}`;
          forkManager.processBlock(blockData, minerName);

      }, 1500); // Fast blocks every 1.5s

      miningIntervalRef.current = interval;
  };

  const handleStart = () => {
      if (!prediction) return;

      // Force fork: Chain A (Alpha) vs Chain B (Beta)
      // Base block data
      const baseData = `Fork Challenge Start\n`;
      forkManager.forceFork(baseData + `Mined by Miner_Alpha`, 'Miner_Alpha', 'Miner_Beta');
  };

  const reset = () => {
      setStage('setup');
      setPrediction(null);
      setResult(null);
      setStatusMessage("");
      if (miningIntervalRef.current) clearInterval(miningIntervalRef.current);

      // Wait for engine to settle?
      // Just clear assignments again to be safe
      forkManager.clearMinerAssignments();
      forkManager.assignMinerToChain('Miner_Alpha', 'A');
      forkManager.assignMinerToChain('Miner_Beta', 'B');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
       <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
           <h2 className="text-2xl font-bold mb-4 flex items-center text-gray-900 dark:text-white">
                <span className="bg-purple-100 text-purple-700 p-2 rounded-lg mr-3">
                    <GitBranch className="w-6 h-6" />
                </span>
                Cause a Fork
           </h2>
           <p className="text-gray-600 dark:text-gray-300 mb-6">
                You control the network. Create a fork and predict which chain will win based on miner hashrate.
           </p>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
               {/* Miner Alpha */}
               <div
                  className={`
                    p-6 rounded-xl border-2 transition-all cursor-pointer relative overflow-hidden
                    ${prediction === 'A' ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'}
                  `}
                  onClick={() => stage === 'setup' && setPrediction('A')}
               >
                   <div className="absolute top-0 right-0 p-2 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-xs font-bold rounded-bl-xl">
                       Chain A
                   </div>
                   <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">Miner Alpha</h3>
                   <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">60%</div>
                   <div className="text-sm text-gray-500 dark:text-gray-400">Hash Power</div>

                   {stage !== 'setup' && (
                       <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                           <div className="flex justify-between text-sm">
                               <span className="text-gray-600 dark:text-gray-300">Blocks Found:</span>
                               <span className="font-bold text-gray-900 dark:text-white">
                                   {activeFork?.chainA.length || (result === 'A' ? 'Winner' : '-')}
                               </span>
                           </div>
                       </div>
                   )}
               </div>

               {/* Miner Beta */}
               <div
                  className={`
                    p-6 rounded-xl border-2 transition-all cursor-pointer relative overflow-hidden
                    ${prediction === 'B' ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-orange-300'}
                  `}
                  onClick={() => stage === 'setup' && setPrediction('B')}
               >
                   <div className="absolute top-0 right-0 p-2 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 text-xs font-bold rounded-bl-xl">
                       Chain B
                   </div>
                   <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">Miner Beta</h3>
                   <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-1">40%</div>
                   <div className="text-sm text-gray-500 dark:text-gray-400">Hash Power</div>

                   {stage !== 'setup' && (
                       <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                           <div className="flex justify-between text-sm">
                               <span className="text-gray-600 dark:text-gray-300">Blocks Found:</span>
                               <span className="font-bold text-gray-900 dark:text-white">
                                   {activeFork?.chainB.length || (result === 'B' ? 'Winner' : '-')}
                               </span>
                           </div>
                       </div>
                   )}
               </div>
           </div>

           {/* Controls */}
           <div className="flex flex-col items-center space-y-4">
               {stage === 'setup' && (
                   <Button
                        onClick={handleStart}
                        disabled={!prediction}
                        className="w-full max-w-sm"
                   >
                        {prediction ? `Bet on Chain ${prediction} & Start Fork` : 'Select a Winner to Start'}
                   </Button>
               )}

               {stage === 'forked' && (
                   <div className="text-center animate-pulse">
                       <div className="text-lg font-bold text-gray-800 dark:text-white mb-2">Race in Progress!</div>
                       <p className="text-sm text-gray-600 dark:text-gray-400">
                           Miners are competing to extend their chain...
                       </p>
                   </div>
               )}

               {stage === 'resolved' && (
                   <div className="text-center w-full max-w-lg p-6 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                       <Trophy className={`w-12 h-12 mx-auto mb-4 ${result === prediction ? 'text-yellow-500' : 'text-gray-400'}`} />
                       <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                           {result === prediction ? 'Victory!' : 'Defeat'}
                       </h3>
                       <p className="text-gray-600 dark:text-gray-300 mb-6">
                           {statusMessage}
                       </p>
                       <Button onClick={reset} variant="secondary">
                           <RefreshCw className="w-4 h-4 mr-2" />
                           Try Again
                       </Button>
                   </div>
               )}
           </div>
       </div>
    </div>
  );
};

export default ForkChallenge;
