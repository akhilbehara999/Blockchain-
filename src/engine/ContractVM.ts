import { ExecutionResult, VMStep } from './types';

/**
 * Type definition for generic contract state.
 * Using Record<string, unknown> to represent arbitrary JSON-serializable state.
 */
export type ContractState = Record<string, unknown>;

export interface StateSnapshot {
  state: ContractState;
}

/**
 * Virtual Machine for executing smart contract logic.
 * Handles state management, gas metering, and rollback on failure.
 */
export class ContractVM {
  private currentState: ContractState;

  /**
   * Initializes the VM with an optional initial state.
   * @param initialState - The starting state object
   */
  constructor(initialState: ContractState = {}) {
    try {
      this.currentState = JSON.parse(JSON.stringify(initialState));
    } catch {
      this.currentState = {};
    }
  }

  /**
   * Captures a snapshot of the current state.
   * Useful for rollback mechanisms.
   * @returns A deep copy of the current state
   */
  captureState(): StateSnapshot {
    try {
      return { state: JSON.parse(JSON.stringify(this.currentState)) };
    } catch {
      return { state: {} };
    }
  }

  /**
   * Restores the state from a snapshot.
   * @param snapshot - The snapshot to restore
   */
  restoreState(snapshot: StateSnapshot): void {
    try {
      this.currentState = JSON.parse(JSON.stringify(snapshot.state));
    } catch {
      this.currentState = {};
    }
  }

  /**
   * Directly sets the state (useful for debugging or initialization).
   * @param state - The new state object
   */
  setState(state: ContractState): void {
    try {
      this.currentState = JSON.parse(JSON.stringify(state));
    } catch {
      this.currentState = {};
    }
  }

  /**
   * Returns the current state.
   * @returns The current state object
   */
  getState(): ContractState {
    return this.currentState;
  }

  /**
   * Executes a sequence of VM steps.
   *
   * @param steps - List of steps to execute
   * @param gasLimit - Maximum gas allowed for execution
   * @param gasPrice - Price per unit of gas (for cost calculation)
   * @param onStep - Optional callback for step-by-step visualization
   * @returns ExecutionResult containing success status, gas usage, and final state or error
   */
  async execute(
    steps: VMStep[],
    gasLimit: number,
    gasPrice: number,
    onStep?: (index: number, gasUsed: number, totalGasUsed: number) => void
  ): Promise<ExecutionResult> {
    if (gasLimit <= 0) {
        return {
            success: false,
            gasUsed: 0,
            gasRefunded: 0,
            cost: 0,
            revertReason: 'Invalid gas limit'
        };
    }

    let totalGasUsed = 0;
    const snapshot = this.captureState();

    try {
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];

        // Check if we have enough gas for this step
        if (totalGasUsed + step.cost > gasLimit) {
          throw new Error('Out of gas');
        }

        // Execute the step action
        try {
          // Simulate processing time for visualization
          await new Promise(resolve => setTimeout(resolve, 800));

          // Use strict typing for action result
          const result = step.action(this.currentState);

          // Update state if result is provided
          if (result !== undefined && result !== null) {
              // Assume action returns partial or full new state
              this.currentState = { ...this.currentState, ...result };
          }
        } catch (error) {
          const msg = error instanceof Error ? error.message : 'Execution failed';
          throw new Error(msg);
        }

        totalGasUsed += step.cost;
        if (onStep) {
          onStep(i, step.cost, totalGasUsed);
        }
      }

      // Success
      const gasRefunded = gasLimit - totalGasUsed;
      const cost = totalGasUsed * gasPrice;

      return {
        success: true,
        gasUsed: totalGasUsed,
        gasRefunded,
        cost,
        result: this.currentState
      };

    } catch (error) {
      // Rollback
      this.restoreState(snapshot);

      const msg = error instanceof Error ? error.message : 'Unknown error';
      const isOutOfGas = msg === 'Out of gas';
      let finalGasUsed = totalGasUsed;
      let gasRefunded = 0;

      if (isOutOfGas) {
        finalGasUsed = gasLimit; // OOG consumes all gas
        gasRefunded = 0;
      } else {
        // Revert consumes gas used up to the point of failure
        finalGasUsed = totalGasUsed;
        gasRefunded = gasLimit - totalGasUsed;
      }

      return {
        success: false,
        gasUsed: finalGasUsed,
        gasRefunded,
        cost: finalGasUsed * gasPrice,
        revertReason: msg
      };
    }
  }
}
