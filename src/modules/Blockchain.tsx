import React from 'react';
import ModuleLayout from '../components/layout/ModuleLayout';
import Card from '../components/ui/Card';

const Blockchain: React.FC = () => {
  return (
    <ModuleLayout moduleId="blockchain" title="Blockchain" subtitle="Link blocks together">
      <Card>
        <div className="p-8 text-center text-text-secondary">
          <p>Simulation content for Blockchain will go here.</p>
        </div>
      </Card>
    </ModuleLayout>
  );
};

export default Blockchain;
