import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Hammer, Clock, ArrowRight, Zap, TrendingUp } from 'lucide-react';
import { Transaction, Wallet } from '../../engine/types';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { useWalletStore } from '../../stores/useWalletStore';
import { FEE_LEVELS } from '../../engine/transaction';

interface MempoolViewProps {
  transactions: Transaction[];
  onMineBlock: () => void;
  wallets: Wallet[];
}

const MempoolView: React.FC<MempoolViewProps> = ({ transactions, onMineBlock, wallets }) => {
  const { speedUpTransaction } = useWalletStore();

  const isUserTransaction = (tx: Transaction) => {
      return wallets.some(w => w.publicKey === tx.from);
  };

  const handleSpeedUp = (tx: Transaction) => {
      // Increase fee to next level or +10%
      let newFee = (tx.fee || 0);
      if (newFee < FEE_LEVELS.STANDARD) newFee = FEE_LEVELS.STANDARD;
      else if (newFee < FEE_LEVELS.HIGH) newFee = FEE_LEVELS.HIGH;
      else newFee = newFee * 1.1; // 10% bump

      // Ensure at least some increase
      if (newFee <= (tx.fee || 0)) newFee = (tx.fee || 0) + 0.0001;

      speedUpTransaction(tx.signature, newFee);
  };

  const blockCapacity = 10;
  const inNextBlock = transactions.slice(0, blockCapacity);
  const inQueue = transactions.slice(blockCapacity);

  const maxFee = Math.max(...transactions.map(t => t.fee || 0), FEE_LEVELS.HIGH);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <div>
            <h3 className="text-xl font-bold text-text-primary flex items-center gap-2">
              <Clock className="w-5 h-5 text-warning" />
              Mempool <span className="text-sm font-normal text-text-secondary">({transactions.length} pending)</span>
            </h3>
            <p className="text-sm text-text-secondary">Transactions waiting to be included in the next block.</p>
        </div>

        <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
                <span className="text-xs text-text-secondary uppercase font-bold tracking-wider">Block Space</span>
                <div className="flex items-center gap-2">
                     <div className="w-32 h-2 bg-tertiary-bg rounded-full overflow-hidden">
                          <div
                              className={`h-full transition-all duration-500 ${inNextBlock.length >= blockCapacity ? 'bg-danger' : 'bg-success'}`}
                              style={{ width: `${Math.min((inNextBlock.length / blockCapacity) * 100, 100)}%` }}
                          />
                     </div>
                     <span className="text-sm font-mono font-bold">{inNextBlock.length}/{blockCapacity}</span>
                </div>
            </div>

            <Button
              onClick={onMineBlock}
              disabled={transactions.length === 0}
              variant="primary"
              className="bg-gradient-to-r from-amber-500 to-orange-600 shadow-orange-500/25 whitespace-nowrap"
            >
              <Hammer className="w-4 h-4 mr-2" />
              Mine Block
            </Button>
        </div>
      </div>

      {/* Fee Market Visualization */}
      {transactions.length > 0 && (
          <div className="bg-secondary-bg/30 p-4 rounded-xl border border-border/50">
               <h4 className="text-sm font-bold text-text-secondary mb-3 flex items-center gap-2">
                   <TrendingUp className="w-4 h-4" />
                   Fee Market
               </h4>
               <div className="flex items-end gap-1 h-24 w-full overflow-x-auto pb-1">
                   {transactions.map((tx, i) => {
                       const height = ((tx.fee || 0) / maxFee) * 100;
                       const isNext = i < blockCapacity;
                       return (
                           <div key={tx.signature} className="flex-1 min-w-[4px] max-w-[12px] group relative">
                                <div
                                    className={`w-full rounded-t-sm transition-all hover:opacity-80 ${isNext ? 'bg-accent' : 'bg-text-tertiary'}`}
                                    style={{ height: `${Math.max(height, 5)}%` }}
                                />
                                {/* Tooltip */}
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block z-10 bg-black/90 text-white text-[10px] p-1 rounded whitespace-nowrap">
                                    {(tx.fee || 0).toFixed(4)}
                                </div>
                           </div>
                       );
                   })}
               </div>
               <div className="flex justify-between text-[10px] text-text-tertiary mt-1 border-t border-border/30 pt-1">
                   <span>Highest Fee: {transactions[0]?.fee?.toFixed(4)}</span>
                   <span>Lowest Fee: {transactions[transactions.length-1]?.fee?.toFixed(4)}</span>
               </div>
          </div>
      )}

      {/* Next Block Section */}
      <div className="space-y-3">
          <h4 className="text-sm uppercase text-accent font-bold tracking-wider flex items-center gap-2">
              In Next Block <span className="text-xs font-normal text-text-tertiary">({inNextBlock.length})</span>
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
             <AnimatePresence mode="popLayout">
                 {inNextBlock.map((tx, index) => (
                    <TxCard
                        key={tx.signature}
                        tx={tx}
                        index={index}
                        wallets={wallets}
                        isUser={isUserTransaction(tx)}
                        onSpeedUp={() => handleSpeedUp(tx)}
                        status="next"
                    />
                 ))}
                 {inNextBlock.length === 0 && (
                     <p className="text-text-tertiary text-sm col-span-full italic">Waiting for transactions...</p>
                 )}
             </AnimatePresence>
          </div>
      </div>

      {/* Queue Section */}
      {inQueue.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-border/50">
              <h4 className="text-sm uppercase text-text-tertiary font-bold tracking-wider flex items-center gap-2">
                  Queued <span className="text-xs font-normal opacity-70">({inQueue.length})</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 opacity-70 hover:opacity-100 transition-opacity">
                 <AnimatePresence mode="popLayout">
                     {inQueue.map((tx, index) => (
                        <TxCard
                            key={tx.signature}
                            tx={tx}
                            index={index + blockCapacity}
                            wallets={wallets}
                            isUser={isUserTransaction(tx)}
                            onSpeedUp={() => handleSpeedUp(tx)}
                            status="queued"
                        />
                     ))}
                 </AnimatePresence>
              </div>
          </div>
      )}
    </div>
  );
};

