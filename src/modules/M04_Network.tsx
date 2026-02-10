import React, { useEffect, useState } from 'react';
import ModuleLayout from '../components/layout/ModuleLayout';
import PeerNetwork from '../components/blockchain/PeerNetwork';
import { useNetworkStore } from '../stores/useNetworkStore';
import { AnimatePresence, motion } from 'framer-motion';
import { Info } from 'lucide-react';

const M04_Network: React.FC = () => {
  const {
    peers,
    initializeNetwork,
    addPeer,
    removePeer,
    tamperBlock,
    broadcastNewBlock,
    runConsensus,
    consensusResult
  } = useNetworkStore();

  const [isConsensusRunning, setIsConsensusRunning] = useState(false);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    initializeNetwork(['Peer A', 'Peer B', 'Peer C']);
  }, []);

  const handleRunConsensus = async () => {
    setIsConsensusRunning(true);
    setShowResult(false);

    // Simulate network delay / animation time
    await new Promise(resolve => setTimeout(resolve, 2000));

    runConsensus();
    setIsConsensusRunning(false);
    setShowResult(true);

    // Auto hide result after 5s
    setTimeout(() => setShowResult(false), 5000);
  };

  const getResultMessage = () => {
    if (!consensusResult) return '';
    const { invalidPeers } = consensusResult;
    if (invalidPeers.length === 0) {
        return "All chains were valid. No consensus changes needed.";
    }
    // We can't easily get names of removed peers because they are updated in store.
    // Wait, runConsensus updates peers to valid ones.
    // But `invalidPeers` contains IDs.
    // We can try to find them in current `peers`? No, they might be replaced.
    // Actually, `runConsensus` replaces the chain, not the peer object itself usually?
    // Let's check `network.ts`.
    // `peer.blockchain.replaceChain(winner.chain);`
    // So the peer object (id, name) persists.

    const invalidPeerNames = peers
        .filter(p => invalidPeers.includes(p.id))
        .map(p => p.name);

    if (invalidPeerNames.length === 0) return "Consensus restored.";

    return `${invalidPeerNames.join(', ')}'s tampered chain was rejected. Network consensus restored.`;
  };

  return (
    <ModuleLayout
      moduleId="network"
      title="Peer-to-Peer Network"
      subtitle="Understand how decentralized consensus works"
    >
      <div className="space-y-8">
        {/* Info Callout */}
        <div className="bg-accent/10 border border-accent/20 rounded-xl p-4 flex gap-3 items-start">
            <Info className="w-5 h-5 text-accent shrink-0 mt-0.5" />
            <div className="text-sm text-text-secondary">
                <strong className="text-text-primary block mb-1">Strength in Numbers</strong>
                More peers = harder to attack. An attacker would need to control more than half the network (51%) to rewrite history. Try tampering with one peer and running consensus to see the network heal itself.
            </div>
        </div>

        {/* Consensus Result Message */}
        <AnimatePresence>
            {showResult && consensusResult && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`p-4 rounded-xl border ${consensusResult.invalidPeers.length > 0 ? 'bg-success/10 border-success/20 text-success' : 'bg-secondary-bg border-border text-text-secondary'}`}
                >
                    <div className="flex items-center gap-2 font-medium">
                        {consensusResult.invalidPeers.length > 0 ? (
                            <>
                                <span>🛡️</span>
                                {getResultMessage()}
                            </>
                        ) : (
                             "Network is in sync."
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        <PeerNetwork
            peers={peers}
            onTamper={tamperBlock}
            onConsensusCheck={handleRunConsensus}
            onBroadcastBlock={broadcastNewBlock}
            onAddPeer={() => addPeer(`Peer ${String.fromCharCode(65 + peers.length)}`)}
            onRemovePeer={removePeer}
            isConsensusRunning={isConsensusRunning}
        />
      </div>
    </ModuleLayout>
  );
};

export default M04_Network;
