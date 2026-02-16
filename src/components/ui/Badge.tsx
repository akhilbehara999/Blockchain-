import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md';
  pulse?: boolean;
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  pulse = false,
  className = '',
}) => {
  const variants = {
    default: 'bg-surface-tertiary text-gray-600 dark:bg-surface-dark-tertiary dark:text-gray-400 border border-surface-border dark:border-surface-dark-border',
    success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
    error: 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20',
    info: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
  };

  const pulseAnimation = pulse ? 'animate-pulse' : '';

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${variants[variant]} ${sizes[size]} ${pulseAnimation} ${className}`}
    >
      {pulse && (
        <span className={`mr-1.5 h-2 w-2 rounded-full ${variant === 'default' ? 'bg-gray-400' : variants[variant].split(' ')[1].replace('text-', 'bg-')}`} />
      )}
      {children}
    </span>
  );
};

export default Badge;
