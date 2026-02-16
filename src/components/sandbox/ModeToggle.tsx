import React, { useEffect, useState } from 'react';
import { Eye, Server } from 'lucide-react';
import { useSandboxStore } from '../../stores/useSandboxStore';
import { NodeIdentity } from '../../engine/NodeIdentity'; // Correct path

const ModeToggle: React.FC = () => {
  const { mode, setMode } = useSandboxStore();
  const [nodeId, setNodeId] = useState<string>('');

  useEffect(() => {
    // We assume NodeIdentity is available or create a mock one if logic fails in browser env without storage
    try {
        const identity = NodeIdentity.getOrCreate();
        setNodeId(identity.getId());
    } catch (e) {
        setNodeId('Node #UNKNOWN');
    }
  }, []);

  return (
    <div className="flex items-center space-x-3">
      <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
        <button
          onClick={() => setMode('god')}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            mode === 'god'
              ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          <Eye className="w-4 h-4" />
          <span>God Mode</span>
        </button>
        <button
          onClick={() => setMode('node')}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            mode === 'node'
              ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>Node Mode</span>
        </button>
      </div>
      <span className="hidden md:inline-block text-xs text-gray-500 dark:text-gray-400 italic">
        {mode === 'god'
          ? "You see everything — omniscient view"
          : `You are ${nodeId} — limited perspective`}
      </span>
    </div>
  );
};

export default ModeToggle;
