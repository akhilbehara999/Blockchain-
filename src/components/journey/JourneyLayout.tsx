import React, { ReactNode } from 'react';
import StepIndicator from './StepIndicator';

interface JourneyLayoutProps {
  children: ReactNode;
  currentStep: number;
}

const JourneyLayout: React.FC<JourneyLayoutProps> = ({ children, currentStep }) => {
  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)] w-full">
      <div className="container mx-auto px-4 py-6 flex-grow">
        <StepIndicator currentStep={currentStep} totalSteps={8} />
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 min-h-[500px]">
          {children}
        </div>
      </div>
    </div>
  );
};

export default JourneyLayout;
