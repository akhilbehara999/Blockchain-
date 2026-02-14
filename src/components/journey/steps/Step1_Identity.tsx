import React from 'react';
import { useProgress } from '../../../context/ProgressContext';

const Step1_Identity: React.FC = () => {
  const { completeStep } = useProgress();

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Step 1: Identity</h2>
      <p className="mb-6 text-gray-600 dark:text-gray-300">
        In this step, you will learn about cryptographic identity, public keys, and private keys.
        (Content Coming Soon)
      </p>

      <button
        onClick={() => completeStep(1)}
        className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
      >
        Complete Step 1
      </button>
    </div>
  );
};

export default Step1_Identity;
