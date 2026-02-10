import React from 'react';
import { motion } from 'framer-motion';

interface ModuleHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
}

const ModuleHeader: React.FC<ModuleHeaderProps> = ({
  title,
  subtitle,
  className = '',
}) => {
  return (
    <div className={`mb-8 ${className}`}>
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 mb-2"
      >
        {title}
      </motion.h1>
      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-text-secondary text-lg"
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
};

export default ModuleHeader;
