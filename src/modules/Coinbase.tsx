import React from 'react';
import ModuleLayout from '../components/layout/ModuleLayout';
import Card from '../components/ui/Card';

const Coinbase: React.FC = () => {
  return (
    <ModuleLayout moduleId="coinbase" title="Coinbase" subtitle="Block rewards">
      <Card>
        <div className="p-8 text-center text-text-secondary">
          <p>Simulation content for Coinbase will go here.</p>
        </div>
      </Card>
    </ModuleLayout>
  );
};

export default Coinbase;
