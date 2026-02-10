import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Key, Copy, RefreshCw, Check } from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';

interface KeyPairDisplayProps {
  publicKey: string;
  privateKey: string;
  onGenerate: () => void;
}

const KeyPairDisplay: React.FC<KeyPairDisplayProps> = ({
  publicKey,
  privateKey,
  onGenerate
}) => {
  const [showFullKeys, setShowFullKeys] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, type: 'public' | 'private') => {
    navigator.clipboard.writeText(text);
    setCopiedKey(type);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const formatKey = (key: string) => {
    if (showFullKeys) return key;
    return `${key.substring(0, 20)}...${key.substring(key.length - 20)}`;
  };

  return (
    <Card className="relative overflow-hidden">
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-text-primary">Key Pair</h3>
          <Button variant="secondary" size="sm" onClick={onGenerate}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Generate New Pair
          </Button>
        </div>

        {/* Public Key */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-text-secondary">
            <Lock className="w-4 h-4 text-success" />
            <span className="text-sm font-medium">Public Key (Share freely)</span>
          </div>
          <div className="relative group">
            <div className="bg-tertiary-bg p-3 rounded-lg font-mono text-sm break-all text-text-primary border border-border group-hover:border-accent transition-colors">
              {formatKey(publicKey)}
            </div>
            <button
              onClick={() => handleCopy(publicKey, 'public')}
              className="absolute right-2 top-2 p-1.5 rounded-md bg-secondary-bg hover:bg-accent/20 text-text-secondary hover:text-accent transition-colors"
              title="Copy Public Key"
            >
              {copiedKey === 'public' ? (
                <Check className="w-4 h-4 text-success" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Private Key */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-text-secondary">
            <Key className="w-4 h-4 text-danger" />
            <span className="text-sm font-medium">Private Key (Keep secret!)</span>
          </div>
          <div className="relative group">
            <div className="bg-tertiary-bg p-3 rounded-lg font-mono text-sm break-all text-text-primary border border-border group-hover:border-danger transition-colors">
              {formatKey(privateKey)}
            </div>
            <button
              onClick={() => handleCopy(privateKey, 'private')}
              className="absolute right-2 top-2 p-1.5 rounded-md bg-secondary-bg hover:bg-danger/20 text-text-secondary hover:text-danger transition-colors"
              title="Copy Private Key"
            >
              {copiedKey === 'private' ? (
                <Check className="w-4 h-4 text-success" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Toggle Full/Truncated */}
        <div className="flex justify-center pt-2">
           <button
             onClick={() => setShowFullKeys(!showFullKeys)}
             className="text-xs text-text-secondary hover:text-accent underline decoration-dotted transition-colors"
           >
             {showFullKeys ? "Show Less" : "Show Full Keys"}
           </button>
        </div>

        <AnimatePresence>
          {copiedKey && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-secondary-bg border border-border px-3 py-1.5 rounded-full shadow-lg flex items-center space-x-2 pointer-events-none"
            >
              <Check className="w-3 h-3 text-success" />
              <span className="text-xs font-medium text-text-primary">Copied to clipboard</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
};

export default KeyPairDisplay;
