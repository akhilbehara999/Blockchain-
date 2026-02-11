import React, { useState, useEffect } from 'react';
import ModuleLayout from '../components/layout/ModuleLayout';
import BlockCard from '../components/blockchain/BlockCard';
import Card from '../components/ui/Card';
import { Block } from '../engine/types';
import { calculateHash } from '../engine/block';
import { useMining } from '../hooks/useMining';

const Coinbase: React.FC = () => {
  const [block, setBlock] = useState<Block>({
    index: 1,
    timestamp: Date.now(),
    data: 'Coinbase: 50.00 TKN -> Miner',
    previousHash: '0000000000000000000000000000000000000000000000000000000000000000',
    nonce: 0,
    hash: '',
  });

  const { startMine, stopMine, isMining, nonce: minedNonce, hash: minedHash } = useMining();

  useEffect(() => {
    // Initial calculation
    const initialHash = calculateHash(block);
    setBlock(prev => ({ ...prev, hash: initialHash }));
  }, []);

  // Sync with miner
  useEffect(() => {
    if (isMining) {
      setBlock(prev => ({ ...prev, nonce: minedNonce, hash: minedHash }));
    }
  }, [minedNonce, minedHash, isMining]);


  const handleDataChange = (newData: string) => {
    if (isMining) stopMine();
    const updated = { ...block, data: newData };
    updated.hash = calculateHash(updated);
    setBlock(updated);
  };

  const handleMine = () => {
    // Mining difficulty 3 for demo
    startMine(block, 3, (result) => {
       setBlock(prev => ({ ...prev, nonce: result.nonce, hash: result.hash }));
    });
  };

  const getStatus = () => {
      if (isMining) return 'mining';
      // Use difficulty 3 for this demo as well
      if (block.hash.startsWith('000')) return 'valid';
      return 'invalid';
  };

  return (
    <ModuleLayout moduleId="coinbase" title="Coinbase Transaction" subtitle="Where do coins come from?">
      <div className="space-y-8 max-w-4xl mx-auto">
        <Card className="bg-gradient-to-br from-secondary-bg to-tertiary-bg border-none">
          <div className="p-6">
            <h3 className="text-lg font-bold text-text-primary mb-2">The First Transaction</h3>
            <p className="text-text-secondary">
              The first transaction in every block is special. It's called the <span className="text-accent font-bold">Coinbase Transaction</span>.
              It has no sender, and it creates new coins out of thin air to reward the miner who found the block.
            </p>
          </div>
        </Card>

        <BlockCard
            block={block}
            editable={true}
            onDataChange={handleDataChange}
            onMine={handleMine}
            status={getStatus()}
        />
      </div>
    </ModuleLayout>
  );
};

export default Coinbase;
