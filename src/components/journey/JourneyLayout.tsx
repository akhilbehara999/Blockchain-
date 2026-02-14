import React, { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import StepIndicator from './StepIndicator';
import { useProgress } from '../../context/ProgressContext';
import { ChevronLeft, ChevronRight, CheckCircle, Lock } from 'lucide-react';

interface JourneyLayoutProps {
  children: ReactNode;
  currentStep: number;
}

const JourneyLayout: React.FC<JourneyLayoutProps> = ({ children, currentStep }) => {
  const navigate = useNavigate();
  const { completedSteps } = useProgress();

  const isStepCompleted = completedSteps.includes(currentStep);
  const isLastStep = currentStep === 8;

  const handleNext = () => {
    if (isLastStep) {
        navigate('/sandbox');
    } else {
        navigate(`/journey/${currentStep + 1}`);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      navigate(`/journey/${currentStep - 1}`);
    }
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)] w-full">
      <div className="container mx-auto px-4 py-6 flex-grow flex flex-col max-w-5xl">
        <StepIndicator currentStep={currentStep} totalSteps={8} />

        <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 min-h-[500px] relative flex flex-col">
          {children}
        </div>

        {/* Journey Complete Message Area (Only if Step 8 completed) */}
        {isLastStep && isStepCompleted && (
            <div className="mt-8 p-6 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl text-white shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-700 text-center">
                 <h2 className="text-3xl font-bold mb-4">🎉 Journey Complete!</h2>
                 <p className="mb-6 text-lg opacity-90 max-w-2xl mx-auto">
                    You have successfully built a blockchain from scratch! You now understand identity, hashing, blocks, mining, transactions, and consensus.
                    <br/><br/>
                    The Sandbox and Challenges modes are now UNLOCKED for you to explore freely.
                 </p>
                 <div className="flex flex-col sm:flex-row justify-center gap-4">
                     <button onClick={() => navigate('/sandbox')} className="px-8 py-3 bg-white text-indigo-600 rounded-lg font-bold hover:bg-gray-50 transition-colors shadow-lg">
                        Enter Sandbox Mode
                     </button>
                     <button onClick={() => navigate('/challenges')} className="px-8 py-3 bg-purple-900/40 border border-white/40 text-white rounded-lg font-bold hover:bg-purple-900/60 transition-colors">
                        View Challenges
                     </button>
                 </div>
            </div>
        )}

        {/* Navigation Bar */}
        <div className="mt-8 flex items-center justify-between pb-10">
           {/* Previous Button */}
           <button
             onClick={handlePrevious}
             disabled={currentStep === 1}
             className={`
               flex items-center px-6 py-3 rounded-lg font-medium transition-colors
               ${currentStep === 1
                 ? 'text-gray-400 cursor-not-allowed opacity-50'
                 : 'text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 shadow-sm'}
             `}
           >
             <ChevronLeft className="w-5 h-5 mr-2" />
             Previous Step
           </button>

           {/* Next Button */}
           {!isLastStep ? (
             <div className="relative group">
               <button
                 onClick={handleNext}
                 disabled={!isStepCompleted}
                 className={`
                   flex items-center px-6 py-3 rounded-lg font-bold transition-all duration-300
                   ${isStepCompleted
                     ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/20 transform hover:-translate-y-0.5'
                     : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'}
                 `}
               >
                 {isStepCompleted ? (
                   <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      <span className="mr-1">Step Complete! Continue</span>
                      <ChevronRight className="w-5 h-5 ml-1" />
                   </>
                 ) : (
                   <>
                     <span className="mr-2">Next Step</span>
                     <Lock className="w-4 h-4" />
                   </>
                 )}
               </button>

               {/* Tooltip for Disabled State */}
               {!isStepCompleted && (
                 <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none w-max z-10 shadow-xl">
                   Complete the task above to proceed
                   <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45" />
                 </div>
               )}
             </div>
           ) : (
              // Empty div to keep Previous button on left
              <div />
           )}
        </div>
      </div>
    </div>
  );
};

export default JourneyLayout;
