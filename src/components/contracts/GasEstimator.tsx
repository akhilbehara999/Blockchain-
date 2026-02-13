import React from 'react';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { Fuel, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface GasEstimatorProps {
  estimatedGas: number;
  userLimit: number;
  onLimitChange: (limit: number) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

const GasEstimator: React.FC<GasEstimatorProps> = ({
  estimatedGas,
  userLimit,
  onLimitChange,
  onConfirm,
  onCancel
}) => {
  const recommendedLimit = Math.ceil(estimatedGas * 1.3);
  const isTooLow = userLimit < estimatedGas;
  const isRisky = userLimit < recommendedLimit && !isTooLow;

  return (
    <Card className="max-w-md w-full mx-auto shadow-2xl border-accent/20 bg-secondary-bg/95 backdrop-blur-xl">
      <div className="flex justify-between items-start mb-6 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-accent/10 rounded-lg text-accent">
            <Fuel className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-text-primary">Gas Estimation</h3>
            <p className="text-xs text-text-secondary">Confirm transaction cost</p>
          </div>
        </div>
        <button onClick={onCancel} className="text-text-tertiary hover:text-text-primary transition-colors">
            <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-6">
        <div className="bg-tertiary-bg/50 p-4 rounded-xl border border-tertiary-bg">
            <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-text-secondary">Estimated Gas:</span>
                <span className="text-lg font-mono font-bold text-text-primary">{estimatedGas.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
                <span className="text-xs text-text-tertiary">Recommended Limit (+30%):</span>
                <span className="text-sm font-mono text-success">{recommendedLimit.toLocaleString()}</span>
            </div>
        </div>

        <div className="space-y-2">
            <Input
                label="Gas Limit"
                type="number"
                value={userLimit}
                onChange={(e) => onLimitChange(parseInt(e.target.value) || 0)}
                error={isTooLow ? "Limit is below estimated gas!" : undefined}
                containerClassName="!mb-0"
                variant="monospace"
            />

            <AnimatePresence>
                {isRisky && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-start gap-2 text-warning text-xs mt-2 px-1 overflow-hidden"
                    >
                        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                        <span>Warning: Limit is below recommended buffer. Execution might fail if costs fluctuate.</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>

        <div className="pt-2 flex gap-3">
            <Button
                variant="ghost"
                onClick={onCancel}
                className="flex-1"
            >
                Cancel
            </Button>
            <Button
                variant={isTooLow ? "danger" : "primary"}
                onClick={onConfirm}
                className="flex-1"
                leftIcon={isTooLow ? <AlertTriangle className="w-4 h-4"/> : <CheckCircle className="w-4 h-4"/>}
            >
                {isTooLow ? "Risk Fail" : "Confirm"}
            </Button>
        </div>
      </div>
    </Card>
  );
};

export default GasEstimator;
