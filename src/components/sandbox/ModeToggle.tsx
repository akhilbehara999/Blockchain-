import React, { useState } from 'react';
import { Eye, Server } from 'lucide-react';

const ModeToggle: React.FC = () => {
  const [mode, setMode] = useState<'god' | 'node'>('god');

  return (
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
  );
};

export default ModeToggle;
