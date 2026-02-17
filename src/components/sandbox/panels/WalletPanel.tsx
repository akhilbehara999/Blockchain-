import React, { useState, useEffect, useMemo } from 'react';
import { Wallet as WalletIcon, Send, History, AlertTriangle, ArrowRight, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { useWalletStore } from '../../../stores/useWalletStore';
import { useSandboxStore } from '../../../stores/useSandboxStore';

import { FEE_LEVELS } from '../../../engine/transaction';
import { NodeIdentity } from '../../../engine/NodeIdentity';
import SandboxPanel from '../SandboxPanel';
import AnimatedNumber from '../../ui/AnimatedNumber';

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
    const userWallet = wallets.find(w => w.name === userId || w.name === 'You');

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
      setAmount(1);
  };

  return (
    <SandboxPanel
        title="Wallet"
        icon={WalletIcon}
        footer={
             activeWallet && (
                 <div className="flex justify-between items-center w-full">
                     <span className="text-xs text-gray-500 font-mono">{activeWallet.publicKey.substring(0, 16)}...</span>
                     <span className="text-xs font-bold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                         {activity.length} Txs
                     </span>
                 </div>
             )
        }
    >
      <div className="space-y-6">
        {/* Balance Card */}
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-5 text-white shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <WalletIcon className="w-24 h-24 transform rotate-12" />
            </div>

            <div className="relative z-10">
                <div className="text-indigo-100 text-sm font-medium mb-1">Total Balance</div>
                <div className="font-display font-bold text-4xl mb-4 flex items-baseline">
                    <AnimatedNumber value={activeWallet ? activeWallet.balance : 0} format={(v) => v.toFixed(2)} />
                    <span className="text-lg ml-2 opacity-80">COINS</span>
                </div>

                {mode === 'god' && (
                    <select
                        value={sender}
                        onChange={(e) => setSender(e.target.value)}
                        className="bg-white/20 border border-white/30 text-white text-xs rounded px-2 py-1 outline-none focus:bg-white/30 transition-colors w-full max-w-[200px]"
                    >
                        {wallets.map(w => <option key={w.name} value={w.name} className="text-gray-900">{w.name}</option>)}
                    </select>
                )}
            </div>
        </div>

        {/* Send Form */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-1">
             <div className="p-3 border-b border-gray-100 dark:border-gray-700">
                 <h4 className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-2">
                     <Send className="w-3 h-3" /> Send Transaction
                 </h4>
             </div>

             <div className="p-4 space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-1.5">
                        <label className="text-xs font-medium text-gray-500">Recipient</label>
                        <select
                            value={recipient}
                            onChange={(e) => setRecipient(e.target.value)}
                            className="w-full text-sm p-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow"
                        >
                            <option value="">Select Peer...</option>
                            {peers.map(w => <option key={w.name} value={w.name}>{w.name}</option>)}
                        </select>
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-xs font-medium text-gray-500">Amount</label>
                        <div className="relative">
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(parseFloat(e.target.value))}
                                min="0.1"
                                step="0.1"
                                className="w-full text-sm p-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow font-mono"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-bold pointer-events-none">COINS</span>
                        </div>
                     </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-500">Network Fee Priority</label>
                    <div className="flex p-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
                        {[
                            { label: 'Slow', value: FEE_LEVELS.ECONOMY, color: 'hover:text-yellow-600' },
                            { label: 'Standard', value: FEE_LEVELS.STANDARD, color: 'hover:text-green-600' },
                            { label: 'Fast', value: FEE_LEVELS.HIGH, color: 'hover:text-red-600' }
                        ].map((opt) => (
                            <button
                                key={opt.label}
                                onClick={() => setFee(opt.value)}
                                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${
                                    fee === opt.value
                                    ? 'bg-white dark:bg-gray-600 shadow-sm text-indigo-600'
                                    : `text-gray-500 dark:text-gray-400 ${opt.color}`
                                }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                 </div>

                 {!isConfirming ? (
                     <button
                        onClick={handleSend}
                        disabled={!sender || !recipient || !amount || (activeWallet && activeWallet.balance < amount + fee)}
                        className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all active:scale-[0.98]"
                    >
                        Sign & Send
                    </button>
                 ) : (
                     <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-100 dark:border-red-800 animate-in fade-in zoom-in-95">
                         <p className="text-xs text-red-800 dark:text-red-200 mb-3 font-medium flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 shrink-0" />
                            Confirm transfer of {amount} COINS to {recipient}?
                         </p>
                         <div className="flex gap-3">
                             <button onClick={() => setIsConfirming(false)} className="flex-1 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md text-xs font-bold hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
                             <button onClick={confirmSend} className="flex-1 py-1.5 bg-red-600 text-white rounded-md text-xs font-bold hover:bg-red-700 shadow-sm">Confirm</button>
                         </div>
                     </div>
                 )}
             </div>
        </div>

        {/* Recent Activity */}
        <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3 flex items-center gap-1">
                <History className="w-3 h-3" /> Recent Activity
            </h4>
            {activity.length === 0 ? (
                <div className="text-center text-gray-400 text-xs py-8 italic border border-dashed border-gray-200 dark:border-gray-700 rounded-lg">No transactions yet</div>
            ) : (
                <div className="space-y-2">
                    {activity.slice(0, 5).map((tx) => {
                        const isIncoming = tx.to === activeWallet?.publicKey;
                        const otherParty = isIncoming
                            ? wallets.find(w => w.publicKey === tx.from)?.name || 'Unknown'
                            : wallets.find(w => w.publicKey === tx.to)?.name || 'Unknown';

                        return (
                            <div key={tx.signature} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 transition-colors group">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isIncoming ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
                                        {isIncoming ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                                            {isIncoming ? otherParty : otherParty}
                                        </div>
                                        <div className="text-[10px] text-gray-500 flex items-center gap-1">
                                            {tx.status === 'pending' ? (
                                                <span className="text-orange-500 flex items-center gap-1">Pending...</span>
                                            ) : (
                                                <span className="text-green-500 flex items-center gap-1">Confirmed</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className={`font-mono font-bold text-sm ${isIncoming ? 'text-green-600' : 'text-gray-900 dark:text-white'}`}>
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
    </SandboxPanel>
  );
};

export default WalletPanel;
