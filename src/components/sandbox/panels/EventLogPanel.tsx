import React, { useEffect, useState, useRef } from 'react';
import { eventEngine, NetworkEvent } from '../../../engine/EventEngine';
import { Activity, Clock, HelpCircle, Network, TrendingUp, Zap, BarChart, Terminal, ChevronUp, ChevronDown, Trash2 } from 'lucide-react';

const EventLogPanel: React.FC = () => {
  const [events, setEvents] = useState<NetworkEvent[]>([]);
  const [isExpanded, setIsExpanded] = useState(false); // Default collapsed
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load initial events
    setEvents(eventEngine.getRecentEvents(50));

    // Subscribe
    const unsubscribe = eventEngine.onEvent((event) => {
      setEvents(prev => [event, ...prev].slice(0, 100)); // Keep newest first
      // Auto-scroll to start if horizontal? Newest is at left (start).
      if (scrollRef.current) {
          scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
      }
    });

    eventEngine.start();
    return () => unsubscribe();
  }, []);

  const handleClear = () => {
      setEvents([]);
      // Ideally clear engine history too but it's private.
      // We just clear local view.
  };

  // Icon mapping
  const getIcon = (iconStr: string | undefined) => {
      switch (iconStr) {
          case 'network': return <Network className="w-3 h-3 text-blue-400" />;
          case 'network-off': return <Network className="w-3 h-3 text-red-400" />;
          case 'clock': return <Clock className="w-3 h-3 text-orange-400" />;
          case 'help-circle': return <HelpCircle className="w-3 h-3 text-yellow-400" />;
          case 'trending-up': return <TrendingUp className="w-3 h-3 text-green-400" />;
          case 'bar-chart': return <BarChart className="w-3 h-3 text-purple-400" />;
          case 'zap': return <Zap className="w-3 h-3 text-yellow-500" />;
          default: return <Activity className="w-3 h-3 text-gray-400" />;
      }
  };

  return (
    <div className={`
        flex flex-col bg-gray-900 text-gray-300 font-mono text-xs transition-all duration-300 ease-in-out border-t border-gray-800
        ${isExpanded ? 'h-64' : 'h-10 md:h-12'}
    `}>
      {/* Header Bar */}
      <div
        className="flex items-center justify-between px-4 h-10 md:h-12 shrink-0 cursor-pointer hover:bg-gray-800 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-green-400">
                <Terminal className="w-4 h-4" />
                <span className="font-bold hidden sm:inline">SYSTEM LOG</span>
            </div>

            {/* Live Indicator */}
            <div className="flex items-center gap-1.5 bg-gray-800 px-2 py-0.5 rounded-full border border-gray-700">
                <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </div>
                <span className="text-[10px] text-gray-400">LIVE</span>
            </div>

            {/* Latest Event Preview (only when collapsed) */}
            {!isExpanded && events.length > 0 && (
                <div className="hidden md:flex items-center gap-2 ml-4 opacity-70 animate-in fade-in slide-in-from-left-2">
                     <span className="text-gray-500">[{new Date(events[0].timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' })}]</span>
                     {getIcon(events[0].icon)}
                     <span className="truncate max-w-[400px]">{events[0].message}</span>
                </div>
            )}
        </div>

        <div className="flex items-center gap-3">
             {isExpanded && (
                 <button
                    onClick={(e) => { e.stopPropagation(); handleClear(); }}
                    className="p-1 hover:text-red-400 transition-colors"
                    title="Clear Logs"
                 >
                     <Trash2 className="w-3 h-3" />
                 </button>
             )}
             {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </div>
      </div>

      {/* Content Area */}
      {isExpanded && (
        <div className="flex-1 overflow-x-auto overflow-y-hidden custom-scrollbar bg-black/20 p-2">
            <div className="flex flex-row gap-2 h-full items-start min-w-max" ref={scrollRef}>
                {events.length === 0 && (
                    <div className="text-gray-600 italic px-4 py-2">Waiting for network activity...</div>
                )}
                {events.map((event) => (
                    <div
                        key={event.id}
                        className="w-64 shrink-0 bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50 hover:border-gray-600 rounded p-2 flex flex-col gap-1 transition-colors animate-in zoom-in-95 duration-200"
                    >
                        <div className="flex justify-between items-start text-[10px] text-gray-500 mb-1">
                            <span>{new Date(event.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                            {event.impact && (
                                <span className="text-yellow-500 bg-yellow-900/20 px-1 rounded border border-yellow-900/30">{event.impact}</span>
                            )}
                        </div>
                        <div className="flex items-start gap-2">
                            <div className="mt-0.5">{getIcon(event.icon)}</div>
                            <span className="text-xs text-gray-300 leading-tight">{event.message}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      )}
    </div>
  );
};

export default EventLogPanel;
