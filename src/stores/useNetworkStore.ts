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
  broadcastNewBlock: (peerId: string, data: string) => void;
}

// Internal singleton instance
let network = new Network(2);

export const useNetworkStore = create<NetworkState>((set) => ({
  peers: network.getPeers(),
  consensusResult: null,

  initializeNetwork: (peerNames: string[]) => {
    network = new Network(2);
    peerNames.forEach(name => network.addPeer(name));
    set({ peers: network.getPeers(), consensusResult: null });
  },

  addPeer: (name: string) => {
    network.addPeer(name);
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

  broadcastNewBlock: (peerId: string, data: string) => {
    network.mineAndBroadcast(peerId, data);
    set({ peers: network.getPeers() });
  },
}));
