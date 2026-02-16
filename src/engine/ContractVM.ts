import type { ExecutionResult, VMStep } from './types';

export interface StateSnapshot {
  state: any;
}

export class ContractVM {
  private currentState: any;

  constructor(initialState: any = {}) {
    try {
      this.currentState = JSON.parse(JSON.stringify(initialState));
    } catch {
      this.currentState = {};
    }
  }

  captureState(): StateSnapshot {
    try {
      return { state: JSON.parse(JSON.stringify(this.currentState)) };
    } catch {
      return { state: {} };
    }
  }

  restoreState(snapshot: StateSnapshot): void {
    try {
      this.currentState = JSON.parse(JSON.stringify(snapshot.state));
    } catch {
      this.currentState = {};
    }
  }

  setState(state: any): void {
    try {
      this.currentState = JSON.parse(JSON.stringify(state));
    } catch {
      this.currentState = {};
    }
  }

  getState(): any {
    return this.currentState;
  }

  async execute(
    steps: VMStep[],
    gasLimit: number,
    gasPrice: number,
    onStep?: (index: number, gasUsed: number, totalGasUsed: number) => void
  ): Promise<ExecutionResult> {
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

          const result = step.action(this.currentState);

          // Update state if result is provided
          if (result !== undefined) {
             if (typeof result === 'object' && result !== null) {
                 this.currentState = { ...this.currentState, ...result };
             } else {
                 // Or it might return the full new state?
                 // Assuming action modifies state or returns partial update.
                 // Let's assume partial update for object, or replacement?
                 // Given the simple templates, usually it's a spread update.
                 // But some templates replace state.
                 // Let's assume the action logic handles state update and returns the NEW state or partial.
                 // To be safe, let's assume result IS the new state if returned.
                 this.currentState = result;
             }
          }
        } catch (error: any) {
          // Wrap error to distinguish from OOG
          throw new Error(error.message || 'Execution failed');
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

    } catch (error: any) {
      // Rollback
      this.restoreState(snapshot);

      const isOutOfGas = error.message === 'Out of gas';
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
        revertReason: error.message
      };
    }
  }
}
