import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEventEngine } from '../../context/BackgroundContext';
import { NetworkEvent } from '../../engine/EventEngine';
import {
  Network,
  Radio,
  Clock,
  HelpCircle,
  TrendingUp,
  BarChart,
  Zap,
  Info
} from 'lucide-react';

const EventLog: React.FC = () => {
  const eventEngine = useEventEngine();
  const [events, setEvents] = useState<NetworkEvent[]>([]);
  const [isOpen, setIsOpen] = useState(true);
  // Force update to refresh "seconds ago"
  const [, setTick] = useState(0);

  useEffect(() => {
    // Initial load
    setEvents(eventEngine.getRecentEvents());

    // Subscribe
    const unsubscribe = eventEngine.onEvent((newEvent) => {
      setEvents((prev) => [newEvent, ...prev].slice(0, 20));
    });

    // Timer to update relative timestamps
    const timer = setInterval(() => setTick(t => t + 1), 5000);

    return () => {
        unsubscribe();
        clearInterval(timer);
    };
  }, [eventEngine]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'PEER_CONNECT': return <Network size={16} />;
      case 'PEER_DISCONNECT': return <Radio size={16} />;
      case 'DELAYED_BLOCK': return <Clock size={16} />;
      case 'ORPHAN_BLOCK': return <HelpCircle size={16} />;
      case 'MEMPOOL_SPIKE': return <TrendingUp size={16} />;
      case 'DIFFICULTY_ADJUSTMENT': return <BarChart size={16} />;
      case 'HASH_RATE_CHANGE': return <Zap size={16} />;
      default: return <Info size={16} />;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'PEER_CONNECT': return 'text-emerald-500 dark:text-emerald-400 border-emerald-500/20 bg-emerald-500/10';
      case 'PEER_DISCONNECT': return 'text-orange-500 dark:text-orange-400 border-orange-500/20 bg-orange-500/10';
      case 'DELAYED_BLOCK': return 'text-yellow-500 dark:text-yellow-400 border-yellow-500/20 bg-yellow-500/10';
      case 'ORPHAN_BLOCK': return 'text-red-500 dark:text-red-400 border-red-500/20 bg-red-500/10';
      case 'MEMPOOL_SPIKE': return 'text-blue-500 dark:text-blue-400 border-blue-500/20 bg-blue-500/10';
      case 'DIFFICULTY_ADJUSTMENT': return 'text-purple-500 dark:text-purple-400 border-purple-500/20 bg-purple-500/10';
      case 'HASH_RATE_CHANGE': return 'text-cyan-500 dark:text-cyan-400 border-cyan-500/20 bg-cyan-500/10';
      default: return 'text-gray-500 dark:text-gray-400 border-gray-500/20 bg-gray-500/10';
    }
  };

  const getRelativeTime = (timestamp: number) => {
      const diff = Math.floor((Date.now() - timestamp) / 1000);
      if (diff < 60) return `${diff}s ago`;
      return `${Math.floor(diff / 60)}m ago`;
  };

  return (
    <div className={`fixed bottom-4 right-4 z-50 flex flex-col items-end pointer-events-none`}>
       {/* Toggle Button */}
       <div className="pointer-events-auto mb-2">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400 p-2 rounded-full shadow-lg transition-colors"
                title="Toggle Network Events"
            >
                <Radio size={20} className={isOpen ? 'text-indigo-500' : ''} />
            </button>
       </div>

       {/* Event List */}
       <AnimatePresence>
        {isOpen && (
            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                className="w-80 md:w-96 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl overflow-hidden pointer-events-auto flex flex-col max-h-[500px]"
            >
                <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex justify-between items-center">
                    <span className="font-bold text-sm flex items-center gap-2 text-gray-900 dark:text-gray-100">
                        <Radio size={14} className="text-indigo-500" />
                        Network Events
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Live Feed</span>
                </div>

                <div className="overflow-y-auto p-2 space-y-2 flex-1 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent">
                    {events.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-400 space-y-2">
                            <Radio className="w-8 h-8 opacity-20" />
                            <span className="text-sm font-medium">Network is quiet... for now</span>
                        </div>
                    )}
                    <AnimatePresence initial={false}>
                        {events.map((event) => (
                            <motion.div
                                key={event.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, height: 0 }}
                                className={`relative p-3 rounded-lg border flex gap-3 items-start group ${getColor(event.type)}`}
                            >
                                <div className="mt-0.5 flex-shrink-0">
                                    {getIcon(event.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline mb-0.5">
                                        <span className="font-bold text-xs opacity-90">{event.type.replace(/_/g, ' ')}</span>
                                        <span className="text-[10px] opacity-60 whitespace-nowrap ml-2 font-mono">
                                            {getRelativeTime(event.timestamp)}
                                        </span>
                                    </div>
                                    <p className="text-xs opacity-80 leading-snug break-words">{event.message}</p>
                                    <p className="text-[10px] mt-1 opacity-60 font-mono">Effect: {event.impact}</p>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </motion.div>
        )}
       </AnimatePresence>
    </div>
  );
};

export default EventLog;
