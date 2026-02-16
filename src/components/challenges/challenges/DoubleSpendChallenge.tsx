import React, { useState, useEffect } from 'react';
import { useWalletStore } from '../../stores/useWalletStore';
import { useProgress } from '../../context/ProgressContext';
import { RefreshCw, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import Button from '../../ui/Button';

const DoubleSpendChallenge: React.FC = () => {
  const { challenges, updateChallengeProgress } = useProgress();
  const { createWallet, sendTransaction, wallets, mempool, minedTransactions, initializeWallets } = useWalletStore();

  const [aliceTx, setAliceTx] = useState<string | null>(null);
  const [bobTx, setBobTx] = useState<string | null>(null);
  const [stage, setStage] = useState<'setup' | 'sending' | 'mining' | 'result'>('setup');
  const [userWallet, setUserWallet] = useState<any>(null);

  useEffect(() => {
    // Setup Challenge Environment
    // We delay slightly to ensure store is ready
    const timer = setTimeout(() => {
        initializeWallets(); // Reset wallets to clean state
        createWallet('DS_User', 10);
        createWallet('DS_Alice', 0);
        createWallet('DS_Bob', 0);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
      const w = wallets.find(w => w.name === 'DS_User');
      if (w) setUserWallet(w);
  }, [wallets]);

  // Monitor Transactions
  useEffect(() => {
      if (!aliceTx || !bobTx || stage !== 'mining') return;

      const aliceStatus = minedTransactions.find(tx => tx.signature === aliceTx)?.status;
      const bobStatus = minedTransactions.find(tx => tx.signature === bobTx)?.status;

      if (aliceStatus && bobStatus) {
          setStage('result');

          const success = (aliceStatus === 'confirmed' && bobStatus === 'failed') ||
                          (aliceStatus === 'failed' && bobStatus === 'confirmed');

          if (success) {
              if (!challenges.doubleSpend.completed) {
                 updateChallengeProgress('doubleSpend', { completed: true, attempts: challenges.doubleSpend.attempts + 1 });
              }
          } else {
             updateChallengeProgress('doubleSpend', { attempts: challenges.doubleSpend.attempts + 1 });
          }
      }
  }, [minedTransactions, aliceTx, bobTx, stage, challenges.doubleSpend.attempts, challenges.doubleSpend.completed, updateChallengeProgress]);

  const handleSend = () => {
      const w = wallets.find(w => w.name === 'DS_User');
      if (!w) return;

      // Send to Alice
      sendTransaction('DS_User', 'DS_Alice', 10);
      // We need to fetch the mempool to get the signature.
      // Since setState is async in React but zustand updates synchronously?
      // Zustand updates are synchronous.

      const currentMempool = useWalletStore.getState().mempool;
      const aliceWallet = wallets.find(w => w.name === 'DS_Alice');
      const mempoolTx1 = currentMempool.find(tx => tx.to === aliceWallet?.publicKey);

      if (mempoolTx1) setAliceTx(mempoolTx1.signature);

      // Send to Bob immediately (simulating double spend)
      sendTransaction('DS_User', 'DS_Bob', 10);

      const updatedMempool = useWalletStore.getState().mempool;
      const bobWallet = wallets.find(w => w.name === 'DS_Bob');
      // Find tx to Bob that is NOT the one to Alice (though addresses differ so should be fine)
      const mempoolTx2 = updatedMempool.find(tx => tx.to === bobWallet?.publicKey);

      if (mempoolTx2) setBobTx(mempoolTx2.signature);

      setStage('mining');
  };

  const reset = () => {
      initializeWallets();
      createWallet('DS_User', 10);
      createWallet('DS_Alice', 0);
      createWallet('DS_Bob', 0);
      setAliceTx(null);
      setBobTx(null);
      setStage('setup');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold mb-4 flex items-center text-gray-900 dark:text-white">
            <span className="bg-yellow-100 text-yellow-700 p-2 rounded-lg mr-3">
                <AlertTriangle className="w-6 h-6" />
            </span>
            Double Spend Attack
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
            You have <strong>10 coins</strong>. Try to send them to both Alice AND Bob at the same time.
            The network should only accept one transaction and reject the other.
        </p>

        {/* Visualization Area */}
        <div className="grid grid-cols-3 gap-4 mb-8 text-center">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
                <div className="font-bold text-lg mb-1 text-gray-900 dark:text-white">DS_User</div>
                <div className="text-2xl font-mono text-blue-600 dark:text-blue-400">
                    {userWallet ? userWallet.balance.toFixed(2) : '...'}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Sender</div>
            </div>

            <div className="flex items-center justify-center">
                <div className={`
                    w-full h-1 rounded-full transition-all duration-1000
                    ${stage === 'sending' || stage === 'mining' ? 'bg-indigo-500 animate-pulse' : 'bg-gray-200 dark:bg-gray-700'}
                `} />
            </div>

            <div className="space-y-4">
                 <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-100 dark:border-green-800">
                    <div className="font-bold text-sm text-gray-900 dark:text-white">Alice</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Receiver 1</div>
                    {stage === 'result' && (
                        <div className="mt-2 flex justify-center">
                            {minedTransactions.find(tx => tx.signature === aliceTx)?.status === 'confirmed' ?
                                <span className="text-green-600 dark:text-green-400 font-bold flex items-center text-xs"><CheckCircle className="w-3 h-3 mr-1"/> Confirmed</span> :
                                <span className="text-red-500 dark:text-red-400 font-bold flex items-center text-xs"><XCircle className="w-3 h-3 mr-1"/> Rejected</span>
                            }
                        </div>
                    )}
                </div>
                <div className="p-3 bg-purple-50 dark:bg-purple-900/30 rounded-lg border border-purple-100 dark:border-purple-800">
                    <div className="font-bold text-sm text-gray-900 dark:text-white">Bob</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Receiver 2</div>
                    {stage === 'result' && (
                         <div className="mt-2 flex justify-center">
                            {minedTransactions.find(tx => tx.signature === bobTx)?.status === 'confirmed' ?
                                <span className="text-green-600 dark:text-green-400 font-bold flex items-center text-xs"><CheckCircle className="w-3 h-3 mr-1"/> Confirmed</span> :
                                <span className="text-red-500 dark:text-red-400 font-bold flex items-center text-xs"><XCircle className="w-3 h-3 mr-1"/> Rejected</span>
                            }
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center space-x-4">
            {stage === 'setup' && (
                <Button onClick={handleSend} className="w-full max-w-xs">
                    Broadcast Double Spend
                </Button>
            )}

            {stage === 'mining' && (
                <div className="text-center animate-pulse text-indigo-600 dark:text-indigo-400 font-medium">
                    Mining block... Waiting for confirmation...
                </div>
            )}

            {stage === 'result' && (
                <div className="text-center w-full">
                    <div className="mb-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600">
                        <h3 className="font-bold mb-2 text-gray-900 dark:text-white">Analysis</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                            The network detected a conflict. Since you only had 10 coins,
                            it processed the first valid transaction it found and rejected the second one
                            because the funds were already spent.
                        </p>
                    </div>
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

export default DoubleSpendChallenge;