const TxCard: React.FC<{
    tx: Transaction;
    index: number;
    wallets: Wallet[];
    isUser: boolean;
    onSpeedUp: () => void;
    status: 'next' | 'queued';
}> = ({ tx, index, wallets, isUser, onSpeedUp, status }) => {

  const getWalletName = (publicKey: string) => {
    const wallet = wallets.find(w => w.publicKey === publicKey);
    return wallet ? wallet.name : publicKey.substring(0, 8);
  };

  return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
      >
        <Card
          className={`!p-3 relative overflow-hidden ${isUser ? 'border-accent/50 bg-accent/5' : 'bg-secondary-bg/90'}`}
        >
          {isUser && <div className="absolute top-0 right-0 w-2 h-2 bg-accent rounded-bl-md" />}

          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs text-text-tertiary">
              <span className="font-mono">#{index + 1}</span>
              <span className="font-mono bg-tertiary-bg px-1 rounded text-[10px]">Fee: {tx.fee?.toFixed(4)}</span>
            </div>

            <div className="flex items-center justify-between font-medium text-text-primary text-sm">
              <span className="truncate max-w-[80px]">{getWalletName(tx.from)}</span>
              <ArrowRight className="w-3 h-3 text-text-secondary mx-1" />
              <span className="truncate max-w-[80px]">{getWalletName(tx.to)}</span>
            </div>

            <div className="mt-1 pt-2 border-t border-border/50 flex justify-between items-center">
              <span className="font-bold text-accent">{tx.amount} TKN</span>

              {isUser && status === 'queued' && (
                  <button
                      onClick={(e) => { e.stopPropagation(); onSpeedUp(); }}
                      className="flex items-center gap-1 text-[10px] bg-accent text-white px-2 py-0.5 rounded-full hover:bg-accent-hover transition-colors"
                  >
                      <Zap className="w-3 h-3" /> Speed Up
                  </button>
              )}
            </div>
          </div>
        </Card>
      </motion.div>
  );
};

export default MempoolView;
