import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface CardProps extends Omit<HTMLMotionProps<"div">, "title"> {
  status?: 'valid' | 'invalid' | 'mining' | 'neutral';
  title?: React.ReactNode;
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({
  status = 'neutral',
  className = '',
  title,
  children,
  ...props
}) => {
  const shouldReduceMotion = useReducedMotion();

  const statusColors = {
    valid: 'border-l-success',
    invalid: 'border-l-danger',
    mining: 'border-l-warning',
    neutral: 'border-l-border',
  };

  return (
    <motion.div
      whileHover={shouldReduceMotion ? {} : { boxShadow: "0 0 15px rgba(99, 102, 241, 0.1)" }}
      transition={shouldReduceMotion ? { duration: 0 } : undefined}
      className={`bg-secondary-bg/80 backdrop-blur-xl rounded-2xl border border-border border-l-4 p-6 ${statusColors[status]} ${className}`}
      {...props}
    >
      {title && (
        <h3 className="text-lg font-bold mb-4 text-text-primary">{title}</h3>
      )}
      {children}
    </motion.div>
  );
};

export default Card;
