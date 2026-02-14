import React, { useState, useEffect, useRef } from 'react';
import { useNodeIdentity } from '../../../context/NodeContext';
import { useProgress } from '../../../context/ProgressContext';
import { Lock, Unlock, Copy, ArrowRight, Check, X, Shield, Key, FileDigit, RefreshCw, Eye, EyeOff } from 'lucide-react';

const Step1_Identity: React.FC = () => {
  const { identity, createIdentity } = useNodeIdentity();
  const { completeStep } = useProgress();

  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [guess, setGuess] = useState('');
  const [guessAttempted, setGuessAttempted] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  // Scroll refs
  const generateRef = useRef<HTMLDivElement>(null);
  const lessonRef = useRef<HTMLDivElement>(null);
  const completionRef = useRef<HTMLDivElement>(null);

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
    localStorage.removeItem('yupp_node_identity');
    createIdentity();
    setGenerated(true);
    setGuess('');
    setGuessAttempted(false);

    // Smooth scroll to next section
    setTimeout(() => {
       lessonRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleGuess = () => {
    if (!guess.trim()) return;
    setGuessAttempted(true);

    // Smooth scroll to completion
    setTimeout(() => {
       completionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  // Helper to get keys from localStorage since NodeIdentity doesn't expose them
  const getKeys = () => {
    try {
      const stored = localStorage.getItem('yupp_node_identity');
      if (stored) {
          const data = JSON.parse(stored);
          return data.keyPair || { publicKey: '', privateKey: '' };
      }
    } catch (e) { console.error(e); }
    return { publicKey: '', privateKey: '' };
  };

  const { publicKey, privateKey } = getKeys();

  return (
    <div className="space-y-16 pb-20">

      {/* SECTION 1 — THE HOOK */}
      <section className="space-y-6 max-w-3xl mx-auto text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="inline-flex items-center justify-center p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-full mb-4">
          <Shield className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">You Are a Node</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          Every blockchain journey starts with an identity.
        </p>

        <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl border border-gray-200 dark:border-gray-700 text-left space-y-4 max-w-2xl mx-auto shadow-sm">
          <p className="text-lg">
            In the real world, a bank knows who you are. Your name. Your face. Your social security.
          </p>
          <p className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">
            In blockchain, you are just a NUMBER. No name. No face. Just math.
          </p>
          <div className="pt-2 flex items-center text-gray-500 text-sm">
            <ArrowRight className="w-4 h-4 mr-2 animate-bounce" />
            Scroll down to create your identity
          </div>
        </div>
      </section>

      {/* SECTION 2 — GENERATE KEYPAIR */}
      <section ref={generateRef} className="space-y-8 max-w-3xl mx-auto border-t border-gray-200 dark:border-gray-800 pt-12">
        <div className="text-center space-y-4">
           <h2 className="text-2xl font-bold">Step 1: Generate Your Keys</h2>
           <button
             onClick={handleGenerate}
             className="inline-flex items-center px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/30 transition-all transform hover:-translate-y-1 hover:scale-105"
           >
             <RefreshCw className={`w-5 h-5 mr-2 ${generated ? '' : 'animate-spin-slow'}`} />
             {generated ? 'Regenerate Random Keypair' : 'Generate Random Keypair'}
           </button>
        </div>

        {generated && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">

             {/* Private Key */}
             <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30 rounded-xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 text-xs font-bold rounded-bl-xl">
                   SECRET
                </div>
                <div className="flex items-center mb-3">
                   <Key className="w-5 h-5 text-red-500 mr-2" />
                   <h3 data-testid="private-key-heading" className="font-bold text-gray-900 dark:text-white">Private Key</h3>
                </div>
                <div className="bg-white dark:bg-gray-900 p-3 rounded-lg border border-gray-200 dark:border-gray-700 font-mono text-sm break-all flex items-center justify-between gap-4">
                   <span className={showPrivateKey ? "text-gray-800 dark:text-gray-200" : "text-gray-400 select-none blur-sm"}>
                      {showPrivateKey ? privateKey : "•".repeat(64)}
                   </span>
                   <div className="flex items-center gap-2 flex-shrink-0">
                      <button onClick={() => setShowPrivateKey(!showPrivateKey)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-500">
                         {showPrivateKey ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                      </button>
                      <button onClick={() => copyToClipboard(privateKey, 'private')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-500 relative">
                         {copied === 'private' ? <Check className="w-4 h-4 text-green-500"/> : <Copy className="w-4 h-4"/>}
                      </button>
                   </div>
                </div>
                <p className="mt-2 text-xs text-red-600 dark:text-red-400">
                   ⚠️ Never share this. It controls your funds.
                </p>
             </div>

             {/* Public Key */}
             <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/30 rounded-xl p-6">
                <div className="flex items-center mb-3">
                   <Unlock className="w-5 h-5 text-blue-500 mr-2" />
                   <h3 className="font-bold text-gray-900 dark:text-white">Public Key</h3>
                </div>
                <div className="bg-white dark:bg-gray-900 p-3 rounded-lg border border-gray-200 dark:border-gray-700 font-mono text-xs break-all flex items-center justify-between gap-4">
                   <span className="text-gray-600 dark:text-gray-300">{publicKey}</span>
                   <button onClick={() => copyToClipboard(publicKey, 'public')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-500 flex-shrink-0">
                      {copied === 'public' ? <Check className="w-4 h-4 text-green-500"/> : <Copy className="w-4 h-4"/>}
                   </button>
                </div>
                <p className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                   This is derived from your private key. Safe to share.
                </p>
             </div>

             {/* Address */}
             <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800/30 rounded-xl p-6 relative">
                 {/* Visual arrow connecting Public Key to Address */}
                 <div className="absolute -top-6 left-8 w-0.5 h-6 bg-green-200 dark:bg-green-800/50"></div>

                 <div className="flex items-center mb-3">
                   <FileDigit className="w-5 h-5 text-green-500 mr-2" />
                   <h3 className="font-bold text-gray-900 dark:text-white">Wallet Address</h3>
                </div>
                <div className="bg-white dark:bg-gray-900 p-3 rounded-lg border border-gray-200 dark:border-gray-700 font-mono text-base break-all flex items-center justify-between gap-4 shadow-inner">
                   <span className="text-gray-800 dark:text-gray-200 font-bold">{identity?.getWalletAddress()}</span>
                   <button onClick={() => copyToClipboard(identity?.getWalletAddress() || '', 'address')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-500 flex-shrink-0">
                      {copied === 'address' ? <Check className="w-4 h-4 text-green-500"/> : <Copy className="w-4 h-4"/>}
                   </button>
                </div>
                 <div className="mt-4 p-3 bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700 text-sm">
                    <div className="flex items-center gap-2 mb-2 text-gray-500">
                        <span className="font-mono text-xs bg-red-100 dark:bg-red-900/30 text-red-600 px-1 rounded">Priv</span>
                        <ArrowRight className="w-3 h-3" />
                        <span className="font-mono text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 px-1 rounded">Pub</span>
                        <ArrowRight className="w-3 h-3" />
                        <span className="font-mono text-xs bg-green-100 dark:bg-green-900/30 text-green-600 px-1 rounded">Addr</span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-xs">
                        Your address is mathematically derived from your public key, which comes from your private key. It's a one-way street!
                    </p>
                 </div>
             </div>
          </div>
        )}
      </section>

      {/* SECTION 3 — THE LESSON */}
      {generated && (
        <section ref={lessonRef} className="space-y-6 max-w-3xl mx-auto border-t border-gray-200 dark:border-gray-800 pt-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
           <h2 className="text-2xl font-bold">🧪 Experiment: Why "one-way"?</h2>
           <div className="bg-white dark:bg-gray-800 p-8 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <p className="mb-4 text-lg">
                  Try to reverse it. Given your address <span className="font-mono font-bold text-green-600">{identity?.getWalletAddress()}</span>, can you guess the private key?
              </p>

              <div className="flex gap-4">
                  <input
                    type="text"
                    value={guess}
                    onChange={(e) => setGuess(e.target.value)}
                    disabled={guessAttempted}
                    placeholder="Enter your guess here..."
                    className="flex-1 p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                  <button
                    onClick={handleGuess}
                    disabled={guessAttempted || !guess.trim()}
                    className="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-bold disabled:opacity-50 hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
                  >
                    Check
                  </button>
              </div>

              {guessAttempted && (
                  <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30 rounded-lg flex items-start gap-4 animate-in zoom-in-95">
                      <X className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
                      <div>
                          <h4 className="font-bold text-red-700 dark:text-red-400">Wrong (and impossible!)</h4>
                          <p className="text-red-600 dark:text-red-300 mt-1">
                              There are 2<sup>256</sup> possible keys. That's more than the number of atoms in the visible universe.
                              Even with all the computers in the world, it would take billions of years to guess your key.
                          </p>
                          <p className="mt-3 font-medium text-gray-800 dark:text-gray-200">
                              ✅ Lesson: Your address is public. Your private key is secure.
                          </p>
                      </div>
                  </div>
              )}
           </div>
        </section>
      )}

      {/* SECTION 4 — COMPLETION */}
      {guessAttempted && (
        <section ref={completionRef} className="space-y-6 max-w-3xl mx-auto border-t border-gray-200 dark:border-gray-800 pt-12 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
           <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-8 rounded-2xl border border-indigo-100 dark:border-indigo-800 text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-3xl font-bold mb-2">Your Identity Is Ready</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                  You are now an autonomous participant in the network.
              </p>

              <div className="inline-block bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden mb-8 text-left min-w-[300px]">
                  <div className="bg-gray-100 dark:bg-gray-800 px-6 py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                      <span className="font-bold text-gray-700 dark:text-gray-300">Identity Card</span>
                      <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                  </div>
                  <div className="p-6 space-y-3">
                      <div>
                          <span className="text-xs text-gray-500 uppercase tracking-wider">Node ID</span>
                          <div className="font-mono font-bold text-lg">{identity?.getId()}</div>
                      </div>
                      <div>
                          <span className="text-xs text-gray-500 uppercase tracking-wider">Address</span>
                          <div className="font-mono text-sm truncate">{identity?.getWalletAddress()}</div>
                      </div>
                      <div className="flex gap-8 pt-2">
                           <div>
                              <span className="text-xs text-gray-500 uppercase tracking-wider">Balance</span>
                              <div className="font-bold">0 YUP</div>
                           </div>
                           <div>
                              <span className="text-xs text-gray-500 uppercase tracking-wider">Status</span>
                              <div className="text-green-600 dark:text-green-400 font-bold flex items-center gap-1">
                                  🟢 Ready
                              </div>
                           </div>
                      </div>
                  </div>
              </div>

              <div className="max-w-xl mx-auto text-sm text-gray-500 dark:text-gray-400 bg-white/50 dark:bg-black/20 p-4 rounded-lg">
                  Next, you'll learn how blockchain protects data using something called <b>HASHING</b>.
              </div>
           </div>
        </section>
      )}

    </div>
  );
};

export default Step1_Identity;
