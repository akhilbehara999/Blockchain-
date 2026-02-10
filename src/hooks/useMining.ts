import { useState, useRef, useCallback, useEffect } from 'react';

interface MiningResult {
  nonce: number;
  hash: string;
}

export function useMining() {
  const [isMining, setIsMining] = useState(false);
  const [nonce, setNonce] = useState(0);
  const [hash, setHash] = useState('');
  const [progress, setProgress] = useState(0);
  const workerRef = useRef<Worker | null>(null);

  const stopMine = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
    setIsMining(false);
  }, []);

  const startMine = useCallback((blockData: any, difficulty: number, onComplete?: (result: MiningResult) => void) => {
    // Ensure previous worker is stopped
    if (workerRef.current) {
      workerRef.current.terminate();
    }

    // Create new worker
    workerRef.current = new Worker(new URL('../engine/miner.worker.ts', import.meta.url), { type: 'module' });

    workerRef.current.onmessage = (e: MessageEvent) => {
      const { type, nonce: currentNonce, hash: currentHash } = e.data;
      if (type === 'progress') {
        setNonce(currentNonce);
        setHash(currentHash);
        setProgress(currentNonce);
      } else if (type === 'result') {
        setNonce(currentNonce);
        setHash(currentHash);
        setIsMining(false);
        if (onComplete) {
          onComplete({ nonce: currentNonce, hash: currentHash });
        }
        workerRef.current?.terminate();
        workerRef.current = null;
      }
    };

    setIsMining(true);
    setNonce(0);
    setHash('');
    setProgress(0);

    workerRef.current.postMessage({ blockData, difficulty });
  }, []);

  useEffect(() => {
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, []);

  return { startMine, stopMine, isMining, nonce, hash, progress };
}
