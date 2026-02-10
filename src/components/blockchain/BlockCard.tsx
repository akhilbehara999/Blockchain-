import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Block } from '../../engine/types';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import HashDisplay from './HashDisplay';
import NonceCounter from './NonceCounter';
import MiningAnimation from './MiningAnimation';
import { Hammer } from 'lucide-react';

interface BlockCardProps {
  block: Block;
  editable: boolean;
  onDataChange?: (newData: string) => void;
  onMine?: () => void;
  showAnatomy?: boolean;
  status: 'valid' | 'invalid' | 'mining' | 'neutral';
  delay?: number;
}

const AnatomyTooltip: React.FC<{ label: string; description: string; className?: string }> = ({ label, description, className }) => (
  <motion.div
    initial={{ opacity: 0, y: 10, scale: 0.9 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: 10, scale: 0.9 }}
    className={`absolute z-30 pointer-events-none ${className}`}
  >
    <div className="bg-tertiary-bg/95 backdrop-blur-md border border-accent/30 text-text-primary px-3 py-2 rounded-lg shadow-xl max-w-[200px]">
        <div className="font-bold text-xs uppercase mb-1 text-accent">{label}</div>
        <div className="text-xs text-text-secondary leading-tight">{description}</div>
    </div>
  </motion.div>
);

const BlockCard: React.FC<BlockCardProps> = ({
  block,
  editable,
  onDataChange,
  onMine,
  showAnatomy,
  status,
  delay,
}) => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [prevStatus, setPrevStatus] = useState(status);

  useEffect(() => {
    if (prevStatus === 'mining' && status === 'valid') {
      setShowSuccess(true);
    }
    setPrevStatus(status);
  }, [status, prevStatus]);

  const getBorderColor = () => {
    switch (status) {
      case 'valid': return 'border-l-success';
      case 'invalid': return 'border-l-danger';
      case 'mining': return 'border-l-warning';
      default: return 'border-l-border';
    }
  };

  const getStatusColor = () => {
     switch (status) {
      case 'valid': return 'success';
      case 'invalid': return 'danger';
      case 'mining': return 'warning';
      default: return 'neutral';
    }
  }

  return (
    <div className="relative group">
      <motion.div
        animate={{ x: status === 'invalid' && prevStatus !== 'invalid' ? [0, -5, 5, -5, 5, 0] : 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card
          className={`transition-all duration-300 border-l-4 ${getBorderColor()}`}
          style={{ transitionDelay: `${delay || 0}ms` }}
        >
            <div className="space-y-4 relative">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div className="relative">
                        <Badge variant="neutral">Block #{block.index}</Badge>
                        <AnimatePresence>
                            {showAnatomy && (
                                <AnatomyTooltip
                                    label="Index"
                                    description="The block's position in the chain"
                                    className="-top-14 left-0"
                                />
                            )}
                        </AnimatePresence>
                    </div>
                    <div className="relative">
                         <span className="text-xs text-text-secondary font-mono">
                            {new Date(block.timestamp).toLocaleTimeString()}
                        </span>
                        <AnimatePresence>
                            {showAnatomy && (
                                <AnatomyTooltip
                                    label="Timestamp"
                                    description="When this block was created"
                                    className="-top-14 right-0"
                                />
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Previous Hash */}
                <div className="space-y-1 relative">
                    <label className="text-xs font-medium text-text-secondary uppercase">Previous Hash</label>
                    <div className="font-mono text-xs text-text-secondary bg-tertiary-bg p-2 rounded truncate border border-border/50">
                        {block.previousHash}
                    </div>
                    <AnimatePresence>
                            {showAnatomy && (
                                <AnatomyTooltip
                                    label="Previous Hash"
                                    description="The fingerprint of the block before this one"
                                    className="top-full left-0 mt-2"
                                />
                            )}
                    </AnimatePresence>
                </div>

                {/* Data */}
                <div className="space-y-1 relative">
                    <label className="text-xs font-medium text-text-secondary uppercase">Data</label>
                    <textarea
                        value={block.data}
                        onChange={(e) => onDataChange && onDataChange(e.target.value)}
                        readOnly={!editable}
                        className={`w-full bg-tertiary-bg rounded-lg p-3 text-sm font-mono border ${
                            editable ? 'border-border focus:border-accent focus:ring-1 focus:ring-accent' : 'border-border/50'
                        } outline-none transition-all resize-none h-24`}
                    />
                    <AnimatePresence>
                            {showAnatomy && (
                                <AnatomyTooltip
                                    label="Data"
                                    description="The transactions or information stored in this block"
                                    className="top-1/2 right-0 translate-x-[105%] -translate-y-1/2 w-48"
                                />
                            )}
                    </AnimatePresence>
                </div>

                {/* Nonce */}
                <div className="flex items-center justify-between relative">
                    <div className="space-y-1 relative">
                        <label className="text-xs font-medium text-text-secondary uppercase">Nonce</label>
                        <NonceCounter nonce={block.nonce} isMining={status === 'mining'} />
                         <AnimatePresence>
                            {showAnatomy && (
                                <AnatomyTooltip
                                    label="Nonce"
                                    description="The number miners change to find a valid hash"
                                    className="top-full left-0 mt-2 w-48"
                                />
                            )}
                        </AnimatePresence>
                    </div>

                    {status === 'invalid' && onMine && (
                        <Button
                            onClick={onMine}
                            variant="primary"
                            className="flex items-center gap-2"
                        >
                        <Hammer className="w-4 h-4" />
                            Mine
                        </Button>
                    )}
                </div>

                {/* Hash */}
                <div className="space-y-1 relative pt-2">
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-medium text-text-secondary uppercase">Hash</label>
                        <Badge variant={getStatusColor()}>{status.toUpperCase()}</Badge>
                    </div>
                    <HashDisplay hash={block.hash} animate={true} />
                    <AnimatePresence>
                            {showAnatomy && (
                                <AnatomyTooltip
                                    label="Hash"
                                    description="This block's unique fingerprint"
                                    className="bottom-full right-0 mb-2 w-48"
                                />
                            )}
                    </AnimatePresence>
                </div>
            </div>
        </Card>
      </motion.div>
      <AnimatePresence>
        {showSuccess && <MiningAnimation onComplete={() => setShowSuccess(false)} />}
      </AnimatePresence>
    </div>
  );
};

export default BlockCard;
