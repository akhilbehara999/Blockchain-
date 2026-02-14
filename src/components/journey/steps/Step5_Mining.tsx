import React from 'react';
import { useProgress } from '../../../context/ProgressContext';

const Step5_Mining: React.FC = () => {
  const { completeStep } = useProgress();

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Step 5: Mining</h2>
      <p className="mb-6 text-gray-600 dark:text-gray-300">
        Understand the Proof of Work mechanism and how mining secures the network.
        (Content Coming Soon)
      </p>

      <button
        onClick={() => completeStep(5)}
        className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
      >
        Complete Step 5
      </button>
    </div>
  );
};

export default Step5_Mining;
