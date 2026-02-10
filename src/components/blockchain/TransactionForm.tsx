import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Wallet } from '../../engine/types';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';

interface TransactionFormProps {
  wallets: Wallet[];
  onSubmit: (from: string, to: string, amount: number) => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ wallets, onSubmit }) => {
  const [from, setFrom] = useState(wallets[0]?.name || '');
  const [to, setTo] = useState(wallets[1]?.name || '');
  const [amount, setAmount] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Sync state when wallets load
  useEffect(() => {
    if (wallets.length > 0 && !from) {
      setFrom(wallets[0].name);
    }
    if (wallets.length > 1 && !to) {
      setTo(wallets[1].name);
    } else if (wallets.length > 0 && !to && from !== wallets[0].name) {
       // If only 1 wallet exists or to is empty, set to first available different from from
       const available = wallets.find(w => w.name !== from);
       if (available) setTo(available.name);
    }
  }, [wallets, from, to]);

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

    if (fromWallet.balance < numAmount) {
      setError('Insufficient balance');
      return;
    }

    onSubmit(from, to, numAmount);
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

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full md:w-auto min-w-[200px]"
            disabled={!amount || parseFloat(amount) <= 0}
          >
            Send Tokens
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default TransactionForm;
