
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
        return Math.floor((GAS_COSTS.LOGIC_MIN + GAS_COSTS.LOGIC_MAX) / 2);
      case 'deploy':
        return Math.floor((GAS_COSTS.DEPLOY_MIN + GAS_COSTS.DEPLOY_MAX) / 2);
      default:
        return GAS_COSTS.TRANSFER;
    }
  }

  static getCurrentGasPrice(): number {
    const base = 20;
    const fluctuation = Math.floor(Math.random() * 31);
    return base + fluctuation;
  }

  /**
   * Simulates execution with gas constraints.
   * @param operation The operation type
   * @param _args Arguments for the operation (unused in basic simulation)
   * @param gasLimit The maximum gas the user is willing to spend
   * @param gasPrice The price per unit of gas
   * @param actualGasUsed Optional: if the operation was actually executed by a VM, pass the real gas used here.
   */
  static executeWithGas(
    operation: string,
    _args: unknown[],
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
      return {
        success: false,
        gasUsed: gasLimit,
        gasRefunded: 0,
        cost: gasLimit * gasPrice,
        revertReason: 'Out of gas'
      };
    }

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
