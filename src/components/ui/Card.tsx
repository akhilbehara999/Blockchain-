import React from 'react';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'glass' | 'outlined' | 'elevated';
  status?: 'valid' | 'warning' | 'error' | 'locked' | 'info';
  hoverable?: boolean;
  className?: string;
  onClick?: () => void;
  title?: React.ReactNode; // Keeping title prop for backward compatibility if needed, though plan didn't explicitly ask for it, existing code used it.
}

const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  status,
  hoverable = false,
  className = '',
  onClick,
  title,
}) => {
  const baseStyles = 'rounded-2xl p-6 transition-all duration-200';

  const variants = {
    default: 'bg-surface-primary dark:bg-surface-dark-secondary shadow-card border border-surface-border dark:border-surface-dark-border',
    glass: 'bg-white/60 dark:bg-black/60 backdrop-blur-lg border border-white/20 dark:border-white/10',
    outlined: 'bg-transparent border-2 border-surface-border dark:border-surface-dark-border',
    elevated: 'bg-surface-primary dark:bg-surface-dark-secondary shadow-card-hover',
  };

  const statusStyles = {
    valid: 'border-l-4 border-l-status-valid',
    warning: 'border-l-4 border-l-status-warning',
    error: 'border-l-4 border-l-status-error',
    locked: 'border-l-4 border-l-status-locked',
    info: 'border-l-4 border-l-status-info',
  };

  const hoverStyles = hoverable
    ? 'cursor-pointer hover:shadow-card-hover hover:-translate-y-0.5'
    : '';

  const classes = [
    baseStyles,
    variants[variant],
    status ? statusStyles[status] : '',
    hoverStyles,
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} onClick={onClick}>
       {title && (
        <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">{title}</h3>
      )}
      {children}
    </div>
  );
};

export default Card;
