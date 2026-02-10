import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Hammer, Clock, ArrowRight } from 'lucide-react';
import { Transaction, Wallet } from '../../engine/types';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface MempoolViewProps {
  transactions: Transaction[];
  onMineBlock: () => void;
  wallets: Wallet[];
}

const MempoolView: React.FC<MempoolViewProps> = ({ transactions, onMineBlock, wallets }) => {
  const getWalletName = (publicKey: string) => {
    const wallet = wallets.find(w => w.publicKey === publicKey);
    return wallet ? wallet.name : publicKey.substring(0, 8);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-text-primary flex items-center gap-2">
          <Clock className="w-5 h-5 text-warning" />
          Mempool <span className="text-sm font-normal text-text-secondary">({transactions.length} pending)</span>
        </h3>

        <Button
          onClick={onMineBlock}
          disabled={transactions.length === 0}
          variant="primary"
          className="bg-gradient-to-r from-amber-500 to-orange-600 shadow-orange-500/25"
        >
          <Hammer className="w-4 h-4 mr-2" />
          Mine Next Block
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 min-h-[100px]">
        <AnimatePresence mode="popLayout">
          {transactions.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="col-span-full flex flex-col items-center justify-center p-8 text-text-tertiary border-2 border-dashed border-border/50 rounded-xl"
            >
              <Clock className="w-8 h-8 mb-2 opacity-50" />
              <p>No pending transactions</p>
            </motion.div>
          ) : (
            transactions.map((tx, index) => (
              <motion.div
                key={`${tx.signature}-${index}`}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              >
                <Card
                  status="mining" // Amber border
                  className="!p-4 bg-secondary-bg/90"
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center text-xs text-text-tertiary">
                      <span className="font-mono">{new Date(tx.timestamp).toLocaleTimeString()}</span>
                      <span className="font-mono text-[10px] truncate max-w-[60px]">{tx.signature.substring(0, 8)}</span>
                    </div>

                    <div className="flex items-center justify-between font-medium text-text-primary">
                      <span className="truncate max-w-[80px]">{getWalletName(tx.from)}</span>
                      <ArrowRight className="w-3 h-3 text-text-secondary mx-1" />
                      <span className="truncate max-w-[80px]">{getWalletName(tx.to)}</span>
                    </div>

                    <div className="mt-1 pt-2 border-t border-border/50 flex justify-between items-center">
                      <span className="text-xs text-text-secondary">Amount</span>
                      <span className="font-bold text-accent">{tx.amount} TKN</span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MempoolView;
