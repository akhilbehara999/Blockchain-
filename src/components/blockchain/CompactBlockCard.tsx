import React from 'react';
import { Block } from '../../engine/types';
import Card from '../ui/Card';
import Badge from '../ui/Badge';

interface CompactBlockCardProps {
  block: Block;
  status: 'valid' | 'invalid' | 'neutral';
  onTamper?: (newData: string) => void;
}

const CompactBlockCard: React.FC<CompactBlockCardProps> = ({ block, status, onTamper }) => {
  return (
    <Card
      status={status}
      className="!p-3 mb-2 min-w-[140px]"
    >
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <Badge variant="neutral" className="text-[10px] px-1.5 py-0.5">#{block.index}</Badge>
          <span className="text-[10px] font-mono text-text-tertiary truncate">
             {block.hash.substring(0, 6)}...
          </span>
        </div>

        <input
            type="text"
            value={block.data}
            onChange={(e) => onTamper && onTamper(e.target.value)}
            className={`w-full bg-tertiary-bg rounded px-2 py-1.5 text-xs font-mono border ${
                onTamper ? 'border-border focus:border-accent' : 'border-transparent'
            } outline-none transition-all text-text-secondary`}
            readOnly={!onTamper}
        />
      </div>
    </Card>
  );
};

export default CompactBlockCard;
