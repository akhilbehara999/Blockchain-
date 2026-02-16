import React from 'react';
import { Lock, Trophy, Star, Clock, CheckCircle } from 'lucide-react';

interface ChallengeCardProps {
  title: string;
  description: string;
  isUnlocked: boolean;
  status: 'locked' | 'available' | 'completed';
  reward: number;
  difficulty: number;
  bestTime?: number | null;
  onStart: () => void;
}

const ChallengeCard: React.FC<ChallengeCardProps> = ({
  title,
  description,
  isUnlocked,
  status,
  reward,
  difficulty,
  bestTime,
  onStart,
}) => {
  return (
    <div className={`
      relative rounded-xl p-6 border transition-all duration-300 flex flex-col
      ${isUnlocked
        ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-lg'
        : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 opacity-75'
      }
    `}>
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
        <div className="flex items-center space-x-2">
           {/* Stars */}
           <div className="flex text-yellow-400">
             {[...Array(5)].map((_, i) => (
               <Star key={i} className={`w-3 h-3 ${i < difficulty ? 'fill-current' : 'text-gray-300 dark:text-gray-600'}`} />
             ))}
           </div>
        </div>
      </div>

      <div className="mb-4 flex items-center space-x-2">
         {status === 'completed' && <span className="px-2 py-0.5 rounded text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 flex items-center"><CheckCircle className="w-3 h-3 mr-1"/> Completed</span>}
         {status === 'locked' && <span className="px-2 py-0.5 rounded text-xs font-bold bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 flex items-center"><Lock className="w-3 h-3 mr-1"/> Locked</span>}
         {status === 'available' && <span className="px-2 py-0.5 rounded text-xs font-bold bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300">Available</span>}
      </div>

      <p className="text-gray-600 dark:text-gray-300 mb-6 flex-grow">{description}</p>

      {bestTime && (
          <div className="mb-4 text-sm text-gray-500 dark:text-gray-400 flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              Best Time: {bestTime}s
          </div>
      )}

      <div className="flex items-center justify-between mt-auto">
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
              ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md'
              : 'bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          {status === 'completed' ? 'Replay' : isUnlocked ? 'Start' : 'Locked'}
        </button>
      </div>
    </div>
  );
};

export default ChallengeCard;
