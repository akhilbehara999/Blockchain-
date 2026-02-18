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

export interface ContractABI {
  type: 'function' | 'event' | 'constructor';
  name?: string;
  inputs?: { name: string; type: string }[];
  outputs?: { name: string; type: string }[];
  stateMutability?: 'pure' | 'view' | 'nonpayable' | 'payable';
  cost?: number; // Added for visualization
}

export interface DeployedContract {
  id: string;
  name: string;
  address: string;
  state: Record<string, unknown>;
  abi: ContractABI[];
  createdAt: number;
}

interface SandboxState {
  mode: SandboxMode;
  mastery: MasteryStats;
  deployedContracts: DeployedContract[];

  setMode: (mode: SandboxMode) => void;
  incrementMastery: (key: keyof MasteryStats, amount?: number) => void;
  addContract: (contract: DeployedContract) => void;
  updateContractState: (id: string, newState: Record<string, unknown>) => void;
  resetSandbox: () => void;

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
      mode: 'node',
      mastery: INITIAL_MASTERY,
      deployedContracts: [],

      setMode: (mode) => set({ mode }),

      incrementMastery: (key, amount = 1) => {
        set((state) => ({
          mastery: {
            ...state.mastery,
            [key]: (state.mastery[key] || 0) + amount
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

        score += Math.min((mastery.blocksMined || 0) * 2, 20);
        score += Math.min((mastery.txSent || 0) * 1, 15);
        score += Math.min((mastery.forksWitnessed || 0) * 5, 15);
        score += Math.min((mastery.reorgsSurvived || 0) * 10, 20);
        score += Math.min((mastery.contractsDeployed || 0) * 5, 15);
        score += Math.min((mastery.gasFailures || 0) * 5, 10);

        return Math.min(score, 100);
      },

      getMasteryLevel: () => {
        const score = get().getMasteryScore();
        if (score <= 20) return 'Novice';
        if (score <= 40) return 'Learner';
        if (score <= 60) return 'Practitioner';
        if (score <= 80) return 'Expert';
        return 'Master';
      }
    }),
    {
      name: 'yupp_sandbox_store',
      partialize: (state) => ({
        mastery: state.mastery,
        deployedContracts: state.deployedContracts,
        mode: state.mode
      }),
    }
  )
);
