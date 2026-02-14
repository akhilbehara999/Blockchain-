import React from 'react';
import { Trophy } from 'lucide-react';
import { useProgress } from '../../context/ProgressContext';

const MasteryTracker: React.FC = () => {
  const { getMasteryScore } = useProgress();
  const score = getMasteryScore();

  return (
    <div className="flex items-center space-x-2 bg-yellow-50 dark:bg-yellow-900/20 px-3 py-1.5 rounded-full border border-yellow-200 dark:border-yellow-700">
      <Trophy className="w-4 h-4 text-yellow-600 dark:text-yellow-500" />
      <span className="text-sm font-bold text-yellow-700 dark:text-yellow-400">
        Score: {score}
      </span>
    </div>
  );
};

export default MasteryTracker;
