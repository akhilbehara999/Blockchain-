import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const variants = {
    top: { initial: { y: 5, x: "-50%", opacity: 0, scale: 0.9 }, animate: { y: -8, x: "-50%", opacity: 1, scale: 1 } },
    bottom: { initial: { y: -5, x: "-50%", opacity: 0, scale: 0.9 }, animate: { y: 8, x: "-50%", opacity: 1, scale: 1 } },
    left: { initial: { x: 5, y: "-50%", opacity: 0, scale: 0.9 }, animate: { x: -8, y: "-50%", opacity: 1, scale: 1 } },
    right: { initial: { x: -5, y: "-50%", opacity: 0, scale: 0.9 }, animate: { x: 8, y: "-50%", opacity: 1, scale: 1 } },
  };

  const staticStyles = {
      top: "bottom-full left-1/2",
      bottom: "top-full left-1/2",
      left: "right-full top-1/2",
      right: "left-full top-1/2",
  };

  return (
    <div
      className={`relative inline-flex ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={variants[position].initial}
            animate={variants[position].animate}
            exit={variants[position].initial}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className={`absolute z-50 px-3 py-1.5 text-xs font-medium text-text-primary bg-tertiary-bg/90 backdrop-blur-md border border-border rounded-lg whitespace-nowrap shadow-xl ${staticStyles[position]}`}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Tooltip;
