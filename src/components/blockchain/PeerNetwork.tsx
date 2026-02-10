import React, { useState } from 'react';
import { Peer, Block } from '../../engine/types';
import PeerNode from './PeerNode';
import CompactBlockCard from './CompactBlockCard';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { motion, AnimatePresence } from 'framer-motion';
import { calculateHash } from '../../engine/block';
import { RefreshCw, Plus, Trash2, Send } from 'lucide-react';

interface PeerNetworkProps {
  peers: Peer[];
  onTamper: (peerId: string, blockIndex: number, newData: string) => void;
  onConsensusCheck: () => void;
  onBroadcastBlock: (peerId: string, data: string) => void;
  onAddPeer: () => void;
  onRemovePeer: (id: string) => void;
  isConsensusRunning?: boolean;
}

const PeerNetwork: React.FC<PeerNetworkProps> = ({
  peers,
  onTamper,
  onConsensusCheck,
  onBroadcastBlock,
  onAddPeer,
  onRemovePeer,
  isConsensusRunning = false,
}) => {
  const [newBlockData, setNewBlockData] = useState<Record<string, string>>({});

  const handleBroadcast = (peerId: string) => {
    const data = newBlockData[peerId] || '';
    if (!data.trim()) return;
    onBroadcastBlock(peerId, data);
    setNewBlockData(prev => ({ ...prev, [peerId]: '' }));
  };

  const getBlockStatus = (chain: Block[], index: number): 'valid' | 'invalid' => {
      if (index === 0) return 'valid';

      const currentBlock = chain[index];
      const prevBlock = chain[index - 1];

      // Check linkage
      if (currentBlock.previousHash !== prevBlock.hash) {
          return 'invalid';
      }

      // Check integrity
      if (currentBlock.hash !== calculateHash(currentBlock)) {
          return 'invalid';
      }

      // Check Proof of Work (assuming difficulty 2)
      if (!currentBlock.hash.startsWith('00')) {
          return 'invalid';
      }

      // Check if previous block was valid (cascading failure)
      if (getBlockStatus(chain, index - 1) === 'invalid') {
          return 'invalid';
      }

      return 'valid';
  };

  const getPeerStatus = (chain: Block[]) => {
      // If any block is invalid, peer is invalid
      for (let i = 0; i < chain.length; i++) {
          if (getBlockStatus(chain, i) === 'invalid') return 'invalid';
      }
      return 'valid';
  };

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-secondary-bg/50 p-4 rounded-xl border border-border">
        <div className="flex gap-2">
          <Button onClick={onAddPeer} variant="secondary" className="text-xs sm:text-sm">
            <Plus className="w-4 h-4 mr-1" />
            Add Peer
          </Button>
          <Button
            onClick={() => peers.length > 0 && onRemovePeer(peers[peers.length - 1].id)}
            variant="secondary"
            className="text-xs sm:text-sm text-danger hover:text-danger hover:border-danger"
            disabled={peers.length <= 1}
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Remove Peer
          </Button>
        </div>
        <Button
            variant="primary"
            onClick={onConsensusCheck}
            disabled={isConsensusRunning}
            className={`min-w-[160px] ${isConsensusRunning ? 'opacity-80' : ''}`}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isConsensusRunning ? 'animate-spin' : ''}`} />
          {isConsensusRunning ? 'Running Consensus...' : 'Run Consensus'}
        </Button>
      </div>

      {/* Network Visualization */}
      <div className="relative min-h-[500px]">
         {/* Background SVG Lines */}
         <div className="absolute top-[2rem] left-0 right-0 h-20 -z-10 overflow-hidden pointer-events-none">
            <svg width="100%" height="100%">
                <defs>
                    <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="rgba(99, 102, 241, 0)" />
                        <stop offset="50%" stopColor="rgba(99, 102, 241, 0.5)" />
                        <stop offset="100%" stopColor="rgba(99, 102, 241, 0)" />
                    </linearGradient>
                </defs>
                {/* Connection line */}
                <line x1="0" y1="32" x2="100%" y2="32" stroke="rgba(42, 42, 60, 1)" strokeWidth="2" />
                {/* Animated pulse on the line */}
                {isConsensusRunning && (
                    <motion.rect
                        x="-10%" y="31" width="20%" height="2" fill="url(#lineGradient)"
                        animate={{ x: "110%" }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    />
                )}
            </svg>
         </div>

         <div className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-8 overflow-x-auto pb-8 snap-x snap-mandatory md:overflow-visible px-4">
             <AnimatePresence mode="popLayout">
                 {peers.map((peer) => (
                   <motion.div
                      key={peer.id}
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.4 }}
                      className="flex flex-col items-center gap-6 relative min-w-[280px] snap-center"
                   >
                      <PeerNode
                          name={peer.name}
                          status={isConsensusRunning ? 'syncing' : getPeerStatus(peer.chain) === 'valid' ? 'valid' : 'invalid'}
                          isActive={isConsensusRunning}
                          chainLength={peer.chain.length}
                      />

                      {/* Blockchain */}
                      <div className="flex flex-col w-full max-w-[240px] relative">
                         {/* Line connecting blocks */}
                         <div className="absolute left-[50%] top-4 bottom-4 w-0.5 bg-border -translate-x-1/2 -z-10" />

                         <AnimatePresence>
                             {peer.chain.map((block, blockIndex) => (
                                <motion.div
                                    key={`${peer.id}-${block.index}`}
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: blockIndex * 0.1 }}
                                >
                                    <CompactBlockCard
                                        block={block}
                                        status={getBlockStatus(peer.chain, blockIndex) === 'valid' ? 'valid' : 'invalid'}
                                        onTamper={(newData) => onTamper(peer.id, blockIndex, newData)}
                                    />
                                    {blockIndex < peer.chain.length - 1 && (
                                        <div className="h-4 w-0.5 bg-border mx-auto mb-2" />
                                    )}
                                </motion.div>
                             ))}
                         </AnimatePresence>

                         {/* Broadcast Form */}
                         <motion.div
                            layout
                            className="mt-4 pt-4 border-t border-border w-full flex flex-col gap-2"
                         >
                            <label className="text-[10px] text-text-tertiary uppercase font-bold tracking-wider">Broadcast Block</label>
                            <div className="flex gap-2 items-center">
                                <Input
                                    label="Data"
                                    value={newBlockData[peer.id] || ''}
                                    onChange={(e) => setNewBlockData(prev => ({ ...prev, [peer.id]: e.target.value }))}
                                    className="!text-xs !py-2 !h-10"
                                    containerClassName="!mb-0 flex-1"
                                />
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={() => handleBroadcast(peer.id)}
                                    className="h-10 w-10 p-0 flex items-center justify-center shrink-0"
                                    title="Broadcast Block"
                                >
                                    <Send className="w-4 h-4" />
                                </Button>
                            </div>
                         </motion.div>
                      </div>
                   </motion.div>
                 ))}
             </AnimatePresence>
         </div>
      </div>
    </div>
  );
};

export default PeerNetwork;
