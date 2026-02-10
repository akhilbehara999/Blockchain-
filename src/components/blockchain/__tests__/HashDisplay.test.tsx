import React from 'react';
import { render, screen } from '@testing-library/react';
import HashDisplay from '../HashDisplay';
import { describe, it, expect } from 'vitest';

describe('HashDisplay', () => {
  it('renders hash correctly', () => {
    const { container } = render(<HashDisplay hash="abc123456789" />);
    expect(container).toHaveTextContent('abc123456789');
  });

  it('highlights leading zeros', () => {
    // This is visual, we can check classes or style if applied.
    // The implementation uses inline styles for color in animation, or classes otherwise.
    // Let's assume animate=false for easier testing.
    const { container } = render(<HashDisplay hash="00abc" highlightLeadingZeros={true} animate={false} />);

    // 00 should have 'text-success' class or similar logic
    // Implementation:
    // if (isLeadingZero) { className = 'text-success font-bold'; }

    const zeros = container.querySelectorAll('.text-success');
    expect(zeros).toHaveLength(2);
    expect(zeros[0].textContent).toBe('0');
    expect(zeros[1].textContent).toBe('0');
  });

  it('highlights differences with previousHash', () => {
    // hash: abc, prev: abd. c vs d is diff.
    const { container } = render(<HashDisplay hash="abc" previousHash="abd" animate={false} />);

    // a and b match. c differs from d.
    // logic: isDifferent = previousHash && previousHash[index] !== char
    // previousHash[2] is 'd', char is 'c'. So it is different.

    const diffs = container.querySelectorAll('.text-accent');
    // a (index 0): 'a' !== 'a' -> false
    // b (index 1): 'b' !== 'b' -> false
    // c (index 2): 'c' !== 'd' -> true

    expect(diffs).toHaveLength(1);
    expect(diffs[0].textContent).toBe('c');
  });
});
