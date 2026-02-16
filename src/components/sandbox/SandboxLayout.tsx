import React, { useState, useRef } from 'react';
import SandboxToolbar from './SandboxToolbar';
import ChainPanel from './panels/ChainPanel';
import MiningPanel from './panels/MiningPanel';
import WalletPanel from './panels/WalletPanel';
import MempoolPanel from './panels/MempoolPanel';
import NetworkPanel from './panels/NetworkPanel';
import ContractPanel from './panels/ContractPanel';
import EventLogPanel from './panels/EventLogPanel';
import Tabs from '../ui/Tabs';
import { Box, Hammer, Wallet, Layers, Globe, FileCode, Terminal } from 'lucide-react';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { useSandboxStore } from '../../stores/useSandboxStore';
import { useBackground } from '../../context/BackgroundContext';
import { useToast } from '../../context/ToastContext';
import { useSound } from '../../context/SoundContext';

const SandboxLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState('chain');
  const { mode, setMode } = useSandboxStore();
  const { engine } = useBackground();
  const { addToast } = useToast();
  const { playSound } = useSound();

  // Refs for scrolling
  const miningRef = useRef<HTMLDivElement>(null);
  const walletRef = useRef<HTMLDivElement>(null);

  useKeyboardShortcuts({
    'm': () => {
        setActiveTab('mining');
        miningRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        addToast('Switched to Mining', 'info', 1000);
    },
    't': () => {
        setActiveTab('wallet');
        walletRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        addToast('Switched to Wallet', 'info', 1000);
    },
    'g': () => {
        const newMode = mode === 'god' ? 'node' : 'god';
        setMode(newMode);
        addToast(`Switched to ${newMode === 'god' ? 'God' : 'Node'} Mode`, 'info', 2000);
        playSound('click');
    },
    ' ': () => {
        const isRunning = engine.toggle();
        addToast(isRunning ? 'Simulation Resumed' : 'Simulation Paused', 'info', 2000);
        playSound('click');
    }
  });

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      <SandboxToolbar />

      {/* Mobile/Tablet View (Tabs) - Visible below lg (1024px) */}
      <div className="lg:hidden flex-1 flex flex-col overflow-hidden">
        <div className="p-2 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 shrink-0">
          <Tabs
            tabs={[
              { id: 'chain', label: 'Chain', icon: <Box className="w-4 h-4" /> },
              { id: 'mining', label: 'Mining', icon: <Hammer className="w-4 h-4" /> },
              { id: 'wallet', label: 'Wallet', icon: <Wallet className="w-4 h-4" /> },
              { id: 'mempool', label: 'Mempool', icon: <Layers className="w-4 h-4" /> },
              { id: 'network', label: 'Network', icon: <Globe className="w-4 h-4" /> },
              { id: 'contract', label: 'Contracts', icon: <FileCode className="w-4 h-4" /> },
              { id: 'events', label: 'Logs', icon: <Terminal className="w-4 h-4" /> },
            ]}
            activeTab={activeTab}
            onChange={setActiveTab}
            className="w-full"
          />
        </div>
        <div className="flex-1 p-4 overflow-y-auto">
          {activeTab === 'chain' && <div className="h-[400px]"><ChainPanel /></div>}
          {activeTab === 'mining' && <div className="h-[500px]"><MiningPanel /></div>}
          {activeTab === 'wallet' && <div className="h-[500px]"><WalletPanel /></div>}
          {activeTab === 'mempool' && <div className="h-[500px]"><MempoolPanel /></div>}
          {activeTab === 'network' && <div className="h-[400px]"><NetworkPanel /></div>}
          {activeTab === 'contract' && <div className="h-[600px]"><ContractPanel /></div>}
          {activeTab === 'events' && <div className="h-[400px]"><EventLogPanel /></div>}
        </div>
      </div>

      {/* Desktop View (Dashboard Grid) - Visible lg and above */}
      <div className="hidden lg:block flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-3 gap-6 auto-rows-min max-w-[1600px] mx-auto">

            {/* Top Row */}
            <div className="col-span-2 h-[350px]">
                <ChainPanel />
            </div>
            <div className="col-span-1 h-[350px]" ref={miningRef}>
                <MiningPanel />
            </div>

            {/* Middle Row */}
            <div className="col-span-1 h-[450px]" ref={walletRef}>
                <WalletPanel />
            </div>
            <div className="col-span-1 h-[450px]">
                <MempoolPanel />
            </div>
            <div className="col-span-1 h-[450px]">
                <ContractPanel />
            </div>

            {/* Bottom Row */}
            <div className="col-span-1 h-[250px]">
                <NetworkPanel />
            </div>
            <div className="col-span-2 h-[250px]">
                <EventLogPanel />
            </div>
        </div>
      </div>
    </div>
  );
};

export default SandboxLayout;
