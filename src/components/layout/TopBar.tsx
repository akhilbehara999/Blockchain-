import React from 'react';
import { NavLink } from 'react-router-dom';
import { useThemeStore } from '../../stores/useThemeStore';
import { useProgress } from '../../context/ProgressContext';
import { Moon, Sun, Lock, Home, Map, Box, Flag, CheckCircle } from 'lucide-react';
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
          <span className="hidden md:inline mr-2">Journey</span>

          <div className="flex flex-col w-20">
            <div className="flex justify-between items-center text-[10px] leading-tight">
               <span className="text-indigo-600 dark:text-indigo-400 font-semibold">Step {currentStep}/8</span>
            </div>
            <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full mt-0.5 overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(currentStep / 8) * 100}%` }}
              />
            </div>
          </div>
        </NavLink>

        <NavLink
          to={sandboxUnlocked ? "/sandbox" : "#"}
          onClick={(e) => !sandboxUnlocked && e.preventDefault()}
          className={({ isActive }) => `
            flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors
            ${isActive ? 'bg-secondary-bg text-indigo-500' : 'text-text-secondary hover:text-text-primary hover:bg-secondary-bg/50'}
            ${!sandboxUnlocked ? 'opacity-60 cursor-not-allowed' : ''}
          `}
        >
          {sandboxUnlocked ? (
            <div className="w-4 h-4 md:mr-2 rounded-full bg-green-500 flex items-center justify-center">
               <CheckCircle className="w-3 h-3 text-white" />
            </div>
          ) : (
            <Lock className="w-4 h-4 md:mr-2 text-gray-400" />
          )}
          <span className="hidden md:inline">Sandbox</span>
        </NavLink>

        <NavLink
          to={challengesUnlocked ? "/challenges" : "#"}
          onClick={(e) => !challengesUnlocked && e.preventDefault()}
          className={({ isActive }) => `
            flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors
            ${isActive ? 'bg-secondary-bg text-indigo-500' : 'text-text-secondary hover:text-text-primary hover:bg-secondary-bg/50'}
            ${!challengesUnlocked ? 'opacity-60 cursor-not-allowed' : ''}
          `}
        >
          {challengesUnlocked ? (
            <div className="w-4 h-4 md:mr-2 rounded-full bg-green-500 flex items-center justify-center">
              <CheckCircle className="w-3 h-3 text-white" />
            </div>
          ) : (
            <Lock className="w-4 h-4 md:mr-2 text-gray-400" />
          )}
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
