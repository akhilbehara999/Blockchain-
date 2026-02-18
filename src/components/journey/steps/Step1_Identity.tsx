import React, { useState, useEffect } from 'react';
import { useNodeIdentity } from '../../../context/NodeContext';
import { useProgress } from '../../../context/ProgressContext';
import { Storage } from '../../../utils/storage';
import { Unlock, Key, FileDigit, RefreshCw, Eye, EyeOff, Check, X } from 'lucide-react';
import Card from '../../ui/Card';
import Button from '../../ui/Button';
import Badge from '../../ui/Badge';
import Hash from '../../ui/Hash';
import { useInView } from '../../../hooks/useInView';
import { useNavigate } from 'react-router-dom';

const Step1_Identity: React.FC = () => {
  const { identity, createIdentity } = useNodeIdentity();
  const { completeStep } = useProgress();
  const navigate = useNavigate();

  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [guess, setGuess] = useState('');

  const [guessAttempted, setGuessAttempted] = useState(() => {
    try {
      const saved = localStorage.getItem('yupp_step1_state');
      return saved ? JSON.parse(saved).guessAttempted : false;
    } catch { return false; }
  });

  const [generated, setGenerated] = useState(false);

  // Persist state
  useEffect(() => {
    try {
      localStorage.setItem('yupp_step1_state', JSON.stringify({ guessAttempted }));
    } catch {}
  }, [guessAttempted]);

  // InView hooks for animations
  const [headerRef, headerVisible] = useInView({ threshold: 0.1 });
  const [storyRef, storyVisible] = useInView({ threshold: 0.1 });
  const [generateRef, generateVisible] = useInView({ threshold: 0.1 });
  const [keysRef, keysVisible] = useInView({ threshold: 0.1 });
  const [experimentRef, experimentVisible] = useInView({ threshold: 0.1 });
  const [completionRef, completionVisible] = useInView({ threshold: 0.1 });

  useEffect(() => {
    if (identity) {
      setGenerated(true);
    }
  }, [identity]);

  useEffect(() => {
    if (generated && guessAttempted) {
      completeStep(1);
    }
  }, [generated, guessAttempted, completeStep]);

  const handleGenerate = () => {
    Storage.removeItem('yupp_node_identity');
    createIdentity();
    setGenerated(true);
    setGuess('');
    setGuessAttempted(false);
  };

  const handleGuess = () => {
    if (!guess.trim()) return;
    setGuessAttempted(true);
  };

  // Helper to get keys
  const getKeys = () => {
    const stored = Storage.getItem<{ keyPair: { publicKey: string; privateKey: string } }>('yupp_node_identity');
    if (stored && stored.keyPair) {
        return stored.keyPair;
    }
    return { publicKey: '', privateKey: '' };
  };

  const { publicKey, privateKey } = getKeys();

  return (
    <div className="space-y-12 md:space-y-16 pb-20">

      {/* 1. SECTION HEADER */}
      <div ref={headerRef} className={`space-y-4 transition-all duration-700 ${headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <Badge variant="info">Step 1 of 8</Badge>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
          You Are a Node
        </h1>
        <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl">
          Every blockchain journey starts with an identity. No name, no face—just math.
        </p>
      </div>

      {/* 2. STORY/HOOK */}
      <div ref={storyRef} className={`transition-all duration-700 delay-100 ${storyVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <Card variant="glass" className="max-w-prose">
          <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300">
            In the real world, a bank knows who you are. Your name, your face, your social security number.
            <br /><br />
            In blockchain, you are just a number. But not just any number—a number so large and random that
            no one else could possibly guess it. This is your <strong>Private Key</strong>.
          </p>
        </Card>
      </div>

      {/* 3. INTERACTIVE SECTION: GENERATE KEYS */}
      <div ref={generateRef} className={`transition-all duration-700 delay-200 ${generateVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <Card variant="elevated" className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Generate Your Identity</h3>
            <Button
                onClick={handleGenerate}
                icon={<RefreshCw className={`w-4 h-4 ${!generated ? 'animate-spin' : ''}`} />}
            >
                {generated ? 'Regenerate Keys' : 'Generate New Keys'}
            </Button>
          </div>

          {!generated && (
              <div className="text-center py-12 text-gray-500">
                  Click the button above to create your cryptographic identity.
              </div>
          )}

          {generated && (
              <div ref={keysRef} className={`grid gap-6 transition-all duration-700 ${keysVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                 {/* Private Key */}
                 <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-red-600 dark:text-red-400">
                        <Key className="w-4 h-4" />
                        Private Key (Secret)
                    </div>
                    <div className="relative group">
                        <div className={`p-4 rounded-xl border-2 border-red-100 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 font-mono text-sm break-all transition-all duration-200 ${showPrivateKey ? 'text-gray-900 dark:text-white' : 'text-transparent blur-sm select-none'}`}>
                            {privateKey || "Error loading key"}
                        </div>
                        {!showPrivateKey && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Button size="sm" variant="ghost" onClick={() => setShowPrivateKey(true)} icon={<Eye className="w-4 h-4"/>}>
                                    Reveal Secret
                                </Button>
                            </div>
                        )}
                        {showPrivateKey && (
                             <div className="absolute top-2 right-2 flex gap-2">
                                <button onClick={() => setShowPrivateKey(false)} className="p-2 bg-white/50 dark:bg-black/50 rounded-lg hover:bg-white dark:hover:bg-black transition-colors">
                                    <EyeOff className="w-4 h-4 text-gray-600 dark:text-gray-400"/>
                                </button>
                             </div>
                        )}
                    </div>
                 </div>

                 <div className="w-full h-px bg-gray-200 dark:bg-gray-700 my-2" />

                 {/* Public Key */}
                 <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400">
                        <Unlock className="w-4 h-4" />
                        Public Key (Derived from Private Key)
                    </div>
                    <div className="p-4 rounded-xl border-2 border-surface-border dark:border-surface-dark-border bg-surface-primary dark:bg-surface-dark-secondary">
                        <Hash value={publicKey} truncate copyable />
                    </div>
                 </div>

                 {/* Address */}
                 <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-green-600 dark:text-green-400">
                        <FileDigit className="w-4 h-4" />
                        Wallet Address (Derived from Public Key)
                    </div>
                     <div className="p-4 rounded-xl border-2 border-green-100 dark:border-green-900/30 bg-green-50 dark:bg-green-900/10">
                        <Hash value={identity?.getWalletAddress() || ''} copyable className="text-lg font-bold text-gray-900 dark:text-white" />
                    </div>
                 </div>
              </div>
          )}
        </Card>
      </div>

      {/* 4. EXPERIMENT SECTION */}
      {generated && (
          <div ref={experimentRef} className={`transition-all duration-700 delay-300 ${experimentVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <Card variant="outlined" status="info">
                <div className="flex items-center gap-2 mb-6">
                    <span className="text-2xl">🧪</span>
                    <h3 className="text-xl font-bold">Experiment: The One-Way Street</h3>
                </div>

                <p className="mb-6 text-gray-600 dark:text-gray-300">
                    Your address is calculated from your private key. But can you go backwards?
                    Given your address <Hash value={identity?.getWalletAddress() || ''} truncate />, try to guess the private key.
                </p>

                <div className="flex flex-col md:flex-row gap-4">
                    <input
                        type="text"
                        value={guess}
                        onChange={(e) => setGuess(e.target.value)}
                        placeholder="Enter your guess..."
                        className="flex-1 rounded-xl border-2 border-surface-border dark:border-surface-dark-border bg-transparent px-4 py-3 font-mono focus:border-brand-500 focus:ring-4 focus:ring-brand-100 dark:focus:ring-brand-900/30 transition-all outline-none"
                    />
                    <Button onClick={handleGuess} disabled={!guess.trim() || guessAttempted}>
                        Check Guess
                    </Button>
                </div>

                {guessAttempted && (
                    <div className="mt-6 p-4 rounded-xl bg-status-error/10 border border-status-error/20 flex gap-4 items-start animate-fade-up">
                        <X className="w-6 h-6 text-status-error shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-bold text-gray-900 dark:text-white">Impossible!</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                There are more possible private keys than atoms in the universe. Even if you had every computer on Earth guessing for a billion years, you wouldn't find it.
                                <br/><br/>
                                This is why your funds are safe as long as you keep your private key secret.
                            </p>
                        </div>
                    </div>
                )}
            </Card>
          </div>
      )}

      {/* 5. SUCCESS SECTION */}
      {guessAttempted && (
          <div ref={completionRef} className={`transition-all duration-700 delay-500 ${completionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <Card variant="default" status="valid" className="bg-gradient-to-br from-white to-green-50 dark:from-gray-900 dark:to-green-900/20">
                <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                    <div className="w-16 h-16 bg-status-valid/10 text-status-valid rounded-2xl flex items-center justify-center shrink-0">
                        <Check className="w-8 h-8" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Identity Established</h3>
                        <p className="text-gray-600 dark:text-gray-300">
                            You now have a secure identity on the network. You are ready to start signing data.
                        </p>
                    </div>
                    <Button variant="success" size="lg" onClick={() => navigate('/journey/2')} className="w-full md:w-auto">
                        Continue to Step 2 →
                    </Button>
                </div>
            </Card>
          </div>
      )}

    </div>
  );
};

export default Step1_Identity;
