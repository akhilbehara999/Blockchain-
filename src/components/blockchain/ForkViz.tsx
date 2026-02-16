import React from 'react';
import { motion } from 'framer-motion';
import { Block } from '../../engine/types';

interface ForkVizProps {
  chain: Block[];
  forkPoint: number;
  forkType: 'none' | 'soft' | 'hard';
  chainA?: Block[];
  chainB?: Block[];
  onBlockClick?: (block: Block) => void;
}

const ForkViz: React.FC<ForkVizProps> = ({
  chain,
  forkPoint,
  forkType,
  chainA,
  chainB,
  onBlockClick,
}) => {
  const renderBlock = (block: Block, label?: string, isForked: boolean = false, isV2: boolean = false) => (
    <motion.div
      layout
      key={block.hash}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      onClick={() => onBlockClick && onBlockClick(block)}
      className={`
        relative min-w-[120px] h-[140px] rounded-xl p-3 border-2 cursor-pointer transition-all shrink-0
        flex flex-col justify-between
        ${isForked ? 'bg-purple-500/10 border-purple-500/50' : 'bg-secondary-bg border-border hover:border-accent/50'}
        ${isV2 ? 'border-success/50 ring-1 ring-success/20' : ''}
        ${forkPoint === block.index ? 'ring-2 ring-accent shadow-[0_0_15px_rgba(99,102,241,0.3)]' : ''}
      `}
    >
      <div className="flex justify-between items-start">
        <span className="text-xs font-mono text-text-secondary">#{block.index}</span>
        {isV2 && <span className="text-[10px] bg-success/20 text-success px-1.5 py-0.5 rounded-full font-bold">v2</span>}
      </div>

      <div className="space-y-1">
        <div className="text-[10px] text-text-tertiary uppercase tracking-wider">Hash</div>
        <div className="text-xs font-mono text-text-secondary truncate">
          {block.hash.substring(0, 12)}...
        </div>
      </div>

      <div className="space-y-1">
        <div className="text-[10px] text-text-tertiary uppercase tracking-wider">Data</div>
        <div className="text-xs text-text-primary truncate">
          {block.data}
        </div>
      </div>

      {label && (
        <div className={`text-[10px] uppercase font-bold text-center py-1 rounded-md mt-1 ${
          label === 'Original' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-purple-500/20 text-purple-400'
        }`}>
          {label}
        </div>
      )}

      {/* Connection Line */}
      <div className="absolute top-1/2 -right-6 w-6 h-0.5 bg-border -z-10" />
    </motion.div>
  );

  // Split history into pre-fork and post-fork
  // If forkPoint is defined, blocks <= forkPoint are shared
  const sharedChain = chain.filter(b => b.index <= forkPoint);
  const remainingChain = chain.filter(b => b.index > forkPoint);

  return (
    <div className="w-full overflow-x-auto p-8 bg-tertiary-bg/30 rounded-2xl border border-white/5">
      <div className="flex items-center min-w-max">
        {/* Shared History */}
        <div className="flex items-center space-x-6 mr-6">
          {sharedChain.map((block) => (
            <div key={block.index} className="relative">
              {renderBlock(block)}
              {forkPoint === block.index && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-accent flex flex-col items-center"
                >
                  <div className="w-0.5 h-2 bg-accent mb-1" />
                  <span className="text-xs font-bold whitespace-nowrap">Fork Point</span>
                </motion.div>
              )}
            </div>
          ))}
        </div>

        {/* Fork Logic */}
        {forkType === 'none' && remainingChain.length > 0 && (
          <div className="flex items-center space-x-6">
            {remainingChain.map((block) => (
               <div key={block.index} className="relative">
                 {renderBlock(block)}
               </div>
            ))}
          </div>
        )}

        {forkType === 'soft' && remainingChain.length > 0 && (
          <div className="flex items-center space-x-6">
            {remainingChain.map((block) => (
               <div key={block.index} className="relative">
                 {renderBlock(block, undefined, false, true)}
               </div>
            ))}
          </div>
        )}

        {forkType === 'hard' && (
          <div className="flex flex-col space-y-8 relative">
            <div className="absolute top-0 bottom-0 -left-6 w-6 border-l-2 border-dashed border-border rounded-l-xl" />

            {/* Chain A (Original) */}
            <div className="flex items-center space-x-6 pl-4 relative">
               <div className="absolute -left-10 top-1/2 w-10 h-0.5 bg-border" style={{ transform: 'translateY(-50%) skewY(-15deg)', width: '40px' }} />
               {chainA?.slice(forkPoint + 1).map(block => (
                 <div key={block.index} className="relative">
                   {renderBlock(block, 'Original')}
                 </div>
               ))}
               {(!chainA || chainA.slice(forkPoint + 1).length === 0) && (
                 <div className="text-text-tertiary text-xs italic">No blocks yet</div>
               )}
            </div>

            {/* Chain B (Forked) */}
            <div className="flex items-center space-x-6 pl-4 relative">
               <div className="absolute -left-10 top-1/2 w-10 h-0.5 bg-border" style={{ transform: 'translateY(-50%) skewY(15deg)', width: '40px' }} />
               {chainB?.slice(forkPoint + 1).map(block => (
                 <div key={block.index} className="relative">
                   {renderBlock(block, 'Forked', true)}
                 </div>
               ))}
               {(!chainB || chainB.slice(forkPoint + 1).length === 0) && (
                 <div className="text-text-tertiary text-xs italic">No blocks yet</div>
               )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForkViz;
