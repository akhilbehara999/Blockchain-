import React, { useState, useEffect } from 'react';
import ModuleLayout from '../components/layout/ModuleLayout';
import ForkViz from '../components/blockchain/ForkViz';
import ForkVisualizer from '../components/consensus/ForkVisualizer';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { Block } from '../engine/types';
import { createBlock } from '../engine/block';
import { GitBranch, GitMerge, AlertTriangle, RefreshCw, Plus, GitCommit } from 'lucide-react';

const M12_Forks: React.FC = () => {
  const [chain, setChain] = useState<Block[]>([]);
  const [forkPoint, setForkPoint] = useState<number>(-1);
  const [forkType, setForkType] = useState<'none' | 'soft' | 'hard'>('none');
  const [chainA, setChainA] = useState<Block[]>([]); // Original (Hard Fork)
  const [chainB, setChainB] = useState<Block[]>([]); // Forked (Hard Fork)

  useEffect(() => {
    initializeChain();
  }, []);

  const initializeChain = () => {
    let currentChain: Block[] = [];
    let previousHash = '0';

    for (let i = 0; i < 6; i++) {
      const block = createBlock(i, `Block #${i}`, previousHash, 1);
      currentChain.push(block);
      previousHash = block.hash;
    }

    setChain(currentChain);
    setForkPoint(-1);
    setForkType('none');
    setChainA([]);
    setChainB([]);
  };

  const handleBlockClick = (block: Block) => {
    if (forkType !== 'none') return; // Disable selection if fork active
    if (block.index === chain.length - 1) return; // Can't fork from very last block (trivial)
    setForkPoint(block.index);
  };

  const startSoftFork = () => {
    if (forkPoint === -1) return;
    setForkType('soft');
    // Soft fork doesn't split chain array, just visual rendering of future blocks
  };

  const startHardFork = () => {
    if (forkPoint === -1) return;
    setForkType('hard');

    // Initialize both chains with shared history
    const sharedHistory = chain.slice(0, forkPoint + 1);

    // Chain A (Original) - contains full history so far
    setChainA([...chain]);

    // Chain B (New Rules) - starts diverging after fork point
    // Ideally it starts with just shared history, but to make it interesting,
    // let's say it starts empty after fork point?
    // Or we copy the existing tail to Chain A and start Chain B fresh?
    // Yes: Chain A keeps existing blocks. Chain B starts at fork point.
    setChainB([...sharedHistory]);
  };

  const addBlock = (targetChain: 'main' | 'A' | 'B') => {
    if (targetChain === 'main') {
      setChain(prev => {
        const last = prev[prev.length - 1];
        const newBlock = createBlock(prev.length, `Block #${prev.length}`, last.hash, 1);
        return [...prev, newBlock];
      });
    } else if (targetChain === 'A') {
      setChainA(prev => {
        const last = prev[prev.length - 1];
        const newBlock = createBlock(prev.length, `Original Block #${prev.length}`, last.hash, 1);
        return [...prev, newBlock];
      });
    } else if (targetChain === 'B') {
      setChainB(prev => {
        const last = prev[prev.length - 1];
        const newBlock = createBlock(prev.length, `Forked Block #${prev.length}`, last.hash, 1);
        return [...prev, newBlock];
      });
    }
  };

  return (
    <ModuleLayout moduleId="forks" title="Forks" subtitle="Diverging paths in consensus">
      <div className="space-y-8">
        {/* Controls */}
        <Card>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h3 className="font-bold text-lg mb-1">Fork Management</h3>
              <p className="text-sm text-text-secondary">
                {forkType === 'none'
                  ? "Select a block to set as the fork point."
                  : `Active ${forkType === 'soft' ? 'Soft' : 'Hard'} Fork at Block #${forkPoint}`}
              </p>
            </div>

            <div className="flex items-center space-x-3">
              {forkType === 'none' ? (
                <>
                  <Button
                    variant="secondary"
                    onClick={startSoftFork}
                    disabled={forkPoint === -1}
                  >
                    <GitMerge className="w-4 h-4 mr-2" />
                    Soft Fork
                  </Button>
                  <Button
                    variant="primary"
                    onClick={startHardFork}
                    disabled={forkPoint === -1}
                  >
                    <GitBranch className="w-4 h-4 mr-2" />
                    Hard Fork
                  </Button>
                </>
              ) : (
                <Button variant="outline" onClick={initializeChain}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reset Simulation
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Visualization */}
        <Card className="overflow-x-auto">
          <ForkViz
            chain={chain}
            forkPoint={forkPoint}
            forkType={forkType}
            chainA={chainA}
            chainB={chainB}
            onBlockClick={handleBlockClick}
          />

          {/* Add Block Buttons */}
          <div className="mt-6 flex justify-end space-x-4">
            {forkType === 'none' && (
              <Button onClick={() => addBlock('main')}>
                <Plus className="w-4 h-4 mr-2" />
                Add Block
              </Button>
            )}
            {forkType === 'soft' && (
              <Button onClick={() => addBlock('main')} className="border-success/50 text-success bg-success/10 hover:bg-success/20">
                <Plus className="w-4 h-4 mr-2" />
                Add v2 Block (Compatible)
              </Button>
            )}
            {forkType === 'hard' && (
              <div className="flex flex-col space-y-2">
                 <Button size="sm" onClick={() => addBlock('A')} className="bg-indigo-500 hover:bg-indigo-600 border-none">
                   <Plus className="w-3 h-3 mr-2" />
                   Add to Original (Chain A)
                 </Button>
                 <Button size="sm" onClick={() => addBlock('B')} className="bg-purple-500 hover:bg-purple-600 border-none">
                   <Plus className="w-3 h-3 mr-2" />
                   Add to Forked (Chain B)
                 </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Info Panels */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card title="Soft Fork" className={forkType === 'soft' ? 'border-accent ring-1 ring-accent' : ''}>
            <div className="flex items-start mb-4">
              <div className="p-2 bg-success/10 rounded-lg mr-3">
                <GitMerge className="w-5 h-5 text-success" />
              </div>
              <p className="text-sm text-text-secondary">
                A backward-compatible upgrade. Old nodes will recognize the new blocks as valid. The chain remains a single line, but new blocks might have stricter rules.
              </p>
            </div>
            {forkType === 'soft' && (
               <div className="text-xs bg-tertiary-bg p-2 rounded text-text-secondary">
                 Notice how new blocks are marked "v2" but attach to the same chain.
               </div>
            )}
          </Card>

          <Card title="Hard Fork" className={forkType === 'hard' ? 'border-accent ring-1 ring-accent' : ''}>
            <div className="flex items-start mb-4">
              <div className="p-2 bg-purple-500/10 rounded-lg mr-3">
                <GitBranch className="w-5 h-5 text-purple-500" />
              </div>
              <p className="text-sm text-text-secondary">
                A permanent divergence in the blockchain. New rules are incompatible with old ones. Nodes running old software cannot accept the new chain.
              </p>
            </div>
             {forkType === 'hard' && (
               <div className="text-xs bg-tertiary-bg p-2 rounded text-text-secondary">
                 The chain has split! You can now mine blocks on either chain independently.
               </div>
            )}
          </Card>
        </div>

        {/* Historical Examples */}
        <div className="pt-4 border-t border-white/5">
          <h3 className="text-lg font-bold mb-4">Historical Examples</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-tertiary-bg/30 p-4 rounded-xl border border-white/5">
              <div className="flex items-center mb-2">
                <GitBranch className="w-4 h-4 mr-2 text-yellow-500" />
                <h4 className="font-bold">Bitcoin Cash (2017)</h4>
              </div>
              <p className="text-xs text-text-secondary">
                A hard fork of Bitcoin. The disagreement was over block size (1MB vs 8MB). Since the rules were incompatible, the chain split into BTC and BCH.
              </p>
            </div>

            <div className="bg-tertiary-bg/30 p-4 rounded-xl border border-white/5">
              <div className="flex items-center mb-2">
                <AlertTriangle className="w-4 h-4 mr-2 text-indigo-500" />
                <h4 className="font-bold">The DAO Hack (2016)</h4>
              </div>
              <p className="text-xs text-text-secondary">
                Ethereum hard forked to reverse a massive theft. The original chain (where the theft happened) continued as Ethereum Classic (ETC), while the new chain became Ethereum (ETH).
              </p>
            </div>
          </div>
        </div>

        {/* Live Network Monitor */}
        <div className="pt-8 border-t border-white/5">
          <h3 className="text-lg font-bold mb-4 flex items-center">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2"></span>
            Live Network Monitor
          </h3>
          <p className="text-sm text-text-secondary mb-4">
            Watch for natural forks occurring in the background network simulation.
            Forks happen when two miners find blocks simultaneously (approx. 15% chance).
          </p>
          <ForkVisualizer />
        </div>
      </div>
    </ModuleLayout>
  );
};

export default M12_Forks;
