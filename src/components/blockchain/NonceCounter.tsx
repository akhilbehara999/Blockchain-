import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface NonceCounterProps {
  nonce: number;
  isMining: boolean;
}

const NonceCounter: React.FC<NonceCounterProps> = ({ nonce, isMining }) => {
  const [displayNonce, setDisplayNonce] = useState(nonce);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isMining) {
      interval = setInterval(() => {
        setDisplayNonce(Math.floor(Math.random() * 1000000));
      }, 80);
    } else {
      setDisplayNonce(nonce);
    }
    return () => clearInterval(interval);
  }, [isMining, nonce]);

  return (
    <div className="font-mono text-lg font-medium text-accent overflow-hidden h-10 flex items-center justify-center bg-tertiary-bg px-4 rounded-lg border border-border/50 shadow-inner min-w-[120px] relative">
       <AnimatePresence mode="popLayout">
        <motion.span
          key={displayNonce}
          initial={{ y: isMining ? 20 : 0, opacity: isMining ? 0 : 1 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: isMining ? -20 : 0, opacity: isMining ? 0 : 1 }}
          transition={{ duration: 0.1 }}
          className="block"
        >
          {displayNonce}
        </motion.span>
      </AnimatePresence>
    </div>
  );
};

export default NonceCounter;
