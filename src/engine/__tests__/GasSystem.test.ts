import { describe, it, expect } from 'vitest';
import { GasSystem, GAS_COSTS } from '../GasSystem';
import { ContractVM } from '../ContractVM';
import { VMStep } from '../types';

describe('GasSystem', () => {
  it('estimates gas correctly', () => {
    expect(GasSystem.estimateGas('transfer')).toBe(GAS_COSTS.TRANSFER);
    expect(GasSystem.estimateGas('store')).toBe(GAS_COSTS.STORE);
  });

  it('executes simple transfer', () => {
    const res = GasSystem.executeWithGas('transfer', [], 30000, 10);
    expect(res.success).toBe(true);
    expect(res.gasUsed).toBe(GAS_COSTS.TRANSFER);
    expect(res.gasRefunded).toBe(30000 - GAS_COSTS.TRANSFER);
  });

  it('fails if out of gas', () => {
    const res = GasSystem.executeWithGas('transfer', [], 10000, 10);
    expect(res.success).toBe(false);
    expect(res.gasUsed).toBe(10000);
    expect(res.revertReason).toBe('Out of gas');
  });
});

describe('ContractVM', () => {
  it('executes steps successfully', async () => {
    const vm = new ContractVM({ val: 0 });
    const steps: VMStep[] = [
      { name: 'Inc', cost: 1000, action: (s) => ({ val: ((s as any).val) + 1 }) }
    ];

    const res = await vm.execute(steps, 5000, 10);
    expect(res.success).toBe(true);
    expect(res.gasUsed).toBe(1000);
    expect(((res.result as any).val)).toBe(1);
  });

  it('fails on out of gas', async () => {
    const vm = new ContractVM({ val: 0 });
    const steps: VMStep[] = [
      { name: 'Inc', cost: 6000, action: (s) => ({ val: ((s as any).val) + 1 }) }
    ];

    const res = await vm.execute(steps, 5000, 10);
    expect(res.success).toBe(false);
    expect(res.gasUsed).toBe(5000);
    expect(res.revertReason).toBe('Out of gas');
    expect(vm.getState().val).toBe(0); // State should be reverted
  });

  it('reverts state on error', async () => {
    const vm = new ContractVM({ val: 0 });
    const steps: VMStep[] = [
      { name: 'Inc', cost: 1000, action: (s) => ({ val: ((s as any).val) + 1 }) },
      { name: 'Fail', cost: 1000, action: () => { throw new Error('Fail'); } }
    ];

    const res = await vm.execute(steps, 5000, 10);
    expect(res.success).toBe(false);
    // In current implementation, if step fails, we count its cost?
    // Let's check implementation again.
    // loop -> totalGasUsed + step.cost (check) -> execute -> fail -> catch -> finalGasUsed = totalGasUsed.
    // totalGasUsed is NOT incremented if execute throws.
    // So gasUsed should be 1000 (only first step).
    expect(res.gasUsed).toBe(1000);
    expect(res.revertReason).toBe('Fail');
    expect(vm.getState().val).toBe(0); // State reverted
  });
});
