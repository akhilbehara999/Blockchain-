import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, History } from 'lucide-react';
import ModuleLayout from '../components/layout/ModuleLayout';
import TransactionForm from '../components/blockchain/TransactionForm';
import Card from '../components/ui/Card';
import { Wallet } from '../engine/types';

// Dummy wallets for demonstration
const INITIAL_WALLETS: Wallet[] = [
  { name: 'Alice', publicKey: 'alice_pub', privateKey: 'alice_priv', balance: 100 },
  { name: 'Bob', publicKey: 'bob_pub', privateKey: 'bob_priv', balance: 50 },
  { name: 'Charlie', publicKey: 'charlie_pub', privateKey: 'charlie_priv', balance: 25 },
];

interface SimpleTransaction {
  id: string;
  from: string;
  to: string;
  amount: number;
  timestamp: number;
}

const Transaction: React.FC = () => {
  const [wallets, setWallets] = useState<Wallet[]>(INITIAL_WALLETS);
  const [transactions, setTransactions] = useState<SimpleTransaction[]>([]);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleTransactionSubmit = (fromName: string, toName: string, amount: number) => {
    // Check balance
    const fromWallet = wallets.find(w => w.name === fromName);
    const toWallet = wallets.find(w => w.name === toName);

    if (!fromWallet || !toWallet) return;

    // Update balances
    const updatedWallets = wallets.map(w => {
      if (w.name === fromName) {
        return { ...w, balance: w.balance - amount };
      }
      if (w.name === toName) {
        return { ...w, balance: w.balance + amount };
      }
      return w;
    });

    setWallets(updatedWallets);

    // Add to history
    const newTx: SimpleTransaction = {
      id: Math.random().toString(36).substr(2, 9),
      from: fromName,
      to: toName,
      amount,
      timestamp: Date.now(),
    };

    setTransactions(prev => [newTx, ...prev]);
    setSuccessMsg('Transaction Sent Successfully!');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  return (
    <ModuleLayout moduleId="transaction" title="Transaction" subtitle="Sending Value">
      <div className="space-y-8 max-w-4xl mx-auto">
        <Card className="bg-gradient-to-br from-secondary-bg to-tertiary-bg border-none">
          <div className="p-6">
            <h3 className="text-lg font-bold text-text-primary mb-2">How Transactions Work</h3>
            <p className="text-text-secondary">
              A transaction is a message signed by the sender that authorizes the transfer of value.
              Below, you can simulate a transaction between local wallets. Notice how balances update immediately in this simplified simulation.
            </p>
          </div>
        </Card>

        <div className="relative">
          <TransactionForm wallets={wallets} onSubmit={handleTransactionSubmit} />

          <AnimatePresence>
             {successMsg && (
               <motion.div
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0 }}
                 className="absolute -top-12 left-0 right-0 flex justify-center pointer-events-none"
               >
                 <div className="bg-success text-white px-4 py-2 rounded-lg shadow-lg font-bold">
                   {successMsg}
                 </div>
               </motion.div>
             )}
           </AnimatePresence>
        </div>

        {transactions.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-text-primary flex items-center">
              <History className="w-5 h-5 mr-2" />
              Transaction History
            </h3>
            <div className="space-y-3">
              <AnimatePresence>
                {transactions.map(tx => (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    layout
                  >
                    <Card className="p-4 flex justify-between items-center bg-secondary-bg/50">
                      <div className="flex items-center space-x-4">
                        <div className="text-sm text-text-secondary">
                          {new Date(tx.timestamp).toLocaleTimeString()}
                        </div>
                        <div className="flex items-center font-mono font-medium text-text-primary">
                          <span className="text-accent">{tx.from}</span>
                          <ArrowRight className="w-4 h-4 mx-2 text-text-secondary" />
                          <span className="text-success">{tx.to}</span>
                        </div>
                      </div>
                      <div className="font-bold text-lg text-text-primary">
                        {tx.amount.toFixed(2)} TKN
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </ModuleLayout>
  );
};

export default Transaction;
