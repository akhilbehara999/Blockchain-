import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none min-h-[44px]';

  const variants = {
    primary: 'bg-brand-500 text-white hover:bg-brand-600 active:bg-brand-700 rounded-xl font-semibold shadow-glow-sm hover:shadow-glow',
    secondary: 'bg-surface-tertiary text-gray-700 dark:text-gray-200 dark:bg-surface-dark-tertiary hover:bg-surface-hover dark:hover:bg-surface-dark-hover rounded-xl',
    ghost: 'bg-transparent text-gray-600 dark:text-gray-400 hover:bg-surface-hover dark:hover:bg-surface-dark-hover rounded-xl',
    danger: 'bg-status-error text-white hover:bg-red-600 rounded-xl',
    success: 'bg-status-valid text-white hover:bg-emerald-600 rounded-xl',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-7 py-3.5 text-lg',
  };

  const widthStyles = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthStyles} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {!loading && icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};

export default Button;
