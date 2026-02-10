import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, ShieldCheck } from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Input from '../ui/Input';

interface SignatureVerifierProps {
  initialMessage?: string;
  initialSignature?: string;
  initialPublicKey?: string;
  onVerify: (message: string, signature: string, publicKey: string) => boolean;
}

const SignatureVerifier: React.FC<SignatureVerifierProps> = ({
  initialMessage = '',
  initialSignature = '',
  initialPublicKey = '',
  onVerify
}) => {
  const [message, setMessage] = useState(initialMessage);
  const [signature, setSignature] = useState(initialSignature);
  const [publicKey, setPublicKey] = useState(initialPublicKey);
  const [isValid, setIsValid] = useState<boolean | null>(null);

  // Update local state if props change (e.g. from parent updates)
  useEffect(() => {
    if (initialMessage) setMessage(initialMessage);
  }, [initialMessage]);

  useEffect(() => {
    if (initialSignature) setSignature(initialSignature);
  }, [initialSignature]);

  useEffect(() => {
    if (initialPublicKey) setPublicKey(initialPublicKey);
  }, [initialPublicKey]);

  // Reset validation status when inputs change
  useEffect(() => {
    setIsValid(null);
  }, [message, signature, publicKey]);

  const handleVerify = () => {
    if (!message || !signature || !publicKey) {
      setIsValid(false);
      return;
    }
    const result = onVerify(message, signature, publicKey);
    setIsValid(result);
  };

  return (
    <Card className="relative overflow-hidden">
      <div className="space-y-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 rounded-lg bg-accent/10">
            <ShieldCheck className="w-6 h-6 text-accent" />
          </div>
          <h3 className="text-xl font-bold text-text-primary">Verify Signature</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-tertiary-bg border-2 border-border focus:border-accent outline-none transition-colors text-text-primary min-h-[100px] resize-none"
              placeholder="Enter message to verify..."
            />
          </div>

          <Input
            label="Signature"
            value={signature}
            onChange={(e) => setSignature(e.target.value)}
            variant="monospace"
          />

          <Input
            label="Public Key"
            value={publicKey}
            onChange={(e) => setPublicKey(e.target.value)}
            variant="monospace"
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <Button onClick={handleVerify} className="w-32">
            Verify
          </Button>

          <AnimatePresence mode="wait">
            {isValid === true && (
              <motion.div
                key="valid"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="flex items-center space-x-2 text-success bg-success/10 px-4 py-2 rounded-lg border border-success/20"
              >
                <Check className="w-5 h-5" />
                <span className="font-bold">Valid Signature</span>
              </motion.div>
            )}

            {isValid === false && (
              <motion.div
                key="invalid"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="flex items-center space-x-2 text-danger bg-danger/10 px-4 py-2 rounded-lg border border-danger/20"
              >
                <X className="w-5 h-5" />
                <span className="font-bold">Invalid Signature</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Card>
  );
};

export default SignatureVerifier;
