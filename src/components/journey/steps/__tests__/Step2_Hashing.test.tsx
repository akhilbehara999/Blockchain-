import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

import Step2_Hashing from '../Step2_Hashing';
import * as ProgressContext from '../../../../context/ProgressContext';

// Mock crypto
const mockDigest = vi.fn().mockImplementation(async (_algo, data) => {
    const text = new TextDecoder().decode(data);
    let hash = 'hash-' + text;
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

    const renderWithRouter = (ui: React.ReactElement) => {
        return render(<MemoryRouter>{ui}</MemoryRouter>);
    };

    it('renders initial sections', () => {
        renderWithRouter(<Step2_Hashing />);
        expect(screen.getByText('Fingerprints of Data')).toBeInTheDocument();
        expect(screen.getByText('Hash Laboratory')).toBeInTheDocument();
        expect(screen.getByText('Experiment: Determinism')).toBeInTheDocument();
        expect(screen.queryByText('Experiment: Avalanche Effect')).not.toBeInTheDocument();
    });

    it('completes Experiment 1 (Determinism)', async () => {
        renderWithRouter(<Step2_Hashing />);

        const inputs = screen.getAllByPlaceholderText('Type blockchain');
        expect(inputs).toHaveLength(2);

        fireEvent.change(inputs[0], { target: { value: 'blockchain' } });
        fireEvent.change(inputs[1], { target: { value: 'blockchain' } });

        await waitFor(() => {
            expect(screen.getByText('Experiment: Avalanche Effect')).toBeInTheDocument();
        });
    });

    it('completes Experiment 2 (Avalanche)', async () => {
        renderWithRouter(<Step2_Hashing />);

        const inputs = screen.getAllByPlaceholderText('Type blockchain');
        fireEvent.change(inputs[0], { target: { value: 'blockchain' } });
        fireEvent.change(inputs[1], { target: { value: 'blockchain' } });

        await waitFor(() => {
            expect(screen.getByText('Experiment: Avalanche Effect')).toBeInTheDocument();
        });

        const modInput = screen.getByPlaceholderText('Type something different...');
        fireEvent.change(modInput, { target: { value: 'Blockchain' } });

        await waitFor(() => {
            expect(screen.getByText('Experiment: Irreversibility')).toBeInTheDocument();
        });
    });

    it('completes Experiment 3 and Step', async () => {
        renderWithRouter(<Step2_Hashing />);

        const inputs = screen.getAllByPlaceholderText('Type blockchain');
        fireEvent.change(inputs[0], { target: { value: 'blockchain' } });
        fireEvent.change(inputs[1], { target: { value: 'blockchain' } });

        await waitFor(() => screen.getByText('Experiment: Avalanche Effect'));

        const modInput = screen.getByPlaceholderText('Type something different...');
        fireEvent.change(modInput, { target: { value: 'Blockchain' } });

        await waitFor(() => screen.getByText('Experiment: Irreversibility'));

        const guessInput = screen.getByPlaceholderText('Enter your guess...');
        const checkBtn = screen.getByText('Check');

        fireEvent.change(guessInput, { target: { value: 'wrong' } });
        fireEvent.click(checkBtn);

        fireEvent.change(guessInput, { target: { value: 'hello' } });
        fireEvent.click(checkBtn);

        await waitFor(() => {
            // Check for actual success message
            expect(screen.getByText('Hashing Mastered')).toBeInTheDocument();
            expect(mockCompleteStep).toHaveBeenCalledWith(2);
        });
    });
});
