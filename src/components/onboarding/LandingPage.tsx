import React, { useState, useEffect } from 'react';
import { ArrowRight, Box, Activity, Cpu, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import HeroBackground from './HeroBackground';
import NetworkConnect from './NetworkConnect';
import Button from '../ui/Button';
import Card from '../ui/Card';
import AnimatedNumber from '../ui/AnimatedNumber';
import { useProgress } from '../../context/ProgressContext';
import { useBlockchainStore } from '../../stores/useBlockchainStore';
import { useWalletStore } from '../../stores/useWalletStore';
import { useBackground } from '../../context/BackgroundContext';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentStep, journeyComplete } = useProgress();
  const { blocks } = useBlockchainStore();
  const { mempool } = useWalletStore();
  const { engine } = useBackground();

  const [showConnect, setShowConnect] = useState(false);
  const [stats, setStats] = useState({
    blocks: 0,
    txs: 0,
    miners: 0,
    nodes: 0
  });

  // Calculate stats
  useEffect(() => {
    const updateStats = () => {
       const blockCount = blocks.length;
       let txCount = 0;
       blocks.forEach(b => {
           const lines = b.data.split('\n');
           if (lines.length > 1) {
               const txLine = lines[1];
               if (txLine && txLine !== 'No transactions') {
                   txCount += txLine.split(', ').length;
               }
           }
       });
       txCount += mempool.length;

       const baseTx = 1204;
       const baseBlocks = 347;

       const miners = engine.getSimulatedMiners().length;
       const nodes = engine.getPeerWallets().length;

       setStats({
           blocks: baseBlocks + blockCount,
           txs: baseTx + txCount,
           miners: miners,
           nodes: nodes
       });
    };

    updateStats();
    const interval = setInterval(updateStats, 1000);
    return () => clearInterval(interval);
  }, [blocks, mempool, engine]);

  const handleBegin = () => {
    const identity = localStorage.getItem('yupp_node_identity');
    if (identity) {
      navigate('/journey/1');
    } else {
      setShowConnect(true);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-brand-500 selection:text-white overflow-x-hidden">
      {/* Network Connect Overlay */}
      {showConnect && (
        <NetworkConnect onComplete={() => navigate('/journey/1')} />
      )}

      {/* ─────────────────────────────────────────────────────────────
          HERO SECTION
      ───────────────────────────────────────────────────────────── */}
      <section className="relative h-screen flex flex-col items-center justify-center overflow-hidden">
        <HeroBackground />

        <div className="z-10 text-center px-4 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-1000 slide-in-from-bottom-10">
          <div className="space-y-2">
             <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tight text-white drop-shadow-lg">
              YOU'VE HEARD ABOUT <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-brand-600">BLOCKCHAIN.</span>
            </h1>
            <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tight text-white drop-shadow-lg">
              NOW BECOME <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-brand-600">PART OF ONE.</span>
            </h1>
          </div>

          <div className="space-y-1">
             <p className="text-lg md:text-xl text-gray-400">This isn't a tutorial.</p>
             <p className="text-lg md:text-xl text-gray-400">It's a living network.</p>
             <p className="text-lg md:text-xl text-white font-medium">And you're about to join it.</p>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4 pt-8">
            <Button
              onClick={handleBegin}
              variant="primary"
              size="lg"
              className="w-full md:w-auto min-w-[200px] shadow-[0_0_30px_rgba(99,102,241,0.4)]"
            >
              Begin Your Journey <ArrowRight className="ml-2 w-5 h-5" />
            </Button>

            <div className="flex items-center gap-4">
               {currentStep > 1 && (
                  <Button
                    onClick={() => navigate(`/journey/${currentStep}`)}
                    variant="ghost"
                    size="lg"
                    className="w-full md:w-auto border border-white/10 hover:bg-white/5"
                  >
                    Continue Step {currentStep}
                  </Button>
               )}
               {journeyComplete && (
                  <Button
                     onClick={() => navigate('/sandbox')}
                     variant="ghost"
                     size="lg"
                      className="w-full md:w-auto border border-white/10 hover:bg-white/5"
                  >
                     Sandbox
                  </Button>
               )}
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 animate-bounce text-gray-500">
          <span className="text-xs uppercase tracking-widest">Scroll to explore</span>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          HOW IT WORKS SECTION
      ───────────────────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-surface-secondary dark:bg-[#0B0F19]">
        <div className="max-w-7xl mx-auto space-y-16">
           <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-5xl font-display font-bold text-white">How You'll Learn Blockchain</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                 Forget static text. You learn by doing. By breaking. By fixing.
              </p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              {/* Connector Lines (Desktop) */}
              <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-brand-500/30 to-transparent -translate-y-1/2 z-0"></div>

              {/* Step 1 */}
              <Card variant="glass" className="relative z-10 hover:scale-105 transition-transform duration-300 border-white/5 bg-gray-900/40 backdrop-blur-xl">
                 <div className="flex flex-col items-center text-center space-y-4 p-4">
                    <div className="w-16 h-16 rounded-2xl bg-brand-500/10 flex items-center justify-center border border-brand-500/20 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                       <span className="text-3xl">🎓</span>
                    </div>
                    <h3 className="text-2xl font-bold text-white">LEARN</h3>
                    <p className="text-gray-400">
                       8 guided steps. Each builds on the last. Master the fundamentals one block at a time.
                    </p>
                 </div>
              </Card>

              {/* Step 2 */}
              <Card variant="glass" className="relative z-10 hover:scale-105 transition-transform duration-300 border-white/5 bg-gray-900/40 backdrop-blur-xl delay-100">
                 <div className="flex flex-col items-center text-center space-y-4 p-4">
                    <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                       <span className="text-3xl">⚡</span>
                    </div>
                    <h3 className="text-2xl font-bold text-white">APPLY</h3>
                    <p className="text-gray-400">
                       Sandbox mode. Everything is connected. Free play with a fully simulated blockchain node.
                    </p>
                 </div>
              </Card>

              {/* Step 3 */}
              <Card variant="glass" className="relative z-10 hover:scale-105 transition-transform duration-300 border-white/5 bg-gray-900/40 backdrop-blur-xl delay-200">
                 <div className="flex flex-col items-center text-center space-y-4 p-4">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                       <span className="text-3xl">🏆</span>
                    </div>
                    <h3 className="text-2xl font-bold text-white">MASTER</h3>
                    <p className="text-gray-400">
                       Real challenges. Break things on purpose. Double spend, 51% attacks, and forks.
                    </p>
                 </div>
              </Card>
           </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          LIVE NETWORK SECTION
      ───────────────────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-gray-950 relative overflow-hidden">
         {/* Background Decoration */}
         <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-900/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
         </div>

         <div className="max-w-6xl mx-auto relative z-10">
            <div className="text-center mb-16 space-y-4">
               <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-sm font-medium animate-pulse-subtle">
                  <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse"></span>
                  LIVE NETWORK STATUS
               </div>
               <h2 className="text-4xl md:text-5xl font-display font-bold text-white">The Network Is Running. Right Now.</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

               {/* Stats Grid */}
               <div className="grid grid-cols-2 gap-4">
                  <div className="p-6 rounded-2xl bg-gray-900/50 border border-white/5 backdrop-blur-sm">
                     <div className="text-4xl font-mono font-bold text-white mb-2">
                        <AnimatedNumber value={stats.blocks} />
                     </div>
                     <div className="text-gray-400 flex items-center gap-2">
                        <Box className="w-4 h-4 text-brand-400" /> Blocks Mined
                     </div>
                  </div>
                  <div className="p-6 rounded-2xl bg-gray-900/50 border border-white/5 backdrop-blur-sm">
                     <div className="text-4xl font-mono font-bold text-white mb-2">
                        <AnimatedNumber value={stats.txs} />
                     </div>
                     <div className="text-gray-400 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-emerald-400" /> Transactions
                     </div>
                  </div>
                  <div className="p-6 rounded-2xl bg-gray-900/50 border border-white/5 backdrop-blur-sm">
                     <div className="text-4xl font-mono font-bold text-white mb-2">
                        <AnimatedNumber value={stats.miners} />
                     </div>
                     <div className="text-gray-400 flex items-center gap-2">
                        <Cpu className="w-4 h-4 text-amber-400" /> Active Miners
                     </div>
                  </div>
                  <div className="p-6 rounded-2xl bg-gray-900/50 border border-white/5 backdrop-blur-sm">
                     <div className="text-4xl font-mono font-bold text-white mb-2">
                        <AnimatedNumber value={stats.nodes} />
                     </div>
                     <div className="text-gray-400 flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-400" /> Peer Nodes
                     </div>
                  </div>
               </div>

               {/* Mini Chain Visualization */}
               <div className="relative h-64 bg-gray-900/30 rounded-2xl border border-white/5 overflow-hidden flex items-center justify-end px-8">
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-transparent to-transparent z-10"></div>

                  {/* Visual blocks */}
                  <div className="flex items-center gap-4 animate-slide-in-right">
                      {/* We just show a few static-looking blocks that pulse to simulate activity */}
                      {[...Array(5)].map((_, i) => (
                         <div key={i} className="relative group">
                            <div className={`w-16 h-16 rounded-xl border border-brand-500/30 bg-brand-500/10 flex items-center justify-center text-xs font-mono text-brand-300
                               shadow-[0_0_15px_rgba(99,102,241,0.1)] transition-all duration-500
                               ${i === 4 ? 'animate-pulse bg-brand-500/20 border-brand-500/50 shadow-[0_0_20px_rgba(99,102,241,0.3)]' : 'opacity-60'}
                            `}>
                               #{stats.blocks - (4-i)}
                            </div>
                            {i < 4 && <div className="absolute top-1/2 -right-4 w-4 h-0.5 bg-brand-500/20"></div>}
                         </div>
                      ))}
                  </div>
               </div>

            </div>

            <div className="mt-16 text-center">
               <Button onClick={handleBegin} variant="primary" size="lg" className="px-12 py-6 text-xl shadow-[0_0_40px_rgba(99,102,241,0.3)]">
                  Join the Network <ArrowRight className="ml-3 w-6 h-6" />
               </Button>
            </div>
         </div>
      </section>
    </div>
  );
};

export default LandingPage;
