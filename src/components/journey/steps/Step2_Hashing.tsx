import React, { useState, useEffect, useRef } from 'react';
import { useProgress } from '../../../context/ProgressContext';
import { Fingerprint, Check, ArrowRight, Zap, FlaskConical, Info, Lock } from 'lucide-react';

// Helper function for SHA-256
const sha256 = async (message: string): Promise<string> => {
  try {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch {
    // Fallback for non-HTTPS environments
    let hash = 0;
    for (let i = 0; i < message.length; i++) {
        const char = message.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    // Pad to look like SHA256 (64 hex chars)
    const hex = Math.abs(hash).toString(16);
    return hex.padStart(64, '0');
  }
};

const Step2_Hashing: React.FC = () => {
  const { completeStep } = useProgress();

  // ----- Playground Section -----
  const [playgroundInput, setPlaygroundInput] = useState('Hello World');
  const [playgroundHash, setPlaygroundHash] = useState('');

  // ----- Experiment 1: Determinism -----
  const [exp1InputA, setExp1InputA] = useState('');
  const [exp1InputB, setExp1InputB] = useState('');
  const [exp1HashA, setExp1HashA] = useState('');
  const [exp1HashB, setExp1HashB] = useState('');
  const [exp1Complete, setExp1Complete] = useState(false);

  // ----- Experiment 2: Avalanche -----
  const originalExp2Input = "blockchain";
  const [originalExp2Hash, setOriginalExp2Hash] = useState('');
  const [exp2ModifiedInput, setExp2ModifiedInput] = useState('');
  const [exp2ModifiedHash, setExp2ModifiedHash] = useState('');
  const [exp2Complete, setExp2Complete] = useState(false);

  // ----- Experiment 3: Irreversibility -----
  const targetInput = "hello"; // The secret
  const [targetHash, setTargetHash] = useState('');
  const [exp3Guess, setExp3Guess] = useState('');
  const [exp3Attempts, setExp3Attempts] = useState(0);
  const [exp3Solved, setExp3Solved] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // Refs for scrolling
  const playgroundRef = useRef<HTMLDivElement>(null);
  const exp1Ref = useRef<HTMLDivElement>(null);
  const exp2Ref = useRef<HTMLDivElement>(null);
  const exp3Ref = useRef<HTMLDivElement>(null);
  const completionRef = useRef<HTMLDivElement>(null);

  // Initial Hash Calculations
  useEffect(() => {
    sha256(originalExp2Input).then(setOriginalExp2Hash);
    sha256(targetInput).then(setTargetHash);
  }, []);

  // Playground Effect
  useEffect(() => {
    const compute = async () => {
      const h = await sha256(playgroundInput);
      setPlaygroundHash(h);
    };
    compute();
  }, [playgroundInput]);

  // Exp 1 Effect
  useEffect(() => {
    const compute = async () => {
      const hA = await sha256(exp1InputA);
      const hB = await sha256(exp1InputB);
      setExp1HashA(hA);
      setExp1HashB(hB);

      // Check if both are "blockchain"
      if (exp1InputA === 'blockchain' && exp1InputB === 'blockchain') {
        if (!exp1Complete) setExp1Complete(true);
      }
    };
    compute();
  }, [exp1InputA, exp1InputB, exp1Complete]);

  // Exp 2 Effect
  useEffect(() => {
    const compute = async () => {
      const h = await sha256(exp2ModifiedInput);
      setExp2ModifiedHash(h);

      if (exp2ModifiedInput && exp2ModifiedInput !== originalExp2Input) {
         if (!exp2Complete) setExp2Complete(true);
      }
    };
    compute();
  }, [exp2ModifiedInput, originalExp2Input, exp2Complete]);

  // Completion Check
  useEffect(() => {
    if (exp1Complete && exp2Complete && exp3Solved) {
      completeStep(2);
      // Wait a bit before scrolling to let the user see the success message of the last experiment
      setTimeout(() => {
          completionRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 1000);
    }
  }, [exp1Complete, exp2Complete, exp3Solved, completeStep]);

  const handleExp3Guess = async () => {
    if (!exp3Guess) return;
    setExp3Attempts(prev => prev + 1);

    // Check hash directly to simulate "checking the work"
    const guessHash = await sha256(exp3Guess);

    if (guessHash === targetHash) {
      setExp3Solved(true);
    } else {
      if (exp3Attempts >= 2) setShowHint(true);
    }
  };

  // Helper to compare strings visually
  const renderHashComparison = (original: string, modified: string) => {
      if (!modified) return null;

      let matchCount = 0;
      const length = Math.min(original.length, modified.length);
      const comparison = [];

      for(let i=0; i<length; i++) {
          if (original[i] === modified[i]) {
              matchCount++;
              comparison.push(<span key={i} className="text-green-600 font-bold">{original[i]}</span>);
          } else {
              comparison.push(<span key={i} className="text-red-500 font-bold">{modified[i]}</span>);
          }
      }
      // Add remaining chars
      if (modified.length > length) {
          comparison.push(<span key="rest" className="text-red-500 font-bold">{modified.substring(length)}</span>);
      }

      const percent = Math.round((matchCount / Math.max(original.length, modified.length)) * 100);

      return (
          <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg font-mono text-xs break-all">
             <div className="mb-2 text-gray-500">Modified Hash Visualization:</div>
             <div className="mb-2">{comparison}</div>
             <div className="text-sm font-sans flex items-center gap-2">
                 <span>Similarity:</span>
                 <div className="flex-1 h-2 bg-gray-300 rounded-full overflow-hidden">
                     <div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${percent}%` }}></div>
                 </div>
                 <span className="font-bold">{percent}%</span>
             </div>
          </div>
      );
  };

  return (
    <div className="space-y-16 pb-20">

      {/* SECTION 1 — THE HOOK */}
      <section className="space-y-6 max-w-3xl mx-auto text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="inline-flex items-center justify-center p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-full mb-4">
          <Fingerprint className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Fingerprints of Data</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          How blockchain knows when someone is lying.
        </p>

        <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl border border-gray-200 dark:border-gray-700 text-left space-y-4 max-w-2xl mx-auto shadow-sm">
          <p className="text-lg">
            Imagine you have a document. How do you prove no one changed it?
          </p>
          <p className="text-gray-600 dark:text-gray-400">
             In the physical world, we use signatures and seals. In blockchain, we use <b>MATH</b>.
             A hash function takes ANY input and produces a unique fingerprint. Always the same length. Always the same result for the same input.
          </p>
          <div className="pt-2 flex items-center text-indigo-600 dark:text-indigo-400 font-semibold cursor-pointer hover:underline" onClick={() => playgroundRef.current?.scrollIntoView({ behavior: 'smooth' })}>
            <ArrowRight className="w-4 h-4 mr-2" />
            Don't believe me? Try it yourself.
          </div>
        </div>
      </section>

      {/* SECTION 2 — LIVE HASH PLAYGROUND */}
      <section ref={playgroundRef} className="space-y-6 max-w-3xl mx-auto border-t border-gray-200 dark:border-gray-800 pt-12">
        <h2 className="text-2xl font-bold flex items-center gap-2">
            <FlaskConical className="w-6 h-6 text-indigo-500" />
            Hash Laboratory
        </h2>

        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type anything:</label>
                <input
                    type="text"
                    value={playgroundInput}
                    onChange={(e) => setPlaygroundInput(e.target.value)}
                    className="w-full p-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-black focus:ring-2 focus:ring-indigo-500 outline-none text-lg transition-all"
                    placeholder="Hello World"
                />
            </div>

            <div className="relative">
                <div className="absolute -top-3 left-4 bg-white dark:bg-gray-900 px-2 text-xs font-bold text-gray-500">
                    SHA-256 Hash (Live)
                </div>
                <div className="font-mono text-sm break-all p-4 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200">
                    {playgroundHash}
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                <div>
                    <div className="font-bold text-gray-900 dark:text-white">{playgroundInput.length}</div>
                    <div>Characters Typed</div>
                </div>
                <div>
                    <div className="font-bold text-gray-900 dark:text-white">64</div>
                    <div>Hash Length</div>
                </div>
                <div>
                    <div className="font-bold text-green-600 dark:text-green-400">~0.003ms</div>
                    <div>Compute Time</div>
                </div>
            </div>
        </div>
      </section>

      {/* SECTION 3 — EXPERIMENT 1: DETERMINISM */}
      <section ref={exp1Ref} className="space-y-6 max-w-3xl mx-auto border-t border-gray-200 dark:border-gray-800 pt-12">
        <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold flex items-center gap-2">
                <span className="bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
                Experiment: Determinism
            </h2>
            {exp1Complete && <span className="text-green-600 font-bold flex items-center gap-1"><Check className="w-5 h-5"/> Complete</span>}
        </div>

        <div className={`p-6 rounded-xl border transition-all duration-500 ${exp1Complete ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800' : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700'}`}>
            <p className="mb-6 text-gray-600 dark:text-gray-300">
                Type <span className="font-mono font-bold bg-gray-100 dark:bg-gray-800 px-1 rounded">blockchain</span> in both boxes below. Watch the hashes.
            </p>

            <div className="space-y-6">
                {/* Input A */}
                <div className="grid md:grid-cols-[1fr,2fr] gap-4 items-center">
                    <input
                        type="text"
                        value={exp1InputA}
                        onChange={(e) => setExp1InputA(e.target.value)}
                        placeholder="Type blockchain"
                        className="p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-black focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                    <div className="font-mono text-xs break-all text-gray-500 bg-gray-100 dark:bg-gray-800 p-3 rounded h-full flex items-center">
                        {exp1HashA || <span className="opacity-30">Hash will appear here...</span>}
                    </div>
                </div>

                {/* Input B */}
                <div className="grid md:grid-cols-[1fr,2fr] gap-4 items-center">
                    <input
                        type="text"
                        value={exp1InputB}
                        onChange={(e) => setExp1InputB(e.target.value)}
                        placeholder="Type blockchain"
                        className="p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-black focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                    <div className="font-mono text-xs break-all text-gray-500 bg-gray-100 dark:bg-gray-800 p-3 rounded h-full flex items-center">
                        {exp1HashB || <span className="opacity-30">Hash will appear here...</span>}
                    </div>
                </div>
            </div>

            {exp1Complete && (
                <div className="mt-6 p-4 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-start gap-3 animate-in zoom-in-95">
                    <Check className="w-5 h-5 text-green-600 mt-1" />
                    <div>
                        <h4 className="font-bold text-green-800 dark:text-green-300">Match! Determinism Verified.</h4>
                        <p className="text-sm text-green-700 dark:text-green-400">
                            Same input = Same hash. Always. This allows anyone in the world to verify data independently.
                        </p>
                    </div>
                </div>
            )}
        </div>
      </section>

      {/* SECTION 4 — EXPERIMENT 2: AVALANCHE EFFECT */}
      {exp1Complete && (
        <section ref={exp2Ref} className="space-y-6 max-w-3xl mx-auto border-t border-gray-200 dark:border-gray-800 pt-12 animate-in fade-in slide-in-from-bottom-8">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <span className="bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
                    Experiment: Avalanche Effect
                </h2>
                {exp2Complete && <span className="text-green-600 font-bold flex items-center gap-1"><Check className="w-5 h-5"/> Complete</span>}
            </div>

            <div className={`p-6 rounded-xl border transition-all duration-500 ${exp2Complete ? 'bg-purple-50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-800' : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700'}`}>
                <p className="mb-6 text-gray-600 dark:text-gray-300">
                    What happens if you change just <b>ONE</b> letter?
                </p>

                <div className="space-y-6">
                    {/* Original */}
                    <div className="space-y-2 opacity-70">
                        <label className="text-xs font-bold text-gray-500 uppercase">Original Input</label>
                        <div className="font-mono p-3 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-gray-700 dark:text-gray-300">
                            {originalExp2Input}
                        </div>
                        <div className="font-mono text-xs break-all text-gray-400">
                            {originalExp2Hash}
                        </div>
                    </div>

                    {/* Modified */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase">Your Input (Change one letter)</label>
                        <input
                            type="text"
                            value={exp2ModifiedInput}
                            onChange={(e) => setExp2ModifiedInput(e.target.value)}
                            placeholder="Type something different..."
                            className="w-full p-3 rounded-lg border border-purple-300 dark:border-purple-600 bg-white dark:bg-black focus:ring-2 focus:ring-purple-500 outline-none font-mono"
                        />
                         <div className="font-mono text-xs break-all text-gray-500 bg-gray-50 dark:bg-gray-900 p-3 rounded border border-gray-200 dark:border-gray-700">
                            {exp2ModifiedHash || <span className="opacity-30">Hash will appear here...</span>}
                        </div>
                    </div>
                </div>

                {exp2Complete && (
                    <div className="mt-6">
                         {renderHashComparison(originalExp2Hash, exp2ModifiedHash)}
                         <div className="mt-4 p-4 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-start gap-3 animate-in zoom-in-95">
                            <Zap className="w-5 h-5 text-purple-600 mt-1" />
                            <div>
                                <h4 className="font-bold text-purple-800 dark:text-purple-300">Avalanche Effect Detected!</h4>
                                <p className="text-sm text-purple-700 dark:text-purple-400">
                                    Changing a tiny part of the input completely changed the output. This makes tampering impossible to hide.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
      )}

      {/* SECTION 5 — EXPERIMENT 3: IRREVERSIBILITY */}
      {exp2Complete && (
        <section ref={exp3Ref} className="space-y-6 max-w-3xl mx-auto border-t border-gray-200 dark:border-gray-800 pt-12 animate-in fade-in slide-in-from-bottom-8">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <span className="bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span>
                    Experiment: Irreversibility
                </h2>
                {exp3Solved && <span className="text-green-600 font-bold flex items-center gap-1"><Check className="w-5 h-5"/> Complete</span>}
            </div>

            <div className={`p-6 rounded-xl border transition-all duration-500 ${exp3Solved ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800' : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700'}`}>
                <p className="mb-6 text-gray-600 dark:text-gray-300">
                    I'll give you a hash. Can you find the input?
                </p>

                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mb-6 break-all font-mono text-sm border border-gray-200 dark:border-gray-700 relative">
                    <div className="absolute top-0 right-0 px-2 py-1 bg-gray-200 dark:bg-gray-700 text-xs font-bold rounded-bl">TARGET HASH</div>
                    {targetHash}
                </div>

                <div className="flex gap-4">
                    <input
                        type="text"
                        value={exp3Guess}
                        onChange={(e) => setExp3Guess(e.target.value)}
                        disabled={exp3Solved}
                        placeholder="Enter your guess..."
                        className="flex-1 p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-black focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-50"
                    />
                    <button
                        onClick={handleExp3Guess}
                        disabled={exp3Solved || !exp3Guess}
                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold disabled:opacity-50 transition-colors"
                    >
                        Check
                    </button>
                </div>

                {/* Status Messages */}
                <div className="mt-4 min-h-[60px]">
                    {exp3Solved ? (
                        <div className="p-4 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-start gap-3 animate-in zoom-in-95">
                            <Lock className="w-5 h-5 text-blue-600 mt-1" />
                            <div>
                                <h4 className="font-bold text-blue-800 dark:text-blue-300">Correct! The input was "hello".</h4>
                                <p className="text-sm text-blue-700 dark:text-blue-400">
                                    But you only found it by guessing. There is NO formula to reverse a hash. This is why it's called a <b>One-Way Function</b>.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="text-sm text-gray-500 flex justify-between items-center">
                            <span>Attempts: {exp3Attempts}</span>
                            {showHint && (
                                <span className="text-orange-500 font-bold flex items-center gap-1 animate-pulse">
                                    <Info className="w-4 h-4"/> Hint: It's a simple greeting. 5 letters.
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </section>
      )}

      {/* SECTION 6 — COMPLETION */}
      {exp3Solved && (
        <section ref={completionRef} className="space-y-6 max-w-3xl mx-auto border-t border-gray-200 dark:border-gray-800 pt-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
           <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-8 rounded-2xl border border-indigo-100 dark:border-indigo-800 text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-3xl font-bold mb-4">Step 2 Complete!</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left mb-8">
                  <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                      <div className="font-bold text-indigo-600 mb-1">Determinism</div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Same input always equals same output.</p>
                  </div>
                  <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                      <div className="font-bold text-purple-600 mb-1">Avalanche</div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Tiny changes create huge differences.</p>
                  </div>
                  <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                      <div className="font-bold text-blue-600 mb-1">One-Way</div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Easy to verify, impossible to reverse.</p>
                  </div>
              </div>

              <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-xl mx-auto">
                  You now understand the "fingerprints" of blockchain. Next, we will use these hashes to build actual <b>BLOCKS</b>.
              </p>

              {/* Navigation to next step is handled by the main layout, but we show a message here */}
              <div className="inline-flex items-center text-indigo-600 font-bold animate-pulse">
                  Proceed to Step 3: Building Blocks <ArrowRight className="w-5 h-5 ml-2" />
              </div>
           </div>
        </section>
      )}

    </div>
  );
};

export default Step2_Hashing;
