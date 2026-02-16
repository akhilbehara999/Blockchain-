import React, { useState, useEffect, useMemo } from 'react';
import { Wallet as WalletIcon, Send, History, RefreshCw, AlertTriangle, ArrowRight, Coins } from 'lucide-react';
import { useWalletStore } from '../../../stores/useWalletStore';
import { useSandboxStore } from '../../../stores/useSandboxStore';
import { backgroundEngine } from '../../../engine/BackgroundEngine';
import { FEE_LEVELS } from '../../../engine/transaction';
import { NodeIdentity } from '../../../engine/NodeIdentity';
import { Wallet } from '../../../engine/types';

const WalletPanel: React.FC = () => {
  const mode = useSandboxStore(state => state.mode);
  const incrementMastery = useSandboxStore(state => state.incrementMastery);
  const { wallets, mempool, minedTransactions, sendTransaction, createWallet } = useWalletStore();

  const [sender, setSender] = useState<string>('');
  const [recipient, setRecipient] = useState<string>('');
  const [amount, setAmount] = useState<number>(1);
  const [fee, setFee] = useState<number>(FEE_LEVELS.STANDARD);
  const [isConfirming, setIsConfirming] = useState(false);

  // Initialize user wallet if needed
  useEffect(() => {
    const userId = NodeIdentity.getOrCreate().getId();
    // Check if wallet exists in store
    const userWallet = wallets.find(w => w.name === userId || w.name === 'You');

    // In Sandbox, we might want to ensure 'You' exists or use NodeIdentity
    // Let's stick to 'You' for simplicity if it exists, or create NodeIdentity wallet
    if (!userWallet) {
        createWallet(userId, 100);
    }

    if (mode === 'node') {
        setSender(userWallet ? userWallet.name : userId);
    }
  }, [wallets, mode, createWallet]);

  // Update sender when mode changes
  useEffect(() => {
      if (mode === 'node') {
          const userId = NodeIdentity.getOrCreate().getId();
          const userWallet = wallets.find(w => w.name === userId || w.name === 'You');
          if (userWallet) setSender(userWallet.name);
      }
  }, [mode, wallets]);

  const activeWallet = useMemo(() => {
      return wallets.find(w => w.name === sender);
  }, [wallets, sender]);

  const availableWallets = useMemo(() => {
      if (mode === 'god') return wallets;
      const userId = NodeIdentity.getOrCreate().getId();
      return wallets.filter(w => w.name === userId || w.name === 'You');
  }, [wallets, mode]);

  const peers = useMemo(() => {
      return wallets.filter(w => w.name !== sender);
  }, [wallets, sender]);

  // Activity History
  const activity = useMemo(() => {
      if (!activeWallet) return [];

      const pubKey = activeWallet.publicKey;

      // Combine mempool (pending) and mined (confirmed)
      const pending = mempool.filter(tx => tx.from === pubKey || tx.to === pubKey).map(tx => ({ ...tx, status: 'pending' }));
      const confirmed = minedTransactions.filter(tx => tx.from === pubKey || tx.to === pubKey).map(tx => ({ ...tx, status: 'confirmed' }));

      return [...pending, ...confirmed].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  }, [activeWallet, mempool, minedTransactions]);

  const handleSend = () => {
      if (!sender || !recipient || !amount) return;
      setIsConfirming(true);
  };

  const confirmSend = () => {
      sendTransaction(sender, recipient, amount, fee);
      setIsConfirming(false);
      incrementMastery('txSent');
      // Reset form slightly
      setAmount(1);
  };

  return (
    <div className="h-full bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden">
      <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 text-sm">
          <WalletIcon className="w-4 h-4 text-indigo-500" />
          Wallet
        </h3>
        {activeWallet && (
            <span className="font-mono font-bold text-gray-900 dark:text-white text-xs bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded">
                {activeWallet.balance.toFixed(4)} COINS
            </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Send Form */}
        <div className="bg-gray-50 dark:bg-gray-700/30 p-3 rounded-lg border border-gray-200 dark:border-gray-700 space-y-3">
             {/* Sender Selection (God Mode) */}
             {mode === 'god' && (
                 <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500 uppercase">From</label>
                    <select
                        value={sender}
                        onChange={(e) => setSender(e.target.value)}
                        className="w-full text-sm p-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                    >
                        {wallets.map(w => <option key={w.name} value={w.name}>{w.name} ({w.balance.toFixed(2)})</option>)}
                    </select>
                 </div>
             )}

             <div className="grid grid-cols-2 gap-3">
                 <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500 uppercase">To</label>
                    <select
                        value={recipient}
                        onChange={(e) => setRecipient(e.target.value)}
                        className="w-full text-sm p-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                    >
                        <option value="">Select Recipient</option>
                        {peers.map(w => <option key={w.name} value={w.name}>{w.name}</option>)}
                    </select>
                 </div>
                 <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500 uppercase">Amount</label>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(parseFloat(e.target.value))}
                        min="0.1"
                        step="0.1"
                        className="w-full text-sm p-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                    />
                 </div>
             </div>

             <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500 uppercase">Network Fee</label>
                <div className="flex gap-2">
                    {[
                        { label: 'Low', value: FEE_LEVELS.ECONOMY, color: 'text-yellow-600' },
                        { label: 'Std', value: FEE_LEVELS.STANDARD, color: 'text-green-600' },
                        { label: 'High', value: FEE_LEVELS.HIGH, color: 'text-red-600' }
                    ].map((opt) => (
                        <button
                            key={opt.label}
                            onClick={() => setFee(opt.value)}
                            className={`flex-1 py-1 text-xs font-medium rounded border ${
                                fee === opt.value
                                ? 'bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500 dark:bg-indigo-900/30'
                                : 'bg-white border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700'
                            }`}
                        >
                            <span className={opt.color}>{opt.label}</span>
                        </button>
                    ))}
                </div>
             </div>

             {!isConfirming ? (
                 <button
                    onClick={handleSend}
                    disabled={!sender || !recipient || !amount || (activeWallet && activeWallet.balance < amount + fee)}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm font-bold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <div className="flex items-center justify-center gap-2">
                        <Send className="w-4 h-4" /> Send Transaction
                    </div>
                 </button>
             ) : (
                 <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded border border-red-200 dark:border-red-800 animate-in fade-in">
                     <p className="text-xs text-red-800 dark:text-red-200 mb-2 font-medium flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Transactions are irreversible.
                     </p>
                     <div className="flex gap-2">
                         <button onClick={() => setIsConfirming(false)} className="flex-1 py-1 bg-white border border-gray-300 rounded text-xs hover:bg-gray-50">Cancel</button>
                         <button onClick={confirmSend} className="flex-1 py-1 bg-red-600 text-white rounded text-xs font-bold hover:bg-red-700">Confirm Send</button>
                     </div>
                 </div>
             )}
        </div>

        {/* Recent Activity */}
        <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2 flex items-center gap-1">
                <History className="w-3 h-3" /> Recent Activity
            </h4>
            {activity.length === 0 ? (
                <div className="text-center text-gray-400 text-xs py-4 italic">No transactions yet</div>
            ) : (
                <div className="space-y-2">
                    {activity.slice(0, 5).map((tx) => {
                        const isIncoming = tx.to === activeWallet?.publicKey;
                        const otherParty = isIncoming
                            ? wallets.find(w => w.publicKey === tx.from)?.name || 'Unknown'
                            : wallets.find(w => w.publicKey === tx.to)?.name || 'Unknown';

                        return (
                            <div key={tx.signature} className="flex items-center justify-between p-2 rounded border border-gray-100 dark:border-gray-700 text-xs">
                                <div className="flex items-center gap-2">
                                    <div className={`p-1.5 rounded-full ${isIncoming ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                        {isIncoming ? <ArrowRight className="w-3 h-3 rotate-180" /> : <ArrowRight className="w-3 h-3" />}
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900 dark:text-white">
                                            {isIncoming ? `From ${otherParty}` : `To ${otherParty}`}
                                        </div>
                                        <div className="text-[10px] text-gray-500">
                                            {tx.status === 'pending' ? 'Pending...' : `Confirmed #${tx.confirmationBlock}`}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className={`font-bold ${isIncoming ? 'text-green-600' : 'text-gray-900 dark:text-white'}`}>
                                        {isIncoming ? '+' : '-'}{tx.amount}
                                    </div>
                                    <div className="text-[10px] text-gray-400">Fee: {tx.fee}</div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default WalletPanel;
