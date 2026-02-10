import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface CardProps extends HTMLMotionProps<"div"> {
  status?: 'valid' | 'invalid' | 'mining' | 'neutral';
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({
  status = 'neutral',
  className = '',
  children,
  ...props
}) => {
  const statusColors = {
    valid: 'border-l-success',
    invalid: 'border-l-danger',
    mining: 'border-l-warning',
    neutral: 'border-l-border',
  };

  return (
    <motion.div
      whileHover={{ boxShadow: "0 0 15px rgba(99, 102, 241, 0.1)" }}
      className={`bg-secondary-bg/80 backdrop-blur-xl rounded-2xl border border-border border-l-4 p-6 ${statusColors[status]} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default Card;
