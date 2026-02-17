import React, { useState, useEffect } from 'react';
import { Network, Users, Globe, Activity, Plus, Trash2, Server, Wifi, WifiOff, RefreshCcw } from 'lucide-react';
import { backgroundEngine } from '../../../engine/BackgroundEngine';
import { useSandboxStore } from '../../../stores/useSandboxStore';
import SandboxPanel from '../SandboxPanel';

import { Wallet } from '../../../engine/types';

const NetworkPanel: React.FC = () => {
  const mode = useSandboxStore(state => state.mode);
  const [peers, setPeers] = useState<Wallet[]>([]);
  const [networkHashRate, setNetworkHashRate] = useState<number>(0);
  const [latencies, setLatencies] = useState<Record<string, number>>({});

  // Poll peers and hashrate
  useEffect(() => {
    const updateNetworkStats = () => {
      const currentPeers = [...backgroundEngine.getPeerWallets()];
      setPeers(currentPeers);

      const miners = backgroundEngine.getSimulatedMiners();
      const totalHashRate = miners.reduce((sum, m) => sum + m.hashRate, 0);
      setNetworkHashRate(totalHashRate);

      // Simulate latency updates
      const newLatencies: Record<string, number> = {};
      currentPeers.forEach(p => {
          newLatencies[p.name] = Math.floor(Math.random() * 80) + 20; // 20-100ms
      });
      setLatencies(newLatencies);
    };

    updateNetworkStats();
    const interval = setInterval(updateNetworkStats, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleAddPeer = () => {
      backgroundEngine.addPeer();
      setPeers([...backgroundEngine.getPeerWallets()]);
  };

  const handleRemovePeer = () => {
      backgroundEngine.removePeer();
      setPeers([...backgroundEngine.getPeerWallets()]);
  };

  const handleReset = () => {
      // backgroundEngine.reset(); // If exists
      // Manually remove all peers for now
      while(backgroundEngine.getPeerWallets().length > 0) {
          backgroundEngine.removePeer();
      }
      setPeers([]);
  };

  return (
    <SandboxPanel
        title="Network"
        icon={Globe}
        footer={
             mode === 'god' && (
                <div className="flex gap-2">
                    <button
                        onClick={handleAddPeer}
                        className="flex-1 flex items-center justify-center gap-1 py-2 bg-indigo-50 border border-indigo-200 rounded-lg text-xs font-bold text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:border-indigo-800 dark:text-indigo-400 transition-colors"
                    >
                        <Plus className="w-3 h-3" /> Add Peer
                    </button>
                    <button
                        onClick={handleRemovePeer}
                        className="flex-1 flex items-center justify-center gap-1 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 transition-colors"
                    >
                        <Trash2 className="w-3 h-3" /> Drop Peer
                    </button>
                    <button
                        onClick={handleReset}
                         className="w-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
                    >
                        <RefreshCcw className="w-4 h-4 text-gray-500" />
                    </button>
                </div>
             )
        }
    >
      <div className="h-full flex flex-col">
        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-3 mb-4 shrink-0">
             <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl border border-blue-100 dark:border-blue-800 flex items-center gap-3">
                 <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg text-blue-600 dark:text-blue-300">
                     <Users className="w-4 h-4" />
                 </div>
                 <div>
                     <div className="text-xl font-bold text-blue-900 dark:text-blue-100 leading-none">{peers.length + 1}</div>
                     <div className="text-[10px] font-bold text-blue-400 uppercase tracking-wide">Active Nodes</div>
                 </div>
             </div>
             <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-xl border border-emerald-100 dark:border-emerald-800 flex items-center gap-3">
                 <div className="p-2 bg-emerald-100 dark:bg-emerald-800 rounded-lg text-emerald-600 dark:text-emerald-300">
                     <Activity className="w-4 h-4" />
                 </div>
                 <div>
                     <div className="text-xl font-bold text-emerald-900 dark:text-emerald-100 leading-none">{networkHashRate}</div>
                     <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-wide">MH/s Hashrate</div>
                 </div>
             </div>
        </div>

        {/* Peer Grid */}
        <div className="flex-1 overflow-y-auto min-h-[100px] p-1">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {/* User Node */}
                <div className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-lg relative group">
                    <div className="absolute top-2 right-2 flex flex-col items-end">
                        <span className="flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                    </div>

                    <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm border border-indigo-100 dark:border-indigo-800">
                            <Server className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-xs font-bold text-indigo-900 dark:text-indigo-100">You</div>
                        <div className="text-[10px] text-indigo-600 dark:text-indigo-300 font-mono">127.0.0.1</div>
                    </div>

                    {/* Connection lines visual hint */}
                    <div className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full mt-1 overflow-hidden">
                        <div className="h-full bg-green-500 w-full animate-pulse"></div>
                    </div>
                </div>

                {/* Peers */}
                {peers.map((peer, i) => {
                    const latency = latencies[peer.name] || 50;
                    const qualityColor = latency < 50 ? 'text-green-500' : latency < 100 ? 'text-yellow-500' : 'text-red-500';
                    const signalIcon = latency < 50 ? <Wifi className="w-3 h-3" /> : latency < 100 ? <Wifi className="w-3 h-3 opacity-70" /> : <WifiOff className="w-3 h-3" />;

                    return (
                        <div key={peer.name} className="flex flex-col items-center gap-2 p-3 rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all animate-in zoom-in duration-300">
                            <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-700 flex items-center justify-center text-gray-400">
                                <Network className="w-5 h-5" />
                            </div>

                            <div className="text-center w-full">
                                <div className="text-xs font-bold text-gray-700 dark:text-gray-200 truncate px-1" title={peer.name}>
                                    {peer.name}
                                </div>
                                <div className={`text-[10px] font-mono flex items-center justify-center gap-1 ${qualityColor}`}>
                                    {signalIcon} {latency}ms
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
      </div>
    </SandboxPanel>
  );
};

export default NetworkPanel;
