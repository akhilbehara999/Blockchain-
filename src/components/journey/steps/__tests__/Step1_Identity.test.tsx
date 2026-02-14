import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import Step1_Identity from '../Step1_Identity';
import * as NodeContext from '../../../../context/NodeContext';
import * as ProgressContext from '../../../../context/ProgressContext';

// Mock contexts
vi.mock('../../../../context/NodeContext', () => ({
  useNodeIdentity: vi.fn(),
}));

vi.mock('../../../../context/ProgressContext', () => ({
  useProgress: vi.fn(),
}));

// Mock scrollIntoView
window.HTMLElement.prototype.scrollIntoView = vi.fn();

// Mock navigator.clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(),
  },
});

describe('Step1_Identity', () => {
  const mockCreateIdentity = vi.fn();
  const mockCompleteStep = vi.fn();
  const mockIdentity = {
      getId: () => 'Node #TEST',
      getWalletAddress: () => '0x123abc',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    (NodeContext.useNodeIdentity as any).mockReturnValue({
      identity: null,
      createIdentity: mockCreateIdentity,
    });

    (ProgressContext.useProgress as any).mockReturnValue({
      completeStep: mockCompleteStep,
    });

    // Mock localStorage item for keys so component can read them
    localStorage.setItem('yupp_node_identity', JSON.stringify({
        id: 'Node #TEST',
        walletAddress: '0x123abc',
        keyPair: { publicKey: 'pubkey123', privateKey: 'privkey123' }
    }));
  });

  it('renders initial state correctly', () => {
    render(<Step1_Identity />);
    expect(screen.getByText('You Are a Node')).toBeInTheDocument();
    expect(screen.getByText('Generate Random Keypair')).toBeInTheDocument();

    // Sections 3 and 4 should not be visible initially
    expect(screen.queryByTestId('private-key-heading')).not.toBeInTheDocument();
  });

  it('handles generation flow', async () => {
    // Update mock to simulate identity creation side effects
    mockCreateIdentity.mockImplementation(() => {
        localStorage.setItem('yupp_node_identity', JSON.stringify({
            id: 'Node #NEW',
            walletAddress: '0xNEW',
            keyPair: { publicKey: 'pubNEW', privateKey: 'privNEW' }
        }));
    });

    render(<Step1_Identity />);

    const generateBtn = screen.getByText('Generate Random Keypair');
    fireEvent.click(generateBtn);

    expect(mockCreateIdentity).toHaveBeenCalled();

    // Check if next section appears using test ID
    await waitFor(() => {
        expect(screen.getByTestId('private-key-heading')).toBeInTheDocument();
        // Also check content
        expect(screen.getByTestId('private-key-heading')).toHaveTextContent('Private Key');
    });
  });

  it('handles guessing flow and completion', async () => {
    // Start with identity present (simulating returning user or after generation)
    (NodeContext.useNodeIdentity as any).mockReturnValue({
      identity: mockIdentity,
      createIdentity: mockCreateIdentity,
    });

    render(<Step1_Identity />);

    // Wait for generated state to be processed via useEffect
    await waitFor(() => {
        expect(screen.getByPlaceholderText(/Enter your guess/i)).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText(/Enter your guess/i);
    const checkBtn = screen.getByText('Check');

    fireEvent.change(input, { target: { value: 'my guess' } });
    fireEvent.click(checkBtn);

    await waitFor(() => {
        expect(screen.getByText(/Wrong/i)).toBeInTheDocument();
        expect(screen.getByText('Your Identity Is Ready')).toBeInTheDocument();
        expect(mockCompleteStep).toHaveBeenCalledWith(1);
    });
  });
});
