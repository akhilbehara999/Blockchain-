import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type SandboxMode = 'god' | 'node';

export interface MasteryStats {
  blocksMined: number;
  txSent: number;
  forksWitnessed: number;
  reorgsSurvived: number;
  contractsDeployed: number;
  gasFailures: number;
  challengesCompleted: number;
}

export interface DeployedContract {
  id: string;
  name: string;
  address: string;
  state: any;
  abi: any[]; // Simplified ABI
  createdAt: number;
}

interface SandboxState {
  mode: SandboxMode;
  mastery: MasteryStats;
  deployedContracts: DeployedContract[];

  // Actions
  setMode: (mode: SandboxMode) => void;
  incrementMastery: (key: keyof MasteryStats, amount?: number) => void;
  addContract: (contract: DeployedContract) => void;
  updateContractState: (id: string, newState: any) => void;
  resetSandbox: () => void;

  // Getters
  getMasteryScore: () => number;
  getMasteryLevel: () => string;
}

const INITIAL_MASTERY: MasteryStats = {
  blocksMined: 0,
  txSent: 0,
  forksWitnessed: 0,
  reorgsSurvived: 0,
  contractsDeployed: 0,
  gasFailures: 0,
  challengesCompleted: 0
};

export const useSandboxStore = create<SandboxState>()(
  persist(
    (set, get) => ({
      mode: 'node', // Default to node mode
      mastery: INITIAL_MASTERY,
      deployedContracts: [],

      setMode: (mode) => set({ mode }),

      incrementMastery: (key, amount = 1) => {
        set((state) => ({
          mastery: {
            ...state.mastery,
            [key]: state.mastery[key] + amount
          }
        }));
      },

      addContract: (contract) => {
        set((state) => ({
          deployedContracts: [...state.deployedContracts, contract]
        }));
      },

      updateContractState: (id, newState) => {
        set((state) => ({
          deployedContracts: state.deployedContracts.map(c =>
            c.id === id ? { ...c, state: newState } : c
          )
        }));
      },

      resetSandbox: () => {
        set({
          mode: 'node',
          mastery: INITIAL_MASTERY,
          deployedContracts: []
        });
      },

      getMasteryScore: () => {
        const { mastery } = get();
        let score = 0;

        // Cap points based on rules
        score += Math.min(mastery.blocksMined * 2, 20);
        score += Math.min(mastery.txSent * 1, 15);
        score += Math.min(mastery.forksWitnessed * 5, 15);
        score += Math.min(mastery.reorgsSurvived * 10, 20);
        score += Math.min(mastery.contractsDeployed * 5, 15);
        score += Math.min(mastery.gasFailures * 5, 10);
        // score += mastery.challengesCompleted * 10; // Future

        return Math.min(score, 100);
      },

      getMasteryLevel: () => {
        const score = get().getMasteryScore();
        if (score <= 20) return 'Novice';
        if (score <= 40) return 'Student';
        if (score <= 60) return 'Practitioner';
        if (score <= 80) return 'Expert';
        return 'Master';
      }
    }),
    {
      name: 'yupp_sandbox_store', // unique name
      partialize: (state) => ({
        mastery: state.mastery,
        deployedContracts: state.deployedContracts,
        // Don't persist mode, reset to node on load? Or persist it.
        // Let's persist mode too for convenience.
        mode: state.mode
      }),
    }
  )
);
