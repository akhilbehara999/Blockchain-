import React, { useState, useEffect, useRef } from 'react';
import { useProgress } from '../../../context/ProgressContext';
import { Block } from '../../../engine/types';
import { calculateHash } from '../../../engine/block';
import { Box, Lock, Unlock, AlertTriangle, ArrowRight, Check, X, FileText, Clock, Hash } from 'lucide-react';

const Step3_Blocks: React.FC = () => {
  const { completeStep } = useProgress();

  // State
  const [blockData, setBlockData] = useState('Alice pays Bob 5 coins');
  const [timestamp] = useState(Date.now()); // Fixed timestamp for this session
  const [isSealed, setIsSealed] = useState(false);
  const [sealedHash, setSealedHash] = useState('');
  const [currentHash, setCurrentHash] = useState('');
  const [hasTampered, setHasTampered] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);

  // Refs for scrolling
  const builderRef = useRef<HTMLDivElement>(null);
  const tamperRef = useRef<HTMLDivElement>(null);
  const anatomyRef = useRef<HTMLDivElement>(null);

  // Calculate hash whenever data changes
  useEffect(() => {
    // Create a temporary block object to calculate hash
    // We use index 1, prevHash generic generic genesis, nonce 0 (as per instructions)
    const tempBlock: Block = {
      index: 1,
      timestamp,
      data: blockData,
      previousHash: '0000000000000000000000000000000000000000000000000000000000000000',
      nonce: 0,
      hash: '', // Placeholder, calculateHash will compute it based on other fields
    };

    const hash = calculateHash(tempBlock);
    setCurrentHash(hash);

    // Check for tampering if already sealed
    if (isSealed) {
      if (hash !== sealedHash) {
        if (!hasTampered) setHasTampered(true);
      }
    }
  }, [blockData, timestamp, isSealed, sealedHash, hasTampered]);

  // Handle Seal
  const handleSeal = () => {
    setSealedHash(currentHash);
    setIsSealed(true);
    // Scroll to tamper section after a short delay
    setTimeout(() => {
      tamperRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 500);
  };

  // Completion Check
  useEffect(() => {
    if (isSealed && hasTampered && !showCompletion) {
      completeStep(3);
      setShowCompletion(true);
      // Scroll to completion/anatomy section
      setTimeout(() => {
        anatomyRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 1000);
    }
  }, [isSealed, hasTampered, showCompletion, completeStep]);

  const isTampered = isSealed && currentHash !== sealedHash;

  return (
    <div className="space-y-16 pb-20">

      {/* SECTION 1 — THE HOOK */}
      <section className="space-y-6 max-w-3xl mx-auto text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="inline-flex items-center justify-center p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-full mb-4">
          <Box className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Building Your First Block</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          A block is just a container with a seal.
        </p>

        <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl border border-gray-200 dark:border-gray-700 text-left space-y-4 max-w-2xl mx-auto shadow-sm">
          <p className="text-lg">
            You now know what hashing is. Now let's use it to build something.
          </p>
          <ul className="space-y-2 text-gray-600 dark:text-gray-400">
            <li className="flex items-start gap-2">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
              <span>A block is like a sealed envelope containing data (transactions).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
              <span>It has a <b>timestamp</b> (when it was created).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
              <span>It has a <b>seal (hash)</b> that proves the contents.</span>
            </li>
          </ul>
          <p className="text-gray-600 dark:text-gray-400 font-medium">
            If anyone opens the envelope and changes the contents, the seal breaks.
          </p>

          <div
            className="pt-2 flex items-center text-indigo-600 dark:text-indigo-400 font-semibold cursor-pointer hover:underline"
            onClick={() => builderRef.current?.scrollIntoView({ behavior: 'smooth' })}
          >
            <ArrowRight className="w-4 h-4 mr-2" />
            Let's build one.
          </div>
        </div>
      </section>

      {/* SECTION 2 — BUILD A BLOCK */}
      <section ref={builderRef} className="space-y-6 max-w-3xl mx-auto border-t border-gray-200 dark:border-gray-800 pt-12">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <span className="bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
          Block Builder
        </h2>

        <div className={`transition-all duration-500 border-2 rounded-xl overflow-hidden shadow-sm ${
          isSealed
            ? isTampered
              ? 'border-red-500 bg-red-50 dark:bg-red-900/10'
              : 'border-green-500 bg-green-50 dark:bg-green-900/10'
            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900'
        }`}>
          {/* Header Status Bar */}
          <div className={`px-6 py-3 border-b flex justify-between items-center ${
             isSealed
             ? isTampered
               ? 'bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800'
               : 'bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800'
             : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
          }`}>
            <div className="font-mono font-bold text-sm uppercase tracking-wider flex items-center gap-2">
              Block #1
              {isSealed && (
                isTampered
                ? <span className="text-red-600 flex items-center gap-1"><X className="w-4 h-4"/> TAMPERED</span>
                : <span className="text-green-600 flex items-center gap-1"><Check className="w-4 h-4"/> SEALED</span>
              )}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
              {new Date(timestamp).toLocaleString()}
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Fields */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
                  <Hash className="w-3 h-3" /> Block Number
                </label>
                <input
                  type="text"
                  value="1"
                  disabled
                  className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-500 cursor-not-allowed font-mono"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Timestamp
                </label>
                <input
                  type="text"
                  value={timestamp}
                  disabled
                  className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-500 cursor-not-allowed font-mono"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
                <FileText className="w-3 h-3" /> Data (Transactions)
              </label>
              <textarea
                value={blockData}
                onChange={(e) => setBlockData(e.target.value)}
                rows={3}
                className={`w-full p-3 rounded-lg border focus:ring-2 outline-none transition-colors font-mono ${
                  isSealed
                    ? 'border-yellow-400 focus:border-yellow-500 focus:ring-yellow-200 dark:focus:ring-yellow-900/50 bg-yellow-50 dark:bg-yellow-900/10'
                    : 'border-gray-300 dark:border-gray-600 focus:ring-indigo-500 bg-white dark:bg-black'
                }`}
                placeholder="Enter block data..."
              />
              {isSealed && (
                 <div className="text-xs text-yellow-600 dark:text-yellow-500 flex items-center gap-1 animate-pulse">
                   <AlertTriangle className="w-3 h-3" />
                   Editing this field after sealing will break the seal!
                 </div>
              )}
            </div>

            <div className="space-y-2 opacity-60">
              <label className="text-xs font-bold text-gray-500 uppercase">Previous Block Hash</label>
              <div className="font-mono text-xs break-all p-3 bg-gray-100 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 text-gray-500">
                0000000000000000000000000000000000000000000000000000000000000000 (Genesis)
              </div>
            </div>

            {/* Actions / Output */}
            <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
              {!isSealed ? (
                <button
                  onClick={handleSeal}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  <Lock className="w-5 h-5" />
                  Seal This Block
                </button>
              ) : (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                   <div className="flex items-center justify-between text-sm">
                      <span className="font-bold text-gray-700 dark:text-gray-300">Block Hash (Seal)</span>
                      {isTampered ? (
                        <span className="text-red-600 font-bold flex items-center gap-1 px-2 py-1 bg-red-100 dark:bg-red-900/30 rounded text-xs">
                          <Unlock className="w-3 h-3" /> BROKEN
                        </span>
                      ) : (
                        <span className="text-green-600 font-bold flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 rounded text-xs">
                          <Lock className="w-3 h-3" /> VALID
                        </span>
                      )}
                   </div>

                   <div className={`font-mono text-sm break-all p-4 rounded-lg border ${
                     isTampered
                       ? 'bg-red-100 dark:bg-red-900/20 border-red-300 dark:border-red-700 text-red-800 dark:text-red-300'
                       : 'bg-green-100 dark:bg-green-900/20 border-green-300 dark:border-green-700 text-green-800 dark:text-green-300'
                   }`}>
                     {currentHash}
                   </div>

                   {!isTampered && (
                     <div className="text-center text-sm text-green-600 dark:text-green-400 font-medium animate-bounce">
                        ✅ Block sealed! Try changing the data above.
                     </div>
                   )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3 — TAMPER EXPERIMENT */}
      {isSealed && (
        <section ref={tamperRef} className="space-y-6 max-w-3xl mx-auto border-t border-gray-200 dark:border-gray-800 pt-12 animate-in fade-in slide-in-from-bottom-8">
           <h2 className="text-2xl font-bold flex items-center gap-2">
            <span className="bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
            Tamper Experiment
          </h2>

          <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
             {!isTampered ? (
               <div className="text-center py-8 space-y-4">
                 <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto text-yellow-600 dark:text-yellow-400">
                    <AlertTriangle className="w-8 h-8" />
                 </div>
                 <h3 className="text-xl font-bold">Time to break the rules.</h3>
                 <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto">
                   Scroll up to the <b>Data</b> field and change "5" to "50" (or anything else).
                   Watch what happens to the seal.
                 </p>
               </div>
             ) : (
               <div className="space-y-6 animate-in zoom-in-95 duration-300">
                 <div className="flex items-center gap-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <div className="p-3 bg-red-100 dark:bg-red-800 rounded-full shrink-0">
                      <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-200" />
                    </div>
                    <div>
                      <h4 className="font-bold text-red-800 dark:text-red-200 text-lg">TAMPERING DETECTED!</h4>
                      <p className="text-sm text-red-700 dark:text-red-300">
                        The calculated hash no longer matches the stored seal.
                      </p>
                    </div>
                 </div>

                 <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-xs font-bold text-gray-500 uppercase">Stored Seal (Original)</label>
                       <div className="font-mono text-xs break-all p-3 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded text-green-700 dark:text-green-300 opacity-50">
                         {sealedHash}
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs font-bold text-red-500 uppercase">Actual Hash (Calculated)</label>
                       <div className="font-mono text-xs break-all p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded text-red-700 dark:text-red-300 font-bold border-2 animate-pulse">
                         {currentHash}
                       </div>
                    </div>
                 </div>

                 <div className="text-center text-sm text-gray-600 dark:text-gray-400 pt-4">
                   This is blockchain's integrity model. Any node can independently verify if a block is valid by re-computing the hash.
                 </div>
               </div>
             )}
          </div>
        </section>
      )}

      {/* SECTION 4 — ANATOMY & COMPLETION */}
      {showCompletion && (
        <section ref={anatomyRef} className="space-y-6 max-w-3xl mx-auto border-t border-gray-200 dark:border-gray-800 pt-12 animate-in fade-in slide-in-from-bottom-8">
           <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-8 rounded-2xl border border-indigo-100 dark:border-indigo-800">
              <div className="flex flex-col md:flex-row gap-8 items-center">
                 <div className="flex-1 space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-bold">
                       <Check className="w-4 h-4" /> Step 3 Complete
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Anatomy of a Block</h2>
                    <p className="text-gray-600 dark:text-gray-300">
                       You've just built a valid block! In a real blockchain, a block has two main parts:
                    </p>

                    <ul className="space-y-3">
                       <li className="p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                          <span className="font-bold text-indigo-600 block mb-1">HEADER</span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">Metadata like Block #, Timestamp, Previous Hash, and the "Nonce".</span>
                       </li>
                       <li className="p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                          <span className="font-bold text-purple-600 block mb-1">BODY</span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">The list of transactions (Data).</span>
                       </li>
                    </ul>

                    <p className="text-sm text-gray-500 italic">
                       What is a "Nonce"? That's a mystery for Step 5 (Mining).
                    </p>

                    <div className="pt-4">
                       <div className="inline-flex items-center text-indigo-600 font-bold animate-pulse">
                          Proceed to Step 4: Chaining Blocks <ArrowRight className="w-5 h-5 ml-2" />
                       </div>
                    </div>
                 </div>

                 {/* Visual Representation */}
                 <div className="w-full md:w-64 shrink-0 bg-white dark:bg-gray-900 rounded-xl border-2 border-indigo-200 dark:border-indigo-800 p-4 shadow-lg rotate-3 transform hover:rotate-0 transition-transform duration-500">
                    <div className="text-center font-bold text-gray-400 mb-2 text-xs tracking-widest uppercase">Block Structure</div>
                    <div className="space-y-2">
                       <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 p-2 rounded text-center">
                          <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400">HEADER</div>
                          <div className="text-[10px] text-gray-500 leading-tight mt-1">
                             ver: 1<br/>prev: 000...<br/>root: a1b2...<br/>time: {timestamp}<br/>nonce: ???
                          </div>
                       </div>
                       <div className="h-4 flex justify-center">
                          <div className="w-0.5 h-full bg-gray-300 dark:bg-gray-700"></div>
                       </div>
                       <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 p-2 rounded text-center min-h-[80px] flex flex-col justify-center">
                          <div className="text-xs font-bold text-purple-600 dark:text-purple-400">BODY</div>
                          <div className="text-[10px] text-gray-500 mt-1">
                             [Tx 1]<br/>[Tx 2]<br/>...
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </section>
      )}
    </div>
  );
};

export default Step3_Blocks;
