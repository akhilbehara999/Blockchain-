import React, { useEffect, useState } from 'react';
import { Plus, Check, X, Skull, AlertTriangle } from 'lucide-react';
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
    minedTransactions,
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
  const [mistakeTxStatus, setMistakeTxStatus] = useState<'idle' | 'pending' | 'confirmed'>('idle');
  const [lastBlockStats, setLastBlockStats] = useState<{
      blockIndex: number;
      txCount: number;
      pendingCount: number;
      highestFee: number;
      lowestFee: number;
      userIncluded: boolean;
  } | null>(null);

  // Initialization
  useEffect(() => {
    initializeWallets();
    initializeChain(1);
  }, []);

  // Monitor Mistake Transaction
  useEffect(() => {
    if (mistakeTxStatus === 'pending') {
       const voidWallet = wallets.find(w => w.name === '0x000...000');
       if (voidWallet) {
           const confirmed = minedTransactions.some(tx => tx.to === voidWallet.publicKey);
           if (confirmed) {
               setMistakeTxStatus('confirmed');
           }
       }
    }
  }, [minedTransactions, wallets, mistakeTxStatus]);

  // Ensure Charlie exists
  useEffect(() => {
    if (wallets.length > 0 && !wallets.find(w => w.name === 'Charlie')) {
      createWallet('Charlie', 25);
    }
  }, [wallets, createWallet]);

  const handleTransactionSubmit = (from: string, to: string, amount: number, fee: number) => {
    sendTransaction(from, to, amount, fee);
    setTransactionSuccess(`Transaction added to mempool!`);
    setTimeout(() => setTransactionSuccess(null), 3000);
  };

  const handleCreateWallet = () => {
    const names = ['Dave', 'Eve', 'Frank', 'Grace', 'Heidi'];
    const usedNames = wallets.map(w => w.name);
    const nextName = names.find(n => !usedNames.includes(n)) || `User ${wallets.length + 1}`;
    createWallet(nextName, 0);
  };

  const handleMistakeDemo = () => {
      let voidName = '0x000...000';
      if (!wallets.find(w => w.name === voidName)) {
          createWallet(voidName, 0);
          setTimeout(() => {
             sendTransaction('Alice', voidName, 5, 0.001);
             setMistakeTxStatus('pending');
             setTransactionSuccess("Transaction sent to the Void!");
          }, 100);
      } else {
          sendTransaction('Alice', voidName, 5, 0.001);
          setMistakeTxStatus('pending');
          setTransactionSuccess("Transaction sent to the Void!");
      }
  };

  const handleMineBlock = () => {
    if (mempool.length === 0) return;

    // Mine transactions first to get the list of included ones
    const minedTxs = mineMempool(blocks.length);

    if (minedTxs.length === 0) return;

    // Format transactions for block data
    const blockData = minedTxs.map(tx => {
      const fromWallet = wallets.find(w => w.publicKey === tx.from);
      const toWallet = wallets.find(w => w.publicKey === tx.to);
      const fromName = fromWallet ? fromWallet.name : tx.from.substring(0, 8);
      const toName = toWallet ? toWallet.name : tx.to.substring(0, 8);
      return `${fromName} -> ${toName}: ${tx.amount} (Fee: ${tx.fee?.toFixed(4)})`;
    }).join('\n');

    // Add to blockchain
    addBlock(blockData);

    // Stats
    const highestFee = Math.max(...minedTxs.map(t => t.fee || 0));
    const lowestFee = Math.min(...minedTxs.map(t => t.fee || 0));

    // Check if user tx included (user is anyone in wallets)
    const userTxIncluded = minedTxs.some(tx => wallets.some(w => w.publicKey === tx.from));

    setLastBlockStats({
        blockIndex: blocks.length,
        txCount: minedTxs.length,
        pendingCount: mempool.length, // use remaining pending count from stale state which is close enough or use math
        // Better:
        // pendingCount: Math.max(0, mempool.length - minedTxs.length),
        // No, `mempool` is stale, so it includes the mined ones.
        // So `mempool.length - minedTxs.length` is correct for "pending left".
        highestFee,
        lowestFee,
        userIncluded: userTxIncluded
    });
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

           <AnimatePresence>
               {lastBlockStats && (
                   <motion.div
                       initial={{ opacity: 0, height: 0 }}
                       animate={{ opacity: 1, height: 'auto' }}
                       exit={{ opacity: 0, height: 0 }}
                       className="mt-4"
                   >
                       <div className="bg-secondary-bg border border-border rounded-xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                           <div>
                               <h4 className="font-bold text-text-primary">Block #{lastBlockStats.blockIndex} Mined!</h4>
                               <p className="text-sm text-text-secondary">
                                   Included {lastBlockStats.txCount} transactions. {Math.max(0, lastBlockStats.pendingCount - lastBlockStats.txCount)} pending left.
                               </p>
                               <div className="text-xs text-text-tertiary mt-1">
                                   Highest fee: {lastBlockStats.highestFee.toFixed(4)} | Lowest fee: {lastBlockStats.lowestFee.toFixed(4)}
                               </div>
                           </div>

                           <div className="flex items-center gap-3">
                               <div className={`px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2 ${lastBlockStats.userIncluded ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'}`}>
                                   {lastBlockStats.userIncluded ? (
                                       <>INCLUDED <Check className="w-4 h-4" /></>
                                   ) : (
                                       <>NOT INCLUDED <X className="w-4 h-4" /></>
                                   )}
                               </div>
                               <button
                                   onClick={() => setLastBlockStats(null)}
                                   className="text-text-tertiary hover:text-text-primary"
                               >
                                   <X className="w-5 h-5" />
                               </button>
                           </div>
                       </div>
                   </motion.div>
               )}
           </AnimatePresence>
        </section>

        {/* Blockchain View */}
        <section>
          <h2 className="text-2xl font-bold text-text-primary mb-6">Blockchain Ledger</h2>
          <div className="flex overflow-x-auto gap-4 pb-4 items-start min-h-[160px]">
             {blocks.map((block, index) => {
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

        {/* Mistake Demo Section */}
        <section className="border-t border-border pt-8 mt-12">
            <div className="bg-danger/5 border border-danger/20 rounded-2xl p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-4 -mr-4 opacity-5">
                    <Skull className="w-64 h-64 text-danger" />
                </div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="bg-danger/10 p-3 rounded-xl">
                             <Skull className="w-8 h-8 text-danger" />
                        </div>
                        <h2 className="text-2xl font-bold text-danger">The "Void" Experiment</h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 items-center">
                        <div className="space-y-4">
                            <p className="text-text-secondary leading-relaxed">
                                In a decentralized system, there is no central authority (like a bank) to reverse a transaction.
                                If you send funds to an address that no one owns (like <code className="bg-black/30 px-1 py-0.5 rounded text-danger font-mono text-sm">0x00...00</code>),
                                those funds are lost forever. This is known as "burning" tokens.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 pt-2">
                                <Button
                                    variant="danger"
                                    onClick={handleMistakeDemo}
                                    className="bg-danger hover:bg-danger-hover text-white shadow-lg shadow-danger/20"
                                    disabled={mistakeTxStatus === 'pending'}
                                >
                                    {mistakeTxStatus === 'pending' ? 'Sending to Void...' : 'Send 5 TKN to The Void'}
                                </Button>
                            </div>
                            {mistakeTxStatus === 'pending' && (
                                <p className="text-sm text-warning animate-pulse">
                                    ⚠️ Transaction is pending. Mine a block to confirm its fate.
                                </p>
                            )}
                        </div>

                        <div className="bg-black/20 rounded-xl p-6 border border-border/30 backdrop-blur-sm">
                             <AnimatePresence mode="wait">
                                 {mistakeTxStatus === 'confirmed' ? (
                                     <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="text-center space-y-4"
                                     >
                                         <div className="w-16 h-16 bg-danger/20 rounded-full flex items-center justify-center mx-auto text-danger mb-4">
                                             <AlertTriangle className="w-8 h-8" />
                                         </div>
                                         <h3 className="text-xl font-bold text-text-primary">Funds Lost Forever</h3>
                                         <p className="text-sm text-text-secondary">
                                             Those coins are gone forever. No one controls that address.
                                             In real Bitcoin, millions of dollars have been lost this way.
                                             This is the cost of having no central authority.
                                         </p>
                                     </motion.div>
                                 ) : (
                                     <div className="text-center text-text-tertiary py-8">
                                         <p className="mb-2">Status Monitor</p>
                                         <div className="text-4xl font-mono opacity-20">0x00...00</div>
                                     </div>
                                 )}
                             </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </section>

      </div>
    </ModuleLayout>
  );
};

export default M05_Tokens;
