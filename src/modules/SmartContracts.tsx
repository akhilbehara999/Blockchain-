import React from 'react';
import ModuleLayout from '../components/layout/ModuleLayout';
import Card from '../components/ui/Card';

const SmartContracts: React.FC = () => {
  return (
    <ModuleLayout moduleId="smart-contracts" title="Smart Contracts" subtitle="Code on chain">
      <Card>
        <div className="p-8 text-center text-text-secondary">
          <p>Simulation content for Smart Contracts will go here.</p>
        </div>
      </Card>
    </ModuleLayout>
  );
};

export default SmartContracts;
