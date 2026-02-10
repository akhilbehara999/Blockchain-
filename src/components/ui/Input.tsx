import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  variant?: 'default' | 'monospace';
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  variant = 'default',
  className = '',
  value,
  onFocus,
  onBlur,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = value !== '' && value !== undefined;

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  return (
    <div className="relative mb-6 pt-2">
      <motion.div
        animate={error ? { x: [-5, 5, -5, 5, 0] } : {}}
        transition={{ duration: 0.4 }}
        className="relative"
      >
        <input
          {...props}
          value={value}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={`
            w-full px-4 py-3 rounded-xl bg-tertiary-bg border-2 outline-none transition-colors
            ${error ? 'border-danger focus:border-danger' : 'border-border focus:border-accent'}
            ${variant === 'monospace' ? 'font-mono' : 'font-sans'}
            text-text-primary placeholder-transparent
            ${className}
          `}
          placeholder={label}
        />
        <motion.label
          initial={false}
          animate={{
            y: isFocused || hasValue ? -28 : 14,
            x: isFocused || hasValue ? 0 : 0,
            scale: isFocused || hasValue ? 0.85 : 1,
            color: error ? '#EF4444' : isFocused ? '#6366F1' : '#94A3B8'
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="absolute left-4 top-0 pointer-events-none origin-left"
        >
          {label}
        </motion.label>
      </motion.div>
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-danger text-xs mt-1 ml-1 absolute"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Input;
