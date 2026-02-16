import React, { useState, useEffect } from 'react';
import { useWalletStore } from '../../../stores/useWalletStore';
import { useBlockchainStore } from '../../../stores/useBlockchainStore';
import { useProgress } from '../../../context/ProgressContext';
import { backgroundEngine } from '../../../engine/BackgroundEngine';
import { FEE_LEVELS } from '../../../engine/transaction';
import { Clock, Send, CheckCircle, Lock, Coins, TrendingUp, User } from 'lucide-react';
import { Wallet } from '../../../engine/types';

// Stages of the lesson
// 0: Intro -> Needs Funding
// 1: Funded -> Needs First Tx
// 2: First Tx Sent -> Waiting for Confirmation
// 3: First Tx Confirmed -> Ready for Low Fee Experiment
// 4: Low Fee Experiment Intro -> Needs Low Fee Tx
// 5: Low Fee Tx Sent -> Waiting (Longer)
// 6: Low Fee Tx Confirmed -> Done

const Step6_Transactions: React.FC = () => {
  const { completeStep } = useProgress();
  const { wallets, mempool, minedTransactions, sendTransaction, mineMempool, createWallet } = useWalletStore();
  const { blocks } = useBlockchainStore();

  const [stage, setStage] = useState<number>(0);
  const [userBalance, setUserBalance] = useState<number>(0);
  const [recipient, setRecipient] = useState<string>('');
  const [amount, setAmount] = useState<number>(1);
  const [feeLevel, setFeeLevel] = useState<'high' | 'standard' | 'economy'>('standard');

  const [txHash, setTxHash] = useState<string | null>(null);
  const [lowFeeTxHash, setLowFeeTxHash] = useState<string | null>(null);
  const [confirmationCount, setConfirmationCount] = useState<number>(0);
  const [peers, setPeers] = useState<Wallet[]>([]);

  // --- Initialization ---
  useEffect(() => {
    // Ensure "You" wallet exists
    const userWallet = wallets.find(w => w.name === 'You');
    if (!userWallet) {
      createWallet('You', 0);
    } else {
        // Check if already funded (for returning users)
        if (userWallet.balance >= 10 && stage === 0) {
            setStage(1);
        }
        setUserBalance(userWallet.balance);
    }

    // Ensure Faucet exists
    if (!wallets.find(w => w.name === 'Faucet')) {
      createWallet('Faucet', 1000);
    }

    // Start background engine for peers and mining
    if (!backgroundEngine.isRunning()) {
      backgroundEngine.start();
    }

    // Load peers
    setPeers(backgroundEngine.getPeerWallets());

    // Clean up on unmount
    // return () => backgroundEngine.stop(); // Don't stop, it might be used by other components or persisted
  }, []);

  // Sync Balance and Peers
  useEffect(() => {
    const userWallet = wallets.find(w => w.name === 'You');
    if (userWallet) {
      setUserBalance(userWallet.balance);
    }
    setPeers(backgroundEngine.getPeerWallets());
  }, [wallets, blocks]); // Update when blocks change (mining happens)

  // --- Monitoring Transactions ---
  useEffect(() => {
    const activeTxHash = stage >= 4 ? lowFeeTxHash : txHash;
    if (!activeTxHash) return;

    // Check if mined
    const minedTx = minedTransactions.find(t => t.signature === activeTxHash);

    if (minedTx && minedTx.confirmationBlock !== undefined) {
      const currentHeight = blocks.length; // block height is length (0-indexed but length is count)
      // If block 0 is genesis, block 1 is next.
      // confirmationBlock is the block index it was included in.
      // Confirmations = currentHeight - confirmationBlock.
      // e.g. Mined in block 5. Chain length is 6 (blocks 0..5). Confirmations = 6 - 5 = 1.
      const confs = currentHeight - minedTx.confirmationBlock;
      setConfirmationCount(confs);

      // Transitions
      if (stage === 2 && confs > 0) {
        setStage(3); // First tx confirmed
      }
      if (stage === 5 && confs >= 6) {
        setStage(6); // Low fee confirmed (wait for 6)
      }
    } else {
      setConfirmationCount(0);
    }
  }, [blocks, minedTransactions, txHash, lowFeeTxHash, stage]);


  // --- Actions ---

  const handleReceiveCoins = () => {
    // Send from Faucet to You
    sendTransaction('Faucet', 'You', 10, 0.0001);
    // Mine immediately so user sees funds
    mineMempool();
    setStage(1);
  };

  const handleSendTransaction = () => {
    if (!recipient) {
        // Auto select first peer if none selected
        if (peers.length > 0) setRecipient(peers[0].name);
        else return;
    }

    // Logic for FEE_LEVELS
    // Mapping: high -> HIGH, standard -> STANDARD, economy -> ECONOMY
    let fee = FEE_LEVELS.STANDARD;
    if (feeLevel === 'high') fee = FEE_LEVELS.HIGH;
    if (feeLevel === 'economy') fee = FEE_LEVELS.ECONOMY;

    // Send
    // Recipient state stores name, we need to pass name to sendTransaction
    const finalRecipient = recipient || (peers[0] ? peers[0].name : '');
    if (!finalRecipient) return;

    sendTransaction('You', finalRecipient, amount, fee);

    // Find the tx we just sent (it's in mempool)
    // We assume it's the latest one from 'You'
    // A better way would be if sendTransaction returned the tx, but it returns void.
    // So we scan mempool.
    const myTxs = useWalletStore.getState().mempool.filter(tx => {
        const w = useWalletStore.getState().getWalletByName('You');
        return w && tx.from === w.publicKey;
    });

    if (myTxs.length > 0) {
        // Get the last one (most recent)
        const lastTx = myTxs[myTxs.length - 1];

        if (stage === 4) {
             setLowFeeTxHash(lastTx.signature);
             setStage(5);
             // Trigger spike to bury this low fee tx
             setTimeout(() => {
                 backgroundEngine.triggerMempoolSpike(15);
             }, 500);
        } else {
             setTxHash(lastTx.signature);
             setStage(2);
        }
    }
  };

  const startLowFeeChallenge = () => {
      setStage(4);
      setAmount(1);
      setFeeLevel('economy');
      setConfirmationCount(0);
  };

  // --- Helpers ---
  const getFeeValue = (level: string) => {
      if (level === 'high') return FEE_LEVELS.HIGH;
      if (level === 'economy') return FEE_LEVELS.ECONOMY;
      return FEE_LEVELS.STANDARD;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">

      {/* HEADER */}
      <section className="space-y-4">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Send It and Mean It</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          In blockchain, there is no "undo" button. Once it's confirmed, it's forever.
        </p>
      </section>

      {/* BALANCE CARD */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-full">
                  <User className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Your Wallet</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white font-mono">
                      {userBalance.toFixed(4)} COINS
                  </div>
              </div>
          </div>
          {stage === 0 && (
              <button
                onClick={handleReceiveCoins}
                className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition-all animate-bounce"
              >
                  <Coins size={20} />
                  Receive 10 Coins
              </button>
          )}
      </div>

      {/* TRANSACTION FORM */}
      {(stage >= 1) && (
          <section className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 space-y-6">
             <div className="flex items-center justify-between">
                 <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                     <Send size={24} className="text-indigo-500"/>
                     Create Transaction
                 </h2>
                 {stage === 4 && <span className="text-xs font-bold text-yellow-600 bg-yellow-100 px-2 py-1 rounded">LOW FEE CHALLENGE</span>}
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {/* To */}
                 <div className="space-y-2">
                     <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Recipient</label>
                     <select
                        className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                        value={recipient}
                        onChange={(e) => setRecipient(e.target.value)}
                     >
                         <option value="" disabled>Select a peer...</option>
                         {peers.map(p => (
                             <option key={p.publicKey} value={p.name}>{p.name}</option>
                         ))}
                     </select>
                 </div>

                 {/* Amount */}
                 <div className="space-y-2">
                     <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Amount</label>
                     <input
                        type="number"
                        min="0.1"
                        max="10"
                        step="0.1"
                        value={amount}
                        onChange={(e) => setAmount(parseFloat(e.target.value))}
                        className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                     />
                 </div>
             </div>

             {/* Fee Selection */}
             <div className="space-y-2">
                 <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Network Fee (Priority)</label>
                 <div className="grid grid-cols-3 gap-4">
                     <button
                        onClick={() => stage !== 4 && setFeeLevel('high')}
                        disabled={stage === 4}
                        className={`p-3 rounded-lg border flex flex-col items-center gap-1 transition-all ${
                            feeLevel === 'high'
                            ? 'bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500 dark:bg-indigo-900/20'
                            : 'bg-white border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700'
                        } ${stage === 4 ? 'opacity-50 cursor-not-allowed' : ''}`}
                     >
                         <span className="font-bold text-indigo-600 dark:text-indigo-400">⚡ Fast</span>
                         <span className="text-xs text-gray-500">High Fee ({FEE_LEVELS.HIGH})</span>
                     </button>

                     <button
                        onClick={() => stage !== 4 && setFeeLevel('standard')}
                        disabled={stage === 4}
                        className={`p-3 rounded-lg border flex flex-col items-center gap-1 transition-all ${
                            feeLevel === 'standard'
                            ? 'bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500 dark:bg-indigo-900/20'
                            : 'bg-white border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700'
                        } ${stage === 4 ? 'opacity-50 cursor-not-allowed' : ''}`}
                     >
                         <span className="font-bold text-green-600 dark:text-green-400">Normal</span>
                         <span className="text-xs text-gray-500">Standard ({FEE_LEVELS.STANDARD})</span>
                     </button>

                     <button
                        onClick={() => setFeeLevel('economy')}
                        className={`p-3 rounded-lg border flex flex-col items-center gap-1 transition-all ${
                            feeLevel === 'economy'
                            ? 'bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500 dark:bg-indigo-900/20'
                            : 'bg-white border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700'
                        }`}
                     >
                         <span className="font-bold text-yellow-600 dark:text-yellow-400">🐢 Slow</span>
                         <span className="text-xs text-gray-500">Low Fee ({FEE_LEVELS.ECONOMY})</span>
                     </button>
                 </div>
             </div>

             <div className="pt-4">
                 <button
                    onClick={handleSendTransaction}
                    disabled={userBalance < amount + getFeeValue(feeLevel) || stage === 2 || stage === 5 || stage === 6}
                    className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all ${
                        stage === 2 || stage === 5 || stage === 6
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white transform hover:scale-[1.01]'
                    }`}
                 >
                    {stage === 2 || stage === 5 ? 'Processing...' : 'Send Forever'}
                 </button>
                 <p className="text-center text-xs text-gray-400 mt-2">
                     Total Cost: {(amount + getFeeValue(feeLevel)).toFixed(5)} Coins
                 </p>
             </div>
          </section>
      )}

      {/* STATUS MONITOR */}
      {(stage >= 2) && (
          <section className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 space-y-6 animate-in slide-in-from-bottom-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <TrendingUp size={24} className="text-blue-500"/>
                  Status Monitor
              </h2>

              <div className="space-y-6">
                  {/* Status Steps */}
                  <div className="relative">
                      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>

                      {/* Step 1: Sent */}
                      <div className="relative flex items-center gap-4 mb-6">
                          <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white relative z-10 shadow-sm">
                              <CheckCircle size={16} />
                          </div>
                          <div>
                              <div className="font-bold text-gray-900 dark:text-white">Broadcasted</div>
                              <div className="text-sm text-gray-500">Transaction sent to network peers.</div>
                          </div>
                      </div>

                      {/* Step 2: Mempool */}
                      <div className="relative flex items-center gap-4 mb-6">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white relative z-10 shadow-sm ${
                              confirmationCount > 0 ? 'bg-green-500' : 'bg-blue-500 animate-pulse'
                          }`}>
                              {confirmationCount > 0 ? <CheckCircle size={16} /> : <Clock size={16} />}
                          </div>
                          <div>
                              <div className="font-bold text-gray-900 dark:text-white">Mempool (Waiting Area)</div>
                              <div className="text-sm text-gray-500">
                                  {confirmationCount > 0
                                  ? "Picked up by a miner!"
                                  : stage === 5
                                    ? "Waiting... Higher fee transactions are cutting in line."
                                    : "Waiting for a miner to include it in a block..."}
                              </div>
                              {/* Mempool Visualization */}
                              {confirmationCount === 0 && (
                                  <div className="mt-3 bg-gray-100 dark:bg-gray-900 p-3 rounded-lg text-xs font-mono">
                                      <div className="text-gray-500 mb-2">Pending Transactions (Top 5):</div>
                                      {mempool.slice(0, 5).map(tx => (
                                          <div key={tx.signature} className={`flex justify-between py-1 border-b border-gray-200 dark:border-gray-800 last:border-0 ${
                                              tx.signature === (stage >= 4 ? lowFeeTxHash : txHash) ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 font-bold px-1 -mx-1 rounded' : ''
                                          }`}>
                                              <span>{tx.amount} coins</span>
                                              <span className={
                                                tx.fee && tx.fee >= FEE_LEVELS.HIGH ? 'text-green-600' :
                                                tx.fee && tx.fee <= FEE_LEVELS.ECONOMY ? 'text-red-500' : 'text-gray-500'
                                              }>Fee: {tx.fee}</span>
                                          </div>
                                      ))}
                                      {mempool.length > 5 && <div className="text-gray-400 mt-1 italic">...and {mempool.length - 5} more</div>}
                                  </div>
                              )}
                          </div>
                      </div>

                      {/* Step 3: Blockchain */}
                      <div className="relative flex items-center gap-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white relative z-10 shadow-sm ${
                              confirmationCount >= 6 ? 'bg-green-500' : confirmationCount > 0 ? 'bg-indigo-500' : 'bg-gray-300 dark:bg-gray-600'
                          }`}>
                              {confirmationCount >= 6 ? <Lock size={16} /> : <div className="text-xs font-bold">{confirmationCount}</div>}
                          </div>
                          <div className="flex-1">
                              <div className="font-bold text-gray-900 dark:text-white">Confirmations</div>
                              <div className="text-sm text-gray-500">
                                  {confirmationCount === 0
                                    ? "Not yet included in a block."
                                    : confirmationCount >= 6
                                        ? "Transaction is irreversible."
                                        : "Building security... (Need 6)"}
                              </div>

                              {/* Confirmation Progress Bar */}
                              {confirmationCount > 0 && (
                                  <div className="mt-3 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                      <div
                                        className={`h-full transition-all duration-1000 ${confirmationCount >= 6 ? 'bg-green-500' : 'bg-indigo-500'}`}
                                        style={{ width: `${Math.min(100, (confirmationCount / 6) * 100)}%` }}
                                      ></div>
                                  </div>
                              )}
                          </div>
                      </div>
                  </div>
              </div>
          </section>
      )}

      {/* CONTINUE TO LOW FEE CHALLENGE */}
      {stage === 3 && (
         <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-xl border border-indigo-200 dark:border-indigo-800 animate-in fade-in">
             <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-100 mb-2">Transaction Confirmed!</h3>
             <p className="text-indigo-800 dark:text-indigo-200 mb-4">
                 Your transaction has enough confirmations to be considered safe. Now let's see why <strong>Fees</strong> matter.
             </p>
             <button
                onClick={startLowFeeChallenge}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold"
             >
                 Start Low Fee Challenge
             </button>
         </div>
      )}

      {/* COMPLETION */}
      {stage === 6 && (
         <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] animate-in slide-in-from-bottom-full duration-500 z-50">
           <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
             <div>
               <h3 className="text-lg font-bold text-green-600 dark:text-green-400 flex items-center gap-2">
                 <CheckCircle className="fill-current" /> Step 6 Complete!
               </h3>
               <p className="text-sm text-gray-600 dark:text-gray-400">
                 You've learned that fees buy speed, and confirmations buy security.
               </p>
             </div>
             <button
               onClick={() => completeStep(6)}
               className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold shadow-lg shadow-green-600/20 transition-all transform hover:scale-105"
             >
               Continue to Step 7: Consensus →
             </button>
           </div>
         </div>
      )}
    </div>
  );
};

export default Step6_Transactions;
