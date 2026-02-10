import { describe, it, expect, beforeEach } from 'vitest';
import { Network } from '../network';
import { createBlock, mineBlock } from '../block';

describe('Network', () => {
  let network: Network;

  beforeEach(() => {
    network = new Network(2);
  });

  it('should add peers', () => {
    network.addPeer('Peer 1');
    network.addPeer('Peer 2');
    const peers = network.getPeers();
    expect(peers.length).toBe(2);
    expect(peers[0].name).toBe('Peer 1');
    expect(peers[1].name).toBe('Peer 2');
  });

  it('should broadcast blocks', () => {
    const peer1Id = network.addPeer('Peer 1');
    const peer2Id = network.addPeer('Peer 2');
    const peers = network.getPeers();

    const peer1Chain = peers.find(p => p.id === peer1Id)?.chain;
    const previousBlock = peer1Chain![peer1Chain!.length - 1];

    const newBlock = createBlock(previousBlock.index + 1, 'Test Data', previousBlock.hash, 2);
    mineBlock(newBlock, 2);

    network.broadcastBlock(peer1Id, newBlock);

    const peer2Chain = peers.find(p => p.id === peer2Id)?.chain;
    expect(peer2Chain!.length).toBe(2);
    expect(peer2Chain![1].data).toBe('Test Data');
  });

  it('should run consensus and resolve conflicts', () => {
    const peer1Id = network.addPeer('Peer 1');
    const peer2Id = network.addPeer('Peer 2');
    const peer3Id = network.addPeer('Peer 3');
    const peers = network.getPeers();

    const peer1Chain = peers.find(p => p.id === peer1Id)!.chain;

    // Create blocks
    let prev = peer1Chain[0];
    const b1 = createBlock(prev.index + 1, 'Block 1', prev.hash, 2);
    mineBlock(b1, 2);

    const b2 = createBlock(b1.index + 1, 'Block 2', b1.hash, 2);
    mineBlock(b2, 2);

    // Peer 1: Genesis -> B1 -> B2 -> B3
    const b3 = createBlock(b2.index + 1, 'Block 3', b2.hash, 2);
    mineBlock(b3, 2);

    peer1Chain.push({ ...b1 });
    peer1Chain.push({ ...b2 });
    peer1Chain.push({ ...b3 });

    // Peer 2: Genesis -> B1 -> B2 (Valid but shorter)
    const peer2Chain = peers.find(p => p.id === peer2Id)!.chain;
    peer2Chain.push({ ...b1 });
    peer2Chain.push({ ...b2 });

    // Peer 3: Genesis -> B1 -> B2 (Tampered)
    const peer3Chain = peers.find(p => p.id === peer3Id)!.chain;
    peer3Chain.push({ ...b1 });
    peer3Chain.push({ ...b2 });

    // Tamper Peer 3's Block 1
    network.tamperBlock(peer3Id, 1, 'Tampered Data');

    const result = network.runConsensus();

    expect(result.winnerId).toBe(peer1Id);
    expect(result.validPeers).toContain(peer1Id);
    expect(result.validPeers).toContain(peer2Id);
    expect(result.invalidPeers).toContain(peer3Id);

    // Peer 2 should be updated to match Peer 1
    const updatedPeers = network.getPeers();
    const updatedPeer2Chain = updatedPeers.find(p => p.id === peer2Id)!.chain;
    expect(updatedPeer2Chain.length).toBe(4);
    expect(updatedPeer2Chain[3].data).toBe('Block 3');

    // Peer 3 should be corrected
    const updatedPeer3Chain = updatedPeers.find(p => p.id === peer3Id)!.chain;
    expect(updatedPeer3Chain.length).toBe(4);
    expect(updatedPeer3Chain[1].data).toBe('Block 1');
  });
});
