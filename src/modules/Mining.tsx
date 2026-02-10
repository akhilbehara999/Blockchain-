import React from 'react';
import ModuleLayout from '../components/layout/ModuleLayout';
import Card from '../components/ui/Card';

const Mining: React.FC = () => {
  return (
    <ModuleLayout moduleId="mining" title="Mining" subtitle="Securing the network">
      <Card>
        <div className="p-8 text-center text-text-secondary">
          <p>Simulation content for Mining will go here.</p>
        </div>
      </Card>
    </ModuleLayout>
  );
};

export default Mining;
