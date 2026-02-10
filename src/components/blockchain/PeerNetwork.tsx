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
    const data = newBlockData[peerId] || 'New Transaction';
    if (!data.trim()) return;
    onBroadcastBlock(peerId, data);
    setNewBlockData(prev => ({ ...prev, [peerId]: '' }));
  };

  const getBlockStatus = (chain: Block[], index: number): 'valid' | 'invalid' => {
      if (index === 0) return 'valid';

      // Check previous block link
      const currentBlock = chain[index];
      const prevBlock = chain[index - 1];

      if (currentBlock.previousHash !== prevBlock.hash) {
          return 'invalid';
      }

      // Check if current block hash matches content (integrity)
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
      <div className="relative">
         {/* Desktop Connection Lines */}
         <div className="hidden md:block absolute top-[2rem] left-[10%] right-[10%] h-0.5 bg-border -z-10">
            {isConsensusRunning && (
                <motion.div
                    className="h-full bg-accent/50 w-full"
                    initial={{ x: '-100%' }}
                    animate={{ x: '100%' }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                />
            )}
         </div>

         <div className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-8 overflow-x-auto pb-4 snap-x snap-mandatory md:overflow-visible">
             <AnimatePresence mode="popLayout">
                 {peers.map((peer, index) => (
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
                         <div className="mt-4 pt-4 border-t border-border w-full">
                            <div className="flex gap-2">
                                <Input
                                    placeholder="New Data..."
                                    value={newBlockData[peer.id] || ''}
                                    onChange={(e) => setNewBlockData(prev => ({ ...prev, [peer.id]: e.target.value }))}
                                    className="bg-tertiary-bg text-xs h-8"
                                />
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={() => handleBroadcast(peer.id)}
                                    className="h-8 w-8 p-0 flex items-center justify-center"
                                    title="Broadcast Block"
                                >
                                    <Send className="w-3 h-3" />
                                </Button>
                            </div>
                         </div>
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
