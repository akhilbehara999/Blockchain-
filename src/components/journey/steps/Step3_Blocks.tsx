import React, { useState, useEffect } from 'react';
import { useProgress } from '../../../context/ProgressContext';
import { Block } from '../../../engine/types';
import { calculateHash } from '../../../engine/block';
import { Box, Lock, Unlock, AlertTriangle, Check, FileText, Clock, Hash as HashIcon } from 'lucide-react';
import Card from '../../ui/Card';
import Button from '../../ui/Button';
import Badge from '../../ui/Badge';
import { useInView } from '../../../hooks/useInView';
import { useNavigate } from 'react-router-dom';

const Step3_Blocks: React.FC = () => {
  const { completeStep } = useProgress();
  const navigate = useNavigate();

  // Load state helper
  const loadState = (key: string, def: any) => {
    try {
      const saved = localStorage.getItem('yupp_step3_state');
      return saved ? (JSON.parse(saved)[key] ?? def) : def;
    } catch { return def; }
  };

  // State
  const [blockData, setBlockData] = useState(() => loadState('blockData', 'Alice pays Bob 5 coins'));
  const [timestamp] = useState(Date.now());
  const [isSealed, setIsSealed] = useState(() => loadState('isSealed', false));
  const [sealedHash, setSealedHash] = useState(() => loadState('sealedHash', ''));
  const [currentHash, setCurrentHash] = useState('');
  const [hasTampered, setHasTampered] = useState(() => loadState('hasTampered', false));
  const [showCompletion, setShowCompletion] = useState(() => loadState('showCompletion', false));

  // Persist state
  useEffect(() => {
    try {
      localStorage.setItem('yupp_step3_state', JSON.stringify({
        blockData,
        isSealed,
        sealedHash,
        hasTampered,
        showCompletion
      }));
    } catch {}
  }, [blockData, isSealed, sealedHash, hasTampered, showCompletion]);

  // InView hooks
  const [headerRef, headerVisible] = useInView({ threshold: 0.1 });
  const [storyRef, storyVisible] = useInView({ threshold: 0.1 });
  const [builderRef, builderVisible] = useInView({ threshold: 0.1 });
  const [tamperRef, tamperVisible] = useInView({ threshold: 0.1 });
  const [anatomyRef, anatomyVisible] = useInView({ threshold: 0.1 });

  // Calculate hash whenever data changes
  useEffect(() => {
    // Create a temporary block object to calculate hash
    const tempBlock: Block = {
      index: 1,
      timestamp,
      data: blockData,
      previousHash: '0000000000000000000000000000000000000000000000000000000000000000',
      nonce: 0,
      hash: '', // Placeholder
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
  };

  // Completion Check
  useEffect(() => {
    if (isSealed && hasTampered && !showCompletion) {
      completeStep(3);
      setShowCompletion(true);
    }
  }, [isSealed, hasTampered, showCompletion, completeStep]);

  const isTampered = isSealed && currentHash !== sealedHash;

  return (
    <div className="space-y-12 md:space-y-16 pb-20">

      {/* SECTION 1 — HEADER */}
      <div ref={headerRef} className={`space-y-4 ${headerVisible ? 'animate-fade-up' : 'opacity-0'}`}>
        <Badge variant="info">Step 3 of 8</Badge>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">Building Your First Block</h1>
        <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl">
          A block is just a container with a seal.
        </p>
      </div>

      {/* SECTION 2 — STORY */}
      <div ref={storyRef} className={storyVisible ? 'animate-fade-up' : 'opacity-0'}>
        <Card variant="glass" className="max-w-prose">
          <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300">
            You now know what hashing is. Now let's use it to build something.
            <br/><br/>
            A block is like a sealed envelope containing data (transactions).
            It has a <b>timestamp</b> (when it was created) and a <b>seal (hash)</b> that proves the contents.
            If anyone opens the envelope and changes the contents, the seal breaks.
          </p>
        </Card>
      </div>

      {/* SECTION 3 — BUILDER */}
      <div ref={builderRef} className={builderVisible ? 'animate-fade-up' : 'opacity-0'}>
        <Card variant="elevated" className={`transition-all duration-300 ${
            isSealed && hasTampered
            ? 'bg-red-50 border-2 border-red-400 text-gray-800 dark:bg-red-950 dark:border-red-400 dark:text-gray-200'
            : isSealed
                ? 'bg-green-50 border-2 border-green-400 text-gray-800 dark:bg-green-950 dark:border-green-500 dark:text-gray-200'
                : ''
        }`}>
            <div className="flex justify-between items-center mb-6">
                 <h3 className="text-2xl font-bold flex items-center gap-2">
                    <Box className={`w-6 h-6 ${isSealed ? (hasTampered ? 'text-red-500' : 'text-green-500') : 'text-brand-500'}`} />
                    Block Builder
                 </h3>
                 {isSealed && (
                     <Badge variant={hasTampered ? 'error' : 'success'} pulse={!hasTampered}>
                         {hasTampered ? 'SEAL BROKEN' : 'SEALED'}
                     </Badge>
                 )}
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
                 <div className="space-y-2">
                    <label className={`text-xs font-bold uppercase flex items-center gap-1 ${isSealed ? 'text-gray-600 dark:text-gray-400' : 'text-gray-500'}`}>
                        <HashIcon className="w-3 h-3" /> Block Number
                    </label>
                    <div className={`w-full p-3 rounded-xl border-2 font-mono ${
                        isSealed
                        ? 'border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-black/20 text-gray-900 dark:text-white'
                        : 'border-surface-border dark:border-surface-dark-border bg-surface-tertiary dark:bg-surface-dark-tertiary text-gray-500'
                    } cursor-not-allowed`}>
                        1
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className={`text-xs font-bold uppercase flex items-center gap-1 ${isSealed ? 'text-gray-600 dark:text-gray-400' : 'text-gray-500'}`}>
                        <Clock className="w-3 h-3" /> Timestamp
                    </label>
                    <div className={`w-full p-3 rounded-xl border-2 font-mono ${
                        isSealed
                        ? 'border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-black/20 text-gray-900 dark:text-white'
                        : 'border-surface-border dark:border-surface-dark-border bg-surface-tertiary dark:bg-surface-dark-tertiary text-gray-500'
                    } cursor-not-allowed`}>
                        {timestamp}
                    </div>
                 </div>
            </div>

            <div className="space-y-2 mb-6">
                <label className={`text-xs font-bold uppercase flex items-center gap-1 ${isSealed ? 'text-gray-600 dark:text-gray-400' : 'text-gray-500'}`}>
                    <FileText className="w-3 h-3" /> Data (Transactions)
                </label>
                <textarea
                    value={blockData}
                    onChange={(e) => setBlockData(e.target.value)}
                    rows={4}
                    className={`w-full p-4 rounded-xl border-2 focus:ring-4 outline-none transition-all font-mono text-sm md:text-base ${
                        isSealed
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-100 dark:focus:ring-red-900/30 bg-white/80 dark:bg-black/20 text-gray-900 dark:text-white'
                        : 'border-surface-border dark:border-surface-dark-border focus:border-brand-500 focus:ring-brand-100 dark:focus:ring-brand-900/30 bg-transparent'
                    }`}
                />
                {isSealed && (
                    <div className="text-xs text-status-warning font-bold flex items-center gap-1 animate-pulse">
                        <AlertTriangle className="w-3 h-3" />
                        Warning: Editing data will break the seal!
                    </div>
                )}
            </div>

            <div className="space-y-2 mb-8 opacity-60 hover:opacity-100 transition-opacity">
                 <label className={`text-xs font-bold uppercase ${isSealed ? 'text-gray-600 dark:text-gray-400' : 'text-gray-500'}`}>Previous Block Hash</label>
                 <div className={`w-full p-3 rounded-xl border-2 font-mono text-xs break-all ${
                     isSealed
                     ? 'border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-black/20 text-gray-900 dark:text-white'
                     : 'border-surface-border dark:border-surface-dark-border bg-surface-tertiary dark:bg-surface-dark-tertiary text-gray-500'
                 }`}>
                     0000000000000000000000000000000000000000000000000000000000000000
                 </div>
            </div>

            <div className={`border-t pt-6 ${isSealed ? 'border-gray-300 dark:border-gray-600' : 'border-surface-border dark:border-surface-dark-border'}`}>
                 {!isSealed ? (
                     <Button onClick={handleSeal} fullWidth icon={<Lock className="w-4 h-4"/>}>
                         Seal Block
                     </Button>
                 ) : (
                     <div className="space-y-4">
                         <div className="flex items-center justify-between text-sm">
                             <span className={`font-bold ${isSealed ? 'text-gray-800 dark:text-gray-200' : 'text-gray-700 dark:text-gray-300'}`}>Block Hash (The Seal)</span>
                             {hasTampered ? (
                                 <span className="text-red-600 font-bold flex items-center gap-1">
                                     <Unlock className="w-4 h-4" /> INVALID
                                 </span>
                             ) : (
                                 <span className="text-green-600 font-bold flex items-center gap-1">
                                     <Lock className="w-4 h-4" /> VALID
                                 </span>
                             )}
                         </div>

                         <div className={`p-4 rounded-xl border-2 font-mono text-sm break-all transition-colors ${
                             hasTampered
                             ? 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700 text-red-800 dark:text-red-200'
                             : 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700 text-green-800 dark:text-green-200'
                         }`}>
                             {currentHash}
                         </div>

                         {!hasTampered && (
                             <div className="text-center text-green-700 dark:text-green-300 font-bold animate-bounce text-sm">
                                 ✅ Block sealed! Now try changing the data above.
                             </div>
                         )}
                     </div>
                 )}
            </div>
        </Card>
      </div>

      {/* SECTION 4 — TAMPER EXPERIMENT */}
      {isSealed && (
        <div ref={tamperRef} className={tamperVisible ? 'animate-fade-up' : 'opacity-0'}>
             <Card variant="outlined" status={isTampered ? 'error' : 'info'} className="transition-all duration-300">
                 {!isTampered ? (
                     <div className="text-center py-6 space-y-4">
                         <div className="w-16 h-16 bg-status-warning/10 text-status-warning rounded-full flex items-center justify-center mx-auto">
                             <AlertTriangle className="w-8 h-8" />
                         </div>
                         <h3 className="text-xl font-bold">Time to break the rules</h3>
                         <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto">
                             Scroll up to the <b>Data</b> field and change anything. Watch what happens to the seal.
                         </p>
                     </div>
                 ) : (
                     <div className="space-y-6">
                         <div className="flex items-center gap-4">
                             <div className="p-3 bg-status-error/10 text-status-error rounded-full shrink-0">
                                 <AlertTriangle className="w-6 h-6" />
                             </div>
                             <div>
                                 <h3 className="text-xl font-bold text-status-error">Tampering Detected!</h3>
                                 <p className="text-gray-600 dark:text-gray-300">
                                     The calculated hash no longer matches the stored seal.
                                 </p>
                             </div>
                         </div>

                         <div className="grid md:grid-cols-2 gap-4">
                             <div className="space-y-2 opacity-60">
                                 <label className="text-xs font-bold text-gray-500 uppercase">Original Seal</label>
                                 <div className="p-3 bg-surface-tertiary dark:bg-surface-dark-tertiary rounded-xl border border-surface-border dark:border-surface-dark-border font-mono text-xs break-all">
                                     {sealedHash}
                                 </div>
                             </div>
                             <div className="space-y-2">
                                 <label className="text-xs font-bold text-status-error uppercase">Current Hash</label>
                                 <div className="p-3 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-200 dark:border-red-800 font-mono text-xs break-all text-status-error font-bold border-2 animate-pulse">
                                     {currentHash}
                                 </div>
                             </div>
                         </div>
                     </div>
                 )}
             </Card>
        </div>
      )}

      {/* SECTION 5 — COMPLETION */}
      {showCompletion && (
        <div ref={anatomyRef} className={anatomyVisible ? 'animate-fade-up' : 'opacity-0'}>
            <Card variant="default" status="valid">
                <div className="flex flex-col md:flex-row items-start gap-8">
                     <div className="flex-1 space-y-6">
                         <div className="flex items-center gap-2">
                             <div className="w-10 h-10 bg-status-valid/10 text-status-valid rounded-xl flex items-center justify-center">
                                 <Check className="w-6 h-6" />
                             </div>
                             <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Block Built!</h3>
                         </div>

                         <p className="text-gray-600 dark:text-gray-300">
                             In a real blockchain, a block has two main parts:
                         </p>

                         <div className="grid gap-4">
                             <div className="p-4 bg-surface-tertiary dark:bg-surface-dark-tertiary rounded-xl">
                                 <span className="font-bold text-brand-600 block mb-1">HEADER</span>
                                 <span className="text-sm text-gray-500">Metadata like Block #, Timestamp, Previous Hash, and the "Nonce".</span>
                             </div>
                             <div className="p-4 bg-surface-tertiary dark:bg-surface-dark-tertiary rounded-xl">
                                 <span className="font-bold text-purple-600 block mb-1">BODY</span>
                                 <span className="text-sm text-gray-500">The list of transactions (Data).</span>
                             </div>
                         </div>

                         <Button variant="success" size="lg" onClick={() => navigate('/journey/4')} className="mt-4">
                             Continue to Step 4 →
                         </Button>
                     </div>

                     <div className="w-full md:w-64 shrink-0 bg-surface-primary dark:bg-surface-dark-secondary rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 p-6 flex flex-col gap-2 opacity-80 rotate-3 transform hover:rotate-0 transition-transform duration-500">
                         <div className="text-center font-bold text-gray-400 text-xs tracking-widest uppercase mb-2">Block Structure</div>
                         <div className="bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800 p-3 rounded-lg text-center">
                             <div className="text-xs font-bold text-brand-600 dark:text-brand-400">HEADER</div>
                             <div className="text-[10px] text-gray-500 mt-1 leading-tight">
                                 ver: 1<br/>prev: 000...<br/>root: a1b2...<br/>time: {timestamp}
                             </div>
                         </div>
                         <div className="h-4 w-0.5 bg-gray-300 dark:bg-gray-700 mx-auto"></div>
                         <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 p-3 rounded-lg text-center min-h-[60px] flex flex-col justify-center">
                             <div className="text-xs font-bold text-purple-600 dark:text-purple-400">BODY</div>
                             <div className="text-[10px] text-gray-500 mt-1">[Transactions...]</div>
                         </div>
                     </div>
                </div>
            </Card>
        </div>
      )}

    </div>
  );
};

export default Step3_Blocks;
