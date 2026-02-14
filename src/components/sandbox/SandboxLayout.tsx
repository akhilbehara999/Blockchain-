import React from 'react';
import SandboxToolbar from './SandboxToolbar';
import ChainPanel from './panels/ChainPanel';
import MiningPanel from './panels/MiningPanel';
import WalletPanel from './panels/WalletPanel';
import MempoolPanel from './panels/MempoolPanel';
import NetworkPanel from './panels/NetworkPanel';
import ContractPanel from './panels/ContractPanel';
import EventLogPanel from './panels/EventLogPanel';

const SandboxLayout: React.FC = () => {
  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden">
      <SandboxToolbar />
      <div className="flex-1 overflow-auto p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Simple grid layout for panels for now */}
        <div className="col-span-1 md:col-span-2 lg:col-span-2 h-96">
            <ChainPanel />
        </div>
        <div className="h-96">
            <NetworkPanel />
        </div>
        <div className="h-96">
            <MiningPanel />
        </div>
        <div className="h-96">
            <WalletPanel />
        </div>
        <div className="h-96">
            <MempoolPanel />
        </div>
        <div className="h-96">
            <ContractPanel />
        </div>
         <div className="col-span-1 md:col-span-2 lg:col-span-3 h-64">
            <EventLogPanel />
        </div>
      </div>
    </div>
  );
};

export default SandboxLayout;
