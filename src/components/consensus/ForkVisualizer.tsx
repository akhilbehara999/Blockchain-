import React from 'react';
import { useForkStore } from '../../stores/useForkStore';
import { Block } from '../../engine/types';
import Card from '../ui/Card';
import { GitBranch, User, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const BlockNode: React.FC<{ block: Block; status?: 'valid' | 'orphan' | 'pending' }> = ({ block, status = 'valid' }) => (
  <div className={`
    w-24 h-24 rounded-lg flex flex-col items-center justify-center p-2 text-xs border-2 transition-all shadow-lg
    ${status === 'valid' ? 'bg-secondary-bg border-success' : ''}
    ${status === 'orphan' ? 'bg-danger/10 border-danger text-text-secondary grayscale' : ''}
    ${status === 'pending' ? 'bg-tertiary-bg border-dashed border-border' : ''}
  `}>
    <span className="font-bold text-sm">#{block.index}</span>
    <span className="truncate w-full text-center text-[10px] mt-1 opacity-70">{block.hash.substring(0, 8)}</span>
    <div className="mt-2 px-2 py-1 bg-black/20 rounded text-[9px] truncate w-full text-center text-text-secondary">
      {block.data.split('\n')[0].replace('Mined by ', '')}
    </div>
  </div>
);

const ForkVisualizer: React.FC = () => {
  const { activeFork } = useForkStore();

  if (!activeFork) {
    return (
      <Card className="flex items-center justify-center h-48 border-success/20 bg-success/5">
        <div className="text-center">
          <CheckCircle className="w-12 h-12 text-success mx-auto mb-2" />
          <h3 className="font-bold text-success">Network Stable</h3>
          <p className="text-sm text-text-secondary">All nodes are in consensus. No active forks.</p>
        </div>
      </Card>
    );
  }

  // Calculate peer distribution (simulated)
  const totalPeers = 20;
  const lenA = activeFork.chainA.length;
  const lenB = activeFork.chainB.length;
  const ratioA = lenA / (lenA + lenB || 1);
  const peersA = Math.round(totalPeers * (0.3 + (ratioA * 0.4))); // 30-70% range roughly
  const peersB = totalPeers - peersA;

  return (
    <Card className="overflow-hidden min-h-[400px] border-accent/30 relative">
      <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-accent/10 rounded-lg">
            <GitBranch className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h3 className="font-bold text-lg leading-tight">Active Fork Detected</h3>
            <p className="text-xs text-text-secondary">Network split at block #{activeFork.forkPoint}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 px-3 py-1.5 bg-yellow-500/10 text-yellow-500 rounded-full border border-yellow-500/20 animate-pulse">
          <AlertTriangle className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wider">Consensus Resolving</span>
        </div>
      </div>

      <div className="relative flex items-center w-full overflow-x-auto pb-4">
        {/* Connection Lines could go here but hard to position dynamically without SVG lib */}

        {/* Fork Point */}
        <div className="flex flex-col items-center mr-8 flex-shrink-0 opacity-50">
           <div className="text-[10px] text-text-secondary mb-2 uppercase tracking-widest">Fork Point</div>
           <div className="w-24 h-24 bg-tertiary-bg rounded-lg border border-dashed border-border flex items-center justify-center">
             <span className="text-xs text-center px-2">Block #{activeFork.forkPoint}</span>
           </div>
        </div>

        {/* Fork Split */}
        <div className="flex-1 flex flex-col justify-center space-y-12 relative min-w-[500px]">

           {/* Chain A (Top) */}
           <div className="flex items-center relative">
              <div className="absolute -left-8 top-1/2 w-8 h-0.5 bg-success/30 -translate-y-1/2 origin-right -rotate-12"></div>

              <div className="mr-6 text-right w-32 flex-shrink-0">
                 <div className="font-bold text-success flex items-center justify-end">
                    Chain A <CheckCircle className="w-4 h-4 ml-1.5" />
                 </div>
                 <div className="text-xs text-text-secondary flex items-center justify-end mt-1">
                    <User className="w-3 h-3 mr-1" /> {peersA} Peers
                 </div>
              </div>

              <div className="flex space-x-4 p-2 bg-success/5 rounded-xl border border-success/10">
                 {activeFork.chainA.map(block => (
                    <motion.div key={block.hash} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                      <BlockNode block={block} status="valid" />
                    </motion.div>
                 ))}
              </div>
           </div>

           {/* Chain B (Bottom) */}
           <div className="flex items-center relative">
              <div className="absolute -left-8 top-1/2 w-8 h-0.5 bg-purple-500/30 -translate-y-1/2 origin-right rotate-12"></div>

              <div className="mr-6 text-right w-32 flex-shrink-0">
                 <div className="font-bold text-purple-400 flex items-center justify-end">
                    Chain B
                 </div>
                 <div className="text-xs text-text-secondary flex items-center justify-end mt-1">
                    <User className="w-3 h-3 mr-1" /> {peersB} Peers
                 </div>
              </div>

              <div className="flex space-x-4 p-2 bg-purple-500/5 rounded-xl border border-purple-500/10">
                 {activeFork.chainB.map(block => (
                    <motion.div key={block.hash} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                      <BlockNode block={block} status="valid" />
                    </motion.div>
                 ))}
              </div>
           </div>
        </div>
      </div>

      {/* Graveyard (Orphans) */}
      {activeFork.orphanedBlocks.length > 0 && (
          <div className="mt-8 border-t border-white/5 pt-4">
              <h4 className="text-xs font-bold text-danger mb-4 flex items-center uppercase tracking-widest">
                 <XCircle className="w-4 h-4 mr-2" /> Orphaned Blocks (Graveyard)
              </h4>
              <div className="flex space-x-3 overflow-x-auto pb-2">
                 {activeFork.orphanedBlocks.map(block => (
                    <div key={block.hash} className="w-16 h-16 flex-shrink-0 bg-danger/5 border border-danger/20 rounded-lg flex flex-col items-center justify-center text-[10px] text-danger/70 grayscale">
                       <span className="font-bold">#{block.index}</span>
                       <span className="scale-75 truncate w-full text-center">{block.hash.substring(0,6)}</span>
                    </div>
                 ))}
              </div>
           </div>
      )}

      {activeFork.status === 'resolved' && (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 bg-primary-bg/80 backdrop-blur-sm flex items-center justify-center z-10"
        >
            <div className="bg-secondary-bg p-8 rounded-2xl border border-border text-center shadow-2xl max-w-md">
                <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Fork Resolved!</h2>
                <p className="text-text-secondary mb-6">
                    The network has reached consensus on
                    <span className={`font-bold mx-1 ${activeFork.winner === 'A' ? 'text-success' : 'text-purple-400'}`}>
                        Chain {activeFork.winner}
                    </span>
                    based on the longest chain rule.
                </p>
                <div className="text-xs text-text-secondary bg-tertiary-bg p-3 rounded">
                    Visualization will clear shortly...
                </div>
            </div>
        </motion.div>
      )}
    </Card>
  );
};

export default ForkVisualizer;
