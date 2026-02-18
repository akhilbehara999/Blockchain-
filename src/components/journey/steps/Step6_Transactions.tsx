import React, { useState, useEffect, useRef } from 'react';
import { useWalletStore } from '../../../stores/useWalletStore';
import { useBlockchainStore } from '../../../stores/useBlockchainStore';
import { backgroundEngine } from '../../../engine/BackgroundEngine';
import { FEE_LEVELS } from '../../../engine/transaction';
import { Wallet } from '../../../engine/types';
import Card from '../../ui/Card';
import Button from '../../ui/Button';
import Badge from '../../ui/Badge';
import { useInView } from '../../../hooks/useInView';
import { useNavigate } from 'react-router-dom';
import { useProgress } from '../../../context/ProgressContext';
import { Wallet as WalletIcon, Coins, Send, TrendingUp, CheckCircle, Clock, Lock } from 'lucide-react';

const Step6_Transactions: React.FC = () => {
  const navigate = useNavigate();
  const { completeStep } = useProgress();
  const { wallets, mempool, sendTransaction, mineMempool, createWallet } = useWalletStore();
  const { blocks } = useBlockchainStore();

  // Load state helper
  const loadState = (key: string, def: any) => {
    try {
      const saved = localStorage.getItem('yupp_step6_state');
      return saved ? (JSON.parse(saved)[key] ?? def) : def;
    } catch { return def; }
  };

  const [stage, setStage] = useState<number>(() => loadState('stage', 0));
  const [userBalance, setUserBalance] = useState<number>(() => loadState('userBalance', 0));
  const [recipient, setRecipient] = useState<string>(() => loadState('recipient', ''));
  const [amount, setAmount] = useState<number>(() => loadState('amount', 1));
  const [feeLevel, setFeeLevel] = useState<'high' | 'standard' | 'economy'>(() => loadState('feeLevel', 'standard'));

  const [confirmationCount, setConfirmationCount] = useState<number>(() => loadState('confirmationCount', 0));
  const [peers, setPeers] = useState<Wallet[]>([]);
  const [txHash, setTxHash] = useState<string | null>(() => loadState('txHash', null));
  const [lowFeeTxHash, setLowFeeTxHash] = useState<string | null>(() => loadState('lowFeeTxHash', null));

  // Timers ref for cleanup
  const timers = useRef<NodeJS.Timeout[]>([]);

  // Persist state
  useEffect(() => {
    try {
      localStorage.setItem('yupp_step6_state', JSON.stringify({
        stage, userBalance, recipient, amount, feeLevel,
        confirmationCount, txHash, lowFeeTxHash
      }));
    } catch {}
  }, [stage, userBalance, recipient, amount, feeLevel, confirmationCount, txHash, lowFeeTxHash]);

  // Cleanup timers
  useEffect(() => {
      return () => {
          timers.current.forEach(t => clearTimeout(t));
      };
  }, []);

  // InView hooks
  const [headerRef, headerVisible] = useInView({ threshold: 0.1 });
  const [storyRef, storyVisible] = useInView({ threshold: 0.1 });
  const [walletRef, walletVisible] = useInView({ threshold: 0.1 });
  const [formRef, formVisible] = useInView({ threshold: 0.1 });
  const [monitorRef, monitorVisible] = useInView({ threshold: 0.1 });
  const [lowFeeRef, lowFeeVisible] = useInView({ threshold: 0.1 });
  const [completionRef, completionVisible] = useInView({ threshold: 0.1 });

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
  }, []);

  // Sync Balance and Peers
  useEffect(() => {
    const userWallet = wallets.find(w => w.name === 'You');
    if (userWallet) {
      setUserBalance(userWallet.balance);
    }
    setPeers(backgroundEngine.getPeerWallets());
  }, [wallets, blocks]);

  // --- Completion Check ---
  useEffect(() => {
      if (stage === 6) {
          completeStep(6);
      }
  }, [stage, completeStep]);

  // --- Simulation Logic ---
  const startConfirmationCounter = () => {
    let count = 1;
    const interval = setInterval(() => {
      count++;
      setConfirmationCount(count);
      if (count >= 6) {
        clearInterval(interval);
        // Transition based on current stage
        if (stage === 2) setStage(3);
        if (stage === 5) setStage(6);
      }
    }, 2000); // 2 seconds per confirmation for learning
    timers.current.push(interval);
    return () => clearInterval(interval);
  };

  const simulateTransactionConfirmation = (level: string) => {
    let confirmDelay: number;
    switch (level) {
      case 'high':
        confirmDelay = 5000 + Math.random() * 3000;  // 5-8 seconds
        break;
      case 'standard':
        confirmDelay = 12000 + Math.random() * 6000;  // 12-18 seconds
        break;
      case 'economy':
        confirmDelay = 30000 + Math.random() * 15000; // 30-45 seconds
        break;
      default:
        confirmDelay = 12000 + Math.random() * 6000;
    }

    setConfirmationCount(0);

    // Show "confirmed" at full delay
    const confirmedTimer = setTimeout(() => {
      setConfirmationCount(1);
      // Then increment confirmations quickly for learning
      startConfirmationCounter();
    }, confirmDelay);
    timers.current.push(confirmedTimer);
  };

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

    let fee = FEE_LEVELS.STANDARD;
    if (feeLevel === 'high') fee = FEE_LEVELS.HIGH;
    if (feeLevel === 'economy') fee = FEE_LEVELS.ECONOMY;

    const finalRecipient = recipient || (peers[0] ? peers[0].name : '');
    if (!finalRecipient) return;

    sendTransaction('You', finalRecipient, amount, fee);

    const myTxs = useWalletStore.getState().mempool.filter(tx => {
        const w = useWalletStore.getState().getWalletByName('You');
        return w && tx.from === w.publicKey;
    });

    if (myTxs.length > 0) {
        const lastTx = myTxs[myTxs.length - 1];

        if (stage === 4) {
             setLowFeeTxHash(lastTx.signature);
             setStage(5);
             simulateTransactionConfirmation('economy');
             // Trigger spike to bury this low fee tx (visual only in simulation mode)
             setTimeout(() => {
                 backgroundEngine.triggerMempoolSpike(15);
             }, 500);
        } else {
             setTxHash(lastTx.signature);
             setStage(2);
             simulateTransactionConfirmation(feeLevel);
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
    <div className="space-y-12 md:space-y-16 pb-20">

      {/* SECTION 1: HEADER */}
      <div ref={headerRef} className={`space-y-4 ${headerVisible ? 'animate-fade-up' : 'opacity-0'}`}>
        <Badge variant="info">Step 6 of 8</Badge>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">Send It and Mean It</h1>
        <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl">
          In blockchain, there is no "undo" button. Once it's confirmed, it's forever.
        </p>
        <Badge variant="warning" className="animate-pulse">Speed: Learning Mode ⚡</Badge>
      </div>

      {/* SECTION 2: STORY */}
      <div ref={storyRef} className={storyVisible ? 'animate-fade-up' : 'opacity-0'}>
        <Card variant="glass" className="max-w-prose">
          <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300">
             When you send a transaction, it doesn't go straight to the block.
             It waits in a "Mempool" where miners pick which ones to include.
             <br/><br/>
             How do you get picked first? <b>Pay a higher fee.</b>
          </p>
        </Card>
      </div>

      {/* SECTION 3: WALLET CARD */}
      <div ref={walletRef} className={walletVisible ? 'animate-fade-up' : 'opacity-0'}>
        <Card variant="elevated" className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 w-full">
                <div className="p-4 bg-brand-100 dark:bg-brand-900/30 rounded-full text-brand-600 dark:text-brand-400">
                    <WalletIcon className="w-8 h-8" />
                </div>
                <div>
                    <div className="text-sm font-medium text-gray-500 uppercase tracking-wider">Your Balance</div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white font-mono">
                        {userBalance.toFixed(4)} <span className="text-lg text-gray-500">COINS</span>
                    </div>
                </div>
            </div>
            {stage === 0 && (
                <Button onClick={handleReceiveCoins} icon={<Coins className="w-5 h-5" />} className="w-full md:w-auto">
                    Receive 10 Coins
                </Button>
            )}
        </Card>
      </div>

      {/* SECTION 4: TRANSACTION FORM */}
      {(stage >= 1) && (
          <div ref={formRef} className={formVisible ? 'animate-fade-up' : 'opacity-0'}>
            <Card variant="elevated" className="space-y-6">
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <Send className="w-5 h-5 text-brand-500" />
                        Create Transaction
                    </h3>
                    {stage === 4 && <Badge variant="warning">LOW FEE CHALLENGE</Badge>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Recipient</label>
                        <select
                            className="w-full p-3 rounded-xl border-2 border-surface-border dark:border-surface-dark-border bg-surface-primary dark:bg-surface-dark-secondary focus:border-brand-500 focus:ring-4 focus:ring-brand-100 dark:focus:ring-brand-900/30 outline-none transition-all"
                            value={recipient}
                            onChange={(e) => setRecipient(e.target.value)}
                        >
                            <option value="" disabled>Select a peer...</option>
                            {peers.map(p => (
                                <option key={p.publicKey} value={p.name}>{p.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Amount</label>
                        <input
                            type="number"
                            min="0.1"
                            max="10"
                            step="0.1"
                            value={amount}
                            onChange={(e) => setAmount(parseFloat(e.target.value))}
                            className="w-full p-3 rounded-xl border-2 border-surface-border dark:border-surface-dark-border bg-surface-primary dark:bg-surface-dark-secondary focus:border-brand-500 focus:ring-4 focus:ring-brand-100 dark:focus:ring-brand-900/30 outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Network Fee (Priority)</label>
                    <div className="grid grid-cols-3 gap-4">
                        {[
                            { id: 'high', label: 'Fast', sub: `High Fee (${FEE_LEVELS.HIGH})`, icon: '⚡', color: 'indigo' },
                            { id: 'standard', label: 'Normal', sub: `Standard (${FEE_LEVELS.STANDARD})`, icon: '👍', color: 'green' },
                            { id: 'economy', label: 'Slow', sub: `Low Fee (${FEE_LEVELS.ECONOMY})`, icon: '🐢', color: 'yellow' }
                        ].map((option) => (
                            <button
                                key={option.id}
                                onClick={() => stage !== 4 && setFeeLevel(option.id as any)}
                                disabled={stage === 4 && option.id !== 'economy'}
                                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-1 transition-all ${
                                    feeLevel === option.id
                                    ? `bg-${option.color}-50 border-${option.color}-500 dark:bg-${option.color}-900/20`
                                    : 'border-surface-border dark:border-surface-dark-border hover:bg-surface-hover dark:hover:bg-surface-dark-hover'
                                } ${stage === 4 && option.id !== 'economy' ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <span className={`font-bold text-${option.color}-600 dark:text-${option.color}-400`}>{option.icon} {option.label}</span>
                                <span className="text-xs text-gray-500">{option.sub}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="pt-4 border-t border-surface-border dark:border-surface-dark-border">
                    <Button
                        onClick={handleSendTransaction}
                        disabled={userBalance < amount + getFeeValue(feeLevel) || stage === 2 || stage === 5 || stage === 6}
                        loading={stage === 2 || stage === 5}
                        fullWidth
                        size="lg"
                    >
                        {stage === 2 || stage === 5 ? 'Processing...' : 'Send Forever'}
                    </Button>
                    <p className="text-center text-xs text-gray-400 mt-3">
                        Total Cost: {(amount + getFeeValue(feeLevel)).toFixed(5)} Coins
                    </p>
                </div>
            </Card>
          </div>
      )}

      {/* SECTION 5: STATUS MONITOR */}
      {(stage >= 2) && (
          <div ref={monitorRef} className={monitorVisible ? 'animate-fade-up' : 'opacity-0'}>
            <Card variant="outlined" className="space-y-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-500" />
                    Status Monitor
                </h3>

                <div className="relative pl-8 space-y-8 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200 dark:before:bg-gray-700">
                    {/* Step 1 */}
                    <div className="relative">
                        <div className="absolute -left-8 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white border-4 border-white dark:border-gray-900">
                            <CheckCircle size={12} />
                        </div>
                        <div>
                            <div className="font-bold text-gray-900 dark:text-white">Broadcasted</div>
                            <div className="text-sm text-gray-500">Transaction sent to network peers.</div>
                        </div>
                    </div>

                    {/* Step 2 */}
                    <div className="relative">
                        <div className={`absolute -left-8 w-6 h-6 rounded-full flex items-center justify-center text-white border-4 border-white dark:border-gray-900 ${
                            confirmationCount > 0 ? 'bg-green-500' : 'bg-blue-500 animate-pulse'
                        }`}>
                            {confirmationCount > 0 ? <CheckCircle size={12} /> : <Clock size={12} />}
                        </div>
                        <div>
                            <div className="font-bold text-gray-900 dark:text-white">Mempool (Waiting Area)</div>
                            <div className="text-sm text-gray-500 mb-2">
                                {confirmationCount > 0
                                ? "Picked up by a miner!"
                                : stage === 5
                                    ? "Waiting... Higher fee transactions are cutting in line."
                                    : "Waiting for a miner to include it in a block..."}
                            </div>

                            {confirmationCount === 0 && (
                                <div className="bg-surface-tertiary dark:bg-surface-dark-tertiary p-3 rounded-lg text-xs font-mono border border-surface-border dark:border-surface-dark-border">
                                    <div className="text-gray-500 mb-2 uppercase font-bold">Top Pending Transactions</div>
                                    {mempool.slice(0, 5).map((tx, index) => (
                                        <div key={tx.id || `${tx.signature}-${index}`} className={`flex justify-between py-1 border-b border-gray-200 dark:border-gray-700 last:border-0 ${
                                            tx.signature === (stage >= 4 ? lowFeeTxHash : txHash) ? 'text-brand-600 font-bold' : ''
                                        }`}>
                                            <span>{tx.amount} coins</span>
                                            <span className={tx.fee && tx.fee >= FEE_LEVELS.HIGH ? 'text-green-600' : 'text-gray-500'}>Fee: {tx.fee}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Step 3 */}
                    <div className="relative">
                        <div className={`absolute -left-8 w-6 h-6 rounded-full flex items-center justify-center text-white border-4 border-white dark:border-gray-900 ${
                            confirmationCount >= 6 ? 'bg-green-500' : confirmationCount > 0 ? 'bg-indigo-500' : 'bg-gray-300 dark:bg-gray-600'
                        }`}>
                            {confirmationCount >= 6 ? <Lock size={12} /> : <span className="text-[10px] font-bold">{confirmationCount}</span>}
                        </div>
                        <div>
                            <div className="font-bold text-gray-900 dark:text-white">Confirmations</div>
                            <div className="text-sm text-gray-500 mb-2">
                                {confirmationCount === 0
                                ? "Not yet included in a block."
                                : confirmationCount >= 6
                                    ? "Transaction is irreversible."
                                    : "Building security... (Need 6)"}
                            </div>
                            {confirmationCount > 0 && (
                                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden w-full max-w-xs">
                                    <div
                                        className={`h-full transition-all duration-1000 ${confirmationCount >= 6 ? 'bg-status-valid' : 'bg-brand-500'}`}
                                        style={{ width: `${Math.min(100, (confirmationCount / 6) * 100)}%` }}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </Card>
          </div>
      )}

      {/* CONTINUE TO LOW FEE CHALLENGE */}
      {stage === 3 && (
         <div ref={lowFeeRef} className={lowFeeVisible ? 'animate-fade-up' : 'opacity-0'}>
             <Card variant="elevated" className="bg-brand-50 dark:bg-brand-900/20 border-brand-200 dark:border-brand-800">
                 <h3 className="text-lg font-bold text-brand-900 dark:text-brand-100 mb-2">Transaction Confirmed!</h3>
                 <p className="text-brand-800 dark:text-brand-200 mb-6">
                     Your transaction has enough confirmations to be considered safe. Now let's see why <strong>Fees</strong> matter.
                 </p>
                 <Button onClick={startLowFeeChallenge}>
                     Start Low Fee Challenge
                 </Button>
             </Card>
         </div>
      )}

      {/* COMPLETION */}
      {stage === 6 && (
         <div ref={completionRef} className={completionVisible ? 'animate-fade-up' : 'opacity-0'}>
             <Card variant="default" status="valid">
                 <div className="text-center space-y-6">
                     <div className="w-16 h-16 bg-status-valid/10 text-status-valid rounded-full flex items-center justify-center mx-auto">
                         <CheckCircle className="w-8 h-8" />
                     </div>
                     <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Transaction Complete!</h2>
                     <p className="text-gray-600 dark:text-gray-300 max-w-xl mx-auto">
                         You've learned that fees buy speed, and confirmations buy security.
                     </p>
                     <Button variant="success" size="lg" onClick={() => navigate('/journey/7')}>
                         Continue to Step 7 →
                     </Button>
                 </div>
             </Card>
         </div>
      )}

    </div>
  );
};

export default Step6_Transactions;
