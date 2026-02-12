import { useState, useCallback } from 'react';
import { NetworkSimulator } from '../engine/NetworkSimulator';

// Singleton instance to be shared across components
const networkSimulator = new NetworkSimulator();

export interface NetworkDelayHook {
  propagateBlock: (block: any, callback: () => void) => void;
  broadcastTransaction: (tx: any, callback: () => void) => void;
  lastLatency: number;
  isWaiting: boolean;
}

export const useNetworkDelay = (): NetworkDelayHook => {
  const [isWaiting, setIsWaiting] = useState(false);
  const [lastLatency, setLastLatency] = useState(0);

  const propagateBlock = useCallback((block: any, callback: () => void) => {
    setIsWaiting(true);
    networkSimulator.propagateBlock(block, () => {
      setLastLatency(networkSimulator.getLatency());
      setIsWaiting(false);
      callback();
    });
  }, []);

  const broadcastTransaction = useCallback((tx: any, callback: () => void) => {
    setIsWaiting(true);
    networkSimulator.broadcastTransaction(tx, () => {
      setLastLatency(networkSimulator.getLatency());
      setIsWaiting(false);
      callback();
    });
  }, []);

  return {
    propagateBlock,
    broadcastTransaction,
    lastLatency,
    isWaiting
  };
};
