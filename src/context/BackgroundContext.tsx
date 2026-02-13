import React, { createContext, useContext, useEffect, useRef } from 'react';
import { BackgroundEngine } from '../engine/BackgroundEngine';
import { EventEngine } from '../engine/EventEngine';

interface BackgroundContextType {
  engine: BackgroundEngine;
  eventEngine: EventEngine;
}

const BackgroundContext = createContext<BackgroundContextType | undefined>(undefined);

export const BackgroundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize once
  const engineRef = useRef<BackgroundEngine>(new BackgroundEngine());
  // Initialize EventEngine with the BackgroundEngine instance
  const eventEngineRef = useRef<EventEngine>(new EventEngine(engineRef.current));

  useEffect(() => {
    const engine = engineRef.current;
    const eventEngine = eventEngineRef.current;

    engine.start();
    eventEngine.start();

    return () => {
      engine.stop();
      eventEngine.stop();
    };
  }, []);

  return (
    <BackgroundContext.Provider value={{
      engine: engineRef.current,
      eventEngine: eventEngineRef.current
    }}>
      {children}
    </BackgroundContext.Provider>
  );
};

export const useBackground = () => {
  const context = useContext(BackgroundContext);
  if (context === undefined) {
    throw new Error('useBackground must be used within a BackgroundProvider');
  }
  return context;
};

export const useEventEngine = () => {
    const context = useContext(BackgroundContext);
    if (context === undefined) {
      throw new Error('useEventEngine must be used within a BackgroundProvider');
    }
    return context.eventEngine;
};
