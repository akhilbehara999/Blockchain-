import React, { useMemo } from 'react';
import BlockCard from './BlockCard';
import ChainConnector from './ChainConnector';
import { Block } from '../../engine/types';
import { useIsMobile } from '../../hooks/useMediaQuery';
import { calculateHash, isBlockValid } from '../../engine/block';

interface ChainViewProps {
  blocks: Block[];
  onBlockEdit: (index: number, newData: string) => void;
  onBlockMine: (index: number) => void;
  difficulty: number;
}

const ChainView: React.FC<ChainViewProps> = ({ blocks, onBlockEdit, onBlockMine, difficulty }) => {
  const isMobile = useIsMobile();
  const direction = isMobile ? 'vertical' : 'horizontal';

  // Determine validity of each block
  const blockStatuses = useMemo(() => {
    let firstInvalidIndex = -1;
    let isChainBroken = false;

    return blocks.map((block, index) => {
      const isGenesis = index === 0;
      const prevBlock = index > 0 ? blocks[index - 1] : null;

      let isValid = true;

      // Check hash integrity (content matches hash)
      if (block.hash !== calculateHash(block)) {
        isValid = false;
      }

      // Check difficulty (hash starts with zeros)
      if (!isBlockValid(block, difficulty)) {
        isValid = false;
      }

      // Check linkage (previousHash matches previous block's hash)
      if (!isGenesis && prevBlock) {
        if (block.previousHash !== prevBlock.hash) {
          isValid = false;
        }
      }

      // Cascade invalidity
      if (!isValid && !isChainBroken) {
          isChainBroken = true;
          firstInvalidIndex = index;
      } else if (isChainBroken) {
          isValid = false;
      }

      const status = isValid ? 'valid' : 'invalid';
      // Calculate delay for cascade effect
      const delay = isChainBroken && firstInvalidIndex !== -1 && index >= firstInvalidIndex
        ? (index - firstInvalidIndex) * 100
        : 0;

      return { status, delay };
    });
  }, [blocks, difficulty]);

  return (
    <div
      role="list"
      aria-label="Blockchain"
      className={`flex ${direction === 'vertical' ? 'flex-col items-center space-y-0' : 'flex-row items-center overflow-x-auto pb-8 space-x-0 cursor-grab active:cursor-grabbing'} p-4 min-h-[500px]`}
    >
      {blocks.map((block, index) => {
        const { status, delay } = blockStatuses[index];

        return (
          <React.Fragment key={block.index}>
            <div role="listitem" className={`shrink-0 ${direction === 'horizontal' ? 'w-80' : 'w-full max-w-md'}`}>
              <BlockCard
                block={block}
                editable={block.index !== 0} // Genesis not editable
                onDataChange={(newData) => onBlockEdit(index, newData)}
                onMine={() => onBlockMine(index)}
                status={status as any}
                delay={delay}
                showAnatomy={false}
              />
            </div>

            {index < blocks.length - 1 && (
              <ChainConnector
                isValid={blockStatuses[index + 1].status === 'valid'}
                direction={direction}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default ChainView;
