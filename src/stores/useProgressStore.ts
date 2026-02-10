import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ProgressState {
  completedModules: string[];
  currentModule: string;
  completeModule: (moduleId: string) => void;
  setCurrentModule: (moduleId: string) => void;
  isModuleCompleted: (moduleId: string) => boolean;
  getProgress: () => number;
}

const TOTAL_MODULES = 6; // Module 0 to 5

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      completedModules: [],
      currentModule: '0',
      completeModule: (moduleId) =>
        set((state) => {
          if (!state.completedModules.includes(moduleId)) {
            return { completedModules: [...state.completedModules, moduleId] };
          }
          return {};
        }),
      setCurrentModule: (moduleId) => set({ currentModule: moduleId }),
      isModuleCompleted: (moduleId) => get().completedModules.includes(moduleId),
      getProgress: () => {
        const completed = get().completedModules.length;
        return Math.min(100, Math.round((completed / TOTAL_MODULES) * 100));
      },
    }),
    {
      name: 'progress-storage',
    }
  )
);
