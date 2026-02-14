import React from 'react';
import { useProgress } from '../../../context/ProgressContext';

const Step7_Consensus: React.FC = () => {
  const { completeStep } = useProgress();

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Step 7: Consensus</h2>
      <p className="mb-6 text-gray-600 dark:text-gray-300">
        Explore how distributed nodes agree on the state of the blockchain.
        (Content Coming Soon)
      </p>

      <button
        onClick={() => completeStep(7)}
        className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
      >
        Complete Step 7
      </button>
    </div>
  );
};

export default Step7_Consensus;
