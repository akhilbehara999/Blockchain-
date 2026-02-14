import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import BlockCard from '../BlockCard';
import { Block } from '../../../engine/types';

// Mock useReducedMotion
vi.mock('../../../hooks/useReducedMotion', () => ({
  useReducedMotion: () => false,
}));

// Mock HashDisplay, NonceCounter etc if they are complex
// Or just let them render. They are simple enough.
// But MiningAnimation uses framer motion.
// We can mock framer-motion animations by just rendering children.

const mockBlock: Block = {
  index: 1,
  timestamp: 1234567890,
  data: 'Test Data',
  previousHash: '0000prev',
  nonce: 123,
  hash: '0000hash',
};

describe('BlockCard', () => {
  it('renders block information', () => {
    render(
      <BlockCard
        block={mockBlock}
        editable={false}
        status="valid"
      />
    );

    expect(screen.getByText('Block #1')).toBeInTheDocument();
    expect(screen.getByText('Test Data')).toBeInTheDocument();
    expect(screen.getByText('123')).toBeInTheDocument(); // Nonce
    // Timestamp is formatted, might be tricky to test exact string depending on locale
    // But we can check for existence of some part or just rely on other fields.
    expect(screen.getByText('VALID')).toBeInTheDocument();
  });

  it('allows editing data when editable is true', () => {
    const handleDataChange = vi.fn();
    render(
      <BlockCard
        block={mockBlock}
        editable={true}
        status="valid"
        onDataChange={handleDataChange}
      />
    );

    const textarea = screen.getByLabelText(/Data for block 1/i);
    fireEvent.change(textarea, { target: { value: 'New Data' } });
    expect(handleDataChange).toHaveBeenCalledWith('New Data');
  });

  it('shows mine button when invalid and onMine provided', () => {
    const handleMine = vi.fn();
    render(
      <BlockCard
        block={mockBlock}
        editable={true}
        status="invalid"
        onMine={handleMine}
      />
    );

    const mineButton = screen.getByRole('button', { name: /Mine/i });
    expect(mineButton).toBeInTheDocument();
    fireEvent.click(mineButton);
    expect(handleMine).toHaveBeenCalled();
  });

  it('does not show mine button when valid', () => {
    const handleMine = vi.fn();
    render(
      <BlockCard
        block={mockBlock}
        editable={true}
        status="valid"
        onMine={handleMine}
      />
    );

    const mineButton = screen.queryByRole('button', { name: /Mine/i });
    expect(mineButton).not.toBeInTheDocument();
  });
});
