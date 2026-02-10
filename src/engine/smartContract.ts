import { ContractCondition } from './types';

interface Transaction {
  from: string;
  to: string;
  amount: number;
}

export class SimpleVM {
  private state: Record<string, any> = {};
  private conditions: ContractCondition[] = [];

  constructor() {}

  deploy(conditions: ContractCondition[], initialState: Record<string, any>): void {
    this.conditions = conditions;
    this.state = { ...initialState };
  }

  execute(transaction: Transaction): {
    success: boolean;
    message: string;
    newState: Record<string, any>;
  } {
    // Clone state to avoid mutation if we fail midway (though we stop on first failure)
    const tempState = { ...this.state };

    for (const condition of this.conditions) {
      const { type, params, action } = condition;
      let checkPassed = false;

      // Check condition
      switch (type) {
        case 'minAmount':
          checkPassed = transaction.amount >= params.min;
          break;
        case 'maxAmount':
          checkPassed = transaction.amount <= params.max;
          break;
        case 'exactAmount':
          checkPassed = transaction.amount === params.amount;
          break;
        case 'whitelist':
          checkPassed = params.addresses.includes(transaction.from);
          break;
        case 'blacklist':
          checkPassed = !params.addresses.includes(transaction.from);
          break;
        case 'always':
          checkPassed = true;
          break;
        default:
          return {
            success: false,
            message: `Unknown condition type: ${type}`,
            newState: this.state,
          };
      }

      if (!checkPassed) {
        return {
          success: false,
          message: `Condition failed: ${type}`,
          newState: this.state,
        };
      }

      // Execute action if check passed
      if (action) {
        switch (action) {
          case 'increment_counter':
            tempState.counter = (tempState.counter || 0) + 1;
            break;
          case 'update_balance':
            tempState.balance = (tempState.balance || 0) + transaction.amount;
            break;
          case 'set_last_sender':
            tempState.lastSender = transaction.from;
            break;
          case 'record_transaction':
             if (!tempState.transactions) tempState.transactions = [];
             tempState.transactions.push(transaction);
             break;
          case 'none':
            break;
          default:
            // Warn or fail? Failing is safer for smart contracts.
            return {
              success: false,
              message: `Unknown action: ${action}`,
              newState: this.state,
            };
        }
      }
    }

    // Commit state
    this.state = tempState;

    return {
      success: true,
      message: 'Transaction executed successfully',
      newState: this.state,
    };
  }

  getState(): Record<string, any> {
    return { ...this.state };
  }
}
