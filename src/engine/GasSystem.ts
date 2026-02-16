
export const GAS_COSTS = {
  TRANSFER: 21000,
  STORE: 45000,
  READ: 2100,
  LOGIC_MIN: 100000,
  LOGIC_MAX: 500000,
  DEPLOY_MIN: 500000,
  DEPLOY_MAX: 2000000,
};

import type { ExecutionResult } from './types';

export type { ExecutionResult };

export class GasSystem {
  static estimateGas(operation: string): number {
    switch (operation.toLowerCase()) {
      case 'transfer':
        return GAS_COSTS.TRANSFER;
      case 'store':
        return GAS_COSTS.STORE;
      case 'read':
        return GAS_COSTS.READ;
      case 'complex':
        // Average for estimation
        return Math.floor((GAS_COSTS.LOGIC_MIN + GAS_COSTS.LOGIC_MAX) / 2);
      case 'deploy':
        return Math.floor((GAS_COSTS.DEPLOY_MIN + GAS_COSTS.DEPLOY_MAX) / 2);
      default:
        // Default to complex if unknown, or maybe 0? Let's safeguard.
        return GAS_COSTS.TRANSFER;
    }
  }

  static getCurrentGasPrice(): number {
    // Market-determined price simulation
    // Base 20 Gwei + random fluctuation 0-30
    const base = 20;
    const fluctuation = Math.floor(Math.random() * 31);
    return base + fluctuation;
  }

  /**
   * Simulates execution with gas constraints.
   * @param operation The operation type
   * @param args Arguments for the operation (unused in basic simulation)
   * @param gasLimit The maximum gas the user is willing to spend
   * @param gasPrice The price per unit of gas
   * @param actualGasUsed Optional: if the operation was actually executed by a VM, pass the real gas used here.
   *                      If not provided, we simulate based on the operation type.
   */
  static executeWithGas(
    operation: string,
    _args: any[],
    gasLimit: number,
    gasPrice: number,
    actualGasUsed?: number
  ): ExecutionResult {
    let requiredGas = actualGasUsed;

    if (requiredGas === undefined) {
      // Simulation mode
      switch (operation.toLowerCase()) {
        case 'transfer':
          requiredGas = GAS_COSTS.TRANSFER;
          break;
        case 'store':
          requiredGas = GAS_COSTS.STORE;
          break;
        case 'read':
          requiredGas = GAS_COSTS.READ;
          break;
        case 'complex':
           // Randomly determine actual cost for complex ops in simulation
           requiredGas = Math.floor(Math.random() * (GAS_COSTS.LOGIC_MAX - GAS_COSTS.LOGIC_MIN + 1)) + GAS_COSTS.LOGIC_MIN;
           break;
        case 'deploy':
           requiredGas = Math.floor(Math.random() * (GAS_COSTS.DEPLOY_MAX - GAS_COSTS.DEPLOY_MIN + 1)) + GAS_COSTS.DEPLOY_MIN;
           break;
        default:
           requiredGas = GAS_COSTS.TRANSFER;
      }
    }

    if (gasLimit < requiredGas) {
      // Out of gas
      return {
        success: false,
        gasUsed: gasLimit, // Miner takes all provided gas up to limit (which is less than required)
        gasRefunded: 0,
        cost: gasLimit * gasPrice, // User pays full limit
        revertReason: 'Out of gas'
      };
    }

    // Success
    const gasUsed = requiredGas;
    const gasRefunded = gasLimit - gasUsed;
    const cost = gasUsed * gasPrice;

    return {
      success: true,
      gasUsed,
      gasRefunded,
      cost,
      result: `Executed ${operation}`
    };
  }
}
