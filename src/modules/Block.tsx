import React from 'react';
import ModuleLayout from '../components/layout/ModuleLayout';
import Card from '../components/ui/Card';

const Block: React.FC = () => {
  return (
    <ModuleLayout moduleId="block" title="Block" subtitle="Understand the Block structure">
      <Card>
        <div className="p-8 text-center text-text-secondary">
          <p>Simulation content for Block will go here.</p>
        </div>
      </Card>
    </ModuleLayout>
  );
};

export default Block;
