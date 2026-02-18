import React, { useState } from 'react';
import { useWalletStore } from '../../../stores/useWalletStore';
import { useBackground } from '../../../context/BackgroundContext';
import SandboxPanel from '../SandboxPanel';
import Card from '../../ui/Card';
import Button from '../../ui/Button';
import Hash from '../../ui/Hash';
import { Wallet as WalletIcon, Send, AlertTriangle, History as HistoryIcon, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { NodeIdentity } from '../../../engine/NodeIdentity';

const WalletPanel: React.FC = () => {
  const { wallets, mempool, minedTransactions, sendTransaction } = useWalletStore();
  const { engine } = useBackground();

  const [activeWalletId, setActiveWalletId] = useState<string | null>(null);
  const [recipient, setRecipient] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [isSending, setIsSending] = useState(false);

  // Initialize active wallet
  React.useEffect(() => {
      const userWallet = wallets.find(w => w.name === 'You' || w.name === NodeIdentity.getOrCreate().getId());
      if (userWallet) {
          setActiveWalletId(userWallet.name);
      } else if (wallets.length > 0) {
          setActiveWalletId(wallets[0].name);
      }
  }, [wallets]);

  const activeWallet = wallets.find(w => w.name === activeWalletId);
  const peers = engine.getPeerWallets();

  // Transactions involving active wallet
  const history = minedTransactions.filter(tx => {
      const w = activeWallet;
      if (!w) return false;
      return tx.from === w.publicKey || tx.to === w.publicKey ||
             tx.from === w.name || tx.to === w.name;
  }).reverse();

  const handleSend = () => {
      if (!activeWallet || !recipient || !amount) return;
      setIsSending(true);

      try {
          sendTransaction(activeWallet.name, recipient, parseFloat(amount));
          setAmount('');
          setRecipient('');
      } catch (e) {
          // Handle error
      } finally {
          setIsSending(false);
      }
  };

  return (
    <SandboxPanel title="Wallet" icon={WalletIcon}>
      <div className="space-y-6">

          {/* Wallet Selector / Balance Card */}
          <Card variant="elevated" className="bg-gradient-to-br from-indigo-500 to-purple-600 border-none text-white shadow-lg shadow-indigo-500/30">
              <div className="flex justify-between items-start mb-4">
                  <div>
                      <label className="text-xs text-indigo-200 uppercase font-bold tracking-wider">Current Balance</label>
                      <h2 className="text-4xl font-mono font-bold mt-1">
                          {activeWallet ? activeWallet.balance.toFixed(4) : '0.0000'} <span className="text-lg text-indigo-200">YUP</span>
                      </h2>
                  </div>
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                      <WalletIcon className="w-6 h-6 text-white" />
                  </div>
              </div>

              <div className="space-y-2">
                  <label className="text-xs text-indigo-200 uppercase font-bold tracking-wider">Active Account</label>
                  <select
                      value={activeWalletId || ''}
                      onChange={(e) => setActiveWalletId(e.target.value)}
                      className="w-full bg-white/10 border border-white/20 text-white placeholder-indigo-300 text-sm rounded-lg focus:ring-2 focus:ring-white/50 focus:border-white/50 block p-2.5 outline-none [&>option]:text-gray-900"
                  >
                      {wallets.map(w => (
                          <option key={w.name} value={w.name}>{w.name} ({w.balance.toFixed(2)})</option>
                      ))}
                  </select>
              </div>
          </Card>

          {/* Send Form */}
          <div className="space-y-4">
              <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-sm uppercase tracking-wide">
                  <Send className="w-4 h-4" /> Send Funds
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase">Recipient</label>
                      <div className="relative">
                          <input
                              list="peers"
                              type="text"
                              value={recipient}
                              onChange={(e) => setRecipient(e.target.value)}
                              placeholder="Address or Name"
                              className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                          />
                          <datalist id="peers">
                              {peers.map(p => (
                                  <option key={p.publicKey} value={p.name} />
                              ))}
                          </datalist>
                      </div>
                  </div>
                  <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase">Amount</label>
                      <input
                          type="number"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          placeholder="0.00"
                          min="0"
                          step="0.1"
                          className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      />
                  </div>
              </div>

              <Button
                  fullWidth
                  onClick={handleSend}
                  disabled={!activeWallet || !recipient || !amount || parseFloat(amount) <= 0 || parseFloat(amount) > activeWallet.balance || isSending}
                  loading={isSending}
                  className="shadow-lg shadow-indigo-500/20"
              >
                  Send Transaction
              </Button>
          </div>

          {/* Transaction History */}
          <div className="space-y-3">
              <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-sm uppercase tracking-wide">
                  <HistoryIcon className="w-4 h-4" /> Recent Activity
              </h3>

              <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar pr-1">
                  {history.length === 0 ? (
                      <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
                          <HistoryIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p className="text-xs">No transactions yet</p>
                      </div>
                  ) : (
                      history.map((tx) => {
                          const isIncoming = tx.to === activeWallet?.publicKey || tx.to === activeWallet?.name;
                          return (
                              <div key={tx.signature} className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl flex justify-between items-center group hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
                                  <div className="flex items-center gap-3">
                                      <div className={`p-2 rounded-lg ${isIncoming ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-rose-100 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400'}`}>
                                          {isIncoming ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                                      </div>
                                      <div>
                                          <div className="text-xs font-bold text-gray-900 dark:text-white">
                                              {isIncoming ? 'Received from' : 'Sent to'} {isIncoming ? (tx.from.startsWith('0x') ? <Hash value={tx.from} /> : tx.from) : (tx.to.startsWith('0x') ? <Hash value={tx.to} /> : tx.to)}
                                          </div>
                                          <div className="text-[10px] text-gray-500 font-mono">
                                              {new Date(tx.timestamp).toLocaleTimeString()}
                                          </div>
                                      </div>
                                  </div>
                                  <div className={`font-mono font-bold ${isIncoming ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-white'}`}>
                                      {isIncoming ? '+' : '-'}{tx.amount.toFixed(2)}
                                  </div>
                              </div>
                          );
                      })
                  )}
              </div>
          </div>

          {mempool.length > 0 && (
              <div className="p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
                  <p className="text-xs text-amber-800 dark:text-amber-200">
                      <strong>{mempool.length} Pending Transactions</strong> waiting in mempool. They will appear in history once mined.
                  </p>
              </div>
          )}

      </div>
    </SandboxPanel>
  );
};

export default WalletPanel;
