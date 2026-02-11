import React, { useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';
import ModuleLayout from '../components/layout/ModuleLayout';
import Card from '../components/ui/Card';
import Slider from '../components/ui/Slider';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import HashDisplay from '../components/blockchain/HashDisplay';
import { calculateHash } from '../engine/block';
import { useMining } from '../hooks/useMining';
import { Block } from '../engine/types';

const Difficulty: React.FC = () => {
  const [difficulty, setDifficulty] = useState(3);
  const [data, setData] = useState('Hello Blockchain!');
  const [nonce, setNonce] = useState(0);
  const [hash, setHash] = useState('');

  const { startMine, stopMine, isMining, nonce: minedNonce } = useMining();

  // Sync nonce from miner
  useEffect(() => {
    if (isMining) {
      setNonce(minedNonce);
    }
  }, [minedNonce, isMining]);

  // Recalculate hash whenever data or nonce changes
  useEffect(() => {
      const currentBlock: Block = {
        index: 1,
        timestamp: 0,
        data: data,
        previousHash: '0000000000000000000000000000000000000000000000000000000000000000',
        nonce: nonce,
        hash: ''
      };
      setHash(calculateHash(currentBlock));
  }, [data, nonce]);

  const handleMine = () => {
      const currentBlock: Block = {
        index: 1,
        timestamp: 0,
        data: data,
        previousHash: '0000000000000000000000000000000000000000000000000000000000000000',
        nonce: 0, // Reset nonce before mining
        hash: ''
      };
      setNonce(0);
      startMine(currentBlock, difficulty, (result) => {
          setNonce(result.nonce);
      });
  };

  const target = '0'.repeat(difficulty);
  const isValid = hash.startsWith(target);

  return (
    <ModuleLayout moduleId="difficulty" title="Mining Difficulty" subtitle="Finding the Golden Nonce">
      <div className="space-y-8 max-w-4xl mx-auto">
        <Card className="bg-gradient-to-br from-secondary-bg to-tertiary-bg border-none">
          <div className="p-6">
            <h3 className="text-lg font-bold text-text-primary mb-2">What is Difficulty?</h3>
            <p className="text-text-secondary">
              To secure the network, miners must solve a puzzle. The puzzle is to find a hash that starts with a specific number of zeros.
              The more zeros required (Difficulty), the harder it is to find a solution.
            </p>
          </div>
        </Card>

        <Card>
            <div className="space-y-6">
                <div>
                    <Slider
                        label="Difficulty (Leading Zeros)"
                        min={1}
                        max={5}
                        value={difficulty}
                        onChange={(val) => {
                            if (isMining) stopMine();
                            setDifficulty(val);
                        }}
                        showValue
                    />
                    <div className="mt-2 text-sm text-text-secondary font-mono">
                        Target: <span className="text-success font-bold">{target}</span>...
                    </div>
                </div>

                <Input
                    label="Data"
                    value={data}
                    onChange={(e) => {
                        if (isMining) stopMine();
                        setData(e.target.value);
                    }}
                />

                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">Nonce</label>
                    <div className="font-mono text-xl text-text-primary bg-tertiary-bg p-3 rounded-xl border border-border">
                        {nonce}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">Hash</label>
                    <HashDisplay hash={hash} highlightLeadingZeros={true} />
                </div>

                <div className="flex justify-between items-center pt-4">
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-text-secondary">Status:</span>
                        {isMining ? (
                             <span className="text-accent font-bold animate-pulse">Mining...</span>
                        ) : isValid ? (
                            <span className="text-success font-bold flex items-center"><Check className="w-4 h-4 mr-1"/> Valid</span>
                        ) : (
                            <span className="text-danger font-bold flex items-center"><X className="w-4 h-4 mr-1"/> Invalid</span>
                        )}
                    </div>

                    <Button
                        onClick={isMining ? stopMine : handleMine}
                        variant={isMining ? "danger" : "primary"}
                        disabled={isValid && !isMining && nonce !== 0} // Allow mining if invalid or if nonce is 0 (fresh start)
                    >
                        {isMining ? "Stop Mining" : "Mine Block"}
                    </Button>
                </div>
            </div>
        </Card>
      </div>
    </ModuleLayout>
  );
};

export default Difficulty;
