import { backgroundEngine } from './BackgroundEngine';

export type EventType =
  | 'PEER_CONNECT'
  | 'PEER_DISCONNECT'
  | 'DELAYED_BLOCK'
  | 'ORPHAN_BLOCK'
  | 'MEMPOOL_SPIKE'
  | 'DIFFICULTY_ADJUSTMENT'
  | 'HASH_RATE_CHANGE';

export interface NetworkEvent {
  id: string;
  type: EventType;
  message: string;
  timestamp: number; // Unix timestamp
  impact: string;
  icon?: string; // Optional icon name or emoji
}

type EventListener = (event: NetworkEvent) => void;

export class EventEngine {
  private isRunning: boolean = false;
  private eventTimeout: NodeJS.Timeout | null = null;
  private events: NetworkEvent[] = []; // Circular buffer logic in addEvent
  private listeners: EventListener[] = [];
  private maxEvents: number = 50;

  constructor() {
  }

  public start() {
    if (this.isRunning) return;
    this.isRunning = true;

    this.scheduleNextEvent();
  }

  public stop() {
    this.isRunning = false;
    if (this.eventTimeout) clearTimeout(this.eventTimeout);
  }

  public getRecentEvents(count: number = 20): NetworkEvent[] {
    return this.events.slice(-count).reverse(); // Newest first
  }

  public getEvents(): NetworkEvent[] {
    return [...this.events];
  }

  public restoreEvents(events: NetworkEvent[]): void {
      this.events = events;
  }

  public onEvent(callback: EventListener) {
    this.listeners.push(callback);
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  public triggerEvent(type?: EventType) {
    if (!type) {
        this.generateRandomEvent();
    } else {
        // Logic to force specific event type
        const event = this.createEventObject(type);
        this.applyEventEffect(event);
        this.recordEvent(event);
    }
  }

  private scheduleNextEvent() {
    if (!this.isRunning) return;

    // 30-90 seconds
    const delay = Math.floor(Math.random() * (90000 - 30000 + 1)) + 30000;

    this.eventTimeout = setTimeout(() => {
      this.generateRandomEvent();
      this.scheduleNextEvent();
    }, delay);
  }

  private generateRandomEvent() {
    const rand = Math.random() * 100;
    let type: EventType;

    if (rand < 20) type = 'PEER_CONNECT'; // 20%
    else if (rand < 35) type = 'PEER_DISCONNECT'; // 15%
    else if (rand < 55) type = 'DELAYED_BLOCK'; // 20%
    else if (rand < 65) type = 'ORPHAN_BLOCK'; // 10%
    else if (rand < 80) type = 'MEMPOOL_SPIKE'; // 15%
    else if (rand < 90) type = 'DIFFICULTY_ADJUSTMENT'; // 10%
    else type = 'HASH_RATE_CHANGE'; // 10%

    const event = this.createEventObject(type);
    this.applyEventEffect(event);
    this.recordEvent(event);
  }

  private createEventObject(type: EventType): NetworkEvent {
    const id = crypto.randomUUID();
    const timestamp = Date.now();
    let message = '';
    let impact = '';
    let icon = '';

    switch (type) {
      case 'PEER_CONNECT':
        message = `New peer Node #${Math.floor(Math.random() * 0xFFFF).toString(16).toUpperCase()} connected`;
        impact = 'Peer count +1';
        icon = 'network';
        break;
      case 'PEER_DISCONNECT':
        message = `Peer Node #${Math.floor(Math.random() * 0xFFFF).toString(16).toUpperCase()} disconnected`;
        impact = 'Peer count -1';
        icon = 'network-off';
        break;
      case 'DELAYED_BLOCK':
        const blockNum = Math.floor(Math.random() * 1000) + 100; // Fake block number for flavor
        message = `Block #${blockNum} arrived late (network congestion)`;
        impact = 'Block delay increased';
        icon = 'clock';
        break;
      case 'ORPHAN_BLOCK':
        message = 'Orphan block received. Waiting for parent...';
        impact = 'Block held';
        icon = 'help-circle';
        break;
      case 'MEMPOOL_SPIKE':
        const pending = Math.floor(Math.random() * 20) + 10;
        message = `Mempool spike: ${pending} pending transactions`;
        impact = `${pending} txs added`;
        icon = 'trending-up';
        break;
      case 'DIFFICULTY_ADJUSTMENT':
        const change = (Math.random() * 10).toFixed(1);
        const direction = Math.random() > 0.5 ? '+' : '-';
        message = `Difficulty adjusted: ${direction}${change}%`;
        impact = 'Mining difficulty updated';
        icon = 'bar-chart';
        break;
      case 'HASH_RATE_CHANGE':
        const miner = ['Miner_Alpha', 'Miner_Beta', 'Miner_Charlie'][Math.floor(Math.random() * 3)];
        const rateChange = Math.floor(Math.random() * 20) + 5;
        message = `${miner} increased hash rate by ${rateChange}%`;
        impact = 'Hash rates updated';
        icon = 'zap';
        break;
    }

    return { id, type, message, timestamp, impact, icon };
  }

  private applyEventEffect(event: NetworkEvent) {
    switch (event.type) {
      case 'PEER_CONNECT':
        backgroundEngine.addPeer();
        break;
      case 'PEER_DISCONNECT':
        backgroundEngine.removePeer();
        break;
      case 'DELAYED_BLOCK':
        // Increase delay for next block, then reset
        backgroundEngine.setBlockDelayMultiplier(1.5);
        // Reset after 60s
        setTimeout(() => backgroundEngine.setBlockDelayMultiplier(1.0), 60000);
        break;
      case 'ORPHAN_BLOCK':
        // Just visual for now, as simulating real orphan logic is complex
        // But we can pause mining briefly to simulate "waiting"
        backgroundEngine.setBlockDelayMultiplier(2.0);
        setTimeout(() => backgroundEngine.setBlockDelayMultiplier(1.0), 15000);
        break;
      case 'MEMPOOL_SPIKE':
        backgroundEngine.triggerMempoolSpike();
        break;
      case 'DIFFICULTY_ADJUSTMENT':
        // Affect block delay to simulate difficulty impact
        if (event.message.includes('+')) {
            backgroundEngine.setBlockDelayMultiplier(1.2);
        } else {
            backgroundEngine.setBlockDelayMultiplier(0.8);
        }
        setTimeout(() => backgroundEngine.setBlockDelayMultiplier(1.0), 60000);
        break;
      case 'HASH_RATE_CHANGE':
        backgroundEngine.adjustMinerHashRates(1.15); // Increase
        // Reset after some time
        setTimeout(() => backgroundEngine.adjustMinerHashRates(1/1.15), 60000);
        break;
    }
  }

  private recordEvent(event: NetworkEvent) {
    this.events.push(event);
    if (this.events.length > this.maxEvents) {
      this.events.shift();
    }
    this.notifyListeners(event);
  }

  private notifyListeners(event: NetworkEvent) {
    this.listeners.forEach(listener => listener(event));
  }
}

export const eventEngine = new EventEngine();
