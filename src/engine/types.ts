
export interface Block {
  index: number;
  timestamp: number;
  data: string;
  previousHash: string;
  nonce: number;
  hash: string;
}

export interface Transaction {
  from: string;
  to: string;
  amount: number;
  fee?: number;
  signature: string;
  timestamp: number;
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
  state: Record<string, any>;
  conditions: ContractCondition[];
}

export interface ContractCondition {
  type: string;
  params: Record<string, any>;
  action: string;
}

export interface MerkleNode {
  hash: string;
  left?: MerkleNode;
  right?: MerkleNode;
  data?: string;
}
