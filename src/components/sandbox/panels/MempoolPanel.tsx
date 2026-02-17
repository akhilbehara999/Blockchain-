import React, { useMemo } from 'react';
import { Layers, Plus, Trash2, Zap, ArrowUpRight } from 'lucide-react';
import { useWalletStore } from '../../../stores/useWalletStore';
import { useSandboxStore } from '../../../stores/useSandboxStore';
import { backgroundEngine } from '../../../engine/BackgroundEngine';
import { NodeIdentity } from '../../../engine/NodeIdentity';
import { FEE_LEVELS } from '../../../engine/transaction';
import SandboxPanel from '../SandboxPanel';

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
    <SandboxPanel
        title="Mempool"
        icon={Layers}
        footer={
             mode === 'god' && (
                <div className="grid grid-cols-3 gap-2">
                    <button onClick={handleAddRandom} className="flex items-center justify-center p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-xs font-bold text-gray-600 dark:text-gray-300 transition-colors">
                        <Plus className="w-3 h-3 mr-1" /> Add Tx
                    </button>
                    <button onClick={handleSpike} className="flex items-center justify-center p-2 rounded-lg bg-yellow-50 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:hover:bg-yellow-900/30 text-xs font-bold text-yellow-700 dark:text-yellow-500 transition-colors">
                        <Zap className="w-3 h-3 mr-1" /> Spike
                    </button>
                    <button onClick={handleClear} className="flex items-center justify-center p-2 rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-xs font-bold text-red-600 dark:text-red-400 transition-colors">
                        <Trash2 className="w-3 h-3 mr-1" /> Clear
                    </button>
                </div>
             )
        }
    >
      <div className="space-y-6">
        {/* Fee Distribution Chart */}
        <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-4">Fee Distribution</h4>
            <div className="flex items-end gap-3 h-24 px-2">
                {[
                    { label: 'Low', count: feeStats.economy, color: 'bg-yellow-400' },
                    { label: 'Standard', count: feeStats.standard, color: 'bg-emerald-400' },
                    { label: 'High', count: feeStats.high, color: 'bg-rose-400' }
                ].map((stat) => {
                    const height = (stat.count / maxStat) * 100;
                    return (
                        <div key={stat.label} className="flex-1 flex flex-col items-center gap-2 group relative">
                            <div className="absolute -top-6 bg-gray-800 text-white text-[10px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                {stat.count} Txs
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-t-lg relative h-full flex items-end overflow-hidden">
                                <div
                                    className={`w-full rounded-t-lg ${stat.color} transition-all duration-700 ease-out`}
                                    style={{ height: `${Math.max(4, height)}%` }}
                                ></div>
                            </div>
                            <span className="text-[10px] font-medium text-gray-500">{stat.label}</span>
                        </div>
                    );
                })}
            </div>
        </div>

        {/* Transaction List */}
        <div>
            <div className="flex items-center justify-between mb-3">
                 <h4 className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1">
                    Pending Transactions
                </h4>
                <span className="text-[10px] font-mono bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-bold">
                    {mempool.length} Total
                </span>
            </div>

            {sortedMempool.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-gray-400 space-y-2 border-2 border-dashed border-gray-100 dark:border-gray-700 rounded-xl">
                    <Layers className="w-8 h-8 opacity-20" />
                    <span className="text-xs italic">Mempool is empty</span>
                </div>
            ) : (
                <div className="space-y-2">
                    {sortedMempool.slice(0, 10).map((tx, i) => {
                        const isUser = tx.from === userPubKey || tx.to === userPubKey;
                        const fromName = wallets.find(w => w.publicKey === tx.from)?.name || 'Unknown';
                        const willMine = i < 5; // Top 5 candidates

                        return (
                            <div key={tx.signature} className={`
                                flex items-center justify-between p-3 rounded-lg border text-xs relative overflow-hidden transition-all
                                ${willMine
                                    ? 'bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/10 dark:to-purple-900/10 border-indigo-200 dark:border-indigo-800'
                                    : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 opacity-80 hover:opacity-100'}
                                ${isUser ? 'ring-2 ring-indigo-500/20' : ''}
                            `}>
                                {willMine && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500"></div>
                                )}

                                <div className="flex flex-col pl-2">
                                    <span className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                                        {fromName}
                                        <ArrowUpRight className="w-3 h-3 text-gray-400" />
                                    </span>
                                    <span className="text-[10px] text-gray-400 font-mono truncate w-24">
                                        {tx.signature.substring(0, 8)}...
                                    </span>
                                </div>

                                <div className="text-right">
                                    <div className="font-mono font-bold text-gray-900 dark:text-white">{tx.amount}</div>
                                    <div className={`text-[10px] font-bold ${
                                        tx.fee! >= FEE_LEVELS.HIGH ? 'text-rose-500' :
                                        tx.fee! >= FEE_LEVELS.STANDARD ? 'text-emerald-500' : 'text-amber-500'
                                    }`}>
                                        Fee: {tx.fee}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
             {sortedMempool.length > 10 && (
                <div className="text-center text-xs text-gray-400 font-medium py-2">
                    + {sortedMempool.length - 10} more transactions
                </div>
            )}
        </div>
      </div>
    </SandboxPanel>
  );
};

export default MempoolPanel;
