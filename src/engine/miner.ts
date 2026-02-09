import { sha256 } from './hash';

interface BlockData {
  index: number;
  data: string;
  previousHash: string;
  timestamp: number;
}

export async function mine(
  blockData: BlockData,
  difficulty: number,
  onProgress?: (nonce: number, hash: string) => void
): Promise<{ nonce: number; hash: string }> {
  let nonce = 0;
  const target = '0'.repeat(difficulty);

  return new Promise((resolve) => {
    const step = () => {
      const iterations = 100;
      for (let i = 0; i < iterations; i++) {
        const input = `${blockData.index}${blockData.previousHash}${blockData.timestamp}${blockData.data}${nonce}`;
        const hash = sha256(input);

        if (hash.startsWith(target)) {
          resolve({ nonce, hash });
          return;
        }

        if (onProgress && nonce % 1000 === 0) {
          onProgress(nonce, hash);
        }

        nonce++;
      }
      setTimeout(step, 0);
    };

    step();
  });
}
