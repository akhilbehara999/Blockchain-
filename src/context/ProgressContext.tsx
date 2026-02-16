import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { safeParse } from '../utils';

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
  getMasteryScore: () => number;
  getRank: () => string;
  updateChallengeProgress: (id: keyof ChallengesState, data: Partial<ChallengeProgress>) => void;
  addMasteryPoints: (points: number) => void;
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
      const saved = localStorage.getItem('yupp_progress');
      if (saved) {
        const parsed = safeParse<Partial<ProgressState> | null>(saved, null);
        if (parsed) {
          // Merge with defaultState to ensure new fields exist
          return {
            ...defaultState,
            ...parsed,
            challenges: {
              ...defaultState.challenges,
              ...(parsed.challenges || {})
            }
          };
        }
      }
      return defaultState;
    } catch {
      return defaultState;
    }
  });

  useEffect(() => {
    localStorage.setItem('yupp_progress', JSON.stringify(state));
  }, [state]);

  const calculateRank = (score: number) => {
    if (score < 50) return 'Novice';
    if (score < 100) return 'Learner';
    if (score < 200) return 'Expert';
    return 'Master';
  };

  const completeStep = (step: number) => {
    setState((prev) => {
      // If already completed, do nothing unless we want to update score/achievements
      if (prev.completedSteps.includes(step)) {
          return prev;
      }

      const newCompletedSteps = [...prev.completedSteps, step].sort((a, b) => a - b);

      // Determine if journey is complete (assuming steps 1-8)
      const allStepsCompleted = [1, 2, 3, 4, 5, 6, 7, 8].every(s => newCompletedSteps.includes(s));

      let nextStep = 1;
      for (let i = 1; i <= 8; i++) {
          if (newCompletedSteps.includes(i)) {
              nextStep = i + 1;
          } else {
              break;
          }
      }
      if (nextStep > 8) nextStep = 8;

      // Award 10 points per step
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

  const getMasteryScore = () => state.masteryScore;
  const getRank = () => calculateRank(state.masteryScore);

  const updateChallengeProgress = (id: keyof ChallengesState, data: Partial<ChallengeProgress>) => {
    setState((prev) => {
      const wasCompleted = prev.challenges[id].completed;
      const isNowCompleted = data.completed ?? wasCompleted;

      let newScore = prev.masteryScore;
      // Award 15 points if newly completed
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

  return (
    <ProgressContext.Provider
      value={{
        ...state,
        completeStep,
        isStepUnlocked,
        isJourneyComplete,
        resetProgress,
        getMasteryScore,
        getRank,
        updateChallengeProgress,
        addMasteryPoints,
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
