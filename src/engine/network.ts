import { Block, Peer } from './types';
import { Blockchain } from './blockchain';
import { createBlock, mineBlock } from './block';

export class Network {
  private peers: Map<string, { id: string, name: string, blockchain: Blockchain }>;
  private difficulty: number;
  private genesisBlock: Block;

  constructor(difficulty: number) {
    this.peers = new Map();
    this.difficulty = difficulty;
    this.genesisBlock = createBlock(0, "Genesis Block", "0", this.difficulty);
    mineBlock(this.genesisBlock, this.difficulty);
  }

  public addPeer(name: string): string {
    const id = Math.random().toString(36).substring(2, 11);
    const blockchain = new Blockchain(this.difficulty, this.genesisBlock);
    this.peers.set(id, { id, name, blockchain });
    return id;
  }

  public removePeer(id: string): void {
    this.peers.delete(id);
  }

  public getPeers(): Peer[] {
    const peerList: Peer[] = [];
    this.peers.forEach((peer) => {
      peerList.push({
        id: peer.id,
        name: peer.name,
        chain: peer.blockchain.getChain(),
      });
    });
    return peerList;
  }

  public broadcastBlock(sourcePeerId: string, block: Block): void {
    this.peers.forEach((peer) => {
      if (peer.id !== sourcePeerId) {
        peer.blockchain.receiveBlock(block);
      }
    });
  }

  public mineBlock(peerId: string, data: string): Block | null {
    const peer = this.peers.get(peerId);
    if (!peer) {
      return null;
    }
    return peer.blockchain.addBlock(data);
  }

  public deliverBlock(peerId: string, block: Block): void {
    const peer = this.peers.get(peerId);
    if (peer) {
      peer.blockchain.receiveBlock(block);
    }
  }

  public mineAndBroadcast(peerId: string, data: string): boolean {
    const peer = this.peers.get(peerId);
    if (!peer) {
      return false;
    }
    const newBlock = peer.blockchain.addBlock(data);
    this.broadcastBlock(peerId, newBlock);
    return true;
  }

  public tamperBlock(peerId: string, blockIndex: number, newData: string): void {
    const peer = this.peers.get(peerId);
    if (peer) {
      peer.blockchain.editBlockData(blockIndex, newData);
    }
  }

  public runConsensus(): { winnerId: string, validPeers: string[], invalidPeers: string[] } {
    const validChains: { id: string, chain: Block[] }[] = [];
    const validPeers: string[] = [];
    const invalidPeers: string[] = [];

    // Identify valid chains
    this.peers.forEach((peer) => {
      if (peer.blockchain.isChainValid()) {
        validChains.push({ id: peer.id, chain: peer.blockchain.getChain() });
        validPeers.push(peer.id);
      } else {
        invalidPeers.push(peer.id);
      }
    });

    if (validChains.length === 0) {
      return { winnerId: '', validPeers: [], invalidPeers: Array.from(this.peers.keys()) };
    }

    // Find longest valid chain
    let winner = validChains[0];
    for (let i = 1; i < validChains.length; i++) {
      if (validChains[i].chain.length > winner.chain.length) {
        winner = validChains[i];
      }
    }

    // Replace all other chains with the winner
    this.peers.forEach((peer) => {
      if (peer.id !== winner.id) {
        peer.blockchain.replaceChain(winner.chain);
      }
    });

    return {
      winnerId: winner.id,
      validPeers,
      invalidPeers
    };
  }
}
