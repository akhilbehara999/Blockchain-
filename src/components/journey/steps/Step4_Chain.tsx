import React, { useState, useEffect, useRef } from 'react';
import { useProgress } from '../../../context/ProgressContext';
import { calculateHash } from '../../../engine/block';
import { Block } from '../../../engine/types';
import { Link, AlertTriangle, ArrowRight, Lock, RefreshCw, Check, X, FileText, Hash } from 'lucide-react';

interface ChainBlock extends Block {
  isSealed: boolean;
  sealedHash: string; // The hash stored when sealed
  currentHash: string; // The hash calculated from current data
  status: 'valid' | 'invalid' | 'broken_link';
}

const Step4_Chain: React.FC = () => {
  const { completeStep } = useProgress();

  // State
  const [blocks, setBlocks] = useState<ChainBlock[]>([]);
  const [phase, setPhase] = useState<'intro' | 'build' | 'tamper' | 'fix' | 'complete'>('intro');
  const [tamperStep, setTamperStep] = useState(0); // 0: none, 1: block 2 broken, 2: block 3 broken

  const chainRef = useRef<HTMLDivElement>(null);
  const tamperRef = useRef<HTMLDivElement>(null);
  const fixRef = useRef<HTMLDivElement>(null);

  // Initialize empty blocks or genesis if needed, but phase 'intro' handles it.

  // Helper to create a new block
  const createNewBlock = (index: number, previousHash: string) => {
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
    const hash = calculateHash(tempBlock);

    return {
      ...tempBlock,
      hash, // Initial valid hash
      sealedHash: hash,
      currentHash: hash,
      isSealed: true,
      status: 'valid' as const,
    };
  };

  // Build Phase: Add Block
  const addBlock = () => {
    const index = blocks.length;
    let prevHash = '0'.repeat(64);
    if (index > 0) {
      prevHash = blocks[index - 1].sealedHash;
    }

    const newBlock = createNewBlock(index, prevHash);
    setBlocks([...blocks, newBlock]);

    // Automatically advance phase if 3 blocks built
    if (index === 2) {
      setTimeout(() => {
        setPhase('tamper');
        tamperRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 1000);
    }
  };

  // Update block data (for tampering)
  const updateBlockData = (index: number, newData: string) => {
    const newBlocks = [...blocks];
    const block = newBlocks[index];
    block.data = newData;

    // Recalculate current hash
    const tempBlock: Block = {
      ...block,
      hash: '', // Reset for calculation
    };
    block.currentHash = calculateHash(tempBlock);

    // If data changed from initial, status changes
    if (block.currentHash !== block.sealedHash) {
      block.status = 'invalid';
      // Trigger cascade animation if in tamper phase
      if (phase === 'tamper' && index === 1 && tamperStep === 0) {
        setTamperStep(1);
        setTimeout(() => {
           setTamperStep(2); // Cascade to next block
        }, 500);
      }
    } else {
      block.status = 'valid';
      if (phase === 'tamper' && index === 1 && block.currentHash === block.sealedHash) {
          // Reverted manually?
          setTamperStep(0);
      }
    }

    setBlocks(newBlocks);
  };

  // Check for broken links (Cascade Effect)
  useEffect(() => {
    // We only update visual status based on links here
    // This runs on every render/block update

    // Create a copy to update status without mutating directly (though setBlocks needed if we change state)
    // Actually, we can derive status during render or update it here.
    // Let's update state to reflect chain validity.

    let updated = false;
    const newBlocks = [...blocks];

    for (let i = 1; i < newBlocks.length; i++) {
       const prevBlock = newBlocks[i-1];
       const currBlock = newBlocks[i];

       // Link check: Does current block's previousHash match previous block's sealedHash?
       // Note: In tamper phase, user breaks Block 2. Block 2 hash changes (currentHash != sealedHash).
       // But Block 3 previousHash points to Block 2's OLD sealedHash (which is what is stored in Block 3).
       // The "Real" check is: If we re-calculated Block 3 based on Block 2's NEW hash, it would change.
       // BUT, the prompt says: "Step 2: Block 3's Previous Hash no longer matches -> Block 3 shows BROKEN".
       // This implies we are comparing Block 3's stored `previousHash` with Block 2's *current* hash (or the one it *should* have?).

       // Actually, in a blockchain, the link is: Block 3 contains "prevHash".
       // Verify: prevHash == Hash(Block 2).
       // If Block 2 data changes -> Hash(Block 2) changes.
       // So prevHash != Hash(Block 2).
       // So the link is broken.

       // In our model:
       // Block 2 `currentHash` is the "actual" hash of Block 2.
       // Block 3 `previousHash` is what Block 3 *thinks* previous is.

       // const isLinkBroken = currBlock.previousHash !== prevBlock.currentHash; // or sealedHash?
       // If Block 2 is tampered, `currentHash` changes. `sealedHash` remains old (until re-sealed).
       // Visually, the block itself is "Broken" (tampered) if current != sealed.
       // The *Chain* is broken if next block's prevHash doesn't match prev block's *valid* hash.

       // Let's define "Broken Link":
       // If Prev Block is tampered (current != sealed), then effectively the link is invalid because the referenced hash is no longer valid for the data.
       // OR simply: currentBlock.previousHash !== prevBlock.currentHash.

       if (currBlock.previousHash !== prevBlock.currentHash) {
         if (currBlock.status !== 'broken_link') {
            currBlock.status = 'broken_link';
            updated = true;
         }
       } else {
         // If link is fine, check internal validity
         if (currBlock.currentHash !== currBlock.sealedHash) {
            if (currBlock.status !== 'invalid') {
                currBlock.status = 'invalid';
                updated = true;
            }
         } else {
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

    // Check for Fix Completion
    if (phase === 'tamper' && tamperStep === 2) {
       // Enable fix phase
       setPhase('fix');
    }

    // Check for Final Completion (All valid)
    if (phase === 'fix') {
       const allValid = newBlocks.every(b => b.status === 'valid');
       if (allValid) {
          setPhase('complete');
          completeStep(4);
       }
    }

  }, [blocks, phase, tamperStep, completeStep]);

  // Fix Action: Re-seal a block
  const sealBlock = (index: number) => {
     const newBlocks = [...blocks];
     const block = newBlocks[index];

     // Update sealed hash to current hash
     block.sealedHash = block.currentHash;
     block.hash = block.currentHash;
     block.status = 'valid'; // Temporarily valid, but might break next link if not updated

     setBlocks(newBlocks);
  };

  // Fix Action: Update Previous Hash
  const updatePreviousHash = (index: number) => {
     if (index === 0) return;
     const newBlocks = [...blocks];
     const prevBlock = newBlocks[index - 1];
     const currBlock = newBlocks[index];

     currBlock.previousHash = prevBlock.currentHash; // or sealedHash, should be same if prev is fixed

     // Recalculate current hash because prevHash changed
     const tempBlock: Block = {
        ...currBlock,
        previousHash: currBlock.previousHash, // updated
        hash: '',
     };
     currBlock.currentHash = calculateHash(tempBlock);

     // It is now tampered (internal mismatch) until re-sealed
     currBlock.status = 'invalid';

     setBlocks(newBlocks);
  };

  return (
    <div className="space-y-12 pb-20">

      {/* SECTION 1 — THE HOOK */}
      <section className="max-w-4xl mx-auto text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="inline-flex items-center justify-center p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-full mb-4">
          <Link className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">The Chain That Cannot Lie</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          One block is just a sealed envelope. But what if we chain them together?
        </p>

        {phase === 'intro' && (
          <div className="pt-8">
            <button
              onClick={() => setPhase('build')}
              className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 flex items-center gap-2 mx-auto"
            >
              Start Building the Chain <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </section>

      {/* SECTION 2 — BUILD & CHAIN DISPLAY */}
      {phase !== 'intro' && (
        <section ref={chainRef} className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8">
           <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <span className="bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
                The Blockchain
              </h2>
              {phase === 'build' && blocks.length < 3 && (
                 <button
                    onClick={addBlock}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium flex items-center gap-2 transition-all"
                 >
                    <Link className="w-4 h-4" /> Add Block {blocks.length + 1}
                 </button>
              )}
           </div>

           {/* Chain Visualizer */}
           <div className="flex flex-col md:flex-row gap-4 items-start overflow-x-auto pb-4 px-2">
              {blocks.map((block, i) => (
                 <React.Fragment key={block.index}>
                    {/* Arrow between blocks */}
                    {i > 0 && (
                       <div className="hidden md:flex flex-col justify-center items-center self-center text-gray-400 dark:text-gray-600 px-2">
                          <ArrowRight className={`w-8 h-8 ${
                             block.status === 'broken_link' ? 'text-red-500 animate-pulse' : 'text-gray-400'
                          }`} />
                       </div>
                    )}

                    {/* Block Card */}
                    <div className={`flex-shrink-0 w-full md:w-80 rounded-xl border-2 transition-all duration-300 shadow-sm relative ${
                       block.status === 'valid'
                         ? 'border-green-500 bg-white dark:bg-gray-900'
                         : block.status === 'broken_link'
                            ? 'border-red-500 bg-red-50 dark:bg-red-900/10'
                            : 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10'
                    }`}>
                       {/* Header */}
                       <div className={`px-4 py-2 border-b flex justify-between items-center ${
                          block.status === 'valid'
                             ? 'bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800'
                             : block.status === 'broken_link'
                                ? 'bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800'
                                : 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800'
                       }`}>
                          <span className="font-mono font-bold text-sm">BLOCK #{block.index + 1}</span>
                          {block.status === 'valid' ? (
                             <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                          ) : (
                             <X className="w-4 h-4 text-red-600 dark:text-red-400" />
                          )}
                       </div>

                       <div className="p-4 space-y-4">
                          {/* Previous Hash */}
                          <div className="space-y-1">
                             <label className="text-[10px] uppercase font-bold text-gray-500">Previous Hash</label>
                             <div className={`font-mono text-[10px] break-all p-2 rounded border ${
                                block.status === 'broken_link'
                                   ? 'bg-red-100 dark:bg-red-900/20 border-red-300 text-red-800'
                                   : 'bg-gray-100 dark:bg-gray-800 border-gray-200 text-gray-500'
                             }`}>
                                {block.previousHash.substring(0, 20)}...
                             </div>
                             {/* Fix Button for Broken Link */}
                             {phase === 'fix' && block.status === 'broken_link' && (
                                <button
                                   onClick={() => updatePreviousHash(i)}
                                   className="w-full mt-2 py-1 px-2 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded flex items-center justify-center gap-1 transition-colors"
                                >
                                   <RefreshCw className="w-3 h-3" /> Update Previous Hash
                                </button>
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
                                className={`w-full p-2 text-sm rounded border focus:ring-2 outline-none font-mono resize-none ${
                                   phase === 'tamper' && i === 1
                                      ? 'border-indigo-300 focus:border-indigo-500 ring-2 ring-indigo-100'
                                      : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
                                }`}
                                rows={2}
                             />
                          </div>

                          {/* Hash */}
                          <div className="space-y-1">
                             <label className="text-[10px] uppercase font-bold text-gray-500 flex items-center gap-1">
                                <Hash className="w-3 h-3" /> Hash
                             </label>
                             <div className={`font-mono text-[10px] break-all p-2 rounded border transition-colors ${
                                block.status === 'invalid'
                                   ? 'bg-yellow-100 dark:bg-yellow-900/20 border-yellow-300 text-yellow-800'
                                   : 'bg-green-50 dark:bg-green-900/10 border-green-200 text-green-700'
                             }`}>
                                {block.currentHash.substring(0, 20)}...
                             </div>

                             {/* Re-seal Button */}
                             {phase === 'fix' && block.status === 'invalid' && (
                                <button
                                   onClick={() => sealBlock(i)}
                                   className="w-full mt-2 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded flex items-center justify-center gap-2 transition-colors animate-pulse"
                                >
                                   <Lock className="w-3 h-3" /> Re-Seal Block
                                </button>
                             )}
                          </div>
                       </div>

                       {/* Mobile Arrow */}
                       <div className="md:hidden flex justify-center pb-2 text-gray-400">
                          <ArrowRight className="w-6 h-6 rotate-90" />
                       </div>
                    </div>
                 </React.Fragment>
              ))}
           </div>
        </section>
      )}

      {/* SECTION 3 — TAMPER INSTRUCTIONS */}
      {phase === 'tamper' && (
         <section ref={tamperRef} className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-8">
            <div className="bg-white dark:bg-gray-900 border border-red-200 dark:border-red-800 rounded-xl p-6 shadow-sm">
               <div className="flex items-start gap-4">
                  <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full text-red-600 dark:text-red-400">
                     <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div className="space-y-4">
                     <h3 className="text-xl font-bold text-gray-900 dark:text-white">Tamper with History</h3>
                     <p className="text-gray-600 dark:text-gray-300">
                        Try to change the data in <b>Block #2</b>. Watch how it affects Block #3.
                     </p>

                     {tamperStep > 0 && (
                        <div className="space-y-2 text-sm">
                           <div className={`flex items-center gap-2 ${tamperStep >= 1 ? 'text-red-600 font-bold' : 'text-gray-400'}`}>
                              <span className="w-6 h-6 rounded-full bg-current flex items-center justify-center text-white text-xs">1</span>
                              Block 2 Hash Changed (Invalid Seal)
                           </div>
                           <div className={`flex items-center gap-2 ${tamperStep >= 2 ? 'text-red-600 font-bold' : 'text-gray-400'}`}>
                              <span className="w-6 h-6 rounded-full bg-current flex items-center justify-center text-white text-xs">2</span>
                              Block 3 Previous Hash Mismatch (Broken Link)
                           </div>
                           {tamperStep === 2 && (
                              <div className="pt-2 text-red-700 dark:text-red-300 font-medium animate-pulse">
                                 🚨 CASCADE EFFECT CONFIRMED! The chain is broken.
                              </div>
                           )}
                        </div>
                     )}
                  </div>
               </div>
            </div>
         </section>
      )}

      {/* SECTION 4 — FIX INSTRUCTIONS */}
      {phase === 'fix' && (
         <section ref={fixRef} className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-8">
            <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl p-6 shadow-sm">
               <h3 className="text-xl font-bold text-indigo-900 dark:text-indigo-100 mb-4 flex items-center gap-2">
                  <RefreshCw className="w-5 h-5" />
                  Can you fix the chain?
               </h3>
               <p className="text-gray-700 dark:text-gray-300 mb-4">
                  To restore validity, you must re-seal every block after the change.
               </p>
               <ol className="space-y-2 list-decimal list-inside text-gray-600 dark:text-gray-400 text-sm">
                  <li><b>Re-Seal Block 2</b> to update its valid hash.</li>
                  <li><b>Update Block 3's Previous Hash</b> to match Block 2's new hash.</li>
                  <li><b>Re-Seal Block 3</b> because its data (previous hash) changed.</li>
               </ol>
            </div>
         </section>
      )}

      {/* SECTION 5 — COMPLETION */}
      {phase === 'complete' && (
         <section className="max-w-3xl mx-auto animate-in fade-in zoom-in-95 duration-500">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-8 text-center space-y-6">
               <div className="w-16 h-16 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center mx-auto text-green-600 dark:text-green-400">
                  <Check className="w-8 h-8" />
               </div>
               <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Chain Restored!</h2>
               <p className="text-lg text-gray-600 dark:text-gray-300">
                  You successfully fixed the chain. But notice: changing just 1 block required you to redo 2 blocks.
               </p>
               <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700 text-left text-sm space-y-2 max-w-lg mx-auto">
                  <p>In a real blockchain like Bitcoin:</p>
                  <ul className="space-y-1 list-disc list-inside text-gray-600 dark:text-gray-400">
                     <li>There are 800,000+ blocks.</li>
                     <li>"Re-sealing" (Mining) takes massive energy (Step 5).</li>
                     <li>To cheat, you'd have to outpace the entire world's computers.</li>
                  </ul>
               </div>

               <button
                  onClick={() => completeStep(4)}
                  className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 flex items-center gap-2 mx-auto"
               >
                  Complete Step 4 <ArrowRight className="w-5 h-5" />
               </button>
            </div>
         </section>
      )}

    </div>
  );
};

export default Step4_Chain;
