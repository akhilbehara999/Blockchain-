import React, { useState, useEffect } from 'react';
import { ArrowRight, Terminal, Wifi } from 'lucide-react';
import Button from '../ui/Button';

interface NetworkConnectProps {
  onComplete: () => void;
}

const NetworkConnect: React.FC<NetworkConnectProps> = ({ onComplete }) => {
  const [logs, setLogs] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const timeoutIds: NodeJS.Timeout[] = [];

    const sequence = [
      { delay: 500, action: () => setLogs(p => [...p, "Connecting to network..."]) },
      { delay: 1500, action: () => setLogs(p => [...p, "Initializing node environment..."]) },
      { delay: 2500, action: () => {
          setLogs(p => [...p, "Environment ready ✅"]);
      }},
      { delay: 3500, action: () => setLogs(p => [...p, "Loading wallet module..."]) },
      { delay: 4500, action: () => {
           setLogs(p => [...p, "Wallet module ready ✅"]);
      }},
      { delay: 5500, action: () => {
          setLogs(p => [...p, "Ready to begin."]);
          setIsComplete(true);
      }}
    ];

    sequence.forEach(({ delay, action }) => {
        const id = setTimeout(action, delay);
        timeoutIds.push(id);
    });

    return () => {
      timeoutIds.forEach(clearTimeout);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md text-white font-mono p-6 animate-in fade-in duration-300">
      <div className="w-full max-w-2xl bg-gray-900 border border-gray-800 rounded-xl p-8 shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center space-x-3 mb-6 border-b border-gray-800 pb-4">
          <Terminal className="w-6 h-6 text-indigo-400" />
          <span className="text-xl font-bold tracking-wider">Network Initialization</span>
          <div className="flex-1" />
          <Wifi className="w-4 h-4 text-green-400 animate-pulse" />
        </div>

        {/* Logs */}
        <div className="space-y-4 mb-8 min-h-[240px]">
          {logs.map((log, index) => (
            <div key={index} className="flex items-center space-x-3 animate-in slide-in-from-left-2 duration-300">
              <span className="text-gray-500 text-sm">
                 {`>`}
              </span>
              <span className={log.includes('✅') ? 'text-green-400' : 'text-gray-300'}>
                {log}
              </span>
            </div>
          ))}
          {logs.length === 0 && (
             <span className="text-gray-500 animate-pulse">Initializing...</span>
          )}
        </div>

        {/* Action Button */}
        <div className={`transition-all duration-500 transform ${isComplete ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
          <Button
            onClick={onComplete}
            variant="primary"
            className="w-full text-lg py-4"
          >
            Start Step 1
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>

        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>
      </div>
    </div>
  );
};

export default NetworkConnect;
