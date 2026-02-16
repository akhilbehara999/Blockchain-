import React, { useState, useEffect } from 'react';
import { ArrowRight, BookOpen, Cpu, Trophy, Activity, Box, Users, Play } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import HeroBackground from './HeroBackground';
import NetworkConnect from './NetworkConnect';
import { useProgress } from '../../context/ProgressContext';
import { useBlockchainStore } from '../../stores/useBlockchainStore';
import { useWalletStore } from '../../stores/useWalletStore';
import { useBackground } from '../../context/BackgroundContext';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentStep, journeyComplete } = useProgress();
  const { blocks } = useBlockchainStore();
  const { mempool } = useWalletStore(); // minedTransactions tracks session mines
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

       // Calculate total transactions from blocks + mempool
       // This is expensive to do every render if blocks are huge, but fine for simulation scale
       let txCount = 0;
       blocks.forEach(b => {
           // Block data format: "Mined by X\nTx1, Tx2..."
           const lines = b.data.split('\n');
           if (lines.length > 1) {
               // Assuming comma separated txs in second line, or just counting lines
               // BackgroundEngine uses: "from->to (amt), ..."
               const txLine = lines[1];
               if (txLine && txLine !== 'No transactions') {
                   txCount += txLine.split(', ').length;
               }
           }
       });
       txCount += mempool.length;

       // Add some simulated historical base for effect if needed, but let's stick to real simulation stats
       // or user request "1,204 transactions processed" suggests a higher number.
       // Let's add a base number to make it look "live" and mature if it's small.
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
    <div className="min-h-screen bg-black text-white font-sans selection:bg-indigo-500 selection:text-white">
      {/* Network Connect Overlay */}
      {showConnect && (
        <NetworkConnect onComplete={() => navigate('/journey/1')} />
      )}

      {/* Section 1: Hero */}
      <section className="relative h-screen flex flex-col items-center justify-center overflow-hidden">
        <HeroBackground />

        <div className="z-10 text-center px-4 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-1000 slide-in-from-bottom-10">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
              You've heard about blockchain.
              <br />
              <span className="text-white">Now BECOME part of one.</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              This isn't a tutorial. This is a living blockchain network.
              <br />
              And you're about to join it.
            </p>
          </div>

          <div className="flex flex-col items-center gap-4 pt-8">
            <button
              onClick={handleBegin}
              className="group relative px-8 py-4 bg-white text-black font-bold text-lg rounded-full hover:bg-gray-200 transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
            >
              Begin Your Journey
              <ArrowRight className="inline-block ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <div className="flex items-center gap-6 mt-4 text-sm font-medium">
              {currentStep > 1 && (
                <Link to={`/journey/${currentStep}`} className="text-gray-400 hover:text-white transition-colors flex items-center">
                  <Play className="w-4 h-4 mr-1" />
                  Continue from Step {currentStep}
                </Link>
              )}
              {journeyComplete && (
                <Link to="/sandbox" className="text-gray-400 hover:text-indigo-400 transition-colors flex items-center">
                  <Box className="w-4 h-4 mr-1" />
                  Enter Sandbox
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 animate-bounce text-gray-500">
          <span className="text-xs uppercase tracking-widest">How it works</span>
        </div>
      </section>

      {/* Section 2: How It Works */}
      <section className="py-24 px-6 bg-zinc-900 border-t border-zinc-800">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">

            {/* Step 1 */}
            <div className="space-y-4 group">
              <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors">
                <BookOpen className="w-8 h-8 text-indigo-400" />
              </div>
              <h3 className="text-2xl font-bold">1. LEARN</h3>
              <p className="text-gray-400 leading-relaxed">
                8 guided steps. Each builds on the last. You can't skip ahead.
                Understand the "why" before the "how".
              </p>
            </div>

            {/* Step 2 */}
            <div className="space-y-4 group">
              <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                <Cpu className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold">2. APPLY</h3>
              <p className="text-gray-400 leading-relaxed">
                Sandbox mode. Everything on one screen. Free play.
                Experiment without consequences.
              </p>
            </div>

            {/* Step 3 */}
            <div className="space-y-4 group">
              <div className="w-16 h-16 bg-pink-500/10 rounded-2xl flex items-center justify-center group-hover:bg-pink-500/20 transition-colors">
                <Trophy className="w-8 h-8 text-pink-400" />
              </div>
              <h3 className="text-2xl font-bold">3. MASTER</h3>
              <p className="text-gray-400 leading-relaxed">
                Challenges. Double spend attacks. 51% attacks. Forks.
                Deploy contracts. Feel what it means to trust math.
              </p>
            </div>
          </div>

          <div className="mt-16 p-8 bg-gradient-to-r from-zinc-800 to-zinc-900 rounded-2xl border border-zinc-700 text-center">
            <p className="text-lg text-gray-300">
              "You'll create wallets, mine blocks, send coins, break chains, experience forks, deploy contracts
              and <span className="text-white font-bold">FEEL</span> what it means to trust math over people."
            </p>
          </div>
        </div>
      </section>

      {/* Section 3: Live Network Preview */}
      <section className="py-24 px-6 bg-black relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-900/20 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <h2 className="text-3xl font-bold mb-12 flex items-center justify-center gap-3">
            <Activity className="w-6 h-6 text-green-400 animate-pulse" />
            Right now, our simulated network is running
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            <div className="p-6 bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-xl">
              <div className="text-3xl font-bold text-white mb-2">{stats.blocks.toLocaleString()}</div>
              <div className="text-sm text-gray-500 flex items-center justify-center gap-2">
                <Box className="w-4 h-4" /> Blocks Mined
              </div>
            </div>

            <div className="p-6 bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-xl">
              <div className="text-3xl font-bold text-white mb-2">{stats.txs.toLocaleString()}</div>
              <div className="text-sm text-gray-500 flex items-center justify-center gap-2">
                <Activity className="w-4 h-4" /> Transactions
              </div>
            </div>

            <div className="p-6 bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-xl">
              <div className="text-3xl font-bold text-white mb-2">{stats.miners}</div>
              <div className="text-sm text-gray-500 flex items-center justify-center gap-2">
                <Cpu className="w-4 h-4" /> Miners
              </div>
            </div>

            <div className="p-6 bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-xl">
              <div className="text-3xl font-bold text-white mb-2">{stats.nodes}</div>
              <div className="text-sm text-gray-500 flex items-center justify-center gap-2">
                <Users className="w-4 h-4" /> Nodes
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <p className="text-xl text-gray-400">
              This network is waiting for you.
            </p>
            <button
              onClick={handleBegin}
              className="px-12 py-4 bg-indigo-600 text-white font-bold rounded-full hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/25"
            >
              Join Now
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
