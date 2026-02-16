import React, { useState } from 'react';
import ChallengeList from '../components/challenges/ChallengeList';
import { useProgress } from '../context/ProgressContext';
import { Lock, ArrowLeft } from 'lucide-react';
import Button from '../components/ui/Button';

// Challenge Components
import DoubleSpendChallenge from '../components/challenges/challenges/DoubleSpendChallenge';
import ForkChallenge from '../components/challenges/challenges/ForkChallenge';
import FailedContractChallenge from '../components/challenges/challenges/FailedContractChallenge';
import SpeedConfirmChallenge from '../components/challenges/challenges/SpeedConfirmChallenge';
import StormChallenge from '../components/challenges/challenges/StormChallenge';

const Challenges: React.FC = () => {
  const { challengesUnlocked } = useProgress();
  const [activeChallenge, setActiveChallenge] = useState<string | null>(null);

  if (!challengesUnlocked) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
          <Lock className="w-10 h-10 text-gray-400" />
        </div>
        <h1 className="text-3xl font-bold mb-4">Challenges Locked</h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-md mb-8">
          Test your skills with advanced scenarios like Double Spends and 51% Attacks.
          Unlock the Sandbox first to access Challenges.
        </p>
        <Button onClick={() => window.history.back()}>Go Back</Button>
      </div>
    );
  }

  const renderActiveChallenge = () => {
      switch (activeChallenge) {
          case 'doubleSpend': return <DoubleSpendChallenge />;
          case 'fork': return <ForkChallenge />;
          case 'crashContract': return <FailedContractChallenge />;
          case 'speedConfirm': return <SpeedConfirmChallenge />;
          case 'storm': return <StormChallenge />;
          default: return null;
      }
  };

  if (activeChallenge) {
      return (
          <div className="container mx-auto px-4 py-8">
              <button
                  onClick={() => setActiveChallenge(null)}
                  className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-6 transition-colors"
              >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back to Challenges
              </button>
              {renderActiveChallenge()}
          </div>
      );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Challenges</h1>
        <p className="text-gray-600 dark:text-gray-400">Put your blockchain mastery to the test.</p>
      </div>
      <ChallengeList onSelectChallenge={setActiveChallenge} />
    </div>
  );
};

export default Challenges;
