import React, { createContext, useContext, useEffect } from 'react';
import { BackgroundEngine, backgroundEngine } from '../engine/BackgroundEngine';
import { EventEngine, eventEngine } from '../engine/EventEngine';

interface BackgroundContextType {
  engine: BackgroundEngine;
  eventEngine: EventEngine;
}

const BackgroundContext = createContext<BackgroundContextType | undefined>(undefined);

export const BackgroundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    backgroundEngine.start();
    eventEngine.start();

    return () => {
      backgroundEngine.stop();
      eventEngine.stop();
    };
  }, []);

  return (
    <BackgroundContext.Provider value={{
      engine: backgroundEngine,
      eventEngine: eventEngine
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
