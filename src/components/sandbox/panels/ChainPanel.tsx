import React, { useRef, useEffect, memo } from 'react';
import { Box, GitBranch, Clock, Lock, CheckCircle2 } from 'lucide-react';
import { useBlockchainStore } from '../../../stores/useBlockchainStore';
import { useForkStore } from '../../../stores/useForkStore';
import { useSandboxStore } from '../../../stores/useSandboxStore';
import { Block } from '../../../engine/types';
import SandboxPanel from '../SandboxPanel';

interface BlockCardProps {
  block: Block;
  height: number;
  type?: 'main' | 'orphan' | 'competitor';
}

const BlockCard = memo<BlockCardProps>(({ block, height, type = 'main' }) => {
  const confirmations = height - block.index + 1;
  const isNew = confirmations === 1;
  const isFinalized = confirmations >= 6; // Bitcoin standard, loosely applied

  let statusColor = "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800";
  let statusIndicator: React.ReactNode = null;
  let shadowClass = "shadow-sm";

  if (type === 'competitor') {
      statusColor = "border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20";
  } else if (isNew) {
      statusColor = "border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20";
      shadowClass = "shadow-[0_0_15px_-3px_rgba(74,222,128,0.5)]";
      statusIndicator = <span className="animate-pulse w-2 h-2 rounded-full bg-green-500 mr-2"></span>;
  } else if (isFinalized) {
      statusColor = "border-indigo-100 dark:border-indigo-900 bg-indigo-50/50 dark:bg-indigo-900/10";
      statusIndicator = <Lock className="w-3 h-3 text-indigo-400 mr-2" />;
  } else {
      statusColor = "border-blue-100 dark:border-blue-900 bg-white dark:bg-gray-800";
      statusIndicator = <CheckCircle2 className="w-3 h-3 text-blue-400 mr-2" />;
  }

  return (
    <div className={`
      flex flex-col shrink-0 rounded-xl border p-4 transition-all duration-300 hover:shadow-md hover:-translate-y-1 w-64 h-40
      ${statusColor} ${shadowClass}
      ${isNew ? 'animate-in zoom-in-95 duration-500' : ''}
    `}>
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center">
            {statusIndicator}
            <span className="font-mono font-bold text-lg text-gray-700 dark:text-gray-200">#{block.index}</span>
        </div>
        {type === 'competitor' && <GitBranch className="w-4 h-4 text-orange-500" />}
        <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">
            {isNew ? 'Just Mined' : `${confirmations} Confirms`}
        </span>
      </div>

      <div className="flex-1 overflow-hidden space-y-2">
        <div>
            <div className="text-[10px] text-gray-400 uppercase font-semibold">Hash</div>
            <div className="font-mono text-xs text-gray-500 dark:text-gray-400 truncate" title={block.hash}>
                {block.hash}
            </div>
        </div>
        <div>
            <div className="text-[10px] text-gray-400 uppercase font-semibold">Data</div>
            <div className="text-sm text-gray-900 dark:text-white line-clamp-2 font-medium">
                {block.data}
            </div>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center text-xs text-gray-400">
         <div className="flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            {new Date(block.timestamp).toLocaleTimeString()}
         </div>
         <div className="font-mono">Nonce: {block.nonce}</div>
      </div>
    </div>
  );
});

const ChainPanel: React.FC = () => {
  const blocks = useBlockchainStore(state => state.blocks);
  const activeFork = useForkStore(state => state.activeFork);
  const mode = useSandboxStore(state => state.mode);
  const incrementMastery = useSandboxStore(state => state.incrementMastery);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Track previous fork state to detect new forks for mastery
  const prevForkRef = useRef<string | null>(null);

  // Auto scroll logic
  useEffect(() => {
    if (scrollRef.current) {
        // Only scroll if we were near the end or if it's a new block?
        // Simple behavior: auto-scroll to end on new block
        scrollRef.current.scrollTo({ left: scrollRef.current.scrollWidth, behavior: 'smooth' });
    }
  }, [blocks.length, activeFork]);

  // Track mastery
  useEffect(() => {
    if (activeFork && activeFork.status === 'active' && prevForkRef.current !== 'active') {
        incrementMastery('forksWitnessed');
        prevForkRef.current = 'active';
    } else if (!activeFork && prevForkRef.current === 'active') {
        incrementMastery('reorgsSurvived');
        prevForkRef.current = null;
    }
  }, [activeFork, incrementMastery]);

  // Virtualization: limit rendered blocks to last 20 + context?
  // Since we horizontal scroll, we ideally want all, but for perf we can slice.
  // Let's show last 50 blocks.
  const visibleBlocks = blocks.length > 50 ? blocks.slice(blocks.length - 50) : blocks;

  return (
    <SandboxPanel
        title="Blockchain"
        icon={Box}
        isLive={true}
        footer={
            <div className="flex justify-between items-center text-xs text-gray-500">
                <span>Height: <span className="font-mono font-bold text-gray-900 dark:text-white">{blocks.length}</span></span>
                {activeFork && (
                    <span className="flex items-center gap-1 font-bold text-orange-600 bg-orange-100 dark:bg-orange-900/30 px-2 py-0.5 rounded-full animate-pulse">
                        <GitBranch className="w-3 h-3" /> FORK ACTIVE
                    </span>
                )}
            </div>
        }
    >
      <div className="h-full flex items-center overflow-x-auto pb-4 custom-scrollbar" ref={scrollRef}>
        <div className="flex gap-6 px-2 min-w-max items-center h-full">
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
                    <div key={block.hash} className="flex flex-col gap-4 relative justify-center group">
                        <BlockCard block={block} height={blocks.length} />

                        {/* Connecting Line */}
                        {i < visibleBlocks.length - 1 && (
                             <div className="absolute top-1/2 -right-6 w-6 h-1 bg-gray-200 dark:bg-gray-700 z-0 group-hover:bg-indigo-200 dark:group-hover:bg-indigo-900 transition-colors" />
                        )}

                        {/* Competitor (Fork Branch) */}
                        {competitor && (
                            <div className="absolute top-full mt-8 animate-in slide-in-from-top-4 fade-in duration-500 z-10">
                                {/* Visual branch connector */}
                                <svg className="absolute -top-8 left-1/2 -translate-x-1/2 w-4 h-8 text-orange-300" overflow="visible">
                                    <path d="M 0 0 V 15 Q 0 30 15 30 H 20" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4" />
                                </svg>
                                <BlockCard block={competitor} height={blocks.length} type="competitor" />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
      </div>
    </SandboxPanel>
  );
};

export default ChainPanel;
