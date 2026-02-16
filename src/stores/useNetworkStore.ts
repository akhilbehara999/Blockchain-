import { create } from 'zustand';
import { Network } from '../engine/network';
import { Peer } from '../engine/types';

interface NetworkState {
  peers: Peer[];
  consensusResult: { winnerId: string, validPeers: string[], invalidPeers: string[] } | null;

  initializeNetwork: (peerNames: string[]) => void;
  addPeer: (name: string) => void;
  removePeer: (id: string) => void;
  tamperBlock: (peerId: string, blockIndex: number, newData: string) => void;
  runConsensus: () => void;
  broadcastNewBlock: (peerId: string, data: string) => Promise<void>;
}

// Internal singleton instance
let network = new Network(2);

export const useNetworkStore = create<NetworkState>((set, get) => ({
  peers: network.getPeers(),
  consensusResult: null,

  initializeNetwork: (peerNames: string[]) => {
    network = new Network(2);
    const peerIds = peerNames.map(name => network.addPeer(name));

    // Pre-mine 3 blocks so everyone starts with 4 blocks (Genesis + 3)
    if (peerIds.length > 0) {
      const firstPeerId = peerIds[0];
      ['Block 1 Data', 'Block 2 Data', 'Block 3 Data'].forEach(data => {
        network.mineAndBroadcast(firstPeerId, data);
      });
    }

    set({ peers: network.getPeers(), consensusResult: null });
  },

  addPeer: (name: string) => {
    network.addPeer(name);
    // Sync the new peer with the longest chain from existing peers
    const currentPeers = get().peers;
    if (currentPeers.length > 0) {
        // Find a valid chain to sync from, or just the first one
        // Ideally we sync from a valid chain.
        // For simplicity, let's just assume we sync from the first peer's chain
        // But network.addPeer creates a fresh chain (Genesis only).
        // We should copy the chain from another peer.

        // Let's find a peer with the longest chain
        let longestChainPeer = currentPeers[0];
        currentPeers.forEach(p => {
            if (p.chain.length > longestChainPeer.chain.length) {
                longestChainPeer = p;
            }
        });

        // We can't easily "set" the chain on the new peer via Network class
        // without adding a method or using replaceChain mechanism.
        // But wait, `addPeer` in network.ts creates a fresh blockchain.
        // If I want the new peer to sync up, I should probably broadcast the existing blocks to it
        // or have `addPeer` logic in network.ts handle it.
        // However, the user didn't explicitly ask for new peers to auto-sync,
        // but it makes sense in a "Network".
        // Let's stick to the basic `addPeer` which starts with Genesis.
        // The user can then "Run Consensus" to sync them up!
        // That's actually a good educational moment.
    }
    set({ peers: network.getPeers() });
  },

  removePeer: (id: string) => {
    network.removePeer(id);
    set({ peers: network.getPeers() });
  },

  tamperBlock: (peerId: string, blockIndex: number, newData: string) => {
    network.tamperBlock(peerId, blockIndex, newData);
    set({ peers: network.getPeers() });
  },

  runConsensus: () => {
    const result = network.runConsensus();
    set({
      peers: network.getPeers(),
      consensusResult: result
    });
  },

  broadcastNewBlock: async (peerId: string, data: string) => {
    // 1. Mine on source peer
    const newBlock = network.mineBlock(peerId, data);

    // Update state to show new block on source peer immediately
    set({ peers: network.getPeers() });

    if (!newBlock) return;

    // 2. Broadcast to others with delay (Wave animation)
    const allPeers = network.getPeers();
    const otherPeers = allPeers.filter(p => p.id !== peerId);

    for (const peer of otherPeers) {
      await new Promise(resolve => setTimeout(resolve, 600)); // 600ms delay between hops
      network.deliverBlock(peer.id, newBlock);
      set({ peers: network.getPeers() });
    }
  },
}));
