import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface HashProps {
  value: string;
  truncate?: boolean;
  copyable?: boolean;
  highlight?: 'leading-zeros' | 'mismatch';
  compareWith?: string;
  mono?: boolean; // Plan says "Always use font-mono", so this prop might be redundant but I'll keep it as optional or default true.
  className?: string;
}

const Hash: React.FC<HashProps> = ({
  value,
  truncate = false,
  copyable = false,
  highlight,
  compareWith,
  mono = true,
  className = '',
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!copyable) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy hash:', err);
    }
  };

  const renderContent = () => {
    if (truncate) {
      const start = value.slice(0, 8);
      const end = value.slice(-6);
      return (
        <>
          {renderHighlighted(start, 0)}
          <span className="text-gray-400">...</span>
          {renderHighlighted(end, value.length - 6)}
        </>
      );
    }
    return renderHighlighted(value, 0);
  };

  const renderHighlighted = (text: string, offset: number) => {
    if (highlight === 'leading-zeros') {
      // Find leading zeros in the ORIGINAL value, not just the segment.
      // But if we are rendering segments (start/end), we need to be careful.
      // Simplification: only highlight leading zeros if they are in the 'start' part or if not truncated.

      // Actually, if truncated, we only show start and end. Leading zeros are only at the start.
      // So checking the 'text' variable (which is a segment or full string) is tricky if we don't know if it's the start.
      // But 'offset' tells us where we are.

      if (offset === 0) {
         const match = text.match(/^(0+)/);
         if (match) {
           const zeros = match[1];
           const rest = text.slice(zeros.length);
           return (
             <>
               <span className="text-brand-500 font-bold">{zeros}</span>
               {rest}
             </>
           );
         }
      }
      return text;
    }

    if (highlight === 'mismatch' && compareWith) {
      return text.split('').map((char, index) => {
        const actualIndex = offset + index;
        const isMatch = compareWith[actualIndex] === char;
        return (
          <span key={index} className={!isMatch ? 'text-status-error font-bold' : ''}>
            {char}
          </span>
        );
      });
    }

    return text;
  };

  return (
    <div className={`inline-flex items-center space-x-2 ${className}`}>
      <span
        className={`text-sm break-all ${mono ? 'font-mono' : ''} ${copyable ? 'cursor-pointer hover:bg-surface-hover rounded px-1 -mx-1 transition-colors' : ''}`}
        onClick={handleCopy}
        title={copyable ? "Click to copy" : undefined}
      >
        {renderContent()}
      </span>
      {copyable && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleCopy();
          }}
          className="text-gray-400 hover:text-brand-500 transition-colors focus:outline-none"
          title="Copy to clipboard"
        >
          {copied ? <Check className="w-4 h-4 text-status-valid" /> : <Copy className="w-4 h-4" />}
        </button>
      )}
      {copied && (
        <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg animate-fade-up pointer-events-none">
          Copied!
        </span>
      )}
    </div>
  );
};

export default Hash;
