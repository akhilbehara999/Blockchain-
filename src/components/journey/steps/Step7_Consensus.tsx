import React, { useState, useEffect } from 'react';
import { useProgress } from '../../../context/ProgressContext';
import { useBlockchainStore } from '../../../stores/useBlockchainStore';
import { useForkStore } from '../../../stores/useForkStore';
import { backgroundEngine } from '../../../engine/BackgroundEngine';
import { createBlock, mineBlock } from '../../../engine/block';
import ForkVisualizer from '../../consensus/ForkVisualizer';
import Card from '../../ui/Card';
import Button from '../../ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { GitBranch, AlertTriangle, ArrowRight, RefreshCcw, CheckCircle } from 'lucide-react';
import Slider from '../../ui/Slider';

const Step7_Consensus: React.FC = () => {
  const { completeStep } = useProgress();
  const { blocks, replaceChain, addBlock } = useBlockchainStore();
  const { startFork, addBlockToFork, resolveFork, triggerReorg, reset: resetFork } = useForkStore();

  const [section, setSection] = useState<number>(1);
  const [simulationStatus, setSimulationStatus] = useState<'idle' | 'running' | 'completed'>('idle');
  const [reorgStatus, setReorgStatus] = useState<'idle' | 'pending' | 'confirmed' | 'reorged'>('idle');
  const [sliderValue, setSliderValue] = useState<number>(1);

  // Stop background engine on mount, restart on unmount
  useEffect(() => {
    if (backgroundEngine.isRunning()) {
      backgroundEngine.stop();
    }
    return () => {
      // Only restart if we're not unmounting due to completion navigation (optional, but good practice)
      // Actually, standard behavior is to restart it when leaving the step context usually
      if (!backgroundEngine.isRunning()) {
         backgroundEngine.start();
      }
      resetFork();
    };
  }, []);

  // --- Section 2 & 3: Fork Simulation ---
  const runForkSimulation = async () => {
    if (simulationStatus === 'running') return;
    setSimulationStatus('running');
    resetFork();

    const currentHead = blocks[blocks.length - 1];
    const difficulty = 2; // Keep it low for speed

    // 1. Create two competing blocks at same height
    const blockA = createBlock(currentHead.index + 1, "Mined by Alice\nTx: Alice->Bob (5)", currentHead.hash, difficulty);
    mineBlock(blockA, difficulty);

    const blockB = createBlock(currentHead.index + 1, "Mined by Bob\nTx: Bob->Charlie (2)", currentHead.hash, difficulty);
    mineBlock(blockB, difficulty);

    // Start Fork Visualization
    startFork(currentHead.index, blockA, blockB);

    // 2. Extend Chain A (Alice) - Wait 2s
    await new Promise(r => setTimeout(r, 2000));
    const blockA2 = createBlock(blockA.index + 1, "Mined by Alice\nTx: Dave->Eve (1)", blockA.hash, difficulty);
    mineBlock(blockA2, difficulty);
    addBlockToFork('A', blockA2);

    // 3. Extend Chain A again (Longest) - Wait 2s
    await new Promise(r => setTimeout(r, 2000));
    const blockA3 = createBlock(blockA2.index + 1, "Mined by Alice\nTx: Frank->Grace (3)", blockA2.hash, difficulty);
    mineBlock(blockA3, difficulty);
    addBlockToFork('A', blockA3);

    // 4. Extend Chain B (Bob) - Wait 1s
    await new Promise(r => setTimeout(r, 1000));
    const blockB2 = createBlock(blockB.index + 1, "Mined by Bob\nTx: Heidi->Ivan (4)", blockB.hash, difficulty);
    mineBlock(blockB2, difficulty);
    addBlockToFork('B', blockB2);

    // 5. Resolution - Wait 2s
    await new Promise(r => setTimeout(r, 2000));
    resolveFork('A', [blockB, blockB2]);
    setSimulationStatus('completed');
  };

  // --- Section 4: Reorg Simulation ---
  const runReorgSimulation = async () => {
    if (reorgStatus !== 'idle') return;
    setReorgStatus('pending');

    const difficulty = 2;

    // 1. User Transaction
    // Mine Block with User Tx (Chain A)
    const currentHead = blocks[blocks.length - 1];
    const userBlockData = "Mined by Miner_A\nTx: YOU -> Merchant (5.0)";
    const userBlock = createBlock(currentHead.index + 1, userBlockData, currentHead.hash, difficulty);
    mineBlock(userBlock, difficulty);

    addBlock(userBlock.data); // This adds it to the main chain in store
    setReorgStatus('confirmed');

    // 2. Wait 3 seconds then REORG
    await new Promise(r => setTimeout(r, 3000));

    // 3. Create Competing Chain (Longer)
    // It must branch from BEFORE userBlock
    // So parent is currentHead
    const compBlock1 = createBlock(currentHead.index + 1, "Mined by Miner_B\nTx: Other->Person (1.0)", currentHead.hash, difficulty);
    mineBlock(compBlock1, difficulty);

    const compBlock2 = createBlock(compBlock1.index + 1, "Mined by Miner_B\nTx: Rich->Poor (100.0)", compBlock1.hash, difficulty);
    mineBlock(compBlock2, difficulty);

    // Construct the new chain array
    // We need the whole chain up to currentHead, plus compBlock1, compBlock2
    // userBlock is REMOVED

    // Let's get the latest chain from store just in case
    const latestBlocks = useBlockchainStore.getState().blocks;
    // latestBlocks should contain userBlock at the end
    // We want everything BEFORE userBlock
    const chainBeforeFork = latestBlocks.slice(0, latestBlocks.length - 1);

    const newChain = [...chainBeforeFork, compBlock1, compBlock2];

    // 4. Execute Reorg
    replaceChain(newChain);

    triggerReorg({
        blocksReplaced: 1,
        txsReturned: 1,
        oldChain: [userBlock],
        newChain: [compBlock1, compBlock2]
    });

    setReorgStatus('reorged');
  };

  const getReorgProbability = (confs: number) => {
    if (confs === 1) return { prob: '~25%', color: 'text-red-500', label: 'RISKY' };
    if (confs === 2) return { prob: '~12%', color: 'text-orange-500', label: 'RISKY' };
    if (confs === 3) return { prob: '~5%', color: 'text-yellow-500', label: 'MODERATE' };
    if (confs < 6) return { prob: '< 1%', color: 'text-lime-500', label: 'OKAY' };
    return { prob: '< 0.01%', color: 'text-green-500', label: 'SAFE' };
  };

  const prob = getReorgProbability(sliderValue);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 pb-24">
      <div className="text-center space-y-2 mb-12">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
          When the Network Disagrees
        </h1>
        <p className="text-text-secondary text-lg">
          Forks aren't attacks. They're growing pains.
        </p>
      </div>

      <AnimatePresence mode='wait'>
        {/* SECTION 1: THE HOOK */}
        {section === 1 && (
          <motion.div
            key="section1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <Card className="p-8 border-l-4 border-blue-500 bg-blue-500/5">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-blue-500/20 rounded-full">
                  <GitBranch className="w-8 h-8 text-blue-400" />
                </div>
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-blue-100">What happens when two miners find a block at the same time?</h2>
                  <div className="space-y-2 text-lg text-text-secondary">
                    <p>The network doesn't know which one is "right."</p>
                    <p>Different nodes see different blocks first.</p>
                    <p className="font-semibold text-white">For a brief moment, there are TWO truths. Two versions of history.</p>
                    <p>This is called a <span className="text-blue-400 font-bold">FORK</span>.</p>
                  </div>
                </div>
              </div>
            </Card>

            <div className="flex justify-center pt-4">
              <Button
                onClick={() => setSection(2)}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-xl shadow-lg shadow-blue-900/20"
              >
                Start Experiment <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* SECTION 2 & 3: WATCH FORK */}
        {(section === 2 || section === 3) && (
          <motion.div
            key="section2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Live Fork Simulation</h2>
                {simulationStatus === 'idle' && (
                    <Button onClick={runForkSimulation} variant="primary">
                        Trigger Fork
                    </Button>
                )}
            </div>

            <ForkVisualizer />

            {simulationStatus === 'running' && (
                <div className="text-center text-text-secondary animate-pulse">
                    Simulating network propagation and mining...
                </div>
            )}

            {simulationStatus === 'completed' && (
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="bg-success/10 border border-success/30 p-6 rounded-xl flex items-center justify-between"
                >
                    <div>
                        <h3 className="text-lg font-bold text-success mb-1">Fork Resolved!</h3>
                        <p className="text-sm text-text-secondary">
                            The network followed the <strong>Longest Chain</strong> (Chain A).<br/>
                            Chain B's blocks were orphaned and discarded.
                        </p>
                    </div>
                    <Button
                        onClick={() => setSection(4)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                        variant="primary" // Overridden by className, but keeps TS happy
                    >
                        Next: Get Hurt <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                </motion.div>
            )}
          </motion.div>
        )}

        {/* SECTION 4: GET HURT */}
        {section === 4 && (
          <motion.div
            key="section4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <div className="text-center max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold mb-2">Now it's YOUR turn.</h2>
                <p className="text-text-secondary">
                    You are going to send a transaction, see it get confirmed, and then watch it disappear.
                </p>
            </div>

            <Card className="max-w-md mx-auto p-6 bg-secondary-bg border-border relative overflow-hidden">
                {reorgStatus === 'reorged' && (
                    <div className="absolute inset-0 bg-danger/10 z-10 flex items-center justify-center backdrop-blur-[2px]">
                        <div className="bg-danger/90 text-white p-4 rounded-lg shadow-xl text-center transform rotate-[-2deg]">
                            <AlertTriangle className="w-12 h-12 mx-auto mb-2" />
                            <h3 className="text-xl font-bold">CHAIN REORG!</h3>
                            <p className="text-sm opacity-90">Block Replaced</p>
                        </div>
                    </div>
                )}

                <h3 className="text-lg font-bold mb-4 flex items-center">
                    <span className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center mr-3 text-sm">You</span>
                    Send Payment
                </h3>

                <div className="space-y-4">
                    <div className="bg-tertiary-bg p-3 rounded-lg flex justify-between items-center">
                        <span className="text-text-secondary">To:</span>
                        <span className="font-mono text-sm">Merchant_Store</span>
                    </div>
                    <div className="bg-tertiary-bg p-3 rounded-lg flex justify-between items-center">
                        <span className="text-text-secondary">Amount:</span>
                        <span className="font-mono text-xl font-bold">5.00 YUP</span>
                    </div>

                    {reorgStatus === 'idle' ? (
                        <Button
                            onClick={runReorgSimulation}
                            className="w-full"
                            variant="primary"
                            size="lg"
                        >
                            Send 5.00 YUP
                        </Button>
                    ) : (
                        <div className="text-center py-2 space-y-2">
                             {reorgStatus === 'pending' && <span className="text-yellow-500 flex items-center justify-center"><RefreshCcw className="animate-spin w-4 h-4 mr-2"/> Mining...</span>}
                             {reorgStatus === 'confirmed' && <span className="text-green-500 flex items-center justify-center"><CheckCircle className="w-4 h-4 mr-2"/> Confirmed in Block #{blocks[blocks.length-1]?.index}</span>}
                             {reorgStatus === 'reorged' && <span className="text-danger font-bold flex items-center justify-center"><AlertTriangle className="w-4 h-4 mr-2"/> Transaction Lost</span>}
                        </div>
                    )}
                </div>
            </Card>

            {reorgStatus === 'reorged' && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                    className="bg-danger/5 border border-danger/20 p-6 rounded-xl space-y-4"
                >
                    <div className="flex items-start space-x-4">
                        <AlertTriangle className="w-8 h-8 text-danger flex-shrink-0 mt-1" />
                        <div>
                            <h3 className="text-lg font-bold text-danger">Your transaction was reversed!</h3>
                            <p className="text-text-secondary mt-1">
                                Your transaction was confirmed in Block #{useBlockchainStore.getState().blocks.length}, but that block was just <strong>replaced</strong> by a longer chain that didn't include your transaction.
                            </p>
                            <p className="text-text-secondary mt-2 text-sm italic">
                                "This is why exchanges make you wait for confirmations."
                            </p>
                        </div>
                    </div>
                    <div className="flex justify-end">
                         <Button
                            onClick={() => setSection(5)}
                            variant="danger"
                         >
                            Next: How to Stay Safe <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                    </div>
                </motion.div>
            )}
          </motion.div>
        )}

        {/* SECTION 5: VISUALIZATION */}
        {section === 5 && (
          <motion.div
            key="section5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <div className="text-center space-y-4">
                <h2 className="text-2xl font-bold">The "6 Confirmations" Rule</h2>
                <p className="text-text-secondary max-w-2xl mx-auto">
                    The deeper a block gets in the chain, the harder it is to replace.
                    Use the slider to see how safe your transaction is over time.
                </p>
            </div>

            <Card className="p-8 max-w-2xl mx-auto bg-secondary-bg">
                <div className="mb-8 text-center">
                    <div className={`text-6xl font-black mb-2 transition-colors duration-300 ${prob.color}`}>
                        {sliderValue}
                    </div>
                    <div className="text-sm uppercase tracking-widest text-text-secondary">Confirmations</div>
                </div>

                <div className="space-y-8">
                    <Slider
                        min={1}
                        max={10}
                        step={1}
                        value={sliderValue}
                        onChange={setSliderValue}
                    />

                    <div className="grid grid-cols-2 gap-4 text-center">
                        <div className="p-4 bg-tertiary-bg rounded-lg">
                            <div className="text-xs text-text-secondary mb-1">Reorg Probability</div>
                            <div className={`text-xl font-bold ${prob.color}`}>{prob.prob}</div>
                        </div>
                        <div className="p-4 bg-tertiary-bg rounded-lg">
                            <div className="text-xs text-text-secondary mb-1">Safety Level</div>
                            <div className={`text-xl font-bold ${prob.color}`}>{prob.label}</div>
                        </div>
                    </div>
                </div>
            </Card>

            <div className="flex justify-center pt-8">
                <Button
                    onClick={() => completeStep(7)}
                    size="lg"
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-xl shadow-lg shadow-green-900/20"
                >
                    Complete Step 7 <CheckCircle className="ml-2 w-6 h-6" />
                </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Step7_Consensus;
