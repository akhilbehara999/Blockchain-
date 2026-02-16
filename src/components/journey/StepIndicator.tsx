import React from 'react';
import { useProgress } from '../../context/ProgressContext';
import { Check, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps?: number;
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

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep }) => {
  const { completedSteps, isStepUnlocked } = useProgress();

  return (
    <div className="w-full py-6 px-2">
      <div className="flex items-center justify-between w-full max-w-4xl mx-auto">
        {steps.map((label, index) => {
          const stepNum = index + 1;
          const isCompleted = completedSteps.includes(stepNum);
          const isCurrent = currentStep === stepNum;
          const isUnlocked = isStepUnlocked(stepNum);
          const isLast = index === steps.length - 1;

          // Circle Styles
          let circleClasses = "w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center border-2 font-bold text-sm md:text-base transition-all duration-300 z-10 relative shrink-0";

          if (isCurrent) {
            // Current (Active) Step - Takes precedence visually for location
            circleClasses += " bg-indigo-600 border-indigo-600 text-white ring-4 ring-indigo-100 dark:ring-indigo-900/30 animate-pulse shadow-lg shadow-indigo-500/30";
          } else if (isCompleted) {
            // Completed Step
            circleClasses += " bg-green-500 border-green-500 text-white hover:bg-green-600 shadow-md shadow-green-500/20";
          } else if (isUnlocked) {
             // Unlocked but future (rare case in linear journey, maybe skipping?)
             circleClasses += " bg-white dark:bg-gray-800 border-indigo-500 text-indigo-500";
          } else {
            // Locked
            circleClasses += " bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-400 cursor-not-allowed";
          }

          // Line Styles (Line connects THIS step to NEXT step)
          let lineElement = null;
          if (!isLast) {
             // Line is green if current step is completed
             const isLineGreen = completedSteps.includes(stepNum);

             lineElement = (
               <div className="flex-1 mx-2 h-1 relative min-w-[20px]">
                 {isLineGreen ? (
                   <div className="absolute inset-y-0 left-0 right-0 bg-green-500 rounded-full opacity-80" />
                 ) : (
                   <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 border-t-2 border-dashed border-gray-300 dark:border-gray-600" />
                 )}
               </div>
             );
          }

          return (
            <React.Fragment key={stepNum}>
              <div className="relative group flex flex-col items-center">
                <Link
                  to={isUnlocked ? `/journey/${stepNum}` : '#'}
                  className={circleClasses}
                  onClick={(e) => !isUnlocked && e.preventDefault()}
                  aria-label={`Step ${stepNum}: ${label}`}
                >
                   {/* Icon logic */}
                   {!isUnlocked ? (
                     <Lock className="w-4 h-4" />
                   ) : isCompleted && !isCurrent ? (
                     <Check className="w-5 h-5" />
                   ) : (
                     stepNum
                   )}
                </Link>

                {/* Tooltip */}
                <div className="absolute top-14 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-gray-900 dark:bg-black text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20 shadow-xl">
                  {label}
                  {/* Triangle */}
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 dark:bg-black rotate-45" />
                </div>
              </div>

              {lineElement}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default StepIndicator;
