import React from 'react';
import Button from '../ui/Button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface StepNavigatorProps {
  currentStep: number;
  totalSteps: number;
  onPrev: () => void;
  onNext: () => void;
  isFirstStep?: boolean;
  isLastStep?: boolean;
}

const StepNavigator: React.FC<StepNavigatorProps> = ({
  currentStep,
  totalSteps,
  onPrev,
  onNext,
  isFirstStep,
  isLastStep
}) => {
  return (
    <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
      <Button
        variant="secondary"
        onClick={onPrev}
        disabled={isFirstStep || currentStep === 0}
        className="flex items-center"
      >
        <ChevronLeft className="w-4 h-4 mr-2" />
        Previous
      </Button>

      <div className="flex space-x-2">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div
            key={index}
            className={`w-2.5 h-2.5 rounded-full transition-colors ${
              index === currentStep
                ? 'bg-accent shadow-lg shadow-indigo-500/50'
                : 'bg-tertiary-bg'
            }`}
          />
        ))}
      </div>

      <Button
        variant="primary"
        onClick={onNext}
        disabled={isLastStep || currentStep === totalSteps - 1}
        className="flex items-center"
      >
        Next
        <ChevronRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );
};

export default StepNavigator;
