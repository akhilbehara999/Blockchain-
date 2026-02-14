import React from 'react';
import ChallengeCard from './ChallengeCard';

const ChallengeList: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <ChallengeCard
        title="Double Spend Attack"
        description="Try to spend the same UTXO twice before the block is mined."
        isUnlocked={true}
        isCompleted={false}
        reward={100}
        onStart={() => {}}
      />
      <ChallengeCard
        title="Fork Resolution"
        description="Create a longer chain to invalidate your opponent's blocks."
        isUnlocked={false}
        isCompleted={false}
        reward={200}
        onStart={() => {}}
      />
      <ChallengeCard
        title="Contract Exploit"
        description="Find a reentrancy vulnerability in this simple contract."
        isUnlocked={false}
        isCompleted={false}
        reward={300}
        onStart={() => {}}
      />
      <ChallengeCard
        title="51% Attack"
        description="Control majority hash power to rewrite history."
        isUnlocked={false}
        isCompleted={false}
        reward={500}
        onStart={() => {}}
      />
    </div>
  );
};

export default ChallengeList;
