import React from 'react';
import { useProgress } from '../../../context/ProgressContext';

const Step4_Chain: React.FC = () => {
  const { completeStep } = useProgress();

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Step 4: Chain</h2>
      <p className="mb-6 text-gray-600 dark:text-gray-300">
        See how blocks are linked together to form an immutable chain.
        (Content Coming Soon)
      </p>

      <button
        onClick={() => completeStep(4)}
        className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
      >
        Complete Step 4
      </button>
    </div>
  );
};

export default Step4_Chain;
