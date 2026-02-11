import React, { useState, useEffect, useRef } from 'react';
import ModuleLayout from '../components/layout/ModuleLayout';
import HashDisplay from '../components/blockchain/HashDisplay';
import { useHash } from '../hooks/useHash';
import Tabs from '../components/ui/Tabs';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { Search, GitCompare, Puzzle, Lightbulb, RefreshCw, Timer, Hash } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const M01_Hashing: React.FC = () => {
  const [activeTab, setActiveTab] = useState('explorer');

  const tabs = [
    { id: 'explorer', label: 'Hash Explorer', icon: <Search className="w-4 h-4" /> },
    { id: 'compare', label: 'Compare', icon: <GitCompare className="w-4 h-4" /> },
    { id: 'puzzle', label: 'Puzzle Mode', icon: <Puzzle className="w-4 h-4" /> },
  ];

  return (
    <ModuleLayout moduleId="hashing" title="Hashing" subtitle="The fingerprint of data">
      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={setActiveTab}
        className="mb-8"
      />

      <div className="min-h-[500px]">
        {activeTab === 'explorer' && <HashExplorer />}
        {activeTab === 'compare' && <CompareMode />}
        {activeTab === 'puzzle' && <PuzzleMode />}
      </div>
    </ModuleLayout>
  );
};

const HashExplorer: React.FC = () => {
  const [input, setInput] = useState('');
  const { hash, previousHash } = useHash(input);

  // Calculate changed characters
  const changedChars = hash.split('').filter((char, i) => previousHash && previousHash[i] !== char).length;

  return (
    <div className="space-y-6">
      <Card title="Input Data">
        <Input
          label="Enter any text..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type something..."
          className="text-lg"
        />
      </Card>

      <Card title="SHA-256 Output">
        <div className="space-y-4">
          <HashDisplay hash={hash} previousHash={previousHash} animate={true} />
          <div className="flex justify-end text-sm text-text-secondary">
            <span>Characters changed: <span className="text-accent font-bold">{changedChars}</span></span>
          </div>
        </div>
      </Card>
    </div>
  );
};

const CompareMode: React.FC = () => {
  const [inputA, setInputA] = useState('Hello');
  const [inputB, setInputB] = useState('hello');

  const hashA = useHash(inputA).hash;
  const hashB = useHash(inputB).hash;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-6">
        <Card title="Input A">
          <Input
            label="Input A"
            value={inputA}
            onChange={(e) => setInputA(e.target.value)}
          />
          <div className="mt-4">
            <h4 className="text-sm font-semibold text-text-secondary mb-2">Hash A</h4>
            <HashDisplay hash={hashA} previousHash={hashB} />
          </div>
        </Card>
      </div>

      <div className="space-y-6">
        <Card title="Input B">
          <Input
            label="Input B"
            value={inputB}
            onChange={(e) => setInputB(e.target.value)}
          />
          <div className="mt-4">
            <h4 className="text-sm font-semibold text-text-secondary mb-2">Hash B</h4>
            <HashDisplay hash={hashB} previousHash={hashA} />
          </div>
        </Card>
      </div>

      <div className="md:col-span-2">
        <div className="bg-tertiary-bg/30 p-4 rounded-xl text-center text-text-secondary text-sm">
           Notice how a small change (like 'H' vs 'h') completely changes the hash? This is called the <span className="text-accent font-semibold">Avalanche Effect</span>.
        </div>
      </div>
    </div>
  );
};

const PuzzleMode: React.FC = () => {
  const [guess, setGuess] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [isSolved, setIsSolved] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const { hash } = useHash(guess);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (guess.length > 0 && !startTime && !isSolved) {
      setStartTime(Date.now());
    }

    if (guess.length > 0 && !isSolved) {
      setAttempts(prev => prev + 1);
    }

    if (hash.startsWith('0000') && !isSolved) {
      setIsSolved(true);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [guess, hash, isSolved, startTime]);

  useEffect(() => {
    if (startTime && !isSolved) {
      timerRef.current = setInterval(() => {
        setElapsed((Date.now() - startTime) / 1000);
      }, 100);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startTime, isSolved]);

  const reset = () => {
    setGuess('');
    setAttempts(0);
    setStartTime(null);
    setElapsed(0);
    setIsSolved(false);
    setShowHint(false);
  };

  return (
    <div className="space-y-6 relative overflow-hidden">
      {isSolved && <Confetti />}

      <Card className="relative z-10 border-accent/20">
        <div className="text-center mb-6 space-y-2">
          <h3 className="text-xl font-bold text-text-primary">Target: Hash starting with "0000"</h3>
          <p className="text-text-secondary">Type random characters until you find a matching hash!</p>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 px-4 bg-tertiary-bg/50 py-3 rounded-lg">
          <div className="flex items-center space-x-2">
            <Timer className="w-5 h-5 text-accent" />
            <span className="font-mono text-lg">{elapsed.toFixed(1)}s</span>
          </div>
          <div className="flex items-center space-x-2">
            <Hash className="w-5 h-5 text-accent" />
            <span className="font-mono text-lg">{attempts} attempts</span>
          </div>
        </div>

        <div className="space-y-4">
          <Input
            label="Your Guess (Nonce)"
            value={guess}
            onChange={(e) => !isSolved && setGuess(e.target.value)}
            disabled={isSolved}
            variant="monospace"
            className={isSolved ? "border-success text-success" : ""}
          />

          <div className="relative">
             <HashDisplay hash={hash} animate={false} />
             {isSolved && (
               <motion.div
                 initial={{ scale: 0 }}
                 animate={{ scale: 1 }}
                 className="absolute -top-3 -right-3 bg-success text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg"
               >
                 MATCH FOUND!
               </motion.div>
             )}
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowHint(!showHint)}
            className="w-full sm:w-auto"
          >
            <Lightbulb className="w-4 h-4 mr-2" />
            {showHint ? "Hide Hint" : "Need a Hint?"}
          </Button>

          {isSolved && (
            <Button variant="primary" onClick={reset} className="w-full sm:w-auto">
              <RefreshCw className="w-4 h-4 mr-2" />
              Play Again
            </Button>
          )}
        </div>

        <AnimatePresence>
          {showHint && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-4 p-4 bg-tertiary-bg rounded-lg text-sm text-text-secondary overflow-hidden"
            >
              This is essentially what miners do billions of times per second! They take the block data and add a random number (nonce) to it, trying to find a hash that meets a specific target (like starting with zeros).
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </div>
  );
};

const Confetti: React.FC = () => {
  // Simple particle system
  const particles = Array.from({ length: 50 });

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((_, i) => (
        <motion.div
          key={i}
          initial={{
            x: "50%",
            y: "50%",
            opacity: 1,
            scale: 0
          }}
          animate={{
            x: `${Math.random() * 100}%`,
            y: `${Math.random() * 100}%`,
            opacity: 0,
            scale: [0, 1, 0.5],
            rotate: Math.random() * 360
          }}
          transition={{
            duration: 1 + Math.random() * 2,
            ease: "easeOut"
          }}
          className="absolute w-2 h-2 rounded-full"
          style={{
            backgroundColor: ['#6366F1', '#22C55E', '#EF4444', '#EAB308'][Math.floor(Math.random() * 4)]
          }}
        />
      ))}
    </div>
  );
};

export default M01_Hashing;
