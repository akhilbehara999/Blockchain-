import React from 'react';
import { useForkStore } from '../../stores/useForkStore';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, RefreshCw, ArrowRight } from 'lucide-react';
import Button from '../ui/Button';

const ReorgAlert: React.FC = () => {
  const { reorgEvent, dismissReorg } = useForkStore();

  return (
    <AnimatePresence>
      {reorgEvent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-secondary-bg w-full max-w-2xl rounded-2xl border border-danger/30 shadow-2xl overflow-hidden"
            >
                {/* Header */}
                <div className="bg-danger/10 p-6 flex items-center justify-between border-b border-danger/20">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-danger/20 rounded-full animate-pulse">
                            <AlertTriangle className="w-8 h-8 text-danger" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Chain Reorganization Detected</h2>
                            <p className="text-danger/80 text-sm">The local blockchain has been replaced by a longer valid chain.</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-tertiary-bg/50 p-4 rounded-xl border border-white/5">
                            <h4 className="text-xs font-bold text-text-secondary uppercase mb-3">Changes Applied</h4>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm">Blocks Replaced</span>
                                <span className="font-bold text-lg text-danger">-{reorgEvent.blocksReplaced}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">New Blocks Added</span>
                                <span className="font-bold text-lg text-success">+{reorgEvent.newChain.length}</span>
                            </div>
                        </div>

                        <div className="bg-tertiary-bg/50 p-4 rounded-xl border border-white/5">
                            <h4 className="text-xs font-bold text-text-secondary uppercase mb-3">Transaction Impact</h4>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm">Returned to Mempool</span>
                                <span className="font-bold text-lg text-warning">{reorgEvent.txsReturned}</span>
                            </div>
                            <p className="text-xs text-text-secondary mt-2">
                                Transactions from orphaned blocks have been returned to the mempool and will be re-mined shortly.
                            </p>
                        </div>
                    </div>

                    <div className="relative p-6 bg-black/30 rounded-xl border border-white/5 overflow-hidden">
                        <div className="flex items-center justify-center space-x-8">
                            <div className="text-center opacity-50 grayscale">
                                <div className="mb-2 text-xs uppercase tracking-widest">Old Chain</div>
                                <div className="flex space-x-1 justify-center">
                                    {reorgEvent.oldChain.map(b => (
                                        <div key={b.hash} className="w-8 h-8 bg-danger rounded tooltip" title={`Block #${b.index}`}></div>
                                    ))}
                                </div>
                            </div>

                            <ArrowRight className="w-8 h-8 text-text-secondary" />

                            <div className="text-center">
                                <div className="mb-2 text-xs uppercase tracking-widest text-success">New Chain</div>
                                <div className="flex space-x-1 justify-center">
                                    {reorgEvent.newChain.map(b => (
                                        <div key={b.hash} className="w-8 h-8 bg-success rounded shadow-[0_0_10px_rgba(34,197,94,0.5)] tooltip" title={`Block #${b.index}`}></div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-warning/10 border border-warning/20 rounded-xl flex items-start space-x-3">
                        <RefreshCw className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-warning/90">
                            <span className="font-bold">Your Balance may have changed.</span>
                            If you mined any of the orphaned blocks, those rewards are revoked. Transactions included in the new chain are confirmed.
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 bg-tertiary-bg border-t border-border flex justify-end">
                    <Button onClick={dismissReorg} className="w-full md:w-auto">
                        Acknowledge & Continue
                    </Button>
                </div>
            </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ReorgAlert;
