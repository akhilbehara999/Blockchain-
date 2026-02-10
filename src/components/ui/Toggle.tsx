import React from 'react';
import { motion } from 'framer-motion';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  className?: string;
}

const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  label,
  className = '',
}) => {
  return (
    <div className={`flex items-center space-x-3 cursor-pointer ${className}`} onClick={() => onChange(!checked)}>
      <div
        className={`
          w-12 h-7 rounded-full p-1 transition-colors duration-300
          ${checked ? 'bg-accent' : 'bg-tertiary-bg'}
        `}
      >
        <motion.div
          className="w-5 h-5 bg-white rounded-full shadow-md"
          animate={{ x: checked ? 20 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </div>
      {label && <span className="text-sm font-medium text-text-primary">{label}</span>}
    </div>
  );
};

export default Toggle;
