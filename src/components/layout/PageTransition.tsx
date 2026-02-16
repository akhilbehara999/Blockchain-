import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface PageTransitionProps {
  children: ReactNode;
  mode?: 'fade' | 'slide';
}

const PageTransition: React.FC<PageTransitionProps> = ({ children, mode = 'fade' }) => {
  const variants = {
    fade: {
      initial: { opacity: 0, scale: 0.98 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.98 },
    },
    slide: {
      initial: { opacity: 0, x: 20 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -20 },
    }
  };

  return (
    <motion.div
      initial={variants[mode].initial}
      animate={variants[mode].animate}
      exit={variants[mode].exit}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="w-full h-full"
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
