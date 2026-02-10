import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useSpring } from 'framer-motion';
import {
  Hash, Box, Link as LinkIcon, Network, Coins, PenTool,
  Hammer, Users, FileCode, GitBranch, Shield, Zap, Image,
  Globe, Wrench, BookOpen, Github, ArrowRight, CheckCircle
} from 'lucide-react';
import ChainView from '../components/blockchain/ChainView';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { useProgressStore } from '../stores/useProgressStore';
import { Block } from '../engine/types';
import { createBlock, calculateHash, mineBlock } from '../engine/block';

// --- Types & Constants ---

const MODULES = [
  { id: 'M01', title: 'Hashing', icon: Hash, path: '/module/hash' },
  { id: 'M02', title: 'The Block', icon: Box, path: '/module/block' },
  { id: 'M03', title: 'Blockchain', icon: LinkIcon, path: '/module/blockchain' },
  { id: 'M04', title: 'Distributed P2P', icon: Network, path: '/module/network' },
  { id: 'M05', title: 'Tokens', icon: Coins, path: '/module/tokens' },
  { id: 'M06', title: 'Signatures', icon: PenTool, path: '/module/signatures' },
  { id: 'M07', title: 'Proof of Work', icon: Hammer, path: '/module/mining' }, // Using Hammer as requested
  { id: 'M08', title: 'Consensus', icon: Users, path: '/module/consensus' },
  { id: 'M09', title: 'Smart Contracts', icon: FileCode, path: '/module/smart-contracts' },
  { id: 'M10', title: 'Merkle Trees', icon: GitBranch, path: '/module/merkletrees' },
  { id: 'M11', title: '51% Attack', icon: Shield, path: '/module/attack51' },
  { id: 'M12', title: 'Forks', icon: Zap, path: '/module/forks' },
  { id: 'M13', title: 'DeFi', icon: Globe, path: '/module/defi' },
  { id: 'M14', title: 'NFTs', icon: Image, path: '/module/nfts' },
];

const INITIAL_DEMO_BLOCKS: Block[] = [
  mineBlock(createBlock(1, 'Genesis Block', '0'.repeat(64), 2), 2),
  createBlock(2, 'Alice -> Bob: 50', '', 2),
  createBlock(3, 'Bob -> Charlie: 20', '', 2),
];

// Correct linking and mine initial blocks
INITIAL_DEMO_BLOCKS[1].previousHash = INITIAL_DEMO_BLOCKS[0].hash;
INITIAL_DEMO_BLOCKS[1] = mineBlock(INITIAL_DEMO_BLOCKS[1], 2);

INITIAL_DEMO_BLOCKS[2].previousHash = INITIAL_DEMO_BLOCKS[1].hash;
INITIAL_DEMO_BLOCKS[2] = mineBlock(INITIAL_DEMO_BLOCKS[2], 2);

// --- Components ---

