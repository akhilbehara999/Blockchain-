import { describe, it, expect } from 'vitest';
import { simulatePoW, simulatePoS, simulateDPoS } from '../consensus';

describe('Consensus', () => {
  describe('PoW', () => {
    const miners = [
      { name: 'Miner1', hashRate: 100 },
      { name: 'Miner2', hashRate: 200 },
    ];
    const difficulty = 1; // Low difficulty for test speed

    it('should simulate a PoW race', () => {
      const result = simulatePoW(miners, difficulty);

      expect(result.winner).toBeDefined();
      expect(miners.map(m => m.name)).toContain(result.winner);
      expect(result.attempts).toBeDefined();
      expect(result.attempts['Miner1']).toBeDefined();
      expect(result.attempts['Miner2']).toBeDefined();
      expect(result.timeMs).toBeGreaterThan(0);
    });
  });

  describe('PoS', () => {
    const validators = [
      { name: 'Val1', stake: 100 },
      { name: 'Val2', stake: 200 },
    ];

    it('should select a validator based on stake', () => {
      const result = simulatePoS(validators);

      expect(result.selected).toBeDefined();
      expect(validators.map(v => v.name)).toContain(result.selected);
      expect(result.probability['Val1']).toBeCloseTo(100/300, 2);
      expect(result.probability['Val2']).toBeCloseTo(200/300, 2);
    });
  });

  describe('DPoS', () => {
    const delegates = [
      { name: 'Del1', votes: 10 },
      { name: 'Del2', votes: 20 },
      { name: 'Del3', votes: 5 },
      { name: 'Del4', votes: 30 },
    ];
    const topN = 2;

    it('should select top N delegates', () => {
      const result = simulateDPoS(delegates, topN);

      expect(result.activeDelegates).toHaveLength(topN);
      expect(result.activeDelegates).toContain('Del4'); // 30 votes
      expect(result.activeDelegates).toContain('Del2'); // 20 votes
      expect(result.activeDelegates).not.toContain('Del1'); // 10 votes
      expect(result.activeDelegates).not.toContain('Del3'); // 5 votes

      expect(result.blockProducer).toBeDefined();
      expect(result.activeDelegates).toContain(result.blockProducer);
    });
  });
});
