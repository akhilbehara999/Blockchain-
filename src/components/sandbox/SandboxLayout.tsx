import React, { useState } from 'react';
import SandboxToolbar from './SandboxToolbar';
import ChainPanel from './panels/ChainPanel';
import MiningPanel from './panels/MiningPanel';
import WalletPanel from './panels/WalletPanel';
import MempoolPanel from './panels/MempoolPanel';
import NetworkPanel from './panels/NetworkPanel';
import ContractPanel from './panels/ContractPanel';
import EventLogPanel from './panels/EventLogPanel';
import Tabs from '../ui/Tabs';
import { Box, Hammer, Wallet, Layers, Globe, FileCode } from 'lucide-react';
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

  useKeyboardShortcuts({
    'm': () => {
        setActiveTab('mining');
        addToast('Switched to Mining', 'info', 1000);
    },
    't': () => {
        setActiveTab('wallet');
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
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden font-sans transition-colors duration-300">
      <SandboxToolbar />

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden relative flex flex-col">

        {/* Mobile View (<768px) */}
        <div className="md:hidden flex-1 flex flex-col overflow-hidden">
          <div className="p-2 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shrink-0 overflow-x-auto no-scrollbar">
             <Tabs
              tabs={[
                { id: 'chain', label: 'Chain', icon: <Box className="w-4 h-4" /> },
                { id: 'mining', label: 'Mining', icon: <Hammer className="w-4 h-4" /> },
                { id: 'wallet', label: 'Wallet', icon: <Wallet className="w-4 h-4" /> },
                { id: 'mempool', label: 'Mempool', icon: <Layers className="w-4 h-4" /> },
                { id: 'network', label: 'Network', icon: <Globe className="w-4 h-4" /> },
                { id: 'contract', label: 'Contracts', icon: <FileCode className="w-4 h-4" /> },
              ]}
              activeTab={activeTab}
              onChange={setActiveTab}
              className="min-w-max"
            />
          </div>
          <div className="flex-1 p-3 overflow-hidden bg-gray-100 dark:bg-gray-950">
             {activeTab === 'chain' && <ChainPanel />}
             {activeTab === 'mining' && <MiningPanel />}
             {activeTab === 'wallet' && <WalletPanel />}
             {activeTab === 'mempool' && <MempoolPanel />}
             {activeTab === 'network' && <NetworkPanel />}
             {activeTab === 'contract' && <ContractPanel />}
          </div>
        </div>

        {/* Tablet/Desktop Grid (>=768px) */}
        <div className="hidden md:block flex-1 overflow-y-auto p-4 lg:p-6 custom-scrollbar bg-gray-100 dark:bg-gray-950">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 auto-rows-[minmax(400px,auto)] pb-32 max-w-[1920px] mx-auto">
                 {/* Row 1 */}
                 <div className="h-[400px] lg:h-[450px]"><ChainPanel /></div>
                 <div className="h-[400px] lg:h-[450px]"><MiningPanel /></div>
                 <div className="h-[400px] lg:h-[450px]"><WalletPanel /></div>

                 {/* Row 2 */}
                 <div className="h-[400px] lg:h-[450px]"><MempoolPanel /></div>
                 <div className="h-[400px] lg:h-[450px]"><NetworkPanel /></div>
                 <div className="h-[400px] lg:h-[450px]"><ContractPanel /></div>
            </div>
        </div>

        {/* Event Log (Sticky Bottom) */}
        <div className="shrink-0 z-40 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
            <EventLogPanel />
        </div>
      </div>
    </div>
  );
};

export default SandboxLayout;
