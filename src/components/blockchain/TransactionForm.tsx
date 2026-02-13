import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Clock, Gauge, TrendingUp } from 'lucide-react';
import { Wallet } from '../../engine/types';
import { FEE_LEVELS } from '../../engine/transaction';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { useWalletStore } from '../../stores/useWalletStore';

interface TransactionFormProps {
  wallets: Wallet[];
  onSubmit: (from: string, to: string, amount: number, fee: number) => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ wallets, onSubmit }) => {
  const { mempool, getEstimatedConfirmationTime } = useWalletStore();
  const [from, setFrom] = useState(wallets[0]?.name || '');
  const [to, setTo] = useState(wallets[1]?.name || '');
  const [amount, setAmount] = useState<string>('');
  const [feeType, setFeeType] = useState<'high' | 'standard' | 'economy' | 'custom'>('standard');
  const [customFee, setCustomFee] = useState<string>(FEE_LEVELS.STANDARD.toString());
  const [error, setError] = useState<string | null>(null);

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

    onSubmit(from, to, numAmount, currentFee);
    setAmount('');
  };

  return (
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
                <option key={w.publicKey} value={w.name}>{w.name} ({w.balance} TKN)</option>
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
  );
};

export default TransactionForm;
