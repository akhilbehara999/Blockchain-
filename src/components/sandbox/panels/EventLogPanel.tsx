import React, { useEffect, useState, useRef } from 'react';
import { eventEngine, NetworkEvent } from '../../../engine/EventEngine';
import { Activity, Clock, HelpCircle, Network, TrendingUp, Zap, AlertTriangle, BarChart, Server, Terminal } from 'lucide-react';

const EventLogPanel: React.FC = () => {
  const [events, setEvents] = useState<NetworkEvent[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load initial events
    setEvents(eventEngine.getRecentEvents(50));

    // Subscribe
    const unsubscribe = eventEngine.onEvent((event) => {
      setEvents(prev => [event, ...prev].slice(0, 100)); // Keep newest first for this view
    });

    // Ensure event engine is running
    eventEngine.start();

    return () => {
        unsubscribe();
        // Don't stop engine as other components might use it?
        // BackgroundEngine usually starts/stops it, but here we can ensure it's on.
    };
  }, []);

  // Icon mapping
  const getIcon = (iconStr: string | undefined) => {
      switch (iconStr) {
          case 'network': return <Network className="w-3 h-3 text-blue-500" />;
          case 'network-off': return <Network className="w-3 h-3 text-red-500" />;
          case 'clock': return <Clock className="w-3 h-3 text-orange-500" />;
          case 'help-circle': return <HelpCircle className="w-3 h-3 text-yellow-500" />;
          case 'trending-up': return <TrendingUp className="w-3 h-3 text-green-500" />;
          case 'bar-chart': return <BarChart className="w-3 h-3 text-purple-500" />;
          case 'zap': return <Zap className="w-3 h-3 text-yellow-600" />;
          default: return <Activity className="w-3 h-3 text-gray-500" />;
      }
  };

  return (
    <div className="h-full bg-black/90 text-green-400 font-mono text-xs rounded-lg shadow-inner border border-gray-800 flex flex-col overflow-hidden">
      <div className="px-3 py-1.5 bg-gray-900 border-b border-gray-800 flex justify-between items-center shrink-0">
        <h3 className="font-bold flex items-center gap-2">
          <Terminal className="w-3 h-3" /> System Log
        </h3>
        <div className="flex gap-2">
            <span className="text-[10px] text-gray-500">Live Stream</span>
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse self-center"></div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1 font-mono" ref={scrollRef}>
          {events.length === 0 && (
              <div className="text-gray-600 text-center py-4 italic">Waiting for network activity...</div>
          )}
          {events.map((event) => (
              <div key={event.id} className="flex gap-2 items-start hover:bg-white/5 p-1 rounded transition-colors animate-in fade-in slide-in-from-left-2 duration-300">
                  <div className="mt-0.5 opacity-70 shrink-0">
                      {new Date(event.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </div>
                  <div className="mt-0.5 shrink-0">
                      {getIcon(event.icon)}
                  </div>
                  <div className="flex-1 break-words">
                      <span className="text-gray-300">{event.message}</span>
                      {event.impact && (
                          <span className="ml-2 text-[10px] text-yellow-600/80 bg-yellow-900/10 px-1 rounded border border-yellow-900/20">
                              {event.impact}
                          </span>
                      )}
                  </div>
              </div>
          ))}
      </div>
    </div>
  );
};

export default EventLogPanel;
