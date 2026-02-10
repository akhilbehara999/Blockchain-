import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ec as EC } from 'elliptic';
import { PenTool, ArrowDown } from 'lucide-react';
import ModuleLayout from '../components/layout/ModuleLayout';
import KeyPairDisplay from '../components/blockchain/KeyPairDisplay';
import SignatureVerifier from '../components/blockchain/SignatureVerifier';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { sha256 } from '../engine/hash';

const ec = new EC('secp256k1');

const M06_Signatures: React.FC = () => {
  // State
  const [keyPair, setKeyPair] = useState<{ publicKey: string; privateKey: string } | null>(null);
  const [signMessage, setSignMessage] = useState<string>('Hello Blockchain!');
  const [signature, setSignature] = useState<string>('');
  const [isSigning, setIsSigning] = useState(false);

  // Generate initial key pair on mount
  useEffect(() => {
    generateNewKeyPair();
  }, []);

  const generateNewKeyPair = () => {
    const key = ec.genKeyPair();
    setKeyPair({
      publicKey: key.getPublic('hex'),
      privateKey: key.getPrivate('hex')
    });
    setSignature('');
  };

  const handleSign = () => {
    if (!keyPair || !signMessage) return;

    setIsSigning(true);

    // Simulate processing time for animation
    setTimeout(() => {
      try {
        const key = ec.keyFromPrivate(keyPair.privateKey);
        const msgHash = sha256(signMessage);
        const sig = key.sign(msgHash).toDER('hex');
        setSignature(sig);
      } catch (error) {
        console.error("Signing error:", error);
      }
      setIsSigning(false);
    }, 800);
  };

  const verifySignature = (message: string, sig: string, pubKey: string): boolean => {
    try {
      const key = ec.keyFromPublic(pubKey, 'hex');
      const msgHash = sha256(message);
      return key.verify(msgHash, sig);
    } catch (error) {
      console.error("Verification error:", error);
      return false;
    }
  };

  return (
    <ModuleLayout
      moduleId="signatures"
      title="Digital Signatures"
      subtitle="Authenticate messages and prove identity without revealing secrets"
    >
      <div className="space-y-12 max-w-4xl mx-auto">

        {/* Visual Metaphor Section */}
        <Card className="bg-gradient-to-br from-secondary-bg to-tertiary-bg border-none">
          <div className="flex flex-col md:flex-row items-center justify-around p-8 min-h-[200px]">
            <div className="text-center space-y-4 max-w-xs">
              <h3 className="text-lg font-bold text-text-primary">The Concept</h3>
              <p className="text-text-secondary text-sm">
                A digital signature is like a wax seal. You use your
                <span className="text-danger font-mono mx-1">Private Key</span>
                to stamp (sign) a document. Anyone with your
                <span className="text-success font-mono mx-1">Public Key</span>
                can verify the seal is authentic and unbroken.
              </p>
            </div>

            {/* Animated Illustration */}
            <div className="relative w-48 h-32 flex items-center justify-center">
              {/* Document */}
              <motion.div
                className="absolute w-24 h-32 bg-white/10 rounded-lg border border-white/20 flex flex-col items-center justify-center"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="w-16 h-1 bg-white/20 rounded mb-2" />
                <div className="w-12 h-1 bg-white/20 rounded mb-2" />
                <div className="w-14 h-1 bg-white/20 rounded" />

                {/* Seal appears when signed */}
                <AnimatePresence>
                  {signature && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="absolute bottom-4 w-8 h-8 rounded-full bg-accent border-2 border-white/50 flex items-center justify-center"
                    >
                      <PenTool className="w-4 h-4 text-white" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Key Animation (Signing) */}
              <AnimatePresence>
                {isSigning && (
                  <motion.div
                    initial={{ x: 50, y: -50, opacity: 0 }}
                    animate={{ x: 0, y: 0, opacity: 1, rotate: -45 }}
                    exit={{ x: 50, y: -50, opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="absolute z-10 text-danger"
                  >
                    <PenTool className="w-12 h-12 fill-current" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </Card>

        {/* Section 1: Sign a Message */}
        <section className="space-y-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white font-bold">1</div>
            <h2 className="text-2xl font-bold text-text-primary">Sign a Message</h2>
          </div>

          <div className="grid gap-8">
            {keyPair && (
              <KeyPairDisplay
                publicKey={keyPair.publicKey}
                privateKey={keyPair.privateKey}
                onGenerate={generateNewKeyPair}
              />
            )}

            <Card>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">Message to Sign</label>
                  <textarea
                    value={signMessage}
                    onChange={(e) => {
                      setSignMessage(e.target.value);
                      setSignature(''); // Reset signature when message changes
                    }}
                    className="w-full px-4 py-3 rounded-xl bg-tertiary-bg border-2 border-border focus:border-accent outline-none transition-colors text-text-primary min-h-[100px] resize-none"
                    placeholder="Type your message here..."
                  />
                </div>

                <div className="flex flex-col items-center space-y-4">
                  <Button
                    onClick={handleSign}
                    disabled={!signMessage || isSigning}
                    className="w-full sm:w-auto min-w-[200px]"
                  >
                    <PenTool className="w-4 h-4 mr-2" />
                    {isSigning ? 'Signing...' : 'Sign Message'}
                  </Button>

                  <AnimatePresence>
                    {signature && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="w-full overflow-hidden"
                      >
                         <div className="relative mt-4 pt-4 border-t border-border">
                           <label className="block text-xs font-mono text-text-secondary mb-1 text-center">GENERATED SIGNATURE</label>
                           <div className="bg-black/30 p-4 rounded-xl font-mono text-xs break-all text-accent border border-accent/30 text-center">
                             {signature}
                           </div>
                         </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </Card>
          </div>
        </section>

        <div className="flex justify-center text-text-secondary">
          <ArrowDown className="w-8 h-8 animate-bounce" />
        </div>

        {/* Section 2: Verify a Signature */}
        <section className="space-y-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white font-bold">2</div>
            <h2 className="text-2xl font-bold text-text-primary">Verify a Signature</h2>
          </div>

          <SignatureVerifier
            initialMessage={signMessage}
            initialSignature={signature}
            initialPublicKey={keyPair?.publicKey || ''}
            onVerify={verifySignature}
          />
        </section>

      </div>
    </ModuleLayout>
  );
};

export default M06_Signatures;
