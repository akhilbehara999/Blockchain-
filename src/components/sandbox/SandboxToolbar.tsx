import React, { useEffect, useState } from 'react';
import { Eye, Server, Zap, Settings } from 'lucide-react';
import { useSandboxStore } from '../../stores/useSandboxStore';
import { NodeIdentity } from '../../engine/NodeIdentity';
import ProgressBar from '../ui/ProgressBar';
import { Link } from 'react-router-dom';

const SandboxToolbar: React.FC = () => {
  const { mode, setMode } = useSandboxStore();
  const [nodeId, setNodeId] = useState<string>('');

  // Mastery
  const masteryScore = useSandboxStore(state => state.getMasteryScore());
  const masteryLevel = useSandboxStore(state => state.getMasteryLevel());

  useEffect(() => {
    try {
      const identity = NodeIdentity.getOrCreate();
      setNodeId(identity.getId());
    } catch (e) {
      setNodeId('Node #UNKNOWN');
    }
  }, []);

  return (
    <div className="sticky top-0 z-50 glass backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 h-16 flex items-center justify-between px-4 lg:px-6 transition-all duration-300">

      {/* Left: Branding */}
      <div className="flex items-center gap-3">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 transition-transform group-hover:scale-105">
            <Zap className="w-5 h-5 fill-current" />
          </div>
          <div className="hidden md:block">
            <h1 className="font-display font-bold text-lg leading-none text-gray-900 dark:text-white">Blockchain</h1>
            <span className="text-xs font-medium text-gray-500 tracking-wider uppercase">Sandbox Control</span>
          </div>
        </Link>
      </div>

      {/* Center: Mode Toggle */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:flex flex-col items-center">
        <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-xl flex items-center shadow-inner border border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setMode('node')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
              mode === 'node'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>Node</span>
          </button>
          <button
            onClick={() => setMode('god')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
              mode === 'god'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>God Mode</span>
          </button>
        </div>
        <span className="text-[10px] mt-1 font-medium text-gray-400">
            {mode === 'node' ? `You are ${nodeId}` : 'Omniscient View'}
        </span>
      </div>

      {/* Right: Mastery & Settings */}
      <div className="flex items-center gap-4">
        {/* Mastery Badge */}
        <div className="hidden sm:flex items-center gap-3 bg-gray-50 dark:bg-gray-800/50 pr-4 pl-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold border ${
                masteryScore >= 75 ? 'bg-amber-100 text-amber-700 border-amber-200' :
                masteryScore >= 50 ? 'bg-indigo-100 text-indigo-700 border-indigo-200' :
                'bg-gray-100 text-gray-700 border-gray-200'
            }`}>
                {masteryScore >= 75 ? '🏆' : masteryScore >= 50 ? '⚡' : '🎓'}
            </div>
            <div className="flex flex-col w-24">
                <div className="flex justify-between text-xs mb-1">
                    <span className="font-bold text-gray-900 dark:text-white">{masteryLevel}</span>
                    <span className="font-mono text-gray-500">{Math.floor(masteryScore)}%</span>
                </div>
                <ProgressBar value={masteryScore} size="sm" showPercentage={false} animated={true} />
            </div>
        </div>

        {/* Mobile Mode Toggle (Simplified) */}
        <button
             onClick={() => setMode(mode === 'node' ? 'god' : 'node')}
             className="md:hidden w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
        >
            {mode === 'node' ? <Server className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>

        <button className="w-10 h-10 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center text-gray-500 transition-colors">
            <Settings className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default SandboxToolbar;
