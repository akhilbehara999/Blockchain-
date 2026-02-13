import React, { useEffect, useState } from 'react';
import { StateManager } from '../engine/StateManager';
import { backgroundEngine } from '../engine/BackgroundEngine';
import { Loader2, CheckCircle2, AlertCircle, Clock, Zap, FileText } from 'lucide-react';

interface SessionRestorationProps {
  children: React.ReactNode;
}

type RestorationStatus = 'checking' | 'restoring' | 'fast-forwarding' | 'summary' | 'completed' | 'new';

export const SessionRestoration: React.FC<SessionRestorationProps> = ({ children }) => {
  const [status, setStatus] = useState<RestorationStatus>('checking');
  const [summary, setSummary] = useState<{
    elapsedTime: number;
    blocksMined: number;
    eventCount: number;
  } | null>(null);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      // Small delay for initial check visual
      await new Promise(r => setTimeout(r, 500));

      const state = StateManager.loadState();

      if (state) {
        if (!mounted) return;
        setStatus('restoring');

        // Simulate restore time
        await new Promise(r => setTimeout(r, 800));

        StateManager.restoreState(state);

        const elapsed = StateManager.getTimeSinceLastActive();

        // If away for more than 60 seconds, fast forward
        if (elapsed > 60) {
            if (!mounted) return;
            setStatus('fast-forwarding');

            // Give UI time to update
            await new Promise(r => setTimeout(r, 500));

            const result = backgroundEngine.fastForward(elapsed);

            if (!mounted) return;
            setSummary({
                elapsedTime: elapsed,
                blocksMined: result.blocksMined,
                eventCount: state.events.length // Events loaded from storage
            });
            setStatus('summary');
        } else {
            if (!mounted) return;
            setStatus('completed');
        }
      } else {
        if (!mounted) return;
        setStatus('new');
        await new Promise(r => setTimeout(r, 2000));
        if (!mounted) return;
        setStatus('completed');
      }
    };

    init();

    return () => {
        mounted = false;
    };
  }, []);

  const formatTime = (seconds: number) => {
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = Math.floor(seconds % 60);
      if (h > 0) return `${h}h ${m}m`;
      if (m > 0) return `${m}m ${s}s`;
      return `${s}s`;
  };

  if (status === 'completed') {
    return <>{children}</>;
  }

  return (
    <div className="fixed inset-0 bg-gray-900 text-white flex flex-col items-center justify-center p-6 z-50">
      <div className="max-w-md w-full bg-gray-800 rounded-xl p-8 border border-gray-700 shadow-2xl transition-all duration-300">

        {status === 'checking' && (
           <div className="flex flex-col items-center animate-pulse">
             <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
             <h2 className="text-xl font-bold">Checking local node state...</h2>
           </div>
        )}

        {status === 'restoring' && (
           <div className="flex flex-col items-center">
             <Loader2 className="w-12 h-12 text-green-500 animate-spin mb-4" />
             <h2 className="text-xl font-bold">Restoring blockchain data...</h2>
             <p className="text-gray-400 mt-2 text-center">Verifying integrity of local blocks and wallet state.</p>
           </div>
        )}

        {status === 'new' && (
           <div className="flex flex-col items-center">
             <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-6 animate-bounce">
                <AlertCircle className="w-8 h-8 text-blue-400" />
             </div>
             <h2 className="text-xl font-bold mb-2">New Node Identity Created</h2>
             <p className="text-gray-400 text-center">Joining the network and synchronizing with peers...</p>
           </div>
        )}

        {status === 'fast-forwarding' && (
           <div className="flex flex-col items-center">
             <Loader2 className="w-12 h-12 text-purple-500 animate-spin mb-4" />
             <h2 className="text-xl font-bold">Synchronizing...</h2>
             <p className="text-gray-400 mt-2 text-center">Catching up with network blocks mined while you were away.</p>
           </div>
        )}

        {status === 'summary' && summary && (
           <div className="flex flex-col">
             <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-green-400" />
                </div>
             </div>

             <h2 className="text-2xl font-bold text-center mb-1">Welcome Back!</h2>
             <p className="text-gray-400 text-center mb-6">
                You were away for <span className="text-white font-medium">{formatTime(summary.elapsedTime)}</span>
             </p>

             <div className="space-y-3 bg-gray-900/50 rounded-lg p-4 border border-gray-700 mb-6">
                <div className="flex justify-between items-center">
                    <span className="text-gray-400 flex items-center gap-2"><Zap size={16}/> New Blocks Mined</span>
                    <span className="font-mono text-green-400 font-bold">+{summary.blocksMined}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-gray-400 flex items-center gap-2"><FileText size={16}/> Network Events</span>
                    <span className="font-mono text-blue-400 font-bold">{summary.eventCount}</span>
                </div>
             </div>

             <button
                onClick={() => setStatus('completed')}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-lg shadow-blue-500/20"
             >
                Resume Session
             </button>
           </div>
        )}

      </div>
    </div>
  );
};
