import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import JourneyLayout from '../components/journey/JourneyLayout';
import StepLock from '../components/journey/StepLock';
import { useProgress } from '../context/ProgressContext';

// Import all step components
import Step1_Identity from '../components/journey/steps/Step1_Identity';
import Step2_Hashing from '../components/journey/steps/Step2_Hashing';
import Step3_Blocks from '../components/journey/steps/Step3_Blocks';
import Step4_Chain from '../components/journey/steps/Step4_Chain';
import Step5_Mining from '../components/journey/steps/Step5_Mining';
import Step6_Transactions from '../components/journey/steps/Step6_Transactions';
import Step7_Consensus from '../components/journey/steps/Step7_Consensus';
import Step8_Contracts from '../components/journey/steps/Step8_Contracts';

const steps = [
  Step1_Identity,
  Step2_Hashing,
  Step3_Blocks,
  Step4_Chain,
  Step5_Mining,
  Step6_Transactions,
  Step7_Consensus,
  Step8_Contracts,
];

const Journey: React.FC = () => {
  const { step } = useParams<{ step?: string }>();
  const { isStepUnlocked, currentStep: highestStep } = useProgress();

  // If no step provided, redirect to the highest unlocked step
  if (!step) {
    return <Navigate to={`/journey/${highestStep}`} replace />;
  }

  const stepNum = parseInt(step, 10);

  // Validation
  if (isNaN(stepNum) || stepNum < 1 || stepNum > 8) {
    return <Navigate to={`/journey/${highestStep}`} replace />;
  }

  const isUnlocked = isStepUnlocked(stepNum);
  const StepComponent = steps[stepNum - 1];

  return (
    <JourneyLayout currentStep={stepNum}>
      <div className="relative min-h-[400px]">
        <StepLock isLocked={!isUnlocked} />
        {/* Even if locked, we might render the component blurrily or just not render it content */}
        <StepComponent />
      </div>
    </JourneyLayout>
  );
};

export default Journey;
