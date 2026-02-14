import React from 'react';
import { Lock, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface StepLockProps {
  isLocked: boolean;
  targetStep: number;
  onUnlock?: () => void;
}

const StepLock: React.FC<StepLockProps> = ({ isLocked, targetStep, onUnlock }) => {
  if (!isLocked) return null;

  const previousStep = targetStep - 1;

  return (
    <div className="absolute inset-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md flex items-center justify-center z-20 rounded-xl transition-all duration-500">
      <div className="text-center space-y-6 max-w-md px-6">
        <div className="relative mx-auto w-20 h-20">
             <div className="absolute inset-0 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse" />
             <div className="absolute inset-0 flex items-center justify-center">
                <Lock className="w-10 h-10 text-gray-400 dark:text-gray-500" />
             </div>
        </div>

        <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Step {targetStep} is Locked</h3>
            <p className="text-gray-600 dark:text-gray-300">
            Complete <span className="font-semibold text-indigo-600 dark:text-indigo-400">Step {previousStep}</span> first to unlock this step.
            </p>
        </div>

        {previousStep > 0 && (
            <Link
            to={`/journey/${previousStep}`}
            className="inline-flex items-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40"
            >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go to Step {previousStep}
            </Link>
        )}

        {onUnlock && (
          <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
            <button
                onClick={onUnlock}
                className="text-xs text-gray-400 hover:text-indigo-500 underline"
            >
                Developer Override: Unlock This Step
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StepLock;
