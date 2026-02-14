import React from 'react';
import SandboxLayout from '../components/sandbox/SandboxLayout';
import { useProgress } from '../context/ProgressContext';
import { Lock } from 'lucide-react';
import Button from '../components/ui/Button'; // Assuming Button exists in ui/Button

const Sandbox: React.FC = () => {
  const { sandboxUnlocked } = useProgress();

  if (!sandboxUnlocked) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
          <Lock className="w-10 h-10 text-gray-400" />
        </div>
        <h1 className="text-3xl font-bold mb-4">Sandbox Locked</h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-md mb-8">
          The Sandbox is a free-play environment where you can experiment with blockchain mechanics.
          Complete the entire Journey to unlock this mode.
        </p>
        <Button onClick={() => window.history.back()}>Go Back</Button>
      </div>
    );
  }

  return <SandboxLayout />;
};

export default Sandbox;
