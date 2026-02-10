import React from 'react';
import ModuleLayout from '../components/layout/ModuleLayout';
import Card from '../components/ui/Card';

const Keys: React.FC = () => {
  return (
    <ModuleLayout moduleId="keys" title="Keys" subtitle="Public and Private keys">
      <Card>
        <div className="p-8 text-center text-text-secondary">
          <p>Simulation content for Keys will go here.</p>
        </div>
      </Card>
    </ModuleLayout>
  );
};

export default Keys;
