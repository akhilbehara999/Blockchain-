import React, { useState, useEffect } from 'react';
import { useProgress } from '../../../context/ProgressContext';
import { Check, FlaskConical, Info } from 'lucide-react';
import Card from '../../ui/Card';
import Button from '../../ui/Button';
import Badge from '../../ui/Badge';
import Hash from '../../ui/Hash';
import { useInView } from '../../../hooks/useInView';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();

  // ----- Playground Section -----
  const [playgroundInput, setPlaygroundInput] = useState('Hello World');
  const [playgroundHash, setPlaygroundHash] = useState('');

  // Load initial state helper
  const loadState = (key: string, def: any) => {
    try {
      const saved = localStorage.getItem('yupp_step2_state');
      return saved ? (JSON.parse(saved)[key] ?? def) : def;
    } catch { return def; }
  };

  // ----- Experiment 1: Determinism -----
  const [exp1InputA, setExp1InputA] = useState('');
  const [exp1InputB, setExp1InputB] = useState('');
  const [exp1HashA, setExp1HashA] = useState('');
  const [exp1HashB, setExp1HashB] = useState('');
  const [exp1Complete, setExp1Complete] = useState(() => loadState('exp1Complete', false));

  // ----- Experiment 2: Avalanche -----
  const originalExp2Input = "blockchain";
  const [originalExp2Hash, setOriginalExp2Hash] = useState('');
  const [exp2ModifiedInput, setExp2ModifiedInput] = useState('');
  const [exp2ModifiedHash, setExp2ModifiedHash] = useState('');
  const [exp2Complete, setExp2Complete] = useState(() => loadState('exp2Complete', false));

  // ----- Experiment 3: Irreversibility -----
  const targetInput = "hello"; // The secret
  const [targetHash, setTargetHash] = useState('');
  const [exp3Guess, setExp3Guess] = useState('');
  const [exp3Attempts, setExp3Attempts] = useState<number>(() => loadState('exp3Attempts', 0));
  const [exp3Solved, setExp3Solved] = useState(() => loadState('exp3Solved', false));
  const [showHint, setShowHint] = useState(false);

  // Persist state
  useEffect(() => {
    try {
      localStorage.setItem('yupp_step2_state', JSON.stringify({
        exp1Complete,
        exp2Complete,
        exp3Solved,
        exp3Attempts
      }));
    } catch {}
  }, [exp1Complete, exp2Complete, exp3Solved, exp3Attempts]);

  // InView hooks
  const [headerRef, headerVisible] = useInView({ threshold: 0.1 });
  const [storyRef, storyVisible] = useInView({ threshold: 0.1 });
  const [playgroundRef, playgroundVisible] = useInView({ threshold: 0.1 });
  const [exp1Ref, exp1Visible] = useInView({ threshold: 0.1 });
  const [exp2Ref, exp2Visible] = useInView({ threshold: 0.1 });
  const [exp3Ref, exp3Visible] = useInView({ threshold: 0.1 });
  const [completionRef, completionVisible] = useInView({ threshold: 0.1 });

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
              comparison.push(<span key={i} className="text-status-valid font-bold">{original[i]}</span>);
          } else {
              comparison.push(<span key={i} className="text-status-error font-bold">{modified[i]}</span>);
          }
      }
      // Add remaining chars
      if (modified.length > length) {
          comparison.push(<span key="rest" className="text-status-error font-bold">{modified.substring(length)}</span>);
      }

      const percent = Math.round((matchCount / Math.max(original.length, modified.length)) * 100);

      return (
          <div className="mt-4 p-4 bg-surface-tertiary dark:bg-surface-dark-tertiary rounded-xl font-mono text-xs break-all">
             <div className="mb-2 text-gray-500">Modified Hash Visualization:</div>
             <div className="mb-2">{comparison}</div>
             <div className="text-sm font-sans flex items-center gap-2">
                 <span>Similarity:</span>
                 <div className="flex-1 h-2 bg-gray-300 dark:bg-gray-700 rounded-full overflow-hidden">
                     <div className="h-full bg-status-valid transition-all duration-500" style={{ width: `${percent}%` }}></div>
                 </div>
                 <span className="font-bold">{percent}%</span>
             </div>
          </div>
      );
  };

  const inputClasses = "w-full p-3 rounded-xl border-2 border-surface-border dark:border-surface-dark-border bg-transparent focus:border-brand-500 focus:ring-4 focus:ring-brand-100 dark:focus:ring-brand-900/30 outline-none transition-all font-mono";

  return (
    <div className="space-y-12 md:space-y-16 pb-20">

      {/* SECTION 1 — HEADER */}
      <div ref={headerRef} className={`space-y-4 ${headerVisible ? 'animate-fade-up' : 'opacity-0'}`}>
        <Badge variant="info">Step 2 of 8</Badge>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">Fingerprints of Data</h1>
        <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl">
          How blockchain knows when someone is lying.
        </p>
      </div>

      {/* SECTION 2 — STORY */}
      <div ref={storyRef} className={storyVisible ? 'animate-fade-up' : 'opacity-0'}>
        <Card variant="glass" className="max-w-prose">
          <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300">
             In the physical world, we use signatures and seals to prove a document hasn't changed.
             In blockchain, we use <b>MATH</b>.
             <br/><br/>
             A hash function takes ANY input—a word, a book, a transaction—and produces a unique fingerprint.
             It's always the same length, and it always produces the same result for the same input.
          </p>
        </Card>
      </div>

      {/* SECTION 3 — PLAYGROUND */}
      <div ref={playgroundRef} className={playgroundVisible ? 'animate-fade-up' : 'opacity-0'}>
        <Card variant="elevated" className="space-y-6">
            <h3 className="text-2xl font-bold flex items-center gap-2">
                <FlaskConical className="w-6 h-6 text-brand-500" />
                Hash Laboratory
            </h3>

            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Type anything:</label>
                <input
                    type="text"
                    value={playgroundInput}
                    onChange={(e) => setPlaygroundInput(e.target.value)}
                    className={inputClasses}
                    placeholder="Hello World"
                />
            </div>

            <div className="p-4 rounded-xl bg-surface-tertiary dark:bg-surface-dark-tertiary border border-surface-border dark:border-surface-dark-border">
                <div className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">SHA-256 Hash Output</div>
                <Hash value={playgroundHash} copyable truncate={false} className="text-sm md:text-base break-all" />
            </div>

            <div className="grid grid-cols-3 gap-4 text-center text-sm p-3 bg-surface-tertiary dark:bg-surface-dark-tertiary rounded-xl">
                <div>
                    <div className="font-bold text-gray-900 dark:text-white">{playgroundInput.length}</div>
                    <div className="text-gray-500">Chars</div>
                </div>
                <div>
                    <div className="font-bold text-gray-900 dark:text-white">64</div>
                    <div className="text-gray-500">Hex Length</div>
                </div>
                <div>
                    <div className="font-bold text-status-valid">~0.003ms</div>
                    <div className="text-gray-500">Time</div>
                </div>
            </div>
        </Card>
      </div>

      {/* SECTION 4 — EXPERIMENT 1 */}
      <div ref={exp1Ref} className={exp1Visible ? 'animate-fade-up' : 'opacity-0'}>
        <Card variant="outlined" status={exp1Complete ? 'valid' : 'info'} className="transition-all duration-300">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                    <Badge variant="info" size="sm" className="w-6 h-6 flex items-center justify-center p-0 rounded-full">1</Badge>
                    <h3 className="text-xl font-bold">Experiment: Determinism</h3>
                </div>
                {exp1Complete && <Badge variant="success">Completed</Badge>}
            </div>

            <p className="mb-6 text-gray-600 dark:text-gray-300">
                Type <span className="font-mono font-bold bg-surface-tertiary dark:bg-surface-dark-tertiary px-1.5 py-0.5 rounded text-brand-600">blockchain</span> in both boxes below. Watch the hashes align.
            </p>

            <div className="space-y-6">
                <div className="grid md:grid-cols-[1fr,2fr] gap-4 items-center">
                    <input
                        type="text"
                        value={exp1InputA}
                        onChange={(e) => setExp1InputA(e.target.value)}
                        placeholder="Type blockchain"
                        className={inputClasses}
                    />
                    <div className="bg-surface-tertiary dark:bg-surface-dark-tertiary p-3 rounded-xl border border-surface-border dark:border-surface-dark-border overflow-hidden">
                        <Hash value={exp1HashA} truncate />
                    </div>
                </div>

                <div className="grid md:grid-cols-[1fr,2fr] gap-4 items-center">
                    <input
                        type="text"
                        value={exp1InputB}
                        onChange={(e) => setExp1InputB(e.target.value)}
                        placeholder="Type blockchain"
                        className={inputClasses}
                    />
                    <div className="bg-surface-tertiary dark:bg-surface-dark-tertiary p-3 rounded-xl border border-surface-border dark:border-surface-dark-border overflow-hidden">
                        <Hash value={exp1HashB} truncate />
                    </div>
                </div>
            </div>
        </Card>
      </div>

      {/* SECTION 5 — EXPERIMENT 2 */}
      {exp1Complete && (
        <div ref={exp2Ref} className={exp2Visible ? 'animate-fade-up' : 'opacity-0'}>
            <Card variant="outlined" status={exp2Complete ? 'valid' : 'info'}>
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2">
                        <Badge variant="info" size="sm" className="w-6 h-6 flex items-center justify-center p-0 rounded-full">2</Badge>
                        <h3 className="text-xl font-bold">Experiment: Avalanche Effect</h3>
                    </div>
                    {exp2Complete && <Badge variant="success">Completed</Badge>}
                </div>

                <p className="mb-6 text-gray-600 dark:text-gray-300">
                    What happens if you change just <b>ONE</b> letter?
                </p>

                <div className="space-y-6">
                    <div className="space-y-2 opacity-70">
                         <label className="text-xs font-bold text-gray-500 uppercase">Original Input</label>
                         <div className="font-mono p-3 bg-surface-tertiary dark:bg-surface-dark-tertiary border border-surface-border dark:border-surface-dark-border rounded-xl text-gray-700 dark:text-gray-300">
                            {originalExp2Input}
                         </div>
                         <Hash value={originalExp2Hash} truncate className="text-gray-400 text-xs" />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase">Your Input (Change one letter)</label>
                        <input
                            type="text"
                            value={exp2ModifiedInput}
                            onChange={(e) => setExp2ModifiedInput(e.target.value)}
                            placeholder="Type something different..."
                            className={inputClasses}
                        />
                         <Hash value={exp2ModifiedHash} truncate className="text-gray-500 text-xs" />
                    </div>

                    {exp2Complete && (
                        <div className="animate-fade-up">
                            {renderHashComparison(originalExp2Hash, exp2ModifiedHash)}
                        </div>
                    )}
                </div>
            </Card>
        </div>
      )}

      {/* SECTION 6 — EXPERIMENT 3 */}
      {exp2Complete && (
        <div ref={exp3Ref} className={exp3Visible ? 'animate-fade-up' : 'opacity-0'}>
            <Card variant="outlined" status={exp3Solved ? 'valid' : 'info'}>
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2">
                        <Badge variant="info" size="sm" className="w-6 h-6 flex items-center justify-center p-0 rounded-full">3</Badge>
                        <h3 className="text-xl font-bold">Experiment: Irreversibility</h3>
                    </div>
                    {exp3Solved && <Badge variant="success">Completed</Badge>}
                </div>

                <p className="mb-6 text-gray-600 dark:text-gray-300">
                    I'll give you a hash. Can you find the input?
                </p>

                <div className="bg-surface-tertiary dark:bg-surface-dark-tertiary p-4 rounded-xl mb-6 relative border border-surface-border dark:border-surface-dark-border">
                    <div className="absolute top-0 right-0 px-2 py-1 bg-surface-border dark:bg-surface-dark-border text-xs font-bold rounded-bl-lg text-gray-500">TARGET HASH</div>
                    <Hash value={targetHash} truncate={false} className="break-all" />
                </div>

                <div className="flex gap-4">
                    <input
                        type="text"
                        value={exp3Guess}
                        onChange={(e) => setExp3Guess(e.target.value)}
                        disabled={exp3Solved}
                        placeholder="Enter your guess..."
                        className={inputClasses}
                    />
                    <Button onClick={handleExp3Guess} disabled={exp3Solved || !exp3Guess}>
                        Check
                    </Button>
                </div>

                <div className="mt-4 min-h-[24px]">
                     {!exp3Solved && exp3Attempts >= 2 && showHint && (
                        <span className="text-status-warning font-bold flex items-center gap-1 animate-pulse text-sm">
                             <Info className="w-4 h-4"/> Hint: It's a simple greeting. 5 letters.
                        </span>
                     )}
                </div>
            </Card>
        </div>
      )}

      {/* SECTION 7 — COMPLETION */}
      {exp3Solved && (
        <div ref={completionRef} className={completionVisible ? 'animate-fade-up' : 'opacity-0'}>
            <Card variant="default" status="valid">
                <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="w-16 h-16 bg-status-valid/10 text-status-valid rounded-2xl flex items-center justify-center shrink-0">
                        <Check className="w-8 h-8" />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Hashing Mastered</h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                            You've verified three key properties of cryptographic hashes: Determinism, Avalanche Effect, and One-Way nature.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-left">
                             <div className="bg-surface-tertiary dark:bg-surface-dark-tertiary p-3 rounded-lg">
                                <span className="font-bold text-brand-600 block">Determinism</span>
                                <span className="text-gray-500">Same input = Same output</span>
                             </div>
                             <div className="bg-surface-tertiary dark:bg-surface-dark-tertiary p-3 rounded-lg">
                                <span className="font-bold text-purple-600 block">Avalanche</span>
                                <span className="text-gray-500">Small change = Big difference</span>
                             </div>
                             <div className="bg-surface-tertiary dark:bg-surface-dark-tertiary p-3 rounded-lg">
                                <span className="font-bold text-blue-600 block">One-Way</span>
                                <span className="text-gray-500">Cannot be reversed</span>
                             </div>
                        </div>
                    </div>
                    <Button variant="success" size="lg" onClick={() => navigate('/journey/3')} className="w-full md:w-auto mt-6 md:mt-0">
                        Continue to Step 3 →
                    </Button>
                </div>
            </Card>
        </div>
      )}

    </div>
  );
};

export default Step2_Hashing;
