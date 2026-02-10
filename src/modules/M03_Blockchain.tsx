import React, { useEffect, useState, useMemo } from 'react';
import ModuleLayout from '../components/layout/ModuleLayout';
import ChainView from '../components/blockchain/ChainView';
import { useBlockchainStore } from '../stores/useBlockchainStore';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import Card from '../components/ui/Card';
import { Plus, RefreshCw } from 'lucide-react';
import { calculateHash, isBlockValid } from '../engine/block';

const M03_Blockchain: React.FC = () => {
  const {
    blocks,
    difficulty,
    initializeWithData,
    addBlock,
    editBlock,
    mineBlock,
  } = useBlockchainStore();

  const [newBlockData, setNewBlockData] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // Initialize data on mount
  useEffect(() => {
    const initialData = [
      "Genesis Block",
      "Alice pays Bob 5 coins",
      "Bob pays Charlie 3 coins",
      "Charlie pays Alice 1 coin",
      "Alice pays Dave 2 coins"
    ];
    initializeWithData(initialData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleReset = () => {
    const initialData = [
      "Genesis Block",
      "Alice pays Bob 5 coins",
      "Bob pays Charlie 3 coins",
      "Charlie pays Alice 1 coin",
      "Alice pays Dave 2 coins"
    ];
    initializeWithData(initialData);
  };

  const handleAddBlock = () => {
    if (newBlockData.trim()) {
      addBlock(newBlockData);
      setNewBlockData('');
      setShowAddForm(false);
    }
  };

  // Calculate valid chain length
  const validCount = useMemo(() => {
    let count = 0;
    for (let i = 0; i < blocks.length; i++) {
        const block = blocks[i];
        let isValid = true;

        // Check hash integrity
        if (block.hash !== calculateHash(block)) isValid = false;

        // Check difficulty
        if (!isBlockValid(block, difficulty)) isValid = false;

        // Check linkage
        if (i > 0 && block.previousHash !== blocks[i-1].hash) isValid = false;

        if (!isValid) break; // Chain broken
        count++;
    }
    return count;
  }, [blocks, difficulty]);

  const allValid = validCount === blocks.length;

  return (
    <ModuleLayout moduleId="blockchain" title="Blockchain" subtitle="Link blocks together to form a chain">
       {/* Controls & Status */}
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-4">
             <Badge variant={allValid ? 'success' : 'danger'}>
                {validCount} / {blocks.length} Blocks Valid
             </Badge>
             {!allValid && (
                 <span className="text-sm text-text-secondary animate-pulse">
                     Fix the broken chain!
                 </span>
             )}
          </div>
          <Button variant="secondary" onClick={handleReset} className="flex items-center gap-2">
             <RefreshCw className="w-4 h-4" /> Reset Chain
          </Button>
       </div>

       {/* Chain View */}
       <div className="mb-8">
          <ChainView
            blocks={blocks}
            onBlockEdit={editBlock}
            onBlockMine={mineBlock}
            difficulty={difficulty}
          />
       </div>

       {/* Add Block Section */}
       <div className="flex justify-end pb-10">
          {!showAddForm ? (
            <Button onClick={() => setShowAddForm(true)} variant="primary" className="flex items-center gap-2">
               <Plus className="w-4 h-4" /> Add New Block
            </Button>
          ) : (
            <Card className="w-full max-w-md p-4 animate-in fade-in slide-in-from-bottom-4 bg-tertiary-bg/50">
               <div className="space-y-4">
                  <h4 className="text-sm font-medium text-text-secondary">New Block Data</h4>
                  <div className="flex gap-2">
                      <div className="flex-1">
                        <Input
                            value={newBlockData}
                            onChange={(e) => setNewBlockData(e.target.value)}
                            placeholder="Enter transaction data..."
                            autoFocus
                            onKeyDown={(e) => e.key === 'Enter' && handleAddBlock()}
                        />
                      </div>
                      <Button onClick={handleAddBlock} disabled={!newBlockData.trim()}>Add</Button>
                      <Button variant="ghost" onClick={() => setShowAddForm(false)}>Cancel</Button>
                  </div>
               </div>
            </Card>
          )}
       </div>
    </ModuleLayout>
  );
};

export default M03_Blockchain;
