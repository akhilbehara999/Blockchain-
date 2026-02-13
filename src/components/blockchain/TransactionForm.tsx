import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Clock, Gauge, TrendingUp, Lock, AlertTriangle, ShieldCheck, History, AlertCircle } from 'lucide-react';
import { Wallet } from '../../engine/types';
import { FEE_LEVELS } from '../../engine/transaction';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { useWalletStore } from '../../stores/useWalletStore';

interface TransactionFormProps {
  wallets: Wallet[];
  onSubmit: (from: string, to: string, amount: number, fee: number) => void;
  showHistory?: boolean;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ wallets, onSubmit, showHistory = true }) => {
  const { mempool, minedTransactions, getEstimatedConfirmationTime, cancelTransaction } = useWalletStore();
  const [from, setFrom] = useState(wallets[0]?.name || '');
  const [to, setTo] = useState(wallets[1]?.name || '');
  const [amount, setAmount] = useState<string>('');
  const [feeType, setFeeType] = useState<'high' | 'standard' | 'economy' | 'custom'>('standard');
  const [customFee, setCustomFee] = useState<string>(FEE_LEVELS.STANDARD.toString());
  const [error, setError] = useState<string | null>(null);

  // Confirmation State
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingTx, setPendingTx] = useState<{from: string, to: string, amount: number, fee: number} | null>(null);

  // Sync state when wallets load
  useEffect(() => {
    if (wallets.length > 0 && !from) {
      setFrom(wallets[0].name);
    }
    if (wallets.length > 1 && !to) {
      setTo(wallets[1].name);
    } else if (wallets.length > 0 && !to && from !== wallets[0].name) {
       const available = wallets.find(w => w.name !== from);
       if (available) setTo(available.name);
    }
  }, [wallets, from, to]);

  const getCurrentFee = (): number => {
    switch (feeType) {
      case 'high': return FEE_LEVELS.HIGH;
      case 'standard': return FEE_LEVELS.STANDARD;
      case 'economy': return FEE_LEVELS.ECONOMY;
      case 'custom': return parseFloat(customFee) || 0;
    }
  };

  const currentFee = getCurrentFee();
  const estBlocks = getEstimatedConfirmationTime(currentFee);

  // Calculate potential position
  const getQueueStats = () => {
    const sortedFees = [...mempool.map(t => t.fee || 0), currentFee].sort((a, b) => b - a);
    const position = sortedFees.indexOf(currentFee) + 1;

    // Percentile
    let percentile = 100;
    if (mempool.length > 0) {
       const cheaper = mempool.filter(t => (t.fee || 0) < currentFee).length;
       percentile = Math.round((cheaper / mempool.length) * 100);
    }

    return { position, percentile };
  };

  const { position, percentile } = getQueueStats();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const fromWallet = wallets.find(w => w.name === from);
    const toWallet = wallets.find(w => w.name === to);
    const numAmount = parseFloat(amount);

    if (!fromWallet || !toWallet) {
      setError('Invalid wallets selected');
      return;
    }

    if (from === to) {
      setError('Cannot send tokens to the same wallet');
      return;
    }

    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Amount must be a positive number');
      return;
    }

    if (fromWallet.balance < (numAmount + currentFee)) {
      setError(`Insufficient balance (Need ${numAmount + currentFee} for amount + fee)`);
      return;
    }

    // Show Confirmation Dialog instead of submitting immediately
    setPendingTx({ from, to, amount: numAmount, fee: currentFee });
    setShowConfirm(true);
  };

  const confirmSend = () => {
      if (pendingTx) {
          onSubmit(pendingTx.from, pendingTx.to, pendingTx.amount, pendingTx.fee);
          setShowConfirm(false);
          setPendingTx(null);
          setAmount('');
      }
  };

  const myTransactions = [...mempool, ...minedTransactions]
    .filter(tx => wallets.some(w => w.publicKey === tx.from || w.publicKey === tx.to))
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 5); // Show last 5

  const getWalletName = (pubKey: string) => {
      const w = wallets.find(w => w.publicKey === pubKey);
      return w ? w.name : pubKey.substring(0, 8);
  };

  const handleCancel = (tx: any) => {
      // Send 0 value to self with higher fee
      const newFee = (tx.fee || 0) * 1.5; // Bump fee
      cancelTransaction(tx.signature, newFee);
  };

  return (
    <div className="space-y-8">
    <Card className="w-full max-w-2xl mx-auto p-8 border-none bg-secondary-bg/50 backdrop-blur-md">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-text-secondary mb-2">Sender</label>
            <select
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-tertiary-bg border-2 border-border focus:border-accent outline-none text-text-primary transition-colors appearance-none"
            >
              <option value="" disabled>Select Sender</option>
              {wallets.map(w => (
                <option key={w.publicKey} value={w.name}>{w.name} ({w.balance.toFixed(4)} TKN)</option>
              ))}
            </select>
          </div>

          <div className="hidden md:flex items-center justify-center pb-3 text-text-tertiary">
            <ArrowRight className="w-6 h-6" />
          </div>

          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-text-secondary mb-2">Recipient</label>
            <select
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-tertiary-bg border-2 border-border focus:border-accent outline-none text-text-primary transition-colors appearance-none"
            >
              <option value="" disabled>Select Recipient</option>
              {wallets.map(w => (
                <option key={w.publicKey} value={w.name}>{w.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <Input
            label="Amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            min="0"
            step="0.01"
            className="text-lg font-mono"
            error={error || undefined}
          />
        </div>

        {/* Fee Selector */}
        <div className="space-y-3">
            <label className="block text-sm font-medium text-text-secondary">Network Fee</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {[
                  { id: 'high', label: 'High', value: FEE_LEVELS.HIGH, time: '~1 block' },
                  { id: 'standard', label: 'Standard', value: FEE_LEVELS.STANDARD, time: '~3 blocks' },
                  { id: 'economy', label: 'Economy', value: FEE_LEVELS.ECONOMY, time: '~10 blocks' },
                  { id: 'custom', label: 'Custom', value: 0, time: '?? blocks' }
                ].map((option) => (
                    <button
                        key={option.id}
                        type="button"
                        onClick={() => setFeeType(option.id as any)}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
                            feeType === option.id
                            ? 'border-accent bg-accent/10 text-accent'
                            : 'border-border bg-tertiary-bg text-text-secondary hover:border-accent/50'
                        }`}
                    >
                        <span className="font-bold text-sm">{option.label}</span>
                        {option.id !== 'custom' && (
                             <span className="text-xs opacity-70">{option.value}</span>
                        )}
                    </button>
                ))}
            </div>

            {feeType === 'custom' && (
                <div className="mt-2">
                     <Input
                        label="Custom Fee"
                        type="number"
                        value={customFee}
                        onChange={(e) => setCustomFee(e.target.value)}
                        placeholder="0.0001"
                        min="0"
                        step="0.0001"
                        className="font-mono text-sm"
                     />
                </div>
            )}

            {/* Stats */}
            <div className="bg-tertiary-bg/50 rounded-lg p-4 space-y-2 text-sm">
                 <div className="flex items-center justify-between text-text-primary">
                    <div className="flex items-center gap-2">
                         <Clock className="w-4 h-4 text-warning" />
                         <span>Estimated Confirmation:</span>
                    </div>
                    <span className="font-bold">{estBlocks} blocks</span>
                 </div>

                 <div className="flex items-center justify-between text-text-primary">
                    <div className="flex items-center gap-2">
                         <Gauge className="w-4 h-4 text-accent" />
                         <span>Queue Position:</span>
                    </div>
                    <span className="font-bold">#{position}</span>
                 </div>

                 {mempool.length > 0 && (
                     <div className="flex items-center justify-between text-text-secondary text-xs">
                        <div className="flex items-center gap-2">
                             <TrendingUp className="w-3 h-3" />
                             <span>Fee Comparison:</span>
                        </div>
                        <span>Higher than {percentile}% of pending txs</span>
                     </div>
                 )}
            </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full md:w-auto min-w-[200px]"
            disabled={!amount || parseFloat(amount) <= 0 || currentFee <= 0}
          >
            Send Tokens
          </Button>
        </div>
      </form>
    </Card>

    {/* Recent Activity */}
    {showHistory && myTransactions.length > 0 && (
        <div className="max-w-2xl mx-auto space-y-4">
            <h3 className="text-xl font-bold text-text-primary flex items-center gap-2">
                <History className="w-5 h-5" />
                Recent Activity
            </h3>
            <div className="space-y-3">
                {myTransactions.map(tx => {
                    const isConfirmed = tx.status === 'confirmed';
                    const isPending = tx.status === 'pending';
                    const isMe = wallets.some(w => w.publicKey === tx.from);

                    return (
                        <div key={tx.signature} className="bg-secondary-bg/50 border border-border rounded-xl p-4 flex flex-col gap-3">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-2 text-sm">
                                    {isConfirmed ? (
                                        <div className="flex items-center gap-1 text-success font-bold bg-success/10 px-2 py-1 rounded">
                                            <Lock className="w-3 h-3" />
                                            Confirmed
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1 text-warning font-bold bg-warning/10 px-2 py-1 rounded">
                                            <Clock className="w-3 h-3" />
                                            Pending
                                        </div>
                                    )}
                                    {isConfirmed && tx.confirmationBlock && (
                                         <span className="text-text-tertiary">Block #{tx.confirmationBlock}</span>
                                    )}
                                </div>
                                <div className="font-mono text-xs text-text-tertiary">
                                    {new Date(tx.timestamp).toLocaleTimeString()}
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-text-primary font-medium">
                                    <span>{getWalletName(tx.from)}</span>
                                    <ArrowRight className="w-4 h-4 text-text-secondary" />
                                    <span>{getWalletName(tx.to)}</span>
                                </div>
                                <span className="font-bold text-lg">{tx.amount} TKN</span>
                            </div>

                            {isConfirmed ? (
                                <div className="bg-success/5 text-success text-xs p-2 rounded border border-success/20 flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4" />
                                    Transaction confirmed in block #{tx.confirmationBlock}. This is permanent.
                                </div>
                            ) : (
                                <div className="flex justify-between items-center pt-2 border-t border-border/30">
                                    <span className="text-xs text-text-tertiary">Waiting for miner...</span>
                                    {isMe && isPending && (
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            onClick={() => handleCancel(tx)}
                                            className="h-7 px-3 text-xs"
                                        >
                                            Cancel
                                        </Button>
                                    )}
                                </div>
                            )}

                            {isConfirmed && (
                                <div className="flex justify-end gap-2 opacity-50 pointer-events-none">
                                     <Button variant="secondary" size="sm" className="h-7 px-3 text-xs">Edit</Button>
                                     <Button variant="secondary" size="sm" className="h-7 px-3 text-xs">Undo</Button>
                                </div>
                            )}
                            {isConfirmed && (
                                <div className="text-[10px] text-danger text-right mt-1">
                                    ❌ Confirmed transactions cannot be reversed.
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    )}

    {/* Confirmation Dialog */}
    <AnimatePresence>
        {showConfirm && pendingTx && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    onClick={() => setShowConfirm(false)}
                />
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative bg-secondary-bg border border-border rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-6 overflow-hidden"
                >
                     {/* Header */}
                     <div className="flex items-center gap-3 text-warning border-b border-border/50 pb-4">
                         <AlertTriangle className="w-8 h-8" />
                         <h3 className="text-xl font-bold">CONFIRM TRANSACTION</h3>
                     </div>

                     {/* Details */}
                     <div className="space-y-4 font-mono text-sm">
                         <div className="flex justify-between">
                             <span className="text-text-secondary">To:</span>
                             <span className="text-text-primary text-right break-all max-w-[200px] truncate">{pendingTx.to} ({getWalletName(pendingTx.to)})</span>
                         </div>
                         <div className="flex justify-between">
                             <span className="text-text-secondary">Amount:</span>
                             <span className="text-text-primary">{pendingTx.amount} coins</span>
                         </div>
                         <div className="flex justify-between">
                             <span className="text-text-secondary">Fee:</span>
                             <span className="text-text-primary">{pendingTx.fee} coins</span>
                         </div>
                         <div className="flex justify-between pt-2 border-t border-border/30 font-bold text-lg">
                             <span className="text-text-secondary">Total:</span>
                             <span className="text-accent">{(pendingTx.amount + pendingTx.fee).toFixed(5)} coins</span>
                         </div>
                     </div>

                     {/* Warning */}
                     <div className="bg-danger/10 text-danger p-4 rounded-xl text-sm flex gap-3 items-start border border-danger/20">
                         <AlertCircle className="w-5 h-5 shrink-0" />
                         <p className="font-bold">This CANNOT be reversed once confirmed by the network.</p>
                     </div>

                     {/* Actions */}
                     <div className="flex gap-3 pt-2">
                         <Button variant="secondary" onClick={() => setShowConfirm(false)} className="flex-1">
                             Cancel
                         </Button>
                         <Button variant="danger" onClick={confirmSend} className="flex-1 bg-danger hover:bg-danger-hover text-white">
                             Send Forever
                         </Button>
                     </div>
                </motion.div>
            </div>
        )}
    </AnimatePresence>
    </div>
  );
};

export default TransactionForm;
