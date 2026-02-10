import React from 'react';
import ModuleLayout from '../components/layout/ModuleLayout';
import Card from '../components/ui/Card';

const Tokens: React.FC = () => {
  return (
    <ModuleLayout moduleId="tokens" title="Tokens" subtitle="Digital assets">
      <Card>
        <div className="p-8 text-center text-text-secondary">
          <p>Simulation content for Tokens will go here.</p>
        </div>
      </Card>
    </ModuleLayout>
  );
};

export default Tokens;
