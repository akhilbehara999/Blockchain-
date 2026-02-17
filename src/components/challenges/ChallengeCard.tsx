import React from 'react';
import { Lock, CheckCircle, Clock } from 'lucide-react';

interface ChallengeCardProps {
  title: string;
  description: string;
  isUnlocked: boolean;
  status: 'locked' | 'available' | 'completed';
  reward: number;
  difficulty: number;
  bestTime?: number | null;
  onStart: () => void;
  icon: string; // Emoji
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
  icon,
}) => {
  return (
    <button
      onClick={onStart}
      disabled={!isUnlocked}
      className={`
        relative group text-left w-full h-full flex flex-col p-6 rounded-2xl transition-all duration-300 border
        ${status === 'locked'
            ? 'bg-gray-100 dark:bg-gray-900 border-gray-200 dark:border-gray-800 opacity-60 cursor-not-allowed grayscale'
            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-xl hover:-translate-y-1 hover:border-indigo-500/30 dark:hover:border-indigo-500/30'
        }
        ${status === 'completed' ? 'border-l-4 border-l-green-500' : ''}
      `}
    >
      {/* Locked Overlay */}
      {status === 'locked' && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="bg-gray-200/80 dark:bg-gray-800/80 p-3 rounded-full backdrop-blur-sm">
                  <Lock className="w-6 h-6 text-gray-500" />
              </div>
          </div>
      )}

      {/* Completed Checkmark Overlay */}
      {status === 'completed' && (
          <div className="absolute top-4 right-4 z-10">
              <div className="bg-green-100 dark:bg-green-900/50 p-1.5 rounded-full">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
          </div>
      )}

      {/* Top: Difficulty Stars */}
      <div className="flex space-x-1 mb-6">
        {[...Array(5)].map((_, i) => (
          <span key={i} className={`text-lg leading-none ${i < difficulty ? 'text-amber-400' : 'text-gray-200 dark:text-gray-700'}`}>
            ★
          </span>
        ))}
      </div>

      {/* Center: Emoji Icon */}
      <div className="flex justify-center mb-6">
          <span className="text-5xl filter drop-shadow-md transform group-hover:scale-110 transition-transform duration-300">{icon}</span>
      </div>

      {/* Content */}
      <div className="flex-1">
          <h3 className="font-display text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {title}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-4 line-clamp-2">
              {description}
          </p>
      </div>

      {/* Bottom: Status & Points */}
      <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700/50 w-full">
          {/* Status Badge */}
          <div>
              {status === 'completed' && (
                  <span className="text-xs font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-lg">
                      Completed
                  </span>
              )}
              {status === 'available' && (
                  <span className="text-xs font-bold text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded-lg group-hover:shadow-glow transition-all">
                      Available
                  </span>
              )}
               {status === 'locked' && (
                  <span className="text-xs font-bold text-gray-500 dark:text-gray-500 bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded-lg">
                      Locked
                  </span>
              )}
          </div>

          {/* Points/Time */}
          <div className="flex flex-col items-end">
              <span className="text-sm font-bold text-indigo-500 dark:text-indigo-400">+{reward} pts</span>
              {bestTime && (
                  <span className="text-[10px] text-gray-400 flex items-center mt-1">
                      <Clock className="w-3 h-3 mr-1" /> {bestTime}s
                  </span>
              )}
          </div>
      </div>
    </button>
  );
};

export default ChallengeCard;
