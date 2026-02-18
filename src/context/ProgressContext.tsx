import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Storage } from '../utils/storage';

export interface ChallengeProgress {
  completed: boolean;
  bestTime: number | null; // in seconds
  attempts: number;
}

export interface ChallengesState {
  doubleSpend: ChallengeProgress;
  fork: ChallengeProgress;
  crashContract: ChallengeProgress;
  speedConfirm: ChallengeProgress;
  storm: ChallengeProgress;
}

interface ProgressState {
  currentStep: number;
  completedSteps: number[];
  journeyComplete: boolean;
  sandboxUnlocked: boolean;
  challengesUnlocked: boolean;
  masteryScore: number;
  achievements: string[];
  challenges: ChallengesState;
}

interface ProgressContextType extends ProgressState {
  completeStep: (step: number) => void;
  isStepUnlocked: (step: number) => boolean;
  isJourneyComplete: () => boolean;
  resetProgress: () => void;
  updateChallengeProgress: (id: keyof ChallengesState, data: Partial<ChallengeProgress>) => void;
  addMasteryPoints: (points: number) => void;
  getMasteryScore: () => number;
  getRank: () => string;
}

const defaultChallengeState: ChallengeProgress = {
  completed: false,
  bestTime: null,
  attempts: 0,
};

const defaultState: ProgressState = {
  currentStep: 1,
  completedSteps: [],
  journeyComplete: false,
  sandboxUnlocked: false,
  challengesUnlocked: false,
  masteryScore: 0,
  achievements: [],
  challenges: {
    doubleSpend: { ...defaultChallengeState },
    fork: { ...defaultChallengeState },
    crashContract: { ...defaultChallengeState },
    speedConfirm: { ...defaultChallengeState },
    storm: { ...defaultChallengeState },
  },
};

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export const ProgressProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<ProgressState>(() => {
    try {
      const validator = (data: any) => {
          if (typeof data !== 'object' || data === null) return false;
          if (data.currentStep && (typeof data.currentStep !== 'number' || data.currentStep < 1 || data.currentStep > 9)) return false;
          return true;
      };

      const saved = Storage.getItem<Partial<ProgressState>>('yupp_progress', validator);
      if (saved) {
        return {
          ...defaultState,
          ...saved,
          challenges: {
            ...defaultState.challenges,
            ...(saved.challenges || {})
          }
        };
      }
      return defaultState;
    } catch {
      return defaultState;
    }
  });

  useEffect(() => {
    Storage.setItem('yupp_progress', state);
  }, [state]);

  const calculateRank = (score: number) => {
    if (score < 50) return 'Novice';
    if (score < 100) return 'Learner';
    if (score < 200) return 'Expert';
    return 'Master';
  };

  const completeStep = (step: number) => {
    setState((prev) => {
      // If already completed, do nothing
      if (prev.completedSteps.includes(step)) {
          return prev;
      }

      const newCompletedSteps = [...prev.completedSteps, step].sort((a, b) => a - b);
      const allStepsCompleted = [1, 2, 3, 4, 5, 6, 7, 8].every(s => newCompletedSteps.includes(s));

      let nextStep = prev.currentStep;
      if (step === prev.currentStep) {
         nextStep = step + 1;
      }
      if (nextStep > 8) nextStep = 8; // Or 9 if we have a post-game? Keeping it safe.

      const newScore = prev.masteryScore + 10;

      return {
        ...prev,
        completedSteps: newCompletedSteps,
        currentStep: nextStep,
        journeyComplete: allStepsCompleted,
        sandboxUnlocked: allStepsCompleted,
        challengesUnlocked: allStepsCompleted,
        masteryScore: newScore,
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

  const updateChallengeProgress = (id: keyof ChallengesState, data: Partial<ChallengeProgress>) => {
    setState((prev) => {
      // Check if this challenge key exists to avoid runtime errors
      if (!prev.challenges[id]) return prev;

      const wasCompleted = prev.challenges[id].completed;
      const isNowCompleted = data.completed ?? wasCompleted;

      let newScore = prev.masteryScore;
      if (!wasCompleted && isNowCompleted) {
        newScore += 15;
      }

      return {
        ...prev,
        masteryScore: newScore,
        challenges: {
          ...prev.challenges,
          [id]: {
            ...prev.challenges[id],
            ...data,
          },
        },
      };
    });
  };

  const addMasteryPoints = (points: number) => {
    setState((prev) => ({
      ...prev,
      masteryScore: prev.masteryScore + points,
    }));
  };

  const getMasteryScore = () => state.masteryScore;
  const getRank = () => calculateRank(state.masteryScore);

  return (
    <ProgressContext.Provider
      value={{
        ...state,
        completeStep,
        isStepUnlocked,
        isJourneyComplete,
        resetProgress,
        updateChallengeProgress,
        addMasteryPoints,
        getMasteryScore,
        getRank,
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
