import React from 'react';
import { Lock } from 'lucide-react';

interface StepLockProps {
  isLocked: boolean;
  onUnlock?: () => void;
}

const StepLock: React.FC<StepLockProps> = ({ isLocked, onUnlock }) => {
  if (!isLocked) return null;

  return (
    <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-xl">
      <div className="text-center space-y-4 max-w-sm px-4">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto shadow-sm">
          <Lock className="w-8 h-8 text-gray-400 dark:text-gray-500" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">This Step is Locked</h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Complete the previous steps to unlock this lesson.
        </p>
        {onUnlock && (
          <button
            onClick={onUnlock}
            className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
          >
            Unlock (Dev Mode)
          </button>
        )}
      </div>
    </div>
  );
};

export default StepLock;
