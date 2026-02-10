import React from 'react';
import ModuleLayout from '../components/layout/ModuleLayout';
import Card from '../components/ui/Card';

const Introduction: React.FC = () => {
  return (
    <ModuleLayout moduleId="introduction" title="Introduction" subtitle="Welcome to BlockSim">
      <Card>
        <div className="p-8 text-center text-text-secondary">
          <p>Simulation content for Introduction will go here.</p>
        </div>
      </Card>
    </ModuleLayout>
  );
};

export default Introduction;
