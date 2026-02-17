import { useEffect } from 'react';
import { useThemeStore } from '../stores/useThemeStore';

export const useDarkMode = () => {
  const { theme, toggleTheme } = useThemeStore();

  useEffect(() => {
    // Initial check for system preference if no theme is set is handled by the store's hydration
    // but we can ensure the class is applied here as well for safety
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return {
    isDarkMode: theme === 'dark',
    toggle: toggleTheme,
    enable: () => useThemeStore.setState({ theme: 'dark' }),
    disable: () => useThemeStore.setState({ theme: 'light' }),
  };
};
