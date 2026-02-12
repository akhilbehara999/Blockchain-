import React, { createContext, useContext, useEffect, useRef } from 'react';
import { BackgroundEngine } from '../engine/BackgroundEngine';

interface BackgroundContextType {
  engine: BackgroundEngine;
}

const BackgroundContext = createContext<BackgroundContextType | undefined>(undefined);

export const BackgroundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize once
  const engineRef = useRef<BackgroundEngine>(new BackgroundEngine());

  useEffect(() => {
    const engine = engineRef.current;
    engine.start();

    return () => {
      engine.stop();
    };
  }, []);

  return (
    <BackgroundContext.Provider value={{ engine: engineRef.current }}>
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
