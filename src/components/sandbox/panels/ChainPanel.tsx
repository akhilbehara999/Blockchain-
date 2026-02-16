import React, { useRef, useEffect } from 'react';
import { Box, GitBranch, Hash, Clock } from 'lucide-react';
import { useBlockchainStore } from '../../../stores/useBlockchainStore';
import { useForkStore } from '../../../stores/useForkStore';
import { useSandboxStore } from '../../../stores/useSandboxStore';
import { Block } from '../../../engine/types';

const BlockCard: React.FC<{ block: Block; isSmall?: boolean; type?: 'main' | 'orphan' | 'competitor' }> = ({ block, isSmall, type = 'main' }) => {
  const bgColor =
    type === 'main' ? 'bg-white dark:bg-gray-800' :
    type === 'competitor' ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800' :
    'bg-gray-100 dark:bg-gray-700';

  const borderColor =
    type === 'main' ? 'border-gray-200 dark:border-gray-700' :
    type === 'competitor' ? 'border-orange-300 dark:border-orange-700' :
    'border-gray-300 dark:border-gray-600';

  return (
    <div className={`
      flex flex-col shrink-0 rounded-lg border shadow-sm p-3 transition-all hover:shadow-md
      ${bgColor} ${borderColor}
      ${isSmall ? 'w-32 h-24 text-xs' : 'w-48 h-32'}
    `}>
      <div className="flex justify-between items-start mb-2">
        <span className="font-mono font-bold text-gray-500 dark:text-gray-400">#{block.index}</span>
        {type === 'competitor' && <GitBranch className="w-3 h-3 text-orange-500" />}
      </div>
      <div className="flex-1 overflow-hidden">
        <div className="font-mono text-[10px] text-gray-400 truncate mb-1" title={block.hash}>
            {block.hash.substring(0, 10)}...
        </div>
        <div className="text-gray-900 dark:text-gray-100 font-medium text-xs line-clamp-2">
            {block.data}
        </div>
      </div>
      <div className="mt-2 flex items-center text-[10px] text-gray-400">
         <Clock className="w-3 h-3 mr-1" />
         {new Date(block.timestamp).toLocaleTimeString()}
      </div>
    </div>
  );
};

const ChainPanel: React.FC = () => {
  const blocks = useBlockchainStore(state => state.blocks);
  const activeFork = useForkStore(state => state.activeFork);
  const mode = useSandboxStore(state => state.mode);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Track previous fork state to detect new forks for mastery
  const prevForkRef = useRef<string | null>(null); // Use ID or unique property if possible, or just status tracking
  const incrementMastery = useSandboxStore(state => state.incrementMastery);

  // Auto scroll
  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTo({ left: scrollRef.current.scrollWidth, behavior: 'smooth' });
    }
  }, [blocks.length, activeFork]);

  // Track mastery
  useEffect(() => {
    // Detect new fork
    if (activeFork && activeFork.status === 'active' && !prevForkRef.current) {
        incrementMastery('forksWitnessed');
        prevForkRef.current = 'active';
    } else if (!activeFork && prevForkRef.current) {
        // Fork ended
        // We assume survival if it ended without explicit failure (which is not really tracked here)
        incrementMastery('reorgsSurvived');
        prevForkRef.current = null;
    }
  }, [activeFork, incrementMastery]);

  // Determine blocks to show
  const visibleBlocks = blocks.slice(-10);

  return (
    <div className="h-full bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden">
      <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 text-sm">
          <Box className="w-4 h-4 text-indigo-500" />
          Blockchain
        </h3>
        <div className="flex items-center gap-3">
            {activeFork && (
                <span className="flex items-center gap-1 text-xs font-bold text-orange-600 bg-orange-100 dark:bg-orange-900/30 px-2 py-0.5 rounded-full animate-pulse">
                    <GitBranch className="w-3 h-3" /> FORK ACTIVE
                </span>
            )}
            <span className="text-xs text-gray-500 font-mono bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                Height: {blocks.length}
            </span>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto p-4 relative" ref={scrollRef}>
        <div className="flex gap-4 min-w-max items-center h-full pb-2">
            {/* Standard Chain Visualization */}
            {visibleBlocks.map((block, i) => {
                let competitor: Block | null = null;

                if (mode === 'god' && activeFork) {
                    const inChainA = activeFork.chainA.some(b => b.hash === block.hash);
                    const inChainB = activeFork.chainB.some(b => b.hash === block.hash);

                    if (inChainA) {
                        competitor = activeFork.chainB.find(b => b.index === block.index) || null;
                    } else if (inChainB) {
                        competitor = activeFork.chainA.find(b => b.index === block.index) || null;
                    }
                }

                return (
                    <div key={block.hash} className="flex flex-col gap-4 relative justify-center">
                        <BlockCard block={block} />

                        {/* Connecting Line */}
                        {i < visibleBlocks.length - 1 && (
                             <div className="absolute top-1/2 -right-4 w-4 h-0.5 bg-gray-300 dark:bg-gray-600 z-0" />
                        )}

                        {/* Competitor (Fork Branch) */}
                        {competitor && (
                            <div className="absolute top-full mt-4 animate-in slide-in-from-top-4 fade-in duration-500 z-10">
                                {/* Visual branch connector */}
                                <div className="absolute -top-4 left-1/2 w-0.5 h-4 bg-orange-300 border-l border-dashed border-orange-500" />
                                <BlockCard block={competitor} type="competitor" />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
      </div>
    </div>
  );
};

export default ChainPanel;
