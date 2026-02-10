import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import ModuleLayout from '../components/layout/ModuleLayout';
import WalletCard from '../components/blockchain/WalletCard';
import TransactionForm from '../components/blockchain/TransactionForm';
import MempoolView from '../components/blockchain/MempoolView';
import CompactBlockCard from '../components/blockchain/CompactBlockCard';
import Button from '../components/ui/Button';
import { useWalletStore } from '../stores/useWalletStore';
import { useBlockchainStore } from '../stores/useBlockchainStore';
import { calculateHash } from '../engine/block';

const M05_Tokens: React.FC = () => {
  const {
    wallets,
    mempool,
    initializeWallets,
    createWallet,
    sendTransaction,
    mineMempool
  } = useWalletStore();

  const {
    blocks,
    initializeChain,
    addBlock
  } = useBlockchainStore();

  const [transactionSuccess, setTransactionSuccess] = useState<string | null>(null);

  // Initialization
  useEffect(() => {
    // Reset wallets to specific state for this module
    initializeWallets();
    // Ensure we have a clean chain or appropriate start state
    initializeChain(1); // Just Genesis
    // Override wallets to match requirements if initializeWallets defaults differ
    // (Assuming initializeWallets sets Alice 100, Bob 50 as per store code. We need Charlie 25)
    // The store code sets Alice 100, Bob 50. We need to add Charlie 25.
    // However, initializeWallets might be async or state update might be batched.
    // Best to check if Charlie exists, if not create him.
    // Since we can't easily modify store init logic from here without expanding store API,
    // we will rely on checking wallets length or specific names in a separate effect or just add him.
  }, []);

  // Ensure Charlie exists
  useEffect(() => {
    if (wallets.length > 0 && !wallets.find(w => w.name === 'Charlie')) {
      createWallet('Charlie', 25);
    }
  }, [wallets, createWallet]);

  const handleTransactionSubmit = (from: string, to: string, amount: number) => {
    sendTransaction(from, to, amount);
    setTransactionSuccess(`Transaction added to mempool!`);
    setTimeout(() => setTransactionSuccess(null), 3000);
  };

  const handleMineBlock = () => {
    if (mempool.length === 0) return;

    // Format transactions for block data
    const blockData = mempool.map(tx => {
      const fromWallet = wallets.find(w => w.publicKey === tx.from);
      const toWallet = wallets.find(w => w.publicKey === tx.to);
      const fromName = fromWallet ? fromWallet.name : tx.from.substring(0, 8);
      const toName = toWallet ? toWallet.name : tx.to.substring(0, 8);
      return `${fromName} -> ${toName}: ${tx.amount}`;
    }).join('\n');

    // Add to blockchain
    addBlock(blockData);

    // Process balances and clear mempool
    mineMempool();
  };

  const handleCreateWallet = () => {
    const names = ['Dave', 'Eve', 'Frank', 'Grace', 'Heidi'];
    const usedNames = wallets.map(w => w.name);
    const nextName = names.find(n => !usedNames.includes(n)) || `User ${wallets.length + 1}`;
    createWallet(nextName, 0);
  };

  return (
    <ModuleLayout
      moduleId="tokens"
      title="Tokens & Cryptocurrency"
      subtitle="Track ownership and value transfer with a ledger"
    >
      <div className="space-y-12 max-w-6xl mx-auto">

        {/* Wallets Section */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-text-primary">Wallets</h2>
            <Button onClick={handleCreateWallet} variant="secondary" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Create Wallet
            </Button>
          </div>

          <div className="overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
            <div className="flex gap-6 min-w-max">
              <AnimatePresence mode="popLayout">
                {wallets.map(wallet => (
                  <motion.div
                    key={wallet.publicKey}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    layout
                  >
                    <WalletCard
                      wallet={wallet}
                      onSend={() => {
                        // Scroll to transaction form or pre-fill it (optional, simplest is just render)
                        document.getElementById('transaction-form')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </section>

        {/* Transaction Form */}
        <section id="transaction-form" className="relative">
           <h2 className="text-2xl font-bold text-text-primary mb-6 text-center">New Transaction</h2>
           <TransactionForm wallets={wallets} onSubmit={handleTransactionSubmit} />

           <AnimatePresence>
             {transactionSuccess && (
               <motion.div
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0 }}
                 className="absolute top-0 right-0 left-0 flex justify-center pointer-events-none"
               >
                 <div className="bg-success text-white px-4 py-2 rounded-lg shadow-lg">
                   {transactionSuccess}
                 </div>
               </motion.div>
             )}
           </AnimatePresence>
        </section>

        {/* Mempool */}
        <section>
           <MempoolView
             transactions={mempool}
             onMineBlock={handleMineBlock}
             wallets={wallets}
           />
        </section>

        {/* Blockchain View */}
        <section>
          <h2 className="text-2xl font-bold text-text-primary mb-6">Blockchain Ledger</h2>
          <div className="flex overflow-x-auto gap-4 pb-4 items-start min-h-[160px]">
             {blocks.map((block, index) => {
               // Quick validity check for display (simplified)
               const isValid = block.hash === calculateHash(block) &&
                              (index === 0 || block.previousHash === blocks[index-1].hash);

               return (
                 <CompactBlockCard
                   key={block.hash}
                   block={block}
                   status={isValid ? 'valid' : 'invalid'}
                 />
               );
             })}
          </div>
        </section>

      </div>
    </ModuleLayout>
  );
};

export default M05_Tokens;
