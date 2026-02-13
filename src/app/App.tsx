import React, { useEffect } from 'react';
import Router from './Router';
import { useThemeStore } from '../stores/useThemeStore';
import { SessionRestoration } from '../components/SessionRestoration';
import { StateManager } from '../engine/StateManager';

const App: React.FC = () => {
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Auto-save state every 30 seconds
  useEffect(() => {
      const interval = setInterval(() => {
          StateManager.saveState();
      }, 30000);

      // Save on unmount/reload as well
      const handleBeforeUnload = () => {
          StateManager.saveState();
      };

      window.addEventListener('beforeunload', handleBeforeUnload);

      return () => {
          clearInterval(interval);
          window.removeEventListener('beforeunload', handleBeforeUnload);
      };
  }, []);

  return (
    <SessionRestoration>
        <Router />
    </SessionRestoration>
  );
};

export default App;
