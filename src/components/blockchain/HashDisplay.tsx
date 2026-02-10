import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface HashDisplayProps {
  hash: string;
  previousHash?: string;
  animate?: boolean;
}

const HashDisplay: React.FC<HashDisplayProps> = ({ hash, previousHash, animate = false }) => {
  return (
    <div className="font-mono text-sm break-all bg-tertiary-bg p-4 rounded-xl border border-border/50 shadow-inner">
      <div className="flex flex-wrap">
        <AnimatePresence mode="popLayout">
          {hash.split('').map((char, index) => {
            const isDifferent = previousHash && previousHash[index] !== char;

            // If animating, use motion.span
            if (animate) {
              return (
                <motion.span
                  key={`${index}-${char}`} // Force re-render on char change for animation
                  initial={{ opacity: 0, y: 5, color: '#6366F1' }} // Start indigo
                  animate={{
                    opacity: 1,
                    y: 0,
                    color: isDifferent ? '#6366F1' : '#94A3B8' // End color: Accent if different, standard text otherwise (slate-400 is close to text-secondary, maybe use text-primary #F8FAFC)
                  }}
                  transition={{
                    duration: 0.2,
                    delay: index * 0.005 // Stagger effect
                  }}
                  className={`inline-block ${isDifferent ? 'font-bold' : ''}`}
                >
                  {char}
                </motion.span>
              );
            }

            // If not animating, just highlight diffs
            return (
              <span
                key={index}
                className={`${isDifferent ? 'text-accent font-bold' : 'text-text-secondary'}`}
              >
                {char}
              </span>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default HashDisplay;
