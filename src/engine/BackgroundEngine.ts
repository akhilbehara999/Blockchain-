import { useWalletStore } from '../stores/useWalletStore';
import { useBlockchainStore } from '../stores/useBlockchainStore';
import { createTransaction } from './transaction';
import { Wallet } from './types';
import { forkManager } from './ForkManager';

interface Miner {
  name: string;
  hashRate: number; // Probability weight
}

export class BackgroundEngine {
  private _isRunning: boolean = false;
  private txTimeout: NodeJS.Timeout | null = null;
  private miningTimeout: NodeJS.Timeout | null = null;
  private blockDelayMultiplier: number = 1.0;

  private simulatedMiners: Miner[] = [
    { name: 'Miner_Alpha', hashRate: 50 },
    { name: 'Miner_Beta', hashRate: 30 },
    { name: 'Miner_Gamma', hashRate: 20 },
    { name: 'Miner_Delta', hashRate: 10 },
  ];

  private simulatedWalletNames = [
    'Wallet_Alice_Bg', 'Wallet_Bob_Bg', 'Wallet_Charlie_Bg', 'Wallet_Dave_Bg',
    'Wallet_Eve_Bg', 'Wallet_Frank_Bg', 'Wallet_Grace_Bg', 'Wallet_Heidi_Bg',
    'Wallet_Ivan_Bg', 'Wallet_Judy_Bg'
  ];

  public start() {
    if (this._isRunning) return;
    this._isRunning = true;
    console.log('Background Engine Started');

    this.initializeWallets();
    this.startTransactionLoop();
    this.scheduleNextBlock();
  }

  public stop() {
    this._isRunning = false;
    if (this.txTimeout) clearTimeout(this.txTimeout);
    if (this.miningTimeout) clearTimeout(this.miningTimeout);
    console.log('Background Engine Stopped');
  }

  public isRunning(): boolean {
    return this._isRunning;
  }

  public getPeerWallets(): Wallet[] {
    const { wallets } = useWalletStore.getState();
    return wallets.filter(w => this.simulatedWalletNames.includes(w.name));
  }

  public getSimulatedMiners(): Miner[] {
    return this.simulatedMiners;
  }

  // --- Event Engine Hooks ---

  public addPeer(name?: string) {
    const id = Math.floor(Math.random() * 10000).toString(16).toUpperCase();
    const newName = name || `Node_${id}`;
    if (!this.simulatedWalletNames.includes(newName)) {
      this.simulatedWalletNames.push(newName);
      // Initialize wallet
      const { createWallet } = useWalletStore.getState();
      createWallet(newName, 100);
      console.log(`[Background] Added peer ${newName}`);
    }
    return newName;
  }

  public removePeer() {
    if (this.simulatedWalletNames.length <= 2) return; // Keep at least 2
    const index = Math.floor(Math.random() * this.simulatedWalletNames.length);
    const removed = this.simulatedWalletNames.splice(index, 1)[0];
    console.log(`[Background] Removed peer ${removed}`);
    return removed;
  }

  public setBlockDelayMultiplier(multiplier: number) {
    this.blockDelayMultiplier = multiplier;
    console.log(`[Background] Block delay multiplier set to ${multiplier}`);
  }

  public triggerMempoolSpike(count: number = 15) {
      for (let i = 0; i < count; i++) {
          this.createRandomTransaction();
      }
      console.log(`[Background] Triggered mempool spike of ${count} txs`);
  }

  public adjustMinerHashRates(factor: number) {
      this.simulatedMiners.forEach(m => {
          m.hashRate = Math.max(1, Math.floor(m.hashRate * factor));
      });
      console.log(`[Background] Adjusted hash rates by factor ${factor}`);
  }

  // --- End Event Engine Hooks ---

  private initializeWallets() {
    const { wallets, createWallet } = useWalletStore.getState();
    const existingNames = new Set(wallets.map(w => w.name));

    this.simulatedWalletNames.forEach(name => {
      if (!existingNames.has(name)) {
        createWallet(name, 100); // Initial balance
      }
    });
  }

