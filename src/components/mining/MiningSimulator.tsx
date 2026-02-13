import React, { useState, useEffect } from 'react';
import { startMiningRace, getLeaderboard, Miner, MinerLeaderboard } from '../../engine/miner';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Slider from '../ui/Slider';
import { Play, Trophy, XCircle, Hammer, Hash, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MiningSimulator: React.FC = () => {
  const [miners, setMiners] = useState<Miner[]>([]);
  const [leaderboard, setLeaderboard] = useState<MinerLeaderboard>([]);
  const [isRacing, setIsRacing] = useState(false);
  const [difficulty, setDifficulty] = useState(3);
  const [userHashRate, setUserHashRate] = useState(50);
  const [winner, setWinner] = useState<Miner | null>(null);

  useEffect(() => {
    // Initial load
    setLeaderboard(getLeaderboard());
  }, []);

  const handleStartRace = async () => {
    setIsRacing(true);
    setWinner(null);

    // We don't need to clear miners here because the callback will fire on the first tick
    // but clearing might prevent flashing old state if there's a delay.
    // However, startMiningRace is async but the setup is synchronous until the first tick.

    try {
      const result = await startMiningRace(difficulty, userHashRate, (currentMiners) => {
        setMiners(currentMiners);
      });

      setWinner(result.winner);
      // Ensure final state is reflected
      setMiners(result.allMiners);
    } catch (error) {
      console.error("Race failed", error);
    } finally {
      setIsRacing(false);
      setLeaderboard(getLeaderboard());
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Controls & Leaderboard */}
        <div className="space-y-6">
          <Card title="Race Settings">
            <div className="space-y-6">
              <Slider
                label="Difficulty (Leading Zeros)"
                min={1}
                max={6}
                value={difficulty}
                onChange={setDifficulty}
                disabled={isRacing}
                showValue
              />
              <p className="text-xs text-text-secondary">
                Higher difficulty exponentially increases mining time.
              </p>

              <Slider
                label="Your Hash Rate"
                min={10}
                max={200}
                step={10}
                value={userHashRate}
                onChange={setUserHashRate}
                disabled={isRacing}
                showValue
              />
              <p className="text-xs text-text-secondary">
                Higher hash rate improves your odds, but guarantees nothing!
              </p>

              <Button
                onClick={handleStartRace}
                disabled={isRacing}
                className="w-full"
                variant="primary"
              >
                {isRacing ? (
                  <>
                    <Cpu className="w-4 h-4 mr-2 animate-spin" /> Racing...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2 fill-current" /> Start Race
                  </>
                )}
              </Button>
            </div>
          </Card>

          <Card title="Miner Leaderboard">
             <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                   <thead className="text-xs text-text-secondary uppercase bg-tertiary-bg/50">
                      <tr>
                         <th className="px-3 py-2 rounded-l-md">Rank</th>
                         <th className="px-3 py-2">Miner</th>
                         <th className="px-3 py-2 text-right">Wins</th>
                         <th className="px-3 py-2 text-right rounded-r-md">Rewards</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-border/50">
                      {leaderboard.map((m, idx) => (
                         <tr key={m.id} className={m.isUser ? "bg-accent/10" : ""}>
                            <td className="px-3 py-2 font-mono text-text-secondary">#{idx + 1}</td>
                            <td className="px-3 py-2 font-medium flex items-center gap-2">
                               <span>{m.avatar}</span>
                               <span className={m.isUser ? "text-accent" : "text-text-primary"}>{m.name}</span>
                            </td>
                            <td className="px-3 py-2 text-right font-mono">{m.blocksWon}</td>
                            <td className="px-3 py-2 text-right font-mono text-success">{m.totalRewards}</td>
                         </tr>
                      ))}
                      {leaderboard.length === 0 && (
                          <tr>
                              <td colSpan={4} className="px-3 py-4 text-center text-text-secondary">
                                  No races recorded yet.
                              </td>
                          </tr>
                      )}
                   </tbody>
                </table>
             </div>
          </Card>
        </div>

        {/* Right Column: Race Track */}
        <div className="lg:col-span-2 space-y-6">
           {/* Winner Announcement */}
           <AnimatePresence>
             {winner && !isRacing && (
               <motion.div
                 initial={{ opacity: 0, y: -20 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0 }}
                 className={`p-4 rounded-xl border-l-4 shadow-lg flex items-center gap-4 ${
                    winner.isUser
                    ? 'bg-success/10 border-l-success'
                    : 'bg-tertiary-bg border-l-accent'
                 }`}
               >
                 <div className={`p-3 rounded-full ${winner.isUser ? 'bg-success/20 text-success' : 'bg-accent/20 text-accent'}`}>
                    <Trophy className="w-8 h-8" />
                 </div>
                 <div className="flex-1">
                    <h3 className="font-bold text-lg text-text-primary">
                        {winner.isUser ? 'You Won!' : `${winner.name} Won!`}
                    </h3>
                    <p className="text-text-secondary">
                        Found valid hash after <span className="font-mono text-text-primary">{winner.attempts?.toLocaleString()}</span> attempts.
                        Block reward <span className="text-success font-bold">+50</span> coins.
                    </p>
                 </div>
               </motion.div>
             )}
             {winner && !winner.isUser && !isRacing && miners.find(m => m.isUser)?.status === 'lost' && (
                 <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-3 bg-danger/10 border border-danger/20 rounded-lg flex items-center gap-3 text-sm text-danger"
                 >
                     <XCircle className="w-5 h-5 flex-shrink-0" />
                     <span>
                        Your <span className="font-mono font-bold">{miners.find(m => m.isUser)?.attempts?.toLocaleString()}</span> hash attempts were wasted. Better luck next time!
                     </span>
                 </motion.div>
             )}
           </AnimatePresence>

           <Card title="Live Mining Status" className="min-h-[400px]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 {miners.map((miner) => (
                    <motion.div
                       layout
                       key={miner.id}
                       className={`relative overflow-hidden p-4 rounded-lg border transition-all duration-300 ${
                          miner.status === 'won'
                            ? 'bg-success/5 border-success ring-1 ring-success shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                            : miner.status === 'lost'
                            ? 'bg-tertiary-bg/50 border-border/50 opacity-60 grayscale-[0.5]'
                            : 'bg-tertiary-bg border-border'
                       } ${miner.isUser ? 'ring-2 ring-accent/50' : ''}`}
                    >
                       <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-2">
                             <span className="text-2xl">{miner.avatar}</span>
                             <div>
                                <div className="font-bold text-sm text-text-primary flex items-center gap-2">
                                    {miner.name}
                                    {miner.isUser && <span className="text-[10px] px-1.5 py-0.5 bg-accent/20 text-accent rounded-full">YOU</span>}
                                </div>
                                <div className="text-xs text-text-secondary flex items-center gap-1">
                                   <ZapIcon className="w-3 h-3" /> {miner.hashRate} H/s
                                </div>
                             </div>
                          </div>
                          <div className="text-right">
                             <div className={`font-mono text-lg font-bold ${
                                 miner.status === 'won' ? 'text-success' : 'text-text-primary'
                             }`}>
                                {miner.elapsedTime?.toFixed(2)}s
                             </div>
                          </div>
                       </div>

                       <div className="space-y-2">
                          <div className="flex justify-between text-xs text-text-secondary">
                             <span className="flex items-center gap-1">
                                <Hash className="w-3 h-3" /> Nonce
                             </span>
                             <span className="font-mono">{miner.currentNonce?.toLocaleString()}</span>
                          </div>

                          <div className="flex justify-between text-xs text-text-secondary">
                             <span className="flex items-center gap-1">
                                <Hammer className="w-3 h-3" /> Attempts
                             </span>
                             <span className="font-mono">{miner.attempts?.toLocaleString()}</span>
                          </div>
                       </div>

                       {/* Status Badge */}
                       {miner.status === 'won' && (
                           <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-success text-white text-xs font-bold rounded-full shadow-sm animate-bounce">
                               WINNER
                           </div>
                       )}
                       {miner.status === 'lost' && (
                           <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-text-secondary/20 text-text-secondary text-xs font-bold rounded-full">
                               WASTED
                           </div>
                       )}
                       {miner.status === 'racing' && (
                           <div className="absolute bottom-2 right-2">
                               <Cpu className="w-4 h-4 text-accent animate-spin" />
                           </div>
                       )}
                    </motion.div>
                 ))}

                 {miners.length === 0 && !isRacing && (
                     <div className="col-span-full flex flex-col items-center justify-center py-12 text-text-secondary opacity-50">
                         <Trophy className="w-16 h-16 mb-4" />
                         <p>Start the race to see miners compete!</p>
                     </div>
                 )}
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
};

// Helper icon component
const ZapIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
);

export default MiningSimulator;
