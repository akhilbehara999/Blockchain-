import React from 'react';
import { useLocation } from 'react-router-dom';
import { useThemeStore } from '../../stores/useThemeStore';
import { useProgressStore } from '../../stores/useProgressStore';
import { Moon, Sun, Menu } from 'lucide-react';
import Button from '../ui/Button';
import { MODULE_LIST } from '../../utils/constants';

interface TopBarProps {
  onToggleSidebar?: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ onToggleSidebar }) => {
  const { theme, toggleTheme } = useThemeStore();
  const getProgress = useProgressStore((state) => state.getProgress);
  const location = useLocation();

  const currentModule = MODULE_LIST.find((m) => m.path === location.pathname);
  const progress = getProgress();

  return (
    <header className="fixed top-0 left-0 right-0 h-16 z-30 bg-primary-bg/80 backdrop-blur-md border-b border-border flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center space-x-4">
        {onToggleSidebar && (
          <button onClick={onToggleSidebar} className="md:hidden p-2 text-text-secondary hover:text-text-primary">
            <Menu className="w-6 h-6" />
          </button>
        )}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-500/20">
            B
          </div>
          <span className="hidden md:block text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
            BlockSim
          </span>
        </div>
      </div>

      <div className="absolute left-1/2 transform -translate-x-1/2 hidden md:block">
        <h2 className="text-sm font-medium text-text-secondary uppercase tracking-wider">
          {currentModule?.title || 'Dashboard'}
        </h2>
      </div>

      <div className="flex items-center space-x-4">
        <div className="hidden md:flex items-center space-x-2">
          <div className="h-2 w-24 bg-tertiary-bg rounded-full overflow-hidden">
            <div
              className="h-full bg-accent transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs font-medium text-text-secondary">{progress}%</span>
        </div>

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
      </div>
    </header>
  );
};

export default TopBar;