  private startTransactionLoop() {
    const loop = () => {
      if (!this._isRunning) return;

      this.createRandomTransaction();

      // Random interval between 10s and 30s
      const delay = Math.floor(Math.random() * (30000 - 10000 + 1)) + 10000;
      this.txTimeout = setTimeout(loop, delay);
    };
    loop();
  }

  private createRandomTransaction() {
    const { mempool } = useWalletStore.getState();
    const candidates = this.getPeerWallets();

    // Need at least 2 wallets to transact
    if (candidates.length < 2) return;

    const sender = candidates[Math.floor(Math.random() * candidates.length)];
    let receiver = candidates[Math.floor(Math.random() * candidates.length)];

    // Ensure different receiver
    while (receiver.publicKey === sender.publicKey) {
      receiver = candidates[Math.floor(Math.random() * candidates.length)];
    }

    const amount = parseFloat((Math.random() * (10.0 - 0.001) + 0.001).toFixed(4));
    const fee = parseFloat((Math.random() * (0.002 - 0.0001) + 0.0001).toFixed(5));

    if (sender.balance < amount + fee) return;

    // Create transaction
    const tx = createTransaction(sender.publicKey, receiver.publicKey, amount, sender.privateKey, fee);

    // Update store
    useWalletStore.setState({ mempool: [...mempool, tx] });
    console.log(`[Background] Tx: ${sender.name} -> ${receiver.name} (${amount})`);
  }

  private scheduleNextBlock() {
    if (!this._isRunning) return;

    // Exponential distribution
    // Avg 45s (between 30 and 60 roughly)
    const avgTime = 45000 * this.blockDelayMultiplier;
    const delay = -Math.log(Math.random()) * avgTime;

    this.miningTimeout = setTimeout(() => {
      this.mineBlock();
      this.scheduleNextBlock();
    }, delay);
  }

  private mineBlock() {
    const { mempool, wallets } = useWalletStore.getState();
    // const { addBlock } = useBlockchainStore.getState(); // Unused here, we use forkManager

    // Sort by fee (descending)
    const sortedMempool = [...mempool].sort((a, b) => (b.fee || 0) - (a.fee || 0));

    // Take top 5 transactions (or fewer if not enough)
    const txsToMine = sortedMempool.slice(0, 5);

    // Select winner
    const totalHashRate = this.simulatedMiners.reduce((sum, m) => sum + m.hashRate, 0);
    let rand = Math.random() * totalHashRate;
    let winner = this.simulatedMiners[0];
    for (const miner of this.simulatedMiners) {
      rand -= miner.hashRate;
      if (rand <= 0) {
        winner = miner;
        break;
      }
    }

    // Create Block Data
    const txData = txsToMine.map(tx => {
        const fromW = wallets.find(w => w.publicKey === tx.from);
        const toW = wallets.find(w => w.publicKey === tx.to);
        const fromName = fromW ? fromW.name : tx.from.substring(0, 8);
        const toName = toW ? toW.name : tx.to.substring(0, 8);
        return `${fromName}->${toName} (${tx.amount})`;
    }).join(', ');

    const blockData = `Mined by ${winner.name}\n${txData || 'No transactions'}`;

    forkManager.processBlock(blockData, winner.name);
    console.log(`[Background] Block Mined by ${winner.name}`);

    // Update Wallets (Remove mined txs, update balances)
    // Hack: Temporarily set mempool to just txsToMine to use mineMempool logic
    if (txsToMine.length > 0) {
      const leftover = mempool.filter(tx => !txsToMine.includes(tx));

      useWalletStore.setState({ mempool: txsToMine });
      useWalletStore.getState().mineMempool();

      // Restore leftover transactions
      const currentMempool = useWalletStore.getState().mempool; // Should be empty
      useWalletStore.setState({ mempool: [...currentMempool, ...leftover] });
    }
  }
}
