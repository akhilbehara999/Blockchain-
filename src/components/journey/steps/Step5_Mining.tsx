import React, { useState, useEffect } from 'react';
import { useProgress } from '../../../context/ProgressContext';
import { sha256 } from '../../../engine/hash';
import { Miner, startMiningRace } from '../../../engine/miner';
import { Clock, Zap, Trophy, Users, AlertTriangle, Check, ArrowRight, Pickaxe } from 'lucide-react';
import Card from '../../ui/Card';
import Button from '../../ui/Button';
import Badge from '../../ui/Badge';
import Hash from '../../ui/Hash';
import { useInView } from '../../../hooks/useInView';
import { useNavigate } from 'react-router-dom';

// --- Constants ---
const MANUAL_ATTEMPTS_TARGET = 5;
const AUTO_MINING_TARGET_ZEROS = 4;
const RACES_TARGET = 1;
const DIFFICULTIES_TARGET = 2;

// --- Helper for formatting numbers ---
const formatNumber = (n: number) => n.toLocaleString();

const Step5_Mining: React.FC = () => {
  const { completeStep } = useProgress();
  const navigate = useNavigate();

  // --- State: Manual Mining ---
  const [manualNonce, setManualNonce] = useState<string>('0');
  const [manualHash, setManualHash] = useState<string>('');
  const [manualAttempts, setManualAttempts] = useState<number>(0);
  const [showAutoMine, setShowAutoMine] = useState<boolean>(false);

  // --- State: Auto Mining ---
  const [autoStatus, setAutoStatus] = useState<'idle' | 'mining' | 'found'>('idle');
  const [autoResult, setAutoResult] = useState<{ nonce: number; hash: string; time: number; attempts: number } | null>(null);
  const [autoProgress, setAutoProgress] = useState<{ nonce: number; hash: string }>({ nonce: 0, hash: '' });

  // --- State: Difficulty Experiment ---
  const [difficulty, setDifficulty] = useState<number>(3);
  const [diffStatus, setDiffStatus] = useState<'idle' | 'mining' | 'found'>('idle');
  const [diffResults, setDiffResults] = useState<Record<number, { time: number; attempts: number }>>({});
  const [diffProgress, setDiffProgress] = useState<{ nonce: number; hash: string }>({ nonce: 0, hash: '' });

  // --- State: Mining Race ---
  const [raceStatus, setRaceStatus] = useState<'idle' | 'racing' | 'finished'>('idle');
  const [raceMiners, setRaceMiners] = useState<Miner[]>([]);
  const [raceWinner, setRaceWinner] = useState<Miner | null>(null);
  const [racesCompleted, setRacesCompleted] = useState<number>(0);

  // InView hooks
  const [headerRef, headerVisible] = useInView({ threshold: 0.1 });
  const [storyRef, storyVisible] = useInView({ threshold: 0.1 });
  const [manualRef, manualVisible] = useInView({ threshold: 0.1 });
  const [autoRef, autoVisible] = useInView({ threshold: 0.1 });
  const [diffRef, diffVisible] = useInView({ threshold: 0.1 });
  const [raceRef, raceVisible] = useInView({ threshold: 0.1 });
  const [completionRef, completionVisible] = useInView({ threshold: 0.1 });

  // --- Effects ---
  useEffect(() => {
    if (manualAttempts >= MANUAL_ATTEMPTS_TARGET) {
      setShowAutoMine(true);
    }
  }, [manualAttempts]);

  // --- Handlers: Manual Mining ---
  const handleManualHash = async () => {
    const data = "Alice pays Bob 5 coins";
    const hash = await sha256(data + manualNonce);
    setManualHash(hash);
    setManualAttempts(prev => prev + 1);
  };

  // --- Handlers: Auto Mining ---
  const startAutoMining = async () => {
    if (autoStatus === 'mining') return;
    setAutoStatus('mining');

    const data = "Alice pays Bob 5 coins";
    const targetPrefix = "0".repeat(AUTO_MINING_TARGET_ZEROS);
    let nonce = 0;
    const startTime = performance.now();

    const mineBatch = async () => {
      const batchSize = 1000;
      let found = false;
      let hash = '';

      for (let i = 0; i < batchSize; i++) {
        nonce++;
        hash = await sha256(data + nonce);
        if (hash.startsWith(targetPrefix)) {
          found = true;
          break;
        }
      }

      if (found) {
        const endTime = performance.now();
        setAutoResult({
          nonce,
          hash,
          time: (endTime - startTime) / 1000,
          attempts: nonce
        });
        setAutoStatus('found');
      } else {
        setAutoProgress({ nonce, hash });
        requestAnimationFrame(mineBatch);
      }
    };

    requestAnimationFrame(mineBatch);
  };

  // --- Handlers: Difficulty Experiment ---
  const startDiffMining = () => {
    if (diffStatus === 'mining') return;
    setDiffStatus('mining');

    const data = "Alice pays Bob 5 coins";
    const targetPrefix = "0".repeat(difficulty);
    let nonce = 0;
    const startTime = performance.now();

    const mineBatch = async () => {
      const batchSize = 1000;
      let found = false;
      let hash = '';

      for (let i = 0; i < batchSize; i++) {
        nonce++;
        hash = await sha256(data + nonce);
        if (hash.startsWith(targetPrefix)) {
          found = true;
          break;
        }
      }

      if (found) {
        const endTime = performance.now();
        const time = (endTime - startTime) / 1000;
        setDiffResults(prev => ({
          ...prev,
          [difficulty]: { time, attempts: nonce }
        }));
        setDiffStatus('found');
      } else {
        setDiffProgress({ nonce, hash });
        requestAnimationFrame(mineBatch);
      }
    };

    requestAnimationFrame(mineBatch);
  };

  // --- Handlers: Mining Race ---
  const handleStartRace = async () => {
    if (raceStatus === 'racing') return;
    setRaceStatus('racing');
    setRaceWinner(null);

    const result = await startMiningRace(3, 50, (miners) => {
      setRaceMiners(miners);
    });

    setRaceWinner(result.winner);
    setRaceStatus('finished');
    setRacesCompleted(prev => prev + 1);
  };

  // --- Completion Check ---
  const isComplete =
    manualAttempts >= MANUAL_ATTEMPTS_TARGET &&
    autoStatus === 'found' &&
    Object.keys(diffResults).length >= DIFFICULTIES_TARGET &&
    racesCompleted >= RACES_TARGET;

  useEffect(() => {
     if (isComplete) {
         completeStep(5);
     }
  }, [isComplete, completeStep]);

  return (
    <div className="space-y-12 md:space-y-16 pb-20">

      {/* SECTION 1: HEADER */}
      <div ref={headerRef} className={`space-y-4 ${headerVisible ? 'animate-fade-up' : 'opacity-0'}`}>
        <Badge variant="info">Step 5 of 8</Badge>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">The Lottery You Can't Cheat</h1>
        <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl">
          Mining isn't work. It's luck.
        </p>
      </div>

      {/* SECTION 2: STORY */}
      <div ref={storyRef} className={storyVisible ? 'animate-fade-up' : 'opacity-0'}>
        <Card variant="glass" className="max-w-prose">
          <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300">
            In Step 4, you fixed a broken chain by recalculating hashes.
            But what if recalculating a hash was <strong>HARD</strong>?
            What if the network required your hash to start with specific zeros, like <span className="font-mono bg-surface-tertiary dark:bg-surface-dark-tertiary px-1 rounded">0000</span>?
            <br/><br/>
            Most hashes don't start with zeros. You have to keep guessing random numbers (nonces) until you get lucky.
            That's exactly what <strong>MINING</strong> is.
          </p>
        </Card>
      </div>

      {/* SECTION 3: MANUAL MINING */}
      <div ref={manualRef} className={manualVisible ? 'animate-fade-up' : 'opacity-0'}>
        <Card variant="elevated">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                    <Pickaxe className="w-5 h-5 text-brand-500" />
                    Mine By Hand
                </h3>
                <Badge variant="info">{manualAttempts} / {MANUAL_ATTEMPTS_TARGET} Attempts</Badge>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase">Block Data</label>
                    <div className="p-3 bg-surface-tertiary dark:bg-surface-dark-tertiary rounded-xl text-gray-700 dark:text-gray-300 font-mono text-sm border border-surface-border dark:border-surface-dark-border">
                        Alice pays Bob 5 coins
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase">Target Difficulty</label>
                    <div className="p-3 bg-surface-tertiary dark:bg-surface-dark-tertiary rounded-xl text-gray-700 dark:text-gray-300 font-mono text-sm border border-surface-border dark:border-surface-dark-border">
                        Hash must start with "0000"
                    </div>
                </div>
            </div>

            <div className="flex gap-4 items-end mb-6">
                <div className="flex-1 space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase">Try a Nonce (random number)</label>
                    <input
                        type="number"
                        value={manualNonce}
                        onChange={(e) => setManualNonce(e.target.value)}
                        className="w-full p-3 rounded-xl border-2 border-surface-border dark:border-surface-dark-border bg-transparent focus:border-brand-500 focus:ring-4 focus:ring-brand-100 dark:focus:ring-brand-900/30 outline-none transition-all font-mono"
                    />
                </div>
                <Button onClick={handleManualHash}>Hash It</Button>
            </div>

            {manualHash && (
                <div className={`p-4 rounded-xl border-2 transition-all ${manualHash.startsWith('0000') ? 'bg-green-50 dark:bg-green-900/10 border-status-valid' : 'bg-red-50 dark:bg-red-900/10 border-status-error'}`}>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-gray-500">Result Hash</span>
                        {manualHash.startsWith('0000') ? (
                            <Badge variant="success" pulse>FOUND!</Badge>
                        ) : (
                            <Badge variant="error">No zeros</Badge>
                        )}
                    </div>
                    <Hash value={manualHash} truncate={false} className="break-all" />
                </div>
            )}
        </Card>
      </div>

      {/* SECTION 4: AUTOMATED MINING */}
      {showAutoMine && (
        <div ref={autoRef} className={autoVisible ? 'animate-fade-up' : 'opacity-0'}>
            <Card variant="elevated">
                 <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <Zap className="w-5 h-5 text-brand-500" />
                        Computer Mining
                    </h3>
                    {autoStatus === 'found' && <Badge variant="success">Completed</Badge>}
                </div>

                <p className="mb-6 text-gray-600 dark:text-gray-300">
                    Let your CPU try thousands of nonces per second. This is "Proof of Work".
                </p>

                <div className="bg-surface-tertiary dark:bg-surface-dark-tertiary p-6 rounded-xl font-mono text-sm border border-surface-border dark:border-surface-dark-border mb-6 min-h-[160px]">
                     {autoStatus === 'idle' && !autoResult && <div className="text-gray-500 text-center py-8">Waiting to start...</div>}

                     {(autoStatus === 'mining' || (autoStatus === 'found' && autoResult)) && (
                        <div className="space-y-4">
                            <div className="flex justify-between border-b border-surface-border dark:border-surface-dark-border pb-2">
                                <span className="text-gray-500">Nonce Attempt</span>
                                <span className="font-bold text-brand-600">{autoStatus === 'mining' ? formatNumber(autoProgress.nonce) : formatNumber(autoResult!.nonce)}</span>
                            </div>
                            <div className="flex justify-between border-b border-surface-border dark:border-surface-dark-border pb-2">
                                <span className="text-gray-500">Current Hash</span>
                                <span className="font-mono text-xs">{autoStatus === 'mining' ? autoProgress.hash.substring(0, 20) + '...' : autoResult!.hash.substring(0, 20) + '...'}</span>
                            </div>

                            {autoStatus === 'found' && autoResult && (
                                <div className="pt-2 animate-fade-up">
                                    <div className="flex items-center gap-2 text-status-valid font-bold text-lg mb-4">
                                        <Zap size={20} /> BLOCK FOUND!
                                    </div>
                                    <div className="grid grid-cols-3 gap-4 text-center">
                                        <div className="bg-surface-primary dark:bg-surface-dark-secondary p-2 rounded-lg border border-surface-border dark:border-surface-dark-border">
                                            <div className="text-xs text-gray-500 uppercase">Time</div>
                                            <div className="font-bold">{autoResult.time.toFixed(3)}s</div>
                                        </div>
                                        <div className="bg-surface-primary dark:bg-surface-dark-secondary p-2 rounded-lg border border-surface-border dark:border-surface-dark-border">
                                            <div className="text-xs text-gray-500 uppercase">Attempts</div>
                                            <div className="font-bold">{formatNumber(autoResult.attempts)}</div>
                                        </div>
                                        <div className="bg-surface-primary dark:bg-surface-dark-secondary p-2 rounded-lg border border-surface-border dark:border-surface-dark-border">
                                            <div className="text-xs text-gray-500 uppercase">Hash Rate</div>
                                            <div className="font-bold">~{formatNumber(Math.round(autoResult.attempts / autoResult.time))} H/s</div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                     )}
                </div>

                <Button
                    onClick={startAutoMining}
                    disabled={autoStatus === 'mining' || autoStatus === 'found'}
                    loading={autoStatus === 'mining'}
                    fullWidth
                    icon={<Zap className="w-4 h-4"/>}
                >
                    {autoStatus === 'mining' ? 'Mining...' : autoStatus === 'found' ? 'Block Found' : 'Start Mining'}
                </Button>
            </Card>
        </div>
      )}

      {/* SECTION 5: DIFFICULTY EXPERIMENT */}
      {autoStatus === 'found' && (
        <div ref={diffRef} className={diffVisible ? 'animate-fade-up' : 'opacity-0'}>
            <Card variant="outlined" status="info">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <Clock className="w-5 h-5 text-brand-500" />
                        Difficulty Experiment
                    </h3>
                    <Badge variant="info">{Object.keys(diffResults).length} / {DIFFICULTIES_TARGET} Tested</Badge>
                </div>

                <p className="mb-6 text-gray-600 dark:text-gray-300">
                    What happens when we require MORE zeros?
                </p>

                <div className="space-y-6 mb-6">
                    <div className="space-y-2">
                         <div className="flex justify-between text-xs font-bold text-gray-500 uppercase">
                            <span>Easier (3 zeros)</span>
                            <span>Harder (6 zeros)</span>
                         </div>
                         <input
                            type="range"
                            min="3"
                            max="6"
                            value={difficulty}
                            onChange={(e) => setDifficulty(Number(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-brand-500"
                         />
                         <div className="text-center font-bold text-brand-600 dark:text-brand-400 font-mono bg-surface-tertiary dark:bg-surface-dark-tertiary py-2 rounded-lg">
                            Target: "{ "0".repeat(difficulty) }..."
                         </div>
                    </div>

                    <Button
                        onClick={startDiffMining}
                        disabled={diffStatus === 'mining'}
                        loading={diffStatus === 'mining'}
                        fullWidth
                    >
                         {diffStatus === 'mining' ? `Mining at Difficulty ${difficulty}...` : `Mine at Difficulty ${difficulty}`}
                    </Button>
                </div>

                <div className="space-y-2">
                     {[3, 4, 5, 6].map(d => (
                        <div key={d} className={`flex justify-between items-center p-3 rounded-xl border transition-all ${
                            diffResults[d]
                            ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800'
                            : 'bg-surface-tertiary dark:bg-surface-dark-tertiary border-surface-border dark:border-surface-dark-border opacity-60'
                        }`}>
                             <div className="flex items-center gap-3">
                                 <Badge variant={diffResults[d] ? 'success' : 'default'} size="sm" className="w-6 h-6 flex items-center justify-center p-0 rounded-full">{d}</Badge>
                                 <span className="text-sm font-medium">Zeros</span>
                             </div>
                             {diffResults[d] ? (
                                 <div className="text-right">
                                     <div className="text-sm font-bold text-gray-900 dark:text-white">{diffResults[d].time.toFixed(3)}s</div>
                                     <div className="text-xs text-gray-500">{formatNumber(diffResults[d].attempts)} attempts</div>
                                 </div>
                             ) : (
                                 <span className="text-xs text-gray-400 italic">Not tested</span>
                             )}
                        </div>
                     ))}
                </div>

                {Object.keys(diffResults).length >= DIFFICULTIES_TARGET && (
                    <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/10 p-4 rounded-xl border border-yellow-200 dark:border-yellow-800 flex gap-3 animate-fade-up">
                        <AlertTriangle className="text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                            Adding just one zero makes it ~16x harder (in hex). Real Bitcoin requires ~19 leading zeros!
                        </p>
                    </div>
                )}
            </Card>
        </div>
      )}

      {/* SECTION 6: MINING RACE */}
      {Object.keys(diffResults).length >= DIFFICULTIES_TARGET && (
        <div ref={raceRef} className={raceVisible ? 'animate-fade-up' : 'opacity-0'}>
            <Card variant="outlined" status={racesCompleted >= RACES_TARGET ? 'valid' : 'info'}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <Users className="w-5 h-5 text-brand-500" />
                        Mining Race
                    </h3>
                    <Badge variant="info">{racesCompleted} / {RACES_TARGET} Races</Badge>
                </div>

                <p className="mb-6 text-gray-600 dark:text-gray-300">
                    You're not the only miner. Thousands of miners race to find the block. Only the winner gets paid.
                </p>

                <div className="space-y-4 mb-6">
                    {raceMiners.map((miner) => (
                        <div key={miner.id} className="relative">
                            <div className="flex justify-between text-sm mb-1">
                                <span className="font-medium flex items-center gap-2 text-gray-900 dark:text-white">
                                    <span>{miner.avatar}</span> {miner.name} {miner.isUser && "(You)"}
                                    {miner.status === 'won' && <Trophy size={14} className="text-yellow-500"/>}
                                </span>
                                <span className="text-xs text-gray-500">{formatNumber(miner.attempts)} hashes</span>
                            </div>
                            <div className="h-2 bg-surface-tertiary dark:bg-surface-dark-tertiary rounded-full overflow-hidden">
                                <div
                                    className={`h-full transition-all duration-300 ${
                                        miner.status === 'won' ? 'bg-status-warning' :
                                        miner.status === 'lost' ? 'bg-status-error' :
                                        'bg-brand-500'
                                    }`}
                                    style={{
                                        width: raceStatus === 'idle' ? '0%' :
                                            miner.status !== 'racing' ? '100%' :
                                            `${Math.min(100, (miner.attempts / 500) * 10)}%`
                                    }}
                                ></div>
                            </div>
                        </div>
                    ))}

                    {raceMiners.length === 0 && (
                        <div className="text-center py-8 text-gray-400 border-2 border-dashed border-surface-border dark:border-surface-dark-border rounded-xl">
                            <Users className="mx-auto mb-2 opacity-50" />
                            Ready to race?
                        </div>
                    )}
                </div>

                {raceWinner && (
                    <div className={`p-4 rounded-xl border flex gap-3 mb-6 ${
                        raceWinner.isUser
                        ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800'
                        : 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800'
                    }`}>
                        <div className="text-2xl">{raceWinner.isUser ? '🎉' : '😢'}</div>
                        <div>
                            <h4 className={`font-bold ${raceWinner.isUser ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'}`}>
                                {raceWinner.isUser ? 'You Won!' : `${raceWinner.name} Won!`}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                {raceWinner.isUser
                                ? "You found the nonce first and got the reward! Everyone else wasted their electricity."
                                : "Your attempts were wasted. Only the winner gets paid. This is why mining is brutal."}
                            </p>
                        </div>
                    </div>
                )}

                <Button
                    onClick={handleStartRace}
                    disabled={raceStatus === 'racing'}
                    loading={raceStatus === 'racing'}
                    fullWidth
                    variant={raceStatus === 'racing' ? 'secondary' : 'primary'}
                >
                    {raceStatus === 'racing' ? 'Racing...' : raceMiners.length > 0 ? 'Race Again' : 'Start Race'}
                </Button>
            </Card>
        </div>
      )}

      {/* COMPLETION */}
      {isComplete && (
        <div ref={completionRef} className={completionVisible ? 'animate-fade-up' : 'opacity-0'}>
            <Card variant="default" status="valid">
                <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                    <div className="w-16 h-16 bg-status-valid/10 text-status-valid rounded-2xl flex items-center justify-center shrink-0">
                        <Check className="w-8 h-8" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Mining Mastered!</h3>
                        <p className="text-gray-600 dark:text-gray-300">
                            You've experienced Proof of Work firsthand. It secures the network by making history expensive to rewrite.
                        </p>
                    </div>
                    <Button variant="success" size="lg" onClick={() => navigate('/journey/6')}>
                        Continue to Step 6 →
                    </Button>
                </div>
            </Card>
        </div>
      )}

    </div>
  );
};

export default Step5_Mining;
