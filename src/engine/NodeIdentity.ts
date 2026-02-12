
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
    const stored = localStorage.getItem('yupp_node_identity');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        return new NodeIdentity(data, false);
      } catch (e) {
        console.error('Failed to parse node identity', e);
      }
    }

    // Generate new identity
    const randomBytes = new Uint8Array(32);
    crypto.getRandomValues(randomBytes);
    const randomHex = Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0')).join('');

    const privateKeyBytes = new Uint8Array(32);
    crypto.getRandomValues(privateKeyBytes);
    const privateKey = Array.from(privateKeyBytes).map(b => b.toString(16).padStart(2, '0')).join('');

    const publicKeyBytes = new Uint8Array(33);
    crypto.getRandomValues(publicKeyBytes);
    const publicKey = Array.from(publicKeyBytes).map(b => b.toString(16).padStart(2, '0')).join('');

    const id = `Node #${randomHex.substring(0, 4).toUpperCase()}`;
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

    localStorage.setItem('yupp_node_identity', JSON.stringify(data));
    return new NodeIdentity(data, true);
  }

  getId(): string {
    return this.data.id;
  }

  getWalletAddress(): string {
    return this.data.walletAddress;
  }

  getFirstSeen(): Date {
    return new Date(this.data.firstSeen);
  }
}
