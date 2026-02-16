import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import Step2_Hashing from '../Step2_Hashing';
import * as ProgressContext from '../../../../context/ProgressContext';

// Mock crypto
const mockDigest = vi.fn().mockImplementation(async (_algo, data) => {
    // Return a dummy buffer based on input string content to simulate hashing
    const text = new TextDecoder().decode(data);
    let hash = 'hash-' + text;
    // We return ArrayBuffer of this string
    return new TextEncoder().encode(hash).buffer;
});

Object.defineProperty(global, 'crypto', {
    value: {
        subtle: {
            digest: mockDigest
        }
    }
});

// Ensure TextEncoder/Decoder exist
if (!global.TextEncoder) {
    const { TextEncoder, TextDecoder } = await import('util');
    global.TextEncoder = TextEncoder as any;
    global.TextDecoder = TextDecoder as any;
}

// Mock context
vi.mock('../../../../context/ProgressContext', () => ({
  useProgress: vi.fn(),
}));

// Mock scrollIntoView
window.HTMLElement.prototype.scrollIntoView = vi.fn();

describe('Step2_Hashing', () => {
    const mockCompleteStep = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        (ProgressContext.useProgress as any).mockReturnValue({
            completeStep: mockCompleteStep,
        });
    });

    it('renders initial sections', () => {
        render(<Step2_Hashing />);
        expect(screen.getByText('Fingerprints of Data')).toBeInTheDocument();
        expect(screen.getByText('Hash Laboratory')).toBeInTheDocument();
        expect(screen.getByText('Experiment: Determinism')).toBeInTheDocument();
        // Subsequent experiments are hidden initially
        expect(screen.queryByText('Experiment: Avalanche Effect')).not.toBeInTheDocument();
    });

    it('completes Experiment 1 (Determinism)', async () => {
        render(<Step2_Hashing />);

        const inputs = screen.getAllByPlaceholderText('Type blockchain');
        expect(inputs).toHaveLength(2);

        // Type "blockchain" in both
        fireEvent.change(inputs[0], { target: { value: 'blockchain' } });
        fireEvent.change(inputs[1], { target: { value: 'blockchain' } });

        await waitFor(() => {
            expect(screen.getByText('Match! Determinism Verified.')).toBeInTheDocument();
            // Next section should appear
            expect(screen.getByText('Experiment: Avalanche Effect')).toBeInTheDocument();
        });
    });

    it('completes Experiment 2 (Avalanche)', async () => {
        render(<Step2_Hashing />);

        // Fast forward Exp 1
        const inputs = screen.getAllByPlaceholderText('Type blockchain');
        fireEvent.change(inputs[0], { target: { value: 'blockchain' } });
        fireEvent.change(inputs[1], { target: { value: 'blockchain' } });

        await waitFor(() => {
            expect(screen.getByText('Experiment: Avalanche Effect')).toBeInTheDocument();
        });

        const modInput = screen.getByPlaceholderText('Type something different...');
        fireEvent.change(modInput, { target: { value: 'Blockchain' } }); // Change case

        await waitFor(() => {
            expect(screen.getByText('Avalanche Effect Detected!')).toBeInTheDocument();
            expect(screen.getByText('Experiment: Irreversibility')).toBeInTheDocument();
        });
    });

    it('completes Experiment 3 and Step', async () => {
        render(<Step2_Hashing />);

        // Fast forward Exp 1
        const inputs = screen.getAllByPlaceholderText('Type blockchain');
        fireEvent.change(inputs[0], { target: { value: 'blockchain' } });
        fireEvent.change(inputs[1], { target: { value: 'blockchain' } });

        await waitFor(() => screen.getByText('Experiment: Avalanche Effect'));

        // Fast forward Exp 2
        const modInput = screen.getByPlaceholderText('Type something different...');
        fireEvent.change(modInput, { target: { value: 'Blockchain' } });

        await waitFor(() => screen.getByText('Experiment: Irreversibility'));

        // Exp 3
        const guessInput = screen.getByPlaceholderText('Enter your guess...');
        const checkBtn = screen.getByText('Check');

        fireEvent.change(guessInput, { target: { value: 'wrong' } });
        fireEvent.click(checkBtn);

        // Wait for re-render if needed, but 'wrong' shouldn't solve it.
        // Try correct one
        fireEvent.change(guessInput, { target: { value: 'hello' } });
        fireEvent.click(checkBtn);

        await waitFor(() => {
            expect(screen.getByText('Correct! The input was "hello".')).toBeInTheDocument();
            expect(screen.getByText('Step 2 Complete!')).toBeInTheDocument();
            expect(mockCompleteStep).toHaveBeenCalledWith(2);
        });
    });
});
