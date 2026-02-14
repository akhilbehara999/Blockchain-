import React from 'react';
import { useProgress } from '../../context/ProgressContext';
import { Check, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const steps = [
  'Identity',
  'Hashing',
  'Blocks',
  'Chain',
  'Mining',
  'Transactions',
  'Consensus',
  'Contracts',
];

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, totalSteps }) => {
  const { completedSteps, isStepUnlocked } = useProgress();

  return (
    <div className="w-full">
      <div className="flex justify-between items-center relative">
        {/* Progress Bar Background */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 dark:bg-gray-700 -z-10 rounded-full" />

        {/* Active Progress Bar */}
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-indigo-500 -z-10 rounded-full transition-all duration-500"
          style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
        />

        {steps.map((label, index) => {
          const stepNum = index + 1;
          const isCompleted = completedSteps.includes(stepNum);
          const isCurrent = currentStep === stepNum;
          const isUnlocked = isStepUnlocked(stepNum);

          let statusColor = 'bg-gray-200 dark:bg-gray-700 text-gray-500';
          if (isCompleted) statusColor = 'bg-green-500 text-white border-green-500';
          else if (isCurrent) statusColor = 'bg-indigo-600 text-white border-indigo-600 ring-4 ring-indigo-100 dark:ring-indigo-900/30';
          else if (isUnlocked) statusColor = 'bg-white dark:bg-gray-800 border-indigo-500 text-indigo-500';
          else statusColor = 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-400';

          return (
            <div key={stepNum} className="flex flex-col items-center group relative">
              <Link
                to={isUnlocked ? `/journey/${stepNum}` : '#'}
                className={`
                  w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center
                  border-2 font-bold text-sm md:text-base transition-all duration-300
                  ${statusColor} ${!isUnlocked && 'cursor-not-allowed opacity-70'}
                `}
                aria-label={`Step ${stepNum}: ${label}`}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4 md:w-5 md:h-5" />
                ) : !isUnlocked ? (
                  <Lock className="w-3 h-3 md:w-4 md:h-4" />
                ) : (
                  stepNum
                )}
              </Link>
              <span className={`
                absolute top-12 text-xs font-medium whitespace-nowrap transition-colors duration-300
                ${isCurrent ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}
                hidden md:block
              `}>
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StepIndicator;
