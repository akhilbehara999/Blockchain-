import React, { useState, useEffect, useRef } from 'react';
import { useProgress } from '../../../context/ProgressContext';
import { Block } from '../../../engine/types';
import { sha256 } from '../../../engine/hash';
import Card from '../../ui/Card';
import Button from '../../ui/Button';
import Badge from '../../ui/Badge';
import Hash from '../../ui/Hash';
import { useInView } from '../../../hooks/useInView';
import { useNavigate } from 'react-router-dom';
import { Link, ArrowRight, ArrowDown, Check, X, Lock, RefreshCw, AlertTriangle, FileText } from 'lucide-react';

interface ChainBlock extends Block {
  isSealed: boolean;
  status: 'valid' | 'invalid' | 'broken_link';
}

const Step4_Chain: React.FC = () => {
  const { completeStep } = useProgress();
  const navigate = useNavigate();

  // State
  const [blocks, setBlocks] = useState<ChainBlock[]>([]);
  const [phase, setPhase] = useState<'intro' | 'build' | 'tamper' | 'fix' | 'complete'>('intro');
  const [tamperStep, setTamperStep] = useState(0);

  // InView hooks
  const [headerRef, headerVisible] = useInView({ threshold: 0.1 });
  const [storyRef, storyVisible] = useInView({ threshold: 0.1 });
  const [chainRef, chainVisible] = useInView({ threshold: 0.1 });
  const [tamperRef, tamperVisible] = useInView({ threshold: 0.1 });
  const [fixRef, fixVisible] = useInView({ threshold: 0.1 });
  const [completionRef, completionVisible] = useInView({ threshold: 0.1 });

  // Scroll ref for auto-scrolling
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Calculate Hash Helper
  const calculateBlockHash = (block: Block): string => {
    return sha256(block.index.toString() + block.previousHash + block.timestamp.toString() + block.data + block.nonce.toString());
  };

  // Helper to create a new block
  const createNewBlock = (index: number, previousHash: string): ChainBlock => {
    const timestamp = Date.now();
    const data = index === 0 ? 'Genesis Block' : `Block ${index + 1} Data`;
    const tempBlock: Block = {
      index,
      timestamp,
      data,
      previousHash,
      nonce: 0,
      hash: '',
    };
    const hash = calculateBlockHash(tempBlock);

    return {
      ...tempBlock,
      hash,
      isSealed: true,
      status: 'valid' as const,
    };
  };

  // Build Phase: Add Block
  const addBlock = () => {
    const index = blocks.length;
    let prevHash = '0'.repeat(64);
    if (index > 0) {
        prevHash = blocks[index - 1].hash;
    }

    const newBlock = createNewBlock(index, prevHash);
    setBlocks(prev => [...prev, newBlock]);

    // Scroll to right
    setTimeout(() => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({ left: scrollContainerRef.current.scrollWidth, behavior: 'smooth' });
        }
    }, 100);

    // Automatically advance phase if 3 blocks built
    if (index === 2) {
      setTimeout(() => {
        setPhase('tamper');
      }, 1000);
    }
  };

  // Update block data
  const updateBlockData = (index: number, newData: string) => {
    const newBlocks = [...blocks];
    const block = newBlocks[index];
    block.data = newData;

    // Recalculate current hash
    const tempBlock: Block = {
      ...block,
      hash: '', // Placeholder to prevent circular dep in hash calculation if we used block object fully, but calculateBlockHash uses explicit fields
    };
    block.hash = calculateBlockHash(tempBlock);

    // Check validity
    // For simplicity in this visualizer, any change marks it invalid/unsealed until re-mined
    if (block.isSealed) {
      block.isSealed = false;
      block.status = 'invalid';
      if (phase === 'tamper' && index === 1 && tamperStep === 0) {
        setTamperStep(1);
        setTimeout(() => {
           setTamperStep(2);
        }, 500);
      }
    } else {
      block.status = 'valid';
      if (block.isSealed) { // Should not happen if unsealed
          setTamperStep(0);
      }
    }

    setBlocks(newBlocks);
  };

  // Check for broken links
  useEffect(() => {
    let updated = false;
    const newBlocks = [...blocks];

    for (let i = 1; i < newBlocks.length; i++) {
       const prevBlock = newBlocks[i-1];
       const currBlock = newBlocks[i];

       if (currBlock.previousHash !== prevBlock.hash) {
         // Link is broken!
         if (currBlock.status !== 'broken_link') {
            currBlock.status = 'broken_link';
            updated = true;
         }
       } else {
         // If link is valid, check if block itself is valid (internal seal)
         if (!currBlock.isSealed) {
            if (currBlock.status !== 'invalid') {
                currBlock.status = 'invalid';
                updated = true;
            }
         } else {
            // Only valid if both link and seal are good
            if (currBlock.status !== 'valid') {
                currBlock.status = 'valid';
                updated = true;
            }
         }
       }
    }

    if (updated) {
       setBlocks(newBlocks);
    }

    if (phase === 'tamper' && tamperStep === 2) {
       setPhase('fix');
    }

    if (phase === 'fix') {
       const allValid = newBlocks.every(b => b.status === 'valid');
       if (allValid && newBlocks.length === 3) {
          setPhase('complete');
          completeStep(4);
       }
    }
  }, [blocks, phase, tamperStep, completeStep]);

  // Fix Action: Re-seal
  const sealBlock = (index: number) => {
     const newBlocks = [...blocks];
     const block = newBlocks[index];
     block.isSealed = true;
     // Status update happens in useEffect
     setBlocks(newBlocks);
  };

  const fixLink = (index: number) => {
     if (index === 0) return;
     const newBlocks = [...blocks];
     const prevBlock = newBlocks[index - 1];
     const currBlock = newBlocks[index];

     currBlock.previousHash = prevBlock.hash;
     currBlock.isSealed = false; // Changing prevHash breaks the seal

     // Recalculate because body changed
     const tempBlock: Block = {
        ...currBlock,
        hash: '',
     };
     currBlock.hash = calculateBlockHash(tempBlock);

     setBlocks(newBlocks);
  };

  return (
    <div className="space-y-12 md:space-y-16 pb-20">

      {/* SECTION 1 — HEADER */}
      <div ref={headerRef} className={`space-y-4 ${headerVisible ? 'animate-fade-up' : 'opacity-0'}`}>
        <Badge variant="info">Step 4 of 8</Badge>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">The Chain That Cannot Lie</h1>
        <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl">
          One block is just a sealed envelope. But what happens if we chain them together?
        </p>
      </div>

      {/* SECTION 2 — STORY */}
      <div ref={storyRef} className={storyVisible ? 'animate-fade-up' : 'opacity-0'}>
        <Card variant="glass" className="max-w-prose">
          <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300">
             We make each block include the <b>hash of the previous block</b>.
             This creates an unbreakable chain. If you change a block in the past, its hash changes.
             <br/><br/>
             It's a domino effect that alerts the whole network.
          </p>
          {phase === 'intro' && (
              <Button onClick={() => setPhase('build')} className="mt-6" icon={<ArrowRight className="w-4 h-4"/>}>
                  Start Building the Chain
              </Button>
          )}
        </Card>
      </div>

      {/* SECTION 3 — CHAIN VISUALIZER */}
      {phase !== 'intro' && (
        <div ref={chainRef} className={chainVisible ? 'animate-fade-up' : 'opacity-0'}>
           <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Link className="w-6 h-6 text-brand-500" />
                The Blockchain
              </h2>
              {phase === 'build' && blocks.length < 3 && (
                 <Button size="sm" onClick={addBlock} icon={<Link className="w-4 h-4"/>}>
                    Add Block {blocks.length + 1}
                 </Button>
              )}
           </div>

           {/* Scrollable Container */}
           <div
                ref={scrollContainerRef}
                className="flex flex-col md:flex-row gap-4 items-start overflow-x-auto pb-6 px-2 -mx-2 snap-x"
           >
              {blocks.map((block, i) => (
                 <React.Fragment key={block.index}>
                    {/* Arrow */}
                    {i > 0 && (
                       <div className="hidden md:flex flex-col justify-center items-center self-center text-gray-400 dark:text-gray-600 px-2 shrink-0">
                          <ArrowRight className={`w-8 h-8 ${block.status === 'broken_link' ? 'text-status-error animate-pulse' : ''}`} />
                       </div>
                    )}
                    {/* Mobile Arrow */}
                    {i > 0 && (
                       <div className="md:hidden flex justify-center w-full py-2 text-gray-400 dark:text-gray-600">
                          <ArrowDown className={`w-8 h-8 ${block.status === 'broken_link' ? 'text-status-error animate-pulse' : ''}`} />
                       </div>
                    )}

                    {/* Block Card */}
                    <Card
                        variant="elevated"
                        className={`min-w-full md:min-w-[320px] max-w-full md:max-w-[320px] snap-center transition-all duration-300 ${
                            block.status === 'valid' ? 'border-status-valid' :
                            block.status === 'broken_link' ? 'border-status-error shadow-red-500/20' :
                            'border-status-warning shadow-yellow-500/20'
                        }`}
                        status={block.status === 'valid' ? 'valid' : block.status === 'broken_link' ? 'error' : 'warning'}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <span className="font-mono font-bold text-sm">BLOCK #{block.index + 1}</span>
                            {block.status === 'valid' ? <Check className="w-4 h-4 text-status-valid"/> : <X className="w-4 h-4 text-status-error"/>}
                        </div>

                        <div className="space-y-4">
                            {/* Prev Hash */}
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase font-bold text-gray-500 flex items-center gap-1">
                                    <Link className="w-3 h-3" /> Prev Hash
                                </label>
                                <div className={`font-mono text-[10px] break-all p-2 rounded border ${
                                    block.status === 'broken_link'
                                    ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800 text-red-700'
                                    : 'bg-surface-tertiary dark:bg-surface-dark-tertiary border-surface-border dark:border-surface-dark-border text-gray-500'
                                }`}>
                                    {block.previousHash}
                                </div>
                                {phase === 'fix' && block.status === 'broken_link' && (
                                    <Button size="sm" variant="danger" fullWidth onClick={() => fixLink(i)} icon={<RefreshCw className="w-3 h-3"/>} className="text-xs h-8">
                                        Fix Link
                                    </Button>
                                )}
                            </div>

                            {/* Data */}
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase font-bold text-gray-500 flex items-center gap-1">
                                    <FileText className="w-3 h-3" /> Data
                                </label>
                                <textarea
                                    value={block.data}
                                    onChange={(e) => updateBlockData(i, e.target.value)}
                                    disabled={phase !== 'tamper' && !(phase === 'fix' && block.status !== 'valid')}
                                    className={`w-full p-2 text-sm rounded-lg border-2 outline-none font-mono resize-none transition-all ${
                                        phase === 'tamper' && i === 1
                                        ? 'border-brand-300 focus:border-brand-500 ring-4 ring-brand-50 dark:ring-brand-900/10'
                                        : 'border-surface-border dark:border-surface-dark-border bg-transparent'
                                    }`}
                                    rows={2}
                                />
                            </div>

                            {/* Hash */}
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase font-bold text-gray-500 flex items-center gap-1">
                                    <Lock className="w-3 h-3" /> Hash
                                </label>
                                <div className={`font-mono text-[10px] break-all p-2 rounded border transition-colors ${
                                    block.status === 'invalid'
                                    ? 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800 text-yellow-700'
                                    : 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800 text-green-700'
                                }`}>
                                    <Hash value={block.hash} truncate={false} />
                                </div>
                                {phase === 'fix' && block.status === 'invalid' && (
                                    <Button size="sm" variant="primary" fullWidth onClick={() => sealBlock(i)} icon={<Lock className="w-3 h-3"/>} className="text-xs h-8 animate-pulse">
                                        Re-Seal
                                    </Button>
                                )}
                            </div>
                        </div>
                    </Card>
                 </React.Fragment>
              ))}
           </div>
        </div>
      )}

      {/* SECTION 4 — TAMPER INSTRUCTIONS */}
      {phase === 'tamper' && (
         <div ref={tamperRef} className={tamperVisible ? 'animate-fade-up' : 'opacity-0'}>
             <Card variant="outlined" status="warning">
                 <div className="flex items-start gap-4">
                     <div className="p-3 bg-status-warning/10 text-status-warning rounded-full shrink-0">
                         <AlertTriangle className="w-6 h-6" />
                     </div>
                     <div className="space-y-4">
                         <h3 className="text-xl font-bold">Tamper with History</h3>
                         <p className="text-gray-600 dark:text-gray-300">
                             Try to change the data in <b>Block #2</b>. Watch how it affects Block #3.
                         </p>
                         {tamperStep > 0 && (
                             <div className="space-y-2 text-sm">
                                 <div className={`flex items-center gap-2 ${tamperStep >= 1 ? 'text-status-error font-bold' : 'text-gray-400'}`}>
                                     <Badge variant="error" size="sm" className="w-5 h-5 flex items-center justify-center p-0 rounded-full">1</Badge>
                                     Block 2 becomes invalid (seal broken).
                                 </div>
                                 <div className={`flex items-center gap-2 ${tamperStep >= 2 ? 'text-status-error font-bold' : 'text-gray-400'}`}>
                                     <Badge variant="error" size="sm" className="w-5 h-5 flex items-center justify-center p-0 rounded-full">2</Badge>
                                     Block 3 breaks because it points to the old hash!
                                 </div>
                             </div>
                         )}
                     </div>
                 </div>
             </Card>
         </div>
      )}

      {/* SECTION 5 — FIX INSTRUCTIONS */}
      {phase === 'fix' && (
         <div ref={fixRef} className={fixVisible ? 'animate-fade-up' : 'opacity-0'}>
             <Card variant="outlined" status="info">
                 <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                     <RefreshCw className="w-5 h-5 text-brand-500" />
                     Can you fix the chain?
                 </h3>
                 <p className="mb-4 text-gray-600 dark:text-gray-300">
                     To restore validity, you must re-seal every block after the change.
                 </p>
                 <ol className="space-y-2 list-decimal list-inside text-sm text-gray-600 dark:text-gray-400">
                     <li><b>Re-Seal Block 2</b> to update its valid hash.</li>
                     <li><b>Fix Link on Block 3</b> to point to the new hash.</li>
                     <li><b>Re-Seal Block 3</b> because its data (previous hash) changed.</li>
                 </ol>
             </Card>
         </div>
      )}

      {/* SECTION 6 — COMPLETION */}
      {phase === 'complete' && (
         <div ref={completionRef} className={completionVisible ? 'animate-fade-up' : 'opacity-0'}>
             <Card variant="default" status="valid">
                 <div className="text-center space-y-6">
                     <div className="w-16 h-16 bg-status-valid/10 text-status-valid rounded-full flex items-center justify-center mx-auto">
                         <Check className="w-8 h-8" />
                     </div>
                     <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Chain Restored!</h2>
                     <p className="text-gray-600 dark:text-gray-300 max-w-xl mx-auto">
                         You successfully fixed the chain. But notice: changing just 1 block required you to redo 2 blocks.
                         In a real blockchain with millions of blocks, re-sealing (Mining) all subsequent blocks is computationally impossible.
                     </p>
                     <Button variant="success" size="lg" onClick={() => navigate('/journey/5')}>
                         Continue to Step 5 →
                     </Button>
                 </div>
             </Card>
         </div>
      )}

    </div>
  );
};

export default Step4_Chain;
