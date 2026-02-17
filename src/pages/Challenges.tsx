import React, { useState } from 'react';
import ChallengeList from '../components/challenges/ChallengeList';
import ChallengeLayout from '../components/challenges/ChallengeLayout';
import { useProgress } from '../context/ProgressContext';
import { Lock } from 'lucide-react';
import Button from '../components/ui/Button';

// Challenge Components
import DoubleSpendChallenge from '../components/challenges/challenges/DoubleSpendChallenge';
import ForkChallenge from '../components/challenges/challenges/ForkChallenge';
import FailedContractChallenge from '../components/challenges/challenges/FailedContractChallenge';
import SpeedConfirmChallenge from '../components/challenges/challenges/SpeedConfirmChallenge';
import StormChallenge from '../components/challenges/challenges/StormChallenge';

const Challenges: React.FC = () => {
  const { challengesUnlocked } = useProgress();
  const [activeChallengeId, setActiveChallengeId] = useState<string | null>(null);

  if (!challengesUnlocked) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 animate-in fade-in">
        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
          <Lock className="w-10 h-10 text-gray-400" />
        </div>
        <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Challenges Locked</h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-md mb-8">
          Test your skills with advanced scenarios like Double Spends and 51% Attacks.
          Unlock the Sandbox first to access Challenges.
        </p>
        <Button onClick={() => window.history.back()}>Go Back</Button>
      </div>
    );
  }

  const getChallengeDetails = (id: string) => {
      switch (id) {
          case 'doubleSpend': return { title: 'Double Spend Attack', description: 'Attempt to spend the same UTXO twice.' };
          case 'fork': return { title: 'Cause a Fork', description: 'Create a competing chain split.' };
          case 'crashContract': return { title: 'Crash a Contract', description: 'Exploit contract vulnerabilities.' };
          case 'speedConfirm': return { title: 'Speed Confirmation', description: 'Beat the network congestion.' };
          case 'storm': return { title: 'Survive the Storm', description: 'The ultimate network stress test.' };
          default: return { title: 'Challenge', description: '' };
      }
  };

  const renderActiveChallenge = () => {
      if (!activeChallengeId) return null;

      const Component = (() => {
          switch (activeChallengeId) {
              case 'doubleSpend': return DoubleSpendChallenge;
              case 'fork': return ForkChallenge;
              case 'crashContract': return FailedContractChallenge;
              case 'speedConfirm': return SpeedConfirmChallenge;
              case 'storm': return StormChallenge;
              default: return null;
          }
      })();

      if (!Component) return null;

      const details = getChallengeDetails(activeChallengeId);

      return (
          <ChallengeLayout
            title={details.title}
            description={details.description}
            onBack={() => setActiveChallengeId(null)}
            challengeId={activeChallengeId}
          >
              <Component />
          </ChallengeLayout>
      );
  };

  if (activeChallengeId) {
      return renderActiveChallenge();
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-12 text-center py-10 bg-gradient-to-b from-indigo-50/50 to-transparent dark:from-indigo-900/10 rounded-3xl border border-indigo-50 dark:border-indigo-900/20">
        <h1 className="font-display text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Prove Your Mastery
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Complete these advanced scenarios to test your deep understanding of blockchain mechanics.
        </p>
      </div>

      <ChallengeList onSelectChallenge={setActiveChallengeId} />
    </div>
  );
};

export default Challenges;
