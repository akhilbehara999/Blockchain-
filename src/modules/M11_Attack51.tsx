import React, { useState, useEffect, useRef } from 'react';
import ModuleLayout from '../components/layout/ModuleLayout';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Zap, Play, Pause, RefreshCw, ShoppingCart, Truck, AlertTriangle, ArrowRight } from 'lucide-react';
import { Block } from '../engine/types';
import { createBlock } from '../engine/block';

const M11_Attack51: React.FC = () => {
  const [hashPower, setHashPower] = useState(20); // Attacker hash power %
  const [isSimulating, setIsSimulating] = useState(false);
  const [honestChain, setHonestChain] = useState<Block[]>([]);
  const [attackerChain, setAttackerChain] = useState<Block[]>([]);
  const [honestWork, setHonestWork] = useState(0);
  const [attackerWork, setAttackerWork] = useState(0);

  // Refs for work accumulation to avoid closure staleness in interval
  const honestWorkRef = useRef(0);
  const attackerWorkRef = useRef(0);

  // Walkthrough state
  const [walkthroughStep, setWalkthroughStep] = useState(0);
  const [isWalkthroughMode, setIsWalkthroughMode] = useState(false);

  // Constants
  const BLOCK_THRESHOLD = 100;

  useEffect(() => {
    // Initialize chains
    const genesis = createBlock(0, 'Genesis Block', '0', 1);
    setHonestChain([genesis]);
    setAttackerChain([genesis]);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isSimulating && !isWalkthroughMode) {
      interval = setInterval(() => {
        const attackerRate = hashPower * 0.5; // Scale for visual speed
        const honestRate = (100 - hashPower) * 0.5;

        // Update Refs
        honestWorkRef.current += honestRate;
        attackerWorkRef.current += attackerRate;

        // Check thresholds
        if (honestWorkRef.current >= BLOCK_THRESHOLD) {
          honestWorkRef.current = 0;
          addBlockToChain('honest');
        }

        if (attackerWorkRef.current >= BLOCK_THRESHOLD) {
          attackerWorkRef.current = 0;
          addBlockToChain('attacker');
        }

        // Sync UI
        setHonestWork(honestWorkRef.current);
        setAttackerWork(attackerWorkRef.current);

      }, 100);
    }

    return () => clearInterval(interval);
  }, [isSimulating, hashPower, isWalkthroughMode]);

  const addBlockToChain = (chainType: 'honest' | 'attacker') => {
    if (chainType === 'honest') {
      setHonestChain(prev => {
        const lastBlock = prev[prev.length - 1];
        const newBlock = createBlock(prev.length, `Block #${prev.length}`, lastBlock.hash, 1);
        return [...prev, newBlock];
      });
    } else {
      setAttackerChain(prev => {
        const lastBlock = prev[prev.length - 1];
        const newBlock = createBlock(prev.length, `Secret Block #${prev.length}`, lastBlock.hash, 1);
        return [...prev, newBlock];
      });
    }
  };

  const reset = () => {
    const genesis = createBlock(0, 'Genesis Block', '0', 1);
    setHonestChain([genesis]);
    setAttackerChain([genesis]);
    setHonestWork(0);
    setAttackerWork(0);
    honestWorkRef.current = 0;
    attackerWorkRef.current = 0;
    setIsSimulating(false);
    setIsWalkthroughMode(false);
    setWalkthroughStep(0);
  };

  const nextWalkthroughStep = () => {
    if (walkthroughStep === 0) {
      reset(); // Ensure clean state
      setIsWalkthroughMode(true);
      setIsSimulating(false);
      // Set hash power to > 50% for demo
      setHashPower(60);
    }

    const step = walkthroughStep + 1;
    setWalkthroughStep(step);

    // Execute logic based on step
    if (step === 1) {
      // Step 1: Attacker sends 100 coins to merchant (Honest Chain)
      const lastHonest = honestChain[honestChain.length - 1];
      const txBlock = createBlock(honestChain.length, 'Payment: 100 BTC -> Merchant', lastHonest.hash, 1);
      setHonestChain(prev => [...prev, txBlock]);

      // Attacker starts secret chain from BEFORE this block
      // (Already initialized to genesis, which is correct)
    } else if (step === 2) {
      // Step 2: Merchant delivers goods
      // Visual only
    } else if (step === 3) {
      // Step 3: Attacker secretly mines alternative chain
      // Add 2 blocks to attacker chain to overtake
      const lastAttacker = attackerChain[attackerChain.length - 1];
      const block1 = createBlock(attackerChain.length, 'Block with NO payment', lastAttacker.hash, 1);
      const block2 = createBlock(attackerChain.length + 1, 'Double Spend Block', block1.hash, 1);
      setAttackerChain(prev => [...prev, block1, block2]);
    } else if (step === 4) {
       // Step 4: Attacker chain becomes longer
       // Visual only
    } else if (step === 5) {
      // Step 5: Reorg
      setHonestChain([...attackerChain]);
    }
  };

  // Estimate cost (simplified: say $10k/hr for 100%)
  const costPerHour = (hashPower / 100) * 10000;

  return (
    <ModuleLayout moduleId="attack51" title="51% Attack" subtitle="The majority rule vulnerability">
      <div className="space-y-8">
        {/* Network Visualization */}
        <Card className="overflow-hidden">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6">
            <h3 className="font-bold text-lg">Network Hash Power Distribution</h3>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-blue-500 mr-2" />
                <span className="text-sm text-text-secondary">Honest ({100 - hashPower}%)</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-red-500 mr-2" />
                <span className="text-sm text-text-secondary">Attacker ({hashPower}%)</span>
              </div>
            </div>
          </div>

          <div className="relative h-32 bg-tertiary-bg/30 rounded-xl mb-6 flex items-center justify-center overflow-hidden">
             {/* Simple node visualization */}
             <div className="flex flex-wrap justify-center gap-4 max-w-2xl px-4">
                {Array.from({ length: 20 }).map((_, i) => {
                   const isAttacker = i < (hashPower / 100) * 20;
                   return (
                     <motion.div
                       layout
                       key={i}
                       initial={{ scale: 0 }}
                       animate={{
                         scale: 1,
                         backgroundColor: isAttacker ? '#EF4444' : '#3B82F6',
                       }}
                       className="w-4 h-4 rounded-full shadow-lg"
                     />
                   );
                })}
             </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>Attacker Hash Power</span>
              <span className="font-mono font-bold text-accent">{hashPower}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={hashPower}
              onChange={(e) => {
                setHashPower(parseInt(e.target.value));
                if (isWalkthroughMode) reset(); // Exit walkthrough if manually changing
              }}
              className="w-full h-2 bg-tertiary-bg rounded-lg appearance-none cursor-pointer accent-accent"
              disabled={isWalkthroughMode}
            />
            <div className="flex justify-between text-xs text-text-tertiary">
              <span>0%</span>
              <span>50% (Danger Zone)</span>
              <span>100%</span>
            </div>
          </div>
        </Card>

        {/* Controls */}
        <div className="flex flex-wrap gap-4">
           <Button
             variant={isSimulating ? "secondary" : "primary"}
             onClick={() => setIsSimulating(!isSimulating)}
             disabled={isWalkthroughMode}
           >
             {isSimulating ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
             {isSimulating ? "Pause Simulation" : "Start Simulation"}
           </Button>

           <Button variant="outline" onClick={reset}>
             <RefreshCw className="w-4 h-4 mr-2" />
             Reset
           </Button>

           <div className="ml-auto">
             <Button
               variant={isWalkthroughMode ? "danger" : "secondary"}
               onClick={nextWalkthroughStep}
               disabled={walkthroughStep >= 5}
             >
               {walkthroughStep === 0 && <ShieldAlert className="w-4 h-4 mr-2" />}
               {walkthroughStep > 0 && <ArrowRight className="w-4 h-4 mr-2" />}
               {walkthroughStep === 0 ? "Double Spend Walkthrough" :
                walkthroughStep === 5 ? "Attack Complete" : "Next Step"}
             </Button>
           </div>
        </div>

        {/* Walkthrough Instructions */}
        <AnimatePresence>
          {isWalkthroughMode && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-tertiary-bg p-4 rounded-xl border border-accent/20"
            >
              <h4 className="font-bold text-accent mb-2">Step {walkthroughStep}:
                {walkthroughStep === 1 && " Attacker sends payment"}
                {walkthroughStep === 2 && " Merchant confirms & delivers"}
                {walkthroughStep === 3 && " Secret mining"}
                {walkthroughStep === 4 && " Chain Race"}
                {walkthroughStep === 5 && " Reorganization (Attack Successful)"}
              </h4>
              <p className="text-sm text-text-secondary">
                {walkthroughStep === 1 && "The attacker broadcasts a transaction sending money to a merchant. It gets included in the honest chain (blue)."}
                {walkthroughStep === 2 && "The merchant sees the confirmed block and ships the product. The trade is 'done' in their eyes."}
                {walkthroughStep === 3 && "Meanwhile, the attacker uses their superior hash power to secretly mine a parallel chain (red) that DOES NOT include the payment."}
                {walkthroughStep === 4 && "Because the attacker has >51% hash power, their chain grows faster and eventually becomes longer than the honest chain."}
                {walkthroughStep === 5 && "Nodes always accept the longest chain. The network switches to the red chain. The payment to the merchant disappears!"}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chains Visualization */}
        <div className="grid grid-cols-1 gap-6">
           {/* Honest Chain */}
           <div className={`transition-opacity duration-500 ${walkthroughStep === 5 ? 'opacity-50 blur-sm' : 'opacity-100'}`}>
             <div className="flex justify-between items-center mb-2">
               <h4 className="font-bold text-blue-400">Honest Chain (Public)</h4>
               <span className="text-xs text-text-tertiary">Height: {honestChain.length}</span>
             </div>
             <div className="flex items-center space-x-2 overflow-x-auto pb-4 min-h-[100px]">
               {honestChain.map((block) => (
                 <motion.div
                   key={block.hash}
                   initial={{ opacity: 0, x: -20 }}
                   animate={{ opacity: 1, x: 0 }}
                   className="min-w-[80px] h-[80px] bg-blue-500/10 border border-blue-500/50 rounded-lg flex items-center justify-center flex-col p-2 text-center"
                 >
                   <span className="text-xs font-mono text-blue-300">#{block.index}</span>
                   {block.data.includes('Payment') && <ShoppingCart className="w-4 h-4 text-yellow-400 mt-1" />}
                 </motion.div>
               ))}
               {/* Progress Bar for next block */}
               {!isWalkthroughMode && isSimulating && (
                 <div className="w-2 h-20 bg-tertiary-bg rounded-full overflow-hidden relative">
                   <motion.div
                     className="absolute bottom-0 left-0 right-0 bg-blue-500"
                     style={{ height: `${(honestWork / BLOCK_THRESHOLD) * 100}%` }}
                   />
                 </div>
               )}
             </div>
           </div>

           {/* Attacker Chain */}
           <div className="relative">
             <div className="flex justify-between items-center mb-2">
               <h4 className="font-bold text-red-400">Attacker Chain (Secret)</h4>
               <span className="text-xs text-text-tertiary">Height: {attackerChain.length}</span>
             </div>
             <div className="flex items-center space-x-2 overflow-x-auto pb-4 min-h-[100px]">
               {attackerChain.map((block) => (
                 <motion.div
                   key={block.hash}
                   initial={{ opacity: 0, x: -20 }}
                   animate={{ opacity: 1, x: 0 }}
                   className="min-w-[80px] h-[80px] bg-red-500/10 border border-red-500/50 rounded-lg flex items-center justify-center flex-col p-2 text-center"
                 >
                   <span className="text-xs font-mono text-red-300">#{block.index}</span>
                   {block.data.includes('Double Spend') && <AlertTriangle className="w-4 h-4 text-red-500 mt-1" />}
                 </motion.div>
               ))}
               {!isWalkthroughMode && isSimulating && (
                 <div className="w-2 h-20 bg-tertiary-bg rounded-full overflow-hidden relative">
                   <motion.div
                     className="absolute bottom-0 left-0 right-0 bg-red-500"
                     style={{ height: `${(attackerWork / BLOCK_THRESHOLD) * 100}%` }}
                   />
                 </div>
               )}
             </div>

             {/* Overtake Warning */}
             {attackerChain.length > honestChain.length && (
               <motion.div
                 initial={{ opacity: 0, scale: 0.8 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className="absolute top-0 right-0 bg-red-500/20 text-red-500 px-3 py-1 rounded-full text-xs font-bold border border-red-500/50 flex items-center"
               >
                 <AlertTriangle className="w-3 h-3 mr-1" />
                 ATTACKER CHAIN LONGER
               </motion.div>
             )}
           </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card title="Attack Cost Estimate">
            <div className="text-3xl font-bold text-text-primary mb-2">
              ~${costPerHour.toLocaleString()}<span className="text-sm text-text-secondary font-normal">/hr</span>
            </div>
            <p className="text-xs text-text-secondary">
              Estimated energy cost to maintain {hashPower}% hash rate.
              {hashPower > 50
                ? " Extremely expensive for large networks like Bitcoin, but feasible for small altcoins."
                : " Currently insufficient to attack the network."}
            </p>
          </Card>

          <Card title="Mechanism">
            <p className="text-sm text-text-secondary leading-relaxed">
              If an entity controls more than 50% of the network's computing power, they can mine blocks faster than the rest of the network combined. This allows them to rewrite history (reorg) and double-spend coins.
            </p>
          </Card>
        </div>
      </div>
    </ModuleLayout>
  );
};

export default M11_Attack51;
