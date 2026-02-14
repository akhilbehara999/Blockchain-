import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ProgressState {
  currentStep: number;
  completedSteps: number[];
  journeyComplete: boolean;
  sandboxUnlocked: boolean;
  challengesUnlocked: boolean;
  masteryScore: number;
  achievements: string[];
}

interface ProgressContextType extends ProgressState {
  completeStep: (step: number) => void;
  isStepUnlocked: (step: number) => boolean;
  isJourneyComplete: () => boolean;
  resetProgress: () => void;
  getMasteryScore: () => number;
}

const defaultState: ProgressState = {
  currentStep: 1,
  completedSteps: [],
  journeyComplete: false,
  sandboxUnlocked: false,
  challengesUnlocked: false,
  masteryScore: 0,
  achievements: [],
};

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export const ProgressProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<ProgressState>(() => {
    try {
      const saved = localStorage.getItem('yupp_progress');
      return saved ? JSON.parse(saved) : defaultState;
    } catch (e) {
      console.error('Failed to parse progress from localStorage', e);
      return defaultState;
    }
  });

  useEffect(() => {
    localStorage.setItem('yupp_progress', JSON.stringify(state));
  }, [state]);

  const completeStep = (step: number) => {
    setState((prev) => {
      // If already completed, do nothing unless we want to update score/achievements
      // But for unlocking logic, we check if it's already in completedSteps
      if (prev.completedSteps.includes(step)) {
          return prev;
      }

      const newCompletedSteps = [...prev.completedSteps, step].sort((a, b) => a - b);

      // Determine if journey is complete (assuming steps 1-8)
      // We check if all steps 1-8 are in completedSteps
      const allStepsCompleted = [1, 2, 3, 4, 5, 6, 7, 8].every(s => newCompletedSteps.includes(s));

      // Calculate the next step to show as current
      // If I completed step 1, current should be 2.
      // If I completed step 3 (but not 2 - shouldn't happen usually but possible if we allow jumping back),
      // generally currentStep follows the highest consecutive completed step + 1.

      let nextStep = 1;
      for (let i = 1; i <= 8; i++) {
          if (newCompletedSteps.includes(i)) {
              nextStep = i + 1;
          } else {
              break;
          }
      }
      if (nextStep > 8) nextStep = 8; // Cap at 8 or whatever UI expects

      return {
        ...prev,
        completedSteps: newCompletedSteps,
        currentStep: nextStep,
        journeyComplete: allStepsCompleted,
        sandboxUnlocked: allStepsCompleted,
        challengesUnlocked: allStepsCompleted,
      };
    });
  };

  const isStepUnlocked = (step: number) => {
    if (step === 1) return true;
    return state.completedSteps.includes(step - 1);
  };

  const isJourneyComplete = () => state.journeyComplete;

  const resetProgress = () => {
    setState(defaultState);
  };

  const getMasteryScore = () => state.masteryScore;

  return (
    <ProgressContext.Provider
      value={{
        ...state,
        completeStep,
        isStepUnlocked,
        isJourneyComplete,
        resetProgress,
        getMasteryScore,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
};

export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (context === undefined) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
};
