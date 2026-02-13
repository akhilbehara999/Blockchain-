import { describe, it, expect, beforeEach } from 'vitest';
import { Mempool } from '../Mempool';
import { FEE_LEVELS } from '../transaction';
import { Transaction } from '../types';

describe('Mempool', () => {
  let mempool: Mempool;

  beforeEach(() => {
    mempool = new Mempool();
  });

  const createTx = (signature: string, fee: number, timestamp: number = Date.now()): Transaction => ({
    from: 'Alice',
    to: 'Bob',
    amount: 10,
    fee,
    signature,
    timestamp,
  });

  it('adds transactions and sorts by fee', () => {
    const tx1 = createTx('tx1', FEE_LEVELS.ECONOMY);
    const tx2 = createTx('tx2', FEE_LEVELS.HIGH);
    const tx3 = createTx('tx3', FEE_LEVELS.STANDARD);

    mempool.addTransaction(tx1);
    mempool.addTransaction(tx2);
    mempool.addTransaction(tx3);

    const pending = mempool.getAllPending();
    expect(pending[0].signature).toBe('tx2'); // High
    expect(pending[1].signature).toBe('tx3'); // Standard
    expect(pending[2].signature).toBe('tx1'); // Economy
  });

  it('limits block size to 10', () => {
    for (let i = 0; i < 15; i++) {
      mempool.addTransaction(createTx(`tx${i}`, FEE_LEVELS.STANDARD));
    }

    const blockTxs = mempool.getTransactionsForBlock();
    expect(blockTxs.length).toBe(10);
  });

  it('replaces fee correctly', () => {
    const tx1 = createTx('tx1', FEE_LEVELS.ECONOMY);
    mempool.addTransaction(tx1);

    mempool.replaceFee('tx1', FEE_LEVELS.HIGH);
    const pending = mempool.getAllPending();

    expect(pending[0].fee).toBe(FEE_LEVELS.HIGH);
  });

  it('does not replace with lower fee', () => {
      const tx1 = createTx('tx1', FEE_LEVELS.HIGH);
      mempool.addTransaction(tx1);

      mempool.replaceFee('tx1', FEE_LEVELS.ECONOMY);
      const pending = mempool.getAllPending();
      expect(pending[0].fee).toBe(FEE_LEVELS.HIGH);
  });

  it('prunes old low fee transactions', () => {
    const now = Date.now();
    const oldTime = now - (31 * 60 * 1000); // 31 mins ago

    const txOldLow = createTx('oldLow', 0.00001, oldTime);
    const txOldHigh = createTx('oldHigh', FEE_LEVELS.HIGH, oldTime);
    const txNewLow = createTx('newLow', 0.00001, now);

    mempool.addTransaction(txOldLow);
    mempool.addTransaction(txOldHigh);
    mempool.addTransaction(txNewLow);

    // Trigger prune via getTransactionsForBlock
    mempool.getTransactionsForBlock();

    // Check pending list
    const pending = mempool.getAllPending();
    const signatures = pending.map(t => t.signature);

    expect(signatures).not.toContain('oldLow');
    expect(signatures).toContain('oldHigh');
    expect(signatures).toContain('newLow');
  });

  it('calculates position correctly', () => {
     mempool.addTransaction(createTx('tx1', FEE_LEVELS.ECONOMY));
     mempool.addTransaction(createTx('tx2', FEE_LEVELS.HIGH));

     expect(mempool.getPosition('tx2')).toBe(1);
     expect(mempool.getPosition('tx1')).toBe(2);
     expect(mempool.getPosition('nonexistent')).toBe(-1);
  });
});
