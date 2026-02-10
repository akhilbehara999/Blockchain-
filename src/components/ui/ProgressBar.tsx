import React from 'react';
import { motion } from 'framer-motion';

interface ProgressBarProps {
  value: number; // 0 to 100
  color?: 'accent' | 'success' | 'danger';
  label?: string;
  showPercentage?: boolean;
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  color = 'accent',
  label,
  showPercentage = false,
  className = '',
}) => {
  const colors = {
    accent: 'bg-accent',
    success: 'bg-success',
    danger: 'bg-danger',
  };

  return (
    <div className={`w-full ${className}`}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-2">
          {label && <span className="text-sm font-medium text-text-secondary">{label}</span>}
          {showPercentage && <span className="text-sm font-mono text-text-primary">{Math.round(value)}%</span>}
        </div>
      )}
      <div className="w-full h-2 bg-tertiary-bg rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, Math.max(0, value))}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className={`h-full ${colors[color]}`}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
