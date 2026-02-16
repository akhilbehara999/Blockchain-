import React, { useState, useEffect } from 'react';
import { Network, Users, Globe, Activity, Plus, Trash2, Server } from 'lucide-react';
import { backgroundEngine } from '../../../engine/BackgroundEngine';
import { useSandboxStore } from '../../../stores/useSandboxStore';


import { Wallet } from '../../../engine/types';

const NetworkPanel: React.FC = () => {
  const mode = useSandboxStore(state => state.mode);
  const [peers, setPeers] = useState<Wallet[]>([]);
  const [networkHashRate, setNetworkHashRate] = useState<number>(0);

  // Poll peers and hashrate
  useEffect(() => {
    const updateNetworkStats = () => {
      setPeers([...backgroundEngine.getPeerWallets()]);

      const miners = backgroundEngine.getSimulatedMiners();
      const totalHashRate = miners.reduce((sum, m) => sum + m.hashRate, 0);
      setNetworkHashRate(totalHashRate);
    };

    updateNetworkStats();
    const interval = setInterval(updateNetworkStats, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleAddPeer = () => {
      backgroundEngine.addPeer();
      // Force immediate update
      setPeers([...backgroundEngine.getPeerWallets()]);
  };

  const handleRemovePeer = () => {
      backgroundEngine.removePeer();
      setPeers([...backgroundEngine.getPeerWallets()]);
  };

  return (
    <div className="h-full bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden">
      <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 text-sm">
          <Globe className="w-4 h-4 text-blue-500" />
          Network
        </h3>
        <div className="flex items-center gap-3">
             <span className="text-xs text-gray-500 flex items-center gap-1">
                <Users className="w-3 h-3" /> {peers.length} Peers
             </span>
             <span className="text-xs text-gray-500 flex items-center gap-1">
                <Activity className="w-3 h-3" /> {networkHashRate} MH/s
             </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 relative">
        {/* Peer Visualization */}
        <div className="flex flex-wrap gap-4 justify-center">
            {/* User Node */}
            <div className="flex flex-col items-center gap-2 p-3 rounded-lg border-2 border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-md">
                <div className="relative">
                    <Server className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 animate-pulse"></div>
                </div>
                <div className="text-xs font-bold text-indigo-900 dark:text-indigo-100">You</div>
                <div className="text-[10px] text-indigo-700 dark:text-indigo-300">Node Mode</div>
            </div>

            {/* Peers */}
            {peers.map((peer, i) => (
                <div key={peer.name} className="flex flex-col items-center gap-2 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm animate-in zoom-in duration-300" style={{ animationDelay: `${i * 50}ms` }}>
                    <div className="relative">
                        <Network className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                    </div>
                    <div className="text-xs font-medium text-gray-700 dark:text-gray-300 max-w-[80px] truncate" title={peer.name}>
                        {peer.name}
                    </div>
                    <div className="text-[10px] text-gray-400 font-mono">
                        {peer.publicKey.substring(0, 6)}...
                    </div>
                </div>
            ))}
        </div>

        {/* Connection Lines (Simulated visually via SVG overlay? Too complex for now. Just grid layout) */}
      </div>

      {/* God Mode Controls */}
      {mode === 'god' && (
        <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-between gap-2">
            <button
                onClick={handleAddPeer}
                className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-white border border-gray-300 rounded text-xs font-medium hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
            >
                <Plus className="w-3 h-3" /> Add Peer
            </button>
            <button
                onClick={handleRemovePeer}
                className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-white border border-gray-300 rounded text-xs font-medium hover:bg-red-50 hover:text-red-600 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
            >
                <Trash2 className="w-3 h-3" /> Remove Peer
            </button>
        </div>
      )}
    </div>
  );
};

export default NetworkPanel;
