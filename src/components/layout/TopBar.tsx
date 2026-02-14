import React from 'react';
import { NavLink } from 'react-router-dom';
import { useThemeStore } from '../../stores/useThemeStore';
import { useProgress } from '../../context/ProgressContext';
import { Moon, Sun, Lock, Home, Map, Box, Flag } from 'lucide-react';
import Button from '../ui/Button';

const TopBar: React.FC = () => {
  const { theme, toggleTheme } = useThemeStore();
  const { currentStep, sandboxUnlocked, challengesUnlocked } = useProgress();

  return (
    <header className="fixed top-0 left-0 right-0 h-16 z-30 bg-primary-bg/80 backdrop-blur-md border-b border-border flex items-center justify-between px-4 md:px-6">

      {/* Brand */}
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-500/20">
          B
        </div>
        <span className="hidden md:block text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
          BlockSim
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex items-center space-x-1 md:space-x-4">

        <NavLink
          to="/"
          className={({ isActive }) => `
            flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors
            ${isActive ? 'bg-secondary-bg text-indigo-500' : 'text-text-secondary hover:text-text-primary hover:bg-secondary-bg/50'}
          `}
        >
          <Home className="w-4 h-4 md:mr-2" />
          <span className="hidden md:inline">Home</span>
        </NavLink>

        <NavLink
          to={`/journey`}
          className={({ isActive }) => `
            flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors
            ${isActive ? 'bg-secondary-bg text-indigo-500' : 'text-text-secondary hover:text-text-primary hover:bg-secondary-bg/50'}
          `}
        >
          <Map className="w-4 h-4 md:mr-2" />
          <span className="hidden md:inline">Journey</span>
          <span className="ml-2 text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded">
            Step {currentStep}/8
          </span>
        </NavLink>

        <NavLink
          to={sandboxUnlocked ? "/sandbox" : "#"}
          onClick={(e) => !sandboxUnlocked && e.preventDefault()}
          className={({ isActive }) => `
            flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors
            ${isActive ? 'bg-secondary-bg text-indigo-500' : 'text-text-secondary hover:text-text-primary hover:bg-secondary-bg/50'}
            ${!sandboxUnlocked ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          {sandboxUnlocked ? <Box className="w-4 h-4 md:mr-2" /> : <Lock className="w-4 h-4 md:mr-2" />}
          <span className="hidden md:inline">Sandbox</span>
        </NavLink>

        <NavLink
          to={challengesUnlocked ? "/challenges" : "#"}
          onClick={(e) => !challengesUnlocked && e.preventDefault()}
          className={({ isActive }) => `
            flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors
            ${isActive ? 'bg-secondary-bg text-indigo-500' : 'text-text-secondary hover:text-text-primary hover:bg-secondary-bg/50'}
            ${!challengesUnlocked ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          {challengesUnlocked ? <Flag className="w-4 h-4 md:mr-2" /> : <Lock className="w-4 h-4 md:mr-2" />}
          <span className="hidden md:inline">Challenges</span>
        </NavLink>

      </nav>

      {/* Theme Toggle */}
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleTheme}
        className="p-2 rounded-full hover:bg-secondary-bg"
      >
        {theme === 'dark' ? (
          <Sun className="w-5 h-5 text-yellow-400" />
        ) : (
          <Moon className="w-5 h-5 text-indigo-400" />
        )}
      </Button>

    </header>
  );
};

export default TopBar;
