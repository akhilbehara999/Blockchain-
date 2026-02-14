import React from 'react';
import ModeToggle from './ModeToggle';
import MasteryTracker from './MasteryTracker';

const SandboxToolbar: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2 flex items-center justify-between shrink-0">
      <div className="flex items-center space-x-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Sandbox</h2>
        <ModeToggle />
      </div>
      <div className="flex items-center space-x-4">
        <MasteryTracker />
      </div>
    </div>
  );
};

export default SandboxToolbar;
