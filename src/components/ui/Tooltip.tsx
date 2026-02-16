import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
  delay?: number;
}

const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  className = '',
  delay = 300,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

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

  const arrowStyles = {
    top: "bottom-[-4px] left-1/2 -translate-x-1/2 border-t-gray-900",
    bottom: "top-[-4px] left-1/2 -translate-x-1/2 border-b-gray-900",
    left: "right-[-4px] top-1/2 -translate-y-1/2 border-l-gray-900",
    right: "left-[-4px] top-1/2 -translate-y-1/2 border-r-gray-900",
  };

  return (
    <div
      className={`relative inline-flex ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={variants[position].initial}
            animate={variants[position].animate}
            exit={variants[position].initial}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className={`absolute z-50 px-3 py-1.5 text-xs font-medium text-white bg-gray-900 rounded-lg whitespace-nowrap shadow-xl pointer-events-none ${staticStyles[position]}`}
          >
            {content}
            <div className={`absolute w-0 h-0 border-4 border-transparent ${arrowStyles[position]}`} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Tooltip;
