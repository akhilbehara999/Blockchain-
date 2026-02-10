import React from 'react';
import ModuleLayout from '../components/layout/ModuleLayout';
import Card from '../components/ui/Card';

const Hash: React.FC = () => {
  return (
    <ModuleLayout moduleId="hash" title="Hash" subtitle="Learn about SHA-256">
      <Card>
        <div className="p-8 text-center text-text-secondary">
          <p>Simulation content for Hash will go here.</p>
        </div>
      </Card>
    </ModuleLayout>
  );
};

export default Hash;
