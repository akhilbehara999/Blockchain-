import React, { useState, useEffect } from 'react';
import { ec as EC } from 'elliptic';
import ModuleLayout from '../components/layout/ModuleLayout';
import KeyPairDisplay from '../components/blockchain/KeyPairDisplay';
import Card from '../components/ui/Card';

const ec = new EC('secp256k1');

const Keys: React.FC = () => {
  const [keyPair, setKeyPair] = useState<{ publicKey: string; privateKey: string } | null>(null);

  const generateNewKeyPair = () => {
    const key = ec.genKeyPair();
    setKeyPair({
      publicKey: key.getPublic('hex'),
      privateKey: key.getPrivate('hex')
    });
  };

  useEffect(() => {
    generateNewKeyPair();
  }, []);

  return (
    <ModuleLayout moduleId="keys" title="Keys" subtitle="Public and Private Keys">
      <div className="space-y-8 max-w-4xl mx-auto">
        <Card className="bg-gradient-to-br from-secondary-bg to-tertiary-bg border-none">
          <div className="p-6">
            <h3 className="text-lg font-bold text-text-primary mb-2">Understanding Keys</h3>
            <p className="text-text-secondary">
              In blockchain, your identity is defined by a pair of keys.
              Your <span className="text-danger font-mono font-bold">Private Key</span> is like your password - never share it!
              Your <span className="text-success font-mono font-bold">Public Key</span> is like your username or bank account number - you share this so others can send you funds.
            </p>
          </div>
        </Card>

        {keyPair && (
          <KeyPairDisplay
            publicKey={keyPair.publicKey}
            privateKey={keyPair.privateKey}
            onGenerate={generateNewKeyPair}
          />
        )}
      </div>
    </ModuleLayout>
  );
};

export default Keys;
