import React, { createContext, useContext, useEffect, useState } from 'react';
import { BackgroundEngine, backgroundEngine } from '../engine/BackgroundEngine';
import { EventEngine, eventEngine } from '../engine/EventEngine';

interface BackgroundContextType {
  engine: BackgroundEngine;
  eventEngine: EventEngine;
  isRunning: boolean;
  toggleSimulation: () => void;
  resetSimulation: () => void;
  triggerMempoolSpike: (count: number) => void;
}

const BackgroundContext = createContext<BackgroundContextType | undefined>(undefined);

export const BackgroundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    backgroundEngine.start();
    eventEngine.start();
    setIsRunning(true);

    return () => {
      backgroundEngine.stop();
      eventEngine.stop();
    };
  }, []);

  const toggleSimulation = () => {
    const running = backgroundEngine.toggle();
    setIsRunning(running);
  };

  const resetSimulation = () => {
      // Implement reset logic if needed
  };

  const triggerMempoolSpike = (count: number) => {
      backgroundEngine.triggerMempoolSpike(count);
  };

  return (
    <BackgroundContext.Provider value={{
      engine: backgroundEngine,
      eventEngine: eventEngine,
      isRunning,
      toggleSimulation,
      resetSimulation,
      triggerMempoolSpike
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
