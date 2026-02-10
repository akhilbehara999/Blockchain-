import React from 'react';
import ModuleLayout from '../components/layout/ModuleLayout';
import ConsensusViz from '../components/blockchain/ConsensusViz';

const M08_Consensus: React.FC = () => {
  return (
    <ModuleLayout
      moduleId="consensus"
      title="Consensus Mechanisms"
      subtitle="How blockchains agree on the truth"
    >
      <ConsensusViz />
    </ModuleLayout>
  );
};

export default M08_Consensus;
