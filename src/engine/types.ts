
export interface Block {
  index: number;
  timestamp: number;
  data: string;
  previousHash: string;
  nonce: number;
  hash: string;
  confirmations?: number;
}

export interface Transaction {
  id?: string;
  from: string;
  to: string;
  amount: number;
  fee?: number;
  signature: string;
  timestamp: number;
  status?: 'pending' | 'confirmed' | 'failed' | 'dropped';
  confirmationBlock?: number;
}

export interface Wallet {
  name: string;
  publicKey: string;
  privateKey: string;
  balance: number;
}

export interface Peer {
  id: string;
  name: string;
  chain: Block[];
}

export interface SmartContract {
  id: string;
  code: string;
  state: Record<string, unknown>;
  conditions: ContractCondition[];
}

export interface ContractCondition {
  type: string;
  params: Record<string, unknown>;
  action: string;
}

export interface MerkleNode {
  hash: string;
  left?: MerkleNode;
  right?: MerkleNode;
  data?: string;
}

export interface ExecutionResult {
  success: boolean;
  gasUsed: number;
  gasRefunded: number;
  cost: number;
  revertReason?: string;
  result?: unknown;
}

export interface VMStep {
  name: string;
  cost: number;
  action: (state: Record<string, unknown>) => Record<string, unknown> | void;
}
