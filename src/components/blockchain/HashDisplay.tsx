import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface HashDisplayProps {
  hash: string;
  previousHash?: string;
  animate?: boolean;
  highlightLeadingZeros?: boolean;
}

const HashDisplay: React.FC<HashDisplayProps> = ({
  hash,
  previousHash,
  animate = false,
  highlightLeadingZeros = false
}) => {
  const leadingZeroCount = highlightLeadingZeros ? (hash.match(/^0*/) || [''])[0].length : 0;

  return (
    <div className="font-mono text-sm break-all bg-tertiary-bg p-4 rounded-xl border border-border/50 shadow-inner">
      <div className="flex flex-wrap">
        <AnimatePresence mode="popLayout">
          {hash.split('').map((char, index) => {
            const isDifferent = previousHash && previousHash[index] !== char;
            const isLeadingZero = highlightLeadingZeros && index < leadingZeroCount;

            let color = '#94A3B8'; // default text-secondary (slate-400)
            let className = 'text-text-secondary';

            if (isLeadingZero) {
              color = '#22C55E'; // success (green-500)
              className = 'text-success font-bold';
            } else if (isDifferent) {
              color = '#6366F1'; // accent (indigo-500)
              className = 'text-accent font-bold';
            }

            // If animating, use motion.span
            if (animate) {
              return (
                <motion.span
                  key={`${index}-${char}`} // Force re-render on char change for animation
                  initial={{ opacity: 0, y: 5, color: '#6366F1' }} // Start indigo
                  animate={{
                    opacity: 1,
                    y: 0,
                    color: color
                  }}
                  transition={{
                    duration: 0.2,
                    delay: index * 0.005 // Stagger effect
                  }}
                  className={`inline-block ${isLeadingZero || isDifferent ? 'font-bold' : ''}`}
                >
                  {char}
                </motion.span>
              );
            }

            // If not animating, just highlight diffs or leading zeros
            return (
              <span
                key={index}
                className={className}
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
