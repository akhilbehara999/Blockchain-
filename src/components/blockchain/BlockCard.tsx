import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Block } from '../../engine/types';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import HashDisplay from './HashDisplay';
import NonceCounter from './NonceCounter';
import MiningAnimation from './MiningAnimation';
import { Hammer, Lock } from 'lucide-react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

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
  const shouldReduceMotion = useReducedMotion();

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

  const confirmations = block.confirmations ?? 0;
  const isFinalized = confirmations >= 6;
  const isEditable = editable && !isFinalized;

  const getConfirmationStyles = () => {
    if (status !== 'valid') return '';

    // Note: We enforce dark text (!text-gray-900) because the requested background colors
    // (bg-*-100) are light, which would cause contrast issues with dark mode text colors.
    if (confirmations >= 6) return '!bg-gray-100 !border-gray-400 !text-gray-900';
    if (confirmations >= 3) return '!bg-green-100 !border-green-400 !text-gray-900';
    if (confirmations >= 1) return '!bg-yellow-100 !border-yellow-400 !text-gray-900';
    return '!bg-red-100 !border-red-400 !text-gray-900';
  };

  const getConfirmationLabel = () => {
     if (confirmations >= 6) return 'Finalized';
     if (confirmations >= 3) return 'Confirmed';
     if (confirmations >= 1) return 'Weak';
     return 'Unconfirmed';
  };

  return (
    <div className="relative group" role="region" aria-label={`Block number ${block.index}, status: ${status}`}>
      <motion.div
        animate={{ x: !shouldReduceMotion && status === 'invalid' && prevStatus !== 'invalid' ? [0, -5, 5, -5, 5, 0] : 0 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.4 }}
      >
        <Card
          className={`transition-colors duration-500 border-l-4 ${getBorderColor()} ${getConfirmationStyles()}`}
          style={{ transitionDelay: shouldReduceMotion ? '0ms' : `${delay || 0}ms` }}
        >
            <div className="space-y-4 relative">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div className="relative flex items-center gap-2">
                        <Badge variant="neutral">Block #{block.index}</Badge>
                        {status === 'valid' && (
                            <div
                              className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-white/50 border border-black/5 cursor-help"
                              title={`${confirmations} confirmations. ${getConfirmationLabel()} status.`}
                            >
                                {isFinalized && <Lock className="w-3 h-3 text-text-secondary" />}
                                <span className="text-text-secondary">{confirmations} conf.</span>
                            </div>
                        )}
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
                    <div className="flex justify-between items-center">
                        <label htmlFor={`block-${block.index}-data`} className="text-xs font-medium text-text-secondary uppercase">Data</label>
                        {isFinalized && status === 'valid' && (
                            <span className="text-[10px] text-text-secondary flex items-center gap-1">
                                <Lock className="w-3 h-3" />
                                This block is immutable (6+ confirmations)
                            </span>
                        )}
                    </div>
                    <textarea
                        id={`block-${block.index}-data`}
                        aria-label={`Data for block ${block.index}`}
                        value={block.data}
                        onChange={(e) => onDataChange && onDataChange(e.target.value)}
                        readOnly={!isEditable}
                        className={`w-full bg-tertiary-bg rounded-lg p-3 text-sm font-mono border ${
                            isEditable ? 'border-border focus:border-accent focus:ring-1 focus:ring-accent' : 'border-border/50 opacity-70 cursor-not-allowed'
                        } outline-none transition-all resize-none h-24`}
                    />
                    <AnimatePresence>
                            {showAnatomy && (
                                <AnatomyTooltip
                                    label="Data"
                                    description="The transactions or information stored in this block"
                                    className="top-full left-0 mt-2 lg:top-1/2 lg:right-0 lg:translate-x-[105%] lg:-translate-y-1/2 lg:left-auto lg:mt-0 w-48"
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
                            aria-label={`Mine block number ${block.index}`}
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
