import { generateKeyPair } from './wallet';
import { Storage } from '../utils/storage';

export interface NodeIdentityData {
  id: string;
  walletAddress: string;
  keyPair: {
    publicKey: string;
    privateKey: string;
  };
  firstSeen: string;
}

export class NodeIdentity {
  private data: NodeIdentityData;
  public isNew: boolean = false;

  private constructor(data: NodeIdentityData, isNew: boolean = false) {
    this.data = data;
    this.isNew = isNew;
  }

  static getOrCreate(): NodeIdentity {
    const stored = Storage.getItem<NodeIdentityData>('yupp_node_identity');
    if (stored) {
       return new NodeIdentity(stored, false);
    }

    // Generate new identity
    const { publicKey, privateKey } = generateKeyPair();

    // Generate a random ID for the node
    const randomBytes = new Uint8Array(4);
    crypto.getRandomValues(randomBytes);
    const randomHex = Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0')).join('');
    const id = `Node #${randomHex.substring(0, 4).toUpperCase()}`;

    // Derive address from public key (first 40 chars)
    const walletAddress = `0x${publicKey.substring(0, 40)}`;

    const data: NodeIdentityData = {
      id,
      walletAddress,
      keyPair: {
        publicKey,
        privateKey
      },
      firstSeen: new Date().toISOString()
    };

    Storage.setItem('yupp_node_identity', data);
    return new NodeIdentity(data, true);
  }

  getId(): string {
    return this.data.id;
  }

  getPublicKey(): string {
    return this.data.keyPair.publicKey;
  }

  getWalletAddress(): string {
    return this.data.walletAddress;
  }

  getFirstSeen(): Date {
    return new Date(this.data.firstSeen);
  }
}
