import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';

const NetworkConnect: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Simulate connection delay
    const timer = setTimeout(() => {
      setIsConnected(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`
      flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium transition-all duration-500
      ${isConnected ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}
    `}>
      {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3 animate-pulse" />}
      <span>{isConnected ? 'Connected to Peers' : 'Searching for Peers...'}</span>
    </div>
  );
};

export default NetworkConnect;
