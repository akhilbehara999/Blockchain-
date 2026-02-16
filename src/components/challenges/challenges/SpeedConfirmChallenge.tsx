import React, { useState, useEffect } from 'react';
import { useProgress } from '../../context/ProgressContext';
import { useWalletStore } from '../../stores/useWalletStore';
import { backgroundEngine } from '../../engine/BackgroundEngine';
import Button from '../../ui/Button';
import { Timer, Zap, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';
import { FEE_LEVELS } from '../../engine/transaction';

const SpeedConfirmChallenge: React.FC = () => {
  const { challenges, updateChallengeProgress } = useProgress();
  const { sendTransaction, mempool, minedTransactions, wallets } = useWalletStore();

  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [txSignature, setTxSignature] = useState<string | null>(null);
  const [fee, setFee] = useState(FEE_LEVELS.HIGH);
  const [customFee, setCustomFee] = useState(0.002);
  const [useCustomFee, setUseCustomFee] = useState(false);
  const [status, setStatus] = useState<'idle' | 'pending' | 'confirmed' | 'failed'>('idle');
  const [congestionLevel, setCongestionLevel] = useState(0);

  // Setup Engine
  useEffect(() => {
      // Speed up blocks for this challenge (Avg 15s)
      backgroundEngine.setBlockDelayMultiplier(0.3);
      if (!backgroundEngine.isRunning()) backgroundEngine.start();

      return () => {
          backgroundEngine.setBlockDelayMultiplier(1.0); // Reset
      };
  }, []);

  // Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (status === 'pending' && startTime) {
      interval = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTime) / 1000));
      }, 100);
    }
    return () => clearInterval(interval);
  }, [status, startTime]);

  // Monitor Tx
  useEffect(() => {
    if (!txSignature || status !== 'pending') return;

    const tx = minedTransactions.find(t => t.signature === txSignature);
    if (tx) {
        if (tx.status === 'confirmed') {
            setStatus('confirmed');
            const timeTaken = Math.floor((Date.now() - (startTime || 0)) / 1000);

            if (timeTaken <= 30) {
                 if (!challenges.speedConfirm.completed || (challenges.speedConfirm.bestTime && timeTaken < challenges.speedConfirm.bestTime)) {
                     updateChallengeProgress('speedConfirm', {
                         completed: true,
                         attempts: challenges.speedConfirm.attempts + 1,
                         bestTime: timeTaken
                     });
                 }
            } else {
                 updateChallengeProgress('speedConfirm', { attempts: challenges.speedConfirm.attempts + 1 });
            }
        } else {
            setStatus('failed');
            updateChallengeProgress('speedConfirm', { attempts: challenges.speedConfirm.attempts + 1 });
        }
    }
  }, [minedTransactions, txSignature, status, startTime, challenges.speedConfirm, updateChallengeProgress]);

  // Congestion Monitor
  useEffect(() => {
      const interval = setInterval(() => {
          setCongestionLevel(useWalletStore.getState().mempool.length);
      }, 1000);
      return () => clearInterval(interval);
  }, []);

  const handleSend = () => {
      // 1. Trigger massive congestion
      backgroundEngine.triggerMempoolSpike(30);

      const user = wallets[0];
      if (!user) return;

      // 2. Send User Transaction
      const finalFee = useCustomFee ? customFee : fee;
      sendTransaction(user.name, user.name, 1, finalFee); // Send to self

      // 3. Find our transaction
      const myTxs = useWalletStore.getState().mempool.filter(tx => tx.from === user.publicKey);
      const latest = myTxs[myTxs.length - 1];

      if (latest) {
          setTxSignature(latest.signature);
          setStartTime(Date.now());
          setStatus('pending');
          setElapsed(0);
      }
  };

  const reset = () => {
      setStatus('idle');
      setTxSignature(null);
      setElapsed(0);
      setStartTime(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold mb-4 flex items-center text-gray-900 dark:text-white">
            <span className="bg-yellow-100 text-yellow-700 p-2 rounded-lg mr-3">
                <Zap className="w-6 h-6" />
            </span>
            Speed Confirmation
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
            The network is congested. You must get your transaction confirmed in <strong>under 30 seconds</strong>.
            Choose your fee wisely to outbid other transactions.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="space-y-6">
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <h3 className="font-bold mb-2 text-gray-900 dark:text-white flex items-center">
                        <TrendingUp className="w-4 h-4 mr-2" /> Network Status
                    </h3>
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-gray-600 dark:text-gray-300">Mempool Count:</span>
                        <span className={`font-bold ${congestionLevel > 20 ? 'text-red-500' : 'text-green-500'}`}>
                            {congestionLevel} txs
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div
                            className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, (congestionLevel / 50) * 100)}%` }}
                        />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                        High congestion means you need higher fees to be prioritized by miners.
                    </p>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Fee Strategy
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            <button
                                onClick={() => { setFee(FEE_LEVELS.ECONOMY); setUseCustomFee(false); }}
                                className={`p-2 rounded border text-sm ${!useCustomFee && fee === FEE_LEVELS.ECONOMY ? 'bg-indigo-100 border-indigo-500 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'}`}
                            >
                                Economy
                            </button>
                            <button
                                onClick={() => { setFee(FEE_LEVELS.STANDARD); setUseCustomFee(false); }}
                                className={`p-2 rounded border text-sm ${!useCustomFee && fee === FEE_LEVELS.STANDARD ? 'bg-indigo-100 border-indigo-500 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'}`}
                            >
                                Standard
                            </button>
                            <button
                                onClick={() => { setFee(FEE_LEVELS.HIGH); setUseCustomFee(false); }}
                                className={`p-2 rounded border text-sm ${!useCustomFee && fee === FEE_LEVELS.HIGH ? 'bg-indigo-100 border-indigo-500 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'}`}
                            >
                                High
                            </button>
                        </div>

                        <div className="mt-4">
                             <div className="flex items-center mb-2">
                                <input
                                    type="checkbox"
                                    id="customFee"
                                    checked={useCustomFee}
                                    onChange={(e) => setUseCustomFee(e.target.checked)}
                                    className="mr-2 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <label htmlFor="customFee" className="text-sm text-gray-700 dark:text-gray-300">
                                    Custom Fee (Override)
                                </label>
                             </div>
                             {useCustomFee && (
                                 <input
                                     type="range"
                                     min="0.0001"
                                     max="0.005"
                                     step="0.0001"
                                     value={customFee}
                                     onChange={(e) => setCustomFee(parseFloat(e.target.value))}
                                     className="w-full"
                                 />
                             )}
                             <div className="text-right text-sm font-mono text-gray-600 dark:text-gray-400">
                                 Current Fee: {useCustomFee ? customFee.toFixed(4) : fee}
                             </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col items-center justify-center p-8 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-dashed border-gray-300 dark:border-gray-600">
                <div className={`text-6xl font-mono font-bold mb-4 ${
                    elapsed > 30 ? 'text-red-500' : 'text-gray-900 dark:text-white'
                }`}>
                    {elapsed.toFixed(1)}s
                </div>

                {status === 'idle' && (
                    <Button onClick={handleSend} size="lg">
                        Send & Start Timer
                    </Button>
                )}

                {status === 'pending' && (
                    <div className="flex items-center text-indigo-600 dark:text-indigo-400 animate-pulse">
                        <Zap className="w-5 h-5 mr-2" />
                        Waiting for confirmation...
                    </div>
                )}

                {status === 'confirmed' && (
                    <div className="text-center">
                        {elapsed <= 30 ? (
                            <div className="text-green-600 dark:text-green-400 font-bold flex flex-col items-center">
                                <CheckCircle className="w-8 h-8 mb-2" />
                                <span>Success! Confirmed in {elapsed}s</span>
                            </div>
                        ) : (
                            <div className="text-red-500 font-bold flex flex-col items-center">
                                <AlertCircle className="w-8 h-8 mb-2" />
                                <span>Too Slow! (> 30s)</span>
                            </div>
                        )}
                        <Button onClick={reset} variant="secondary" className="mt-4">
                            Try Again
                        </Button>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default SpeedConfirmChallenge;
