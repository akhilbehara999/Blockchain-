import React from 'react';
import { motion } from 'framer-motion';

interface ProgressBarProps {
  value: number; // 0-100
  variant?: 'default' | 'gradient' | 'striped';
  color?: 'brand' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  label?: string;
  showPercentage?: boolean;
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  variant = 'default',
  color = 'brand',
  size = 'md',
  animated = true,
  label,
  showPercentage = false,
  className = '',
}) => {
  const getColors = () => {
    if (variant === 'gradient') {
      switch (color) {
        case 'brand': return 'bg-gradient-to-r from-brand-400 to-brand-600';
        case 'success': return 'bg-gradient-to-r from-emerald-400 to-emerald-600';
        case 'warning': return 'bg-gradient-to-r from-amber-400 to-amber-600';
        case 'error': return 'bg-gradient-to-r from-red-400 to-red-600';
        default: return 'bg-gradient-to-r from-brand-400 to-brand-600';
      }
    }

    switch (color) {
      case 'brand': return 'bg-brand-500';
      case 'success': return 'bg-status-valid';
      case 'warning': return 'bg-status-warning';
      case 'error': return 'bg-status-error';
      default: return 'bg-brand-500';
    }
  };

  const getHeight = () => {
    switch (size) {
      case 'sm': return 'h-1.5';
      case 'md': return 'h-2.5';
      case 'lg': return 'h-4';
      default: return 'h-2.5';
    }
  };

  const stripedStyles = variant === 'striped'
    ? 'bg-[length:1rem_1rem] bg-gradient-to-r from-transparent via-white/20 to-transparent'
    : '';

  return (
    <div className={`w-full ${className}`}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>}
          {showPercentage && <span className="text-sm font-mono text-gray-900 dark:text-gray-100">{Math.round(value)}%</span>}
        </div>
      )}
      <div className={`w-full bg-surface-tertiary dark:bg-surface-dark-tertiary rounded-full overflow-hidden ${getHeight()}`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, Math.max(0, value))}%` }}
          transition={animated ? { duration: 0.5, ease: "easeOut" } : { duration: 0 }}
          className={`h-full rounded-full ${getColors()} ${stripedStyles} ${variant === 'striped' && animated ? 'animate-pulse' : ''}`}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
