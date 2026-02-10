import React from 'react';
import ModuleLayout from '../components/layout/ModuleLayout';
import Card from '../components/ui/Card';

const Difficulty: React.FC = () => {
  return (
    <ModuleLayout moduleId="difficulty" title="Difficulty" subtitle="Adjusting the target">
      <Card>
        <div className="p-8 text-center text-text-secondary">
          <p>Simulation content for Difficulty will go here.</p>
        </div>
      </Card>
    </ModuleLayout>
  );
};

export default Difficulty;
