import SHA256 from 'crypto-js/sha256';

interface BlockData {
  index: number;
  data: string;
  previousHash: string;
  timestamp: number;
}

self.onmessage = (e: MessageEvent) => {
  const { blockData, difficulty } = e.data as { blockData: BlockData; difficulty: number };
  const target = '0'.repeat(difficulty);
  let nonce = 0;

  function mineBatch() {
    const iterations = 1000; // Batch size
    for (let i = 0; i < iterations; i++) {
      const input = `${blockData.index}${blockData.previousHash}${blockData.timestamp}${blockData.data}${nonce}`;
      // SHA256 returns an object, we need to convert to string
      const hash = SHA256(input).toString();

      if (hash.startsWith(target)) {
        self.postMessage({ type: 'result', nonce, hash });
        return; // Done
      }

      if (nonce % 1000 === 0) {
        self.postMessage({ type: 'progress', nonce, hash });
      }

      nonce++;
    }
    // Continue in next tick to allow message processing
    setTimeout(mineBatch, 0);
  }

  mineBatch();
};
