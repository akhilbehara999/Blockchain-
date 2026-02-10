import React, { useState, useMemo } from 'react';
import ModuleLayout from '../components/layout/ModuleLayout';
import MerkleTreeViz from '../components/blockchain/MerkleTreeViz';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import { sha256 } from '../engine/hash';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Info, GitBranch, ArrowRight } from 'lucide-react';

const M10_MerkleTrees: React.FC = () => {
  const [transactions, setTransactions] = useState<string[]>([
    'Alice -> Bob: 5',
    'Bob -> Charlie: 3',
    'Charlie -> Dave: 2',
    'Dave -> Eve: 1',
    'Eve -> Frank: 4',
    'Frank -> Grace: 6',
    'Grace -> Heidi: 8',
    'Heidi -> Ivan: 9',
  ]);

  const [selectedLeaf, setSelectedLeaf] = useState<number | null>(null);

  const handleTransactionChange = (index: number, value: string) => {
    const newTx = [...transactions];
    newTx[index] = value;
    setTransactions(newTx);
  };

  const { proof, root } = useMemo(() => {
    let currentLevel = transactions.map(t => sha256(t));
    const proofPath: string[] = [];

    // Calculate full tree to get root, and capture sibling if selectedLeaf is set
    // But we need to traverse up specifically for the selected path.
    // It's easier to just rebuild the levels and pick the sibling.

    let levels = [currentLevel];
    while (currentLevel.length > 1) {
        const nextLevel: string[] = [];
        for (let i = 0; i < currentLevel.length; i += 2) {
            const left = currentLevel[i];
            const right = i + 1 < currentLevel.length ? currentLevel[i + 1] : left;
            nextLevel.push(sha256(left + right));
        }
        levels.push(nextLevel);
        currentLevel = nextLevel;
    }

    const rootHash = currentLevel[0];

    if (selectedLeaf !== null) {
        let idx = selectedLeaf;
        // Traverse levels up to root (exclusive of root itself for siblings)
        for (let l = 0; l < levels.length - 1; l++) {
            const levelHashes = levels[l];
            // Sibling index
            const siblingIdx = idx % 2 === 0 ? idx + 1 : idx - 1;
            // Handle edge case where sibling might be out of bounds (duplication logic)
            // In our construction, if length is odd, the last node is duplicated.
            // If siblingIdx is out of bounds, it means the current node IS the last odd node,
            // so its sibling is itself (conceptually) or handling logic varies.
            // But here we constructed next level by duplicating if needed.
            // So logic:
            if (siblingIdx < levelHashes.length) {
                proofPath.push(levelHashes[siblingIdx]);
            } else {
                 // If sibling doesn't exist in array, it means we are at the end of odd array.
                 // The tree construction duplicated 'left' to make 'right'.
                 // So sibling is 'left' (which is us).
                 proofPath.push(levelHashes[idx]);
            }
            idx = Math.floor(idx / 2);
        }
    }

    return { proof: proofPath, root: rootHash };
  }, [transactions, selectedLeaf]);

  return (
    <ModuleLayout moduleId="merkletrees" title="Merkle Trees" subtitle="Efficient data verification">
      <div className="space-y-6">

        {/* Viz */}
        <div className="relative">
            <MerkleTreeViz
                transactions={transactions}
                selectedLeaf={selectedLeaf}
                onSelectLeaf={(i) => setSelectedLeaf(selectedLeaf === i ? null : i)}
            />
            {selectedLeaf !== null && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-4 right-4 bg-secondary-bg/90 backdrop-blur p-3 rounded-lg border border-accent/20 shadow-lg max-w-xs"
                >
                    <div className="flex items-center gap-2 mb-2">
                        <Badge variant="success">Efficiency</Badge>
                        <span className="text-xs text-text-secondary">Verify 1 of 8 using {proof.length} hashes</span>
                    </div>
                    <p className="text-xs text-text-secondary">
                        Instead of checking all 8 transactions, you only need the path to the root.
                    </p>
                </motion.div>
            )}
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {transactions.map((tx, i) => (
                <div
                    key={i}
                    className={`relative group ${selectedLeaf === i ? 'ring-2 ring-accent rounded-xl' : ''}`}
                    onClick={() => setSelectedLeaf(i)}
                >
                    <Input
                        label={`Tx ${i+1}`}
                        value={tx}
                        onChange={(e) => handleTransactionChange(i, e.target.value)}
                        className="font-mono text-sm"
                    />
                    {selectedLeaf === i && (
                        <motion.div
                            layoutId="selected-indicator"
                            className="absolute -top-2 -right-2 bg-accent text-white rounded-full p-1 shadow-lg"
                        >
                            <CheckCircle className="w-4 h-4" />
                        </motion.div>
                    )}
                </div>
            ))}
        </div>

        {/* Details Panel */}
        <AnimatePresence>
            {selectedLeaf !== null && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                >
                    <Card className="bg-tertiary-bg/30 border border-tertiary-bg">
                        <div className="flex items-start gap-4">
                            <div className="p-3 rounded-xl bg-accent/10 text-accent hidden sm:block">
                                <GitBranch className="w-6 h-6" />
                            </div>
                            <div className="flex-1 space-y-4">
                                <div>
                                    <h3 className="text-lg font-medium text-text-primary mb-1">Merkle Proof for Transaction #{selectedLeaf + 1}</h3>
                                    <p className="text-sm text-text-secondary">
                                        To prove <span className="font-mono text-accent">{transactions[selectedLeaf]}</span> is in the block,
                                        we only need these {proof.length} hashes plus the root.
                                    </p>
                                </div>

                                <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                                    <div className="px-3 py-2 rounded bg-tertiary-bg border border-tertiary-bg text-text-secondary">
                                        Leaf Hash
                                    </div>
                                    {proof.map((hash, i) => (
                                        <React.Fragment key={i}>
                                            <ArrowRight className="w-4 h-4 text-text-tertiary" />
                                            <div className="px-3 py-2 rounded bg-tertiary-bg border border-accent/20 text-accent">
                                                {hash.substring(0, 8)}...
                                            </div>
                                        </React.Fragment>
                                    ))}
                                    <ArrowRight className="w-4 h-4 text-text-tertiary" />
                                    <div className="px-3 py-2 rounded bg-success/10 border border-success/20 text-success font-bold">
                                        Root: {root.substring(0, 8)}...
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </motion.div>
            )}
        </AnimatePresence>
      </div>
    </ModuleLayout>
  );
};

export default M10_MerkleTrees;
