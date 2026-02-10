import React from 'react';
import { motion } from 'framer-motion';
import Badge from '../ui/Badge';

interface PeerNodeProps {
  name: string;
  status: 'valid' | 'invalid' | 'syncing';
  isActive: boolean;
  chainLength: number;
}

const PeerNode: React.FC<PeerNodeProps> = ({ name, status, isActive, chainLength }) => {
  const getBorderColor = () => {
    switch (status) {
      case 'valid': return 'border-success';
      case 'invalid': return 'border-danger';
      case 'syncing': return 'border-warning';
      default: return 'border-border';
    }
  };

  const getGlowColor = () => {
    switch (status) {
      case 'valid': return 'rgba(34, 197, 94, 0.5)';
      case 'invalid': return 'rgba(239, 68, 68, 0.5)';
      case 'syncing': return 'rgba(234, 179, 8, 0.5)';
      default: return 'rgba(99, 102, 241, 0.5)';
    }
  };

  return (
    <div className="flex flex-col items-center gap-2 relative z-10">
      <motion.div
        className={`relative w-16 h-16 rounded-full border-4 flex items-center justify-center bg-secondary-bg text-xl font-bold text-text-primary ${getBorderColor()}`}
        animate={isActive ? {
          boxShadow: `0 0 20px ${getGlowColor()}`,
          scale: [1, 1.05, 1],
        } : {
          boxShadow: '0 0 0px rgba(0,0,0,0)',
          scale: 1
        }}
        transition={isActive ? {
          duration: 1.5,
          repeat: Infinity,
          repeatType: "reverse"
        } : { duration: 0.3 }}
      >
        {name.charAt(0).toUpperCase()}

        {/* Chain length badge */}
        <div className="absolute -bottom-2 -right-2">
            <Badge variant="neutral" className="text-[10px] px-1.5 py-0.5 min-w-[20px] text-center">{chainLength}</Badge>
        </div>
      </motion.div>
      <div className="text-sm font-medium text-text-secondary">{name}</div>
    </div>
  );
};

export default PeerNode;