const HeroSection: React.FC = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-primary-bg">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px]" />

        {/* Floating Blocks Animation */}
        <div className="absolute inset-0 flex items-center justify-center opacity-15">
          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute left-[20%] top-[40%] w-32 h-40 border-2 border-indigo-500/30 rounded-lg bg-indigo-500/5 backdrop-blur-sm"
          />
           <motion.div
            animate={{ y: [0, 20, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute left-[50%] top-[30%] w-32 h-40 border-2 border-purple-500/30 rounded-lg bg-purple-500/5 backdrop-blur-sm -translate-x-1/2"
          />
           <motion.div
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute right-[20%] top-[50%] w-32 h-40 border-2 border-pink-500/30 rounded-lg bg-pink-500/5 backdrop-blur-sm"
          />

          {/* Connecting Lines */}
          <svg className="absolute inset-0 w-full h-full">
            <motion.path
              d="M 25% 45% L 50% 35% L 75% 55%"
              stroke="url(#gradient-line)"
              strokeWidth="2"
              fill="none"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.3 }}
              transition={{ duration: 2, ease: "easeInOut" }}
            />
            <defs>
              <linearGradient id="gradient-line" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#6366F1" />
                <stop offset="100%" stopColor="#EC4899" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      <div className="relative z-10 max-w-4xl px-4 text-center space-y-8">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 pb-2"
        >
          Learn Blockchain by Building One
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-xl md:text-2xl text-text-secondary max-w-2xl mx-auto"
        >
          No jargon. No crypto needed. Just interactive simulations that make it click.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="pt-8"
        >
          <Link to="/module/hash">
            <Button size="lg" className="text-lg px-8 py-6 rounded-full shadow-xl shadow-indigo-500/20 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 border-none transition-all hover:scale-105">
              Start Learning <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

const LiveDemoSection: React.FC = () => {
  const [blocks, setBlocks] = useState<Block[]>(INITIAL_DEMO_BLOCKS);

  const handleBlockEdit = (index: number, newData: string) => {
    setBlocks(prev => {
      const newBlocks = [...prev];
      const block = { ...newBlocks[index], data: newData };

      // Recalculate hash (this will likely break the chain/validity)
      block.hash = calculateHash(block);
      newBlocks[index] = block;

      // Update subsequent blocks linkage (but don't fix their hashes automatically to show breakage)
      for (let i = index + 1; i < newBlocks.length; i++) {
        newBlocks[i] = { ...newBlocks[i], previousHash: newBlocks[i - 1].hash };
        // We do NOT recalculate hash here to demonstrate broken link unless mined
        // Actually, if previousHash changes, the block's current hash is now invalid relative to its content including prevHash
        // But in the simulation we usually want to show visual invalidity.
        // The ChainView checks if `hash === calculateHash(block)`.
        // If we only update previousHash, the old hash is definitely mismatching the new content (new prevHash).
        // So it will show as invalid.
      }

      return newBlocks;
    });
  };

  const handleBlockMine = (index: number) => {
    setBlocks(prev => {
      const newBlocks = [...prev];
      const block = { ...newBlocks[index] };

      // Mine the block
      const minedBlock = mineBlock(block, 2); // Difficulty 2 for quick demo
      newBlocks[index] = minedBlock;

      // Propagate correct hash to next block's previousHash
      if (index < newBlocks.length - 1) {
        newBlocks[index + 1] = { ...newBlocks[index + 1], previousHash: minedBlock.hash };
        // The next block is now invalid because its prevHash changed, so user must mine it too (or we could cascade, but interactive is better)
      }

      return newBlocks;
    });
  };

  return (
    <section className="py-24 px-4 bg-secondary-bg/30 relative border-y border-border/50">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-bold"
          >
            Try It Right Now
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-text-secondary text-lg"
          >
            Go ahead — try changing the data in <span className="text-accent font-semibold">Block #2</span> and watch what happens.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="bg-primary-bg/50 rounded-2xl p-6 border border-border shadow-2xl"
        >
          <ChainView
            blocks={blocks}
            onBlockEdit={handleBlockEdit}
            onBlockMine={handleBlockMine}
            difficulty={2}
          />
        </motion.div>
      </div>
    </section>
  );
};

const LearningPathSection: React.FC = () => {
  const { isModuleCompleted } = useProgressStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const pathLength = useSpring(scrollYProgress, { stiffness: 400, damping: 90 });

  // Generate path points dynamically based on screen width (simplified logic)
  // For simplicity in this demo, we'll use a fixed SVG path structure that scales
  // We'll arrange nodes in a winding snake pattern

  return (
    <section ref={containerRef} className="py-24 px-4 bg-primary-bg relative overflow-hidden">
      <div className="max-w-4xl mx-auto text-center mb-20 space-y-4">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl font-bold"
        >
          Your Learning Journey
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-text-secondary text-lg"
        >
          14 interactive modules. Zero prerequisites.
        </motion.p>
      </div>

      <div className="max-w-3xl mx-auto relative">
        {/* SVG Path Background */}
        <div className="absolute left-[20px] md:left-1/2 top-0 bottom-0 w-1 md:-translate-x-1/2 h-full z-0">
             {/* Vertical line for mobile / simple desktop view */}
            <motion.div
                className="w-1 bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500 h-full opacity-30"
                style={{ scaleY: pathLength, transformOrigin: 'top' }}
            />
        </div>

        <div className="space-y-12 relative z-10">
          {MODULES.map((module, index) => {
            const isCompleted = isModuleCompleted(module.id);
            const isLeft = index % 2 === 0;

            return (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`flex items-center ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'} flex-row gap-8`}
              >
                {/* Node Marker */}
                <div className="md:w-1/2 flex justify-end md:justify-center shrink-0">
                    {/* Placeholder for alignment */}
                </div>

                 {/* Center Line Marker */}
                <Link to={module.path} className="absolute left-[20px] md:left-1/2 -translate-x-1/2 z-20 group">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-300
                    ${isCompleted
                      ? 'bg-success border-success text-primary-bg shadow-[0_0_20px_rgba(34,197,94,0.5)]'
                      : 'bg-secondary-bg border-border group-hover:border-accent group-hover:scale-110 text-text-secondary'
                    }`}
                  >
                    {isCompleted ? <CheckCircle size={20} /> : <module.icon size={20} />}
                  </div>
                </Link>

                {/* Content Card */}
                <div className={`pl-16 md:pl-0 md:w-1/2 ${isLeft ? 'md:text-right md:pr-12' : 'md:text-left md:pl-12'} flex-1`}>
                    <Link to={module.path}>
                        <div className={`p-4 rounded-xl bg-secondary-bg/50 border border-border hover:border-accent/50 hover:bg-secondary-bg transition-all cursor-pointer group`}>
                            <h3 className="text-xl font-bold group-hover:text-accent transition-colors">{module.title}</h3>
                            <p className="text-sm text-text-tertiary mt-1">Module {index + 1}</p>
                        </div>
                    </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

const FeaturesSection: React.FC = () => {
  return (
    <section className="py-24 px-4 bg-secondary-bg/20">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
                icon={Globe}
                title="100% In Your Browser"
                description="No servers, no signups, no tracking. Everything runs locally in your browser."
                delay={0}
            />
            <FeatureCard
                icon={Wrench}
                title="Learn By Doing"
                description="Every concept has a hands-on simulation. Break things, mine blocks, send tokens."
                delay={0.1}
            />
            <FeatureCard
                icon={BookOpen}
                title="Simple Words"
                description="Toggle between beginner-friendly and technical explanations for every concept."
                delay={0.2}
            />
        </div>
      </div>
    </section>
  );
};

const FeatureCard: React.FC<{ icon: any, title: string, description: string, delay: number }> = ({ icon: Icon, title, description, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay }}
    >
        <Card className="h-full bg-secondary-bg/40 hover:bg-secondary-bg/60 transition-colors border-l-4 border-l-indigo-500">
            <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-4 rounded-full bg-indigo-500/10 text-indigo-400">
                    <Icon size={32} />
                </div>
                <h3 className="text-xl font-bold">{title}</h3>
                <p className="text-text-secondary">{description}</p>
            </div>
        </Card>
    </motion.div>
);

const Footer: React.FC = () => {
  return (
    <footer className="py-12 px-4 bg-[#050508] border-t border-white/5">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center space-x-2 text-text-secondary hover:text-white transition-colors">
            <Github size={20} />
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="font-medium">GitHub</a>
        </div>

        <div className="flex items-center space-x-4">
            <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold border border-indigo-500/20">
                Built with React + TypeScript
            </span>
        </div>

        <div className="text-text-tertiary text-sm">
            Made for learning. Not financial advice.
        </div>
      </div>
    </footer>
  );
};

const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-primary-bg text-text-primary selection:bg-indigo-500/30">
      <HeroSection />
      <LiveDemoSection />
      <LearningPathSection />
      <FeaturesSection />
      <Footer />
    </div>
  );
};

export default Landing;
