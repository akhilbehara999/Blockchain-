import React from 'react';
import ModuleLayout from '../components/layout/ModuleLayout';
import Card from '../components/ui/Card';

const Signatures: React.FC = () => {
  return (
    <ModuleLayout moduleId="signatures" title="Signatures" subtitle="Digital Signatures">
      <Card>
        <div className="p-8 text-center text-text-secondary">
          <p>Simulation content for Signatures will go here.</p>
        </div>
      </Card>
    </ModuleLayout>
  );
};

export default Signatures;
