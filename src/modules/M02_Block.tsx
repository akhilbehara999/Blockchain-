import React, { useState, useEffect } from 'react';
import ModuleLayout from '../components/layout/ModuleLayout';
import BlockCard from '../components/blockchain/BlockCard';
import Slider from '../components/ui/Slider';
import Toggle from '../components/ui/Toggle';
import { Block } from '../engine/types';
import { calculateHash } from '../engine/block';
import { useMining } from '../hooks/useMining';

const M02_Block: React.FC = () => {
  const [difficulty, setDifficulty] = useState(2);
  const [showAnatomy, setShowAnatomy] = useState(false);
  const [block, setBlock] = useState<Block>({
    index: 1,
    timestamp: Date.now(),
    data: 'Welcome to the Blockchain Demo!',
    previousHash: '0000000000000000000000000000000000000000000000000000000000000000',
    nonce: 0,
    hash: '',
  });

  const { startMine, stopMine, isMining, nonce: minedNonce, hash: minedHash } = useMining();

  // Initial setup: ensure block is valid for difficulty 2
  useEffect(() => {
    // We clone the initial block state (captured in closure)
    let tempBlock = { ...block };

    // Calculate initial hash
    tempBlock.hash = calculateHash(tempBlock);

    const target = '0'.repeat(2);

    // Simple synchronous mining for low difficulty to ensure valid start
    if (!tempBlock.hash.startsWith(target)) {
        let nonce = 0;
        // Safety limit to prevent freezing if difficulty 2 is somehow hard (it shouldn't be)
        while (!calculateHash({ ...tempBlock, nonce }).startsWith(target)) {
            nonce++;
            if (nonce > 100000) break;
        }
        tempBlock.nonce = nonce;
        tempBlock.hash = calculateHash(tempBlock);
    }

    setBlock(tempBlock);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDataChange = (newData: string) => {
    if (isMining) stopMine();
    const updatedBlock = { ...block, data: newData };
    updatedBlock.hash = calculateHash(updatedBlock);
    setBlock(updatedBlock);
  };

  // Sync state with miner
  useEffect(() => {
    if (isMining) {
        setBlock(prev => ({ ...prev, nonce: minedNonce, hash: minedHash }));
    }
  }, [minedNonce, minedHash, isMining]);

  const handleMine = () => {
    startMine(block, difficulty, (result) => {
        setBlock(prev => ({
            ...prev,
            nonce: result.nonce,
            hash: result.hash
        }));
    });
  };

  const getStatus = () => {
      if (isMining) return 'mining';
      const target = '0'.repeat(difficulty);
      if (block.hash.startsWith(target)) return 'valid';
      return 'invalid';
  };

  return (
    <ModuleLayout moduleId="block" title="Block" subtitle="Understand the Block structure">
      <div className="space-y-8 max-w-3xl mx-auto">

        {/* Controls */}
        <div className="bg-secondary-bg/50 p-6 rounded-xl border border-border/50 backdrop-blur-sm space-y-6">
            <div className="flex flex-col md:flex-row gap-8 justify-between items-center">
                <div className="w-full md:w-1/2">
                    <Slider
                        label="Difficulty"
                        min={1}
                        max={4}
                        value={difficulty}
                        onChange={setDifficulty}
                        showValue
                    />
                     <p className="text-xs text-text-secondary mt-2">
                        Requires {difficulty} leading zeros in the hash.
                    </p>
                </div>
                 <div className="flex items-center gap-4">
                     <Toggle
                        label="Block Anatomy"
                        checked={showAnatomy}
                        onChange={setShowAnatomy}
                     />
                 </div>
            </div>
        </div>

        {/* Block Card */}
        <BlockCard
            block={block}
            editable={!isMining}
            onDataChange={handleDataChange}
            onMine={handleMine}
            showAnatomy={showAnatomy}
            status={getStatus()}
        />
      </div>
    </ModuleLayout>
  );
};

export default M02_Block;
