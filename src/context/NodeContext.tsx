import React, { createContext, useContext, useEffect, useState } from 'react';
import { NodeIdentity } from '../engine/NodeIdentity';

interface NodeContextType {
  identity: NodeIdentity | null;
  welcomeMessage: string | null;
  createIdentity: () => NodeIdentity;
}

const NodeContext = createContext<NodeContextType | undefined>(undefined);

export const useNodeIdentity = () => {
  const context = useContext(NodeContext);
  if (!context) {
    throw new Error('useNodeIdentity must be used within a NodeProvider');
  }
  return context;
};

export const NodeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Use state initializer to check for existing identity
  const [identity, setIdentity] = useState<NodeIdentity | null>(() => {
    const stored = localStorage.getItem('yupp_node_identity');
    if (stored) {
      return NodeIdentity.getOrCreate();
    }
    return null;
  });

  const [welcomeMessage, setWelcomeMessage] = useState<string | null>(null);

  const createIdentity = () => {
      const newIdentity = NodeIdentity.getOrCreate();
      setIdentity(newIdentity);
      return newIdentity;
  };

  useEffect(() => {
    if (!identity) return;

    // Logic to set welcome message
    // Check if identity was created very recently (within last 2 seconds) to handle React Strict Mode double-invocation
    const isRecent = (new Date().getTime() - identity.getFirstSeen().getTime()) < 2000;

    if (identity.isNew || isRecent) {
      setWelcomeMessage(`Welcome, ${identity.getId()}`);
    } else {
      setWelcomeMessage(`Welcome back, ${identity.getId()}`);
    }

    // Clear message after 5 seconds
    const timer = setTimeout(() => {
      setWelcomeMessage(null);
    }, 5000);

    return () => clearTimeout(timer);
  }, [identity]);

  return (
    <NodeContext.Provider value={{ identity, welcomeMessage, createIdentity }}>
      {children}
      {welcomeMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-4 right-4 z-50 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md px-6 py-3 rounded-lg shadow-lg border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-medium animate-in fade-in slide-in-from-top-4 duration-300"
        >
          {welcomeMessage}
        </div>
      )}
    </NodeContext.Provider>
  );
};
