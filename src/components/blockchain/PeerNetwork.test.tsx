
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import PeerNetwork from './PeerNetwork';
import { Peer } from '../../engine/types';

describe('PeerNetwork', () => {
    const mockPeers: Peer[] = [
        { id: '1', name: 'Peer A', chain: [{ index: 0, hash: '00abc', previousHash: '0', data: 'Genesis', timestamp: 123, nonce: 0 }] },
        { id: '2', name: 'Peer B', chain: [{ index: 0, hash: '00abc', previousHash: '0', data: 'Genesis', timestamp: 123, nonce: 0 }] }
    ];

    const mockProps = {
        peers: mockPeers,
        onTamper: vi.fn(),
        onConsensusCheck: vi.fn(),
        onBroadcastBlock: vi.fn(),
        onAddPeer: vi.fn(),
        onRemovePeer: vi.fn(),
    };

    it('renders peers correctly', () => {
        render(<PeerNetwork {...mockProps} />);
        expect(screen.getByText('Peer A')).toBeInTheDocument();
        expect(screen.getByText('Peer B')).toBeInTheDocument();
    });

    it('calls onConsensusCheck when Run Consensus is clicked', () => {
        render(<PeerNetwork {...mockProps} />);
        const button = screen.getByText('Run Consensus');
        fireEvent.click(button);
        expect(mockProps.onConsensusCheck).toHaveBeenCalled();
    });

    it('calls onAddPeer when Add Peer is clicked', () => {
        render(<PeerNetwork {...mockProps} />);
        const button = screen.getByText('Add Peer');
        fireEvent.click(button);
        expect(mockProps.onAddPeer).toHaveBeenCalled();
    });

    it('calls onRemovePeer when Remove Peer is clicked', () => {
        render(<PeerNetwork {...mockProps} />);
        const button = screen.getByText('Remove Peer');
        fireEvent.click(button);
        // It should remove the last peer, which is Peer B (id: '2')
        expect(mockProps.onRemovePeer).toHaveBeenCalledWith('2');
    });
});
