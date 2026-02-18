import React, { useState, useEffect } from 'react';
import { useBlockchainStore } from '../../../stores/useBlockchainStore';
import { useForkStore } from '../../../stores/useForkStore';
import { backgroundEngine } from '../../../engine/BackgroundEngine';
import { createBlock, mineBlock } from '../../../engine/block';
import ForkVisualizer from '../../consensus/ForkVisualizer';
import Card from '../../ui/Card';
import Button from '../../ui/Button';
import Badge from '../../ui/Badge';
import Slider from '../../ui/Slider';
import { motion, AnimatePresence } from 'framer-motion';
import { GitBranch, AlertTriangle, ArrowRight, RefreshCcw, CheckCircle, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Step7_Consensus: React.FC = () => {
  const navigate = useNavigate();
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
    const currentHead = blocks[blocks.length - 1];
    const userBlockData = "Mined by Miner_A\nTx: YOU -> Merchant (5.0)";
    const userBlock = createBlock(currentHead.index + 1, userBlockData, currentHead.hash, difficulty);
    mineBlock(userBlock, difficulty);

    addBlock(userBlock.data); // This adds it to the main chain in store
    setReorgStatus('confirmed');

    // 2. Wait 3 seconds then REORG
    await new Promise(r => setTimeout(r, 3000));

    // 3. Create Competing Chain (Longer)
    const compBlock1 = createBlock(currentHead.index + 1, "Mined by Miner_B\nTx: Other->Person (1.0)", currentHead.hash, difficulty);
    mineBlock(compBlock1, difficulty);

    const compBlock2 = createBlock(compBlock1.index + 1, "Mined by Miner_B\nTx: Rich->Poor (100.0)", compBlock1.hash, difficulty);
    mineBlock(compBlock2, difficulty);

    // Construct the new chain array
    const latestBlocks = useBlockchainStore.getState().blocks;
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
    if (confs === 1) return { prob: '~25%', color: 'text-status-error', label: 'RISKY', badge: 'error' };
    if (confs === 2) return { prob: '~12%', color: 'text-status-warning', label: 'RISKY', badge: 'warning' };
    if (confs === 3) return { prob: '~5%', color: 'text-status-warning', label: 'MODERATE', badge: 'warning' };
    if (confs < 6) return { prob: '< 1%', color: 'text-brand-500', label: 'OKAY', badge: 'info' };
    return { prob: '< 0.01%', color: 'text-status-valid', label: 'SAFE', badge: 'success' };
  };

  const prob = getReorgProbability(sliderValue);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-24">
      <div className="text-center space-y-4 animate-fade-up">
        <Badge variant="info">Step 7 of 8</Badge>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
          When the Network Disagrees
        </h1>
        <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
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
            <Card variant="glass" className="p-8">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400">
                  <GitBranch className="w-8 h-8" />
                </div>
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">What happens when two miners find a block at the same time?</h2>
                  <div className="space-y-4 text-lg text-gray-600 dark:text-gray-300">
                    <p>The network doesn't know which one is "right." Different nodes see different blocks first.</p>
                    <p className="font-bold text-gray-900 dark:text-white">For a brief moment, there are TWO truths. Two versions of history.</p>
                    <p>This is called a <span className="text-blue-600 dark:text-blue-400 font-bold">FORK</span>.</p>
                  </div>
                </div>
              </div>
            </Card>

            <div className="flex justify-center pt-4">
              <Button
                onClick={() => setSection(2)}
                size="lg"
                icon={<ArrowRight className="w-5 h-5" />}
              >
                Start Experiment
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
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Live Fork Simulation</h2>
                {simulationStatus === 'idle' && (
                    <Button onClick={runForkSimulation} icon={<GitBranch className="w-4 h-4"/>}>
                        Trigger Fork
                    </Button>
                )}
            </div>

            <Card variant="elevated" className="min-h-[300px] flex flex-col justify-center">
                <ForkVisualizer />
                {simulationStatus === 'running' && (
                    <div className="text-center text-gray-500 mt-4 animate-pulse">
                        Simulating network propagation and mining...
                    </div>
                )}
            </Card>

            {simulationStatus === 'completed' && (
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                >
                    <Card variant="default" status="valid" className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Fork Resolved!</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                The network followed the <strong>Longest Chain</strong> (Chain A).<br/>
                                Chain B's blocks were orphaned and discarded.
                            </p>
                        </div>
                        <Button
                            onClick={() => setSection(4)}
                            variant="success"
                            icon={<ArrowRight className="w-4 h-4" />}
                        >
                            Next: Get Hurt
                        </Button>
                    </Card>
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
            <div className="text-center max-w-2xl mx-auto space-y-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Now it's YOUR turn.</h2>
                <p className="text-gray-600 dark:text-gray-400">
                    You are going to send a transaction, see it get confirmed, and then watch it disappear.
                </p>
            </div>

            <Card variant="elevated" className="max-w-md mx-auto relative overflow-hidden">
                {reorgStatus === 'reorged' && (
                    <div className="absolute inset-0 bg-red-500/20 backdrop-blur-sm z-10 flex items-center justify-center">
                        <div className="bg-red-600 text-white p-6 rounded-xl shadow-2xl text-center transform rotate-[-2deg] border-4 border-white dark:border-gray-900">
                            <AlertTriangle className="w-12 h-12 mx-auto mb-2" />
                            <h3 className="text-2xl font-black">CHAIN REORG!</h3>
                            <p className="font-medium opacity-90">Block Replaced</p>
                        </div>
                    </div>
                )}

                <h3 className="text-lg font-bold mb-6 flex items-center text-gray-900 dark:text-white">
                    <span className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mr-3 text-sm font-bold">You</span>
                    Send Payment
                </h3>

                <div className="space-y-4">
                    <div className="bg-surface-tertiary dark:bg-surface-dark-tertiary p-4 rounded-xl flex justify-between items-center border border-surface-border dark:border-surface-dark-border">
                        <span className="text-gray-500 font-medium">To:</span>
                        <span className="font-mono text-sm font-bold text-gray-900 dark:text-white">Merchant_Store</span>
                    </div>
                    <div className="bg-surface-tertiary dark:bg-surface-dark-tertiary p-4 rounded-xl flex justify-between items-center border border-surface-border dark:border-surface-dark-border">
                        <span className="text-gray-500 font-medium">Amount:</span>
                        <span className="font-mono text-xl font-bold text-gray-900 dark:text-white">5.00 YUP</span>
                    </div>

                    {reorgStatus === 'idle' ? (
                        <Button
                            onClick={runReorgSimulation}
                            fullWidth
                            size="lg"
                        >
                            Send 5.00 YUP
                        </Button>
                    ) : (
                        <div className="text-center py-4 space-y-2">
                             {reorgStatus === 'pending' && <span className="text-yellow-600 dark:text-yellow-400 font-bold flex items-center justify-center animate-pulse"><RefreshCcw className="animate-spin w-4 h-4 mr-2"/> Mining...</span>}
                             {reorgStatus === 'confirmed' && <span className="text-green-600 dark:text-green-400 font-bold flex items-center justify-center"><CheckCircle className="w-5 h-5 mr-2"/> Confirmed in Block #{blocks[blocks.length-1]?.index}</span>}
                             {reorgStatus === 'reorged' && <span className="text-red-600 dark:text-red-400 font-bold flex items-center justify-center"><AlertTriangle className="w-5 h-5 mr-2"/> Transaction Lost</span>}
                        </div>
                    )}
                </div>
            </Card>

            {reorgStatus === 'reorged' && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                >
                    <Card variant="outlined" status="error" className="flex flex-col md:flex-row gap-6 items-start">
                        <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full shrink-0 text-red-600 dark:text-red-400">
                            <AlertTriangle className="w-8 h-8" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-red-700 dark:text-red-400 mb-2">Your transaction was reversed!</h3>
                            <p className="text-gray-600 dark:text-gray-300">
                                Your transaction was confirmed in Block #{useBlockchainStore.getState().blocks.length}, but that block was just <strong>replaced</strong> by a longer chain that didn't include your transaction.
                            </p>
                            <p className="text-gray-500 dark:text-gray-400 mt-4 text-sm italic border-l-4 border-gray-300 dark:border-gray-700 pl-4 py-1">
                                "This is why exchanges make you wait for confirmations."
                            </p>
                        </div>
                        <div className="self-end">
                             <Button
                                onClick={() => setSection(5)}
                                variant="danger"
                                icon={<Shield className="w-4 h-4"/>}
                             >
                                Next: How to Stay Safe
                            </Button>
                        </div>
                    </Card>
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
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">The "6 Confirmations" Rule</h2>
                <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                    The deeper a block gets in the chain, the harder it is to replace.
                    Use the slider to see how safe your transaction is over time.
                </p>
            </div>

            <Card variant="elevated" className="max-w-2xl mx-auto p-8">
                <div className="mb-10 text-center">
                    <div className={`text-6xl font-black mb-2 transition-colors duration-300 ${prob.color}`}>
                        {sliderValue}
                    </div>
                    <div className="text-sm uppercase tracking-widest text-gray-500 font-bold">Confirmations</div>
                </div>

                <div className="space-y-10">
                    <Slider
                        min={1}
                        max={10}
                        step={1}
                        value={sliderValue}
                        onChange={setSliderValue}
                    />

                    <div className="grid grid-cols-2 gap-4 text-center">
                        <div className="p-4 bg-surface-tertiary dark:bg-surface-dark-tertiary rounded-xl border border-surface-border dark:border-surface-dark-border">
                            <div className="text-xs text-gray-500 mb-2 uppercase font-bold">Reorg Probability</div>
                            <div className={`text-2xl font-bold ${prob.color}`}>{prob.prob}</div>
                        </div>
                        <div className="p-4 bg-surface-tertiary dark:bg-surface-dark-tertiary rounded-xl border border-surface-border dark:border-surface-dark-border">
                            <div className="text-xs text-gray-500 mb-2 uppercase font-bold">Safety Level</div>
                            <div className={`text-2xl font-bold ${prob.color}`}>{prob.label}</div>
                        </div>
                    </div>
                </div>
            </Card>

            <div className="flex justify-center pt-8">
                <Button
                    onClick={() => navigate('/journey/8')}
                    size="lg"
                    variant="success"
                    icon={<CheckCircle className="w-5 h-5" />}
                >
                    Continue to Step 8
                </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Step7_Consensus;
