import React from 'react';
import ModuleLayout from '../components/layout/ModuleLayout';
import Card from '../components/ui/Card';

const Pow: React.FC = () => {
  return (
    <ModuleLayout moduleId="pow" title="Proof of Work" subtitle="The consensus mechanism">
      <Card>
        <div className="p-8 text-center text-text-secondary">
          <p>Simulation content for Proof of Work will go here.</p>
        </div>
      </Card>
    </ModuleLayout>
  );
};

export default Pow;
