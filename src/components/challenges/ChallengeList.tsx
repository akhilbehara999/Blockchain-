import React from 'react';
import ChallengeCard from './ChallengeCard';
import { useProgress, ChallengesState } from '../../context/ProgressContext';

interface ChallengeListProps {
  onSelectChallenge: (id: string) => void;
}

const ChallengeList: React.FC<ChallengeListProps> = ({ onSelectChallenge }) => {
  const { challenges } = useProgress();

  // Helper to check if a challenge is unlocked
  const isUnlocked = (id: keyof ChallengesState) => {
    switch (id) {
      case 'doubleSpend': return true;
      case 'fork': return challenges.doubleSpend.completed;
      case 'crashContract': return true;
      case 'speedConfirm': return true;
      case 'storm':
        return challenges.doubleSpend.completed &&
               challenges.fork.completed &&
               challenges.crashContract.completed &&
               challenges.speedConfirm.completed;
      default: return false;
    }
  };

  const getStatus = (id: keyof ChallengesState, completed: boolean) => {
      if (completed) return 'completed';
      if (isUnlocked(id)) return 'available';
      return 'locked';
  };

  const challengeData: {
      id: keyof ChallengesState;
      title: string;
      description: string;
      difficulty: number;
      reward: number;
      icon: string;
  }[] = [
    {
      id: 'doubleSpend',
      title: 'Double Spend',
      description: 'Try to spend the same coins twice. Learn why the blockchain rejects conflicting transactions.',
      difficulty: 3,
      reward: 15,
      icon: '💸'
    },
    {
      id: 'fork',
      title: 'Cause a Fork',
      description: 'Manually create a fork and watch the network resolve it using the longest chain rule.',
      difficulty: 4,
      reward: 20,
      icon: '🔀'
    },
    {
      id: 'crashContract',
      title: 'Crash a Contract',
      description: 'Deploy a smart contract and trigger 3 different types of execution failures.',
      difficulty: 2,
      reward: 15,
      icon: '💥'
    },
    {
      id: 'speedConfirm',
      title: 'Speed Confirm',
      description: 'Get a transaction confirmed in under 30 seconds during high network congestion.',
      difficulty: 2,
      reward: 10,
      icon: '⚡'
    },
    {
      id: 'storm',
      title: 'Survive the Storm',
      description: 'Maintain your balance during 5 minutes of intense network chaos, forks, and reorgs.',
      difficulty: 5,
      reward: 25,
      icon: '🌪️'
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-500">
      {challengeData.map((c) => {
        const progress = challenges[c.id];
        const unlocked = isUnlocked(c.id);

        return (
          <ChallengeCard
            key={c.id}
            title={c.title}
            description={c.description}
            isUnlocked={unlocked}
            status={getStatus(c.id, progress.completed)}
            reward={c.reward}
            difficulty={c.difficulty}
            bestTime={progress.bestTime}
            onStart={() => onSelectChallenge(c.id)}
            icon={c.icon}
          />
        );
      })}
    </div>
  );
};

export default ChallengeList;
