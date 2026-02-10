import React, { useEffect } from 'react';
import Router from './Router';
import { useThemeStore } from '../stores/useThemeStore';

const App: React.FC = () => {
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return <Router />;
};

export default App;
