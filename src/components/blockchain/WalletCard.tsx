import React, { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { Coins, Send } from 'lucide-react';
import { Wallet } from '../../engine/types';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface WalletCardProps {
  wallet: Wallet;
  onSend: () => void;
}

const WalletCard: React.FC<WalletCardProps> = ({ wallet, onSend }) => {
  const [displayBalance, setDisplayBalance] = useState(wallet.balance);
  const balanceSpring = useSpring(wallet.balance, { stiffness: 50, damping: 20 });
  const balanceDisplay = useTransform(balanceSpring, (current) => Math.round(current));

  useEffect(() => {
    balanceSpring.set(wallet.balance);
  }, [wallet.balance, balanceSpring]);

  useEffect(() => {
    return balanceDisplay.on('change', (latest) => {
      setDisplayBalance(latest);
    });
  }, [balanceDisplay]);

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="relative group min-w-[280px]"
    >
      <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl opacity-0 group-hover:opacity-100 transition duration-500 blur" />
      <Card className="relative h-full flex flex-col justify-between bg-secondary-bg">
        <div>
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-bold text-text-primary">{wallet.name}</h3>
              <p className="text-xs font-mono text-text-tertiary mt-1 bg-tertiary-bg px-2 py-1 rounded w-fit">
                {wallet.publicKey.substring(0, 8)}...{wallet.publicKey.substring(wallet.publicKey.length - 4)}
              </p>
            </div>
            <div className="p-2 bg-accent/10 rounded-full">
              <Coins className="w-6 h-6 text-accent" />
            </div>
          </div>

          <div className="mt-6 mb-2">
            <p className="text-sm text-text-secondary">Balance</p>
            <div className="flex items-baseline gap-1">
              <motion.span className="text-3xl font-bold text-text-primary">
                {displayBalance}
              </motion.span>
              <span className="text-sm text-text-secondary font-medium">TKN</span>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <Button
            onClick={onSend}
            variant="secondary"
            className="w-full justify-between group-hover:border-accent/50 group-hover:text-accent transition-colors"
          >
            <span>Send Tokens</span>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};

export default WalletCard;
