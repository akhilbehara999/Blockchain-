import React, { useState, useEffect } from 'react';
import { useProgress } from '../../../context/ProgressContext';
import { sha256 } from '../../../engine/hash';
import { Miner, startMiningRace } from '../../../engine/miner';
import { Clock, Zap, Trophy, Users, AlertTriangle } from 'lucide-react';

// --- Constants ---
const MANUAL_ATTEMPTS_TARGET = 10;
const AUTO_MINING_TARGET_ZEROS = 4;
const RACES_TARGET = 3;
const DIFFICULTIES_TARGET = 2;

// --- Helper for formatting numbers ---
const formatNumber = (n: number) => n.toLocaleString();

const Step5_Mining: React.FC = () => {
  const { completeStep } = useProgress();

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

  // --- Effects ---
  useEffect(() => {
    if (manualAttempts >= MANUAL_ATTEMPTS_TARGET) {
      setShowAutoMine(true);
    }
  }, [manualAttempts]);

  // --- Handlers: Manual Mining ---
  const handleManualHash = () => {
    const data = "Alice pays Bob 5 coins";
    const hash = sha256(data + manualNonce);
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

    // Use a loop with breaks to allow UI updates
    const mineBatch = () => {
      const batchSize = 1000;
      let found = false;
      let hash = '';

      for (let i = 0; i < batchSize; i++) {
        nonce++;
        hash = sha256(data + nonce);
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

    const mineBatch = () => {
      const batchSize = 1000;
      let found = false;
      let hash = '';

      for (let i = 0; i < batchSize; i++) {
        nonce++;
        hash = sha256(data + nonce);
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

    // User hash rate is simulated around 50 for balance with bots
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

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20">

      {/* SECTION 1: THE HOOK */}
      <section className="space-y-4">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">The Lottery You Can't Cheat</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          Mining isn't work. It's luck.
        </p>

        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
          <p className="text-lg text-blue-900 dark:text-blue-100 leading-relaxed">
            In Step 4, you fixed a broken chain instantly by recalculating hashes.
            But what if recalculating a hash was <strong>HARD</strong>?
            What if the network required your hash to start with specific zeros, like <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">0000</code>?
            <br/><br/>
            Most hashes don't start with zeros. You have to keep guessing random numbers (nonces) until you get lucky.
            That's exactly what <strong>MINING</strong> is.
          </p>
        </div>
      </section>

      {/* SECTION 2: MANUAL MINING */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 text-2xl font-bold text-gray-900 dark:text-white">
          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-sm">1</div>
          <h2>Mine By Hand</h2>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Block Data</label>
              <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded text-gray-700 dark:text-gray-300 font-mono text-sm">
                Alice pays Bob 5 coins
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Target Difficulty</label>
              <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded text-gray-700 dark:text-gray-300 font-mono text-sm">
                Hash must start with "0000"
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Try a Nonce (random number)
              </label>
              <input
                type="number"
                value={manualNonce}
                onChange={(e) => setManualNonce(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <button
              onClick={handleManualHash}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
            >
              Hash It
            </button>
          </div>

          {manualHash && (
            <div className={`p-4 rounded-lg border ${manualHash.startsWith('0000') ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Result Hash:</span>
                {manualHash.startsWith('0000') ? (
                  <span className="flex items-center text-green-600 dark:text-green-400 font-bold gap-1">
                    <Zap size={16} /> FOUND!
                  </span>
                ) : (
                  <span className="text-red-600 dark:text-red-400 font-bold text-sm">❌ No zeros</span>
                )}
              </div>
              <div className="font-mono text-sm break-all text-gray-800 dark:text-gray-200">
                {manualHash}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <span>Attempts: {manualAttempts} / {MANUAL_ATTEMPTS_TARGET}</span>
            {manualAttempts >= MANUAL_ATTEMPTS_TARGET && (
              <span className="text-green-600 dark:text-green-400 font-medium animate-pulse">
                Getting tired? Let the computer take over! ↓
              </span>
            )}
          </div>
        </div>
      </section>

      {/* SECTION 3: AUTOMATED MINING */}
      {showAutoMine && (
        <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex items-center gap-3 text-2xl font-bold text-gray-900 dark:text-white">
            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-sm">2</div>
            <h2>Computer Mining</h2>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Brute Force</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Let your CPU try thousands of nonces per second.</p>
              </div>
              <button
                onClick={startAutoMining}
                disabled={autoStatus === 'mining'}
                className={`px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  autoStatus === 'mining'
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {autoStatus === 'mining' ? <><Clock className="animate-spin" size={18}/> Mining...</> : <><Zap size={18}/> Start Mining</>}
              </button>
            </div>

            <div className="font-mono bg-gray-900 text-green-400 p-4 rounded-lg text-sm min-h-[120px]">
              {autoStatus === 'idle' && !autoResult && <div className="text-gray-500">Waiting to start...</div>}

              {(autoStatus === 'mining' || (autoStatus === 'found' && autoResult)) && (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Nonce: {autoStatus === 'mining' ? formatNumber(autoProgress.nonce) : formatNumber(autoResult!.nonce)}</span>
                    <span>Hash: {autoStatus === 'mining' ? autoProgress.hash.substring(0, 20) + '...' : autoResult!.hash.substring(0, 20) + '...'}</span>
                  </div>
                  {autoStatus === 'found' && autoResult && (
                     <div className="mt-4 pt-4 border-t border-gray-800 text-white">
                       <div className="flex items-center gap-2 text-green-400 font-bold text-lg mb-2">
                         <Zap size={20} /> BLOCK FOUND!
                       </div>
                       <div className="grid grid-cols-3 gap-4 text-center">
                         <div className="bg-gray-800 p-2 rounded">
                           <div className="text-xs text-gray-400">Time</div>
                           <div className="font-bold">{autoResult.time.toFixed(3)}s</div>
                         </div>
                         <div className="bg-gray-800 p-2 rounded">
                           <div className="text-xs text-gray-400">Attempts</div>
                           <div className="font-bold">{formatNumber(autoResult.attempts)}</div>
                         </div>
                         <div className="bg-gray-800 p-2 rounded">
                           <div className="text-xs text-gray-400">Hash Rate</div>
                           <div className="font-bold">~{formatNumber(Math.round(autoResult.attempts / autoResult.time))} H/s</div>
                         </div>
                       </div>
                       <p className="mt-4 text-gray-300 text-sm">
                         The nonce <span className="text-white font-bold">{autoResult.nonce}</span> produces a hash starting with "0000". This is your <span className="text-yellow-400 font-bold">PROOF OF WORK</span>.
                       </p>
                     </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* SECTION 4: DIFFICULTY EXPERIMENT */}
      {autoStatus === 'found' && (
        <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
           <div className="flex items-center gap-3 text-2xl font-bold text-gray-900 dark:text-white">
            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-sm">3</div>
            <h2>Difficulty Experiment</h2>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 space-y-6">
            <p className="text-gray-600 dark:text-gray-300">
              What happens when we require MORE zeros?
            </p>

            <div className="space-y-4">
              <div className="flex justify-between text-sm font-medium text-gray-700 dark:text-gray-300">
                <span>Easier (3 zeros)</span>
                <span>Harder (6 zeros)</span>
              </div>
              <input
                type="range"
                min="3"
                max="6"
                value={difficulty}
                onChange={(e) => setDifficulty(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-indigo-600"
              />
              <div className="text-center font-bold text-lg text-indigo-600 dark:text-indigo-400">
                Target: "{ "0".repeat(difficulty) }..."
              </div>
            </div>

            <button
                onClick={startDiffMining}
                disabled={diffStatus === 'mining'}
                className={`w-full py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                  diffStatus === 'mining'
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                {diffStatus === 'mining' ? <><Clock className="animate-spin" size={18}/> Mining at Difficulty {difficulty}...</> : `Mine at Difficulty ${difficulty}`}
            </button>

            {/* Results Display */}
            <div className="space-y-2">
              {[3, 4, 5, 6].map(d => (
                <div key={d} className={`flex justify-between items-center p-3 rounded-lg border ${
                  diffResults[d]
                    ? 'bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-800'
                    : 'bg-gray-50 border-gray-100 dark:bg-gray-800/50 dark:border-gray-700'
                }`}>
                   <div className="flex items-center gap-3">
                     <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                       diffResults[d] ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-600'
                     }`}>
                       {d}
                     </div>
                     <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Zeros</span>
                   </div>

                   {diffResults[d] ? (
                     <div className="text-right">
                       <div className="text-sm font-bold text-gray-900 dark:text-white">{diffResults[d].time.toFixed(3)}s</div>
                       <div className="text-xs text-gray-500">{formatNumber(diffResults[d].attempts)} attempts</div>
                     </div>
                   ) : (
                     <span className="text-xs text-gray-400 italic">Not tested yet</span>
                   )}
                </div>
              ))}
            </div>

            {diffStatus === 'mining' && (
               <div className="text-center text-sm text-gray-500 animate-pulse">
                 Trying Nonce: {formatNumber(diffProgress.nonce)}...
               </div>
            )}

             {Object.keys(diffResults).length >= DIFFICULTIES_TARGET && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800 flex gap-3">
                  <AlertTriangle className="text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    Adding just one zero makes it ~16x harder (in hex). Real Bitcoin requires ~19 leading zeros!
                  </p>
                </div>
             )}
          </div>
        </section>
      )}

      {/* SECTION 5: MINING COMPETITION */}
      {Object.keys(diffResults).length >= DIFFICULTIES_TARGET && (
        <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
           <div className="flex items-center gap-3 text-2xl font-bold text-gray-900 dark:text-white">
            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-sm">4</div>
            <h2>Mining Race</h2>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 space-y-6">
            <p className="text-gray-600 dark:text-gray-300">
              You're not the only miner. In a real blockchain, thousands of miners race to find the block.
              Only the winner gets paid.
            </p>

            <div className="space-y-3">
               {raceMiners.map((miner) => (
                 <div key={miner.id} className="relative">
                   <div className="flex justify-between text-sm mb-1">
                     <span className="font-medium flex items-center gap-2 text-gray-900 dark:text-white">
                       <span>{miner.avatar}</span> {miner.name} {miner.isUser && "(You)"}
                       {miner.status === 'won' && <Trophy size={14} className="text-yellow-500"/>}
                     </span>
                     <span className="text-xs text-gray-500">
                       {formatNumber(miner.attempts)} hashes
                     </span>
                   </div>
                   {/* Visualization of "effort" - not progress, just activity */}
                   <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                     <div
                       className={`h-full transition-all duration-300 ${
                         miner.status === 'won' ? 'bg-yellow-400' :
                         miner.status === 'lost' ? 'bg-red-400' :
                         'bg-blue-500'
                       }`}
                       style={{
                         width: raceStatus === 'idle' ? '0%' :
                                miner.status !== 'racing' ? '100%' :
                                `${Math.min(100, (miner.attempts / 500) * 10)}%` // Just a visual fake progress for the racing phase
                       }}
                     ></div>
                   </div>
                 </div>
               ))}

               {raceMiners.length === 0 && (
                 <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
                   <Users className="mx-auto mb-2 opacity-50" />
                   Ready to race?
                 </div>
               )}
            </div>

            {raceWinner && (
              <div className={`p-4 rounded-lg border flex gap-3 ${
                raceWinner.isUser
                  ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                  : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
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

            <button
                onClick={handleStartRace}
                disabled={raceStatus === 'racing'}
                className={`w-full py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                  raceStatus === 'racing'
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                {raceStatus === 'racing' ? <><Clock className="animate-spin" size={18}/> Racing...</> : raceMiners.length > 0 ? 'Race Again' : 'Start Race'}
            </button>

            <div className="text-center text-xs text-gray-400">
              Races Completed: {racesCompleted} / {RACES_TARGET}
            </div>
          </div>
        </section>
      )}

      {/* COMPLETION */}
      {isComplete && (
         <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] animate-in slide-in-from-bottom-full duration-500 z-50">
           <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
             <div>
               <h3 className="text-lg font-bold text-green-600 dark:text-green-400 flex items-center gap-2">
                 <Zap className="fill-current" /> Step 5 Complete!
               </h3>
               <p className="text-sm text-gray-600 dark:text-gray-400">
                 You've mastered mining: it's a lottery that secures the network.
               </p>
             </div>
             <button
               onClick={() => completeStep(5)}
               className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold shadow-lg shadow-green-600/20 transition-all transform hover:scale-105"
             >
               Continue to Step 6: Transactions →
             </button>
           </div>
         </div>
      )}
    </div>
  );
};

export default Step5_Mining;
