import React, { useRef, useEffect } from 'react';
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
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to current step on mobile
  useEffect(() => {
    if (scrollRef.current) {
        // Find the current step element.
        // Structure: div (flex container) -> [Fragment (div, div?), Fragment...]
        // The flex container is the first child of scrollRef.
        const container = scrollRef.current.children[0];
        if (container) {
             const stepIndex = (currentStep - 1);
             // Each step is a fragment, but React renders fragments as flat children in the DOM usually?
             // No, React Fragment doesn't create a DOM node.
             // So the children of 'container' are: div (step 1), div (line 1), div (step 2), div (line 2)...
             // Index of step N (1-based) in children array is (N-1) * 2.
             const elementIndex = stepIndex * 2;
             const stepElement = container.children[elementIndex] as HTMLElement;

             if (stepElement) {
                stepElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
             }
        }
    }
  }, [currentStep]);

  return (
    <div className="w-full py-6 overflow-x-auto no-scrollbar" ref={scrollRef}>
      <div className="flex items-center justify-between min-w-[600px] md:min-w-0 md:w-full px-2">
        {steps.map((label, index) => {
          const stepNum = index + 1;
          const isCompleted = completedSteps.includes(stepNum);
          const isCurrent = currentStep === stepNum;
          const isUnlocked = isStepUnlocked(stepNum);
          const isLast = index === steps.length - 1;

          // Circle Styles
          let circleClasses = "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 z-10 relative shrink-0 font-bold text-sm select-none border-2";

          if (isCurrent) {
            // Current (Active) Step
            circleClasses += " bg-brand-500 border-brand-500 text-white shadow-glow animate-glow-pulse ring-4 ring-brand-100 dark:ring-brand-900/30";
          } else if (isCompleted) {
            // Completed Step
            circleClasses += " bg-status-valid border-status-valid text-white shadow-glow-success hover:bg-emerald-600";
          } else {
            // Locked / Future
            circleClasses += " bg-gray-200 border-gray-200 text-gray-400 dark:bg-gray-700 dark:border-gray-700 dark:text-gray-500";
          }

          if (!isUnlocked) {
             circleClasses += " cursor-not-allowed";
          } else {
             circleClasses += " cursor-pointer hover:scale-110";
          }

          // Line Styles
          let lineElement = null;
          if (!isLast) {
             const nextStep = stepNum + 1;
             const isNextCompleted = completedSteps.includes(nextStep);
             const isNextCurrent = currentStep === nextStep;

             let lineInner = <div className="absolute top-1/2 -translate-y-1/2 w-full border-t-2 border-dashed border-gray-300 dark:border-gray-600" />;

             if (isNextCompleted) {
                 lineInner = <div className="absolute inset-0 bg-status-valid h-0.5 self-center" />;
             } else if (isNextCurrent) {
                 lineInner = <div className="absolute inset-0 bg-gradient-to-r from-status-valid to-brand-500 h-0.5 self-center" />;
             }

             lineElement = (
               <div className="flex-1 mx-2 relative min-w-[20px] h-0.5 self-center">
                 {lineInner}
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
                   {isCompleted && !isCurrent ? (
                     <Check className="w-5 h-5" />
                   ) : !isUnlocked ? (
                     <Lock className="w-4 h-4" />
                   ) : (
                     stepNum
                   )}
                </Link>

                {/* Tooltip */}
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-gray-900 dark:bg-black text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20 shadow-xl hidden md:block">
                  {label}
                  {/* Triangle */}
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 dark:bg-black rotate-45" />
                </div>

                {/* Mobile Label (Current Step Only) */}
                {isCurrent && (
                     <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs font-bold text-brand-600 dark:text-brand-400 whitespace-nowrap md:hidden">
                        {label}
                     </div>
                )}
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
