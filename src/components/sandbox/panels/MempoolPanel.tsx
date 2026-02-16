import React, { useMemo } from 'react';
import { Layers, Plus, Trash2, Zap, ArrowUpRight } from 'lucide-react';
import { useWalletStore } from '../../../stores/useWalletStore';
import { useSandboxStore } from '../../../stores/useSandboxStore';
import { backgroundEngine } from '../../../engine/BackgroundEngine';
import { NodeIdentity } from '../../../engine/NodeIdentity';
import { FEE_LEVELS } from '../../../engine/transaction';

const MempoolPanel: React.FC = () => {
  const mode = useSandboxStore(state => state.mode);
  const mempool = useWalletStore(state => state.mempool) || [];
  const wallets = useWalletStore(state => state.wallets);

  const userPubKey = useMemo(() => {
    try {
        const id = NodeIdentity.getOrCreate();
        return id.getPublicKey();
    } catch {
        return '';
    }
  }, []);

  // Sort by fee (descending)
  const sortedMempool = useMemo(() => {
    return [...mempool].sort((a, b) => (b.fee || 0) - (a.fee || 0));
  }, [mempool]);

  const feeStats = useMemo(() => {
    const stats = { high: 0, standard: 0, economy: 0 };
    mempool.forEach(tx => {
        if (!tx.fee) return;
        if (tx.fee >= FEE_LEVELS.HIGH) stats.high++;
        else if (tx.fee >= FEE_LEVELS.STANDARD) stats.standard++;
        else stats.economy++;
    });
    return stats;
  }, [mempool]);

  const maxStat = Math.max(feeStats.high, feeStats.standard, feeStats.economy, 1);

  const handleAddRandom = () => {
    backgroundEngine.createRandomTransaction();
  };

  const handleSpike = () => {
    backgroundEngine.triggerMempoolSpike(5);
  };

  const handleClear = () => {
    useWalletStore.setState({ mempool: [] });
  };

  return (
    <div className="h-full bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden">
      <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 text-sm">
          <Layers className="w-4 h-4 text-purple-500" />
          Mempool
        </h3>
        <span className="text-xs text-gray-500 font-mono bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
            {mempool.length} Pending
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Fee Distribution Chart */}
        <div className="flex items-end gap-2 h-16 px-2">
            {['Economy', 'Standard', 'High'].map((label) => {
                const key = label.toLowerCase() as keyof typeof feeStats;
                const count = feeStats[key];
                const height = (count / maxStat) * 100;
                const color = key === 'high' ? 'bg-red-400' : key === 'standard' ? 'bg-green-400' : 'bg-yellow-400';

                return (
                    <div key={label} className="flex-1 flex flex-col items-center gap-1 group">
                        <span className="text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">{count}</span>
                        <div className={`w-full rounded-t ${color} transition-all duration-500 min-h-[4px]`} style={{ height: `${height}%` }}></div>
                        <span className="text-[10px] text-gray-500">{label}</span>
                    </div>
                );
            })}
        </div>

        {/* Transaction List */}
        <div className="space-y-2">
            <h4 className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1">
                Next Block Candidates <span className="text-[10px] font-normal normal-case">(Top 5)</span>
            </h4>

            {sortedMempool.length === 0 ? (
                <div className="text-center text-gray-400 text-xs py-4 italic">Mempool is empty</div>
            ) : (
                sortedMempool.slice(0, 10).map((tx, i) => {
                    const isUser = tx.from === userPubKey || tx.to === userPubKey;
                    const fromName = wallets.find(w => w.publicKey === tx.from)?.name || 'Unknown';
                    const willMine = i < 5; // Assuming block size 5

                    return (
                        <div key={tx.signature} className={`flex items-center justify-between p-2 rounded border text-xs relative overflow-hidden ${
                            willMine
                            ? 'bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800'
                            : 'bg-white border-gray-100 dark:bg-gray-800 dark:border-gray-700 opacity-70'
                        } ${isUser ? 'ring-1 ring-indigo-500' : ''}`}>
                            {willMine && <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-500"></div>}

                            <div className="flex flex-col pl-2">
                                <span className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
                                    {fromName}
                                    <ArrowUpRight className="w-3 h-3 text-gray-400" />
                                </span>
                                <span className="text-[10px] text-gray-500 truncate w-24" title={tx.signature}>
                                    {tx.signature.substring(0, 8)}...
                                </span>
                            </div>

                            <div className="text-right">
                                <div className="font-bold text-gray-900 dark:text-white">{tx.amount}</div>
                                <div className={`text-[10px] font-bold ${
                                    tx.fee! >= FEE_LEVELS.HIGH ? 'text-red-500' :
                                    tx.fee! >= FEE_LEVELS.STANDARD ? 'text-green-600' : 'text-yellow-600'
                                }`}>
                                    Fee: {tx.fee}
                                </div>
                            </div>
                        </div>
                    );
                })
            )}
             {sortedMempool.length > 10 && (
                <div className="text-center text-xs text-gray-400 italic">
                    + {sortedMempool.length - 10} more transactions
                </div>
            )}
        </div>

        {/* God Mode Controls */}
        {mode === 'god' && (
            <div className="pt-2 border-t border-gray-200 dark:border-gray-700 grid grid-cols-3 gap-2">
                <button onClick={handleAddRandom} className="flex flex-col items-center justify-center p-2 rounded bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-xs transition-colors">
                    <Plus className="w-4 h-4 text-gray-600 dark:text-gray-300 mb-1" />
                    <span>Add Tx</span>
                </button>
                <button onClick={handleSpike} className="flex flex-col items-center justify-center p-2 rounded bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-xs transition-colors">
                    <Zap className="w-4 h-4 text-yellow-600 mb-1" />
                    <span>Spike</span>
                </button>
                <button onClick={handleClear} className="flex flex-col items-center justify-center p-2 rounded bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-xs transition-colors">
                    <Trash2 className="w-4 h-4 text-red-500 mb-1" />
                    <span>Clear</span>
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default MempoolPanel;
