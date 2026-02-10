import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { sha256 } from '../../engine/hash';

interface MerkleTreeVizProps {
  transactions: string[];
  selectedLeaf: number | null;
  onSelectLeaf: (index: number) => void;
}

interface Node {
  hash: string;
  x: number;
  y: number;
  level: number;
  index: number; // index within the level
  children: Node[];
}

const MerkleTreeViz: React.FC<MerkleTreeVizProps> = ({
  transactions,
  selectedLeaf,
  onSelectLeaf,
}) => {
  // Tree building logic
  const treeLevels = useMemo(() => {
    const levels: Node[][] = [];
    const spacing = 100;
    const startX = 50; // offset to center
    const startY = 350;
    const levelHeight = 80;

    // Level 0: Leaves
    // We assume max 8 transactions for this viz to fit
    const leaves: Node[] = transactions.map((tx, i) => ({
      hash: sha256(tx),
      x: startX + i * spacing,
      y: startY,
      level: 0,
      index: i,
      children: [],
    }));
    levels.push(leaves);

    // Build up
    let currentLevel = leaves;
    let levelIndex = 1;
    while (currentLevel.length > 1) {
      const nextLevel: Node[] = [];
      for (let i = 0; i < currentLevel.length; i += 2) {
        const left = currentLevel[i];
        const right = i + 1 < currentLevel.length ? currentLevel[i + 1] : left; // Duplicate if odd

        const hash = sha256(left.hash + right.hash);
        const x = (left.x + right.x) / 2;
        const y = startY - levelIndex * levelHeight;

        nextLevel.push({
          hash,
          x,
          y,
          level: levelIndex,
          index: nextLevel.length,
          children: [left, right], // Store children for drawing lines
        });
      }
      levels.push(nextLevel);
      currentLevel = nextLevel;
      levelIndex++;
    }

    return levels;
  }, [transactions]);

  const isHighlighted = (node: Node) => {
    if (selectedLeaf === null) return false;
    let idx = selectedLeaf;
    for (let i = 0; i < node.level; i++) {
        idx = Math.floor(idx / 2);
    }
    return node.index === idx;
  };

  const isDimmed = (node: Node) => {
      if (selectedLeaf === null) return false;
      return !isHighlighted(node);
  };

  const width = 850; // slightly wider
  const height = 400;

  return (
    <div className="w-full overflow-x-auto bg-secondary-bg/50 rounded-xl border border-tertiary-bg p-4 flex justify-center">
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="min-w-[800px]">
        {/* Lines */}
        {treeLevels.slice(1).map((level) =>
          level.map((node) =>
            node.children.map((child, i) => {
              const highlight = isHighlighted(node) && isHighlighted(child);
              const dim = selectedLeaf !== null && !highlight;

              return (
                <motion.line
                    key={`line-${node.level}-${node.index}-${i}`}
                    animate={{
                        opacity: dim ? 0.1 : 0.5,
                        stroke: highlight ? '#6366F1' : '#9CA3AF',
                        strokeWidth: highlight ? 3 : 2
                    }}
                    x1={child.x}
                    y1={child.y}
                    x2={node.x}
                    y2={node.y}
                />
              );
            })
          )
        )}

        {/* Nodes */}
        {treeLevels.map((level) =>
          level.map((node) => {
            const highlight = isHighlighted(node);
            const dim = isDimmed(node);

            return (
                <motion.g
                    key={`node-${node.level}-${node.index}`}
                    onClick={() => node.level === 0 && onSelectLeaf(node.index)}
                    className={node.level === 0 ? "cursor-pointer" : ""}
                    animate={{ opacity: dim ? 0.3 : 1 }}
                >
                <motion.rect
                    animate={{
                        fill: highlight ? '#6366F1' : '#1C1C27',
                        stroke: highlight ? '#818CF8' : '#374151',
                    }}
                    x={node.x - 40}
                    y={node.y - 15}
                    width={80}
                    height={30}
                    rx={6}
                    strokeWidth={highlight ? 2 : 1}
                />
                <text
                    x={node.x}
                    y={node.y}
                    dy={5}
                    textAnchor="middle"
                    fontSize={10}
                    fontFamily="monospace"
                    fill={highlight ? '#FFFFFF' : '#9CA3AF'}
                    className="select-none pointer-events-none"
                >
                    {node.hash.substring(0, 8)}...
                </text>
                </motion.g>
            );
          })
        )}
      </svg>
    </div>
  );
};

export default MerkleTreeViz;
