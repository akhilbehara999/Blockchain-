import React from 'react';
import Card from '../ui/Card';
import { CheckCircle, XCircle, Loader2, AlertTriangle, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { VMStep, ExecutionResult } from '../../engine/types';

interface ExecutionViewerProps {
  steps: VMStep[];
  currentStepIndex: number;
  gasUsed: number;
  gasLimit: number;
  status: 'pending' | 'success' | 'failed';
  result?: ExecutionResult;
  error?: string;
  onClose?: () => void;
}

const ExecutionViewer: React.FC<ExecutionViewerProps> = ({
  steps,
  currentStepIndex,
  gasUsed,
  gasLimit,
  status,
  result,
  error,
  onClose
}) => {
  const gasPercentage = Math.min(100, (gasUsed / gasLimit) * 100);
  const isOutOfGas = result?.revertReason === 'Out of gas' || (status === 'failed' && gasUsed >= gasLimit);

  return (
    <Card className="max-w-md w-full mx-auto shadow-2xl border-accent/20 bg-secondary-bg/95 backdrop-blur-xl">
      <div className="flex justify-between items-start mb-6 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${status === 'failed' ? 'bg-danger/10 text-danger' : status === 'success' ? 'bg-success/10 text-success' : 'bg-accent/10 text-accent'}`}>
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-text-primary">Execution</h3>
            <p className="text-xs text-text-secondary">
                {status === 'pending' ? 'Processing transaction...' : status === 'success' ? 'Transaction Confirmed' : 'Transaction Failed'}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Gas Meter */}
        <div className="space-y-2">
            <div className="flex justify-between text-xs text-text-secondary">
                <span>Gas Used</span>
                <span>{gasUsed.toLocaleString()} / {gasLimit.toLocaleString()}</span>
            </div>
            <div className="relative h-4 bg-tertiary-bg rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${gasPercentage}%` }}
                    transition={{ type: 'tween', ease: 'linear', duration: 0.3 }}
                    className={`h-full ${isOutOfGas ? 'bg-danger' : status === 'success' ? 'bg-success' : 'bg-accent'}`}
                />
                {/* Explosion Effect on Out of Gas */}
                {isOutOfGas && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: [0, 1, 0], scale: [1, 2, 3] }}
                        className="absolute right-0 top-0 bottom-0 bg-danger w-full h-full blur-md"
                    />
                )}
            </div>
             {isOutOfGas && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center text-danger text-xs font-bold uppercase tracking-wider mt-1"
                >
                    Out of Gas!
                </motion.div>
            )}
        </div>

        {/* Steps */}
        <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
            {steps.map((step, index) => {
                // Determine step status
                let stepStatus: 'waiting' | 'running' | 'completed' | 'failed' = 'waiting';

                if (status === 'success') {
                    stepStatus = 'completed';
                } else if (status === 'pending') {
                    if (index < currentStepIndex) stepStatus = 'completed';
                    else if (index === currentStepIndex) stepStatus = 'running';
                } else if (status === 'failed') {
                    if (index < currentStepIndex) stepStatus = 'completed';
                    else if (index === currentStepIndex) stepStatus = 'failed';
                    // Steps after failed step remain waiting
                }

                return (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`flex items-center justify-between p-2 rounded-lg border ${
                            stepStatus === 'running' ? 'bg-accent/5 border-accent/20' :
                            stepStatus === 'failed' ? 'bg-danger/5 border-danger/20' :
                            'bg-transparent border-transparent'
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            {stepStatus === 'completed' && <CheckCircle className="w-4 h-4 text-success" />}
                            {stepStatus === 'failed' && <XCircle className="w-4 h-4 text-danger" />}
                            {stepStatus === 'running' && <Loader2 className="w-4 h-4 text-accent animate-spin" />}
                            {stepStatus === 'waiting' && <div className="w-4 h-4 rounded-full border-2 border-text-tertiary/20" />}

                            <span className={`text-sm ${stepStatus === 'waiting' ? 'text-text-tertiary' : 'text-text-primary'}`}>
                                {step.name}
                            </span>
                        </div>
                        <span className="text-xs font-mono text-text-tertiary">
                            {step.cost.toLocaleString()} gas
                        </span>
                    </motion.div>
                );
            })}
        </div>

        {/* Result Area */}
        <AnimatePresence>
            {status !== 'pending' && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-xl border ${status === 'success' ? 'bg-success/5 border-success/20' : 'bg-danger/5 border-danger/20'}`}
                >
                    <div className="flex items-start gap-3">
                        {status === 'success' ? <CheckCircle className="w-5 h-5 text-success shrink-0" /> : <AlertTriangle className="w-5 h-5 text-danger shrink-0" />}
                        <div className="space-y-1 w-full">
                            <h4 className={`text-sm font-bold ${status === 'success' ? 'text-success' : 'text-danger'}`}>
                                {status === 'success' ? 'Execution Successful' : 'Execution Failed'}
                            </h4>
                            {status === 'failed' && result?.revertReason && (
                                <p className="text-xs text-text-primary">Reason: <span className="font-mono">{result.revertReason}</span></p>
                            )}

                            <div className="pt-2 mt-2 border-t border-border/50 grid grid-cols-2 gap-2 text-xs">
                                <div>
                                    <span className="text-text-secondary block">Gas Used</span>
                                    <span className="font-mono text-text-primary">{result?.gasUsed.toLocaleString()} ({Math.round((result?.gasUsed || 0) / gasLimit * 100)}%)</span>
                                </div>
                                <div>
                                    <span className="text-text-secondary block">Cost Paid</span>
                                    <span className="font-mono text-text-primary">{result?.cost.toFixed(4)} coins</span>
                                </div>
                                <div className="col-span-2">
                                     <span className="text-text-secondary block">State Changes</span>
                                     <span className={`font-mono ${status === 'success' ? 'text-success' : 'text-danger'}`}>
                                        {status === 'success' ? 'APPLIED ✅' : 'REVERTED ↩️'}
                                     </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        {status !== 'pending' && onClose && (
             <button
                onClick={onClose}
                className="w-full py-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
                Close Viewer
            </button>
        )}
      </div>
    </Card>
  );
};

export default ExecutionViewer;
