import React from 'react';
import Button from '../ui/Button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface StepNavigatorProps {
  currentStep: number;
  totalSteps: number;
  onPrev: () => void;
  onNext: () => void;
  canNext?: boolean;
}

const StepNavigator: React.FC<StepNavigatorProps> = ({
  currentStep,
  totalSteps,
  onPrev,
  onNext,
  canNext = true,
}) => {
  return (
    <div className="flex items-center justify-between w-full mt-8 pt-6 border-t border-border">
      <Button
        variant="secondary"
        onClick={onPrev}
        disabled={currentStep === 0}
        className="w-32"
      >
        <ChevronLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      <div className="hidden md:flex space-x-2">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <motion.div
            key={index}
            initial={false}
            animate={{
              scale: currentStep === index ? 1.2 : 1,
              backgroundColor: currentStep === index ? '#6366F1' : '#2A2A3C', // accent vs border color
            }}
            className={`w-3 h-3 rounded-full transition-colors duration-300`}
          />
        ))}
      </div>

      <Button
        variant="primary"
        onClick={onNext}
        disabled={!canNext || currentStep === totalSteps - 1}
        className="w-32"
      >
        Next
        <ChevronRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );
};

export default StepNavigator;
