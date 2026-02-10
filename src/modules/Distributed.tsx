import React from 'react';
import ModuleLayout from '../components/layout/ModuleLayout';
import Card from '../components/ui/Card';

const Distributed: React.FC = () => {
  return (
    <ModuleLayout moduleId="distributed" title="Distributed" subtitle="Peer-to-Peer network">
      <Card>
        <div className="p-8 text-center text-text-secondary">
          <p>Simulation content for Distributed will go here.</p>
        </div>
      </Card>
    </ModuleLayout>
  );
};

export default Distributed;
