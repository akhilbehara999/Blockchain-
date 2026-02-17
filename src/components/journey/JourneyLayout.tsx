import React, { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import StepIndicator from './StepIndicator';
import { useProgress } from '../../context/ProgressContext';
import { ChevronLeft, ChevronRight, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
    <div className="flex flex-col min-h-screen bg-surface-secondary dark:bg-surface-dark-primary transition-colors duration-300">
      <div className="w-full bg-surface-primary dark:bg-surface-dark-secondary border-b border-surface-border dark:border-surface-dark-border sticky top-0 z-30">
          <div className="max-w-4xl mx-auto px-4 md:px-8">
            <StepIndicator currentStep={currentStep} totalSteps={8} />
          </div>
      </div>

      <div className="flex-grow w-full max-w-4xl mx-auto px-4 md:px-8 py-8 md:py-12 pb-24 md:pb-12">
        <AnimatePresence mode="wait">
            <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="min-h-[500px]"
            >
                {children}
            </motion.div>
        </AnimatePresence>

        {/* Journey Complete Message Area (Only if Step 8 completed) */}
        {isLastStep && isStepCompleted && (
            <motion.div
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="mt-8 p-6 bg-gradient-to-r from-brand-500 to-purple-600 rounded-xl text-white shadow-xl text-center"
            >
                 <h2 className="text-3xl font-bold mb-4">🎉 Journey Complete!</h2>
                 <p className="mb-6 text-lg opacity-90 max-w-2xl mx-auto">
                    You have successfully built a blockchain from scratch! You now understand identity, hashing, blocks, mining, transactions, and consensus.
                    <br/><br/>
                    The Sandbox and Challenges modes are now UNLOCKED for you to explore freely.
                 </p>
                 <div className="flex flex-col sm:flex-row justify-center gap-4">
                     <button onClick={() => navigate('/sandbox')} className="px-8 py-3 bg-white text-brand-600 rounded-lg font-bold hover:bg-gray-50 transition-colors shadow-lg">
                        Enter Sandbox Mode
                     </button>
                     <button onClick={() => navigate('/challenges')} className="px-8 py-3 bg-purple-900/40 border border-white/40 text-white rounded-lg font-bold hover:bg-purple-900/60 transition-colors">
                        View Challenges
                     </button>
                 </div>
            </motion.div>
        )}
      </div>

        {/* Bottom Navigation Bar */}
        <div className="fixed bottom-0 left-0 right-0 md:relative md:bottom-auto bg-surface-primary/80 dark:bg-surface-dark-secondary/80 backdrop-blur-md md:bg-transparent md:backdrop-blur-none border-t border-surface-border dark:border-surface-dark-border md:border-none p-4 md:p-0 z-40">
           <div className="max-w-4xl mx-auto flex items-center justify-between md:pb-10">
               {/* Previous Button */}
               <button
                 onClick={handlePrevious}
                 disabled={currentStep === 1}
                 className={`
                   flex items-center px-6 py-3 rounded-xl font-medium transition-colors
                   ${currentStep === 1
                     ? 'text-gray-400 cursor-not-allowed opacity-0 md:opacity-50'
                     : 'text-gray-700 dark:text-gray-200 bg-surface-tertiary dark:bg-surface-dark-tertiary hover:bg-surface-hover dark:hover:bg-surface-dark-hover'}
                 `}
               >
                 <ChevronLeft className="w-5 h-5 mr-2" />
                 <span className="hidden md:inline">Previous Step</span>
                 <span className="md:hidden">Back</span>
               </button>

               {/* Next Button */}
               {!isLastStep ? (
                 <div className="relative group">
                   <button
                     onClick={handleNext}
                     disabled={!isStepCompleted}
                     className={`
                       flex items-center px-6 py-3 rounded-xl font-bold transition-all duration-300 shadow-lg
                       ${isStepCompleted
                         ? 'bg-status-valid text-white hover:bg-emerald-600 hover:-translate-y-0.5 shadow-emerald-500/20'
                         : 'bg-surface-tertiary dark:bg-surface-dark-tertiary text-gray-400 cursor-not-allowed shadow-none'}
                     `}
                   >
                     {isStepCompleted ? (
                       <>
                          <span className="hidden md:inline mr-1">Step Complete! Continue</span>
                          <span className="md:hidden mr-1">Continue</span>
                          <ChevronRight className="w-5 h-5 ml-1" />
                       </>
                     ) : (
                       <>
                         <span className="mr-2">Next Step</span>
                         <Lock className="w-4 h-4" />
                       </>
                     )}
                   </button>
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
