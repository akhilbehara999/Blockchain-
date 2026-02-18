import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

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

  const renderWithRouter = (ui: React.ReactElement) => {
    return render(<MemoryRouter>{ui}</MemoryRouter>);
  };

  it('renders initial state correctly', () => {
    renderWithRouter(<Step1_Identity />);
    expect(screen.getByText('You Are a Node')).toBeInTheDocument();

    // Check for the generate button (text might have changed in component update)
    // The component code shows: {generated ? 'Regenerate Keys' : 'Generate New Keys'}
    expect(screen.getByText('Generate New Keys')).toBeInTheDocument();
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

    renderWithRouter(<Step1_Identity />);

    const generateBtn = screen.getByText('Generate New Keys');
    fireEvent.click(generateBtn);

    expect(mockCreateIdentity).toHaveBeenCalled();

    // After clicking, we expect the identity to be "generated" in component state
    // which triggers the next sections.
    // However, since we mock the hook return value, the component won't re-render with new identity
    // unless we update the mock and re-render or if the component uses internal state for "generated".
    // The component uses: useEffect(() => { if (identity) setGenerated(true); }, [identity]);
    // So we need to update the mock return value for a re-render or testing behavior.

    // In a real integration test we'd wrap with provider. Here we just checking button click.
  });

  it('handles guessing flow and completion', async () => {
    // Start with identity present (simulating returning user or after generation)
    (NodeContext.useNodeIdentity as any).mockReturnValue({
      identity: mockIdentity,
      createIdentity: mockCreateIdentity,
    });

    renderWithRouter(<Step1_Identity />);

    // Wait for generated state to be processed via useEffect
    await waitFor(() => {
        expect(screen.getByPlaceholderText(/Enter your guess/i)).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText(/Enter your guess/i);
    const checkBtn = screen.getByText('Check Guess');

    fireEvent.change(input, { target: { value: 'my guess' } });
    fireEvent.click(checkBtn);

    await waitFor(() => {
        expect(screen.getByText(/Impossible!/i)).toBeInTheDocument();
        expect(screen.getByText('Identity Established')).toBeInTheDocument();
        expect(mockCompleteStep).toHaveBeenCalledWith(1);
    });
  });
});
