import React from 'react';
import { Lock, Trophy } from 'lucide-react';

interface ChallengeCardProps {
  title: string;
  description: string;
  isUnlocked: boolean;
  isCompleted: boolean;
  reward: number;
  onStart: () => void;
}

const ChallengeCard: React.FC<ChallengeCardProps> = ({
  title,
  description,
  isUnlocked,
  isCompleted,
  reward,
  onStart,
}) => {
  return (
    <div className={`
      relative rounded-xl p-6 border transition-all duration-300
      ${isUnlocked
        ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-lg'
        : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 opacity-75'
      }
    `}>
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
        <div className="flex items-center space-x-2">
          {isCompleted && <span className="text-green-500 font-bold text-sm">Completed</span>}
          {!isUnlocked && <Lock className="w-5 h-5 text-gray-400" />}
        </div>
      </div>

      <p className="text-gray-600 dark:text-gray-300 mb-6">{description}</p>

      <div className="flex items-center justify-between">
        <div className="flex items-center text-yellow-600 dark:text-yellow-500 font-medium">
          <Trophy className="w-4 h-4 mr-1" />
          <span>{reward} pts</span>
        </div>

        <button
          onClick={onStart}
          disabled={!isUnlocked}
          className={`
            px-4 py-2 rounded-lg font-medium transition-colors
            ${isUnlocked
              ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
              : 'bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          {isCompleted ? 'Replay' : 'Start Challenge'}
        </button>
      </div>
    </div>
  );
};

export default ChallengeCard;
