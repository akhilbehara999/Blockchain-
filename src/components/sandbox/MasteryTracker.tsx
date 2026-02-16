import React from 'react';
import { Trophy } from 'lucide-react';
import { useSandboxStore } from '../../stores/useSandboxStore';

const MasteryTracker: React.FC = () => {
  // Subscribe to mastery changes to trigger re-renders
  const mastery = useSandboxStore(state => state.mastery);

  // Get computed values
  const score = useSandboxStore.getState().getMasteryScore();
  const level = useSandboxStore.getState().getMasteryLevel();

  return (
    <div className="flex items-center space-x-2 bg-yellow-50 dark:bg-yellow-900/20 px-3 py-1.5 rounded-full border border-yellow-200 dark:border-yellow-700 relative group cursor-help transition-all hover:bg-yellow-100 dark:hover:bg-yellow-900/40">
      <Trophy className="w-4 h-4 text-yellow-600 dark:text-yellow-500" />
      <div className="flex flex-col leading-none">
          <span className="text-sm font-bold text-yellow-700 dark:text-yellow-400">
            {Math.floor(score)}% Mastery
          </span>
          <span className="text-[10px] text-yellow-600/70 dark:text-yellow-500/70 uppercase font-semibold">
            {level}
          </span>
      </div>

      {/* Tooltip on hover */}
      <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-3 hidden group-hover:block z-50 text-xs animate-in fade-in zoom-in-95 duration-200">
         <h4 className="font-bold mb-2 text-gray-900 dark:text-white border-b pb-1 dark:border-gray-700 flex justify-between">
            <span>Mastery Breakdown</span>
            <span className="text-yellow-600">{Math.floor(score)}/100</span>
         </h4>
         <div className="space-y-1.5 text-gray-600 dark:text-gray-300">
            <div className="flex justify-between"><span>⛏️ Blocks Mined:</span> <span className="font-mono">{mastery.blocksMined}</span></div>
            <div className="flex justify-between"><span>💸 Txs Sent:</span> <span className="font-mono">{mastery.txSent}</span></div>
            <div className="flex justify-between"><span>🔀 Forks Witnessed:</span> <span className="font-mono">{mastery.forksWitnessed}</span></div>
            <div className="flex justify-between"><span>🔄 Reorgs Survived:</span> <span className="font-mono">{mastery.reorgsSurvived}</span></div>
            <div className="flex justify-between"><span>📝 Contracts:</span> <span className="font-mono">{mastery.contractsDeployed}</span></div>
            <div className="flex justify-between"><span>⛽ Gas Failures:</span> <span className="font-mono">{mastery.gasFailures}</span></div>
         </div>
      </div>
    </div>
  );
};

export default MasteryTracker;
